import { createContext, useContext, useRef, useState, useCallback } from 'react';
import { EARTH_COMPANIES, CEO_DECISIONS, ETFS, IPOS, SOVEREIGN_FUNDS, TAX_ERAS, PLANETS_DATA, PE_BOUNDS, COMMODITIES } from '../constants';
import { cl, r2, fm } from '../utils';
import { GEO_EVENTS } from '../events';

const GameContext = createContext(null);

const PLANET_THRESHOLDS = {
  Mars: 5e9,
  Venus: 50e9,
  Jupiter: 200e9,
  Saturn: 1e12,
  Mercury: 10e12,
  Uranus: 50e12,
  Neptune: 100e12,
};

const MUSIC_PLAYLIST = [
  { id: 'music_oasis_of_sol', name: '🏜️ Oasis of Sol', desc: 'Serene desert trading vibes' },
  { id: 'music_quiet_capital', name: '🌆 The Quiet Capital', desc: 'Urban commerce ambience' },
  { id: 'music_nocturnal_raider_2', name: '🌙 Nocturnal Raider II', desc: 'Night trading intensity' },
  { id: 'music_nocturnal_raider_7', name: '🌙 Nocturnal Raider VII', desc: 'Deep night market pulse' },
  { id: 'music_deep_space', name: '🌌 Deep Space Solitude', desc: 'Cosmic meditative flow' },
  { id: 'music_planetary_oversight', name: '🪐 Planetary Oversight', desc: 'Orbital command presence' },
  { id: 'music_solar_drift', name: '☀️ Solar Drift', desc: 'Stellar long-term vision' },
];

const BADGE_DEFS = [
  {id:'millionaire', label:'Millionaire', desc:'Reach $1M net worth', ico:'💰'},
  {id:'decamillionaire', label:'Decamillionaire', desc:'Reach $10M net worth', ico:'💎'},
  {id:'centimillionaire', label:'Centimillionaire', desc:'Reach $100M net worth', ico:'🏆'},
  {id:'billionaire', label:'Billionaire', desc:'Reach $1B net worth', ico:'👑'},
  {id:'decabillionaire', label:'Decabillionaire', desc:'Reach $10B net worth', ico:'🌟'},
  {id:'centibillionaire', label:'Centibillionaire', desc:'Reach $100B net worth', ico:'⭐'},
  {id:'trillionaire', label:'Trillionaire', desc:'Reach $1T net worth', ico:'🌌'},
  {id:'first_trade', label:'First Trade', desc:'Execute your first trade', ico:'📈'},
  {id:'trade_50', label:'Active Trader', desc:'Execute 50 trades', ico:'⚡'},
  {id:'trade_100', label:'Trade Master', desc:'Execute 100 trades', ico:'🎯'},
  {id:'mars_unlocked', label:'Mars Colonist', desc:'Unlock Mars markets', ico:'🔴'},
  {id:'neptune_unlocked', label:'Neptune Pioneer', desc:'Unlock Neptune markets', ico:'💜'},
  {id:'first_donation', label:'Philanthropist', desc:'Make your first donation', ico:'🤲'},
  {id:'first_spin', label:'High Roller', desc:'Spin the Fortune Wheel', ico:'🎡'},
  {id:'ceo_first', label:'Board Member', desc:'Make your first board decision', ico:'👔'},
  {id:'loan_repaid', label:'Debt Free', desc:'Fully repay a loan', ico:'✅'},
];

const WEALTH_TIERS = [
  {threshold:1e6, label:'$1M'},
  {threshold:10e6, label:'$10M'},
  {threshold:100e6, label:'$100M'},
  {threshold:1e9, label:'$1B'},
  {threshold:10e9, label:'$10B'},
  {threshold:100e9, label:'$100B'},
  {threshold:1e12, label:'$1T'},
];

function buildInitialState() {
  return {
    turn: 1,
    eraIdx: 0,
    gdp: 2.5,
    // Wallets
    cashWallet: 100000,
    savingsWallet: 100000,
    tradingWallet: 800000,
    foundationOpen: false,
    foundationBalance: 0,
    foundationAutopilot: false, // false = safe 3% APR; true = invests balance, higher avg return, some volatility
    activeLoan: null,
    loanHistory: [],
    autoBuys: [],
    totalInterestPaid: 0,
    streak: 0,
    streakBonus: false,
    // Markets
    companies: EARTH_COMPANIES.map(c => ({ ...c, price: c.ip, pe: c.pe0, ch: 0, hist: [c.ip, c.ip] })),
    stockHoldings: {},
    avgCostBasis: {},
    companyOwnership: {},
    // CEO
    pendingDecisions: [],
    resolvedDecisions: [],
    ceoLog: [
      { turn:1, ticker:'SYSTEM', msg:'CEO Decision System online. Buy 10%+ in any company to unlock board access.', good:true },
    ],
    // Geopolitical events feed
    geoEvents: [
      { id:1, t:1, ico:'🌐', ti:'Capital Exchange Era Begins', bo:'Global markets open. Earth economy stable at 2.5% GDP growth. 8 planetary economies available for investment.', region:'Global', impact:'neutral' },
    ],
    // Planets
    planetWallets: { Earth:0, Mars:0, Venus:0, Jupiter:0, Saturn:0, Mercury:0, Uranus:0, Neptune:0 },
    planetHoldings: {},
    planetAvgCost: {},
    planetCompanies: Object.fromEntries(
      Object.entries(PLANETS_DATA).map(([k, p]) => [
        k,
        {
          gdp: p.gdp,
          stormActive: false,
          stormTurn: 0,
          cos: p.companies.map(c => ({ ...c, price: c.ip, pp: c.ip, ch: 0, hist: [c.ip, c.ip] })),
        }
      ])
    ),
    planetUnlocks: {
      Earth: true,
      Mars: false,
      Venus: false,
      Jupiter: false,
      Saturn: false,
      Mercury: false,
      Uranus: false,
      Neptune: false,
    },
    transferLog: [],
    // Crypto
    cryptoHoldings: {},
    cryptoPrices: {
      BTC:65000, ETH:3200, BNB:600, XRP:0.60, ADA:0.45,
      SOL:180, DOGE:0.35, AVAX:35, LTC:85, LINK:18,
      DOT:8, MATIC:0.90, TON:5.50, UNI:10,
      MRC:12.5, NTX:8888, VNS:2.5, JFS:45, SRZ:120, MCY:35
    },
    cryptoAvgCost: {},
    cryptoHist: {
      BTC:[65000], ETH:[3200], BNB:[600], XRP:[0.60], ADA:[0.45],
      SOL:[180], DOGE:[0.35], AVAX:[35], LTC:[85], LINK:[18],
      DOT:[8], MATIC:[0.90], TON:[5.50], UNI:[10],
      MRC:[12.5], NTX:[8888], VNS:[2.5], JFS:[45], SRZ:[120], MCY:[35]
    },
    // ETFs / IPOs / Funds
    etfs: ETFS.map(e => ({ ...e, price: e.ip, units: 0, avgCost: e.ip, hist: [e.ip, e.ip], ch: 0 })),
    ipoBookings: {},
    ipoListed: {},
    activeIPOs: [], // {id, turn, company, founder, sector, price, shares, oversubscriptionRate, allocation}
    ipoHistory: [], // {company, founder, turn, price, performance}
    lastIPOGenTurn: -500,
    lastBulletinTaxSnapshot: 0,
    lastBulletinTurn: 0,
    fundDeposits: Object.fromEntries(SOVEREIGN_FUNDS.map(f => [f.id, { deposit: 0, earned: 0 }])),
    // Bonds
    bondHoldings: [],
    // Commodities
    commodityHoldings: {},
    commodityAvgCost: {},
    commodityHist: Object.fromEntries(COMMODITIES.map(c => [c.id, [c.ip]])),
    // Preferences
    darkMode: true,
    language: 'en',
    musicTrack: 'music_oasis_of_sol',  // default track
    musicEnabled: true,
    showedOnboarding: false,  // first-time player tutorial
    // Philanthropy / Redemption
    totalDebt: 0,
    redeemPts: 0,
    spinTokens: 0,
    spinsUsed: 0,
    lastSpin: 0,
    totalDonated: 0,
    donCount: 0,
    phiBenefits: [],
    taxRelief: 0,
    donHistory: [],
    spinHistory: [],
    // News
    news: [
      { id:1, t:1, ico:'🌌', ti:'Galactic Raider — Capital Exchange', bo:'You start with $1,000,000. Grow it into a multi-billion empire. Unlock planets as your net worth grows.', g:true },
      { id:2, t:1, ico:'⚖️', ti:'Economic Governor Active', bo:'P/E bounds enforced. Prices anchored to fundamentals. All 8 rules running.', g:true },
    ],
    txLog: [
      { turn:1, type:'INIT', wallet:'ALL', amount:1000000, desc:'Starting capital: Cash $100K, Savings $100K, Trading $800K' },
    ],
    // Stats
    stats: {
      tradesTotal: 0,
      tradesWon: 0,
      tradesLost: 0,
      biggestWin: 0,
      biggestWinDesc: '',
      biggestLoss: 0,
      biggestLossDesc: '',
      peakNetWorth: 1000000,
      nwHistory: [[1, 1000000]],
      unlockLog: [],
      totalTaxPaid: 0,
      totalGSFIncome: 0,
      totalSavingsInterest: 0,
    },
    badges: [],
    playerName: 'Raider',
    playerAvatar: '🚀',
    // Earth FX positions
    fxRates: {
      EURUSD:1.0850, GBPUSD:1.2700, JPYUSD:0.006680, CHFUSD:1.1200,
      CADUSD:0.7400, AUDUSD:0.6500, CNYUSD:0.1380, MXNUSD:0.05900,
      INRUSD:0.01200, BRLUSD:0.2000, ZARUSD:0.05400, SGDUSD:0.7500,
    },
    fxHist: {
      EURUSD:[1.0850], GBPUSD:[1.2700], JPYUSD:[0.006680], CHFUSD:[1.1200],
      CADUSD:[0.7400], AUDUSD:[0.6500], CNYUSD:[0.1380], MXNUSD:[0.05900],
      INRUSD:[0.01200], BRLUSD:[0.2000], ZARUSD:[0.05400], SGDUSD:[0.7500],
    },
    fxPositions: [],  // [{id,pair,dir,entryRate,size,usdCost,turn}]
    fxPnlRealized: 0,
    shownMilestones: {},   // tier labels already celebrated — each milestone pops up only once
    pendingMilestone: null, // set when a new wealth tier is first reached; cleared when the popup is dismissed
    uiModalOpen: false,     // true while a trade modal is open — pauses auto-advance (price lock)
    navTarget: null, // cross-screen navigation intent {screen, tab, ticker, planet, id}
    // Founder Mode
    founderMode: {
      active: false,
      companyId: null,
      companyName: null,
      industry: null,  // 'tech', 'healthcare', 'energy', 'finance', 'retail'
      stage: 'setup',  // 'setup' -> 'bootstrapped' -> 'pre-ipo' -> 'public'
      foundersCapital: 0,   // fixed at founding — the basis for loan leverage caps, never grows
      currentCapital: 0,    // operating cash position — moves with profit/loss
      loans: [],
      revenue: 0,
      targetRevenue: 0,     // the bounded ceiling revenue is converging toward this turn
      expenses: 0,
      profitMargin: 0.15,
      sharesOutstanding: 1000000,
      founderShares: 1000000, // shares the founder personally holds (100% at founding)
      shareholderPrice: 100,
      ipoShares: 0,
      ipoPrice: 0,
      investorDemand: 0,
      ipoBook: [],          // [{name, demandPct}] — flavor: institutional interest shown before confirming
      demandTrend: 0,
      weatherResistance: 0.5,
      turnStarted: 0,
      decisions: [],
      stock: { price: 100, ch: 0, hist: [100, 100] },
      nwAtFoundation: 0,
      pendingOffer: null,   // {id, buyer, pricePerShare, totalValue, turn, expiresAtTurn}
    },
  };
}

const FOUNDER_MIN_CAPITAL = 10000000; // $10M minimum to start a company

const FOUNDER_INDUSTRY_PROFILES = {
  tech:       { weatherResistance: 0.4, revenueCeilingMult: 3.5, baseMargin: 0.25 },
  healthcare: { weatherResistance: 0.7, revenueCeilingMult: 2.2, baseMargin: 0.20 },
  energy:     { weatherResistance: 0.5, revenueCeilingMult: 2.5, baseMargin: 0.18 },
  finance:    { weatherResistance: 0.6, revenueCeilingMult: 2.8, baseMargin: 0.22 },
  retail:     { weatherResistance: 0.3, revenueCeilingMult: 1.8, baseMargin: 0.12 },
  utilities:  { weatherResistance: 0.8, revenueCeilingMult: 1.4, baseMargin: 0.15 },
};

