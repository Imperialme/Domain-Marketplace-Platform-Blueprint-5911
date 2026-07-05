import{useState,useRef,useCallback,useEffect}from"react";
const G="#16A34A",R="#DC2626",BL="#1D4ED8",DK="#0F172A",AU="#D97706",PU="#7C3AED",SL="#64748B";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e12?"$"+(a/1e12).toFixed(2)+"T":a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const pc=n=>(n>=0?"+":"")+n.toFixed(2)+"%";
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);
const gBP=b=>cl(Math.round(b.fv*(b.oy/100)/Math.max(b.cy/100,.01)*({AAA:1.02,AA:1.01,A:1,BBB:.99,BB:.97,B:.94}[b.rat]||1)*100)/100,b.fv*.05,b.fv*2.5);

// ── GOVERNOR ──────────────────────────────────────────────────
const PEB={Technology:{mn:15,mx:35},Banking:{mn:8,mx:15},Mining:{mn:6,mx:12},Energy:{mn:8,mx:20},Agriculture:{mn:10,mx:18},Healthcare:{mn:12,mx:35},Manufacturing:{mn:10,mx:25},Utilities:{mn:12,mx:18},"Real Estate":{mn:8,mx:16},Telecom:{mn:10,mx:16},Retail:{mn:10,mx:18}};

// ── COMPANIES ────────────────────────────────────────────────
const COS=[
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",ip:348.94,pe0:18.4,div:.8,b:1.8,yr:2008,emp:125000,hq:"Singapore",ceo:"Dr. Lin Wei",founder:"Dr. Lin Wei",origin:"Lin Wei sold his Singapore apartment to fund the first server. Grew from 4 staff to 125,000 across 18 countries.",ops:"Enterprise cloud, AI chips, cross-border data services across Asia Pacific.",analysts:[{firm:"OrbitRating",rating:"STRONG BUY",target:420,note:"Dominant AI infrastructure. Cloud margins expanding. Initiating at STRONG BUY."},{firm:"StarCapital",rating:"BUY",target:395,note:"Semiconductor design moat underappreciated. Strong BUY."},{firm:"VegaAnalytics",rating:"HOLD",target:360,note:"Great company, fair price. Add below $320."}]},
  {t:"MRDB",n:"Meridian Bank",s:"Banking",ip:85.20,pe0:12.1,div:2.1,b:.9,yr:1985,emp:45000,hq:"New York",ceo:"Patricia Hernandez",founder:"James R. Meridian",origin:"Started as a teller in Brooklyn 1972. Built one branch into a regional powerhouse through 14 acquisitions.",ops:"2,400 retail branches across US Midwest and Northeast.",analysts:[{firm:"NovaStar",rating:"BUY",target:95,note:"NIM expansion in rising rates. 2.1% dividend reliable."},{firm:"OrbitRating",rating:"HOLD",target:88,note:"Solid bank, limited upside. Neutral."}]},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",ip:15.80,pe0:8.5,div:.5,b:1.6,yr:2005,emp:28000,hq:"Johannesburg",ceo:"Amara Diallo",founder:"Kwame Asante",origin:"Ghanaian geologist discovered rare earth deposit while working for a junior explorer. Listed on JSE 2009.",ops:"Iron ore in Mauritania, lithium in Zimbabwe, rare earths in DRC.",analysts:[{firm:"RedDust Research",rating:"BUY",target:22,note:"Lithium reserve base severely undervalued. 40% upside."},{firm:"OuterRing Analytics",rating:"HOLD",target:17,note:"Good company but commodity cycle risk. Hold."}]},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",ip:351.54,pe0:11.3,div:1.8,b:1.2,yr:1995,emp:62000,hq:"Dubai",ceo:"Sheikh Rashid Al-Mansouri",founder:"Al-Mansouri family",origin:"Private trading company established 1995 in Abu Dhabi. Listed on DFM 2003.",ops:"Crude production in UAE, Kuwait and Oman. Pipeline infrastructure across Kazakhstan.",analysts:[{firm:"SolarCrest Research",rating:"HOLD",target:360,note:"Oil dependency limits upside. FCF yield attractive."},{firm:"VegaAnalytics",rating:"BUY",target:390,note:"Upstream cost structure among lowest globally."}]},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",ip:198.40,pe0:22.1,div:1.2,b:.8,yr:2005,emp:38000,hq:"Boston",ceo:"Dr. Sarah Chen",founder:"Dr. Marcus Webb",origin:"Harvard oncologist licensed his tumour-targeting patent 2005. Built into hospital management empire.",ops:"180 hospitals, 400 diagnostic labs across North America. 3 oncology drugs in Phase 3.",analysts:[{firm:"OrbitRating",rating:"STRONG BUY",target:240,note:"Pipeline alone worth more than market cap."},{firm:"StarCapital",rating:"BUY",target:215,note:"Defensive growth at reasonable valuation."}]},
  {t:"UTLS",n:"Utility Systems",s:"Utilities",ip:58.40,pe0:14.2,div:4.2,b:.5,yr:1950,emp:12000,hq:"Chicago",ceo:"Robert Keller",founder:"Chicago City Council",origin:"Created 1950 as public utility. Privatised 1987. Regulated monopoly.",ops:"Electric grid for 1.9M customers. Gas to 1.3M. 3 nuclear plants.",analysts:[{firm:"NovaStar",rating:"BUY",target:63,note:"4.2% yield with regulatory moat. Safe haven."},{firm:"VegaAnalytics",rating:"HOLD",target:59,note:"Fair value. Income investors only."}]},
  {t:"TLCM",n:"TeleCom Europe",s:"Telecom",ip:88.60,pe0:13.5,div:4.5,b:.6,yr:1985,emp:48000,hq:"Frankfurt",ceo:"Klaus Hoffman",founder:"West German government",origin:"Emerged from privatisation of West Germany's postal monopoly 1985.",ops:"Mobile, broadband, enterprise telecoms across 22 European countries. 280M subscribers.",analysts:[{firm:"OuterRing Analytics",rating:"HOLD",target:92,note:"4.5% dividend. 5G complete. Growth nil."},{firm:"RedDust Research",rating:"SELL",target:78,note:"Spectrum costs incoming. Dividend at risk."}]},
  {t:"RLST",n:"RealEstate Trust",s:"Real Estate",ip:44.20,pe0:12.8,div:3.8,b:.7,yr:1995,emp:2800,hq:"Dallas",ceo:"Michael Johnson",founder:"Texas pension funds",origin:"Created by Texas pension funds 1995. Pivoted to logistics warehouses 2018 — tripled NAV.",ops:"$18B portfolio. 40% logistics warehouses, 35% industrial, 25% office. Sun Belt.",analysts:[{firm:"CosmicSeed Research",rating:"BUY",target:52,note:"Best-in-class logistics REIT. E-commerce structural demand."},{firm:"NovaStar",rating:"BUY",target:50,note:"Sun Belt exposure is premium. Office drag manageable."}]},
  {t:"EMTS",n:"Emerging Tech",s:"Technology",ip:28.40,pe0:22.0,div:.2,b:2.0,yr:2015,emp:6500,hq:"Mumbai",ceo:"Priya Patel",founder:"Priya Patel",origin:"MIT graduate returned to India 2015. Built enterprise cloud for South Asian SMEs. AstroVentures Asia Series A 2016.",ops:"B2B SaaS for 18,000 corporate clients across India, Bangladesh, Sri Lanka, Pakistan.",analysts:[{firm:"AstroVentures Research",rating:"STRONG BUY",target:40,note:"Best EM tech story. TAM $45B, penetration <1%."},{firm:"OrbitRating",rating:"BUY",target:37,note:"Profitable SaaS in EM is rare. Exceptional unit economics."}]},
  {t:"AGRO",n:"AgroLatin Corp",s:"Agriculture",ip:42.18,pe0:13.2,div:2.5,b:1.1,yr:1975,emp:18000,hq:"São Paulo",ceo:"Isabella Sousa",founder:"Carlos Sousa",origin:"Family farm in Mato Grosso 1975. Third-generation ownership. Agricultural boom expansion.",ops:"4.2M hectares across Brazil and Argentina. Soy, corn, sugarcane exports to 22 countries.",analysts:[{firm:"SolarCrest Research",rating:"BUY",target:52,note:"Consistent dividend. Farmland as hard asset."},{firm:"StarCapital",rating:"HOLD",target:44,note:"Commodity price risk. Good company, timing matters."}]},
];
const BONDS=[{id:"US10Y",n:"US Treasury 10Y",rat:"AAA",cou:4.5,oy:4.5,cy:4.5,fv:1000,mat:2034},{id:"EU10Y",n:"EU Govt 10Y",rat:"AA",cou:3.8,oy:3.8,cy:3.8,fv:1000,mat:2034},{id:"SLKT-B",n:"Silk Road Bond",rat:"AA",cou:5.2,oy:5.2,cy:5.2,fv:1000,mat:2031},{id:"AFR5Y",n:"African Govt Bond",rat:"BB",cou:12.5,oy:12.5,cy:12.5,fv:1000,mat:2029},{id:"EM10Y",n:"Emerging Mkt Bond",rat:"B",cou:14.8,oy:14.8,cy:14.8,fv:1000,mat:2032}];
const COMM=[{id:"OIL",n:"Crude Oil",u:"bbl",ip:85,base:85},{id:"GOLD",n:"Gold",u:"oz",ip:1980,base:1980},{id:"LITH",n:"Lithium",u:"kg",ip:16.50,base:16.50}];
const CRYP=[{id:"BTC",n:"Bitcoin",ip:65000,base:65000},{id:"ETH",n:"Ethereum",ip:3200,base:3200}];
const FXP=[{id:"EURUSD",n:"EUR/USD",ip:1.085},{id:"GBPUSD",n:"GBP/USD",ip:1.268},{id:"USDJPY",n:"USD/JPY",ip:148.5}];
const ETFS=[{id:"GSFE",n:"Global Equity ETF",type:"Equity",ip:142.50,expense:.12,div:1.8,top:"SLKT 18% · MDCR 14% · TNPT 12%",sharpe:1.42,ytd:.142},{id:"GSFD",n:"Dividend Income ETF",type:"Income",ip:58.20,expense:.18,div:4.8,top:"UTLS 22% · TLCM 20% · RLST 18%",sharpe:1.12,ytd:.048},{id:"GSFM",n:"Mining & Resources ETF",type:"Sector",ip:34.80,expense:.32,div:.9,top:"FRMN 32% · TNPT 28% · AGRO 18%",sharpe:.92,ytd:-.028}];
const IPOS=[{id:"NVRA",n:"NovaMed Robotics",sector:"Healthcare",priceRange:[18,22],oversubscribed:5.7,opens:60,allocated:0,listed:false,listPrice:null,currentPrice:null,desc:"AI surgical robots. 40 hospitals signed. $180M revenue +85% YoY.",fundedBy:"AstroVentures, Quantum Horizon"},{id:"LOGX",n:"LogiXpress Freight",sector:"Logistics",priceRange:[24,28],oversubscribed:5.3,opens:150,allocated:0,listed:false,listPrice:null,currentPrice:null,desc:"AI freight matching across planets. $890M revenue, profitable.",fundedBy:"AstroVentures, SolarCrest Fund"}];
const PLANET_FUNDS=[{id:"ESF",planet:"Earth",ico:"🌍",n:"Earth Sovereign Fund",rate:12.48,color:"#1B5E20"},{id:"JSF",planet:"Jupiter",ico:"🟠",n:"Jupiter Autonomous Fund",rate:24.8,color:"#F57F17"},{id:"MSF",planet:"Mars",ico:"🔴",n:"Mars Mining Fund",rate:18.4,color:"#B71C1C"}];
const TAX_ERAS=[{name:"Normal",cgt:.20,div:.15,txn:.001},{name:"High Tax",cgt:.30,div:.25,txn:.0015},{name:"Low Tax",cgt:.10,div:.05,txn:.0005},{name:"Capital Gains",cgt:.05,div:.15,txn:.001},{name:"Dividend",cgt:.20,div:.05,txn:.001},{name:"Normal",cgt:.20,div:.15,txn:.001}];

