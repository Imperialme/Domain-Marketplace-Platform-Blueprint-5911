import{useState,useRef,useEffect,useCallback}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e12?"$"+(a/1e12).toFixed(2)+"T":a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const pc=n=>(n>=0?"+":"")+((n||0)*100).toFixed(2)+"%";
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);

// ── COMPANIES (15 Earth) ──────────────────────────────────────
const COS=[
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",r:"Asia Pacific",ip:348.94,pe:18.4,div:0.8,b:1.8,emp:125000,yr:2008,hq:"Singapore",desc:"AI and cloud leader across 18 Asia Pacific markets. Primary revenue from enterprise software and semiconductor design.",mktCap:419,ceo:"Lin Wei",ceoRep:82,health:88},
  {t:"MRDB",n:"Meridian Bank",s:"Banking",r:"US",ip:85.20,pe:12.1,div:2.1,b:0.9,emp:45000,yr:1985,hq:"New York",desc:"US commercial bank with 2,400 retail branches, corporate lending, and investment banking division.",mktCap:68,ceo:"Sarah Mitchell",ceoRep:76,health:82},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",r:"Africa",ip:15.80,pe:8.5,div:0.5,b:1.6,emp:28000,yr:2005,hq:"Johannesburg",desc:"Pan-African mining: iron ore, rare earth elements, lithium across 9 countries. Major rare earth supplier.",mktCap:9.5,ceo:"James Okafor",ceoRep:68,health:71},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",r:"Emerging Markets",ip:351.54,pe:11.3,div:1.8,b:1.2,emp:62000,yr:1995,hq:"Dubai",desc:"Major oil producer and refiner across UAE, Kuwait, Oman and Central Asia. Third-largest Gulf exporter.",mktCap:316,ceo:"Khalid Al-Rashid",ceoRep:79,health:77},
  {t:"AGRO",n:"AgroLatin Corp",s:"Agriculture",r:"Latin America",ip:42.18,pe:13.2,div:2.5,b:1.1,emp:18000,yr:1975,hq:"São Paulo",desc:"Largest agri-business in Latin America: soy, corn, sugarcane, cattle across 4.2M hectares.",mktCap:21,ceo:"Maria Santos",ceoRep:74,health:76},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",r:"US",ip:198.40,pe:22.1,div:1.2,b:0.8,emp:38000,yr:2005,hq:"Boston",desc:"Medical devices, diagnostics and 180 hospitals across North America. FDA oncology pipeline.",mktCap:79,ceo:"Dr. Robert Chen",ceoRep:85,health:91},
  {t:"CLFL",n:"ClearFlame Energy",s:"Energy",r:"Europe",ip:112.30,pe:14.8,div:2.0,b:1.1,emp:22000,yr:2010,hq:"Amsterdam",desc:"Wind, solar and natural gas powering 12 million European households. Carbon neutral by 2027.",mktCap:39,ceo:"Hans Mueller",ceoRep:80,health:83},
  {t:"AXMB",n:"Axum Biotech",s:"Healthcare",r:"Africa",ip:68.50,pe:19.4,div:0.6,b:1.4,emp:8500,yr:2012,hq:"Addis Ababa",desc:"Tropical disease vaccines and African genomic medicine. WHO strategic partner. Phase-3 malaria vaccine.",mktCap:14,ceo:"Dr. Amara Diallo",ceoRep:88,health:85},
  {t:"PCMN",n:"Pacific Mfg",s:"Manufacturing",r:"Asia Pacific",ip:76.20,pe:15.6,div:1.3,b:1.0,emp:55000,yr:1988,hq:"Seoul",desc:"Electronics and EV battery parts supplier to 14 of the world's top-20 car manufacturers.",mktCap:53,ceo:"Park Ji-ho",ceoRep:73,health:79},
  {t:"NRDX",n:"Nordic Bank",s:"Banking",r:"Europe",ip:132.10,pe:11.8,div:2.4,b:0.8,emp:32000,yr:1975,hq:"Stockholm",desc:"Pan-European financial services across 18 countries. Strong Nordic wealth management leader.",mktCap:59,ceo:"Erik Lindqvist",ceoRep:77,health:84},
  {t:"UTLS",n:"Utility Systems",s:"Utilities",r:"US",ip:58.40,pe:14.2,div:4.2,b:0.5,emp:12000,yr:1950,hq:"Chicago",desc:"US electric and gas utility serving 3.2 million Midwest customers. Regulated monopoly.",mktCap:18,ceo:"Patricia Moore",ceoRep:71,health:80},
  {t:"TLCM",n:"TeleCom Europe",s:"Telecom",r:"Europe",ip:88.60,pe:13.5,div:4.5,b:0.6,emp:48000,yr:1985,hq:"Frankfurt",desc:"280 million mobile subscribers across 22 European countries. 5G infrastructure leader.",mktCap:49,ceo:"Klaus Weber",ceoRep:72,health:78},
  {t:"RETL",n:"RetailHub Inc",s:"Retail",r:"US",ip:38.90,pe:14.0,div:1.5,b:1.2,emp:85000,yr:2000,hq:"Seattle",desc:"1,200 US stores and online marketplace with 48M loyalty members. AI-driven inventory management.",mktCap:25,ceo:"Jessica Park",ceoRep:69,health:74},
  {t:"RLST",n:"RealEstate Trust",s:"Real Estate",r:"US",ip:44.20,pe:12.8,div:3.8,b:0.7,emp:2800,yr:1995,hq:"Dallas",desc:"$18B REIT portfolio across Sun Belt commercial and industrial properties. Strong logistics pipeline.",mktCap:11,ceo:"Michael Torres",ceoRep:75,health:81},
  {t:"EMTS",n:"Emerging Tech",s:"Technology",r:"Emerging Markets",ip:28.40,pe:22.0,div:0.2,b:2.0,emp:6500,yr:2015,hq:"Mumbai",desc:"B2B SaaS and cloud infrastructure for 18,000 South and Southeast Asian enterprises.",mktCap:5.1,ceo:"Priya Sharma",ceoRep:78,health:72},
];
const PEB={Technology:{mn:15,mx:35},Banking:{mn:8,mx:15},Mining:{mn:6,mx:12},Energy:{mn:8,mx:20},Agriculture:{mn:10,mx:18},Healthcare:{mn:12,mx:35},Manufacturing:{mn:10,mx:25},Utilities:{mn:12,mx:18},"Real Estate":{mn:8,mx:16},Telecom:{mn:10,mx:16},Retail:{mn:10,mx:18}};

// ── ETFs ──────────────────────────────────────────────────────
const ETFS=[
  {id:"EARTH500",n:"Earth 500 Index",cat:"Broad Market",ip:285,aum:450,exp:0.04,div:2.1,beta:1.0,desc:"Tracks all 15 Earth companies equally weighted. Lowest risk, steady growth.",holdings:15},
  {id:"TECHX",n:"Tech Giants ETF",cat:"Sector — Technology",ip:412,aum:89,exp:0.18,div:0.6,beta:1.7,desc:"SLKT + EMTS weighted by market cap. High growth, high volatility.",holdings:2},
  {id:"DIVK",n:"Dividend Kings ETF",cat:"Income",ip:198,aum:67,exp:0.12,div:4.1,beta:0.6,desc:"UTLS, TLCM, AGRO, RLST, NRDX. Maximum dividend income focus.",holdings:5},
  {id:"AFRI",n:"Africa Growth ETF",cat:"Regional",ip:145,aum:23,exp:0.35,div:1.2,beta:1.5,desc:"FRMN + AXMB. High-risk high-reward African market exposure.",holdings:2},
  {id:"GRNE",n:"Green Energy ETF",cat:"ESG",ip:167,aum:34,exp:0.22,div:1.8,beta:1.2,desc:"CLFL weighted. Clean energy transition play.",holdings:1},
];

// ── IPOs ──────────────────────────────────────────────────────
const IPOS=[
  {id:"QNTM",n:"Quantum Leap AI",s:"Technology",ip:45,shares:50000000,raised:2.25,open:false,turn:50,desc:"Quantum computing AI startup. Pre-revenue but 3 patents approved. High risk high reward.",minBuy:100,maxBuy:50000,underwriter:"Goldman Earth"},
  {id:"NRGY",n:"NovaNergy Solar",s:"Energy",ip:28,shares:80000000,raised:2.24,open:false,turn:100,desc:"Utility-scale solar farms across North Africa. $500M contracts signed.",minBuy:200,maxBuy:100000,underwriter:"Meridian Bank"},
  {id:"HLTH",n:"HealthBridge Africa",s:"Healthcare",ip:62,shares:30000000,raised:1.86,open:false,turn:150,desc:"Telemedicine network serving 500M underserved Africans. WHO partnership.",minBuy:50,maxBuy:30000,underwriter:"Axum Capital"},
  {id:"METX",n:"MetaMetal Corp",s:"Mining",ip:18,shares:120000000,raised:2.16,open:true,turn:1,desc:"Lithium and cobalt mining across DRC. EV battery supply contracts with 3 automakers.",minBuy:500,maxBuy:200000,underwriter:"Frontier Capital"},
  {id:"CRGO",n:"CargoFleet Logistics",s:"Manufacturing",ip:95,shares:25000000,raised:2.375,open:false,turn:200,desc:"AI-driven global logistics platform. 40% cost reduction vs traditional freight.",minBuy:20,maxBuy:25000,underwriter:"Pacific Advisors"},
];

// ── COMMODITIES ───────────────────────────────────────────────
const COMM=[
  {id:"OIL",n:"Crude Oil",u:"bbl",ip:85,base:85,cat:"Energy"},
  {id:"GOLD",n:"Gold",u:"oz",ip:1980,base:1980,cat:"Metals"},
  {id:"SLVR",n:"Silver",u:"oz",ip:23.4,base:23.4,cat:"Metals"},
  {id:"NGS",n:"Natural Gas",u:"MMBtu",ip:2.85,base:2.85,cat:"Energy"},
  {id:"CORN",n:"Corn",u:"bu",ip:4.42,base:4.42,cat:"Agriculture"},
  {id:"WHET",n:"Wheat",u:"bu",ip:5.80,base:5.80,cat:"Agriculture"},
  {id:"COPR",n:"Copper",u:"lb",ip:3.78,base:3.78,cat:"Metals"},
  {id:"LITH",n:"Lithium",u:"kg",ip:16.50,base:16.50,cat:"Metals"},
];

// ── CRYPTO + FOREX ────────────────────────────────────────────
const CRYP=[
  {id:"BTC",n:"Bitcoin",u:"BTC",ip:65000,base:65000,vol:0.08},
  {id:"ETH",n:"Ethereum",u:"ETH",ip:3200,base:3200,vol:0.09},
  {id:"SOL",n:"Solana",u:"SOL",ip:145,base:145,vol:0.12},
  {id:"BNB",n:"BNB",u:"BNB",ip:580,base:580,vol:0.10},
  {id:"AVAX",n:"Avalanche",u:"AVAX",ip:38,base:38,vol:0.14},
  {id:"MATIC",n:"Polygon",u:"MATIC",ip:0.92,base:0.92,vol:0.15},
];
const FX=[
  {id:"EURUSD",n:"EUR/USD",p:1.0850,base:1.0850,spread:0.0002,locked:false},
  {id:"GBPUSD",n:"GBP/USD",p:1.2680,base:1.2680,spread:0.0003,locked:false},
  {id:"USDJPY",n:"USD/JPY",p:148.50,base:148.50,spread:0.05,locked:false},
  {id:"USDAED",n:"USD/AED",p:3.6735,base:3.6735,spread:0,locked:true,note:"GSF Rate — Locked"},
  {id:"USDCNY",n:"USD/CNY",p:6.8000,base:6.8000,spread:0,locked:true,note:"RMB — Locked"},
  {id:"USDINR",n:"USD/INR",p:83.20,base:83.20,spread:0.05,locked:false},
  {id:"BTCUSD",n:"BTC/USD",p:65000,base:65000,spread:50,locked:false,isCrypto:true},
  {id:"ETHUSD",n:"ETH/USD",p:3200,base:3200,spread:2,locked:false,isCrypto:true},
];
const BONDS=[
  {id:"US10Y",n:"US Treasury 10Y",rat:"AAA",cou:4.5,oy:4.5,fv:1000,mat:2034},
  {id:"EU10Y",n:"EU Government 10Y",rat:"AA",cou:3.8,oy:3.8,fv:1000,mat:2034},
  {id:"SLKT-B",n:"Silk Road Tech Bond",rat:"AA",cou:5.2,oy:5.2,fv:1000,mat:2031},
  {id:"AFR5Y",n:"African Govt Bond",rat:"BB",cou:12.5,oy:12.5,fv:1000,mat:2029},
  {id:"EM10Y",n:"Emerging Mkt Bond",rat:"B",cou:14.8,oy:14.8,fv:1000,mat:2032},
  {id:"MRDB-B",n:"Meridian Bank Bond",rat:"AAA",cou:4.0,oy:4.0,fv:1000,mat:2030},
];
const RMU={AAA:1.02,AA:1.01,A:1.00,BBB:0.99,BB:0.97,B:0.94};
const gBP=b=>cl(Math.round(b.fv*(b.oy/100)/Math.max(b.cy/100,0.01)*(RMU[b.rat]||1)*100)/100,b.fv*0.05,b.fv*2.5);

