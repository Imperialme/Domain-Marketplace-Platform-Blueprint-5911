# GALACTIC RAIDER — AI AGENT INTEGRATION SPEC

**For: Manus Development Team**
**Version: 1.0**
**Date: April 27, 2026**

---

## EXECUTIVE SUMMARY

The Galactic Raider AI Agent is a contextual in-game help system that answers player questions about game mechanics in real-time, without leaving the game. It improves player retention, reduces confusion, and generates valuable gameplay data.

**Key Benefits:**
- Reduces friction — players get instant 2-3 line answers
- Learning system — logs all Q&A pairs to identify UI/design issues
- Self-improving — answers get better over time as more data is collected
- Low cost — ~$0.02 per question using Anthropic API
- Opt-in design — non-intrusive, players choose to use it

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 Component Stack

```
React Native App
    ↓
[Floating Chat Bubble] (bottom-right, always visible)
    ↓
[Agent Input Screen] (expands when tapped)
    ↓
[Question Submission] + [Screen Context Auto-detect]
    ↓
[Anthropic API Call] (Claude Opus 4.6)
    ↓
[Response Rendering] (max 3 lines, green box)
    ↓
[Like/Dislike Feedback] + [Log to DB]
    ↓
PostgreSQL Database (logging, analytics, search)
```

### 1.2 Data Flow

```
Player asks: "How do I withdraw from Savings?"
        ↓
Agent detects screen: "Wallets"
        ↓
Query + Screen + Player ID → Anthropic API
        ↓
API returns: "Go Home → Wallet Transfer → Savings→Trading/Cash. Select %, confirm. Note: $10K minimum stays if Foundation is open."
        ↓
Display response (3 lines, green box)
        ↓
Player taps 👍 or 👎
        ↓
Log to: agent_questions table (helpful = true/false)
        ↓
Update search index for future similar questions
```

---

## 2. FRONTEND IMPLEMENTATION

### 2.1 Floating Chat Bubble

**Location:** Bottom-right corner of every screen
**Size:** 60×60px closed, expands to 100% width on tap
**Icon:** 🤖 (robot emoji) or custom icon
**Behavior:**
- Always visible (z-index: high, above other UI)
- Tap to expand modal overlay
- Swipe down to minimize
- Can be toggled off in Settings (optional "Hide Agent" preference)

**Code snippet (React Native):**

```javascript
import { FloatingChatBubble } from '@/components/agent/FloatingChatBubble';

// In main game screen
<FloatingChatBubble 
  onPress={() => setAgentOpen(true)} 
  currentScreen={activeTab}
/>
```

### 2.2 Agent Modal Screen

**Layout:**
- Header: "Galactic Raider Agent" + close button
- Subheader: "You are on: [Markets]" (current screen, selectable)
- Query box: TextInput, multiline, placeholder text
- Send button: "Ask Agent" (disabled until text entered)
- Response area: Green box, white text, 3-line max
- Recent history: Scrollable list of past Q&A

**Code structure (React Native):**

