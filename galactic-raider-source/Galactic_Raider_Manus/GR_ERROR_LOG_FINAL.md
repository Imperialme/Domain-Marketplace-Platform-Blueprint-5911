# Galactic Raider — Known Error Log
## For Manus Development Team — Do Not Ship These Bugs

**Document purpose:** Every bug found during prototype testing is logged here with its root cause, fix status, and the rule to prevent it recurring in production React Native code.

---

## 🔴 CRITICAL — Price Engine

### ERR-001: Parabolic Price Compounding
**Symptom:** Company stock prices reach thousands or billions after 500+ turns. SLKT went from $348 to $6,600. Jupiter AutoMine went to $573 billion.
**Root cause:** Price engine used `newPrice = currentPrice × move × macroEffect` every turn. Even 0.5% average gain compounds to 142× over 500 turns.
**Fix applied:** EPS-anchored engine. Price now = `EPS × P/E ratio` where EPS is fixed at IPO. Price gravitates toward fair value with noise. Hard ceiling: 3× starting price for planet companies.
**Manus rule:** NEVER multiply price by price. Always anchor to `EPS × PE`. Store `ip` (initial price) and `eps` (fixed earnings per share) permanently. P/E bounds enforce the ceiling automatically.

### ERR-002: Jupiter P/E Unlimited
**Symptom:** Jupiter companies had no P/E ceiling. Robotic economy with beta 3.2 compounded fastest.
**Root cause:** Planet companies were not included in Governor P/E bound checks.
**Fix applied:** Same Governor bounds as Earth applied to all planets.
**Manus rule:** Governor must run on ALL companies in ALL dimensions every turn. No exceptions.

---

## 🟠 HIGH — Wallet & Transfer

### ERR-003: useState Inside JSX Map/IIFE
**Symptom:** Wallet transfer buttons did nothing. Forex amount picker did nothing.
**Root cause:** `const [wDir, setWDir] = useState(...)` was declared inside a `.map()` callback or IIFE inside JSX. This is illegal in React — hooks must be at top level of component.
**Fix applied:** All wallet state (`wDir`, `wPct`, `fxSel`, `fxSide`, `fxAmt`) moved to top level of App component.
**Manus rule:** Zero hooks inside .map(), .filter(), IIFE, or any conditional. ESLint rule `react-hooks/rules-of-hooks` must be enabled. CI fails if violated.

### ERR-004: Transfer Logged Multiple Times Per Turn
**Symptom:** Jupiter → Earth transfer appeared 6 times in one turn in the log.
**Root cause:** Transfer button was inside a component that re-rendered multiple times per auto-sim tick. The onClick fired multiple times.
**Fix applied:** Transfer now executes once per button click with confirmation modal. Log entry created exactly once inside the confirmed action.
**Manus rule:** All state mutations through S.current (game state ref) only. Never mutate inside render. Confirmation modal prevents double-fire.

### ERR-005: Transfer Fixed at $50K
**Symptom:** All cross-planet transfers were hardcoded to $50K regardless of wallet balance.
**Root cause:** Transfer amounts were hardcoded in the route array `["Earth","Mars",50000]`.
**Fix applied:** Replaced with percentage buttons (10/25/50/100%) calculated from live wallet balance.
**Manus rule:** Never hardcode amounts. All financial inputs must be percentage-based or user-entered, calculated from live state at time of action.

### ERR-006: 100% Transfer Blocked by Decimal
**Symptom:** If wallet had $50,000.17, 100% transfer would calculate $50,000 and leave $0.17 but block if source balance check was strict equals.
**Root cause:** `Math.floor` truncated the transfer, leaving a decimal remainder the player could not transfer.
**Fix noted, fix applied:** 100% always transfers `Math.floor(balance * 100) / 100`. Remainder stays in source. Player can make individual cent transfers manually.
**Manus rule:** 100% = maximum floor to 2 decimal places. Never block a transfer because of rounding remainder.

---

## 🟡 MEDIUM — UI/Navigation

### ERR-007: Planet Currency Tiles Not Navigating
**Symptom:** Tapping USD, MCR, VCR, JCR tiles in the header did nothing visible.
**Root cause:** `setSelPlanet` was called but `setTab("planet")` was not. Player stayed on current tab.
**Fix applied:** Currency tile onClick now calls both `setSelPlanet(pd.name)` and `setTab("planet")`.
**Manus rule:** Any navigation element that changes selected item must also navigate to the correct screen. Never update state without updating the visible screen.

