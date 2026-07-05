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

