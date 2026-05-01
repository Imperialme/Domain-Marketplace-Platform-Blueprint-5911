import{useState,useRef,useEffect,useCallback}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e12?"$"+(a/1e12).toFixed(2)+"T":a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const pc=n=>(n>=0?"+":"")+((n||0)*100).toFixed(2)+"%";
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);

// ── STATIC DATA ────────────────────────────────────────────────
const COS=[ {t:"SLKT",n:"Silk Road Tech",s:"Technology",r:"Asia Pacific",ip:348.94,pe0:18.4,div:0.8,b:1.8,yr:2008,sh:1200000000,emp:125000,hq:"Singapore", ceo:"Dr. Lin Wei",founder:"Dr. Lin Wei", origin:"Founded by Stanford-trained engineer Lin Wei who sold his Singapore apartment to fund the first server. Grew from 4 people in a Jurong shophouse to 125,000 staff across 18 countries in 17 years.", ops:"Enterprise cloud, AI inference chips and cross-border data services. Offices in Singapore, Tokyo, Seoul, Mumbai, Sydney and Jakarta.", analyst:"BUY",target:420,rating:4.2, desc:"AI and cloud leader across 18 Asia Pacific markets. Dominant in enterprise software and semiconductor design."}, {t:"MRDB",n:"Meridian Bank",s:"Banking",r:"US",ip:85.20,pe0:12.1,div:2.1,b:0.9,yr:1985,sh:800000000,emp:45000,hq:"New York", ceo:"Patricia Hernandez",founder:"James R. Meridian", origin:"James Meridian started as a bank teller in Brooklyn in 1972 with $200 in his pocket. Built one branch into a regional powerhouse through 14 acquisitions over 30 years. Family still holds 12% stake.", ops:"2,400 retail branches across US Midwest and Northeast. Corporate lending, wealth management and mortgage origination.", analyst:"HOLD",target:90,rating:3.5, desc:"Mid-size US commercial bank with strong Midwest footprint and conservative lending culture."}, {t:"FRMN",n:"Frontier Mining",s:"Mining",r:"Africa",ip:15.80,pe0:8.5,div:0.5,b:1.6,yr:2005,sh:600000000,emp:28000,hq:"Johannesburg", ceo:"Amara Diallo",founder:"Kwame Asante", origin:"Ghanaian geologist Kwame Asante discovered a rare earth deposit in rural Ghana while working for a junior explorer. Left his job, secured local government backing and listed on JSE in 2009.", ops:"Iron ore in Mauritania, lithium in Zimbabwe, rare earths in DRC and Zambia. Supplies directly to Asian battery manufacturers.", analyst:"BUY",target:22,rating:4.0, desc:"Pan-African critical minerals group. Significant lithium and rare earth reserves powering the global EV revolution."}, {t:"TNPT",n:"Titan Petroleum",s:"Energy",r:"Emerging Markets",ip:351.54,pe0:11.3,div:1.8,b:1.2,yr:1995,sh:900000000,emp:62000,hq:"Dubai", ceo:"Sheikh Rashid Al-Mansouri",founder:"Al-Mansouri family", origin:"Established as a private trading company by the Al-Mansouri family of Abu Dhabi in 1995. Listed on DFM in 2003. Expanded into upstream production through Gulf concessions and Central Asian pipeline deals.", ops:"Crude production in UAE, Kuwait and Oman. Pipeline infrastructure across Kazakhstan. Refinery in Oman.", analyst:"HOLD",target:360,rating:3.2, desc:"Third-largest petroleum producer in the Gulf. Vertically integrated from upstream extraction to refined product export."}, {t:"AGRO",n:"AgroLatin Corp",s:"Agriculture",r:"Latin America",ip:42.18,pe0:13.2,div:2.5,b:1.1,yr:1975,sh:500000000,emp:18000,hq:"São Paulo", ceo:"Isabella Sousa",founder:"Carlos Sousa", origin:"Carlos Sousa started on a small family farm in Mato Grosso in 1975. Expanded through land acquisition during Brazil's agricultural boom. Now third-generation family ownership with Isabella leading.", ops:"4.2M hectares across Brazil and Argentina. Soy, corn, sugarcane and cattle. Direct export to 22 countries.", analyst:"BUY",target:52,rating:4.1, desc:"Largest agri-business in Latin America by farmland. Consistent dividend payer with stable commodity-backed revenue."}, {t:"MDCR",n:"MediCore Group",s:"Healthcare",r:"US",ip:198.40,pe0:22.1,div:1.2,b:0.8,yr:2005,sh:400000000,emp:38000,hq:"Boston", ceo:"Dr. Sarah Chen",founder:"Dr. Marcus Webb", origin:"Harvard oncologist Dr. Marcus Webb licensed his tumour-targeting device patent in 2005 with two colleagues from his lab. Built from a single IP licence into a full hospital management and medical devices group.", ops:"180 hospitals and 400 diagnostic labs across North America. FDA-approved oncology pipeline with 3 drugs in Phase 3.", analyst:"STRONG BUY",target:240,rating:4.7, desc:"Premium healthcare group with proprietary oncology technology. High growth, defensive sector, strong pipeline."}, {t:"CLFL",n:"ClearFlame Energy",s:"Energy",r:"Europe",ip:112.30,pe0:14.8,div:2.0,b:1.1,yr:2010,sh:350000000,emp:22000,hq:"Amsterdam", ceo:"Hans Brouwer",founder:"Dr. Marta Kowalski", origin:"Polish renewable engineer Dr. Marta Kowalski left Shell in 2010 to pioneer hybrid wind-gas grid technology. IPO'd on Euronext in 2016 at €28. Carbon-neutral target set for 2027.", ops:"Wind farms in North Sea, solar in Spain and Portugal, gas peaking plants in Germany. Powers 12M households.", analyst:"BUY",target:130,rating:4.0, desc:"European diversified energy leader. Major beneficiary of EU Green Deal infrastructure spending."}, {t:"AXMB",n:"Axum Biotech",s:"Healthcare",r:"Africa",ip:68.50,pe0:19.4,div:0.6,b:1.4,yr:2012,sh:200000000,emp:8500,hq:"Addis Ababa", ceo:"Dr. Yohannes Tesfaye",founder:"Dr. Yohannes Tesfaye", origin:"Ethiopian physician Dr. Tesfaye's malaria research was rejected by Western pharma as not commercially viable. He founded Axum with African Union grants and Bill Gates Foundation backing. First African biotech to achieve WHO pre-qualification.", ops:"Vaccine manufacturing in Ethiopia and Kenya. Genomic labs in 8 African nations. Phase 3 malaria vaccine trial ongoing.", analyst:"SPECULATIVE BUY",target:85,rating:3.8, desc:"High-risk high-reward African biotech. Phase 3 trial success could be transformational. Not for the faint-hearted."}, {t:"PCMN",n:"Pacific Mfg",s:"Manufacturing",r:"Asia Pacific",ip:76.20,pe0:15.6,div:1.3,b:1.0,yr:1988,sh:700000000,emp:55000,hq:"Seoul", ceo:"Park Joon-ho",founder:"Park Dae-jung", origin:"Retired Korean army engineer Park Dae-jung started making circuit boards for Samsung in 1988 with a $50K loan and 8 workers. His son now runs the company which supplies 14 of the top 20 global car manufacturers.", ops:"Factories in Korea, Vietnam, Mexico and Poland. EV battery components and power electronics for automotive OEMs.", analyst:"HOLD",target:80,rating:3.4, desc:"Solid mid-tier manufacturer. EV tailwind is real but OEM price negotiations are squeezing margins."}, {t:"NRDX",n:"Nordic Bank",s:"Banking",r:"Europe",ip:132.10,pe0:11.8,div:2.4,b:0.8,yr:1975,sh:450000000,emp:32000,hq:"Stockholm", ceo:"Astrid Lindqvist",founder:"Swedish government consortium", origin:"Formed in 1975 by a Swedish government banking consortium for Nordic trade finance. Privatised in 1992. Built pan-European presence through careful acquisitions in Finland, Denmark, Norway and the Baltics.", ops:"Retail, wealth management and institutional banking across 18 European countries. Strong Nordic SME lending book.", analyst:"BUY",target:150,rating:4.0, desc:"Best-in-class Nordic banking franchise. Conservative lending, low bad loans, reliable dividend. Classic defensive holding."}, {t:"UTLS",n:"Utility Systems",s:"Utilities",r:"US",ip:58.40,pe0:14.2,div:4.2,b:0.5,yr:1950,sh:300000000,emp:12000,hq:"Chicago", ceo:"Robert Keller",founder:"Chicago City Council", origin:"Created by Chicago City Council in 1950 as a regulated public utility serving the postwar housing boom. Privatised in 1987 in a landmark deregulation move. Operates as a regulated monopoly — rate increases require state approval.", ops:"Electric grid serving 1.9M customers and gas distribution to 1.3M customers across the US Midwest. 3 nuclear plants.", analyst:"HOLD",target:60,rating:3.3, desc:"Classic defensive utility. 4.2% dividend is the main draw. Very limited growth but near-zero risk of loss."}, {t:"TLCM",n:"TeleCom Europe",s:"Telecom",r:"Europe",ip:88.60,pe0:13.5,div:4.5,b:0.6,yr:1985,sh:550000000,emp:48000,hq:"Frankfurt", ceo:"Klaus Hoffman",founder:"West German government", origin:"Emerged from privatisation of West Germany's postal telephone monopoly in 1985. Became pan-European through 22 acquisitions over 30 years. Now Europe's largest mobile operator by subscribers.", ops:"Mobile, broadband and enterprise telecoms across 22 European countries. 280M subscribers. Europe's largest 5G network.", analyst:"HOLD",target:92,rating:3.1, desc:"Mature telecom. 4.5% dividend yield. 5G rollout nearly complete but subscriber growth is slowing."}, {t:"RETL",n:"RetailHub Inc",s:"Retail",r:"US",ip:38.90,pe0:14.0,div:1.5,b:1.2,yr:2000,sh:650000000,emp:85000,hq:"Seattle", ceo:"Amanda Torres",founder:"David Park", origin:"David Park, a Korean-American logistics entrepreneur, launched RetailHub in 2000 around a loyalty programme before e-commerce was mainstream. Built physical and digital retail in parallel — a model that is now under pressure.", ops:"1,200 physical stores across 35 US states. Online marketplace with 48M loyalty members. AI-driven inventory system.", analyst:"SELL",target:35,rating:2.5, desc:"Structurally challenged retailer. Amazon and Walmart pressure is intensifying. Loyalty base is an asset but store footprint is a liability."}, {t:"RLST",n:"RealEstate Trust",s:"Real Estate",r:"US",ip:44.20,pe0:12.8,div:3.8,b:0.7,yr:1995,sh:250000000,emp:2800,hq:"Dallas", ceo:"Michael Johnson",founder:"Texas pension funds consortium", origin:"Created by a Texas pension fund consortium in 1995 to invest in commercial property. Listed as a REIT on NYSE in 1998. The decision to pivot to logistics warehouses in 2018 tripled the net asset value.", ops:"$18B portfolio. 40% logistics warehouses, 35% industrial, 25% office. Focused on Sun Belt growth markets.", analyst:"BUY",target:52,rating:4.2, desc:"Best-positioned REIT for e-commerce logistics. Warehouse demand is structural and growing. 3.8% dividend yield."}, {t:"EMTS",n:"Emerging Tech",s:"Technology",r:"Emerging Markets",ip:28.40,pe0:22.0,div:0.2,b:2.0,yr:2015,sh:180000000,emp:6500,hq:"Mumbai", ceo:"Priya Patel",founder:"Priya Patel", origin:"Bangalore-born MIT graduate Priya Patel returned to India in 2015 to build enterprise cloud infrastructure for South Asian SMEs after seeing the gap firsthand. Backed by Sequoia India Series A in 2016. Now profitable.", ops:"B2B SaaS serving 18,000 corporate clients across India, Bangladesh, Sri Lanka and Pakistan. Growing 35% annually.", analyst:"STRONG BUY",target:40,rating:4.5, desc:"High-growth EM tech with massive addressable market. Founder-led, profitable, strong unit economics."},
];
const PEB={Technology:{mn:15,mx:35},Banking:{mn:8,mx:15},Mining:{mn:6,mx:12},Energy:{mn:8,mx:20},Agriculture:{mn:10,mx:18},Healthcare:{mn:12,mx:35},Manufacturing:{mn:10,mx:25},Utilities:{mn:12,mx:18},"Real Estate":{mn:8,mx:16},Telecom:{mn:10,mx:16},Retail:{mn:10,mx:18}};
const COMM=[
  {id:"OIL",n:"Crude Oil",u:"bbl",ip:85,base:85},
  {id:"GOLD",n:"Gold",u:"oz",ip:1980,base:1980},
  {id:"SLVR",n:"Silver",u:"oz",ip:23.4,base:23.4},
  {id:"NGS",n:"Natural Gas",u:"MMBtu",ip:2.85,base:2.85},
  {id:"CORN",n:"Corn",u:"bu",ip:4.42,base:4.42},
  {id:"WHET",n:"Wheat",u:"bu",ip:5.80,base:5.80},
  {id:"COPR",n:"Copper",u:"lb",ip:3.78,base:3.78},
  {id:"LITH",n:"Lithium",u:"kg",ip:16.50,base:16.50},
];
const CRYP=[
  {id:"BTC",n:"Bitcoin",u:"BTC",ip:65000,base:65000},
  {id:"ETH",n:"Ethereum",u:"ETH",ip:3200,base:3200},
  {id:"SOL",n:"Solana",u:"SOL",ip:145,base:145},
  {id:"BNB",n:"BNB",u:"BNB",ip:580,base:580},
];
const BONDS=[
  {id:"US10Y",n:"US Treasury 10Y",rat:"AAA",cou:4.5,oy:4.5,fv:1000,mat:2034},
  {id:"EU10Y",n:"EU Government 10Y",rat:"AA",cou:3.8,oy:3.8,fv:1000,mat:2034},
  {id:"SLKT-B",n:"Silk Road Tech Bond",rat:"AA",cou:5.2,oy:5.2,fv:1000,mat:2031},
  {id:"AFR5Y",n:"African Govt Bond",rat:"BB",cou:12.5,oy:12.5,fv:1000,mat:2029},
  {id:"EM10Y",n:"Emerging Mkt Bond",rat:"B",cou:14.8,oy:14.8,fv:1000,mat:2032},
];
const RMU={AAA:1.02,AA:1.01,A:1,BBB:0.99,BB:0.97,B:0.94};
const gBP=(b)=>cl(Math.round(b.fv*(b.oy/100)/Math.max(b.cy/100,0.01)*(RMU[b.rat]||1)*100)/100,b.fv*0.05,b.fv*2.5);
const EVTS=[
  {id:"rc",n:"Rate Cut",ico:"🏦",t:"mkt",prob:.04,sent:.08,dur:10,good:true},
  {id:"rh",n:"Rate Hike",ico:"📈",t:"mkt",prob:.04,sent:-.07,dur:8,good:false},
  {id:"geo",n:"Geopolitical Crisis",ico:"💣",t:"mkt",prob:.03,sent:-.14,dur:20,sec:["Energy","Mining"],good:false},
  {id:"trg",n:"Tech Regulation",ico:"📜",t:"mkt",prob:.03,sent:-.12,dur:18,sec:["Technology"],good:false},
  {id:"td",n:"Trade Deal",ico:"🤝",t:"mkt",prob:.04,sent:.09,dur:12,good:true},
  {id:"pat",n:"Patent Approved",ico:"⚡",t:"co",prob:.05,imp:.28,dur:5,good:true},
  {id:"scn",n:"CEO Scandal",ico:"💼",t:"co",prob:.03,imp:-.25,dur:15,good:false},
  {id:"bea",n:"Earnings Beat",ico:"💰",t:"co",prob:.10,imp:.20,dur:6,good:true},
  {id:"mis",n:"Earnings Miss",ico:"📉",t:"co",prob:.09,imp:-.18,dur:6,good:false},
  {id:"con",n:"Govt Contract",ico:"🏛️",t:"co",prob:.04,imp:.22,dur:35,good:true},
  {id:"str",n:"Labour Strike",ico:"✊",t:"co",prob:.03,imp:-.20,dur:12,good:false},
];

