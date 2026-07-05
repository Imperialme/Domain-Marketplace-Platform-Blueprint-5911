# GALACTIC RAIDER — AI AGENT INTEGRATION SPECIFICATION

**Document Version**: 1.0  
**Date**: April 27, 2026  
**Status**: Ready for Development  
**Audience**: Manus Engineering Team (React Native)

---

## EXECUTIVE SUMMARY

Galactic Raider includes an **in-game AI co-pilot agent** that answers player questions contextually in 2–3 lines max. The agent uses the game wiki as its knowledge base and is powered by Anthropic's Claude API.

**Key metrics:**
- Response time: <2 seconds
- Knowledge base: 15-section wiki (embedded in code)
- Scope: Game mechanics only
- Integration: Floating chat bubble on every screen
- Cost: ~$0.02–0.05 per question (negligible at scale)

This document provides everything Manus needs to implement the agent, log interactions, and iterate on answers.

---

## PART 1: ARCHITECTURE OVERVIEW

### 1.1 Data Flow

```
Player Question
    ↓
[Screen Context Captured] (e.g., "home", "mkt", "funds")
    ↓
[Vector Search: Find Similar Past Questions] (optional — see Phase 2)
    ↓
[API Call: Anthropic Claude API]
    ├─ System Prompt: Agent persona + wiki + screen context
    ├─ User Message: Question
    ├─ Max tokens: 300 (ensures 2–3 line response)
    └─ Model: claude-opus-4-6
    ↓
[Response Generated] (max 3 lines)
    ↓
[Log Q&A to Database]
    ├─ Question
    ├─ Answer
    ├─ Screen
    ├─ Player ID
    ├─ Timestamp
    └─ Helpful flag (👍/👎)
    ↓
Display to Player
```

### 1.2 Component Placement

**Mobile (React Native):**
- Floating action button in bottom-right corner of every screen
- Tap → expands chat bubble
- Player types question, taps Send (or Ctrl+Enter)
- Response appears in green box
- Recent Q&A history visible below
- Collapse/dismiss button

**Web (for testing/admin):**
- Standalone agent interface (provided as `GR_AGENT_v1.jsx`)
- Screen dropdown selector
- Full Q&A history logging visible
- Direct feedback to engineers

---

## PART 2: IMPLEMENTATION GUIDE

### 2.1 Environment Setup

**Required:**
- Anthropic API key (get from console.anthropic.com)
- PostgreSQL 13+ for logging
- Node.js 18+ (for API calls)

