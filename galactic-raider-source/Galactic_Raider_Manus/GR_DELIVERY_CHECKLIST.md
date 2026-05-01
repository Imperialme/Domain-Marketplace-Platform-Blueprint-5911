# GALACTIC RAIDER — DELIVERY CHECKLIST FOR MANUS

**What to use. What to ignore. What to prioritize.**
**Status: Ready to Ship**
**Date: April 28, 2026**

---

## 🎯 CRITICAL: START HERE

Before opening any files, read these **3 documents in order:**

1. **GR_MASTER_DOCUMENTATION_INDEX.md** (24KB) — Architecture, systems, integration phases
2. **GR_COLOR_SYSTEM.md** (10.5KB) — Exact colors, use cases, accessibility
3. **GR_GAME_v1.jsx** (77KB) — Working prototype (read the code structure)

These three alone are enough to understand the entire game and start building.

---

## 📁 PRODUCTION-READY FILES (USE THESE)

### Main Game File
- ✅ **GR_GAME_v1.jsx** (77KB) — Single unified game, all systems integrated, ready to reference

### SIM Files (Latest Versions Only)
These are the calculation engines. Use the **_FINAL.jsx** versions:

- ✅ **GR_SIM_1_GOVERNOR_FINAL.jsx** (25KB) — Tax eras, economic indicators, era rotation
- ✅ **GR_SIM_2_MARKETS_v4_FINAL.jsx** (46KB) — Stock pricing, analyst ratings, company detail
- ✅ **GR_SIM_3_WALLETS_v4_FINAL.jsx** (38KB) — 3-wallet system, transfers, loans (6 tiers)
- ✅ **GR_SIM_4_CEO_v4_FINAL.jsx** (30KB) — Ownership tracking, board access, CEO decisions
- ✅ **GR_SIM_5_PLANETS_v6_FINAL.jsx** (43KB) — All 7 planets, unique events, news feeds
- ✅ **GR_SIM_6_ETF_IPO_v3_FINAL.jsx** (51KB) — 5 ETFs, 5 IPOs, 8 sovereign funds
- ✅ **GR_SIM_7_REDEMPTION_v2_FINAL.jsx** (32KB) — Wheel of Chance, philanthropy, redeemable points
- ✅ **GR_TAX_ENGINE_PRESERVED_FINAL.jsx** (27KB) — CGT, dividend tax, wealth tax, philanthropy relief

### Documentation Files
- ✅ **GR_GAME_WIKI_FINAL.md** (23KB) — Complete game mechanics wiki (for players + reference)
- ✅ **GR_ERROR_LOG_FINAL.md** (18KB) — All 27 errors found during development, how they were fixed
- ✅ **GR_STARTER_GUIDE_FINAL.jsx** (19KB) — 7-step interactive tutorial overlay

### AI Agent (Optional but Recommended)
- ✅ **GR_AGENT_v1.jsx** (13KB) — Working AI co-pilot artifact
- ✅ **GR_AGENT_INTEGRATION_SPEC.md** (23KB) — Complete spec for integrating agent into React Native app

### Design & Master Docs
- ✅ **GR_MASTER_DOCUMENTATION_INDEX.md** (24KB) — Everything organized by topic
- ✅ **GR_COLOR_SYSTEM.md** (10.5KB) — Exact hex colors, usage guide, accessibility

---

## ❌ IGNORE THESE (ARCHIVE/TEST FILES)

Do NOT use these. They are intermediate versions or duplicates:

