import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// HARD CAPS — prevent exponential explosion
// ═══════════════════════════════════════════════════════════════
const MAX_SHARES_PER_COMPANY = 100000;      // Max shares you can own per company
const MAX_COMM_UNITS = 10000;               // Max units per commodity
const MAX_SINGLE_TRADE_PCT = 0.20;          // Max 20% of cash per single trade
const MAX_GSF_DEPOSIT_PCT = 0.30;           // Max 30% of net worth in GSF
const STARTING_CASH = 1_000_000;
const COMM_PRICE_MIN = 0.10;               // Commodity floor price
const COMM_PRICE_MAX_MULT = 5.0;           // Max 5x from starting price
const STOCK_DAILY_CHANGE = 0.06;           // Max ±6% per turn (tighter)

// ═══════════════════════════════════════════════════════════════
// COLOUR PALETTE
// ═══════════════════════════════════════════════════════════════
const G="#2E7D32",R="#C62828",AU="#F57F17",BL="#1565C0",DK="#0D1B2A";
const fmt = n => {
  const a = Math.abs(n);
  if (a >= 1e12) return (n<0?"-":"")+"$"+(a/1e12).toFixed(2)+"T";
  if (a >= 1e9)  return (n<0?"-":"")+"$"+(a/1e9).toFixed(2)+"B";
  if (a >= 1e6)  return (n<0?"-":"")+"$"+(a/1e6).toFixed(2)+"M";
  if (a >= 1e3)  return (n<0?"-":"")+"$"+(a/1e3).toFixed(1)+"K";
  return (n<0?"-":"")+"$"+a.toFixed(2);
};
const fmtN = n => {
  // Format share counts nicely
  if (n >= 1e6) return (n/1e6).toFixed(1)+"M";
  if (n >= 1e3) return (n/1e3).toFixed(1)+"K";
  return n.toLocaleString();
};
const pct = n => (n>=0?"+":"")+((n||0)*100).toFixed(2)+"%";
const clamp = (v,mn,mx) => Math.min(Math.max(v,mn),mx);

// ═══════════════════════════════════════════════════════════════
// COMPANY DATA — Full details
// ═══════════════════════════════════════════════════════════════
const COMPANIES = [
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",r:"Asia Pacific",p:348.94,pe:18.4,div:0.8,mg:0.224,beta:1.8,emp:125000,yr:2008,hq:"Singapore",shares:1200000000,desc:"Leading AI, cloud and semiconductor company across 18 Asia Pacific countries. Primary revenue from enterprise software and data services."},
  {t:"MRDB",n:"Meridian Bank",s:"Banking",r:"US",p:85.20,pe:12.1,div:2.1,mg:0.22,beta:0.9,emp:45000,yr:1985,hq:"New York",shares:800000000,desc:"Mid-size US commercial bank. Retail, corporate and investment banking. Strong Midwest footprint with 2,400 branches."},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",r:"Africa",p:15.80,pe:8.5,div:0.5,mg:0.12,beta:1.6,emp:28000,yr:2005,hq:"Johannesburg",shares:600000000,desc:"Pan-African mining company. Iron ore, rare earth elements, lithium extraction across 9 countries. Major supplier to Asian manufacturers."},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",r:"Emerging Markets",p:351.54,pe:11.3,div:1.8,mg:0.18,beta:1.2,emp:62000,yr:1995,hq:"Dubai",shares:900000000,desc:"Major oil producer and refiner. Operations across UAE, Kuwait, Oman and Central Asia. Third-largest petroleum exporter in the Gulf."},
  {t:"AGRO",n:"AgroLatin Corp",s:"Agriculture",r:"Latin America",p:42.18,pe:13.2,div:2.5,mg:0.09,beta:1.1,emp:18000,yr:1975,hq:"São Paulo",shares:500000000,desc:"Largest agri-business in Latin America. Soy, corn, sugarcane, cattle. Controls 4.2 million hectares of farmland across Brazil and Argentina."},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",r:"US",p:198.40,pe:22.1,div:1.2,mg:0.26,beta:0.8,emp:38000,yr:2005,hq:"Boston",shares:400000000,desc:"Medical devices, diagnostics and hospital management. Operates 180 hospitals across North America. FDA-approved oncology pipeline."},
  {t:"CLFL",n:"ClearFlame Energy",s:"Energy",r:"Europe",p:112.30,pe:14.8,div:2.0,mg:0.20,beta:1.1,emp:22000,yr:2010,hq:"Amsterdam",shares:350000000,desc:"Diversified European energy company. Wind, solar and natural gas. Supplies power to 12 million households. Carbon neutral by 2027."},
  {t:"AXMB",n:"Axum Biotech",s:"Healthcare",r:"Africa",p:68.50,pe:19.4,div:0.6,mg:0.21,beta:1.4,emp:8500,yr:2012,hq:"Addis Ababa",shares:200000000,desc:"Biotech company specialising in tropical disease vaccines and African genomic medicine. WHO strategic partner. Phase-3 malaria vaccine."},
  {t:"PCMN",n:"Pacific Manufacturing",s:"Manufacturing",r:"Asia Pacific",p:76.20,pe:15.6,div:1.3,mg:0.14,beta:1.0,emp:55000,yr:1988,hq:"Seoul",shares:700000000,desc:"Electronics and automotive parts. Supplies 14 of the world's top 20 car manufacturers. Leading EV battery component producer."},
  {t:"NRDX",n:"Nordic Exchange Bank",s:"Banking",r:"Europe",p:132.10,pe:11.8,div:2.4,mg:0.21,beta:0.8,emp:32000,yr:1975,hq:"Stockholm",shares:450000000,desc:"Pan-European financial services group. Retail, wealth management and institutional banking across 18 countries. Strong Nordic market leader."},
  {t:"UTLS",n:"Utility Systems Corp",s:"Utilities",r:"US",p:58.40,pe:14.2,div:4.2,mg:0.22,beta:0.5,emp:12000,yr:1950,hq:"Chicago",shares:300000000,desc:"US electric and gas utility serving 3.2 million customers across Midwest. Regulated monopoly. Nuclear and coal power generation."},
  {t:"RLST",n:"RealEstate Trust",s:"Real Estate",r:"US",p:44.20,pe:12.8,div:3.8,mg:0.32,beta:0.7,emp:2800,yr:1995,hq:"Dallas",shares:250000000,desc:"REIT focused on commercial and industrial properties. $18B portfolio across Sun Belt. Strong logistics warehouse pipeline."},
  {t:"TLCM",n:"TeleCom Europe",s:"Telecom",r:"Europe",p:88.60,pe:13.5,div:4.5,mg:0.28,beta:0.6,emp:48000,yr:1985,hq:"Frankfurt",shares:550000000,desc:"Pan-European telecoms. Mobile, broadband, enterprise and IoT. 280 million subscribers across 22 countries. 5G leader."},
  {t:"RETL",n:"RetailHub Inc",s:"Retail",r:"US",p:38.90,pe:14.0,div:1.5,mg:0.08,beta:1.2,emp:85000,yr:2000,hq:"Seattle",shares:650000000,desc:"Omnichannel retail with 1,200 US stores and online marketplace. Loyalty programme: 48 million members. AI-driven inventory management."},
  {t:"EMTS",n:"Emerging Tech Solutions",s:"Technology",r:"Emerging Markets",p:28.40,pe:22.0,div:0.2,mg:0.15,beta:2.0,emp:6500,yr:2015,hq:"Mumbai",shares:180000000,desc:"B2B SaaS and cloud infrastructure for South and Southeast Asian enterprises. 18,000 corporate clients. Growing at 35% annually."},
];

// ═══════════════════════════════════════════════════════════════
// COMMODITIES — with price caps
// ═══════════════════════════════════════════════════════════════
const INIT_COMM = [
  {id:"OIL", n:"Crude Oil",    unit:"bbl",    p:85.0,  base:85.0,  hist:[85.0]},
  {id:"GOLD",n:"Gold",         unit:"oz",     p:1980.0,base:1980.0,hist:[1980.0]},
  {id:"SLVR",n:"Silver",       unit:"oz",     p:23.40, base:23.40, hist:[23.40]},
  {id:"NGS", n:"Natural Gas",  unit:"MMBtu",  p:2.85,  base:2.85,  hist:[2.85]},
  {id:"CORN",n:"Corn",         unit:"bushel", p:4.42,  base:4.42,  hist:[4.42]},
  {id:"WHET",n:"Wheat",        unit:"bushel", p:5.80,  base:5.80,  hist:[5.80]},
  {id:"COPR",n:"Copper",       unit:"lb",     p:3.78,  base:3.78,  hist:[3.78]},
  {id:"LITH",n:"Lithium",      unit:"kg",     p:16.50, base:16.50, hist:[16.50]},
];

// ═══════════════════════════════════════════════════════════════
// CRYPTO — with realistic prices
// ═══════════════════════════════════════════════════════════════
const INIT_CRYPTO = [
  {id:"BTC", n:"Bitcoin",  unit:"BTC", p:65000, base:65000, hist:[65000], maxHold:10},
  {id:"ETH", n:"Ethereum", unit:"ETH", p:3200,  base:3200,  hist:[3200],  maxHold:100},
  {id:"SOL", n:"Solana",   unit:"SOL", p:145,   base:145,   hist:[145],   maxHold:1000},
  {id:"BNB", n:"BNB",      unit:"BNB", p:580,   base:580,   hist:[580],   maxHold:500},
];

// ═══════════════════════════════════════════════════════════════
// FOREX — show live rates, no position trading (Phase 1 info only)
// ═══════════════════════════════════════════════════════════════
const INIT_FX = [
  {id:"EURUSD",n:"EUR/USD",p:1.0850,base:1.0850,hist:[1.0850]},
  {id:"GBPUSD",n:"GBP/USD",p:1.2680,base:1.2680,hist:[1.2680]},
  {id:"USDJPY",n:"USD/JPY",p:148.50,base:148.50,hist:[148.50]},
  {id:"USDAED",n:"USD/AED",p:3.6735,base:3.6735,hist:[3.6735],locked:true,note:"GSF buy rate — locked"},
  {id:"USDCNY",n:"USD/CNY",p:6.800, base:6.800, hist:[6.800],locked:true,note:"RMB rate — locked per Master Brief"},
  {id:"USDINR",n:"USD/INR",p:83.20, base:83.20, hist:[83.20]},
];

// ═══════════════════════════════════════════════════════════════
// BONDS
// ═══════════════════════════════════════════════════════════════
const INIT_BONDS = [
  {id:"US10Y",  n:"US Treasury 10Y",   rat:"AAA",cou:4.5, mat:2034,oy:4.5, fv:1000},
  {id:"EU10Y",  n:"EU Government 10Y", rat:"AA", cou:3.8, mat:2034,oy:3.8, fv:1000},
  {id:"SLKT-B1",n:"Silk Road Tech Bond",rat:"AA", cou:5.2, mat:2031,oy:5.2, fv:1000},
  {id:"MRDB-B1",n:"Meridian Bank Bond", rat:"AAA",cou:4.0, mat:2030,oy:4.0, fv:1000},
  {id:"AFR5Y",  n:"African Govt Bond",  rat:"BB", cou:12.5,mat:2029,oy:12.5,fv:1000},
  {id:"EM10Y",  n:"Emerging Market Bond",rat:"B", cou:14.8,mat:2032,oy:14.8,fv:1000},
];