// ── TUTORIAL STEPS ───────────────────────────────────────────
const TUTORIAL=[
  {id:0,title:"Welcome to Galactic Raider",body:"You start with $1,000,000. Grow it into a multi-billion galactic empire. Let's take a quick tour.",btn:"Start Tour →",target:null},
  {id:1,title:"Your 3 Wallets",body:"Cash Wallet ($100K) — day-to-day. Savings Wallet ($100K) — earns 2%/yr, protect it with a Foundation. Trading Wallet ($800K) — all investments draw from here.",btn:"Got it →",target:"wallets"},
  {id:2,title:"Check the Tax Era",body:"The game rotates through 8 tax eras. In Capital Gains era, CGT is only 5%. In High Tax era it's 30%. Always check before selling a big position.",btn:"Understood →",target:"era"},
  {id:3,title:"Buy Your First Stock",body:"Go to Markets. Sort by Analyst Rating. Tap a STRONG BUY company. Read the founder story and analyst opinions. Then tap Buy.",btn:"To Markets →",target:"mkt"},
  {id:4,title:"Diversify With Bonds",body:"Bonds pay quarterly coupons and protect your capital. US Treasury 10Y is AAA rated — the safest. High-yield bonds pay more but carry default risk.",btn:"To Bonds →",target:"bonds"},
  {id:5,title:"Planet Sovereign Funds",body:"Each planet runs its own fund. Earth pays 12.48%/yr. Jupiter pays 24.8%/yr — but storm risk is real. Deposit and earn every single turn automatically.",btn:"To Funds →",target:"funds"},
  {id:6,title:"You're Ready",body:"Build your portfolio, watch the tax eras, survive bankruptcy risks, and unlock the Solar System at $5B net worth. Good luck.",btn:"Play →",target:null},
];

