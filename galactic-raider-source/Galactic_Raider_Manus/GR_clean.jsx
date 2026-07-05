import { useState, useEffect, useCallback, useRef } from "react";

const SC=1000000;
const G="#2E7D32",R="#C62828",AU="#F9A825",BL="#1565C0",DK="#0D1B2A";
const fmt=n=>{const a=Math.abs(n);if(a>=1e9)return(n<0?"-":"")+"$"+(a/1e9).toFixed(2)+"B";if(a>=1e6)return(n<0?"-":"")+"$"+(a/1e6).toFixed(2)+"M";if(a>=1e3)return(n<0?"-":"")+"$"+(a/1e3).toFixed(1)+"K";return(n<0?"-":"")+"$"+a.toFixed(2);};
const pp=n=>(n>=0?"+":"")+((n||0)*100).toFixed(2)+"%";

const COS=[
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",r:"Asia Pacific",p:348.94,pe:18.4,div:0.8,mg:0.224,beta:1.8,emp:125000,yr:2008,hq:"Singapore",desc:"AI, cloud and semiconductors across Asia Pacific."},
  {t:"MRDB",n:"Meridian Bank",s:"Banking",r:"US",p:85.20,pe:12.1,div:2.1,mg:0.22,beta:0.9,emp:45000,yr:1985,hq:"New York",desc:"Mid-size US commercial bank with retail and corporate lending."},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",r:"Africa",p:15.80,pe:8.5,div:0.5,mg:0.12,beta:1.6,emp:28000,yr:2005,hq:"Johannesburg",desc:"Diversified African mining — iron ore, rare earth, lithium."},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",r:"Emerging Markets",p:351.54,pe:11.3,div:1.8,mg:0.18,beta:1.2,emp:62000,yr:1995,hq:"Dubai",desc:"Major petroleum producer across Middle East and Central Asia."},
  {t:"AGRO",n:"AgroLatin Corp",s:"Agriculture",r:"Latin America",p:42.18,pe:13.2,div:2.5,mg:0.09,beta:1.1,emp:18000,yr:1975,hq:"São Paulo",desc:"Largest agricultural conglomerate in Latin America."},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",r:"US",p:198.40,pe:22.1,div:1.2,mg:0.26,beta:0.8,emp:38000,yr:2005,hq:"Boston",desc:"Medical devices, diagnostics and hospital services."},
  {t:"CLFL",n:"ClearFlame Energy",s:"Energy",r:"Europe",p:112.30,pe:14.8,div:2.0,mg:0.20,beta:1.1,emp:22000,yr:2010,hq:"Amsterdam",desc:"Renewable and conventional energy across Europe."},
  {t:"AXMB",n:"Axum Biotech",s:"Healthcare",r:"Africa",p:68.50,pe:19.4,div:0.6,mg:0.21,beta:1.4,emp:8500,yr:2012,hq:"Addis Ababa",desc:"Biotech focused on tropical disease and genetic research."},
  {t:"PCMN",n:"Pacific Manufacturing",s:"Manufacturing",r:"Asia Pacific",p:76.20,pe:15.6,div:1.3,mg:0.14,beta:1.0,emp:55000,yr:1988,hq:"Seoul",desc:"Electronics and automotive parts manufacturing."},
  {t:"NRDX",n:"Nordic Exchange Bank",s:"Banking",r:"Europe",p:132.10,pe:11.8,div:2.4,mg:0.21,beta:0.8,emp:32000,yr:1975,hq:"Stockholm",desc:"Pan-European financial services and institutional banking."},
  {t:"UTLS",n:"Utility Systems Corp",s:"Utilities",r:"US",p:58.40,pe:14.2,div:4.2,mg:0.22,beta:0.5,emp:12000,yr:1950,hq:"Chicago",desc:"US electric and gas utility serving 3 million customers."},
  {t:"RLST",n:"RealEstate Trust",s:"Real Estate",r:"US",p:44.20,pe:12.8,div:3.8,mg:0.32,beta:0.7,emp:2800,yr:1995,hq:"Dallas",desc:"REIT focusing on commercial properties across Sun Belt."},
  {t:"TLCM",n:"TeleCom Europe",s:"Telecom",r:"Europe",p:88.60,pe:13.5,div:4.5,mg:0.28,beta:0.6,emp:48000,yr:1985,hq:"Frankfurt",desc:"Pan-European telecoms — mobile, broadband, enterprise."},
  {t:"RETL",n:"RetailHub Inc",s:"Retail",r:"US",p:38.90,pe:14.0,div:1.5,mg:0.08,beta:1.2,emp:85000,yr:2000,hq:"Seattle",desc:"Omnichannel retail chain with 1,200 stores across North America."},
  {t:"EMTS",n:"Emerging Tech Solutions",s:"Technology",r:"Emerging Markets",p:28.40,pe:22.0,div:0.2,mg:0.15,beta:2.0,emp:6500,yr:2015,hq:"Mumbai",desc:"B2B SaaS and cloud infrastructure for South Asia."},
];

const BD=[
  {id:"US10Y",iss:"US Treasury 10Y",rat:"AAA",cou:4.5,mat:2034,oy:4.5,fv:1000},
  {id:"EU10Y",iss:"EU Government 10Y",rat:"AA",cou:3.8,mat:2034,oy:3.8,fv:1000},
  {id:"SLKT-B1",iss:"Silk Road Tech Bond",rat:"AA",cou:5.2,mat:2031,oy:5.2,fv:1000},
  {id:"MRDB-B1",iss:"Meridian Bank Bond",rat:"AAA",cou:4.0,mat:2030,oy:4.0,fv:1000},
  {id:"AFR5Y",iss:"African Govt Bond",rat:"BB",cou:12.5,mat:2029,oy:12.5,fv:1000},
  {id:"EM10Y",iss:"Emerging Market Bond",rat:"B",cou:14.8,mat:2032,oy:14.8,fv:1000},
];

const MODS=[
  {id:1,n:"Markets & P/E Ratios",q:"SLKT EPS $18.95, Tech ceiling 35x. Max allowed price?",opts:["$348","$662","$500","$418"],ans:1,exp:"Max = $18.95 × 35 = $662.25. SLKT at 18.4x P/E is within bounds."},
  {id:2,n:"Bonds & Interest Rates",q:"Bond: Face $1,000, Orig 4%, Current 3%. Price?",opts:["$1,000","$1,200","$1,333","$750"],ans:2,exp:"$1,000 × (4÷3) = $1,333. Yields fall → prices rise."},
  {id:3,n:"Diversification",q:"80% SLKT, Tech Regulation fires. Best action?",opts:["Hold","Sell all","Reduce to 30%, diversify","Buy more"],ans:2,exp:"Concentration in one sector creates massive event risk. Diversify to 30%."},
  {id:4,n:"Tax Strategy",q:"$500K capital gains. Best legal reduction strategy?",opts:["Pay full 20%","Offset $200K losses","Donate $100K","Hold longer"],ans:1,exp:"Loss harvesting offsets gains directly, saving $40K in tax."},
  {id:5,n:"Commodities",q:"Oil spikes 40% on Middle East conflict. Best positioned?",opts:["MDCR","TNPT + CLFL","UTLS","RETL"],ans:1,exp:"Energy producers benefit directly from oil price spikes."},
  {id:6,n:"Forex & Currency Risk",q:"USD strengthens 15% vs SGD. SLKT revenue impact?",opts:["Up 15%","Down 15% in USD","No impact","Up 7.5%"],ans:1,exp:"Stronger USD means SGD revenue converts to fewer dollars."},
  {id:7,n:"Startups & Venture Capital",q:"$500K for 10% equity. IPO at $20M valuation. Profit?",opts:["$500K","$1.5M","$2M","$200K"],ans:1,exp:"10% of $20M = $2M. Less $500K cost = $1.5M profit."},
  {id:8,n:"Reading Company Financials",q:"Revenue $45B, COGS $18B, OpEx $12B, Int $2B, Tax 21%. Net income?",opts:["$15B","$10.3B","$9.75B","$12B"],ans:2,exp:"Gross $27B → Op $15B → Int $13B → After 21% tax ≈ $9.75B."},
  {id:9,n:"Economic Cycles",q:"GDP contracts 2 quarters, rates rise. Best defensive sector?",opts:["Technology","Healthcare + Utilities","Mining","Retail"],ans:1,exp:"Healthcare and Utilities are recession-resistant — non-cyclical demand."},
  {id:10,n:"Global Sovereign Fund",q:"GSF 12.48% annual, $5M deposited. Monthly return?",opts:["$52,000","$5,200","$62,400","$520"],ans:0,exp:"$5M × (12.48% ÷ 12) = $52,000 per turn."},
  {id:11,n:"Legacy Building",q:"Net worth hits $10B. Wealth tax rate and annual cost?",opts:["0.1%/yr — $10M","1%/yr — $100M","0.1%/turn — $10M/turn","0.5%/yr"],ans:2,exp:"0.1% per TURN above $10B. At $10B that is $10M every turn."},
  {id:12,n:"Holdings Company & M&A",q:"You acquire 51% of FRMN. Governance rights?",opts:["Voting only","Board control + CEO + strategy","Dividend priority","None"],ans:1,exp:"51%+ = controlling stake. Board, CEO appointment, full strategic control."},
  {id:13,n:"Space Economics Preview",q:"Investing in Mars mining. Repatriation tax rate?",opts:["0%","2% in · 5% out","5% both","10% both"],ans:1,exp:"Earth→Space 2%, Space→Earth 5%. Higher return tax reflects planetary risk."},
  {id:14,n:"Advanced Portfolio Theory",q:"Portfolio A: Sharpe 1.8, beta 0.7 vs B: return 28%, beta 1.9. Superior?",opts:["B — higher return","A — risk-adjusted","Equal","Cycle dependent"],ans:1,exp:"Sharpe 1.8 means superior risk-adjusted return. B's 28% carries 3x the market risk."},
  {id:15,n:"Capstone",q:"Net worth $4.8B, need $5B for Solar. Fastest path?",opts:["Buy SLKT","Deploy GSF deposit","Credit line leverage","Philanthropy tax savings"],ans:1,exp:"GSF at 12.48% compounds automatically each turn. Cleanest path to $5B."},
];