// ── EVENTS ────────────────────────────────────────────────────
const EVTS=[
  {id:"rc",n:"Rate Cut",ico:"🏦",t:"mkt",prob:.04,sent:.08,dur:10,good:true,desc:"Emergency cut — stocks and bonds rally."},
  {id:"rh",n:"Rate Hike",ico:"📈",t:"mkt",prob:.04,sent:-.07,dur:8,good:false,desc:"Rate hike — equity valuations compressed."},
  {id:"geo",n:"Geopolitical Crisis",ico:"💣",t:"mkt",prob:.03,sent:-.14,dur:20,sec:["Energy","Mining"],good:false,desc:"Conflict — Energy spikes, capital flees."},
  {id:"oil",n:"Oil Supply Shock",ico:"⛽",t:"mkt",prob:.05,sent:-.05,dur:12,sec:["Energy"],good:false,desc:"OPEC cuts — oil and energy sectors spike."},
  {id:"td",n:"Trade Deal",ico:"🤝",t:"mkt",prob:.04,sent:.09,dur:12,good:true,desc:"New bilateral deal — markets rally."},
  {id:"ai",n:"AI Breakthrough",ico:"🤖",t:"mkt",prob:.03,sent:.12,dur:15,sec:["Technology"],good:true,desc:"Major AI milestone — tech sector surges."},
  {id:"pat",n:"Patent Approved",ico:"⚡",t:"co",prob:.05,imp:.28,dur:5,good:true,desc:"Key patent — stock surges 28%."},
  {id:"scn",n:"CEO Scandal",ico:"💼",t:"co",prob:.03,imp:-.25,dur:15,good:false,desc:"Misconduct — stock craters."},
  {id:"bea",n:"Earnings Beat",ico:"💰",t:"co",prob:.10,imp:.20,dur:6,good:true,desc:"Results beat consensus — reprices up."},
  {id:"mis",n:"Earnings Miss",ico:"📉",t:"co",prob:.09,imp:-.18,dur:6,good:false,desc:"Results disappoint — selling begins."},
  {id:"con",n:"Govt Contract",ico:"🏛️",t:"co",prob:.04,imp:.22,dur:35,good:true,desc:"Major contract — 35-turn revenue."},
  {id:"str",n:"Labour Strike",ico:"✊",t:"co",prob:.03,imp:-.20,dur:12,good:false,desc:"Workers out — production halts."},
  {id:"acq",n:"Acquisition Rumour",ico:"🤝",t:"co",prob:.03,imp:.15,dur:8,good:true,desc:"M&A rumour — stock premium emerges."},
  {id:"rec",n:"Product Recall",ico:"⚠️",t:"co",prob:.03,imp:-.18,dur:10,good:false,desc:"Defective product — brand damage."},
];

// ── PRICE ENGINE ──────────────────────────────────────────────
function stepStocks(cos,gdp,inf,intr,evts){
  return cos.map(c=>{
    const pp=c.price,eps=pp/c.pe;
    const macro=cl(1+(gdp/100*.35*c.b)-(inf/100*.15)-(intr/100*.15*c.b),.94,1.06);
    const noise=1+(Math.random()-.5)*.06*c.b;
    let em=0;
    evts.forEach(e=>{
      if(e.t==="mkt"&&(!e.sec||e.sec.includes(c.s)))em+=(e.sent||0)*(e.tl/e.dur)*.10;
      if(e.t==="co"&&e.tk===c.t)em+=(e.imp||0)*(e.tl/e.dur)*.10;
    });
    let np=cl(pp*noise*macro*(1+em*.3),pp*.94,pp*1.06);
    const bnd=PEB[c.s]||{mn:10,mx:40};
    if(np/eps<bnd.mn)np=eps*bnd.mn;
    if(np/eps>bnd.mx)np=eps*bnd.mx;
    np=Math.max(.50,Math.round(np*100)/100);
    return{...c,pp,price:np,pe:Math.round(np/eps*10)/10,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-50),np]};
  });
}
function stepComm(comm){
  return comm.map(c=>{
    const pp=c.p,pull=(c.base-pp)/c.base*.01;
    const d=cl(1+(Math.random()-.5)*.05+pull,.96,1.04);
    const np=cl(Math.round(pp*d*100)/100,c.base*.25,c.base*5);
    return{...c,p:np,pp,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-50),np]};
  });
}
function stepCryp(cr){
  return cr.map(c=>{
    const pp=c.p,pull=(c.base-pp)/c.base*.02;
    const d=cl(1+(Math.random()-.5)*c.vol+pull,1-c.vol*1.5,1+c.vol*1.5);
    const np=cl(Math.round(pp*d*100)/100,c.base*.20,c.base*8);
    return{...c,p:np,pp,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-50),np]};
  });
}
function stepFx(fx,cryp){
  return fx.map(f=>{
    if(f.locked)return{...f,ch:0,hist:[...(f.hist||[f.p]).slice(-50),f.p]};
    if(f.isCrypto){
      const cr=cryp.find(c=>f.id===c.id+"USD");
      if(cr)return{...f,p:cr.p,pp:f.p,ch:cr.ch,hist:[...(f.hist||[f.p]).slice(-50),cr.p]};
    }
    const pp=f.p,np=Math.round(pp*cl(1+(Math.random()-.5)*.004,.996,1.004)*10000)/10000;
    return{...f,p:np,pp,ch:(np-pp)/pp,hist:[...(f.hist||[pp]).slice(-50),np]};
  });
}
function stepEtfs(etfs,cos){
  return etfs.map(e=>{
    const pp=e.p||e.ip;
    const avgCh=cos.filter(c=>e.id==="EARTH500"||(e.id==="TECHX"&&c.s==="Technology")||(e.id==="DIVK"&&["Utilities","Telecom","Agriculture","Real Estate","Banking"].includes(c.s))||(e.id==="AFRI"&&c.r==="Africa")||(e.id==="GRNE"&&c.s==="Energy")).reduce((s,c)=>s+(c.ch||0),0)/Math.max(1,cos.filter(c=>e.id==="EARTH500"||(e.id==="TECHX"&&c.s==="Technology")||(e.id==="DIVK"&&["Utilities","Telecom","Agriculture","Real Estate","Banking"].includes(c.s))||(e.id==="AFRI"&&c.r==="Africa")||(e.id==="GRNE"&&c.s==="Energy")).length);
    const np=Math.max(0.01,Math.round(pp*(1+avgCh)*100)/100);
    return{...e,p:np,pp,ch:(np-pp)/pp,hist:[...(e.hist||[pp]).slice(-50),np]};
  });
}

