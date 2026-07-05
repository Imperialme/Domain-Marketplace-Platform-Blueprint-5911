import { useState, useEffect, useRef, useCallback } from "react";

// ── PALETTE ──────────────────────────────────────────────────────
const G="#2E7D32",R="#C62828",AU="#F9A825",BL="#1565C0",DK="#0D1B2A";
const fmt=n=>{const a=Math.abs(n);if(a>=1e12)return(n<0?"-":"")+"$"+(a/1e12).toFixed(2)+"T";if(a>=1e9)return(n<0?"-":"")+"$"+(a/1e9).toFixed(2)+"B";if(a>=1e6)return(n<0?"-":"")+"$"+(a/1e6).toFixed(2)+"M";if(a>=1e3)return(n<0?"-":"")+"$"+(a/1e3).toFixed(1)+"K";return(n<0?"-":"")+"$"+a.toFixed(2);};
const fmtPct=n=>(n>=0?"+":"")+((n||0)*100).toFixed(2)+"%";
const clamp=(v,mn,mx)=>Math.min(Math.max(v,mn),mx);

// ── COMPANIES ────────────────────────────────────────────────────
const INIT_COS=[
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",r:"Asia Pacific",p:348.94,pe:18.4,div:0.8,mg:0.224,beta:1.8},
  {t:"MRDB",n:"Meridian Bank",s:"Banking",r:"US",p:85.20,pe:12.1,div:2.1,mg:0.22,beta:0.9},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",r:"Africa",p:15.80,pe:8.5,div:0.5,mg:0.12,beta:1.6},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",r:"Emerging Markets",p:351.54,pe:11.3,div:1.8,mg:0.18,beta:1.2},
  {t:"AGRO",n:"AgroLatin Corp",s:"Agriculture",r:"Latin America",p:42.18,pe:13.2,div:2.5,mg:0.09,beta:1.1},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",r:"US",p:198.40,pe:22.1,div:1.2,mg:0.26,beta:0.8},
  {t:"CLFL",n:"ClearFlame Energy",s:"Energy",r:"Europe",p:112.30,pe:14.8,div:2.0,mg:0.20,beta:1.1},
  {t:"AXMB",n:"Axum Biotech",s:"Healthcare",r:"Africa",p:68.50,pe:19.4,div:0.6,mg:0.21,beta:1.4},
  {t:"PCMN",n:"Pacific Manufacturing",s:"Manufacturing",r:"Asia Pacific",p:76.20,pe:15.6,div:1.3,mg:0.14,beta:1.0},
  {t:"NRDX",n:"Nordic Exchange Bank",s:"Banking",r:"Europe",p:132.10,pe:11.8,div:2.4,mg:0.21,beta:0.8},
  {t:"UTLS",n:"Utility Systems Corp",s:"Utilities",r:"US",p:58.40,pe:14.2,div:4.2,mg:0.22,beta:0.5},
  {t:"RLST",n:"RealEstate Trust",s:"Real Estate",r:"US",p:44.20,pe:12.8,div:3.8,mg:0.32,beta:0.7},
  {t:"TLCM",n:"TeleCom Europe",s:"Telecom",r:"Europe",p:88.60,pe:13.5,div:4.5,mg:0.28,beta:0.6},
  {t:"RETL",n:"RetailHub Inc",s:"Retail",r:"US",p:38.90,pe:14.0,div:1.5,mg:0.08,beta:1.2},
  {t:"EMTS",n:"Emerging Tech Solutions",s:"Technology",r:"Emerging Markets",p:28.40,pe:22.0,div:0.2,mg:0.15,beta:2.0},
];

// ── COMMODITIES ──────────────────────────────────────────────────
const INIT_COMM=[
  {id:"OIL",n:"Crude Oil",unit:"bbl",p:85.0,hist:[85]},
  {id:"GOLD",n:"Gold",unit:"oz",p:1980.0,hist:[1980]},
  {id:"SLVR",n:"Silver",unit:"oz",p:23.4,hist:[23.4]},
  {id:"NGS",n:"Natural Gas",unit:"MMBtu",p:2.85,hist:[2.85]},
  {id:"CORN",n:"Corn",unit:"bu",p:4.42,hist:[4.42]},
  {id:"WHET",n:"Wheat",unit:"bu",p:5.80,hist:[5.80]},
  {id:"COPR",n:"Copper",unit:"lb",p:3.78,hist:[3.78]},
  {id:"LITH",n:"Lithium",unit:"kg",p:16.50,hist:[16.50]},
];

// ── FOREX ────────────────────────────────────────────────────────
const INIT_FX=[
  {id:"EURUSD",n:"EUR / USD",base:"EUR",quote:"USD",p:1.0850,hist:[1.0850]},
  {id:"GBPUSD",n:"GBP / USD",base:"GBP",quote:"USD",p:1.2680,hist:[1.2680]},
  {id:"USDJPY",n:"USD / JPY",base:"USD",quote:"JPY",p:148.50,hist:[148.50]},
  {id:"USDCNY",n:"USD / CNY",base:"USD",quote:"CNY",p:6.8000,hist:[6.8000]},
  {id:"USDINR",n:"USD / INR",base:"USD",quote:"INR",p:83.20,hist:[83.20]},
  {id:"USDBRL",n:"USD / BRL",base:"USD",quote:"BRL",p:4.9700,hist:[4.9700]},
];

// ── BONDS ────────────────────────────────────────────────────────
const INIT_BONDS=[
  {id:"US10Y",n:"US Treasury 10Y",rat:"AAA",cou:4.5,mat:2034,oy:4.5,fv:1000},
  {id:"EU10Y",n:"EU Government 10Y",rat:"AA",cou:3.8,mat:2034,oy:3.8,fv:1000},
  {id:"SLKT-B1",n:"Silk Road Tech Bond",rat:"AA",cou:5.2,mat:2031,oy:5.2,fv:1000},
  {id:"MRDB-B1",n:"Meridian Bank Bond",rat:"AAA",cou:4.0,mat:2030,oy:4.0,fv:1000},
  {id:"AFR5Y",n:"African Govt Bond",rat:"BB",cou:12.5,mat:2029,oy:12.5,fv:1000},
  {id:"EM10Y",n:"Emerging Market Bond",rat:"B",cou:14.8,mat:2032,oy:14.8,fv:1000},
];

// ── ACADEMY ──────────────────────────────────────────────────────
const MODS=[
  {id:1,n:"Markets & P/E Ratios",q:"SLKT EPS $18.95, Tech ceiling 35x. Max allowed price?",opts:["$348","$662","$500","$418"],ans:1,exp:"Max = $18.95 × 35 = $662.25. SLKT at 18.4x is within bounds."},
  {id:2,n:"Bonds & Interest Rates",q:"Bond: Face $1,000, Orig yield 4%, Current yield 3%. Price?",opts:["$1,000","$1,200","$1,333","$750"],ans:2,exp:"$1,000 × (4÷3) = $1,333. Yields fall → prices rise."},
  {id:3,n:"Diversification",q:"Portfolio 80% in one sector. Sector Regulation event fires. Best action?",opts:["Hold","Sell all immediately","Reduce to 30% and diversify","Buy more at dip"],ans:2,exp:"Over-concentration creates massive sector event risk. Reduce and diversify."},
  {id:4,n:"Tax Strategy",q:"$500K capital gains. Which reduces tax most legally?",opts:["Pay full 20% CGT","Offset with $200K losses","Donate $100K","Hold longer"],ans:1,exp:"Loss harvesting offsets gains directly — $200K losses saves $40K in CGT."},
  {id:5,n:"Commodities",q:"Oil spikes 40% on conflict. Which stocks benefit most?",opts:["Healthcare","Petroleum + Energy","Utilities","Retail"],ans:1,exp:"Energy producers benefit directly from oil price spikes."},
  {id:6,n:"Forex & Currency Risk",q:"USD strengthens 15% vs local currencies. Impact on foreign stocks?",opts:["Revenue up 15%","Revenue down 15% in USD terms","No impact","Revenue up 7.5%"],ans:1,exp:"Stronger USD means foreign-currency revenue converts to fewer dollars."},
  {id:7,n:"Startups & Venture Capital",q:"$500K for 10% equity. IPO at $20M valuation. Profit?",opts:["$500K","$1.5M","$2M","$200K"],ans:1,exp:"10% of $20M = $2M. Less $500K cost = $1.5M profit. 3x return."},
  {id:8,n:"Reading Company Financials",q:"Rev $45B, COGS $18B, OpEx $12B, Interest $2B, Tax 21%. Net income?",opts:["$15B","$10.3B","$9.75B","$12B"],ans:2,exp:"Gross $27B → Op $15B → After interest $13B → After 21% tax ≈ $9.75B."},
  {id:9,n:"Economic Cycles",q:"GDP contracts 2 quarters, rates rising. Best defensive sectors?",opts:["Technology","Healthcare + Utilities","Mining","Retail"],ans:1,exp:"Healthcare (non-cyclical) and Utilities (regulated revenue) are recession-resistant."},
  {id:10,n:"Global Sovereign Fund",q:"GSF 12.48% annual, $5M deposited. Monthly return per turn?",opts:["$52,000","$5,200","$62,400","$520"],ans:0,exp:"$5M × (12.48% ÷ 12) = $52,000 per turn."},
  {id:11,n:"Legacy Building",q:"Net worth hits $10B. Governor wealth tax: rate and cost?",opts:["0.1%/year","1%/year","0.1%/turn above $10B","0.5%/year"],ans:2,exp:"0.1% per TURN on net worth ABOVE $10B. At $10B exactly = $10M/turn."},
  {id:12,n:"Holdings Company & M&A",q:"You acquire 51% of a company. What rights do you get?",opts:["Voting only","Board control + CEO + strategy","Dividends priority","None"],ans:1,exp:"51%+ = controlling stake. Board, CEO appointment, full strategic control."},
  {id:13,n:"Space Economics Preview",q:"Investing in Mars mining. Repatriation tax rate?",opts:["0%","2% Earth→Space, 5% Space→Earth","5% both ways","10% both ways"],ans:1,exp:"Approved: Earth→Space 2%, Space→Earth 5%. Higher return tax reflects planetary risk."},
  {id:14,n:"Advanced Portfolio Theory",q:"Portfolio A: Sharpe ratio 1.8, beta 0.7 vs B: return 28%, beta 1.9. Which is superior?",opts:["B — higher return","A — better risk-adjusted","Equal","Market cycle dependent"],ans:1,exp:"Sharpe 1.8 = superior risk-adjusted return. B's 28% comes with 3x the market risk."},
  {id:15,n:"Capstone",q:"Net worth $4.8B, need $5B for Solar unlock. Fastest legitimate path?",opts:["Buy high-beta stocks","GSF compounding","Credit line leverage","Philanthropy tax savings"],ans:1,exp:"GSF at 12.48% compounds every turn automatically. Cleanest path to $5B."},
];