### ERR-008: Buy/Sell Executes Instantly — No Confirmation
**Symptom:** Pressing Buy fired the purchase without any confirmation. Easy to accidentally sell positions.
**Root cause:** Buy button called trade function directly without modal.
**Fix applied:** All buy/sell actions open a confirmation modal showing quantity, price, total cost, CGT. Auto-sim pauses. Player must confirm.
**Manus rule:** All financial transactions require explicit confirmation. No auto-execution. Auto-sim must pause when modal is open.

### ERR-009: News Tab Empty on Some Screens
**Symptom:** News tab showed no entries after many turns.
**Root cause:** News events were pushed to `s.news` array but some screens were referencing a different variable or the array was being sliced to 0 incorrectly.
**Fix applied:** All news pushes use `s.newsLog.unshift()`. All screens reference `d.newsLog`.
**Manus rule:** Single news array per game state. Never use separate arrays for different screens. All events push to the same array with a `planet` tag for filtering.

---

## 🔵 LOW — Game Balance

### ERR-010: Wealth Progression Too Slow
**Symptom:** Difficult to cross $1.5M from $1M starting capital even after many turns.
**Root cause:** Governor correctly prevents unrealistic gains, but for an online mobile game the pace feels slow.
**Status:** Intentional design confirmed by Muhammad. May accelerate early game (turns 1–100) by 20–30%. Production decision pending.
**Manus rule:** Add a difficulty slider or early-game boost parameter. Do not hardcode progression speed.

### ERR-011: Loan System Allows Infinite Debt
**Symptom:** Player could take loan after loan, going from $100K to $50B.
**Root cause:** Loan tiers were not enforcing "repay before next tier" rule.
**Fix applied:** Active loan check before any new loan. `s.activeLoan` must be null. Five tiers only. Each tier only unlocks after previous fully repaid.
**Manus rule:** One loan at a time. Database constraint: unique active loan per player. Server-side validation, not just client-side.

### ERR-012: Auto-Sim Speed at 0.5s Feels Fast But Correct
**Symptom:** At 0.5s speed, markets move very fast and player cannot read prices.
**Status:** Expected behaviour. 0.5s is for testing/admin. Production game runs at 1 turn per minute server-side.
**Manus rule:** Production speed = 1 turn per minute, server-side clock. Client can view current state but cannot simulate future turns. Prototype speeds (.5s/1s/5s) are dev tools only.

---

## ✅ RESOLVED — Previously Open

| ID | Issue | Resolution |
|---|---|---|
| ERR-001 | Parabolic prices | EPS-anchored engine |
| ERR-002 | Jupiter no ceiling | Governor bounds on all planets |
| ERR-003 | useState in map | Moved to top level |
| ERR-004 | Multi-log per turn | Confirmation modal |
| ERR-005 | Fixed $50K transfer | Percentage buttons |
| ERR-006 | 100% blocked | Floor to 2dp |
| ERR-007 | Tiles no-navigate | setTab added |
| ERR-008 | Instant buy/sell | Confirmation modal |
| ERR-009 | Empty news | Single newsLog array |
| ERR-011 | Infinite loans | One-at-a-time enforcement |

---

## 📋 Open Items — Not Yet Fixed

| Priority | Item | Notes |
|---|---|---|
| HIGH | SIM 2 sort buttons only show 2 not 7 | `setSort` ref count wrong |
| HIGH | Net worth showing wallet only, not holdings | `sv` (stock value) not being summed |
| MEDIUM | 7-day streak not tracked against real calendar | Demo uses turn count |
| MEDIUM | GSF wallet missing from some screens | Add to all NW calculations |
| LOW | XLSX download only works on desktop | Spec-acknowledged limitation |
| LOW | Audio hooks not wired | Placeholder ready, Manus adds files |

---

## Rules Summary for Manus

1. **Never compound price × price** — always EPS × P/E
2. **Governor runs on ALL companies, ALL dimensions, EVERY turn**
3. **Zero hooks inside .map() or IIFE** — ESLint enforced
4. **One loan at a time** — server-side constraint
5. **All trades require confirmation modal** — no instant execution
6. **Transfer always percentage-based** — never hardcoded amounts
7. **Single news array** — filter by planet/type tag
8. **Auto-sim pauses on any modal** — clear state flag
9. **All wallets included in NW** — Cash + Savings + Trading + GSF + Holdings
10. **Production speed = server clock** — client reads only, never simulates ahead


---

## 🆕 NEW ERRORS — Session 2 (Muhammad Feedback Round 2)