// ── UI ATOMS ──────────────────────────────────────────────────
const Bdg=({v,s=11})=><span style={{background:v>=0?"#E8F5E9":"#FFEBEE",color:v>=0?G:R,padding:"2px 7px",borderRadius:20,fontSize:s,fontWeight:700,fontFamily:"monospace"}}>{pc(v)}</span>;
const SB=({l,v,c,onClick})=><div onClick={onClick} style={{background:"#f7faf7",borderRadius:9,padding:"9px 11px",flex:1,minWidth:0,cursor:onClick?"pointer":"default"}}>
  <div style={{fontSize:10,color:"#999",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{l}</div>
  <div style={{fontSize:13,fontWeight:800,color:c||DK,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div>
</div>;
const Row=({k,v,vc,b})=><div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f0f0"}}>
  <span style={{fontSize:12,color:"#666"}}>{k}</span>
  <span style={{fontSize:12,fontWeight:b?800:600,color:vc||DK,fontFamily:"monospace"}}>{v}</span>
</div>;
const MC=({hist,w=70,h=28,color})=>{
  if(!hist||hist.length<2)return null;
  const mn=Math.min(...hist)*.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;
  const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");
  const c=color||(hist[hist.length-1]>=(hist[0]||0)?G:R);
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round"/></svg>;
};
const WC=({hist})=>{
  if(!hist||hist.length<2)return null;
  const W=300,H=50,mn=Math.min(...hist)*.97,mx=Math.max(...hist)*1.03,rng=mx-mn||1;
  const line=hist.map((v,i)=>`${(i/(hist.length-1)*W).toFixed(1)},${(H-((v-mn)/rng*H)).toFixed(1)}`).join(" ");
  const fill=[...hist.map((v,i)=>`${(i/(hist.length-1)*W).toFixed(1)},${(H-((v-mn)/rng*H)).toFixed(1)}`),`${W},${H}`,`0,${H}`].join(" ");
  return <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
    <defs><linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4CAF50" stopOpacity=".35"/><stop offset="100%" stopColor="#4CAF50" stopOpacity="0"/></linearGradient></defs>
    <polygon points={fill} fill="url(#wg)"/>
    <polyline points={line} fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinejoin="round"/>
  </svg>;
};

// ── QUANTITY PICKER ───────────────────────────────────────────
function QPick({max,sel,onSel,label="units"}){
  const mx=Math.max(0,Math.floor(max));
  if(mx===0)return <div style={{color:"#aaa",fontSize:12,padding:"10px 0",marginBottom:10}}>Insufficient funds or nothing to sell</div>;
  const raw=[1,2,5,10,25,50,100,250,500,1000,5000,10000,50000,100000].filter(v=>v<=mx);
  if(!raw.includes(mx))raw.push(mx);
  const show=[...new Set(raw)].slice(-8);
  return <div style={{marginBottom:12}}>
    <div style={{fontSize:11,color:"#999",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Select quantity — Max: {mx.toLocaleString()} {label}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
      {show.map(v=><button key={v} onClick={()=>onSel(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(sel===v?G:"#e0e0e0"),background:sel===v?"#E8F5E9":"#fafafa",color:sel===v?G:"#555",fontWeight:700,fontSize:12,cursor:"pointer"}}>
        {v===mx?"MAX":v>=1000000?(v/1000000).toFixed(0)+"M":v>=1000?(v/1000).toFixed(0)+"K":v}
      </button>)}
    </div>
  </div>;
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App(){
  const[tab,setTab]=useState("dash");
  const[speed,setSpeed]=useState(5);
  const[auto,setAuto]=useState(false);
  const speedRef=useRef(5);
  useEffect(()=>{speedRef.current=speed;},[speed]);

  const S=useRef(null);
  if(!S.current){S.current={
    turn:1,cash:1000000,
    personalWallet:100000,tradingWallet:900000,
    gdp:2.5,inf:3.2,intr:4.5,gsf:12.48,
    era:"Normal",eraStart:1,cgtRate:.20,divRate:.15,txnRate:.001,
    cos:COS.map(c=>({...c,price:c.ip,pp:c.ip,ch:0,hist:[c.ip,c.ip]})),
    etfs:ETFS.map(e=>({...e,p:e.ip,pp:e.ip,ch:0,hist:[e.ip,e.ip]})),
    comm:COMM.map(c=>({...c,p:c.ip,pp:c.ip,ch:0,hist:[c.ip,c.ip]})),
    cryp:CRYP.map(c=>({...c,p:c.ip,pp:c.ip,ch:0,hist:[c.ip,c.ip]})),
    fx:FX.map(f=>({...f,pp:f.p,ch:0,hist:[f.p,f.p]})),
    bonds:BONDS.map(b=>({...b,cy:b.oy})),
    ipos:IPOS.map(i=>({...i})),
    aevts:[],
    sh:{},eh:{},bh:{},ch:{},crh:{},fxPos:{},ipoH:{},
    avgSh:{},avgCm:{},avgCr:{},avgEh:{},
    gsfDep:0,gsfTotal:0,dons:0,taxRed:0,phiBen:[],
    taxPaid:{cgt:0,div:0,txn:0,wealth:0,total:0},
    lastDiv:0,lastCoup:0,
    spinTokens:1,spinsUsed:0,lastSpin:0,
    news:[{id:1,t:1,ico:"🌐",ti:"Galactic Raider — Part A",bo:"$1M starting capital ($100K Personal + $900K Trading). All markets live. Stocks, ETFs, Bonds, Commodities, Crypto, Forex, IPOs. Wheel of Fortune unlocked. Tax era: Normal.",g:true}],
    wh:[1000000,1000000],
  };}

  const[D,setD]=useState(()=>({...S.current}));
  const[toast,setToast]=useState(null);
  const[evN,setEvN]=useState(null);
  const[selCo,setSelCo]=useState(null);
  const[selEtf,setSelEtf]=useState(null);
  const[selIpo,setSelIpo]=useState(null);
  const[trM,setTrM]=useState(null);
  const[trQ,setTrQ]=useState(null);
  const[donM,setDonM]=useState(null);
  const[donAmt,setDonAmt]=useState(null);
  const[gsfM,setGsfM]=useState(false);
  const[gsfAmt,setGsfAmt]=useState(null);
  const[wheelOpen,setWheelOpen]=useState(false);
  const[spinning,setSpinning]=useState(false);
  const[wheelResult,setWheelResult]=useState(null);
  const[wheelAngle,setWheelAngle]=useState(0);
  const[fSec,setFSec]=useState("All");
  const[fxTab,setFxTab]=useState("forex");
  const aRef=useRef(null);

  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),3000);},[]);
  const refresh=useCallback(()=>setD({...S.current}),[]);

  const advance=useCallback(()=>{
    const s=S.current;s.turn++;
    // Era rotation
    const ERAS=["Normal","High Tax","Low Tax","Capital Gains","Dividend","Transaction","Wealth Tax","Normal"];
    const eraIdx=Math.floor((s.turn-1)/60)%ERAS.length;
    const newEra=ERAS[eraIdx];
    const nn=[];
    if(newEra!==s.era){
      s.era=newEra;s.eraStart=s.turn;
      const R={Normal:{c:.20,d:.15,t:.001},"High Tax":{c:.30,d:.25,t:.0015},"Low Tax":{c:.10,d:.05,t:.0005},"Capital Gains":{c:.05,d:.15,t:.001},Dividend:{c:.20,d:.05,t:.001},Transaction:{c:.20,d:.15,t:.0001},"Wealth Tax":{c:.20,d:.15,t:.001}};
      const r=R[newEra]||R.Normal;s.cgtRate=r.c;s.divRate=r.d;s.txnRate=r.t;
      nn.push({id:Math.random(),t:s.turn,ico:"🔔",ti:"Tax Era: "+newEra,bo:"CGT "+(r.c*100).toFixed(0)+"% · Div "+(r.d*100).toFixed(0)+"% · Txn "+(r.t*100).toFixed(2)+"%",g:newEra==="Low Tax"||newEra==="Capital Gains"||newEra==="Dividend"||newEra==="Transaction"});
    }
    s.phiBen=(s.phiBen||[]).map(b=>({...b,rem:b.rem-1})).filter(b=>b.rem>0);
    s.taxRed=Math.min(.75,(s.phiBen||[]).reduce((s2,b)=>s2+b.rate,0));
    // Macro
    s.gdp=Math.round(cl(s.gdp+(Math.random()-.48)*.5,-3,7)*10)/10;
    s.inf=Math.round(cl(s.inf+(Math.random()-.5)*.3,0,12)*10)/10;
    s.intr=Math.round(cl(s.intr+(Math.random()-.5)*.2,.5,12)*10)/10;
    s.gsf=Math.round(cl(s.gsf+(Math.random()-.5)*.25,3,14)*100)/100;
    // Events
    s.aevts=s.aevts.map(e=>({...e,tl:e.tl-1})).filter(e=>e.tl>0);
    EVTS.forEach(ed=>{
      if(Math.random()<ed.prob){
        if(ed.t==="co"){const el=s.cos.filter(c=>!s.aevts.find(a=>a.id===ed.id&&a.tk===c.t));if(el.length){const tg=el[Math.floor(Math.random()*el.length)];s.aevts.push({...ed,tk:tg.t,cn:tg.n,tl:ed.dur,dur:ed.dur});nn.push({id:Math.random(),t:s.turn,ico:ed.ico,ti:ed.n+" — "+tg.n,bo:ed.desc,g:ed.good});setEvN({...ed,cn:tg.n});setTimeout(()=>setEvN(null),4000);}}
        else if(!s.aevts.find(a=>a.id===ed.id)){s.aevts.push({...ed,tl:ed.dur,dur:ed.dur});nn.push({id:Math.random(),t:s.turn,ico:ed.ico,ti:ed.n,bo:ed.desc,g:ed.good});setEvN({...ed});setTimeout(()=>setEvN(null),4000);}
      }
    });
    // Price steps
    s.cos=stepStocks(s.cos,s.gdp,s.inf,s.intr,s.aevts);
    s.comm=stepComm(s.comm);s.cryp=stepCryp(s.cryp);
    s.fx=stepFx(s.fx,s.cryp);
    s.etfs=stepEtfs(s.etfs,s.cos);
    s.bonds=s.bonds.map(b=>({...b,cy:Math.round(cl(b.cy+(Math.random()-.5)*.2,1,45)*100)/100}));
    // IPO openings
    s.ipos=s.ipos.map(i=>{if(!i.open&&s.turn>=i.turn){nn.push({id:Math.random(),t:s.turn,ico:"🚀",ti:"IPO OPEN: "+i.n,bo:i.n+" ("+i.id+") is now trading at $"+i.ip+"/share. "+i.desc,g:true});return{...i,open:true};}return i;});
    // GSF daily return
    if(s.gsfDep>0){const ret=Math.round(s.gsfDep*(s.gsf/100/365)*100)/100;s.cash=Math.round((s.cash+ret)*100)/100;s.gsfTotal=Math.round(((s.gsfTotal||0)+ret)*100)/100;}
    // Dividends every 10 turns
    if(s.turn%10===0){
      let div=0;
      Object.entries(s.sh).forEach(([t,n])=>{const c=s.cos.find(x=>x.t===t);if(c&&n>0){const g=c.price*(c.div/100/4)*n;const tax=Math.round(g*(s.divRate||.15)*(1-(s.taxRed||0))*100)/100;div+=g-tax;if(s.taxPaid)s.taxPaid.div+=tax;}});
      Object.entries(s.eh||{}).forEach(([id,n])=>{const e=s.etfs.find(x=>x.id===id);if(e&&n>0){const g=e.p*(e.div/100/4)*n;const tax=Math.round(g*(s.divRate||.15)*(1-(s.taxRed||0))*100)/100;div+=g-tax;if(s.taxPaid)s.taxPaid.div+=tax;}});
      if(div>0){s.cash=Math.round((s.cash+div)*100)/100;s.lastDiv=div;nn.push({id:Math.random(),t:s.turn,ico:"💰",ti:"Dividends: "+fm(div),bo:"Quarterly payment (annual yield ÷ 4) after "+((s.divRate||.15)*100).toFixed(0)+"% withholding tax.",g:true});}
      let coup=0;
      Object.entries(s.bh||{}).forEach(([id,q])=>{const b=s.bonds.find(x=>x.id===id);if(b&&q>0){const g=b.fv*(b.cou/100/4)*q;const tax=Math.round(g*.25*(1-(s.taxRed||0))*100)/100;coup+=g-tax;}});
      if(coup>0){s.cash=Math.round((s.cash+coup)*100)/100;s.lastCoup=coup;nn.push({id:Math.random(),t:s.turn,ico:"📋",ti:"Bond Coupons: "+fm(coup),bo:"Quarterly coupon after 25% bond interest tax.",g:true});}
    }
    // Wealth tax
    const sv=Object.entries(s.sh||{}).reduce((sum,[t,n])=>{const c=s.cos.find(x=>x.t===t);return sum+(c?c.price*n:0);},0);
    const bv=Object.entries(s.bh||{}).reduce((sum,[id,q])=>{const b=s.bonds.find(x=>x.id===id);return sum+(b?gBP(b)*q:0);},0);
    const nwNow=s.cash+sv+bv+(s.gsfDep||0);
    if(nwNow>10e9){const wt=Math.round((nwNow-10e9)*.001*(1-(s.taxRed||0))*100)/100;s.cash=Math.max(0,s.cash-wt);if(s.taxPaid)s.taxPaid.wealth+=wt;}
    // Bankruptcy warnings
    if(nwNow<100000&&nwNow>=0)nn.push({id:Math.random(),t:s.turn,ico:"⚠️",ti:"Low Net Worth Warning",bo:"Your net worth is below $100K. Consider reducing risk.",g:false});
    if(nwNow<0)nn.push({id:Math.random(),t:s.turn,ico:"🚨",ti:"NEGATIVE NET WORTH",bo:"Net worth is negative. Forced liquidation begins. Cannot open new positions.",g:false});
    if(nwNow<-500000)nn.push({id:Math.random(),t:s.turn,ico:"💀",ti:"BANKRUPTCY",bo:"Net worth below -$500K. Game over — restart in Settings.",g:false});
    // Milestones
    if([100,300,500,1000].includes(s.turn))nn.push({id:Math.random(),t:s.turn,ico:"🏁",ti:"Milestone: Turn "+s.turn,bo:{100:"M1 — Governor stable.",300:"M2 — Solar window opens.",500:"M3 — Full DEE running.",1000:"M4 — LAUNCH GATE."}[s.turn],g:true});
    s.wh=[...s.wh.slice(-60),nwNow];
    s.news=[...nn.reverse(),...s.news].slice(0,100);
    refresh();
  },[refresh]);

  useEffect(()=>{
    if(!auto){clearInterval(aRef.current);return;}
    clearInterval(aRef.current);
    aRef.current=setInterval(()=>advance(),speedRef.current*1000);
    return()=>clearInterval(aRef.current);
  },[auto,speed,advance]);

  // ── COMPUTED ─────────────────────────────────────────────────
  const d=D;
  const SH=d.sh||{},BH=d.bh||{},CH=d.ch||{},CRH=d.crh||{},EH=d.eh||{};
  const sv=Object.entries(SH).reduce((s,[t,n])=>{const c=d.cos.find(x=>x.t===t);return s+(c?c.price*n:0);},0);
  const ev=Object.entries(EH).reduce((s,[id,n])=>{const e=d.etfs.find(x=>x.id===id);return s+(e?e.p*n:0);},0);
  const bv=Object.entries(BH).reduce((s,[id,q])=>{const b=d.bonds.find(x=>x.id===id);return s+(b?gBP(b)*q:0);},0);
  const cv=Object.entries(CH).reduce((s,[id,q])=>{const c=d.comm.find(x=>x.id===id);return s+(c?c.p*q:0);},0);
  const crv=Object.entries(CRH).reduce((s,[id,q])=>{const c=d.cryp.find(x=>x.id===id);return s+(c?c.p*q:0);},0);
  const ipoV=Object.entries(d.ipoH||{}).reduce((s,[id,q])=>{const i=d.ipos.find(x=>x.id===id);return s+(i?i.ip*q:0);},0);
  const nw=d.cash+sv+ev+bv+cv+crv+ipoV+(d.gsfDep||0);
  const pnw=d.wh[d.wh.length-2]||1000000;

  // ── TRADE ENGINE ─────────────────────────────────────────────
  const trade=(type,item,mode,qty)=>{
    const s=S.current,isBuy=mode==="buy",q=Math.floor(qty);
    if(q<1)return;
    const txnRate=s.txnRate||.001;
    if(type==="stock"){
      const price=item.price;
      if(isBuy){
        const txnT=Math.round(q*price*txnRate*100)/100;
        const cost=Math.round(q*price*100)/100+txnT;
        if(cost>s.cash){toast_("Need "+fm(cost)+" — only "+fm(s.cash)+" available",false);return;}
        const prev=s.sh[item.t]||0;
        s.sh[item.t]=(prev)+q;
        s.avgSh[item.t]=Math.round(((s.avgSh[item.t]||price)*prev+q*price)/s.sh[item.t]*100)/100;
        s.cash=Math.round((s.cash-cost)*100)/100;
        s.taxPaid.txn+=txnT;s.taxPaid.total+=txnT;
        toast_("✅ Bought "+q.toLocaleString()+" "+item.t+" @ "+fm(price));
      }else{
        const held=s.sh[item.t]||0;if(q>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(q*price*100)/100;
        const profit=Math.max(0,(price-(s.avgSh[item.t]||price))*q);
        const cgt=Math.round(profit*(s.cgtRate||.20)*(1-(s.taxRed||0))*100)/100;
        const txnT=Math.round(proc*txnRate*100)/100;
        s.cash=Math.round((s.cash+proc-cgt-txnT)*100)/100;
        s.sh[item.t]=held-q;if(s.sh[item.t]<=0)delete s.sh[item.t];
        s.taxPaid.cgt+=cgt;s.taxPaid.txn+=txnT;s.taxPaid.total+=cgt+txnT;
        toast_("✅ Sold "+q.toLocaleString()+" "+item.t+" · Net: "+fm(proc-cgt-txnT));
      }
    }else if(type==="etf"){
      const price=item.p;
      if(isBuy){
        const cost=Math.round(q*price*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        const prev=s.eh[item.id]||0;
        s.eh[item.id]=(prev)+q;
        s.avgEh[item.id]=Math.round(((s.avgEh[item.id]||price)*prev+q*price)/s.eh[item.id]*100)/100;
        s.cash=Math.round((s.cash-cost)*100)/100;
        toast_("✅ Bought "+q.toLocaleString()+" units of "+item.n);
      }else{
        const held=s.eh[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(q*price*100)/100;
        const profit=Math.max(0,(price-(s.avgEh[item.id]||price))*q);
        const cgt=Math.round(profit*(s.cgtRate||.20)*(1-(s.taxRed||0))*100)/100;
        s.cash=Math.round((s.cash+proc-cgt)*100)/100;
        s.eh[item.id]=held-q;if(s.eh[item.id]<=0)delete s.eh[item.id];
        toast_("✅ Sold "+q+" ETF units · Net: "+fm(proc-cgt));
      }
    }else if(type==="comm"){
      const price=item.p;
      if(isBuy){
        const cost=Math.round(q*price*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.ch[item.id]=(s.ch[item.id]||0)+q;
        s.avgCm[item.id]=price;
        s.cash=Math.round((s.cash-cost)*100)/100;
        toast_("✅ Bought "+q.toLocaleString()+" "+item.u+" of "+item.n);
      }else{
        const held=s.ch[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(q*price*100)/100;
        const profit=Math.max(0,(price-(s.avgCm[item.id]||price))*q);
        const cgt=Math.round(profit*(s.cgtRate||.20)*(1-(s.taxRed||0))*100)/100;
        s.cash=Math.round((s.cash+proc-cgt)*100)/100;
        s.ch[item.id]=held-q;if((s.ch[item.id]||0)<=0)delete s.ch[item.id];
        toast_("✅ Sold "+q+" "+item.u+"s · Net: "+fm(proc-cgt));
      }
    }else if(type==="cryp"){
      const price=item.p;
      if(isBuy){
        const cost=Math.round(q*price*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.crh[item.id]=(s.crh[item.id]||0)+q;
        s.avgCr[item.id]=price;
        s.cash=Math.round((s.cash-cost)*100)/100;
        toast_("✅ Bought "+q+" "+item.id+" @ "+fm(price));
      }else{
        const held=s.crh[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(q*price*100)/100;
        const profit=Math.max(0,(price-(s.avgCr[item.id]||price))*q);
        const cgt=Math.round(profit*(s.cgtRate||.20)*(1-(s.taxRed||0))*100)/100;
        s.cash=Math.round((s.cash+proc-cgt)*100)/100;
        s.crh[item.id]=held-q;if((s.crh[item.id]||0)<=0)delete s.crh[item.id];
        toast_("✅ Sold "+q+" "+item.id+" · Net: "+fm(proc-cgt));
      }
    }else if(type==="bond"){
      const pr=gBP(item);
      if(isBuy){
        const cost=Math.round(pr*q*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.bh[item.id]=(s.bh[item.id]||0)+q;
        s.cash=Math.round((s.cash-cost)*100)/100;
        toast_("✅ Bought "+q+"× "+item.n+" @ "+fm(pr));
      }else{
        const held=s.bh[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}
        s.cash=Math.round((s.cash+pr*q)*100)/100;
        s.bh[item.id]=held-q;if((s.bh[item.id]||0)<=0)delete s.bh[item.id];
        toast_("✅ Sold "+q+"× bonds: "+fm(pr*q));
      }
    }else if(type==="ipo"){
      if(isBuy){
        const cost=Math.round(q*item.ip*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.ipoH[item.id]=(s.ipoH[item.id]||0)+q;
        s.cash=Math.round((s.cash-cost)*100)/100;
        toast_("🚀 Subscribed "+q.toLocaleString()+" shares of "+item.n+" @ "+fm(item.ip));
      }
    }
    setTrM(null);setTrQ(null);refresh();
  };

  // ── WHEEL OF FORTUNE ─────────────────────────────────────────
  const spinWheel=()=>{
    const s=S.current;
    if(s.spinTokens<=0){toast_("No spin tokens — earn through philanthropy",false);return;}
    if(s.spinsUsed>=5){toast_("Max 5 lifetime spins reached",false);return;}
    if(s.turn-s.lastSpin<1000&&s.lastSpin>0){toast_("Next spin in "+(1000-(s.turn-s.lastSpin))+" turns",false);return;}
    const debt=0;
    if(debt<100000){toast_("Need at least $100K debt to spin",false);return;}
    setSpinning(true);setWheelResult(null);
    const outcomes=[{label:"5% Debt Relief",prob:.30,pct:5},{label:"10% Debt Relief",prob:.20,pct:10},{label:"15% Debt Relief",prob:.15,pct:15},{label:"25% Debt Relief",prob:.10,pct:25},{label:"50% Debt Relief",prob:.10,pct:50},{label:"+100 Points",prob:.15,pct:0}];
    const r=Math.random();let cum=0,chosen=outcomes[0];
    for(const o of outcomes){cum+=o.prob;if(r<=cum){chosen=o;break;}}
    const spins=360*3+Math.random()*360;
    setWheelAngle(a=>a+spins);
    setTimeout(()=>{
      setSpinning(false);setWheelResult(chosen);
      s.spinTokens--;s.spinsUsed++;s.lastSpin=s.turn;
      if(chosen.pct>0){
        s.news.unshift({id:Math.random(),t:s.turn,ico:"🎰",ti:"Wheel of Fortune: "+chosen.label,bo:"Congratulations! "+chosen.pct+"% debt relief applied.",g:true});
        toast_("🎰 "+chosen.label+" won!");
      }else{
        s.news.unshift({id:Math.random(),t:s.turn,ico:"🎰",ti:"Wheel: No relief but +100 points",bo:"Better luck next time. Earned 100 bonus points.",g:false});
        toast_("🎰 No relief this time. +100 points");
      }
      refresh();
    },3000);
  };

  // ── TABS ─────────────────────────────────────────────────────
  const TABS=[
    {id:"dash",ico:"🏠",l:"Home"},{id:"mkt",ico:"📊",l:"Stocks"},
    {id:"etf",ico:"📦",l:"ETFs"},{id:"ipo",ico:"🚀",l:"IPO"},
    {id:"bonds",ico:"📋",l:"Bonds"},{id:"comm",ico:"⛽",l:"Commod."},
    {id:"fxcr",ico:"💱",l:"FX/Crypto"},{id:"port",ico:"💼",l:"Port."},
    {id:"gsf",ico:"🏛️",l:"GSF"},{id:"ph",ico:"❤️",l:"Give"},
    {id:"wof",ico:"🎰",l:"Wheel"},{id:"news",ico:"📰",l:"News"},
  ];
  const ts=id=>({padding:"5px 0 4px",flex:1,border:"none",background:tab===id?"#fff":"transparent",borderRadius:tab===id?7:0,color:tab===id?G:"#aaa",fontWeight:700,fontSize:8,cursor:"pointer",textAlign:"center",boxShadow:tab===id?"0 1px 4px rgba(0,0,0,.12)":"none",minWidth:0,fontFamily:"system-ui,sans-serif"});

  // ── TRADE MODAL ───────────────────────────────────────────────
  const TrModal=(()=>{
    if(!trM)return null;
    const{type,item,mode}=trM,isBuy=mode==="buy";
    let price=0,unit="",maxQty=0,held=0;
    if(type==="stock"){price=item.price;unit="shares";held=SH[item.t]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
    else if(type==="etf"){price=item.p;unit="units";held=EH[item.id]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
    else if(type==="comm"){price=item.p;unit=item.u;held=CH[item.id]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
    else if(type==="cryp"){price=item.p;unit=item.u;held=CRH[item.id]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
    else if(type==="bond"){price=gBP(item);unit="bonds";held=BH[item.id]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
    else if(type==="ipo"){price=item.ip;unit="shares";maxQty=Math.min(item.maxBuy,Math.floor(d.cash/price));}
    const qty=Math.floor(trQ||0),total=Math.round(qty*price*100)/100;
    const avgC=type==="stock"?(d.avgSh?.[item.t]||price):type==="etf"?(d.avgEh?.[item.id]||price):type==="comm"?(d.avgCm?.[item.id]||price):type==="cryp"?(d.avgCr?.[item.id]||price):price;
    const profit=!isBuy?Math.max(0,(price-avgC)*qty):0;
    const cgt=!isBuy?Math.round(profit*(d.cgtRate||.20)*(1-(d.taxRed||0))*100)/100:0;
    const txnT=type==="stock"?Math.round(total*(d.txnRate||.001)*100)/100:0;
    const net=isBuy?total+txnT:total-cgt-txnT;
    return <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{width:38,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 16px"}}/>
      <div style={{background:isBuy?"linear-gradient(135deg,#1B5E20,#388E3C)":"linear-gradient(135deg,#7B1515,#C62828)",borderRadius:14,padding:16,color:"#fff",marginBottom:16}}>
        <div style={{fontSize:10,opacity:.7,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{isBuy?"BUY":"SELL"} · {type.toUpperCase()}</div>
        <div style={{fontSize:19,fontWeight:800}}>{item.n||item.id}</div>
        <div style={{fontSize:13,opacity:.85,marginTop:4}}>{fm(price)} per {unit} · {isBuy?fm(d.cash)+" available":held.toLocaleString()+" held"}</div>
      </div>
      <div style={{display:"flex",background:"#f0f4f0",borderRadius:10,padding:4,gap:3,marginBottom:16}}>
        {["buy","sell"].map(m=><button key={m} onClick={()=>{setTrM({...trM,mode:m});setTrQ(null);}} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",background:mode===m?"#fff":"transparent",color:mode===m?G:"#999",fontWeight:700,fontSize:13,cursor:"pointer",boxShadow:mode===m?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{m==="buy"?"Buy":"Sell"}</button>)}
      </div>
      <QPick max={maxQty} sel={trQ} onSel={setTrQ} label={unit}/>
      {qty>0&&<div style={{background:"#f7faf7",borderRadius:11,padding:14,marginBottom:14}}>
        <Row k="Quantity" v={qty.toLocaleString()+" "+unit}/>
        <Row k={isBuy?"Gross Cost":"Gross Proceeds"} v={fm(total)}/>
        {!isBuy&&profit>0&&<Row k={"Capital Gains Tax ("+(((d.cgtRate||.20)*100)).toFixed(0)+"% on profit)"} v={"-"+fm(cgt)} vc={R}/>}
        {isBuy&&txnT>0&&<Row k={"Transaction Tax ("+(((d.txnRate||.001)*100)).toFixed(2)+"% )"} v={"-"+fm(txnT)} vc={R}/>}
        <Row k={"Net "+(isBuy?"Cost":"Proceeds")} v={fm(net)} vc={isBuy?R:G} b/>
      </div>}
      <button onClick={()=>trade(type,item,mode,qty)} disabled={qty<1} style={{width:"100%",background:qty>=1?(isBuy?G:R):"#e0e0e0",color:"#fff",border:"none",borderRadius:12,padding:15,fontWeight:800,fontSize:15,cursor:qty>=1?"pointer":"not-allowed"}}>
        {qty>=1?"Confirm "+(isBuy?"Buy":"Sell")+" "+qty.toLocaleString()+" "+unit+" = "+fm(net):"Select quantity above"}
      </button>
    </div>;
  })();

  // ── SCREENS ───────────────────────────────────────────────────

  const S_Dash=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:18,padding:20,color:"#fff",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,background:"rgba(255,255,255,.05)",borderRadius:"50%"}}/>
      <div style={{fontSize:11,opacity:.65,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Total Net Worth</div>
      <div style={{fontSize:36,fontWeight:800,fontFamily:"monospace",lineHeight:1,marginBottom:5}}>{fm(nw)}</div>
      <div style={{fontSize:12,opacity:.9,marginBottom:12}}>{nw>=pnw?"📈":"📉"} {fm(Math.abs(nw-pnw))} ({nw>=pnw?"+":""}{pnw>0?((( nw-pnw)/pnw)*100).toFixed(2):0}%) last turn</div>
      <div style={{height:50}}><WC hist={d.wh}/></div>
      <div style={{display:"flex",gap:6,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.2)"}}>
        {[["Cash",fm(d.cash)],["Stocks",fm(sv)],["ETFs",fm(ev)],["Bonds",fm(bv)],["Comm",fm(cv)],["GSF",fm(d.gsfDep||0)]].map(([k,v])=><div key={k} onClick={()=>setTab(k==="Stocks"?"mkt":k==="ETFs"?"etf":k==="Bonds"?"bonds":k==="Comm"?"comm":k==="GSF"?"gsf":"port")} style={{flex:1,textAlign:"center",cursor:"pointer"}}><div style={{fontSize:8,opacity:.5,textTransform:"uppercase"}}>{k}</div><div style={{fontSize:10,fontWeight:700,fontFamily:"monospace",marginTop:2}}>{v}</div></div>)}
      </div>
    </div>
    <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:16,fontWeight:800,color:DK}}>Turn {d.turn}</span>
        <div style={{display:"flex",gap:4}}>
          {[1,5,10,30,60].map(s=><button key={s} onClick={()=>setSpeed(s)} style={{padding:"4px 8px",borderRadius:20,border:"1.5px solid "+(speed===s?G:"#ddd"),background:speed===s?G:"#fff",color:speed===s?"#fff":"#666",fontWeight:600,fontSize:10,cursor:"pointer"}}>{s<60?s+"s":"1m"}</button>)}
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={advance} disabled={auto} style={{flex:3,background:auto?"#e8e8e8":G,color:auto?"#aaa":"#fff",border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,fontSize:14,cursor:auto?"not-allowed":"pointer"}}>▶ Next Turn</button>
        <button onClick={()=>setAuto(a=>!a)} style={{flex:2,background:auto?"#B71C1C":"#f0f4f0",color:auto?"#fff":"#555",border:"1px solid #ddd",borderRadius:10,padding:"13px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>{auto?"⏹ Stop":"Auto "+speed+"s"}</button>
      </div>
    </div>
    <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div><div style={{fontSize:14,fontWeight:800,color:DK}}>🔔 Tax Era: {d.era||"Normal"}</div><div style={{fontSize:11,color:"#aaa"}}>{Math.max(0,60-((d.turn-(d.eraStart||1))%60))} turns until next era</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:G}}>CGT {(((d.cgtRate||.20)*100)).toFixed(0)}%</div><div style={{fontSize:11,color:"#aaa"}}>Div {(((d.divRate||.15)*100)).toFixed(0)}% · Txn {(((d.txnRate||.001)*100)).toFixed(2)}%</div></div>
      </div>
      <div style={{height:5,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:(((d.turn-(d.eraStart||1))%60)/60*100).toFixed(0)+"%",background:"linear-gradient(90deg,"+BL+",#42A5F5)",borderRadius:3}}/></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {[{l:"GDP",v:(d.gdp>=0?"+":"")+d.gdp+"%",c:d.gdp>=0?G:R,tab:null},{l:"Inflation",v:d.inf+"%",c:d.inf>6?R:d.inf>3?AU:G,tab:null},{l:"GSF Rate",v:(d.gsf||12.48).toFixed(2)+"%",c:G,tab:"gsf"},{l:"Net Worth",v:fm(nw),c:G,tab:"port"}].map(x=><div key={x.l} onClick={x.tab?()=>setTab(x.tab):undefined} style={{background:"#fff",borderRadius:11,padding:"11px 13px",border:"1px solid #eee",cursor:x.tab?"pointer":"default"}}>
        <div style={{fontSize:10,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>{x.l}</div>
        <div style={{fontSize:20,fontWeight:800,color:x.c,fontFamily:"monospace"}}>{x.v}</div>
      </div>)}
    </div>
    {(d.lastDiv||0)>0&&<div onClick={()=>setTab("port")} style={{background:"#E8F5E9",borderRadius:13,padding:13,border:"1px solid #A5D6A7",cursor:"pointer"}}>
      <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8}}>💰 Last Dividend Payment</div>
      <div style={{display:"flex",gap:8}}><SB l="Stock Dividends" v={fm(d.lastDiv||0)} c={G}/><SB l="Bond Coupons" v={fm(d.lastCoup||0)} c={G}/><SB l="Total" v={fm((d.lastDiv||0)+(d.lastCoup||0))} c={G}/></div>
    </div>}
    {d.aevts.length>0&&<div><div style={{fontSize:11,fontWeight:700,color:"#999",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Active Events ({d.aevts.length})</div>
      {d.aevts.slice(0,3).map((e,i)=><div key={i} style={{background:e.good?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:"10px 13px",border:"1px solid "+(e.good?"#A5D6A7":"#EF9A9A"),display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
        <span style={{fontSize:18}}>{e.ico}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:e.good?G:R}}>{e.n}{e.cn?" — "+e.cn:""}</div><div style={{fontSize:11,color:"#888"}}>{e.tl}/{e.dur} turns</div></div>
      </div>)}
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
      {[{l:"📊 Stocks",t:"mkt"},{l:"📦 ETFs",t:"etf"},{l:"🚀 IPOs",t:"ipo"},{l:"📋 Bonds",t:"bonds"},{l:"⛽ Commod.",t:"comm"},{l:"💱 FX/Crypto",t:"fxcr"},{l:"💼 Portfolio",t:"port"},{l:"🏛️ GSF",t:"gsf"},{l:"🎰 Wheel",t:"wof"}].map(x=><button key={x.t} onClick={()=>setTab(x.t)} style={{background:"#fff",borderRadius:11,padding:"12px 8px",border:"1px solid #e8ebe8",fontWeight:700,fontSize:12,color:DK,cursor:"pointer",textAlign:"center"}}>{x.l}</button>)}
    </div>
  </div>;

  const S_Mkt=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{overflowX:"auto"}}><div style={{display:"flex",gap:6,paddingBottom:4,width:"max-content"}}>
      {["All",...new Set(COS.map(c=>c.s))].map(s=><button key={s} onClick={()=>setFSec(s)} style={{padding:"6px 12px",borderRadius:20,border:"1.5px solid "+(fSec===s?G:"#ddd"),background:fSec===s?G:"#fff",color:fSec===s?"#fff":"#666",fontWeight:600,fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>{s}</button>)}
    </div></div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.cos.filter(c=>fSec==="All"||c.s===fSec).map((c,i,arr)=><div key={c.t} onClick={()=>setSelCo({...c})} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none",cursor:"pointer",background:selCo?.t===c.t?"#f0f8f0":"#fff"}}>
        <div style={{width:40,height:40,borderRadius:10,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0,letterSpacing:-.5}}>{c.t}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:600,color:DK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.n}</div>
          <div style={{fontSize:11,color:"#aaa"}}>{c.s} · P/E {c.pe.toFixed(1)}× · {(SH[c.t]||0)>0&&<span style={{color:G,fontWeight:700}}>Held: {(SH[c.t]||0).toLocaleString()}</span>}</div>
        </div>
        <MC hist={c.hist} w={70} h={28}/>
        <div style={{textAlign:"right",minWidth:72}}><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace"}}>{fm(c.price)}</div><Bdg v={c.ch}/></div>
      </div>)}
    </div>
    {selCo&&<div style={{background:"#fff",borderRadius:14,padding:14,border:"2px solid "+G}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div><div style={{fontSize:16,fontWeight:800,color:DK}}>{selCo.n} ({selCo.t})</div><div style={{fontSize:11,color:"#aaa"}}>{selCo.hq} · {selCo.yr} · {(selCo.emp/1000).toFixed(0)}K employees</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:800,fontFamily:"monospace",color:selCo.ch>=0?G:R}}>{fm(selCo.price)}</div><Bdg v={selCo.ch||0}/></div>
      </div>
      <div style={{fontSize:12,color:"#555",lineHeight:1.6,marginBottom:10,background:"#f8fbf8",borderRadius:9,padding:10}}>{selCo.desc}</div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        <SB l="P/E Ratio" v={selCo.pe.toFixed(1)+"×"}/><SB l="Div Yield" v={selCo.div+"%"} c={G}/><SB l="Beta" v={selCo.b+"×"}/><SB l="CEO Rep." v={(selCo.ceoRep||75)+"/100"}/>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        <SB l="Health Score" v={(selCo.health||80)+"/100"} c={G}/><SB l="Your Shares" v={(SH[selCo.t]||0).toLocaleString()} c={G}/><SB l="Value" v={fm((SH[selCo.t]||0)*selCo.price)} c={G}/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{setTrM({type:"stock",item:selCo,mode:"buy"});setTrQ(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:10,padding:13,fontWeight:800,fontSize:14,cursor:"pointer"}}>📈 Buy</button>
        {(SH[selCo.t]||0)>0&&<button onClick={()=>{setTrM({type:"stock",item:selCo,mode:"sell"});setTrQ(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1.5px solid #EF9A9A",borderRadius:10,padding:13,fontWeight:800,fontSize:14,cursor:"pointer"}}>📉 Sell ({(SH[selCo.t]||0).toLocaleString()})</button>}
        <button onClick={()=>setSelCo(null)} style={{width:44,background:"#f0f0f0",color:"#666",border:"none",borderRadius:10,fontWeight:700,fontSize:16,cursor:"pointer"}}>×</button>
      </div>
    </div>}
  </div>;

  const S_ETF=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"#E3F2FD",borderRadius:11,padding:12,border:"1px solid #BBDEFB",fontSize:12,color:BL}}>ETFs track baskets of companies. Lower risk than individual stocks. Dividends paid quarterly. Click any ETF to trade.</div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.etfs.map((e,i)=><div key={e.id} onClick={()=>setSelEtf(selEtf?.id===e.id?null:{...e})} style={{padding:"13px 14px",borderBottom:i<d.etfs.length-1?"1px solid #f5f5f5":"none",cursor:"pointer",background:selEtf?.id===e.id?"#f0f8f0":"#fff"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <div style={{width:40,height:40,borderRadius:10,background:"#E3F2FD",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:BL,border:"1px solid #BBDEFB",flexShrink:0}}>{e.id}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:DK}}>{e.n}</div><div style={{fontSize:11,color:"#aaa"}}>{e.cat} · {e.holdings} holdings · {(EH[e.id]||0)>0&&<span style={{color:G,fontWeight:700}}>Held: {(EH[e.id]||0)}</span>}</div></div>
          <MC hist={e.hist} w={70} h={28}/>
          <div style={{textAlign:"right",minWidth:72}}><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace"}}>{fm(e.p||e.ip)}</div><Bdg v={e.ch||0}/></div>
        </div>
        {selEtf?.id===e.id&&<div style={{marginTop:8}}>
          <div style={{fontSize:12,color:"#555",lineHeight:1.6,marginBottom:10,background:"#f8fbf8",borderRadius:9,padding:10}}>{e.desc}</div>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            <SB l="AUM" v={fm(e.aum*1e9)}/><SB l="Div Yield" v={e.div+"%"} c={G}/><SB l="Expense Ratio" v={e.exp+"%"}/><SB l="Beta" v={e.beta+"×"}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={e2=>{e2.stopPropagation();setTrM({type:"etf",item:e,mode:"buy"});setTrQ(null);}} style={{flex:1,background:BL,color:"#fff",border:"none",borderRadius:10,padding:12,fontWeight:800,fontSize:13,cursor:"pointer"}}>📦 Buy Units</button>
            {(EH[e.id]||0)>0&&<button onClick={e2=>{e2.stopPropagation();setTrM({type:"etf",item:e,mode:"sell"});setTrQ(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1.5px solid #EF9A9A",borderRadius:10,padding:12,fontWeight:800,fontSize:13,cursor:"pointer"}}>Sell ({EH[e.id]})</button>}
          </div>
        </div>}
      </div>)}
    </div>
  </div>;

  const S_IPO=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"linear-gradient(135deg,#4A148C,#7B1FA2)",borderRadius:14,padding:14,color:"#fff"}}>
      <div style={{fontSize:10,opacity:.7,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🚀 IPO Market</div>
      <div style={{fontSize:17,fontWeight:800,marginBottom:3}}>Initial Public Offerings</div>
      <div style={{fontSize:12,opacity:.85}}>Subscribe before listing. High risk, high reward. Early investors get ground-floor prices. Green = currently open.</div>
    </div>
    {d.ipos.map((ipo,i)=><div key={ipo.id} onClick={()=>setSelIpo(selIpo?.id===ipo.id?null:{...ipo})} style={{background:"#fff",borderRadius:14,padding:14,border:"2px solid "+(ipo.open?"#4A148C":"#e8ebe8"),cursor:"pointer",opacity:ipo.open?1:0.7}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
            <div style={{fontSize:15,fontWeight:800,color:DK}}>{ipo.n}</div>
            {ipo.open?<span style={{background:"#4A148C",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:20}}>OPEN</span>:<span style={{background:"#f0f0f0",color:"#888",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:20}}>Opens T{ipo.turn}</span>}
          </div>
          <div style={{fontSize:11,color:"#aaa"}}>{ipo.id} · {ipo.s} · Underwriter: {ipo.underwriter}</div>
        </div>
        <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:800,fontFamily:"monospace",color:PU}}>{fm(ipo.ip)}</div><div style={{fontSize:11,color:"#aaa"}}>per share</div></div>
      </div>
      {selIpo?.id===ipo.id&&<div>
        <div style={{fontSize:12,color:"#555",lineHeight:1.6,marginBottom:10,background:"#f8fbf8",borderRadius:9,padding:10}}>{ipo.desc}</div>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          <SB l="Shares Offered" v={(ipo.shares/1e6).toFixed(0)+"M"}/><SB l="Funds Raised" v={fm(ipo.raised*1e9)}/><SB l="Min Buy" v={ipo.minBuy.toLocaleString()}/><SB l="Max Buy" v={(ipo.maxBuy/1000).toFixed(0)+"K"}/>
        </div>
        {(d.ipoH?.[ipo.id]||0)>0&&<div style={{background:"#E8F5E9",borderRadius:9,padding:10,marginBottom:10,fontSize:12,color:G,fontWeight:600}}>You hold {(d.ipoH?.[ipo.id]||0).toLocaleString()} shares · Value: {fm((d.ipoH?.[ipo.id]||0)*ipo.ip)}</div>}
        {ipo.open?<button onClick={e=>{e.stopPropagation();setTrM({type:"ipo",item:ipo,mode:"buy"});setTrQ(null);}} style={{width:"100%",background:PU,color:"#fff",border:"none",borderRadius:10,padding:13,fontWeight:800,fontSize:14,cursor:"pointer"}}>🚀 Subscribe to IPO</button>
        :<div style={{background:"#FFF8E1",borderRadius:9,padding:10,fontSize:12,color:"#E65100",textAlign:"center"}}>Opens at Turn {ipo.turn} — {Math.max(0,ipo.turn-d.turn)} turns remaining</div>}
      </div>}
    </div>)}
  </div>;

  const S_Bonds=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"#E3F2FD",borderRadius:11,padding:12,border:"1px solid #BBDEFB",fontSize:12,color:BL}}>Bond price = FV × (OrigYield ÷ CurrYield) × RatingMult. Coupons paid quarterly. Higher yield = higher risk. Click to trade.</div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.bonds.map((b,i)=>{const pr=gBP(b),held=BH[b.id]||0;return <div key={b.id} style={{padding:"13px 14px",borderBottom:i<d.bonds.length-1?"1px solid #f5f5f5":"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <div><div style={{fontSize:13,fontWeight:700,color:DK}}>{b.n}</div><div style={{fontSize:11,color:"#aaa"}}>{b.id} · {b.mat} · <span style={{fontWeight:700,color:b.rat==="AAA"||b.rat==="AA"?G:b.rat==="BB"||b.rat==="B"?R:AU}}>{b.rat}</span>{held>0&&<span style={{color:G,fontWeight:700}}> · Held: {held}</span>}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,fontFamily:"monospace",color:pr>b.fv?G:R}}>{fm(pr)}</div><div style={{fontSize:11,color:"#aaa"}}>{b.cy.toFixed(2)}% yield</div></div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          <SB l="Coupon" v={b.cou+"%"} c={G}/><SB l="Orig Yield" v={b.oy+"%"}/><SB l="Curr Yield" v={b.cy.toFixed(1)+"%"} c={b.cy<b.oy?G:R}/><SB l="Held" v={held} c={held>0?G:"#aaa"}/>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[1,5,10,50].map(q=><button key={q} onClick={()=>trade("bond",b,"buy",q)} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Buy {q}</button>)}
          {held>0&&<button onClick={()=>trade("bond",b,"sell",held)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell All</button>}
        </div>
      </div>;})}
    </div>
  </div>;

  const S_Comm=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"#FFF8E1",borderRadius:11,padding:12,border:"1px solid #FFE082",fontSize:12,color:"#E65100"}}>Commodities · ±4%/turn · Mean-reversion prevents collapse · Max 5× base · CGT on profit only · Click to trade</div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.comm.map((c,i)=>{const held=CH[c.id]||0;return <div key={c.id} style={{padding:"13px 14px",borderBottom:i<d.comm.length-1?"1px solid #f5f5f5":"none"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
          <div><div style={{fontSize:13,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:11,color:"#aaa"}}>{c.id} · per {c.u} · {c.cat}{held>0&&<span style={{color:G,fontWeight:700}}> · Held: {held.toLocaleString()}</span>}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,fontFamily:"monospace",color:(c.ch||0)>=0?G:R}}>{fm(c.p)}</div><Bdg v={c.ch||0}/></div>
        </div>
        <div style={{height:26,marginBottom:8}}><MC hist={c.hist} w={240} h={26}/></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setTrM({type:"comm",item:c,mode:"buy"});setTrQ(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Buy</button>
          {held>0&&<button onClick={()=>{setTrM({type:"comm",item:c,mode:"sell"});setTrQ(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell Max ({held.toLocaleString()})</button>}
        </div>
      </div>;})}
    </div>
  </div>;

  const S_FxCr=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{display:"flex",background:"#f0f4f0",borderRadius:10,padding:4,gap:3}}>
      {["forex","crypto"].map(t=><button key={t} onClick={()=>setFxTab(t)} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",background:fxTab===t?"#fff":"transparent",color:fxTab===t?G:"#888",fontWeight:700,fontSize:13,cursor:"pointer",boxShadow:fxTab===t?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{t==="forex"?"💱 Forex":"₿ Crypto"}</button>)}
    </div>
    {fxTab==="forex"&&<div>
      <div style={{background:"#E3F2FD",borderRadius:11,padding:12,border:"1px solid #BBDEFB",fontSize:12,color:BL,marginBottom:10}}>Forex + Crypto FX Pairs · Long (buy base) or Short (sell base) · BTC/USD and ETH/USD included · USD/AED and USD/CNY locked</div>
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.fx.map((f,i)=>{
          const pos=(d.fxPos||{})[f.id];
          const pnl=pos?(pos.side==="long"?(f.p-pos.entry)*pos.units:(pos.entry-f.p)*pos.units):0;
          return <div key={f.id} style={{padding:"13px 14px",borderBottom:i<d.fx.length-1?"1px solid #f5f5f5":"none"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{fontSize:14,fontWeight:700,color:DK}}>{f.n}</div>{f.isCrypto&&<span style={{background:"#EDE7F6",color:PU,fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:20}}>CRYPTO FX</span>}</div>
                {f.locked?<span style={{fontSize:10,color:"#aaa"}}>LOCKED — {f.note}</span>:<span style={{fontSize:11,color:"#aaa"}}>Spread: {f.spread}</span>}
              </div>
              <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,fontFamily:"monospace",color:f.locked?"#999":(f.ch||0)>=0?G:R}}>{f.p.toFixed(f.isCrypto?0:4)}</div>{!f.locked&&<Bdg v={f.ch||0}/>}</div>
            </div>
            {pos&&<div style={{background:pnl>=0?"#E8F5E9":"#FFEBEE",borderRadius:8,padding:"8px 11px",marginBottom:8,fontSize:12,fontFamily:"monospace",color:pnl>=0?G:R,fontWeight:700}}>
              {pos.side.toUpperCase()} {pos.units.toLocaleString()} units @ {pos.entry.toFixed(pos.entry>100?0:4)} · P&L: {pnl>=0?"+":""}{fm(pnl)}
            </div>}
            {!f.locked&&<div style={{display:"flex",gap:6}}>
              {!pos&&<>
                <button onClick={()=>{const s=S.current,u=1000,cost=Math.round(u*f.p*100)/100;if(cost>s.cash){toast_("Insufficient cash",false);return;}s.cash=Math.round((s.cash-cost)*100)/100;s.fxPos[f.id]={units:u,entry:f.p,side:"long",cost};toast_("Long 1K "+f.id+" @ "+f.p.toFixed(f.isCrypto?0:4));refresh();}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Long 1K</button>
                <button onClick={()=>{const s=S.current,u=10000,cost=Math.round(u*f.p*100)/100;if(cost>s.cash){toast_("Insufficient cash",false);return;}s.cash=Math.round((s.cash-cost)*100)/100;s.fxPos[f.id]={units:u,entry:f.p,side:"long",cost};toast_("Long 10K "+f.id);refresh();}} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Long 10K</button>
                <button onClick={()=>{const s=S.current,u=1000,cost=Math.round(u*f.p*100)/100;if(cost>s.cash){toast_("Insufficient cash",false);return;}s.cash=Math.round((s.cash-cost)*100)/100;s.fxPos[f.id]={units:u,entry:f.p,side:"short",cost};toast_("Short 1K "+f.id);refresh();}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Short 1K</button>
              </>}
              {pos&&<button onClick={()=>{const s=S.current,pos2=s.fxPos[f.id];if(!pos2)return;const pnl2=pos2.side==="long"?(f.p-pos2.entry)*pos2.units:(pos2.entry-f.p)*pos2.units;s.cash=Math.round((s.cash+pos2.cost+pnl2)*100)/100;delete s.fxPos[f.id];toast_("Closed "+f.id+" · P&L: "+(pnl2>=0?"+":"")+fm(pnl2));refresh();}} style={{flex:1,background:pnl>=0?G:R,color:"#fff",border:"none",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Close ({pnl>=0?"+":""}{fm(pnl)})</button>}
            </div>}
          </div>;
        })}
      </div>
    </div>}
    {fxTab==="crypto"&&<div>
      <div style={{background:"#EDE7F6",borderRadius:11,padding:12,border:"1px solid #D1C4E9",fontSize:12,color:PU,marginBottom:10}}>Direct Crypto Trading · ±8%/turn · Mean-reversion · Floor at 20% of base · CGT on profit only · Can go bankrupt faster — or get rich faster</div>
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.cryp.map((c,i)=>{const held=CRH[c.id]||0;return <div key={c.id} style={{padding:"13px 14px",borderBottom:i<d.cryp.length-1?"1px solid #f5f5f5":"none"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
            <div><div style={{fontSize:14,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:11,color:"#aaa"}}>{c.id} · Volatility: {(c.vol*100).toFixed(0)}%{held>0&&<span style={{color:G,fontWeight:700}}> · Held: {held}</span>}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,fontFamily:"monospace",color:(c.ch||0)>=0?G:R}}>{fm(c.p)}</div><Bdg v={c.ch||0}/></div>
          </div>
          <div style={{height:26,marginBottom:8}}><MC hist={c.hist} w={240} h={26} color={PU}/></div>
          {held>0&&<div style={{fontSize:11,color:"#555",marginBottom:8,fontFamily:"monospace"}}>Held: {held} · Value: {fm(c.p*held)} · P&L: <span style={{color:(c.p-(d.avgCr?.[c.id]||c.p))>=0?G:R}}>{fm((c.p-(d.avgCr?.[c.id]||c.p))*held)}</span></div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setTrM({type:"cryp",item:c,mode:"buy"});setTrQ(null);}} style={{flex:1,background:PU,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Buy</button>
            {held>0&&<button onClick={()=>{setTrM({type:"cryp",item:c,mode:"sell"});setTrQ(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell Max ({held})</button>}
          </div>
        </div>;})}
      </div>
    </div>}
  </div>;

  const S_Port=(()=>{
    const sm={};Object.entries(SH).filter(([,n])=>n>0).forEach(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(c)sm[c.s]=(sm[c.s]||0)+c.price*n;});
    const tsv=Object.values(sm).reduce((a,b2)=>a+b2,0)||1;
    const totPL=Object.entries(SH).reduce((s,[t,n])=>{const c=d.cos.find(x=>x.t===t);if(!c)return s;return s+(c.price-(d.avgSh?.[t]||c.price))*n;},0);
    return <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#388E3C)",borderRadius:16,padding:16,color:"#fff"}}>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Portfolio Value</div>
        <div style={{fontFamily:"monospace",fontSize:28,fontWeight:800}}>{fm(nw)}</div>
        <div style={{fontSize:11,opacity:.75,marginTop:2}}>S:{fm(sv)} · ETF:{fm(ev)} · B:{fm(bv)} · C:{fm(cv)} · Cr:{fm(crv)} · GSF:{fm(d.gsfDep||0)} · Cash:{fm(d.cash)}</div>
        <div style={{fontSize:11,marginTop:4,color:totPL>=0?"#C8E6C9":"#FFCDD2"}}>Unrealised P&L: {totPL>=0?"+":""}{fm(totPL)}</div>
      </div>
      {(d.taxRed||0)>0&&<div style={{background:"#E8F5E9",borderRadius:10,padding:11,border:"1px solid #A5D6A7",fontSize:12,color:G}}>❤️ Philanthropy Tax Relief: {((d.taxRed||0)*100).toFixed(0)}% off all taxes. Effective CGT: {(((d.cgtRate||.20)*(1-(d.taxRed||0)))*100).toFixed(0)}%</div>}
      {Object.keys(sm).length>0&&<div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Sector Allocation</div>
        {Object.entries(sm).sort(([,a],[,b2])=>b2-a).map(([s,v])=><div key={s} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#555"}}>{s}</span><span style={{fontSize:12,fontFamily:"monospace"}}>{((v/tsv)*100).toFixed(1)}%</span></div><div style={{height:5,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:((v/tsv)*100)+"%",background:"linear-gradient(90deg,"+G+",#4CAF50)",borderRadius:3}}/></div></div>)}
      </div>}
      <div style={{background:"#fff",borderRadius:13,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        <div style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:DK}}>Stocks ({Object.keys(SH).filter(t=>(SH[t]||0)>0).length})</div>
        {Object.keys(SH).filter(t=>(SH[t]||0)>0).length===0&&<div style={{padding:"13px 14px",fontSize:13,color:"#bbb"}}>No stocks. Go to Stocks tab.</div>}
        {Object.entries(SH).filter(([,n])=>n>0).map(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(!c)return null;const avgC=d.avgSh?.[t]||c.price,pl=(c.price-avgC)*n;
          return <div key={t} style={{padding:"11px 14px",borderTop:"1px solid #f5f5f5"}}>
            <div onClick={()=>{setSelCo({...c});setTab("mkt");}} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:"pointer"}}>
              <div style={{width:36,height:36,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:11,color:"#aaa"}}>{n.toLocaleString()} shs · {fm(c.price)}/sh · avg {fm(avgC)}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace"}}>{fm(c.price*n)}</div><div style={{fontSize:11,fontFamily:"monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</div></div>
            </div>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>{setTrM({type:"stock",item:c,mode:"buy"});setTrQ(null);}} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>+ More</button>
              <button onClick={()=>{const half=Math.floor(n/2);if(half>0)trade("stock",c,"sell",half);}} style={{flex:1,background:"#FFF3E0",color:AU,border:"1px solid #FFCC80",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell ½</button>
              <button onClick={()=>trade("stock",c,"sell",n)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell All</button>
            </div>
          </div>;
        })}
      </div>
      {Object.keys(EH).filter(id=>(EH[id]||0)>0).length>0&&<div style={{background:"#fff",borderRadius:13,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        <div style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:DK}}>ETFs</div>
        {Object.entries(EH).filter(([,n])=>n>0).map(([id,n])=>{const e=d.etfs.find(x=>x.id===id);if(!e)return null;const pl=(e.p-(d.avgEh?.[id]||e.p))*n;
          return <div key={id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderTop:"1px solid #f5f5f5"}}>
            <div style={{flex:1,cursor:"pointer"}} onClick={()=>{setTab("etf");}}>
              <div style={{fontSize:13,fontWeight:600,color:DK}}>{e.n}</div>
              <div style={{fontSize:11,color:"#aaa"}}>{n} units · {fm(e.p)}/unit</div>
            </div>
            <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace"}}>{fm(e.p*n)}</div><div style={{fontSize:11,fontFamily:"monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</div></div>
            <button onClick={()=>trade("etf",e,"sell",n)} style={{background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"8px 12px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell All</button>
          </div>;
        })}
      </div>}
      {Object.keys(d.ipoH||{}).filter(id=>(d.ipoH[id]||0)>0).length>0&&<div style={{background:"#fff",borderRadius:13,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        <div style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:DK}}>IPO Holdings</div>
        {Object.entries(d.ipoH||{}).filter(([,n])=>n>0).map(([id,n])=>{const ipo=d.ipos.find(x=>x.id===id);if(!ipo)return null;
          return <div key={id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderTop:"1px solid #f5f5f5"}}>
            <span style={{fontSize:18}}>🚀</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:DK}}>{ipo.n}</div><div style={{fontSize:11,color:"#aaa"}}>{n.toLocaleString()} shares · IPO price {fm(ipo.ip)}</div></div>
            <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:PU}}>{fm(n*ipo.ip)}</div>
          </div>;
        })}
      </div>}
    </div>;
  })();

  const S_GSF=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",borderRadius:16,padding:16,color:"#fff"}}>
      <div style={{fontSize:10,opacity:.65,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🏛️ Global Sovereign Fund</div>
      <div style={{fontSize:18,fontWeight:800,marginBottom:3}}>Collective Investment Pool</div>
      <div style={{fontSize:12,opacity:.85}}>Server rate · Same for all players · Credited every turn · Never auto-reduced · 2% deposit tax</div>
    </div>
    <div style={{background:"#E3F2FD",borderRadius:13,padding:14,border:"1px solid #BBDEFB"}}>
      <div style={{fontSize:13,fontWeight:700,color:BL,marginBottom:10}}>Your Position</div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <SB l="Deposited" v={fm(d.gsfDep||0)} c={BL}/>
        <SB l="Rate / yr" v={(d.gsf||12.48).toFixed(2)+"%"} c={G}/>
        <SB l="Per Turn" v={fm((d.gsfDep||0)*((d.gsf||12.48)/100/365))} c={G}/>
      </div>
      <div style={{background:"#fff",borderRadius:9,padding:"10px 12px",marginBottom:12,fontSize:12,color:"#666",lineHeight:1.6}}>
        Total earned: <strong>{fm(d.gsfTotal||0)}</strong><br/>
        Formula: {fm(d.gsfDep||0)} × {(d.gsf||12.48).toFixed(2)}% ÷ 365 = {fm((d.gsfDep||0)*((d.gsf||12.48)/100/365))}/turn<br/>
        Deposit is protected — only you can withdraw it.
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{setGsfM(true);setGsfAmt(null);}} style={{flex:2,background:BL,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Deposit</button>
        {(d.gsfDep||0)>0&&<button onClick={()=>{const s=S.current;const amt=s.gsfDep;s.cash=Math.round((s.cash+amt)*100)/100;s.gsfDep=0;toast_("Withdrawn "+fm(amt)+" from GSF");refresh();}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>Withdraw All</button>}
      </div>
    </div>
    <div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>🪙 Spin Tokens</div>
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <SB l="Available Tokens" v={d.spinTokens||0} c={G}/><SB l="Spins Used" v={(d.spinsUsed||0)+"/5"}/><SB l="Last Spin" v={(d.lastSpin||0)>0?"T"+(d.lastSpin):"Never"}/>
      </div>
      <div style={{fontSize:11,color:"#888"}}>Earn spin tokens through philanthropy donations. Max 5 lifetime spins. Spins give debt relief on the Wheel of Fortune.</div>
      <button onClick={()=>setTab("wof")} style={{width:"100%",marginTop:10,background:"linear-gradient(135deg,#E65100,#FF8F00)",color:"#fff",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>🎰 Go to Wheel of Fortune</button>
    </div>
  </div>;

  const S_Give=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#880E4F,#C2185B)",borderRadius:16,padding:16,color:"#fff"}}>
      <div style={{fontSize:10,opacity:.65,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>❤️ Philanthropy</div>
      <div style={{fontSize:18,fontWeight:800,marginBottom:3}}>Reduce Taxes. Build Legacy.</div>
      <div style={{fontSize:12,opacity:.85,lineHeight:1.6}}>Minimum $1M per donation. Each category gives different tax relief rate and duration. Earns spin tokens for Wheel of Fortune.</div>
      <div style={{display:"flex",gap:8,marginTop:10}}><SB l="Donations" v={d.dons||0} c="#FFCDD2"/><SB l="Tax Relief" v={((d.taxRed||0)*100).toFixed(0)+"%"} c="#FFCDD2"/><SB l="Spin Tokens" v={d.spinTokens||0} c="#FFCDD2"/></div>
    </div>
    {(d.phiBen||[]).length>0&&<div style={{background:"#E8F5E9",borderRadius:11,padding:12,border:"1px solid #A5D6A7",fontSize:12,color:G}}>
      <strong>Active Benefits:</strong>{(d.phiBen||[]).map((b,i)=><span key={i}> {b.cat} ({(b.rate*100).toFixed(0)}% · {b.rem} turns)</span>)}
    </div>}
    {[{n:"Healthcare",ico:"🏥",rate:.20,dur:3,eco:"Africa GDP +5%, Healthcare stocks +3%"},{n:"Education",ico:"🎓",rate:.25,dur:5,eco:"EM GDP +4%, Tech stocks +2%"},{n:"Environment",ico:"🌱",rate:.30,dur:7,eco:"Energy +5%, Mining -3%"},{n:"Infrastructure",ico:"🌉",rate:.15,dur:4,eco:"All GDP +2%, Construction +4%"},{n:"Poverty",ico:"🤝",rate:.20,dur:3,eco:"EM GDP +3%, Consumer +2%"},{n:"Science",ico:"🔭",rate:.25,dur:5,eco:"Tech +4%, Research +6%"},{n:"Arts",ico:"🎨",rate:.10,dur:2,eco:"Consumer +1%, Tourism +2%"},{n:"Disaster",ico:"🆘",rate:.35,dur:8,eco:"Region GDP +8%"}].map(cat=><div key={cat.n} style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <span style={{fontSize:22}}>{cat.ico}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:DK}}>{cat.n}</div>
          <div style={{fontSize:11,color:"#888",lineHeight:1.5}}>{cat.eco}<br/><span style={{color:G,fontWeight:700}}>{(cat.rate*100).toFixed(0)}% tax relief for {cat.dur} turns · +1 spin token</span></div>
        </div>
      </div>
      <button onClick={()=>{setDonM(cat);setDonAmt(null);}} style={{width:"100%",background:"#880E4F",color:"#fff",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>Donate to {cat.n} ❤️</button>
    </div>)}
  </div>;

  const S_WOF=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
    <div style={{background:"linear-gradient(135deg,#E65100,#FF8F00)",borderRadius:16,padding:16,color:"#fff",width:"100%"}}>
      <div style={{fontSize:10,opacity:.7,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🎰 Wheel of Fortune</div>
      <div style={{fontSize:18,fontWeight:800,marginBottom:3}}>Debt Relief Lottery</div>
      <div style={{fontSize:12,opacity:.85}}>Spin for debt forgiveness. Max 5 lifetime spins. Earn tokens via philanthropy. Needs $100K+ debt.</div>
    </div>
    {/* Wheel Visual */}
    <div style={{position:"relative",width:280,height:280}}>
      <svg width={280} height={280} style={{transform:`rotate(${wheelAngle}deg)`,transition:spinning?"transform 3s cubic-bezier(.17,.67,.12,.99)":"none"}}>
        {[{l:"5% Relief",c:"#4CAF50"},{l:"No Relief",c:"#F44336"},{l:"10% Relief",c:"#2196F3"},{l:"25% Relief",c:"#FF9800"},{l:"15% Relief",c:"#9C27B0"},{l:"50% Relief!",c:"#E91E63"}].map((seg,i)=>{
          const angle=(i/6)*Math.PI*2-Math.PI/2,nextAngle=((i+1)/6)*Math.PI*2-Math.PI/2;
          const cx=140,cy=140,r=130;
          const x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle);
          const x2=cx+r*Math.cos(nextAngle),y2=cy+r*Math.sin(nextAngle);
          const midA=(angle+nextAngle)/2;
          return <g key={i}>
            <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`} fill={seg.c} stroke="#fff" strokeWidth="2"/>
            <text x={cx+80*Math.cos(midA)} y={cy+80*Math.sin(midA)} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="11" fontWeight="800" style={{pointerEvents:"none"}}>{seg.l}</text>
          </g>;
        })}
        <circle cx={140} cy={140} r={20} fill="#fff" stroke="#333" strokeWidth="3"/>
      </svg>
      <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",fontSize:28}}>▼</div>
    </div>
    {wheelResult&&<div style={{background:wheelResult.pct>0?"#E8F5E9":"#FFEBEE",borderRadius:13,padding:14,border:"1px solid "+(wheelResult.pct>0?"#A5D6A7":"#EF9A9A"),textAlign:"center",width:"100%"}}>
      <div style={{fontSize:16,fontWeight:800,color:wheelResult.pct>0?G:R,marginBottom:4}}>{wheelResult.label}</div>
      <div style={{fontSize:12,color:"#666"}}>{wheelResult.pct>0?"Debt relief applied to your account!":"Better luck next time. You earned 100 bonus points."}</div>
    </div>}
    <div style={{display:"flex",gap:8,width:"100%"}}>
      <SB l="Spin Tokens" v={d.spinTokens||0} c={G}/><SB l="Spins Left" v={Math.max(0,5-(d.spinsUsed||0))+"/5"}/><SB l="Next Spin" v={(d.lastSpin||0)>0?("T"+(d.lastSpin+1000)):"Now"}/>
    </div>
    <button onClick={spinWheel} disabled={spinning||!(d.spinTokens>0)&&!(d.spinsUsed<5)} style={{width:"100%",background:spinning?"#e0e0e0":(d.spinTokens||0)>0?"linear-gradient(135deg,#E65100,#FF8F00)":"#e0e0e0",color:(d.spinTokens||0)>0&&!spinning?"#fff":"#aaa",border:"none",borderRadius:12,padding:"15px 0",fontWeight:800,fontSize:16,cursor:(d.spinTokens||0)>0&&!spinning?"pointer":"not-allowed"}}>
      {spinning?"🎰 Spinning...":(d.spinTokens||0)>0?"🎰 SPIN THE WHEEL":"No Tokens — Donate to Earn Tokens"}
    </button>
    <div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8",width:"100%"}}>
      <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Wheel Outcomes</div>
      {[{l:"5% debt forgiven",prob:"30%"},{l:"10% debt forgiven",prob:"20%"},{l:"15% debt forgiven",prob:"15%"},{l:"25% debt forgiven",prob:"10%"},{l:"50% debt forgiven",prob:"10%"},{l:"+100 points (no relief)",prob:"15%"}].map((o,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f0f0f0",fontSize:12}}><span style={{color:DK}}>{o.l}</span><span style={{fontWeight:700,color:G}}>{o.prob}</span></div>)}
    </div>
  </div>;

  const S_News=<div style={{padding:14,display:"flex",flexDirection:"column",gap:8}}>
    {d.news.slice(0,30).map(n=><div key={n.id} style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8",display:"flex",gap:10}}>
      <div style={{width:4,borderRadius:2,flexShrink:0,background:n.g?G:R,alignSelf:"stretch"}}/>
      <div style={{flex:1}}><div style={{fontSize:10,color:"#ccc",textTransform:"uppercase",letterSpacing:.4,marginBottom:3}}>Turn {n.t} · {n.ico}</div><div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:3}}>{n.ti}</div><div style={{fontSize:12,color:"#666",lineHeight:1.6}}>{n.bo}</div></div>
    </div>)}
  </div>;

  const screenMap={dash:S_Dash,mkt:S_Mkt,etf:S_ETF,ipo:S_IPO,bonds:S_Bonds,comm:S_Comm,fxcr:S_FxCr,port:S_Port,gsf:S_GSF,ph:S_Give,wof:S_WOF,news:S_News};

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"system-ui,-apple-system,sans-serif"}}>
    {/* Header */}
    <div style={{background:"#fff",padding:"10px 15px",borderBottom:"1px solid #e8ebe8",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",gap:8}} onClick={()=>setTab("dash")} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
        <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#1B5E20,#4CAF50)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🌐</div>
        <div><div style={{fontSize:15,fontWeight:800,color:DK,lineHeight:1}}>Galactic Raider</div><div style={{fontSize:9,color:"#bbb"}}>Capital Exchange · Part A · Turn {d.turn}</div></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        {auto&&<div style={{width:7,height:7,borderRadius:"50%",background:G,boxShadow:"0 0 6px #4CAF50"}}/>}
        <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:G,fontFamily:"monospace"}}>{fm(nw)}</div><div style={{fontSize:9,color:"#aaa"}}>Net Worth</div></div>
      </div>
    </div>
    {/* Ticker */}
    <div style={{background:"#1B5E20",padding:"4px 0",overflow:"hidden",flexShrink:0}}>
      <div style={{display:"flex",gap:18,whiteSpace:"nowrap",animation:"scroll 30s linear infinite",width:"max-content"}}>
        {[...d.cos,...d.cryp,...d.cos].map((c,i)=><span key={i} style={{fontSize:10,fontFamily:"monospace",color:"rgba(255,255,255,.45)",display:"inline-flex",gap:5}}>
          <span style={{color:"rgba(255,255,255,.7)",fontWeight:700}}>{c.t||c.id}</span>
          <span style={{color:(c.ch||0)>=0?"#69F0AE":"#FF5252"}}>{fm(c.price||c.p)} {(c.ch||0)>=0?"▲":"▼"}{Math.abs((c.ch||0)*100).toFixed(2)}%</span>
        </span>)}
      </div>
    </div>
    {/* Content */}
    <div style={{flex:1,overflowY:"auto",paddingBottom:70}}>{screenMap[tab]||S_Dash}</div>
    {/* Nav */}
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #e8ebe8",display:"flex",padding:"5px 2px 10px",zIndex:50}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{...ts(t.id)}}><div style={{fontSize:15,lineHeight:1,marginBottom:2}}>{t.ico}</div><div style={{fontSize:7.5}}>{t.l}</div></button>)}
    </div>
    {/* Event toast */}
    {evN&&<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 20px)",maxWidth:410,background:evN.good?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#C62828)",borderRadius:13,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,zIndex:200,boxShadow:"0 6px 24px rgba(0,0,0,.3)"}}>
      <span style={{fontSize:22}}>{evN.ico}</span>
      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{evN.n}{evN.cn?" — "+evN.cn:""}</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>{evN.desc}</div></div>
      <button onClick={()=>setEvN(null)} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:"50%",width:22,height:22,color:"#fff",cursor:"pointer",fontSize:13,flexShrink:0}}>×</button>
    </div>}
    {/* Action toast */}
    {toast&&<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 20px)",maxWidth:410,background:toast.g?G:R,borderRadius:10,padding:"11px 16px",color:"#fff",fontSize:13,fontWeight:700,zIndex:250,textAlign:"center",boxShadow:"0 4px 14px rgba(0,0,0,.25)"}}>{toast.msg}</div>}
    {/* Trade Modal */}
    {trM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget){setTrM(null);setTrQ(null);}}}>{TrModal}</div>}
    {/* Donate Modal */}
    {donM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setDonM(null)}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
        <div style={{width:38,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 16px"}}/>
        <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:3}}>{donM.ico} Donate to {donM.n}</div>
        <div style={{background:"#FFF8E1",borderRadius:9,padding:10,marginBottom:14,fontSize:12,color:"#E65100",lineHeight:1.6}}>{(donM.rate*100).toFixed(0)}% tax relief for {donM.dur} turns · +1 spin token · {donM.eco}<br/>Min: $1,000,000 · Cash: {fm(d.cash)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
          {[1000000,5000000,10000000,50000000,100000000,500000000].filter(v=>v<=d.cash).map(v=><button key={v} onClick={()=>setDonAmt(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(donAmt===v?"#880E4F":"#e0e0e0"),background:donAmt===v?"#FCE4EC":"#fafafa",color:donAmt===v?"#880E4F":"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(v)}</button>)}
        </div>
        {d.cash<1000000&&<div style={{background:"#FFEBEE",borderRadius:9,padding:10,fontSize:12,color:R,marginBottom:10}}>Minimum donation is $1M. Build more capital first.</div>}
        <button onClick={()=>{
          if(!donAmt||donAmt<1000000||donAmt>d.cash){toast_(donAmt<1000000?"Minimum $1M":"Insufficient cash",false);return;}
          const s=S.current;s.cash=Math.round((s.cash-donAmt)*100)/100;s.dons=(s.dons||0)+1;s.spinTokens=(s.spinTokens||0)+1;
          s.phiBen=[...(s.phiBen||[]),{cat:donM.n,rate:donM.rate,rem:donM.dur}];
          s.news.unshift({id:Math.random(),t:s.turn,ico:"❤️",ti:"Donated to "+donM.n,bo:fm(donAmt)+" · "+(donM.rate*100).toFixed(0)+"% tax relief for "+donM.dur+" turns. +1 spin token.",g:true});
          toast_("❤️ Donated "+fm(donAmt)+" · +1 spin token · "+(donM.rate*100).toFixed(0)+"% relief for "+donM.dur+" turns");
          setDonM(null);setDonAmt(null);refresh();
        }} style={{width:"100%",background:donAmt&&donAmt>=1000000&&donAmt<=d.cash?"#880E4F":"#e0e0e0",color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:14,cursor:"pointer"}}>❤️ Confirm{donAmt?" — "+fm(donAmt):""}</button>
      </div>
    </div>}
    {/* GSF Deposit Modal */}
    {gsfM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setGsfM(false)}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
        <div style={{width:38,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 16px"}}/>
        <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:3}}>🏛️ Deposit to GSF</div>
        <div style={{fontSize:12,color:"#888",marginBottom:12}}>Rate: {(d.gsf||12.48).toFixed(2)}%/yr · 2% deposit tax · Cash: {fm(d.cash)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
          {[10000,50000,100000,500000,1000000,5000000,10000000].filter(v=>v<=d.cash).map(v=><button key={v} onClick={()=>setGsfAmt(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(gsfAmt===v?BL:"#e0e0e0"),background:gsfAmt===v?"#E3F2FD":"#fafafa",color:gsfAmt===v?BL:"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(v)}</button>)}
        </div>
        {gsfAmt&&<div style={{background:"#E3F2FD",borderRadius:10,padding:12,marginBottom:12}}>
          <Row k="Gross Deposit" v={fm(gsfAmt)} vc={BL} b/>
          <Row k="2% Deposit Tax" v={"-"+fm(Math.round(gsfAmt*.02*100)/100)} vc={R}/>
          <Row k="Net to GSF" v={fm(Math.round(gsfAmt*.98*100)/100)} vc={G} b/>
          <Row k="New per-turn return" v={fm((( d.gsfDep||0)+gsfAmt*.98)*((d.gsf||12.48)/100/365))} vc={G}/>
        </div>}
        <button onClick={()=>{
          if(!gsfAmt||gsfAmt>d.cash){toast_("Invalid amount",false);return;}
          const s=S.current,tax=Math.round(gsfAmt*.02*100)/100,net=gsfAmt-tax;
          s.cash=Math.round((s.cash-gsfAmt)*100)/100;s.gsfDep=(s.gsfDep||0)+net;
          toast_("Deposited "+fm(net)+" to GSF (2% tax: "+fm(tax)+") → "+fm(s.gsfDep*(s.gsf/100/365))+"/turn");
          setGsfM(false);setGsfAmt(null);refresh();
        }} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:14,cursor:"pointer"}}>🏛️ Confirm{gsfAmt?" — "+fm(gsfAmt):""}</button>
      </div>
    </div>}
    <style>{"@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{display:none}button{outline:none;font-family:inherit}"}</style>
  </div>;
}