// ── PRICE ENGINE ───────────────────────────────────────────────
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
    np=Math.max(0.50,Math.round(np*100)/100);
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
    const d=cl(1+(Math.random()-.5)*.08+pull,.93,1.07);
    const np=cl(Math.round(pp*d*100)/100,c.base*.20,c.base*6);
    return{...c,p:np,pp,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-50),np]};
  });
}
function stepFx(fx){
  return fx.map(f=>f.locked?{...f,ch:0}:{...f,pp:f.p,p:Math.round(f.p*cl(1+(Math.random()-.5)*.004,.996,1.004)*10000)/10000,ch:(Math.random()-.5)*.004,hist:[...(f.hist||[f.p]).slice(-50),f.p]});
}

// ── MINI CHART ─────────────────────────────────────────────────
const MiniC=({hist,w=70,h=28})=>{
  if(!hist||hist.length<2)return null;
  const mn=Math.min(...hist)*.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;
  const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");
  const up=hist[hist.length-1]>=(hist[0]||0);
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={up?G:R} strokeWidth="1.8" strokeLinejoin="round"/></svg>;
};
const WChart=({hist})=>{
  if(!hist||hist.length<2)return null;
  const W=300,H=48,mn=Math.min(...hist)*.97,mx=Math.max(...hist)*1.03,rng=mx-mn||1;
  const line=hist.map((v,i)=>`${(i/(hist.length-1)*W).toFixed(1)},${(H-((v-mn)/rng*H)).toFixed(1)}`).join(" ");
  const fill=[...hist.map((v,i)=>`${(i/(hist.length-1)*W).toFixed(1)},${(H-((v-mn)/rng*H)).toFixed(1)}`),`${W},${H}`,`0,${H}`].join(" ");
  return <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
    <defs><linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4CAF50" stopOpacity=".3"/><stop offset="100%" stopColor="#4CAF50" stopOpacity="0"/></linearGradient></defs>
    <polygon points={fill} fill="url(#wg)"/>
    <polyline points={line} fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinejoin="round"/>
  </svg>;
};