const SMODS=[
  {id:16,n:"Mars",ico:"🔴",desc:"Mining · MCR currency · 3.71m/s² gravity"},
  {id:17,n:"Venus",ico:"🟡",desc:"Manufacturing · VNU · 465°C surface"},
  {id:18,n:"Jupiter",ico:"🟠",desc:"Research · JVT · Fusion energy"},
  {id:19,n:"Saturn",ico:"🪐",desc:"Ring mining · STC · Ryzolith ore"},
  {id:20,n:"Mercury",ico:"☿",desc:"Solar energy · MRC · 430°C/-180°C"},
  {id:21,n:"Uranus",ico:"🔵",desc:"Ice mining · URU · -224°C"},
  {id:22,n:"Neptune",ico:"💜",desc:"Research · NPT · 2,100km/h winds"},
];

const EVTS=[
  {id:"rc",n:"Rate Cut",ico:"🏦",type:"mkt",prob:.04,sent:.07,dur:10,good:true,desc:"Emergency rate cut — bonds and growth stocks rally."},
  {id:"rh",n:"Rate Hike",ico:"📈",type:"mkt",prob:.04,sent:-.06,dur:8,good:false,desc:"Rate hike — equity valuations compressed."},
  {id:"geo",n:"Geopolitical Crisis",ico:"💣",type:"mkt",prob:.03,sent:-.13,dur:20,sec:["Energy","Mining"],good:false,desc:"Regional conflict — capital flees to safe havens."},
  {id:"com",n:"Commodity Shock",ico:"⛽",type:"mkt",prob:.06,sent:-.07,dur:12,sec:["Energy","Agriculture"],good:false,desc:"Supply disruption — oil and food prices spike."},
  {id:"treg",n:"Tech Regulation",ico:"📜",type:"mkt",prob:.03,sent:-.11,dur:18,sec:["Technology"],good:false,desc:"Global tech rules — sector falls 10-15%."},
  {id:"spb",n:"Space Breakthrough",ico:"🛸",type:"mkt",prob:.025,sent:.09,dur:15,sec:["Mining"],good:true,desc:"Jupiter discovery — space surges, Earth mining hit."},
  {id:"td",n:"Trade Deal Signed",ico:"🤝",type:"mkt",prob:.04,sent:.08,dur:12,good:true,desc:"New bilateral deal — cross-regional companies benefit."},
  {id:"pan",n:"Pandemic Scare",ico:"🦠",type:"mkt",prob:.02,sent:-.07,dur:25,sec:["Retail","Manufacturing"],good:false,desc:"Health emergency — healthcare surges, consumer falls."},
  {id:"pat",n:"Patent Approved",ico:"⚡",type:"co",prob:.05,imp:.30,dur:5,good:true,desc:"Key patent granted — stock surges 30%."},
  {id:"scn",n:"CEO Scandal",ico:"💼",type:"co",prob:.03,imp:-.23,dur:15,good:false,desc:"Misconduct revealed — 25%+ holders get advance notice."},
  {id:"bea",n:"Earnings Beat",ico:"💰",type:"co",prob:.10,imp:.18,dur:6,good:true,desc:"Results beat consensus — stock reprices upward."},
  {id:"mis",n:"Earnings Miss",ico:"📉",type:"co",prob:.08,imp:-.16,dur:6,good:false,desc:"Results disappoint — analysts downgrading."},
  {id:"con",n:"Govt Contract Won",ico:"🏛️",type:"co",prob:.04,imp:.22,dur:35,good:true,desc:"Major contract — revenue visible for 35 turns."},
  {id:"str",n:"Labour Strike",ico:"✊",type:"co",prob:.03,imp:-.18,dur:12,good:false,desc:"Workers walk out — production halts."},
  {id:"rec",n:"Product Recall",ico:"⚠️",type:"co",prob:.03,imp:-.14,dur:10,good:false,desc:"Product pulled — cost spike, brand damage."},
];

const PEB={Technology:{min:15,max:35},Banking:{min:8,max:15},Mining:{min:6,max:12},Energy:{min:8,max:20},Agriculture:{min:10,max:18},Healthcare:{min:12,max:35},Manufacturing:{min:10,max:25},Utilities:{min:12,max:18},"Real Estate":{min:8,max:16},Telecom:{min:10,max:16},Retail:{min:10,max:18}};
const RMU={AAA:1.02,AA:1.01,A:1.00,BBB:0.99,BB:0.97,B:0.94};

const LD={
  en:{f:"🇬🇧",nm:"EN",nw:"Net Worth",dash:"Dashboard",mkt:"Market",port:"Portfolio",bo:"Bonds",ac:"Academy",ph:"Give",gsf:"Fund",sol:"Solar",news:"News",set:"Settings",adv:"Advance Turn",auto:"Auto-Sim",buy:"Buy",sell:"Sell",con:"Confirm"},
  ar:{f:"🇸🇦",nm:"AR",nw:"صافي الثروة",dash:"لوحة",mkt:"السوق",port:"محفظة",bo:"سندات",ac:"أكاديمية",ph:"خيرية",gsf:"صندوق",sol:"شمسي",news:"أخبار",set:"إعدادات",adv:"تقدم",auto:"تلقائي",buy:"شراء",sell:"بيع",con:"تأكيد"},
  ur:{f:"🇵🇰",nm:"UR",nw:"مالیت",dash:"ڈیش",mkt:"مارکیٹ",port:"پورٹ",bo:"بانڈز",ac:"اکیڈمی",ph:"خیرات",gsf:"فنڈ",sol:"شمسی",news:"خبریں",set:"ترتیب",adv:"آگے",auto:"خودکار",buy:"خریدیں",sell:"بیچیں",con:"تصدیق"},
  zh:{f:"🇨🇳",nm:"ZH",nw:"净值",dash:"仪表板",mkt:"市场",port:"组合",bo:"债券",ac:"学院",ph:"慈善",gsf:"主权",sol:"太阳",news:"新闻",set:"设置",adv:"推进",auto:"自动",buy:"买入",sell:"卖出",con:"确认"},
  fr:{f:"🇫🇷",nm:"FR",nw:"Valeur",dash:"Tableau",mkt:"Marché",port:"Portef.",bo:"Oblig.",ac:"Académie",ph:"Don",gsf:"Fonds",sol:"Solaire",news:"News",set:"Params",adv:"Avancer",auto:"Auto",buy:"Acheter",sell:"Vendre",con:"Confirmer"},
};

// ─── GOVERNOR ───────────────────────────────────────────────────
function gBond(fv,oy,cy,rat){const y=Math.max(0.01,Math.min(cy/100,.45));return Math.round(Math.max(fv*.05,Math.min(fv*(oy/100)/y*(RMU[rat]||1),fv*2))*100)/100;}
function gPE(price,eps,sec){if(!eps||eps<=0)return price;const b=PEB[sec]||{min:10,max:40};const pe=price/eps;if(pe<b.min)return Math.round(eps*b.min*100)/100;if(pe>b.max)return Math.round(eps*b.max*100)/100;return Math.round(price*100)/100;}
function gDaily(np,pp){const m=pp*0.08;return Math.round(Math.min(Math.max(np,pp-m),pp+m)*100)/100;}
function simTurn(cos,gdp,inf,intr,evts){
  return cos.map(c=>{
    const pp2=c.price;
    const macro=Math.max(.88,Math.min(1+(gdp/100*.5)*(1-(inf/100*.3))*(1-(intr/100*.4)),1.12));
    const rnd=1+(Math.random()-.5)*.07;
    let em=0;
    evts.forEach(e=>{
      if(e.type==="mkt"){if(!e.sec||e.sec.includes(c.s))em+=e.sent*(e.tl/e.dur)*.13;}
      if(e.type==="co"&&e.tk===c.t)em+=e.imp*(e.tl/e.dur)*.13;
    });
    const sent=Math.max(.78,Math.min(rnd+em,1.22));
    let np=pp2*sent*macro;
    np=gDaily(np,pp2);
    np=gPE(np,pp2/c.pe,c.s);
    np=Math.max(.01,np);
    return {...c,pp:pp2,price:np,pe:Math.round(np/(pp2/c.pe)*10)/10,ch:(np-pp2)/pp2,hist:[...(c.hist||[pp2]).slice(-40),np]};
  });
}

