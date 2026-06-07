import { createContext, useContext, useRef, useState, useCallback } from 'react';
import { EARTH_COMPANIES, CEO_DECISIONS, ETFS, IPOS, SOVEREIGN_FUNDS, TAX_ERAS, PLANETS_DATA, PE_BOUNDS } from '../constants';
import { cl, r2 } from '../utils';

const GameContext = createContext(null);

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
    // CEO — decisions trigger at their designated turns, not pre-loaded
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
    transferLog: [],
    // ETFs / IPOs / Funds
    etfs: ETFS.map(e => ({ ...e, price: e.ip, units: 0, avgCost: e.ip, hist: [e.ip, e.ip], ch: 0 })),
    ipoBookings: {},
    ipoListed: {},
    fundDeposits: Object.fromEntries(SOVEREIGN_FUNDS.map(f => [f.id, { deposit: 0, earned: 0 }])),
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
      { id:1, t:1, ico:'🌌', ti:'Galactic Raider — Capital Exchange', bo:'You start with $1,000,000. Grow it into a multi-billion empire. Solar System unlocks at $5B.', g:true },
      { id:2, t:1, ico:'⚖️', ti:'Economic Governor Active', bo:'P/E bounds enforced. Prices anchored to fundamentals. All 8 rules running.', g:true },
    ],
    txLog: [
      { turn:1, type:'INIT', wallet:'ALL', amount:1000000, desc:'Starting capital: Cash $100K, Savings $100K, Trading $800K' },
    ],
    solarUnlocked: false,
  };
}

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

    // Geopolitical events (~13% chance per turn)
    const GEO_EVENTS = [
      { ico:'⚔️', ti:'Military Conflict: Eastern Front', bo:'Escalating tensions reduce tech sector confidence. Defense stocks rally on increased government spend.', region:'Eastern Europe', impact:'negative' },
      { ico:'🤝', ti:'Pacific Trade Alliance Signed', bo:'New 14-nation trade pact opens a $2T combined market. Logistics and agriculture sectors to benefit.', region:'Asia-Pacific', impact:'positive' },
      { ico:'🛢️', ti:'OPEC Supply Reduction', bo:'Oil cartel cuts production by 2M barrels/day. Energy stocks surge. Inflation risk elevated.', region:'Middle East', impact:'positive' },
      { ico:'🗳️', ti:'G7 Leadership Transition', bo:'Simultaneous elections across 4 major economies. Markets pricing in policy uncertainty.', region:'G7 Nations', impact:'neutral' },
      { ico:'🌪️', ti:'Extreme Weather: Supply Chain Hit', bo:'Flooding disrupts Southeast Asian manufacturing hubs. Tech component shortages expected 3-6 weeks.', region:'South Asia', impact:'negative' },
      { ico:'💊', ti:'WHO Pandemic Alert Level 3', bo:'Novel pathogen detected. Healthcare and biotech stocks rally. Aviation and hospitality fall sharply.', region:'Southeast Asia', impact:'mixed' },
      { ico:'🚀', ti:'Mars Colonization Program Announced', bo:'Interplanetary agency unveils $800B Mars program. Space tech, mining and logistics sectors surge.', region:'Global', impact:'positive' },
      { ico:'💱', ti:'Emerging Market Currency Crisis', bo:'Sovereign debt fears trigger capital flight from EM currencies. Safe-haven assets see record inflows.', region:'South America', impact:'negative' },
      { ico:'🏭', ti:'Nearshoring Manufacturing Boom', bo:'Geopolitical risk drives factory investment surge in North America. Manufacturing and logistics benefit.', region:'North America', impact:'positive' },
      { ico:'🧬', ti:'Gene Therapy Breakthrough', bo:'Universal cancer treatment shows 94% remission in trials. Healthcare and biotech stocks rally hard.', region:'Global', impact:'positive' },
      { ico:'⚡', ti:'Global Power Grid Cyberattack', bo:'State-sponsored attack disrupts power grids in 7 nations. Cybersecurity and utilities see mixed reaction.', region:'Multiple', impact:'mixed' },
      { ico:'🌊', ti:'Pacific Rim Natural Disaster', bo:'Magnitude 8.2 earthquake disrupts Asian supply chains. Insurance losses estimated at $120B.', region:'Pacific Rim', impact:'negative' },
      { ico:'🏦', ti:'Central Bank Rate Decision', bo:'Major central banks signal coordinated rate cuts. Bond yields fall, equities rally across all sectors.', region:'Global', impact:'positive' },
      { ico:'🛡️', ti:'New Sanctions Regime', bo:'Western bloc imposes financial sanctions on two major economies. Energy and banking sectors face disruption.', region:'Global', impact:'negative' },
      { ico:'🌿', ti:'Carbon Tax Treaty Ratified', bo:'147 nations sign binding carbon treaty. Clean energy and ESG funds surge. Fossil fuel majors fall.', region:'Global', impact:'mixed' },
    ];
    if (Math.random() < 0.13) {
      const ev = GEO_EVENTS[Math.floor(Math.random() * GEO_EVENTS.length)];
      const newEv = { id: Math.random(), t: s.turn, ...ev };
      s.geoEvents = [newEv, ...(s.geoEvents || [])].slice(0, 15);
    }

    // Update Earth company prices with Governor enforcement
    s.companies = s.companies.map(c => {
      const eps = c.price / c.pe;
      const bnd = PE_BOUNDS[c.s] || { mn: 10, mx: 35 };
      const move = 1 + (Math.random() - 0.5) * 0.10 * c.b;
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
          { ico:'📰', ti:'Analyst Upgrade', bo:c.n+' upgraded by '+c.analysts[0].firm+'.', g:true, mult:1.02 },
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
        const move = 1 + (Math.random() - 0.5) * 0.12 * (c.b || 1.5) * stormMult;
        const np = Math.max(0.10, r2(c.price * move));
        return { ...c, pp: c.price, price: np, ch: (np - c.price) / c.price, hist: [...(c.hist||[]).slice(-50), np] };
      });
      pState.gdp = Math.round(cl(pState.gdp + (Math.random() - 0.48) * 0.3, -5, 10) * 10) / 10;
    });

    // Planet sovereign fund interest (daily compounding)
    Object.entries(s.fundDeposits).forEach(([fid, fd]) => {
      if (fd.deposit > 0) {
        const fund = SOVEREIGN_FUNDS.find(f => f.id === fid);
        if (fund) {
          const earned = r2(fd.deposit * (fund.rate / 100 / 365));
          fd.earned = r2(fd.earned + earned);
          s.tradingWallet = r2(s.tradingWallet + earned);
        }
      }
    });

    // ETF price movement
    s.etfs = s.etfs.map(e => {
      const move = 1 + (Math.random() - 0.5) * 0.06;
      const np = Math.max(0.01, r2(e.price * move));
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
          const proceeds = r2(allocation * listPrice);
          const cost = r2(allocation * midpoint);
          s.tradingWallet = r2(s.tradingWallet + proceeds - cost);
          addNews('🚀', 'IPO LISTED: '+ipo.n, ipo.n+' listed at $'+listPrice.toFixed(2)+'. Your '+allocation.toLocaleString()+' shares allocated. Net: $'+r2(proceeds - cost).toFixed(2), proceeds > cost);
        } else {
          addNews('📋', 'IPO LISTED: '+ipo.n, ipo.n+' opened at $'+listPrice.toFixed(2)+'. You had no booking.', true);
        }
      }
    });

    // Savings wallet interest
    if (s.savingsWallet > 0) {
      const int = r2(s.savingsWallet * 0.02 / 365);
      s.savingsWallet = r2(s.savingsWallet + int);
    }
    if (s.foundationOpen && s.foundationBalance > 0) {
      s.foundationBalance = r2(s.foundationBalance + r2(s.foundationBalance * 0.03 / 365));
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

    // Streak
    s.streak = Math.min(s.streak + 1, 7);
    if (s.streak >= 7 && !s.streakBonus) {
      s.streakBonus = true;
      s.spinTokens = (s.spinTokens || 0) + 1;
      addNews('🎯', '7-Day Login Streak!', '10% debt forgiveness + 1 free Wheel spin token awarded.', true);
    }

    // Solar System unlock check
    if (!s.solarUnlocked) {
      const nw = s.cashWallet + s.savingsWallet + s.tradingWallet;
      const stockRegions = new Set(Object.keys(s.stockHoldings).map(t => {
        const co = s.companies.find(c => c.t === t);
        return co ? co.hq : null;
      }).filter(Boolean));
      const bondTypes = 0;
      if (nw >= 5e9 && s.turn >= 300 && stockRegions.size >= 3 && s.donCount >= 2) {
        s.solarUnlocked = true;
        addNews('🌌', 'SOLAR SYSTEM UNLOCKED!', 'You\'ve built a $5B+ empire. 7 planets now open for investment. The universe is yours.', true);
      }
    }

    refresh();
  }, [refresh, addNews]);

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
    s.companyOwnership[ticker] = Math.round((s.stockHoldings[ticker] / (TOTAL[ticker] || 500000000)) * 10000) / 100;

    const pct = s.companyOwnership[ticker];
    if (pct >= 50 && (s.companyOwnership[ticker] - qty / (TOTAL[ticker]||500000000) * 100) < 50)
      addNews('👑', 'MAJORITY CONTROL: '+ticker, 'You own '+pct.toFixed(2)+'% of '+co.n+'. You can now replace the CEO.', true);
    else if (pct >= 25 && !s._board25?.[ticker])
      { s._board25 = s._board25 || {}; s._board25[ticker] = true; addNews('🎯', 'SIGNIFICANT CONTROL: '+ticker, 'You own '+pct.toFixed(2)+'% of '+co.n+'. You can propose strategy.', true); }
    else if (pct >= 10 && !s._board10?.[ticker])
      { s._board10 = s._board10 || {}; s._board10[ticker] = true; addNews('🏛️', 'BOARD SEAT: '+ticker, 'You own '+pct.toFixed(2)+'% of '+co.n+'. You can vote on dividends.', true); }

    logTx('BUY', 'Trading', -cost, 'Bought '+qty.toLocaleString()+' '+ticker+' @ $'+co.price.toFixed(2));
    refresh();
    return null;
  }, [refresh, logTx, addNews]);

  const sellStock = useCallback((ticker, qty) => {
    const s = S.current;
    const co = s.companies.find(c => c.t === ticker);
    if (!co) return 'Company not found';
    const held = s.stockHoldings[ticker] || 0;
    if (qty > held) return 'Only '+held+' shares held';
    const proc = r2(qty * co.price);
    const profit = Math.max(0, (co.price - (s.avgCostBasis[ticker] || co.price)) * qty);
    const era = TAX_ERAS[s.eraIdx];
    const cgt = r2(profit * (era.cgt || 0.20) * (1 - (s.taxRelief || 0)));
    s.tradingWallet = r2(s.tradingWallet + proc - cgt);
    s.stockHoldings[ticker] = held - qty;
    if (!s.stockHoldings[ticker]) delete s.stockHoldings[ticker];
    const TOTAL = { SLKT:1200000000,MRDB:800000000,FRMN:600000000,TNPT:900000000,MDCR:400000000 };
    s.companyOwnership[ticker] = Math.round(((s.stockHoldings[ticker]||0) / (TOTAL[ticker] || 500000000)) * 10000) / 100;
    logTx('SELL', 'Trading', proc - cgt, 'Sold '+qty.toLocaleString()+' '+ticker+' · CGT: $'+cgt.toFixed(2)+' · Net: $'+(proc-cgt).toFixed(2));
    refresh();
    return null;
  }, [refresh, logTx]);

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

  // ── FOUNDATION ───────────────────────────────────────────────
  const openFoundation = useCallback(() => {
    const s = S.current;
    if (s.cashWallet < 50000) return 'Need $50K in Cash Wallet';
    s.cashWallet = r2(s.cashWallet - 50000);
    s.foundationOpen = true;
    logTx('FOUNDATION', 'Cash', -50000, 'Foundation opened. $50K fee. Savings Wallet now protected.');
    refresh();
    return null;
  }, [refresh, logTx]);

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
    if (!s.activeLoan) return;
    if (amount > s.tradingWallet) return;
    s.tradingWallet = r2(s.tradingWallet - amount);
    s.activeLoan.outstanding = r2(s.activeLoan.outstanding - amount);
    s.totalDebt = Math.max(0, r2(s.totalDebt - amount));
    if (s.activeLoan.outstanding <= 0) {
      s.loanHistory = [{ ...s.activeLoan, repaid: true, repaidTurn: s.turn }, ...s.loanHistory].slice(0, 10);
      s.activeLoan = null;
    }
    logTx('REPAY', 'Trading', -amount, 'Loan repayment: $'+amount.toFixed(2));
    refresh();
  }, [refresh, logTx]);

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
    refresh();
  }, [refresh, addNews]);

  // ── PLANET TRADING ───────────────────────────────────────────
  const buyPlanetStock = useCallback((planet, ticker, qty) => {
    const s = S.current;
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
    logTx('BUY_PLANET', 'Trading', -costUSD, 'Bought '+qty.toLocaleString()+' '+ticker+' on '+planet+' @ '+pd.currency+' '+co.price.toFixed(2)+' (~$'+costUSD.toFixed(2)+')');
    refresh();
    return null;
  }, [refresh, logTx]);

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
    const cgt = r2(profit * (era.cgt || 0.20));
    s.tradingWallet = r2(s.tradingWallet + procUSD - cgt);
    s.planetHoldings[key] = held - qty;
    if (!s.planetHoldings[key]) delete s.planetHoldings[key];
    refresh();
  }, [refresh]);

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
    logTx('BUY_ETF', 'Trading', -cost, 'Bought '+units+' units '+e.n+' @ $'+e.price.toFixed(2));
    refresh();
    return null;
  }, [refresh, logTx]);

  const sellETF = useCallback((etfId, units) => {
    const s = S.current;
    const e = s.etfs.find(x => x.id === etfId);
    if (!e || e.units < units) return;
    const proc = r2(units * e.price);
    const profit = Math.max(0, (e.price - e.avgCost) * units);
    const era = TAX_ERAS[s.eraIdx];
    const cgt = r2(profit * (era.cgt || 0.20));
    s.tradingWallet = r2(s.tradingWallet + proc - cgt);
    e.units -= units;
    logTx('SELL_ETF', 'Trading', proc-cgt, 'Sold '+units+' '+e.n+' · CGT: $'+cgt.toFixed(2));
    refresh();
  }, [refresh, logTx]);

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
    const mid = (ipo.priceRange[0] + ipo.priceRange[1]) / 2;
    const cost = r2(shares * mid);
    if (cost > s.tradingWallet) return 'Insufficient funds';
    s.tradingWallet = r2(s.tradingWallet - cost);
    s.ipoBookings[ipoId] = (s.ipoBookings[ipoId] || 0) + shares;
    logTx('IPO_BOOK', 'Trading', -cost, 'Booked '+shares.toLocaleString()+' shares in '+ipo.n+' IPO @ $'+mid.toFixed(2)+' midpoint');
    refresh();
    return null;
  }, [refresh, logTx]);

  // ── PHILANTHROPY ─────────────────────────────────────────────
  const donate = useCallback((catIdx, amount) => {
    const s = S.current;
    const cat = s.phiBenefits !== undefined ? require('../constants').PHI_CATS[catIdx] : null;
    // Dynamic import workaround — inline the data
    const CATS = [{n:'Healthcare',ico:'🏥',rate:.20,dur:3,mult:1.3},{n:'Education',ico:'🎓',rate:.25,dur:5,mult:1.5},{n:'Environment',ico:'🌱',rate:.30,dur:7,mult:1.1},{n:'Infrastructure',ico:'🌉',rate:.15,dur:4,mult:1.0},{n:'Poverty',ico:'🤝',rate:.20,dur:3,mult:1.2},{n:'Science',ico:'🔬',rate:.25,dur:5,mult:1.0},{n:'Arts',ico:'🎨',rate:.10,dur:2,mult:1.0},{n:'Disaster',ico:'🚨',rate:.35,dur:8,mult:1.0}];
    const c = CATS[catIdx];
    if (!c) return;
    if (amount < 1000000) return 'Minimum donation: $1M';
    if (amount > s.tradingWallet) return 'Insufficient Trading Wallet funds';
    s.tradingWallet = r2(s.tradingWallet - amount);
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
    addNews(c.ico, 'Donation: '+c.n, '$'+amount.toLocaleString()+' donated to '+c.n+'. Tax relief: '+Math.round(c.rate*100)+'% for '+c.dur+' turns. +'+pts+' redemption points.', true);
    logTx('DONATE', 'Trading', -amount, 'Donation: $'+amount.toLocaleString()+' to '+c.n+'. +'+pts+' pts.');
    refresh();
    return null;
  }, [refresh, addNews, logTx]);

  // ── WHEEL SPIN ───────────────────────────────────────────────
  const spinWheel = useCallback(() => {
    const s = S.current;
    if ((s.spinsUsed||0) >= 5) return 'Maximum 5 lifetime spins reached';
    if ((s.spinTokens||0) < 1) return 'No spin tokens';
    if ((s.redeemPts||0) < 500) return 'Need 500+ redemption points';
    if ((s.donCount||0) < 2) return 'Need 2+ donations';
    if (s.turn - (s.lastSpin||0) < 100 && s.lastSpin > 0) return 'Must wait 100 turns between spins';

    // Weighted random
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
    refresh();
    return { segIdx, msg };
  }, [refresh, addNews]);

  const value = {
    D, S,
    advanceTurn, buyStock, sellStock, transfer,
    openFoundation, takeLoan, repayLoan,
    resolveDecision, buyPlanetStock, sellPlanetStock,
    buyETF, sellETF, depositFund, withdrawFund, bookIPO, donate, spinWheel,
    addNews,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGame = () => useContext(GameContext);
