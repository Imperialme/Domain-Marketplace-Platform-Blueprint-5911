import{useState,useRef,useEffect,useCallback}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e12?"$"+(a/1e12).toFixed(2)+"T":a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const pc=n=>(n>=0?"+":"")+((n||0)*100).toFixed(2)+"%";
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);

// ── STATIC DATA ────────────────────────────────────────────────
const COS=[
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",r:"Asia Pacific",ip:348.94,pe0:18.4,div:0.8,b:1.8,hq:"Singapore",yr:2008,emp:125000,desc:"AI and cloud leader across 18 Asia Pacific markets."},
  {t:"MRDB",n:"Meridian Bank",s:"Banking",r:"US",ip:85.20,pe0:12.1,div:2.1,b:0.9,hq:"New York",yr:1985,emp:45000,desc:"US commercial bank — 2,400 branches, corporate lending."},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",r:"Africa",ip:15.80,pe0:8.5,div:0.5,b:1.6,hq:"Johannesburg",yr:2005,emp:28000,desc:"Pan-African mining: iron ore, rare earth, lithium."},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",r:"Emerging Markets",ip:351.54,pe0:11.3,div:1.8,b:1.2,hq:"Dubai",yr:1995,emp:62000,desc:"Major oil producer — UAE, Kuwait, Oman, Central Asia."},
  {t:"AGRO",n:"AgroLatin Corp",s:"Agriculture",r:"Latin America",ip:42.18,pe0:13.2,div:2.5,b:1.1,hq:"São Paulo",yr:1975,emp:18000,desc:"Largest agri-business in Latin America."},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",r:"US",ip:198.40,pe0:22.1,div:1.2,b:0.8,hq:"Boston",yr:2005,emp:38000,desc:"Medical devices, diagnostics and hospital management."},
  {t:"CLFL",n:"ClearFlame Energy",s:"Energy",r:"Europe",ip:112.30,pe0:14.8,div:2.0,b:1.1,hq:"Amsterdam",yr:2010,emp:22000,desc:"Wind, solar and gas — 12 million European households."},
  {t:"AXMB",n:"Axum Biotech",s:"Healthcare",r:"Africa",ip:68.50,pe0:19.4,div:0.6,b:1.4,hq:"Addis Ababa",yr:2012,emp:8500,desc:"Tropical disease vaccines and African genomic medicine."},
  {t:"PCMN",n:"Pacific Mfg",s:"Manufacturing",r:"Asia Pacific",ip:76.20,pe0:15.6,div:1.3,b:1.0,hq:"Seoul",yr:1988,emp:55000,desc:"EV battery parts for top-20 global automakers."},
  {t:"NRDX",n:"Nordic Bank",s:"Banking",r:"Europe",ip:132.10,pe0:11.8,div:2.4,b:0.8,hq:"Stockholm",yr:1975,emp:32000,desc:"Pan-European financial services across 18 countries."},
  {t:"UTLS",n:"Utility Systems",s:"Utilities",r:"US",ip:58.40,pe0:14.2,div:4.2,b:0.5,hq:"Chicago",yr:1950,emp:12000,desc:"US electric and gas utility — 3.2M Midwest customers."},
  {t:"TLCM",n:"TeleCom Europe",s:"Telecom",r:"Europe",ip:88.60,pe0:13.5,div:4.5,b:0.6,hq:"Frankfurt",yr:1985,emp:48000,desc:"280M mobile subscribers across 22 European countries."},
  {t:"RETL",n:"RetailHub Inc",s:"Retail",r:"US",ip:38.90,pe0:14.0,div:1.5,b:1.2,hq:"Seattle",yr:2000,emp:85000,desc:"1,200 US stores and online marketplace — 48M members."},
  {t:"RLST",n:"RealEstate Trust",s:"Real Estate",r:"US",ip:44.20,pe0:12.8,div:3.8,b:0.7,hq:"Dallas",yr:1995,emp:2800,desc:"$18B REIT: Sun Belt commercial and industrial."},
  {t:"EMTS",n:"Emerging Tech",s:"Technology",r:"Emerging Markets",ip:28.40,pe0:22.0,div:0.2,b:2.0,hq:"Mumbai",yr:2015,emp:6500,desc:"B2B SaaS cloud for 18,000 South Asian enterprises."},
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
  {id:"rc",n:"Rate Cut",ico:"🏦",t:"mkt",prob:.04,sent:.08,dur:10,good:true,desc:"Emergency cut — stocks and bonds rally."},
  {id:"rh",n:"Rate Hike",ico:"📈",t:"mkt",prob:.04,sent:-.07,dur:8,good:false,desc:"Rate hike — equity valuations compressed."},
  {id:"geo",n:"Geopolitical Crisis",ico:"💣",t:"mkt",prob:.03,sent:-.14,dur:20,sec:["Energy","Mining"],good:false,desc:"Conflict — Energy spikes, capital flees."},
  {id:"trg",n:"Tech Regulation",ico:"📜",t:"mkt",prob:.03,sent:-.12,dur:18,sec:["Technology"],good:false,desc:"Global tech rules — sector falls."},
  {id:"td",n:"Trade Deal",ico:"🤝",t:"mkt",prob:.04,sent:.09,dur:12,good:true,desc:"New deal — markets rally."},
  {id:"pat",n:"Patent Approved",ico:"⚡",t:"co",prob:.05,imp:.28,dur:5,good:true,desc:"Key patent — stock surges."},
  {id:"scn",n:"CEO Scandal",ico:"💼",t:"co",prob:.03,imp:-.25,dur:15,good:false,desc:"Misconduct revealed — stock craters."},
  {id:"bea",n:"Earnings Beat",ico:"💰",t:"co",prob:.10,imp:.20,dur:6,good:true,desc:"Results beat — reprices up."},
  {id:"mis",n:"Earnings Miss",ico:"📉",t:"co",prob:.09,imp:-.18,dur:6,good:false,desc:"Results disappoint — selling begins."},
  {id:"con",n:"Govt Contract",ico:"🏛️",t:"co",prob:.04,imp:.22,dur:35,good:true,desc:"Major contract — 35-turn revenue."},
  {id:"str",n:"Labour Strike",ico:"✊",t:"co",prob:.03,imp:-.20,dur:12,good:false,desc:"Workers out — production halts."},
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
      turn:1,cash:1_000_000,gdp:2.5,inf:3.2,intr:4.5,gsf:12.48,
      cos:COS.map(c=>({...c,price:c.ip,pp:c.ip,pe:c.pe0,ch:0,hist:[c.ip,c.ip]})),
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
      gsfDep:0,gsfTotal:0,dons:0,taxRed:0,
      era:"Normal",eraStart:1,cgtRate:.20,divRate:.15,txnRate:.001,
      phiBen:[],taxPaid:0,lastDiv:0,lastCoup:0,
      news:[
        {id:1,t:1,ico:"🌐",ti:"Galactic Raider v7",bo:"$1M starting capital. All markets live. No position limits. CGT on profit only. GSF withdraw anytime. Dividends quarterly. Auto-sim fixed.",g:true},
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
      s.cash=Math.round((s.cash+ret)*100)/100;
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
        s.cash=Math.round((s.cash+div)*100)/100;
        s.lastDiv=div;
        nn.push({id:Math.random(),t:s.turn,ico:"💰",ti:"Dividends Received: "+fm(div),bo:"Quarterly payment (annual yield ÷ 4). "+divDetail.slice(0,3).join(" · "),g:true});
      }
      // Bond coupons quarterly
      let coup=0;
      Object.entries(s.bh).forEach(([id,q])=>{const b=s.bonds.find(x=>x.id===id);if(b&&q>0)coup+=b.fv*(b.cou/100/4)*q;});
      if(coup>0){
        s.cash=Math.round((s.cash+coup)*100)/100;
        s.lastCoup=coup;
        nn.push({id:Math.random(),t:s.turn,ico:"📋",ti:"Bond Coupons: "+fm(coup),bo:"Quarterly coupon (annual rate ÷ 4).",g:true});
      }
    }
    // Wealth tax above $10B
    const sv=Object.entries(s.sh).reduce((sum,[t,n])=>{const c=s.cos.find(x=>x.t===t);return sum+(c?c.price*n:0);},0);
    const nwNow=s.cash+sv+s.gsfDep;
    if(nwNow>10e9){const tx=Math.round((nwNow-10e9)*.001*100)/100;s.cash=Math.max(0,s.cash-tx);}
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
  const nw=d.cash+sv+bv+cv+crv+(d.gsfDep||0);
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
        if(cost>s.cash){toast_("Need "+fm(cost)+" — have "+fm(s.cash),false);return;}
        const prev=s.sh[item.t]||0;
        s.sh[item.t]=(prev)+q;
        s.avgSh[item.t]=Math.round(((s.avgSh[item.t]||item.price)*prev+cost)/s.sh[item.t]*100)/100;
        s.cash=Math.round((s.cash-cost)*100)/100;
        toast_("Bought "+q.toLocaleString()+" "+item.t+" @ "+fm(item.price));
      }else{
        const held=s.sh[item.t]||0;
        if(q>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(q*item.price*100)/100;
        const profit=Math.max(0,(item.price-(s.avgSh[item.t]||item.price))*q);
        const tax=Math.round(profit*(s.cgtRate||.20)*(1-(s.taxRed||0))*100)/100;
        s.cash=Math.round((s.cash+proc-tax)*100)/100;
        s.sh[item.t]=held-q;
        if(s.sh[item.t]<=0)delete s.sh[item.t];
        toast_("Sold "+q.toLocaleString()+" "+item.t+" · CGT: "+fm(tax)+" on profit");
      }
    }else if(type==="comm"){
      if(isBuy){
        const cost=Math.round(q*item.p*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.ch[item.id]=(s.ch[item.id]||0)+q;
        s.avgCm[item.id]=item.p;
        s.cash=Math.round((s.cash-cost)*100)/100;
        toast_("Bought "+q.toLocaleString()+" "+item.u+" of "+item.n);
      }else{
        const held=s.ch[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(q*item.p*100)/100;
        const profit=Math.max(0,(item.p-(s.avgCm[item.id]||item.p))*q);
        const tax=Math.round(profit*.20*(1-(s.taxRed||0))*100)/100;
        s.cash=Math.round((s.cash+proc-tax)*100)/100;
        s.ch[item.id]=held-q;if((s.ch[item.id]||0)<=0)delete s.ch[item.id];
        toast_("Sold "+q+" "+item.u+" · CGT: "+fm(tax));
      }
    }else if(type==="cryp"){
      if(isBuy){
        const cost=Math.round(q*item.p*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.crh[item.id]=(s.crh[item.id]||0)+q;
        s.avgCr[item.id]=item.p;
        s.cash=Math.round((s.cash-cost)*100)/100;
        toast_("Bought "+q+" "+item.id+" @ "+fm(item.p));
      }else{
        const held=s.crh[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(q*item.p*100)/100;
        const profit=Math.max(0,(item.p-(s.avgCr[item.id]||item.p))*q);
        const tax=Math.round(profit*.20*(1-(s.taxRed||0))*100)/100;
        s.cash=Math.round((s.cash+proc-tax)*100)/100;
        s.crh[item.id]=held-q;if((s.crh[item.id]||0)<=0)delete s.crh[item.id];
        toast_("Sold "+q+" "+item.id+" · CGT: "+fm(tax));
      }
    }else if(type==="bond"){
      const pr=gBP(item);
      if(isBuy){
        const cost=Math.round(pr*q*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.bh[item.id]=(s.bh[item.id]||0)+q;
        s.cash=Math.round((s.cash-cost)*100)/100;
        toast_("Bought "+q+"× "+item.n+" @ "+fm(pr));
      }else{
        const held=s.bh[item.id]||0;if(q>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(pr*q*100)/100;
        s.cash=Math.round((s.cash+proc)*100)/100;
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
        {[["Cash",fm(d.cash)],["Stocks",fm(sv)],["Bonds",fm(bv)],["Comm.",fm(cv)],["Crypto",fm(crv)],["GSF",fm(d.gsfDep||0)]].map(([k,v])=><div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:8,opacity:.5,textTransform:"uppercase"}}>{k}</div><div style={{fontSize:10,fontWeight:700,fontFamily:"monospace",marginTop:2}}>{v}</div></div>)}
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
        <div style={{background:"#f8fbf8",borderRadius:10,padding:13,fontSize:13,color:"#555",lineHeight:1.7}}>{c.desc}</div>
        {held>0&&<div style={{background:"#E8F5E9",borderRadius:12,padding:13,border:"1px solid #A5D6A7"}}>
          <div style={{fontSize:12,fontWeight:700,color:G,marginBottom:10}}>Your Position</div>
          <div style={{display:"flex",gap:8}}><SB l="Shares" v={held.toLocaleString()} c={G}/><SB l="Value" v={fm(c.price*held)} c={G}/><SB l="Avg Cost" v={fm(avgC)}/><SB l="P&L" v={(pl>=0?"+":"")+fm(pl)} c={pl>=0?G:R}/></div>
          <div style={{fontSize:11,color:"#888",marginTop:8}}>CGT {(20*(1-(d.taxRed||0))).toFixed(0)}% on profit only. Loss sales = $0 tax.</div>
        </div>}
        <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Financials (Estimated)</div>
          {[["EPS",fm(eps)],["P/E Ratio",c.pe.toFixed(1)+"×"],["P/E Bounds",bnd.mn+"–"+bnd.mx+"×"],["Dividend Yield",c.div+"%"],["Beta",c.b+"×"]].map(([k,v])=><Row key={k} k={k} v={v}/>)}
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

  const S_Fx=<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
    <div style={{background:"#E3F2FD",borderRadius:11,padding:12,border:"1px solid #BBDEFB",fontSize:12,color:BL,lineHeight:1.6}}>Forex · Go Long (buy base) or Short (sell base) · USD/AED 3.6735 locked · USD/CNY 6.8 locked · P&L realised on close</div>
    <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
      {d.fx.map((fx,i)=>{
        const pos=FXP[fx.id];
        const pnl=pos?(pos.side==="long"?(fx.p-pos.entry)*pos.units:(pos.entry-fx.p)*pos.units):0;
        return <div key={fx.id} style={{padding:"13px 14px",borderBottom:i<d.fx.length-1?"1px solid #f5f5f5":"none"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <div><div style={{fontSize:14,fontWeight:700,color:DK}}>{fx.n}</div>{fx.locked&&<span style={{fontSize:10,color:"#aaa",fontWeight:600}}>LOCKED — info only</span>}</div>
            <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,fontFamily:"monospace",color:fx.locked?"#999":(fx.ch||0)>=0?G:R}}>{fx.p.toFixed(4)}</div>{!fx.locked&&<Bdg v={fx.ch||0}/>}</div>
          </div>
          <div style={{height:24,marginBottom:8}}><MiniC hist={fx.hist} w={200} h={24}/></div>
          {pos&&<div style={{background:pnl>=0?"#E8F5E9":"#FFEBEE",borderRadius:8,padding:"8px 11px",marginBottom:8,fontSize:12,fontFamily:"monospace",color:pnl>=0?G:R,fontWeight:700}}>
            {pos.side.toUpperCase()} {pos.units.toLocaleString()} lots @ {pos.entry.toFixed(4)} · P&L: {pnl>=0?"+":""}{fm(pnl)}
          </div>}
          {!fx.locked&&<div style={{display:"flex",gap:6}}>
            {!pos&&<>
              <button onClick={()=>{const s=S.current,u=1000,cost=Math.round(u*fx.p*100)/100;if(cost>s.cash){toast_("Insufficient cash",false);return;}s.cash=Math.round((s.cash-cost)*100)/100;s.fxPos[fx.id]={units:u,entry:fx.p,side:"long",cost};toast_("Long 1K lots "+fx.id+" @ "+fx.p.toFixed(4));refresh();}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Long 1K</button>
              <button onClick={()=>{const s=S.current,u=10000,cost=Math.round(u*fx.p*100)/100;if(cost>s.cash){toast_("Insufficient cash",false);return;}s.cash=Math.round((s.cash-cost)*100)/100;s.fxPos[fx.id]={units:u,entry:fx.p,side:"long",cost};toast_("Long 10K lots "+fx.id);refresh();}} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Long 10K</button>
              <button onClick={()=>{const s=S.current,u=1000,cost=Math.round(u*fx.p*100)/100;if(cost>s.cash){toast_("Insufficient cash",false);return;}s.cash=Math.round((s.cash-cost)*100)/100;s.fxPos[fx.id]={units:u,entry:fx.p,side:"short",cost};toast_("Short 1K lots "+fx.id);refresh();}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Short 1K</button>
            </>}
            {pos&&<button onClick={()=>{const s=S.current,pos2=s.fxPos[fx.id],pnl2=pos2.side==="long"?(fx.p-pos2.entry)*pos2.units:(pos2.entry-fx.p)*pos2.units;const ret=Math.round((pos2.cost+pnl2)*100)/100;s.cash=Math.round((s.cash+ret)*100)/100;delete s.fxPos[fx.id];toast_("Closed "+fx.id+" · P&L: "+(pnl2>=0?"+":"")+fm(pnl2));refresh();}} style={{flex:1,background:pnl>=0?G:R,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Close ({pnl>=0?"+":""}{fm(pnl)})</button>}
          </div>}
        </div>;
      })}
    </div>
  </div>;

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
        <div style={{fontSize:11,opacity:.75,marginTop:3}}>S:{fm(sv)} · B:{fm(bv)} · C:{fm(cv)} · Cr:{fm(crv)} · GSF:{fm(d.gsfDep||0)} · Cash:{fm(d.cash)}</div>
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
        {(d.gsfDep||0)>0&&<button onClick={()=>{const s=S.current;const amt=s.gsfDep;s.cash=Math.round((s.cash+amt)*100)/100;s.gsfDep=0;s.news.unshift({id:Math.random(),t:s.turn,ico:"🏛️",ti:"GSF Withdrawal",bo:fm(amt)+" withdrawn to cash.",g:true});toast_("Withdrawn "+fm(amt)+" from GSF");refresh();}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>Withdraw All</button>}
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
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><SB l="Net Worth" v={fm(nw)} c={G}/><SB l="Cash" v={fm(d.cash)}/><SB l="Stock Value" v={fm(sv)} c={G}/><SB l="GSF Deposit" v={fm(d.gsfDep||0)} c={BL}/><SB l="Events" v={d.aevts.length} c={d.aevts.length>0?AU:G}/><SB l="Eff. CGT" v={(20*(1-(d.taxRed||0))).toFixed(0)+"%"} c={G}/></div>
    </div>
    <div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{fontSize:14,fontWeight:700,color:DK,marginBottom:10}}>🏁 Milestones</div>
      {[{n:"M1 — Turn 100",d:d.turn>=100,ds:"Governor stable"},{n:"M2 — Turn 300",d:d.turn>=300,ds:"Solar window"},{n:"M3 — Turn 500",d:d.turn>=500,ds:"Full DEE"},{n:"M4 — Turn 1000",d:d.turn>=1000,ds:"LAUNCH GATE"}].map(m=><div key={m.n} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}><div style={{width:28,height:28,borderRadius:8,background:m.d?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,border:m.d?"1px solid #A5D6A7":"1px solid #e0e0e0"}}>{m.d?"✅":"🔒"}</div><div><div style={{fontSize:13,fontWeight:700,color:m.d?G:DK}}>{m.n}</div><div style={{fontSize:11,color:"#bbb"}}>{m.ds}</div></div></div>)}
    </div>
    <div style={{background:"#fff",borderRadius:13,padding:14,border:"1px solid #e8ebe8"}}>
      <div style={{fontSize:14,fontWeight:700,color:DK,marginBottom:4}}>🔴 Beta Error Log (PIN: 9000)</div>
      {!beta?<button onClick={()=>{const i=window.prompt("PIN:");if(i==="9000"){setBeta(true);toast_("Beta unlocked");}else if(i)toast_("Wrong PIN",false);}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>🔐 Enter PIN</button>
      :<div><div style={{maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:4,marginBottom:8}}>
        {d.elog.map((e,i)=><div key={i} style={{padding:"4px 8px",borderRadius:4,fontSize:10,fontFamily:"monospace",background:"#E8F5E9",color:G,borderLeft:"3px solid "+G}}>[T-{e.t}] {e.sc}: {e.msg}</div>)}
      </div><button onClick={()=>{const txt=d.elog.map(e=>"[T-"+e.t+"] "+e.sc+": "+e.msg).join("\n");const blob=new Blob(["GR v7 LOG\nTurn: "+d.turn+"\nNW: "+fm(nw)+"\n\n"+txt],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="GR_v7_T"+d.turn+".txt";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);toast_("Downloaded");}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>⬇ Download Log</button></div>}
    </div>
  </div>;

  const screenMap={dash:S_Dash,mkt:S_Mkt,co:Co_,comm:S_Comm,cryp:S_Cryp,fx:S_Fx,bonds:S_Bonds,port:S_Port,ph:S_Give,gsf:S_GSF,sol:S_Sol,news:S_News,set:S_Set};

  // ── TRADE MODAL ───────────────────────────────────────────────
  const TrModal=(()=>{
    if(!trM)return null;
    const{type,item,mode}=trM,isBuy=mode==="buy";
    let price=0,unit="",held=0,maxQty=0;
    if(type==="stock"){price=item.price;unit="shares";held=SH[item.t]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
    else if(type==="comm"){price=item.p;unit=item.u;held=CH[item.id]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
    else if(type==="cryp"){price=item.p;unit=item.u;held=CRH[item.id]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
    else if(type==="bond"){price=gBP(item);unit="bonds";held=BH[item.id]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
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
        <div style={{fontSize:12,opacity:.85,marginTop:3}}>{fm(price)} per {unit} · {isBuy?fm(d.cash)+" available · can buy "+maxQty.toLocaleString()+" "+unit:held.toLocaleString()+" "+unit+" held"}</div>
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
      </div>:<div style={{background:"#FFF8E1",borderRadius:9,padding:11,marginBottom:12,fontSize:12,color:"#E65100"}}>{isBuy?"⚠️ Not enough cash — need at least "+fm(price)+" for 1 "+unit:"⚠️ Nothing held to sell."}</div>}
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
        <div><div style={{fontSize:15,fontWeight:800,color:DK,lineHeight:1}}>Galactic Raider</div><div style={{fontSize:9,color:"#bbb"}}>Capital Exchange · v8 · Spec Build</div></div>
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
        <div style={{fontSize:12,color:"#888",marginBottom:5}}>Cash: {fm(d.cash)} · Each donation = CGT −5% on profit (max 25%)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
          {[1000,5000,10000,50000,100000,500000,1000000,Math.min(Math.floor(d.cash/1000)*1000,d.cash)].filter((v,i,a)=>v<=d.cash&&v>0&&a.indexOf(v)===i).slice(-8).map(v=><button key={v} onClick={()=>setDonAmt(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(donAmt===v?"#880E4F":"#e0e0e0"),background:donAmt===v?"#FCE4EC":"#fafafa",color:donAmt===v?"#880E4F":"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(v)}</button>)}
        </div>
        {donAmt&&donAmt>0&&<div style={{background:"#f8fbf8",borderRadius:10,padding:12,marginBottom:12}}><Row k="Donation" v={fm(donAmt)} vc="#880E4F" b/><Row k="New CGT rate" v={(20*(1-((d.taxRed||0)+0.05))).toFixed(0)+"% on profit"} vc={G}/></div>}
        <button onClick={()=>{
          if(!donAmt||donAmt<1000000){toast_("Min donation $1M",false);return;}
          if(donAmt>d.cash){toast_("Insufficient cash",false);return;}
          const s=S.current;
          const SP={Healthcare:{r:.20,dur:3},Education:{r:.25,dur:5},Environment:{r:.30,dur:7},Infrastructure:{r:.15,dur:4},Poverty:{r:.20,dur:3},Science:{r:.25,dur:5},Arts:{r:.10,dur:2},Disaster:{r:.35,dur:8}};
          const sp=SP[donM]||{r:.20,dur:3};
          s.cash=Math.round((s.cash-donAmt)*100)/100;
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
        <div style={{fontSize:12,color:"#888",marginBottom:12}}>Rate: {(d.gsf||12.48).toFixed(2)}%/yr · Cash: {fm(d.cash)} · Per turn after: {fm(((d.gsfDep||0)+(gsfAmt||0))*((d.gsf||12.48)/100/365))}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
          {[1000,5000,10000,50000,100000,500000,1000000,Math.min(Math.floor(d.cash/1000)*1000,d.cash)].filter((v,i,a)=>v<=d.cash&&v>0&&a.indexOf(v)===i).slice(-8).map(v=><button key={v} onClick={()=>setGsfAmt(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(gsfAmt===v?BL:"#e0e0e0"),background:gsfAmt===v?"#E3F2FD":"#fafafa",color:gsfAmt===v?BL:"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(v)}</button>)}
        </div>
        {gsfAmt&&gsfAmt>0&&<div style={{background:"#E3F2FD",borderRadius:10,padding:12,marginBottom:12}}><Row k="Deposit" v={fm(gsfAmt)} vc={BL} b/><Row k="New per-turn return" v={fm(((d.gsfDep||0)+gsfAmt)*((d.gsf||12.48)/100/365))} vc={G}/></div>}
        <button onClick={()=>{if(!gsfAmt||gsfAmt<1||gsfAmt>d.cash){toast_("Select amount",false);return;}const s=S.current;s.cash=Math.round((s.cash-gsfAmt)*100)/100;s.gsfDep=(s.gsfDep||0)+gsfAmt;toast_("Deposited "+fm(gsfAmt)+" → "+fm(s.gsfDep*(s.gsf/100/365))+"/turn");setGsfM(false);setGsfAmt(null);refresh();}} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:14,cursor:"pointer"}}>🏛️ Confirm{gsfAmt?" — "+fm(gsfAmt):""}</button>
      </div>
    </div>}
    {/* Quiz */}
    {quizM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:15}}>
      <div style={{background:"#fff",borderRadius:18,padding:20,width:"100%",maxWidth:430,maxHeight:"87vh",overflowY:"auto"}}>
        <div style={{fontSize:11,color:"#bbb",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Module {quizM.id}/15</div>
        <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:14}}>{quizM.n}</div>
        <div style={{background:"#f8fbf8",borderRadius:10,padding:13,fontSize:13,color:"#444",lineHeight:1.7,marginBottom:14}}><strong>Scenario:</strong> {quizM.q}</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
          {quizM.opts.map((o,i)=><button key={i} onClick={()=>setQuizA(i)} style={{padding:"12px 14px",borderRadius:10,border:"2px solid "+(quizA===i?G:"#e0e0e0"),textAlign:"left",background:quizA===i?"#E8F5E9":"#fafafa",color:quizA===i?G:"#333",fontWeight:quizA===i?700:400,fontSize:13,cursor:"pointer"}}><span style={{fontWeight:700,marginRight:8,color:quizA===i?G:"#bbb"}}>{["A","B","C","D"][i]}.</span>{o}</button>)}
        </div>
        {quizA!==null&&<div style={{background:quizA===quizM.ans?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:13,marginBottom:13,fontSize:12,lineHeight:1.7,color:quizA===quizM.ans?G:R}}>{quizA===quizM.ans?"✅ Correct! ":"❌ Incorrect. "}{quizM.exp}</div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setQuizM(null);setQuizA(null);}} style={{flex:1,padding:"12px 0",borderRadius:10,border:"1.5px solid #e0e0e0",background:"#f5f5f5",color:"#666",fontWeight:700,fontSize:13,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>{S.current.news.unshift({id:Math.random(),t:d.turn,ico:"🎓",ti:"Module: "+quizM.n,bo:"Completed.",g:true});toast_(quizM.n+" done!");setQuizM(null);setQuizA(null);refresh();}} style={{flex:2,padding:"12px 0",borderRadius:10,border:"none",background:G,color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}}>✓ Complete</button>
        </div>
      </div>
    </div>}
    <style>{"@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{display:none}button{outline:none;font-family:inherit}"}</style>
  </div>;
}