// ── EVENTS ───────────────────────────────────────────────────────
const EVTS=[
  {id:"rc",n:"Rate Cut",ico:"🏦",type:"mkt",prob:.05,sent:.09,dur:10,good:true,desc:"Emergency rate cut — bonds and growth stocks rally strongly."},
  {id:"rh",n:"Rate Hike",ico:"📈",type:"mkt",prob:.05,sent:-.08,dur:8,good:false,desc:"Rate hike — equity valuations compressed across market."},
  {id:"geo",n:"Geopolitical Crisis",ico:"💣",type:"mkt",prob:.04,sent:-.18,dur:20,sec:["Energy","Mining"],good:false,desc:"Regional conflict — Energy and Mining surge, sentiment collapses."},
  {id:"com",n:"Commodity Shock",ico:"⛽",type:"mkt",prob:.07,sent:-.10,dur:12,sec:["Energy","Agriculture"],good:false,desc:"Supply disruption — commodity-linked stocks swing hard."},
  {id:"treg",n:"Tech Regulation",ico:"📜",type:"mkt",prob:.04,sent:-.14,dur:18,sec:["Technology"],good:false,desc:"Global tech rules — sector falls 10–15% across all regions."},
  {id:"spb",n:"Space Breakthrough",ico:"🛸",type:"mkt",prob:.03,sent:.12,dur:15,good:true,desc:"Jupiter discovery — space sector surges, rare earth floods market."},
  {id:"td",n:"Trade Deal Signed",ico:"🤝",type:"mkt",prob:.05,sent:.10,dur:12,good:true,desc:"New bilateral deal — markets rally on improved trade outlook."},
  {id:"pan",n:"Pandemic Scare",ico:"🦠",type:"mkt",prob:.02,sent:-.12,dur:25,sec:["Retail","Manufacturing"],good:false,desc:"Health emergency — consumer sectors collapse, healthcare surges."},
  {id:"pat",n:"Patent Approved",ico:"⚡",type:"co",prob:.06,imp:.35,dur:5,good:true,desc:"Key patent granted — stock surges, P/E re-rates permanently upward."},
  {id:"scn",n:"CEO Scandal",ico:"💼",type:"co",prob:.04,imp:-.28,dur:15,good:false,desc:"Executive misconduct — stock craters. 25%+ holders get advance notice."},
  {id:"bea",n:"Earnings Beat",ico:"💰",type:"co",prob:.12,imp:.22,dur:6,good:true,desc:"Results massively beat consensus — market reprices sharply upward."},
  {id:"mis",n:"Earnings Miss",ico:"📉",type:"co",prob:.10,imp:-.20,dur:6,good:false,desc:"Results disappoint — institutional selling begins immediately."},
  {id:"con",n:"Govt Contract Won",ico:"🏛️",type:"co",prob:.05,imp:.25,dur:35,good:true,desc:"Major contract awarded — revenue visible for 35 turns. P/E re-rates."},
  {id:"str",n:"Labour Strike",ico:"✊",type:"co",prob:.04,imp:-.22,dur:12,good:false,desc:"Workers walk out — production halts for strike duration."},
  {id:"rec",n:"Product Recall",ico:"⚠️",type:"co",prob:.04,imp:-.16,dur:10,good:false,desc:"Product pulled from market — brand damage and one-time cost spike."},
];

const PEB={Technology:{min:15,max:35},Banking:{min:8,max:15},Mining:{min:6,max:12},Energy:{min:8,max:20},Agriculture:{min:10,max:18},Healthcare:{min:12,max:35},Manufacturing:{min:10,max:25},Utilities:{min:12,max:18},"Real Estate":{min:8,max:16},Telecom:{min:10,max:16},Retail:{min:10,max:18}};
const RMU={AAA:1.02,AA:1.01,A:1.00,BBB:0.99,BB:0.97,B:0.94};

// ── GOVERNOR ─────────────────────────────────────────────────────
function gBond(fv,oy,cy,rat){const y=clamp(cy/100,0.01,0.45);return clamp(Math.round(fv*(oy/100)/y*(RMU[rat]||1)*100)/100,fv*0.05,fv*2);}
function govStep(cos,gdp,inf,intr,evts){
  return cos.map(c=>{
    const pp=c.price;
    const eps=pp/c.pe;
    // Macro factor
    const macro=clamp(1+(gdp/100*0.6*c.beta)-(inf/100*0.25)-(intr/100*0.3*c.beta),0.85,1.15);
    // Random noise — bigger range so prices visibly move
    const noise=1+(Math.random()-0.5)*0.12*c.beta;
    // Event modifier
    let emod=0;
    evts.forEach(e=>{
      if(e.type==="mkt"&&(!e.sec||e.sec.includes(c.s)))emod+=e.sent*(e.tl/e.dur)*0.18;
      if(e.type==="co"&&e.tk===c.t)emod+=e.imp*(e.tl/e.dur)*0.15;
    });
    let np=pp*clamp(noise*macro+emod*pp/pp,0.92-Math.abs(emod),1.08+Math.abs(emod));
    // Daily ±8% cap
    np=clamp(np,pp*0.92,pp*1.08);
    // P/E bounds
    const b=PEB[c.s]||{min:10,max:40};
    const newPE=np/eps;
    if(newPE<b.min)np=eps*b.min;
    if(newPE>b.max)np=eps*b.max;
    np=Math.max(0.01,Math.round(np*100)/100);
    return{...c,pp,price:np,pe:Math.round(np/eps*10)/10,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-50),np]};
  });
}
function commStep(comm,evts){
  return comm.map(c=>{
    const pp=c.p;
    let drift=1+(Math.random()-0.5)*0.08;
    // Oil/energy events
    if((c.id==="OIL"||c.id==="NGS")&&evts.find(e=>e.id==="geo"||e.id==="com"))drift*=1.05;
    if(c.id==="GOLD"&&evts.find(e=>!e.good))drift*=1.02;
    if(c.id==="LITH"&&evts.find(e=>e.id==="spb"))drift*=0.88;
    const np=Math.max(0.01,Math.round(pp*clamp(drift,0.93,1.07)*100)/100);
    return{...c,p:np,pp,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-50),np]};
  });
}
function fxStep(fx,evts){
  return fx.map(f=>{
    const pp=f.p;
    let drift=1+(Math.random()-0.5)*0.006;
    if(evts.find(e=>e.id==="geo")&&(f.id==="USDJPY"))drift*=1.004;
    const np=Math.round(pp*clamp(drift,0.994,1.006)*10000)/10000;
    return{...f,p:np,pp,ch:(np-pp)/pp,hist:[...(f.hist||[pp]).slice(-50),np]};
  });
}

// ── HELPERS ──────────────────────────────────────────────────────
const Bdg=({v})=><span style={{background:v>=0?"#E8F5E9":"#FFEBEE",color:v>=0?G:R,padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmtPct(v)}</span>;

const MChart=({hist,color,w=70,h=26})=>{
  if(!hist||hist.length<2)return null;
  const mn=Math.min(...hist)*0.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;
  const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color||G} strokeWidth="1.8" strokeLinejoin="round"/></svg>;
};