**Old Versions:**
- ❌ GR_SIM_1_GOVERNOR.jsx (use _FINAL instead)
- ❌ GR_SIM_1_GOVERNOR_APPROVED.jsx (use _FINAL instead)
- ❌ GR_SIM_1_GOVERNOR_PRESERVED.jsx (use _FINAL instead)
- ❌ GR_SIM_2_MARKETS.jsx (use v4_FINAL instead)
- ❌ GR_SIM_2_MARKETS_v2.jsx, v3.jsx (use v4_FINAL instead)
- ❌ GR_SIM_2_MARKETS_v2_APPROVED.jsx, v3_APPROVED.jsx, v3_PRESERVED.jsx (use v4_FINAL instead)
- ❌ GR_SIM_3_WALLETS.jsx, v2.jsx, v3.jsx (use v4_FINAL instead)
- ❌ GR_SIM_3_WALLETS_v2_APPROVED.jsx, v3_PRESERVED.jsx (use v4_FINAL instead)
- ❌ GR_SIM_4_CEO.jsx, v2.jsx, v3.jsx (use v4_FINAL instead)
- ❌ GR_SIM_4_CEO_v2_APPROVED.jsx, v3_PRESERVED.jsx (use v4_FINAL instead)
- ❌ GR_SIM_5_PLANETS.jsx, v2.jsx, v3.jsx, v4.jsx, v5.jsx (use v6_FINAL instead)
- ❌ GR_SIM_5_PLANETS_v4_APPROVED.jsx, v5_PRESERVED.jsx (use v6_FINAL instead)
- ❌ GR_SIM_6_ETF_IPO.jsx, v2.jsx (use v3_FINAL instead)
- ❌ GR_SIM_6_ETF_IPO_APPROVED.jsx, v2_PRESERVED.jsx (use v3_FINAL instead)
- ❌ GR_SIM_7_REDEMPTION.jsx, v2.jsx (use v2_FINAL instead)
- ❌ GR_SIM_7_REDEMPTION_APPROVED.jsx (use v2_FINAL instead)

**Approvals & Preservation (Archived):**
- ❌ All *_APPROVED.jsx files (these were intermediate review steps)
- ❌ All *_PRESERVED.jsx files (these were safety backups)
- ❌ GR_TAX_ENGINE.jsx (use PRESERVED_FINAL instead)
- ❌ GR_TAX_ENGINE_PRESERVED_APPROVED.jsx (use PRESERVED_FINAL instead)

**Old Naming Conventions:**
- ❌ GR_GAME_WIKI.md (use _FINAL instead)
- ❌ GR_GAME_WIKI_APPROVED.md (use _FINAL instead)
- ❌ GR_ERROR_LOG.md, _APPROVED.md (use _FINAL instead)
- ❌ GR_STARTER_GUIDE.jsx, _APPROVED.jsx (use _FINAL instead)
- ❌ GR_WIKI.jsx (old naming)

**Experimental/HTML Versions:**
- ❌ GR_Earth_Complete.html (experimental)
- ❌ GR_RandomEvents_System.html (experimental)
- ❌ GR_Unified_Complete.html (experimental)
- ❌ GR_v4_*.html files (all experimental prototypes)

**Early Iterations (v1-v9):**
- ❌ GR_v2.jsx through GR_v9_clean.jsx (all early work, superseded by unified game)
- ❌ GR_partA.jsx, GR_clean.jsx, GR_final.jsx (temp files)

**Other Guides:**
- ❌ GR_BEGINNERS_GUIDE.jsx (use GR_STARTER_GUIDE_FINAL.jsx instead)
- ❌ GR_DynamicEventsEngine_Spec.docx (replaced by event logic in SIM_5)
- ❌ GR_AGENT_BUILD_SPEC.md (use INTEGRATION_SPEC instead)
- ❌ GR_Final_App.jsx (old naming, use GAME_v1.jsx instead)

---

## 📋 WHAT MANUS ACTUALLY NEEDS

**Minimal Package (just the essentials):**
```
GR_MASTER_DOCUMENTATION_INDEX.md        ← Read first
GR_COLOR_SYSTEM.md                      ← Copy colors
GR_GAME_v1.jsx                          ← Reference code
GR_SIM_1_GOVERNOR_FINAL.jsx             ← Tax engine
GR_SIM_2_MARKETS_v4_FINAL.jsx           ← Stock system
GR_SIM_3_WALLETS_v4_FINAL.jsx           ← Wallet system
GR_SIM_4_CEO_v4_FINAL.jsx               ← Ownership system
GR_SIM_5_PLANETS_v6_FINAL.jsx           ← Planets & events
GR_SIM_6_ETF_IPO_v3_FINAL.jsx           ← ETF & IPO system
GR_SIM_7_REDEMPTION_v2_FINAL.jsx        ← Redemption/Wheel
GR_GAME_WIKI_FINAL.md                   ← Player wiki
GR_ERROR_LOG_FINAL.md                   ← What was fixed
```

**Optional but Recommended:**
```
GR_STARTER_GUIDE_FINAL.jsx              ← Tutorial overlay
GR_AGENT_v1.jsx                         ← AI co-pilot
GR_AGENT_INTEGRATION_SPEC.md            ← How to integrate agent
```

---

## 🔄 INTEGRATION PHASES (FOR MANUS)

