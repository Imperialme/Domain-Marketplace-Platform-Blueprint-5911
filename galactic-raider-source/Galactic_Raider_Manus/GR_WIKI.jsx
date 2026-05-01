import{useState}from"react";
const G="#16A34A",R="#DC2626",BL="#1D4ED8",DK="#0F172A",AU="#D97706",PU="#7C3AED";

const WIKI={
  categories:[
    {id:"start",label:"🚀 Getting Started",icon:"🚀"},
    {id:"wallets",label:"💼 Wallets & Money",icon:"💼"},
    {id:"markets",label:"📊 Markets",icon:"📊"},
    {id:"tax",label:"🔔 Tax System",icon:"🔔"},
    {id:"planets",label:"🌍 Solar System",icon:"🌍"},
    {id:"ceo",label:"👔 CEO & Board",icon:"👔"},
    {id:"rewards",label:"🎡 Rewards",icon:"🎡"},
    {id:"bankruptcy",label:"⚠️ Bankruptcy",icon:"⚠️"},
    {id:"strategy",label:"🧠 Strategy",icon:"🧠"},
    {id:"glossary",label:"📖 Glossary",icon:"📖"},
  ],
  articles:{
    start:[
      {title:"What is Galactic Raider?",content:`Galactic Raider Capital Exchange is a financial empire building game. You start with $1,000,000 and must grow it across stocks, bonds, forex, commodities, and eventually the entire solar system.

The game runs in turns. Each turn represents one day in production. Markets move, dividends pay, CEO decisions fire, and your wealth grows or shrinks based on your choices.

There is no luck — only strategy. The player who understands tax eras, diversification, CEO decisions, and philanthropy timing will always outperform one who just buys randomly.`},
      {title:"Starting Capital Breakdown",content:`You begin with exactly $1,000,000 split across three wallets:

• Cash Wallet: $100,000 — Day-to-day expenses, tax payments, fees
• Savings Wallet: $100,000 — Earns 2% interest per year. Protected if Foundation is open.
• Trading Wallet: $800,000 — Your active risk capital. All trades draw from here.

These three wallets serve different purposes. Never mix them up.`},
      {title:"Your First 10 Turns",content:`Here is exactly what to do in your first 10 turns:

Turn 1-2: Press Next Turn and observe how markets move. Do not buy anything yet.

Turn 3: Check what Tax Era you are in. If it is Capital Gains or Low Tax — perfect time to invest. If it is High Tax — wait.

Turn 4: Go to Markets and find 2-3 companies with STRONG BUY or BUY consensus analyst rating.

Turn 5: Buy a small position in your best pick. Use 20-30% of your Trading Wallet, not all of it.

Turn 6: Check the GSF rate. If above 8%, deposit $100K into GSF. This gives passive income every turn.

Turn 7-8: Watch your position. See how it moves with GDP changes.

Turn 9: Make your first philanthropy donation ($1M minimum) to start earning Redemption Points.

Turn 10: Check the Solar System progress bar. You need 5 criteria to unlock planets.`},
    ],
    wallets:[
      {title:"The Three Wallet System",content:`Galactic Raider uses three separate wallets — each with a different purpose, risk profile, and protection level.

CASH WALLET
Purpose: Day-to-day spending. Paying taxes, loan interest, transfer fees.
Protection: Not automatically liquidated, but no special protection either.
Interest: None.
Rule: Keep at least $10,000 here at all times as emergency reserve.

SAVINGS WALLET
Purpose: Long-term wealth storage. Earns 2% interest per year (0.00548% per turn).
Protection: Protected from bankruptcy ONLY if you have opened a Foundation.
Dividends: Stock dividends and bond coupons are credited here.
Rule: Think of this as your personal bank account — not for trading.

TRADING WALLET
Purpose: All active investing. Every stock, bond, forex, commodity, and ETF trade draws from here.
Protection: None. First to be liquidated in bankruptcy.
Interest: None.
Rule: This is your risk capital. Only put money here that you are prepared to deploy.`},
      {title:"Transferring Between Wallets",content:`You can move money between any two wallets using percentage buttons: 10%, 25%, 50%, 100%.

TRANSFER RULES:
• Trading → Savings: Takes 1 turn to settle (settlement period)
• Savings → Trading: Instant
• Cash → Trading: Instant
• Trading → Cash: Instant
• Cash → Savings: Instant
• Savings → Cash: Takes 1 turn to settle

100% Transfer: Always transfers the exact maximum available, leaving any decimal remainder in the source wallet. The remainder can be transferred separately.

Savings Wallet minimum: When transferring FROM Savings, a minimum $10,000 always stays behind. You cannot fully drain Savings.`},
      {title:"Foundation — Protecting Your Savings",content:`A Foundation is a legal structure that permanently protects your Savings Wallet from bankruptcy.

Cost: $10,000 setup fee (one-time, from Cash Wallet)
Effect: Once open, your Savings Wallet can NEVER be touched by bankruptcy proceedings
Foundation interest: The Foundation pool itself earns 3% per year
Irreversible: Once opened, always open — no closing it

Without Foundation: In bankruptcy, Trading Wallet is liquidated first, then Cash Wallet, then Savings Wallet.
With Foundation: Trading Wallet liquidated, Cash Wallet at risk, Savings Wallet completely safe.

RECOMMENDATION: Open a Foundation in your first 20 turns. $10,000 is cheap insurance.`},
      {title:"Loans — Five Tiers",content:`Loans give you instant capital to invest, but must be repaid with interest.

CRITICAL RULE: One loan at a time. You must fully repay the current loan before accessing the next tier.

Tier 1 — Starter Loan: $50,000 at 12% APR
Tier 2 — Growth Loan: $250,000 at 15% APR (requires Tier 1 repaid)
Tier 3 — Business Loan: $1,000,000 at 18% APR (requires Tier 2 repaid)
Tier 4 — Corporate Loan: $5,000,000 at 22% APR (requires Tier 3 repaid + $500K net worth)
Tier 5 — Premium Loan: $25,000,000 at 25% APR (requires Tier 4 repaid + $5M net worth)

All loan proceeds go to Trading Wallet only. Interest is deducted quarterly. Never borrow to put money in Savings — the interest rate will exceed the 2% savings rate.`},
    ],
    markets:[
      {title:"The Stock Market — How It Works",content:`Galactic Raider has 15 companies on Earth across 10 sectors. Each company has:

• A real-time price that moves every turn based on GDP, inflation, interest rates, and random events
• A P/E ratio that the Economic Governor keeps within industry bounds
• A dividend yield paid quarterly (every 30 turns)
• 3-5 analyst opinions from named research firms
• A founder story, CEO profile, and operations description

The Economic Governor prevents prices from becoming unrealistic. Technology stocks stay between P/E 15-35×. Mining stocks between 6-12×. This means there are natural floors and ceilings on every stock.

BUYING: Select a company, choose quantity, confirm. CGT is NOT charged on buying — only on selling profit.
SELLING: You pay Capital Gains Tax only on the profit portion, not the full proceeds.`},
      {title:"Reading Analyst Opinions",content:`Every company has 3-5 analyst opinions from different research firms. Each shows:

• FIRM NAME: Who is giving the opinion (Goldman, JPMorgan, etc.)
• RATING: STRONG BUY / BUY / HOLD / SELL / SPECULATIVE BUY
• PRICE TARGET: Where the analyst thinks the stock will be in 12 months
• NOTE: Their specific reasoning in plain English

CONSENSUS RATING: The most common rating among all analysts for that company. This is shown on the main market list.

HOW TO USE IT:
• 4-5 analysts all say BUY = strong conviction, low risk
• Mix of BUY and SELL = controversial stock, higher risk
• All analysts say SELL = avoid or short the stock
• Target price 30%+ above current = significant upside potential`},
      {title:"Market Events",content:`Random events fire throughout the game and impact prices:

MARKET-WIDE EVENTS (affect all companies in a sector or all markets):
• Rate Cut: All stocks rally. Bonds fall in yield but rise in price.
• Rate Hike: Equity valuations compressed. Banks benefit relatively.
• Geopolitical Crisis: Energy and Mining spike. Capital flees to safety.
• Tech Regulation: Technology sector falls. Can be severe.
• Trade Deal: Markets rally broadly.

COMPANY-SPECIFIC EVENTS:
• Earnings Beat/Miss: Single company up or down 4-6%
• Patent Approved: Up 20-30% spike
• CEO Scandal: Down 20-25%
• Government Contract: Up 20%+ over 35 turns
• Labour Strike: Down while active

Events are shown in the News tab — All Events shows everything, My Events shows only what affects your positions.`},
      {title:"Bonds — Stable Income",content:`Bonds provide predictable income through quarterly coupon payments. Five bonds available:

• US Treasury 10Y (AAA): 4.5% coupon, safest, lowest yield
• EU Government 10Y (AA): 3.8% coupon, very safe
• Silk Road Tech Bond (AA): 5.2% coupon, corporate bond
• African Government Bond (BB): 12.5% coupon, higher risk
• Emerging Market Bond (B): 14.8% coupon, highest risk/reward

BOND PRICING: When interest rates rise, bond prices fall (inverse relationship). When rates fall, existing bonds become more valuable.

INCOME: Coupons paid quarterly automatically to your Savings Wallet.
CGT: Bond profits on sale are taxed at CGT rate. Coupon income taxed at Bond Interest Tax rate.

Strategy: Buy high-yield bonds (African, EM) when you need income. Buy safe bonds (US Treasury) as a hedge during market crashes.`},
      {title:"Forex — Currency Trading",content:`Forex lets you bet on exchange rate movements. No position size limits.

AVAILABLE PAIRS:
• EUR/USD — most liquid
• GBP/USD — medium volatility
• USD/JPY — yen dynamics
• USD/INR — emerging market
• USD/AED — LOCKED at 3.6735 (real-world peg, never moves)
• USD/CNY — LOCKED at 6.80 (real-world peg, never moves)

LONG vs SHORT:
• Long EUR/USD: You profit when Euro strengthens vs Dollar
• Short EUR/USD: You profit when Euro weakens vs Dollar

P&L CALCULATION: Position size × price change ÷ entry price
Example: $500K long on EUR/USD. Rate moves +1%. P&L = +$5,000.

WARNING: Forex is the highest risk asset in the game. A 10% adverse move wipes 10% of your position. Never bet more than you can afford to lose.`},
      {title:"ETFs — Diversified Exposure",content:`Exchange Traded Funds give you exposure to multiple stocks through one purchase.

FIVE ETFs AVAILABLE:
• Global Equity (0.12% TER): Broad market exposure across all sectors
• Tech Focus (0.25% TER): Concentrated technology exposure, higher volatility
• Dividend Income (0.18% TER): High yield, 4.8% annual distribution
• Mining & Resources (0.32% TER): Commodities and resources, cyclical
• Planet Gateway (0.45% TER): Thematic space economy exposure

KEY METRICS:
• Sharpe Ratio: Return per unit of risk. Above 1.5 is excellent.
• Max Drawdown: Worst peak-to-trough loss. Lower is safer.
• Expense Ratio (TER): Annual cost deducted automatically.
• Dividend Yield: Annual income from the ETF.

ETFs are lower maintenance than individual stocks. Good for passive income or when you do not have time to monitor individual companies.`},
      {title:"IPOs — Getting In Early",content:`Initial Public Offerings let you buy shares before a company lists on the market.

HOW TO PARTICIPATE:
1. Find an IPO in the IPO tab before its opening turn
2. Book shares at the midpoint of the price range
3. Pay estimated cost (reserved from cash)
4. At listing, you receive your allocation (typically 85% of booked amount)
5. Proceeds credited at listing price

OVERSUBSCRIPTION:
• 5× oversubscribed = very strong demand, likely to list above midpoint
• 1× = barely subscribed, may list at or below midpoint
• Below 1× = undersubscribed, caution

RISK: IPO price can fall below your allocation price. There is no guarantee of profit. However, oversubscribed IPOs with strong analyst backing have historically delivered strong listing-day returns in this game.`},
    ],
    tax:[
      {title:"The 8 Tax Eras",content:`Tax eras rotate every 60 turns in a randomised sequence. Each era changes CGT, dividend tax, transaction tax, and wealth tax rates.

1. NORMAL ERA — Standard rates. CGT 20%, Dividend 15%, Transaction 0.1%
2. HIGH TAX ERA — All rates elevated. CGT 30%, Dividend 25%. Worst era to sell.
3. LOW TAX ERA — Everything reduced. CGT 10%, Dividend 5%. Excellent for all activities.
4. CAPITAL GAINS ERA — CGT slashed to 5%. Best era to sell profitable stock positions.
5. DIVIDEND ERA — Dividend tax 5%. Best era to collect income from high-yield stocks.
6. TRANSACTION ERA — Transaction tax near zero (0.01%). Trade freely without cost.
7. WEALTH TAX ERA — 0.2% per turn on net worth above $10 billion. Only affects the very wealthy.
8. NORMAL ERA — Cycle resets.

The sequence is randomised each game — you cannot predict which era comes next, but you can see the current era and how many turns remain.`},
      {title:"Capital Gains Tax — Detailed",content:`Capital Gains Tax (CGT) is charged ONLY when you sell a position at a profit.

Formula: (Sell Price − Average Buy Price) × Quantity × CGT Rate × (1 − Philanthropy Relief)

Example: You bought 1,000 shares of SLKT at $300. You sell at $350. Profit = $50,000.
In Normal Era (20% CGT): Tax = $50,000 × 20% = $10,000. You keep $40,000 profit.
In Capital Gains Era (5% CGT): Tax = $50,000 × 5% = $2,500. You keep $47,500 profit.

KEY POINTS:
• Selling at a loss = ZERO tax. Loss is not deductible but is not taxed.
• Average cost matters — if you bought at different prices, the average is used.
• Philanthropy relief reduces your effective CGT rate.
• Never sell at a big profit during High Tax Era if you can wait.`},
      {title:"Philanthropy Tax Relief",content:`Donating to charitable categories reduces ALL your tax rates for multiple turns.

HOW IT WORKS:
1. You donate $1M+ to a philanthropic category
2. This activates a tax relief percentage for a set number of turns
3. Multiple donations STACK — up to 75% combined maximum relief
4. Relief applies to CGT, Dividend Tax, Bond Tax, and Wealth Tax equally

CATEGORIES AND RATES:
• Healthcare: 20% relief for 3 turns (1.3× point multiplier)
• Education: 25% relief for 5 turns (1.5× point multiplier — best value)
• Environment: 30% relief for 7 turns (longest duration)
• Infrastructure: 15% relief for 4 turns
• Poverty: 20% relief for 3 turns (1.2× point multiplier)
• Science: 25% relief for 5 turns
• Arts: 10% relief for 2 turns (cheapest)
• Disaster Relief: 35% relief for 8 turns (highest rate, longest)

STRATEGY: Donate to Environment ($1M) and Education ($1M) simultaneously = 55% combined relief. Then sell your biggest winners during Capital Gains Era. Effective CGT drops to 2.25%.`},
      {title:"Wealth Tax",content:`Players with net worth above $10 billion pay an automatic wealth tax every single turn.

Formula: (Net Worth − $10,000,000,000) × 0.1% per turn

Examples:
• $15B net worth: Tax = $5B × 0.001 = $5,000,000 per turn
• $30B net worth: Tax = $20B × 0.001 = $20,000,000 per turn
• $100B net worth: Tax = $90B × 0.001 = $90,000,000 per turn

This creates an equilibrium — at some point your wealth generation from investments equals your wealth tax drain. The Governor uses this to prevent one player from accumulating infinite wealth.

Philanthropy relief DOES reduce wealth tax. At 75% relief, effective rate drops from 0.1% to 0.025% per turn.`},
    ],
    planets:[
      {title:"How Cross-Dimension Economics Works",content:`When Earth's economy changes, all other planets are affected — but with a delay and reduced intensity.

This is called Economic Contagion (from Spec Stage 11).

EARTH CONTAGION RULES:
• Mars: Earth GDP change arrives at 50% strength after 2 turns
• Venus: Earth GDP change arrives at 67% strength after 2 turns
• Jupiter: Earth GDP change arrives at 83% strength after 3 turns
• Saturn: Earth GDP change arrives at 45% strength after 4 turns
• Mercury: Earth GDP change arrives at 55% strength after 2 turns
• Uranus: Earth GDP change arrives at 35% strength after 5 turns
• Neptune: Earth GDP change arrives at 28% strength after 6 turns

PRACTICAL USE: If Earth GDP surges to +7%, you know Jupiter is about to get +5.8% in 3 turns. Buy Jupiter companies NOW before the contagion arrives — prices will rise when the effect lands.`},
      {title:"All 7 Planets — Quick Reference",content:`EARTH 🌍 (USD)
Base economy. All other planets reference Earth. GDP changes affect everyone.
Companies: Technology, Banking, Mining, Energy, Healthcare, Utilities, Retail.

MARS 🔴 (MCR — Mars Credit)
Mining economy. Lithium, iron ore, rare earths. Volatile. Contagion in 2 turns at 50%.
Strategy: Buy after Earth recession bottoms — Mars recovery comes 2 turns later.

VENUS 🟡 (VCR — Venus Credit)
Energy export economy. Extreme heat, fully automated. High margins. Contagion 2 turns.
Strategy: Stable income play. Good dividends from energy companies.

JUPITER 🟠 (JCR — Jupiter Credit)
ROBOTIC ECONOMY. No human workers. Highest margins (40-60%) in the solar system.
Storm events every 50-100 turns wipe 30% production. Mutual Space Council rebuilds in 20 turns.
Strategy: Buy POST-STORM when prices are cheapest. Sell during boom phase.

SATURN 🪐 (STC — Saturn Credit)
Ring mining economy. Ryzolith ore — rarest material in solar system. Ice water exports.
Strategy: Ryzolith Corp is a monopoly. Long-term hold, low volatility.

MERCURY ☿ (MRC — Mercury Credit)
Solar energy economy. 24× Earth solar intensity. Fully automated, extreme temperatures.
Strategy: Energy exports make this a steady income generator.

URANUS 🔵 (URU — Uranus Credit)
Ice mining economy. 42-year seasons create multi-decade investment cycles. Very low volatility.
Strategy: Extremely long-term. Set and forget. Low risk, low reward.

NEPTUNE 💜 (NPT — Neptune Credit)
Deep research economy. 2,100 km/h winds. Highest risk, highest potential. Furthest colony.
Strategy: Speculative. Neptune Deep Research could be transformational if research pays off.`},
      {title:"Jupiter Storm System",content:`Jupiter is a robotic economy with the highest margins in the solar system. But it has one unique risk: catastrophic storms.

STORM MECHANICS:
• Every 50-100 turns, a storm event has ~1% chance per turn of occurring
• When it hits: Production falls 30%, GDP craters, all Jupiter stock prices crash
• Duration: Storm active for approximately 20 turns
• Recovery: Turns 21-30 see a boom as rebuilding accelerates
• Mutual Space Council: Other planets automatically send raw materials to help rebuild

JCR CURRENCY: Becomes most volatile in the solar system during storms. Falls sharply, recovers sharply.

THE STRATEGY: When a storm triggers, Jupiter stocks drop 30-50%. This is the BUY signal. After 20 turns of rebuilding, Jupiter enters its strongest period. The Mutual Space Council support means the economy always recovers — it is a temporary dip, not permanent damage.

POST-STORM WINDOW: Turns 1-20 after storm = buy zone. Turns 21-35 = peak profit zone. Turns 36+ = normalize.`},
      {title:"Cross-Planet Transfers",content:`You can move money between planet wallets. This is how you capitalize on multi-dimensional opportunities.

TRANSFER PROCESS:
1. Go to Transfer tab on Planets screen
2. Select your route (Earth → Mars, Jupiter → Earth, etc.)
3. Choose percentage: 10%, 25%, 50%, or 100%
4. Review confirmation popup: amount sent, fee, exchange rate, amount received
5. Confirm — money moves immediately

FEES: 0.5% transfer fee applies to all cross-planet transfers.

EXCHANGE RATES: Each planet has a rate vs USD:
• MCR (Mars): 1 MCR = $0.85 USD
• VCR (Venus): 1 VCR = $0.75 USD
• JCR (Jupiter): 1 JCR = $0.90 USD (volatile during storms)
• STC (Saturn): 1 STC = $0.70 USD
• MRC (Mercury): 1 MRC = $0.60 USD
• URU (Uranus): 1 URU = $0.55 USD
• NPT (Neptune): 1 NPT = $0.50 USD

TAX: Destination era tax applies on conversion. If Earth is in High Tax Era, transferring TO Earth costs more.`},
    ],
    ceo:[
      {title:"CEO Decision System",content:`Every company has a CEO with a reputation score (0-100) and a management style. When you own 10%+ of a company, CEO decisions require your input.

DECISION FREQUENCY: Every 30 turns for companies you own 10%+.

DECISION TYPES:
• Acquisitions: Approve, counter-offer, or decline. Price and revenue impact varies.
• Dividend policy: Raise, maintain, or cut. Affects yield and investor sentiment.
• Market expansion: Invest fully, run a pilot, or stay focused.
• Cost restructuring: Cut staff (margin improvement, ESG risk) or invest in efficiency.
• CEO replacement: At 50% ownership you can replace a poorly performing CEO.

URGENCY: You have 10 turns to decide. After that, the worst option is auto-applied and CEO reputation drops −5 points.

IMPACT: Each option shows the expected stock price impact (%) and CEO reputation change. Choosing well repeatedly builds CEO reputation and improves future decision quality.`},
      {title:"Board Access Tiers",content:`Your ownership percentage in each company determines your governance rights.

10% OWNERSHIP — BOARD SEAT:
• Vote on dividend proposals
• Attend quarterly board meetings
• Receive advance notice of CEO decisions before public announcement
• First access to earnings information

25% OWNERSHIP — SIGNIFICANT CONTROL:
• Propose strategic initiatives
• Veto major acquisitions you disagree with
• Nominate board candidates
• Access management accounts and internal forecasts

50%+ OWNERSHIP — MAJORITY CONTROL:
• Replace the CEO (choose from 3 candidates with different styles)
• Declare special dividends (extra cash payout beyond regular schedule)
• Force asset sales to raise capital
• Restructure the entire board

STRATEGY: 10% is the sweet spot for most companies — you get decision rights without overcommitting capital. Go to 50% only in companies where you have conviction and want CEO replacement authority.`},
      {title:"CEO Reputation",content:`CEO reputation (0-100) affects company performance and decision quality.

REPUTATION EFFECTS:
• 80-100: Excellent. CEO makes strong default decisions. Low chance of scandal.
• 60-79: Good. Competent leadership. Occasional weak decisions.
• 40-59: Average. Board members becoming restless.
• 20-39: Poor. Board intervention recommended. Sell signals emerging.
• 0-19: Critical. Immediate replacement recommended.

REPUTATION CHANGES:
• +5: You approved a successful decision (stock rose as predicted)
• −5: You ignored a decision (auto-resolved at worst outcome)
• −8 to −12: Bad event occurred on CEO's watch (scandal, missed earnings)
• +3: Successful acquisition or expansion

REPLACEMENT: At 50% ownership, you can replace the CEO. New CEO candidates come with different styles (Growth, Conservative, Dividend-focused) and starting reputation scores.`},
    ],
    rewards:[
      {title:"Redemption Points System",content:`Redemption Points are earned through philanthropy and used for Wheel of Fortune spins.

EARNING POINTS:
• $1M donation to any category = 1,000 base points
• Education multiplier: 1.5× = 1,500 points per $1M
• Healthcare multiplier: 1.3× = 1,300 points per $1M
• Poverty multiplier: 1.2× = 1,200 points per $1M
• All others: 1.0× = 1,000 points per $1M

LIMITS:
• Maximum 5,000 points total
• Points decay 1% per 100 turns (use them or lose them)
• Spend 500 points + 1 spin token = 1 Wheel spin

SPIN TOKEN UNLOCKING:
• Accumulate 500+ points AND make 2+ donations = earn a spin token
• 7-day login streak = 1 free spin token + 10% debt forgiveness
• Maximum 5 lifetime spins per game`},
      {title:"Wheel of Fortune — How to Win",content:`The Wheel of Fortune gives you debt forgiveness. Here are the outcomes and their probabilities:

OUTCOMES:
• 5% debt relief — 30% probability (most common)
• 10% debt relief — 20% probability
• 15% debt relief — 15% probability
• 25% debt relief — 10% probability
• 50% debt relief — 10% probability (JACKPOT)
• Bonus +100 points — 10% probability (consolation)
• Bonus +200 points — 5% probability (consolation)

REQUIREMENTS TO SPIN:
• 500+ redemption points (costs 500 to spin)
• 1+ spin token available
• 2+ donations made
• Under 5 lifetime spins
• 1,000 turns since last spin

STRATEGY: Save your spins for when you have significant debt. A 50% spin on $10M debt = $5M forgiven. On $100K debt, same spin = only $50K. The bigger your debt, the more valuable each spin.`},
      {title:"7-Day Login Streak",content:`Log in for 7 consecutive days to earn special rewards.

DAY 3 REWARD: +50 redemption points bonus
DAY 7 REWARD (main): 10% debt forgiveness + 1 free Wheel spin token
DAY 14 REWARD: 20% debt forgiveness + 2 spin tokens
DAY 30 REWARD (legend): 35% debt forgiveness + guaranteed 50% Wheel outcome on next spin

STREAK RULES:
• Streak resets if you miss a single day
• The 7-day reward is meaningful even without debt — the free spin token can win bonus points
• Combine streak reward with philanthropy: donate for a spin token, get another from streak = 2 spins available`},
    ],
    bankruptcy:[
      {title:"Bankruptcy Alert System",content:`There are four alert levels before full bankruptcy:

🟡 YELLOW ALERT — Net worth below $100,000
• Warning only. No automatic action.
• You must raise net worth above $150,000 to clear this alert.
• Action: Stop buying. Review positions. Consider selling weak stocks.

🟠 ORANGE ALERT — Net worth goes negative
• FORCED LIQUIDATION BEGINS.
• 10% of your Trading Wallet is automatically liquidated every turn.
• If you have no Foundation: Savings Wallet also at risk (5% per turn).
• You CANNOT buy new positions while in liquidation.
• Action: Immediately transfer remaining Trading funds to Cash. Stop auto-buys.

🔴 RED — Net worth below −$500,000
• BANKRUPT. Game over unless you have a Foundation with Savings inside.
• All positions closed. Trading and Cash wallets cleared.
• Foundation Savings Wallet survives intact.

RECOVERY PATH: If you have Savings with Foundation, you restart from your Savings balance. Without Foundation, you restart from zero.`},
      {title:"How to Avoid Bankruptcy",content:`The most common causes of bankruptcy and how to prevent them:

CAUSE 1: Overlevered in one stock that crashes
Prevention: Never put more than 30% of Trading Wallet in a single stock. Diversify across at least 3 sectors.

CAUSE 2: Forex position against you
Prevention: Use stop-loss thinking — decide before opening a forex position what loss you will accept. Never bet more than 20% of Trading Wallet on a single forex trade.

CAUSE 3: Taking too many loans
Prevention: One loan at a time. Repay before taking the next. Never borrow to speculate.

CAUSE 4: Selling in High Tax Era on falling stocks (crystallising losses AND paying tax)
Prevention: In High Tax Era, hold through losses unless the company is fundamentally broken.

CAUSE 5: Ignoring Wealth Tax at $10B+
Prevention: At high net wealth, maintain enough liquid cash in Trading Wallet to cover wealth tax every turn.

ALWAYS HAVE: Foundation open. Savings Wallet funded. These are your financial airbags.`},
    ],
    strategy:[
      {title:"Beginner Strategy — Turns 1 to 100",content:`Follow this framework for your first 100 turns:

TURNS 1-10:
• Observe markets without buying
• Check which Tax Era you are in
• Open a Foundation immediately ($10K from Cash)
• Deposit $150K into GSF for passive income

TURNS 11-30:
• Buy 3-4 STRONG BUY stocks using 40-50% of Trading Wallet
• Focus on different sectors for diversification
• Make your first $1M philanthropy donation to Education
• Watch the tax era timer — sell your biggest winners when Cap Gains or Low Tax arrives

TURNS 31-60:
• Add bonds for income stability. Start with US Treasury (safe) and African Bond (high yield)
• Check Solar System progress — aim to hit criteria simultaneously
• Reinvest dividends into undervalued stocks

TURNS 61-100:
• By now you should have first spin token from philanthropy
• If debt exists from loans, spin the wheel
• Consider Tier 2 loan ($250K) to accelerate if Tier 1 is repaid
• Net worth target at Turn 100: $2-5M depending on market conditions`},
      {title:"Advanced Strategy — Tax Era Timing",content:`The most powerful strategy in the game is timing your sells around Tax Eras.

THE CORE LOOP:
1. Buy stocks in any era (you never pay tax on buying)
2. Hold through High Tax Era — do not sell
3. Sell profitable positions in Capital Gains Era (CGT only 5%)
4. Collect dividend income in Dividend Era (dividend tax only 5%)
5. Trade actively in Transaction Era (near-zero transaction costs)
6. Hold bonds in any era — coupon income is more tax-efficient than CGT

PHILANTHROPY STACKING:
• Donate Environment ($1M) = 30% relief for 7 turns
• Donate Education ($1M) = 25% relief for 5 turns
• Combined = 55% relief for 5 turns, then 30% for 2 more
• Sell in Capital Gains Era during this window = effective CGT of 2.25%
• On $10M profit, you keep $9.775M instead of $8M in Normal Era

PLANET ARBITRAGE:
• Watch Earth GDP. When it rises above 5%, invest in Jupiter (contagion arrives +83% in 3 turns)
• Buy Jupiter companies BEFORE contagion arrives
• Sell 3 turns later when Jupiter GDP peaks
• Transfer profits back to Earth USD`},
      {title:"The Jupiter Storm Strategy",content:`Jupiter storms are the most powerful single-event opportunity in the game.

SETUP (before storm):
• Have JCR in your Jupiter wallet (transfer Earth USD to JCR)
• Watch the turn counter — storms possible every 50-100 turns
• Monitor Jupiter company prices for unusual softness (pre-storm signal)

WHEN STORM HITS:
• ALL Jupiter companies drop 20-40% immediately
• JCR currency weakens
• Jupiter GDP craters for 20 turns

EXECUTION:
• Buy Jupiter AutoMine, JupiterResearch AI, and Fusion Power at depressed prices
• Buy as much as your Jupiter wallet allows
• Hold for 20 turns while Mutual Space Council rebuilds

POST-STORM (turns 21-35):
• Jupiter companies recover AND overshoot — typically returning 50-80% above pre-storm prices
• Sell positions progressively as they peak
• Transfer profits back to Earth USD

RISK: Storms can occur multiple times in sequence (rare but possible). Maintain some Earth positions as hedge.`},
      {title:"CEO Board Control Strategy",content:`Concentrating ownership in one or two companies unlocks board control that can dramatically improve returns.

THE 50% STRATEGY:
1. Identify a company with low CEO reputation (below 60) and strong underlying fundamentals
2. Accumulate to 50% ownership over 30-50 turns
3. Replace the CEO with a Growth-focused candidate (highest upside)
4. New CEO decisions will now be more favorable on average
5. Stock price typically rises 10-15% on CEO replacement news

THE 10% STRATEGY (lower risk):
• Buy 10% in 5 different companies = board seats in all five
• Receive advance earnings notice for all five before public announcement
• Vote in favor of dividend increases across all holdings
• Diversified board influence without concentrated risk

CEO REPLACEMENT TIMING:
• Replace in Low Tax Era — stock rise after announcement is more profitable
• Avoid replacing during market-wide events (noise drowns out the signal)
• Growth-style CEO is best for Technology and Healthcare
• Conservative CEO is best for Utilities and Banking`},
    ],
    glossary:[
      {title:"A-F Terms",content:`AVERAGE COST: The average price you paid per share across all purchases of a stock. Used to calculate CGT.

BETA: A measure of a stock's volatility relative to the market. Beta 1.0 = moves with market. Beta 2.0 = moves twice as much. Beta 0.5 = moves half as much.

BOND: A debt instrument where you lend money to a company or government in exchange for regular coupon payments and return of face value at maturity.

CAPITAL GAINS TAX (CGT): Tax paid only on the profit when you sell an asset above your average cost. Never charged on losses.

CONTAGION: The effect of one planet's economic changes spreading to other planets with a delay and reduced intensity.

COUPON: The regular interest payment from a bond, expressed as % of face value per year.

DIVIDEND: Regular cash payment from a company to its shareholders, expressed as % of stock price per year.

DIVERSIFICATION: Spreading investments across multiple sectors, regions, and asset types to reduce risk.

EPS (Earnings Per Share): A company's profit divided by number of shares. The foundation of stock price valuation. In Galactic Raider, EPS is fixed at IPO to prevent runaway prices.

ERA: A 60-turn period with a specific tax rate configuration. 8 eras rotate in sequence.

ETF (Exchange Traded Fund): A fund holding multiple stocks, traded as a single instrument.

FACE VALUE (FV): The original value of a bond at issuance, typically $1,000. Returned to you at maturity.`},
      {title:"G-P Terms",content:`GDP (Gross Domestic Product): A measure of economic output. Higher GDP = better corporate earnings = higher stock prices generally.

GOVERNOR (Economic Governor): The invisible system that enforces 8 rules keeping prices realistic. Players never see it directly.

GSF (Global Sovereign Fund): A shared investment pool that earns a market rate of return. You deposit money and earn interest every turn.

INFLATION: Rising prices in the economy. Hurts bond values but can help some commodity stocks.

IPO (Initial Public Offering): When a private company lists on the stock market for the first time. You can book shares before listing.

JCR: Jupiter Credit — the currency of Jupiter. Most volatile currency in the solar system due to storm events.

LIQUIDITY: How easily you can convert an asset to cash. Cash is most liquid. Real estate is least liquid.

LONG: A position that profits when price rises. You buy the asset expecting it to go up.

MARGIN: The profit a company makes as a percentage of revenue. The Governor enforces industry-specific margin bounds.

MCR: Mars Credit — the currency of Mars.

MUTUAL SPACE COUNCIL: An automatic inter-planetary support mechanism that activates during Jupiter storms, sending raw materials to aid recovery.

NET WORTH: Total value of everything you own minus everything you owe. Cash + Savings + Trading + Holdings − Loans.

P/E RATIO (Price-to-Earnings): Stock price divided by earnings per share. The Governor keeps this within industry bounds.`},
      {title:"Q-Z Terms",content:`REDEMPTION POINTS: Points earned through philanthropy donations. 500 points + 1 token = 1 Wheel of Fortune spin.

RYZOLITH: The rarest ore in the solar system, mined exclusively on Saturn by Ryzolith Corp. Used in quantum computing.

SHORT: A position that profits when price falls. You bet the asset will go down.

SHARPE RATIO: A measure of return relative to risk. Above 1.5 is excellent. Below 1.0 is poor.

SPIN TOKEN: A token that allows one Wheel of Fortune spin. Earned through philanthropy (500+ points + 2 donations) or 7-day login streak.

STC: Saturn Credit — the currency of Saturn.

TAX ERA: A 60-turn period with specific tax rates. The sequence rotates throughout the game.

TAX RELIEF: Reduction in tax rates earned through philanthropy. Stacks up to 75% maximum.

TRADING WALLET: The active risk capital wallet. All purchases draw from here. First to be liquidated in bankruptcy.

TRANSACTION TAX: A small percentage charged on every buy and sell order. Lowest in Transaction Era.

WEALTH TAX: Automatic tax of 0.1% per turn on net worth above $10 billion. Cannot be avoided but can be reduced through philanthropy.

YIELD: The annual income from an investment expressed as a percentage of its current price. For bonds: coupon ÷ current price. For stocks: annual dividend ÷ current price.`},
    ],
  }
};

