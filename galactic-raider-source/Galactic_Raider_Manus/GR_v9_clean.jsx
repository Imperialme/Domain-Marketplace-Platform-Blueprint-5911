import{useState,useRef,useEffect,useCallback}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e12?"$"+(a/1e12).toFixed(2)+"T":a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const pc=n=>(n>=0?"+":"")+((n||0)*100).toFixed(2)+"%";
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);
const gBP=b=>cl(Math.round(b.fv*(b.oy/100)/Math.max(b.cy/100,.01)*({AAA:1.02,AA:1.01,A:1,BBB:.99,BB:.97,B:.94}[b.rat]||1)*100)/100,b.fv*.05,b.fv*2.5);

// ── DATA ──────────────────────────────────────────────────────
const COS=[
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",r:"Asia Pacific",ip:348.94,pe0:18.4,div:.8,b:1.8,yr:2008,emp:125000,hq:"Singapore",ceo:"Dr. Lin Wei",founder:"Dr. Lin Wei",origin:"Lin Wei sold his Singapore apartment to fund the first prototype. Grew from 4 staff in a shophouse to 125,000 people across 18 countries.",ops:"Enterprise cloud, AI chips, data services across Singapore, Tokyo, Seoul, Mumbai, Sydney.",analyst:"BUY",target:420,rating:4.2,desc:"AI and cloud leader across 18 Asia Pacific markets."},
  {t:"MRDB",n:"Meridian Bank",s:"Banking",r:"US",ip:85.20,pe0:12.1,div:2.1,b:.9,yr:1985,emp:45000,hq:"New York",ceo:"Patricia Hernandez",founder:"James R. Meridian",origin:"James Meridian started as a teller in Brooklyn in 1972. Built one branch into a regional powerhouse through 14 acquisitions. Family still holds 12%.",ops:"2,400 retail branches across US Midwest and Northeast. Corporate lending and wealth management.",analyst:"HOLD",target:90,rating:3.5,desc:"Mid-size US commercial bank with strong Midwest footprint."},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",r:"Africa",ip:15.80,pe0:8.5,div:.5,b:1.6,yr:2005,emp:28000,hq:"Johannesburg",ceo:"Amara Diallo",founder:"Kwame Asante",origin:"Ghanaian geologist Kwame Asante discovered a rare earth deposit while working for a junior explorer. Left his job, secured local government backing and listed on JSE in 2009.",ops:"Iron ore in Mauritania, lithium in Zimbabwe, rare earths in DRC. Supplies Asian battery makers.",analyst:"BUY",target:22,rating:4.0,desc:"Pan-African critical minerals group powering the global EV revolution."},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",r:"Emerging Markets",ip:351.54,pe0:11.3,div:1.8,b:1.2,yr:1995,emp:62000,hq:"Dubai",ceo:"Sheikh Rashid Al-Mansouri",founder:"Al-Mansouri family",origin:"Established as a private trading company by the Al-Mansouri family in Abu Dhabi in 1995. Listed on DFM in 2003. Expanded through Gulf concessions and Central Asian pipeline deals.",ops:"Crude production in UAE, Kuwait and Oman. Pipeline infrastructure across Kazakhstan.",analyst:"HOLD",target:360,rating:3.2,desc:"Third-largest petroleum producer in the Gulf region."},
  {t:"AGRO",n:"AgroLatin Corp",s:"Agriculture",r:"Latin America",ip:42.18,pe0:13.2,div:2.5,b:1.1,yr:1975,emp:18000,hq:"São Paulo",ceo:"Isabella Sousa",founder:"Carlos Sousa",origin:"Carlos Sousa started on a family farm in Mato Grosso in 1975. Third-generation family ownership. Expanded through Brazil's agricultural boom.",ops:"4.2M hectares across Brazil and Argentina. Soy, corn, sugarcane and cattle exports to 22 countries.",analyst:"BUY",target:52,rating:4.1,desc:"Largest agri-business in Latin America by farmland."},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",r:"US",ip:198.40,pe0:22.1,div:1.2,b:.8,yr:2005,emp:38000,hq:"Boston",ceo:"Dr. Sarah Chen",founder:"Dr. Marcus Webb",origin:"Harvard oncologist Dr. Marcus Webb licensed his tumour-targeting patent in 2005. Built from one IP licence into hospital management and medical devices.",ops:"180 hospitals and 400 diagnostic labs across North America. 3 oncology drugs in Phase 3.",analyst:"STRONG BUY",target:240,rating:4.7,desc:"Premium healthcare with proprietary oncology technology."},
  {t:"CLFL",n:"ClearFlame Energy",s:"Energy",r:"Europe",ip:112.30,pe0:14.8,div:2.0,b:1.1,yr:2010,emp:22000,hq:"Amsterdam",ceo:"Hans Brouwer",founder:"Dr. Marta Kowalski",origin:"Polish engineer Dr. Kowalski left Shell in 2010 to pioneer hybrid wind-gas grid technology. IPO'd on Euronext 2016 at €28.",ops:"Wind farms in North Sea, solar in Spain and Portugal, gas plants in Germany. Powers 12M households.",analyst:"BUY",target:130,rating:4.0,desc:"European diversified energy leader. EU Green Deal beneficiary."},
  {t:"PCMN",n:"Pacific Mfg",s:"Manufacturing",r:"Asia Pacific",ip:76.20,pe0:15.6,div:1.3,b:1.0,yr:1988,emp:55000,hq:"Seoul",ceo:"Park Joon-ho",founder:"Park Dae-jung",origin:"Retired Korean army engineer Park Dae-jung started making circuit boards for Samsung in 1988 with a $50K loan. Son now runs the company.",ops:"Factories in Korea, Vietnam, Mexico and Poland. EV battery components for 14 of top 20 car makers.",analyst:"HOLD",target:80,rating:3.4,desc:"Solid mid-tier EV parts manufacturer. OEM margin pressure is a concern."},
  {t:"NRDX",n:"Nordic Bank",s:"Banking",r:"Europe",ip:132.10,pe0:11.8,div:2.4,b:.8,yr:1975,emp:32000,hq:"Stockholm",ceo:"Astrid Lindqvist",founder:"Swedish government consortium",origin:"Formed in 1975 by a Swedish banking consortium for Nordic trade finance. Privatised 1992. Built pan-European presence through careful acquisitions.",ops:"Retail, wealth and institutional banking across 18 European countries.",analyst:"BUY",target:150,rating:4.0,desc:"Best-in-class Nordic bank. Conservative, low bad loans, reliable dividend."},
  {t:"UTLS",n:"Utility Systems",s:"Utilities",r:"US",ip:58.40,pe0:14.2,div:4.2,b:.5,yr:1950,emp:12000,hq:"Chicago",ceo:"Robert Keller",founder:"Chicago City Council",origin:"Created by Chicago City Council in 1950. Privatised 1987. Regulated monopoly — rate increases require state approval but are reliably granted.",ops:"Electric grid for 1.9M customers. Gas distribution to 1.3M. 3 nuclear plants in operation.",analyst:"HOLD",target:60,rating:3.3,desc:"Classic defensive utility. 4.2% dividend yield. Very limited growth."},
  {t:"TLCM",n:"TeleCom Europe",s:"Telecom",r:"Europe",ip:88.60,pe0:13.5,div:4.5,b:.6,yr:1985,emp:48000,hq:"Frankfurt",ceo:"Klaus Hoffman",founder:"West German government",origin:"Emerged from privatisation of West Germany's postal telephone monopoly in 1985. Became pan-European through 22 acquisitions over 30 years.",ops:"Mobile, broadband and enterprise telecoms across 22 European countries. 280M subscribers.",analyst:"HOLD",target:92,rating:3.1,desc:"Mature telecom. 4.5% dividend. 5G rollout complete, growth slowing."},
  {t:"RETL",n:"RetailHub Inc",s:"Retail",r:"US",ip:38.90,pe0:14.0,div:1.5,b:1.2,yr:2000,emp:85000,hq:"Seattle",ceo:"Amanda Torres",founder:"David Park",origin:"Korean-American David Park launched RetailHub in 2000 around a loyalty programme before e-commerce was mainstream. Now under structural pressure.",ops:"1,200 stores across 35 US states. Online marketplace with 48M loyalty members.",analyst:"SELL",target:35,rating:2.5,desc:"Structurally challenged retailer. Amazon and Walmart pressure intensifying."},
  {t:"RLST",n:"RealEstate Trust",s:"Real Estate",r:"US",ip:44.20,pe0:12.8,div:3.8,b:.7,yr:1995,emp:2800,hq:"Dallas",ceo:"Michael Johnson",founder:"Texas pension funds",origin:"Created by Texas pension funds in 1995. Pivoted to logistics warehouses in 2018 — decision that tripled net asset value.",ops:"$18B portfolio. 40% logistics warehouses, 35% industrial, 25% office. Sun Belt focus.",analyst:"BUY",target:52,rating:4.2,desc:"Best-positioned REIT for e-commerce logistics. 3.8% dividend yield."},
  {t:"EMTS",n:"Emerging Tech",s:"Technology",r:"Emerging Markets",ip:28.40,pe0:22.0,div:.2,b:2.0,yr:2015,emp:6500,hq:"Mumbai",ceo:"Priya Patel",founder:"Priya Patel",origin:"MIT graduate Priya Patel returned to India in 2015 to build enterprise cloud for South Asian SMEs. Backed by Sequoia India in 2016. Now profitable.",ops:"B2B SaaS for 18,000 corporate clients across India, Bangladesh, Sri Lanka, Pakistan.",analyst:"STRONG BUY",target:40,rating:4.5,desc:"High-growth EM tech. Founder-led, profitable, massive addressable market."},
  {t:"AXMB",n:"Axum Biotech",s:"Healthcare",r:"Africa",ip:68.50,pe0:19.4,div:.6,b:1.4,yr:2012,emp:8500,hq:"Addis Ababa",ceo:"Dr. Yohannes Tesfaye",founder:"Dr. Yohannes Tesfaye",origin:"Ethiopian physician Dr. Tesfaye's malaria research was rejected by Western pharma. Founded Axum with African Union and Gates Foundation backing. First African biotech with WHO pre-qualification.",ops:"Vaccine manufacturing in Ethiopia and Kenya. Genomic labs in 8 African nations.",analyst:"SPECULATIVE BUY",target:85,rating:3.8,desc:"High-risk high-reward African biotech. Phase 3 malaria trial ongoing."},
];
const PEB={Technology:{mn:15,mx:35},Banking:{mn:8,mx:15},Mining:{mn:6,mx:12},Energy:{mn:8,mx:20},Agriculture:{mn:10,mx:18},Healthcare:{mn:12,mx:35},Manufacturing:{mn:10,mx:25},Utilities:{mn:12,mx:18},"Real Estate":{mn:8,mx:16},Telecom:{mn:10,mx:16},Retail:{mn:10,mx:18}};
const COMM=[{id:"OIL",n:"Crude Oil",u:"bbl",ip:85,base:85},{id:"GOLD",n:"Gold",u:"oz",ip:1980,base:1980},{id:"SLVR",n:"Silver",u:"oz",ip:23.4,base:23.4},{id:"NGS",n:"Natural Gas",u:"MMBtu",ip:2.85,base:2.85},{id:"CORN",n:"Corn",u:"bu",ip:4.42,base:4.42},{id:"WHET",n:"Wheat",u:"bu",ip:5.80,base:5.80},{id:"COPR",n:"Copper",u:"lb",ip:3.78,base:3.78},{id:"LITH",n:"Lithium",u:"kg",ip:16.50,base:16.50}];
const CRYP=[{id:"BTC",n:"Bitcoin",ip:65000,base:65000},{id:"ETH",n:"Ethereum",ip:3200,base:3200},{id:"SOL",n:"Solana",ip:145,base:145},{id:"BNB",n:"BNB",ip:580,base:580}];
const BONDS=[{id:"US10Y",n:"US Treasury 10Y",rat:"AAA",cou:4.5,oy:4.5,fv:1000,mat:2034},{id:"EU10Y",n:"EU Govt 10Y",rat:"AA",cou:3.8,oy:3.8,fv:1000,mat:2034},{id:"SLKT-B",n:"Silk Road Bond",rat:"AA",cou:5.2,oy:5.2,fv:1000,mat:2031},{id:"AFR5Y",n:"African Govt Bond",rat:"BB",cou:12.5,oy:12.5,fv:1000,mat:2029},{id:"EM10Y",n:"Emerging Mkt Bond",rat:"B",cou:14.8,oy:14.8,fv:1000,mat:2032}];
const EVTS=[
  {id:"rc",n:"Rate Cut",ico:"🏦",t:"mkt",prob:.04,sent:.08,dur:10,good:true},
  {id:"rh",n:"Rate Hike",ico:"📈",t:"mkt",prob:.04,sent:-.07,dur:8,good:false},
  {id:"geo",n:"Geopolitical Crisis",ico:"💣",t:"mkt",prob:.03,sent:-.14,dur:20,sec:["Energy","Mining"],good:false},
  {id:"trg",n:"Tech Regulation",ico:"📜",t:"mkt",prob:.03,sent:-.12,dur:18,sec:["Technology"],good:false},
  {id:"td",n:"Trade Deal",ico:"🤝",t:"mkt",prob:.04,sent:.09,dur:12,good:true},
  {id:"bea",n:"Earnings Beat",ico:"💰",t:"co",prob:.10,imp:.20,dur:6,good:true},
  {id:"mis",n:"Earnings Miss",ico:"📉",t:"co",prob:.09,imp:-.18,dur:6,good:false},
  {id:"pat",n:"Patent Approved",ico:"⚡",t:"co",prob:.05,imp:.28,dur:5,good:true},
  {id:"scn",n:"CEO Scandal",ico:"💼",t:"co",prob:.03,imp:-.25,dur:15,good:false},
  {id:"con",n:"Govt Contract",ico:"🏛️",t:"co",prob:.04,imp:.22,dur:35,good:true},
];
// ── PRICE ENGINE ──────────────────────────────────────────────
const stepS=(cos,gdp,inf,intr,evts)=>cos.map(c=>{
  const pp=c.price,eps=pp/c.pe,bnd=PEB[c.s]||{mn:10,mx:40};
  const macro=cl(1+(gdp/100*.35*c.b)-(inf/100*.15)-(intr/100*.15*c.b),.94,1.06);
  let em=0;evts.forEach(e=>{if(e.t==="mkt"&&(!e.sec||e.sec.includes(c.s)))em+=(e.sent||0)*(e.tl/e.dur)*.10;if(e.t==="co"&&e.tk===c.t)em+=(e.imp||0)*(e.tl/e.dur)*.10;});
  const noise=1+(Math.random()-.5)*.06*c.b;
  let np=cl(pp*noise*macro*(1+em*.3),pp*.94,pp*1.06);
  if(np/eps<bnd.mn)np=eps*bnd.mn;if(np/eps>bnd.mx)np=eps*bnd.mx;
  np=Math.max(.50,Math.round(np*100)/100);
  return{...c,pp,price:np,pe:Math.round(np/eps*10)/10,ch:(np-pp)/pp,hist:[...(c.hist||[]).slice(-50),np]};
});
const stepC=comm=>comm.map(c=>{const pp=c.p,pull=(c.base-pp)/c.base*.01,d=cl(1+(Math.random()-.5)*.05+pull,.96,1.04);const np=cl(Math.round(pp*d*100)/100,c.base*.25,c.base*5);return{...c,p:np,pp,ch:(np-pp)/pp,hist:[...(c.hist||[]).slice(-50),np]};});
const stepCr=cr=>cr.map(c=>{const pp=c.p,pull=(c.base-pp)/c.base*.02,d=cl(1+(Math.random()-.5)*.08+pull,.93,1.07);const np=cl(Math.round(pp*d*100)/100,c.base*.20,c.base*6);return{...c,p:np,pp,ch:(np-pp)/pp,hist:[...(c.hist||[]).slice(-50),np]};});
// ── UI ATOMS ──────────────────────────────────────────────────
const MC=({hist,w=68,h=28})=>{if(!hist||hist.length<2)return null;const mn=Math.min(...hist)*.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={hist[hist.length-1]>=(hist[0]||0)?G:R} strokeWidth="1.8" strokeLinejoin="round"/></svg>;};
const WC=({hist})=>{if(!hist||hist.length<2)return null;const W=300,H=48,mn=Math.min(...hist)*.97,mx=Math.max(...hist)*1.03,rng=mx-mn||1;const line=hist.map((v,i)=>`${(i/(hist.length-1)*W).toFixed(1)},${(H-((v-mn)/rng*H)).toFixed(1)}`).join(" ");const fill=[...hist.map((v,i)=>`${(i/(hist.length-1)*W).toFixed(1)},${(H-((v-mn)/rng*H)).toFixed(1)}`),`${W},${H}`,`0,${H}`].join(" ");return <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"><defs><linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4CAF50" stopOpacity=".3"/><stop offset="100%" stopColor="#4CAF50" stopOpacity="0"/></linearGradient></defs><polygon points={fill} fill="url(#wg)"/><polyline points={line} fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinejoin="round"/></svg>;};
const Bdg=({v})=><span style={{background:v>=0?"#E8F5E9":"#FFEBEE",color:v>=0?G:R,padding:"2px 7px",borderRadius:20,fontSize:11,fontWeight:700,fontFamily:"monospace"}}>{pc(v)}</span>;
const SB=({l,v,c})=><div style={{flex:1,background:"#f7faf7",borderRadius:8,padding:"8px 10px",minWidth:0}}><div style={{fontSize:9,color:"#aaa",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{l}</div><div style={{fontSize:12,fontWeight:800,color:c||DK,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div></div>;
const Row=({k,v,vc,b})=><div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f5f5f5"}}><span style={{fontSize:12,color:"#666"}}>{k}</span><span style={{fontSize:12,fontWeight:b?800:600,color:vc||DK,fontFamily:"monospace"}}>{v}</span></div>;
// ── APP ───────────────────────────────────────────────────────
export default function App(){
  const[tab,setTab]=useState("dash");
  const[speed,setSpeed]=useState(10);
  const[auto,setAuto]=useState(false);
  const speedRef=useRef(10);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  // All top-level state for modals and UI
  const[selCo,setSelCo]=useState(null);
  const[coTab,setCoTab]=useState("info");
  const[trM,setTrM]=useState(null);
  const[trAmt,setTrAmt]=useState(null);
  const[donM,setDonM]=useState(null);
  const[donAmt,setDonAmt]=useState(null);
  const[gsfM,setGsfM]=useState(false);
  const[gsfAmt,setGsfAmt]=useState(null);
  const[fSec,setFSec]=useState("All");
  const[toast,setToast]=useState(null);
  const[evN,setEvN]=useState(null);
  const[beta,setBeta]=useState(false);
  // Wallet transfer state — TOP LEVEL (not inside JSX)
  const[wDir,setWDir]=useState("T2P");
  const[wPct,setWPct]=useState(null);
  // Forex state — TOP LEVEL
  const[fxSel,setFxSel]=useState(null);
  const[fxSide,setFxSide]=useState("long");
  const[fxAmt,setFxAmt]=useState(null);
  const aRef=useRef(null);
  // ── GAME STATE ───────────────────────────────────────────────
  const S=useRef(null);
  if(!S.current){S.current={
    turn:1,gdp:2.5,inf:3.2,intr:4.5,gsf:12.48,
    // 3 WALLETS
    personalWallet:100000,  // Protected, min $10K, earns 2%/yr
    tradingWallet:900000,   // All trades draw from here
    gsfDep:0,               // GSF investment pool
    gsfTotal:0,walletPending:0,
    cos:COS.map(c=>({...c,price:c.ip,pp:c.ip,pe:c.pe0,ch:0,hist:[c.ip],ceoRep:c.yr<1990?82:c.yr<2005?72:c.yr<2012?62:55})),
    comm:COMM.map(c=>({...c,p:c.ip,pp:c.ip,ch:0,hist:[c.ip]})),
    cryp:CRYP.map(c=>({...c,p:c.ip,pp:c.ip,ch:0,hist:[c.ip]})),
    bonds:BONDS.map(b=>({...b,cy:b.oy})),
    fx:[{id:"EURUSD",n:"EUR/USD",p:1.0850,ch:0,hist:[1.0850]},{id:"GBPUSD",n:"GBP/USD",p:1.2680,ch:0,hist:[1.2680]},{id:"USDJPY",n:"USD/JPY",p:148.50,ch:0,hist:[148.50]},{id:"USDAED",n:"USD/AED",p:3.6735,ch:0,hist:[3.6735],locked:true},{id:"USDCNY",n:"USD/CNY",p:6.8000,ch:0,hist:[6.8000],locked:true},{id:"USDINR",n:"USD/INR",p:83.20,ch:0,hist:[83.20]}],
    fxPos:{},
    sh:{},bh:{},ch:{},crh:{},avgSh:{},avgCm:{},avgCr:{},
    aevts:[],
    // Tax era
    era:"Normal",eraStart:1,cgtRate:.20,divRate:.15,txnRate:.001,
    taxRed:0,phiBen:[],taxPaid:0,
    // Redemption points (philanthropy → spin tokens)
    redeemPts:0,spinTokens:0,spinsUsed:0,lastSpin:0,dons:0,
    // Bankruptcy
    liquidating:false,bankrupt:false,bkWarn:false,
    // History
    lastDiv:0,lastCoup:0,wh:[1000000,1000000],
    news:[{id:1,t:1,ico:"🌐",ti:"Galactic Raider — Clean Build",bo:"$1M starting capital. 3 wallets: Personal ($100K protected), Trading ($900K active), GSF (earns daily interest). All markets live. Forex unlimited. Philanthropy earns Redemption Points → Wheel of Fortune spin tokens.",g:true}],
  };}
  const[D,setD]=useState(()=>({...S.current}));
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2500);},[]);
  const refresh=useCallback(()=>setD({...S.current}),[]);
  // ── ADVANCE ──────────────────────────────────────────────────
  const advance=useCallback(()=>{
    const s=S.current;s.turn++;
    // Macro drift
    s.gdp=Math.round(cl(s.gdp+(Math.random()-.48)*.5,-3,7)*10)/10;
    s.inf=Math.round(cl(s.inf+(Math.random()-.5)*.3,0,12)*10)/10;
    s.intr=Math.round(cl(s.intr+(Math.random()-.5)*.2,.5,12)*10)/10;
    s.gsf=Math.round(cl(s.gsf+(Math.random()-.5)*.25,3,14)*100)/100;
    // Tax era rotation (60 turns per era)
    const ERAS=["Normal","High Tax","Low Tax","Capital Gains","Dividend","Transaction","Wealth Tax","Normal"];
    const newEra=ERAS[Math.floor((s.turn-1)/60)%ERAS.length];
    if(newEra!==s.era){
      s.era=newEra;s.eraStart=s.turn;
      const R2={Normal:{c:.20,d:.15,t:.001},"High Tax":{c:.30,d:.25,t:.0015},"Low Tax":{c:.10,d:.05,t:.0005},"Capital Gains":{c:.05,d:.15,t:.001},Dividend:{c:.20,d:.05,t:.001},Transaction:{c:.20,d:.15,t:.0001},"Wealth Tax":{c:.20,d:.15,t:.001}};
      const r=R2[newEra]||R2.Normal;s.cgtRate=r.c;s.divRate=r.d;s.txnRate=r.t;
      s.news.unshift({id:Math.random(),t:s.turn,ico:"🔔",ti:"Tax Era: "+newEra,bo:"CGT "+(r.c*100).toFixed(0)+"% · Div "+(r.d*100).toFixed(0)+"% · Txn "+(r.t*100).toFixed(2)+"%",g:newEra==="Low Tax"||newEra==="Capital Gains"||newEra==="Dividend"||newEra==="Transaction"});
    }
    // Philanthropy benefit tick
    s.phiBen=(s.phiBen||[]).map(b=>({...b,rem:b.rem-1})).filter(b=>b.rem>0);
    s.taxRed=Math.min(.75,(s.phiBen||[]).reduce((x,b)=>x+b.rate,0));
    // Events
    s.aevts=s.aevts.map(e=>({...e,tl:e.tl-1})).filter(e=>e.tl>0);
    const nn=[];
    EVTS.forEach(ed=>{
      if(Math.random()<ed.prob){
        if(ed.t==="co"){const el=s.cos.filter(c=>!s.aevts.find(a=>a.id===ed.id&&a.tk===c.t));if(el.length){const tg=el[Math.floor(Math.random()*el.length)];s.aevts.push({...ed,tk:tg.t,tl:ed.dur,dur:ed.dur});nn.push({id:Math.random(),t:s.turn,ico:ed.ico,ti:ed.n+" — "+tg.n,bo:tg.n+" affected.",g:ed.good});setEvN({...ed,cn:tg.n});setTimeout(()=>setEvN(null),4000);}}
        else if(!s.aevts.find(a=>a.id===ed.id)){s.aevts.push({...ed,tl:ed.dur,dur:ed.dur});nn.push({id:Math.random(),t:s.turn,ico:ed.ico,ti:ed.n,bo:"Market event active.",g:ed.good});setEvN({...ed});setTimeout(()=>setEvN(null),4000);}
      }
    });
    // Price steps — ALL markets every turn
    s.cos=stepS(s.cos,s.gdp,s.inf,s.intr,s.aevts);
    s.comm=stepC(s.comm);
    s.cryp=stepCr(s.cryp);
    s.bonds=s.bonds.map(b=>({...b,cy:Math.round(cl(b.cy+(Math.random()-.5)*.2,1,45)*100)/100}));
    s.fx=s.fx.map(fx=>fx.locked?fx:{...fx,pp:fx.p,p:Math.round(fx.p*cl(1+(Math.random()-.5)*.004,.996,1.004)*10000)/10000,ch:(Math.random()-.5)*.004,hist:[...(fx.hist||[]).slice(-50),fx.p]});
    // Pending wallet transfer settlement
    if((s.walletPending||0)>0){s.personalWallet=Math.round((s.personalWallet+s.walletPending)*100)/100;s.walletPending=0;}
    // Personal wallet interest (2%/yr = 0.00548%/turn)
    s.personalWallet=Math.round((s.personalWallet*(1+.02/365))*100)/100;
    // GSF daily interest (spec: rate÷365 per turn)
    if(s.gsfDep>0){const ret=Math.round(s.gsfDep*(s.gsf/100/365)*100)/100;s.tradingWallet=Math.round((s.tradingWallet+ret)*100)/100;s.gsfTotal=Math.round((s.gsfTotal+ret)*100)/100;}
    // Quarterly dividends (every 91 turns). div% is annual → pay /4
    if(s.turn%91===0){
      let div=0;Object.entries(s.sh).forEach(([t,n])=>{const c=s.cos.find(x=>x.t===t);if(c&&n>0){const gross=c.price*(c.div/100/4)*n;const tax=Math.round(gross*s.divRate*100)/100;div+=gross-tax;}});
      let coup=0;Object.entries(s.bh).forEach(([id,q])=>{const b=s.bonds.find(x=>x.id===id);if(b&&q>0){const gross=b.fv*(b.cou/100/4)*q;coup+=gross-Math.round(gross*.25*100)/100;}});
      if(div>0){s.tradingWallet=Math.round((s.tradingWallet+div)*100)/100;s.lastDiv=div;nn.push({id:Math.random(),t:s.turn,ico:"💰",ti:"Dividends: "+fm(div),bo:"Quarterly payment. Annual yield ÷ 4 after "+((s.divRate||.15)*100).toFixed(0)+"% withholding.",g:true});}
      if(coup>0){s.tradingWallet=Math.round((s.tradingWallet+coup)*100)/100;s.lastCoup=coup;nn.push({id:Math.random(),t:s.turn,ico:"📋",ti:"Bond Coupons: "+fm(coup),bo:"Quarterly coupon after 25% bond interest tax.",g:true});}
    }
    // Compute NW for bankruptcy and wealth tax
    const sv2=Object.entries(s.sh).reduce((x,[t,n])=>{const c=s.cos.find(y=>y.t===t);return x+(c?c.price*n:0);},0);
    const nw2=s.personalWallet+s.tradingWallet+sv2+s.gsfDep;
    if(nw2>10e9){const wt=Math.round((nw2-10e9)*.001*(1-s.taxRed)*100)/100;s.tradingWallet=Math.max(0,s.tradingWallet-wt);s.taxPaid=(s.taxPaid||0)+wt;}
    // Bankruptcy checks
    if(nw2<100000&&nw2>0&&!s.bkWarn){s.bkWarn=true;nn.push({id:Math.random(),t:s.turn,ico:"🟡",ti:"YELLOW ALERT — Low Net Worth",bo:"Below $100K. Must reach $150K to clear. Reduce risk.",g:false});}
    if(nw2>150000)s.bkWarn=false;
    if(nw2<0&&!s.liquidating){s.liquidating=true;nn.push({id:Math.random(),t:s.turn,ico:"🟠",ti:"ORANGE — Forced Liquidation",bo:"Net worth negative. 10% of Trading Wallet liquidated per turn. Cannot buy new positions.",g:false});}
    if(s.liquidating&&nw2>=50000){s.liquidating=false;nn.push({id:Math.random(),t:s.turn,ico:"✅",ti:"Recovery — Liquidation Stopped",bo:"Net worth back above $50K.",g:true});}
    if(s.liquidating){const lq=Math.round((s.tradingWallet||0)*.10*100)/100;s.tradingWallet=Math.round((s.tradingWallet-lq)*100)/100;}
    if(nw2<-500000&&!s.bankrupt){s.bankrupt=true;nn.push({id:Math.random(),t:s.turn,ico:"💀",ti:"BANKRUPT — GAME OVER",bo:"Net worth below −$500K. Restart to play again. Academy progress retained.",g:false});}
    if([100,300,500,1000].includes(s.turn))nn.push({id:Math.random(),t:s.turn,ico:"🏁",ti:"Milestone: Turn "+s.turn,bo:{100:"Governor stable.",300:"Solar window opens.",500:"Full DEE running.",1000:"LAUNCH GATE."}[s.turn],g:true});
    s.wh=[...s.wh.slice(-60),nw2];
    s.news=[...nn.reverse(),...s.news].slice(0,80);
    refresh();
  },[refresh]);
  useEffect(()=>{if(!auto){clearInterval(aRef.current);return;}clearInterval(aRef.current);aRef.current=setInterval(()=>advance(),speedRef.current*1000);return()=>clearInterval(aRef.current);},[auto,speed,advance]);
  // ── COMPUTED ─────────────────────────────────────────────────
  const d=D;
  const SH=d.sh||{},BH=d.bh||{},CH=d.ch||{},CRH=d.crh||{},FXP=d.fxPos||{};
  const sv=Object.entries(SH).reduce((x,[t,n])=>{const c=d.cos.find(y=>y.t===t);return x+(c?c.price*n:0);},0);
  const bv=Object.entries(BH).reduce((x,[id,q])=>{const b=d.bonds.find(y=>y.id===id);return x+(b?gBP(b)*q:0);},0);
  const cv=Object.entries(CH).reduce((x,[id,q])=>{const c=d.comm.find(y=>y.id===id);return x+(c?c.p*q:0);},0);
  const crv=Object.entries(CRH).reduce((x,[id,q])=>{const c=d.cryp.find(y=>y.id===id);return x+(c?c.p*q:0);},0);
  const fxv=Object.values(FXP).reduce((x,pos)=>{const fx=d.fx.find(f=>f.id===pos.id||Object.keys(FXP).find(k=>FXP[k]===pos));return x+(pos.cost||0);},0);
  const tw=d.tradingWallet||0,pw=d.personalWallet||0,gsfd=d.gsfDep||0;
  // NET WORTH = ALL wallets + ALL holdings
  const nw=pw+tw+gsfd+sv+bv+cv+crv;
  const pnw=d.wh[d.wh.length-2]||1000000;
  const nwch=nw-pnw;
  const regs=new Set(Object.keys(SH).map(t=>d.cos.find(c=>c.t===t)?.r).filter(Boolean));
  const SC={nw:{met:nw>=5e9,l:"Net Worth $5B",v:fm(nw)},turns:{met:d.turn>=300,l:"Turn 300",v:d.turn+"/300"},regions:{met:regs.size>=3,l:"3 Regions",v:regs.size+"/3"},bonds:{met:Object.keys(BH).length>=2,l:"2 Bond Types",v:Object.keys(BH).length+"/2"},dons:{met:(d.dons||0)>=2,l:"2 Donations",v:(d.dons||0)+"/2"}};
  const spct=Math.round(Object.values(SC).filter(x=>x.met).length/5*100);
  // ── TRADE ────────────────────────────────────────────────────
  const trade=(type,item,mode,qty)=>{
    const s=S.current,isBuy=mode==="buy",q=Math.floor(qty);
    if(q<1)return;
    if(s.liquidating&&isBuy){toast_("Liquidation active — cannot buy",false);return;}
    if(type==="stock"){
      const txn=Math.round(q*item.price*(s.txnRate||.001)*100)/100;
      if(isBuy){const cost=Math.round(q*item.price*100)/100+txn;if(cost>s.tradingWallet){toast_("Need "+fm(cost)+" — Trading: "+fm(s.tradingWallet),false);return;}const prev=s.sh[item.t]||0;s.sh[item.t]=(prev)+q;s.avgSh[item.t]=Math.round(((s.avgSh[item.t]||item.price)*prev+q*item.price)/s.sh[item.t]*100)/100;s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;s.taxPaid=(s.taxPaid||0)+txn;toast_("Bought "+q.toLocaleString()+" "+item.t+" @ "+fm(item.price));}
      else{const held=s.sh[item.t]||0;if(q>held){toast_("Only "+held+" held",false);return;}const proc=Math.round(q*item.price*100)/100;const profit=Math.max(0,(item.price-(s.avgSh[item.t]||item.price))*q);const cgt=Math.round(profit*(s.cgtRate||.20)*(1-(s.taxRed||0))*100)/100;const net=proc-cgt-txn;s.tradingWallet=Math.round((s.tradingWallet+net)*100)/100;s.sh[item.t]=held-q;if(!s.sh[item.t])delete s.sh[item.t];s.taxPaid=(s.taxPaid||0)+cgt+txn;toast_("Sold "+q.toLocaleString()+" "+item.t+" · CGT: "+fm(cgt));}
    }else if(type==="comm"){
      if(isBuy){const cost=Math.round(q*item.p*100)/100;if(cost>s.tradingWallet){toast_("Need "+fm(cost),false);return;}s.ch[item.id]=(s.ch[item.id]||0)+q;s.avgCm[item.id]=item.p;s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;toast_("Bought "+q.toLocaleString()+" "+item.u+" of "+item.n);}
      else{const held=s.ch[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}const proc=Math.round(q*item.p*100)/100;const profit=Math.max(0,(item.p-(s.avgCm[item.id]||item.p))*q);const cgt=Math.round(profit*(s.cgtRate||.20)*(1-(s.taxRed||0))*100)/100;s.tradingWallet=Math.round((s.tradingWallet+proc-cgt)*100)/100;s.ch[item.id]=held-q;if(!s.ch[item.id])delete s.ch[item.id];toast_("Sold "+q+" "+item.u+" · CGT: "+fm(cgt));}
    }else if(type==="cryp"){
      if(isBuy){const cost=Math.round(q*item.p*100)/100;if(cost>s.tradingWallet){toast_("Need "+fm(cost),false);return;}s.crh[item.id]=(s.crh[item.id]||0)+q;s.avgCr[item.id]=item.p;s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;toast_("Bought "+q+" "+item.id);}
      else{const held=s.crh[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}const proc=Math.round(q*item.p*100)/100;const profit=Math.max(0,(item.p-(s.avgCr[item.id]||item.p))*q);const cgt=Math.round(profit*(s.cgtRate||.20)*(1-(s.taxRed||0))*100)/100;s.tradingWallet=Math.round((s.tradingWallet+proc-cgt)*100)/100;s.crh[item.id]=held-q;if(!s.crh[item.id])delete s.crh[item.id];toast_("Sold "+q+" "+item.id+" · CGT: "+fm(cgt));}
    }else if(type==="bond"){
      const pr=gBP(item);
      if(isBuy){const cost=Math.round(pr*q*100)/100;if(cost>s.tradingWallet){toast_("Need "+fm(cost),false);return;}s.bh[item.id]=(s.bh[item.id]||0)+q;s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;toast_("Bought "+q+"× "+item.n);}
      else{const held=s.bh[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}s.tradingWallet=Math.round((s.tradingWallet+pr*q)*100)/100;s.bh[item.id]=held-q;if(!s.bh[item.id])delete s.bh[item.id];toast_("Sold "+q+"× bonds");}
    }
    setTrM(null);setTrAmt(null);refresh();
  };
  // ── TABS ──────────────────────────────────────────────────────
  const TABS=[{id:"dash",ico:"🏠",l:"Home"},{id:"mkt",ico:"📊",l:"Stocks"},{id:"comm",ico:"⛽",l:"Comm."},{id:"cryp",ico:"₿",l:"Crypto"},{id:"fx",ico:"💱",l:"Forex"},{id:"bonds",ico:"📋",l:"Bonds"},{id:"port",ico:"💼",l:"Port."},{id:"ph",ico:"❤️",l:"Give"},{id:"gsf",ico:"🏛️",l:"GSF"},{id:"sol",ico:"☀️",l:"Solar"},{id:"news",ico:"📰",l:"News"},{id:"set",ico:"⚙️",l:"Set."}];
  const ts=id=>({padding:"5px 0 4px",flex:1,border:"none",background:tab===id?"#fff":"transparent",borderRadius:tab===id?7:0,color:tab===id?G:"#aaa",fontWeight:700,fontSize:9,cursor:"pointer",textAlign:"center",boxShadow:tab===id?"0 1px 4px rgba(0,0,0,.12)":"none",minWidth:0,fontFamily:"system-ui,sans-serif"});
  // ── WALLET TRANSFER LOGIC (uses top-level wDir, wPct) ─────────
  const doWalletTransfer=()=>{
    if(!wPct)return;
    const s=S.current;
    const src=wDir==="T2P"?s.tradingWallet:s.personalWallet;
    const maxT=wDir==="T2P"?src:Math.max(0,src-10000);
    const amt=Math.round(maxT*(wPct/100)*100)/100;
    if(amt<=0){toast_("Nothing to transfer",false);return;}
    if(wDir==="T2P"){
      if(amt>s.tradingWallet){toast_("Insufficient Trading Wallet",false);return;}
      s.tradingWallet=Math.round((s.tradingWallet-amt)*100)/100;
      s.walletPending=Math.round(((s.walletPending||0)+amt)*100)/100;
      toast_(fm(amt)+" Trading → Personal (arrives next turn)");
    }else{
      if(amt>Math.max(0,s.personalWallet-10000)){toast_("Cannot go below $10K minimum",false);return;}
      s.personalWallet=Math.round((s.personalWallet-amt)*100)/100;
      s.tradingWallet=Math.round((s.tradingWallet+amt)*100)/100;
      toast_(fm(amt)+" Personal → Trading (instant)");
    }
    setWPct(null);refresh();
  };
  // ── SCREENS ───────────────────────────────────────────────────
  // HOME
  const S_Dash=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:18,padding:20,color:"#fff",overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,background:"rgba(255,255,255,.05)",borderRadius:"50%"}}/>
      <div style={{fontSize:11,opacity:.65,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Total Net Worth</div>
      <div style={{fontSize:36,fontWeight:800,fontFamily:"monospace",lineHeight:1,marginBottom:5}}>{fm(nw)}</div>
      <div style={{fontSize:12,opacity:.9,marginBottom:12}}>{nwch>=0?"📈":"📉"} {fm(Math.abs(nwch))} ({nwch>=0?"+":""}{pnw>0?((nwch/pnw)*100).toFixed(2):0}%) last turn</div>
      <div style={{height:46}}><WC hist={d.wh}/></div>
      <div style={{display:"flex",gap:6,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.2)"}}>
        {[["🔒 Personal",fm(pw)],["⚡ Trading",fm(tw)],["🏛️ GSF",fm(gsfd)],["📊 Stocks",fm(sv)],["📋 Bonds",fm(bv)],["₿ Crypto",fm(crv)]].map(([k,v])=><div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:7,opacity:.5,textTransform:"uppercase",marginBottom:1}}>{k}</div><div style={{fontSize:9,fontWeight:700,fontFamily:"monospace"}}>{v}</div></div>)}
      </div>
    </div>
    {/* Controls */}
    <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:16,fontWeight:800,color:DK}}>Turn {d.turn}</span>
        <div style={{display:"flex",gap:4}}>
          {[1,5,10,30,60].map(s2=><button key={s2} onClick={()=>setSpeed(s2)} style={{padding:"3px 8px",borderRadius:20,border:"1.5px solid "+(speed===s2?G:"#ddd"),background:speed===s2?G:"#fff",color:speed===s2?"#fff":"#666",fontWeight:600,fontSize:10,cursor:"pointer"}}>{s2<60?s2+"s":"1m"}</button>)}
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={advance} disabled={auto} style={{flex:3,background:auto?"#e8e8e8":G,color:auto?"#aaa":"#fff",border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,fontSize:14,cursor:auto?"not-allowed":"pointer"}}>▶ Next Turn</button>
        <button onClick={()=>setAuto(a=>!a)} style={{flex:2,background:auto?"#B71C1C":"#f0f4f0",color:auto?"#fff":"#555",border:"1px solid #ddd",borderRadius:10,padding:"13px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>{auto?"⏹ Stop":"Auto"}</button>
      </div>
    </div>
    {/* 3 Wallets */}
    <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{fontSize:14,fontWeight:800,color:DK,marginBottom:12}}>💼 Your 3 Wallets</div>
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        <div style={{flex:1,background:"#E8F5E9",borderRadius:10,padding:"10px 8px",border:"1px solid #A5D6A7",textAlign:"center"}}>
          <div style={{fontSize:9,color:G,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>🔒 Personal</div>
          <div style={{fontSize:14,fontWeight:800,color:G,fontFamily:"monospace"}}>{fm(pw)}</div>
          <div style={{fontSize:9,color:"#aaa",marginTop:2}}>Protected · 2%/yr</div>
        </div>
        <div style={{flex:1,background:"#E3F2FD",borderRadius:10,padding:"10px 8px",border:"1px solid #90CAF9",textAlign:"center"}}>
          <div style={{fontSize:9,color:BL,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>⚡ Trading</div>
          <div style={{fontSize:14,fontWeight:800,color:BL,fontFamily:"monospace"}}>{fm(tw)}</div>
          <div style={{fontSize:9,color:"#aaa",marginTop:2}}>All trades</div>
        </div>
        <div style={{flex:1,background:"#FFF8E1",borderRadius:10,padding:"10px 8px",border:"1px solid #FFE082",textAlign:"center"}}>
          <div style={{fontSize:9,color:AU,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>🏛️ GSF</div>
          <div style={{fontSize:14,fontWeight:800,color:AU,fontFamily:"monospace"}}>{fm(gsfd)}</div>
          <div style={{fontSize:9,color:"#aaa",marginTop:2}}>Earns daily</div>
        </div>
      </div>
      {/* Transfer direction */}
      <div style={{display:"flex",background:"#f0f4f0",borderRadius:10,padding:3,gap:3,marginBottom:10}}>
        {[{v:"T2P",l:"Trading → Personal"},{v:"P2T",l:"Personal → Trading"}].map(o=><button key={o.v} onClick={()=>{setWDir(o.v);setWPct(null);}} style={{flex:1,padding:"9px 6px",borderRadius:8,border:"none",background:wDir===o.v?"#fff":"transparent",color:wDir===o.v?DK:"#999",fontWeight:700,fontSize:11,cursor:"pointer",boxShadow:wDir===o.v?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{o.l}</button>)}
      </div>
      {/* % buttons */}
      {(()=>{const src=wDir==="T2P"?tw:pw;const maxT=wDir==="T2P"?src:Math.max(0,src-10000);
        return <>
          <div style={{fontSize:11,color:"#aaa",marginBottom:7}}>From {wDir==="T2P"?"Trading":"Personal"}: {fm(src)}{wDir==="P2T"?" (min $10K stays)":""}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:10}}>
            {[10,25,50,100].map(pct=>{const amt=Math.round(maxT*(pct/100)*100)/100;return <button key={pct} onClick={()=>setWPct(wPct===pct?null:pct)} style={{padding:"10px 4px",borderRadius:10,border:"2px solid "+(wPct===pct?G:"#e0e0e0"),background:wPct===pct?"#E8F5E9":"#fafafa",color:wPct===pct?G:"#555",fontWeight:800,fontSize:12,cursor:"pointer"}}><div>{pct}%</div><div style={{fontSize:9,color:wPct===pct?G:"#aaa",marginTop:2}}>{fm(amt)}</div></button>;})}
          </div>
          {wPct&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:10}}>
            <Row k={"From "+(wDir==="T2P"?"Trading":"Personal")} v={"−"+fm(Math.round(maxT*(wPct/100)*100)/100)} vc={R}/>
            <Row k={"To "+(wDir==="T2P"?"Personal":"Trading")} v={"+"+fm(Math.round(maxT*(wPct/100)*100)/100)} vc={G}/>
            <Row k="Settlement" v={wDir==="T2P"?"1 turn delay":"Instant"} vc={wDir==="T2P"?AU:G}/>
          </div>}
          <button onClick={doWalletTransfer} disabled={!wPct||maxT<=0} style={{width:"100%",background:wPct&&maxT>0?G:"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:13,cursor:wPct&&maxT>0?"pointer":"not-allowed"}}>
            {wPct&&maxT>0?`Transfer ${wPct}% = ${fm(Math.round(maxT*(wPct/100)*100)/100)} → ${wDir==="T2P"?"Personal":"Trading"}`:"Select percentage above"}
          </button>
          {(d.walletPending||0)>0&&<div style={{marginTop:8,fontSize:11,color:AU,fontWeight:700}}>⏳ {fm(d.walletPending||0)} arriving in Personal next turn</div>}
        </>;
      })()}
    </div>
    {/* Tax era */}
    <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div><div style={{fontSize:14,fontWeight:800,color:DK}}>🔔 {d.era||"Normal"} Era</div><div style={{fontSize:11,color:"#aaa"}}>Turn {d.eraStart||1}–{(d.eraStart||1)+59} · {Math.max(0,60-((d.turn-(d.eraStart||1))%60))} turns left</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:G}}>CGT {(((d.cgtRate||.20)*100)).toFixed(0)}%</div><div style={{fontSize:11,color:"#aaa"}}>Div {(((d.divRate||.15)*100)).toFixed(0)}% · Txn {(((d.txnRate||.001)*100)).toFixed(2)}%</div></div>
      </div>
      <div style={{height:5,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:(((d.turn-(d.eraStart||1))%60)/60*100).toFixed(1)+"%",background:"linear-gradient(90deg,"+BL+",#42A5F5)",borderRadius:3}}/></div>
      {(d.taxRed||0)>0&&<div style={{marginTop:7,fontSize:11,color:PU,fontWeight:600}}>❤️ Philanthropy relief: {((d.taxRed||0)*100).toFixed(0)}% off all taxes</div>}
    </div>
    {/* Macro */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {[{l:"GDP Growth",v:(d.gdp>=0?"+":"")+d.gdp+"%",c:d.gdp>=0?G:R},{l:"Inflation",v:d.inf+"%",c:d.inf>6?R:d.inf>3?AU:G},{l:"Interest Rate",v:d.intr+"%",c:"#444"},{l:"GSF Rate/yr",v:(d.gsf||12.48).toFixed(2)+"%",c:G}].map(x=><div key={x.l} style={{background:"#fff",borderRadius:11,padding:"11px 13px",border:"1px solid #eee"}}><div style={{fontSize:10,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>{x.l}</div><div style={{fontSize:20,fontWeight:800,color:x.c,fontFamily:"monospace"}}>{x.v}</div></div>)}
    </div>
    {/* Events */}
    {d.aevts.length>0&&<div>{d.aevts.slice(0,2).map((e,i)=><div key={i} style={{background:e.good?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:"10px 13px",border:"1px solid "+(e.good?"#A5D6A7":"#EF9A9A"),display:"flex",alignItems:"center",gap:10,marginBottom:6}}><span style={{fontSize:18}}>{e.ico}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:e.good?G:R}}>{e.n}{e.cn?" — "+e.cn:""}</div><div style={{fontSize:11,color:"#888"}}>{e.tl}/{e.dur} turns</div></div></div>)}</div>}
    {/* Dividend summary */}
    {(d.lastDiv||0)>0&&<div style={{background:"#E8F5E9",borderRadius:14,padding:13,border:"1px solid #A5D6A7"}}>
      <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8}}>💰 Last Dividend Payment</div>
      <div style={{display:"flex",gap:8}}><SB l="Stocks Div." v={fm(d.lastDiv||0)} c={G}/><SB l="Bond Coupons" v={fm(d.lastCoup||0)} c={G}/><SB l="Total" v={fm((d.lastDiv||0)+(d.lastCoup||0))} c={G}/></div>
    </div>}
    {/* Bankruptcy warnings */}
    {d.liquidating&&<div style={{background:"#FFF3E0",borderRadius:11,padding:12,border:"2px solid "+AU}}><div style={{fontSize:14,fontWeight:800,color:AU}}>🟠 FORCED LIQUIDATION ACTIVE</div><div style={{fontSize:12,color:"#666",marginTop:4}}>10% of Trading Wallet liquidated each turn. Cannot open new positions. Transfer from Personal to recover.</div></div>}
    {d.bankrupt&&<div style={{background:"#FFEBEE",borderRadius:11,padding:12,border:"2px solid "+R}}><div style={{fontSize:14,fontWeight:800,color:R}}>💀 BANKRUPT — Net worth below −$500K</div></div>}
    {/* Solar progress */}
    <div onClick={()=>setTab("sol")} style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:14,padding:14,cursor:"pointer",border:"1px solid rgba(212,175,55,.2)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>☀️</span><div><div style={{fontSize:13,fontWeight:700,color:"#F0D060"}}>Solar System {spct===100?"UNLOCKED!":"Progress"}</div><div style={{fontSize:10,color:"rgba(240,208,96,.4)"}}>{Object.values(SC).filter(x=>x.met).length}/5 criteria met</div></div></div><span style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:"#F0D060"}}>{spct}%</span></div>
      <div style={{height:6,background:"rgba(255,255,255,.08)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:3,transition:"width .5s"}}/></div>
    </div>
  </div>;
  // STOCKS
  const S_Mkt=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{overflowX:"auto"}}><div style={{display:"flex",gap:6,paddingBottom:4,width:"max-content"}}>
      {["All",...new Set(COS.map(c=>c.s))].map(s2=><button key={s2} onClick={()=>setFSec(s2)} style={{padding:"6px 12px",borderRadius:20,border:"1.5px solid "+(fSec===s2?G:"#ddd"),background:fSec===s2?G:"#fff",color:fSec===s2?"#fff":"#666",fontWeight:600,fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>{s2}</button>)}
    </div></div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.cos.filter(c=>fSec==="All"||c.s===fSec).map((c,i,arr)=><div key={c.t} onClick={()=>{setSelCo({...c});setTab("co");setCoTab("info");}} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none",cursor:"pointer"}}>
        <div style={{width:38,height:38,borderRadius:10,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{c.t}</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:DK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.n}</div><div style={{fontSize:11,color:"#aaa"}}>{c.s} · P/E {c.pe.toFixed(1)}×</div></div>
        <MC hist={c.hist}/>
        <div style={{textAlign:"right",minWidth:70}}><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace"}}>{fm(c.price)}</div><Bdg v={c.ch}/></div>
      </div>)}
    </div>
  </div>;
  // COMPANY DETAIL
  const Co_=(()=>{
    const c=selCo?d.cos.find(x=>x.t===selCo.t)||selCo:null;
    if(!c)return <div style={{padding:40,textAlign:"center",color:"#aaa",fontSize:14}}>← Select a company from Stocks</div>;
    const held=SH[c.t]||0,avgC=d.avgSh?.[c.t]||c.price,pl=held?(c.price-avgC)*held:0;
    const ev=d.aevts.find(e=>e.t==="co"&&e.tk===c.t);
    const bnd=PEB[c.s]||{mn:10,mx:40},eps=c.price/c.pe;
    return <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:16,padding:18,color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,background:"rgba(255,255,255,.05)",borderRadius:"50%"}}/>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{c.s} · {c.r}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontSize:20,fontWeight:800,marginBottom:2}}>{c.n}</div><div style={{fontSize:11,opacity:.6,marginBottom:8}}>{c.t} · {c.hq} · Est. {c.yr} · {((c.emp||0)/1000).toFixed(0)}K staff</div><div style={{fontFamily:"monospace",fontSize:28,fontWeight:800,lineHeight:1}}>{fm(c.price)}</div><div style={{fontSize:12,marginTop:3,color:c.ch>=0?"#C8E6C9":"#FFCDD2"}}>{c.ch>=0?"▲":"▼"} {pc(c.ch)} this turn</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:10,opacity:.45,marginBottom:2}}>P/E</div><div style={{fontSize:20,fontWeight:800,fontFamily:"monospace"}}>{c.pe.toFixed(1)}×</div><div style={{fontSize:9,opacity:.4}}>{bnd.mn}–{bnd.mx}× bounds</div></div>
        </div>
      </div>
      {ev&&<div style={{background:ev.good?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:10,border:"1px solid "+(ev.good?"#A5D6A7":"#EF9A9A"),display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:18}}>{ev.ico}</span><div><div style={{fontSize:13,fontWeight:700,color:ev.good?G:R}}>Active: {ev.n}</div><div style={{fontSize:11,color:"#888"}}>{ev.tl}/{ev.dur} turns</div></div></div>}
      <div style={{display:"flex",background:"#f0f4f0",borderRadius:10,padding:4,gap:3}}>
        {["info","chart"].map(t2=><button key={t2} onClick={()=>setCoTab(t2)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:coTab===t2?"#fff":"transparent",color:coTab===t2?G:"#888",fontWeight:700,fontSize:12,cursor:"pointer",boxShadow:coTab===t2?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{t2==="info"?"Company Info":"Price Chart"}</button>)}
      </div>
      {coTab==="info"&&<>
        {/* Analyst rating */}
        <div style={{background:c.analyst==="STRONG BUY"?"#1B5E20":c.analyst==="BUY"?"#2E7D32":c.analyst==="HOLD"?"#E65100":c.analyst==="SELL"?"#B71C1C":"#607D8B",borderRadius:11,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:10,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Analyst Rating</div><div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{c.analyst||"HOLD"}</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>Score: {(c.rating||3.5).toFixed(1)}/5.0</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"rgba(255,255,255,.7)",marginBottom:2}}>Price Target</div><div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"monospace"}}>{fm(c.target||c.ip)}</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>{(c.target||c.ip)>c.price?"▲ "+fm((c.target||c.ip)-c.price)+" upside":"▼ "+fm(c.price-(c.target||c.ip))+" downside"}</div></div>
        </div>
        {/* Story */}
        <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>📖 The Story</div>
          <div style={{fontSize:12,color:"#444",lineHeight:1.8,marginBottom:10}}>{c.origin||c.desc}</div>
          <div style={{display:"flex",gap:6}}>
            {[["Founded By",c.founder||"—"],["Est. · HQ",c.yr+" · "+(c.hq||"—")],["CEO Today",c.ceo||"—"]].map(([k,v])=><div key={k} style={{flex:1,background:"#f8fbf8",borderRadius:8,padding:"8px 10px",border:"1px solid #eee"}}><div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.4,marginBottom:2}}>{k}</div><div style={{fontSize:11,fontWeight:700,color:DK}}>{v}</div></div>)}
          </div>
        </div>
        {/* Operations */}
        <div style={{background:"#EDE7F6",borderRadius:11,padding:12,border:"1px solid #D1C4E9"}}><div style={{fontSize:12,fontWeight:700,color:PU,marginBottom:6}}>🌍 Where They Operate</div><div style={{fontSize:12,color:"#444",lineHeight:1.7}}>{c.ops||c.r}</div></div>
        {/* Position */}
        {held>0&&<div style={{background:"#E8F5E9",borderRadius:11,padding:12,border:"1px solid #A5D6A7"}}><div style={{fontSize:12,fontWeight:700,color:G,marginBottom:8}}>💼 Your Position</div><div style={{display:"flex",gap:6}}><SB l="Shares" v={held.toLocaleString()} c={G}/><SB l="Value" v={fm(c.price*held)} c={G}/><SB l="Avg Cost" v={fm(avgC)}/><SB l="P&L" v={(pl>=0?"+":"")+fm(pl)} c={pl>=0?G:R}/></div><div style={{fontSize:11,color:"#888",marginTop:7}}>CGT {(((d.cgtRate||.20)*(1-(d.taxRed||0)))*100).toFixed(0)}% on profit only. Loss = $0 tax.</div></div>}
        {/* Key numbers */}
        <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}><div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>📊 Key Financials</div>{[["Price",fm(c.price)],["EPS",fm(eps)],["P/E",c.pe.toFixed(1)+"× (bounds "+bnd.mn+"–"+bnd.mx+"×)"],["Div Yield",c.div+"%"],["Beta",c.b+"×"],["CEO Reputation",(c.ceoRep||70)+"/100"]].map(([k,v])=><Row key={k} k={k} v={v}/>)}</div>
      </>}
      {coTab==="chart"&&<div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}><div style={{fontSize:12,fontWeight:700,color:"#aaa",marginBottom:8}}>Price History ({c.hist?.length||0} turns)</div><div style={{height:56,display:"flex",alignItems:"flex-end",gap:2}}>{(c.hist||[]).slice(-40).map((pr,i,arr)=>{const mn2=Math.min(...arr),mx2=Math.max(...arr),rng2=mx2-mn2||1;const h=Math.max(4,Math.round(((pr-mn2)/rng2)*52));return <div key={i} style={{flex:1,height:h,background:(i===0||pr>=arr[i-1])?G:R,borderRadius:"2px 2px 0 0",opacity:.8}}/>;})}</div></div>}
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{setTrM({type:"stock",item:c,mode:"buy"});setTrAmt(null);}} disabled={d.liquidating} style={{flex:1,background:d.liquidating?"#e0e0e0":G,color:"#fff",border:"none",borderRadius:11,padding:14,fontWeight:800,fontSize:14,cursor:d.liquidating?"not-allowed":"pointer"}}>📈 Buy</button>
        <button onClick={()=>{setTrM({type:"stock",item:c,mode:"sell"});setTrAmt(null);}} disabled={held<1} style={{flex:1,background:held<1?"#f0f0f0":"#FFEBEE",color:held<1?"#bbb":R,border:"1.5px solid "+(held<1?"#e0e0e0":"#EF9A9A"),borderRadius:11,padding:14,fontWeight:800,fontSize:14,cursor:held<1?"not-allowed":"pointer"}}>📉 Sell {held>0?"("+held.toLocaleString()+")":""}</button>
      </div>
    </div>;
  })();
  // COMMODITIES
  const S_Comm=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"#FFF8E1",borderRadius:11,padding:11,border:"1px solid #FFE082",fontSize:12,color:"#E65100"}}>Commodities · ±4%/turn max · Mean-reversion to base · No position limits · CGT on profit only</div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.comm.map((c,i)=>{const held=CH[c.id]||0,pl=held?(c.p-(d.avgCm?.[c.id]||c.p))*held:0;return <div key={c.id} style={{padding:"12px 14px",borderBottom:i<d.comm.length-1?"1px solid #f5f5f5":"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div><div style={{fontSize:14,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:11,color:"#aaa"}}>{c.id} · {c.u} · base {fm(c.base)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,fontFamily:"monospace",color:c.ch>=0?G:R}}>{fm(c.p)}</div><Bdg v={c.ch||0}/></div></div>
        <div style={{height:24,marginBottom:7}}><MC hist={c.hist} w={240} h={24}/></div>
        {held>0&&<div style={{fontSize:11,color:"#555",marginBottom:7,fontFamily:"monospace"}}>Held: {held.toLocaleString()} {c.u}s · {fm(c.p*held)} · P&L: <span style={{color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</span></div>}
        <div style={{display:"flex",gap:7}}>
          <button onClick={()=>{setTrM({type:"comm",item:c,mode:"buy"});setTrAmt(null);}} disabled={d.liquidating} style={{flex:1,background:d.liquidating?"#e0e0e0":G,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Buy</button>
          {held>0&&<button onClick={()=>trade("comm",c,"sell",held)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell All</button>}
        </div>
      </div>;})}
    </div>
  </div>;
  // CRYPTO
  const S_Cryp=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"#EDE7F6",borderRadius:11,padding:11,border:"1px solid #D1C4E9",fontSize:12,color:PU}}>Crypto · ±8%/turn · Mean-reversion prevents collapse · Floor at 20% of base · CGT on profit</div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.cryp.map((c,i)=>{const held=CRH[c.id]||0,pl=held?(c.p-(d.avgCr?.[c.id]||c.p))*held:0;return <div key={c.id} style={{padding:"12px 14px",borderBottom:i<d.cryp.length-1?"1px solid #f5f5f5":"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div><div style={{fontSize:14,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:11,color:"#aaa"}}>{c.id} · base {fm(c.base)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,fontFamily:"monospace",color:c.ch>=0?G:R}}>{fm(c.p)}</div><Bdg v={c.ch||0}/></div></div>
        <div style={{height:26,marginBottom:7}}><MC hist={c.hist} w={240} h={26}/></div>
        {held>0&&<div style={{fontSize:11,color:"#555",marginBottom:7,fontFamily:"monospace"}}>Held: {held} · {fm(c.p*held)} · P&L: <span style={{color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</span></div>}
        <div style={{display:"flex",gap:7}}>
          <button onClick={()=>{setTrM({type:"cryp",item:c,mode:"buy"});setTrAmt(null);}} disabled={d.liquidating} style={{flex:1,background:d.liquidating?"#e0e0e0":PU,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Buy</button>
          {held>0&&<button onClick={()=>trade("cryp",c,"sell",held)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell All</button>}
        </div>
      </div>;})}
    </div>
  </div>;
  // FOREX — unlimited trading
  const S_Fx=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"#E3F2FD",borderRadius:11,padding:11,border:"1px solid #BBDEFB",fontSize:12,color:BL}}>Forex · No limits — trade any amount · Long = profit when price rises · Short = profit when price falls · USD/AED &amp; USD/CNY locked</div>
    {Object.keys(FXP).length>0&&<div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      <div style={{padding:"10px 14px",fontSize:13,fontWeight:700,color:DK}}>Open Positions</div>
      {Object.entries(FXP).map(([id,pos])=>{const fx=d.fx.find(f=>f.id===id);if(!fx)return null;const pnl=pos.side==="long"?(fx.p-pos.entry)*pos.cost/pos.entry:(pos.entry-fx.p)*pos.cost/pos.entry;
        return <div key={id} style={{padding:"10px 14px",borderTop:"1px solid #f5f5f5"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div><div style={{fontSize:13,fontWeight:700,color:DK}}>{id} {pos.side.toUpperCase()}</div><div style={{fontSize:11,color:"#aaa"}}>Entry {pos.entry.toFixed(4)} · Now {fx.p.toFixed(4)} · Invested {fm(pos.cost)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,fontFamily:"monospace",color:pnl>=0?G:R}}>{pnl>=0?"+":""}{fm(pnl)}</div></div></div>
          <button onClick={()=>{const s=S.current;const pos2=s.fxPos[id];const pnl2=pos2.side==="long"?(fx.p-pos2.entry)*pos2.cost/pos2.entry:(pos2.entry-fx.p)*pos2.cost/pos2.entry;const ret=Math.round((pos2.cost+pnl2)*100)/100;s.tradingWallet=Math.round((s.tradingWallet+ret)*100)/100;delete s.fxPos[id];s.news.unshift({id:Math.random(),t:s.turn,ico:"💱",ti:"Closed "+id,bo:"P&L: "+(pnl2>=0?"+":"")+fm(pnl2)+" → Trading Wallet",g:pnl2>=0});toast_("Closed "+id+" P&L: "+(pnl2>=0?"+":"")+fm(pnl2));refresh();}} style={{width:"100%",background:pnl>=0?G:R,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:800,fontSize:13,cursor:"pointer"}}>Close · {pnl>=0?"Profit":"Loss"}: {pnl>=0?"+":""}{fm(pnl)}</button>
        </div>;})}
    </div>}
    <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.fx.map((fx,i)=>{
        const isSelected=fxSel===fx.id;
        const alreadyOpen=!!FXP[fx.id];
        const presets=[.10,.25,.50,.75,1.0].map(p=>Math.floor(tw*p/100)*100).filter(v=>v>=100&&v<=tw);
        return <div key={fx.id} style={{borderBottom:i<d.fx.length-1?"1px solid #f5f5f5":"none"}}>
          <div onClick={()=>!fx.locked&&!alreadyOpen&&setFxSel(isSelected?null:fx.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",cursor:fx.locked||alreadyOpen?"default":"pointer",background:isSelected?"#F3F8FF":"#fff"}}>
            <div><div style={{fontSize:13,fontWeight:700,color:DK}}>{fx.n}</div>{fx.locked?<span style={{fontSize:10,color:"#aaa"}}>LOCKED</span>:alreadyOpen?<span style={{fontSize:10,color:AU,fontWeight:600}}>Position open — close first</span>:<span style={{fontSize:10,color:BL,fontWeight:600}}>Tap to trade</span>}</div>
            <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,fontFamily:"monospace",color:fx.locked?"#999":(fx.ch||0)>=0?G:R}}>{fx.p.toFixed(4)}</div>{!fx.locked&&<Bdg v={fx.ch||0}/>}</div>
          </div>
          {isSelected&&!fx.locked&&!alreadyOpen&&<div style={{padding:"0 14px 14px"}}>
            {/* Direction */}
            <div style={{display:"flex",background:"#f0f4f0",borderRadius:9,padding:3,gap:2,marginBottom:10}}>
              {[{v:"long",l:"📈 Long — profit if rises"},{v:"short",l:"📉 Short — profit if falls"}].map(o=><button key={o.v} onClick={()=>{setFxSide(o.v);setFxAmt(null);}} style={{flex:1,padding:"9px 6px",borderRadius:8,border:"none",background:fxSide===o.v?"#fff":"transparent",color:fxSide===o.v?DK:"#999",fontWeight:700,fontSize:11,cursor:"pointer",boxShadow:fxSide===o.v?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{o.l}</button>)}
            </div>
            <div style={{fontSize:11,color:"#aaa",marginBottom:7}}>Position Size — Trading Wallet: {fm(tw)} · No limits</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
              {presets.map(v=><button key={v} onClick={()=>setFxAmt(fxAmt===v?null:v)} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(fxAmt===v?(fxSide==="long"?G:R):"#e0e0e0"),background:fxAmt===v?(fxSide==="long"?"#E8F5E9":"#FFEBEE"):"#fafafa",color:fxAmt===v?(fxSide==="long"?G:R):"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(v)}</button>)}
            </div>
            {fxAmt&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:10}}>
              <Row k="Pair" v={fx.id+" @ "+fx.p.toFixed(4)}/>
              <Row k="Direction" v={fxSide.toUpperCase()} vc={fxSide==="long"?G:R}/>
              <Row k="Invested" v={fm(fxAmt)}/>
              <Row k="+1% move P&L" v={"+"+fm(fxAmt*.01)} vc={G}/>
              <Row k="−1% move P&L" v={fm(-fxAmt*.01)} vc={R}/>
            </div>}
            <button onClick={()=>{if(!fxAmt){toast_("Select a position size",false);return;}const s=S.current;if(fxAmt>s.tradingWallet){toast_("Need "+fm(fxAmt)+" — Trading: "+fm(s.tradingWallet),false);return;}s.tradingWallet=Math.round((s.tradingWallet-fxAmt)*100)/100;s.fxPos[fx.id]={entry:fx.p,side:fxSide,cost:fxAmt,id:fx.id};s.news.unshift({id:Math.random(),t:s.turn,ico:"💱",ti:fxSide.toUpperCase()+" "+fx.id,bo:fm(fxAmt)+" @ "+fx.p.toFixed(4)+". P&L updates each turn.",g:true});toast_(fxSide.toUpperCase()+" "+fm(fxAmt)+" on "+fx.id);setFxSel(null);setFxAmt(null);refresh();}} disabled={!fxAmt} style={{width:"100%",background:!fxAmt?"#e0e0e0":fxSide==="long"?G:R,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:13,cursor:fxAmt?"pointer":"not-allowed"}}>{fxAmt?"Open "+fxSide.toUpperCase()+" "+fm(fxAmt)+" on "+fx.id:"Select position size above"}</button>
          </div>}
        </div>;})}
    </div>
  </div>;
  // BONDS
  const S_Bonds=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"#E3F2FD",borderRadius:11,padding:11,border:"1px solid #BBDEFB",fontSize:12,color:BL}}>Bonds · Price = FV×(OrigYield÷CurrYield)×RatingMult · Coupons quarterly · AAA×1.02 → B×0.94</div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.bonds.map((b,i)=>{const pr=gBP(b),held=BH[b.id]||0;return <div key={b.id} style={{padding:"12px 14px",borderBottom:i<d.bonds.length-1?"1px solid #f5f5f5":"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><div style={{fontSize:13,fontWeight:700,color:DK}}>{b.n}</div><div style={{fontSize:11,color:"#aaa"}}>{b.rat} · Matures {b.mat} · Coupon {b.cou}%</div></div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,fontFamily:"monospace",color:pr>b.fv?G:R}}>{fm(pr)}</div><div style={{fontSize:11,color:"#aaa"}}>{b.cy.toFixed(2)}% yield</div></div></div>
        <div style={{display:"flex",gap:6,marginBottom:8}}><SB l="Coupon" v={b.cou+"%"} c={G}/><SB l="Orig Yield" v={b.oy+"%"}/><SB l="Curr Yield" v={b.cy.toFixed(1)+"%"} c={b.cy<b.oy?G:R}/><SB l="Held" v={held} c={held>0?G:"#aaa"}/></div>
        <div style={{display:"flex",gap:5}}>
          {[1,5,10,50].map(q=><button key={q} onClick={()=>trade("bond",b,"buy",q)} disabled={d.liquidating} style={{flex:1,background:d.liquidating?"#e0e0e0":G,color:"#fff",border:"none",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>×{q}</button>)}
          {held>0&&<button onClick={()=>trade("bond",b,"sell",held)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell All</button>}
        </div>
      </div>;})}
    </div>
  </div>;
  // PORTFOLIO
  const S_Port=(()=>{
    const sm={};Object.entries(SH).filter(([,n])=>n>0).forEach(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(c)sm[c.s]=(sm[c.s]||0)+c.price*n;});
    const tsv=Object.values(sm).reduce((a,b2)=>a+b2,0)||1;
    return <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#388E3C)",borderRadius:16,padding:16,color:"#fff"}}><div style={{fontSize:10,opacity:.55,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Portfolio</div><div style={{fontFamily:"monospace",fontSize:30,fontWeight:800}}>{fm(nw)}</div><div style={{fontSize:11,opacity:.7,marginTop:3}}>🔒{fm(pw)} · ⚡{fm(tw)} · 🏛️{fm(gsfd)} · 📊{fm(sv)} · 📋{fm(bv)} · ⛽{fm(cv)} · ₿{fm(crv)}</div></div>
      {Object.keys(sm).length>0&&<div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}><div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Sector Allocation</div>{Object.entries(sm).sort(([,a],[,b2])=>b2-a).map(([s2,v])=><div key={s2} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#555"}}>{s2}</span><span style={{fontSize:12,fontFamily:"monospace"}}>{((v/tsv)*100).toFixed(1)}%</span></div><div style={{height:5,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:((v/tsv)*100)+"%",background:"linear-gradient(90deg,"+G+",#4CAF50)",borderRadius:3}}/></div></div>)}</div>}
      <div style={{background:"#fff",borderRadius:13,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        <div style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:DK}}>Holdings</div>
        {Object.keys(SH).filter(t=>(SH[t]||0)>0).length===0&&<div style={{padding:"13px 14px",fontSize:13,color:"#bbb"}}>No stocks held.</div>}
        {Object.entries(SH).filter(([,n])=>n>0).map(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(!c)return null;const avgC=d.avgSh?.[t]||c.price,pl=(c.price-avgC)*n;
          return <div key={t} style={{padding:"10px 14px",borderTop:"1px solid #f5f5f5"}}>
            <div onClick={()=>{setSelCo({...c});setTab("co");}} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:"pointer"}}>
              <div style={{width:36,height:36,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:11,color:"#aaa"}}>{n.toLocaleString()} shs · {fm(c.price)}/sh · avg {fm(avgC)}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace"}}>{fm(c.price*n)}</div><div style={{fontSize:11,fontFamily:"monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</div></div>
            </div>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>{setTrM({type:"stock",item:c,mode:"buy"});setTrAmt(null);}} disabled={d.liquidating} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>+ More</button>
              <button onClick={()=>trade("stock",c,"sell",Math.floor(n/2))} style={{flex:1,background:"#FFF3E0",color:AU,border:"1px solid #FFCC80",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell 50%</button>
              <button onClick={()=>trade("stock",c,"sell",n)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell All</button>
            </div>
          </div>;})}
      </div>
    </div>;
  })();
  // PHILANTHROPY + WHEEL OF FORTUNE
  const S_Give=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#880E4F,#C2185B)",borderRadius:16,padding:16,color:"#fff"}}>
      <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>❤️ Philanthropy</div>
      <div style={{fontSize:20,fontWeight:800,marginBottom:3}}>Give. Reduce Tax. Spin.</div>
      <div style={{fontSize:12,opacity:.85,lineHeight:1.6}}>Donations earn Redemption Points → Spin Tokens → Wheel of Fortune debt relief. Min $1M per donation.</div>
      <div style={{display:"flex",gap:8,marginTop:10}}>
        <SB l="Donations" v={d.dons||0} c="#FFCDD2"/>
        <SB l="Redeem Pts" v={(d.redeemPts||0).toLocaleString()} c="#FFCDD2"/>
        <SB l="Spin Tokens" v={d.spinTokens||0} c="#FFCDD2"/>
        <SB l="Tax Relief" v={((d.taxRed||0)*100).toFixed(0)+"%"} c="#FFCDD2"/>
      </div>
    </div>
    {/* Wheel of Fortune */}
    {(d.spinTokens||0)>0&&(d.dons||0)>=2&&(d.turn-(d.lastSpin||0))>=1000&&(d.spinsUsed||0)<5&&<div style={{background:"linear-gradient(135deg,#1A237E,#283593)",borderRadius:14,padding:14,border:"2px solid gold"}}>
      <div style={{fontSize:14,fontWeight:800,color:"gold",marginBottom:8}}>🎡 Wheel of Fortune Available!</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.8)",marginBottom:12}}>Cost: 500 pts + 1 token · Outcomes: 5–50% debt forgiveness · Max 5 spins per game · {5-(d.spinsUsed||0)} remaining</div>
      <div style={{fontSize:11,color:"rgba(255,255,255,.6)",marginBottom:12}}>Outcomes: 5% forgiveness (30%) · 10% (20%) · 15% (15%) · 25% (10%) · 50% (10%) · Bonus 100 pts (15%)</div>
      <button onClick={()=>{
        const s=S.current;
        if((s.redeemPts||0)<500){toast_("Need 500 redemption points",false);return;}
        if((s.spinTokens||0)<1){toast_("No spin tokens",false);return;}
        s.redeemPts=(s.redeemPts||0)-500;s.spinTokens=(s.spinTokens||0)-1;s.spinsUsed=(s.spinsUsed||0)+1;s.lastSpin=s.turn;
        const roll=Math.random();
        let result,msg;
        if(roll<.30){result="5% debt relief";msg="🎡 Landed on 5% — moderate relief.";}
        else if(roll<.50){result="10% debt relief";msg="🎡 Landed on 10% — good result!";}
        else if(roll<.65){result="15% debt relief";msg="🎡 Landed on 15% — great result!";}
        else if(roll<.75){result="25% debt relief";msg="🎡 Landed on 25% — excellent!";}
        else if(roll<.85){result="50% debt relief";msg="🎡 JACKPOT — 50% debt forgiven!";}
        else{s.redeemPts=(s.redeemPts||0)+100;result="Bonus 100 pts";msg="🎡 No debt relief this time — +100 redemption points consolation prize.";}
        s.news.unshift({id:Math.random(),t:s.turn,ico:"🎡",ti:"Wheel of Fortune: "+result,bo:msg,g:true});
        toast_("🎡 "+result);refresh();
      }} style={{width:"100%",background:"linear-gradient(135deg,#B8952A,#F0D060)",color:"#000",border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,fontSize:14,cursor:"pointer"}}>🎡 Spin the Wheel (500 pts + 1 token)</button>
    </div>}
    {(d.spinTokens||0)>0&&((d.dons||0)<2||(d.turn-(d.lastSpin||0))<1000||(d.spinsUsed||0)>=5)&&<div style={{background:"#f8fbf8",borderRadius:11,padding:12,border:"1px solid #e8ebe8",fontSize:12,color:"#666"}}>
      🎡 Spin token available but conditions not met: Need 2+ donations, 1,000 turns since last spin, under 5 lifetime spins.
      {(d.spinsUsed||0)>=5&&" Max 5 spins reached."}
      {(d.turn-(d.lastSpin||0))<1000&&" Wait "+Math.max(0,1000-(d.turn-(d.lastSpin||0)))+" more turns."}
    </div>}
    {/* Donation categories */}
    {[{n:"Healthcare",ico:"🏥",r:.20,dur:3},{n:"Education",ico:"🎓",r:.25,dur:5},{n:"Environment",ico:"🌱",r:.30,dur:7},{n:"Infrastructure",ico:"🌉",r:.15,dur:4},{n:"Poverty",ico:"🤝",r:.20,dur:3},{n:"Science",ico:"🔬",r:.25,dur:5},{n:"Arts",ico:"🎨",r:.10,dur:2},{n:"Disaster",ico:"🚨",r:.35,dur:8}].map(cat=><div key={cat.n} style={{background:"#fff",borderRadius:13,padding:12,border:"1px solid #e8ebe8"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:20}}>{cat.ico}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:DK}}>{cat.n}</div><div style={{fontSize:11,color:"#888"}}>{(cat.r*100).toFixed(0)}% tax relief for {cat.dur} turns · Points multiplier varies</div></div></div>
      <button onClick={()=>{setDonM(cat.n);setDonAmt(null);}} style={{width:"100%",background:"#880E4F",color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Donate to {cat.n} ❤️</button>
    </div>)}
  </div>;
  // GSF
  const S_GSF=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",borderRadius:16,padding:16,color:"#fff"}}>
      <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🏛️ Global Sovereign Fund</div>
      <div style={{fontSize:20,fontWeight:800,marginBottom:3}}>Your Third Wallet</div>
      <div style={{fontSize:12,opacity:.85}}>Separate from Trading — earns GSF rate ÷ 365 every turn. Deposit goes to Trading Wallet after 2% fee. Withdraw anytime. Never auto-reduced.</div>
    </div>
    <div style={{background:"#E3F2FD",borderRadius:13,padding:14,border:"1px solid #BBDEFB"}}>
      <div style={{fontSize:13,fontWeight:700,color:BL,marginBottom:10}}>Your GSF Position</div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <SB l="GSF Deposit" v={fm(gsfd)} c={BL}/>
        <SB l="Rate / yr" v={(d.gsf||12.48).toFixed(2)+"%"} c={G}/>
        <SB l="Per Turn" v={fm(gsfd*(d.gsf||12.48)/100/365)} c={G}/>
      </div>
      <div style={{background:"#fff",borderRadius:9,padding:"10px 12px",marginBottom:12,fontSize:12,color:"#666",lineHeight:1.6}}>
        Total earned: <strong>{fm(d.gsfTotal||0)}</strong><br/>
        Formula: {fm(gsfd)} × {(d.gsf||12.48).toFixed(2)}% ÷ 365 = {fm(gsfd*(d.gsf||12.48)/100/365)}/turn<br/>
        Deposit is permanent — only you can withdraw.
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{setGsfM(true);setGsfAmt(null);}} style={{flex:2,background:BL,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Deposit to GSF</button>
        {gsfd>0&&<button onClick={()=>{const s=S.current;const amt=s.gsfDep;s.tradingWallet=Math.round((s.tradingWallet+amt)*100)/100;s.gsfDep=0;s.news.unshift({id:Math.random(),t:s.turn,ico:"🏛️",ti:"GSF Withdrawal",bo:fm(amt)+" withdrawn to Trading Wallet.",g:true});toast_("Withdrawn "+fm(amt)+" from GSF");refresh();}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>Withdraw All</button>}
      </div>
    </div>
  </div>;
  // SOLAR
  const S_Sol=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#060B16,#112040)",borderRadius:16,padding:16,border:"1px solid rgba(212,175,55,.2)"}}>
      <div style={{fontSize:10,opacity:.45,color:"#F0D060",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>☀️ Solar System Unlock</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontFamily:"monospace",fontSize:32,fontWeight:800,color:"#F0D060"}}>{spct}%</div><div style={{fontSize:12,color:"rgba(240,208,96,.5)"}}>5 criteria needed</div></div>
      <div style={{height:8,background:"rgba(255,255,255,.08)",borderRadius:4,overflow:"hidden",marginBottom:14}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:4,transition:"width .5s"}}/></div>
      {Object.entries(SC).map(([k,c2])=><div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}><div style={{width:22,height:22,borderRadius:"50%",background:c2.met?"rgba(0,230,118,.2)":"rgba(255,255,255,.05)",border:"2px solid "+(c2.met?"#00E676":"rgba(255,255,255,.12)"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#00E676"}}>{c2.met?"✓":""}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:c2.met?"#00E676":"rgba(255,255,255,.5)"}}>{c2.l}</div><div style={{fontSize:11,color:"rgba(240,208,96,.4)",fontFamily:"monospace"}}>{c2.v}</div></div></div>)}
    </div>
    {spct===100&&<div style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:14,padding:14,border:"1px solid rgba(212,175,55,.15)"}}>
      <div style={{fontSize:16,fontWeight:800,color:"#F0D060",marginBottom:10}}>🚀 UNLOCKED — 7 Planets Await</div>
      {[{ico:"🔴",pl:"Mars",d:"Mining · 30 companies · MCR currency"},{ico:"🟡",pl:"Venus",d:"Manufacturing · VCR currency"},{ico:"🟠",pl:"Jupiter",d:"Research · Fusion energy"},{ico:"🪐",pl:"Saturn",d:"Ring mining · Ryzolith ore"},{ico:"☿",pl:"Mercury",d:"Solar energy"},{ico:"🔵",pl:"Uranus",d:"Ice mining"},{ico:"💜",pl:"Neptune",d:"Deep research"}].map(p=><div key={p.pl} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}><span style={{fontSize:20}}>{p.ico}</span><div><div style={{fontSize:13,fontWeight:700,color:"#E8EEF8"}}>{p.pl}</div><div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{p.d}</div></div></div>)}
    </div>}
  </div>;
  // NEWS
  const S_News=<div style={{padding:14,display:"flex",flexDirection:"column",gap:8}}>
    {d.news.slice(0,30).map(n=><div key={n.id} style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8",display:"flex",gap:10}}>
      <div style={{width:4,borderRadius:2,flexShrink:0,background:n.g?G:R,alignSelf:"stretch"}}/>
      <div style={{flex:1}}><div style={{fontSize:10,color:"#ccc",textTransform:"uppercase",letterSpacing:.4,marginBottom:3}}>Turn {n.t} · {n.ico}</div><div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:3}}>{n.ti}</div><div style={{fontSize:12,color:"#666",lineHeight:1.6}}>{n.bo}</div></div>
    </div>)}
  </div>;
  // SETTINGS
  const S_Set=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{fontSize:14,fontWeight:700,color:DK,marginBottom:10}}>📊 Stats — Turn {d.turn}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <SB l="Net Worth" v={fm(nw)} c={G}/><SB l="Personal" v={fm(pw)} c={G}/>
        <SB l="Trading" v={fm(tw)} c={BL}/><SB l="GSF" v={fm(gsfd)} c={AU}/>
        <SB l="Stocks" v={fm(sv)} c={G}/><SB l="Bonds+Comm" v={fm(bv+cv)}/>
        <SB l="Crypto" v={fm(crv)} c={PU}/><SB l="Tax Paid" v={fm(d.taxPaid||0)} c={R}/>
        <SB l="Tax Era" v={d.era||"Normal"} c={BL}/><SB l="CGT Rate" v={(((d.cgtRate||.20)*100)).toFixed(0)+"%"} c={G}/>
        <SB l="Tax Relief" v={((d.taxRed||0)*100).toFixed(0)+"%"} c={G}/><SB l="Redeem Pts" v={(d.redeemPts||0).toLocaleString()} c={PU}/>
      </div>
    </div>
    <div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{fontSize:14,fontWeight:700,color:DK,marginBottom:10}}>🏁 Milestones</div>
      {[{n:"M1 — Turn 100",d:d.turn>=100,ds:"Governor stable"},{n:"M2 — Turn 300",d:d.turn>=300,ds:"Solar window"},{n:"M3 — Turn 500",d:d.turn>=500,ds:"Full DEE"},{n:"M4 — Turn 1000",d:d.turn>=1000,ds:"Launch Gate"}].map(m=><div key={m.n} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}><div style={{width:28,height:28,borderRadius:8,background:m.d?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,border:m.d?"1px solid #A5D6A7":"1px solid #e0e0e0"}}>{m.d?"✅":"🔒"}</div><div><div style={{fontSize:13,fontWeight:700,color:m.d?G:DK}}>{m.n}</div><div style={{fontSize:11,color:"#bbb"}}>{m.ds}</div></div></div>)}
    </div>
    {beta&&<div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}><div style={{fontSize:14,fontWeight:700,color:R,marginBottom:8}}>🔴 Beta Log</div><div style={{maxHeight:120,overflowY:"auto",fontSize:10,fontFamily:"monospace",color:G}}>{(d.news||[]).slice(0,10).map((n,i)=><div key={i}>[T{n.t}] {n.ti}</div>)}</div></div>}
    {!beta&&<button onClick={()=>{const i=window.prompt("PIN:");if(i==="9000")setBeta(true);else if(i)toast_("Wrong PIN",false);}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>🔐 Beta Diagnostics (PIN: 9000)</button>}
  </div>;
  const screenMap={dash:S_Dash,mkt:S_Mkt,co:Co_,comm:S_Comm,cryp:S_Cryp,fx:S_Fx,bonds:S_Bonds,port:S_Port,ph:S_Give,gsf:S_GSF,sol:S_Sol,news:S_News,set:S_Set};
  // ── TRADE MODAL ──────────────────────────────────────────────
  const TrModal=(()=>{
    if(!trM)return null;
    const{type,item,mode}=trM,isBuy=mode==="buy";
    let price=0,unit="",held=0,maxQty=0;
    if(type==="stock"){price=item.price;unit="shares";held=SH[item.t]||0;maxQty=isBuy?Math.floor(tw/price):held;}
    else if(type==="comm"){price=item.p;unit=item.u;held=CH[item.id]||0;maxQty=isBuy?Math.floor(tw/price):held;}
    else if(type==="cryp"){price=item.p;unit=item.id;held=CRH[item.id]||0;maxQty=isBuy?Math.floor(tw/price):held;}
    else if(type==="bond"){price=gBP(item);unit="bonds";held=BH[item.id]||0;maxQty=isBuy?Math.floor(tw/price):held;}
    const qty=Math.floor(trAmt||0),total=Math.round(qty*price*100)/100;
    const avgC=type==="stock"?(d.avgSh?.[item.t]||price):type==="comm"?(d.avgCm?.[item.id]||price):type==="cryp"?(d.avgCr?.[item.id]||price):price;
    const profitPer=!isBuy?Math.max(0,price-avgC):0;
    const cgt=!isBuy?Math.round(qty*profitPer*(d.cgtRate||.20)*(1-(d.taxRed||0))*100)/100:0;
    const candidates=[1,2,5,10,25,50,100,500,1000,5000,10000,50000,100000,500000,1000000];
    const show=[...new Set([...candidates.filter(v=>v<=maxQty&&v>0),maxQty].filter(v=>v>0))].sort((a,b)=>a-b).slice(-8);
    return <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxHeight:"88vh",overflowY:"auto"}}>
      <div style={{width:36,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 16px"}}/>
      <div style={{background:isBuy?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:14,padding:15,color:"#fff",marginBottom:14}}>
        <div style={{fontSize:10,opacity:.65,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{isBuy?"BUY":"SELL"} · {type.toUpperCase()}</div>
        <div style={{fontSize:18,fontWeight:800}}>{item.n||item.id}</div>
        <div style={{fontSize:12,opacity:.85,marginTop:3}}>{fm(price)} per {unit} · {isBuy?fm(tw)+" in Trading Wallet · max "+maxQty.toLocaleString()+" "+unit:held.toLocaleString()+" "+unit+" held"}</div>
      </div>
      <div style={{display:"flex",background:"#f0f4f0",borderRadius:10,padding:4,gap:3,marginBottom:14}}>
        {["buy","sell"].map(m2=><button key={m2} onClick={()=>{setTrM({...trM,mode:m2});setTrAmt(null);}} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",background:mode===m2?"#fff":"transparent",color:mode===m2?G:"#999",fontWeight:700,fontSize:13,cursor:"pointer",boxShadow:mode===m2?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{m2==="buy"?"Buy":"Sell"}</button>)}
      </div>
      <div style={{fontSize:11,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Quantity — Max {maxQty.toLocaleString()}</div>
      {maxQty>0?<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
        {show.map(v=><button key={v} onClick={()=>setTrAmt(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(trAmt===v?G:"#e0e0e0"),background:trAmt===v?"#E8F5E9":"#fafafa",color:trAmt===v?G:"#555",fontWeight:700,fontSize:12,cursor:"pointer"}}>{v>=1000000?(v/1000000).toFixed(0)+"M":v>=1000?(v/1000).toFixed(0)+"K":v}</button>)}
        <button onClick={()=>setTrAmt(maxQty)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+G,background:"#E8F5E9",color:G,fontWeight:800,fontSize:12,cursor:"pointer"}}>{isBuy?"Buy Max":"Sell Max"}</button>
      </div>:<div style={{background:"#FFF8E1",borderRadius:9,padding:11,marginBottom:12,fontSize:12,color:"#E65100"}}>{isBuy?"⚠️ Not enough in Trading Wallet for 1 "+unit+". Price: "+fm(price):"⚠️ Nothing held."}</div>}
      {qty>0&&<div style={{background:"#f8fbf8",borderRadius:10,padding:13,marginBottom:13}}>
        <Row k={"Qty ("+unit+")"} v={qty.toLocaleString()}/>
        <Row k={isBuy?"Total Cost":"Proceeds"} v={fm(total)}/>
        {!isBuy&&profitPer>0&&<Row k={"CGT "+(((d.cgtRate||.20)*(1-(d.taxRed||0)))*100).toFixed(0)+"% on profit"} v={"−"+fm(cgt)} vc={R}/>}
        {!isBuy&&profitPer<=0&&<Row k="CGT" v="$0 (no profit)" vc={G}/>}
        <Row k={"Net "+(isBuy?"Cost":"To Trading Wallet")} v={fm(isBuy?total:total-cgt)} vc={isBuy?R:G} b/>
      </div>}
      <button onClick={()=>trade(type,item,mode,qty)} disabled={qty<1} style={{width:"100%",background:qty>=1?(isBuy?G:R):"#e0e0e0",color:"#fff",border:"none",borderRadius:12,padding:15,fontWeight:800,fontSize:15,cursor:qty>=1?"pointer":"not-allowed"}}>
        {qty>=1?"Confirm "+(isBuy?"Buy":"Sell")+" "+qty.toLocaleString()+" "+unit+" = "+fm(isBuy?total:total-cgt):"Select quantity above"}
      </button>
    </div>;
  })();
  // ── RENDER ────────────────────────────────────────────────────
  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"system-ui,-apple-system,sans-serif"}}>
    <div style={{background:"#fff",padding:"10px 15px",borderBottom:"1px solid #e8ebe8",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#1B5E20,#4CAF50)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🌐</div><div><div style={{fontSize:15,fontWeight:800,color:DK,lineHeight:1}}>Galactic Raider</div><div style={{fontSize:9,color:"#bbb"}}>Capital Exchange · Clean Build</div></div></div>
      <div style={{display:"flex",alignItems:"center",gap:7}}>{auto&&<div style={{width:7,height:7,borderRadius:"50%",background:G,boxShadow:"0 0 6px #4CAF50"}}/>}<button onClick={()=>setTab("sol")} style={{background:"rgba(212,175,55,.12)",border:"1px solid rgba(212,175,55,.25)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#B8952A",cursor:"pointer"}}>☀️ {spct}%</button></div>
    </div>
    <div style={{background:"#1B5E20",padding:"4px 0",overflow:"hidden",flexShrink:0}}><div style={{display:"flex",gap:16,whiteSpace:"nowrap",animation:"scroll 30s linear infinite",width:"max-content"}}>{[...d.cos,...d.cos].map((c,i)=><span key={i} style={{fontSize:10,fontFamily:"monospace",color:"rgba(255,255,255,.45)",display:"inline-flex",gap:5}}><span style={{color:"rgba(255,255,255,.7)",fontWeight:700}}>{c.t}</span><span style={{color:(c.ch||0)>=0?"#69F0AE":"#FF5252"}}>{fm(c.price)} {(c.ch||0)>=0?"▲":"▼"}{Math.abs((c.ch||0)*100).toFixed(2)}%</span></span>)}</div></div>
    <div style={{flex:1,overflowY:"auto",paddingBottom:68}}>{screenMap[tab]||S_Dash}</div>
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #e8ebe8",display:"flex",padding:"5px 2px 10px",zIndex:50}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{...ts(t.id)}}><div style={{fontSize:16,lineHeight:1,marginBottom:2}}>{t.ico}</div><div style={{fontSize:8}}>{t.l}</div></button>)}
    </div>
    {evN&&<div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 18px)",maxWidth:412,background:evN.good?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:13,padding:"12px 15px",display:"flex",alignItems:"center",gap:10,zIndex:200,boxShadow:"0 6px 24px rgba(0,0,0,.3)"}}><span style={{fontSize:22}}>{evN.ico}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{evN.n}{evN.cn?" — "+evN.cn:""}</div></div><button onClick={()=>setEvN(null)} style={{background:"rgba(255,255,255,.18)",border:"none",borderRadius:"50%",width:22,height:22,color:"#fff",cursor:"pointer",fontSize:13}}>×</button></div>}
    {toast&&<div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 18px)",maxWidth:412,background:toast.g?G:R,borderRadius:10,padding:"11px 15px",color:"#fff",fontSize:13,fontWeight:700,zIndex:250,textAlign:"center",boxShadow:"0 3px 14px rgba(0,0,0,.25)"}}>{toast.msg}</div>}
    {trM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget){setTrM(null);setTrAmt(null);}}}>{TrModal}</div>}
    {donM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setDonM(null)}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
        <div style={{width:36,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 16px"}}/>
        <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:4}}>❤️ Donate to {donM}</div>
        <div style={{fontSize:12,color:"#888",marginBottom:12}}>Trading Wallet: {fm(tw)} · Min $1M · Earns redemption points</div>
        {(()=>{const cats={Healthcare:.20,Education:.25,Environment:.30,Infrastructure:.15,Poverty:.20,Science:.25,Arts:.10,Disaster:.35};const mult={Education:1.5,Healthcare:1.3,Poverty:1.2,Environment:1.1};const r=cats[donM]||.20;const m=mult[donM]||1.0;
          const amts=[1000000,5000000,10000000,50000000,100000000].filter(v=>v<=tw);
          return <>
            <div style={{background:"#FFF8E1",borderRadius:9,padding:10,marginBottom:12,fontSize:12,color:"#E65100",lineHeight:1.6}}>{(r*100).toFixed(0)}% tax relief for {[{n:"Healthcare",d:3},{n:"Education",d:5},{n:"Environment",d:7},{n:"Infrastructure",d:4},{n:"Poverty",d:3},{n:"Science",d:5},{n:"Arts",d:2},{n:"Disaster",d:8}].find(x=>x.n===donM)?.d||3} turns · Redemption points: $1K = {m.toFixed(1)}× multiplier</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:12}}>
              {amts.map(v=><button key={v} onClick={()=>setDonAmt(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(donAmt===v?"#880E4F":"#e0e0e0"),background:donAmt===v?"#FCE4EC":"#fafafa",color:donAmt===v?"#880E4F":"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(v)}</button>)}
            </div>
            {donAmt&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:12}}>
              <Row k="Donation" v={fm(donAmt)} vc="#880E4F" b/>
              <Row k="Redemption pts earned" v={Math.round(donAmt/1000*m).toLocaleString()} vc={PU}/>
              <Row k="Tax relief" v={(r*100).toFixed(0)+"% off all taxes"} vc={G}/>
            </div>}
            <button onClick={()=>{
              if(!donAmt||donAmt<1000000){toast_("Min $1M donation",false);return;}
              if(donAmt>tw){toast_("Insufficient Trading Wallet",false);return;}
              const s=S.current;
              const cats2={Healthcare:{r:.20,d:3},Education:{r:.25,d:5},Environment:{r:.30,d:7},Infrastructure:{r:.15,d:4},Poverty:{r:.20,d:3},Science:{r:.25,d:5},Arts:{r:.10,d:2},Disaster:{r:.35,d:8}};
              const sp=cats2[donM]||{r:.20,d:3};
              const mult2={Education:1.5,Healthcare:1.3,Poverty:1.2,Environment:1.1};
              const pts=Math.round(donAmt/1000*(mult2[donM]||1.0));
              s.tradingWallet=Math.round((s.tradingWallet-donAmt)*100)/100;
              s.dons=(s.dons||0)+1;
              s.redeemPts=Math.min(5000,(s.redeemPts||0)+pts);
              if((s.redeemPts||0)>=500&&(s.dons||0)>=2)s.spinTokens=(s.spinTokens||0)+1;
              s.phiBen=[...(s.phiBen||[]),{cat:donM,rate:sp.r,rem:sp.d}];
              s.news.unshift({id:Math.random(),t:s.turn,ico:"❤️",ti:"Donated "+fm(donAmt)+" to "+donM,bo:pts.toLocaleString()+" redemption points earned. "+(sp.r*100).toFixed(0)+"% tax relief for "+sp.d+" turns."+(s.spinTokens>0?" 🎡 Spin token earned!":""),g:true});
              toast_("❤️ Donated "+fm(donAmt)+" · "+pts.toLocaleString()+" pts earned"+(s.spinTokens>0?" · Spin token unlocked! 🎡":""));
              setDonM(null);setDonAmt(null);refresh();
            }} style={{width:"100%",background:"#880E4F",color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:14,cursor:"pointer"}}>❤️ Confirm{donAmt?" — "+fm(donAmt):""}</button>
          </>;
        })()}
      </div>
    </div>}
    {gsfM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setGsfM(false)}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
        <div style={{width:36,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 16px"}}/>
        <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:4}}>🏛️ Deposit to GSF</div>
        <div style={{fontSize:12,color:"#888",marginBottom:12}}>Rate: {(d.gsf||12.48).toFixed(2)}%/yr · Trading Wallet: {fm(tw)} · 2% deposit fee applied</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
          {[50000,100000,500000,1000000,5000000,10000000,Math.floor(tw*.25/1000)*1000,Math.floor(tw*.50/1000)*1000].filter((v,i,a)=>v<=tw&&v>=50000&&a.indexOf(v)===i).sort((a,b)=>a-b).slice(-8).map(v=><button key={v} onClick={()=>setGsfAmt(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(gsfAmt===v?BL:"#e0e0e0"),background:gsfAmt===v?"#E3F2FD":"#fafafa",color:gsfAmt===v?BL:"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(v)}</button>)}
        </div>
        {gsfAmt&&<div style={{background:"#E3F2FD",borderRadius:9,padding:10,marginBottom:12}}>
          <Row k="Gross deposit" v={fm(gsfAmt)} vc={BL} b/>
          <Row k="2% deposit fee" v={"−"+fm(Math.round(gsfAmt*.02*100)/100)} vc={R}/>
          <Row k="Net into GSF" v={fm(Math.round(gsfAmt*.98*100)/100)} vc={G}/>
          <Row k="Per turn return" v={fm(Math.round((gsfd+gsfAmt*.98)*(d.gsf||12.48)/100/365*100)/100)} vc={G}/>
        </div>}
        <button onClick={()=>{if(!gsfAmt||gsfAmt<50000||gsfAmt>tw){toast_("Select amount",false);return;}const s=S.current;const fee=Math.round(gsfAmt*.02*100)/100;const net=Math.round(gsfAmt*.98*100)/100;s.tradingWallet=Math.round((s.tradingWallet-gsfAmt)*100)/100;s.gsfDep=Math.round((s.gsfDep+net)*100)/100;s.taxPaid=(s.taxPaid||0)+fee;s.news.unshift({id:Math.random(),t:s.turn,ico:"🏛️",ti:"GSF Deposit",bo:"Net "+fm(net)+" deposited (2% fee: "+fm(fee)+"). Returns "+fm(s.gsfDep*(s.gsf||12.48)/100/365)+"/turn.",g:true});toast_("Deposited "+fm(net)+" to GSF · "+fm(s.gsfDep*(s.gsf||12.48)/100/365)+"/turn");setGsfM(false);setGsfAmt(null);refresh();}} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:14,cursor:"pointer"}}>🏛️ Confirm{gsfAmt?" — "+fm(gsfAmt):""}</button>
      </div>
    </div>}
    <style>{"@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{display:none}button{outline:none;font-family:inherit}"}</style>
  </div>;
}