```javascript
export function AgentModal({ isOpen, currentScreen, onClose }) {
  const [screen, setScreen] = useState(currentScreen);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const askAgent = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANTHROPIC_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 300,
          system: buildSystemPrompt(screen),
          messages: [
            {
              role: 'user',
              content: `Screen: ${screen}\n\nQuestion: ${query}`,
            },
          ],
        }),
      });

      const data = await res.json();
      const answer = data.content[0].text;
      
      setResponse(answer);
      setHistory([...history, { q: query, a: answer, s: screen, t: Date.now() }]);
      
      // Log to backend
      await logQuestion({
        playerId: USER_ID,
        screen,
        question: query,
        answer,
        timestamp: Date.now(),
        helpful: null, // until user rates
      });

      setQuery('');
    } catch (e) {
      setResponse('⚠️ Agent error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return isOpen ? (
    <Modal visible={isOpen} onDismiss={onClose}>
      <View style={{ flex: 1, backgroundColor: '#0F172A', padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#F8FAFC' }}>
            🤖 Agent
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 18, color: '#F8FAFC' }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Screen selector */}
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginBottom: 8 }}>
          YOU ARE ON:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {SCREENS.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => setScreen(s.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginRight: 6,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: screen === s.id ? '#16A34A' : 'rgba(255,255,255,.1)',
                backgroundColor: screen === s.id ? 'rgba(22,163,74,.15)' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: screen === s.id ? '#86EFAC' : 'rgba(255,255,255,.4)',
                }}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Query input */}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ask me anything..."
          placeholderTextColor="rgba(255,255,255,.3)"
          multiline
          style={{
            padding: 12,
            borderRadius: 11,
            borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,.15)',
            backgroundColor: 'rgba(255,255,255,.04)',
            color: '#F8FAFC',
            fontSize: 13,
            minHeight: 80,
            marginBottom: 12,
          }}
        />

        {/* Send button */}
        <TouchableOpacity
          onPress={askAgent}
          disabled={loading || !query.trim()}
          style={{
            backgroundColor: !query.trim() || loading ? 'rgba(255,255,255,.05)' : '#16A34A',
            padding: 13,
            borderRadius: 11,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: !query.trim() || loading ? 'rgba(255,255,255,.2)' : '#fff',
              fontWeight: '800',
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            {loading ? 'Thinking...' : 'Ask Agent'}
          </Text>
        </TouchableOpacity>

        {/* Response */}
        {response && (
          <View style={{ backgroundColor: 'rgba(22,163,74,.15)', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(22,163,74,.3)' }}>
            <Text style={{ fontSize: 12, color: '#86EFAC', fontWeight: '700', marginBottom: 8 }}>
              Agent Response
            </Text>
            <Text style={{ fontSize: 13, color: '#F8FAFC', lineHeight: 20 }}>
              {response}
            </Text>

            {/* Like/Dislike */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => rateResponse(true)}
                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,.1)', padding: 8, borderRadius: 8 }}
              >
                <Text style={{ textAlign: 'center', color: '#86EFAC', fontWeight: '700' }}>👍 Helpful</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => rateResponse(false)}
                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,.1)', padding: 8, borderRadius: 8 }}
              >
                <Text style={{ textAlign: 'center', color: '#F8FAFC', fontWeight: '700' }}>👎 Not helpful</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* History */}
        {history.length > 0 && (
          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,.4)', marginBottom: 10 }}>
              RECENT QUESTIONS
            </Text>
            <ScrollView style={{ maxHeight: 200 }}>
              {history.slice().reverse().map((h, i) => (
                <View key={i} style={{ backgroundColor: 'rgba(255,255,255,.04)', borderRadius: 11, padding: 12, marginBottom: 8 }}>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 4 }}>
                    📍 {h.s}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#F8FAFC', marginBottom: 6 }}>
                    Q: {h.q.substring(0, 60)}...
                  </Text>
                  <Text style={{ fontSize: 11, color: '#86EFAC', lineHeight: 16 }}>
                    → {h.a.substring(0, 100)}...
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  ) : null;
}
```

### 2.3 System Prompt Builder

**Function:** Constructs the AI agent's system prompt based on context

```javascript
function buildSystemPrompt(currentScreen) {
  const screenContext = {
    home: 'Player is on the Home dashboard. They can see wallets, net worth, tax era, and wallet transfers.',
    mkt: 'Player is on Markets. They can browse 10 companies, sort by analyst rating/dividend/price, and buy stocks.',
    co: 'Player is viewing a Company Detail page. They can see analyst opinions, founder story, share structure, and buy/sell.',
    bonds: 'Player is on Bonds & Assets. They can buy bonds, commodities (Oil/Gold/Lithium), crypto (BTC/ETH), and forex.',
    etf: 'Player is on ETF/IPO. They can buy ETFs and book shares in upcoming IPOs.',
    funds: 'Player is on Planet Funds. They can deposit money into 8 sovereign funds (Earth, Mars, Jupiter, etc.) earning 12-28%/yr.',
    port: 'Player is viewing their Portfolio. They can see all holdings, P&L, and IPO bookings.',
    news: 'Player is on News Feed. They can toggle between Earth Feed (all news) and My Events (personal trades/dividends).',
  };

  return `You are an AI co-pilot for Galactic Raider, a financial simulation game. You have deep knowledge of the game from the wiki below.