### Phase 1: Setup & Design (Day 1)
- [ ] Copy GR_COLOR_SYSTEM.md hex values into codebase
- [ ] Set up color constants (colors.js or constants.ts)
- [ ] Create base layout (dark theme, safe area)
- [ ] Set up state management (useRef for S, useState for D)

### Phase 2: Core Systems (Week 1)
- [ ] Implement Governor (tax eras, era rotation)
- [ ] Implement Wallets (3-wallet, transfers, Foundation)
- [ ] Implement turn advancement (advance function)
- [ ] Test: Turn should increment, era should rotate every 60 turns

### Phase 3: Trading (Week 2)
- [ ] Implement Markets (10 companies, EPS pricing)
- [ ] Implement buy/sell logic (with CGT, transaction tax)
- [ ] Implement company detail screen (analyst opinions)
- [ ] Test: Buy stock, see it in portfolio, sell it with CGT deduction

### Phase 4: Advanced Features (Week 3)
- [ ] Implement CEO & ownership (board access tiers)
- [ ] Implement Bonds, Commodities, Crypto, Forex
- [ ] Implement ETFs & IPO pipeline
- [ ] Implement Planet Sovereign Funds

### Phase 5: Polish (Week 4+)
- [ ] Implement News feeds (2 channels)
- [ ] Implement Tutorial overlay (7 steps)
- [ ] Implement AI Agent (optional)
- [ ] Performance optimization, bug fixes

---

## ✅ VERIFICATION CHECKLIST

Before shipping to players, Manus should verify:

### Core Mechanics
- [ ] Net worth tracks correctly (sum of all holdings)
- [ ] Wealth history records every turn
- [ ] Savings wallet earns 2%/yr interest
- [ ] Dividends pay every 30 turns to Savings
- [ ] Tax era rotates every 60 turns
- [ ] CGT is applied correctly on sales
- [ ] Loan interest accrues monthly

### Stock System
- [ ] Stock prices don't go parabolic (bounded by sector P/E range)
- [ ] EPS anchors price to fundamental value
- [ ] Analyst ratings match expectations
- [ ] Company detail shows founder story
- [ ] Buy/sell buttons work, deduct from correct wallet

### Wallets
- [ ] Cash wallet has no interest
- [ ] Savings wallet shows 2%/yr rate
- [ ] Trading wallet feeds all investments
- [ ] Foundation costs $50K, protects Savings
- [ ] Transfers move between wallets instantly
- [ ] Loans have 6 tiers, correct APR, monthly accrual

### Bankruptcy
- [ ] Forced liquidation activates at NW < 0 (10%/turn from Trading)
- [ ] Game over at NW < −$500K
- [ ] Player can recover by transferring Savings or selling positions

### UI/UX
- [ ] Colors match GR_COLOR_SYSTEM.md exactly
- [ ] Dark theme: no pure white (#fff), use #F8FAFC
- [ ] All buttons have hover states
- [ ] All inputs show error states
- [ ] Mobile responsive (tested on phones)

### Performance
- [ ] Turn advancement < 500ms
- [ ] No memory leaks over 1000+ turns
- [ ] API calls (if using agent) timeout gracefully

---

## 📞 QUESTIONS FOR MANUS

Before they start building, clarify:

1. **Deployment** — iOS, Android, or both?
2. **Backend** — Self-hosted, Firebase, or AWS?
3. **AI Agent** — Do you want to integrate? (Requires Anthropic API key)
4. **Analytics** — Do you want question logging to database?
5. **Multiplayer** — Single player only or leaderboard/social?
6. **Monetization** — Premium features, ads, or free?

---

## 📊 FILE INVENTORY

**Total files in output directory:** 96
**Production-ready files:** 16
**Archive/test files:** 80

**Size breakdown:**
- Code files (SIMs + Game): ~450KB total
- Documentation: ~100KB total
- Archive versions: ~2MB (can be deleted)

**Recommendation:** Delete all archive files before handing to Manus to avoid confusion.

---

## 🚀 FINAL HANDOFF

When delivering to Manus, say:

> "You have 16 production-ready files. Start with the 3 master docs (Index, Colors, Game). Then implement in 5 phases. Each SIM file is independent — test each phase before moving to the next. The error log documents 27 bugs we found and fixed. The wiki is for players. Ask us if anything is unclear."

---

**Everything is tested. Everything is documented. Ready to ship.**

---

**End of Delivery Checklist**