// ─── UI HELPERS ────────────────────────────────────────────────
const Bdg=({v})=>{const g=v>=0;return <span style={{background:g?"#E8F5E9":"#FFEBEE",color:g?G:R,padding:"2px 7px",borderRadius:20,fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{pp(v)}</span>;};

const MChart=({hist,color})=>{
  if(!hist||hist.length<2)return null;
  const w=76,h=28,mn=Math.min(...hist)*.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;
  const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color||G} strokeWidth="1.8" strokeLinejoin="round"/></svg>;
};

const WChart=({hist})=>{
  if(!hist||hist.length<2)return null;
  const w=300,h=50,mn=Math.min(...hist)*.98,mx=Math.max(...hist)*1.02,rng=mx-mn||1;
  const line=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");
  const area=[...hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`),`${w},${h}`,`0,${h}`].join(" ");
  return <svg width="100%" height={h} viewBox={"0 0 "+w+" "+h}><defs><linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4CAF50" stopOpacity=".3"/><stop offset="100%" stopColor="#4CAF50" stopOpacity="0"/></linearGradient></defs><polygon points={area} fill="url(#wg)"/><polyline points={line} fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinejoin="round"/></svg>;
};

function APick({max,sel,onSel,isSell}){
  const raw=isSell
    ?[{l:"25%",v:Math.max(0,max*.25)},{l:"50%",v:Math.max(0,max*.5)},{l:"75%",v:Math.max(0,max*.75)},{l:"All",v:max}]
    :max>=5e8
      ?[{l:"$10M",v:1e7},{l:"$100M",v:1e8},{l:"$500M",v:5e8},{l:"$1B",v:1e9},{l:"$5B",v:5e9},{l:"$10B",v:1e10},{l:"$50B",v:5e10},{l:"Max",v:max}]
      :max>=1e5
        ?[{l:"$10K",v:1e4},{l:"$50K",v:5e4},{l:"$100K",v:1e5},{l:"$250K",v:25e4},{l:"$500K",v:5e5},{l:"$1M",v:1e6},{l:"$5M",v:5e6},{l:"Max",v:max}]
        :[{l:"$1K",v:1e3},{l:"$5K",v:5e3},{l:"$10K",v:1e4},{l:"$25K",v:25e3},{l:"$50K",v:5e4},{l:"$100K",v:1e5},{l:"$250K",v:25e4},{l:"Max",v:max}];
  const ps=raw.filter(p=>p.v>0&&p.v<=max+1);
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
      {ps.map(p=><button key={p.l} onClick={()=>onSel(p.v)} style={{padding:"11px 4px",borderRadius:9,border:"2px solid "+(sel===p.v?G:"#e0e0e0"),background:sel===p.v?"#E8F5E9":"#fafafa",color:sel===p.v?G:"#444",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>{p.l}</button>)}
    </div>
  );
}

const SB=({l,v,c,sub})=>(
  <div style={{background:"#f7faf7",borderRadius:9,padding:"9px 11px",flex:1,minWidth:0}}>
    <div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.7,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l}</div>
    <div style={{fontSize:14,fontWeight:800,color:c||DK,fontFamily:"DM Mono,monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div>
    {sub&&<div style={{fontSize:9,color:"#bbb",marginTop:1}}>{sub}</div>}
  </div>
);

const Row=({k,v,vc,b})=>(
  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f0f0"}}>
    <span style={{fontSize:13,color:"#666"}}>{k}</span>
    <span style={{fontSize:13,fontWeight:b?800:700,color:vc||DK,fontFamily:"DM Mono,monospace"}}>{v}</span>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────
export default function App(){
  const[lang,setLang]=useState("en");
  const L=LD[lang];
  const rtl=lang==="ar"||lang==="ur";
  const[tab,setTab]=useState("dash");
  const[turn,setTurn]=useState(1);
  const[cash,setCash]=useState(SC);
  const[sh,setSh]=useState({});
  const[bh,setBh]=useState({});
  const[gdp,setGdp]=useState(2.5);
  const[inf,setInf]=useState(3.2);
  const[intr,setIntr]=useState(4.5);
  const[gsf,setGsf]=useState(12.48);
  const[cos,setCos]=useState(COS.map(c=>({...c,pp:c.p,price:c.p,ch:0,hist:[c.p,c.p]})));
  const[bonds,setBonds]=useState(BD.map(b=>({...b,cy:b.oy})));
  const[aevts,setAevts]=useState([]);
  const[news,setNews]=useState([
    {id:1,t:1,ico:"🌐",ti:"Galactic Raider Begins",bo:"$1,000,000 starting capital. 15 companies across 6 Earth regions. Economic Governor active. Build your empire.",g:true},
    {id:2,t:1,ico:"⚖️",ti:"Economic Governor: Turn 1 PASS",bo:"All companies validated. P/E within bounds. Margins compliant. Net income ≤ revenue enforced.",g:true},
  ]);
  const[mods,setMods]=useState(MODS.map(m=>({...m,done:false,score:null})));
  const[dons,setDons]=useState(0);
  const[gsfDep,setGsfDep]=useState(0);
  const[elog,setElog]=useState([
    {lv:"OK",t:1,sc:"Governor",msg:"15 companies initialised — all P/E within sector bounds",ex:"5–50x"},
    {lv:"OK",t:1,sc:"System",msg:"$1,000,000 starting capital loaded",ex:"$1M"},
  ]);
  const[wh,setWh]=useState([SC,SC]);
  const[auto,setAuto]=useState(false);
  const aRef=useRef(null);

  const[selCo,setSelCo]=useState(null);
  const[trM,setTrM]=useState(null);
  const[trAmt,setTrAmt]=useState(null);
  const[donM,setDonM]=useState(null);
  const[donAmt,setDonAmt]=useState(null);
  const[gsfM,setGsfM]=useState(false);
  const[gsfAmt,setGsfAmt]=useState(null);
  const[quizM,setQuizM]=useState(null);
  const[quizA,setQuizA]=useState(null);
  const[evN,setEvN]=useState(null);
  const[toast,setToast]=useState(null);
  const[beta,setBeta]=useState(false);
  const[fsec,setFsec]=useState("All");
  const[freg,setFreg]=useState("All");

  const sv=Object.entries(sh).reduce((s,[t,n])=>{const c=cos.find(x=>x.t===t);return s+(c?c.price*n:0);},0);
  const bv=Object.entries(bh).reduce((s,[id,q])=>{const b=bonds.find(x=>x.id===id);return s+(b?gBond(b.fv,b.oy,b.cy,b.rat)*q:0);},0);
  const nw=cash+sv+bv+gsfDep;
  const pnw=wh[wh.length-1]||SC;
  const nwch=nw-pnw;
  const adone=mods.filter(m=>m.done).length;
  const regs=new Set(Object.keys(sh).map(t=>cos.find(c=>c.t===t)?.r).filter(Boolean));

  const sc={
    nw:{met:nw>=5e9,l:"Net Worth $5B",v:fmt(nw)+" / $5B"},
    turns:{met:turn>=300,l:"Turn 300",v:turn+"/300"},
    regions:{met:regs.size>=3,l:"3 Regions",v:regs.size+"/3"},
    bonds:{met:Object.keys(bh).length>=2,l:"2 Bonds",v:Object.keys(bh).length+"/2"},
    academy:{met:adone>=3,l:"3 Academy",v:adone+"/3"},
    phi:{met:dons>=2,l:"2 Donations",v:dons+"/2"},
  };
  const spct=Math.round(Object.values(sc).filter(x=>x.met).length/6*100);
  const sunl=spct===100;
  const secs=["All",...new Set(COS.map(c=>c.s))];
  const regsArr=["All",...new Set(COS.map(c=>c.r))];
  const fcos=cos.filter(c=>(fsec==="All"||c.s===fsec)&&(freg==="All"||c.r===freg));

  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2600);},[]);
  const log_=useCallback((lv,sc2,msg,ex)=>setElog(p=>[{lv,t:turn,sc:sc2,msg,ex},...p.slice(0,99)]),[turn]);

  const advance=useCallback(()=>{
    const nt=turn+1;
    const nn=[];
    const ng=Math.round(Math.max(-4,Math.min(7.5,gdp+(Math.random()-.48)*.55))*10)/10;
    const ni=Math.round(Math.max(0,Math.min(13,inf+(Math.random()-.5)*.35))*10)/10;
    const nir=Math.round(Math.max(.5,Math.min(14,intr+(Math.random()-.5)*.22))*10)/10;
    const ng2=Math.round(Math.max(.5,Math.min(15,gsf+(Math.random()-.5)*.25))*100)/100;
    setGdp(ng);setInf(ni);setIntr(nir);setGsf(ng2);

    let nae=aevts.map(e=>({...e,tl:e.tl-1})).filter(e=>e.tl>0);
    EVTS.forEach(ed=>{
      if(Math.random()<ed.prob){
        if(ed.type==="co"){
          const el=cos.filter(c=>!nae.find(a=>a.id===ed.id&&a.tk===c.t));
          if(el.length){
            const tg=el[Math.floor(Math.random()*el.length)];
            const ev={...ed,tk:tg.t,cn:tg.n,tl:ed.dur||10,dur:ed.dur||10};
            nae.push(ev);
            nn.push({id:Date.now()+Math.random(),t:nt,ico:ed.ico,ti:ed.n+" — "+tg.n,bo:ed.desc,g:ed.good});
            setEvN({...ev});setTimeout(()=>setEvN(null),5500);
            log_(ed.good?"OK":"HIGH","DEE",ed.n+" on "+tg.t,"Governor bounds maintained");
          }
        }else{
          const ev={...ed,tl:ed.dur||12,dur:ed.dur||12};
          nae.push(ev);
          nn.push({id:Date.now()+Math.random(),t:nt,ico:ed.ico,ti:ed.n,bo:ed.desc,g:ed.good});
          setEvN({...ev});setTimeout(()=>setEvN(null),5500);
          log_(ed.good?"OK":"MEDIUM","DEE","Market: "+ed.n,"±8%/turn enforced");
        }
      }
    });
    setAevts(nae);

    const nc=simTurn(cos,ng,ni,nir,nae);
    setCos(nc);
    setBonds(p=>p.map(b=>({...b,cy:Math.round(Math.max(1,Math.min(45,b.cy+(Math.random()-.5)*.28))*100)/100})));

    if(gsfDep>0){
      const ret=Math.round(gsfDep*(ng2/100/12)*100)/100;
      setCash(c=>Math.round((c+ret)*100)/100);
    }
    if(nt%10===0){
      let div=0;
      Object.entries(sh).forEach(([t,n2])=>{const c=nc.find(x=>x.t===t);if(c&&c.div>0)div+=c.price*(c.div/100)*n2;});
      if(div>0){
        setCash(c=>Math.round((c+div)*100)/100);
        nn.push({id:Date.now()+2,t:nt,ico:"💰",ti:"Dividends Received",bo:""+fmt(div)+" credited after 15% withholding tax.",g:true});
        log_("OK","Gov F5","Dividends: "+fmt(div)+" · Tax once","15% once");
      }
    }
    if(nw>10e9){const tx=Math.round((nw-10e9)*.001*100)/100;setCash(c=>Math.max(0,c-tx));log_("OK","Governor","Wealth tax: "+fmt(tx),"0.1%/turn above $10B");}
    if(nt%10===0){
      const vio=nc.filter(c=>{const b=PEB[c.s]||{min:10,max:40};return c.pe<b.min||c.pe>b.max;});
      if(!vio.length)log_("OK","Governor","T"+nt+": all "+nc.length+" companies within P/E bounds","5–50x");
      else vio.forEach(v=>log_("CRIT","Governor","P/E breach "+v.t+": "+v.pe.toFixed(1)+"x",(PEB[v.s]?.min||10)+"–"+(PEB[v.s]?.max||40)+"x"));
    }
    if([100,300,500,1000].includes(nt)){
      const ms={100:"M1 — Governor stable.",300:"M2 — Solar unlock window.",500:"M3 — DEE + Solar running.",1000:"M4 — LAUNCH GATE."};
      nn.push({id:Date.now()+3,t:nt,ico:"🏁",ti:"Milestone: Turn "+nt,bo:ms[nt]+" Net worth: "+fmt(nw),g:true});
    }
    setTurn(nt);
    setWh(h=>[...h.slice(-60),nw]);
    if(nn.length)setNews(p=>[...nn.reverse(),...p].slice(0,120));
  },[turn,cash,gdp,inf,intr,gsf,cos,bonds,aevts,sh,bh,gsfDep,nw,log_]);

  useEffect(()=>{
    if(auto){aRef.current=setInterval(advance,1700);}
    else clearInterval(aRef.current);
    return()=>clearInterval(aRef.current);
  },[auto,advance]);

  const doTrade=()=>{
    if(!trM||!trAmt)return;
    const c=trM.c,isBuy=trM.m==="buy";
    if(isBuy){
      const n=Math.floor(trAmt/c.price);
      if(n<1||trAmt>cash){toast_("Insufficient cash",false);return;}
      setCash(p=>Math.round((p-n*c.price)*100)/100);
      setSh(p=>({...p,[c.t]:(p[c.t]||0)+n}));
      log_("OK","Trade","BUY "+n+" "+c.t+" @ "+fmt(c.price),"Cash check passed");
      toast_("Bought "+n+" "+c.t);
    }else{
      const held=sh[c.t]||0;
      const ns=Math.min(trAmt?Math.floor(trAmt/c.price):held,held);
      if(ns<1){toast_("No shares to sell",false);return;}
      const proc=Math.round(ns*c.price*100)/100;
      setCash(p=>Math.round((p+proc)*100)/100);
      setSh(p=>{const q={...p,[c.t]:(p[c.t]||0)-ns};if(q[c.t]<=0)delete q[c.t];return q;});
      log_("OK","Trade","SELL "+ns+" "+c.t+" @ "+fmt(c.price),"Proceeds: "+fmt(proc));
      toast_("Sold "+ns+" "+c.t+" for "+fmt(proc));
    }
    setTrM(null);setTrAmt(null);
  };

  const doBond=(b,q)=>{
    const pr=gBond(b.fv,b.oy,b.cy,b.rat);
    if(pr*q>cash){toast_("Insufficient cash",false);return;}
    setCash(p=>Math.round((p-pr*q)*100)/100);
    setBh(p=>({...p,[b.id]:(p[b.id]||0)+q}));
    log_("OK","Bonds","BUY "+q+"x "+b.id+" @ "+fmt(pr),"Price within 5–200%");
    toast_("Bought "+q+"x "+b.iss);
  };

  const sellBond=(b)=>{
    const q=bh[b.id]||0;if(q<1){toast_("None held",false);return;}
    const pr=gBond(b.fv,b.oy,b.cy,b.rat);
    const tot=Math.round(pr*q*100)/100;
    setCash(p=>Math.round((p+tot)*100)/100);
    setBh(p=>{const n2={...p};delete n2[b.id];return n2;});
    log_("OK","Bonds","SELL "+q+"x "+b.id+" = "+fmt(tot),"Proceeds credited");
    toast_("Sold "+q+"x "+b.iss+" for "+fmt(tot));
  };

  const doDonate=()=>{
    if(!donAmt||donAmt>cash){toast_("Insufficient cash",false);return;}
    setCash(p=>Math.round((p-donAmt)*100)/100);
    setDons(d=>d+1);
    setNews(p=>[{id:Date.now(),t:turn,ico:"❤️",ti:"Donation to "+donM,bo:fmt(donAmt)+" donated. Solar criteria: "+(dons+1)+"/2 met. Tax reduction applied.",g:true},...p]);
    log_("OK","Philanthropy","Donation "+fmt(donAmt)+" to "+donM+" · #"+(dons+1),"Solar criteria updated");
    toast_("Donation confirmed ❤️");
    setDonM(null);setDonAmt(null);
  };

  const doGsf=()=>{
    if(!gsfAmt||gsfAmt>cash){toast_("Insufficient cash",false);return;}
    setCash(p=>Math.round((p-gsfAmt)*100)/100);
    setGsfDep(p=>p+gsfAmt);
    setNews(p=>[{id:Date.now(),t:turn,ico:"🏛️",ti:"GSF Deposit",bo:fmt(gsfAmt)+" deposited at "+gsf.toFixed(2)+"% annual. Monthly: "+fmt(gsfAmt*(gsf/100/12)),g:true},...p]);
    log_("OK","GSF","Deposit: "+fmt(gsfAmt)+" @ "+gsf.toFixed(2)+"%","Monthly: "+fmt(gsfAmt*(gsf/100/12)));
    toast_("Deposited "+fmt(gsfAmt)+" to GSF");
    setGsfM(false);setGsfAmt(null);
  };

  const doModule=(m)=>{
    const score=72+Math.floor(Math.random()*27);
    setMods(p=>p.map(x=>x.id===m.id?{...x,done:true,score}:x));
    setNews(prev=>[{id:Date.now(),t:turn,ico:"🎓",ti:"Academy: "+m.n,bo:"Score: "+score+"%. "+(adone+1)+"/15 Earth modules done."+(adone+1>=15?" 🏆 CERTIFICATE EARNED!":""),g:true},...prev]);
    log_("OK","Academy",'"'+m.n+'" completed — '+score+"%",">70% pass");
    toast_(m.n+" — Score: "+score+"%");
    setQuizM(null);setQuizA(null);
  };

  const TABS=[
    {id:"dash",ico:"🏠",l:L.dash},{id:"mkt",ico:"📊",l:L.mkt},{id:"port",ico:"💼",l:L.port},
    {id:"bonds",ico:"📋",l:L.bo},{id:"ac",ico:"🎓",l:L.ac},{id:"ph",ico:"❤️",l:L.ph},
    {id:"gsf",ico:"🏛️",l:L.gsf},{id:"sol",ico:"☀️",l:L.sol},{id:"news",ico:"📰",l:L.news},{id:"set",ico:"⚙️",l:L.set},
  ];
  const ts=id=>({padding:"5px 0",flex:1,border:"none",background:tab===id?"#fff":"transparent",borderRadius:tab===id?7:0,color:tab===id?G:"#999",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"DM Sans,sans-serif",textAlign:"center",boxShadow:tab===id?"0 1px 3px rgba(0,0,0,.1)":"none",transition:"all .15s",minWidth:36});

  // ── DASH ────────────────────────────────────────────────────────
  const Dash=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32,#388E3C)",borderRadius:16,padding:18,color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:130,height:130,background:"rgba(255,255,255,.05)",borderRadius:"50%"}}/>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1.2,marginBottom:2}}>{L.nw}</div>
        <div style={{fontSize:36,fontWeight:800,fontFamily:"DM Mono,monospace",lineHeight:1,marginBottom:4}}>{fmt(nw)}</div>
        <div style={{fontSize:12,opacity:.9,marginBottom:10}}>{nwch>=0?"📈":"📉"} {fmt(Math.abs(nwch))} ({nwch>=0?"+":""}{pnw>0?((nwch/pnw)*100).toFixed(2):0}%) vs last turn</div>
        <div style={{height:42,width:"100%"}}><WChart hist={wh}/></div>
        <div style={{display:"flex",gap:10,marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.15)"}}>
          {[["Cash",fmt(cash)],["Stocks",fmt(sv)],["Bonds",fmt(bv)],["GSF",fmt(gsfDep)]].map(([k,v])=>(
            <div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:8,opacity:.45,textTransform:"uppercase",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{v}</div></div>
          ))}
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><span style={{fontSize:14,fontWeight:800,color:DK}}>Turn {turn}</span>{auto&&<span style={{fontSize:10,color:G,marginLeft:8,fontWeight:700}}>● Running</span>}</div>
          <span style={{fontSize:10,color:"#aaa"}}>M1@100 · M2@300 · M4@1000</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={advance} disabled={auto} style={{flex:3,background:auto?"#e0e0e0":G,color:auto?"#aaa":"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:14,cursor:auto?"not-allowed":"pointer",fontFamily:"DM Sans,sans-serif"}}>▶ {L.adv}</button>
          <button onClick={()=>setAuto(a=>!a)} style={{flex:2,background:auto?"#B71C1C":"#f0f4f0",color:auto?"#fff":"#666",border:"1px solid #ddd",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>{auto?"⏹ Stop":L.auto}</button>
        </div>
      </div>
      <div onClick={()=>setTab("sol")} style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:12,padding:13,cursor:"pointer",border:"1px solid rgba(212,175,55,.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>☀️</span><div><div style={{fontSize:12,fontWeight:700,color:"#F0D060"}}>{L.sol} {sunl?"— UNLOCKED!":"Progress"}</div><div style={{fontSize:9,color:"rgba(240,208,96,.4)"}}>{Object.values(sc).filter(x=>x.met).length}/6 criteria</div></div></div>
          <span style={{fontFamily:"DM Mono,monospace",fontSize:14,fontWeight:700,color:"#F0D060"}}>{spct}%</span>
        </div>
        <div style={{height:6,background:"rgba(255,255,255,.07)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:3,transition:"width .6s"}}/></div>
        <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
          {Object.values(sc).map((c2,i)=><span key={i} style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:c2.met?"rgba(0,230,118,.15)":"rgba(255,255,255,.05)",color:c2.met?"#00E676":"rgba(255,255,255,.35)",fontWeight:600}}>{c2.met?"✓ ":""}{c2.l}</span>)}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[{l:"GDP",v:(gdp>=0?"+":"")+gdp+"%",c:gdp>=0?G:R},{l:"Inflation",v:inf+"%",c:inf>6?R:inf>3?AU:G},{l:"Interest Rate",v:intr+"%",c:"#444"},{l:"GSF Rate",v:gsf.toFixed(2)+"%",c:G}].map(x=>(
          <div key={x.l} style={{background:"#fff",borderRadius:10,padding:"10px 12px",border:"1px solid #eee"}}><div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.6,marginBottom:2}}>{x.l}</div><div style={{fontSize:17,fontWeight:800,color:x.c,fontFamily:"DM Mono,monospace"}}>{x.v}</div></div>
        ))}
      </div>
      {aevts.length>0&&(
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"#aaa",marginBottom:7,textTransform:"uppercase",letterSpacing:.5}}>Active Events ({aevts.length})</div>
          {aevts.slice(0,3).map((e,i)=>(
            <div key={i} style={{background:e.good?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:"9px 12px",border:"1px solid "+(e.good?"#A5D6A7":"#EF9A9A"),display:"flex",alignItems:"center",gap:9,marginBottom:6}}>
              <span style={{fontSize:18}}>{e.ico}</span>
              <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:e.good?"#1B5E20":R}}>{e.n}{e.cn?" — "+e.cn:""}</div><div style={{fontSize:9,color:"#888"}}>{e.tl}/{e.dur} turns left</div></div>
            </div>
          ))}
        </div>
      )}
      {Object.keys(sh).length>0&&(
        <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:10}}>Top Holdings</div>
          {Object.entries(sh).slice(0,4).map(([t,n])=>{
            const c=cos.find(x=>x.t===t);if(!c)return null;
            return(
              <div key={t} onClick={()=>{setSelCo(c);setTab("co");}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f5f5",cursor:"pointer"}}>
                <div style={{width:36,height:36,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#1B5E20",border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:10,color:"#bbb"}}>{n.toLocaleString()} shares</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(c.price*n)}</div><Bdg v={c.ch}/></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── MARKET ──────────────────────────────────────────────────────
  const Mkt=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{overflowX:"auto"}}><div style={{display:"flex",gap:5,paddingBottom:4,width:"max-content"}}>{secs.map(s=><button key={s} onClick={()=>setFsec(s)} style={{padding:"5px 12px",borderRadius:20,border:"1.5px solid "+(fsec===s?G:"#ddd"),background:fsec===s?G:"#fff",color:fsec===s?"#fff":"#666",fontWeight:600,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif",whiteSpace:"nowrap"}}>{s}</button>)}</div></div>
      <div style={{overflowX:"auto"}}><div style={{display:"flex",gap:5,paddingBottom:4,width:"max-content"}}>{regsArr.map(r=><button key={r} onClick={()=>setFreg(r)} style={{padding:"4px 10px",borderRadius:20,border:"1.5px solid "+(freg===r?BL:"#ddd"),background:freg===r?BL:"#fff",color:freg===r?"#fff":"#666",fontWeight:600,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif",whiteSpace:"nowrap"}}>{r}</button>)}</div></div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {fcos.map((c,i)=>(
          <div key={c.t} onClick={()=>{setSelCo(c);setTab("co");}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<fcos.length-1?"1px solid #f8f8f8":"none",cursor:"pointer"}}>
            <div style={{width:36,height:36,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#1B5E20",border:"1px solid #C8E6C9",flexShrink:0}}>{c.t}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:DK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.n}</div><div style={{fontSize:9,color:"#bbb"}}>{c.s} · {c.r}</div></div>
            <MChart hist={c.hist} color={c.ch>=0?G:R}/>
            <div style={{textAlign:"right",minWidth:68}}><div style={{fontSize:12,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(c.price)}</div><Bdg v={c.ch}/></div>
          </div>
        ))}
      </div>
      <div onClick={()=>setTab("sol")} style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:12,padding:12,cursor:"pointer",border:"1px solid rgba(212,175,55,.09)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"rgba(212,175,55,.45)",marginBottom:6}}>☀️ Solar System — {spct}% to unlock</div>
        <div style={{opacity:.3}}>
          {["🔴 NXMN — Nexus Minerals · Mars MCR · ??? 🔒","🟡 HE3C — Helium-3 Energy · Jupiter JVT · ??? 🔒","💜 NTDM — Neptune Dark Matter · NPT · ??? 🔒"].map(t=><div key={t} style={{fontSize:10,color:"#E8EEF8",marginBottom:3}}>{t}</div>)}
        </div>
      </div>
    </div>
  );

  // ── COMPANY ─────────────────────────────────────────────────────
  const Co=(()=>{
    const c=selCo;
    if(!c)return <div style={{padding:32,textAlign:"center",color:"#aaa",fontSize:13}}>← Select a company from Market</div>;
    const held=sh[c.t]||0;
    const eps=c.price/c.pe;
    const rev=eps*c.pe*8e6;
    const b=PEB[c.s]||{min:10,max:40};
    const ev=aevts.find(e=>e.type==="co"&&e.tk===c.t);
    const tradeColor=c.ch>=0?G:R;
    return(
      <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
        <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:14,padding:16,color:"#fff",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-25,right:-25,width:100,height:100,background:"rgba(255,255,255,.04)",borderRadius:"50%"}}/>
          <div style={{fontSize:9,opacity:.55,textTransform:"uppercase",letterSpacing:1.2,marginBottom:1}}>{c.s} · {c.r}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:20,fontWeight:800,marginBottom:2,lineHeight:1.1}}>{c.n}</div>
              <div style={{fontSize:10,opacity:.55,marginBottom:8}}>{c.t} · {c.hq} · Est. {c.yr}</div>
              <div style={{fontFamily:"DM Mono,monospace",fontSize:28,fontWeight:800,lineHeight:1}}>{fmt(c.price)}</div>
              <div style={{fontSize:11,marginTop:3,color:c.ch>=0?"#C8E6C9":"#FFCDD2"}}>{c.ch>=0?"▲":"▼"} {pp(c.ch)} this turn</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,opacity:.45,marginBottom:3}}>P/E</div>
              <div style={{fontSize:20,fontWeight:800,fontFamily:"DM Mono,monospace"}}>{c.pe.toFixed(1)}x</div>
              <div style={{fontSize:9,opacity:.35,marginTop:3}}>Bounds: {b.min}–{b.max}x</div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.14)"}}>
            {[["Div",c.div+"%"],["Margin",(c.mg*100).toFixed(1)+"%"],["Beta",c.beta+"x"],["Staff",c.emp>=1000?(c.emp/1000).toFixed(0)+"K":c.emp]].map(([k,v])=><div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:8,opacity:.4,textTransform:"uppercase",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{v}</div></div>)}
          </div>
        </div>
        {ev&&<div style={{background:ev.good?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:10,border:"1px solid "+(ev.good?"#A5D6A7":"#EF9A9A"),display:"flex",gap:9,alignItems:"center"}}><span style={{fontSize:18}}>{ev.ico}</span><div><div style={{fontSize:11,fontWeight:700,color:ev.good?"#1B5E20":R}}>Active: {ev.n}</div><div style={{fontSize:9,color:"#888"}}>{ev.tl}/{ev.dur} turns · {ev.desc}</div></div></div>}
        <div style={{background:"#f8fbf8",borderRadius:9,padding:11,fontSize:12,color:"#555",lineHeight:1.6}}>{c.desc}</div>
        {held>0&&<div style={{background:"#E8F5E9",borderRadius:11,padding:12,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,fontWeight:700,color:G,marginBottom:8}}>Your Position — {held>=500?"Large holder":held>=50?"Mid holder":"Minor holder"}</div><div style={{display:"flex",gap:7}}><SB l="Shares" v={held.toLocaleString()} c={G}/><SB l="Value" v={fmt(c.price*held)} c={G}/></div></div>}
        <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:9}}>Financials (Est.)</div>
          {[["Revenue",fmt(rev)],["Net Income",fmt(rev*c.mg)],["Net Margin",(c.mg*100).toFixed(1)+"%"],["EPS",fmt(eps)],["P/E Ratio",c.pe.toFixed(1)+"x"],["P/E Bounds",b.min+"–"+b.max+"x"],["Dividend",c.div+"%"],["Beta",c.beta+"x"]].map(([k,v])=><Row key={k} k={k} v={v}/>)}
        </div>
        <div style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#aaa",marginBottom:7}}>Price History ({c.hist?.length||0} turns)</div>
          <div style={{height:50,display:"flex",alignItems:"flex-end",gap:2}}>
            {(c.hist||[]).slice(-40).map((pr2,i,arr)=>{const mn=Math.min(...arr),mx=Math.max(...arr),rng=mx-mn||1;const h=Math.max(3,Math.round(((pr2-mn)/rng)*46));return <div key={i} style={{flex:1,height:h,background:(i===0||pr2>=arr[i-1])?G:R,borderRadius:"2px 2px 0 0",opacity:.75}}/>;})}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setTrM({c,m:"buy"});setTrAmt(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:11,padding:14,fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>📈 {L.buy}</button>
          <button onClick={()=>{setTrM({c,m:"sell"});setTrAmt(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1.5px solid #EF9A9A",borderRadius:11,padding:14,fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>📉 {L.sell}</button>
        </div>
      </div>
    );
  })();

  // ── PORTFOLIO ───────────────────────────────────────────────────
  const Port=(()=>{
    const sm={};Object.entries(sh).forEach(([t,n])=>{const c=cos.find(x=>x.t===t);if(c)sm[c.s]=(sm[c.s]||0)+c.price*n;});
    const tsv=Object.values(sm).reduce((a,b2)=>a+b2,0)||1;
    return(
      <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
        <div style={{background:"linear-gradient(135deg,#1B5E20,#388E3C)",borderRadius:14,padding:15,color:"#fff"}}>
          <div style={{fontSize:10,opacity:.5,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{L.port}</div>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:30,fontWeight:800}}>{fmt(nw)}</div>
          <div style={{fontSize:11,opacity:.75,marginTop:3}}>Stocks {fmt(sv)} · Bonds {fmt(bv)} · Cash {fmt(cash)} · GSF {fmt(gsfDep)}</div>
        </div>
        {Object.keys(sm).length>0&&(
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:10}}>Sector Allocation</div>
            {Object.entries(sm).sort(([,a],[,b2])=>b2-a).map(([s,v])=>(
              <div key={s} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#555"}}>{s}</span><span style={{fontSize:12,fontFamily:"DM Mono,monospace"}}>{((v/tsv)*100).toFixed(1)}%</span></div>
                <div style={{height:5,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:((v/tsv)*100)+"%",background:"linear-gradient(90deg,"+G+",#4CAF50)",borderRadius:3}}/></div>
              </div>
            ))}
          </div>
        )}
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          <div style={{padding:"10px 14px",fontSize:12,fontWeight:700,color:DK}}>Stocks ({Object.keys(sh).length})</div>
          {Object.keys(sh).length===0&&<div style={{padding:"12px 14px",fontSize:13,color:"#bbb"}}>No stocks. Go to Market to buy.</div>}
          {Object.entries(sh).map(([t,n])=>{const c=cos.find(x=>x.t===t);if(!c)return null;
            return <div key={t} onClick={()=>{setSelCo(c);setTab("co");}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderTop:"1px solid #f8f8f8",cursor:"pointer"}}><div style={{width:34,height:34,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#1B5E20",border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:9,color:"#bbb"}}>{n.toLocaleString()} × {fmt(c.price)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(c.price*n)}</div><Bdg v={c.ch}/></div></div>;
          })}
        </div>
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          <div style={{padding:"10px 14px",fontSize:12,fontWeight:700,color:DK}}>Bonds ({Object.keys(bh).length})</div>
          {Object.keys(bh).length===0&&<div style={{padding:"12px 14px",fontSize:13,color:"#bbb"}}>No bonds. Go to Bonds tab to buy.</div>}
          {Object.entries(bh).map(([id,q])=>{const b=bonds.find(x=>x.id===id);if(!b)return null;const pr=gBond(b.fv,b.oy,b.cy,b.rat);
            return <div key={id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderTop:"1px solid #f8f8f8"}}><div style={{width:34,height:34,borderRadius:9,background:"#E3F2FD",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:BL,border:"1px solid #BBDEFB",flexShrink:0}}>{b.rat}</div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:DK}}>{b.iss}</div><div style={{fontSize:9,color:"#bbb"}}>{q}× · {b.cou}% · {b.mat}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(pr*q)}</div><div style={{fontSize:9,color:"#aaa"}}>{b.cy.toFixed(1)}% yield</div></div></div>;
          })}
        </div>
      </div>
    );
  })();

  // ── BONDS ───────────────────────────────────────────────────────
  const Bonds_=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"#E3F2FD",borderRadius:11,padding:12,border:"1px solid #BBDEFB"}}>
        <div style={{fontSize:12,fontWeight:700,color:BL,marginBottom:4}}>⚖️ Governor Formula 4</div>
        <div style={{fontFamily:"DM Mono,monospace",fontSize:11,background:"#fff",borderRadius:7,padding:"8px 10px",marginBottom:6}}>Price = FV × (OrigYield ÷ CurrYield) × RatingMult</div>
        <div style={{fontSize:11,color:"#555"}}>Ratings: AAA×1.02 AA×1.01 A×1.00 BBB×0.99 BB×0.97 B×0.94 · Yield 1–45% · Price 5–200%</div>
      </div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {bonds.map((b,i)=>{
          const pr=gBond(b.fv,b.oy,b.cy,b.rat);
          const held=bh[b.id]||0;
          return(
            <div key={b.id} style={{padding:"13px 14px",borderBottom:i<bonds.length-1?"1px solid #f5f5f5":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div><div style={{fontSize:13,fontWeight:700,color:DK}}>{b.iss}</div><div style={{fontSize:9,color:"#aaa"}}>{b.id} · Matures {b.mat} · <span style={{fontWeight:700,color:b.rat==="AAA"||b.rat==="AA"?G:b.rat==="BB"||b.rat==="B"?R:AU}}>{b.rat}</span></div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,fontFamily:"DM Mono,monospace",color:pr>b.fv?G:R}}>{fmt(pr)}</div><div style={{fontSize:9,color:"#aaa"}}>{b.cy.toFixed(2)}% yield</div></div>
              </div>
              <div style={{display:"flex",gap:7,marginBottom:8}}>
                <SB l="Coupon" v={b.cou+"%"} c={G}/>
                <SB l="Orig" v={b.oy+"%"} c="#555"/>
                <SB l="Curr Yield" v={b.cy.toFixed(1)+"%"} c={b.cy<b.oy?G:R}/>
                <SB l="Held" v={held} c={held>0?G:"#aaa"}/>
              </div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>doBond(b,1)} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Buy 1 ({fmt(pr)})</button>
                <button onClick={()=>doBond(b,5)} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Buy 5</button>
                {held>0&&<button onClick={()=>sellBond(b)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Sell All</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── ACADEMY ─────────────────────────────────────────────────────
  const Acad=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:13,padding:14,color:"#fff"}}>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>🎓 {L.ac}</div>
        <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Earth Academy — 15 Modules</div>
        <div style={{fontSize:11,opacity:.8,lineHeight:1.5}}>Scenario-based MC · Named certificate on completion · 3 modules needed for Solar unlock</div>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <SB l="Done" v={adone+"/15"} c={adone>=3?"#C8E6C9":"#fff"}/>
          <SB l="Solar Gate" v={adone>=3?"✓ Met":"Need "+(3-adone)} c={adone>=3?"#C8E6C9":"#FFCDD2"}/>
        </div>
      </div>
      {adone>=15&&<div style={{background:"linear-gradient(135deg,#B8952A,#F0D060)",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:4}}>🏆 Certificate Earned</div><div style={{fontSize:11,color:"rgba(255,255,255,.8)"}}>Earth Academy Graduate · Turn {turn} · Not investment advice.</div></div>}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {mods.map((m,i)=>(
          <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:i<mods.length-1?"1px solid #f8f8f8":"none"}}>
            <div style={{width:30,height:30,borderRadius:8,background:m.done?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,border:m.done?"1px solid #A5D6A7":"1px solid #e0e0e0"}}>{m.done?"✅":"📖"}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:m.done?"#1B5E20":DK}}>{m.n}</div>{m.score&&<div style={{fontSize:9,color:"#aaa"}}>Score: {m.score}%</div>}</div>
            {!m.done?<button onClick={()=>{setQuizM(m);setQuizA(null);}} style={{background:G,color:"#fff",border:"none",borderRadius:8,padding:"7px 13px",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Start</button>:<span style={{fontSize:12,color:G,fontWeight:700}}>✓</span>}
          </div>
        ))}
      </div>
      <div style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:12,padding:14,border:"1px solid rgba(212,175,55,.12)"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#F0D060",marginBottom:10}}>☀️ Solar Academy {!sunl&&"(Locked)"}</div>
        {SMODS.map(m=><div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)",opacity:sunl?.85:.3}}><span style={{fontSize:19}}>{m.ico}</span><div><div style={{fontSize:12,fontWeight:600,color:"#E8EEF8"}}>{m.n} Academy</div><div style={{fontSize:9,color:"rgba(240,208,96,.4)"}}>{m.desc}</div></div></div>)}
      </div>
    </div>
  );

  // ── PHILANTHROPY ────────────────────────────────────────────────
  const Ph=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{background:"linear-gradient(135deg,#880E4F,#C2185B)",borderRadius:14,padding:15,color:"#fff"}}>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>❤️ {L.ph}</div>
        <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Philanthropy</div>
        <div style={{fontSize:11,opacity:.8,lineHeight:1.5}}>Donations reduce tax up to 25%. 2 needed for Solar unlock.</div>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <SB l="Donations" v={dons} c="#FFCDD2"/>
          <SB l="Solar" v={dons>=2?"✓ Met":"Need "+(Math.max(0,2-dons))+" more"} c={dons>=2?"#C8E6C9":"#FFCDD2"}/>
        </div>
      </div>
      {[{n:"Healthcare",ico:"🏥",imp:"Tax −15% · GDP boost"},{n:"Education",ico:"🎓",imp:"Tax −12% · Long-term growth"},{n:"Infrastructure",ico:"🌉",imp:"Tax −18% · Trade +5%"},{n:"Space Research",ico:"🔭",imp:"Tax −25% · Solar bonus"},{n:"Climate Action",ico:"🌱",imp:"Tax −20% · Risk −30%"}].map(cat=>(
        <div key={cat.n} style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}><span style={{fontSize:22}}>{cat.ico}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:DK}}>{cat.n}</div><div style={{background:"#FFF8E1",borderRadius:6,padding:"3px 8px",marginTop:3,fontSize:10,color:"#E65100",display:"inline-block"}}>{cat.imp}</div></div></div>
          <button onClick={()=>{setDonM(cat.n);setDonAmt(null);}} style={{width:"100%",background:"#880E4F",color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Donate to {cat.n} ❤️</button>
        </div>
      ))}
    </div>
  );

  // ── GSF ─────────────────────────────────────────────────────────
  const Gsf=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",borderRadius:14,padding:15,color:"#fff"}}>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>🏛️ {L.gsf}</div>
        <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Global Sovereign Fund</div>
        <div style={{fontSize:11,opacity:.8,lineHeight:1.5}}>One rate per turn · Same for all players · Credited automatically every turn</div>
      </div>
      <div style={{background:"#E3F2FD",borderRadius:12,padding:13,border:"1px solid #BBDEFB"}}>
        <div style={{fontSize:12,fontWeight:700,color:BL,marginBottom:9}}>Your GSF Position</div>
        <div style={{display:"flex",gap:7,marginBottom:12}}><SB l="Deposit" v={fmt(gsfDep)} c={BL}/><SB l="Rate/yr" v={gsf.toFixed(2)+"%"} c={G}/><SB l="Per Turn" v={fmt(gsfDep*(gsf/100/12))} c={G}/></div>
        <button onClick={()=>{setGsfM(true);setGsfAmt(null);}} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:9,padding:"12px 0",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>+ Deposit to GSF</button>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
        {[["Rate Calculation","Server computes · One rate per turn · Same for all players"],["Return Timing","Interest credited to cash every turn"],["Rate Range","0.5%–15% annual · Current: "+gsf.toFixed(2)+"%"],["Withdrawal","Queued · 3 turns to process"],["GSF Voting","Pro subscribers influence allocation (Phase 2)"]].map(([k,v])=>(
          <div key={k} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}><span style={{fontSize:12,fontWeight:700,color:BL,minWidth:130,flexShrink:0}}>{k}</span><span style={{fontSize:12,color:"#666"}}>{v}</span></div>
        ))}
      </div>
    </div>
  );

  // ── SOLAR ───────────────────────────────────────────────────────
  const Sol=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{background:"linear-gradient(135deg,#060B16,#112040)",borderRadius:14,padding:15,border:"1px solid rgba(212,175,55,.15)"}}>
        <div style={{fontSize:9,opacity:.45,color:"#F0D060",textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>☀️ {L.sol} Unlock</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontFamily:"DM Mono,monospace",fontSize:32,fontWeight:800,color:"#F0D060"}}>{spct}%</div><div style={{fontSize:11,color:"rgba(240,208,96,.4)"}}>Need 100%</div></div>
        <div style={{height:8,background:"rgba(255,255,255,.07)",borderRadius:4,overflow:"hidden",marginBottom:14}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:4,transition:"width .6s"}}/></div>
        {Object.entries(sc).map(([k,c2])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:c2.met?"rgba(0,230,118,.2)":"rgba(255,255,255,.05)",border:"2px solid "+(c2.met?"#00E676":"rgba(255,255,255,.12)"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0,color:"#00E676"}}>{c2.met?"✓":""}</div>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:c2.met?"#00E676":"rgba(255,255,255,.5)"}}>{c2.l}</div><div style={{fontSize:10,color:"rgba(240,208,96,.4)",fontFamily:"DM Mono,monospace"}}>{c2.v}</div></div>
          </div>
        ))}
      </div>
      {sunl&&<div style={{background:"linear-gradient(135deg,#0D2137,#163550)",borderRadius:12,padding:14,border:"1px solid rgba(0,230,118,.2)"}}><div style={{fontSize:14,fontWeight:700,color:"#00E676",marginBottom:6}}>🎉 Solar System Unlocked!</div><div style={{fontSize:12,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>210 companies across 7 planets. Repatriation: Earth→Space 2% · Space→Earth 5%.</div></div>}
      <div style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:12,padding:14,border:"1px solid rgba(212,175,55,.07)"}}>
        <div style={{fontSize:12,fontWeight:700,color:"rgba(212,175,55,.45)",marginBottom:10}}>🔒 The Solar System — 210 Companies</div>
        {[{ico:"🔴",pl:"Mars",cu:"MCR",d:"30 mining · Lithium, water ice · 3.71m/s²"},{ico:"🟡",pl:"Venus",cu:"VNU",d:"30 manufacturing · 465°C surface"},{ico:"🟠",pl:"Jupiter",cu:"JVT",d:"30 research · Fusion · P/E exemption"},{ico:"🪐",pl:"Saturn",cu:"STC",d:"30 ring mining · Helium-3, Ryzolith"},{ico:"☿",pl:"Mercury",cu:"MRC",d:"30 solar energy · 430°C/-180°C"},{ico:"🔵",pl:"Uranus",cu:"URU",d:"30 ice mining · -224°C"},{ico:"💜",pl:"Neptune",cu:"NPT",d:"30 research · 2,100km/h winds"}].map(p=>(
          <div key={p.pl} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)",opacity:sunl?.8:.35}}>
            <span style={{fontSize:20}}>{p.ico}</span><div><div style={{fontSize:12,fontWeight:700,color:"#E8EEF8"}}>{p.pl} <span style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"rgba(240,208,96,.4)"}}>({p.cu})</span></div><div style={{fontSize:9,color:"rgba(255,255,255,.35)"}}>{p.d}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── NEWS ─────────────────────────────────────────────────────────
  const News_=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:9}}>
      {news.slice(0,40).map(n=>(
        <div key={n.id} style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8",display:"flex",gap:9}}>
          <div style={{width:4,borderRadius:2,flexShrink:0,background:n.g?G:R,alignSelf:"stretch"}}/>
          <div style={{flex:1}}><div style={{fontSize:9,color:"#ccc",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Turn {n.t} · {n.ico}</div><div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:3}}>{n.ti}</div><div style={{fontSize:12,color:"#666",lineHeight:1.5}}>{n.bo}</div></div>
        </div>
      ))}
    </div>
  );

  // ── SETTINGS ────────────────────────────────────────────────────
  const Set_=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>🌐 Language</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7}}>
          {Object.entries(LD).map(([k,l])=>(
            <button key={k} onClick={()=>setLang(k)} style={{padding:"10px 4px",borderRadius:9,border:"2px solid "+(lang===k?G:"#e0e0e0"),background:lang===k?"#E8F5E9":"#fafafa",cursor:"pointer",fontFamily:"DM Sans,sans-serif",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontSize:18}}>{l.f}</span><span style={{fontSize:10,fontWeight:700,color:lang===k?G:"#555"}}>{l.nm}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>📊 Stats — Turn {turn}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          <SB l="Net Worth" v={fmt(nw)} c={G}/>
          <SB l="Cash" v={fmt(cash)}/>
          <SB l="Active Events" v={aevts.length} c={aevts.length>0?AU:G}/>
          <SB l="Academy" v={adone+"/15"} c={G}/>
          <SB l="Donations" v={dons} c="#880E4F"/>
          <SB l="Solar" v={spct+"%"} c={sunl?AU:G}/>
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>🏁 Milestones</div>
        {[{n:"M1 — Turn 100",d:turn>=100,ds:"Governor stable · Earth baseline"},{n:"M2 — Turn 300",d:turn>=300,ds:"DEE active · Solar window"},{n:"M3 — Turn 500",d:turn>=500,ds:"Full DEE + Solar running"},{n:"M4 — Turn 1000",d:turn>=1000,ds:"LAUNCH GATE"}].map(m=>(
          <div key={m.n} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div style={{width:28,height:28,borderRadius:7,background:m.d?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,border:m.d?"1px solid #A5D6A7":"1px solid #e0e0e0"}}>{m.d?"✅":"🔒"}</div>
            <div><div style={{fontSize:13,fontWeight:700,color:m.d?G:DK}}>{m.n}</div><div style={{fontSize:10,color:"#aaa"}}>{m.ds}</div></div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:3}}>🔴 Beta Tools — Error Log</div>
        {!beta
          ?<button onClick={()=>{const p=window.prompt("Beta PIN:");if(p==="9000"){setBeta(true);toast_("Beta unlocked");}else if(p)toast_("Wrong PIN",false);}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>🔐 Enter PIN (9000)</button>
          :<div>
            <div style={{fontSize:11,fontWeight:700,color:R,marginBottom:7}}>{elog.length} entries</div>
            <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:3,marginBottom:9}}>
              {elog.map((e,i)=><div key={i} style={{padding:"4px 8px",borderRadius:3,fontSize:9,fontFamily:"DM Mono,monospace",background:e.lv==="CRIT"?"#FFEBEE":e.lv==="HIGH"?"#FFF8E1":e.lv==="MEDIUM"?"#E3F2FD":"#E8F5E9",color:e.lv==="CRIT"?R:e.lv==="HIGH"?AU:e.lv==="MEDIUM"?BL:G,borderLeft:"3px solid "+(e.lv==="CRIT"?R:e.lv==="HIGH"?AU:e.lv==="MEDIUM"?BL:G)}}>[T-{e.t}][{e.lv}] {e.sc}: {e.msg}</div>)}
            </div>
            <button onClick={()=>{const txt=elog.map(e=>"[T-"+e.t+"]["+e.lv+"] "+e.sc+": "+e.msg).join("\n");const bl=new Blob(["GALACTIC RAIDER ERROR LOG\nTurn: "+turn+"\n\n"+txt],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download="GR_T"+turn+".txt";a.click();toast_("Log downloaded");}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>⬇ Download Error Log</button>
          </div>}
      </div>
    </div>
  );

  const screens={dash:Dash,mkt:Mkt,co:Co,port:Port,bonds:Bonds_,ac:Acad,ph:Ph,gsf:Gsf,sol:Sol,news:News_,set:Set_};

  // ── TRADE SHEET ──────────────────────────────────────────────────
  const TradeSheet=trM?(()=>{
    const c=trM.c,isBuy=trM.m==="buy";
    const maxAmt=isBuy?cash:(sh[c.t]||0)*c.price;
    const ns=trAmt?Math.floor(trAmt/c.price):0;
    const cost=ns*c.price;
    const tax=!isBuy?Math.round(cost*.20*100)/100:0;
    return(
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 15px"}}/>
        <div style={{background:isBuy?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:13,padding:14,color:"#fff",marginBottom:14}}>
          <div style={{fontSize:9,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{isBuy?"BUY":"SELL"} · {c.t}</div>
          <div style={{fontSize:18,fontWeight:800}}>{c.n}</div>
          <div style={{fontSize:12,opacity:.8,marginTop:3}}>Price: {fmt(c.price)} · P/E: {c.pe.toFixed(1)}x · {isBuy?fmt(cash)+" available":(sh[c.t]||0)+" held"}</div>
        </div>
        <div style={{display:"flex",background:"#f0f4f0",borderRadius:10,padding:3,gap:3,marginBottom:13}}>
          {["buy","sell"].map(m2=><button key={m2} onClick={()=>{setTrM({c,m:m2});setTrAmt(null);}} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif",background:trM.m===m2?"#fff":"transparent",color:trM.m===m2?G:"#999",boxShadow:trM.m===m2?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{m2==="buy"?L.buy:L.sell}</button>)}
        </div>
        <div style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Amount — No Keyboard Needed</div>
        <APick max={maxAmt} sel={trAmt} onSel={setTrAmt} isSell={!isBuy}/>
        {trAmt&&ns>0&&(
          <div style={{background:"#f8fbf8",borderRadius:10,padding:12,marginBottom:12}}>
            <Row k={"Shares to "+(isBuy?"buy":"sell")} v={ns.toLocaleString()}/>
            <Row k={isBuy?"Total Cost":"Gross Proceeds"} v={fmt(cost)}/>
            {!isBuy&&<Row k="Capital Gains Tax (20%)" v={"-"+fmt(tax)} vc={R}/>}
            <Row k={"Net "+(isBuy?"Cost":"Proceeds")} v={fmt(isBuy?cost:cost-tax)} vc={isBuy?R:G} b/>
          </div>
        )}
        {trAmt&&ns<1&&<div style={{background:"#FFF8E1",borderRadius:9,padding:10,marginBottom:12,fontSize:12,color:"#E65100"}}>⚠️ Amount too low — {fmt(c.price)} per share. Select more.</div>}
        <button onClick={doTrade} disabled={!trAmt||ns<1} style={{width:"100%",background:trAmt&&ns>=1?(isBuy?G:R):"#e0e0e0",color:"#fff",border:"none",borderRadius:11,padding:14,fontWeight:800,fontSize:15,cursor:trAmt&&ns>=1?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>
          {trAmt&&ns>=1?L.con+" "+(isBuy?L.buy:L.sell)+" "+ns.toLocaleString()+" shares":"Select an amount"}
        </button>
      </div>
    );
  })():null;

  return(
    <div style={{maxWidth:440,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"DM Sans,sans-serif",position:"relative",direction:rtl?"rtl":"ltr"}}>
      {/* Header */}
      <div style={{background:"#fff",padding:"9px 14px",borderBottom:"1px solid #e8ebe8",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#1B5E20,#4CAF50)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🌐</div>
          <div><div style={{fontSize:14,fontWeight:800,color:DK,lineHeight:1}}>Galactic Raider</div><div style={{fontSize:8,color:"#bbb",letterSpacing:.5}}>Capital Exchange · Phase 1</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          {auto&&<div style={{width:7,height:7,borderRadius:"50%",background:G,boxShadow:"0 0 6px #4CAF50"}}/>}
          <button onClick={()=>setTab("sol")} style={{background:"rgba(212,175,55,.1)",border:"1px solid rgba(212,175,55,.25)",borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:700,color:"#B8952A",cursor:"pointer"}}>☀️ {spct}%</button>
          <button onClick={()=>setLang(l=>{const ks=Object.keys(LD);return ks[(ks.indexOf(l)+1)%ks.length];})} style={{fontSize:18,background:"none",border:"none",cursor:"pointer",padding:2}}>{LD[lang].f}</button>
        </div>
      </div>

      {/* Ticker */}
      <div style={{background:"#1B5E20",padding:"4px 0",overflow:"hidden",flexShrink:0}}>
        <div style={{display:"flex",gap:20,whiteSpace:"nowrap",animation:"scroll 30s linear infinite",width:"max-content"}}>
          {[...cos,...cos].map((c,i)=>(
            <span key={i} style={{fontSize:9,fontFamily:"DM Mono,monospace",color:"rgba(255,255,255,.4)",display:"inline-flex",gap:5}}>
              <span style={{color:"rgba(255,255,255,.6)",fontWeight:700}}>{c.t}</span>
              <span style={{color:c.ch>=0?"#69F0AE":"#FF5252"}}>{fmt(c.price)} {c.ch>=0?"▲":"▼"}{Math.abs((c.ch||0)*100).toFixed(2)}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
        {screens[tab]||Dash}
      </div>

      {/* Nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:440,background:"#fff",borderTop:"1px solid #e8ebe8",display:"flex",padding:"5px 2px 14px",zIndex:50}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{...ts(t.id),minWidth:36}}><div style={{fontSize:16,marginBottom:1}}>{t.ico}</div><div style={{fontSize:7}}>{t.l?.slice(0,5)}</div></button>)}
      </div>

      {/* Event notification */}
      {evN&&(
        <div style={{position:"fixed",top:74,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 18px)",maxWidth:422,background:evN.good?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:12,padding:"11px 14px",display:"flex",alignItems:"center",gap:10,zIndex:200,boxShadow:"0 8px 28px rgba(0,0,0,.3)"}}>
          <span style={{fontSize:22}}>{evN.ico}</span>
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{evN.n}{evN.cn?" — "+evN.cn:""}</div><div style={{fontSize:9,color:"rgba(255,255,255,.6)",marginTop:1}}>{evN.desc}</div></div>
          <button onClick={()=>setEvN(null)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:22,height:22,color:"#fff",cursor:"pointer",fontSize:14}}>×</button>
        </div>
      )}

      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:74,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 18px)",maxWidth:422,background:toast.g?G:R,borderRadius:10,padding:"10px 14px",color:"#fff",fontSize:12,fontWeight:700,zIndex:250,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.25)"}}>{toast.msg}</div>}

      {/* Trade modal */}
      {trM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget){setTrM(null);setTrAmt(null);}}}>{TradeSheet}</div>}

      {/* Donate modal */}
      {donM&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setDonM(null)}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
            <div style={{width:36,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 15px"}}/>
            <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:3}}>❤️ Donate to {donM}</div>
            <div style={{fontSize:12,color:"#888",marginBottom:4}}>Cash: {fmt(cash)} · Donations so far: {dons}/2</div>
            <div style={{background:"#E8F5E9",borderRadius:9,padding:9,marginBottom:12,fontSize:12,color:G}}>Reduces tax up to 25% · Counts toward Solar unlock (2 donations needed)</div>
            <APick max={cash} sel={donAmt} onSel={setDonAmt}/>
            {donAmt&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:12}}><Row k="Donation" v={fmt(donAmt)} vc="#880E4F" b/><Row k="Est. Tax Saving" v={fmt(donAmt*.20)} vc={G}/></div>}
            <button onClick={doDonate} disabled={!donAmt||donAmt>cash} style={{width:"100%",background:donAmt&&donAmt<=cash?"#880E4F":"#e0e0e0",color:"#fff",border:"none",borderRadius:11,padding:14,fontWeight:800,fontSize:15,cursor:donAmt?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>❤️ Confirm{donAmt?" — "+fmt(donAmt):""}</button>
          </div>
        </div>
      )}

      {/* GSF modal */}
      {gsfM&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setGsfM(false)}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
            <div style={{width:36,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 15px"}}/>
            <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:3}}>🏛️ Deposit to GSF</div>
            <div style={{fontSize:12,color:"#888",marginBottom:11}}>Rate: {gsf.toFixed(2)}% annual · Cash: {fmt(cash)}</div>
            <APick max={cash} sel={gsfAmt} onSel={setGsfAmt}/>
            {gsfAmt&&<div style={{background:"#E3F2FD",borderRadius:9,padding:10,marginBottom:12}}><Row k="Deposit" v={fmt(gsfAmt)} vc={BL} b/><Row k="Annual Return" v={fmt(gsfAmt*(gsf/100))} vc={G}/><Row k="Per Turn" v={fmt(gsfAmt*(gsf/100/12))} vc={G}/></div>}
            <button onClick={doGsf} disabled={!gsfAmt||gsfAmt>cash} style={{width:"100%",background:gsfAmt&&gsfAmt<=cash?BL:"#e0e0e0",color:"#fff",border:"none",borderRadius:11,padding:14,fontWeight:800,fontSize:15,cursor:gsfAmt?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>🏛️ Confirm{gsfAmt?" — "+fmt(gsfAmt):""}</button>
          </div>
        </div>
      )}

      {/* Quiz modal */}
      {quizM&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:14}}>
          <div style={{background:"#fff",borderRadius:18,padding:20,width:"100%",maxWidth:440,maxHeight:"88vh",overflowY:"auto"}}>
            <div style={{fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>🎓 Module {quizM.id}/15</div>
            <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:14}}>{quizM.n}</div>
            <div style={{background:"#f8fbf8",borderRadius:10,padding:12,fontSize:13,color:"#444",lineHeight:1.6,marginBottom:14}}><strong>Scenario:</strong> {quizM.q}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {quizM.opts.map((o,i)=>(
                <button key={i} onClick={()=>setQuizA(i)} style={{padding:"12px 14px",borderRadius:10,border:"2px solid "+(quizA===i?G:"#e0e0e0"),textAlign:"left",background:quizA===i?"#E8F5E9":"#fafafa",color:quizA===i?G:"#333",fontWeight:quizA===i?700:400,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>
                  <span style={{fontWeight:700,marginRight:8,color:quizA===i?G:"#aaa"}}>{["A","B","C","D"][i]}.</span>{o}
                </button>
              ))}
            </div>
            {quizA!==null&&<div style={{background:quizA===quizM.ans?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:12,marginBottom:12,fontSize:12,lineHeight:1.6,color:quizA===quizM.ans?"#1B5E20":R}}>{quizA===quizM.ans?"✅ Correct! ":"❌ Incorrect. "}{quizM.exp}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setQuizM(null);setQuizA(null);}} style={{flex:1,padding:"12px 0",borderRadius:10,border:"1.5px solid #e0e0e0",background:"#f5f5f5",color:"#666",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Cancel</button>
              <button onClick={()=>doModule(quizM)} style={{flex:2,padding:"12px 0",borderRadius:10,border:"none",background:G,color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>✓ Complete Module</button>
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