// Diminishing-leverage curve: smaller companies can borrow a larger % of their
// founding capital; larger companies are capped tighter. Prevents the loan
// amount from ever compounding off itself (it's always pegged to the fixed
// foundersCapital, never to the ever-growing currentCapital).
function founderMaxLeverageRatio(foundersCapital) {
  const LO = { capital: 10e6, ratio: 0.50 };
  const HI = { capital: 100e6, ratio: 0.15 };
  if (foundersCapital <= LO.capital) return LO.ratio;
  if (foundersCapital >= HI.capital) return HI.ratio;
  const t = (Math.log(foundersCapital) - Math.log(LO.capital)) / (Math.log(HI.capital) - Math.log(LO.capital));
  return LO.ratio + (HI.ratio - LO.ratio) * t;
}

const FICTIONAL_INVESTORS = ['Nova Capital Partners','Meridian Growth Fund','Zenith Ventures','Apex Horizon Capital','Silverline Investments','Vantage Point Capital','Northstar Equity Group','Bluewave Asset Management'];
const FICTIONAL_ACQUIRERS = ['Orbital Holdings Group','Continuum Industries','Paragon Consolidated','Everstream Capital','Ironbridge Enterprises','Halcyon Ventures Group'];

export function GameProvider({ children }) {
  const S = useRef(buildInitialState());
  const [D, setD] = useState(() => ({ ...S.current }));
  const refresh = useCallback(() => setD({ ...S.current }), []);

  const logTx = useCallback((type, wallet, amount, desc) => {
    const s = S.current;
    s.txLog = [{ turn: s.turn, type, wallet, amount, desc },...s.txLog].slice(0, 200);
  }, []);

  const addNews = useCallback((ico, ti, bo, g = true) => {
    const s = S.current;
    s.news = [{ id: Math.random(), t: s.turn, ico, ti, bo, g },...s.news].slice(0, 80);
  }, []);

  const earnBadge = useCallback((id) => {
    const s = S.current;
    if (!s.badges.includes(id)) {
      s.badges = [...s.badges, id];
      const def = BADGE_DEFS.find(b => b.id === id);
      if (def) addNews(def.ico, 'Badge Earned: '+def.label, def.desc, true);
    }
  }, [addNews]);

  // ── ADVANCE TURN ─────────────────────────────────────────────
  const advanceTurn = useCallback(() => {
    const s = S.current;
    s.turn++;

    // Tax era rotation every 60 turns
    if (s.turn % 60 === 0) s.eraIdx = (s.eraIdx + 1) % 8;
    const era = TAX_ERAS[s.eraIdx];

    // GDP drift
    s.gdp = Math.round(cl(s.gdp + (Math.random() - 0.48) * 0.5, -3, 7) * 10) / 10;

    // Trigger CEO decisions at their designated turns
    CEO_DECISIONS.forEach(dec => {
      const alreadyPending = s.pendingDecisions.some(d => d.id === dec.id);
      const alreadyResolved = s.resolvedDecisions.some(d => d.id === dec.id);
      if (s.turn >= dec.turn && !alreadyPending && !alreadyResolved) {
        s.pendingDecisions = [...s.pendingDecisions, { ...dec }];
        addNews('👔', 'Board Decision: ' + dec.company, dec.headline + ' — visit Command Center to vote.', true);
      }
    });

    // Geopolitical events (~13% chance per turn) — 60+ events imported from events.js
    if (Math.random() < 0.13) {
      const ev = GEO_EVENTS[Math.floor(Math.random() * GEO_EVENTS.length)];
      const newEv = { id: Math.random(), t: s.turn, ...ev };
      s.geoEvents = [newEv, ...(s.geoEvents || [])].slice(0, 15);
      // Surface in the main news feed too so events are impossible to miss
      addNews(ev.ico || '🌐', 'WORLD: ' + ev.ti, ev.bo, ev.impact !== 'negative');
    }

    // Update Earth company prices with Governor enforcement
    s.companies = s.companies.map(c => {
      const eps = c.price / c.pe;
      const bnd = PE_BOUNDS[c.s] || { mn: 10, mx: 35 };
      let move = 1 + (Math.random() - 0.5) * 0.10 * c.b;
      // Post-IPO stabilization: for 30 turns after listing, moves are dampened and a
      // stock trading below its list price gets a gentle recovery drift — no cliff drops.
      if (c.listedTurn && s.turn - c.listedTurn < 30) {
        move = 1 + (Math.random() - 0.5) * 0.04;
        if (c.price < c.ip) move += 0.004;
      }
      let np = cl(r2(c.price * move), c.price * 0.90, c.price * 1.10);
      if (np / eps < bnd.mn) np = eps * bnd.mn;
      if (np / eps > bnd.mx) np = eps * bnd.mx;
      np = Math.max(0.50, r2(np));
      const ch = (np - c.price) / c.price;

      // Random company events (4% chance)
      if (Math.random() < 0.04) {
        const evts = [
          { ico:'💰', ti:'Earnings Beat', bo:c.n+' beat estimates. Revenue +12% YoY.', g:true, mult:1.04 },
          { ico:'📉', ti:'Earnings Miss', bo:c.n+' disappointed. Guidance cut.', g:false, mult:.96 },
          { ico:'📰', ti:'Analyst Upgrade', bo:c.n+' upgraded by '+(c.analysts?.[0]?.firm || 'a leading research desk')+'.', g:true, mult:1.02 },
          { ico:'🤝', ti:'Partnership', bo:c.n+' signs strategic partnership.', g:true, mult:1.03 },
        ];
        const ev = evts[Math.floor(Math.random() * evts.length)];
        np = r2(np * ev.mult);
        addNews(ev.ico, ev.ti + ': ' + c.t, ev.bo, ev.g);
      }

      return { ...c, pp: c.price, price: np, ch, hist: [...(c.hist || []).slice(-50), np] };
    });

    // Quarterly dividends (every 30 turns)
    if (s.turn % 30 === 0) {
      let totalDiv = 0;
      Object.entries(s.stockHoldings).forEach(([t, n]) => {
        const co = s.companies.find(x => x.t === t);
        if (co && n > 0) {
          const d = r2(co.price * (co.div / 100 / 4) * n * (1 - (era.divTax || 0.15)));
          if (d > 0) { s.savingsWallet = r2(s.savingsWallet + d); totalDiv += d; }
        }
      });
      if (totalDiv > 0) addNews('💰', 'Quarterly Dividends: $'+Math.round(totalDiv).toLocaleString(), 'Dividends credited to Savings Wallet after '+Math.round((era.divTax||.15)*100)+'% dividend tax.', true);
    }

    // Update planet companies
    Object.entries(s.planetCompanies).forEach(([pName, pState]) => {
      const pd = PLANETS_DATA[pName];
      if (!pd) return;
      // Jupiter storm chance
      let stormMult = 1;
      if (pd.stormRisk && !pState.stormActive && Math.random() < 0.005) {
        pState.stormActive = true;
        pState.stormTurn = s.turn;
        addNews('⚡', 'JUPITER STORM EVENT', 'Catastrophic storm hits Jupiter. Production −30%. MSC activates. BUY the dip.', false);
      }
      if (pState.stormActive) {
        stormMult = 0.70;
        if (s.turn - pState.stormTurn > 20) { pState.stormActive = false; stormMult = 1.15; }
      }

      pState.cos = pState.cos.map(c => {
        // Mean-reversion toward initial price + hard clamp — planet stocks previously had
        // neither and could drift to 38x or collapse to zero over long runs.
        const anchor = c.ip || c.price;
        const meanRevert = Math.pow(anchor / Math.max(0.01, c.price), 0.015);
        const move = (1 + (Math.random() - 0.5) * 0.12 * (c.b || 1.5) * stormMult) * meanRevert;
        const np = Math.max(anchor * 0.15, Math.min(anchor * 6, r2(c.price * move)));
        return { ...c, pp: c.price, price: np, ch: (np - c.price) / c.price, hist: [...(c.hist||[]).slice(-50), np] };
      });
      pState.gdp = Math.round(cl(pState.gdp + (Math.random() - 0.48) * 0.3, -5, 10) * 10) / 10;
    });

    // Crypto price update
    const CRYPTO_COINS_STORE = [
      {id:'BTC',vol:.12,ip:65000},{id:'ETH',vol:.16,ip:3200},{id:'BNB',vol:.18,ip:600},
      {id:'XRP',vol:.22,ip:.60},{id:'ADA',vol:.24,ip:.45},{id:'SOL',vol:.20,ip:180},
      {id:'DOGE',vol:.28,ip:.35},{id:'AVAX',vol:.25,ip:35},{id:'LTC',vol:.18,ip:85},
      {id:'LINK',vol:.22,ip:18},{id:'DOT',vol:.20,ip:8},{id:'MATIC',vol:.25,ip:.90},
      {id:'TON',vol:.20,ip:5.50},{id:'UNI',vol:.22,ip:10},
      {id:'MRC',vol:.35,ip:12.5},{id:'NTX',vol:.42,ip:8888},
      {id:'VNS',vol:.30,ip:2.5},{id:'JFS',vol:.38,ip:45},
      {id:'SRZ',vol:.45,ip:120},{id:'MCY',vol:.32,ip:35}
    ];
    if (!s.cryptoPrices) s.cryptoPrices = Object.fromEntries(CRYPTO_COINS_STORE.map(c=>[c.id,c.ip]));
    if (!s.cryptoHist) s.cryptoHist = Object.fromEntries(CRYPTO_COINS_STORE.map(c=>[c.id,[c.ip]]));
    CRYPTO_COINS_STORE.forEach(coin => {
      const prev = s.cryptoPrices[coin.id] || coin.ip;
      // Stronger reversion + tighter cap: high-vol coins were pinning at the old 25x ceiling
      const meanRevert = Math.pow(coin.ip / prev, 0.012);
      const move = (1 + (Math.random()-0.5)*coin.vol*1.3) * meanRevert;
      const next = Math.max(coin.ip * 0.05, Math.min(coin.ip * 12, r2(prev * move)));
      s.cryptoPrices[coin.id] = next;
      s.cryptoHist[coin.id] = [...(s.cryptoHist[coin.id]||[prev]).slice(-48), next];
    });

    // Commodity price movements
    if (!s.commodityHist) s.commodityHist = Object.fromEntries(COMMODITIES.map(c=>[c.id,[c.ip]]));
    if (!s.commodityHoldings) s.commodityHoldings = {};
    if (!s.commodityAvgCost) s.commodityAvgCost = {};
    COMMODITIES.forEach(com => {
      const hist = s.commodityHist[com.id] || [com.ip];
      const prev = hist[hist.length - 1] || com.ip;
      // Mean-reversion pulls price gently back toward its initial value, preventing runaway drift
      const meanRevert = Math.pow(com.ip / prev, 0.02);
      let move = (1 + (Math.random() - 0.5) * com.vol * 1.2) * meanRevert;
      // Gold/Silver safe-haven spike during negative geo events
      if ((com.id==='XAU'||com.id==='XAG') && s.geoEvents?.[0]?.impact==='negative') move *= 1 + Math.random()*0.05;
      // Oil geopolitical premium
      if ((com.id==='XWTI'||com.id==='XGAS') && s.geoEvents?.[0]?.impact==='negative') move *= 1 + Math.random()*0.04;
      // Lithium tracks Martian economy
      if ((com.id==='MLIT'||com.id==='XLIT') && s.planetCompanies?.Mars) {
        const mgdp = s.planetCompanies.Mars.gdp || 3.8;
        move *= 1 + (mgdp - 3.0) * 0.01;
      }
      // Jupiter storm wrecks hydrogen supply
      if (com.id==='JGAS' && s.planetCompanies?.Jupiter?.stormActive) move *= 0.55 + Math.random()*0.15;
      // Ryzolith increases in scarcity over time — kept small enough that mean-reversion
      // can push back; the old +15%/turn compounding pinned it at the 8x cap permanently
      if (com.id==='SRYZ' && s.turn > 200) move *= 1 + Math.min(0.012, (s.turn / 50000));
      // Deep Field Minerals extreme volatility
      if (com.id==='NFLD' || com.id==='NWIN') move *= 1 + (Math.random()-0.5)*0.15;
      // Clamp between 0.2× and 8× of initial price — prevents both zero-ing out and runaway spikes
      const next = Math.max(com.ip * 0.2, Math.min(com.ip * 8, r2(prev * move)));
      s.commodityHist[com.id] = [...hist.slice(-48), next];
    });

    // Earth FX rate fluctuation — small ±1.5% per turn with mean-reversion to initial
    const FX_IP = {
      EURUSD:1.0850,GBPUSD:1.2700,JPYUSD:0.006680,CHFUSD:1.1200,
      CADUSD:0.7400,AUDUSD:0.6500,CNYUSD:0.1380,MXNUSD:0.05900,
      INRUSD:0.01200,BRLUSD:0.2000,ZARUSD:0.05400,SGDUSD:0.7500,
    };
    if (!s.fxRates) s.fxRates = { ...FX_IP };
    if (!s.fxHist) s.fxHist = Object.fromEntries(Object.entries(FX_IP).map(([k,v])=>[k,[v]]));
    Object.keys(FX_IP).forEach(pair => {
      const prev = s.fxRates[pair] || FX_IP[pair];
      const ip = FX_IP[pair];
      const mr = Math.pow(ip / prev, 0.015);
      const move = (1 + (Math.random()-0.5)*0.03) * mr;
      const next = Math.max(ip*0.5, Math.min(ip*2.0, r2(prev * move)));
      s.fxRates[pair] = next;
      s.fxHist[pair] = [...(s.fxHist[pair]||[ip]).slice(-48), next];
    });

    // Planet currency rate fluctuation — small ±2% shift each turn
    Object.entries(PLANETS_DATA).forEach(([pName, pd]) => {
      const pState = s.planetCompanies[pName];
      if (pState) {
        const shift = 1 + (Math.random()-0.5)*0.04;
        pState.fxRate = r2((pState.fxRate || pd.rate) * shift);
        pState.fxRate = r2(Math.max(pd.rate*0.5, Math.min(pd.rate*1.5, pState.fxRate)));
      }
    });

    // Planet sovereign fund interest (daily compounding)
    Object.entries(s.fundDeposits).forEach(([fid, fd]) => {
      if (fd.deposit > 0) {
        const fund = SOVEREIGN_FUNDS.find(f => f.id === fid);
        if (fund) {
          const earned = r2(fd.deposit * (fund.rate / 100 / 365));
          fd.earned = r2(fd.earned + earned);
          s.tradingWallet = r2(s.tradingWallet + earned);
          s.stats.totalGSFIncome = r2((s.stats.totalGSFIncome||0) + earned);
        }
      }
    });

    // ETF price movement — mean-reverting and clamped so funds can't drift unbounded
    s.etfs = s.etfs.map(e => {
      const anchor = e.ip || e.price;
      const meanRevert = Math.pow(anchor / Math.max(0.01, e.price), 0.02);
      const move = (1 + (Math.random() - 0.5) * 0.06) * meanRevert;
      const np = Math.max(anchor * 0.4, Math.min(anchor * 4, r2(e.price * move)));
      return { ...e, pp: e.price, price: np, ch: (np - e.price) / e.price, hist: [...(e.hist||[]).slice(-50), np] };
    });

    // ETF dividends
    if (s.turn % 30 === 0) {
      s.etfs.forEach(e => {
        if (e.units > 0) {
          const d = r2(e.price * (e.div / 100 / 4) * e.units);
          if (d > 0) s.tradingWallet = r2(s.tradingWallet + d);
        }
      });
    }

    // IPO listings
    IPOS.forEach(ipo => {
      if (s.turn === ipo.opens && !s.ipoListed[ipo.id]) {
        const midpoint = (ipo.priceRange[0] + ipo.priceRange[1]) / 2;
        const listPrice = r2(midpoint * (ipo.oversubscribed > 3 ? 1.15 : ipo.oversubscribed > 1 ? 1.05 : 0.95));
        s.ipoListed[ipo.id] = { listPrice, currentPrice: listPrice };
        const booked = s.ipoBookings[ipo.id] || 0;
        if (booked > 0) {
          const allocation = Math.floor(booked * (ipo.oversubscribed > 1 ? 0.85 : 1));
          const unallocated = booked - allocation;
          if (unallocated > 0) s.tradingWallet = r2(s.tradingWallet + unallocated * midpoint);
          s.stockHoldings[ipo.id] = (s.stockHoldings[ipo.id]||0) + allocation;
          s.avgCostBasis[ipo.id] = midpoint;
          if (!s.companies.find(c=>c.t===ipo.id)) {
            s.companies.push({ t:ipo.id, n:ipo.n, s:ipo.sector||'Technology', price:listPrice, pe:18, ch:0, hist:[listPrice,listPrice], div:0.5, b:1.5, yr:2020, emp:5000, hq:ipo.planet||'Earth', ip:listPrice, pe0:18,
              // IPO analyst data uses `view`; company UI expects `rating` — map it across
              analysts:(ipo.analysts||[]).map(a => ({ firm:a.firm, rating:a.view||a.rating||'HOLD', target:a.target, note:a.note })),
              founder:ipo.founder||'Founder', ceo:ipo.founder||'Founder',
              ceoProfile:{ rep:75, tenure:0, style:'Founder-led', track:'Newly public' },
              origin:ipo.desc||'IPO listing.', ops:ipo.desc||'Newly listed public company.',
              listedTurn:s.turn });
          }
          addNews('🚀', 'IPO LISTED: '+ipo.n, ipo.n+' listed at $'+listPrice.toFixed(2)+'. Your '+allocation.toLocaleString()+' shares allocated at $'+midpoint.toFixed(2)+'. Now tradeable in Markets.', true);
        } else {
          addNews('📋', 'IPO LISTED: '+ipo.n, ipo.n+' opened at $'+listPrice.toFixed(2)+'. You had no booking.', true);
        }
      }
    });

    // ── FOUNDER MODE ─────────────────────────────────────────────
    if (s.founderMode.active && s.founderMode.stage !== 'setup') {
      const fm = s.founderMode;
      const profile = FOUNDER_INDUSTRY_PROFILES[fm.industry] || FOUNDER_INDUSTRY_PROFILES.tech;

      // Weather impact on demand (GDP-based)
      const weatherImpact = (s.gdp - 2.5) / 5;  // -1 to 1 scale based on GDP
      const resistanceMultiplier = 1 + (weatherImpact * (1 - fm.weatherResistance));

      // Demand trend evolution (S-curve from decision trajectory + economic weather)
      fm.demandTrend = cl(fm.demandTrend + (Math.random() - 0.5) * 0.05, -0.8, 0.8);
      const demandMultiplier = cl(1 + fm.demandTrend * resistanceMultiplier, 0.2, 2.2);

      // Revenue is bounded by a ceiling set by the fixed founders' capital
      // (never by the ever-growing currentCapital) and converges toward that
      // ceiling gradually — no runaway compounding feedback loop.
      fm.targetRevenue = r2(fm.foundersCapital * 0.02 * profile.revenueCeilingMult * demandMultiplier);
      fm.revenue = r2(fm.revenue + (fm.targetRevenue - fm.revenue) * 0.08);
      fm.profitMargin = profile.baseMargin;
      fm.expenses = r2(fm.revenue * (1 - profile.baseMargin));
      const profit = r2(fm.revenue - fm.expenses);
      fm.currentCapital = r2(fm.currentCapital + profit);

      // Stock price movement (P/E multiple based on growth and profitability)
      const peMultiple = fm.demandTrend > 0 ? 18 : 12;
      const eps = fm.revenue / fm.sharesOutstanding;
      const newSharePrice = r2(eps * peMultiple);
      fm.stock.ch = (newSharePrice - fm.stock.price) / fm.stock.price;
      fm.stock.price = Math.max(1, newSharePrice);
      fm.stock.hist = [...(fm.stock.hist || []).slice(-50), fm.stock.price];

      // Loan interest accrual
      fm.loans = fm.loans.map(loan => {
        const newOutstanding = r2(loan.outstanding + r2(loan.outstanding * (loan.rate / 365)));
        const monthlyPayment = r2(loan.monthlyPayment || loan.outstanding / loan.termMonths);
        const newRemaining = Math.max(0, newOutstanding - monthlyPayment);
        return { ...loan, outstanding: newRemaining, turnsRemaining: loan.turnsRemaining - 1 };
      }).filter(loan => loan.outstanding > 0);

      // Acquisition tender offers — a rival occasionally wants to buy the
      // company outright. The player can accept (cash out, ends Founder Mode)
      // or decline (keep growing). Requires the company to show real growth
      // first, and only one offer is live at a time.
      if (fm.pendingOffer && s.turn > fm.pendingOffer.expiresAtTurn) {
        addNews('📉', 'Offer Expired', `The acquisition offer for ${fm.companyName} from ${fm.pendingOffer.buyer} has expired.`, false);
        fm.pendingOffer = null;
      }
      const grownEnough = fm.currentCapital > fm.foundersCapital * 1.5;
      if (!fm.pendingOffer && grownEnough && Math.random() < (fm.demandTrend > 0.3 ? 0.006 : 0.002)) {
        const impliedSharePrice = fm.stage === 'public' ? fm.stock.price : r2(fm.currentCapital / fm.sharesOutstanding);
        const premium = 1.2 + Math.random() * 0.4;
        const pricePerShare = r2(impliedSharePrice * premium);
        const totalValue = r2(pricePerShare * fm.founderShares);
        fm.pendingOffer = {
          id: Math.random().toString(36).slice(2),
          buyer: FICTIONAL_ACQUIRERS[Math.floor(Math.random() * FICTIONAL_ACQUIRERS.length)],
          pricePerShare, totalValue, turn: s.turn, expiresAtTurn: s.turn + 20,
        };
        addNews('💼', 'Acquisition Offer', `${fm.pendingOffer.buyer} offers $${totalValue.toLocaleString()} (${premium.toFixed(2)}x premium) to acquire ${fm.companyName}. Respond within 20 turns.`, true);
      }
    }

    // Foundation maintenance charge and autopilot returns are handled below
    // alongside the wallet-interest block.

    // Savings wallet interest
    if (s.savingsWallet > 0) {
      const int = r2(s.savingsWallet * 0.02 / 365);
      s.savingsWallet = r2(s.savingsWallet + int);
      s.stats.totalSavingsInterest = r2((s.stats.totalSavingsInterest||0) + int);
    }
    if (s.foundationOpen && s.foundationBalance > 0) {
      if (s.foundationAutopilot) {
        // Autopilot invests the endowment in a diversified basket: higher
        // average return than the safe 3% APR, but with real volatility —
        // some turns lose money, unlike the guaranteed manual rate.
        const dailyMean = 0.09 / 365;
        const dailyVol = 0.4 / 365;
        const dailyReturn = dailyMean + (Math.random() - 0.5) * 2 * dailyVol;
        s.foundationBalance = r2(Math.max(0, s.foundationBalance * (1 + dailyReturn)));
      } else {
        const growth = r2(s.foundationBalance * 0.03 / 365);
        s.foundationBalance = r2(s.foundationBalance + growth);
      }
      // Maintenance charge: 5% every 300 turns — only ever charged while the
      // foundation actually holds a balance; an empty foundation is never billed.
      if (s.turn % 300 === 0 && s.foundationBalance > 0) {
        const maintenance = r2(s.foundationBalance * 0.05);
        s.foundationBalance = r2(s.foundationBalance - maintenance);
        logTx('FOUNDATION_MAINT', 'Foundation', -maintenance, 'Quarterly maintenance fee (5% of balance)');
      }
    }

    // Quarterly tax bulletin — every 300 turns, summarize taxes collected
    // since the last bulletin as a flavor news item.
    if (s.turn % 300 === 0 && s.turn > 0 && s.turn !== s.lastBulletinTurn) {
      const collected = r2((s.stats.totalTaxPaid || 0) - (s.lastBulletinTaxSnapshot || 0));
      s.lastBulletinTaxSnapshot = s.stats.totalTaxPaid || 0;
      s.lastBulletinTurn = s.turn;
      if (collected > 0) {
        const causes = ['infrastructure modernization', 'environmental restoration', 'public healthcare expansion', 'colony development grants', 'education initiatives', 'planetary defense systems'];
        const pick = causes[Math.floor(Math.random() * causes.length)];
        addNews('📜', 'Quarterly Treasury Bulletin', `Over the last 300 turns, $${collected.toLocaleString()} in capital gains tax was collected and allocated toward ${pick}.`, false);
      }
    }

    // Loan interest
    if (s.activeLoan) {
      const int = r2(s.activeLoan.outstanding * (s.activeLoan.rate / 365));
      s.activeLoan.outstanding = r2(s.activeLoan.outstanding + int);
      if (s.turn % 30 === 0) {
        const payment = Math.min(s.tradingWallet, int * 30);
        s.tradingWallet = r2(s.tradingWallet - payment);
        s.totalInterestPaid = r2((s.totalInterestPaid||0) + payment);
      }
    }

    // Auto-buys
    if (s.autoBuys.length > 0 && s.turn % 5 === 0) {
      s.autoBuys.forEach(ab => {
        if (s.tradingWallet >= ab.amount) {
          s.tradingWallet = r2(s.tradingWallet - ab.amount);
        }
      });
    }

    // Philanthropy decay
    s.phiBenefits = (s.phiBenefits || []).map(b => ({ ...b, rem: b.rem - 1 })).filter(b => b.rem > 0);
    s.taxRelief = Math.min(0.75, s.phiBenefits.reduce((x, b) => x + b.rate, 0));

    // Bond maturity payouts
    const maturingBonds = (s.bondHoldings||[]).filter(b => b.purchaseTurn + b.maturity <= s.turn);
    const remainingBonds = (s.bondHoldings||[]).filter(b => b.purchaseTurn + b.maturity > s.turn);
    maturingBonds.forEach(b => {
      const totalYield = r2(b.principal * (b.yield / 100) * (b.maturity / 365));
      const payout = r2(b.principal + totalYield);
      s.savingsWallet = r2(s.savingsWallet + payout);
      addNews('🏦', 'Bond Matured: '+b.n, 'Principal '+b.principal.toLocaleString()+' + yield '+totalYield.toLocaleString()+' = $'+payout.toLocaleString()+' credited to Savings.', true);
    });
    s.bondHoldings = remainingBonds;

    // Streak
    s.streak = Math.min(s.streak + 1, 7);
    if (s.streak >= 7 && !s.streakBonus) {
      s.streakBonus = true;
      s.spinTokens = (s.spinTokens || 0) + 1;
      addNews('🎯', '7-Day Login Streak!', '10% debt forgiveness + 1 free Wheel spin token awarded.', true);
      s.stats.unlockLog = [...(s.stats.unlockLog||[]), {turn:s.turn, desc:'7-day streak — spin token awarded'}];
    }

    // Calculate total portfolio for stats
    const stockVal = Object.entries(s.stockHoldings||{}).reduce((x,[t,n]) => {
      const co = s.companies.find(c => c.t === t); return x + (co ? co.price * n : 0);
    }, 0);
    const etfVal = (s.etfs||[]).reduce((x,e) => x + e.price * (e.units||0), 0);
    const fundVal = Object.values(s.fundDeposits||{}).reduce((x,f) => x + (f.deposit||0), 0);
    const walletVal = (s.cashWallet||0) + (s.savingsWallet||0) + (s.tradingWallet||0) + (s.foundationBalance||0);
    const planetVal = Object.entries(s.planetHoldings||{}).reduce((x,[key,n]) => {
      const parts = key.split('_'); const pName = parts[0]; const ticker = parts.slice(1).join('_');
      const pd = PLANETS_DATA[pName]; const ps = s.planetCompanies?.[pName];
      const co = ps?.cos?.find(c => c.t === ticker);
      return x + (co && pd ? co.price * pd.rate * n : 0);
    }, 0);
    const bondVal = (s.bondHoldings||[]).reduce((x,b) => x + b.principal, 0);
    const cryptoVal = Object.entries(s.cryptoHoldings||{}).reduce((x,[id,qty]) => {
      return x + qty * (s.cryptoPrices?.[id]||0);
    }, 0);
    const commVal = Object.entries(s.commodityHoldings||{}).reduce((x,[id,qty]) => {
      const hist = s.commodityHist?.[id];
      const price = hist && hist.length > 0 ? hist[hist.length-1] : (COMMODITIES.find(c=>c.id===id)?.ip||0);
      return x + qty * price;
    }, 0);
    const totalPortfolio = walletVal + stockVal + etfVal + fundVal + planetVal + bondVal + cryptoVal + commVal;

    // Update peak NW
    if (totalPortfolio > (s.stats.peakNetWorth||0)) {
      s.stats.peakNetWorth = totalPortfolio;
    }

    // NW history
    s.stats.nwHistory = [...(s.stats.nwHistory||[]), [s.turn, totalPortfolio]].slice(-500);

    // Planet unlock checks
    Object.entries(PLANET_THRESHOLDS).forEach(([planet, threshold]) => {
      if (totalPortfolio >= threshold && !s.planetUnlocks[planet]) {
        s.planetUnlocks[planet] = true;
        addNews('🌌', planet+' UNLOCKED!', 'Net worth '+totalPortfolio.toLocaleString()+' reached '+threshold.toLocaleString()+'. '+planet+' markets are now open!', true);
        s.stats.unlockLog = [...(s.stats.unlockLog||[]), {turn:s.turn, desc:planet+' markets unlocked'}];
        if (planet === 'Mars') earnBadge('mars_unlocked');
        if (planet === 'Neptune') earnBadge('neptune_unlocked');
      }
    });

    // Wealth tier spin token bonuses + one-time milestone celebration popup
    if (!s.shownMilestones) s.shownMilestones = {};
    WEALTH_TIERS.forEach(tier => {
      if (totalPortfolio >= tier.threshold && !s.shownMilestones[tier.label]) {
        s.shownMilestones[tier.label] = true;
        s.spinTokens = (s.spinTokens||0) + 1;
        // Queue a celebratory popup — only the highest newly-reached tier this turn will be shown
        if (!s.pendingMilestone || tier.threshold > s.pendingMilestone.threshold) {
          s.pendingMilestone = { label: tier.label, threshold: tier.threshold };
        }
        addNews('💰', 'Wealth Milestone: '+tier.label+'!', 'Net worth crossed '+tier.label+'. +1 spin token awarded!', true);
        s.stats.unlockLog = [...(s.stats.unlockLog||[]), {turn:s.turn, desc:'Crossed '+tier.label+' milestone'}];
      }
    });

    // Trades milestone spin tokens (50, 100, 150...)
    const trades = s.stats.tradesTotal||0;
    if (trades > 0 && trades % 50 === 0) {
      const key = '_tradesMilestone'+trades;
      if (!s[key]) {
        s[key] = true;
        s.spinTokens = (s.spinTokens||0) + 1;
        addNews('⚡', trades+' Trades Milestone!', 'You have executed '+trades+' trades. +1 spin token!', true);
      }
    }

    // Badge checks based on NW
    const nwBadges = [
      [1e6, 'millionaire'], [10e6, 'decamillionaire'], [100e6, 'centimillionaire'],
      [1e9, 'billionaire'], [10e9, 'decabillionaire'], [100e9, 'centibillionaire'], [1e12, 'trillionaire'],
    ];
    nwBadges.forEach(([thresh, bid]) => {
      if (totalPortfolio >= thresh) earnBadge(bid);
    });

    // Trade badges
    if ((s.stats.tradesTotal||0) >= 1) earnBadge('first_trade');
    if ((s.stats.tradesTotal||0) >= 50) earnBadge('trade_50');
    if ((s.stats.tradesTotal||0) >= 100) earnBadge('trade_100');
    if ((s.donCount||0) >= 1) earnBadge('first_donation');

    // Auto-save every 10 turns
    if (s.turn % 10 === 0) {
      try {
        localStorage.setItem('CC_autosave', JSON.stringify(s));
      } catch(e) {/* ignore */}
    }

    refresh();
  }, [refresh, addNews, earnBadge]);

  // ── STOCK TRADING ─────────────────────────────────────────────
  const buyStock = useCallback((ticker, qty) => {
    const s = S.current;
    const co = s.companies.find(c => c.t === ticker);
    if (!co) return 'Company not found';
    const cost = r2(qty * co.price);
    if (cost > s.tradingWallet) return 'Insufficient Trading Wallet funds';
    const prev = s.stockHoldings[ticker] || 0;
    s.stockHoldings[ticker] = prev + qty;
    s.avgCostBasis[ticker] = r2(((s.avgCostBasis[ticker] || co.price) * prev + cost) / s.stockHoldings[ticker]);
    s.tradingWallet = r2(s.tradingWallet - cost);

    const TOTAL = { SLKT:1200000000,MRDB:800000000,FRMN:600000000,TNPT:900000000,MDCR:400000000,UTLS:300000000,TLCM:550000000,RLST:250000000,EMTS:180000000,AGRO:500000000 };
    const totalShares = ticker === s.founderMode.companyId ? s.founderMode.sharesOutstanding : (TOTAL[ticker] || 500000000);
    s.companyOwnership[ticker] = Math.round((s.stockHoldings[ticker] / totalShares) * 10000) / 100;

    const pct = s.companyOwnership[ticker];
    if (pct >= 50 && (s.companyOwnership[ticker] - qty / totalShares * 100) < 50)
      addNews('👑', 'MAJORITY CONTROL: '+ticker, 'You own '+pct.toFixed(2)+'% of '+co.n+'. You can now replace the CEO.', true);
    else if (pct >= 25 && !s._board25?.[ticker])
      { s._board25 = s._board25 || {}; s._board25[ticker] = true; addNews('🎯', 'SIGNIFICANT CONTROL: '+ticker, 'You own '+pct.toFixed(2)+'% of '+co.n+'. You can propose strategy.', true); }
    else if (pct >= 10 && !s._board10?.[ticker])
      { s._board10 = s._board10 || {}; s._board10[ticker] = true; addNews('🏛️', 'BOARD SEAT: '+ticker, 'You own '+pct.toFixed(2)+'% of '+co.n+'. You can vote on dividends.', true); }

    s.stats.tradesTotal = (s.stats.tradesTotal||0) + 1;

    // Badge for first trade
    if (s.stats.tradesTotal === 1) earnBadge('first_trade');
    if (s.stats.tradesTotal >= 50) earnBadge('trade_50');
    if (s.stats.tradesTotal >= 100) earnBadge('trade_100');

    logTx('BUY', 'Trading', -cost, 'Bought '+qty.toLocaleString()+' '+ticker+' @ $'+co.price.toFixed(2));
    refresh();
    return null;
  }, [refresh, logTx, addNews, earnBadge]);

  const sellStock = useCallback((ticker, qty) => {
    const s = S.current;
    const co = s.companies.find(c => c.t === ticker);
    if (!co) return 'Company not found';
    const held = s.stockHoldings[ticker] || 0;
    if (qty > held) return 'Only '+held+' shares held';
    const proc = r2(qty * co.price);
    const costBasis = r2((s.avgCostBasis[ticker] || co.price) * qty);
    const profit = Math.max(0, (co.price - (s.avgCostBasis[ticker] || co.price)) * qty);
    const era = TAX_ERAS[s.eraIdx];
    const cgt = r2(profit * (era.cgt || 0.20) * (1 - (s.taxRelief || 0)));
    s.tradingWallet = r2(s.tradingWallet + proc - cgt);
    s.stockHoldings[ticker] = held - qty;
    if (!s.stockHoldings[ticker]) delete s.stockHoldings[ticker];
    const TOTAL = { SLKT:1200000000,MRDB:800000000,FRMN:600000000,TNPT:900000000,MDCR:400000000 };
    const totalShares = ticker === s.founderMode.companyId ? s.founderMode.sharesOutstanding : (TOTAL[ticker] || 500000000);
    s.companyOwnership[ticker] = Math.round(((s.stockHoldings[ticker]||0) / totalShares) * 10000) / 100;

    // Stats tracking
    s.stats.tradesTotal = (s.stats.tradesTotal||0) + 1;
    s.stats.totalTaxPaid = r2((s.stats.totalTaxPaid||0) + cgt);
    const net = r2(proc - cgt - costBasis);
    if (net > 0) {
      s.stats.tradesWon = (s.stats.tradesWon||0) + 1;
      if (net > (s.stats.biggestWin||0)) {
        s.stats.biggestWin = net;
        s.stats.biggestWinDesc = 'Sold '+ticker+' for +$'+net.toFixed(2);
      }
    } else {
      s.stats.tradesLost = (s.stats.tradesLost||0) + 1;
      if (Math.abs(net) > (s.stats.biggestLoss||0)) {
        s.stats.biggestLoss = Math.abs(net);
        s.stats.biggestLossDesc = 'Sold '+ticker+' for -$'+Math.abs(net).toFixed(2);
      }
    }

    if (s.stats.tradesTotal >= 50) earnBadge('trade_50');
    if (s.stats.tradesTotal >= 100) earnBadge('trade_100');

    logTx('SELL', 'Trading', proc - cgt, 'Sold '+qty.toLocaleString()+' '+ticker+' · CGT: $'+cgt.toFixed(2)+' · Net: $'+(proc-cgt).toFixed(2));
    refresh();
    return null;
  }, [refresh, logTx, earnBadge]);

  // ── WALLET TRANSFERS ─────────────────────────────────────────
  const transfer = useCallback((dir, pct) => {
    const s = S.current;
    const map = {
      C2T: { from:'cashWallet',    to:'tradingWallet'  },
      T2C: { from:'tradingWallet', to:'cashWallet'     },
      C2S: { from:'cashWallet',    to:'savingsWallet'  },
      S2C: { from:'savingsWallet', to:'cashWallet'     },
      T2S: { from:'tradingWallet', to:'savingsWallet'  },
      S2T: { from:'savingsWallet', to:'tradingWallet'  },
    };
    const d = map[dir];
    if (!d) return;
    const srcBal = s[d.from] || 0;
    const max = d.from === 'savingsWallet' ? Math.max(0, srcBal - 10000) : srcBal;
    const amt = r2(max * pct / 100);
    if (amt <= 0) return;
    s[d.from] = r2(s[d.from] - amt);
    s[d.to]   = r2(s[d.to]   + amt);
    logTx('TRANSFER', d.from+'→'+d.to, amt, pct+'% transfer: $'+amt.toFixed(2));
    refresh();
  }, [refresh, logTx]);

  const transferByAmount = useCallback((dir, amount) => {
    const s = S.current;
    const map = {
      C2T:{from:'cashWallet',to:'tradingWallet'},
      T2C:{from:'tradingWallet',to:'cashWallet'},
      C2S:{from:'cashWallet',to:'savingsWallet'},
      S2C:{from:'savingsWallet',to:'cashWallet'},
      T2S:{from:'tradingWallet',to:'savingsWallet'},
      S2T:{from:'savingsWallet',to:'tradingWallet'},
    };
    const d = map[dir];
    if (!d) return;
    const available = s[d.from] || 0;
    const amt = Math.min(r2(Math.abs(amount)), available);
    if (amt <= 0) return;
    s[d.from] = r2(s[d.from] - amt);
    s[d.to] = r2(s[d.to] + amt);
    logTx('TRANSFER', d.from+'→'+d.to, amt, 'Transfer $'+amt.toFixed(2));
    refresh();
  }, [refresh, logTx]);

  // ── FOUNDATION ───────────────────────────────────────────────
  const openFoundation = useCallback(() => {
    const s = S.current;
    const ENDOWMENT = 500000000; // $500M
    if (s.tradingWallet < ENDOWMENT) return 'Need $500M in Trading Wallet';
    const ACTIVATION_FEE = r2(ENDOWMENT * 0.80); // 80% charged as activation cost
    const PRINCIPAL = r2(ENDOWMENT * 0.20); // 20% seeded into foundation
    s.tradingWallet = r2(s.tradingWallet - ENDOWMENT);
    s.foundationOpen = true;
    s.foundationBalance = r2((s.foundationBalance || 0) + PRINCIPAL);
    logTx('FOUNDATION', 'Trading', -ENDOWMENT, 'Foundation activated: $'+ACTIVATION_FEE.toLocaleString()+' fee, $'+PRINCIPAL.toLocaleString()+' principal. 3% APR growth + 5% quarterly maintenance.');
    addNews('⚖️ Foundation established', 'Your foundation is now active. Tax relief up to 75% on capital gains. Quarterly 5% maintenance fee applies.');
    refresh();
    return null;
  }, [refresh, logTx, addNews]);

  // ── LOANS ────────────────────────────────────────────────────
  const takeLoan = useCallback((tier) => {
    const s = S.current;
    if (s.activeLoan) return 'Repay existing loan first';
    const nw = s.cashWallet + s.savingsWallet + s.tradingWallet;
    if (tier.tier >= 4 && nw < 500000) return 'Need $500K+ net worth';
    if (tier.tier >= 5 && nw < 5000000) return 'Need $5M+ net worth';
    s.tradingWallet = r2(s.tradingWallet + tier.max);
    s.activeLoan = { tier, amount: tier.max, outstanding: tier.max, rate: tier.rate, taken: s.turn, accruedInterest: 0 };
    s.totalDebt = r2((s.totalDebt || 0) + tier.max);
    logTx('LOAN', 'Trading', tier.max, tier.label+' $'+tier.max.toLocaleString()+' @ '+Math.round(tier.rate*100)+'% APR');
    refresh();
    return null;
  }, [refresh, logTx]);

  const repayLoan = useCallback((amount) => {
    const s = S.current;
    if (!s.activeLoan) return 'No active loan';
    if (amount <= 0) return 'Invalid amount';
    if (amount > s.tradingWallet) return 'Insufficient Trading Wallet balance ($'+s.tradingWallet.toFixed(2)+' available)';
    s.tradingWallet = r2(s.tradingWallet - amount);
    s.activeLoan.outstanding = r2(s.activeLoan.outstanding - amount);
    s.totalDebt = Math.max(0, r2(s.totalDebt - amount));
    if (s.activeLoan.outstanding <= 0) {
      s.loanHistory = [{ ...s.activeLoan, repaid: true, repaidTurn: s.turn }, ...s.loanHistory].slice(0, 10);
      s.activeLoan = null;
      earnBadge('loan_repaid');
    }
    logTx('REPAY', 'Trading', -amount, 'Loan repayment: $'+amount.toFixed(2));
    refresh();
  }, [refresh, logTx, earnBadge]);

  // ── CEO DECISIONS ────────────────────────────────────────────
  const resolveDecision = useCallback((decId, optIdx) => {
    const s = S.current;
    const dec = s.pendingDecisions.find(d => d.id === decId);
    if (!dec) return;
    const opt = dec.opts[optIdx];
    const co = s.companies.find(c => c.t === dec.ticker);
    if (co) {
      co.price = Math.max(0.50, r2(co.price * (1 + opt.priceImp)));
      if (co.ceoProfile) co.ceoProfile.rep = cl(co.ceoProfile.rep + opt.repImp, 0, 100);
    }
    s.pendingDecisions = s.pendingDecisions.filter(d => d.id !== decId);
    s.resolvedDecisions = [{ ...dec, chosen: opt, auto: false, resolvedTurn: s.turn }, ...s.resolvedDecisions].slice(0, 20);
    s.ceoLog.unshift({ turn: s.turn, ticker: dec.ticker, msg: 'YOU DECIDED: '+opt.l+' · Price impact: '+(opt.priceImp>=0?'+':'')+Math.round(opt.priceImp*100)+'%', good: opt.good });
    addNews('👔', 'CEO Decision: '+dec.company, opt.l+' · '+opt.detail, opt.good);
    earnBadge('ceo_first');
    refresh();
  }, [refresh, addNews, earnBadge]);

  // ── PLANET TRADING ───────────────────────────────────────────
  const buyPlanetStock = useCallback((planet, ticker, qty) => {
    const s = S.current;
    if (!s.planetUnlocks[planet]) return planet+' is not unlocked yet';
    const ps = s.planetCompanies[planet];
    if (!ps) return 'Planet not found';
    const co = ps.cos.find(c => c.t === ticker);
    if (!co) return 'Company not found';
    const pd = PLANETS_DATA[planet];
    const costLocal = r2(qty * co.price);
    const costUSD = r2(costLocal * pd.rate);
    if (costUSD > s.tradingWallet) return 'Insufficient funds';
    s.tradingWallet = r2(s.tradingWallet - costUSD);
    const key = planet + '_' + ticker;
    s.planetHoldings[key] = (s.planetHoldings[key] || 0) + qty;
    s.planetAvgCost[key] = r2(((s.planetAvgCost[key]||co.price)*((s.planetHoldings[key]||0)-qty)+costLocal)/s.planetHoldings[key]);

    s.stats.tradesTotal = (s.stats.tradesTotal||0) + 1;
    if (s.stats.tradesTotal === 1) earnBadge('first_trade');
    if (s.stats.tradesTotal >= 50) earnBadge('trade_50');
    if (s.stats.tradesTotal >= 100) earnBadge('trade_100');

    logTx('BUY_PLANET', 'Trading', -costUSD, 'Bought '+qty.toLocaleString()+' '+ticker+' on '+planet+' @ '+pd.currency+' '+co.price.toFixed(2)+' (~$'+costUSD.toFixed(2)+')');
    refresh();
    return null;
  }, [refresh, logTx, earnBadge]);

  const sellPlanetStock = useCallback((planet, ticker, qty) => {
    const s = S.current;
    const ps = s.planetCompanies[planet];
    const co = ps?.cos.find(c => c.t === ticker);
    if (!co) return;
    const pd = PLANETS_DATA[planet];
    const key = planet + '_' + ticker;
    const held = s.planetHoldings[key] || 0;
    if (qty > held) return;
    const procLocal = r2(qty * co.price);
    const procUSD = r2(procLocal * pd.rate);
    const profit = Math.max(0, (co.price - (s.planetAvgCost[key]||co.price)) * qty) * pd.rate;
    const era = TAX_ERAS[s.eraIdx];
    const cgt = r2(profit * (era.cgt || 0.20) * (1 - (s.taxRelief || 0)));
    s.tradingWallet = r2(s.tradingWallet + procUSD - cgt);
    s.planetHoldings[key] = held - qty;
    if (!s.planetHoldings[key]) delete s.planetHoldings[key];

    s.stats.tradesTotal = (s.stats.tradesTotal||0) + 1;
    s.stats.totalTaxPaid = r2((s.stats.totalTaxPaid||0) + cgt);
    const costBasis = r2((s.planetAvgCost[key]||co.price) * qty * pd.rate);
    const net = r2(procUSD - cgt - costBasis);
    if (net > 0) {
      s.stats.tradesWon = (s.stats.tradesWon||0) + 1;
      if (net > (s.stats.biggestWin||0)) {
        s.stats.biggestWin = net;
        s.stats.biggestWinDesc = 'Sold '+ticker+' ('+planet+') for +$'+net.toFixed(2);
      }
    } else {
      s.stats.tradesLost = (s.stats.tradesLost||0) + 1;
    }

    if (s.stats.tradesTotal >= 50) earnBadge('trade_50');
    if (s.stats.tradesTotal >= 100) earnBadge('trade_100');

    refresh();
  }, [refresh, earnBadge]);

  // ── ETF TRADING ──────────────────────────────────────────────
  const buyETF = useCallback((etfId, units) => {
    const s = S.current;
    const e = s.etfs.find(x => x.id === etfId);
    if (!e) return;
    const cost = r2(units * e.price * (1 + e.expense / 100));
    if (cost > s.tradingWallet) return 'Insufficient funds';
    s.tradingWallet = r2(s.tradingWallet - cost);
    const prev = e.units;
    e.units = prev + units;
    e.avgCost = r2((e.avgCost * prev + cost) / e.units);

    s.stats.tradesTotal = (s.stats.tradesTotal||0) + 1;
    if (s.stats.tradesTotal === 1) earnBadge('first_trade');

    logTx('BUY_ETF', 'Trading', -cost, 'Bought '+units+' units '+e.n+' @ $'+e.price.toFixed(2));
    refresh();
    return null;
  }, [refresh, logTx, earnBadge]);

  const sellETF = useCallback((etfId, units) => {
    const s = S.current;
    const e = s.etfs.find(x => x.id === etfId);
    if (!e || e.units < units) return;
    const proc = r2(units * e.price);
    const profit = Math.max(0, (e.price - e.avgCost) * units);
    const era = TAX_ERAS[s.eraIdx];
    const cgt = r2(profit * (era.cgt || 0.20) * (1 - (s.taxRelief || 0)));
    s.tradingWallet = r2(s.tradingWallet + proc - cgt);
    e.units -= units;

    s.stats.tradesTotal = (s.stats.tradesTotal||0) + 1;
    s.stats.totalTaxPaid = r2((s.stats.totalTaxPaid||0) + cgt);

    const net = r2(proc - cgt - (e.avgCost * units));
    if (net > 0) {
      s.stats.tradesWon = (s.stats.tradesWon||0) + 1;
    } else {
      s.stats.tradesLost = (s.stats.tradesLost||0) + 1;
    }

    if (s.stats.tradesTotal >= 50) earnBadge('trade_50');
    if (s.stats.tradesTotal >= 100) earnBadge('trade_100');

    logTx('SELL_ETF', 'Trading', proc-cgt, 'Sold '+units+' '+e.n+' · CGT: $'+cgt.toFixed(2));
    refresh();
  }, [refresh, logTx, earnBadge]);

  // ── SOVEREIGN FUND ───────────────────────────────────────────
  const depositFund = useCallback((fundId, amount) => {
    const s = S.current;
    if (amount > s.tradingWallet) return 'Insufficient funds';
    const fee = r2(amount * 0.02);
    s.tradingWallet = r2(s.tradingWallet - amount);
    const net = r2(amount - fee);
    s.fundDeposits[fundId].deposit = r2(s.fundDeposits[fundId].deposit + net);
    logTx('FUND_DEPOSIT', 'Trading', -amount, 'Deposited $'+amount.toFixed(2)+' into '+fundId+' (2% fee: $'+fee.toFixed(2)+')');
    refresh();
    return null;
  }, [refresh, logTx]);

  const withdrawFund = useCallback((fundId) => {
    const s = S.current;
    const fd = s.fundDeposits[fundId];
    if (!fd || fd.deposit <= 0) return;
    s.tradingWallet = r2(s.tradingWallet + fd.deposit);
    logTx('FUND_WITHDRAW', 'Trading', fd.deposit, 'Withdrew $'+fd.deposit.toFixed(2)+' from '+fundId);
    fd.deposit = 0;
    refresh();
  }, [refresh, logTx]);

  // ── IPO BOOKING ──────────────────────────────────────────────
  const bookIPO = useCallback((ipoId, shares) => {
    const s = S.current;
    const ipo = IPOS.find(x => x.id === ipoId);
    if (!ipo) return;
    if (shares <= 0) return 'Enter a valid number of shares';
    const mid = (ipo.priceRange[0] + ipo.priceRange[1]) / 2;
    // A single investor may book at most 20% of the total offer
    const maxBookValue = r2((ipo.offerSize || 400000000) * 0.20);
    const maxShares = Math.floor(maxBookValue / mid);
    const alreadyBooked = s.ipoBookings[ipoId] || 0;
    if (alreadyBooked + shares > maxShares) {
      const remaining = Math.max(0, maxShares - alreadyBooked);
      return 'Allocation cap reached. Max '+maxShares.toLocaleString()+' shares (~'+fm(maxBookValue)+'). You can book '+remaining.toLocaleString()+' more.';
    }
    const cost = r2(shares * mid);
    if (cost > s.tradingWallet) return 'Insufficient funds';
    s.tradingWallet = r2(s.tradingWallet - cost);
    s.ipoBookings[ipoId] = alreadyBooked + shares;
    logTx('IPO_BOOK', 'Trading', -cost, 'Booked '+shares.toLocaleString()+' shares in '+ipo.n+' IPO @ $'+mid.toFixed(2)+' midpoint');
    refresh();
    return null;
  }, [refresh, logTx]);

  // ── PHILANTHROPY ─────────────────────────────────────────────
  const donate = useCallback((catIdx, amount) => {
    const s = S.current;
    const CATS = [{n:'Healthcare',ico:'🏥',rate:.20,dur:3,mult:1.3},{n:'Education',ico:'🎓',rate:.25,dur:5,mult:1.5},{n:'Environment',ico:'🌱',rate:.30,dur:7,mult:1.1},{n:'Infrastructure',ico:'🌉',rate:.15,dur:4,mult:1.0},{n:'Poverty',ico:'🤝',rate:.20,dur:3,mult:1.2},{n:'Science',ico:'🔬',rate:.25,dur:5,mult:1.0},{n:'Arts',ico:'🎨',rate:.10,dur:2,mult:1.0},{n:'Disaster',ico:'🚨',rate:.35,dur:8,mult:1.0}];
    const c = CATS[catIdx];
    if (!c) return;
    if (amount < 100000) return 'Minimum donation: $100,000';
    if (amount > s.cashWallet) return 'Insufficient Cash Wallet funds';
    s.cashWallet = r2(s.cashWallet - amount);
    s.totalDonated = r2((s.totalDonated||0) + amount);
    s.donCount = (s.donCount||0) + 1;
    const pts = Math.round(amount / 1000 * c.mult);
    s.redeemPts = Math.min(5000, (s.redeemPts||0) + pts);
    s.phiBenefits = [...(s.phiBenefits||[]), { rate: c.rate, rem: c.dur, name: c.n }];
    s.taxRelief = Math.min(0.75, s.phiBenefits.reduce((x, b) => x + b.rate, 0));
    s.donHistory = [{ turn: s.turn, cat: c.n, amt: amount, pts }, ...(s.donHistory||[])].slice(0, 20);
    if ((s.redeemPts||0) >= 500 && s.donCount >= 2) {
      s.spinTokens = (s.spinTokens||0) + 1;
      addNews('🎡', 'Spin Token Earned!', '500+ points and 2+ donations → 1 Wheel of Fortune spin token.', true);
    }
    earnBadge('first_donation');
    addNews(c.ico, 'Donation: '+c.n, '$'+amount.toLocaleString()+' donated to '+c.n+'. Tax relief: '+Math.round(c.rate*100)+'% for '+c.dur+' turns. +'+pts+' redemption points.', true);
    logTx('DONATE', 'Cash', -amount, 'Donation: $'+amount.toLocaleString()+' to '+c.n+'. +'+pts+' pts.');
    refresh();
    return null;
  }, [refresh, addNews, logTx, earnBadge]);

  // ── WHEEL SPIN (Debt Relief) ──────────────────────────────────
  const spinWheel = useCallback(() => {
    const s = S.current;
    if ((s.spinsUsed||0) >= 5) return 'Maximum 5 lifetime spins reached';
    if ((s.spinTokens||0) < 1) return 'No spin tokens';
    if ((s.redeemPts||0) < 500) return 'Need 500+ redemption points';
    if ((s.donCount||0) < 2) return 'Need 2+ donations';
    if (s.turn - (s.lastSpin||0) < 100 && s.lastSpin > 0) return 'Must wait 100 turns between spins';

    const SEGS = [{outcome:'debt5',prob:30},{outcome:'pts100',prob:15},{outcome:'debt10',prob:20},{outcome:'debt5',prob:30},{outcome:'debt15',prob:15},{outcome:'debt5',prob:30},{outcome:'debt25',prob:10},{outcome:'pts200',prob:10},{outcome:'debt50',prob:10},{outcome:'debt5',prob:30},{outcome:'debt15',prob:15},{outcome:'debt10',prob:20}];
    const total = SEGS.reduce((x, s) => x + s.prob, 0);
    let rnd = Math.random() * total;
    let segIdx = 0;
    for (let i = 0; i < SEGS.length; i++) { rnd -= SEGS[i].prob; if (rnd <= 0) { segIdx = i; break; } }
    const outcome = SEGS[segIdx].outcome;

    s.spinTokens = Math.max(0, s.spinTokens - 1);
    s.redeemPts = Math.max(0, s.redeemPts - 500);
    s.spinsUsed = (s.spinsUsed||0) + 1;
    s.lastSpin = s.turn;

    let msg = '';
    if (outcome.startsWith('debt')) {
      const pct = parseInt(outcome.replace('debt', '')) / 100;
      const forgiven = r2((s.totalDebt||0) * pct);
      s.totalDebt = Math.max(0, r2((s.totalDebt||0) - forgiven));
      msg = Math.round(pct*100)+'% debt forgiveness — $'+forgiven.toLocaleString()+' forgiven!';
    } else {
      const pts = parseInt(outcome.replace('pts',''));
      s.redeemPts = Math.min(5000, s.redeemPts + pts);
      msg = '+'+pts+' bonus redemption points!';
    }
    s.spinHistory = [{ turn: s.turn, outcome, msg, segIdx }, ...(s.spinHistory||[])].slice(0, 10);
    addNews('🎡', 'Wheel of Fortune Result', msg, true);
    earnBadge('first_spin');
    refresh();
    return { segIdx, msg };
  }, [refresh, addNews, earnBadge]);

  // ── EARTH FX TRADING ─────────────────────────────────────────
  const openFxPosition = useCallback((pair, dir, usdSize) => {
    const s = S.current;
    if (!pair || !dir || !usdSize || usdSize <= 0) return 'Invalid input';
    if (usdSize > s.tradingWallet) return 'Insufficient Trading Wallet funds';
    if (usdSize < 100) return 'Minimum position: $100';
    if (usdSize > 10000000) return 'Maximum position: $10M (prevents leverage abuse)';
    const rate = s.fxRates?.[pair];
    if (!rate) return 'Pair not found';
    s.tradingWallet = r2(s.tradingWallet - usdSize);
    s.fxPositions = [...(s.fxPositions||[]), {
      id: Math.random().toString(36).slice(2),
      pair, dir, entryRate: rate, size: usdSize, usdCost: usdSize, turn: s.turn,
    }];
    logTx('FX_OPEN', 'Trading', -usdSize, dir.toUpperCase()+' '+pair+' @ '+rate.toFixed(6)+' · $'+usdSize.toFixed(2));
    refresh();
    return null;
  }, [refresh, logTx]);

  const FX_QUICK_BETS = [5000, 10000, 100000, 500000, 1000000];

  const closeFxPosition = useCallback((posId) => {
    const s = S.current;
    if (!s.fxPositions) return;
    const pos = s.fxPositions.find(p => p.id === posId);
    if (!pos) return;
    const currentRate = s.fxRates?.[pos.pair] || pos.entryRate;
    const priceMoveRatio = pos.dir === 'long'
      ? (currentRate - pos.entryRate) / pos.entryRate
      : (pos.entryRate - currentRate) / pos.entryRate;
    const pnl = r2(pos.size * priceMoveRatio);
    const payout = r2(pos.size + pnl);
    s.tradingWallet = r2(s.tradingWallet + Math.max(0, payout));
    s.fxPnlRealized = r2((s.fxPnlRealized||0) + pnl);
    s.fxPositions = s.fxPositions.filter(p => p.id !== posId);
    logTx('FX_CLOSE', 'Trading', Math.max(0, payout), 'Closed '+pos.dir.toUpperCase()+' '+pos.pair+' · PnL: '+(pnl>=0?'+':'')+fm(pnl));
    refresh();
  }, [refresh, logTx]);

  // ── FORTUNE WHEEL ────────────────────────────────────────────
  const FORTUNE_SEGS = [
    {l:'0.5×', mult:0.5, c:'#7F1D1D', prob:15},
    {l:'0.75×', mult:0.75, c:'#DC2626', prob:20},
    {l:'1.0×', mult:1.0, c:'#374151', prob:20},
    {l:'1.25×', mult:1.25, c:'#D97706', prob:15},
    {l:'1.5×', mult:1.5, c:'#059669', prob:12},
    {l:'2.0×', mult:2.0, c:'#10B981', prob:10},
    {l:'3.0×', mult:3.0, c:'#3B82F6', prob:6},
    {l:'5.0×', mult:5.0, c:'#F59E0B', prob:2},
  ];

  const spinFortune = useCallback((stake, insured) => {
    const s = S.current;
    if ((s.spinTokens||0) < 1) return 'No spin tokens';
    const maxStake = r2(s.tradingWallet * 0.75);
    if (stake > maxStake) return 'Max stake is 75% of trading wallet';
    if (stake > s.tradingWallet) return 'Insufficient funds';

    const total = FORTUNE_SEGS.reduce((x,seg) => x+seg.prob, 0);
    let rnd = Math.random() * total;
    let segIdx = 0;
    for (let i=0; i<FORTUNE_SEGS.length; i++) { rnd -= FORTUNE_SEGS[i].prob; if(rnd<=0){segIdx=i;break;} }
    const seg = FORTUNE_SEGS[segIdx];

    const insuranceFee = insured ? r2(stake * 0.05) : 0;
    const totalCost = r2(stake + insuranceFee);
    if (totalCost > s.tradingWallet) return 'Insufficient funds for stake + insurance';

    s.tradingWallet = r2(s.tradingWallet - totalCost);
    s.spinTokens = Math.max(0, s.spinTokens - 1);

    let payout = r2(stake * seg.mult);
    if (insured && seg.mult < 1) payout = Math.max(payout, r2(stake * 0.5));

    s.tradingWallet = r2(s.tradingWallet + payout);
    const net = r2(payout - stake);
    const msg = seg.l+' — '+(net >= 0 ? 'Won' : 'Lost')+' $'+Math.abs(net).toFixed(2)+(insured ? ' (insured)' : '');

    s.spinHistory = [{turn:s.turn, type:'fortune', stake, mult:seg.mult, payout, msg, segIdx}, ...(s.spinHistory||[])].slice(0,10);
    addNews('🎡', 'Fortune Wheel: '+seg.l, msg, net >= 0);
    earnBadge('first_spin');
    refresh();
    return { segIdx, msg, mult: seg.mult, payout, net };
  }, [refresh, addNews, earnBadge]);

  // ── BONDS ────────────────────────────────────────────────────
  const buyBond = useCallback((bondId, amount, bondDef) => {
    const s = S.current;
    if (!bondDef) return 'Bond not found';
    if (amount < bondDef.minInvest) return 'Minimum investment: $'+bondDef.minInvest.toLocaleString();
    if (amount > s.tradingWallet) return 'Insufficient funds';
    if (bondDef.unlock && !s.planetUnlocks[bondDef.unlock]) return bondDef.unlock+' must be unlocked first';
    s.tradingWallet = r2(s.tradingWallet - amount);
    s.bondHoldings = [...(s.bondHoldings||[]), {
      id: bondId+'_'+Date.now(),
      bondId,
      principal: amount,
      purchaseTurn: s.turn,
      maturity: bondDef.maturity,
      yield: bondDef.yield,
      n: bondDef.n,
    }];
    logTx('BUY_BOND', 'Trading', -amount, 'Bought '+bondDef.n+' bond for $'+amount.toFixed(2)+' @ '+bondDef.yield+'% yield, matures T'+(s.turn+bondDef.maturity));
    refresh();
    return null;
  }, [refresh, logTx]);

  // ── CRYPTO TRADING ───────────────────────────────────────────
  const buyCrypto = useCallback((coinId, usdAmount) => {
    const s = S.current;
    if (usdAmount > s.tradingWallet) return 'Insufficient Trading Wallet funds';
    if (usdAmount <= 0) return 'Enter a valid amount';
    const price = s.cryptoPrices?.[coinId];
    if (!price) return 'Coin not found';
    const qty = usdAmount / price;
    const prev = s.cryptoHoldings[coinId] || 0;
    const prevAvg = s.cryptoAvgCost[coinId] || price;
    s.tradingWallet = r2(s.tradingWallet - usdAmount);
    s.cryptoHoldings[coinId] = r2(prev + qty);
    s.cryptoAvgCost[coinId] = r2((prevAvg * prev + usdAmount) / s.cryptoHoldings[coinId]);
    s.stats.tradesTotal = (s.stats.tradesTotal||0) + 1;
    if (s.stats.tradesTotal === 1) earnBadge('first_trade');
    if (s.stats.tradesTotal >= 50) earnBadge('trade_50');
    if (s.stats.tradesTotal >= 100) earnBadge('trade_100');
    logTx('BUY_CRYPTO', 'Trading', -usdAmount, 'Bought '+qty.toFixed(6)+' '+coinId+' @ $'+price.toFixed(2)+' · Total: $'+usdAmount.toFixed(2));
    refresh();
    return null;
  }, [refresh, logTx, earnBadge]);

  const sellCrypto = useCallback((coinId, qty) => {
    const s = S.current;
    const held = s.cryptoHoldings[coinId] || 0;
    if (qty > held) return 'Insufficient holdings';
    if (qty <= 0) return 'Enter a valid quantity';
    const price = s.cryptoPrices?.[coinId] || 0;
    const proceeds = r2(qty * price);
    const avgCost = s.cryptoAvgCost[coinId] || price;
    const profit = Math.max(0, (price - avgCost) * qty);
    const cgt = r2(profit * 0.30 * (1 - (s.taxRelief || 0))); // flat 30% CGT for crypto, philanthropy relief applies
    s.tradingWallet = r2(s.tradingWallet + proceeds - cgt);
    s.cryptoHoldings[coinId] = r2(held - qty);
    if (s.cryptoHoldings[coinId] <= 0) delete s.cryptoHoldings[coinId];
    s.stats.tradesTotal = (s.stats.tradesTotal||0) + 1;
    s.stats.totalTaxPaid = r2((s.stats.totalTaxPaid||0) + cgt);
    const costBasis = r2(avgCost * qty);
    const net = r2(proceeds - cgt - costBasis);
    if (net > 0) {
      s.stats.tradesWon = (s.stats.tradesWon||0) + 1;
      if (net > (s.stats.biggestWin||0)) {
        s.stats.biggestWin = net;
        s.stats.biggestWinDesc = 'Sold '+coinId+' crypto for +$'+net.toFixed(2);
      }
    } else {
      s.stats.tradesLost = (s.stats.tradesLost||0) + 1;
      if (Math.abs(net) > (s.stats.biggestLoss||0)) {
        s.stats.biggestLoss = Math.abs(net);
        s.stats.biggestLossDesc = 'Sold '+coinId+' crypto for -$'+Math.abs(net).toFixed(2);
      }
    }
    if (s.stats.tradesTotal >= 50) earnBadge('trade_50');
    if (s.stats.tradesTotal >= 100) earnBadge('trade_100');
    logTx('SELL_CRYPTO', 'Trading', proceeds-cgt, 'Sold '+qty.toFixed(6)+' '+coinId+' · CGT 30%: $'+cgt.toFixed(2)+' · Net: $'+(proceeds-cgt).toFixed(2));
    refresh();
    return null;
  }, [refresh, logTx, earnBadge]);

  // ── PLANET FX ────────────────────────────────────────────────
  const exchangeToLocal = useCallback((planet, usdAmount) => {
    const s = S.current;
    const pd = PLANETS_DATA[planet];
    if (!pd) return 'Planet not found';
    if (usdAmount > s.tradingWallet) return 'Insufficient Trading Wallet funds';
    if (usdAmount <= 0) return 'Enter a valid amount';
    const fxRate = s.planetCompanies[planet]?.fxRate || pd.rate;
    const localAmt = r2((usdAmount / fxRate) * 0.98); // 2% fee
    s.tradingWallet = r2(s.tradingWallet - usdAmount);
    s.planetWallets[planet] = r2((s.planetWallets[planet]||0) + localAmt);
    logTx('FX_BUY', 'Trading', -usdAmount, 'Exchanged $'+usdAmount.toFixed(2)+' → '+pd.currency+' '+localAmt.toFixed(4)+' on '+planet+' (2% fee)');
    refresh();
    return null;
  }, [refresh, logTx]);

  const exchangeToUSD = useCallback((planet, localAmount) => {
    const s = S.current;
    const pd = PLANETS_DATA[planet];
    if (!pd) return 'Planet not found';
    if (localAmount > (s.planetWallets[planet]||0)) return 'Insufficient '+pd.currency+' balance';
    if (localAmount <= 0) return 'Enter a valid amount';
    const fxRate = s.planetCompanies[planet]?.fxRate || pd.rate;
    const usdAmt = r2(localAmount * fxRate * 0.98); // 2% fee
    s.planetWallets[planet] = r2(s.planetWallets[planet] - localAmount);
    s.tradingWallet = r2(s.tradingWallet + usdAmt);
    logTx('FX_SELL', 'Trading', usdAmt, 'Exchanged '+pd.currency+' '+localAmount.toFixed(4)+' → $'+usdAmt.toFixed(2)+' (2% fee)');
    refresh();
    return null;
  }, [refresh, logTx]);

  // ── COMMODITIES ───────────────────────────────────────────────
  const buyCommodity = useCallback((comId, units) => {
    const s = S.current;
    const com = COMMODITIES.find(c => c.id === comId);
    if (!com) return 'Commodity not found';
    if (com.unlock && !s.planetUnlocks?.[com.unlock]) return com.unlock + ' not yet unlocked';
    if (!s.commodityHoldings) s.commodityHoldings = {};
    if (!s.commodityAvgCost) s.commodityAvgCost = {};
    if (!s.commodityHist) s.commodityHist = {};
    const hist = s.commodityHist[comId] || [com.ip];
    const price = hist[hist.length - 1] || com.ip;
    const cost = r2(units * price);
    if (cost <= 0) return 'Invalid quantity';
    if (cost > s.tradingWallet) return 'Insufficient Trading Wallet funds';
    s.tradingWallet = r2(s.tradingWallet - cost);
    const prev = s.commodityHoldings[comId] || 0;
    const prevAvg = s.commodityAvgCost[comId] || price;
    s.commodityHoldings[comId] = r2(prev + units);
    s.commodityAvgCost[comId] = r2((prevAvg * prev + cost) / s.commodityHoldings[comId]);
    s.stats.tradesTotal = (s.stats.tradesTotal||0) + 1;
    if (s.stats.tradesTotal === 1) earnBadge('first_trade');
    if (s.stats.tradesTotal >= 50) earnBadge('trade_50');
    if (s.stats.tradesTotal >= 100) earnBadge('trade_100');
    logTx('BUY_COMM', 'Trading', -cost, 'Bought '+units+' '+com.unit+' '+com.n+' @ $'+price.toFixed(price<1?4:2));
    refresh();
    return null;
  }, [refresh, logTx, earnBadge]);

  const sellCommodity = useCallback((comId, units) => {
    const s = S.current;
    const com = COMMODITIES.find(c => c.id === comId);
    if (!com) return 'Commodity not found';
    if (!s.commodityHoldings) s.commodityHoldings = {};
    const held = s.commodityHoldings[comId] || 0;
    if (units <= 0) return 'Invalid quantity';
    if (units > held + 0.0001) return 'Only '+held.toFixed(4)+' '+com.unit+' held';
    const safeUnits = Math.min(units, held);
    const hist = s.commodityHist?.[comId] || [com.ip];
    const price = hist[hist.length - 1] || com.ip;
    const avgCost = s.commodityAvgCost?.[comId] || price;
    const proceeds = r2(safeUnits * price);
    const profit = Math.max(0, (price - avgCost) * safeUnits);
    const cgt = r2(profit * (com.tax || 0.15) * (1 - (s.taxRelief || 0)));
    s.tradingWallet = r2(s.tradingWallet + proceeds - cgt);
    s.commodityHoldings[comId] = r2(held - safeUnits);
    if (s.commodityHoldings[comId] < 0.0001) delete s.commodityHoldings[comId];
    s.stats.tradesTotal = (s.stats.tradesTotal||0) + 1;
    s.stats.totalTaxPaid = r2((s.stats.totalTaxPaid||0) + cgt);
    const net = r2(proceeds - cgt - avgCost * safeUnits);
    if (net > 0) {
      s.stats.tradesWon = (s.stats.tradesWon||0) + 1;
      if (net > (s.stats.biggestWin||0)) { s.stats.biggestWin = net; s.stats.biggestWinDesc = 'Sold '+com.n+' for +$'+net.toFixed(2); }
    } else {
      s.stats.tradesLost = (s.stats.tradesLost||0) + 1;
      if (Math.abs(net) > (s.stats.biggestLoss||0)) { s.stats.biggestLoss = Math.abs(net); s.stats.biggestLossDesc = 'Sold '+com.n+' for -$'+Math.abs(net).toFixed(2); }
    }
    if (s.stats.tradesTotal >= 50) earnBadge('trade_50');
    if (s.stats.tradesTotal >= 100) earnBadge('trade_100');
    logTx('SELL_COMM', 'Trading', proceeds-cgt, 'Sold '+safeUnits+' '+com.unit+' '+com.n+' · CGT 15%: $'+cgt.toFixed(2)+' · Net: $'+(proceeds-cgt).toFixed(2));
    refresh();
    return null;
  }, [refresh, logTx, earnBadge]);

  const setPlayerAvatar = useCallback((emoji) => {
    S.current.playerAvatar = emoji;
    refresh();
  }, [refresh]);

  const setPlayerName = useCallback((name) => {
    S.current.playerName = name.trim() || 'Raider';
    refresh();
  }, [refresh]);

  const setDarkMode = useCallback((val) => {
    S.current.darkMode = val;
    refresh();
  }, [refresh]);

  const setLanguage = useCallback((code) => {
    S.current.language = code;
    refresh();
  }, [refresh]);

  const setMusicTrack = useCallback((trackId) => {
    S.current.musicTrack = trackId;
    S.current.musicEnabled = true;
    refresh();
  }, [refresh]);

  const toggleMusic = useCallback((enabled) => {
    S.current.musicEnabled = !!enabled;
    refresh();
  }, [refresh]);

  const markOnboardingShown = useCallback(() => {
    S.current.showedOnboarding = true;
    refresh();
  }, [refresh]);

  const clearMilestone = useCallback(() => {
    S.current.pendingMilestone = null;
    refresh();
  }, [refresh]);

  const navigateTo = useCallback((target) => {
    S.current.navTarget = target; // {screen, tab, ticker, planet, id}
    refresh();
  }, [refresh]);

  const clearNavTarget = useCallback(() => {
    S.current.navTarget = null;
    refresh();
  }, [refresh]);

  // Trade-lock: while any buy/sell modal is open, auto-advance pauses so the
  // quoted price cannot change while the player is deciding.
  const setTradeLock = useCallback((open) => {
    S.current.uiModalOpen = !!open;
    refresh();
  }, [refresh]);

  // ── FOUNDER MODE ─────────────────────────────────────────────
  const startFounderMode = useCallback((companyName, industry, capitalAmount) => {
    const s = S.current;
    if (capitalAmount < FOUNDER_MIN_CAPITAL) return `Minimum $${FOUNDER_MIN_CAPITAL.toLocaleString()} required to found a company`;
    if (capitalAmount > s.tradingWallet) return 'Insufficient funds';

    const companyId = 'FOUNDER_' + Math.random().toString(36).substr(2, 9);
    const sharesOutstanding = Math.max(1000000, Math.round(capitalAmount / 10));
    s.founderMode.active = true;
    s.founderMode.companyId = companyId;
    s.founderMode.companyName = companyName.trim() || 'Founder Corp';
    s.founderMode.industry = industry || 'tech';
    s.founderMode.foundersCapital = capitalAmount;
    s.founderMode.currentCapital = capitalAmount;
    s.founderMode.sharesOutstanding = sharesOutstanding;
    s.founderMode.founderShares = sharesOutstanding; // founder owns 100% at founding
    s.founderMode.revenue = 0;
    s.founderMode.targetRevenue = 0;
    s.founderMode.pendingOffer = null;
    s.founderMode.stage = 'bootstrapped';
    s.founderMode.turnStarted = s.turn;
    s.founderMode.nwAtFoundation = Object.values(s.stockHoldings).reduce((x, [t, n]) => {
      const co = s.companies.find(c => c.t === t);
      return x + (co ? co.price * n : 0);
    }, 0) + s.savingsWallet + s.tradingWallet + s.cashWallet;

    s.tradingWallet = r2(s.tradingWallet - capitalAmount);

    const profile = FOUNDER_INDUSTRY_PROFILES[industry] || FOUNDER_INDUSTRY_PROFILES.tech;
    s.founderMode.weatherResistance = profile.weatherResistance;

    addNews('🚀', 'Founder Mode Started', `You founded ${companyName} in ${industry} with $${capitalAmount.toLocaleString()}. You hold 100% (${sharesOutstanding.toLocaleString()} shares).`, true);
    refresh();
    return null;
  }, [refresh, addNews]);

  const takeLoanFounder = useCallback((amount, termMonths) => {
    const s = S.current;
    if (!s.founderMode.active) return 'Not in Founder Mode';
    const fm = s.founderMode;
    const existingDebt = fm.loans.reduce((x, l) => x + l.outstanding, 0);
    const maxLeverage = founderMaxLeverageRatio(fm.foundersCapital);
    const maxTotalDebt = r2(fm.foundersCapital * maxLeverage);
    if (existingDebt + amount > maxTotalDebt) {
      const remaining = Math.max(0, r2(maxTotalDebt - existingDebt));
      return `Loan capped at ${(maxLeverage*100).toFixed(0)}% of invested capital ($${maxTotalDebt.toLocaleString()} total). You can still borrow $${remaining.toLocaleString()}.`;
    }

    const loanId = Math.random().toString(36).substr(2, 9);
    // Loan rate varies by term and profitability
    const baseRate = termMonths <= 12 ? 0.05 : termMonths <= 36 ? 0.07 : 0.09;
    const profitRate = fm.revenue > 0 ? 0.02 : 0.05;
    const rate = baseRate + profitRate;

    const loan = {
      id: loanId,
      amount,
      outstanding: amount,
      rate,
      termMonths,
      monthlyPayment: r2(amount / termMonths),
      turnsRemaining: termMonths * 30,
      turnTaken: s.turn,
    };

    fm.loans.push(loan);
    fm.currentCapital = r2(fm.currentCapital + amount);

    addNews('🏦', 'Founder Loan', `Borrowed $${amount.toLocaleString()} at ${(rate*100).toFixed(1)}% over ${termMonths} months.`, true);
    refresh();
    return null;
  }, [refresh, addNews]);

  const launchFounderIPO = useCallback((ipoShares, targetPrice) => {
    const s = S.current;
    if (!s.founderMode.active) return 'Not in Founder Mode';
    if (s.founderMode.stage === 'public') return 'Already public';

    const fm = s.founderMode;
    // Cap new issuance so the founder always retains a clear majority (>51%) post-IPO.
    const maxIssuable = Math.floor(fm.founderShares * 0.96);
    if (ipoShares > maxIssuable) return `Max ${maxIssuable.toLocaleString()} new shares — keeps you above 51% ownership`;

    fm.stage = 'pre-ipo';
    fm.ipoShares = ipoShares;
    fm.ipoPrice = targetPrice;

    // Investor demand based on company metrics
    const profitabilityScore = Math.min(1, fm.revenue / (fm.currentCapital * 0.05));
    const demandScore = Math.min(1, (fm.demandTrend + 1) / 2);
    fm.investorDemand = r2(profitabilityScore * 0.6 + demandScore * 0.4);

    // Book-building flavor: a handful of institutional investors express interest
    const shuffled = [...FICTIONAL_INVESTORS].sort(() => Math.random() - 0.5).slice(0, 4);
    fm.ipoBook = shuffled.map(name => ({
      name,
      demandPct: r2(cl(fm.investorDemand * (0.6 + Math.random() * 0.8), 0.05, 1) * 100),
    }));

    addNews('📋', 'IPO Filed', `${fm.companyName} filed for IPO: ${ipoShares.toLocaleString()} new shares @ $${targetPrice}. Investor demand: ${(fm.investorDemand * 100).toFixed(0)}%.`, true);
    refresh();
    return null;
  }, [refresh, addNews]);

  const confirmFounderIPO = useCallback(() => {
    const s = S.current;
    if (!s.founderMode.active || s.founderMode.stage !== 'pre-ipo') return 'Not ready for IPO';

    const fm = s.founderMode;
    const allocation = Math.floor(fm.ipoShares * fm.investorDemand);
    const proceeds = r2(allocation * fm.ipoPrice);

    // Add founder company to tradeable list
    const companyId = fm.companyId;
    if (!s.companies.find(c => c.t === companyId)) {
      s.companies.push({
        t: companyId,
        n: fm.companyName,
        s: fm.industry,
        price: fm.ipoPrice,
        pe: 18,
        ch: 0,
        hist: [fm.ipoPrice, fm.ipoPrice],
        div: 0.3,
        b: 1.5,
        yr: 2024,
        emp: 50,
        hq: 'Earth',
        ip: fm.ipoPrice,
        pe0: 18,
        analysts: [],
        founder: 'You',
        ceo: 'You',
        ceoProfile: { rep: 85, tenure: 0, style: 'Founder', track: 'Growth' },
        origin: `Founder company in ${fm.industry}`,
        ops: `Publicly traded ${fm.companyName} - ${fm.industry} sector`,
        listedTurn: s.turn,
      });
    }

    // Newly issued shares dilute — they are NOT handed to the player. The
    // founder keeps their original share count; proceeds are the founder's
    // cash payout for selling that slice of future ownership to the public.
    fm.sharesOutstanding = fm.sharesOutstanding + allocation;
    s.companyOwnership[companyId] = r2((fm.founderShares / fm.sharesOutstanding) * 10000) / 100;
    s.tradingWallet = r2(s.tradingWallet + proceeds);

    fm.stage = 'public';
    fm.stock.price = fm.ipoPrice;
    fm.stock.hist = [fm.ipoPrice, fm.ipoPrice];

    addNews('🎉', 'IPO Successful', `${fm.companyName} went public! ${allocation.toLocaleString()} new shares sold to investors. You received $${proceeds.toLocaleString()}. You retain ${s.companyOwnership[companyId].toFixed(1)}% ownership.`, true);
    refresh();
    return null;
  }, [refresh, addNews]);

  const acceptTenderOffer = useCallback(() => {
    const s = S.current;
    const fm = s.founderMode;
    if (!fm.active || !fm.pendingOffer) return 'No active offer';
    const offer = fm.pendingOffer;
    // Founder's cut is proportional to their ownership stake
    const founderOwnershipPct = fm.founderShares / fm.sharesOutstanding;
    const payout = r2(offer.totalValue * founderOwnershipPct);
    s.tradingWallet = r2(s.tradingWallet + payout);
    const companyId = fm.companyId;
    logTx('ACQUISITION', 'Trading', payout, `${fm.companyName} acquired by ${offer.buyer} — your ${(founderOwnershipPct*100).toFixed(1)}% stake paid out`);
    addNews('🤝', 'Acquisition Accepted', `${fm.companyName} was acquired by ${offer.buyer} for $${offer.totalValue.toLocaleString()}. You received $${payout.toLocaleString()} for your stake.`, true);
    // Reset founder mode entirely — player can start a new company later
    if (companyId) s.companies = s.companies.filter(c => c.t !== companyId);
    delete s.stockHoldings[companyId];
    delete s.companyOwnership[companyId];
    s.founderMode = buildInitialState().founderMode;
    refresh();
    return null;
  }, [refresh, addNews, logTx]);

  const declineTenderOffer = useCallback(() => {
    const s = S.current;
    const fm = s.founderMode;
    if (!fm.pendingOffer) return 'No active offer';
    addNews('🚫', 'Offer Declined', `You declined ${fm.pendingOffer.buyer}'s $${fm.pendingOffer.totalValue.toLocaleString()} offer for ${fm.companyName}.`, false);
    fm.pendingOffer = null;
    refresh();
    return null;
  }, [refresh, addNews]);

  // ── FOUNDATION AUTOPILOT ───────────────────────────────────────
  const toggleFoundationAutopilot = useCallback(() => {
    const s = S.current;
    if (!s.foundationOpen) return 'Open a foundation first';
    s.foundationAutopilot = !s.foundationAutopilot;
    addNews('⚖️', 'Foundation Mode Changed', s.foundationAutopilot
      ? 'Foundation switched to autopilot: invests the balance for a higher average return, with real volatility.'
      : 'Foundation switched to manual: safe, guaranteed 3% APR.', false);
    refresh();
    return null;
  }, [refresh, addNews]);

  const liquidateFoundation = useCallback(() => {
    const s = S.current;
    if (!s.foundationOpen) return 'No foundation to liquidate';
    const amt = s.foundationBalance;
    s.tradingWallet = r2(s.tradingWallet + amt);
    s.foundationBalance = 0;
    s.foundationOpen = false;
    s.foundationAutopilot = false;
    logTx('FOUNDATION_LIQUIDATE', 'Trading', amt, 'Foundation liquidated: $'+amt.toLocaleString()+' returned to Trading Wallet. Tax relief benefits ended.');
    addNews('💰', 'Foundation Liquidated', `$${amt.toLocaleString()} returned to your Trading Wallet. Foundation closed — tax relief benefits ended.`, true);
    refresh();
    return null;
  }, [refresh, addNews, logTx]);

  // ── SAVE / LOAD ──────────────────────────────────────────────
  const saveGame = useCallback((slot='slot1') => {
    try {
      localStorage.setItem('CC_save_'+slot, JSON.stringify(S.current));
      return null;
    } catch(e) { return 'Save failed'; }
  }, []);

  const loadGame = useCallback((slot='slot1') => {
    try {
      const data = localStorage.getItem('CC_save_'+slot);
      if (!data) return 'No save found';
      const loaded = JSON.parse(data);
      // Deep-merge over a fresh initial state: saves from older builds are missing newer
      // fields (fxRates, shownMilestones, ...) and would crash screens if loaded raw.
      const fresh = buildInitialState();
      const merged = { ...fresh, ...loaded };
      // Sanitize companies — IPO-created entries from older builds lack fields the UI reads
      merged.companies = (loaded.companies || fresh.companies).map(c => ({
        analysts: [], ceoProfile: { rep: 75, tenure: 0, style: 'Professional', track: 'Steady' },
        founder: c.ceo || 'Founder', ops: c.origin || '', origin: '', hist: [c.ip || c.price || 1],
        ...c,
      }));
      // Nested structures the UI iterates — never leave them undefined
      ['planetCompanies','cryptoPrices','cryptoHist','commodityHist','fxRates','fxHist',
       'fundDeposits','planetWallets','planetUnlocks','shownMilestones','stats'].forEach(k => {
        if (!merged[k]) merged[k] = fresh[k];
      });
      ['fxPositions','bondHoldings','etfs','geoEvents','news','txLog','badges','phiBenefits'].forEach(k => {
        if (!Array.isArray(merged[k])) merged[k] = fresh[k];
      });
      merged.navTarget = null;
      merged.pendingMilestone = null;
      S.current = merged;
      refresh();
      return null;
    } catch(e) { return 'Load failed'; }
  }, [refresh]);

  const value = {
    D, S,
    advanceTurn, buyStock, sellStock, transfer, transferByAmount,
    openFoundation, takeLoan, repayLoan,
    resolveDecision, buyPlanetStock, sellPlanetStock,
    buyETF, sellETF, depositFund, withdrawFund, bookIPO, donate, spinWheel,
    spinFortune, FORTUNE_SEGS,
    buyBond,
    buyCrypto, sellCrypto,
    buyCommodity, sellCommodity,
    exchangeToLocal, exchangeToUSD,
    openFxPosition, closeFxPosition, FX_QUICK_BETS,
    saveGame, loadGame,
    addNews, earnBadge,
    BADGE_DEFS,
    COMMODITIES,
    setDarkMode, setLanguage,
    setPlayerAvatar, setPlayerName,
    clearMilestone,
    navigateTo, clearNavTarget, setTradeLock,
    startFounderMode, takeLoanFounder, launchFounderIPO, confirmFounderIPO,
    acceptTenderOffer, declineTenderOffer,
    toggleFoundationAutopilot, liquidateFoundation,
    FOUNDER_MIN_CAPITAL,
    setMusicTrack, toggleMusic, MUSIC_PLAYLIST,
    markOnboardingShown,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGame = () => useContext(GameContext);
export { BADGE_DEFS, PLANET_THRESHOLDS };