// ═══════════════════════════════════════════════════════════════
// ACADEMY
// ═══════════════════════════════════════════════════════════════
const MODS = [
  {id:1,n:"Markets & P/E Ratios",     q:"SLKT EPS $18.95, Tech ceiling 35x. Max allowed price?",    opts:["$348","$662","$500","$418"],ans:1,exp:"Max = EPS × ceiling = $18.95 × 35 = $662.25. SLKT at 18.4x P/E is safely within bounds."},
  {id:2,n:"Bonds & Interest Rates",   q:"Bond: Face $1,000, Orig 4%, Current 3%. Governor formula price?",opts:["$1,000","$1,200","$1,333","$750"],ans:2,exp:"Price = $1,000 × (4÷3) = $1,333. Yields fall → prices rise. Always."},
  {id:3,n:"Diversification",          q:"80% in one sector. Sector Regulation fires. Best action?",   opts:["Hold","Sell all","Reduce to 30%, diversify","Buy more"],ans:2,exp:"Sector concentration creates catastrophic event risk. Reduce and diversify across sectors."},
  {id:4,n:"Tax Strategy",             q:"$500K gains. Which reduces your tax bill most legally?",      opts:["Pay full 20%","Offset $200K losses","Donate $100K","Hold longer"],ans:1,exp:"Loss harvesting: $200K losses offset $200K gains, saving $40K in CGT."},
  {id:5,n:"Commodities",              q:"Oil spikes 40% on geopolitical conflict. Who benefits most?", opts:["Healthcare","Petroleum + Energy","Utilities","Retail"],ans:1,exp:"Energy producers benefit directly. TNPT and CLFL have direct oil revenue."},
  {id:6,n:"Forex & Currency Risk",    q:"USD strengthens 15% vs SGD. Impact on SLKT revenue in USD?", opts:["Up 15%","Down 15% in USD","No impact","Up 7.5%"],ans:1,exp:"Stronger USD means SGD revenue converts to fewer dollars. Foreign revenue = -15% in USD."},
  {id:7,n:"Startups & Venture Capital",q:"$500K for 10% equity. IPO at $20M. Profit?",               opts:["$500K","$1.5M","$2M","$200K"],ans:1,exp:"10% of $20M = $2M. Less $500K cost = $1.5M profit. 3× return on seed."},
  {id:8,n:"Reading Company Financials",q:"Rev $45B, COGS $18B, OpEx $12B, Interest $2B, Tax 21%. Net income?",opts:["$15B","$10.3B","$9.75B","$12B"],ans:2,exp:"Gross $27B → Op $15B → After interest $13B → After 21% tax ≈ $9.75B."},
  {id:9,n:"Economic Cycles",          q:"GDP contracts 2 quarters, rates rising. Best defensive sectors?",opts:["Technology","Healthcare + Utilities","Mining","Retail"],ans:1,exp:"Healthcare (non-cyclical demand) and Utilities (regulated revenue) are recession-resistant."},
  {id:10,n:"Global Sovereign Fund",   q:"GSF 12.48% annual, $5M deposited. Monthly return per turn?",  opts:["$52,000","$5,200","$62,400","$520"],ans:0,exp:"$5M × (12.48% ÷ 12) = $52,000 per turn. Credited automatically every turn."},
  {id:11,n:"Legacy Building",         q:"Net worth $10B. Wealth tax rate above that threshold?",       opts:["0.1%/year","1%/year","0.1% per turn above $10B","0.5%/year"],ans:2,exp:"0.1% per TURN on the amount above $10B. At $10.5B that is $5K/turn on the excess $500M."},
  {id:12,n:"Holdings Company & M&A",  q:"You acquire 51% of a company. Governance rights?",           opts:["Voting only","Board + CEO + strategy control","Dividends priority","None"],ans:1,exp:"51%+ = controlling stake. You appoint board, CEO, set strategy. Full DEE influence tier."},
  {id:13,n:"Space Economics Preview", q:"Investing in Mars mining. Repatriation tax?",                 opts:["0%","2% Earth→Space, 5% Space→Earth","5% both","10% both"],ans:1,exp:"2% Earth→Space, 5% Space→Earth. Higher return tax reflects interplanetary risk premium."},
  {id:14,n:"Advanced Portfolio Theory",q:"Portfolio A: Sharpe 1.8, beta 0.7 vs B: 28% return, beta 1.9. Superior?",opts:["B — higher return","A — better risk-adjusted","Equal","Cycle dependent"],ans:1,exp:"Sharpe ratio 1.8 = superior risk-adjusted return. B's 28% comes with 3× the market risk."},
  {id:15,n:"Capstone",                q:"Net worth $4.8B, need $5B for Solar. Fastest legitimate path?",opts:["Buy high-beta stocks","GSF compounding","Credit line leverage","Philanthropy savings"],ans:1,exp:"GSF compounds automatically each turn without additional action. Cleanest path to $5B."},
];

// ═══════════════════════════════════════════════════════════════
// DEE EVENTS
// ═══════════════════════════════════════════════════════════════
const EVTS = [
  {id:"rc",  n:"Rate Cut",             ico:"🏦",type:"mkt",prob:.04,sent:.08, dur:10,sec:null,       good:true, desc:"Emergency rate cut. Growth stocks and bonds rally."},
  {id:"rh",  n:"Rate Hike",            ico:"📈",type:"mkt",prob:.04,sent:-.07,dur:8, sec:null,       good:false,desc:"Rate hike to fight inflation. Equity valuations compressed."},
  {id:"geo", n:"Geopolitical Crisis",  ico:"💣",type:"mkt",prob:.03,sent:-.14,dur:20,sec:["Energy","Mining"],good:false,desc:"Regional conflict — capital flees to safe havens. Energy and Mining surge."},
  {id:"com", n:"Commodity Shock",      ico:"⛽",type:"mkt",prob:.05,sent:-.08,dur:12,sec:["Energy","Agriculture"],good:false,desc:"Supply disruption — commodity-linked sectors swing hard."},
  {id:"treg",n:"Tech Regulation",      ico:"📜",type:"mkt",prob:.03,sent:-.12,dur:18,sec:["Technology"],good:false,desc:"Global tech rules — sector falls 10-15%."},
  {id:"spb", n:"Space Breakthrough",   ico:"🛸",type:"mkt",prob:.025,sent:.10,dur:15,sec:["Mining"],  good:true, desc:"Jupiter discovery — space surges, Earth mining faces headwinds."},
  {id:"td",  n:"Trade Deal Signed",    ico:"🤝",type:"mkt",prob:.04,sent:.09, dur:12,sec:null,       good:true, desc:"New bilateral deal — markets rally, cross-regional stocks benefit."},
  {id:"pan", n:"Pandemic Scare",       ico:"🦠",type:"mkt",prob:.02,sent:-.10,dur:25,sec:["Retail","Manufacturing"],good:false,desc:"Health emergency — consumer sectors collapse, healthcare surges."},
  {id:"pat", n:"Patent Approved",      ico:"⚡",type:"co", prob:.05,imp:.28,  dur:5,  good:true, desc:"Key patent granted. Stock surges 28%, P/E re-rates upward."},
  {id:"scn", n:"CEO Scandal",          ico:"💼",type:"co", prob:.03,imp:-.25, dur:15, good:false,desc:"Misconduct revealed. 25%+ stake holders receive 2-turn advance notice."},
  {id:"bea", n:"Earnings Beat",        ico:"💰",type:"co", prob:.10,imp:.20,  dur:6,  good:true, desc:"Results beat consensus. Market reprices upward over 6 turns."},
  {id:"mis", n:"Earnings Miss",        ico:"📉",type:"co", prob:.09,imp:-.18, dur:6,  good:false,desc:"Results disappoint. Institutional selling begins."},
  {id:"con", n:"Govt Contract Won",    ico:"🏛️",type:"co", prob:.04,imp:.22,  dur:35, good:true, desc:"Major contract. Revenue visible for 35 turns. P/E re-rates."},
  {id:"str", n:"Labour Strike",        ico:"✊",type:"co", prob:.03,imp:-.20, dur:12, good:false,desc:"Workers walk out. Production halts for strike duration."},
  {id:"rec", n:"Product Recall",       ico:"⚠️",type:"co", prob:.03,imp:-.15, dur:10, good:false,desc:"Defective product pulled. One-time cost spike, brand damage."},
];

const PEB = {
  Technology:{min:15,max:35},Banking:{min:8,max:15},Mining:{min:6,max:12},
  Energy:{min:8,max:20},Agriculture:{min:10,max:18},Healthcare:{min:12,max:35},
  Manufacturing:{min:10,max:25},Utilities:{min:12,max:18},
  "Real Estate":{min:8,max:16},Telecom:{min:10,max:16},Retail:{min:10,max:18},
};
const RMU = {AAA:1.02,AA:1.01,A:1.00,BBB:0.99,BB:0.97,B:0.94};

// ═══════════════════════════════════════════════════════════════
// GOVERNOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════
function gBond(fv,oy,cy,rat){
  const y=clamp(cy/100,0.01,0.45);
  return clamp(Math.round(fv*(oy/100)/y*(RMU[rat]||1)*100)/100,fv*0.05,fv*2);
}

function govStock(cos,gdp,inf,intr,evts){
  return cos.map(c=>{
    const pp=c.price;
    const eps=pp/c.pe;
    // Tight macro factor — no runaway
    const macro=clamp(1+(gdp/100*0.4*c.beta)-(inf/100*0.2)-(intr/100*0.2*c.beta),0.90,1.10);
    // Bounded random noise
    const noise=1+(Math.random()-0.5)*0.08*c.beta;
    // Event modifier
    let em=0;
    evts.forEach(e=>{
      if(e.type==="mkt"&&(!e.sec||e.sec.includes(c.s)))em+=e.sent*(e.tl/e.dur)*0.12;
      if(e.type==="co"&&e.tk===c.t)em+=e.imp*(e.tl/e.dur)*0.12;
    });
    let np=pp*clamp(noise*macro,1-STOCK_DAILY_CHANGE,1+STOCK_DAILY_CHANGE);
    if(em!==0)np=np*(1+em*0.5); // Half-weight event impact
    np=clamp(np,pp*(1-STOCK_DAILY_CHANGE),pp*(1+STOCK_DAILY_CHANGE)); // Hard daily cap
    const b=PEB[c.s]||{min:10,max:40};
    const newPE=np/eps;
    if(newPE<b.min)np=eps*b.min;
    if(newPE>b.max)np=eps*b.max;
    np=Math.max(0.50,Math.round(np*100)/100);
    const newPEfinal=Math.round(np/eps*10)/10;
    return {...c,pp,price:np,pe:newPEfinal,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-50),np]};
  });
}

function govComm(comm,evts){
  return comm.map(c=>{
    const pp=c.p;
    // Capped drift — max ±4% per turn
    let drift=1+(Math.random()-0.5)*0.06;
    // Event-driven but capped
    if((c.id==="OIL"||c.id==="NGS")&&evts.find(e=>e.id==="geo"||e.id==="com"))drift=clamp(drift*1.03,0.96,1.04);
    if(c.id==="GOLD"&&evts.find(e=>!e.good))drift=clamp(drift*1.015,0.96,1.04);
    if(c.id==="LITH"&&evts.find(e=>e.id==="spb"))drift=clamp(drift*0.95,0.96,1.04);
    drift=clamp(drift,0.96,1.04); // Hard ±4% cap
    // Price cap: can't go more than 5x or below 10% of base
    const np=clamp(
      Math.round(pp*drift*100)/100,
      Math.max(COMM_PRICE_MIN,c.base*0.20),
      c.base*COMM_PRICE_MAX_MULT
    );
    return {...c,p:np,pp,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-50),np]};
  });
}

function govCrypto(crypto){
  return crypto.map(c=>{
    const pp=c.p;
    // Crypto is volatile but capped
    const drift=1+(Math.random()-0.5)*0.12;
    const np=clamp(
      Math.round(pp*clamp(drift,0.92,1.08)*100)/100,
      c.base*0.10, c.base*10.0 // Can go 10x but not more
    );
    return {...c,p:np,pp,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-50),np]};
  });
}

function govFx(fx){
  return fx.map(f=>{
    if(f.locked)return{...f,ch:0}; // Locked rates don't move
    const pp=f.p;
    const np=Math.round(pp*clamp(1+(Math.random()-0.5)*0.005,0.995,1.005)*10000)/10000;
    return {...f,p:np,pp,ch:(np-pp)/pp,hist:[...(f.hist||[pp]).slice(-50),np]};
  });
}

// ═══════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════
const Bdg=({v,size=10})=>(
  <span style={{background:v>=0?"#E8F5E9":"#FFEBEE",color:v>=0?G:R,padding:"2px 7px",borderRadius:20,fontSize:size,fontWeight:700,fontFamily:"DM Mono,monospace",whiteSpace:"nowrap"}}>{pct(v)}</span>
);

const MChart=({hist,color,w=70,h=28})=>{
  if(!hist||hist.length<2)return null;
  const mn=Math.min(...hist)*0.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;
  const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");
  return(
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color||(hist[hist.length-1]>=(hist[0]||0)?G:R)} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
};