${WIKI_CONTENT}

**Current Context**: ${screenContext[currentScreen] || 'Unknown screen'}

**Your Rules**:
1. Answer ONLY about Galactic Raider. If asked about real finance or other games, say: "I only know Galactic Raider. Ask me about the game!"
2. Maximum 3 lines (2-4 sentences total). Be concise.
3. Format: Direct answer (lines 1-2), then optional tip or "See wiki → [section]" (line 3)
4. Tone: Friendly, knowledgeable co-player. Not robotic or condescending.
5. Context-aware: Your answer should relate to what the player can do on the current screen.

**Example**:
Q: "How do I withdraw from Savings?"
A: "Go Home → Wallet Transfer section. Choose Savings→Trading or Savings→Cash. Select % and confirm. Note: $10K minimum must stay if Foundation is open."`;
}
```

---

## 3. BACKEND IMPLEMENTATION

### 3.1 Database Schema

```sql
-- Main questions log table
CREATE TABLE agent_questions (
  id BIGSERIAL PRIMARY KEY,
  player_id VARCHAR(255) NOT NULL,
  screen VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  helpful BOOLEAN, -- null until rated, true/false after rating
  metadata JSONB -- optional: player level, playtime, etc.
);

-- Index for full-text search
CREATE INDEX idx_question_fulltext ON agent_questions USING GIN(
  to_tsvector('english', question)
);

-- Index for filtering
CREATE INDEX idx_player_screen_ts ON agent_questions(
  player_id, screen, timestamp DESC
);

-- Analytics view
CREATE VIEW agent_analytics AS
SELECT
  screen,
  COUNT(*) as total_questions,
  COUNT(CASE WHEN helpful = true THEN 1 END) as helpful_count,
  ROUND(
    COUNT(CASE WHEN helpful = true THEN 1 END)::numeric / 
    NULLIF(COUNT(CASE WHEN helpful IS NOT NULL THEN 1 END), 0) * 100
  ) as helpful_pct,
  AVG(LENGTH(question)) as avg_question_length,
  AVG(LENGTH(answer)) as avg_answer_length
FROM agent_questions
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY screen
ORDER BY total_questions DESC;
```

### 3.2 API Endpoint — Log Question

**Endpoint:** `POST /api/agent/log`

**Request:**
```json
{
  "playerId": "player_12345",
  "screen": "markets",
  "question": "How do I buy SLKT stock?",
  "answer": "Go Markets → sort by analyst rating → tap SLKT → select quantity → Buy button. Deducted from Trading Wallet.",
  "timestamp": 1714252800000
}
```

**Response:**
```json
{
  "success": true,
  "logId": "log_67890",
  "indexed": true
}
```

**Implementation (Node.js/Express):**

```javascript
app.post('/api/agent/log', async (req, res) => {
  const { playerId, screen, question, answer, timestamp } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO agent_questions 
       (player_id, screen, question, answer, timestamp) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [playerId, screen, question, answer, timestamp]
    );

    // Async: update full-text search index (don't wait for this)
    updateSearchIndex(result.rows[0].id, question);

    res.json({ success: true, logId: result.rows[0].id, indexed: true });
  } catch (e) {
    console.error('Log error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});
```

### 3.3 API Endpoint — Rate Response

**Endpoint:** `POST /api/agent/rate`

**Request:**
```json
{
  "logId": "log_67890",
  "helpful": true
}
```

**Implementation:**

```javascript
app.post('/api/agent/rate', async (req, res) => {
  const { logId, helpful } = req.body;

  try {
    await db.query(
      `UPDATE agent_questions SET helpful = $1 WHERE id = $2`,
      [helpful, logId]
    );

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
```

### 3.4 API Endpoint — Get Similar Questions

**Endpoint:** `GET /api/agent/similar?question=How+do+I+withdraw`

**Implementation (using PostgreSQL full-text search):**

