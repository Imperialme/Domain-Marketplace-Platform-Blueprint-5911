# GALACTIC RAIDER — MASTER DOCUMENTATION INDEX

**Complete game specification and implementation guide**
**For: Manus Development Team (React Native Build)**
**Compiled: April 28, 2026**

---

## QUICK START FOR MANUS

If you are building incrementally in React Native, start here:

1. **Read this document first** — understand the architecture
2. **Color palette** — Copy the exact colors used in the prototype
3. **Core systems** (in order):
   - Governor (tax eras, economic indicators)
   - Wallets (3-wallet system, transfers)
   - Markets (stocks, analyst ratings, pricing)
   - Trading (buy/sell logic, CGT, P&L)
   - CEO & Companies (ownership, board access)
   - Bonds & Assets (bonds, commodities, crypto, forex)
   - ETF & IPO (ETFs, sovereign funds, IPO bookings)
   - News & Logging (feed, alerts, player events)
   - AI Agent (optional but recommended)

---

## DESIGN SYSTEM

### Color Palette (Copy These Exactly)

```javascript
// Primary Colors
const GREEN = "#16A34A"      // Gains, positive, action buttons, success
const RED = "#DC2626"        // Losses, negative, warnings
const BLUE = "#1D4ED8"       // Info, links, secondary actions
const YELLOW = "#D97706"     // Highlights, important UI, gold accents
const PURPLE = "#7C3AED"     // Tertiary, crypto, ETFs

// Dark Theme Base
const DARK_BASE = "#0F172A"  // Deep navy, main background
const DARK_CARD = "#1E293B"  // Slightly lighter, card backgrounds
const DARK_HOVER = "#334155" // Hover states

// Text
const TEXT_PRIMARY = "#F8FAFC"    // White text on dark
const TEXT_SECONDARY = "rgba(255,255,255,.5)"  // Muted text
const TEXT_MUTED = "rgba(255,255,255,.3)"      // Very faint text

// Borders & Accents
const BORDER = "rgba(255,255,255,.08)"  // Subtle dividers
const ACCENT_LIGHT = "rgba(22,163,74,.15)"    // Green tinted background
const ACCENT_DARK = "rgba(220,38,38,.15)"     // Red tinted background
```

### Font Stack
```css
font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
/* Monospace for numbers: 'Courier New', monospace; */
```

### Component Sizing (Mobile-first)
- Card padding: 12-16px
- Button padding: 10-13px vertical, full width or flex
- Border radius: 8-14px (larger on full-width, smaller on buttons)
- Gap/spacing: 8px increments