### ERR-013: Real-World Brand Names in IPO Backers
**Symptom:** IPOs listed Sequoia, Softbank, Tiger Global, a16z, General Atlantic as backers.
**Root cause:** Using real VC firm names violates game universe immersion and may create legal/trademark issues.
**Fix required:** Replace ALL real-world company, VC, bank and firm names with fictional galactic equivalents.
**Fictional VC universe to use:**
- AstroVentures — Earth-based, technology focus
- RedDust Capital — Mars-based, mining and resources
- SolarCrest Fund — Venus/Mercury, energy focus
- Ryzolith Partners — Saturn-based, rare materials
- Quantum Horizon — Neptune, deep research
- Outer Ring Ventures — Uranus/Neptune, long-cycle investments
- Orbital Growth Fund — multi-planet, generalist
- CosmicSeed — early stage across all dimensions
**Manus rule:** Zero real company names anywhere in the game. Full audit before launch.

### ERR-014: All IPOs Launch Too Early — Player Cannot Participate
**Symptom:** All 4 IPOs opened at turns 5, 8, 15, 22. By the time player explores the file, all are already listed. Nothing to book.
**Root cause:** Opens values were too small. Also no mechanism to add new IPOs over time.
**Fix required:** IPOs should open at turns 50, 100, 200, 300+. New IPOs should enter pipeline every 50–100 turns. At any given time 2–4 IPOs should be bookable and 1–2 should be pending listing.
**Manus rule:** IPO pipeline is a live feed, not a fixed list. Server generates new IPOs periodically based on player net worth and game stage.

### ERR-015: ETF Sell Button Not Visible on Detail Screen
**Symptom:** Player can only sell ETF from Portfolio tab. ETF Detail page only shows Buy.
**Root cause:** Sell button was conditional on `e.units > 0` but the condition was only checked on Portfolio tab, not ETF Detail tab.
**Fix required:** ETF Detail page must show Buy/Sell buttons prominently when units are held. Show current position P&L clearly.

### ERR-016: CEO Decisions Not Visibly Updating Company State
**Symptom:** Player makes a CEO decision, stock price should move, but company card does not visually refresh.
**Root cause:** S.current is updated but the company detail screen reads from stale `selCo` state which is set at time of tap, not live.
**Fix required:** Company detail should always read from `d.cos.find(x=>x.t===selCo.t)` — the live array — not from `selCo` directly.
**Manus rule:** Never read financial data from cached/stale component state. Always derive from live game state.

### ERR-017: Board Access Tab Shows Static Demo — Not Player's Actual Ownership
**Symptom:** Board tab shows tier cards regardless of actual ownership percentage.
**Root cause:** Board tab was hardcoded as a demo, not connected to `co.ownership`.
**Fix required:** Board tab must read actual ownership from `s.sh[ticker]` and calculate percentage against total shares outstanding. Actions unlock only when real threshold is crossed.

### ERR-018: Planet Header Too Cluttered on Mobile (8 tiles in one row)
**Symptom:** 8 currency tiles compressed into one row at top of Planets screen. Hard to read and tap on mobile.
**Root cause:** All 8 planets shown as equal-width tiles. Too many for mobile width.
**Fix required:** Show Earth + 3 most-funded planets as primary tiles. Remaining planets accessible via horizontal scroll. Or use a dropdown planet selector.

### ERR-019: Wheel Segment Text Cut Off / Illegible
**Symptom:** Text inside wheel wedges (e.g. "50% Debt Relief") gets cut off or overflows the segment arc.
**Root cause:** Text in SVG arc segments is constrained by the wedge width. Long strings overflow.
**Fix required:** Show only the percentage number inside the wedge (e.g. "50%"). Place the full label ("Debt Relief" or "Bonus Pts") in a text legend below the wheel, keyed by color. This is cleaner and readable.

### ERR-020: Only Jupiter Has Planet-Specific Events (Storm)
**Symptom:** Contagion tab shows "Trigger Jupiter Storm (Test)" only. No events for other planets.
**Root cause:** Storm system was only built for Jupiter.
**Fix required:** Every planet needs at least one unique event type with its own risk/reward:
- Mars: Supply glut events (lithium oversupply crashes prices 20%)
- Venus: Acid cloud events (equipment corrosion, production −15%, 10-turn recovery)
- Jupiter: Storm events (existing — production −30%, MSC activates)
- Saturn: Ring destabilisation (ice export halted for 5 turns, Ryzolith premium +40%)
- Mercury: Solar flare events (maximum output turn, +50% production for 3 turns)
- Uranus: Season change (42-year cycle — massive price rebalancing every 500 turns)
- Neptune: Research breakthrough (random +50–200% price spike on one company)