```javascript
app.get('/api/agent/similar', async (req, res) => {
  const { question } = req.query;

  try {
    const result = await db.query(
      `SELECT question, answer, helpful, 
              ts_rank(to_tsvector('english', question), 
                      plainto_tsquery('english', $1)) as rank
       FROM agent_questions
       WHERE to_tsvector('english', question) @@ 
             plainto_tsquery('english', $1)
       ORDER BY rank DESC
       LIMIT 3`,
      [question]
    );

    res.json({ success: true, similar: result.rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
```

---

## 4. ANTHROPIC API INTEGRATION

### 4.1 API Key Management

**Setup:**
1. Create Anthropic account at console.anthropic.com
2. Generate API key (keep secret)
3. Store in `.env` file:
```
ANTHROPIC_API_KEY=sk-ant-...
```
4. Load in code:
```javascript
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
```

### 4.2 Request Format

**Model:** `claude-opus-4-6` (most capable, worth the cost)
**Max tokens:** 300 (enough for 3-line response)
**Temperature:** 0.7 (slight randomness for natural feel, not robotic)

```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANTHROPIC_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'claude-opus-4-6',
    max_tokens: 300,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Screen: ${screen}\n\nQuestion: ${query}`,
      },
    ],
  }),
});
```

### 4.3 Cost Estimation

**Pricing (as of April 2026):**
- Input: $3/M tokens
- Output: $15/M tokens

**Per question:**
- Input: ~500 tokens (system prompt + wiki + question)
- Output: ~100 tokens (3-line answer)
- Cost: (500 * 3 + 100 * 15) / 1M = $0.0021 per question

**Monthly estimates:**
- 10,000 questions/month = $21
- 100,000 questions/month = $210
- 1,000,000 questions/month = $2,100

**Cost optimization:**
1. **Cache system prompts** — Use Anthropic's prompt caching to reduce input tokens by 90% after first call
2. **Batch similar questions** — Store past answers, serve FAQ matches instantly (cost: $0)
3. **Use cheaper model for follow-ups** — First question uses Opus, follow-ups use Sonnet (25% cost savings)

---

## 5. ANALYTICS & LEARNING

### 5.1 Dashboard Metrics

**Weekly Report:**
```sql
SELECT 
  DATE_TRUNC('day', TO_TIMESTAMP(timestamp/1000)) as date,
  COUNT(*) as questions_asked,
  ROUND(AVG(CASE WHEN helpful = true THEN 1 ELSE 0 END) * 100) as helpfulness_pct,
  COUNT(DISTINCT player_id) as unique_players
FROM agent_questions
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', TO_TIMESTAMP(timestamp/1000))
ORDER BY date DESC;
```

**Top questions by screen:**
```sql
SELECT 
  screen,
  question,
  COUNT(*) as frequency,
  ROUND(AVG(CASE WHEN helpful = true THEN 1 ELSE 0 END) * 100) as helpful_pct