// ── ATOMS ────────────────────────────────────────────────────
const MC=({hist,w=70,h=28,col})=>{if(!hist||hist.length<2)return null;const mn=Math.min(...hist)*.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");const c=col||(hist[hist.length-1]>=(hist[0]||0)?G:R);return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>;};
const WC=({hist})=>{if(!hist||hist.length<2)return null;const W=300,H=44,mn=Math.min(...hist)*.97,mx=Math.max(...hist)*1.03,rng=mx-mn||1;const line=hist.map((v,i)=>`${(i/(hist.length-1)*W).toFixed(1)},${(H-((v-mn)/rng*H)).toFixed(1)}`).join(" ");const fill=[...hist.map((v,i)=>`${(i/(hist.length-1)*W).toFixed(1)},${(H-((v-mn)/rng*H)).toFixed(1)}`),`${W},${H}`,`0,${H}`].join(" ");return <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"><defs><linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity=".3"/><stop offset="100%" stopColor="#16A34A" stopOpacity="0"/></linearGradient></defs><polygon points={fill} fill="url(#wg)"/><polyline points={line} fill="none" stroke="#16A34A" strokeWidth="2" strokeLinejoin="round"/></svg>;};
const Bdg=({v})=><span style={{color:v>=0?G:R,fontSize:11,fontWeight:700,fontFamily:"monospace"}}>{v>=0?"+":""}{(v*100).toFixed(2)}%</span>;
const Row=({k,v,vc,b})=><div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}><span style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>{k}</span><span style={{fontSize:11,fontWeight:b?800:600,color:vc||"#F8FAFC",fontFamily:"monospace"}}>{v}</span></div>;

// ── APP ───────────────────────────────────────────────────────
export default function GalacticRaider(){
  const[tab,setTab]=useState("home");
  const[speed,setSpeed]=useState(1);
  const[auto,setAuto]=useState(false);
  const speedRef=useRef(1);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  const aRef=useRef(null);
  const[tutorial,setTutorial]=useState(0); // -1 = done
  const[toast,setToast]=useState(null);
  const[trM,setTrM]=useState(null);
  const[trAmt,setTrAmt]=useState(null);
  const[selCo,setSelCo]=useState(null);
  const[newsTab,setNewsTab]=useState("all");
  const[wDir,setWDir]=useState("T2C");
  const[wPct,setWPct]=useState(null);
  const[fxSide,setFxSide]=useState("long");
  const[fxAmt,setFxAmt]=useState(null);
  const[fxSel,setFxSel]=useState(null);
  const[sortMkt,setSortMkt]=useState("analyst");
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2800);},[]);

  // ── GAME STATE ──────────────────────────────────────────────
  const S=useRef(null);
  if(!S.current){S.current={
    turn:1,
    cashWallet:100000,
    savingsWallet:100000,
    tradingWallet:800000,
    gsfDeposits:{ESF:0,JSF:0,MSF:0},
    gsfEarned:{ESF:0,JSF:0,MSF:0},
    foundationOpen:false,
    activeLoan:null,
    loanHistory:[],
    cos:COS.map(c=>({...c,price:c.ip,pp:c.ip,pe:c.pe0,ch:0,hist:[c.ip,c.ip]})),
    bonds:BONDS.map(b=>({...b})),
    comm:COMM.map(c=>({...c,p:c.ip,pp:c.ip,ch:0,hist:[c.ip,c.ip]})),
    cryp:CRYP.map(c=>({...c,p:c.ip,pp:c.ip,ch:0,hist:[c.ip,c.ip]})),
    fx:FXP.map(f=>({...f,p:f.ip,pp:f.ip,ch:0,hist:[f.ip,f.ip]})),
    fxPositions:{},
    etfs:ETFS.map(e=>({...e,price:e.ip,units:0,avgCost:e.ip,hist:[e.ip,e.ip],ch:0})),
    ipos:IPOS.map(ip=>({...ip})),
    sh:{},bh:{},ch:{},crh:{},avgSh:{},avgC:{},avgCr:{},
    eraIdx:0,eraStart:1,
    taxPaid:0,divReceived:0,
    redeemPts:0,spinTokens:0,spinsUsed:0,donations:0,
    phiBen:[],taxRed:0,
    liquidating:false,bankrupt:false,
    wh:[1000000,1000000],
    news:[{t:1,ico:"🌌",msg:"Welcome to Galactic Raider. $1M starting capital. Build a galactic empire.",mine:false},{t:1,ico:"🔔",msg:"Current tax era: Normal — CGT 20%, Dividend 15%. Watch for era changes.",mine:false}],
    myNews:[],
  };}
  const[D,setD]=useState(()=>({...S.current}));
  const refresh=useCallback(()=>setD({...S.current}),[]);

  // ── ADVANCE ─────────────────────────────────────────────────
  const advance=useCallback(()=>{
    const s=S.current;s.turn++;
    const nn=[],mn=[];
    // Tax era rotation
    const newEraIdx=Math.floor((s.turn-1)/60)%TAX_ERAS.length;
    if(newEraIdx!==s.eraIdx){s.eraIdx=newEraIdx;s.eraStart=s.turn;nn.push({t:s.turn,ico:"🔔",msg:"Tax Era changed to: "+TAX_ERAS[newEraIdx].name+". CGT: "+(TAX_ERAS[newEraIdx].cgt*100).toFixed(0)+"% · Dividend: "+(TAX_ERAS[newEraIdx].div*100).toFixed(0)+"%",mine:false});}
    const era=TAX_ERAS[s.eraIdx];
    s.phiBen=(s.phiBen||[]).map(b=>({...b,rem:b.rem-1})).filter(b=>b.rem>0);
    s.taxRed=Math.min(.75,(s.phiBen||[]).reduce((x,b)=>x+b.rate,0));
    // Stock prices — EPS-anchored
    s.cos=s.cos.map(c=>{
      const eps=c.ip/(c.pe0||15),bnd=PEB[c.s]||{mn:10,mx:30};
      const fair=eps*(bnd.mn+bnd.mx)/2;
      const pull=(fair-c.price)/fair*.02;
      const noise=(Math.random()-.5)*.08*c.b;
      let np=cl(Math.round(c.price*(1+noise+pull)*100)/100,eps*bnd.mn,eps*bnd.mx);
      np=cl(np,c.ip*.3,c.ip*3);np=Math.max(.50,np);
      return{...c,pp:c.price,price:np,pe:Math.round(np/eps*10)/10,ch:(np-c.price)/c.price,hist:[...(c.hist||[]).slice(-50),np]};
    });
    // Other assets
    s.comm=s.comm.map(c=>{const pp=c.p,pull=(c.base-pp)/c.base*.01,np=cl(Math.round(pp*(1+(Math.random()-.5)*.05+pull)*100)/100,c.base*.25,c.base*4);return{...c,pp,p:np,ch:(np-pp)/pp,hist:[...(c.hist||[]).slice(-50),np]};});
    s.cryp=s.cryp.map(c=>{const pp=c.p,pull=(c.base-pp)/c.base*.02,np=cl(Math.round(pp*(1+(Math.random()-.5)*.08+pull)*100)/100,c.base*.2,c.base*5);return{...c,pp,p:np,ch:(np-pp)/pp,hist:[...(c.hist||[]).slice(-50),np]};});
    s.fx=s.fx.map(f=>{const pp=f.p,np=Math.round(f.p*(1+(Math.random()-.5)*.004)*10000)/10000;return{...f,pp,p:np,ch:(np-pp)/pp,hist:[...(c=f,c.hist||[]).slice(-50),np]};});
    s.bonds=s.bonds.map(b=>({...b,cy:Math.round(cl(b.cy+(Math.random()-.5)*.2,1,40)*100)/100}));
    s.etfs=s.etfs.map(e=>{const pp=e.price,np=Math.max(1,Math.round(pp*(1+(Math.random()-.5)*.04)*100)/100);return{...e,pp,price:np,ch:(np-pp)/pp,hist:[...(e.hist||[]).slice(-50),np]};});
    // Savings interest
    s.savingsWallet=Math.round((s.savingsWallet*(1+.02/365))*100)/100;
    // GSF returns
    PLANET_FUNDS.forEach(f=>{if(s.gsfDeposits[f.id]>0){const ret=Math.round(s.gsfDeposits[f.id]*(f.rate/100/365)*100)/100;s.tradingWallet=Math.round((s.tradingWallet+ret)*100)/100;s.gsfEarned[f.id]=Math.round(((s.gsfEarned[f.id]||0)+ret)*100)/100;}});
    // Dividends every 30 turns
    if(s.turn%30===0){
      let div=0;
      Object.entries(s.sh).forEach(([t,n])=>{const c=s.cos.find(x=>x.t===t);if(c&&n>0){const d=Math.round(c.price*(c.div/100/4)*n*(1-era.div*(1-s.taxRed))*100)/100;div+=d;}});
      s.etfs.forEach(e=>{if(e.units>0){const d=Math.round(e.price*(e.div/100/4)*e.units*100)/100;div+=d;}});
      if(div>0){s.savingsWallet=Math.round((s.savingsWallet+div)*100)/100;s.divReceived=(s.divReceived||0)+div;mn.push({t:s.turn,ico:"💰",msg:"Dividends received: "+fm(div)+" → Savings Wallet",mine:true});}
    }
    // IPO listings
    s.ipos=s.ipos.map(ip=>{
      if(!ip.listed&&s.turn>=ip.opens){
        const mid=(ip.priceRange[0]+ip.priceRange[1])/2;
        const lp=Math.round(mid*(ip.oversubscribed>3?1.2:1.05)*100)/100;
        const alloc=Math.round((ip.allocated||0)*.85);
        if(alloc>0){s.tradingWallet=Math.round((s.tradingWallet+alloc*lp)*100)/100;mn.push({t:s.turn,ico:"🚀",msg:ip.n+" listed @ "+fm(lp)+"! Your "+alloc.toLocaleString()+" shares = "+fm(alloc*lp),mine:true});}
        nn.push({t:s.turn,ico:"🚀",msg:"IPO: "+ip.n+" listed @ "+fm(lp)+" ("+ip.oversubscribed.toFixed(1)+"× demand)",mine:false});
        return{...ip,listed:true,listPrice:lp,currentPrice:lp};
      }
      if(ip.listed&&ip.currentPrice){const np=Math.max(.50,Math.round(ip.currentPrice*(1+(Math.random()-.5)*.10)*100)/100);return{...ip,currentPrice:np};}
      return ip;
    });
    // Loan interest
    if(s.activeLoan&&s.turn%30===0){const int=Math.round(s.activeLoan.outstanding*(s.activeLoan.rate/100/12)*100)/100;s.activeLoan.outstanding=Math.round((s.activeLoan.outstanding+int)*100)/100;if(int>0){const pay=Math.min(s.tradingWallet,int);s.tradingWallet=Math.round((s.tradingWallet-pay)*100)/100;}}
    // Wealth tax above $10B
    const nw2=(s.cashWallet||0)+(s.savingsWallet||0)+(s.tradingWallet||0);
    if(nw2>10e9){const wt=Math.round((nw2-10e9)*.001*(1-s.taxRed)*100)/100;s.tradingWallet=Math.max(0,s.tradingWallet-wt);s.taxPaid=(s.taxPaid||0)+wt;}
    // Bankruptcy
    if(nw2<0&&!s.liquidating){s.liquidating=true;nn.push({t:s.turn,ico:"🟠",msg:"FORCED LIQUIDATION — Trading Wallet being liquidated 10%/turn",mine:false});}
    if(s.liquidating&&nw2>=50000)s.liquidating=false;
    if(s.liquidating){s.tradingWallet=Math.round((s.tradingWallet*.90)*100)/100;}
    if(nw2<-500000&&!s.bankrupt){s.bankrupt=true;nn.push({t:s.turn,ico:"💀",msg:"BANKRUPT — Net worth below −$500K",mine:false});}
    s.wh=[...(s.wh||[]).slice(-60),nw2];
    if(nn.length)s.news=[...nn,...s.news].slice(0,60);
    if(mn.length)s.myNews=[...mn,...(s.myNews||[])].slice(0,40);
    refresh();
  },[refresh]);

  useEffect(()=>{if(!auto){clearInterval(aRef.current);return;}clearInterval(aRef.current);aRef.current=setInterval(()=>advance(),speedRef.current*1000);return()=>clearInterval(aRef.current);},[auto,speed,advance]);

  // ── COMPUTED ────────────────────────────────────────────────
  const d=D;
  const era=TAX_ERAS[d.eraIdx||0];
  const SH=d.sh||{},BH=d.bh||{},CH=d.ch||{},CRH=d.crh||{};
  const sv=Object.entries(SH).reduce((x,[t,n])=>{const c=d.cos.find(y=>y.t===t);return x+(c?c.price*n:0);},0);
  const bv=Object.entries(BH).reduce((x,[id,q])=>{const b=d.bonds.find(y=>y.id===id);return x+(b?gBP(b)*q:0);},0);
  const cv=Object.entries(CH).reduce((x,[id,q])=>{const c=d.comm.find(y=>y.id===id);return x+(c?c.p*q:0);},0);
  const crv=Object.entries(CRH).reduce((x,[id,q])=>{const c=d.cryp.find(y=>y.id===id);return x+(c?c.p*q:0);},0);
  const etfV=d.etfs.reduce((x,e)=>x+e.price*e.units,0);
  const gsfV=PLANET_FUNDS.reduce((x,f)=>x+(d.gsfDeposits?.[f.id]||0),0);
  const tw=d.tradingWallet||0,pw=d.cashWallet||0,sw=d.savingsWallet||0;
  const nw=pw+sw+tw+gsfV+sv+bv+cv+crv+etfV;
  const pnw=d.wh[d.wh.length-2]||1000000;

  // ── TRADE ───────────────────────────────────────────────────
  const trade=(type,item,mode,qty)=>{
    const s=S.current,isBuy=mode==="buy",q=Math.floor(qty);if(q<1)return;
    if(s.liquidating&&isBuy){toast_("Liquidation active — cannot buy",false);return;}
    setAuto(false);
    const era2=TAX_ERAS[s.eraIdx||0];
    if(type==="stock"){
      const price=item.price;
      if(isBuy){const cost=Math.round(q*price*(1+era2.txn)*100)/100;if(cost>s.tradingWallet){toast_("Need "+fm(cost),false);return;}const prev=s.sh[item.t]||0;s.sh[item.t]=(prev)+q;s.avgSh[item.t]=Math.round(((s.avgSh[item.t]||price)*prev+q*price)/s.sh[item.t]*100)/100;s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;s.myNews.unshift({t:s.turn,ico:"📈",msg:"Bought "+q.toLocaleString()+" "+item.t+" @ "+fm(price)+" · Cost: "+fm(cost),mine:true});toast_("✅ Bought "+q.toLocaleString()+" "+item.t);}
      else{const held=s.sh[item.t]||0;if(q>held){toast_("Only "+held+" held",false);return;}const proc=Math.round(q*price*100)/100;const profit=Math.max(0,(price-(s.avgSh[item.t]||price))*q);const cgt=Math.round(profit*era2.cgt*(1-s.taxRed)*100)/100;const net=proc-cgt;s.tradingWallet=Math.round((s.tradingWallet+net)*100)/100;s.sh[item.t]=held-q;if(!s.sh[item.t])delete s.sh[item.t];s.taxPaid=(s.taxPaid||0)+cgt;s.myNews.unshift({t:s.turn,ico:"📉",msg:"Sold "+q.toLocaleString()+" "+item.t+" · Net: "+fm(net)+" (CGT: "+fm(cgt)+")",mine:true});toast_("✅ Sold "+q.toLocaleString()+" "+item.t);}
    }else if(type==="etf"){
      const e=s.etfs.find(x=>x.id===item.id);if(!e)return;
      if(isBuy){const cost=Math.round(q*e.price*100)/100;if(cost>s.tradingWallet){toast_("Need "+fm(cost),false);return;}const prev=e.units;e.units+=q;e.avgCost=Math.round(((e.avgCost*prev)+cost)/e.units*100)/100;s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;toast_("✅ Bought "+q+" units of "+e.n);}
      else{if(q>e.units){toast_("Only "+e.units+" held",false);return;}const proc=Math.round(q*e.price*100)/100;const profit=Math.max(0,(e.price-e.avgCost)*q);const cgt=Math.round(profit*.20*(1-s.taxRed)*100)/100;s.tradingWallet=Math.round((s.tradingWallet+proc-cgt)*100)/100;e.units-=q;toast_("✅ Sold "+q+" ETF units");}
    }else if(type==="bond"){
      const pr=gBP(item);
      if(isBuy){const cost=Math.round(q*pr*100)/100;if(cost>s.tradingWallet){toast_("Need "+fm(cost),false);return;}s.bh[item.id]=(s.bh[item.id]||0)+q;s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;toast_("✅ Bought "+q+"× "+item.n);}
      else{const held=s.bh[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}s.tradingWallet=Math.round((s.tradingWallet+pr*q)*100)/100;s.bh[item.id]=held-q;if(!s.bh[item.id])delete s.bh[item.id];toast_("✅ Sold bonds");}
    }else if(type==="comm"){
      if(isBuy){const cost=Math.round(q*item.p*100)/100;if(cost>s.tradingWallet){toast_("Need "+fm(cost),false);return;}s.ch[item.id]=(s.ch[item.id]||0)+q;s.avgC[item.id]=item.p;s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;toast_("✅ Bought "+q+" "+item.id);}
      else{const held=s.ch[item.id]||0;if(q>held){toast_("Only "+held,false);return;}const proc=Math.round(q*item.p*100)/100;const profit=Math.max(0,(item.p-(s.avgC[item.id]||item.p))*q);const cgt=Math.round(profit*.20*(1-(s.taxRed||0))*100)/100;s.tradingWallet=Math.round((s.tradingWallet+proc-cgt)*100)/100;s.ch[item.id]=held-q;if(!s.ch[item.id])delete s.ch[item.id];toast_("✅ Sold "+item.id);}
    }else if(type==="cryp"){
      if(isBuy){const cost=Math.round(q*item.p*100)/100;if(cost>s.tradingWallet){toast_("Need "+fm(cost),false);return;}s.crh[item.id]=(s.crh[item.id]||0)+q;s.avgCr[item.id]=item.p;s.tradingWallet=Math.round((s.tradingWallet-cost)*100)/100;toast_("✅ Bought "+q+" "+item.id);}
      else{const held=s.crh[item.id]||0;if(q>held){toast_("Only "+held,false);return;}const proc=Math.round(q*item.p*100)/100;const profit=Math.max(0,(item.p-(s.avgCr[item.id]||item.p))*q);const cgt=Math.round(profit*.20*(1-(s.taxRed||0))*100)/100;s.tradingWallet=Math.round((s.tradingWallet+proc-cgt)*100)/100;s.crh[item.id]=held-q;if(!s.crh[item.id])delete s.crh[item.id];toast_("✅ Sold "+item.id);}
    }
    setTrM(null);setTrAmt(null);refresh();
  };

  const doWalletTransfer=()=>{
    if(!wPct)return;const s=S.current;
    const dirs={T2C:{from:"tradingWallet",to:"cashWallet"},C2T:{from:"cashWallet",to:"tradingWallet"},T2S:{from:"tradingWallet",to:"savingsWallet"},S2T:{from:"savingsWallet",to:"tradingWallet"},C2S:{from:"cashWallet",to:"savingsWallet"},S2C:{from:"savingsWallet",to:"cashWallet"}};
    const dir=dirs[wDir];if(!dir)return;
    const src=s[dir.from]||0;const maxT=dir.from==="savingsWallet"?Math.max(0,src-10000):src;
    const amt=Math.round(maxT*(wPct/100)*100)/100;
    if(amt<=0){toast_("Nothing to transfer",false);return;}
    s[dir.from]=Math.round((s[dir.from]-amt)*100)/100;
    s[dir.to]=Math.round((s[dir.to]+amt)*100)/100;
    toast_(fm(amt)+" transferred");setWPct(null);refresh();
  };

  // ── NAV TABS ────────────────────────────────────────────────
  const TABS=[{id:"home",ico:"🏠",l:"Home"},{id:"mkt",ico:"📊",l:"Market"},{id:"bonds",ico:"📋",l:"Bonds"},{id:"comm",ico:"⛽",l:"Assets"},{id:"etf",ico:"🏛️",l:"ETF/IPO"},{id:"funds",ico:"🌍",l:"Funds"},{id:"port",ico:"💼",l:"Port."},{id:"news",ico:"📰",l:"News"}];

  // ── SCREENS ────────────────────────────────────────────────
  // HOME
  const S_Home=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#052e16,#14532d)",borderRadius:18,padding:20,color:"#fff",overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,background:"rgba(255,255,255,.04)",borderRadius:"50%"}}/>
      <div style={{fontSize:11,opacity:.55,textTransform:"uppercase",letterSpacing:1.5,marginBottom:3}}>Total Net Worth — Turn {d.turn}</div>
      <div style={{fontSize:34,fontWeight:800,fontFamily:"monospace",lineHeight:1,marginBottom:5}}>{fm(nw)}</div>
      <div style={{fontSize:12,opacity:.8,marginBottom:12}}>{nw>=pnw?"📈":"📉"} {fm(Math.abs(nw-pnw))} last turn</div>
      <div style={{height:44,marginBottom:12}}><WC hist={d.wh}/></div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {[["💵 Cash",fm(pw)],["🏦 Savings",fm(sw)],["⚡ Trading",fm(tw)],["📊 Stocks",fm(sv)],["🏛️ Funds",fm(gsfV)],["₿ Crypto+",fm(cv+crv+bv+etfV)]].map(([k,v])=><div key={k} style={{background:"rgba(255,255,255,.1)",borderRadius:8,padding:"5px 8px",textAlign:"center"}}><div style={{fontSize:8,opacity:.5,marginBottom:1}}>{k}</div><div style={{fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{v}</div></div>)}
      </div>
    </div>
    {/* Controls */}
    <div style={{background:"rgba(255,255,255,.05)",borderRadius:14,padding:12,border:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        <button onClick={advance} disabled={auto} style={{flex:3,background:auto?"rgba(255,255,255,.05)":G,color:auto?"rgba(255,255,255,.2)":"#fff",border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,fontSize:14,cursor:auto?"not-allowed":"pointer"}}>▶ Next Turn</button>
        <button onClick={()=>setAuto(a=>!a)} style={{flex:2,background:auto?"#7F1D1D":"rgba(255,255,255,.08)",color:auto?"#FCA5A5":"rgba(255,255,255,.6)",border:"none",borderRadius:10,padding:"13px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>{auto?"⏹ Stop":"Auto"}</button>
      </div>
      <div style={{display:"flex",gap:5,justifyContent:"center"}}>
        {[.5,1,5,10,30].map(s=><button key={s} onClick={()=>setSpeed(s)} style={{padding:"5px 10px",borderRadius:20,border:"1.5px solid "+(speed===s?"#16A34A":"rgba(255,255,255,.15)"),background:speed===s?"rgba(22,163,74,.2)":"transparent",color:speed===s?"#86EFAC":"rgba(255,255,255,.4)",fontWeight:700,fontSize:10,cursor:"pointer"}}>{s<1?".5s":s<60?s+"s":"1m"}</button>)}
      </div>
    </div>
    {/* Tax Era */}
    <div style={{background:"rgba(255,255,255,.05)",borderRadius:14,padding:12,border:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div><div style={{fontSize:14,fontWeight:800,color:"#F8FAFC"}}>🔔 {era.name} Era</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>Turn {d.eraStart||1}–{(d.eraStart||1)+59}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:G}}>CGT {(era.cgt*100).toFixed(0)}%</div><div style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>Div {(era.div*100).toFixed(0)}%</div></div>
      </div>
      <div style={{height:4,background:"rgba(255,255,255,.1)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:(((d.turn-(d.eraStart||1))%60)/60*100).toFixed(1)+"%",background:"linear-gradient(90deg,"+BL+",#60A5FA)",borderRadius:2}}/></div>
      {(d.taxRed||0)>0&&<div style={{marginTop:6,fontSize:11,color:"#86EFAC"}}>❤️ Philanthropy: {((d.taxRed||0)*100).toFixed(0)}% tax relief active</div>}
    </div>
    {/* Wallet Transfer */}
    <div style={{background:"rgba(255,255,255,.05)",borderRadius:14,padding:12,border:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{fontSize:13,fontWeight:700,color:"#F8FAFC",marginBottom:10}}>💸 Wallet Transfer</div>
      <div style={{display:"flex",gap:5,marginBottom:8}}>
        {[{v:"T2C",l:"Trade→Cash"},{v:"C2T",l:"Cash→Trade"},{v:"T2S",l:"Trade→Save"},{v:"S2T",l:"Save→Trade"}].map(o=><button key={o.v} onClick={()=>{setWDir(o.v);setWPct(null);}} style={{flex:1,padding:"7px 4px",borderRadius:8,border:"1.5px solid "+(wDir===o.v?"#16A34A":"rgba(255,255,255,.1)"),background:wDir===o.v?"rgba(22,163,74,.15)":"transparent",color:wDir===o.v?"#86EFAC":"rgba(255,255,255,.4)",fontWeight:700,fontSize:9,cursor:"pointer"}}>{o.l}</button>)}
      </div>
      {(()=>{const dirs={T2C:"tradingWallet",C2T:"cashWallet",T2S:"tradingWallet",S2T:"savingsWallet"};const srcKey=dirs[wDir];const src=d[srcKey]||0;const maxT=srcKey==="savingsWallet"?Math.max(0,src-10000):src;
        return <>
          <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginBottom:6}}>Available: {fm(src)}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
            {[10,25,50,100].map(pct=><button key={pct} onClick={()=>setWPct(wPct===pct?null:pct)} style={{padding:"8px 0",borderRadius:9,border:"2px solid "+(wPct===pct?"#16A34A":"rgba(255,255,255,.1)"),background:wPct===pct?"rgba(22,163,74,.15)":"transparent",color:wPct===pct?"#86EFAC":"rgba(255,255,255,.4)",fontWeight:700,fontSize:11,cursor:"pointer",textAlign:"center"}}><div>{pct}%</div><div style={{fontSize:8,color:wPct===pct?"#86EFAC":"rgba(255,255,255,.25)",marginTop:1}}>{fm(Math.round(maxT*(pct/100)*100)/100)}</div></button>)}
          </div>
          <button onClick={doWalletTransfer} disabled={!wPct||maxT<=0} style={{width:"100%",background:wPct&&maxT>0?G:"rgba(255,255,255,.05)",color:wPct&&maxT>0?"#fff":"rgba(255,255,255,.2)",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:12,cursor:wPct&&maxT>0?"pointer":"not-allowed"}}>
            {wPct&&maxT>0?`Transfer ${wPct}% = ${fm(Math.round(maxT*(wPct/100)*100)/100)}`:"Select % above"}
          </button>
        </>;
      })()}
    </div>
    {/* Status alerts */}
    {d.liquidating&&<div style={{background:"rgba(217,119,6,.15)",borderRadius:11,padding:12,border:"1px solid rgba(217,119,6,.3)"}}><div style={{fontSize:13,fontWeight:800,color:"#FDE68A"}}>🟠 Forced Liquidation Active</div><div style={{fontSize:11,color:"rgba(253,230,138,.7)",marginTop:3}}>10%/turn from Trading Wallet. Cannot buy. Transfer from Savings to recover.</div></div>}
    {d.bankrupt&&<div style={{background:"rgba(220,38,38,.15)",borderRadius:11,padding:12,border:"1px solid rgba(220,38,38,.3)"}}><div style={{fontSize:13,fontWeight:800,color:"#FCA5A5"}}>💀 BANKRUPT — Net worth below −$500K</div></div>}
  </div>;

  // MARKET
  const RATINGS_ORDER={"STRONG BUY":0,"BUY":1,"HOLD":2,"SELL":3};
  const getConsensus=c=>{const counts={};(c.analysts||[]).forEach(a=>counts[a.rating]=(counts[a.rating]||0)+1);return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||"HOLD";};
  const getAvgTgt=c=>Math.round((c.analysts||[]).reduce((x,a)=>x+a.target,0)/Math.max(1,(c.analysts||[]).length));
  let dispCos=[...d.cos];
  if(sortMkt==="analyst")dispCos.sort((a,b)=>(RATINGS_ORDER[getConsensus(a)]||2)-(RATINGS_ORDER[getConsensus(b)]||2));
  else if(sortMkt==="div_hi")dispCos.sort((a,b)=>b.div-a.div);
  else if(sortMkt==="div_lo")dispCos.sort((a,b)=>a.div-b.div);
  else if(sortMkt==="price_hi")dispCos.sort((a,b)=>b.price-a.price);
  else if(sortMkt==="price_lo")dispCos.sort((a,b)=>a.price-b.price);
  else if(sortMkt==="gain")dispCos.sort((a,b)=>b.ch-a.ch);
  else if(sortMkt==="loss")dispCos.sort((a,b)=>a.ch-b.ch);

  const RBadge=({r})=>{const m={"STRONG BUY":{bg:"#14532D",c:"#86EFAC"},"BUY":{bg:"#166534",c:"#BBF7D0"},"HOLD":{bg:"#78350F",c:"#FDE68A"},"SELL":{bg:"#7F1D1D",c:"#FCA5A5"}};const s=m[r]||{bg:"#374151",c:"#D1D5DB"};return <span style={{background:s.bg,color:s.c,padding:"2px 7px",borderRadius:10,fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>{r}</span>;};

  const S_Market=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
      <button onClick={()=>setSortMkt("analyst")} style={{padding:"5px 10px",borderRadius:20,border:"1.5px solid "+(sortMkt==="analyst"?G:"rgba(255,255,255,.15)"),background:sortMkt==="analyst"?"rgba(22,163,74,.2)":"transparent",color:sortMkt==="analyst"?"#86EFAC":"rgba(255,255,255,.4)",fontWeight:600,fontSize:10,cursor:"pointer"}}>★ Rating</button>
      <button onClick={()=>setSortMkt(sortMkt==="div_hi"?"div_lo":"div_hi")} style={{padding:"5px 10px",borderRadius:20,border:"1.5px solid "+(sortMkt.startsWith("div")?G:"rgba(255,255,255,.15)"),background:sortMkt.startsWith("div")?"rgba(22,163,74,.2)":"transparent",color:sortMkt.startsWith("div")?"#86EFAC":"rgba(255,255,255,.4)",fontWeight:600,fontSize:10,cursor:"pointer"}}>Div {sortMkt==="div_hi"?"↓":"↑"}</button>
      <button onClick={()=>setSortMkt(sortMkt==="price_hi"?"price_lo":"price_hi")} style={{padding:"5px 10px",borderRadius:20,border:"1.5px solid "+(sortMkt.startsWith("price")?G:"rgba(255,255,255,.15)"),background:sortMkt.startsWith("price")?"rgba(22,163,74,.2)":"transparent",color:sortMkt.startsWith("price")?"#86EFAC":"rgba(255,255,255,.4)",fontWeight:600,fontSize:10,cursor:"pointer"}}>Price {sortMkt==="price_hi"?"↓":"↑"}</button>
      <button onClick={()=>setSortMkt("gain")} style={{padding:"5px 10px",borderRadius:20,border:"1.5px solid "+(sortMkt==="gain"?G:"rgba(255,255,255,.15)"),background:sortMkt==="gain"?"rgba(22,163,74,.2)":"transparent",color:sortMkt==="gain"?"#86EFAC":"rgba(255,255,255,.4)",fontWeight:600,fontSize:10,cursor:"pointer"}}>▲ Gainers</button>
      <button onClick={()=>setSortMkt("loss")} style={{padding:"5px 10px",borderRadius:20,border:"1.5px solid "+(sortMkt==="loss"?R:"rgba(255,255,255,.15)"),background:sortMkt==="loss"?"rgba(220,38,38,.2)":"transparent",color:sortMkt==="loss"?"#FCA5A5":"rgba(255,255,255,.4)",fontWeight:600,fontSize:10,cursor:"pointer"}}>▼ Losers</button>
    </div>
    <div style={{background:"rgba(255,255,255,.04)",borderRadius:14,border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
      {dispCos.map((c,i)=>{const held=SH[c.t]||0;const consensus=getConsensus(c);const avgT=getAvgTgt(c);return <div key={c.t} onClick={()=>{setSelCo({...c});setTab("co");}} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:i<dispCos.length-1?"1px solid rgba(255,255,255,.05)":"none",cursor:"pointer"}}>
        <div style={{width:36,height:36,borderRadius:9,background:"rgba(22,163,74,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#86EFAC",border:"1px solid rgba(22,163,74,.3)",flexShrink:0}}>{c.t}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><span style={{fontSize:12,fontWeight:600,color:"#F8FAFC"}}>{c.n}</span><RBadge r={consensus}/></div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{c.s} · {c.div}% div · Tgt {fm(avgT)}{held>0?" · "+held.toLocaleString()+" held":""}</div>
        </div>
        <MC hist={c.hist} col={c.ch>=0?G:R}/>
        <div style={{textAlign:"right",minWidth:65}}><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:"#F8FAFC"}}>{fm(c.price)}</div><Bdg v={c.ch}/></div>
      </div>;})}
    </div>
  </div>;

  // COMPANY DETAIL
  const S_Co=(()=>{
    const c=selCo?d.cos.find(x=>x.t===selCo.t)||selCo:null;
    if(!c)return <div style={{padding:40,textAlign:"center",color:"rgba(255,255,255,.3)",fontSize:14}}>← Select a company from Markets</div>;
    const held=SH[c.t]||0,avgC=d.avgSh?.[c.t]||c.price,pl=held?(c.price-avgC)*held:0;
    const consensus=getConsensus(c),avgT=getAvgTgt(c);
    const TOTAL_SHARES={SLKT:1200000000,MRDB:800000000,FRMN:600000000,TNPT:900000000,MDCR:400000000,UTLS:300000000,TLCM:550000000,RLST:250000000,EMTS:180000000,AGRO:500000000};
    const total=TOTAL_SHARES[c.t]||500000000;
    const ownPct=held>0?Math.round(held/total*10000)/100:0;
    const maxBuy=Math.floor(tw/c.price);
    const presets=[100,500,1000,5000,10000,50000,maxBuy].filter((v,i2,a)=>v<=maxBuy&&v>0&&a.indexOf(v)===i2).sort((a,b)=>a-b).slice(-6);
    return <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"linear-gradient(135deg,#052e16,#14532d)",borderRadius:16,padding:16,color:"#fff"}}>
        <div style={{fontSize:10,opacity:.5,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{c.s} · {c.hq} · Est. {c.yr}</div>
        <div style={{fontSize:20,fontWeight:800,marginBottom:6}}>{c.n}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
          <div><div style={{fontSize:28,fontWeight:800,fontFamily:"monospace"}}>{fm(c.price)}</div><div style={{fontSize:11,color:c.ch>=0?"#86EFAC":"#FCA5A5",marginTop:2}}>{c.ch>=0?"▲":"▼"} {pc(Math.abs(c.ch*100))}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:10,opacity:.5}}>P/E</div><div style={{fontSize:18,fontWeight:700,fontFamily:"monospace"}}>{c.pe.toFixed(1)}×</div></div>
        </div>
        <div style={{height:26,marginBottom:8}}><MC hist={c.hist} w={370} h={26} col={c.ch>=0?G:R}/></div>
        <div style={{display:"flex",gap:5}}>
          {[["Div",c.div+"%"],["Beta",c.b+"×"],["CEO",c.ceo||"—"]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.1)",borderRadius:7,padding:"5px 6px",textAlign:"center"}}><div style={{fontSize:8,opacity:.5,marginBottom:1}}>{k}</div><div style={{fontSize:9,fontWeight:700}}>{v}</div></div>)}
        </div>
      </div>
      {/* Analyst consensus banner */}
      <div style={{background:consensus==="STRONG BUY"?"#14532D":consensus==="BUY"?"#166534":consensus==="HOLD"?"#78350F":"#7F1D1D",borderRadius:12,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:10,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Analyst Consensus · {(c.analysts||[]).length} firms</div><div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{consensus}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"rgba(255,255,255,.6)",marginBottom:2}}>Avg Target</div><div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"monospace"}}>{fm(avgT)}</div><div style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>{avgT>c.price?"▲ "+fm(avgT-c.price)+" upside":"▼ "+fm(c.price-avgT)+" downside"}</div></div>
      </div>
      {/* Individual analyst opinions */}
      <div style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:13,border:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#F8FAFC",marginBottom:10}}>Analyst Opinions</div>
        {(c.analysts||[]).map((a,i)=><div key={i} style={{padding:"9px 0",borderBottom:i<(c.analysts||[]).length-1?"1px solid rgba(255,255,255,.06)":"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:12,fontWeight:700,color:"#F8FAFC"}}>{a.firm}</span><RBadge r={a.rating}/></div><span style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:a.target>c.price?"#86EFAC":"#FCA5A5"}}>Tgt {fm(a.target)}</span></div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.45)",lineHeight:1.5}}>{a.note}</div>
        </div>)}
      </div>
      {/* Company story */}
      <div style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:13,border:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#F8FAFC",marginBottom:6}}>📖 Story</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.55)",lineHeight:1.7,marginBottom:10}}>{c.origin}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.35)",lineHeight:1.6}}>{c.ops}</div>
      </div>
      {/* Ownership + position */}
      <div style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:13,border:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#F8FAFC",marginBottom:8}}>Share Structure</div>
        <Row k="Total Shares" v={(total/1e6).toFixed(0)+"M"}/>
        <Row k="Your Shares" v={held>0?held.toLocaleString():"None"}/>
        <Row k="Your Ownership" v={ownPct>0?ownPct.toFixed(3)+"%":"0%"} vc={ownPct>=10?"#86EFAC":"#F8FAFC"}/>
        <Row k="Board Access" v={ownPct>=50?"✅ Majority Control":ownPct>=25?"✅ Strategy":ownPct>=10?"✅ Board Seat":"❌ Need 10%+"} vc={ownPct>=10?"#86EFAC":"rgba(255,255,255,.4)"}/>
        {held>0&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{display:"flex",gap:6}}>
            {[["Value",fm(c.price*held)],["Avg Cost",fm(avgC)],["P&L",(pl>=0?"+":"")+fm(pl)]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.06)",borderRadius:7,padding:"7px 6px",textAlign:"center"}}><div style={{fontSize:8,color:"rgba(255,255,255,.35)",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:700,color:k==="P&L"?(pl>=0?"#86EFAC":"#FCA5A5"):"#F8FAFC",fontFamily:"monospace"}}>{v}</div></div>)}
          </div>
        </div>}
      </div>
      {/* Trade */}
      <div style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:13,border:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:8}}>Trading Wallet: {fm(tw)} · Max buy: {maxBuy.toLocaleString()} shares</div>
        {maxBuy>0?<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
          {presets.map(v=><button key={v} onClick={()=>setTrAmt(trAmt===v?null:v)} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(trAmt===v?G:"rgba(255,255,255,.1)"),background:trAmt===v?"rgba(22,163,74,.15)":"transparent",color:trAmt===v?"#86EFAC":"rgba(255,255,255,.4)",fontWeight:700,fontSize:10,cursor:"pointer",textAlign:"center"}}>
            <div>{v>=1000?(v/1000).toFixed(0)+"K":v}</div>
            <div style={{fontSize:8,color:trAmt===v?"#86EFAC":"rgba(255,255,255,.2)",marginTop:1}}>{fm(v*c.price)}</div>
          </button>)}
        </div>:<div style={{fontSize:12,color:"rgba(255,255,255,.3)",padding:"10px 0",textAlign:"center"}}>Insufficient Trading Wallet funds</div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{if(trAmt)trade("stock",c,"buy",trAmt);}} disabled={!trAmt||d.liquidating} style={{flex:1,background:!trAmt||d.liquidating?"rgba(255,255,255,.05)":G,color:!trAmt||d.liquidating?"rgba(255,255,255,.2)":"#fff",border:"none",borderRadius:9,padding:"12px 0",fontWeight:800,fontSize:13,cursor:!trAmt||d.liquidating?"not-allowed":"pointer"}}>{trAmt?"Buy "+trAmt.toLocaleString()+" = "+fm(trAmt*c.price):"Select quantity"}</button>
          {held>0&&<button onClick={()=>trade("stock",c,"sell",held)} style={{flex:1,background:"rgba(220,38,38,.15)",color:"#FCA5A5",border:"1px solid rgba(220,38,38,.3)",borderRadius:9,padding:"12px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell All ({held.toLocaleString()})</button>}
        </div>
      </div>
    </div>;
  })();

  // BONDS + COMM + CRYP + FX
  const S_Bonds=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"rgba(255,255,255,.05)",borderRadius:11,padding:10,fontSize:11,color:"rgba(255,255,255,.5)"}}>Bonds pay quarterly coupons · AAA × 1.02 price multiplier · Buy in × lots</div>
    <div style={{background:"rgba(255,255,255,.04)",borderRadius:14,border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
      {d.bonds.map((b,i)=>{const pr=gBP(b),held=BH[b.id]||0;return <div key={b.id} style={{padding:"12px 14px",borderBottom:i<d.bonds.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div><div style={{fontSize:13,fontWeight:700,color:"#F8FAFC"}}>{b.n}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{b.rat} · {b.cou}% coupon · Matures {b.mat} · Held: {held}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,fontFamily:"monospace",color:pr>b.fv?"#86EFAC":"#FCA5A5"}}>{fm(pr)}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{b.cy.toFixed(2)}% yield</div></div></div>
        <div style={{display:"flex",gap:5}}>
          {[1,5,10,50].map(q=><button key={q} onClick={()=>trade("bond",b,"buy",q)} disabled={d.liquidating} style={{flex:1,background:"rgba(22,163,74,.15)",color:"#86EFAC",border:"1px solid rgba(22,163,74,.2)",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>×{q}</button>)}
          {held>0&&<button onClick={()=>trade("bond",b,"sell",held)} style={{flex:1,background:"rgba(220,38,38,.15)",color:"#FCA5A5",border:"1px solid rgba(220,38,38,.3)",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell</button>}
        </div>
      </div>;})}
    </div>
    {/* Commodities */}
    <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:.5,marginTop:4}}>Commodities</div>
    <div style={{background:"rgba(255,255,255,.04)",borderRadius:14,border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
      {d.comm.map((c,i)=>{const held=CH[c.id]||0;return <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:i<d.comm.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#F8FAFC"}}>{c.n}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{c.id} · base {fm(c.base)}{held>0?" · "+held+" held":""}</div></div>
        <MC hist={c.hist} col={c.ch>=0?G:R}/>
        <div style={{textAlign:"right",minWidth:70}}><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:"#F8FAFC"}}>{fm(c.p)}</div><Bdg v={c.ch}/></div>
        <div style={{display:"flex",gap:4}}>
          <button onClick={()=>{if(Math.floor(tw/c.p)>0)trade("comm",c,"buy",Math.floor(Math.min(tw/c.p,10)));}} style={{background:"rgba(22,163,74,.2)",color:"#86EFAC",border:"none",borderRadius:7,padding:"6px 10px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Buy</button>
          {held>0&&<button onClick={()=>trade("comm",c,"sell",held)} style={{background:"rgba(220,38,38,.15)",color:"#FCA5A5",border:"none",borderRadius:7,padding:"6px 10px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell</button>}
        </div>
      </div>;})}
    </div>
    {/* Crypto */}
    <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:.5,marginTop:4}}>Crypto</div>
    <div style={{background:"rgba(255,255,255,.04)",borderRadius:14,border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
      {d.cryp.map((c,i)=>{const held=CRH[c.id]||0;return <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:i<d.cryp.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#F8FAFC"}}>{c.n}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{c.id}{held>0?" · "+held+" held":""}</div></div>
        <MC hist={c.hist} col={c.ch>=0?G:R}/>
        <div style={{textAlign:"right",minWidth:70}}><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:"#F8FAFC"}}>{fm(c.p)}</div><Bdg v={c.ch}/></div>
        <div style={{display:"flex",gap:4}}>
          <button onClick={()=>{if(tw>c.p)trade("cryp",c,"buy",1);}} style={{background:"rgba(124,58,237,.2)",color:"#C4B5FD",border:"none",borderRadius:7,padding:"6px 10px",fontWeight:700,fontSize:11,cursor:"pointer"}}>×1</button>
          {held>0&&<button onClick={()=>trade("cryp",c,"sell",held)} style={{background:"rgba(220,38,38,.15)",color:"#FCA5A5",border:"none",borderRadius:7,padding:"6px 10px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell</button>}
        </div>
      </div>;})}
    </div>
    {/* Forex */}
    <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:.5,marginTop:4}}>Forex</div>
    <div style={{background:"rgba(255,255,255,.04)",borderRadius:14,border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
      {d.fx.map((f,i)=>{const pos=d.fxPositions?.[f.id];const pnl=pos?(pos.side==="long"?(f.p-pos.entry)*pos.cost/pos.entry:(pos.entry-f.p)*pos.cost/pos.entry):0;return <div key={f.id} style={{padding:"10px 14px",borderBottom:i<d.fx.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:pos?6:0}}>
          <div onClick={()=>setFxSel(fxSel===f.id?null:f.id)} style={{cursor:"pointer"}}><div style={{fontSize:13,fontWeight:600,color:"#F8FAFC"}}>{f.n}</div>{pos&&<div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{pos.side.toUpperCase()} · Entry {pos.entry.toFixed(4)} · Cost {fm(pos.cost)}</div>}</div>
          <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace",color:f.ch>=0?"#86EFAC":"#FCA5A5"}}>{f.p.toFixed(4)}</div><Bdg v={f.ch}/></div>
        </div>
        {pos&&<button onClick={()=>{const s=S.current;const pos2=s.fxPositions[f.id];const pnl2=pos2.side==="long"?(f.p-pos2.entry)*pos2.cost/pos2.entry:(pos2.entry-f.p)*pos2.cost/pos2.entry;const ret=Math.round((pos2.cost+pnl2)*100)/100;s.tradingWallet=Math.round((s.tradingWallet+ret)*100)/100;delete s.fxPositions[f.id];toast_("Closed "+f.id+" · P&L: "+(pnl2>=0?"+":"")+fm(pnl2));refresh();}} style={{width:"100%",background:pnl>=0?"rgba(22,163,74,.2)":"rgba(220,38,38,.15)",color:pnl>=0?"#86EFAC":"#FCA5A5",border:"none",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Close · P&L: {pnl>=0?"+":""}{fm(pnl)}</button>}
        {fxSel===f.id&&!pos&&<div style={{marginTop:8}}>
          <div style={{display:"flex",gap:5,marginBottom:7}}>
            {["long","short"].map(s=><button key={s} onClick={()=>setFxSide(s)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"1.5px solid "+(fxSide===s?(s==="long"?G:R):"rgba(255,255,255,.1)"),background:fxSide===s?(s==="long"?"rgba(22,163,74,.15)":"rgba(220,38,38,.15)"):"transparent",color:fxSide===s?(s==="long"?"#86EFAC":"#FCA5A5"):"rgba(255,255,255,.4)",fontWeight:700,fontSize:12,cursor:"pointer"}}>{s==="long"?"📈 Long":"📉 Short"}</button>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:7}}>
            {[.10,.25,.50,1.0].map(pct=>{const amt=Math.floor(tw*pct/1000)*1000;return <button key={pct} onClick={()=>setFxAmt(fxAmt===amt?null:amt)} style={{padding:"8px 4px",borderRadius:8,border:"2px solid "+(fxAmt===amt?G:"rgba(255,255,255,.1)"),background:fxAmt===amt?"rgba(22,163,74,.15)":"transparent",color:fxAmt===amt?"#86EFAC":"rgba(255,255,255,.4)",fontWeight:700,fontSize:10,cursor:"pointer",textAlign:"center"}}>
              <div>{Math.round(pct*100)}%</div><div style={{fontSize:8,color:fxAmt===amt?"#86EFAC":"rgba(255,255,255,.2)",marginTop:1}}>{fm(amt)}</div>
            </button>;})}
          </div>
          <button onClick={()=>{if(!fxAmt)return;const s=S.current;if(fxAmt>s.tradingWallet){toast_("Insufficient Trading Wallet",false);return;}s.tradingWallet=Math.round((s.tradingWallet-fxAmt)*100)/100;s.fxPositions[f.id]={entry:f.p,side:fxSide,cost:fxAmt};toast_(fxSide.toUpperCase()+" "+fm(fxAmt)+" on "+f.id);setFxSel(null);setFxAmt(null);refresh();}} disabled={!fxAmt} style={{width:"100%",background:!fxAmt?"rgba(255,255,255,.05)":fxSide==="long"?G:R,color:!fxAmt?"rgba(255,255,255,.2)":"#fff",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:fxAmt?"pointer":"not-allowed"}}>{fxAmt?"Open "+fxSide.toUpperCase()+" "+fm(fxAmt)+" on "+f.id:"Select amount above"}</button>
        </div>}
      </div>;})}
    </div>
  </div>;

  // ETF + IPO
  const S_ETF=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:.5}}>ETFs</div>
    <div style={{background:"rgba(255,255,255,.04)",borderRadius:14,border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
      {d.etfs.map((e,i)=>{const held=e.units>0;const val=e.units*e.price;const pl=held?(e.price-e.avgCost)*e.units:0;const maxU=Math.floor(tw/e.price);return <div key={e.id} style={{padding:"12px 14px",borderBottom:i<d.etfs.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <div><div style={{display:"flex",gap:5,alignItems:"center",marginBottom:2}}><span style={{fontSize:13,fontWeight:700,color:"#F8FAFC"}}>{e.n}</span><span style={{background:"rgba(124,58,237,.2)",color:"#C4B5FD",padding:"1px 6px",borderRadius:8,fontSize:9,fontWeight:700}}>{e.type}</span></div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{e.expense}% TER · {e.div}% div{held?" · "+e.units.toLocaleString()+" units · "+fm(val):""}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace",color:"#F8FAFC"}}>{fm(e.price)}</div><Bdg v={e.ch}/></div>
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,.25)",marginBottom:6}}>{e.top}</div>
        {held&&<div style={{fontSize:11,color:pl>=0?"#86EFAC":"#FCA5A5",marginBottom:6,fontFamily:"monospace"}}>P&L: {pl>=0?"+":""}{fm(pl)}</div>}
        <div style={{display:"flex",gap:6}}>
          {[10,50,maxU>0?maxU:0].filter(v=>v>0&&v<=maxU).slice(0,3).map(q=><button key={q} onClick={()=>trade("etf",e,"buy",q)} disabled={d.liquidating} style={{flex:1,background:"rgba(22,163,74,.15)",color:"#86EFAC",border:"1px solid rgba(22,163,74,.2)",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer"}}>Buy {q>=maxU?"Max":q}</button>)}
          {held&&<button onClick={()=>trade("etf",e,"sell",e.units)} style={{flex:1,background:"rgba(220,38,38,.15)",color:"#FCA5A5",border:"none",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell All</button>}
        </div>
      </div>;})}
    </div>
    <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:.5,marginTop:4}}>IPO Pipeline</div>
    {d.ipos.map(ip=>{const turnsTo=ip.opens-d.turn;const mid=(ip.priceRange[0]+ip.priceRange[1])/2;return <div key={ip.id} style={{background:"rgba(255,255,255,.04)",borderRadius:13,padding:13,border:"1px solid "+(ip.listed?"rgba(22,163,74,.3)":turnsTo<=20?"rgba(29,78,216,.3)":"rgba(255,255,255,.08)")}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <div><div style={{fontSize:13,fontWeight:700,color:"#F8FAFC"}}>{ip.n}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{ip.sector} · {ip.fundedBy}</div></div>
        <div style={{textAlign:"right"}}>{ip.listed?<span style={{background:"rgba(22,163,74,.2)",color:"#86EFAC",padding:"4px 8px",borderRadius:8,fontSize:11,fontWeight:800}}>Listed {fm(ip.listPrice)}</span>:<span style={{background:"rgba(29,78,216,.15)",color:"#93C5FD",padding:"4px 8px",borderRadius:8,fontSize:11,fontWeight:700}}>Opens T{ip.opens}{turnsTo>0?" ("+turnsTo+"t)":""}</span>}</div>
      </div>
      <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:8}}>{ip.desc}</div>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {[["Range",fm(ip.priceRange[0])+"–"+fm(ip.priceRange[1])],["Demand",ip.oversubscribed.toFixed(1)+"×"],["Booked",(ip.allocated||0).toLocaleString()+" sh"]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.06)",borderRadius:7,padding:"6px 5px",textAlign:"center"}}><div style={{fontSize:8,color:"rgba(255,255,255,.3)",marginBottom:1}}>{k}</div><div style={{fontSize:10,fontWeight:700,color:"#F8FAFC"}}>{v}</div></div>)}
      </div>
      {!ip.listed&&<div style={{display:"flex",gap:5}}>
        {[100,500,1000].filter(q=>q*mid<=tw).map(q=><button key={q} onClick={()=>{const s=S.current;const est=Math.round(q*mid*100)/100;if(est>s.tradingWallet){toast_("Insufficient",false);return;}s.tradingWallet=Math.round((s.tradingWallet-est)*100)/100;const ip2=s.ipos.find(x=>x.id===ip.id);ip2.allocated=(ip2.allocated||0)+q;s.myNews.unshift({t:s.turn,ico:"📋",msg:"IPO booked: "+q+" shares "+ip.n+" · Est. "+fm(est)+" · Opens T"+ip.opens,mine:true});toast_("✅ Booked "+q+" shares · Opens T"+ip.opens);refresh();}} style={{flex:1,background:"rgba(217,119,6,.15)",color:"#FDE68A",border:"1px solid rgba(217,119,6,.2)",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Book {q}</button>)}
      </div>}
    </div>;})}
  </div>;

  // PLANET FUNDS
  const S_Funds=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#052e16,#14532d)",borderRadius:14,padding:14,color:"#fff"}}>
      <div style={{fontSize:16,fontWeight:800,marginBottom:4}}>🌍 Planet Sovereign Funds</div>
      <div style={{fontSize:12,opacity:.8,lineHeight:1.6}}>Each planet runs its own fund backed by its primary industry. Earns every turn automatically.</div>
      <div style={{display:"flex",gap:8,marginTop:10}}>
        {[["Total Deposited",fm(gsfV)],["Earning/Turn",fm(Math.round(PLANET_FUNDS.reduce((x,f)=>(d.gsfDeposits?.[f.id]||0)>0?x+(d.gsfDeposits[f.id]*f.rate/100/365):x,0)*100)/100)]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.1)",borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:9,opacity:.6,marginBottom:2}}>{k}</div><div style={{fontSize:14,fontWeight:800,fontFamily:"monospace"}}>{v}</div></div>)}
      </div>
    </div>
    {PLANET_FUNDS.map(f=>{
      const dep=d.gsfDeposits?.[f.id]||0;const earned=d.gsfEarned?.[f.id]||0;const perTurn=Math.round(dep*(f.rate/100/365)*100)/100;
      const presets=[50000,100000,500000,1000000,Math.floor(tw*.25/1000)*1000].filter((v,i2,a)=>v<=tw&&v>=50000&&a.indexOf(v)===i2).sort((a,b)=>a-b).slice(-4);
      const[open,setOpen]=useState(false);
      return <div key={f.id} style={{background:"rgba(255,255,255,.04)",borderRadius:13,padding:13,border:"2px solid "+(dep>0?f.color+"44":"rgba(255,255,255,.08)")}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{fontSize:20}}>{f.ico}</span><span style={{fontSize:14,fontWeight:700,color:"#F8FAFC"}}>{f.n}</span></div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{f.rate}%/yr · Min $50K</div></div>
          <div style={{fontSize:18,fontWeight:800,color:f.color}}>{f.rate}%</div>
        </div>
        {dep>0&&<div style={{display:"flex",gap:6,marginBottom:10}}>
          {[["Deposited",fm(dep)],["Per Turn",fm(perTurn)],["Total Earned",fm(earned)]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.06)",borderRadius:7,padding:"6px 5px",textAlign:"center"}}><div style={{fontSize:8,color:"rgba(255,255,255,.3)",marginBottom:1}}>{k}</div><div style={{fontSize:10,fontWeight:700,color:k==="Total Earned"?"#86EFAC":"#F8FAFC",fontFamily:"monospace"}}>{v}</div></div>)}
        </div>}
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setOpen(!open)} style={{flex:2,background:f.color+"33",color:"#F8FAFC",border:"1px solid "+f.color+"44",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>+ Deposit</button>
          {dep>0&&<button onClick={()=>{const s=S.current;const amt=s.gsfDeposits[f.id];s.tradingWallet=Math.round((s.tradingWallet+amt)*100)/100;s.gsfDeposits[f.id]=0;toast_("Withdrawn "+fm(amt)+" from "+f.planet+" Fund");refresh();}} style={{flex:1,background:"rgba(220,38,38,.15)",color:"#FCA5A5",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Withdraw</button>}
        </div>
        {open&&<div style={{marginTop:10}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
            {presets.map(v=><button key={v} onClick={()=>{const s=S.current;const fee=Math.round(v*.02*100)/100;const net=Math.round(v*.98*100)/100;if(v>s.tradingWallet){toast_("Insufficient",false);return;}s.tradingWallet=Math.round((s.tradingWallet-v)*100)/100;s.gsfDeposits[f.id]=Math.round(((s.gsfDeposits[f.id]||0)+net)*100)/100;toast_("✅ Deposited "+fm(net)+" to "+f.planet+" Fund · "+fm(Math.round(s.gsfDeposits[f.id]*f.rate/100/365*100)/100)+"/turn");setOpen(false);refresh();}} style={{padding:"9px 4px",borderRadius:8,border:"1.5px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.7)",fontWeight:700,fontSize:10,cursor:"pointer",textAlign:"center"}}>{fm(v)}</button>)}
          </div>
        </div>}
      </div>;
    })}
  </div>;

  // PORTFOLIO
  const S_Port=<div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#052e16,#14532d)",borderRadius:16,padding:16,color:"#fff"}}>
      <div style={{fontSize:11,opacity:.5,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Total Portfolio</div>
      <div style={{fontSize:28,fontWeight:800,fontFamily:"monospace",marginBottom:6}}>{fm(nw)}</div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {[["Cash",fm(pw)],["Savings",fm(sw)],["Trading",fm(tw)],["Stocks",fm(sv)],["Bonds",fm(bv)],["Comm",fm(cv)],["Crypto",fm(crv)],["ETFs",fm(etfV)],["Funds",fm(gsfV)]].map(([k,v])=><div key={k} style={{background:"rgba(255,255,255,.1)",borderRadius:7,padding:"4px 7px"}}><div style={{fontSize:8,opacity:.5}}>{k}</div><div style={{fontSize:9,fontWeight:700,fontFamily:"monospace"}}>{v}</div></div>)}
      </div>
    </div>
    {Object.keys(SH).filter(t=>(SH[t]||0)>0).length>0&&<div style={{background:"rgba(255,255,255,.04)",borderRadius:13,border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
      <div style={{padding:"11px 14px",fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:.5}}>Stock Holdings</div>
      {Object.entries(SH).filter(([,n])=>n>0).map(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(!c)return null;const avgC=d.avgSh?.[t]||c.price,pl=(c.price-avgC)*n;return <div key={t} style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div onClick={()=>{setSelCo({...c});setTab("co");}} style={{cursor:"pointer"}}><div style={{fontSize:12,fontWeight:600,color:"#F8FAFC"}}>{c.n}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{n.toLocaleString()} shares · avg {fm(avgC)}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{fm(c.price*n)}</div><div style={{fontSize:10,fontFamily:"monospace",color:pl>=0?"#86EFAC":"#FCA5A5"}}>{pl>=0?"+":""}{fm(pl)}</div></div>
      </div>;})}
    </div>}
    {d.etfs.filter(e=>e.units>0).length>0&&<div style={{background:"rgba(255,255,255,.04)",borderRadius:13,border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
      <div style={{padding:"11px 14px",fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:.5}}>ETF Holdings</div>
      {d.etfs.filter(e=>e.units>0).map(e=>{const pl=(e.price-e.avgCost)*e.units;return <div key={e.id} style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:12,fontWeight:600,color:"#F8FAFC"}}>{e.n}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{e.units.toLocaleString()} units</div></div><div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{fm(e.price*e.units)}</div><div style={{fontSize:10,color:pl>=0?"#86EFAC":"#FCA5A5",fontFamily:"monospace"}}>{pl>=0?"+":""}{fm(pl)}</div></div></div>;})}
    </div>}
    {d.ipos.filter(ip=>(ip.allocated||0)>0).length>0&&<div style={{background:"rgba(255,255,255,.04)",borderRadius:13,padding:13,border:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>IPO Bookings</div>
      {d.ipos.filter(ip=>(ip.allocated||0)>0).map(ip=><div key={ip.id} style={{padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,fontWeight:700,color:"#F8FAFC"}}>{ip.n}</span><span style={{fontSize:11,color:ip.listed?"#86EFAC":"#93C5FD",fontWeight:700}}>{ip.listed?"Listed "+fm(ip.listPrice):"Opens T"+ip.opens}</span></div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{(ip.allocated||0).toLocaleString()} shares · Est. {fm((ip.allocated||0)*(ip.priceRange[0]+ip.priceRange[1])/2)}</div></div>)}
    </div>}
  </div>;

  // NEWS
  const S_News=<div style={{padding:14,display:"flex",flexDirection:"column",gap:8}}>
    <div style={{display:"flex",background:"rgba(255,255,255,.06)",borderRadius:10,padding:3,gap:2}}>
      {[{id:"all",l:"🌍 Earth Feed"},{id:"mine",l:"👤 My Events"}].map(t=><button key={t.id} onClick={()=>setNewsTab(t.id)} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",background:newsTab===t.id?"rgba(255,255,255,.1)":"transparent",color:newsTab===t.id?"#F8FAFC":"rgba(255,255,255,.4)",fontWeight:700,fontSize:12,cursor:"pointer"}}>{t.l}</button>)}
    </div>
    {(newsTab==="mine"?(d.myNews||[]):(d.news||[])).length===0&&<div style={{padding:30,textAlign:"center",color:"rgba(255,255,255,.3)",fontSize:13}}>No news yet — advance turns.</div>}
    {(newsTab==="mine"?(d.myNews||[]):(d.news||[])).slice(0,30).map((n,i)=><div key={i} style={{background:"rgba(255,255,255,.04)",borderRadius:11,padding:12,border:"1px solid rgba(255,255,255,.06)",display:"flex",gap:9}}>
      <div style={{width:4,borderRadius:2,flexShrink:0,background:n.bad?R:G,alignSelf:"stretch"}}/>
      <div><div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginBottom:3}}>Turn {n.t} · {n.ico}</div><div style={{fontSize:12,color:"#F8FAFC",lineHeight:1.5}}>{n.msg}</div></div>
    </div>)}
  </div>;

  // ── TUTORIAL OVERLAY ─────────────────────────────────────────
  const TutOverlay=(()=>{
    if(tutorial<0||tutorial>=TUTORIAL.length)return null;
    const step=TUTORIAL[tutorial];
    return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:500,display:"flex",alignItems:"flex-end",padding:16}}>
      <div style={{background:"linear-gradient(135deg,#0F172A,#1E293B)",borderRadius:20,padding:22,width:"100%",border:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{display:"flex",gap:5,marginBottom:12}}>
          {TUTORIAL.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=tutorial?"#16A34A":"rgba(255,255,255,.15)"}}/>)}
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Step {tutorial+1} of {TUTORIAL.length}</div>
        <div style={{fontSize:20,fontWeight:800,color:"#F8FAFC",marginBottom:8,lineHeight:1.3}}>{step.title}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.65)",lineHeight:1.7,marginBottom:18}}>{step.body}</div>
        <div style={{display:"flex",gap:10}}>
          {tutorial>0&&<button onClick={()=>setTutorial(t=>t-1)} style={{flex:1,background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.6)",border:"none",borderRadius:11,padding:"13px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>← Back</button>}
          <button onClick={()=>{const next=tutorial+1;if(next>=TUTORIAL.length){setTutorial(-1);}else{setTutorial(next);if(step.target){const tMap={wallets:"home",era:"home",mkt:"mkt",bonds:"bonds",funds:"funds"};if(tMap[step.target])setTab(tMap[step.target]);}}}} style={{flex:tutorial>0?2:1,background:G,color:"#fff",border:"none",borderRadius:11,padding:"13px 0",fontWeight:800,fontSize:14,cursor:"pointer"}}>{step.btn}</button>
        </div>
        <button onClick={()=>setTutorial(-1)} style={{width:"100%",marginTop:8,background:"transparent",border:"none",color:"rgba(255,255,255,.25)",fontSize:12,cursor:"pointer",padding:"6px 0"}}>Skip Tutorial</button>
      </div>
    </div>;
  })();

  // ── TRADE MODAL ──────────────────────────────────────────────
  const TradeModal=trM?<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget){setTrM(null);setTrAmt(null);}}}><div style={{background:"#0F172A",borderRadius:"20px 20px 0 0",padding:20,width:"100%",border:"1px solid rgba(255,255,255,.1)"}}>
    <div style={{width:36,height:5,background:"rgba(255,255,255,.2)",borderRadius:3,margin:"0 auto 14px"}}/>
    <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:12}}>{trM.n||trM.id} · {fm(trM.price||trM.p||0)} per share · {fm(tw)} available</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
      {[100,500,1000,Math.floor(tw/(trM.price||trM.p||1))].filter((v,i2,a)=>v>0&&v<=Math.floor(tw/(trM.price||trM.p||1))&&a.indexOf(v)===i2).slice(-4).map(v=><button key={v} onClick={()=>setTrAmt(v)} style={{padding:"10px 4px",borderRadius:9,border:"2px solid "+(trAmt===v?G:"rgba(255,255,255,.1)"),background:trAmt===v?"rgba(22,163,74,.15)":"transparent",color:trAmt===v?"#86EFAC":"rgba(255,255,255,.4)",fontWeight:700,fontSize:11,cursor:"pointer"}}>{v>=1000?(v/1000).toFixed(0)+"K":v}</button>)}
    </div>
    <div style={{display:"flex",gap:8}}>
      <button onClick={()=>{if(trAmt)trade(trM.type||"stock",trM,"buy",trAmt);}} disabled={!trAmt} style={{flex:1,background:trAmt?G:"rgba(255,255,255,.05)",color:trAmt?"#fff":"rgba(255,255,255,.2)",border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,fontSize:14,cursor:trAmt?"pointer":"not-allowed"}}>{trAmt?"Buy "+trAmt.toLocaleString()+" = "+fm(trAmt*(trM.price||trM.p||0)):"Select quantity"}</button>
    </div>
  </div></div>:null;

  // ── RENDER ────────────────────────────────────────────────────
  const screenMap={home:S_Home,mkt:S_Market,co:S_Co,bonds:S_Bonds,comm:S_Bonds,etf:S_ETF,funds:S_Funds,port:S_Port,news:S_News};
  return <div style={{maxWidth:430,margin:"0 auto",background:"#0F172A",minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"system-ui,-apple-system,sans-serif",color:"#F8FAFC"}}>
    {/* Top bar */}
    <div style={{background:"#0F172A",padding:"10px 15px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#052e16,#16A34A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🌌</div><div><div style={{fontSize:14,fontWeight:800,color:"#F8FAFC",lineHeight:1}}>Galactic Raider</div><div style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>Capital Exchange</div></div></div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>{auto&&<div style={{width:7,height:7,borderRadius:"50%",background:"#16A34A",boxShadow:"0 0 6px #16A34A"}}/>}<div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:"#86EFAC",fontFamily:"monospace"}}>{fm(nw)}</div><div style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>T{d.turn} · {era.name}</div></div></div>
    </div>
    {/* Ticker */}
    <div style={{background:"rgba(255,255,255,.04)",padding:"3px 0",overflow:"hidden",flexShrink:0,borderBottom:"1px solid rgba(255,255,255,.06)"}}>
      <div style={{display:"flex",gap:14,whiteSpace:"nowrap",animation:"scroll 28s linear infinite",width:"max-content"}}>{[...d.cos,...d.cos].map((c,i)=><span key={i} style={{fontSize:10,fontFamily:"monospace",color:"rgba(255,255,255,.3)",display:"inline-flex",gap:5}}><span style={{color:"rgba(255,255,255,.5)",fontWeight:700}}>{c.t}</span><span style={{color:c.ch>=0?"#86EFAC":"#FCA5A5"}}>{fm(c.price)} {c.ch>=0?"▲":"▼"}{(Math.abs(c.ch)*100).toFixed(2)}%</span></span>)}</div>
    </div>
    {/* Main content */}
    <div style={{flex:1,overflowY:"auto",paddingBottom:70}}>{screenMap[tab]||S_Home}</div>
    {/* Bottom nav */}
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#0F172A",borderTop:"1px solid rgba(255,255,255,.08)",display:"flex",padding:"6px 2px 12px",zIndex:50}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"5px 0 3px",border:"none",background:"transparent",color:tab===t.id?"#86EFAC":"rgba(255,255,255,.3)",cursor:"pointer",fontFamily:"inherit"}}>
        <div style={{fontSize:16,lineHeight:1,marginBottom:2}}>{t.ico}</div>
        <div style={{fontSize:8,fontWeight:700}}>{t.l}</div>
      </button>)}
    </div>
    {/* Overlays */}
    {TradeModal}
    {TutOverlay}
    {toast&&<div style={{position:"fixed",bottom:76,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:toast.g?G:R,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,zIndex:250,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.4)"}}>{toast.msg}</div>}
    <style>{"@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{display:none}button{outline:none;font-family:inherit}"}</style>
  </div>;
}