const WChart=({hist})=>{
  if(!hist||hist.length<2)return null;
  const w=300,h=50,mn=Math.min(...hist)*0.97,mx=Math.max(...hist)*1.03,rng=mx-mn||1;
  const line=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");
  const fill=[...hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`),`${w},${h}`,`0,${h}`].join(" ");
  return(
    <svg width="100%" height={h} viewBox={"0 0 "+w+" "+h} preserveAspectRatio="none">
      <defs><linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4CAF50" stopOpacity=".3"/><stop offset="100%" stopColor="#4CAF50" stopOpacity="0"/></linearGradient></defs>
      <polygon points={fill} fill="url(#wg)"/>
      <polyline points={line} fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
};

// Amount picker — fixed presets based on context, no absurd numbers
function APick({maxCash, unitPrice=1, maxUnits, sel, onSel, label="$"}){
  // Generate sensible presets
  const isUnit = maxUnits !== undefined;
  let presets;
  if(isUnit){
    // Unit-based (shares, commodity qty, crypto qty)
    const mx=Math.min(maxUnits, MAX_SHARES_PER_COMPANY);
    presets=[1,5,10,25,50,100,500,1000,5000,10000].filter(v=>v<=mx);
    presets.push(mx);
    presets=[...new Set(presets)].slice(-8);
  } else {
    // Dollar-based (buy stocks or commodities by $)
    const mx=Math.min(maxCash, maxCash*MAX_SINGLE_TRADE_PCT);
    // Build reasonable presets
    const raw=[1000,5000,10000,50000,100000,250000,500000,1000000];
    presets=raw.filter(v=>v<=mx);
    if(presets[presets.length-1]!==mx)presets.push(mx);
    presets=presets.slice(-8);
  }

  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
      {presets.map((v,i)=>(
        <button key={i} onClick={()=>onSel(v)}
          style={{padding:"10px 4px",borderRadius:9,border:"2px solid "+(sel===v?G:"#e0e0e0"),background:sel===v?"#E8F5E9":"#fafafa",color:sel===v?G:"#555",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>
          {isUnit?fmtN(v):fmt(v)}
        </button>
      ))}
    </div>
  );
}

const SB=({l,v,c,sub})=>(
  <div style={{background:"#f8fbf8",borderRadius:9,padding:"9px 10px",flex:1,minWidth:0}}>
    <div style={{fontSize:8,color:"#bbb",textTransform:"uppercase",letterSpacing:.7,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l}</div>
    <div style={{fontSize:13,fontWeight:800,color:c||DK,fontFamily:"DM Mono,monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div>
    {sub&&<div style={{fontSize:8,color:"#bbb",marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sub}</div>}
  </div>
);

const Row=({k,v,vc,b})=>(
  <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f0f0f0"}}>
    <span style={{fontSize:12,color:"#666",flex:1}}>{k}</span>
    <span style={{fontSize:12,fontWeight:b?800:600,color:vc||DK,fontFamily:"DM Mono,monospace",textAlign:"right"}}>{v}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App(){
  const[tab,setTab]=useState("dash");
  const[lang,setLang]=useState("en");
  const rtl=lang==="ar"||lang==="ur";
  const LANGS=["en","ar","ur","zh","fr"];
  const FLAGS=["🇬🇧","🇸🇦","🇵🇰","🇨🇳","🇫🇷"];

  // ALL game state in a ref — avoids stale closure problem
  const S=useRef({
    turn:1,
    cash:STARTING_CASH,
    gdp:2.5,inf:3.2,intr:4.5,gsf:12.48,
    cos:COMPANIES.map(c=>({...c,pp:c.p,price:c.p,ch:0,hist:[c.p,c.p]})),
    comm:INIT_COMM,
    crypto:INIT_CRYPTO,
    fx:INIT_FX,
    bonds:INIT_BONDS.map(b=>({...b,cy:b.oy})),
    aevts:[],
    // Holdings
    sh:{},   // {ticker: shares}  — capped at MAX_SHARES_PER_COMPANY
    bh:{},   // {bondId: qty}
    ch:{},   // {commId: qty}     — capped at MAX_COMM_UNITS
    crh:{},  // {cryptoId: qty}   — capped per crypto.maxHold
    avgCost:{},  // {ticker: avgPrice}
    commCost:{}, // {commId: avgPrice}
    cryptoCost:{},
    gsfDep:0,
    dons:0,
    taxReduction:0,
    mods:MODS.map(m=>({...m,done:false,score:null})),
    news:[
      {id:1,t:1,ico:"🌐",ti:"Galactic Raider: Capital Exchange",bo:"$1,000,000 starting capital. 15 stocks · 8 commodities · 4 crypto · 6 forex pairs. Economic Governor active. All prices capped.",g:true},
      {id:2,t:1,ico:"⚖️",ti:"Governor Online — All Systems Normal",bo:"P/E bounds validated. Stock ±6%/turn max. Commodity ±4%/turn max capped at 5× base. Crypto ±8%/turn. Position limits active.",g:true},
      {id:3,t:1,ico:"💡",ti:"Position Limits Active",bo:"Max "+fmtN(MAX_SHARES_PER_COMPANY)+" shares per stock. Max "+fmtN(MAX_COMM_UNITS)+" units per commodity. Max 20% of cash per single trade. Prevents number explosions.",g:true},
    ],
    elog:[
      {lv:"OK",t:1,sc:"Governor",msg:"All 15 companies initialised within P/E bounds — 5–50x"},
      {lv:"OK",t:1,sc:"Risk",msg:"Position limits: max "+MAX_SHARES_PER_COMPANY+" shares per co · max 20% cash per trade"},
      {lv:"OK",t:1,sc:"System",msg:"$1,000,000 starting capital. CGT on profit only."},
    ],
    wh:[STARTING_CASH,STARTING_CASH],
  });

  const[display,setDisplay]=useState(()=>({...S.current}));
  const[auto,setAuto]=useState(false);
  const[simSpeed,setSimSpeed]=useState(30); // seconds
  const[evN,setEvN]=useState(null);
  const[toast,setToast]=useState(null);
  const autoRef=useRef(null);

  // UI modal state
  const[selCo,setSelCo]=useState(null);
  const[trModal,setTrModal]=useState(null);
  const[trAmt,setTrAmt]=useState(null);
  const[donModal,setDonModal]=useState(null);
  const[donAmt,setDonAmt]=useState(null);
  const[gsfModal,setGsfModal]=useState(false);
  const[gsfAmt,setGsfAmt]=useState(null);
  const[quizM,setQuizM]=useState(null);
  const[quizA,setQuizA]=useState(null);
  const[beta,setBeta]=useState(false);
  const[filterSec,setFilterSec]=useState("All");
  const[coTab,setCoTab]=useState("overview"); // for company detail tabs

  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2500);},[]);
  const refresh=useCallback(()=>setDisplay({...S.current}),[]);

  // ── ADVANCE TURN ────────────────────────────────────────────
  const advance=useCallback(()=>{
    const s=S.current;
    s.turn++;
    const nn=[];

    // Macro drift — bounded
    s.gdp=Math.round(clamp(s.gdp+(Math.random()-.48)*0.5,-3,7)*10)/10;
    s.inf=Math.round(clamp(s.inf+(Math.random()-.5)*0.3,0,12)*10)/10;
    s.intr=Math.round(clamp(s.intr+(Math.random()-.5)*0.2,0.5,12)*10)/10;
    s.gsf=Math.round(clamp(s.gsf+(Math.random()-.5)*0.25,0.5,14)*100)/100;

    // Tick events
    s.aevts=s.aevts.map(e=>({...e,tl:e.tl-1})).filter(e=>e.tl>0);

    // Fire new events
    EVTS.forEach(ed=>{
      if(Math.random()<ed.prob){
        if(ed.type==="co"){
          const elig=s.cos.filter(c=>!s.aevts.find(a=>a.id===ed.id&&a.tk===c.t));
          if(elig.length){
            const tg=elig[Math.floor(Math.random()*elig.length)];
            const ev={...ed,tk:tg.t,cn:tg.n,tl:ed.dur,dur:ed.dur};
            s.aevts.push(ev);
            nn.push({id:Math.random(),t:s.turn,ico:ed.ico,ti:ed.n+" — "+tg.n,bo:ed.desc,g:ed.good});
            setEvN({...ev});setTimeout(()=>setEvN(null),5000);
            s.elog.unshift({lv:ed.good?"OK":"HIGH",t:s.turn,sc:"DEE",msg:ed.n+" on "+tg.t});
          }
        }else if(!s.aevts.find(a=>a.id===ed.id)){
          s.aevts.push({...ed,tl:ed.dur,dur:ed.dur});
          nn.push({id:Math.random(),t:s.turn,ico:ed.ico,ti:ed.n,bo:ed.desc,g:ed.good});
          setEvN({...ed});setTimeout(()=>setEvN(null),5000);
          s.elog.unshift({lv:ed.good?"OK":"MEDIUM",t:s.turn,sc:"DEE",msg:"Market: "+ed.n});
        }
      }
    });

    // Governor price steps
    s.cos=govStock(s.cos,s.gdp,s.inf,s.intr,s.aevts);
    s.comm=govComm(s.comm,s.aevts);
    s.crypto=govCrypto(s.crypto);
    s.fx=govFx(s.fx);
    s.bonds=s.bonds.map(b=>({...b,cy:Math.round(clamp(b.cy+(Math.random()-.5)*0.25,1,45)*100)/100}));

    // GSF return — capped at reasonable amount
    if(s.gsfDep>0){
      const ret=Math.round(s.gsfDep*(s.gsf/100/12)*100)/100;
      s.cash=Math.round((s.cash+ret)*100)/100;
      if(s.turn%20===0)s.elog.unshift({lv:"OK",t:s.turn,sc:"GSF",msg:"Return "+fmt(ret)+" @ "+s.gsf.toFixed(2)+"%/yr"});
    }

    // Dividends every 10 turns
    if(s.turn%10===0){
      let div=0;
      Object.entries(s.sh).forEach(([t,n])=>{
        const c=s.cos.find(x=>x.t===t);
        if(c&&c.div>0)div+=c.price*(c.div/100)*n;
      });
      if(div>0){
        s.cash=Math.round((s.cash+div)*100)/100;
        nn.push({id:Math.random(),t:s.turn,ico:"💰",ti:"Dividends Received",bo:fmt(div)+" credited. 15% withholding applied once.",g:true});
      }
    }

    // Wealth tax — only on EXCESS above $10B
    const nw=s.cash+Object.entries(s.sh).reduce((sum,[t,n])=>{const c=s.cos.find(x=>x.t===t);return sum+(c?c.price*n:0);},0)+s.gsfDep;
    if(nw>10e9){
      const excess=nw-10e9;
      const tx=Math.round(excess*0.001*100)/100;
      s.cash=Math.max(0,s.cash-tx);
      if(s.turn%10===0)s.elog.unshift({lv:"OK",t:s.turn,sc:"Tax",msg:"Wealth tax "+fmt(tx)+" on "+fmt(excess)+" excess above $10B"});
    }

    // Governor validation log every 10 turns
    if(s.turn%10===0){
      const vio=s.cos.filter(c=>{const b=PEB[c.s]||{min:10,max:40};return c.pe<b.min||c.pe>b.max;});
      s.elog.unshift({lv:vio.length?"CRIT":"OK",t:s.turn,sc:"Governor",msg:vio.length?"P/E breach: "+vio.map(v=>v.t).join(","):"T"+s.turn+": all "+s.cos.length+" cos within P/E bounds"});
    }

    if([100,300,500,1000].includes(s.turn)){
      const ms={100:"M1 — Governor stable.",300:"M2 — Solar unlock window opens.",500:"M3 — Full DEE running.",1000:"M4 — LAUNCH GATE."};
      nn.push({id:Math.random(),t:s.turn,ico:"🏁",ti:"Milestone: Turn "+s.turn,bo:ms[s.turn],g:true});
    }

    s.wh=[...s.wh.slice(-60),nw];
    s.news=[...nn.reverse(),...s.news].slice(0,100);
    s.elog=s.elog.slice(0,100);
    refresh();
  },[refresh]);

  useEffect(()=>{
    if(auto){autoRef.current=setInterval(advance,simSpeed*1000);}
    else clearInterval(autoRef.current);
    return()=>clearInterval(autoRef.current);
  },[auto,advance,simSpeed]);

  // ── COMPUTED ───────────────────────────────────────────────
  const d=display;
  const sv=Object.entries(d.sh).reduce((sum,[t,n])=>{const c=d.cos.find(x=>x.t===t);return sum+(c?c.price*n:0);},0);
  const bv=Object.entries(d.bh).reduce((sum,[id,q])=>{const b=d.bonds.find(x=>x.id===id);return sum+(b?gBond(b.fv,b.oy,b.cy,b.rat)*q:0);},0);
  const cv=Object.entries(d.ch||{}).reduce((sum,[id,q])=>{const c=d.comm.find(x=>x.id===id);return sum+(c?c.p*q:0);},0);
  const crv=Object.entries(d.crh||{}).reduce((sum,[id,q])=>{const c=d.crypto.find(x=>x.id===id);return sum+(c?c.p*q:0);},0);
  const nw=d.cash+sv+bv+cv+crv+d.gsfDep;
  const pnw=d.wh[d.wh.length-2]||STARTING_CASH;
  const nwch=nw-pnw;
  const adone=d.mods.filter(m=>m.done).length;
  const regs=new Set(Object.keys(d.sh).map(t=>d.cos.find(c=>c.t===t)?.r).filter(Boolean));
  const sc={
    nw:{met:nw>=5e9,l:"Net Worth $5B",v:fmt(nw)},
    turns:{met:d.turn>=300,l:"Turn 300",v:d.turn+"/300"},
    regions:{met:regs.size>=3,l:"3 Regions",v:regs.size+"/3"},
    bonds:{met:Object.keys(d.bh).length>=2,l:"2 Bonds",v:Object.keys(d.bh).length+"/2"},
    academy:{met:adone>=3,l:"3 Academy",v:adone+"/3"},
    phi:{met:d.dons>=2,l:"2 Donations",v:d.dons+"/2"},
  };
  const spct=Math.round(Object.values(sc).filter(x=>x.met).length/6*100);

  // ── TRADE ACTIONS ──────────────────────────────────────────
  const execTrade=()=>{
    if(!trModal||!trAmt)return;
    const s=S.current;
    const{type,item,mode}=trModal;
    const isBuy=mode==="buy";

    if(type==="stock"){
      const shares=trAmt; // already a share count
      if(isBuy){
        const cost=Math.round(shares*item.price*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        const currentHeld=s.sh[item.t]||0;
        if(currentHeld+shares>MAX_SHARES_PER_COMPANY){toast_("Max "+fmtN(MAX_SHARES_PER_COMPANY)+" shares per company",false);return;}
        s.cash=Math.round((s.cash-cost)*100)/100;
        s.sh[item.t]=(currentHeld)+shares;
        const prevCost=(s.avgCost[item.t]||item.price)*currentHeld;
        s.avgCost[item.t]=Math.round((prevCost+cost)/(s.sh[item.t])*100)/100;
        s.elog.unshift({lv:"OK",t:s.turn,sc:"Trade",msg:"BUY "+fmtN(shares)+" "+item.t+" @ "+fmt(item.price)+" = "+fmt(cost)});
        toast_("Bought "+fmtN(shares)+" "+item.t+" @ "+fmt(item.price));
      }else{
        const held=s.sh[item.t]||0;
        if(shares>held){toast_("Only "+fmtN(held)+" held",false);return;}
        const proceeds=Math.round(shares*item.price*100)/100;
        const avgC=s.avgCost[item.t]||item.price;
        const profitPerShare=Math.max(0,item.price-avgC);
        const effectiveCGT=0.20*(1-s.taxReduction);
        const tax=Math.round(shares*profitPerShare*effectiveCGT*100)/100;
        const net=proceeds-tax;
        s.cash=Math.round((s.cash+net)*100)/100;
        s.sh[item.t]=held-shares;
        if(s.sh[item.t]<=0)delete s.sh[item.t];
        s.elog.unshift({lv:"OK",t:s.turn,sc:"CGT",msg:"SELL "+fmtN(shares)+" "+item.t+" · Profit/sh: "+fmt(profitPerShare)+" · Tax: "+fmt(tax)+" · Net: "+fmt(net)});
        toast_("Sold "+fmtN(shares)+" "+item.t+". Net: "+fmt(net));
      }
    }

    if(type==="comm"){
      const qty=trAmt;
      if(isBuy){
        const cost=Math.round(qty*item.p*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        const curr=s.ch[item.id]||0;
        if(curr+qty>MAX_COMM_UNITS){toast_("Max "+MAX_COMM_UNITS+" units per commodity",false);return;}
        s.cash=Math.round((s.cash-cost)*100)/100;
        s.ch[item.id]=(curr)+qty;
        s.commCost[item.id]=item.p;
        toast_("Bought "+qty+" "+item.unit+" of "+item.n);
      }else{
        const held=s.ch[item.id]||0;
        if(qty>held){toast_("Only "+held+" held",false);return;}
        const proceeds=Math.round(qty*item.p*100)/100;
        const avgC=s.commCost[item.id]||item.p;
        const profit=Math.max(0,(item.p-avgC)*qty);
        const tax=Math.round(profit*(0.20*(1-s.taxReduction))*100)/100;
        s.cash=Math.round((s.cash+proceeds-tax)*100)/100;
        s.ch[item.id]=held-qty;
        if(s.ch[item.id]<=0)delete s.ch[item.id];
        toast_("Sold "+qty+" "+item.unit+". Tax on profit: "+fmt(tax));
      }
    }

    if(type==="crypto"){
      const qty=trAmt;
      if(isBuy){
        const cost=Math.round(qty*item.p*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        const curr=s.crh[item.id]||0;
        if(curr+qty>item.maxHold){toast_("Max "+item.maxHold+" "+item.unit+" allowed",false);return;}
        s.cash=Math.round((s.cash-cost)*100)/100;
        s.crh[item.id]=(curr)+qty;
        s.cryptoCost[item.id]=item.p;
        toast_("Bought "+qty+" "+item.id+" @ "+fmt(item.p));
      }else{
        const held=s.crh[item.id]||0;
        if(qty>held){toast_("Only "+held+" held",false);return;}
        const proceeds=Math.round(qty*item.p*100)/100;
        const avgC=s.cryptoCost[item.id]||item.p;
        const profit=Math.max(0,(item.p-avgC)*qty);
        const tax=Math.round(profit*(0.20*(1-s.taxReduction))*100)/100;
        s.cash=Math.round((s.cash+proceeds-tax)*100)/100;
        s.crh[item.id]=held-qty;
        if(s.crh[item.id]<=0)delete s.crh[item.id];
        toast_("Sold "+qty+" "+item.id+". Tax: "+fmt(tax));
      }
    }

    if(type==="bond"){
      const pr=gBond(item.fv,item.oy,item.cy,item.rat);
      const qty=trAmt;
      if(isBuy){
        const cost=Math.round(pr*qty*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.cash=Math.round((s.cash-cost)*100)/100;
        s.bh[item.id]=(s.bh[item.id]||0)+qty;
        toast_("Bought "+qty+"× "+item.n+" @ "+fmt(pr));
      }else{
        const held=s.bh[item.id]||0;
        if(qty>held){toast_("Only "+held+" held",false);return;}
        const proceeds=Math.round(pr*qty*100)/100;
        s.cash=Math.round((s.cash+proceeds)*100)/100;
        s.bh[item.id]=held-qty;
        if(s.bh[item.id]<=0)delete s.bh[item.id];
        toast_("Sold "+qty+"× bond. Proceeds: "+fmt(proceeds));
      }
    }

    setTrModal(null);setTrAmt(null);
    refresh();
  };

  const doDonate=()=>{
    if(!donAmt||donAmt>S.current.cash){toast_("Insufficient cash",false);return;}
    S.current.cash=Math.round((S.current.cash-donAmt)*100)/100;
    S.current.dons++;
    S.current.taxReduction=Math.min(0.25,S.current.taxReduction+0.05);
    S.current.news.unshift({id:Math.random(),t:S.current.turn,ico:"❤️",ti:"Donation: "+donModal,bo:fmt(donAmt)+" donated. CGT now reduced by "+(S.current.taxReduction*100).toFixed(0)+"%. Solar criteria: "+S.current.dons+"/2.",g:true});
    S.current.elog.unshift({lv:"OK",t:S.current.turn,sc:"Tax",msg:"Donation "+fmt(donAmt)+" → CGT reduction: "+(S.current.taxReduction*100).toFixed(0)+"%"});
    toast_("Donated "+fmt(donAmt)+" ❤️ CGT now "+(20*(1-S.current.taxReduction)).toFixed(0)+"% on profit");
    setDonModal(null);setDonAmt(null);refresh();
  };

  const doGsf=()=>{
    if(!gsfAmt||gsfAmt>S.current.cash){toast_("Insufficient cash",false);return;}
    const maxGsf=nw*MAX_GSF_DEPOSIT_PCT;
    if(S.current.gsfDep+gsfAmt>maxGsf){toast_("Max GSF deposit: "+fmt(maxGsf)+" (30% of net worth)",false);return;}
    S.current.cash=Math.round((S.current.cash-gsfAmt)*100)/100;
    S.current.gsfDep+=gsfAmt;
    S.current.elog.unshift({lv:"OK",t:S.current.turn,sc:"GSF",msg:"Deposit "+fmt(gsfAmt)+" @ "+S.current.gsf.toFixed(2)+"%/yr"});
    toast_("Deposited "+fmt(gsfAmt)+" to GSF");
    setGsfModal(false);setGsfAmt(null);refresh();
  };

  const doModule=(m)=>{
    const score=72+Math.floor(Math.random()*27);
    S.current.mods=S.current.mods.map(x=>x.id===m.id?{...x,done:true,score}:x);
    S.current.news.unshift({id:Math.random(),t:S.current.turn,ico:"🎓",ti:"Academy: "+m.n,bo:"Score: "+score+"%. "+(S.current.mods.filter(x=>x.done).length)+"/15 done.",g:true});
    toast_(m.n+" — "+score+"%");
    setQuizM(null);setQuizA(null);refresh();
  };

  // ── TABS ───────────────────────────────────────────────────
  const TABS=[
    {id:"dash",ico:"🏠",l:"Home"},{id:"mkt",ico:"📊",l:"Stocks"},
    {id:"comm",ico:"⛽",l:"Commod."},{id:"crypto",ico:"₿",l:"Crypto"},
    {id:"fx",ico:"💱",l:"Forex"},{id:"bonds",ico:"📋",l:"Bonds"},
    {id:"port",ico:"💼",l:"Port."},{id:"ac",ico:"🎓",l:"Learn"},
    {id:"ph",ico:"❤️",l:"Give"},{id:"gsf",ico:"🏛️",l:"GSF"},
    {id:"sol",ico:"☀️",l:"Solar"},{id:"set",ico:"⚙️",l:"Set."},
  ];
  const ts=id=>({padding:"4px 0 3px",flex:1,border:"none",background:tab===id?"#fff":"transparent",borderRadius:tab===id?6:0,color:tab===id?G:"#aaa",fontWeight:700,fontSize:7.5,cursor:"pointer",fontFamily:"DM Sans,sans-serif",textAlign:"center",boxShadow:tab===id?"0 1px 3px rgba(0,0,0,.1)":"none",minWidth:0,transition:"all .12s"});

  // ══════════════════════════════════════════════════════════
  // SCREENS
  // ══════════════════════════════════════════════════════════

  const Dash=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:16,padding:17,color:"#fff",overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",top:-35,right:-35,width:120,height:120,background:"rgba(255,255,255,.05)",borderRadius:"50%"}}/>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Total Net Worth</div>
        <div style={{fontSize:34,fontWeight:800,fontFamily:"DM Mono,monospace",lineHeight:1,marginBottom:4}}>{fmt(nw)}</div>
        <div style={{fontSize:11,opacity:.9,marginBottom:10}}>{nwch>=0?"📈":"📉"} {fmt(Math.abs(nwch))} ({nwch>=0?"+":""}{pnw>0?((nwch/pnw)*100).toFixed(2):0}%) last turn</div>
        <div style={{height:46}}><WChart hist={d.wh}/></div>
        <div style={{display:"flex",gap:8,marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.15)"}}>
          {[["Cash",fmt(d.cash)],["Stocks",fmt(sv)],["Bonds",fmt(bv)],["Comm",fmt(cv)],["Crypto",fmt(crv)],["GSF",fmt(d.gsfDep)]].map(([k,v])=>(
            <div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:7,opacity:.45,textTransform:"uppercase"}}>{k}</div><div style={{fontSize:9,fontWeight:700,fontFamily:"DM Mono,monospace",marginTop:1}}>{v}</div></div>
          ))}
        </div>
      </div>

      {/* Turn + Speed controls */}
      <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <span style={{fontSize:14,fontWeight:800,color:DK}}>Turn {d.turn}</span>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            <span style={{fontSize:9,color:"#bbb"}}>Speed:</span>
            {[{l:"30s",v:30},{l:"60s",v:60},{l:"120s",v:120}].map(s=>(
              <button key={s.v} onClick={()=>setSimSpeed(s.v)} style={{padding:"3px 8px",borderRadius:20,border:"1.5px solid "+(simSpeed===s.v?G:"#ddd"),background:simSpeed===s.v?G:"#fff",color:simSpeed===s.v?"#fff":"#666",fontWeight:600,fontSize:9,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>{s.l}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:7}}>
          <button onClick={advance} disabled={auto} style={{flex:3,background:auto?"#e0e0e0":G,color:auto?"#aaa":"#fff",border:"none",borderRadius:9,padding:"12px 0",fontWeight:800,fontSize:13,cursor:auto?"not-allowed":"pointer",fontFamily:"DM Sans,sans-serif"}}>▶ Advance Turn</button>
          <button onClick={()=>setAuto(a=>!a)} style={{flex:2,background:auto?"#B71C1C":"#f0f4f0",color:auto?"#fff":"#666",border:"1px solid #ddd",borderRadius:9,padding:"12px 0",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>{auto?"⏹ Stop":"Auto "+simSpeed+"s"}</button>
        </div>
      </div>

      {/* Solar progress */}
      <div onClick={()=>setTab("sol")} style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:12,padding:12,cursor:"pointer",border:"1px solid rgba(212,175,55,.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:17}}>☀️</span><div><div style={{fontSize:11,fontWeight:700,color:"#F0D060"}}>Solar System {spct===100?"— UNLOCKED!":"Progress"}</div><div style={{fontSize:8,color:"rgba(240,208,96,.4)"}}>{Object.values(sc).filter(x=>x.met).length}/6 criteria</div></div></div>
          <span style={{fontFamily:"DM Mono,monospace",fontSize:14,fontWeight:700,color:"#F0D060"}}>{spct}%</span>
        </div>
        <div style={{height:5,background:"rgba(255,255,255,.07)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:3,transition:"width .5s"}}/></div>
        <div style={{display:"flex",gap:4,marginTop:7,flexWrap:"wrap"}}>
          {Object.values(sc).map((c2,i)=><span key={i} style={{fontSize:8,padding:"2px 6px",borderRadius:20,background:c2.met?"rgba(0,230,118,.15)":"rgba(255,255,255,.05)",color:c2.met?"#00E676":"rgba(255,255,255,.3)",fontWeight:600}}>{c2.met?"✓ ":""}{c2.l}</span>)}
        </div>
      </div>

      {/* Macro */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        {[{l:"GDP Growth",v:(d.gdp>=0?"+":"")+d.gdp+"%",c:d.gdp>=0?G:R},{l:"Inflation",v:d.inf+"%",c:d.inf>6?R:d.inf>3?AU:G},{l:"Interest Rate",v:d.intr+"%",c:"#444"},{l:"GSF Rate/yr",v:d.gsf.toFixed(2)+"%",c:G}].map(x=>(
          <div key={x.l} style={{background:"#fff",borderRadius:10,padding:"9px 11px",border:"1px solid #eee"}}><div style={{fontSize:8,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{x.l}</div><div style={{fontSize:17,fontWeight:800,color:x.c,fontFamily:"DM Mono,monospace"}}>{x.v}</div></div>
        ))}
      </div>

      {/* Active events */}
      {d.aevts.length>0&&<div><div style={{fontSize:10,fontWeight:700,color:"#bbb",marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>Active Events ({d.aevts.length})</div>
        {d.aevts.slice(0,3).map((e,i)=><div key={i} style={{background:e.good?"#E8F5E9":"#FFEBEE",borderRadius:9,padding:"8px 11px",border:"1px solid "+(e.good?"#A5D6A7":"#EF9A9A"),display:"flex",alignItems:"center",gap:8,marginBottom:5}}><span style={{fontSize:17}}>{e.ico}</span><div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:e.good?G:R}}>{e.n}{e.cn?" — "+e.cn:""}</div><div style={{fontSize:9,color:"#888"}}>{e.tl}/{e.dur} turns · {e.desc}</div></div></div>)}</div>}

      {/* Top holdings */}
      {Object.keys(d.sh).filter(t=>(d.sh[t]||0)>0).length>0&&<div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:9}}>Holdings Summary</div>
        {Object.entries(d.sh).filter(([,n])=>n>0).slice(0,3).map(([t,n])=>{
          const c=d.cos.find(x=>x.t===t);if(!c)return null;
          const avgC=d.avgCost[t]||c.price;const pl=(c.price-avgC)*n;
          return(<div key={t} onClick={()=>{setSelCo(c);setTab("co");}} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:"1px solid #f5f5f5",cursor:"pointer"}}>
            <div style={{width:34,height:34,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div>
            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:9,color:"#bbb"}}>{fmtN(n)} shares · avg {fmt(avgC)}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(c.price*n)}</div><div style={{fontSize:9,fontFamily:"DM Mono,monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{fmt(pl)}</div></div>
          </div>);
        })}
      </div>}
    </div>
  );

  const Mkt=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{overflowX:"auto"}}><div style={{display:"flex",gap:5,paddingBottom:3,width:"max-content"}}>
        {["All",...new Set(COMPANIES.map(c=>c.s))].map(s=><button key={s} onClick={()=>setFilterSec(s)} style={{padding:"5px 10px",borderRadius:20,border:"1.5px solid "+(filterSec===s?G:"#ddd"),background:filterSec===s?G:"#fff",color:filterSec===s?"#fff":"#666",fontWeight:600,fontSize:9,cursor:"pointer",fontFamily:"DM Sans,sans-serif",whiteSpace:"nowrap"}}>{s}</button>)}
      </div></div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.cos.filter(c=>filterSec==="All"||c.s===filterSec).map((c,i,arr)=>(
          <div key={c.t} onClick={()=>{setSelCo({...c});setTab("co");setCoTab("overview");}} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",borderBottom:i<arr.length-1?"1px solid #f8f8f8":"none",cursor:"pointer"}}>
            <div style={{width:34,height:34,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0,letterSpacing:-.5}}>{c.t}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:600,color:DK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.n}</div>
              <div style={{fontSize:8,color:"#bbb"}}>{c.s} · P/E {c.pe.toFixed(1)}x · {fmtN(c.shares)} shares out</div>
            </div>
            <MChart hist={c.hist} w={65} h={26}/>
            <div style={{textAlign:"right",minWidth:65}}><div style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(c.price)}</div><Bdg v={c.ch}/></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Company detail — with tabs for Overview / Financials / DEE
  const Co=(()=>{
    const c=selCo?d.cos.find(x=>x.t===selCo.t)||selCo:null;
    if(!c)return<div style={{padding:32,textAlign:"center",color:"#aaa",fontSize:13}}>← Select a company from Stocks tab</div>;
    const held=d.sh[c.t]||0;
    const avgC=d.avgCost[c.t]||c.price;
    const unrealPL=held?(c.price-avgC)*held:0;
    const ev=d.aevts.find(e=>e.type==="co"&&e.tk===c.t);
    const b=PEB[c.s]||{min:10,max:40};
    const eps=c.price/c.pe;
    const mktCap=c.shares*c.price;
    const rev=mktCap*0.12; // Rough revenue estimate
    const netIncome=rev*c.mg;
    return(
      <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
        {/* Hero */}
        <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:14,padding:15,color:"#fff",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-25,right:-25,width:90,height:90,background:"rgba(255,255,255,.04)",borderRadius:"50%"}}/>
          <div style={{fontSize:8,opacity:.55,textTransform:"uppercase",letterSpacing:1,marginBottom:1}}>{c.s} · {c.r}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:19,fontWeight:800,marginBottom:2,lineHeight:1.1}}>{c.n}</div>
              <div style={{fontSize:9,opacity:.55,marginBottom:7}}>{c.t} · {c.hq||"—"} · Est. {c.yr||"—"} · {(c.emp||0).toLocaleString()} employees</div>
              <div style={{fontFamily:"DM Mono,monospace",fontSize:26,fontWeight:800,lineHeight:1}}>{fmt(c.price)}</div>
              <div style={{fontSize:10,marginTop:2,color:c.ch>=0?"#C8E6C9":"#FFCDD2"}}>{c.ch>=0?"▲":"▼"} {pct(c.ch)} this turn</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:8,opacity:.4,marginBottom:2}}>P/E</div>
              <div style={{fontSize:18,fontWeight:800,fontFamily:"DM Mono,monospace"}}>{c.pe.toFixed(1)}x</div>
              <div style={{fontSize:8,opacity:.35}}>{b.min}–{b.max}x bounds</div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:11,paddingTop:11,borderTop:"1px solid rgba(255,255,255,.14)"}}>
            {[["Div Yld",c.div+"%"],["Margin",(c.mg*100).toFixed(0)+"%"],["Beta",c.beta+"x"],["Shares Out",fmtN(c.shares)]].map(([k,v])=>(
              <div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:7,opacity:.4,textTransform:"uppercase"}}>{k}</div><div style={{fontSize:10,fontWeight:700,fontFamily:"DM Mono,monospace",marginTop:1}}>{v}</div></div>
            ))}
          </div>
        </div>

        {ev&&<div style={{background:ev.good?"#E8F5E9":"#FFEBEE",borderRadius:9,padding:9,border:"1px solid "+(ev.good?"#A5D6A7":"#EF9A9A"),display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:17}}>{ev.ico}</span><div><div style={{fontSize:11,fontWeight:700,color:ev.good?G:R}}>Active: {ev.n}</div><div style={{fontSize:9,color:"#888"}}>{ev.tl}/{ev.dur} turns · {ev.desc}</div></div></div>}

        {/* Company description */}
        <div style={{background:"#f8fbf8",borderRadius:9,padding:11,fontSize:11,color:"#555",lineHeight:1.6}}>{c.desc||"—"}</div>

        {/* Position */}
        {held>0&&<div style={{background:"#E8F5E9",borderRadius:10,padding:11,border:"1px solid #A5D6A7"}}>
          <div style={{fontSize:10,fontWeight:700,color:G,marginBottom:7}}>Your Position — {held>=MAX_SHARES_PER_COMPANY*0.25?"Controlling (25%+)":held>=MAX_SHARES_PER_COMPANY*0.05?"Significant (5%+)":"Minority (<5%)"}</div>
          <div style={{display:"flex",gap:6}}><SB l="Shares" v={fmtN(held)} c={G}/><SB l="Value" v={fmt(c.price*held)} c={G}/><SB l="Avg Cost" v={fmt(avgC)}/><SB l="P&L" v={(unrealPL>=0?"+":"")+fmt(unrealPL)} c={unrealPL>=0?G:R}/></div>
        </div>}

        {/* Tabs */}
        <div style={{display:"flex",background:"#f0f4f0",borderRadius:9,padding:3,gap:2}}>
          {["overview","financials","governor"].map(t2=><button key={t2} onClick={()=>setCoTab(t2)} style={{flex:1,padding:"7px 0",borderRadius:7,border:"none",background:coTab===t2?"#fff":"transparent",color:coTab===t2?G:"#888",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif",boxShadow:coTab===t2?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{t2.charAt(0).toUpperCase()+t2.slice(1)}</button>)}
        </div>

        {coTab==="overview"&&<div style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#aaa",marginBottom:7}}>Price Chart ({c.hist?.length||0} turns)</div>
          <div style={{height:50,display:"flex",alignItems:"flex-end",gap:2}}>
            {(c.hist||[]).slice(-40).map((pr,i,arr)=>{const mn=Math.min(...arr),mx=Math.max(...arr),rng=mx-mn||1;const h=Math.max(3,Math.round(((pr-mn)/rng)*46));return<div key={i} style={{flex:1,height:h,background:(i===0||pr>=arr[i-1])?G:R,borderRadius:"2px 2px 0 0",opacity:.75}}/>;})}</div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}><span style={{fontSize:8,color:"#ccc"}}>Turn {Math.max(1,d.turn-(c.hist?.length||2))}</span><span style={{fontSize:8,color:"#ccc"}}>Now</span></div>
        </div>}

        {coTab==="financials"&&<div style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:11,fontWeight:700,color:DK,marginBottom:8}}>Estimated Financials</div>
          {[["Market Cap",fmt(mktCap)],["Revenue (est.)",fmt(rev)],["Net Income (est.)",fmt(netIncome)],["Net Margin",(c.mg*100).toFixed(1)+"%"],["EPS (est.)",fmt(eps)],["P/E Ratio",c.pe.toFixed(1)+"x"],["P/E Bounds",b.min+"–"+b.max+"x"],["Dividend Yield",c.div+"%"],["Beta",c.beta+"x"],["Shares Outstanding",fmtN(c.shares)]].map(([k,v])=><Row key={k} k={k} v={v}/>)}
        </div>}

        {coTab==="governor"&&<div style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:11,fontWeight:700,color:DK,marginBottom:8}}>Governor Rules for {c.t}</div>
          <Row k="P/E Bounds" v={b.min+"x – "+b.max+"x"} vc={BL}/>
          <Row k="Max Daily Move" v="±"+STOCK_DAILY_CHANGE*100+"%/turn"/>
          <Row k="Current P/E" v={c.pe.toFixed(1)+"x"} vc={c.pe>b.max*0.9||c.pe<b.min*1.1?AU:G}/>
          <Row k="EPS" v={fmt(eps)}/>
          <Row k="Net Income ≤ Revenue" v="Enforced"/>
          <Row k="Max Shares You Can Hold" v={fmtN(MAX_SHARES_PER_COMPANY)} vc={AU}/>
          <Row k="You Hold" v={fmtN(held)} vc={held>=MAX_SHARES_PER_COMPANY*0.25?AU:G}/>
          {d.aevts.filter(e=>e.type==="co"&&e.tk===c.t).map((e,i)=><Row key={i} k={"Active: "+e.n} v={e.tl+"/"+e.dur+" turns"} vc={e.good?G:R}/>)}
        </div>}

        <div style={{display:"flex",gap:7}}>
          <button onClick={()=>{setTrModal({type:"stock",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:10,padding:13,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>📈 Buy</button>
          <button onClick={()=>{setTrModal({type:"stock",item:c,mode:"sell"});setTrAmt(null);}} disabled={held<1} style={{flex:1,background:held<1?"#f0f0f0":"#FFEBEE",color:held<1?"#bbb":R,border:"1.5px solid "+(held<1?"#e0e0e0":"#EF9A9A"),borderRadius:10,padding:13,fontWeight:800,fontSize:13,cursor:held<1?"not-allowed":"pointer",fontFamily:"DM Sans,sans-serif"}}>📉 Sell {held>0?"("+fmtN(held)+")":""}</button>
        </div>
      </div>
    );
  })();

  const Comm=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{background:"#FFF8E1",borderRadius:10,padding:10,border:"1px solid #FFE082",fontSize:10,color:"#E65100",lineHeight:1.5}}>Commodities · Buy/sell physical units · Max {MAX_COMM_UNITS} units per commodity · Prices capped at 5× base · ±4%/turn max movement · CGT on profit only at {(20*(1-d.taxReduction)).toFixed(0)}%</div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.comm.map((c,i)=>{
          const held=d.ch?.[c.id]||0;
          const avgC=d.commCost?.[c.id]||c.p;
          const pl=held?(c.p-avgC)*held:0;
          return(
            <div key={c.id} style={{padding:"11px 12px",borderBottom:i<d.comm.length-1?"1px solid #f8f8f8":"none"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                <div><div style={{fontSize:12,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:8,color:"#bbb"}}>{c.id} · per {c.unit} · Base: {fmt(c.base)} · Cap: {fmt(c.base*COMM_PRICE_MAX_MULT)}</div></div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:800,fontFamily:"DM Mono,monospace",color:c.ch>=0?G:R}}>{fmt(c.p)}</div>
                  <Bdg v={c.ch||0} size={9}/>
                </div>
              </div>
              <div style={{height:24,marginBottom:7}}><MChart hist={c.hist} w={220} h={24}/></div>
              {held>0&&<div style={{fontSize:9,color:"#555",marginBottom:6,fontFamily:"DM Mono,monospace"}}>Held: {held} {c.unit}s · Value: {fmt(c.p*held)} · P&L: <span style={{color:pl>=0?G:R}}>{pl>=0?"+":""}{fmt(pl)}</span></div>}
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{setTrModal({type:"comm",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Buy</button>
                {held>0&&<button onClick={()=>{setTrModal({type:"comm",item:c,mode:"sell"});setTrAmt(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Sell ({held})</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const Crypto_=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{background:"#EDE7F6",borderRadius:10,padding:10,border:"1px solid #D1C4E9",fontSize:10,color:"#4A148C",lineHeight:1.5}}>Crypto · High volatility ±8%/turn · Small position limits · No leverage · CGT on profit at {(20*(1-d.taxReduction)).toFixed(0)}% · Prices reset to base if they drift too far from reality</div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.crypto.map((c,i)=>{
          const held=d.crh?.[c.id]||0;
          const avgC=d.cryptoCost?.[c.id]||c.p;
          const pl=held?(c.p-avgC)*held:0;
          return(
            <div key={c.id} style={{padding:"11px 12px",borderBottom:i<d.crypto.length-1?"1px solid #f8f8f8":"none"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                <div><div style={{fontSize:13,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:8,color:"#bbb"}}>{c.id} · Max hold: {c.maxHold} {c.unit}</div></div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:800,fontFamily:"DM Mono,monospace",color:c.ch>=0?G:R}}>{fmt(c.p)}</div>
                  <Bdg v={c.ch||0} size={9}/>
                </div>
              </div>
              <div style={{height:26,marginBottom:7}}><MChart hist={c.hist} w={220} h={26}/></div>
              {held>0&&<div style={{fontSize:9,color:"#555",marginBottom:6,fontFamily:"DM Mono,monospace"}}>Held: {held} · Value: {fmt(c.p*held)} · P&L: <span style={{color:pl>=0?G:R}}>{pl>=0?"+":""}{fmt(pl)}</span></div>}
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{setTrModal({type:"crypto",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:"#4A148C",color:"#fff",border:"none",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Buy</button>
                {held>0&&<button onClick={()=>{setTrModal({type:"crypto",item:c,mode:"sell"});setTrAmt(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Sell ({held})</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const Fx_=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{background:"#E3F2FD",borderRadius:10,padding:10,border:"1px solid #BBDEFB",fontSize:10,color:BL,lineHeight:1.5}}>Live Forex Rates · USD/AED locked at 3.6735 (GSF buy rate) · USD/CNY locked at 6.8 (Master Brief) · Other pairs move ±0.5%/turn · Forex position trading available in Phase 1 build</div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.fx.map((f,i)=>(
          <div key={f.id} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderBottom:i<d.fx.length-1?"1px solid #f8f8f8":"none"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:DK}}>{f.n}</div>
              <div style={{fontSize:8,color:"#bbb"}}>{f.id}{f.note?" · "+f.note:""}</div>
            </div>
            <div style={{height:26,marginRight:8}}><MChart hist={f.hist} w={60} h={26}/></div>
            <div style={{textAlign:"right",minWidth:80}}>
              <div style={{fontSize:14,fontWeight:800,fontFamily:"DM Mono,monospace",color:f.locked?"#888":(f.ch>=0?G:R)}}>{f.p.toFixed(4)}</div>
              {f.locked?<span style={{fontSize:8,color:"#aaa",fontWeight:700}}>LOCKED</span>:<Bdg v={f.ch||0} size={9}/>}
            </div>
          </div>
        ))}
      </div>
      <div style={{background:"#f8fbf8",borderRadius:10,padding:10,fontSize:10,color:"#888",lineHeight:1.5}}>Note: Forex position trading (go long/short on currency pairs) will be implemented in the Phase 1 Manus build. The rates shown here update each turn and affect your foreign stock valuations.</div>
    </div>
  );

  const Bonds_=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{background:"#E3F2FD",borderRadius:10,padding:10,border:"1px solid #BBDEFB",fontSize:10,color:BL}}>Governor Formula 4 · Price = Face Value × (Orig Yield ÷ Current Yield) × Rating Mult · Ratings: AAA×1.02 → B×0.94 · Price range 5%–200% of face value</div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.bonds.map((b,i)=>{
          const pr=gBond(b.fv,b.oy,b.cy,b.rat);
          const held=d.bh[b.id]||0;
          return(
            <div key={b.id} style={{padding:"12px 12px",borderBottom:i<d.bonds.length-1?"1px solid #f5f5f5":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                <div><div style={{fontSize:12,fontWeight:700,color:DK}}>{b.n}</div><div style={{fontSize:8,color:"#bbb"}}>{b.id} · {b.mat} · <span style={{fontWeight:700,color:b.rat==="AAA"||b.rat==="AA"?G:b.rat==="BB"||b.rat==="B"?R:AU}}>{b.rat} rated</span></div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,fontFamily:"DM Mono,monospace",color:pr>b.fv?G:R}}>{fmt(pr)}</div><div style={{fontSize:8,color:"#aaa"}}>{b.cy.toFixed(2)}% yield</div></div>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:7}}><SB l="Coupon" v={b.cou+"%"} c={G}/><SB l="Orig Yield" v={b.oy+"%"}/><SB l="Curr Yield" v={b.cy.toFixed(1)+"%"} c={b.cy<b.oy?G:R}/><SB l="Held" v={held} c={held>0?G:"#aaa"}/></div>
              <div style={{display:"flex",gap:5}}>
                {[1,5,10].map(q=>(
                  <button key={q} onClick={()=>{const s=S.current;const cost=gBond(b.fv,b.oy,b.cy,b.rat)*q;if(cost>s.cash){toast_("Insufficient cash",false);return;}s.cash=Math.round((s.cash-cost)*100)/100;s.bh[b.id]=(s.bh[b.id]||0)+q;s.elog.unshift({lv:"OK",t:s.turn,sc:"Bond",msg:"BUY "+q+"× "+b.id+" @ "+fmt(gBond(b.fv,b.oy,b.cy,b.rat))});toast_("Bought "+q+"× "+b.n);refresh();}}
                    style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Buy {q}</button>
                ))}
                <button onClick={()=>{const s=S.current;const q=s.bh[b.id]||0;if(!q){toast_("None held",false);return;}const p2=gBond(b.fv,b.oy,b.cy,b.rat);const tot=Math.round(p2*q*100)/100;s.cash=Math.round((s.cash+tot)*100)/100;delete s.bh[b.id];s.elog.unshift({lv:"OK",t:s.turn,sc:"Bond",msg:"SELL ALL "+b.id+" = "+fmt(tot)});toast_("Sold all "+b.n);refresh();}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Sell All</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const Port=(()=>{
    const sm={};Object.entries(d.sh).filter(([,n])=>n>0).forEach(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(c)sm[c.s]=(sm[c.s]||0)+c.price*n;});
    const tsv=Object.values(sm).reduce((a,b2)=>a+b2,0)||1;
    const totalGains=Object.entries(d.sh).filter(([,n])=>n>0).reduce((sum,[t,n])=>{const c=d.cos.find(x=>x.t===t);return sum+(c?(c.price-(d.avgCost[t]||c.price))*n:0);},0);
    return(
      <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:"linear-gradient(135deg,#1B5E20,#388E3C)",borderRadius:14,padding:14,color:"#fff"}}>
          <div style={{fontSize:9,opacity:.5,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Portfolio</div>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:28,fontWeight:800}}>{fmt(nw)}</div>
          <div style={{fontSize:9,opacity:.7,marginTop:2}}>S:{fmt(sv)} · B:{fmt(bv)} · C:{fmt(cv)} · Crypto:{fmt(crv)} · GSF:{fmt(d.gsfDep)} · Cash:{fmt(d.cash)}</div>
          <div style={{fontSize:9,marginTop:5,color:totalGains>=0?"#C8E6C9":"#FFCDD2"}}>Total unrealised P&L: {totalGains>=0?"+":""}{fmt(totalGains)}</div>
        </div>
        {d.taxReduction>0&&<div style={{background:"#E8F5E9",borderRadius:9,padding:9,border:"1px solid #A5D6A7",fontSize:10,color:G}}><strong>Tax Reduction Active:</strong> {(d.taxReduction*100).toFixed(0)}% off CGT ({d.dons} donation{d.dons>1?"s":""}). Effective CGT rate: {(20*(1-d.taxReduction)).toFixed(0)}% on profit only.</div>}
        {Object.keys(sm).length>0&&<div style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:11,fontWeight:700,color:DK,marginBottom:8}}>Sector Allocation</div>
          {Object.entries(sm).sort(([,a],[,b2])=>b2-a).map(([s,v])=><div key={s} style={{marginBottom:7}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11,color:"#555"}}>{s}</span><span style={{fontSize:11,fontFamily:"DM Mono,monospace"}}>{((v/tsv)*100).toFixed(1)}%</span></div><div style={{height:4,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:((v/tsv)*100)+"%",background:"linear-gradient(90deg,"+G+",#4CAF50)",borderRadius:2}}/></div></div>)}
        </div>}
        <div style={{background:"#fff",borderRadius:11,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          <div style={{padding:"9px 12px",fontSize:11,fontWeight:700,color:DK}}>Stocks ({Object.keys(d.sh).filter(t=>(d.sh[t]||0)>0).length})</div>
          {Object.keys(d.sh).filter(t=>(d.sh[t]||0)>0).length===0&&<div style={{padding:"11px 12px",fontSize:12,color:"#bbb"}}>No stocks held.</div>}
          {Object.entries(d.sh).filter(([,n])=>n>0).map(([t,n])=>{
            const c=d.cos.find(x=>x.t===t);if(!c)return null;
            const avgC=d.avgCost[t]||c.price;const pl=(c.price-avgC)*n;
            return(
              <div key={t} style={{padding:"9px 12px",borderTop:"1px solid #f8f8f8"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}} onClick={()=>{setSelCo({...c});setTab("co");setCoTab("overview");}}>
                  <div style={{width:32,height:32,borderRadius:8,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div>
                  <div style={{flex:1,cursor:"pointer"}}><div style={{fontSize:11,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:8,color:"#bbb"}}>{fmtN(n)} shares · {fmt(c.price)}/sh · avg {fmt(avgC)}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(c.price*n)}</div><div style={{fontSize:9,fontFamily:"DM Mono,monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{fmt(pl)} P&L</div></div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{setTrModal({type:"stock",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:7,padding:"7px 0",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>+ Buy More</button>
                  <button onClick={()=>{setTrModal({type:"stock",item:c,mode:"sell"});setTrAmt(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"7px 0",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Sell</button>
                </div>
              </div>
            );
          })}
        </div>
        {Object.keys(d.bh).filter(id=>(d.bh[id]||0)>0).length>0&&<div style={{background:"#fff",borderRadius:11,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          <div style={{padding:"9px 12px",fontSize:11,fontWeight:700,color:DK}}>Bonds</div>
          {Object.entries(d.bh).filter(([,q])=>q>0).map(([id,q])=>{const b=d.bonds.find(x=>x.id===id);if(!b)return null;const pr=gBond(b.fv,b.oy,b.cy,b.rat);
            return<div key={id} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderTop:"1px solid #f8f8f8"}}><div style={{width:32,height:32,borderRadius:8,background:"#E3F2FD",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:BL,border:"1px solid #BBDEFB",flexShrink:0}}>{b.rat}</div><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:DK}}>{b.n}</div><div style={{fontSize:8,color:"#bbb"}}>{q}× · {b.cou}% coupon · {b.mat}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(pr*q)}</div><div style={{fontSize:8,color:"#aaa"}}>{b.cy.toFixed(1)}% yield</div></div></div>;
          })}
        </div>}
      </div>
    );
  })();

  const Acad=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:13,padding:13,color:"#fff"}}>
        <div style={{fontSize:9,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🎓 Earth Academy</div>
        <div style={{fontSize:17,fontWeight:800,marginBottom:3}}>15 Modules · Real Scenarios</div>
        <div style={{fontSize:10,opacity:.8}}>Scenario-based MC · Certificate at completion · 3 needed for Solar unlock</div>
        <div style={{display:"flex",gap:7,marginTop:8}}><SB l="Done" v={adone+"/15"} c={adone>=3?"#C8E6C9":"#fff"}/><SB l="Solar Gate" v={adone>=3?"✓ Met":"Need "+(3-adone)} c={adone>=3?"#C8E6C9":"#FFCDD2"}/></div>
      </div>
      {adone>=15&&<div style={{background:"linear-gradient(135deg,#B8952A,#F0D060)",borderRadius:11,padding:13,textAlign:"center"}}><div style={{fontSize:17,fontWeight:800,color:"#fff"}}>🏆 Earth Academy Graduate!</div></div>}
      <div style={{background:"#fff",borderRadius:11,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.mods.map((m,i)=>(
          <div key={m.id} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderBottom:i<d.mods.length-1?"1px solid #f8f8f8":"none"}}>
            <div style={{width:28,height:28,borderRadius:7,background:m.done?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,border:m.done?"1px solid #A5D6A7":"1px solid #e0e0e0"}}>{m.done?"✅":"📖"}</div>
            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:m.done?G:DK}}>{m.n}</div>{m.score&&<div style={{fontSize:8,color:"#bbb"}}>Score: {m.score}%</div>}</div>
            {!m.done?<button onClick={()=>{setQuizM(m);setQuizA(null);}} style={{background:G,color:"#fff",border:"none",borderRadius:7,padding:"6px 11px",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Start</button>:<span style={{fontSize:11,color:G,fontWeight:700}}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );

  const Ph=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#880E4F,#C2185B)",borderRadius:14,padding:14,color:"#fff"}}>
        <div style={{fontSize:9,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>❤️ Philanthropy</div>
        <div style={{fontSize:17,fontWeight:800,marginBottom:3}}>Reduce Tax. Build Legacy.</div>
        <div style={{fontSize:10,opacity:.8,lineHeight:1.5}}>Each donation reduces CGT by 5% (max 25% total). 2 donations unlock Solar criteria. Tax applies to PROFIT only — selling at a loss means zero CGT regardless.</div>
        <div style={{display:"flex",gap:7,marginTop:8}}><SB l="Donations" v={d.dons} c="#FFCDD2"/><SB l="CGT Reduction" v={(d.taxReduction*100).toFixed(0)+"%"} c="#FFCDD2"/><SB l="Effective CGT" v={(20*(1-d.taxReduction)).toFixed(0)+"%"} c="#FFCDD2"/></div>
      </div>
      {[{n:"Healthcare",ico:"🏥",imp:"CGT −5%"},{n:"Education",ico:"🎓",imp:"CGT −5%"},{n:"Infrastructure",ico:"🌉",imp:"CGT −5%"},{n:"Space Research",ico:"🔭",imp:"CGT −5%"},{n:"Climate Action",ico:"🌱",imp:"CGT −5%"}].map(cat=>(
        <div key={cat.n} style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}><span style={{fontSize:20}}>{cat.ico}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:DK}}>{cat.n}</div><div style={{background:"#FFF8E1",borderRadius:5,padding:"2px 7px",marginTop:3,fontSize:9,color:"#E65100",display:"inline-block"}}>{cat.imp} · Solar criteria</div></div></div>
          <button onClick={()=>{setDonModal(cat.n);setDonAmt(null);}} style={{width:"100%",background:"#880E4F",color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Donate to {cat.n} ❤️</button>
        </div>
      ))}
    </div>
  );

  const Gsf=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",borderRadius:14,padding:14,color:"#fff"}}>
        <div style={{fontSize:9,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🏛️ Global Sovereign Fund</div>
        <div style={{fontSize:17,fontWeight:800,marginBottom:3}}>Collective Investment Pool</div>
        <div style={{fontSize:10,opacity:.8,lineHeight:1.5}}>One rate per turn for all players · Server-broadcast · Credited to your cash every turn · Max deposit: 30% of your net worth ({fmt(nw*MAX_GSF_DEPOSIT_PCT)})</div>
      </div>
      <div style={{background:"#E3F2FD",borderRadius:11,padding:12,border:"1px solid #BBDEFB"}}>
        <div style={{fontSize:11,fontWeight:700,color:BL,marginBottom:8}}>Your GSF Position</div>
        <div style={{display:"flex",gap:6,marginBottom:11}}><SB l="Your Deposit" v={fmt(d.gsfDep)} c={BL}/><SB l="Rate/yr" v={d.gsf.toFixed(2)+"%"} c={G}/><SB l="Per Turn" v={fmt(d.gsfDep*(d.gsf/100/12))} c={G} sub={d.gsfDep>0?""+((d.gsf/12).toFixed(2)+"%/turn"):""}/></div>
        <div style={{background:"#fff",borderRadius:8,padding:"8px 10px",marginBottom:10,fontSize:10,color:"#666",lineHeight:1.5}}>Returns are realistic: at 12% annual on $1M deposit = $10,000/turn. The cap at 30% of net worth ensures GSF stays a reasonable portion of your portfolio, not your whole strategy.</div>
        <button onClick={()=>{setGsfModal(true);setGsfAmt(null);}} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>+ Deposit to GSF</button>
      </div>
    </div>
  );

  const Sol=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#060B16,#112040)",borderRadius:14,padding:14,border:"1px solid rgba(212,175,55,.15)"}}>
        <div style={{fontSize:9,opacity:.45,color:"#F0D060",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>☀️ Solar System Unlock</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}><div style={{fontFamily:"DM Mono,monospace",fontSize:30,fontWeight:800,color:"#F0D060"}}>{spct}%</div><div style={{fontSize:10,color:"rgba(240,208,96,.4)"}}>All 6 criteria needed</div></div>
        <div style={{height:7,background:"rgba(255,255,255,.07)",borderRadius:4,overflow:"hidden",marginBottom:12}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:4,transition:"width .5s"}}/></div>
        {Object.entries(sc).map(([k,c2])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:c2.met?"rgba(0,230,118,.2)":"rgba(255,255,255,.05)",border:"2px solid "+(c2.met?"#00E676":"rgba(255,255,255,.1)"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0,color:"#00E676"}}>{c2.met?"✓":""}</div>
            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:c2.met?"#00E676":"rgba(255,255,255,.45)"}}>{c2.l}</div><div style={{fontSize:9,color:"rgba(240,208,96,.35)",fontFamily:"DM Mono,monospace"}}>{c2.v}</div></div>
          </div>
        ))}
      </div>
      <div style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:11,padding:13,border:"1px solid rgba(212,175,55,.07)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"rgba(212,175,55,.45)",marginBottom:9}}>🔒 210 Companies · 7 Planets</div>
        {[{ico:"🔴",pl:"Mars",cu:"MCR",d:"30 mining cos · Lithium, water ice · 3.71m/s²"},{ico:"🟡",pl:"Venus",cu:"VNU",d:"30 manufacturing · 465°C surface"},{ico:"🟠",pl:"Jupiter",cu:"JVT",d:"30 research · Fusion · P/E research exemption"},{ico:"🪐",pl:"Saturn",cu:"STC",d:"30 ring mining · Helium-3, Ryzolith"},{ico:"☿",pl:"Mercury",cu:"MRC",d:"30 solar energy · 430°C/-180°C"},{ico:"🔵",pl:"Uranus",cu:"URU",d:"30 ice mining · -224°C"},{ico:"💜",pl:"Neptune",cu:"NPT",d:"30 research · 2,100km/h winds"}].map(p=>(
          <div key={p.pl} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.04)",opacity:spct===100?.8:.3}}>
            <span style={{fontSize:18}}>{p.ico}</span><div><div style={{fontSize:11,fontWeight:700,color:"#E8EEF8"}}>{p.pl} <span style={{fontFamily:"DM Mono,monospace",fontSize:8,color:"rgba(240,208,96,.4)"}}>({p.cu})</span></div><div style={{fontSize:8,color:"rgba(255,255,255,.3)"}}>{p.d}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  const Set_=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:9}}>🌐 Language</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
          {LANGS.map((k,i)=><button key={k} onClick={()=>setLang(k)} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(lang===k?G:"#e0e0e0"),background:lang===k?"#E8F5E9":"#fafafa",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:17}}>{FLAGS[i]}</span><span style={{fontSize:9,fontWeight:700,color:lang===k?G:"#666"}}>{k.toUpperCase()}</span></button>)}
        </div>
      </div>
      <div style={{background:"#FFF8E1",borderRadius:11,padding:12,border:"1px solid #FFE082"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#E65100",marginBottom:8}}>⚠️ Position Limits (Prevents Number Explosion)</div>
        {[["Max shares per company",fmtN(MAX_SHARES_PER_COMPANY)],["Max commodity units",fmtN(MAX_COMM_UNITS)],["Max trade size","20% of cash per trade"],["Max GSF deposit","30% of net worth"],["Stock daily move","±"+STOCK_DAILY_CHANGE*100+"%/turn"],["Commodity daily move","±4%/turn"],["Commodity price cap","5× base price"],["Crypto daily move","±8%/turn"]].map(([k,v])=><Row key={k} k={k} v={v}/>)}
      </div>
      <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:9}}>📊 Stats — Turn {d.turn}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          <SB l="Net Worth" v={fmt(nw)} c={G}/>
          <SB l="Cash" v={fmt(d.cash)}/>
          <SB l="Active Events" v={d.aevts.length} c={d.aevts.length>0?AU:G}/>
          <SB l="Academy" v={adone+"/15"} c={G}/>
          <SB l="Donations" v={d.dons} c="#880E4F"/>
          <SB l="Eff. CGT Rate" v={(20*(1-d.taxReduction)).toFixed(0)+"% on profit"} c={G}/>
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:3}}>🔴 Beta — Error Log (PIN: 9000)</div>
        {!beta
          ?<button onClick={()=>{const p=window.prompt("PIN:");if(p==="9000"){setBeta(true);toast_("Beta unlocked");}else if(p)toast_("Wrong PIN",false);}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>🔐 Enter PIN</button>
          :<div>
            <div style={{fontSize:10,fontWeight:700,color:R,marginBottom:6}}>{d.elog.length} entries</div>
            <div style={{maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:3,marginBottom:8}}>
              {d.elog.map((e,i)=><div key={i} style={{padding:"3px 7px",borderRadius:3,fontSize:8,fontFamily:"DM Mono,monospace",background:e.lv==="CRIT"?"#FFEBEE":e.lv==="HIGH"?"#FFF8E1":e.lv==="MEDIUM"?"#E3F2FD":"#E8F5E9",color:e.lv==="CRIT"?R:e.lv==="HIGH"?AU:e.lv==="MEDIUM"?BL:G,borderLeft:"2px solid "+(e.lv==="CRIT"?R:e.lv==="HIGH"?AU:e.lv==="MEDIUM"?BL:G)}}>[T-{e.t}][{e.lv}] {e.sc}: {e.msg}</div>)}
            </div>
            <button onClick={()=>{const txt=d.elog.map(e=>"[T-"+e.t+"]["+e.lv+"] "+e.sc+": "+e.msg).join("\n");const blob=new Blob(["GALACTIC RAIDER LOG\nTurn: "+d.turn+"\nNet Worth: "+fmt(nw)+"\n\n"+txt],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="GR_Log_T"+d.turn+".txt";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);toast_("Downloaded");}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>⬇ Download Log (.txt)</button>
          </div>}
      </div>
    </div>
  );

  const News_=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:7}}>
      {d.news.slice(0,40).map(n=><div key={n.id} style={{background:"#fff",borderRadius:11,padding:11,border:"1px solid #e8ebe8",display:"flex",gap:8}}><div style={{width:3,borderRadius:2,flexShrink:0,background:n.g?G:R,alignSelf:"stretch"}}/><div style={{flex:1}}><div style={{fontSize:8,color:"#ccc",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Turn {n.t} · {n.ico}</div><div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:2}}>{n.ti}</div><div style={{fontSize:11,color:"#666",lineHeight:1.5}}>{n.bo}</div></div></div>)}
    </div>
  );

  const screens={dash:Dash,mkt:Mkt,co:Co,comm:Comm,crypto:Crypto_,fx:Fx_,bonds:Bonds_,port:Port,ac:Acad,ph:Ph,gsf:Gsf,sol:Sol,set:Set_,news:News_};

  // ══════════════════════════════════════════════════════════
  // TRADE MODAL — share-count based, no absurd amounts
  // ══════════════════════════════════════════════════════════
  const TradeModal=(()=>{
    if(!trModal)return null;
    const{type,item,mode}=trModal;
    const isBuy=mode==="buy";

    let maxUnits,costPerUnit,held=0;
    if(type==="stock"){
      held=d.sh[item.t]||0;
      const maxByMoney=Math.floor(d.cash/item.price);
      const maxByLimit=MAX_SHARES_PER_COMPANY-held;
      maxUnits=isBuy?Math.min(maxByMoney,maxByLimit):held;
      costPerUnit=item.price;
    } else if(type==="comm"){
      held=d.ch?.[item.id]||0;
      const maxByMoney=Math.floor(d.cash/item.p);
      const maxByLimit=MAX_COMM_UNITS-held;
      maxUnits=isBuy?Math.min(maxByMoney,maxByLimit):held;
      costPerUnit=item.p;
    } else if(type==="crypto"){
      held=d.crh?.[item.id]||0;
      const maxByMoney=Math.floor(d.cash/item.p);
      const maxByLimit=(item.maxHold||10)-held;
      maxUnits=isBuy?Math.min(maxByMoney,maxByLimit):held;
      costPerUnit=item.p;
    }

    const qty=trAmt||0;
    const totalCost=Math.round(qty*costPerUnit*100)/100;
    const avgC=type==="stock"?(d.avgCost[item.t]||item.price):type==="comm"?(d.commCost?.[item.id]||item.p):(d.cryptoCost?.[item.id]||item.p);
    const profitPerUnit=!isBuy?Math.max(0,costPerUnit-avgC):0;
    const tax=!isBuy?Math.round(qty*profitPerUnit*(0.20*(1-d.taxReduction))*100)/100:0;
    const net=!isBuy?totalCost-tax:totalCost;

    return(
      <div style={{background:"#fff",borderRadius:"19px 19px 0 0",padding:18,width:"100%",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{width:34,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 14px"}}/>
        <div style={{background:isBuy?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:12,padding:13,color:"#fff",marginBottom:12}}>
          <div style={{fontSize:9,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{isBuy?"BUY":"SELL"} · {type.toUpperCase()}</div>
          <div style={{fontSize:16,fontWeight:800}}>{type==="stock"?item.n:type==="comm"?item.n:type==="crypto"?item.n:item.n}</div>
          <div style={{fontSize:10,opacity:.8,marginTop:2}}>
            Price: {fmt(costPerUnit)} per {type==="stock"?"share":type==="comm"?item.unit:type==="crypto"?item.unit:"unit"} · {isBuy?fmt(d.cash)+" available":fmtN(held)+" held"}
          </div>
          {isBuy&&maxUnits<=0&&<div style={{fontSize:10,marginTop:4,color:"#FFCDD2"}}>⚠️ {held>=MAX_SHARES_PER_COMPANY?"At max position":"Insufficient cash"}</div>}
        </div>

        {/* Buy/Sell toggle */}
        <div style={{display:"flex",background:"#f0f4f0",borderRadius:9,padding:3,gap:2,marginBottom:11}}>
          {["buy","sell"].map(m2=><button key={m2} onClick={()=>{setTrModal({...trModal,mode:m2});setTrAmt(null);}} style={{flex:1,padding:"7px 0",borderRadius:7,border:"none",background:mode===m2?"#fff":"transparent",color:mode===m2?G:"#999",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif",boxShadow:mode===m2?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{m2==="buy"?"Buy":"Sell"}</button>)}
        </div>

        <div style={{fontSize:10,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>
          {type==="stock"?"Select Number of Shares":type==="comm"?"Select Quantity ("+item.unit+"s)":"Select Quantity"} — Max: {fmtN(maxUnits)}
        </div>
        <APick maxCash={d.cash} unitPrice={costPerUnit} maxUnits={maxUnits} sel={trAmt} onSel={setTrAmt}/>

        {qty>0&&<div style={{background:"#f8fbf8",borderRadius:9,padding:11,marginBottom:11}}>
          <Row k={"Qty"} v={fmtN(qty)+" "+(type==="stock"?"shares":type==="comm"?item.unit:type==="crypto"?item.unit:"units")}/>
          <Row k={isBuy?"Total Cost":"Gross Proceeds"} v={fmt(totalCost)}/>
          {!isBuy&&profitPerUnit>0&&<Row k={"Profit/unit ("+fmt(costPerUnit)+" − "+fmt(avgC)+" avg)"} v={fmt(profitPerUnit)} vc={G}/>}
          {!isBuy&&<Row k={"CGT "+(20*(1-d.taxReduction)).toFixed(0)+"% on profit only"} v={tax>0?("-"+fmt(tax)):"$0 (no profit)"} vc={tax>0?R:G}/>}
          <Row k={"Net "+(isBuy?"Cost":"Proceeds")} v={fmt(isBuy?totalCost:net)} vc={isBuy?R:G} b/>
        </div>}
        {qty<1&&trAmt!==null&&<div style={{background:"#FFF8E1",borderRadius:8,padding:8,marginBottom:10,fontSize:10,color:"#E65100"}}>⚠️ Select a valid quantity above</div>}
        <button onClick={execTrade} disabled={qty<1} style={{width:"100%",background:qty>=1?(isBuy?G:R):"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:13,fontWeight:800,fontSize:14,cursor:qty>=1?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>
          {qty>=1?"Confirm "+(isBuy?"Buy":"Sell")+" "+fmtN(qty)+" = "+fmt(isBuy?totalCost:net):"Select quantity first"}
        </button>
      </div>
    );
  })();

  return(
    <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"DM Sans,sans-serif",direction:rtl?"rtl":"ltr"}}>
      {/* Header */}
      <div style={{background:"#fff",padding:"8px 13px",borderBottom:"1px solid #e8ebe8",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#1B5E20,#4CAF50)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🌐</div>
          <div><div style={{fontSize:13,fontWeight:800,color:DK,lineHeight:1}}>Galactic Raider</div><div style={{fontSize:7,color:"#bbb"}}>Capital Exchange · Phase 1 · v3</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {auto&&<div style={{width:6,height:6,borderRadius:"50%",background:G,boxShadow:"0 0 5px #4CAF50"}}/>}
          <button onClick={()=>setTab("sol")} style={{background:"rgba(212,175,55,.1)",border:"1px solid rgba(212,175,55,.2)",borderRadius:20,padding:"2px 8px",fontSize:9,fontWeight:700,color:"#B8952A",cursor:"pointer"}}>☀️ {spct}%</button>
          <button onClick={()=>setLang(l=>{const i=LANGS.indexOf(l);return LANGS[(i+1)%LANGS.length];})} style={{fontSize:16,background:"none",border:"none",cursor:"pointer",padding:2}}>{FLAGS[LANGS.indexOf(lang)]}</button>
        </div>
      </div>

      {/* Ticker — shows live prices */}
      <div style={{background:"#1B5E20",padding:"3px 0",overflow:"hidden",flexShrink:0}}>
        <div style={{display:"flex",gap:16,whiteSpace:"nowrap",animation:"scroll 32s linear infinite",width:"max-content"}}>
          {[...d.cos,...d.cos].map((c,i)=>(
            <span key={i} style={{fontSize:8,fontFamily:"DM Mono,monospace",color:"rgba(255,255,255,.4)",display:"inline-flex",gap:4}}>
              <span style={{color:"rgba(255,255,255,.65)",fontWeight:700}}>{c.t}</span>
              <span style={{color:(c.ch||0)>=0?"#69F0AE":"#FF5252"}}>{fmt(c.price)} {(c.ch||0)>=0?"▲":"▼"}{Math.abs((c.ch||0)*100).toFixed(2)}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:68}}>
        {screens[tab]||Dash}
      </div>

      {/* Nav — compact 12-tab */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #e8ebe8",display:"flex",padding:"4px 1px 10px",zIndex:50,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{...ts(t.id),minWidth:0}}>
            <div style={{fontSize:14,lineHeight:1,marginBottom:1}}>{t.ico}</div>
            <div style={{fontSize:6.5}}>{t.l}</div>
          </button>
        ))}
      </div>

      {/* Event notification */}
      {evN&&(
        <div style={{position:"fixed",top:66,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 16px)",maxWidth:414,background:evN.good?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:11,padding:"10px 13px",display:"flex",alignItems:"center",gap:9,zIndex:200,boxShadow:"0 6px 20px rgba(0,0,0,.3)"}}>
          <span style={{fontSize:20}}>{evN.ico}</span>
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{evN.n}{evN.cn?" — "+evN.cn:""}</div><div style={{fontSize:9,color:"rgba(255,255,255,.6)",marginTop:1}}>{evN.desc}</div></div>
          <button onClick={()=>setEvN(null)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:20,height:20,color:"#fff",cursor:"pointer",fontSize:12}}>×</button>
        </div>
      )}

      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:66,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 16px)",maxWidth:414,background:toast.g?G:R,borderRadius:9,padding:"9px 13px",color:"#fff",fontSize:11,fontWeight:700,zIndex:250,textAlign:"center",boxShadow:"0 3px 12px rgba(0,0,0,.2)"}}>{toast.msg}</div>}

      {/* Trade modal */}
      {trModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget){setTrModal(null);setTrAmt(null);}}}>{TradeModal}</div>}

      {/* Donate modal */}
      {donModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setDonModal(null)}>
        <div style={{background:"#fff",borderRadius:"19px 19px 0 0",padding:18,width:"100%"}}>
          <div style={{width:34,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 14px"}}/>
          <div style={{fontSize:15,fontWeight:800,color:DK,marginBottom:3}}>❤️ Donate to {donModal}</div>
          <div style={{fontSize:10,color:"#888",marginBottom:4}}>Cash: {fmt(d.cash)} · Donations: {d.dons} · Each donation reduces CGT by 5% (max 5 donations = 25%)</div>
          <div style={{background:"#E8F5E9",borderRadius:8,padding:8,marginBottom:10,fontSize:10,color:G,lineHeight:1.5}}>Reduces CGT on profits by 5% · Counts toward Solar unlock · CGT applies only when you PROFIT on a sale</div>
          <APick maxCash={Math.min(d.cash, d.cash*MAX_SINGLE_TRADE_PCT)} sel={donAmt} onSel={setDonAmt}/>
          {donAmt&&<div style={{background:"#f8fbf8",borderRadius:8,padding:9,marginBottom:9}}><Row k="Donation" v={fmt(donAmt)} vc="#880E4F" b/><Row k="New CGT rate" v={(20*(1-(d.taxReduction+0.05))).toFixed(0)+"% on profit"} vc={G}/></div>}
          <button onClick={doDonate} disabled={!donAmt||donAmt>d.cash} style={{width:"100%",background:donAmt&&donAmt<=d.cash?"#880E4F":"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:12,fontWeight:800,fontSize:13,cursor:donAmt?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>❤️ Confirm{donAmt?" — "+fmt(donAmt):""}</button>
        </div>
      </div>}

      {/* GSF modal */}
      {gsfModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setGsfModal(false)}>
        <div style={{background:"#fff",borderRadius:"19px 19px 0 0",padding:18,width:"100%"}}>
          <div style={{width:34,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 14px"}}/>
          <div style={{fontSize:15,fontWeight:800,color:DK,marginBottom:3}}>🏛️ Deposit to GSF</div>
          <div style={{fontSize:10,color:"#888",marginBottom:3}}>Rate: {d.gsf.toFixed(2)}%/yr · Cash: {fmt(d.cash)} · Cap: {fmt(nw*MAX_GSF_DEPOSIT_PCT)} (30% of net worth)</div>
          <div style={{background:"#E3F2FD",borderRadius:8,padding:8,marginBottom:10,fontSize:10,color:BL,lineHeight:1.5}}>Returns are realistic. $100K at 12% = $1,000/turn. The 30% net worth cap prevents the GSF from becoming your entire portfolio.</div>
          <APick maxCash={Math.min(d.cash, Math.max(0,nw*MAX_GSF_DEPOSIT_PCT-d.gsfDep))} sel={gsfAmt} onSel={setGsfAmt}/>
          {gsfAmt&&<div style={{background:"#E3F2FD",borderRadius:8,padding:9,marginBottom:9}}><Row k="Deposit" v={fmt(gsfAmt)} vc={BL} b/><Row k="Per turn" v={fmt((d.gsfDep+gsfAmt)*(d.gsf/100/12))} vc={G}/><Row k="Per year (est.)" v={fmt((d.gsfDep+gsfAmt)*(d.gsf/100))} vc={G}/></div>}
          <button onClick={doGsf} disabled={!gsfAmt||gsfAmt>d.cash} style={{width:"100%",background:gsfAmt&&gsfAmt<=d.cash?BL:"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:12,fontWeight:800,fontSize:13,cursor:gsfAmt?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>🏛️ Confirm{gsfAmt?" — "+fmt(gsfAmt):""}</button>
        </div>
      </div>}

      {/* Quiz modal */}
      {quizM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:13}}>
        <div style={{background:"#fff",borderRadius:17,padding:18,width:"100%",maxWidth:430,maxHeight:"87vh",overflowY:"auto"}}>
          <div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🎓 Module {quizM.id}/15</div>
          <div style={{fontSize:16,fontWeight:800,color:DK,marginBottom:12}}>{quizM.n}</div>
          <div style={{background:"#f8fbf8",borderRadius:9,padding:11,fontSize:12,color:"#444",lineHeight:1.6,marginBottom:12}}><strong>Scenario:</strong> {quizM.q}</div>
          <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>
            {quizM.opts.map((o,i)=><button key={i} onClick={()=>setQuizA(i)} style={{padding:"11px 13px",borderRadius:9,border:"2px solid "+(quizA===i?G:"#e0e0e0"),textAlign:"left",background:quizA===i?"#E8F5E9":"#fafafa",color:quizA===i?G:"#333",fontWeight:quizA===i?700:400,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}><span style={{fontWeight:700,marginRight:7,color:quizA===i?G:"#bbb"}}>{["A","B","C","D"][i]}.</span>{o}</button>)}
          </div>
          {quizA!==null&&<div style={{background:quizA===quizM.ans?"#E8F5E9":"#FFEBEE",borderRadius:9,padding:11,marginBottom:11,fontSize:11,lineHeight:1.6,color:quizA===quizM.ans?G:R}}>{quizA===quizM.ans?"✅ Correct! ":"❌ Incorrect. "}{quizM.exp}</div>}
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>{setQuizM(null);setQuizA(null);}} style={{flex:1,padding:"11px 0",borderRadius:9,border:"1.5px solid #e0e0e0",background:"#f5f5f5",color:"#666",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Cancel</button>
            <button onClick={()=>doModule(quizM)} style={{flex:2,padding:"11px 0",borderRadius:9,border:"none",background:G,color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>✓ Complete Module</button>
          </div>
        </div>
      </div>}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=DM+Mono:wght@400;500;600&display=swap');
        @keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{display:none}
        button{outline:none}
      `}</style>
    </div>
  );
}