FROM agent_questions
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY screen, question
ORDER BY frequency DESC
LIMIT 20;
```

### 5.2 FAQ Auto-Generation

**After 5,000 logged questions:**

1. Extract top 30 unique questions
2. Create in-game FAQ section with pre-computed answers
3. Route known questions to FAQ (instant, $0 cost)
4. Route novel questions to agent API

**Pseudo-code:**
```javascript
async function askAgent(question, screen) {
  // Check if question matches FAQ
  const faqMatch = findSimilarFAQ(question);
  if (faqMatch && faqMatch.similarity > 0.85) {
    return faqMatch.answer; // Instant, cached
  }

  // Otherwise, hit API
  const response = await callAnthropicAPI(question, screen);
  return response.answer;
}
```

### 5.3 Continuous Improvement Loop

**Every 2 weeks:**
1. Run analytics (top 20 questions, helpfulness scores)
2. Identify confusing mechanics (low helpfulness = unclear UI)
3. Update system prompt with insights (e.g., "Many players ask about CGT timing — emphasize it in answers")
4. A/B test new FAQ entries
5. Document findings for product team

---

## 6. DEPLOYMENT CHECKLIST

### Phase 1 — MVP (Week 1)
- [ ] Implement floating chat bubble
- [ ] Build agent modal UI
- [ ] Integrate Anthropic API
- [ ] Create PostgreSQL logging table
- [ ] Deploy basic logging endpoint

### Phase 2 — Analytics (Week 2)
- [ ] Set up full-text search indexing
- [ ] Build analytics dashboard
- [ ] Implement like/dislike rating
- [ ] Create FAQ auto-generation script

### Phase 3 — Optimization (Week 3)
- [ ] Enable prompt caching
- [ ] Implement similar-question search
- [ ] Switch to cheaper models for non-critical answers
- [ ] Monitor cost vs. helpfulness trade-offs

### Phase 4 — Integration (Week 4)
- [ ] Connect agent to game progression tracking
- [ ] Personalize suggestions based on player level
- [ ] A/B test agent visibility (always visible vs. help-seeking only)
- [ ] Launch to players

---

## 7. TESTING CHECKLIST

**Before launch:**
- [ ] Test on slow network (3G) — API calls timeout gracefully
- [ ] Test with long questions (>500 chars) — doesn't overflow
- [ ] Test rapid-fire questions (5 in 10 seconds) — rate limiting works
- [ ] Test across all 8 screens — context is correct
- [ ] Test with players at different progression levels (turn 1 vs turn 1000)
- [ ] Verify logging works offline (queue for sync later)
- [ ] Check that API key is never exposed in client logs

---

## 8. TROUBLESHOOTING GUIDE

**Issue: API returns slow answers (5+ seconds)**
- Solution: Implement caching, reduce system prompt size, use Sonnet instead of Opus for follow-ups

**Issue: Players report unhelpful answers**
- Solution: Check analytics for low helpfulness_pct on specific screens, update FAQ, refine system prompt

**Issue: Database grows too large (>10GB)**
- Solution: Archive old logs (>90 days) to cold storage, implement retention policy

**Issue: Cost is higher than expected**
- Solution: Implement FAQ caching, batch similar questions, use cheaper models

---

## 9. FUTURE ENHANCEMENTS

**v2.0:**
- Personalized recommendations ("Based on your playstyle, try...")
- Voice input (speech-to-text questions)
- Multiplayer co-op — share agent conversations
- Pro tips based on player stats (e.g., "You're heavy on stocks, diversify into bonds")
- Integration with companion wiki (clickable references)

**v3.0:**
- Fine-tuned model trained on 100K+ Galactic Raider Q&A pairs
- Real-time game state integration ("I see you have $500K in Trading Wallet, here are fund recommendations")
- Predictive help ("You're about to go bankrupt, here's how to recover")

---

## 10. SUCCESS METRICS

**Track these KPIs:**

| Metric | Target | Method |
|--------|--------|--------|
| Agent usage rate | 40%+ of players use it weekly | Analytics dashboard |
| Helpfulness score | 75%+ questions rated helpful | Like/dislike tracking |
| Retention impact | +15% 7-day retention in agent users vs non-users | Cohort analysis |
| Time-to-answer | <3 seconds avg | Logging timestamps |
| Cost per question | <$0.003 | API billing + log count |
| FAQ hit rate | 50%+ questions answered from FAQ (after v2) | Query matching logs |

---

## 11. QUESTIONS FOR MANUS TEAM

**Before implementation, clarify:**

1. **API key security** — Where will ANTHROPIC_API_KEY live? (Manus backend, Firebase, Edge function?)
2. **Offline mode** — If player is offline, should agent queue questions or show cached FAQ only?
3. **Localization** — Need agent in multiple languages or English-only for MVP?
4. **Privacy** — Should player questions be anonymized before logging? (GDPR compliance)
5. **Mobile vs Desktop** — Floating bubble on mobile yes, but on web/desktop?
6. **Rate limiting** — Max questions per player per session to prevent spam?

---

## CONTACT & SUPPORT

**Agent architecture:** Claude (Anthropic)
**Game design:** Muhammad (Game Creator)
**Implementation:** Manus Development Team

For questions on the agent behavior or game mechanics knowledge, refer to the full Galactic Raider Wiki.

---

**End of Specification Document**