export default function GameWiki(){
  const[cat,setCat]=useState("start");
  const[article,setArticle]=useState(0);
  const[search,setSearch]=useState("");
  const[showSearch,setShowSearch]=useState(false);

  const articles=WIKI.articles[cat]||[];
  const currentCat=WIKI.categories.find(c=>c.id===cat);

  // Search across all articles
  const searchResults=search.length>2?WIKI.categories.flatMap(c=>(WIKI.articles[c.id]||[]).map((a,i)=>({...a,catId:c.id,catLabel:c.label,idx:i}))).filter(a=>a.title.toLowerCase().includes(search.toLowerCase())||a.content.toLowerCase().includes(search.toLowerCase())).slice(0,8):[];

  const colors={start:"#1B5E20",wallets:"#1565C0",markets:"#2E7D32",tax:"#E65100",planets:"#455A64",ceo:"#1A237E",rewards:"#6A1B9A",bankruptcy:"#B71C1C",strategy:"#37474F",glossary:"#4527A0"};
  const catColor=colors[cat]||"#1B5E20";

  const formatContent=(text)=>text.split("\n\n").map((para,i)=>{
    if(para.startsWith("• "))return <div key={i} style={{marginBottom:10}}>{para.split("\n").map((line,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:4,alignItems:"flex-start"}}><span style={{color:catColor,flexShrink:0,marginTop:2}}>•</span><span style={{fontSize:13,color:"#E2E8F0",lineHeight:1.6}}>{line.replace("• ","")}</span></div>)}</div>;
    if(para.match(/^[A-Z][A-Z\s]+:/))return <div key={i} style={{background:"rgba(255,255,255,.04)",borderRadius:8,padding:"8px 11px",marginBottom:8}}><span style={{fontSize:12,fontWeight:700,color:catColor}}>{para.split(":")[0]}: </span><span style={{fontSize:12,color:"#94A3B8",lineHeight:1.5}}>{para.split(":").slice(1).join(":")}</span></div>;
    return <p key={i} style={{fontSize:13,color:"#E2E8F0",lineHeight:1.7,marginBottom:10}}>{para}</p>;
  });

  return(
    <div style={{maxWidth:430,margin:"0 auto",background:"#0F172A",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0F172A,#1E293B)",padding:"14px 16px",borderBottom:"1px solid rgba(255,255,255,.08)",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showSearch?10:0}}>
          <div><div style={{fontSize:11,color:"#64748B",textTransform:"uppercase",letterSpacing:1.5,marginBottom:1}}>Galactic Raider</div><div style={{fontSize:18,fontWeight:800,color:"#F8FAFC"}}>📖 Game Wiki</div></div>
          <button onClick={()=>{setShowSearch(s=>!s);setSearch("");}} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,padding:"8px 12px",color:"#94A3B8",fontWeight:700,fontSize:12,cursor:"pointer"}}>🔍 Search</button>
        </div>
        {showSearch&&<div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search wiki..." style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,padding:"10px 13px",color:"#F8FAFC",fontSize:13,outline:"none",fontFamily:"system-ui,sans-serif",boxSizing:"border-box"}}/>
          {searchResults.length>0&&<div style={{background:"#1E293B",borderRadius:11,border:"1px solid rgba(255,255,255,.1)",marginTop:6,overflow:"hidden"}}>
            {searchResults.map((r,i)=><div key={i} onClick={()=>{setCat(r.catId);setArticle(r.idx);setShowSearch(false);setSearch("");}} style={{padding:"10px 13px",borderBottom:i<searchResults.length-1?"1px solid rgba(255,255,255,.06)":"none",cursor:"pointer"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#F8FAFC"}}>{r.title}</div>
              <div style={{fontSize:10,color:"#64748B"}}>{r.catLabel}</div>
            </div>)}
          </div>}
        </div>}
      </div>

      {/* Category tabs */}
      <div style={{overflowX:"auto",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{display:"flex",gap:0,width:"max-content",padding:"4px 8px"}}>
          {WIKI.categories.map(c=><button key={c.id} onClick={()=>{setCat(c.id);setArticle(0);}} style={{padding:"8px 12px",borderRadius:8,border:"none",background:cat===c.id?"rgba(255,255,255,.1)":"transparent",color:cat===c.id?"#F8FAFC":"#64748B",fontWeight:cat===c.id?700:400,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",borderBottom:"2px solid "+(cat===c.id?colors[c.id]||"#4CAF50":"transparent")}}>{c.label}</button>)}
        </div>
      </div>

      <div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
        {/* Article list */}
        {articles.length>1&&<div style={{background:"rgba(255,255,255,.04)",borderRadius:12,border:"1px solid rgba(255,255,255,.06)",overflow:"hidden"}}>
          {articles.map((a,i)=><button key={i} onClick={()=>setArticle(i)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",border:"none",borderBottom:i<articles.length-1?"1px solid rgba(255,255,255,.05)":"none",background:article===i?"rgba(255,255,255,.08)":"transparent",color:article===i?"#F8FAFC":"#94A3B8",cursor:"pointer",textAlign:"left",fontFamily:"system-ui,sans-serif"}}>
            <span style={{fontSize:13,fontWeight:article===i?700:400}}>{a.title}</span>
            <span style={{fontSize:12,color:catColor}}>{article===i?"▼":"›"}</span>
          </button>)}
        </div>}

        {/* Article content */}
        {articles[article]&&<div style={{background:"rgba(255,255,255,.04)",borderRadius:14,padding:16,border:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,paddingBottom:12,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
            <div style={{width:36,height:36,borderRadius:10,background:catColor+"22",border:"1px solid "+catColor+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{currentCat?.icon}</div>
            <div><div style={{fontSize:10,color:catColor,textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:2}}>{currentCat?.label}</div><div style={{fontSize:16,fontWeight:800,color:"#F8FAFC",lineHeight:1.2}}>{articles[article].title}</div></div>
          </div>
          <div>{formatContent(articles[article].content)}</div>
        </div>}

        {/* Navigation */}
        <div style={{display:"flex",gap:8}}>
          {article>0&&<button onClick={()=>setArticle(a=>a-1)} style={{flex:1,background:"rgba(255,255,255,.06)",color:"#94A3B8",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>← Previous</button>}
          {article<articles.length-1&&<button onClick={()=>setArticle(a=>a+1)} style={{flex:2,background:catColor,color:"#fff",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Next Article →</button>}
        </div>

        {/* Bottom category pills */}
        <div style={{paddingTop:8}}>
          <div style={{fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Jump to category</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {WIKI.categories.map(c=><button key={c.id} onClick={()=>{setCat(c.id);setArticle(0);}} style={{padding:"6px 10px",borderRadius:20,border:"1px solid "+(cat===c.id?colors[c.id]||"#4CAF50":"rgba(255,255,255,.08)"),background:cat===c.id?"rgba(255,255,255,.08)":"transparent",color:cat===c.id?"#F8FAFC":"#64748B",fontWeight:600,fontSize:10,cursor:"pointer"}}>{c.icon} {c.label.split(" ").slice(1).join(" ")}</button>)}
          </div>
        </div>
      </div>
      <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
    </div>
  );
}