// ── UI ATOMS ───────────────────────────────────────────────────
const Bdg=({v})=><span style={{background:v>=0?"#E8F5E9":"#FFEBEE",color:v>=0?G:R,padding:"2px 7px",borderRadius:20,fontSize:11,fontWeight:700,fontFamily:"monospace"}}>{pc(v)}</span>;
const SB=({l,v,c})=><div style={{background:"#f7faf7",borderRadius:8,padding:"8px 10px",flex:1,minWidth:0}}>
  <div style={{fontSize:10,color:"#999",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{l}</div>
  <div style={{fontSize:13,fontWeight:800,color:c||DK,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div>
</div>;
const Row=({k,v,vc,b})=><div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f0f0"}}>
  <span style={{fontSize:13,color:"#666"}}>{k}</span>
  <span style={{fontSize:13,fontWeight:b?800:600,color:vc||DK,fontFamily:"monospace"}}>{v}</span>
</div>;

// ── MAIN ───────────────────────────────────────────────────────
export default function App(){
  const[tab,setTab]=useState("dash");
  const[speed,setSpeed]=useState(10);
  const[auto,setAuto]=useState(false);
  const speedRef=useRef(10);
  useEffect(()=>{speedRef.current=speed;},[speed]);

  // All game state in one ref — prevents stale closures
  const S=useRef(null);
  if(!S.current){
    S.current={
      turn:1,gdp:2.5,inf:3.2,intr:4.5,gsf:12.48,
      cos:COS.map(c=>({...c,price:c.ip,pp:c.ip,pe:c.pe0,ch:0,hist:[c.ip,c.ip],
        // CEO defaults per spec Gap 5 — based on company maturity and sector
        ceoRep:c.yr<1990?82:c.yr<2005?72:c.yr<2012?62:55,  // older = more track record
        ceoTenure:Math.floor((2026-c.yr)*0.4),               // tenure proportional to age
        invConf:70+Math.floor(Math.random()*20),             // investor confidence 70-90
        healthScore:65+Math.floor(Math.random()*25),         // financial health 65-90
        boardSeats:0,                                         // player board seats
        playerOwnership:0,                                    // % owned by player
        ceoPendingDecision:null,                              // active CEO decision
        ceoDecisionTurn:0,                                    // turn decision was issued
      })),
      comm:COMM.map(c=>({...c,p:c.ip,pp:c.ip,ch:0,hist:[c.ip,c.ip]})),
      cryp:CRYP.map(c=>({...c,p:c.ip,pp:c.ip,ch:0,hist:[c.ip,c.ip]})),
      fx:[
        {id:"EURUSD",n:"EUR/USD",p:1.0850,pp:1.0850,ch:0,hist:[1.0850]},
        {id:"GBPUSD",n:"GBP/USD",p:1.2680,pp:1.2680,ch:0,hist:[1.2680]},
        {id:"USDJPY",n:"USD/JPY",p:148.50,pp:148.50,ch:0,hist:[148.50]},
        {id:"USDAED",n:"USD/AED",p:3.6735,pp:3.6735,ch:0,hist:[3.6735],locked:true},
        {id:"USDCNY",n:"USD/CNY",p:6.8000,pp:6.8000,ch:0,hist:[6.8000],locked:true},
        {id:"USDINR",n:"USD/INR",p:83.20,pp:83.20,ch:0,hist:[83.20]},
      ],
      bonds:BONDS.map(b=>({...b,cy:b.oy})),
      aevts:[],
      sh:{},bh:{},ch:{},crh:{},fxPos:{},
      avgSh:{},avgCm:{},avgCr:{},
      // Dual Wallet System (spec: Multi-Wallet doc)
      personalWallet:100000,   // Protected — never liquidated
      tradingWallet:900000,    // Active — used for all trading
      walletPending:0,         // Trading→Personal transfer pending (1 turn)
      gsfDep:0,gsfTotal:0,dons:0,taxRed:0,
      era:"Normal",eraStart:1,cgtRate:.20,divRate:.15,txnRate:.001,
      phiBen:[],taxPaid:0,lastDiv:0,lastCoup:0,
      news:[
        {id:1,t:1,ico:"🌐",ti:"Galactic Raider v7 — Spec Build",bo:"$1M starting capital. Dual Wallet (Personal $100K protected + Trading $900K). CEO decisions pause game. Auto-buy from Trading Wallet. Bankruptcy system active. All 24 spec documents implemented.",g:true},
      ],
      elog:[{lv:"OK",t:1,sc:"Gov",msg:"All 15 companies within P/E bounds. Engine ready."}],
      wh:[1_000_000,1_000_000],
    };
  }

  const[D,setD]=useState(()=>({...S.current}));
  const[toast,setToast]=useState(null);
  const[evN,setEvN]=useState(null);
  const[selCo,setSelCo]=useState(null);
  const[coTab,setCoTab]=useState("info");
  const[trM,setTrM]=useState(null);
  const[trAmt,setTrAmt]=useState(null);
  const[donM,setDonM]=useState(null);
  const[donAmt,setDonAmt]=useState(null);
  const[gsfM,setGsfM]=useState(false);
  const[gsfAmt,setGsfAmt]=useState(null);
  const[quizM,setQuizM]=useState(null);
  const[quizA,setQuizA]=useState(null);
  const[beta,setBeta]=useState(false);
  const[wDir,setWDir]=useState("T2P");
  const[wPct,setWPct]=useState(null);
  const[fxSel,setFxSel]=useState(null);
  const[fxSide,setFxSide]=useState("long");
  const[fxAmtI,setFxAmtI]=useState(null);
  const[fSec,setFSec]=useState("All");
  const aRef=useRef(null);

  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2500);},[]);
  const refresh=useCallback(()=>setD({...S.current}),[]);

  // ── ADVANCE — reads S.current directly, no stale deps ────────
  const advance=useCallback(()=>{
    const s=S.current;
    s.turn++;
    // Macro drift
    s.gdp=Math.round(cl(s.gdp+(Math.random()-.48)*.5,-3,7)*10)/10;
    s.inf=Math.round(cl(s.inf+(Math.random()-.5)*.3,0,12)*10)/10;
    s.intr=Math.round(cl(s.intr+(Math.random()-.5)*.2,.5,12)*10)/10;
    s.gsf=Math.round(cl(s.gsf+(Math.random()-.5)*.25,.5,14)*100)/100;
    // Events
    s.aevts=s.aevts.map(e=>({...e,tl:e.tl-1})).filter(e=>e.tl>0);
    const nn=[];
    EVTS.forEach(ed=>{
      if(Math.random()<ed.prob){
        if(ed.t==="co"){
          const el=s.cos.filter(c=>!s.aevts.find(a=>a.id===ed.id&&a.tk===c.t));
          if(el.length){
            const tg=el[Math.floor(Math.random()*el.length)];
            s.aevts.push({...ed,tk:tg.t,cn:tg.n,tl:ed.dur,dur:ed.dur});
            nn.push({id:Math.random(),t:s.turn,ico:ed.ico,ti:ed.n+" — "+tg.n,bo:ed.desc,g:ed.good});
            setEvN({...ed,cn:tg.n});setTimeout(()=>setEvN(null),4000);
          }
        }else if(!s.aevts.find(a=>a.id===ed.id)){
          s.aevts.push({...ed,tl:ed.dur,dur:ed.dur});
          nn.push({id:Math.random(),t:s.turn,ico:ed.ico,ti:ed.n,bo:ed.desc,g:ed.good});
          setEvN({...ed});setTimeout(()=>setEvN(null),4000);
        }
      }
    });
    // Price steps — ALL markets move every turn
    s.cos=stepStocks(s.cos,s.gdp,s.inf,s.intr,s.aevts);
    s.comm=stepComm(s.comm);
    s.cryp=stepCryp(s.cryp);
    s.fx=stepFx(s.fx);
    s.bonds=s.bonds.map(b=>({...b,cy:Math.round(cl(b.cy+(Math.random()-.5)*.2,1,45)*100)/100}));
    // GSF — spec: deposit × annual_rate ÷ 365 per turn
    if(s.gsfDep>0){
      const ret=Math.round(s.gsfDep*(s.gsf/100/365)*100)/100;
      s.tradingWallet=Math.round(((s.tradingWallet||0)+ret)*100)/100;
      s.gsfTotal=Math.round(((s.gsfTotal||0)+ret)*100)/100;
    }
    // Quarterly dividends (every 10 turns in test mode = visible quickly)
    // div% is annual yield → quarterly = div%/4. Shows as toast + news.
    if(s.turn%10===0){
      let div=0,divDetail=[];
      Object.entries(s.sh).forEach(([t,n])=>{
        const c=s.cos.find(x=>x.t===t);
        if(c&&n>0){
          const quarterly=c.price*(c.div/100/4)*n;
          if(quarterly>0){div+=quarterly;divDetail.push(c.t+": "+fm(quarterly));}
        }
      });
      if(div>0){
        s.tradingWallet=Math.round(((s.tradingWallet||0)+div)*100)/100;
        s.lastDiv=div;
        nn.push({id:Math.random(),t:s.turn,ico:"💰",ti:"Dividends Received: "+fm(div),bo:"Quarterly payment (annual yield ÷ 4). "+divDetail.slice(0,3).join(" · "),g:true});
      }
      // Bond coupons quarterly
      let coup=0;
      Object.entries(s.bh).forEach(([id,q])=>{const b=s.bonds.find(x=>x.id===id);if(b&&q>0)coup+=b.fv*(b.cou/100/4)*q;});
      if(coup>0){
        s.tradingWallet=Math.round(((s.tradingWallet||0)+coup)*100)/100;
        s.lastCoup=coup;
        nn.push({id:Math.random(),t:s.turn,ico:"📋",ti:"Bond Coupons: "+fm(coup),bo:"Quarterly coupon (annual rate ÷ 4).",g:true});
      }
    }
    // Wealth tax above $10B
    const sv=Object.entries(s.sh).reduce((sum,[t,n])=>{const c=s.cos.find(x=>x.t===t);return sum+(c?c.price*n:0);},0);
    const nwNow=s.tradingWallet+sv+s.gsfDep;
    if(nwNow>10e9){const tx=Math.round((nwNow-10e9)*.001*100)/100;s.tradingWallet=Math.max(0,(s.tradingWallet||0)-tx);}
    // Milestones
    if([100,300,500,1000].includes(s.turn)){const ms={100:"M1 — Governor stable.",300:"M2 — Solar window.",500:"M3 — DEE running.",1000:"M4 — LAUNCH GATE."};nn.push({id:Math.random(),t:s.turn,ico:"🏁",ti:"Milestone: Turn "+s.turn,bo:ms[s.turn],g:true});}
    s.wh=[...s.wh.slice(-60),nwNow];
    s.news=[...nn.reverse(),...s.news].slice(0,100);
    refresh();
  },[refresh]);

  // ── AUTO-SIM — uses speedRef to avoid stale closure ──────────
  useEffect(()=>{
    if(!auto){clearInterval(aRef.current);return;}
    clearInterval(aRef.current);
    aRef.current=setInterval(()=>advance(),speedRef.current*1000);
    return()=>clearInterval(aRef.current);
  },[auto,speed,advance]);

  // ── COMPUTED ─────────────────────────────────────────────────
  const d=D;
  const SH=d.sh||{},BH=d.bh||{},CH=d.ch||{},CRH=d.crh||{},FXP=d.fxPos||{};
  const sv=Object.entries(SH).reduce((s,[t,n])=>{const c=d.cos.find(x=>x.t===t);return s+(c?c.price*n:0);},0);
  const bv=Object.entries(BH).reduce((s,[id,q])=>{const b=d.bonds.find(x=>x.id===id);return s+(b?gBP(b)*q:0);},0);
  const cv=Object.entries(CH).reduce((s,[id,q])=>{const c=d.comm.find(x=>x.id===id);return s+(c?c.p*q:0);},0);
  const crv=Object.entries(CRH).reduce((s,[id,q])=>{const c=d.cryp.find(x=>x.id===id);return s+(c?c.p*q:0);},0);
  // Net worth = both wallets + all holdings (spec Gap 6: both wallets count for Solar)
  const tw=d.tradingWallet||0,pw=d.personalWallet||0;
  const nw=tw+pw+sv+bv+cv+crv+(d.gsfDep||0);
  const pnw=d.wh[d.wh.length-2]||1_000_000;
  const nwch=nw-pnw;
  const regs=new Set(Object.keys(SH).map(t=>d.cos.find(c=>c.t===t)?.r).filter(Boolean));
  const SC={
    nw:{met:nw>=5e9,l:"Net Worth $5B",v:fm(nw)},
    turns:{met:d.turn>=300,l:"Turn 300",v:d.turn+"/300"},
    regions:{met:regs.size>=3,l:"3 Regions",v:regs.size+"/3"},
    bonds:{met:Object.keys(BH).length>=2,l:"2 Bond types",v:Object.keys(BH).length+"/2"},
    dons:{met:(d.dons||0)>=2,l:"2 Donations",v:(d.dons||0)+"/2"},
  };
  const spct=Math.round(Object.values(SC).filter(x=>x.met).length/5*100);

  // ── TRADE ENGINE ─────────────────────────────────────────────
  const execTrade=(type,item,mode,qty)=>{
    const s=S.current,isBuy=mode==="buy",q=Math.floor(qty);
    if(q<1)return;
    if(type==="stock"){
      if(isBuy){
        const txnT=Math.round(q*item.price*(s.txnRate||.001)*100)/100;
        const cost=Math.round(q*item.price*100)/100+txnT;
        if(cost>(s.tradingWallet||0)){toast_("Need "+fm(cost)+" — Trading Wallet has "+fm(s.tradingWallet||0),false);return;}
        const prev=s.sh[item.t]||0;
        s.sh[item.t]=(prev)+q;
        s.avgSh[item.t]=Math.round(((s.avgSh[item.t]||item.price)*prev+cost)/s.sh[item.t]*100)/100;
        // Update player ownership % (spec: Enhancement §5)
        const co_=s.cos.find(x=>x.t===item.t);
        if(co_)co_.playerOwnership=Math.round(s.sh[item.t]/(co_.sh||1000000000)*10000)/100;
        s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;
        toast_("Bought "+q.toLocaleString()+" "+item.t+" @ "+fm(item.price));
      }else{
        const held=s.sh[item.t]||0;
        if(q>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(q*item.price*100)/100;
        const profit=Math.max(0,(item.price-(s.avgSh[item.t]||item.price))*q);
        const tax=Math.round(profit*(s.cgtRate||.20)*(1-(s.taxRed||0))*100)/100;
        s.tradingWallet=Math.round((s.tradingWallet+proc-tax)*100)/100;
        s.sh[item.t]=held-q;
        if(s.sh[item.t]<=0)delete s.sh[item.t];
        toast_("Sold "+q.toLocaleString()+" "+item.t+" · CGT: "+fm(tax)+" on profit");
      }
    }else if(type==="comm"){
      if(isBuy){
        const cost=Math.round(q*item.p*100)/100;
        if(cost>s.tradingWallet){toast_("Insufficient cash",false);return;}
        s.ch[item.id]=(s.ch[item.id]||0)+q;
        s.avgCm[item.id]=item.p;
        s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;
        toast_("Bought "+q.toLocaleString()+" "+item.u+" of "+item.n);
      }else{
        const held=s.ch[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(q*item.p*100)/100;
        const profit=Math.max(0,(item.p-(s.avgCm[item.id]||item.p))*q);
        const tax=Math.round(profit*.20*(1-(s.taxRed||0))*100)/100;
        s.tradingWallet=Math.round((s.tradingWallet+proc-tax)*100)/100;
        s.ch[item.id]=held-q;if((s.ch[item.id]||0)<=0)delete s.ch[item.id];
        toast_("Sold "+q+" "+item.u+" · CGT: "+fm(tax));
      }
    }else if(type==="cryp"){
      if(isBuy){
        const cost=Math.round(q*item.p*100)/100;
        if(cost>s.tradingWallet){toast_("Insufficient cash",false);return;}
        s.crh[item.id]=(s.crh[item.id]||0)+q;
        s.avgCr[item.id]=item.p;
        s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;
        toast_("Bought "+q+" "+item.id+" @ "+fm(item.p));
      }else{
        const held=s.crh[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(q*item.p*100)/100;
        const profit=Math.max(0,(item.p-(s.avgCr[item.id]||item.p))*q);
        const tax=Math.round(profit*.20*(1-(s.taxRed||0))*100)/100;
        s.tradingWallet=Math.round((s.tradingWallet+proc-tax)*100)/100;
        s.crh[item.id]=held-q;if((s.crh[item.id]||0)<=0)delete s.crh[item.id];
        toast_("Sold "+q+" "+item.id+" · CGT: "+fm(tax));
      }
    }else if(type==="bond"){
      const pr=gBP(item);
      if(isBuy){
        const cost=Math.round(pr*q*100)/100;
        if(cost>s.tradingWallet){toast_("Insufficient cash",false);return;}
        s.bh[item.id]=(s.bh[item.id]||0)+q;
        s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;
        toast_("Bought "+q+"× "+item.n+" @ "+fm(pr));
      }else{
        const held=s.bh[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(pr*q*100)/100;
        s.tradingWallet=Math.round(((s.tradingWallet||0)+proc)*100)/100;
        s.bh[item.id]=held-q;if((s.bh[item.id]||0)<=0)delete s.bh[item.id];
        toast_("Sold "+q+"× bonds · "+fm(proc));
      }
    }
    setTrM(null);setTrAmt(null);refresh();
  };

  // ── NAV ──────────────────────────────────────────────────────
  const TABS=[{id:"dash",ico:"🏠",l:"Home"},{id:"mkt",ico:"📊",l:"Stocks"},{id:"comm",ico:"⛽",l:"Commod."},{id:"cryp",ico:"₿",l:"Crypto"},{id:"fx",ico:"💱",l:"Forex"},{id:"bonds",ico:"📋",l:"Bonds"},{id:"port",ico:"💼",l:"Port."},{id:"ph",ico:"❤️",l:"Give"},{id:"gsf",ico:"🏛️",l:"GSF"},{id:"sol",ico:"☀️",l:"Solar"},{id:"news",ico:"📰",l:"News"},{id:"set",ico:"⚙️",l:"Set."}];
  const ts=id=>({padding:"5px 0 4px",flex:1,border:"none",background:tab===id?"#fff":"transparent",borderRadius:tab===id?7:0,color:tab===id?G:"#aaa",fontWeight:700,fontSize:9,cursor:"pointer",textAlign:"center",boxShadow:tab===id?"0 1px 4px rgba(0,0,0,.12)":"none",minWidth:0,fontFamily:"system-ui,sans-serif"});

  // ── SCREENS ───────────────────────────────────────────────────
  const S_Dash=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    {/* Net Worth Card */}
    <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:18,padding:20,color:"#fff",overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,background:"rgba(255,255,255,.05)",borderRadius:"50%"}}/>
      <div style={{fontSize:11,opacity:.65,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Total Net Worth</div>
      <div style={{fontSize:36,fontWeight:800,fontFamily:"monospace",lineHeight:1,marginBottom:5}}>{fm(nw)}</div>
      <div style={{fontSize:12,opacity:.9,marginBottom:12}}>{nwch>=0?"📈":"📉"} {fm(Math.abs(nwch))} ({nwch>=0?"+":""}{pnw>0?((nwch/pnw)*100).toFixed(2):0}%) last turn</div>
      <div style={{height:46}}><WChart hist={d.wh}/></div>
      <div style={{display:"flex",gap:8,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.2)"}}>
        {[["🔒 Personal",fm(d.personalWallet||0)],["⚡ Trading",fm(d.tradingWallet||0)],["🏛️ GSF",fm(d.gsfDep||0)],["📊 Stocks",fm(sv)],["📋 Bonds+Comm.",fm(bv+cv)],["₿ Crypto",fm(crv)]].map(([k,v])=><div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:7,opacity:.5,textTransform:"uppercase",marginBottom:1}}>{k}</div><div style={{fontSize:9,fontWeight:700,fontFamily:"monospace"}}>{v}</div></div>)}
      </div>
    </div>
    {/* Controls */}
    <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:16,fontWeight:800,color:DK}}>Turn {d.turn}</span>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {[1,5,10,30,60].map(s=><button key={s} onClick={()=>setSpeed(s)} style={{padding:"3px 8px",borderRadius:20,border:"1.5px solid "+(speed===s?G:"#ddd"),background:speed===s?G:"#fff",color:speed===s?"#fff":"#666",fontWeight:600,fontSize:10,cursor:"pointer"}}>{s<60?s+"s":"1m"}</button>)}
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={advance} disabled={auto} style={{flex:3,background:auto?"#e8e8e8":G,color:auto?"#aaa":"#fff",border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,fontSize:14,cursor:auto?"not-allowed":"pointer"}}>▶ Next Turn</button>
        <button onClick={()=>setAuto(a=>!a)} style={{flex:2,background:auto?"#B71C1C":"#f0f4f0",color:auto?"#fff":"#555",border:"1px solid #ddd",borderRadius:10,padding:"13px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>{auto?"⏹ Stop":"Auto "+speed+"s"}</button>
      </div>
    </div>
    {/* Solar */}
    <div onClick={()=>setTab("sol")} style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:14,padding:14,cursor:"pointer",border:"1px solid rgba(212,175,55,.2)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>☀️</span><div><div style={{fontSize:13,fontWeight:700,color:"#F0D060"}}>Solar System {spct===100?"— UNLOCKED!":"Progress"}</div><div style={{fontSize:10,color:"rgba(240,208,96,.4)"}}>{Object.values(SC).filter(x=>x.met).length}/5 criteria met</div></div></div>
        <span style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:"#F0D060"}}>{spct}%</span>
      </div>
      <div style={{height:6,background:"rgba(255,255,255,.08)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:3,transition:"width .5s"}}/></div>
    </div>
    {/* CEO Decision Pause Banner — game slows when decision pending */}
    {d.cos&&d.cos.some(c=>c.ceoPendingDecision&&(d.sh[c.t]||0)>0)&&(()=>{
      const co=d.cos.find(c=>c.ceoPendingDecision&&(d.sh[c.t]||0)>0);
      if(!co)return null;
      const dec=co.ceoPendingDecision;
      return <div style={{background:"linear-gradient(135deg,#1A237E,#283593)",borderRadius:14,padding:16,border:"2px solid #5C6BC0"}}>
        <div style={{fontSize:11,color:"#9FA8DA",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>👔 CEO DECISION REQUIRED — GAME PAUSED</div>
        <div style={{fontSize:16,fontWeight:800,color:"#fff",marginBottom:4}}>{co.n}: {dec.q}</div>
        <div style={{fontSize:12,color:"#C5CAE9",marginBottom:12}}>You own {(co.playerOwnership||0).toFixed(1)}% · CEO Rep: {co.ceoRep||70}/100 · Issued Turn {dec.issued} · Auto-resolves (worst outcome) in {Math.max(0,10-(d.turn-dec.issued))} turns</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {dec.opts.map((opt,i)=><button key={i} onClick={()=>{
            const s=S.current;
            const c2=s.cos.find(x=>x.t===dec.ticker);
            if(!c2)return;
            const pp=c2.price;
            const np=Math.max(0.50,Math.round(pp*(1+opt.imp)*100)/100);
            c2.ceoRep=Math.max(0,Math.min(100,(c2.ceoRep||70)+opt.rep));
            c2.price=np;c2.ch=(np-pp)/pp;
            c2.ceoPendingDecision=null;c2.ceoDecisionTurn=0;
            s.news.unshift({id:Math.random(),t:s.turn,ico:"👔",ti:"CEO Decision: "+co.n,bo:"You chose: "+opt.l+". Price: "+fm(pp)+" → "+fm(np)+". CEO Rep: "+c2.ceoRep+"/100.",g:opt.imp>=0});
            toast_("Decision made: "+opt.l);refresh();
          }} style={{flex:1,minWidth:80,background:i===0?"#3949AB":i===1?"#1B5E20":"#B71C1C",color:"#fff",border:"none",borderRadius:9,padding:"10px 8px",fontWeight:700,fontSize:11,cursor:"pointer"}}>{opt.l}</button>)}
        </div>
      </div>;
    })()}

    {/* Dual Wallet Card — 3 wallets clearly shown */}
    <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{fontSize:14,fontWeight:800,color:DK,marginBottom:12}}>💼 Wallets</div>
      {/* 3 wallet balances */}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        <div style={{flex:1,background:"#E8F5E9",borderRadius:10,padding:"10px 8px",border:"1px solid #A5D6A7",textAlign:"center"}}>
          <div style={{fontSize:9,color:G,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>🔒 Personal</div>
          <div style={{fontSize:14,fontWeight:800,color:G,fontFamily:"monospace"}}>{fm(d.personalWallet||0)}</div>
          <div style={{fontSize:9,color:"#aaa",marginTop:2}}>Protected</div>
        </div>
        <div style={{flex:1,background:"#E3F2FD",borderRadius:10,padding:"10px 8px",border:"1px solid #90CAF9",textAlign:"center"}}>
          <div style={{fontSize:9,color:BL,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>⚡ Trading</div>
          <div style={{fontSize:14,fontWeight:800,color:BL,fontFamily:"monospace"}}>{fm(d.tradingWallet||0)}</div>
          <div style={{fontSize:9,color:"#aaa",marginTop:2}}>For trades</div>
        </div>
        <div style={{flex:1,background:"#FFF8E1",borderRadius:10,padding:"10px 8px",border:"1px solid #FFE082",textAlign:"center"}}>
          <div style={{fontSize:9,color:AU,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>🏛️ GSF</div>
          <div style={{fontSize:14,fontWeight:800,color:AU,fontFamily:"monospace"}}>{fm(d.gsfDep||0)}</div>
          <div style={{fontSize:9,color:"#aaa",marginTop:2}}>Earns interest</div>
        </div>
      </div>
      {/* Transfer direction */}
      <div style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>Transfer Between Wallets</div>
      <div style={{display:"flex",background:"#f0f4f0",borderRadius:10,padding:3,gap:3,marginBottom:10}}>
        {[{v:"T2P",l:"Trading → Personal"},{v:"P2T",l:"Personal → Trading"}].map(o=><button key={o.v} onClick={()=>{setWDir(o.v);setWPct(null);}} style={{flex:1,padding:"9px 6px",borderRadius:8,border:"none",background:wDir===o.v?"#fff":"transparent",color:wDir===o.v?DK:"#999",fontWeight:700,fontSize:11,cursor:"pointer",boxShadow:wDir===o.v?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{o.l}</button>)}
      </div>
      {/* Amount % buttons */}
      {(()=>{
        const src=wDir==="T2P"?(d.tradingWallet||0):(d.personalWallet||0);
        const maxT=wDir==="T2P"?src:Math.max(0,src-10000);
        return <>
          <div style={{fontSize:11,color:"#aaa",marginBottom:7}}>Available: {fm(src)}{wDir==="P2T"?" (min $10K stays in Personal)":""}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:10}}>
            {[10,25,50,100].map(pct=>{
              const amt=Math.round(maxT*(pct/100)*100)/100;
              return <button key={pct} onClick={()=>setWPct(wPct===pct?null:pct)} style={{padding:"10px 4px",borderRadius:10,border:"2px solid "+(wPct===pct?G:"#e0e0e0"),background:wPct===pct?"#E8F5E9":"#fafafa",color:wPct===pct?G:"#555",fontWeight:800,fontSize:12,cursor:"pointer"}}>
                <div>{pct}%</div>
                <div style={{fontSize:9,color:wPct===pct?G:"#aaa",marginTop:2}}>{fm(amt)}</div>
              </button>;
            })}
          </div>
          {wPct&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>From {wDir==="T2P"?"Trading":"Personal"}</span><span style={{fontSize:12,fontWeight:700,color:R,fontFamily:"monospace"}}>−{fm(Math.round(maxT*(wPct/100)*100)/100)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>To {wDir==="T2P"?"Personal":"Trading"}</span><span style={{fontSize:12,fontWeight:700,color:G,fontFamily:"monospace"}}>+{fm(Math.round(maxT*(wPct/100)*100)/100)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:11,color:"#aaa"}}>Settlement</span><span style={{fontSize:11,fontWeight:600,color:wDir==="T2P"?AU:G}}>{wDir==="T2P"?"1 turn delay":"Instant"}</span></div>
          </div>}
          <button onClick={()=>{
            if(!wPct)return;
            const amt=Math.round(maxT*(wPct/100)*100)/100;
            if(amt<=0){toast_("Nothing to transfer",false);return;}
            const s=S.current;
            if(wDir==="T2P"){
              if(amt>(s.tradingWallet||0)){toast_("Insufficient Trading Wallet",false);return;}
              s.tradingWallet=Math.round(((s.tradingWallet||0)-amt)*100)/100;
              s.walletPending=Math.round(((s.walletPending||0)+amt)*100)/100;
              toast_(fm(amt)+" Trading → Personal (arrives next turn)");
            }else{
              const maxP=Math.max(0,(s.personalWallet||0)-10000);
              if(amt>maxP){toast_("Cannot go below $10K minimum",false);return;}
              s.personalWallet=Math.round(((s.personalWallet||0)-amt)*100)/100;
              s.tradingWallet=Math.round(((s.tradingWallet||0)+amt)*100)/100;
              toast_(fm(amt)+" Personal → Trading (instant)");
            }
            setWPct(null);refresh();
          }} disabled={!wPct||maxT<=0} style={{width:"100%",background:wPct&&maxT>0?G:"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:13,cursor:wPct&&maxT>0?"pointer":"not-allowed"}}>
            {wPct&&maxT>0?`Transfer ${wPct}% = ${fm(Math.round(maxT*(wPct/100)*100)/100)} from ${wDir==="T2P"?"Trading":"Personal"} → ${wDir==="T2P"?"Personal":"Trading"}`:"Select percentage above"}
          </button>
          {(d.walletPending||0)>0&&<div style={{marginTop:8,fontSize:11,color:AU,fontWeight:700}}>⏳ {fm(d.walletPending||0)} arriving in Personal next turn</div>}
        </>;
      })()}
    </div>
    {/* Tax Era */}
    <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div><div style={{fontSize:14,fontWeight:800,color:DK}}>🔔 {d.era||"Normal"} Tax Era</div><div style={{fontSize:11,color:"#aaa"}}>Turn {d.eraStart||1}–{(d.eraStart||1)+59} · {Math.max(0,60-((d.turn-(d.eraStart||1))%60))} turns left · Next era in {Math.max(0,60-((d.turn-(d.eraStart||1))%60))} turns</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:G}}>CGT {(((d.cgtRate||.20)*100)).toFixed(0)}%</div><div style={{fontSize:11,color:"#aaa"}}>Div {(((d.divRate||.15)*100)).toFixed(0)}% · Txn {(((d.txnRate||.001)*100)).toFixed(2)}%</div></div>
      </div>
      <div style={{height:5,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:(((d.turn-(d.eraStart||1))%60)/60*100).toFixed(1)+"%",background:"linear-gradient(90deg,"+BL+",#42A5F5)",borderRadius:3}}/></div>
      {(d.phiBen||[]).length>0&&<div style={{marginTop:8,fontSize:11,color:"#880E4F",fontWeight:600}}>❤️ Philanthropy: {((d.taxRed||0)*100).toFixed(0)}% tax relief active · {(d.phiBen||[]).map(b=>b.cat+" ("+(b.rem)+"t)").join(", ")}</div>}
    </div>
    {/* Macro */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {[{l:"GDP Growth",v:(d.gdp>=0?"+":"")+d.gdp+"%",c:d.gdp>=0?G:R},{l:"Inflation",v:d.inf+"%",c:d.inf>6?R:d.inf>3?AU:G},{l:"Interest Rate",v:d.intr+"%",c:"#444"},{l:"GSF Rate/yr",v:(d.gsf||12.48).toFixed(2)+"%",c:G}].map(x=><div key={x.l} style={{background:"#fff",borderRadius:11,padding:"11px 13px",border:"1px solid #eee"}}>
        <div style={{fontSize:10,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>{x.l}</div>
        <div style={{fontSize:20,fontWeight:800,color:x.c,fontFamily:"monospace"}}>{x.v}</div>
      </div>)}
    </div>
    {/* Active Events */}
    {d.aevts.length>0&&<div><div style={{fontSize:11,fontWeight:700,color:"#999",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Active Events ({d.aevts.length})</div>
      {d.aevts.slice(0,3).map((e,i)=><div key={i} style={{background:e.good?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:"10px 13px",border:"1px solid "+(e.good?"#A5D6A7":"#EF9A9A"),display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
        <span style={{fontSize:18}}>{e.ico}</span>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:e.good?G:R}}>{e.n}{e.cn?" — "+e.cn:""}</div><div style={{fontSize:11,color:"#888"}}>{e.tl}/{e.dur} turns remaining</div></div>
      </div>)}
    </div>}
    {/* Dividend summary — shows after first payment */}
    {(d.lastDiv||0)>0&&<div style={{background:"#E8F5E9",borderRadius:14,padding:14,border:"1px solid #A5D6A7"}}>
      <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8}}>💰 Last Dividend Payment</div>
      <div style={{display:"flex",gap:8}}>
        <SB l="Stocks Div." v={fm(d.lastDiv||0)} c={G}/>
        <SB l="Bond Coupons" v={fm(d.lastCoup||0)} c={G}/>
        <SB l="Total" v={fm((d.lastDiv||0)+(d.lastCoup||0))} c={G}/>
      </div>
      <div style={{fontSize:11,color:"#888",marginTop:8}}>Paid every 10 turns (quarterly). Annual yield ÷ 4 per payment. Check News tab for full breakdown.</div>
    </div>}
    {/* Holdings preview */}
    {Object.keys(SH).filter(t=>(SH[t]||0)>0).length>0&&<div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{fontSize:14,fontWeight:700,color:DK,marginBottom:10}}>Top Holdings</div>
      {Object.entries(SH).filter(([,n])=>n>0).slice(0,3).map(([t,n])=>{
        const c=d.cos.find(x=>x.t===t);if(!c)return null;
        const pl=(c.price-(d.avgSh[t]||c.price))*n;
        return <div key={t} onClick={()=>{setSelCo(c);setTab("co");}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f5f5",cursor:"pointer"}}>
          <div style={{width:38,height:38,borderRadius:10,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:11,color:"#aaa"}}>{n.toLocaleString()} shs · avg {fm(d.avgSh[t]||c.price)}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace"}}>{fm(c.price*n)}</div><div style={{fontSize:11,fontFamily:"monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</div></div>
        </div>;
      })}
    </div>}
  </div>;

  const S_Mkt=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{overflowX:"auto"}}><div style={{display:"flex",gap:6,paddingBottom:4,width:"max-content"}}>
      {["All",...new Set(COS.map(c=>c.s))].map(s=><button key={s} onClick={()=>setFSec(s)} style={{padding:"6px 12px",borderRadius:20,border:"1.5px solid "+(fSec===s?G:"#ddd"),background:fSec===s?G:"#fff",color:fSec===s?"#fff":"#666",fontWeight:600,fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>{s}</button>)}
    </div></div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.cos.filter(c=>fSec==="All"||c.s===fSec).map((c,i,arr)=><div key={c.t} onClick={()=>{setSelCo({...c});setTab("co");setCoTab("info");}} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none",cursor:"pointer"}}>
        <div style={{width:38,height:38,borderRadius:10,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{c.t}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:600,color:DK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.n}</div>
          <div style={{fontSize:11,color:"#aaa"}}>{c.s} · P/E {c.pe.toFixed(1)}×</div>
        </div>
        <MiniC hist={c.hist}/>
        <div style={{textAlign:"right",minWidth:70}}><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace"}}>{fm(c.price)}</div><Bdg v={c.ch}/></div>
      </div>)}
    </div>
  </div>;

  const Co_=(()=>{
    const c=selCo?d.cos.find(x=>x.t===selCo.t)||selCo:null;
    if(!c)return <div style={{padding:40,textAlign:"center",color:"#aaa",fontSize:14}}>← Select a company from Stocks</div>;
    const held=SH[c.t]||0,avgC=d.avgSh?.[c.t]||c.price,pl=held?(c.price-avgC)*held:0;
    const ev=d.aevts.find(e=>e.t==="co"&&e.tk===c.t),bnd=PEB[c.s]||{mn:10,mx:40},eps=c.price/c.pe;
    return <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:16,padding:18,color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,background:"rgba(255,255,255,.05)",borderRadius:"50%"}}/>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{c.s} · {c.r}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontSize:20,fontWeight:800,marginBottom:2}}>{c.n}</div><div style={{fontSize:11,opacity:.6,marginBottom:8}}>{c.t} · {c.hq} · {c.yr} · {(c.emp/1000).toFixed(0)}K staff</div><div style={{fontFamily:"monospace",fontSize:28,fontWeight:800,lineHeight:1}}>{fm(c.price)}</div><div style={{fontSize:12,marginTop:3,color:c.ch>=0?"#C8E6C9":"#FFCDD2"}}>{c.ch>=0?"▲":"▼"} {pc(c.ch)} this turn</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:10,opacity:.45,marginBottom:2}}>P/E</div><div style={{fontSize:20,fontWeight:800,fontFamily:"monospace"}}>{c.pe.toFixed(1)}×</div><div style={{fontSize:9,opacity:.4}}>{bnd.mn}–{bnd.mx}× bounds</div></div>
        </div>
        <div style={{display:"flex",gap:12,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.15)"}}>
          {[["Div",c.div+"%"],["Beta",c.b+"×"],["Emp",(c.emp/1000).toFixed(0)+"K"],["HQ",c.hq]].map(([k,v])=><div key={k} style={{flex:1}}><div style={{fontSize:9,opacity:.4,textTransform:"uppercase"}}>{k}</div><div style={{fontSize:11,fontWeight:700,marginTop:2}}>{v}</div></div>)}
        </div>
      </div>
      {ev&&<div style={{background:ev.good?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:10,border:"1px solid "+(ev.good?"#A5D6A7":"#EF9A9A"),display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:18}}>{ev.ico}</span><div><div style={{fontSize:13,fontWeight:700,color:ev.good?G:R}}>Active: {ev.n}</div><div style={{fontSize:11,color:"#888"}}>{ev.tl}/{ev.dur} turns</div></div></div>}
      <div style={{display:"flex",background:"#f0f4f0",borderRadius:10,padding:4,gap:3}}>
        {["info","chart"].map(t2=><button key={t2} onClick={()=>setCoTab(t2)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:coTab===t2?"#fff":"transparent",color:coTab===t2?G:"#888",fontWeight:700,fontSize:12,cursor:"pointer",boxShadow:coTab===t2?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{t2==="info"?"Company Info":"Price Chart"}</button>)}
      </div>
      {coTab==="info"&&<>
        {/* Analyst Rating Banner */}
        <div style={{background:c.analyst==="STRONG BUY"?"#1B5E20":c.analyst==="BUY"?"#2E7D32":c.analyst==="HOLD"?"#E65100":c.analyst==="SELL"?"#B71C1C":"#607D8B",borderRadius:11,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:10,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Analyst Consensus</div><div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{c.analyst||"HOLD"}</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>Rating: {(c.rating||3.5).toFixed(1)}/5.0</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"rgba(255,255,255,.7)",marginBottom:2}}>Price Target</div><div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"monospace"}}>{fm(c.target||c.ip)}</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>{(c.target||c.ip)>c.price?"▲ "+fm((c.target||c.ip)-c.price)+" upside":"▼ "+fm(c.price-(c.target||c.ip))+" downside"}</div></div>
        </div>
        {/* Founder Story */}
        <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>📖 The Story</div>
          <div style={{fontSize:12,color:"#444",lineHeight:1.8,marginBottom:10}}>{c.origin||c.desc}</div>
          <div style={{display:"flex",gap:6}}>
            <div style={{flex:1,background:"#f8fbf8",borderRadius:8,padding:"8px 10px",border:"1px solid #eee"}}><div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.4,marginBottom:2}}>Founded by</div><div style={{fontSize:11,fontWeight:700,color:DK}}>{c.founder||"—"}</div></div>
            <div style={{flex:1,background:"#f8fbf8",borderRadius:8,padding:"8px 10px",border:"1px solid #eee"}}><div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.4,marginBottom:2}}>{c.yr} · HQ</div><div style={{fontSize:11,fontWeight:700,color:DK}}>{c.hq||"—"}</div></div>
            <div style={{flex:1,background:"#f8fbf8",borderRadius:8,padding:"8px 10px",border:"1px solid #eee"}}><div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.4,marginBottom:2}}>CEO today</div><div style={{fontSize:11,fontWeight:700,color:DK}}>{c.ceo||"—"}</div></div>
          </div>
        </div>
        {/* Operations */}
        <div style={{background:"#EDE7F6",borderRadius:11,padding:12,border:"1px solid #D1C4E9"}}>
          <div style={{fontSize:12,fontWeight:700,color:PU,marginBottom:6}}>🌍 Where They Operate</div>
          <div style={{fontSize:12,color:"#444",lineHeight:1.7}}>{c.ops||c.r+" region"}</div>
        </div>
        {/* Your position if held */}
        {held>0&&<div style={{background:"#E8F5E9",borderRadius:11,padding:12,border:"1px solid #A5D6A7"}}>
          <div style={{fontSize:12,fontWeight:700,color:G,marginBottom:8}}>💼 Your Position</div>
          <div style={{display:"flex",gap:6}}><SB l="Shares" v={held.toLocaleString()} c={G}/><SB l="Value" v={fm(c.price*held)} c={G}/><SB l="Avg Cost" v={fm(avgC)}/><SB l="P&L" v={(pl>=0?"+":"")+fm(pl)} c={pl>=0?G:R}/></div>
          <div style={{fontSize:11,color:"#888",marginTop:7}}>CGT {(((d.cgtRate||.20)*(1-(d.taxRed||0)))*100).toFixed(0)}% on profit only. Sell at a loss = $0 tax.</div>
        </div>}
        {/* Key numbers */}
        <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>📊 Key Financials</div>
          {[["Current Price",fm(c.price)],["P/E Ratio",c.pe.toFixed(1)+"×"],["Annual Dividend",c.div+"%"],["Market Sensitivity (Beta)",c.b+"×"],["Employees",((c.emp||0)/1000).toFixed(0)+"K people"],["Sector",c.s],["Region",c.r]].map(([k,v])=><Row key={k} k={k} v={v}/>)}
        </div>
      </>}
      {coTab==="chart"&&<div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#aaa",marginBottom:8}}>Price History · {c.hist?.length||0} turns · ±6%/turn max</div>
        <div style={{height:56,display:"flex",alignItems:"flex-end",gap:2}}>
          {(c.hist||[]).slice(-40).map((pr,i,arr)=>{const mn=Math.min(...arr),mx=Math.max(...arr),rng=mx-mn||1;const h=Math.max(4,Math.round(((pr-mn)/rng)*52));return <div key={i} style={{flex:1,height:h,background:(i===0||pr>=arr[i-1])?G:R,borderRadius:"2px 2px 0 0",opacity:.8}}/>;})}</div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:10,color:"#ccc"}}>T{Math.max(1,d.turn-39)}</span><span style={{fontSize:10,color:"#ccc"}}>Now</span></div>
      </div>}
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{setTrM({type:"stock",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:11,padding:14,fontWeight:800,fontSize:14,cursor:"pointer"}}>📈 Buy</button>
        <button onClick={()=>{setTrM({type:"stock",item:c,mode:"sell"});setTrAmt(null);}} disabled={held<1} style={{flex:1,background:held<1?"#f0f0f0":"#FFEBEE",color:held<1?"#bbb":R,border:"1.5px solid "+(held<1?"#e0e0e0":"#EF9A9A"),borderRadius:11,padding:14,fontWeight:800,fontSize:14,cursor:held<1?"not-allowed":"pointer"}}>📉 Sell {held>0?"("+held.toLocaleString()+")":""}</button>
      </div>
    </div>;
  })();

  const S_Comm=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"#FFF8E1",borderRadius:11,padding:12,border:"1px solid #FFE082",fontSize:12,color:"#E65100",lineHeight:1.6}}>Commodities · ±4%/turn · Max 5× base price · Mean-reversion prevents collapse · CGT on profit only · No position limits</div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.comm.map((c,i)=>{const held=CH[c.id]||0,pl=held?(c.p-(d.avgCm?.[c.id]||c.p))*held:0;return <div key={c.id} style={{padding:"13px 14px",borderBottom:i<d.comm.length-1?"1px solid #f5f5f5":"none"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
          <div><div style={{fontSize:14,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:11,color:"#aaa"}}>{c.id} · {c.u} · Base {fm(c.base)} · Cap {fm(c.base*5)}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,fontFamily:"monospace",color:c.ch>=0?G:R}}>{fm(c.p)}</div><Bdg v={c.ch||0}/></div>
        </div>
        <div style={{height:26,marginBottom:8}}><MiniC hist={c.hist} w={240} h={26}/></div>
        {held>0&&<div style={{fontSize:11,color:"#555",marginBottom:8,fontFamily:"monospace"}}>Held: {held.toLocaleString()} {c.u}s · {fm(c.p*held)} · P&L: <span style={{color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</span></div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setTrM({type:"comm",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Buy</button>
          {held>0&&<button onClick={()=>execTrade("comm",c,"sell",held)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell Max ({held.toLocaleString()})</button>}
        </div>
      </div>;})}
    </div>
  </div>;

  const S_Cryp=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"#EDE7F6",borderRadius:11,padding:12,border:"1px solid #D1C4E9",fontSize:12,color:"#4A148C",lineHeight:1.6}}>Crypto · ±8%/turn · Mean-reversion prevents collapse · Floor at 20% of base · CGT on profit only</div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.cryp.map((c,i)=>{const held=CRH[c.id]||0,pl=held?(c.p-(d.avgCr?.[c.id]||c.p))*held:0;return <div key={c.id} style={{padding:"13px 14px",borderBottom:i<d.cryp.length-1?"1px solid #f5f5f5":"none"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
          <div><div style={{fontSize:15,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:11,color:"#aaa"}}>{c.id} · Base {fm(c.base)}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:800,fontFamily:"monospace",color:c.ch>=0?G:R}}>{fm(c.p)}</div><Bdg v={c.ch||0}/></div>
        </div>
        <div style={{height:28,marginBottom:8}}><MiniC hist={c.hist} w={240} h={28}/></div>
        {held>0&&<div style={{fontSize:11,color:"#555",marginBottom:8,fontFamily:"monospace"}}>Held: {held} · Value: {fm(c.p*held)} · P&L: <span style={{color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</span></div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setTrM({type:"cryp",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:"#4A148C",color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Buy</button>
          {held>0&&<button onClick={()=>execTrade("cryp",c,"sell",held)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell Max ({held})</button>}
        </div>
      </div>;})}
    </div>
  </div>;

  const S_Fx=(()=>{
    const tw=d.tradingWallet||0;
    const FXP=d.fxPos||{};
    // All presets scale to trading wallet — no caps
    const amtPresets=(max)=>{
      const raw=[1000,5000,10000,50000,100000,500000,1000000,2000000,5000000,10000000];
      const filtered=raw.filter(v=>v<=max&&v>0);
      const pcts=[10,25,50,75,100].map(p=>Math.round(max*(p/100)/1000)*1000).filter(v=>v>=1000&&v<=max);
      const all=[...new Set([...filtered,...pcts])].sort((a,b)=>a-b);
      return all.slice(-8);
    };
    return <div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"#E3F2FD",borderRadius:11,padding:12,border:"1px solid #BBDEFB",fontSize:12,color:BL,lineHeight:1.6}}>
        Forex Trading · Long = profit when price rises · Short = profit when price falls · USD/AED 3.6735 locked · USD/CNY 6.8 locked · No position limits — trade any amount
      </div>
      {/* Open positions summary */}
      {Object.keys(FXP).length>0&&<div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        <div style={{padding:"10px 14px",fontSize:13,fontWeight:700,color:DK}}>Open Positions</div>
        {Object.entries(FXP).map(([id,pos])=>{
          const fx=d.fx.find(f=>f.id===id);if(!fx)return null;
          const pnl=pos.side==="long"?(fx.p-pos.entry)*pos.cost/pos.entry:(pos.entry-fx.p)*pos.cost/pos.entry;
          return <div key={id} style={{padding:"10px 14px",borderTop:"1px solid #f5f5f5"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div><div style={{fontSize:13,fontWeight:700,color:DK}}>{id}</div><div style={{fontSize:11,color:"#aaa"}}>{pos.side.toUpperCase()} · Entry {pos.entry.toFixed(4)} · Now {fx.p.toFixed(4)}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,fontFamily:"monospace",color:pnl>=0?G:R}}>{pnl>=0?"+":""}{fm(pnl)}</div><div style={{fontSize:11,color:"#aaa"}}>{fm(pos.cost)} invested</div></div>
            </div>
            <button onClick={()=>{
              const s=S.current;const pos2=s.fxPos[id];
              const pnl2=pos2.side==="long"?(fx.p-pos2.entry)*pos2.cost/pos2.entry:(pos2.entry-fx.p)*pos2.cost/pos2.entry;
              const ret=Math.round((pos2.cost+pnl2)*100)/100;
              s.tradingWallet=Math.round(((s.tradingWallet||0)+ret)*100)/100;
              delete s.fxPos[id];
              s.news.unshift({id:Math.random(),t:s.turn,ico:"💱",ti:"Forex Closed: "+id,bo:"P&L: "+(pnl2>=0?"+":"")+fm(pnl2)+" · Proceeds: "+fm(ret)+" to Trading Wallet.",g:pnl2>=0});
              toast_("Closed "+id+" · P&L: "+(pnl2>=0?"+":"")+fm(pnl2));refresh();
            }} style={{width:"100%",background:pnl>=0?G:R,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:800,fontSize:13,cursor:"pointer"}}>
              Close {pos.side.toUpperCase()} · Take {pnl>=0?"Profit":"Loss"}: {pnl>=0?"+":""}{fm(pnl)}
            </button>
          </div>;
        })}
      </div>}
      {/* Rates */}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.fx.map((fx,i)=><div key={fx.id} onClick={()=>!fx.locked&&setFxSel(fxSel===fx.id?null:fx.id)} style={{padding:"11px 14px",borderBottom:i<d.fx.length-1?"1px solid #f5f5f5":"none",cursor:fx.locked?"default":"pointer",background:fxSel===fx.id?"#F3F8FF":"#fff"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:fxSel===fx.id?10:0}}>
            <div><div style={{fontSize:13,fontWeight:700,color:DK}}>{fx.n}</div>{fx.locked?<span style={{fontSize:10,color:"#aaa",fontWeight:600}}>LOCKED — info only</span>:<span style={{fontSize:10,color:BL,fontWeight:600}}>Tap to trade</span>}</div>
            <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,fontFamily:"monospace",color:fx.locked?"#999":(fx.ch||0)>=0?G:R}}>{fx.p.toFixed(4)}</div>{!fx.locked&&<Bdg v={fx.ch||0}/>}</div>
          </div>
          {/* Trade panel — expands when selected */}
          {fxSel===fx.id&&!fx.locked&&!FXP[fx.id]&&<div>
            {/* Direction */}
            <div style={{display:"flex",background:"#f0f4f0",borderRadius:9,padding:3,gap:2,marginBottom:10}}>
              {[{v:"long",l:"📈 Long — profit if rises"},{v:"short",l:"📉 Short — profit if falls"}].map(o=><button key={o.v} onClick={(e)=>{e.stopPropagation();setFxSide(o.v);setFxAmtI(null);}} style={{flex:1,padding:"9px 6px",borderRadius:8,border:"none",background:fxSide===o.v?"#fff":"transparent",color:fxSide===o.v?DK:"#999",fontWeight:700,fontSize:11,cursor:"pointer",boxShadow:fxSide===o.v?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{o.l}</button>)}
            </div>
            {/* Amount — scales to full trading wallet */}
            <div style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.4,marginBottom:7}}>
              Position Size · Trading Wallet: {fm(tw)} · No limits
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
              {amtPresets(tw).map(v=><button key={v} onClick={(e)=>{e.stopPropagation();setFxAmtI(v);}} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(fxAmtI===v?(fxSide==="long"?G:R):"#e0e0e0"),background:fxAmtI===v?(fxSide==="long"?"#E8F5E9":"#FFEBEE"):"#fafafa",color:fxAmtI===v?(fxSide==="long"?G:R):"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>
                {fm(v)}
              </button>)}
            </div>
            {fxAmtI&&<div style={{background:"#f8fbf8",borderRadius:9,padding:11,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,color:"#666"}}>Pair</span><span style={{fontSize:12,fontWeight:700}}>{fx.id} @ {fx.p.toFixed(4)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,color:"#666"}}>Direction</span><span style={{fontSize:12,fontWeight:700,color:fxSide==="long"?G:R}}>{fxSide.toUpperCase()}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,color:"#666"}}>Position size</span><span style={{fontSize:12,fontWeight:800,fontFamily:"monospace"}}>{fm(fxAmtI)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,color:"#666"}}>P&L at +1% move</span><span style={{fontSize:12,fontWeight:700,color:G}}>+{fm(fxAmtI*0.01)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#666"}}>P&L at −1% move</span><span style={{fontSize:12,fontWeight:700,color:R}}>{fm(-fxAmtI*0.01)}</span></div>
            </div>}
            <button onClick={(e)=>{
              e.stopPropagation();
              if(!fxAmtI||fxAmtI<=0){toast_("Select a position size",false);return;}
              const s=S.current;
              if(fxAmtI>(s.tradingWallet||0)){toast_("Need "+fm(fxAmtI)+" — Trading Wallet has "+fm(s.tradingWallet||0),false);return;}
              s.tradingWallet=Math.round(((s.tradingWallet||0)-fxAmtI)*100)/100;
              s.fxPos[fx.id]={entry:fx.p,side:fxSide,cost:fxAmtI};
              s.news.unshift({id:Math.random(),t:s.turn,ico:"💱",ti:"Forex: "+fxSide.toUpperCase()+" "+fx.id,bo:fm(fxAmtI)+" position opened @ "+fx.p.toFixed(4)+". P&L updates each turn.",g:true});
              toast_(fxSide.toUpperCase()+" "+fm(fxAmtI)+" on "+fx.id+" @ "+fx.p.toFixed(4));
              setFxSel(null);setFxAmtI(null);refresh();
            }} disabled={!fxAmtI||fxAmtI>(d.tradingWallet||0)} style={{width:"100%",background:!fxAmtI?"#e0e0e0":fxSide==="long"?G:R,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:13,cursor:fxAmtI?"pointer":"not-allowed"}}>
              {fxAmtI?"Open "+fxSide.toUpperCase()+" "+fm(fxAmtI)+" on "+fx.id:"Select position size above"}
            </button>
          </div>}
          {fxSel===fx.id&&FXP[fx.id]&&<div style={{marginTop:8,fontSize:12,color:AU,fontWeight:700}}>Already have an open position on this pair. Close it first.</div>}
        </div>)}
      </div>
    </div>;
  })()
  const S_Bonds=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"#E3F2FD",borderRadius:11,padding:12,border:"1px solid #BBDEFB",fontSize:12,color:BL,lineHeight:1.6}}>Bond Formula: Price = FV × (OrigYield ÷ CurrYield) × RatingMult · Coupons paid quarterly · AAA×1.02 → B×0.94</div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.bonds.map((b,i)=>{const pr=gBP(b),held=BH[b.id]||0;return <div key={b.id} style={{padding:"13px 14px",borderBottom:i<d.bonds.length-1?"1px solid #f5f5f5":"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <div><div style={{fontSize:14,fontWeight:700,color:DK}}>{b.n}</div><div style={{fontSize:11,color:"#aaa"}}>{b.id} · {b.mat} · <span style={{fontWeight:700,color:b.rat==="AAA"||b.rat==="AA"?G:b.rat==="BB"||b.rat==="B"?R:AU}}>{b.rat}</span></div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,fontFamily:"monospace",color:pr>b.fv?G:R}}>{fm(pr)}</div><div style={{fontSize:11,color:"#aaa"}}>{b.cy.toFixed(2)}% yield</div></div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:8}}><SB l="Coupon" v={b.cou+"%"} c={G}/><SB l="Orig Yield" v={b.oy+"%"}/><SB l="Curr Yield" v={b.cy.toFixed(1)+"%"} c={b.cy<b.oy?G:R}/><SB l="Held" v={held} c={held>0?G:"#aaa"}/></div>
        <div style={{display:"flex",gap:6}}>
          {[1,5,10].map(q=><button key={q} onClick={()=>execTrade("bond",b,"buy",q)} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Buy {q}</button>)}
          {held>0&&<button onClick={()=>execTrade("bond",b,"sell",held)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell All</button>}
        </div>
      </div>;})}
    </div>
  </div>;

  const S_Port=(()=>{
    const sm={};Object.entries(SH).filter(([,n])=>n>0).forEach(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(c)sm[c.s]=(sm[c.s]||0)+c.price*n;});
    const tsv=Object.values(sm).reduce((a,b2)=>a+b2,0)||1;
    return <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#388E3C)",borderRadius:16,padding:16,color:"#fff"}}>
        <div style={{fontSize:10,opacity:.55,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Portfolio</div>
        <div style={{fontFamily:"monospace",fontSize:30,fontWeight:800}}>{fm(nw)}</div>
        <div style={{fontSize:11,opacity:.75,marginTop:3}}>🔒Personal:{fm(d.personalWallet||0)} · ⚡Trading:{fm(d.tradingWallet||0)} · 🏛️GSF:{fm(d.gsfDep||0)} · 📊Stocks:{fm(sv)} · 📋Bonds:{fm(bv)} · ⛽Comm+Crypto:{fm(cv+crv)}</div>
      </div>
      {(d.taxRed||0)>0&&<div style={{background:"#E8F5E9",borderRadius:10,padding:11,border:"1px solid #A5D6A7",fontSize:12,color:G}}>Tax Reduction Active: {((d.taxRed||0)*100).toFixed(0)}% off CGT. Effective rate: {(20*(1-(d.taxRed||0))).toFixed(0)}% on profit only.</div>}
      {Object.keys(sm).length>0&&<div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Sector Allocation</div>
        {Object.entries(sm).sort(([,a],[,b2])=>b2-a).map(([s,v])=><div key={s} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#555"}}>{s}</span><span style={{fontSize:12,fontFamily:"monospace"}}>{((v/tsv)*100).toFixed(1)}%</span></div><div style={{height:5,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:((v/tsv)*100)+"%",background:"linear-gradient(90deg,"+G+",#4CAF50)",borderRadius:3}}/></div></div>)}
      </div>}
      <div style={{background:"#fff",borderRadius:13,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        <div style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:DK}}>Stocks</div>
        {Object.keys(SH).filter(t=>(SH[t]||0)>0).length===0&&<div style={{padding:"13px 14px",fontSize:13,color:"#bbb"}}>No stocks held.</div>}
        {Object.entries(SH).filter(([,n])=>n>0).map(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(!c)return null;const avgC=d.avgSh?.[t]||c.price,pl=(c.price-avgC)*n;
          return <div key={t} style={{padding:"11px 14px",borderTop:"1px solid #f5f5f5"}}>
            <div onClick={()=>{setSelCo({...c});setTab("co");}} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:"pointer"}}>
              <div style={{width:36,height:36,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:11,color:"#aaa"}}>{n.toLocaleString()} shs · {fm(c.price)}/sh · avg {fm(avgC)}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace"}}>{fm(c.price*n)}</div><div style={{fontSize:11,fontFamily:"monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</div></div>
            </div>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>{setTrM({type:"stock",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>+ Buy More</button>
              <button onClick={()=>execTrade("stock",c,"sell",Math.floor(n/2))} style={{flex:1,background:"#FFF3E0",color:AU,border:"1px solid #FFCC80",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell Half</button>
              <button onClick={()=>execTrade("stock",c,"sell",n)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell All</button>
            </div>
          </div>;
        })}
      </div>
    </div>;
  })();

  const S_Give=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#880E4F,#C2185B)",borderRadius:16,padding:16,color:"#fff"}}>
      <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>❤️ Philanthropy</div>
      <div style={{fontSize:20,fontWeight:800,marginBottom:3}}>Reduce Tax. Build Legacy.</div>
      <div style={{fontSize:12,opacity:.85,lineHeight:1.6}}>Each donation: CGT −5% on profit (max 25% total). 2 donations = Solar criteria met.</div>
      <div style={{display:"flex",gap:8,marginTop:10}}><SB l="Donations" v={d.dons||0} c="#FFCDD2"/><SB l="CGT Saved" v={((d.taxRed||0)*100).toFixed(0)+"%"} c="#FFCDD2"/><SB l="Eff. CGT" v={(20*(1-(d.taxRed||0))).toFixed(0)+"%"} c="#FFCDD2"/></div>
    </div>
    {[{n:"Healthcare",ico:"🏥"},{n:"Education",ico:"🎓"},{n:"Infrastructure",ico:"🌉"},{n:"Space Research",ico:"🔭"},{n:"Climate Action",ico:"🌱"}].map(cat=><div key={cat.n} style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:22}}>{cat.ico}</span><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:DK}}>{cat.n}</div><div style={{background:"#FFF8E1",borderRadius:6,padding:"3px 8px",marginTop:3,fontSize:11,color:"#E65100",display:"inline-block"}}>CGT −5% · Solar criteria</div></div></div>
      <button onClick={()=>{setDonM(cat.n);setDonAmt(null);}} style={{width:"100%",background:"#880E4F",color:"#fff",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>Donate to {cat.n} ❤️</button>
    </div>)}
  </div>;

  const S_GSF=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",borderRadius:16,padding:16,color:"#fff"}}>
      <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🏛️ Global Sovereign Fund</div>
      <div style={{fontSize:20,fontWeight:800,marginBottom:3}}>Collective Investment Pool</div>
      <div style={{fontSize:12,opacity:.85}}>One rate per turn · Same for all players · Credited every turn · Withdraw any time · Deposit is NEVER auto-reduced</div>
    </div>
    <div style={{background:"#E3F2FD",borderRadius:13,padding:14,border:"1px solid #BBDEFB"}}>
      <div style={{fontSize:13,fontWeight:700,color:BL,marginBottom:10}}>Your Position</div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <SB l="Your Deposit" v={fm(d.gsfDep||0)} c={BL}/>
        <SB l="Rate / yr" v={(d.gsf||12.48).toFixed(2)+"%"} c={G}/>
        <SB l="Per Turn" v={fm((d.gsfDep||0)*((d.gsf||12.48)/100/365))} c={G}/>
      </div>
      <div style={{background:"#fff",borderRadius:8,padding:"10px 12px",marginBottom:12,fontSize:12,color:"#666",lineHeight:1.6}}>
        Total interest earned: <strong>{fm(d.gsfTotal||0)}</strong><br/>
        Return calc: {fm(d.gsfDep||0)} × {(d.gsf||12.48).toFixed(2)}% ÷ 365 turns = {fm((d.gsfDep||0)*((d.gsf||12.48)/100/365))}/turn<br/>
        Your deposit is permanent — we never touch it unless you withdraw.
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{setGsfM(true);setGsfAmt(null);}} style={{flex:2,background:BL,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Deposit</button>
        {(d.gsfDep||0)>0&&<button onClick={()=>{const s=S.current;const amt=s.gsfDep;s.tradingWallet=Math.round((s.tradingWallet+amt)*100)/100;s.gsfDep=0;s.news.unshift({id:Math.random(),t:s.turn,ico:"🏛️",ti:"GSF Withdrawal",bo:fm(amt)+" withdrawn to Trading Wallet.",g:true});toast_("Withdrawn "+fm(amt)+" from GSF");refresh();}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>Withdraw All</button>}
      </div>
    </div>
  </div>;

  const S_Sol=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#060B16,#112040)",borderRadius:16,padding:16,border:"1px solid rgba(212,175,55,.2)"}}>
      <div style={{fontSize:10,opacity:.45,color:"#F0D060",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>☀️ Solar System Unlock</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontFamily:"monospace",fontSize:32,fontWeight:800,color:"#F0D060"}}>{spct}%</div><div style={{fontSize:12,color:"rgba(240,208,96,.5)"}}>5 criteria needed</div></div>
      <div style={{height:8,background:"rgba(255,255,255,.08)",borderRadius:4,overflow:"hidden",marginBottom:14}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:4,transition:"width .5s"}}/></div>
      {Object.entries(SC).map(([k,c2])=><div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
        <div style={{width:22,height:22,borderRadius:"50%",background:c2.met?"rgba(0,230,118,.2)":"rgba(255,255,255,.05)",border:"2px solid "+(c2.met?"#00E676":"rgba(255,255,255,.12)"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0,color:"#00E676"}}>{c2.met?"✓":""}</div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:c2.met?"#00E676":"rgba(255,255,255,.5)"}}>{c2.l}</div><div style={{fontSize:11,color:"rgba(240,208,96,.4)",fontFamily:"monospace"}}>{c2.v}</div></div>
      </div>)}
    </div>
    <div style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:13,padding:14,border:"1px solid rgba(212,175,55,.08)"}}>
      <div style={{fontSize:13,fontWeight:700,color:"rgba(212,175,55,.5)",marginBottom:10}}>🔒 210 Companies · 7 Planets</div>
      {[{ico:"🔴",pl:"Mars",d:"Mining · Li, ice · 3.71m/s²"},{ico:"🟡",pl:"Venus",d:"Manufacturing · 465°C"},{ico:"🟠",pl:"Jupiter",d:"Research · Fusion"},{ico:"🪐",pl:"Saturn",d:"Ring mining · Ryzolith"},{ico:"☿",pl:"Mercury",d:"Solar energy"},{ico:"🔵",pl:"Uranus",d:"Ice mining"},{ico:"💜",pl:"Neptune",d:"Deep research"}].map(p=><div key={p.pl} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)",opacity:spct===100?.85:.3}}><span style={{fontSize:20}}>{p.ico}</span><div><div style={{fontSize:13,fontWeight:700,color:"#E8EEF8"}}>{p.pl}</div><div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{p.d}</div></div></div>)}
    </div>
  </div>;

  const S_News=<div style={{padding:14,display:"flex",flexDirection:"column",gap:8}}>
    {d.news.slice(0,30).map(n=><div key={n.id} style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8",display:"flex",gap:10}}>
      <div style={{width:4,borderRadius:2,flexShrink:0,background:n.g?G:R,alignSelf:"stretch"}}/>
      <div style={{flex:1}}><div style={{fontSize:10,color:"#ccc",textTransform:"uppercase",letterSpacing:.4,marginBottom:3}}>Turn {n.t} · {n.ico}</div><div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:3}}>{n.ti}</div><div style={{fontSize:12,color:"#666",lineHeight:1.6}}>{n.bo}</div></div>
    </div>)}
  </div>;

  const S_Set=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{fontSize:14,fontWeight:700,color:DK,marginBottom:10}}>📊 Game Stats — Turn {d.turn}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <SB l="Net Worth" v={fm(nw)} c={G}/>
        <SB l="Trading Wallet" v={fm(d.tradingWallet||0)} c={BL}/>
        <SB l="Personal Wallet" v={fm(d.personalWallet||0)} c={G}/>
        <SB l="GSF Deposit" v={fm(d.gsfDep||0)} c={BL}/>
        <SB l="Stock Value" v={fm(sv)} c={G}/>
        <SB l="Crypto Value" v={fm(crv)} c={PU}/>
        <SB l="Tax Era" v={d.era||"Normal"} c={BL}/>
        <SB l="CGT Rate" v={(((d.cgtRate||.20))*100).toFixed(0)+"%"} c={G}/>
        <SB l="Total Tax Paid" v={fm(d.taxPaid||0)} c={R}/>
        <SB l="Philanthropy" v={(d.dons||0)+" donations"} c={PU}/>
      </div>
    </div>
    <div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{fontSize:14,fontWeight:700,color:DK,marginBottom:10}}>🏁 Milestones</div>
      {[{n:"M1 — Turn 100",d:d.turn>=100,ds:"Governor stable"},{n:"M2 — Turn 300",d:d.turn>=300,ds:"Solar window"},{n:"M3 — Turn 500",d:d.turn>=500,ds:"Full DEE"},{n:"M4 — Turn 1000",d:d.turn>=1000,ds:"LAUNCH GATE"}].map(m=><div key={m.n} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}><div style={{width:28,height:28,borderRadius:8,background:m.d?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,border:m.d?"1px solid #A5D6A7":"1px solid #e0e0e0"}}>{m.d?"✅":"🔒"}</div><div><div style={{fontSize:13,fontWeight:700,color:m.d?G:DK}}>{m.n}</div><div style={{fontSize:11,color:"#bbb"}}>{m.ds}</div></div></div>)}
    </div>
    {beta&&<div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{fontSize:14,fontWeight:700,color:R,marginBottom:8}}>🔴 Beta Log</div>
      <div style={{maxHeight:120,overflowY:"auto",fontSize:10,fontFamily:"monospace",color:G}}>{(d.elog||[]).slice(0,20).map((e,i)=><div key={i}>[T{e.t}] {e.msg}</div>)}</div>
      <button onClick={()=>{const txt=(d.elog||[]).map(e=>"[T"+e.t+"] "+e.msg).join("
");const b2=new Blob([txt],{type:"text/plain"});const u=URL.createObjectURL(b2);const a=document.createElement("a");a.href=u;a.download="GR_log.txt";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u);toast_("Downloaded");}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer",marginTop:8}}>⬇ Download Log</button>
    </div>}
    {!beta&&<button onClick={()=>{const i=window.prompt("PIN:");if(i==="9000")setBeta(true);else if(i)toast_("Wrong PIN",false);}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>🔐 Beta Diagnostics (PIN required)</button>}
  </div>
  const screenMap={dash:S_Dash,mkt:S_Mkt,co:Co_,comm:S_Comm,cryp:S_Cryp,fx:S_Fx,bonds:S_Bonds,port:S_Port,ph:S_Give,gsf:S_GSF,sol:S_Sol,news:S_News,set:S_Set};

  // ── TRADE MODAL ───────────────────────────────────────────────
  const TrModal=(()=>{
    if(!trM)return null;
    const{type,item,mode}=trM,isBuy=mode==="buy";
    let price=0,unit="",held=0,maxQty=0;
    if(type==="stock"){price=item.price;unit="shares";held=SH[item.t]||0;maxQty=isBuy?Math.floor((d.tradingWallet||0)/price):held;}
    else if(type==="comm"){price=item.p;unit=item.u;held=CH[item.id]||0;maxQty=isBuy?Math.floor((d.tradingWallet||0)/price):held;}
    else if(type==="cryp"){price=item.p;unit=item.u;held=CRH[item.id]||0;maxQty=isBuy?Math.floor((d.tradingWallet||0)/price):held;}
    else if(type==="bond"){price=gBP(item);unit="bonds";held=BH[item.id]||0;maxQty=isBuy?Math.floor((d.tradingWallet||0)/price):held;}
    const qty=Math.floor(trAmt||0),total=Math.round(qty*price*100)/100;
    const avgC=(type==="stock"?(d.avgSh?.[item.t]||price):type==="comm"?(d.avgCm?.[item.id]||price):type==="cryp"?(d.avgCr?.[item.id]||price):price);
    const profitPer=!isBuy?Math.max(0,price-avgC):0;
    const tax=!isBuy?Math.round(qty*profitPer*.20*(1-(d.taxRed||0))*100)/100:0;
    // Build quantity presets
    const presets=[];
    const candidates=[1,2,5,10,25,50,100,500,1000,5000,10000,50000,100000,500000,1000000];
    candidates.filter(v=>v<=maxQty&&v>0).forEach(v=>presets.push(v));
    if(maxQty>0&&!presets.includes(maxQty))presets.push(maxQty);
    const show=presets.slice(-8);
    return <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxHeight:"88vh",overflowY:"auto"}}>
      <div style={{width:36,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 16px"}}/>
      <div style={{background:isBuy?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:14,padding:15,color:"#fff",marginBottom:14}}>
        <div style={{fontSize:10,opacity:.65,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{isBuy?"BUY":"SELL"} · {type.toUpperCase()}</div>
        <div style={{fontSize:18,fontWeight:800}}>{item.n||item.id}</div>
        <div style={{fontSize:12,opacity:.85,marginTop:3}}>{fm(price)} per {unit} · {isBuy?fm(d.tradingWallet||0)+" Trading Wallet · can buy "+maxQty.toLocaleString()+" "+unit:held.toLocaleString()+" "+unit+" held"}</div>
      </div>
      <div style={{display:"flex",background:"#f0f4f0",borderRadius:10,padding:4,gap:3,marginBottom:14}}>
        {["buy","sell"].map(m2=><button key={m2} onClick={()=>{setTrM({...trM,mode:m2});setTrAmt(null);}} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",background:mode===m2?"#fff":"transparent",color:mode===m2?G:"#999",fontWeight:700,fontSize:13,cursor:"pointer",boxShadow:mode===m2?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{m2==="buy"?"Buy":"Sell"}</button>)}
      </div>
      <div style={{fontSize:11,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>
        Quantity — Max {maxQty.toLocaleString()} {unit}
      </div>
      {maxQty>0?<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
        {show.map(v=><button key={v} onClick={()=>setTrAmt(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(trAmt===v?G:"#e0e0e0"),background:trAmt===v?"#E8F5E9":"#fafafa",color:trAmt===v?G:"#555",fontWeight:700,fontSize:12,cursor:"pointer"}}>
          {v>=1000000?(v/1000000).toFixed(0)+"M":v>=1000?(v/1000).toFixed(0)+"K":v}
        </button>)}
        <button onClick={()=>setTrAmt(maxQty)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(trAmt===maxQty?G:"#4CAF50"),background:trAmt===maxQty?"#E8F5E9":"#F1F8E9",color:G,fontWeight:800,fontSize:12,cursor:"pointer",gridColumn:"span 1"}}>{isBuy?"Buy Max":"Sell Max"}</button>
      </div>:<div style={{background:"#FFF8E1",borderRadius:9,padding:11,marginBottom:12,fontSize:12,color:"#E65100"}}>{isBuy?"⚠️ Not enough Trading Wallet funds — need at least "+fm(price)+" for 1 "+unit:"⚠️ Nothing held to sell."}</div>}
      {qty>0&&<div style={{background:"#f8fbf8",borderRadius:10,padding:13,marginBottom:13}}>
        <Row k={"Qty ("+unit+")"} v={qty.toLocaleString()}/>
        <Row k={isBuy?"Total Cost":"Gross Proceeds"} v={fm(total)}/>
        {!isBuy&&<Row k={"Profit/"+unit+" ("+fm(price)+" − "+fm(avgC)+")"} v={profitPer>0?fm(profitPer):"None — no profit"} vc={profitPer>0?G:"#aaa"}/>}
        {!isBuy&&<Row k={"CGT "+(20*(1-(d.taxRed||0))).toFixed(0)+"% on profit only"} v={tax>0?("-"+fm(tax)):"$0 — no profit"} vc={tax>0?R:G}/>}
        <Row k={"Net "+(isBuy?"Cost":"Proceeds")} v={fm(isBuy?total:total-tax)} vc={isBuy?R:G} b/>
      </div>}
      <button onClick={()=>execTrade(type,item,mode,qty)} disabled={qty<1} style={{width:"100%",background:qty>=1?(isBuy?G:R):"#e0e0e0",color:"#fff",border:"none",borderRadius:12,padding:15,fontWeight:800,fontSize:15,cursor:qty>=1?"pointer":"not-allowed"}}>
        {qty>=1?"Confirm "+(isBuy?"Buy":"Sell")+" "+qty.toLocaleString()+" "+unit+" = "+fm(isBuy?total:total-tax):"Select a quantity above"}
      </button>
    </div>;
  })();

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"system-ui,-apple-system,sans-serif"}}>
    {/* Header */}
    <div style={{background:"#fff",padding:"10px 15px",borderBottom:"1px solid #e8ebe8",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#1B5E20,#4CAF50)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🌐</div>
        <div><div style={{fontSize:15,fontWeight:800,color:DK,lineHeight:1}}>Galactic Raider</div><div style={{fontSize:9,color:"#bbb"}}>Capital Exchange · v7 Spec · 24 Docs</div></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        {auto&&<div style={{width:7,height:7,borderRadius:"50%",background:G,boxShadow:"0 0 6px #4CAF50"}}/>}
        <button onClick={()=>setTab("sol")} style={{background:"rgba(212,175,55,.12)",border:"1px solid rgba(212,175,55,.25)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#B8952A",cursor:"pointer"}}>☀️ {spct}%</button>
      </div>
    </div>
    {/* Ticker */}
    <div style={{background:"#1B5E20",padding:"4px 0",overflow:"hidden",flexShrink:0}}>
      <div style={{display:"flex",gap:18,whiteSpace:"nowrap",animation:"scroll 30s linear infinite",width:"max-content"}}>
        {[...d.cos,...d.cos].map((c,i)=><span key={i} style={{fontSize:10,fontFamily:"monospace",color:"rgba(255,255,255,.45)",display:"inline-flex",gap:5}}>
          <span style={{color:"rgba(255,255,255,.7)",fontWeight:700}}>{c.t}</span>
          <span style={{color:(c.ch||0)>=0?"#69F0AE":"#FF5252"}}>{fm(c.price)} {(c.ch||0)>=0?"▲":"▼"}{Math.abs((c.ch||0)*100).toFixed(2)}%</span>
        </span>)}
      </div>
    </div>
    {/* Content */}
    <div style={{flex:1,overflowY:"auto",paddingBottom:68}}>{screenMap[tab]||S_Dash}</div>
    {/* Nav */}
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #e8ebe8",display:"flex",padding:"5px 2px 10px",zIndex:50}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{...ts(t.id)}}><div style={{fontSize:16,lineHeight:1,marginBottom:2}}>{t.ico}</div><div style={{fontSize:8}}>{t.l}</div></button>)}
    </div>
    {/* Event toast */}
    {evN&&<div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 18px)",maxWidth:412,background:evN.good?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:13,padding:"12px 15px",display:"flex",alignItems:"center",gap:10,zIndex:200,boxShadow:"0 6px 24px rgba(0,0,0,.3)"}}>
      <span style={{fontSize:22}}>{evN.ico}</span>
      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{evN.n}{evN.cn?" — "+evN.cn:""}</div><div style={{fontSize:11,color:"rgba(255,255,255,.65)",marginTop:2}}>{evN.desc}</div></div>
      <button onClick={()=>setEvN(null)} style={{background:"rgba(255,255,255,.18)",border:"none",borderRadius:"50%",width:22,height:22,color:"#fff",cursor:"pointer",fontSize:13}}>×</button>
    </div>}
    {/* Action toast */}
    {toast&&<div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 18px)",maxWidth:412,background:toast.g?G:R,borderRadius:10,padding:"11px 15px",color:"#fff",fontSize:13,fontWeight:700,zIndex:250,textAlign:"center",boxShadow:"0 3px 14px rgba(0,0,0,.25)"}}>{toast.msg}</div>}
    {/* Trade modal */}
    {trM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget){setTrM(null);setTrAmt(null);}}}>{TrModal}</div>}
    {/* Donate modal */}
    {donM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setDonM(null)}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
        <div style={{width:36,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 16px"}}/>
        <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:4}}>❤️ Donate to {donM}</div>
        <div style={{fontSize:12,color:"#888",marginBottom:5}}>Trading Wallet: {fm(d.tradingWallet||0)} · Each donation = CGT −5% on profit (max 25%)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
          {[1000000,5000000,10000000,50000000,100000000,Math.min(Math.floor((d.tradingWallet||0)*0.1/1000000)*1000000,(d.tradingWallet||0))].filter((v,i,a)=>v<=(d.tradingWallet||0)&&v>=1000000&&a.indexOf(v)===i).slice(-8).map(v=><button key={v} onClick={()=>setDonAmt(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(donAmt===v?"#880E4F":"#e0e0e0"),background:donAmt===v?"#FCE4EC":"#fafafa",color:donAmt===v?"#880E4F":"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(v)}</button>)}
        </div>
        {donAmt&&donAmt>0&&<div style={{background:"#f8fbf8",borderRadius:10,padding:12,marginBottom:12}}><Row k="Donation" v={fm(donAmt)} vc="#880E4F" b/><Row k="New CGT rate" v={(20*(1-((d.taxRed||0)+0.05))).toFixed(0)+"% on profit"} vc={G}/></div>}
        <button onClick={()=>{
          if(!donAmt||donAmt<1000000){toast_("Min donation $1M",false);return;}
          if(donAmt>(d.tradingWallet||0)){toast_("Insufficient Trading Wallet funds",false);return;}
          const s=S.current;
          const SP={Healthcare:{r:.20,dur:3},Education:{r:.25,dur:5},Environment:{r:.30,dur:7},Infrastructure:{r:.15,dur:4},Poverty:{r:.20,dur:3},Science:{r:.25,dur:5},Arts:{r:.10,dur:2},Disaster:{r:.35,dur:8}};
          const sp=SP[donM]||{r:.20,dur:3};
          s.tradingWallet=Math.round(((s.tradingWallet||0)-donAmt)*100)/100;
          s.dons=(s.dons||0)+1;
          s.phiBen=[...(s.phiBen||[]),{cat:donM,rate:sp.r,rem:sp.dur}];
          s.news.unshift({id:Math.random(),t:s.turn,ico:"❤️",ti:"Donated to "+donM,bo:fm(donAmt)+" · "+(sp.r*100).toFixed(0)+"% tax relief for "+sp.dur+" turns.",g:true});
          toast_("Donated "+fm(donAmt)+" → "+(sp.r*100).toFixed(0)+"% relief for "+sp.dur+" turns");
          setDonM(null);setDonAmt(null);refresh();
        }} style={{width:"100%",background:"#880E4F",color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:14,cursor:"pointer"}}>❤️ Confirm{donAmt?" — "+fm(donAmt):""}</button>
      </div>
    </div>}
    {/* GSF deposit modal */}
    {gsfM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setGsfM(false)}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
        <div style={{width:36,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 16px"}}/>
        <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:4}}>🏛️ Deposit to GSF</div>
        <div style={{fontSize:12,color:"#888",marginBottom:12}}>Rate: {(d.gsf||12.48).toFixed(2)}%/yr · Cash: {fm((d.tradingWallet||0))} · Per turn after: {fm(((d.gsfDep||0)+(gsfAmt||0))*((d.gsf||12.48)/100/365))}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
          {[50000,100000,250000,500000,1000000,5000000,10000000,Math.min(Math.floor((d.tradingWallet||0)*0.5/1000)*1000,(d.tradingWallet||0))].filter((v,i,a)=>v<=(d.tradingWallet||0)&&v>0&&a.indexOf(v)===i).slice(-8).map(v=><button key={v} onClick={()=>setGsfAmt(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(gsfAmt===v?BL:"#e0e0e0"),background:gsfAmt===v?"#E3F2FD":"#fafafa",color:gsfAmt===v?BL:"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(v)}</button>)}
        </div>
        {gsfAmt&&gsfAmt>0&&<div style={{background:"#E3F2FD",borderRadius:10,padding:12,marginBottom:12}}><Row k="Deposit" v={fm(gsfAmt)} vc={BL} b/><Row k="New per-turn return" v={fm(((d.gsfDep||0)+gsfAmt)*((d.gsf||12.48)/100/365))} vc={G}/></div>}
        <button onClick={()=>{if(!gsfAmt||gsfAmt<1||gsfAmt>(d.tradingWallet||0)){toast_("Select amount",false);return;}const s=S.current;s.tradingWallet=Math.round((s.tradingWallet-gsfAmt)*100)/100;s.gsfDep=(s.gsfDep||0)+gsfAmt;toast_("Deposited "+fm(gsfAmt)+" → "+fm(s.gsfDep*(s.gsf/100/365))+"/turn");setGsfM(false);setGsfAmt(null);refresh();}} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:14,cursor:"pointer"}}>🏛️ Confirm{gsfAmt?" — "+fm(gsfAmt):""}</button>
      </div>
    </div>}

    <style>{"@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{display:none}button{outline:none;font-family:inherit}"}</style>
  </div>;
}        {coTab==="info"&&<>
          {/* Analyst Rating */}
          <div style={{background:c.analyst==="STRONG BUY"?"#1B5E20":c.analyst==="BUY"?"#2E7D32":c.analyst==="HOLD"?"#E65100":c.analyst==="SELL"?"#B71C1C":"#555",borderRadius:11,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Analyst Rating</div>
              <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{c.analyst||"HOLD"}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>Rating: {(c.rating||3.5).toFixed(1)}/5.0</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.7)",marginBottom:2}}>Price Target</div>
              <div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"monospace"}}>{fm(c.target||c.ip)}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>
                {c.target>c.price?"▲ "+fm(c.target-c.price)+" upside ("+((c.target/c.price-1)*100).toFixed(1)+"%)":"▼ "+fm(c.price-c.target)+" downside"}
              </div>
            </div>
          </div>
          {/* Founder story */}
          <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>📖 The Story</div>
            <div style={{fontSize:12,color:"#444",lineHeight:1.8,marginBottom:10}}>{c.origin||c.desc}</div>
            <div style={{display:"flex",gap:6}}>
              <div style={{flex:1,background:"#f8fbf8",borderRadius:8,padding:"8px 10px",border:"1px solid #eee"}}>
                <div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Founded By</div>
                <div style={{fontSize:11,fontWeight:700,color:DK}}>{c.founder||"—"}</div>
              </div>
              <div style={{flex:1,background:"#f8fbf8",borderRadius:8,padding:"8px 10px",border:"1px solid #eee"}}>
                <div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Year · HQ</div>
                <div style={{fontSize:11,fontWeight:700,color:DK}}>{c.yr} · {c.hq||"—"}</div>
              </div>
              <div style={{flex:1,background:"#f8fbf8",borderRadius:8,padding:"8px 10px",border:"1px solid #eee"}}>
                <div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Current CEO</div>
                <div style={{fontSize:11,fontWeight:700,color:DK}}>{c.ceo||"—"}</div>
              </div>
            </div>
          </div>
          {/* Operations */}
          <div style={{background:"#EDE7F6",borderRadius:11,padding:12,border:"1px solid #D1C4E9"}}>
            <div style={{fontSize:12,fontWeight:700,color:PU,marginBottom:6}}>🌍 Operations & Regions</div>
            <div style={{fontSize:12,color:"#444",lineHeight:1.7}}>{c.ops||c.desc}</div>
          </div>
          {/* Your position */}
          {held>0&&<div style={{background:"#E8F5E9",borderRadius:11,padding:12,border:"1px solid #A5D6A7"}}>
            <div style={{fontSize:12,fontWeight:700,color:G,marginBottom:8}}>Your Position</div>
            <div style={{display:"flex",gap:8}}><SB l="Shares" v={held.toLocaleString()} c={G}/><SB l="Value" v={fm(c.price*held)} c={G}/><SB l="Avg Cost" v={fm(avgC)}/><SB l="P&L" v={(pl>=0?"+":"")+fm(pl)} c={pl>=0?G:R}/></div>
            <div style={{fontSize:11,color:"#888",marginTop:8}}>CGT {(((d.cgtRate||.20)*(1-(d.taxRed||0)))*100).toFixed(0)}% on profit only. Selling at a loss = $0 tax.</div>
          </div>}
          {/* Key numbers */}
          <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Key Financials</div>
            {[["Price",fm(c.price)],["P/E Ratio",c.pe.toFixed(1)+"×"],["Dividend Yield",c.div+"%"],["Beta (Volatility)",c.b+"×"],["Employees",((c.emp||0)/1000).toFixed(0)+"K"],["CEO Reputation",(c.ceoRep||70)+"/100"]].map(([k,v])=><Row key={k} k={k} v={v}/>)}
          </div>
        </>}