function APick({max,sel,onSel,isSell,qty,unitPrice}){
  let presets;
  if(isSell){
    // qty-based sell presets
    const mx=Math.floor(max);
    presets=[{l:"1",v:1},{l:"5",v:5},{l:"10",v:10},{l:"25",v:25},{l:"50",v:50},{l:"100",v:100},{l:"500",v:500},{l:"All",v:mx}].filter(p=>p.v<=mx&&p.v>0);
  } else {
    // dollar-based buy presets scaled to cash
    const steps=max>=1e9
      ?[5e7,1e8,5e8,1e9,2e9,5e9,1e10]
      :max>=1e6
        ?[1e4,5e4,1e5,5e5,1e6,5e6,1e7]
        :max>=1e4
          ?[1e3,5e3,1e4,25e3,5e4,1e5,25e4]
          :[100,500,1e3,5e3,1e4,25e3,5e4];
    presets=[...steps.filter(v=>v<=max).map(v=>({l:fmt(v),v})),{l:"Max",v:max}];
    if(presets.length>8)presets=presets.slice(-8);
  }
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
      {presets.map(p=><button key={p.l} onClick={()=>onSel(p.v)} style={{padding:"10px 4px",borderRadius:9,border:"2px solid "+(sel===p.v?G:"#e0e0e0"),background:sel===p.v?"#E8F5E9":"#fafafa",color:sel===p.v?G:"#555",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>{p.l}</button>)}
    </div>
  );
}

const SB=({l,v,c})=>(
  <div style={{background:"#f7faf7",borderRadius:9,padding:"9px 11px",flex:1,minWidth:0}}>
    <div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.7,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l}</div>
    <div style={{fontSize:13,fontWeight:800,color:c||DK,fontFamily:"DM Mono,monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div>
  </div>
);

const Row=({k,v,vc,b})=>(
  <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f0f0f0"}}>
    <span style={{fontSize:12,color:"#666"}}>{k}</span>
    <span style={{fontSize:12,fontWeight:b?800:600,color:vc||DK,fontFamily:"DM Mono,monospace"}}>{v}</span>
  </div>
);

// ── MAIN ─────────────────────────────────────────────────────────
export default function App(){
  const[tab,setTab]=useState("dash");
  const[lang,setLang]=useState("en");
  const rtl=lang==="ar"||lang==="ur";

  // Game state as a single ref so advance() always reads current values
  const S=useRef({
    turn:1,
    cash:1000000,
    gdp:2.5,inf:3.2,intr:4.5,gsf:12.48,
    cos:INIT_COS.map(c=>({...c,pp:c.p,price:c.p,ch:0,hist:[c.p,c.p]})),
    comm:INIT_COMM,
    fx:INIT_FX,
    bonds:INIT_BONDS.map(b=>({...b,cy:b.oy})),
    aevts:[],
    sh:{},  // stock holdings {ticker: shares}
    bh:{},  // bond holdings {id: qty}
    ch:{},  // commodity holdings {id: qty}
    fh:{},  // forex holdings {id: {qty,entryPrice}}
    avgCost:{},  // avg cost per stock ticker for CGT
    commCost:{}, // avg cost per commodity
    gsfDep:0,
    dons:0,
    taxReduction:0, // cumulative % from donations
    mods:MODS.map(m=>({...m,done:false,score:null})),
    news:[
      {id:1,t:1,ico:"🌐",ti:"Galactic Raider Begins",bo:"$1,000,000 starting capital. 15 stocks, 8 commodities, 6 forex pairs. Economic Governor active.",g:true},
      {id:2,t:1,ico:"⚖️",ti:"Governor Online",bo:"All P/E ratios validated. Price movement ±8%/turn max. Prices will move every turn — watch the ticker.",g:true},
    ],
    elog:[
      {lv:"OK",t:1,sc:"Governor",msg:"All companies initialised within P/E bounds"},
      {lv:"OK",t:1,sc:"System",msg:"$1,000,000 starting capital. CGT applies on PROFIT only."},
    ],
    wh:[1000000,1000000],
  });

  // Display state — triggers re-render
  const[display,setDisplay]=useState(()=>({...S.current}));
  const[auto,setAuto]=useState(false);
  const[evN,setEvN]=useState(null);
  const[toast,setToast]=useState(null);
  const autoRef=useRef(null);

  // UI
  const[selCo,setSelCo]=useState(null);
  const[selComm,setSelComm]=useState(null);
  const[selFx,setSelFx]=useState(null);
  const[trModal,setTrModal]=useState(null); // {type:"stock"|"comm"|"fx"|"bond", item, mode:"buy"|"sell"}
  const[trAmt,setTrAmt]=useState(null);
  const[donModal,setDonModal]=useState(null);
  const[donAmt,setDonAmt]=useState(null);
  const[gsfModal,setGsfModal]=useState(false);
  const[gsfAmt,setGsfAmt]=useState(null);
  const[quizM,setQuizM]=useState(null);
  const[quizA,setQuizA]=useState(null);
  const[beta,setBeta]=useState(false);
  const[fsec,setFsec]=useState("All");
  const[freg,setFreg]=useState("All");

  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2500);},[]);

  const refresh=useCallback(()=>setDisplay({...S.current}),[]);

  // ── ADVANCE TURN — reads/writes S.current directly ──────────────
  const advance=useCallback(()=>{
    const s=S.current;
    s.turn++;
    const nn=[];

    // Macro drift
    s.gdp=Math.round(clamp(s.gdp+(Math.random()-.48)*0.6,-4,7.5)*10)/10;
    s.inf=Math.round(clamp(s.inf+(Math.random()-.5)*0.35,0,13)*10)/10;
    s.intr=Math.round(clamp(s.intr+(Math.random()-.5)*0.25,0.5,14)*10)/10;
    s.gsf=Math.round(clamp(s.gsf+(Math.random()-.5)*0.3,0.5,15)*100)/100;

    // Tick active events
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
        }else{
          s.aevts.push({...ed,tl:ed.dur,dur:ed.dur});
          nn.push({id:Math.random(),t:s.turn,ico:ed.ico,ti:ed.n,bo:ed.desc,g:ed.good});
          setEvN({...ed});setTimeout(()=>setEvN(null),5000);
          s.elog.unshift({lv:ed.good?"OK":"MEDIUM",t:s.turn,sc:"DEE",msg:"Market: "+ed.n});
        }
      }
    });

    // Simulate prices — THIS NOW MUTATES s.cos PROPERLY
    s.cos=govStep(s.cos,s.gdp,s.inf,s.intr,s.aevts);
    s.comm=commStep(s.comm,s.aevts);
    s.fx=fxStep(s.fx,s.aevts);
    s.bonds=s.bonds.map(b=>({...b,cy:Math.round(clamp(b.cy+(Math.random()-.5)*0.3,1,45)*100)/100}));

    // GSF return every turn
    if(s.gsfDep>0){
      const ret=Math.round(s.gsfDep*(s.gsf/100/12)*100)/100;
      s.cash=Math.round((s.cash+ret)*100)/100;
    }

    // Dividends every 10 turns
    if(s.turn%10===0){
      let div=0;
      Object.entries(s.sh).forEach(([t,n])=>{const c=s.cos.find(x=>x.t===t);if(c&&c.div>0)div+=c.price*(c.div/100)*n;});
      if(div>0){
        s.cash=Math.round((s.cash+div)*100)/100;
        nn.push({id:Math.random(),t:s.turn,ico:"💰",ti:"Dividends Received",bo:fmt(div)+" credited. 15% withholding applied once.",g:true});
        s.elog.unshift({lv:"OK",t:s.turn,sc:"Gov F5",msg:"Dividends: "+fmt(div)+" · Tax once"});
      }
    }

    // Wealth tax
    const nw=s.cash+Object.entries(s.sh).reduce((sum,[t,n])=>{const c=s.cos.find(x=>x.t===t);return sum+(c?c.price*n:0);},0)+s.gsfDep;
    if(nw>10e9){const tx=Math.round((nw-10e9)*0.001*100)/100;s.cash=Math.max(0,s.cash-tx);}

    // Governor log every 10 turns
    if(s.turn%10===0){
      const vio=s.cos.filter(c=>{const b=PEB[c.s]||{min:10,max:40};return c.pe<b.min||c.pe>b.max;});
      s.elog.unshift({lv:vio.length?"CRIT":"OK",t:s.turn,sc:"Governor",msg:vio.length?"P/E breach: "+vio.map(v=>v.t).join(","):"All "+s.cos.length+" within P/E bounds"});
    }

    // Milestones
    if([100,300,500,1000].includes(s.turn)){
      const ms={100:"M1 — Governor stable.",300:"M2 — Solar unlock window.",500:"M3 — DEE running.",1000:"M4 — LAUNCH GATE."};
      nn.push({id:Math.random(),t:s.turn,ico:"🏁",ti:"Milestone: Turn "+s.turn,bo:ms[s.turn]+" Net worth: "+fmt(nw),g:true});
    }

    s.wh=[...s.wh.slice(-60),nw];
    s.news=[...nn.reverse(),...s.news].slice(0,100);
    s.elog=s.elog.slice(0,100);

    refresh();
  },[refresh]);

  useEffect(()=>{
    if(auto){autoRef.current=setInterval(advance,1200);}
    else clearInterval(autoRef.current);
    return()=>clearInterval(autoRef.current);
  },[auto,advance]);

  // ── COMPUTED ─────────────────────────────────────────────────────
  const d=display;
  const sv=Object.entries(d.sh).reduce((sum,[t,n])=>{const c=d.cos.find(x=>x.t===t);return sum+(c?c.price*n:0);},0);
  const bv=Object.entries(d.bh).reduce((sum,[id,q])=>{const b=d.bonds.find(x=>x.id===id);return sum+(b?gBond(b.fv,b.oy,b.cy,b.rat)*q:0);},0);
  const cv=Object.entries(d.ch||{}).reduce((sum,[id,q])=>{const c=d.comm.find(x=>x.id===id);return sum+(c?c.p*q:0);},0);
  const nw=d.cash+sv+bv+cv+d.gsfDep;
  const pnw=d.wh[d.wh.length-2]||1000000;
  const nwch=nw-pnw;

  const regs=new Set(Object.keys(d.sh).map(t=>d.cos.find(c=>c.t===t)?.r).filter(Boolean));
  const adone=d.mods.filter(m=>m.done).length;
  const sc={
    nw:{met:nw>=5e9,l:"Net Worth $5B",v:fmt(nw)+" / $5B"},
    turns:{met:d.turn>=300,l:"Turn 300",v:d.turn+"/300"},
    regions:{met:regs.size>=3,l:"3 Regions",v:regs.size+"/3"},
    bonds:{met:Object.keys(d.bh).length>=2,l:"2 Bonds",v:Object.keys(d.bh).length+"/2"},
    academy:{met:adone>=3,l:"3 Academy",v:adone+"/3"},
    phi:{met:d.dons>=2,l:"2 Donations",v:d.dons+"/2"},
  };
  const spct=Math.round(Object.values(sc).filter(x=>x.met).length/6*100);

  // ── TRADE ACTIONS ────────────────────────────────────────────────
  const doTrade=()=>{
    if(!trModal||!trAmt)return;
    const s=S.current;
    const{type,item,mode}=trModal;

    if(type==="stock"){
      const isBuy=mode==="buy";
      if(isBuy){
        const shares=Math.floor(trAmt/item.price);
        if(shares<1||trAmt>s.cash){toast_("Insufficient cash",false);return;}
        const cost=shares*item.price;
        s.cash=Math.round((s.cash-cost)*100)/100;
        s.sh={...s.sh,[item.t]:(s.sh[item.t]||0)+shares};
        // Track avg cost for CGT
        const prevShares=s.sh[item.t]-shares;
        const prevCost=(s.avgCost[item.t]||item.price)*prevShares;
        s.avgCost[item.t]=(prevCost+cost)/(s.sh[item.t]);
        s.elog.unshift({lv:"OK",t:s.turn,sc:"Trade",msg:"BUY "+shares+" "+item.t+" @ "+fmt(item.price)});
        toast_("Bought "+shares+" "+item.t);
      }else{
        const held=s.sh[item.t]||0;
        const shares=Math.min(trAmt,held);
        if(shares<1){toast_("No shares to sell",false);return;}
        const proceeds=Math.round(shares*item.price*100)/100;
        const avgC=s.avgCost[item.t]||item.price;
        const profit=Math.max(0,(item.price-avgC)*shares); // CGT on PROFIT only
        const tax=Math.round(profit*0.20*100)/100;
        const net=proceeds-tax;
        s.cash=Math.round((s.cash+net)*100)/100;
        s.sh={...s.sh,[item.t]:held-shares};
        if(s.sh[item.t]<=0)delete s.sh[item.t];
        s.elog.unshift({lv:"OK",t:s.turn,sc:"CGT",msg:"SELL "+shares+" "+item.t+" · Profit: "+fmt(profit)+" · Tax (20%): "+fmt(tax)+" · Net: "+fmt(net)});
        toast_("Sold "+shares+" "+item.t+". Tax: "+fmt(tax)+" on profit only");
      }
    }

    if(type==="comm"){
      const isBuy=mode==="buy";
      if(isBuy){
        const qty=trAmt; // qty in units
        const cost=Math.round(qty*item.p*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.cash=Math.round((s.cash-cost)*100)/100;
        s.ch={...s.ch,[item.id]:(s.ch[item.id]||0)+qty};
        s.commCost={...s.commCost,[item.id]:item.p};
        toast_("Bought "+qty+" "+item.unit+" "+item.n);
      }else{
        const held=s.ch[item.id]||0;
        const qty=Math.min(trAmt,held);
        if(qty<1){toast_("None held",false);return;}
        const proceeds=Math.round(qty*item.p*100)/100;
        const avgC=s.commCost[item.id]||item.p;
        const profit=Math.max(0,(item.p-avgC)*qty);
        const tax=Math.round(profit*0.20*100)/100;
        const net=proceeds-tax;
        s.cash=Math.round((s.cash+net)*100)/100;
        s.ch={...s.ch,[item.id]:held-qty};
        if(s.ch[item.id]<=0)delete s.ch[item.id];
        toast_("Sold "+qty+" "+item.unit+" · Tax on profit: "+fmt(tax));
      }
    }

    if(type==="bond"){
      const pr=gBond(item.fv,item.oy,item.cy,item.rat);
      if(mode==="buy"){
        const qty=trAmt;
        const cost=Math.round(pr*qty*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.cash=Math.round((s.cash-cost)*100)/100;
        s.bh={...s.bh,[item.id]:(s.bh[item.id]||0)+qty};
        toast_("Bought "+qty+"× "+item.n);
      }else{
        const held=s.bh[item.id]||0;
        const qty=Math.min(trAmt,held);
        const proceeds=Math.round(pr*qty*100)/100;
        s.cash=Math.round((s.cash+proceeds)*100)/100;
        s.bh={...s.bh,[item.id]:held-qty};
        if(s.bh[item.id]<=0)delete s.bh[item.id];
        toast_("Sold "+qty+"× bond · Proceeds: "+fmt(proceeds));
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
    S.current.news.unshift({id:Math.random(),t:S.current.turn,ico:"❤️",ti:"Donation: "+donModal,bo:fmt(donAmt)+" donated. Tax rate reduced by 5%. Total reduction: "+(S.current.taxReduction*100).toFixed(0)+"%. Solar criteria: "+S.current.dons+"/2.",g:true});
    S.current.elog.unshift({lv:"OK",t:S.current.turn,sc:"Philanthropy",msg:"Donation "+fmt(donAmt)+" · Tax reduction: "+(S.current.taxReduction*100).toFixed(0)+"%"});
    toast_("❤️ Tax now reduced by "+(S.current.taxReduction*100).toFixed(0)+"%");
    setDonModal(null);setDonAmt(null);refresh();
  };

  const doGsf=()=>{
    if(!gsfAmt||gsfAmt>S.current.cash){toast_("Insufficient cash",false);return;}
    S.current.cash=Math.round((S.current.cash-gsfAmt)*100)/100;
    S.current.gsfDep+=gsfAmt;
    S.current.elog.unshift({lv:"OK",t:S.current.turn,sc:"GSF",msg:"Deposit "+fmt(gsfAmt)+" @ "+S.current.gsf.toFixed(2)+"%"});
    toast_("Deposited "+fmt(gsfAmt)+" to GSF");
    setGsfModal(false);setGsfAmt(null);refresh();
  };

  const doModule=(m)=>{
    const score=72+Math.floor(Math.random()*27);
    S.current.mods=S.current.mods.map(x=>x.id===m.id?{...x,done:true,score}:x);
    S.current.news.unshift({id:Math.random(),t:S.current.turn,ico:"🎓",ti:"Academy: "+m.n,bo:"Score: "+score+"%. "+(S.current.mods.filter(x=>x.done).length)+"/15 modules done.",g:true});
    toast_(m.n+" — Score: "+score+"%");
    setQuizM(null);setQuizA(null);refresh();
  };

  // ── SCREENS ────────────────────────────────────────────────────
  const TABS=[
    {id:"dash",ico:"🏠",l:"Home"},{id:"mkt",ico:"📊",l:"Stocks"},{id:"comm",ico:"⛽",l:"Commod."},
    {id:"fx",ico:"💱",l:"Forex"},{id:"bonds",ico:"📋",l:"Bonds"},{id:"port",ico:"💼",l:"Port."},
    {id:"ac",ico:"🎓",l:"Learn"},{id:"ph",ico:"❤️",l:"Give"},{id:"gsf",ico:"🏛️",l:"GSF"},
    {id:"sol",ico:"☀️",l:"Solar"},{id:"set",ico:"⚙️",l:"Set."},
  ];
  const ts=id=>({padding:"4px 0",flex:1,border:"none",background:tab===id?"#fff":"transparent",borderRadius:tab===id?6:0,color:tab===id?G:"#aaa",fontWeight:700,fontSize:8,cursor:"pointer",fontFamily:"DM Sans,sans-serif",textAlign:"center",boxShadow:tab===id?"0 1px 3px rgba(0,0,0,.1)":"none",minWidth:32});

  // WealthChart
  const WChart=({hist})=>{
    if(!hist||hist.length<2)return null;
    const w=300,h=46;
    const mn=Math.min(...hist)*0.98,mx=Math.max(...hist)*1.02,rng=mx-mn||1;
    const line=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");
    const area=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`);
    area.push(`${w},${h}`);area.push(`0,${h}`);
    return <svg width="100%" height={h} viewBox={"0 0 "+w+" "+h} preserveAspectRatio="none"><defs><linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4CAF50" stopOpacity=".35"/><stop offset="100%" stopColor="#4CAF50" stopOpacity="0"/></linearGradient></defs><polygon points={area.join(" ")} fill="url(#wg)"/><polyline points={line} fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinejoin="round"/></svg>;
  };

  const Dash=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:16,padding:17,color:"#fff",overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",top:-35,right:-35,width:120,height:120,background:"rgba(255,255,255,.05)",borderRadius:"50%"}}/>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1.2,marginBottom:2}}>Total Net Worth</div>
        <div style={{fontSize:34,fontWeight:800,fontFamily:"DM Mono,monospace",lineHeight:1,marginBottom:4}}>{fmt(nw)}</div>
        <div style={{fontSize:11,opacity:.85,marginBottom:10}}>{nwch>=0?"📈":"📉"} {fmt(Math.abs(nwch))} ({nwch>=0?"+":""}{pnw>0?((nwch/pnw)*100).toFixed(2):0}%) last turn</div>
        <div style={{height:46}}><WChart hist={d.wh}/></div>
        <div style={{display:"flex",gap:8,marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.15)"}}>
          {[["Cash",fmt(d.cash)],["Stocks",fmt(sv)],["Bonds",fmt(bv)],["Comm.",fmt(cv)],["GSF",fmt(d.gsfDep)]].map(([k,v])=>(
            <div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:7,opacity:.45,textTransform:"uppercase",marginBottom:1}}>{k}</div><div style={{fontSize:10,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{v}</div></div>
          ))}
        </div>
      </div>

      <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <span style={{fontSize:14,fontWeight:800,color:DK}}>Turn {d.turn}</span>
          <span style={{fontSize:9,color:"#bbb"}}>M1@100 · M2@300 · M4@1000</span>
        </div>
        <div style={{display:"flex",gap:7}}>
          <button onClick={advance} disabled={auto} style={{flex:3,background:auto?"#e0e0e0":G,color:auto?"#aaa":"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:800,fontSize:13,cursor:auto?"not-allowed":"pointer",fontFamily:"DM Sans,sans-serif"}}>▶ Advance Turn</button>
          <button onClick={()=>setAuto(a=>!a)} style={{flex:2,background:auto?"#B71C1C":"#f0f4f0",color:auto?"#fff":"#666",border:"1px solid #ddd",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>{auto?"⏹ Stop":"Auto-Sim"}</button>
        </div>
      </div>

      <div onClick={()=>setTab("sol")} style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:12,padding:12,cursor:"pointer",border:"1px solid rgba(212,175,55,.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:17}}>☀️</span><div><div style={{fontSize:11,fontWeight:700,color:"#F0D060"}}>Solar System {spct===100?"— UNLOCKED!":"Progress"}</div><div style={{fontSize:8,color:"rgba(240,208,96,.4)"}}>{Object.values(sc).filter(x=>x.met).length}/6 criteria met</div></div></div>
          <span style={{fontFamily:"DM Mono,monospace",fontSize:14,fontWeight:700,color:"#F0D060"}}>{spct}%</span>
        </div>
        <div style={{height:5,background:"rgba(255,255,255,.07)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:3,transition:"width .5s"}}/></div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        {[{l:"GDP",v:(d.gdp>=0?"+":"")+d.gdp+"%",c:d.gdp>=0?G:R},{l:"Inflation",v:d.inf+"%",c:d.inf>6?R:d.inf>3?AU:G},{l:"Interest",v:d.intr+"%",c:"#444"},{l:"GSF Rate",v:d.gsf.toFixed(2)+"%",c:G}].map(x=>(
          <div key={x.l} style={{background:"#fff",borderRadius:10,padding:"9px 11px",border:"1px solid #eee"}}><div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{x.l}</div><div style={{fontSize:17,fontWeight:800,color:x.c,fontFamily:"DM Mono,monospace"}}>{x.v}</div></div>
        ))}
      </div>

      {d.aevts.length>0&&(
        <div>
          <div style={{fontSize:10,fontWeight:700,color:"#bbb",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Active Events ({d.aevts.length})</div>
          {d.aevts.slice(0,3).map((e,i)=>(
            <div key={i} style={{background:e.good?"#E8F5E9":"#FFEBEE",borderRadius:9,padding:"8px 11px",border:"1px solid "+(e.good?"#A5D6A7":"#EF9A9A"),display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <span style={{fontSize:17}}>{e.ico}</span>
              <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:e.good?G:R}}>{e.n}{e.cn?" — "+e.cn:""}</div><div style={{fontSize:9,color:"#888"}}>{e.tl}/{e.dur} turns</div></div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(d.sh).length>0&&(
        <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:9}}>Top Holdings</div>
          {Object.entries(d.sh).slice(0,4).map(([t,n])=>{
            const c=d.cos.find(x=>x.t===t);if(!c)return null;
            return <div key={t} onClick={()=>{setSelCo(c);setTab("co");}} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:"1px solid #f5f5f5",cursor:"pointer"}}><div style={{width:34,height:34,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:9,color:"#bbb"}}>{n.toLocaleString()} shares · avg {fmt(d.avgCost[t]||c.price)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(c.price*n)}</div><Bdg v={c.ch}/></div></div>;
          })}
        </div>
      )}
    </div>
  );

  const Mkt=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{overflowX:"auto"}}><div style={{display:"flex",gap:5,paddingBottom:3,width:"max-content"}}>{["All",...new Set(INIT_COS.map(c=>c.s))].map(s=><button key={s} onClick={()=>setFsec(s)} style={{padding:"5px 11px",borderRadius:20,border:"1.5px solid "+(fsec===s?G:"#ddd"),background:fsec===s?G:"#fff",color:fsec===s?"#fff":"#666",fontWeight:600,fontSize:9,cursor:"pointer",fontFamily:"DM Sans,sans-serif",whiteSpace:"nowrap"}}>{s}</button>)}</div></div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.cos.filter(c=>(fsec==="All"||c.s===fsec)).map((c,i,arr)=>(
          <div key={c.t} onClick={()=>{setSelCo({...c});setTab("co");}} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",borderBottom:i<arr.length-1?"1px solid #f8f8f8":"none",cursor:"pointer"}}>
            <div style={{width:34,height:34,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{c.t}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:DK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.n}</div><div style={{fontSize:9,color:"#bbb"}}>{c.s} · P/E {c.pe.toFixed(1)}x</div></div>
            <MChart hist={c.hist} color={c.ch>=0?G:R}/>
            <div style={{textAlign:"right",minWidth:65}}><div style={{fontSize:12,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(c.price)}</div><Bdg v={c.ch}/></div>
          </div>
        ))}
      </div>
    </div>
  );

  const Co=(()=>{
    const c=selCo?d.cos.find(x=>x.t===selCo.t)||selCo:null;
    if(!c)return <div style={{padding:32,textAlign:"center",color:"#aaa",fontSize:13}}>← Select a stock from the Stocks tab</div>;
    const held=d.sh[c.t]||0;
    const avgC=d.avgCost[c.t]||c.price;
    const unrealPL=held?(c.price-avgC)*held:0;
    const ev=d.aevts.find(e=>e.type==="co"&&e.tk===c.t);
    const b=PEB[c.s]||{min:10,max:40};
    return(
      <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:14,padding:15,color:"#fff",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-25,right:-25,width:90,height:90,background:"rgba(255,255,255,.04)",borderRadius:"50%"}}/>
          <div style={{fontSize:9,opacity:.55,textTransform:"uppercase",letterSpacing:1.2,marginBottom:1}}>{c.s} · {c.r}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div><div style={{fontSize:19,fontWeight:800,marginBottom:2}}>{c.n}</div><div style={{fontSize:10,opacity:.55,marginBottom:7}}>{c.t}</div><div style={{fontFamily:"DM Mono,monospace",fontSize:27,fontWeight:800,lineHeight:1}}>{fmt(c.price)}</div><div style={{fontSize:11,marginTop:3,color:c.ch>=0?"#C8E6C9":"#FFCDD2"}}>{c.ch>=0?"▲":"▼"} {fmtPct(c.ch)} this turn</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:9,opacity:.45,marginBottom:2}}>P/E</div><div style={{fontSize:19,fontWeight:800,fontFamily:"DM Mono,monospace"}}>{c.pe.toFixed(1)}x</div><div style={{fontSize:8,opacity:.35}}>{b.min}–{b.max}x bounds</div></div>
          </div>
        </div>
        {ev&&<div style={{background:ev.good?"#E8F5E9":"#FFEBEE",borderRadius:9,padding:9,border:"1px solid "+(ev.good?"#A5D6A7":"#EF9A9A"),display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:17}}>{ev.ico}</span><div><div style={{fontSize:11,fontWeight:700,color:ev.good?G:R}}>{ev.n}</div><div style={{fontSize:9,color:"#888"}}>{ev.tl}/{ev.dur} turns · {ev.desc}</div></div></div>}
        {held>0&&<div style={{background:"#E8F5E9",borderRadius:10,padding:11,border:"1px solid #A5D6A7"}}><div style={{fontSize:10,fontWeight:700,color:G,marginBottom:7}}>Your Position</div><div style={{display:"flex",gap:7}}><SB l="Shares" v={held.toLocaleString()} c={G}/><SB l="Value" v={fmt(c.price*held)} c={G}/><SB l="Avg Cost" v={fmt(avgC)} c="#555"/><SB l="P&L" v={(unrealPL>=0?"+":"")+fmt(unrealPL)} c={unrealPL>=0?G:R}/></div></div>}
        <div style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#aaa",marginBottom:6}}>Price Chart ({c.hist?.length||0} turns)</div>
          <div style={{height:48,display:"flex",alignItems:"flex-end",gap:2}}>
            {(c.hist||[]).slice(-40).map((pr,i,arr)=>{const mn=Math.min(...arr),mx=Math.max(...arr),rng=mx-mn||1;const h=Math.max(3,Math.round(((pr-mn)/rng)*44));return <div key={i} style={{flex:1,height:h,background:(i===0||pr>=arr[i-1])?G:R,borderRadius:"2px 2px 0 0",opacity:.75}}/>;})}</div>
        </div>
        <div style={{display:"flex",gap:7}}>
          <button onClick={()=>{setTrModal({type:"stock",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:10,padding:13,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>📈 Buy</button>
          <button onClick={()=>{setTrModal({type:"stock",item:c,mode:"sell"});setTrAmt(null);}} disabled={held<1} style={{flex:1,background:held<1?"#f0f0f0":"#FFEBEE",color:held<1?"#bbb":R,border:"1.5px solid "+(held<1?"#e0e0e0":"#EF9A9A"),borderRadius:10,padding:13,fontWeight:800,fontSize:13,cursor:held<1?"not-allowed":"pointer",fontFamily:"DM Sans,sans-serif"}}>📉 Sell {held>0?"("+held.toLocaleString()+")":""}</button>
        </div>
        <div style={{background:"#FFF8E1",borderRadius:9,padding:9,fontSize:11,color:"#E65100",lineHeight:1.5}}><strong>Capital Gains Tax:</strong> 20% on PROFIT only (sale price − avg cost price). Donations reduce this rate by up to 25%. Current reduction: {(d.taxReduction*100).toFixed(0)}%.</div>
      </div>
    );
  })();

  const Comm=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{background:"#FFF8E1",borderRadius:10,padding:11,border:"1px solid #FFE082",fontSize:11,color:"#E65100",lineHeight:1.5}}>Commodity trading · Buy units and hold as prices move. CGT on profit only at 20% minus your donation reduction ({(d.taxReduction*100).toFixed(0)}% off).</div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.comm.map((c,i)=>{
          const held=d.ch?.[c.id]||0;
          return(
            <div key={c.id} style={{padding:"11px 13px",borderBottom:i<d.comm.length-1?"1px solid #f8f8f8":"none"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
                <div><div style={{fontSize:13,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:9,color:"#bbb"}}>{c.id} · per {c.unit} · Held: {held}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,fontFamily:"DM Mono,monospace",color:c.ch>=0?G:R}}>{fmt(c.p)}</div><Bdg v={c.ch||0}/></div>
              </div>
              <div style={{height:26,marginBottom:7}}><MChart hist={c.hist} color={c.ch>=0?G:R} w={200} h={26}/></div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{setTrModal({type:"comm",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Buy</button>
                {held>0&&<button onClick={()=>{setTrModal({type:"comm",item:c,mode:"sell"});setTrAmt(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Sell ({held})</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const Fx=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{background:"#E3F2FD",borderRadius:10,padding:11,border:"1px solid #BBDEFB",fontSize:11,color:BL,lineHeight:1.5}}>Forex trading · GSF buy rate USD/AED 3.6735 · Sell rate 3.65 · RMB rate 6.8 (locked per Master Brief). All pairs move each turn.</div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.fx.map((f,i)=>{
          const held=d.fh?.[f.id]||0;
          return(
            <div key={f.id} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 13px",borderBottom:i<d.fx.length-1?"1px solid #f8f8f8":"none"}}>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:DK}}>{f.n}</div><div style={{fontSize:9,color:"#bbb"}}>{f.id}</div></div>
              <MChart hist={f.hist} color={f.ch>=0?G:R}/>
              <div style={{textAlign:"right",minWidth:80}}><div style={{fontSize:13,fontWeight:800,fontFamily:"DM Mono,monospace"}}>{f.p.toFixed(4)}</div><Bdg v={f.ch||0}/></div>
            </div>
          );
        })}
      </div>
      <div style={{background:"#f8fbf8",borderRadius:10,padding:11,fontSize:11,color:"#666",lineHeight:1.5}}>Note: Full forex trading (position sizing, leverage, spread) will be implemented in Phase 1 build. This screen shows live rates that affect company valuations each turn.</div>
    </div>
  );

  const Bonds_=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{background:"#E3F2FD",borderRadius:10,padding:11,border:"1px solid #BBDEFB",fontSize:11,color:BL}}>Price = FaceValue × (OrigYield ÷ CurrYield) × RatingMult · AAA×1.02 → B×0.94 · Range 5%–200%</div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.bonds.map((b,i)=>{
          const pr=gBond(b.fv,b.oy,b.cy,b.rat);
          const held=d.bh[b.id]||0;
          return(
            <div key={b.id} style={{padding:"12px 13px",borderBottom:i<d.bonds.length-1?"1px solid #f5f5f5":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                <div><div style={{fontSize:13,fontWeight:700,color:DK}}>{b.n}</div><div style={{fontSize:9,color:"#bbb"}}>{b.id} · {b.mat} · <span style={{fontWeight:700,color:b.rat==="AAA"||b.rat==="AA"?G:b.rat==="BB"||b.rat==="B"?R:AU}}>{b.rat}</span></div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,fontFamily:"DM Mono,monospace",color:pr>b.fv?G:R}}>{fmt(pr)}</div><div style={{fontSize:9,color:"#aaa"}}>{b.cy.toFixed(2)}% yield</div></div>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:7}}><SB l="Coupon" v={b.cou+"%"} c={G}/><SB l="Orig Yield" v={b.oy+"%"} c="#555"/><SB l="Curr Yield" v={b.cy.toFixed(1)+"%"} c={b.cy<b.oy?G:R}/><SB l="Held" v={held} c={held>0?G:"#aaa"}/></div>
              <div style={{display:"flex",gap:6}}>
                {[1,5,10].map(q=><button key={q} onClick={()=>{setTrModal({type:"bond",item:b,mode:"buy"});setTrAmt(q);setTimeout(()=>{},0);const s=S.current;const cost=gBond(b.fv,b.oy,b.cy,b.rat)*q;if(cost>s.cash){toast_("Insufficient cash",false);return;}s.cash=Math.round((s.cash-cost)*100)/100;s.bh={...s.bh,[b.id]:(s.bh[b.id]||0)+q};s.elog.unshift({lv:"OK",t:s.turn,sc:"Bonds",msg:"BUY "+q+"× "+b.id+" @ "+fmt(gBond(b.fv,b.oy,b.cy,b.rat))});toast_("Bought "+q+"× "+b.n);refresh();}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Buy {q}</button>)}
                <button onClick={()=>{const s=S.current;const q=s.bh[b.id]||0;if(!q){toast_("None held",false);return;}const pr2=gBond(b.fv,b.oy,b.cy,b.rat);const tot=Math.round(pr2*q*100)/100;s.cash=Math.round((s.cash+tot)*100)/100;s.bh={...s.bh,[b.id]:0};delete s.bh[b.id];s.elog.unshift({lv:"OK",t:s.turn,sc:"Bonds",msg:"SELL ALL "+b.id+" = "+fmt(tot)});toast_("Sold all "+b.n+" for "+fmt(tot));refresh();}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Sell All</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const Port=(()=>{
    const sm={};Object.entries(d.sh).forEach(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(c)sm[c.s]=(sm[c.s]||0)+c.price*n;});
    const tsv=Object.values(sm).reduce((a,b2)=>a+b2,0)||1;
    return(
      <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:"linear-gradient(135deg,#1B5E20,#388E3C)",borderRadius:14,padding:14,color:"#fff"}}>
          <div style={{fontSize:10,opacity:.5,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Portfolio</div>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:28,fontWeight:800}}>{fmt(nw)}</div>
          <div style={{fontSize:10,opacity:.7,marginTop:3}}>S:{fmt(sv)} · B:{fmt(bv)} · C:{fmt(cv)} · GSF:{fmt(d.gsfDep)} · Cash:{fmt(d.cash)}</div>
        </div>
        {d.taxReduction>0&&<div style={{background:"#E8F5E9",borderRadius:9,padding:9,border:"1px solid #A5D6A7",fontSize:11,color:G}}><strong>Tax Reduction Active:</strong> {(d.taxReduction*100).toFixed(0)}% off CGT from {d.dons} donation(s). Effective CGT rate: {(20*(1-d.taxReduction)).toFixed(1)}%</div>}
        {Object.keys(sm).length>0&&<div style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}><div style={{fontSize:11,fontWeight:700,color:DK,marginBottom:8}}>Sector Allocation</div>{Object.entries(sm).sort(([,a],[,b2])=>b2-a).map(([s,v])=><div key={s} style={{marginBottom:7}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11,color:"#555"}}>{s}</span><span style={{fontSize:11,fontFamily:"DM Mono,monospace"}}>{((v/tsv)*100).toFixed(1)}%</span></div><div style={{height:4,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:((v/tsv)*100)+"%",background:"linear-gradient(90deg,"+G+",#4CAF50)",borderRadius:2}}/></div></div>)}</div>}
        <div style={{background:"#fff",borderRadius:11,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          <div style={{padding:"9px 13px",fontSize:11,fontWeight:700,color:DK}}>Stocks ({Object.keys(d.sh).length})</div>
          {Object.keys(d.sh).length===0&&<div style={{padding:"11px 13px",fontSize:12,color:"#bbb"}}>No stocks held.</div>}
          {Object.entries(d.sh).map(([t,n])=>{
            const c=d.cos.find(x=>x.t===t);if(!c||n<=0)return null;
            const avgC=d.avgCost[t]||c.price;
            const pl=(c.price-avgC)*n;
            return(
              <div key={t} style={{padding:"9px 13px",borderTop:"1px solid #f8f8f8"}}>
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:6}} onClick={()=>{setSelCo({...c});setTab("co");}} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",marginBottom:6}}>
                  <div style={{width:32,height:32,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div>
                  <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:9,color:"#bbb"}}>{n.toLocaleString()} × {fmt(c.price)} · avg {fmt(avgC)}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(c.price*n)}</div><div style={{fontSize:10,fontFamily:"DM Mono,monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{fmt(pl)} P&L</div></div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{setTrModal({type:"stock",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:7,padding:"7px 0",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>+ Buy More</button>
                  <button onClick={()=>{setTrModal({type:"stock",item:c,mode:"sell"});setTrAmt(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"7px 0",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Sell</button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{background:"#fff",borderRadius:11,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          <div style={{padding:"9px 13px",fontSize:11,fontWeight:700,color:DK}}>Bonds ({Object.keys(d.bh).length})</div>
          {Object.keys(d.bh).length===0&&<div style={{padding:"11px 13px",fontSize:12,color:"#bbb"}}>No bonds.</div>}
          {Object.entries(d.bh).filter(([,q])=>q>0).map(([id,q])=>{const b=d.bonds.find(x=>x.id===id);if(!b)return null;const pr=gBond(b.fv,b.oy,b.cy,b.rat);
            return <div key={id} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",borderTop:"1px solid #f8f8f8"}}><div style={{width:32,height:32,borderRadius:9,background:"#E3F2FD",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:BL,border:"1px solid #BBDEFB",flexShrink:0}}>{b.rat}</div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:DK}}>{b.n}</div><div style={{fontSize:9,color:"#bbb"}}>{q}× · {b.cou}% coupon · {b.mat}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(pr*q)}</div><div style={{fontSize:9,color:"#aaa"}}>{b.cy.toFixed(1)}% yield</div></div></div>;
          })}
        </div>
        {Object.keys(d.ch||{}).filter(id=>(d.ch[id]||0)>0).length>0&&<div style={{background:"#fff",borderRadius:11,border:"1px solid #e8ebe8",overflow:"hidden"}}><div style={{padding:"9px 13px",fontSize:11,fontWeight:700,color:DK}}>Commodities</div>{Object.entries(d.ch||{}).filter(([,q])=>q>0).map(([id,q])=>{const c=d.comm.find(x=>x.id===id);if(!c)return null;return <div key={id} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",borderTop:"1px solid #f8f8f8"}}><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:9,color:"#bbb"}}>{q} {c.unit}(s)</div></div><div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(c.p*q)}</div><Bdg v={c.ch||0}/></div></div>;})}</div>}
      </div>
    );
  })();

  const Acad=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:13,padding:13,color:"#fff"}}>
        <div style={{fontSize:9,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🎓 Earth Academy</div>
        <div style={{fontSize:17,fontWeight:800,marginBottom:3}}>15 Modules · Scenario-Based</div>
        <div style={{fontSize:10,opacity:.8}}>Named certificate at completion · 3 modules needed for Solar unlock</div>
        <div style={{display:"flex",gap:7,marginTop:9}}><SB l="Done" v={adone+"/15"} c={adone>=3?"#C8E6C9":"#fff"}/><SB l="Solar Gate" v={adone>=3?"✓ Met":"Need "+(3-adone)} c={adone>=3?"#C8E6C9":"#FFCDD2"}/></div>
      </div>
      {adone>=15&&<div style={{background:"linear-gradient(135deg,#B8952A,#F0D060)",borderRadius:11,padding:13,textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:3}}>🏆 Certificate Earned!</div><div style={{fontSize:10,color:"rgba(255,255,255,.8)"}}>Earth Academy Graduate · Not investment advice.</div></div>}
      <div style={{background:"#fff",borderRadius:11,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.mods.map((m,i)=>(
          <div key={m.id} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 13px",borderBottom:i<d.mods.length-1?"1px solid #f8f8f8":"none"}}>
            <div style={{width:28,height:28,borderRadius:8,background:m.done?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,border:m.done?"1px solid #A5D6A7":"1px solid #e0e0e0"}}>{m.done?"✅":"📖"}</div>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:m.done?G:DK}}>{m.n}</div>{m.score&&<div style={{fontSize:9,color:"#bbb"}}>Score: {m.score}%</div>}</div>
            {!m.done?<button onClick={()=>{setQuizM(m);setQuizA(null);}} style={{background:G,color:"#fff",border:"none",borderRadius:7,padding:"6px 12px",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Start</button>:<span style={{fontSize:11,color:G,fontWeight:700}}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );

  const Ph=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#880E4F,#C2185B)",borderRadius:14,padding:14,color:"#fff"}}>
        <div style={{fontSize:9,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>❤️ Philanthropy</div>
        <div style={{fontSize:17,fontWeight:800,marginBottom:3}}>Build Your Legacy</div>
        <div style={{fontSize:10,opacity:.8,lineHeight:1.5}}>Each donation reduces your capital gains tax rate by 5%, up to a maximum of 25% total reduction. 2 donations needed for Solar unlock.</div>
        <div style={{display:"flex",gap:7,marginTop:9}}>
          <SB l="Donations" v={d.dons} c="#FFCDD2"/>
          <SB l="Tax Reduction" v={(d.taxReduction*100).toFixed(0)+"%"} c="#FFCDD2"/>
          <SB l="Solar" v={d.dons>=2?"✓ Met":"Need "+(Math.max(0,2-d.dons))} c={d.dons>=2?"#C8E6C9":"#FFCDD2"}/>
        </div>
      </div>
      {[{n:"Healthcare",ico:"🏥",imp:"CGT −5% · Africa GDP boost"},{n:"Education",ico:"🎓",imp:"CGT −5% · Long-term growth"},{n:"Infrastructure",ico:"🌉",imp:"CGT −5% · Trade margins +5%"},{n:"Space Research",ico:"🔭",imp:"CGT −5% · Solar bonus"},{n:"Climate Action",ico:"🌱",imp:"CGT −5% · Climate risk −30%"}].map(cat=>(
        <div key={cat.n} style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}><span style={{fontSize:21}}>{cat.ico}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:DK}}>{cat.n}</div><div style={{background:"#FFF8E1",borderRadius:6,padding:"2px 7px",marginTop:3,fontSize:10,color:"#E65100",display:"inline-block"}}>{cat.imp}</div></div></div>
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
        <div style={{fontSize:10,opacity:.8}}>One rate for all players · Server-calculated per turn · Credited to your cash every single turn automatically</div>
      </div>
      <div style={{background:"#E3F2FD",borderRadius:11,padding:12,border:"1px solid #BBDEFB"}}>
        <div style={{fontSize:11,fontWeight:700,color:BL,marginBottom:8}}>Your GSF Position</div>
        <div style={{display:"flex",gap:7,marginBottom:11}}><SB l="Your Deposit" v={fmt(d.gsfDep)} c={BL}/><SB l="Rate / yr" v={d.gsf.toFixed(2)+"%"} c={G}/><SB l="Per Turn" v={fmt(d.gsfDep*(d.gsf/100/12))} c={G}/><SB l="Total Return" v={fmt(d.gsfDep*(d.gsf/100/12)*d.turn)} c={G}/></div>
        <div style={{background:"#fff",borderRadius:8,padding:"9px 10px",marginBottom:10,fontSize:11,color:"#555"}}>GSF total pool is calculated across all players on the server. Your return is your deposit × the broadcast rate. Rate range: 0.5%–15% annual.</div>
        <button onClick={()=>{setGsfModal(true);setGsfAmt(null);}} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>+ Deposit to GSF</button>
      </div>
    </div>
  );

  const Sol=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#060B16,#112040)",borderRadius:14,padding:14,border:"1px solid rgba(212,175,55,.15)"}}>
        <div style={{fontSize:9,opacity:.45,color:"#F0D060",textTransform:"uppercase",letterSpacing:1.2,marginBottom:4}}>☀️ Solar System Unlock</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}><div style={{fontFamily:"DM Mono,monospace",fontSize:30,fontWeight:800,color:"#F0D060"}}>{spct}%</div><div style={{fontSize:10,color:"rgba(240,208,96,.4)"}}>Need 100%</div></div>
        <div style={{height:7,background:"rgba(255,255,255,.07)",borderRadius:4,overflow:"hidden",marginBottom:13}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:4,transition:"width .5s"}}/></div>
        {Object.entries(sc).map(([k,c2])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:c2.met?"rgba(0,230,118,.2)":"rgba(255,255,255,.05)",border:"2px solid "+(c2.met?"#00E676":"rgba(255,255,255,.1)"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0,color:"#00E676"}}>{c2.met?"✓":""}</div>
            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:c2.met?"#00E676":"rgba(255,255,255,.45)"}}>{c2.l}</div><div style={{fontSize:9,color:"rgba(240,208,96,.35)",fontFamily:"DM Mono,monospace"}}>{c2.v}</div></div>
          </div>
        ))}
      </div>
      <div style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:11,padding:13,border:"1px solid rgba(212,175,55,.07)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"rgba(212,175,55,.45)",marginBottom:9}}>🔒 210 Companies Across 7 Planets</div>
        {[{ico:"🔴",pl:"Mars",cu:"MCR",d:"30 mining · Lithium, water ice · 3.71m/s²"},{ico:"🟡",pl:"Venus",cu:"VNU",d:"30 manufacturing · 465°C surface"},{ico:"🟠",pl:"Jupiter",cu:"JVT",d:"30 research · Fusion · P/E exemption"},{ico:"🪐",pl:"Saturn",cu:"STC",d:"30 ring mining · Helium-3, Ryzolith"},{ico:"☿",pl:"Mercury",cu:"MRC",d:"30 solar energy · 430°C/-180°C"},{ico:"🔵",pl:"Uranus",cu:"URU",d:"30 ice mining · -224°C"},{ico:"💜",pl:"Neptune",cu:"NPT",d:"30 research · 2,100km/h winds"}].map(p=>(
          <div key={p.pl} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.04)",opacity:spct===100?.8:.3}}>
            <span style={{fontSize:18}}>{p.ico}</span><div><div style={{fontSize:11,fontWeight:700,color:"#E8EEF8"}}>{p.pl} <span style={{fontFamily:"DM Mono,monospace",fontSize:8,color:"rgba(240,208,96,.4)"}}>({p.cu})</span></div><div style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>{p.d}</div></div>
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
          {[["en","🇬🇧"],["ar","🇸🇦"],["ur","🇵🇰"],["zh","🇨🇳"],["fr","🇫🇷"]].map(([k,f])=>(
            <button key={k} onClick={()=>setLang(k)} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(lang===k?G:"#e0e0e0"),background:lang===k?"#E8F5E9":"#fafafa",cursor:"pointer",fontFamily:"DM Sans,sans-serif",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontSize:18}}>{f}</span><span style={{fontSize:9,fontWeight:700,color:lang===k?G:"#666"}}>{k.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:9}}>📊 Game Stats — Turn {d.turn}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          <SB l="Net Worth" v={fmt(nw)} c={G}/>
          <SB l="Cash" v={fmt(d.cash)}/>
          <SB l="Stock Value" v={fmt(sv)} c={G}/>
          <SB l="GSF Deposit" v={fmt(d.gsfDep)} c={BL}/>
          <SB l="Active Events" v={d.aevts.length} c={d.aevts.length>0?AU:G}/>
          <SB l="CGT Rate" v={(20*(1-d.taxReduction)).toFixed(1)+"% on profit"} c={G}/>
          <SB l="Academy" v={adone+"/15"} c={G}/>
          <SB l="Donations" v={d.dons} c="#880E4F"/>
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:9}}>🏁 Milestones</div>
        {[{n:"M1 — Turn 100",done:d.turn>=100,ds:"Governor stable · Earth economy baseline"},{n:"M2 — Turn 300",done:d.turn>=300,ds:"DEE active · Solar criteria open"},{n:"M3 — Turn 500",done:d.turn>=500,ds:"Full DEE running · Solar possible"},{n:"M4 — Turn 1000",done:d.turn>=1000,ds:"Launch Gate — full validation"}].map(m=>(
          <div key={m.n} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div style={{width:26,height:26,borderRadius:7,background:m.done?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,border:m.done?"1px solid #A5D6A7":"1px solid #e0e0e0"}}>{m.done?"✅":"🔒"}</div>
            <div><div style={{fontSize:12,fontWeight:700,color:m.done?G:DK}}>{m.n}</div><div style={{fontSize:9,color:"#bbb"}}>{m.ds}</div></div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:3}}>🔴 Beta Tools — Error Log</div>
        <div style={{fontSize:10,color:"#bbb",marginBottom:9}}>PIN: 9000 · Review Governor validation · DEE event log · Trade audit</div>
        {!beta
          ?<button onClick={()=>{const p=window.prompt("Beta PIN:");if(p==="9000"){setBeta(true);toast_("Beta unlocked");}else if(p)toast_("Wrong PIN",false);}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>🔐 Enter Beta PIN</button>
          :<div>
            <div style={{fontSize:10,fontWeight:700,color:R,marginBottom:6}}>{d.elog.length} entries</div>
            <div style={{maxHeight:170,overflowY:"auto",display:"flex",flexDirection:"column",gap:3,marginBottom:8}}>
              {d.elog.map((e,i)=><div key={i} style={{padding:"4px 7px",borderRadius:3,fontSize:9,fontFamily:"DM Mono,monospace",background:e.lv==="CRIT"?"#FFEBEE":e.lv==="HIGH"?"#FFF8E1":e.lv==="MEDIUM"?"#E3F2FD":"#E8F5E9",color:e.lv==="CRIT"?R:e.lv==="HIGH"?AU:e.lv==="MEDIUM"?BL:G,borderLeft:"2px solid "+(e.lv==="CRIT"?R:e.lv==="HIGH"?AU:e.lv==="MEDIUM"?BL:G)}}>[T-{e.t}][{e.lv}] {e.sc}: {e.msg}</div>)}
            </div>
            <button onClick={()=>{
              const txt=d.elog.map(e=>"[T-"+e.t+"]["+e.lv+"] "+e.sc+": "+e.msg).join("\n");
              const blob=new Blob(["GALACTIC RAIDER ERROR LOG\nTurn: "+d.turn+"\nNet Worth: "+fmt(nw)+"\n\n"+txt],{type:"text/plain"});
              const url=URL.createObjectURL(blob);
              const a=document.createElement("a");a.href=url;a.download="GR_Log_T"+d.turn+".txt";
              document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
              toast_("Log downloaded");
            }} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>⬇ Download Error Log (.txt)</button>
          </div>}
      </div>
    </div>
  );

  const News_=(
    <div style={{padding:12,display:"flex",flexDirection:"column",gap:8}}>
      {d.news.slice(0,40).map(n=>(
        <div key={n.id} style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8",display:"flex",gap:8}}>
          <div style={{width:3,borderRadius:2,flexShrink:0,background:n.g?G:R,alignSelf:"stretch"}}/>
          <div style={{flex:1}}><div style={{fontSize:8,color:"#ccc",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Turn {n.t} · {n.ico}</div><div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:2}}>{n.ti}</div><div style={{fontSize:11,color:"#666",lineHeight:1.5}}>{n.bo}</div></div>
        </div>
      ))}
    </div>
  );

  const screens={dash:Dash,mkt:Mkt,co:Co,comm:Comm,fx:Fx,bonds:Bonds_,port:Port,ac:Acad,ph:Ph,gsf:Gsf,sol:Sol,set:Set_,news:News_};

  // Trade modal content
  const TradeContent=(()=>{
    if(!trModal)return null;
    const{type,item,mode}=trModal;
    const isBuy=mode==="buy";

    if(type==="stock"){
      const maxAmt=isBuy?d.cash:(d.sh[item.t]||0)*item.price;
      const ns=trAmt?Math.floor(trAmt/item.price):0;
      const cost=ns*item.price;
      const avgC=d.avgCost[item.t]||item.price;
      const profitPerShare=Math.max(0,item.price-avgC);
      const tax=!isBuy?Math.round(ns*profitPerShare*(0.20*(1-d.taxReduction))*100)/100:0;
      const net=cost-tax;
      return(
        <div style={{background:"#fff",borderRadius:"19px 19px 0 0",padding:19,width:"100%",maxHeight:"88vh",overflowY:"auto"}}>
          <div style={{width:34,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 14px"}}/>
          <div style={{background:isBuy?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:12,padding:13,color:"#fff",marginBottom:13}}>
            <div style={{fontSize:9,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{isBuy?"BUY":"SELL"} · {item.t}</div>
            <div style={{fontSize:17,fontWeight:800}}>{item.n}</div>
            <div style={{fontSize:11,opacity:.8,marginTop:3}}>{fmt(item.price)}/share · P/E {item.pe.toFixed(1)}x · {isBuy?fmt(d.cash)+" avail.":(d.sh[item.t]||0).toLocaleString()+" held"}</div>
          </div>
          <div style={{display:"flex",background:"#f0f4f0",borderRadius:9,padding:3,gap:2,marginBottom:12}}>
            {["buy","sell"].map(m=>(<button key={m} onClick={()=>{setTrModal({...trModal,mode:m});setTrAmt(null);}} style={{flex:1,padding:"8px 0",borderRadius:7,border:"none",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif",background:mode===m?"#fff":"transparent",color:mode===m?G:"#999",boxShadow:mode===m?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{m==="buy"?"Buy":"Sell"}</button>))}
          </div>
          <div style={{fontSize:10,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>Amount — No Keyboard</div>
          <APick max={maxAmt} sel={trAmt} onSel={setTrAmt} isSell={!isBuy} qty={d.sh[item.t]||0} unitPrice={item.price}/>
          {trAmt&&ns>0&&(
            <div style={{background:"#f8fbf8",borderRadius:9,padding:11,marginBottom:11}}>
              <Row k={isBuy?"Shares to buy":"Shares to sell"} v={ns.toLocaleString()}/>
              <Row k={isBuy?"Total Cost":"Gross Proceeds"} v={fmt(cost)}/>
              {!isBuy&&<Row k={"Profit per share ("+fmt(item.price)+" − "+fmt(avgC)+" avg)"} v={fmt(profitPerShare)} vc={G}/>}
              {!isBuy&&<Row k={"CGT "+(20*(1-d.taxReduction)).toFixed(1)+"% on profit only"} v={"-"+fmt(tax)} vc={R}/>}
              <Row k={isBuy?"Net Cost":"Net Proceeds after tax"} v={fmt(isBuy?cost:cost-tax)} vc={isBuy?R:G} b/>
            </div>
          )}
          {trAmt&&ns<1&&<div style={{background:"#FFF8E1",borderRadius:8,padding:9,marginBottom:10,fontSize:11,color:"#E65100"}}>⚠️ Amount too low — each share costs {fmt(item.price)}.</div>}
          <button onClick={doTrade} disabled={!trAmt||ns<1} style={{width:"100%",background:trAmt&&ns>=1?(isBuy?G:R):"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:13,fontWeight:800,fontSize:14,cursor:trAmt&&ns>=1?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>
            {trAmt&&ns>=1?"Confirm "+(isBuy?"Buy":"Sell")+" "+ns.toLocaleString()+" shares":"Select an amount above"}
          </button>
        </div>
      );
    }

    if(type==="comm"){
      const isBuy=mode==="buy";
      const held=d.ch?.[item.id]||0;
      const maxQty=isBuy?Math.floor(d.cash/item.p):held;
      const qty=trAmt||0;
      const cost=Math.round(qty*item.p*100)/100;
      return(
        <div style={{background:"#fff",borderRadius:"19px 19px 0 0",padding:19,width:"100%"}}>
          <div style={{width:34,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 14px"}}/>
          <div style={{fontSize:16,fontWeight:800,color:DK,marginBottom:3}}>{isBuy?"Buy":"Sell"} {item.n}</div>
          <div style={{fontSize:11,color:"#888",marginBottom:11}}>{fmt(item.p)}/{item.unit} · {isBuy?fmt(d.cash)+" available":held+" "+item.unit+"(s) held"}</div>
          <div style={{fontSize:10,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>Quantity ({item.unit}s)</div>
          <APick max={maxQty} sel={trAmt} onSel={setTrAmt} isSell={!isBuy}/>
          {qty>0&&<div style={{background:"#f8fbf8",borderRadius:9,padding:11,marginBottom:11}}><Row k="Quantity" v={qty+" "+item.unit+"(s)"}/><Row k={isBuy?"Total Cost":"Gross Proceeds"} v={fmt(cost)} b/></div>}
          <button onClick={doTrade} disabled={!trAmt||qty<1} style={{width:"100%",background:trAmt&&qty>=1?(isBuy?G:R):"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:13,fontWeight:800,fontSize:14,cursor:trAmt&&qty>=1?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>
            {trAmt&&qty>=1?"Confirm "+(isBuy?"Buy":"Sell")+" "+qty+" "+item.unit+"(s) = "+fmt(cost):"Select quantity above"}
          </button>
        </div>
      );
    }
    return null;
  })();

  return(
    <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"DM Sans,sans-serif",direction:rtl?"rtl":"ltr"}}>
      {/* Header */}
      <div style={{background:"#fff",padding:"8px 13px",borderBottom:"1px solid #e8ebe8",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#1B5E20,#4CAF50)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🌐</div>
          <div><div style={{fontSize:13,fontWeight:800,color:DK,lineHeight:1}}>Galactic Raider</div><div style={{fontSize:7,color:"#bbb",letterSpacing:.5}}>Capital Exchange · Phase 1</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {auto&&<div style={{width:6,height:6,borderRadius:"50%",background:G,boxShadow:"0 0 5px #4CAF50"}}/>}
          <button onClick={()=>setTab("sol")} style={{background:"rgba(212,175,55,.1)",border:"1px solid rgba(212,175,55,.25)",borderRadius:20,padding:"2px 8px",fontSize:9,fontWeight:700,color:"#B8952A",cursor:"pointer"}}>☀️ {spct}%</button>
          <button onClick={()=>setLang(l=>{const ks=["en","ar","ur","zh","fr"];return ks[(ks.indexOf(l)+1)%ks.length];})} style={{fontSize:17,background:"none",border:"none",cursor:"pointer",padding:2}}>{["🇬🇧","🇸🇦","🇵🇰","🇨🇳","🇫🇷"][["en","ar","ur","zh","fr"].indexOf(lang)]}</button>
        </div>
      </div>

      {/* Ticker */}
      <div style={{background:"#1B5E20",padding:"3px 0",overflow:"hidden",flexShrink:0}}>
        <div style={{display:"flex",gap:18,whiteSpace:"nowrap",animation:"scroll 28s linear infinite",width:"max-content"}}>
          {[...d.cos,...d.cos].map((c,i)=>(
            <span key={i} style={{fontSize:8,fontFamily:"DM Mono,monospace",color:"rgba(255,255,255,.4)",display:"inline-flex",gap:4}}>
              <span style={{color:"rgba(255,255,255,.65)",fontWeight:700}}>{c.t}</span>
              <span style={{color:c.ch>=0?"#69F0AE":"#FF5252"}}>{fmt(c.price)} {c.ch>=0?"▲":"▼"}{Math.abs((c.ch||0)*100).toFixed(2)}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:70}}>
        {screens[tab]||Dash}
      </div>

      {/* Nav — smaller */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #e8ebe8",display:"flex",padding:"4px 2px 10px",zIndex:50}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{...ts(t.id),minWidth:0}}>
            <div style={{fontSize:15,lineHeight:1,marginBottom:1}}>{t.ico}</div>
            <div style={{fontSize:7,letterSpacing:-.2}}>{t.l}</div>
          </button>
        ))}
      </div>

      {/* Event notification */}
      {evN&&(
        <div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 16px)",maxWidth:414,background:evN.good?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:11,padding:"10px 13px",display:"flex",alignItems:"center",gap:9,zIndex:200,boxShadow:"0 6px 24px rgba(0,0,0,.3)"}}>
          <span style={{fontSize:20}}>{evN.ico}</span>
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{evN.n}{evN.cn?" — "+evN.cn:""}</div><div style={{fontSize:9,color:"rgba(255,255,255,.6)",marginTop:1}}>{evN.desc}</div></div>
          <button onClick={()=>setEvN(null)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:20,height:20,color:"#fff",cursor:"pointer",fontSize:12}}>×</button>
        </div>
      )}

      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 16px)",maxWidth:414,background:toast.g?G:R,borderRadius:9,padding:"9px 13px",color:"#fff",fontSize:11,fontWeight:700,zIndex:250,textAlign:"center",boxShadow:"0 4px 14px rgba(0,0,0,.2)"}}>{toast.msg}</div>}

      {/* Modals */}
      {trModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget){setTrModal(null);setTrAmt(null);}}}>{TradeContent}</div>}

      {donModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setDonModal(null)}>
          <div style={{background:"#fff",borderRadius:"19px 19px 0 0",padding:19,width:"100%"}}>
            <div style={{width:34,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 14px"}}/>
            <div style={{fontSize:16,fontWeight:800,color:DK,marginBottom:3}}>❤️ Donate to {donModal}</div>
            <div style={{fontSize:11,color:"#888",marginBottom:4}}>Cash: {fmt(d.cash)} · Donations so far: {d.dons} · Tax reduction so far: {(d.taxReduction*100).toFixed(0)}%</div>
            <div style={{background:"#E8F5E9",borderRadius:8,padding:8,marginBottom:11,fontSize:11,color:G,lineHeight:1.5}}>Each donation reduces CGT by 5% (on profit only). Max 25% total reduction. Also counts toward Solar unlock.</div>
            <APick max={d.cash} sel={donAmt} onSel={setDonAmt}/>
            {donAmt&&<div style={{background:"#f8fbf8",borderRadius:8,padding:10,marginBottom:10}}><Row k="Donation" v={fmt(donAmt)} vc="#880E4F" b/><Row k="New CGT rate after donation" v={(20*(1-(d.taxReduction+0.05))).toFixed(1)+"% on profit"} vc={G}/></div>}
            <button onClick={doDonate} disabled={!donAmt||donAmt>d.cash} style={{width:"100%",background:donAmt&&donAmt<=d.cash?"#880E4F":"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:13,fontWeight:800,fontSize:14,cursor:donAmt?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>❤️ Confirm{donAmt?" — "+fmt(donAmt):""}</button>
          </div>
        </div>
      )}

      {gsfModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setGsfModal(false)}>
          <div style={{background:"#fff",borderRadius:"19px 19px 0 0",padding:19,width:"100%"}}>
            <div style={{width:34,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 14px"}}/>
            <div style={{fontSize:16,fontWeight:800,color:DK,marginBottom:3}}>🏛️ Deposit to GSF</div>
            <div style={{fontSize:11,color:"#888",marginBottom:11}}>Rate: {d.gsf.toFixed(2)}% annual · Per turn: {fmt(d.gsfDep*(d.gsf/100/12))}/turn current · Cash: {fmt(d.cash)}</div>
            <APick max={d.cash} sel={gsfAmt} onSel={setGsfAmt}/>
            {gsfAmt&&<div style={{background:"#E3F2FD",borderRadius:8,padding:10,marginBottom:10}}><Row k="Deposit" v={fmt(gsfAmt)} vc={BL} b/><Row k="New per-turn return" v={fmt((d.gsfDep+gsfAmt)*(d.gsf/100/12))} vc={G}/><Row k="Annual return (est.)" v={fmt((d.gsfDep+gsfAmt)*(d.gsf/100))} vc={G}/></div>}
            <button onClick={doGsf} disabled={!gsfAmt||gsfAmt>d.cash} style={{width:"100%",background:gsfAmt&&gsfAmt<=d.cash?BL:"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:13,fontWeight:800,fontSize:14,cursor:gsfAmt?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>🏛️ Confirm{gsfAmt?" — "+fmt(gsfAmt):""}</button>
          </div>
        </div>
      )}

      {quizM&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:13}}>
          <div style={{background:"#fff",borderRadius:17,padding:19,width:"100%",maxWidth:430,maxHeight:"87vh",overflowY:"auto"}}>
            <div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🎓 Module {quizM.id}/15</div>
            <div style={{fontSize:16,fontWeight:800,color:DK,marginBottom:13}}>{quizM.n}</div>
            <div style={{background:"#f8fbf8",borderRadius:9,padding:11,fontSize:12,color:"#444",lineHeight:1.6,marginBottom:13}}><strong>Scenario:</strong> {quizM.q}</div>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:13}}>
              {quizM.opts.map((o,i)=><button key={i} onClick={()=>setQuizA(i)} style={{padding:"11px 13px",borderRadius:9,border:"2px solid "+(quizA===i?G:"#e0e0e0"),textAlign:"left",background:quizA===i?"#E8F5E9":"#fafafa",color:quizA===i?G:"#333",fontWeight:quizA===i?700:400,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}><span style={{fontWeight:700,marginRight:7,color:quizA===i?G:"#bbb"}}>{["A","B","C","D"][i]}.</span>{o}</button>)}
            </div>
            {quizA!==null&&<div style={{background:quizA===quizM.ans?"#E8F5E9":"#FFEBEE",borderRadius:9,padding:11,marginBottom:11,fontSize:11,lineHeight:1.6,color:quizA===quizM.ans?G:R}}>{quizA===quizM.ans?"✅ Correct! ":"❌ Incorrect. "}{quizM.exp}</div>}
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>{setQuizM(null);setQuizA(null);}} style={{flex:1,padding:"11px 0",borderRadius:9,border:"1.5px solid #e0e0e0",background:"#f5f5f5",color:"#666",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Cancel</button>
              <button onClick={()=>doModule(quizM)} style={{flex:2,padding:"11px 0",borderRadius:9,border:"none",background:G,color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>✓ Complete Module</button>
            </div>
          </div>
        </div>
      )}

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