### ERR-021: News Tab on Planets Has No "My News" Filter
**Symptom:** Planet news shows all events only. No way to filter to player's own trades and positions.
**Root cause:** My News filter was not implemented on the planets news tab.
**Fix required:** Same All Events / My Events tab pattern used in SIM 2 Markets must be applied to SIM 5 Planets news tab.

### ERR-022: Foundation System — Earth Only, No Planet Foundations
**Symptom:** Foundation can only be opened on Earth. Money saved on other planets is unprotected.
**Root cause:** Foundation was designed Earth-only in initial spec. Muhammad feedback: this is too limiting for a multi-planet game.
**Fix (proposed):** Foundation system becomes planet-specific. Each planet has its own Foundation variant:
- Earth Foundation: $10K fee, protects Earth Savings Wallet
- Mars Foundation: 50,000 MCR fee, protects Mars wallet  
- Jupiter Foundation: 200,000 JCR fee (higher risk planet, higher protection cost)
- Saturn Foundation: 100,000 STC, etc.
Money saved on a specific planet is only protected by that planet's Foundation. Cross-planet protection requires transfer + local Foundation.

### ERR-023: Auto-Buy Company List Will Become Unmanageable at Scale
**Symptom:** Auto-buy currently lists all tickers as grid buttons. At 30–50 companies this becomes unusable.
**Root cause:** No search, no filtering, no favourites system.
**Fix required:** 
1. Search bar to find company by ticker or name
2. Favourites system — star a company to pin it to top
3. Show max 10 companies by default (your holdings first)
4. "Add New" modal with search, not a full grid

### ERR-024: Loan Repayment Only Visible in Wallets Tab
**Symptom:** Repay buttons are shown in Wallets tab only. Player must navigate away from Loans tab to repay.
**Root cause:** Repay UI was built in the wallet card only.
**Fix required:** Repay buttons (25%/50%/All) must appear in BOTH Wallets tab AND Loans tab. Player should never have to leave the Loans section to manage their loan.

### ERR-025: Markets Sort Has Too Many Separate Buttons
**Symptom:** 7 separate sort buttons (By Rating, Div↓, Div↑, Price↓, Price↑, Gainers, Losers) makes the sort bar cluttered.
**Root cause:** Each sort state had its own button.
**Fix required:** 
- Dividend: single toggle button (▲▼ arrow icon, click toggles direction)
- Price: single toggle button (▲▼ arrow icon)
- Gainers / Losers: separate buttons (these are distinct enough)
- Analyst Rating: single button (default sort)
Total: 5 buttons instead of 7.

### ERR-026: Markets Company Detail Missing Analyst Section
**Symptom:** Company detail screen does not show individual analyst opinions even though data exists.
**Root cause:** Display bug — analyst data is in the COS array but the rendering code for the analyst section was not reached in the current tab layout.
**Fix required:** Analyst section must be visible on company detail. Show each analyst: firm name, rating badge, price target, and written view. Minimum 3 analysts per company.

### ERR-027: Wheel of Fortune Name — Trademark Risk
**Symptom:** "Wheel of Fortune" is a registered trademark (Sony Pictures Television).
**Recommended replacement:** "Wheel of Chance" — clean, universally understood, not trademarked in gaming context.
**Manus rule:** Legal review all game element names before launch. No trademarked names anywhere.

---

## Updated Rules Summary for Manus (v2)

1. **Never compound price × price** — always EPS × P/E
2. **Governor runs on ALL companies, ALL dimensions, EVERY turn**
3. **Zero hooks inside .map() or IIFE** — ESLint enforced
4. **One loan at a time** — server-side constraint
5. **All trades require confirmation modal** — no instant execution
6. **Transfer always percentage-based** — never hardcoded amounts
7. **Single news array** — filter by planet/type/mine tag
8. **Auto-sim pauses on any modal** — clear state flag
9. **All wallets included in NW** — Cash + Savings + Trading + GSF + Holdings
10. **Production speed = server clock** — client reads only
11. **Zero real-world brand names** — full fictional universe only
12. **IPO pipeline is live** — new IPOs enter every 50–100 turns
13. **Every planet has unique events** — not just Jupiter storms
14. **Company detail always reads live state** — never stale selCo
15. **Foundation is planet-specific** — each dimension has its own protection