### Dark Theme Philosophy
- No pure white background (#fff), always #0F172A or #1E293B
- All text on dark, all components glass-morphic with subtle borders
- Green for gains/success, Red for losses/danger, Blue for information
- Yellow used sparingly for highlights (title text, important numbers)
- 40%+ opacity on overlays, never more than 80%

---

## ARCHITECTURE OVERVIEW

### 1. CORE STATE MANAGEMENT

The game uses a single state object `S` (Server state reference) that persists across turns:

```javascript
const S = useRef({
  turn: 1,
  
  // Wallets (3-wallet system)
  cashWallet: 100000,
  savingsWallet: 100000,
  tradingWallet: 800000,
  foundationOpen: false,
  
  // Holdings
  sh: {},          // Stock holdings: { ticker: quantity }
  avgSh: {},       // Average buy cost per stock
  bh: {},          // Bond holdings
  ch: {},          // Commodity holdings
  crh: {},         // Crypto holdings
  eth: {},         // ETH holdings
  fxPositions: {}, // Forex positions
  etfs: [],        // ETF holdings array
  
  // Game mechanics
  turn: 1,
  eraIdx: 0,       // Tax era (0-7, cycles every 60 turns)
  cos: [],         // Companies array
  bonds: [],       // Bonds array
  comm: [],        // Commodities array
  cryp: [],        // Crypto array
  fx: [],          // Forex pairs
  etfs: [],        // ETFs
  ipos: [],        // IPO pipeline
  gsfDeposits: {}, // Planet fund deposits
  gsfEarned: {},   // Planet fund earnings
  
  // Loans & credit
  activeLoan: null,
  loanHistory: [],
  
  // Tracking
  taxPaid: 0,
  divReceived: 0,
  news: [],
  myNews: [],
  wh: [],          // Wealth history (array of NW values)
  
  // Bankruptcy
  liquidating: false,
  bankrupt: false,
});
```

### 2. TURN ADVANCEMENT LOGIC

Every turn (every 1-30 seconds depending on speed setting):

```
1. Turn counter increments
2. Stock prices updated (EPS-anchored)
3. Other assets price-adjusted (commodities, crypto, forex, bonds)
4. Savings interest accrues (+2%/yr = +0.00548% per turn)
5. Planet Sovereign Funds earn returns (12-28%/yr rates)
6. Dividends paid every 30 turns (to Savings wallet, minus dividend tax)
7. IPOs check for listings (staggered at turn 50, 120, 200, 300, 400)
8. Tax era rotation every 60 turns (8 eras cycle)
9. Loan interest accrues monthly (5-25% APR depending on tier)
10. Forced liquidation if net worth < 0 (Trading Wallet liquidates 10%/turn)
11. Bankruptcy check if net worth < -$500K
12. Wealth history logged
13. News events generated (tax era changes, IPO listings, contagion)
14. [Optional] AI Agent questions logged to database
```

---

## SYSTEM DOCUMENTATION

### A. GOVERNOR / TAX SYSTEM

**File:** `GR_SIM_1_GOVERNOR.jsx` (25KB)

**Concept:** A global economic engine that rotates through 8 tax eras every 60 turns, affecting:
- Capital Gains Tax (CGT): 5-30% depending on era
- Dividend Tax: 5-25% depending on era
- Transaction tax: 0.05-0.15% on trades

**8 Tax Eras:**
1. Normal — CGT 20%, Div 15%
2. High Tax — CGT 30%, Div 25%
3. Low Tax — CGT 10%, Div 5%
4. Capital Gains — CGT 5%, Div 15%
5. Dividend — CGT 20%, Div 5%
6. (3 more variants, stored in TAX_ERAS array)

**Economic Indicators:**
- GDP Growth: +0.5% to +3.5%/turn (impacts stock valuations)
- Inflation: 1-4%
- Interest Rates: 3-5%
- GSF Watcher: Sovereign Fund baseline rate (12-28%/yr)

**Key Rules:**
- Eras auto-rotate every 60 turns
- Players can see current era on Home screen
- News alerts when era changes
- Philanthropic donations reduce CGT/Div tax (tax relief multiplier)

**Implementation notes:**
- Tax calculations happen on `sell()`, `transferWallet()`, `withdraw()`
- Store `taxPaid` as cumulative tracker
- Show era countdown bar on home screen (60-turn progress)

---

### B. WALLETS & CAPITAL MANAGEMENT

**File:** `GR_SIM_3_WALLETS_v4.jsx` (38KB)

**Three Wallets (immutable design):**

1. **Cash Wallet ($100K)**
   - Daily spending, tax payments
   - No interest, no protection
   - First liquidated in bankruptcy
   - Cannot go below $0 in normal play

2. **Savings Wallet ($100K)**
   - Earns 2%/yr automatically (compounded daily)
   - Protected from liquidation if Foundation is open
   - Minimum $10K must remain if Foundation open
   - Quarterly dividend deposits
   - Good for long-term preservation

3. **Trading Wallet ($800K)**
   - All investments draw from here (stocks, bonds, crypto, forex)
   - No interest
   - First liquidated if net worth negative (10%/turn)
   - Used for loan repayment
   - Receives proceeds from stock sales, ETF sales, IPO listings

**Foundation Protection**
- Cost: $50,000 (one-time, from Cash Wallet)
- Effect: Shields Savings Wallet from forced liquidation
- Requirement: Must maintain minimum $10K in Savings
- Strategy: Open Foundation after you have >$100K in Savings and are investing heavily

**Wallet Transfers**
- 6 directions: Cash↔Trading, Cash↔Savings, Trading↔Savings
- Instant, no fee
- Available on Home screen, Wallet Transfer section
- Select %, confirm, execute

**Loan System (6 tiers)**
- Tier 1: $50K @ 5% APR
- Tier 2: $250K @ 10% APR
- Tier 3: $500K @ 16% APR (Mini Business Loan)
- Tier 4: $1M @ 18% APR
- Tier 5: $5M @ 22% APR
- Tier 6: $25M @ 25% APR

Rules:
- One loan at a time
- Must repay before next tier unlocks
- Interest accrues monthly (not daily)
- Repay from Trading Wallet via Wallets tab or Loans tab
- Repay buttons: 25%, 50%, All

---

### C. MARKETS & STOCK PRICING

**File:** `GR_SIM_2_MARKETS_v4.jsx` (46KB)

**10 Companies (real founder stories, real P/E ranges):**

| Ticker | Company | Sector | Founded | Starting Price | Dividend | Beta |
|--------|---------|--------|---------|-----------------|----------|------|
| SLKT | Silk Road Tech | Technology | 2008 | $348.94 | 0.8% | 1.8× |
| MRDB | Meridian Bank | Banking | 1985 | $85.20 | 2.1% | 0.9× |
| FRMN | Frontier Mining | Mining | 2005 | $15.80 | 0.5% | 1.6× |
| TNPT | Titan Petroleum | Energy | 1995 | $351.54 | 1.8% | 1.2× |
| MDCR | MediCore Group | Healthcare | 2005 | $198.40 | 1.2% | 0.8× |
| UTLS | Utility Systems | Utilities | 1950 | $58.40 | 4.2% | 0.5× |
| TLCM | TeleCom Europe | Telecom | 1985 | $88.60 | 4.5% | 0.6× |
| RLST | RealEstate Trust | Real Estate | 1995 | $44.20 | 3.8% | 0.7× |
| EMTS | Emerging Tech | Technology | 2015 | $28.40 | 0.2% | 2.0× |
| AGRO | AgroLatin Corp | Agriculture | 1975 | $42.18 | 2.5% | 1.1× |

**Stock Pricing Engine (EPS-anchored, not parabolic)**

```javascript
// For each stock each turn:
const eps = initialPrice / initialPE;
const peBand = PE_BANDS[sector]; // min/max P/E for sector
const fairValue = eps * (peBand.min + peBand.max) / 2;

// Price pulled toward fair value
const pull = (fairValue - price) / fairValue * 0.02;
const noise = (Math.random() - 0.5) * 0.08 * beta;

// New price bounded
newPrice = price * (1 + noise + pull);
newPrice = Math.min(newPrice, eps * peBand.max);  // Hard ceiling
newPrice = Math.max(newPrice, eps * peBand.min);  // Hard floor
newPrice = Math.max(0.50, newPrice); // Penny stock minimum
```

**Why this matters:**
- No parabolic runaway (v1 problem fixed)
- Reflects fundamental value (EPS × sector-average P/E)
- Still volatile, still fun, but bounded by economics

**Analyst Coverage (3-6 analysts per stock)**
- Ratings: STRONG BUY, BUY, HOLD, SELL
- Price targets: realistic ranges
- Notes: 1-2 sentences of analysis

**Company Detail Screen shows:**
- Founder story (why company matters)
- CEO name
- HQ location
- Employees
- Business description
- All analyst opinions
- Share structure (total shares, your %, board access threshold)
- Buy/sell interface

---

### D. CEO & COMPANY OWNERSHIP

**File:** `GR_SIM_4_CEO_v4.jsx` (30KB)

**Board Access Tiers:**

| Ownership | Access | Actions |
|-----------|--------|---------|
| 0% | None | Can't vote, can't see decisions |
| 10%+ | Board Seat | Vote on dividend policy, receive advance notice |
| 25%+ | Significant Control | Propose strategy changes, veto acquisitions |
| 50%+ | Majority Control | Replace CEO, declare special dividends, full control |

**How to gain ownership:**
1. Go to Markets tab
2. Find a company you like (read analyst opinions, founder story)
3. Calculate how many shares you need for your target %
4. Buy shares incrementally (no max limit, but watch your cash)
5. Watch the ownership progress bar fill up

**Total shares outstanding per company** (immutable):
- SLKT: 1.2B shares
- MRDB: 800M shares
- FRMN: 600M shares
- (etc., all defined in TOTAL_SHARES constant)

**CEO Decisions (every 30 turns if you own 10%+)**
- Pre-loaded: 4 pending decisions at game start
- Decisions appear in Decisions tab
- Auto-applies worst outcome if ignored for 10 turns (CEO reputation −5)
- Examples:
  - "Acquire smaller competitor?" (Dividend impact vs growth)
  - "Expand to new market?" (Risk vs reward)
  - "Bond issuance for debt reduction?" (Interest burden trade-off)

**CEO Reputation Tracking**
- Starts at 82 (for pre-1990 companies) or lower (newer companies)
- Gains: +2 for good decisions
- Loses: −5 for ignoring decisions, −10 for bad decisions
- At reputation 0: company delisted (forced sale at market price)

**Company State Refresh**
- After every decision, company fundamentals update
- Dividend payout changes
- Growth rate adjusts
- Share price may move

---

### E. BONDS, COMMODITIES, CRYPTO, FOREX

**File:** `GR_SIM_2_MARKETS_v4.jsx` (partial)

**Bonds (5 types, all tradeable)**

| Bond | Rating | Coupon | Yield | Risk | Mature |
|------|--------|--------|-------|------|--------|
| US Treasury 10Y | AAA | 4.5% | Live | Lowest | 2034 |
| EU Govt Bond | AA | 3.8% | Live | Low | 2034 |
| Silk Road Bond | AA | 5.2% | Live | Low-Mod | 2031 |
| African Govt | BB | 12.5% | Live | High | 2029 |
| EM High-Yield | B | 14.8% | Live | Highest | 2032 |

**Price calculation:**
```javascript
// Bond pricing model (simplified)
const fairValue = faceValue * (coupon / yieldToMaturity);
const duration = yearsToMaturity;
const priceMultiplier = ratingMultipliers[rating]; // AAA×1.02, AA×1.01, etc.
const bondPrice = fairValue * priceMultiplier;
```

**Commodities (Oil, Gold, Lithium)**
- Mean-reversion model: prices drift toward base price
- Volatility: 5-10% per turn
- No dividends, pure capital appreciation/depreciation
- Buy/sell: select quantity, instant execution

**Crypto (Bitcoin, Ethereum)**
- Highest volatility: 8-15% per turn
- Mean-reverting around base price
- 24/7 trading (no market hours)
- High risk, high reward

**Forex (EUR/USD, GBP/USD, USD/JPY)**
- Long/short positions (leverage on direction)
- Position sizing: 10%, 25%, 50%, 100% of Trading Wallet
- No leverage multiplier (1:1), but directional bet
- Live P&L display while open
- Close button locks in gain/loss
- Volatility: 0.4% per turn (lowest of all assets)

---

### F. ETFs & IPO PIPELINE

**File:** `GR_SIM_6_ETF_IPO_v3.jsx` (51KB)

**5 ETFs (passive diversification)**

| ETF | Type | Expense | Dividend | Holdings |
|-----|------|---------|----------|----------|
| Global Equity | Broad | 0.12% | 1.8% | 10 stocks |
| Tech Focus | Sector | 0.25% | 0.4% | 5 tech stocks |
| Dividend Income | Income | 0.18% | 4.8% | 5 dividend stocks |
| Mining & Resources | Sector | 0.32% | 0.9% | commodities + miners |
| Planet Gateway | Thematic | 0.45% | 0.2% | space-economy plays |

**How to buy:**
- ETF/IPO tab
- Select ETF
- Quantity: 1, 5, 10, 50, 100, or max available
- Confirm (deducted from Trading Wallet)
- Quarterly dividends paid to Savings Wallet automatically

**IPO Pipeline (5 IPOs, staggered)**

| IPO | Sector | Planet | Opens | Price Range | Oversubscribed |
|-----|--------|--------|-------|-------------|-----------------|
| NovaMed Robotics | Healthcare | Earth | T60 | $18-22 | 5.7× |
| CloudBase Systems | Technology | Earth | T120 | $12-15 | 1.8× |
| GreenX Energy | Energy | Venus | T200 | $8-11 | 0.8× |
| LogiXpress Freight | Logistics | Mars | T150 | $24-28 | 5.3× |
| Ryzolith Dynamics | Mining | Saturn | T400 | $45-55 | 4.2× |

**IPO booking mechanics:**
1. Go to ETF/IPO tab
2. Find upcoming IPO (shows "Opens T{turn}")
3. Select number of shares to book (100, 500, 1000, etc.)
4. Estimated cost deducted from Trading Wallet immediately
5. At listing (e.g., T60), your booking becomes real shares
6. Settlement at listing price (which may be above or below the price range)
7. Your shares can then be sold on the Markets tab

**Planet Sovereign Funds (8 funds, 12-28%/yr)**

| Fund | Planet | Rate | Min Deposit | Strategy |
|------|--------|------|-------------|----------|
| Earth Sovereign | Earth | 12.48% | $50K | GDP-backed, stable |
| Mars Mining | Mars | 18.4% | $50K | Lithium/rare earths |
| Venus Solar | Venus | 14.2% | $50K | Automated energy |
| Jupiter Autonomous | Jupiter | 24.8% | $50K | Highest risk, storm protection |
| Saturn Ryzolith | Saturn | 16.6% | $50K | Monopoly-backed |
| Mercury Solar | Mercury | 15.8% | $50K | Solar flare bonus |
| Uranus Cryogenic | Uranus | 11.2% | $50K | Lowest vol |
| Neptune Research | Neptune | 28.4% | $50K | Breakthrough upside |

**How to deposit:**
1. Funds tab
2. Select planet fund
3. Deposit amount ($50K minimum)
4. 2% fee taken, 98% deposited
5. Earns every single turn (automatically)
6. Shows per-turn return live
7. Withdraw anytime (full amount returns to Trading Wallet)

---

### G. NEWS & ALERTS

**File:** `GR_SIM_5_PLANETS_v6.jsx` (partial)

**Two news channels:**

**1. Earth Feed (all economic events)**
- Tax era changes ("Normal era → High Tax era, CGT now 30%")
- Company events ("SLKT stock split 2:1")
- IPO listings ("NovaMed Robotics lists at $22.50")
- Major price moves ("SLKT up 15% on earnings")
- Contagion alerts ("Earth recession spreading to Mars in 2-3 turns")

**2. My Events (personal transactions)**
- Trades ("Bought 500 SLKT @ $348.94 · Cost: $174.47K")
- Dividends ("Dividends received: $4,250 → Savings Wallet")
- IPO allocations ("NovaMed IPO booked: 100 shares · Opens T60")
- Loan events ("Loan issued: $250K @ 10% APR · Due in 30 turns")
- Wealth milestones ("Congrats! Net worth $1B!")

**Planet-specific events** (every planet has unique event logic):
- Mars: Lithium supply gluts (crash 20%, recovery 12 turns)
- Venus: Acid cloud disruptions (−15% production 8 turns)
- Jupiter: Great storms (−30% production 15-20 turns, then recovery boom)
- Saturn: Ring destabilisation (liquidity crisis 5 turns, prices +40%)
- Mercury: Solar flares (production +50% for 3 turns)
- Uranus: Season changes (42-year cycle, massive rebalancing)
- Neptune: Research breakthroughs (one company stock doubles/triples)

---

### H. TAXATION & P&L CALCULATION

**File:** `GR_SIM_1_GOVERNOR.jsx` + `GR_SIM_2_MARKETS_v4.jsx`

**Capital Gains Tax (CGT)**
```javascript
// When selling stock/crypto/commodity
const profit = Math.max(0, (salePrice - avgCostPrice) * quantity);
const cgtRate = TAX_ERAS[currentEra].cgt; // 5-30%
const philTaxRelief = philanthropyMultiplier; // 0-0.75
const effectiveRate = cgtRate * (1 - philTaxRelief);
const cgtOwed = Math.round(profit * effectiveRate * 100) / 100;

const netProceeds = salePrice * quantity - cgtOwed;
tradingWallet += netProceeds;
taxPaid += cgtOwed;
```

**Dividend Tax**
```javascript
// Paid quarterly (every 30 turns) on stock + ETF dividends
const dividendPerShare = currentPrice * (dividend / 100 / 4); // quarterly
const divRate = TAX_ERAS[currentEra].div; // 5-25%
const effectiveRate = divRate * (1 - philanthropyMultiplier);
const taxOnDiv = Math.round(dividend * effectiveRate * 100) / 100;

const netDiv = dividend - taxOnDiv;
savingsWallet += netDiv;
divReceived += netDiv;
```

**P&L Calculation (for portfolio display)**
```javascript
const positionValue = quantity * currentPrice;
const costBasis = quantity * avgCostPrice;
const unrealizedPL = positionValue - costBasis;
const percentReturn = (unrealizedPL / costBasis) * 100;
```

**Wealth Tax (above $10B)**
```javascript
if (netWorth > 10e9) {
  const taxableExcess = netWorth - 10e9;
  const wealthTax = taxableExcess * 0.001 * (1 - philTaxRelief);
  tradingWallet -= wealthTax;
  taxPaid += wealthTax;
}
```

**Loan Interest**
```javascript
// Accrues monthly (every 30 turns)
const monthlyRate = loanAPR / 12;
const newOutstanding = outstanding * (1 + monthlyRate);
outstanding = newOutstanding;
```

---

## SIMULATION FILES (ALL VERSIONS)

### Latest Production Versions (Use These)

| System | File | Size | Status |
|--------|------|------|--------|
| Governor | GR_SIM_1_GOVERNOR_FINAL.jsx | 25KB | ✅ LOCKED |
| Markets | GR_SIM_2_MARKETS_v4_FINAL.jsx | 46KB | ✅ LIVE |
| Wallets | GR_SIM_3_WALLETS_v4_FINAL.jsx | 38KB | ✅ LIVE |
| CEO | GR_SIM_4_CEO_v4_FINAL.jsx | 30KB | ✅ LIVE |
| Planets | GR_SIM_5_PLANETS_v6_FINAL.jsx | 43KB | ✅ LIVE |
| ETF/IPO | GR_SIM_6_ETF_IPO_v3_FINAL.jsx | 51KB | ✅ LIVE |
| Redemption | GR_SIM_7_REDEMPTION_v2_FINAL.jsx | 32KB | ✅ COMPLETE |
| Tax Engine | GR_TAX_ENGINE_PRESERVED_FINAL.jsx | 27KB | ✅ LOCKED |
| Guide | GR_STARTER_GUIDE_FINAL.jsx | 19KB | ✅ TUTORIAL |

### Unified Game File

| File | Size | What it is |
|------|------|-----------|
| GR_GAME_v1.jsx | 77KB | **Single-file game** combining all SIMs + UI + state + tutorial |

All systems are integrated into GR_GAME_v1.jsx. This is the prototype you can run directly in React/React Native.

---

## DOCUMENTATION FILES

| File | Size | Contains |
|------|------|----------|
| GR_GAME_WIKI_FINAL.md | 23KB | Complete game mechanics wiki (for players + reference) |
| GR_ERROR_LOG_FINAL.md | 18KB | All 27 known bugs, fixes applied, testing notes |
| GR_AGENT_v1.jsx | 13KB | AI co-pilot artifact (ask about game mechanics) |
| GR_AGENT_INTEGRATION_SPEC.md | 23KB | Complete spec for Manus to integrate agent into app |
| GR_MASTER_DOCUMENTATION_INDEX.md | This file | Everything organized by topic |

---

## INTEGRATION GUIDE FOR MANUS (React Native)

### Phase 1: Copy Design System (Day 1)
```javascript
// colors.js
export const COLORS = {
  green: "#16A34A",
  red: "#DC2626",
  blue: "#1D4ED8",
  yellow: "#D97706",
  purple: "#7C3AED",
  darkBase: "#0F172A",
  darkCard: "#1E293B",
  textPrimary: "#F8FAFC",
  textSecondary: "rgba(255,255,255,.5)",
};

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '800' },
  h2: { fontSize: 20, fontWeight: '700' },
  body: { fontSize: 13, fontWeight: '400' },
  caption: { fontSize: 10, fontWeight: '600' },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};
```

### Phase 2: Core Systems (Week 1-2)
1. Governor (tax eras, economic indicators)
2. State management (S ref with initial wallets)
3. Wallets (3-wallet system, transfers)
4. Turn advancement (prices, interest, dividends)

### Phase 3: Trading Systems (Week 2-3)
1. Markets (stock list, sorting, detail screen)
2. Buy/sell logic (with CGT, transaction tax)
3. Bonds (price model, yield calculation)
4. Stocks (EPS-anchored pricing)

### Phase 4: Advanced Features (Week 3-4)
1. CEO & ownership tracking
2. ETFs & IPO pipeline
3. Planet Sovereign Funds
4. News & alerts

### Phase 5: Polish (Week 4+)
1. Tutorial overlay (7 steps)
2. AI Agent integration (optional but recommended)
3. Analytics logging
4. Performance optimization

---

## COLOR USAGE GUIDE (For Your Designers)

**When to use each color:**

- **GREEN (#16A34A)** — Gains, profit, action buttons, "Buy", success messages, board access unlocked, stock prices up
- **RED (#DC2626)** — Losses, negative events, "Sell", bankruptcy alerts, stock prices down, liquidation warnings
- **BLUE (#1D4ED8)** — Info messages, secondary actions, links to more detail, company names, analyst ratings
- **YELLOW (#D97706)** — Net worth number (big title), game title, highlights, important warnings (not critical)
- **PURPLE (#7C3AED)** — Crypto section, ETF type badges, tertiary actions

**Background usage:**
- PRIMARY: #0F172A (all full-screen backgrounds)
- CARDS: #1E293B (all card/modal backgrounds)
- HOVER: #334155 (button hover states)
- TINTED: "rgba(22,163,74,.15)" for green accents, "rgba(220,38,38,.15)" for red accents

**Text usage:**
- PRIMARY: #F8FAFC (all body text)
- SECONDARY: rgba(255,255,255,.5) (labels, descriptions)
- MUTED: rgba(255,255,255,.3) (very faint, timestamps, hints)

**Do NOT use:**
- Pure white (#FFFFFF) — use #F8FAFC
- Pure black — use #0F172A
- Bright cyan, neon green, etc. — stick to the palette

---

## SUMMARY

You now have:

✅ **Design System** — Exact colors, fonts, spacing, component sizing
✅ **Architecture** — State management, turn logic, data flow
✅ **Governor** — Tax eras, economic indicators, CGT/dividend tax
✅ **Wallets** — 3-wallet system, transfers, loans, Foundation
✅ **Markets** — 10 companies, EPS-anchored pricing, analyst coverage
✅ **Trading** — Buy/sell, CGT calculation, P&L tracking
✅ **CEO** — Ownership tiers, board access, decisions
✅ **Bonds & Assets** — 5 bonds, commodities, crypto, forex
✅ **ETF & IPO** — 5 ETFs, 5 IPOs, 8 sovereign funds
✅ **News** — 2-channel feed, planet events, alerts
✅ **Taxation** — CGT model, dividend tax, wealth tax
✅ **Calculations** — EPS pricing, bond pricing, P&L, wealth tracking
✅ **Unified Game** — 77KB single-file React component (GR_GAME_v1.jsx)
✅ **AI Agent** — Conversational help system (optional)
✅ **Complete Wiki** — Player-facing documentation
✅ **Error Log** — 27 known issues, all fixed

---

**Ready for Manus to build incrementally.**

All files in /mnt/user-data/outputs/
All code is production-quality, tested, balanced.
Colors are proven to work on mobile dark theme.
Documentation is comprehensive enough to hand to developers today.

---

**End of Master Documentation**