**Add to `.env`:**
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
AGENT_DB_HOST=localhost
AGENT_DB_PORT=5432
AGENT_DB_NAME=galactic_raider_agent
AGENT_DB_USER=agent_user
AGENT_DB_PASSWORD=xxxxx
AGENT_LOG_ENABLED=true
AGENT_MODEL=claude-opus-4-6
AGENT_MAX_TOKENS=300
```

### 2.2 Database Schema

Create the logging table in PostgreSQL:

```sql
-- Main Q&A logging table
CREATE TABLE agent_questions (
  id BIGSERIAL PRIMARY KEY,
  player_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  screen_name VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  answer_tokens INT,
  latency_ms INT,
  helpful BOOLEAN,
  feedback_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast search
CREATE INDEX idx_agent_player ON agent_questions(player_id);
CREATE INDEX idx_agent_screen ON agent_questions(screen_name);
CREATE INDEX idx_agent_created ON agent_questions(created_at DESC);
CREATE INDEX idx_agent_helpful ON agent_questions(helpful);
CREATE INDEX idx_agent_question_fulltext ON agent_questions 
  USING GIN(to_tsvector('english', question));

-- Table for vector embeddings (Phase 2)
CREATE TABLE agent_question_embeddings (
  id BIGSERIAL PRIMARY KEY,
  agent_question_id BIGINT NOT NULL REFERENCES agent_questions(id),
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_embedding ON agent_question_embeddings 
  USING IVFFLAT (embedding vector_cosine_ops);

-- Track agent performance over time
CREATE TABLE agent_metrics (
  id BIGSERIAL PRIMARY KEY,
  date DATE,
  total_questions INT,
  avg_latency_ms INT,
  helpful_count INT,
  unhelpful_count INT,
  helpful_ratio FLOAT,
  top_question VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 API Integration (Node.js/TypeScript)

**File: `src/services/agentService.ts`**

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { Pool } from "pg";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const dbPool = new Pool({
  host: process.env.AGENT_DB_HOST,
  port: parseInt(process.env.AGENT_DB_PORT || "5432"),
  database: process.env.AGENT_DB_NAME,
  user: process.env.AGENT_DB_USER,
  password: process.env.AGENT_DB_PASSWORD,
});

const WIKI = `
# GALACTIC RAIDER WIKI

## THREE WALLETS SYSTEM
[... full wiki content from GR_AGENT_v1.jsx ...]
`;

const SCREEN_NAMES: Record<string, string> = {
  home: "Home Dashboard",
  mkt: "Markets (stock trading)",
  co: "Company Detail",
  bonds: "Bonds & Assets",
  etf: "ETF & IPO",
  funds: "Planet Sovereign Funds",
  port: "Portfolio",
  news: "News Feed",
};

interface AgentRequest {
  playerId: string;
  sessionId: string;
  screen: string;
  question: string;
}

interface AgentResponse {
  answer: string;
  latencyMs: number;
  tokensUsed: number;
  loggingId: string;
}

export async function askAgent(req: AgentRequest): Promise<AgentResponse> {
  const startTime = Date.now();
  const screenName = SCREEN_NAMES[req.screen] || req.screen;

  const systemPrompt = `You are an AI co-pilot for Galactic Raider, a financial simulation game. You have deep knowledge of the game mechanics.

GAME WIKI:
${WIKI}

INSTRUCTIONS:
- Answer ONLY about Galactic Raider game mechanics
- Player is currently on: ${screenName}
- Answer in MAXIMUM 3 lines (2-4 sentences total)
- Be direct, concise, helpful
- If they ask about real finance or other games: "I only know Galactic Raider. Ask me about the game!"
- Include one tip or wiki section reference only if needed
- Tone: Friendly co-player, not robotic`;

  try {
    const response = await client.messages.create({
      model: process.env.AGENT_MODEL || "claude-opus-4-6",
      max_tokens: parseInt(process.env.AGENT_MAX_TOKENS || "300"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Screen: ${screenName}\n\nQuestion: ${req.question}`,
        },
      ],
    });

    const answer =
      response.content[0].type === "text" ? response.content[0].text : "";
    const latencyMs = Date.now() - startTime;
    const tokensUsed = response.usage.output_tokens;

    // Log to database
    const loggingResult = await logAgentInteraction({
      playerId: req.playerId,
      sessionId: req.sessionId,
      screen: req.screen,
      question: req.question,
      answer,
      latencyMs,
      tokens: tokensUsed,
    });

    return {
      answer,
      latencyMs,
      tokensUsed,
      loggingId: loggingResult.id,
    };
  } catch (error) {
    console.error("Agent API error:", error);
    throw error;
  }
}

async function logAgentInteraction(data: {
  playerId: string;
  sessionId: string;
  screen: string;
  question: string;
  answer: string;
  latencyMs: number;
  tokens: number;
}) {
  const query = `
    INSERT INTO agent_questions 
    (player_id, session_id, screen_name, question, answer, answer_tokens, latency_ms)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;

  const result = await dbPool.query(query, [
    data.playerId,
    data.sessionId,
    data.screen,
    data.question,
    data.answer,
    data.tokens,
    data.latencyMs,
  ]);

  return result.rows[0];
}

export async function logHelpfulness(
  loggingId: string,
  helpful: boolean,
  feedback?: string
) {
  const query = `
    UPDATE agent_questions
    SET helpful = $1, feedback_text = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `;

  await dbPool.query(query, [helpful, feedback || null, loggingId]);
}

export async function getAgentMetrics(daysBack: number = 7) {
  const query = `
    SELECT
      DATE(created_at) as date,
      COUNT(*) as total_questions,
      AVG(latency_ms)::INT as avg_latency_ms,
      SUM(CASE WHEN helpful = true THEN 1 ELSE 0 END) as helpful_count,
      SUM(CASE WHEN helpful = false THEN 1 ELSE 0 END) as unhelpful_count,
      (SUM(CASE WHEN helpful = true THEN 1 ELSE 0 END)::FLOAT / 
       NULLIF(COUNT(*), 0))::FLOAT as helpful_ratio
    FROM agent_questions
    WHERE created_at >= CURRENT_DATE - INTERVAL '${daysBack} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;

  const result = await dbPool.query(query);
  return result.rows;
}
```

### 2.4 React Native UI Component

**File: `src/screens/Agent/AgentBubble.tsx`**

```typescript
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { askAgent, logHelpfulness } from "../../services/agentService";

interface AgentBubbleProps {
  screenName: string;
  playerId: string;
  sessionId: string;
}

export const AgentBubble: React.FC<AgentBubbleProps> = ({
  screenName,
  playerId,
  sessionId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    Array<{ q: string; a: string; id: string }>
  >([]);
  const [lastLoggingId, setLastLoggingId] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const result = await askAgent({
        playerId,
        sessionId,
        screen: screenName,
        question: query,
      });

      setResponse(result.answer);
      setLastLoggingId(result.loggingId);
      setHistory([
        ...history,
        { q: query, a: result.answer, id: result.loggingId },
      ]);
      setQuery("");
    } catch (error) {
      setResponse("⚠️ Agent error. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (helpful: boolean) => {
    if (lastLoggingId) {
      await logHelpfulness(lastLoggingId, helpful);
      setResponse(null);
    }
  };

  if (!isOpen) {
    return (
      <TouchableOpacity
        style={styles.bubble}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.bubbleText}>🤖</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setIsOpen(false)}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Galactic Raider Agent</Text>
          <TouchableOpacity onPress={() => setIsOpen(false)}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.history}>
          {history.map((h) => (
            <View key={h.id} style={styles.historyItem}>
              <Text style={styles.historyQ}>Q: {h.q}</Text>
              <Text style={styles.historyA}>→ {h.a}</Text>
            </View>
          ))}
        </ScrollView>

        {response && (
          <View style={styles.responseBox}>
            <Text style={styles.responseText}>{response}</Text>
            <View style={styles.feedbackRow}>
              <TouchableOpacity
                onPress={() => handleHelpful(true)}
                style={styles.feedbackBtn}
              >
                <Text>👍 Helpful</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleHelpful(false)}
                style={styles.feedbackBtn}
              >
                <Text>👎 Not helpful</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask about the game..."
            value={query}
            onChangeText={setQuery}
            placeholderTextColor="#999"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
            onPress={handleAsk}
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendBtnText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bubbleText: { fontSize: 28 },
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,.08)",
  },
  title: { fontSize: 16, fontWeight: "800", color: "#F8FAFC" },
  closeBtn: { fontSize: 20, color: "rgba(255,255,255,.6)" },
  history: { flex: 1, padding: 12 },
  historyItem: {
    backgroundColor: "rgba(255,255,255,.04)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  historyQ: { fontSize: 12, fontWeight: "600", color: "#F8FAFC" },
  historyA: { fontSize: 11, color: "#86EFAC", marginTop: 4 },
  responseBox: {
    backgroundColor: "rgba(22,163,74,.15)",
    borderColor: "rgba(22,163,74,.3)",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    margin: 12,
  },
  responseText: { color: "#F8FAFC", fontSize: 13, lineHeight: 18 },
  feedbackRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  feedbackBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,.1)",
    borderRadius: 6,
    alignItems: "center",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,.08)",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,.04)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.1)",
  },
  sendBtn: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "rgba(255,255,255,.1)" },
  sendBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
});
```

### 2.5 Integration into Game Screens

Wrap every game screen with the agent:

```typescript
// In GameScreen.tsx
import { AgentBubble } from "./Agent/AgentBubble";

export const GameScreen: React.FC<GameScreenProps> = ({
  screenName,
  playerId,
  sessionId,
}) => {
  return (
    <View style={{ flex: 1 }}>
      {/* Game content */}
      <GameContent screenName={screenName} />

      {/* Agent bubble */}
      <AgentBubble
        screenName={screenName}
        playerId={playerId}
        sessionId={sessionId}
      />
    </View>
  );
};
```

---

## PART 3: PHASE 2 — VECTOR SEARCH & OPTIMIZATION (Month 2+)

### 3.1 Embedding Similar Questions

Once you have 5,000+ logged questions, add vector search:

```typescript
// src/services/embeddingService.ts
import { Embedding } from "@anthropic-ai/sdk";

export async function embedQuestion(question: string): Promise<number[]> {
  // Use OpenAI embeddings API or similar
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: question,
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}

export async function findSimilarQuestions(
  question: string,
  limit: number = 3
) {
  const embedding = await embedQuestion(question);

  const query = `
    SELECT aq.*, (aqe.embedding <-> $1::vector) as distance
    FROM agent_questions aq
    JOIN agent_question_embeddings aqe ON aq.id = aqe.agent_question_id
    ORDER BY aqe.embedding <-> $1::vector
    LIMIT $2
  `;

  const result = await dbPool.query(query, [
    JSON.stringify(embedding),
    limit,
  ]);
  return result.rows;
}
```

Then update `askAgent()` to include similar questions in context:

```typescript
const similarQuestions = await findSimilarQuestions(req.question, 3);
const similarContext = similarQuestions
  .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
  .join("\n\n");

const systemPrompt = `
[... existing system prompt ...]

EXAMPLES OF PAST ANSWERS (for reference):
${similarContext}

Use these as reference for answer style and depth, but always generate a fresh answer for the current question.
`;
```

### 3.2 Analytics Dashboard

Build a weekly agent analytics view for the team:

```
Week of April 21, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Questions: 2,847
Avg Response Time: 1.2s
Helpful Rate: 87% (👍 2,476 / 👎 371)
Most Asked: "How do I withdraw from Savings?" (89 times)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Confusing Mechanics (by unhelpful rate):
1. Foundation fee explanation (43% unhelpful)
2. Planet fund vs ETF difference (38% unhelpful)
3. Tax era switching (29% unhelpful)

Action Items:
→ Add Foundation explanation to home screen tooltip
→ Create comparison guide in wiki
→ Improve tax era UI
```

---

## PART 4: TESTING & QA

### 4.1 Test Cases

```
Test 1: Screen Context
─────────────────────
Screen: Markets
Question: "How do I buy a stock?"
Expected: Answer mentions Markets tab, analyst ratings, buy button
Actual: [Test]

Test 2: Out of Scope
────────────────────
Screen: Home
Question: "Should I invest in Apple?"
Expected: "I only know Galactic Raider. Ask me about the game!"
Actual: [Test]

Test 3: Conciseness
──────────────────
Question: "Explain the entire game to me"
Expected: Max 3 lines, directs to wiki for full details
Actual: [Test]

Test 4: Database Logging
───────────────────────
After asking 5 questions, check agent_questions table has 5 rows
Verify latency_ms, tokens are recorded
Actual: [Test]

Test 5: Helpfulness Feedback
───────────────────────────
Ask question → receive answer → click 👍
Verify agent_questions.helpful = true in database
Actual: [Test]
```

### 4.2 Performance Targets

| Metric | Target | Acceptable | Alert |
| --- | --- | --- | --- |
| Response Time | <1.5s | <2s | >3s |
| Helpful Rate | >85% | >75% | <70% |
| API Error Rate | <0.5% | <1% | >2% |
| Token Usage | <150 | <200 | >250 |

---

## PART 5: DEPLOYMENT CHECKLIST

- [ ] PostgreSQL database created with schema
- [ ] API key configured in environment
- [ ] `agentService.ts` implemented and tested
- [ ] `AgentBubble.tsx` component integrated
- [ ] Agent runs on every game screen
- [ ] Database logging verified (check agent_questions table)
- [ ] Helpfulness buttons wired to `logHelpfulness()`
- [ ] Analytics dashboard deployed
- [ ] Performance monitoring enabled
- [ ] QA test cases passed
- [ ] Rollout to 10% of players (Phase 1)
- [ ] Monitor metrics for 1 week
- [ ] Full rollout if helpful rate >80%

---

## PART 6: SUCCESS METRICS

After 1 month of live agent:

| Goal | Metric | Success Threshold |
| --- | --- | --- |
| Player adoption | % of players using agent | >20% |
| Engagement | Avg questions per session | >0.5 |
| Quality | Helpful rate | >80% |
| Retention | Day 7 retention (agent users vs non) | +5% improvement |
| Efficiency | Reduction in "how do I" forum posts | >30% |
| Cost | Cost per question | <$0.05 |

---

## PART 7: MAINTENANCE & ITERATION

### Monthly Tasks

1. **Review analytics** — See what's confusing players
2. **Update wiki** — If 50+ people ask the same question, add clarity to wiki
3. **Improve system prompt** — Based on unhelpful feedback, refine instructions
4. **Monitor costs** — Track API spend, optimize token usage
5. **A/B test responses** — Try different answer styles on similar questions

### Quarterly Tasks

1. **Fine-tune model** — If budget allows, fine-tune a Claude variant on your best Q&A pairs
2. **Expand knowledge base** — Add new mechanics, clarifications, tips
3. **Vector embeddings** — When you hit 10K+ questions, switch to Phase 2
4. **UI improvements** — Based on feedback, redesign agent bubble/modal
5. **Community features** — Allow players to mark which answers were most helpful

---

## PART 8: CONTACT & SUPPORT

**For questions on this spec:**
- Technical: [Claude / Engineering Lead]
- Game Design: [Muhammad / Game Director]

**API Support:**
- Anthropic: https://support.anthropic.com
- Postgres: https://www.postgresql.org/support/

**Live Agent Artifact (for testing):**
- File: `GR_AGENT_v1.jsx`
- How to use: Copy into React component, plug in Anthropic API key
- No backend required — artifact handles API directly

---

## APPENDIX A: FULL WIKI FOR EMBEDDING

[Copy entire wiki from GR_AGENT_v1.jsx WIKI constant here]

---

## APPENDIX B: API COST ESTIMATION

**Assumptions:**
- 5,000 players
- 2 questions per player per week
- 150 tokens per question (average)

**Monthly Cost:**
- Input: 5,000 × 2 × 4 weeks × 50 tokens = 2M tokens @ $0.003 per 1M = **$6**
- Output: 5,000 × 2 × 4 weeks × 100 tokens = 4M tokens @ $0.015 per 1M = **$60**
- **Total: ~$66/month** (negligible)

If 10K players, 3 questions/week: ~$250/month (still very cheap).

---

**END OF SPECIFICATION**

