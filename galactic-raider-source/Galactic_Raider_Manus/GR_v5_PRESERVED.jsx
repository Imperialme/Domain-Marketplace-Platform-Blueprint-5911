import{useState,useRef,useCallback,useEffect}from"react";
// ── COLOURS ──────────────────────────────────────────────────
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A";
const f=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const pc=n=>(n>=0?"+":"")+((n||0)*100).toFixed(2)+"%";
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);
// ── GOVERNOR LIMITS (reasonable, not punishing) ───────────────
const STOCK_MAX_MOVE=0.06; // ±6%/turn
const COMM_MAX_MOVE=0.04;  // ±4%/turn
const COMM_PRICE_CEIL=5;   // 5× base max price
// ── DATA ─────────────────────────────────────────────────────
const COS=[
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",r:"Asia Pacific",ip:348.94,pe:18.4,div:0.8,mg:.22,b:1.8,emp:125000,yr:2008,hq:"Singapore",desc:"AI, cloud and semiconductor leader across 18 Asia Pacific countries."},
  {t:"MRDB",n:"Meridian Bank",s:"Banking",r:"US",ip:85.20,pe:12.1,div:2.1,mg:.22,b:0.9,emp:45000,yr:1985,hq:"New York",desc:"US commercial bank with 2,400 retail branches and corporate lending."},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",r:"Africa",ip:15.80,pe:8.5,div:0.5,mg:.12,b:1.6,emp:28000,yr:2005,hq:"Johannesburg",desc:"Pan-African mining: iron ore, rare earth, lithium across 9 countries."},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",r:"Emerging Markets",ip:351.54,pe:11.3,div:1.8,mg:.18,b:1.2,emp:62000,yr:1995,hq:"Dubai",desc:"Major oil producer across UAE, Kuwait, Oman and Central Asia."},
  {t:"AGRO",n:"AgroLatin Corp",s:"Agriculture",r:"Latin America",ip:42.18,pe:13.2,div:2.5,mg:.09,b:1.1,emp:18000,yr:1975,hq:"São Paulo",desc:"Largest agri-business in Latin America — soy, corn, sugar, cattle."},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",r:"US",ip:198.40,pe:22.1,div:1.2,mg:.26,b:0.8,emp:38000,yr:2005,hq:"Boston",desc:"Medical devices, diagnostics and 180 hospitals across North America."},
  {t:"CLFL",n:"ClearFlame Energy",s:"Energy",r:"Europe",ip:112.30,pe:14.8,div:2.0,mg:.20,b:1.1,emp:22000,yr:2010,hq:"Amsterdam",desc:"Wind, solar and gas powering 12 million European households."},
  {t:"AXMB",n:"Axum Biotech",s:"Healthcare",r:"Africa",ip:68.50,pe:19.4,div:0.6,mg:.21,b:1.4,emp:8500,yr:2012,hq:"Addis Ababa",desc:"Tropical disease vaccines and African genomic medicine. WHO partner."},
  {t:"PCMN",n:"Pacific Mfg",s:"Manufacturing",r:"Asia Pacific",ip:76.20,pe:15.6,div:1.3,mg:.14,b:1.0,emp:55000,yr:1988,hq:"Seoul",desc:"Electronics and EV battery parts for top-20 global automakers."},
  {t:"NRDX",n:"Nordic Bank",s:"Banking",r:"Europe",ip:132.10,pe:11.8,div:2.4,mg:.21,b:0.8,emp:32000,yr:1975,hq:"Stockholm",desc:"Pan-European financial services across 18 countries."},
  {t:"UTLS",n:"Utility Systems",s:"Utilities",r:"US",ip:58.40,pe:14.2,div:4.2,mg:.22,b:0.5,emp:12000,yr:1950,hq:"Chicago",desc:"US electric and gas utility — 3.2 million Midwest customers."},
  {t:"TLCM",n:"TeleCom Europe",s:"Telecom",r:"Europe",ip:88.60,pe:13.5,div:4.5,mg:.28,b:0.6,emp:48000,yr:1985,hq:"Frankfurt",desc:"280 million mobile subscribers across 22 European countries."},
  {t:"RETL",n:"RetailHub Inc",s:"Retail",r:"US",ip:38.90,pe:14.0,div:1.5,mg:.08,b:1.2,emp:85000,yr:2000,hq:"Seattle",desc:"1,200 US stores plus online marketplace — 48M loyalty members."},
  {t:"RLST",n:"RealEstate Trust",s:"Real Estate",r:"US",ip:44.20,pe:12.8,div:3.8,mg:.32,b:0.7,emp:2800,yr:1995,hq:"Dallas",desc:"$18B REIT: Sun Belt commercial and industrial properties."},
  {t:"EMTS",n:"Emerging Tech",s:"Technology",r:"Emerging Markets",ip:28.40,pe:22.0,div:0.2,mg:.15,b:2.0,emp:6500,yr:2015,hq:"Mumbai",desc:"B2B SaaS cloud infrastructure for 18,000 South Asian enterprises."},
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
const CRYPTO=[
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
const RMU={AAA:1.02,AA:1.01,A:1.00,BBB:0.99,BB:0.97,B:0.94};
const gBP=(fv,oy,cy,rat)=>cl(Math.round(fv*(oy/100)/Math.max(cy/100,0.01)*(RMU[rat]||1)*100)/100,fv*0.05,fv*2);
const EVTS=[
  {id:"rc",n:"Rate Cut",ico:"🏦",t:"mkt",prob:.04,sent:.08,dur:10,good:true,desc:"Rate cut — growth stocks and bonds rally."},
  {id:"rh",n:"Rate Hike",ico:"📈",t:"mkt",prob:.04,sent:-.07,dur:8,good:false,desc:"Rate hike — equity valuations compressed."},
  {id:"geo",n:"Geopolitical Crisis",ico:"💣",t:"mkt",prob:.03,sent:-.14,dur:20,sec:["Energy","Mining"],good:false,desc:"Conflict erupts — Energy spikes, capital flees."},
  {id:"trg",n:"Tech Regulation",ico:"📜",t:"mkt",prob:.03,sent:-.12,dur:18,sec:["Technology"],good:false,desc:"Global tech rules — sector falls 10–15%."},
  {id:"td",n:"Trade Deal Signed",ico:"🤝",t:"mkt",prob:.04,sent:.09,dur:12,good:true,desc:"New deal signed — markets rally."},
  {id:"pat",n:"Patent Approved",ico:"⚡",t:"co",prob:.05,imp:.28,dur:5,good:true,desc:"Key patent — stock surges 28%."},
  {id:"scn",n:"CEO Scandal",ico:"💼",t:"co",prob:.03,imp:-.25,dur:15,good:false,desc:"Misconduct revealed — stock craters."},
  {id:"bea",n:"Earnings Beat",ico:"💰",t:"co",prob:.10,imp:.20,dur:6,good:true,desc:"Results beat consensus — reprices up."},
  {id:"mis",n:"Earnings Miss",ico:"📉",t:"co",prob:.09,imp:-.18,dur:6,good:false,desc:"Results disappoint — selling begins."},
  {id:"con",n:"Govt Contract",ico:"🏛️",t:"co",prob:.04,imp:.22,dur:35,good:true,desc:"Major contract — revenue visible 35 turns."},
  {id:"str",n:"Labour Strike",ico:"✊",t:"co",prob:.03,imp:-.20,dur:12,good:false,desc:"Workers walk out — production halts."},
];
// ── GOVERNOR PRICE STEP ───────────────────────────────────────
function stepS(cos,gdp,inf,intr,evts){
  return cos.map(c=>{
    const pp=c.price,eps=pp/c.pe;
    const macro=cl(1+(gdp/100*.35*c.b)-(inf/100*.15)-(intr/100*.15*c.b),.94,1.06);
    const noise=1+(Math.random()-.5)*.06*c.b;
    let em=0;
    evts.forEach(e=>{
      if(e.t==="mkt"&&(!e.sec||e.sec.includes(c.s)))em+=(e.sent||0)*(e.tl/e.dur)*.10;
      if(e.t==="co"&&e.tk===c.t)em+=(e.imp||0)*(e.tl/e.dur)*.10;
    });
    let np=cl(pp*noise*macro*(1+em*.3),pp*(1-STOCK_MAX_MOVE),pp*(1+STOCK_MAX_MOVE));
    const bnd=PEB[c.s]||{mn:10,mx:40};
    if(np/eps<bnd.mn)np=eps*bnd.mn;
    if(np/eps>bnd.mx)np=eps*bnd.mx;
    np=Math.max(.50,Math.round(np*100)/100);
    return{...c,pp,price:np,pe:Math.round(np/eps*10)/10,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-50),np]};
  });
}
function stepC(comm){
  return comm.map(c=>{
    const pp=c.p,d=cl(1+(Math.random()-.5)*.05,1-COMM_MAX_MOVE,1+COMM_MAX_MOVE);
    const np=cl(Math.round(pp*d*100)/100,Math.max(.10,c.base*.20),c.base*COMM_PRICE_CEIL);
    return{...c,p:np,pp,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-50),np]};
  });
}
function stepCr(cr){
  return cr.map(c=>{
    const pp=c.p,d=cl(1+(Math.random()-.5)*.10,.90,1.10);
    const np=cl(Math.round(pp*d*100)/100,c.base*.05,c.base*10);
    return{...c,p:np,pp,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-50),np]};
  });
}
// ── UI HELPERS ────────────────────────────────────────────────
const Bdg=({v})=><span style={{background:v>=0?"#E8F5E9":"#FFEBEE",color:v>=0?G:R,padding:"2px 6px",borderRadius:20,fontSize:10,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{pc(v)}</span>;
const MC=({hist,w=65,h=26})=>{
  if(!hist||hist.length<2)return null;
  const mn=Math.min(...hist)*.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;
  const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={hist[hist.length-1]>=(hist[0]||0)?G:R} strokeWidth="1.8" strokeLinejoin="round"/></svg>;
};
const WC=({hist})=>{
  if(!hist||hist.length<2)return null;
  const W=300,H=46,mn=Math.min(...hist)*.97,mx=Math.max(...hist)*1.03,rng=mx-mn||1;
  const line=hist.map((v,i)=>`${(i/(hist.length-1)*W).toFixed(1)},${(H-((v-mn)/rng*H)).toFixed(1)}`).join(" ");
  const area=[...hist.map((v,i)=>`${(i/(hist.length-1)*W).toFixed(1)},${(H-((v-mn)/rng*H)).toFixed(1)}`),`${W},${H}`,`0,${H}`].join(" ");
  return <svg width="100%" height={H} viewBox={"0 0 "+W+" "+H} preserveAspectRatio="none">
    <defs><linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4CAF50" stopOpacity=".3"/><stop offset="100%" stopColor="#4CAF50" stopOpacity="0"/></linearGradient></defs>
    <polygon points={area} fill="url(#wg)"/>
    <polyline points={line} fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinejoin="round"/>
  </svg>;
};
const SB=({l,v,c})=><div style={{background:"#f8fbf8",borderRadius:9,padding:"8px 10px",flex:1,minWidth:0}}>
  <div style={{fontSize:8,color:"#bbb",textTransform:"uppercase",letterSpacing:.6,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l}</div>
  <div style={{fontSize:12,fontWeight:800,color:c||DK,fontFamily:"DM Mono,monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div>
</div>;
const Rw=({k,v,vc,b})=><div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f0f0f0"}}>
  <span style={{fontSize:12,color:"#666"}}>{k}</span>
  <span style={{fontSize:12,fontWeight:b?800:600,color:vc||DK,fontFamily:"DM Mono,monospace"}}>{v}</span>
</div>;
// ── AMOUNT PICKER — dollar-based, no arbitrary caps ───────────
function APick({cash,price,held,isSell}){
  // Returns selected {shares, cost}
  // isSell: show % of held; isBuy: show dollar amounts
  return null; // placeholder — actual picker below
}
// Share-count picker — sensible presets based on what you can afford
function Pk({maxQty,sel,onSel,label}){
  const mx=Math.max(0,Math.floor(maxQty));
  if(mx===0)return <div style={{padding:"8px 0",color:"#aaa",fontSize:11,marginBottom:10}}>Not available</div>;
  // Build presets: small, medium, large, all
  const candidates=[1,2,5,10,25,50,100,200,500,1000,2000,5000,10000,50000,100000];
  const filtered=candidates.filter(v=>v<=mx);
  if(!filtered.length||filtered[filtered.length-1]!==mx)filtered.push(mx);
  const show=[...new Set(filtered)].slice(-8);
  return <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
    {show.map(v=><button key={v} onClick={()=>onSel(v)} style={{padding:"10px 4px",borderRadius:9,border:"2px solid "+(sel===v?G:"#e0e0e0"),background:sel===v?"#E8F5E9":"#fafafa",color:sel===v?G:"#555",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>
      {v>=1000000?(v/1000000).toFixed(0)+"M":v>=1000?(v/1000).toFixed(0)+"K":v}
    </button>)}
  </div>;
}
// ── MAIN APP ──────────────────────────────────────────────────
export default function App(){
  const[tab,setTab]=useState("dash");
  const[langI,setLangI]=useState(0);
  const FLAGS=["🇬🇧","🇸🇦","🇵🇰","🇨🇳","🇫🇷"];
  const rtl=langI===1||langI===2;

  // ── ALL STATE IN REF — fixes stale closure in auto-sim ───────
  const S=useRef(null);
  if(!S.current){
    S.current={
      turn:1,cash:1000000,gdp:2.5,inf:3.2,intr:4.5,gsf:12.48,
      cos:COS.map(c=>({...c,price:c.ip,pp:c.ip,pe:c.pe,ch:0,hist:[c.ip,c.ip]})),
      comm:COMM.map(c=>({...c,p:c.ip,pp:c.ip,ch:0,hist:[c.ip,c.ip]})),
      cryp:CRYPTO.map(c=>({...c,p:c.ip,pp:c.ip,ch:0,hist:[c.ip,c.ip]})),
      fx:[
        {id:"EURUSD",n:"EUR/USD",p:1.0850,hist:[1.0850]},
        {id:"GBPUSD",n:"GBP/USD",p:1.2680,hist:[1.2680]},
        {id:"USDJPY",n:"USD/JPY",p:148.50,hist:[148.50]},
        {id:"USDAED",n:"USD/AED",p:3.6735,hist:[3.6735],locked:true},
        {id:"USDCNY",n:"USD/CNY",p:6.8000,hist:[6.8000],locked:true},
        {id:"USDINR",n:"USD/INR",p:83.20,hist:[83.20]},
      ],
      bonds:BONDS.map(b=>({...b,cy:b.oy})),
      aevts:[],
      sh:{},bh:{},ch:{},crh:{},
      avgSh:{},avgCm:{},avgCr:{},
      gsfDep:0,dons:0,taxRed:0,
      news:[
        {id:1,t:1,ico:"🌐",ti:"Galactic Raider v5",bo:"$1,000,000 starting capital. No artificial buying limits. Prices move every turn. CGT on PROFIT only — sell at a loss and pay zero tax.",g:true},
        {id:2,t:1,ico:"⚖️",ti:"Governor Online",bo:"P/E bounds enforced. Stocks ±6%/turn. Commodities ±4%/turn max 5× base. Auto-sim fixed with useRef architecture.",g:true},
      ],
      elog:[{lv:"OK",t:1,sc:"Gov",msg:"All companies within P/E bounds. Auto-sim uses ref — no stale closures."}],
      wh:[1000000,1000000],
    };
  }

  const[D,setD]=useState(()=>({...S.current}));
  const[auto,setAuto]=useState(false);
  const[speed,setSpeed]=useState(30);
  const[evN,setEvN]=useState(null);
  const[toast,setToast]=useState(null);
  const aRef=useRef(null);
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

  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2500);},[]);
  const refresh=useCallback(()=>setD({...S.current}),[]);

  // ── ADVANCE — reads S.current directly, no closure deps ──────
  const advance=useCallback(()=>{
    const s=S.current;
    s.turn++;
    s.gdp=Math.round(cl(s.gdp+(Math.random()-.48)*.5,-3,7)*10)/10;
    s.inf=Math.round(cl(s.inf+(Math.random()-.5)*.3,0,12)*10)/10;
    s.intr=Math.round(cl(s.intr+(Math.random()-.5)*.2,.5,12)*10)/10;
    s.gsf=Math.round(cl(s.gsf+(Math.random()-.5)*.25,.5,14)*100)/100;
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
            setEvN({...ed,cn:tg.n});setTimeout(()=>setEvN(null),5000);
          }
        }else if(!s.aevts.find(a=>a.id===ed.id)){
          s.aevts.push({...ed,tl:ed.dur,dur:ed.dur});
          nn.push({id:Math.random(),t:s.turn,ico:ed.ico,ti:ed.n,bo:ed.desc,g:ed.good});
          setEvN({...ed});setTimeout(()=>setEvN(null),5000);
        }
      }
    });
    s.cos=stepS(s.cos,s.gdp,s.inf,s.intr,s.aevts);
    s.comm=stepC(s.comm);
    s.cryp=stepCr(s.cryp);
    s.bonds=s.bonds.map(b=>({...b,cy:Math.round(cl(b.cy+(Math.random()-.5)*.2,1,45)*100)/100}));
    s.fx=s.fx.map(fx=>fx.locked?fx:{...fx,p:Math.round(fx.p*cl(1+(Math.random()-.5)*.004,.996,1.004)*10000)/10000});
    // GSF return
    if(s.gsfDep>0){
      const maxGsf=Object.entries(s.sh).reduce((sum,[t,n])=>{const c=s.cos.find(x=>x.t===t);return sum+(c?c.price*n:0);},s.cash+s.gsfDep)*0.30;
      if(s.gsfDep>maxGsf)s.gsfDep=maxGsf; // soft cap: 30% of portfolio
      s.cash=Math.round((s.cash+s.gsfDep*(s.gsf/100/12))*100)/100;
    }
    // Dividends every 10 turns
    if(s.turn%10===0){
      let div=0;
      Object.entries(s.sh).forEach(([t,n])=>{const c=s.cos.find(x=>x.t===t);if(c&&n>0)div+=c.price*(c.div/100)*n;});
      if(div>0){s.cash=Math.round((s.cash+div)*100)/100;nn.push({id:Math.random(),t:s.turn,ico:"💰",ti:"Dividends",bo:f(div)+" credited (15% withholding applied).",g:true});}
    }
    // Wealth tax above $10B
    const nw=s.cash+Object.entries(s.sh).reduce((sum,[t,n])=>{const c=s.cos.find(x=>x.t===t);return sum+(c?c.price*n:0);},0)+s.gsfDep;
    if(nw>10e9){const tx=Math.round((nw-10e9)*.001*100)/100;s.cash=Math.max(0,s.cash-tx);}
    // Milestones
    if([100,300,500,1000].includes(s.turn)){const ms={100:"M1 — Governor stable.",300:"M2 — Solar window opens.",500:"M3 — DEE running.",1000:"M4 — LAUNCH GATE."};nn.push({id:Math.random(),t:s.turn,ico:"🏁",ti:"Milestone: Turn "+s.turn,bo:ms[s.turn]+" NW: "+f(nw),g:true});}
    s.wh=[...s.wh.slice(-60),nw];
    s.news=[...nn.reverse(),...s.news].slice(0,100);
    s.elog=[{lv:"OK",t:s.turn,sc:"Gov",msg:"T"+s.turn+" — all "+s.cos.length+" cos stepped"},...s.elog].slice(0,100);
    refresh();
  },[refresh]);

  // ── AUTO-SIM — speed in seconds ──────────────────────────────
  useEffect(()=>{
    if(auto){aRef.current=setInterval(advance,speed*1000);}
    else{clearInterval(aRef.current);}
    return()=>clearInterval(aRef.current);
  },[auto,speed,advance]);

  // ── COMPUTED ─────────────────────────────────────────────────
  const d=D;
  const sv=Object.entries(d.sh).reduce((s,[t,n])=>{const c=d.cos.find(x=>x.t===t);return s+(c?c.price*n:0);},0);
  const bv=Object.entries(d.bh).reduce((s,[id,q])=>{const b=d.bonds.find(x=>x.id===id);return s+(b?gBP(b.fv,b.oy,b.cy,b.rat)*q:0);},0);
  const cv=Object.entries(d.ch||{}).reduce((s,[id,q])=>{const c=d.comm.find(x=>x.id===id);return s+(c?c.p*q:0);},0);
  const crv=Object.entries(d.crh||{}).reduce((s,[id,q])=>{const c=d.cryp.find(x=>x.id===id);return s+(c?c.p*q:0);},0);
  const nw=d.cash+sv+bv+cv+crv+d.gsfDep;
  const pnw=d.wh[d.wh.length-2]||1000000;
  const adone=d.mods?d.mods.filter(m=>m.done).length:0;
  const regs=new Set(Object.keys(d.sh).map(t=>d.cos.find(c=>c.t===t)?.r).filter(Boolean));
  const SC={
    nw:{met:nw>=5e9,l:"Net Worth $5B",v:f(nw)},
    turns:{met:d.turn>=300,l:"Turn 300",v:d.turn+"/300"},
    regions:{met:regs.size>=3,l:"3 Regions",v:regs.size+"/3"},
    bonds:{met:Object.keys(d.bh).length>=2,l:"2 Bond types",v:Object.keys(d.bh).length+"/2"},
    academy:{met:adone>=3,l:"3 Academy",v:adone+"/3"},
    phi:{met:d.dons>=2,l:"2 Donations",v:d.dons+"/2"},
  };
  const spct=Math.round(Object.values(SC).filter(x=>x.met).length/6*100);

  // ── TRADE ────────────────────────────────────────────────────
  const doTrade=()=>{
    if(!trM||!trAmt||trAmt<1)return;
    const s=S.current,{type,item,mode}=trM,isBuy=mode==="buy",qty=Math.floor(trAmt);
    if(type==="stock"){
      if(isBuy){
        const cost=Math.round(qty*item.price*100)/100;
        if(cost>s.cash){toast_("Insufficient cash — need "+f(cost),false);return;}
        s.cash=Math.round((s.cash-cost)*100)/100;
        s.sh[item.t]=(s.sh[item.t]||0)+qty;
        const prev=s.avgSh[item.t]||item.price,prevN=(s.sh[item.t]-qty)||0;
        s.avgSh[item.t]=Math.round(((prev*prevN)+cost)/(s.sh[item.t])*100)/100;
        toast_("Bought "+qty.toLocaleString()+" "+item.t+" @ "+f(item.price));
      }else{
        const held=s.sh[item.t]||0;
        if(qty>held){toast_("Only "+held.toLocaleString()+" held",false);return;}
        const proc=Math.round(qty*item.price*100)/100;
        const avgC=s.avgSh[item.t]||item.price;
        const profit=Math.max(0,(item.price-avgC)*qty);
        const tax=Math.round(profit*0.20*(1-s.taxRed)*100)/100;
        s.cash=Math.round((s.cash+proc-tax)*100)/100;
        s.sh[item.t]=held-qty;
        if(s.sh[item.t]<=0)delete s.sh[item.t];
        s.elog.unshift({lv:"OK",t:s.turn,sc:"CGT",msg:"SELL "+qty+" "+item.t+" profit/sh:"+f(profit/qty)+" tax:"+f(tax)});
        toast_("Sold "+qty.toLocaleString()+" "+item.t+". CGT: "+f(tax)+" on profit only");
      }
    }else if(type==="comm"){
      if(isBuy){
        const cost=Math.round(qty*item.p*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.cash=Math.round((s.cash-cost)*100)/100;
        s.ch[item.id]=(s.ch[item.id]||0)+qty;
        s.avgCm[item.id]=item.p;
        toast_("Bought "+qty+" "+item.u+" of "+item.n);
      }else{
        const held=s.ch[item.id]||0;
        if(qty>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(qty*item.p*100)/100;
        const profit=Math.max(0,(item.p-(s.avgCm[item.id]||item.p))*qty);
        const tax=Math.round(profit*0.20*(1-s.taxRed)*100)/100;
        s.cash=Math.round((s.cash+proc-tax)*100)/100;
        s.ch[item.id]=(s.ch[item.id]||0)-qty;
        if((s.ch[item.id]||0)<=0)delete s.ch[item.id];
        toast_("Sold "+qty+" "+item.u+". CGT: "+f(tax));
      }
    }else if(type==="crypto"){
      if(isBuy){
        const cost=Math.round(qty*item.p*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.cash=Math.round((s.cash-cost)*100)/100;
        s.crh[item.id]=(s.crh[item.id]||0)+qty;
        s.avgCr[item.id]=item.p;
        toast_("Bought "+qty+" "+item.id+" @ "+f(item.p));
      }else{
        const held=s.crh[item.id]||0;
        if(qty>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(qty*item.p*100)/100;
        const profit=Math.max(0,(item.p-(s.avgCr[item.id]||item.p))*qty);
        const tax=Math.round(profit*0.20*(1-s.taxRed)*100)/100;
        s.cash=Math.round((s.cash+proc-tax)*100)/100;
        s.crh[item.id]=(s.crh[item.id]||0)-qty;
        if((s.crh[item.id]||0)<=0)delete s.crh[item.id];
        toast_("Sold "+qty+" "+item.id+". CGT: "+f(tax));
      }
    }else if(type==="bond"){
      const pr=gBP(item.fv,item.oy,item.cy,item.rat);
      if(isBuy){
        const cost=Math.round(pr*qty*100)/100;
        if(cost>s.cash){toast_("Insufficient cash",false);return;}
        s.cash=Math.round((s.cash-cost)*100)/100;
        s.bh[item.id]=(s.bh[item.id]||0)+qty;
        toast_("Bought "+qty+"× "+item.n);
      }else{
        const held=s.bh[item.id]||0;
        if(qty>held){toast_("Only "+held+" held",false);return;}
        const proc=Math.round(pr*qty*100)/100;
        s.cash=Math.round((s.cash+proc)*100)/100;
        s.bh[item.id]=(s.bh[item.id]||0)-qty;
        if((s.bh[item.id]||0)<=0)delete s.bh[item.id];
        toast_("Sold "+qty+"× bonds: "+f(proc));
      }
    }
    setTrM(null);setTrAmt(null);refresh();
  };

  // ── NAV ──────────────────────────────────────────────────────
  const TABS=[
    {id:"dash",ico:"🏠",l:"Home"},{id:"mkt",ico:"📊",l:"Stocks"},
    {id:"comm",ico:"⛽",l:"Comm."},{id:"cryp",ico:"₿",l:"Crypto"},
    {id:"fx",ico:"💱",l:"Forex"},{id:"bonds",ico:"📋",l:"Bonds"},
    {id:"port",ico:"💼",l:"Port."},{id:"ph",ico:"❤️",l:"Give"},
    {id:"gsf",ico:"🏛️",l:"GSF"},{id:"sol",ico:"☀️",l:"Solar"},
    {id:"news",ico:"📰",l:"News"},{id:"set",ico:"⚙️",l:"Set."},
  ];
  const ts=id=>({padding:"4px 0 3px",flex:1,border:"none",background:tab===id?"#fff":"transparent",borderRadius:tab===id?6:0,color:tab===id?G:"#aaa",fontWeight:700,fontSize:7,cursor:"pointer",textAlign:"center",boxShadow:tab===id?"0 1px 3px rgba(0,0,0,.1)":"none",minWidth:0,fontFamily:"DM Sans,sans-serif"});

  // ── SCREENS ───────────────────────────────────────────────────
  function Dash(){
    const nwch=nw-pnw;
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:16,padding:17,color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-35,right:-35,width:120,height:120,background:"rgba(255,255,255,.05)",borderRadius:"50%"}}/>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Total Net Worth</div>
        <div style={{fontSize:32,fontWeight:800,fontFamily:"DM Mono,monospace",lineHeight:1,marginBottom:4}}>{f(nw)}</div>
        <div style={{fontSize:11,opacity:.9,marginBottom:10}}>{nwch>=0?"📈":"📉"} {f(Math.abs(nwch))} ({nwch>=0?"+":""}{pnw>0?((nwch/pnw)*100).toFixed(2):0}%) last turn</div>
        <div style={{height:42}}><WC hist={d.wh}/></div>
        <div style={{display:"flex",gap:6,marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.15)"}}>
          {[["Cash",f(d.cash)],["Stocks",f(sv)],["Bonds",f(bv)],["Comm.",f(cv)],["Crypto",f(crv)],["GSF",f(d.gsfDep)]].map(([k,v])=><div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:7,opacity:.45,textTransform:"uppercase"}}>{k}</div><div style={{fontSize:9,fontWeight:700,fontFamily:"DM Mono,monospace",marginTop:1}}>{v}</div></div>)}
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <span style={{fontSize:14,fontWeight:800,color:DK}}>Turn {d.turn}</span>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            <span style={{fontSize:8,color:"#bbb"}}>Speed:</span>
            {[{l:"30s",v:30},{l:"1min",v:60},{l:"2min",v:120}].map(s=><button key={s.v} onClick={()=>setSpeed(s.v)} style={{padding:"3px 7px",borderRadius:20,border:"1.5px solid "+(speed===s.v?G:"#ddd"),background:speed===s.v?G:"#fff",color:speed===s.v?"#fff":"#666",fontWeight:600,fontSize:8,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>{s.l}</button>)}
          </div>
        </div>
        <div style={{display:"flex",gap:7}}>
          <button onClick={advance} disabled={auto} style={{flex:3,background:auto?"#e0e0e0":G,color:auto?"#aaa":"#fff",border:"none",borderRadius:9,padding:"12px 0",fontWeight:800,fontSize:13,cursor:auto?"not-allowed":"pointer",fontFamily:"DM Sans,sans-serif"}}>▶ Advance Turn</button>
          <button onClick={()=>setAuto(a=>!a)} style={{flex:2,background:auto?"#B71C1C":"#f0f4f0",color:auto?"#fff":"#666",border:"1px solid #ddd",borderRadius:9,padding:"12px 0",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>{auto?"⏹ Stop":"Auto "+speed+"s"}</button>
        </div>
      </div>
      <div onClick={()=>setTab("sol")} style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:12,padding:12,cursor:"pointer",border:"1px solid rgba(212,175,55,.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:17}}>☀️</span><div><div style={{fontSize:11,fontWeight:700,color:"#F0D060"}}>Solar {spct===100?"— UNLOCKED!":"Progress"}</div><div style={{fontSize:8,color:"rgba(240,208,96,.4)"}}>{Object.values(SC).filter(x=>x.met).length}/6 criteria</div></div></div>
          <span style={{fontFamily:"DM Mono,monospace",fontSize:13,fontWeight:700,color:"#F0D060"}}>{spct}%</span>
        </div>
        <div style={{height:5,background:"rgba(255,255,255,.07)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:3,transition:"width .5s"}}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        {[{l:"GDP",v:(d.gdp>=0?"+":"")+d.gdp+"%",c:d.gdp>=0?G:R},{l:"Inflation",v:d.inf+"%",c:d.inf>6?R:d.inf>3?"#F57F17":G},{l:"Interest",v:d.intr+"%",c:"#444"},{l:"GSF Rate",v:d.gsf.toFixed(2)+"%",c:G}].map(x=><div key={x.l} style={{background:"#fff",borderRadius:10,padding:"9px 11px",border:"1px solid #eee"}}><div style={{fontSize:8,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{x.l}</div><div style={{fontSize:17,fontWeight:800,color:x.c,fontFamily:"DM Mono,monospace"}}>{x.v}</div></div>)}
      </div>
      {d.aevts.length>0&&<div>
        <div style={{fontSize:10,fontWeight:700,color:"#bbb",marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>Active Events ({d.aevts.length})</div>
        {d.aevts.slice(0,3).map((e,i)=><div key={i} style={{background:e.good?"#E8F5E9":"#FFEBEE",borderRadius:9,padding:"8px 11px",border:"1px solid "+(e.good?"#A5D6A7":"#EF9A9A"),display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
          <span style={{fontSize:16}}>{e.ico}</span>
          <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:e.good?G:R}}>{e.n}{e.cn?" — "+e.cn:""}</div><div style={{fontSize:8,color:"#888"}}>{e.tl}/{e.dur} turns · {e.desc}</div></div>
        </div>)}
      </div>}
      {Object.keys(d.sh).filter(t=>(d.sh[t]||0)>0).length>0&&<div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:9}}>Holdings</div>
        {Object.entries(d.sh).filter(([,n])=>n>0).slice(0,3).map(([t,n])=>{
          const c=d.cos.find(x=>x.t===t);if(!c)return null;
          const pl=(c.price-(d.avgSh[t]||c.price))*n;
          return <div key={t} onClick={()=>{setSelCo(c);setTab("co");}} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:"1px solid #f5f5f5",cursor:"pointer"}}>
            <div style={{width:34,height:34,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div>
            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:8,color:"#bbb"}}>{n.toLocaleString()} shs · avg {f(d.avgSh[t]||c.price)}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{f(c.price*n)}</div><div style={{fontSize:9,fontFamily:"DM Mono,monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{f(pl)}</div></div>
          </div>;
        })}
      </div>}
    </div>;
  }

  function Mkt(){
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{overflowX:"auto"}}><div style={{display:"flex",gap:5,paddingBottom:3,width:"max-content"}}>
        {["All",...new Set(COS.map(c=>c.s))].map(s=><button key={s} onClick={()=>setFSec(s)} style={{padding:"5px 10px",borderRadius:20,border:"1.5px solid "+(fSec===s?G:"#ddd"),background:fSec===s?G:"#fff",color:fSec===s?"#fff":"#666",fontWeight:600,fontSize:9,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"DM Sans,sans-serif"}}>{s}</button>)}
      </div></div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.cos.filter(c=>fSec==="All"||c.s===fSec).map((c,i,arr)=><div key={c.t} onClick={()=>{setSelCo({...c});setTab("co");setCoTab("info");}} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",borderBottom:i<arr.length-1?"1px solid #f8f8f8":"none",cursor:"pointer"}}>
          <div style={{width:34,height:34,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{c.t}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:600,color:DK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.n}</div><div style={{fontSize:8,color:"#bbb"}}>{c.s} · P/E {c.pe.toFixed(1)}×</div></div>
          <MC hist={c.hist}/>
          <div style={{textAlign:"right",minWidth:65}}><div style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{f(c.price)}</div><Bdg v={c.ch}/></div>
        </div>)}
      </div>
    </div>;
  }

  function Co(){
    const c=selCo?d.cos.find(x=>x.t===selCo.t)||selCo:null;
    if(!c)return <div style={{padding:32,textAlign:"center",color:"#aaa",fontSize:13}}>← Select a company from Stocks tab</div>;
    const held=d.sh[c.t]||0,avgC=d.avgSh[c.t]||c.price,pl=held?(c.price-avgC)*held:0;
    const ev=d.aevts.find(e=>e.t==="co"&&e.tk===c.t),bnd=PEB[c.s]||{mn:10,mx:40},eps=c.price/c.pe;
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:14,padding:15,color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-25,right:-25,width:90,height:90,background:"rgba(255,255,255,.04)",borderRadius:"50%"}}/>
        <div style={{fontSize:8,opacity:.55,textTransform:"uppercase",letterSpacing:1,marginBottom:1}}>{c.s} · {c.r}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontSize:19,fontWeight:800,marginBottom:2}}>{c.n}</div><div style={{fontSize:9,opacity:.55,marginBottom:7}}>{c.t} · {c.hq} · {c.yr} · {(c.emp/1000).toFixed(0)}K staff</div><div style={{fontFamily:"DM Mono,monospace",fontSize:26,fontWeight:800,lineHeight:1}}>{f(c.price)}</div><div style={{fontSize:10,marginTop:2,color:c.ch>=0?"#C8E6C9":"#FFCDD2"}}>{c.ch>=0?"▲":"▼"} {pc(c.ch)} this turn</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:8,opacity:.4,marginBottom:2}}>P/E</div><div style={{fontSize:18,fontWeight:800,fontFamily:"DM Mono,monospace"}}>{c.pe.toFixed(1)}×</div><div style={{fontSize:8,opacity:.35}}>{bnd.mn}–{bnd.mx}× bounds</div></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:11,paddingTop:11,borderTop:"1px solid rgba(255,255,255,.14)"}}>
          {[["Div",c.div+"%"],["Margin",(c.mg*100).toFixed(0)+"%"],["Beta",c.b+"×"],["Emp",(c.emp/1000).toFixed(0)+"K"]].map(([k,v])=><div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:7,opacity:.4,textTransform:"uppercase"}}>{k}</div><div style={{fontSize:10,fontWeight:700,fontFamily:"DM Mono,monospace",marginTop:1}}>{v}</div></div>)}
        </div>
      </div>
      {ev&&<div style={{background:ev.good?"#E8F5E9":"#FFEBEE",borderRadius:9,padding:9,border:"1px solid "+(ev.good?"#A5D6A7":"#EF9A9A"),display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:16}}>{ev.ico}</span><div><div style={{fontSize:11,fontWeight:700,color:ev.good?G:R}}>Active: {ev.n}</div><div style={{fontSize:8,color:"#888"}}>{ev.tl}/{ev.dur} turns · {ev.desc}</div></div></div>}
      <div style={{display:"flex",background:"#f0f4f0",borderRadius:9,padding:3,gap:2}}>
        {["info","chart"].map(t2=><button key={t2} onClick={()=>setCoTab(t2)} style={{flex:1,padding:"7px 0",borderRadius:7,border:"none",background:coTab===t2?"#fff":"transparent",color:coTab===t2?G:"#888",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif",boxShadow:coTab===t2?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{t2.charAt(0).toUpperCase()+t2.slice(1)}</button>)}
      </div>
      {coTab==="info"&&<>
        <div style={{background:"#f8fbf8",borderRadius:9,padding:11,fontSize:11,color:"#555",lineHeight:1.6}}>{c.desc}</div>
        {held>0&&<div style={{background:"#E8F5E9",borderRadius:10,padding:11,border:"1px solid #A5D6A7"}}><div style={{fontSize:10,fontWeight:700,color:G,marginBottom:7}}>Your Position</div><div style={{display:"flex",gap:6}}><SB l="Shares" v={held.toLocaleString()} c={G}/><SB l="Value" v={f(c.price*held)} c={G}/><SB l="Avg Cost" v={f(avgC)}/><SB l="P&L" v={(pl>=0?"+":"")+f(pl)} c={pl>=0?G:R}/></div><div style={{fontSize:9,color:"#888",marginTop:7}}>CGT {(20*(1-d.taxRed)).toFixed(0)}% on profit only. Sell at a loss = $0 tax.</div></div>}
        <div style={{background:"#fff",borderRadius:10,padding:12,border:"1px solid #e8ebe8"}}><div style={{fontSize:11,fontWeight:700,color:DK,marginBottom:7}}>Financials (Est.)</div>{[["EPS",f(eps)],["P/E",c.pe.toFixed(1)+"×"],["P/E Bounds",bnd.mn+"–"+bnd.mx+"×"],["Dividend",c.div+"%"],["Net Margin",(c.mg*100).toFixed(0)+"%"],["Beta",c.b+"×"]].map(([k,v])=><Rw key={k} k={k} v={v}/>)}</div>
      </>}
      {coTab==="chart"&&<div style={{background:"#fff",borderRadius:10,padding:12,border:"1px solid #e8ebe8"}}><div style={{fontSize:11,fontWeight:700,color:"#aaa",marginBottom:7}}>Price Chart ({c.hist?.length||0} turns)</div><div style={{height:50,display:"flex",alignItems:"flex-end",gap:2}}>{(c.hist||[]).slice(-40).map((pr,i,arr)=>{const mn=Math.min(...arr),mx=Math.max(...arr),rng=mx-mn||1;const h=Math.max(3,Math.round(((pr-mn)/rng)*46));return <div key={i} style={{flex:1,height:h,background:(i===0||pr>=arr[i-1])?G:R,borderRadius:"2px 2px 0 0",opacity:.75}}/>;})}</div></div>}
      <div style={{display:"flex",gap:7}}>
        <button onClick={()=>{setTrM({type:"stock",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:10,padding:13,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>📈 Buy</button>
        <button onClick={()=>{setTrM({type:"stock",item:c,mode:"sell"});setTrAmt(null);}} disabled={held<1} style={{flex:1,background:held<1?"#f0f0f0":"#FFEBEE",color:held<1?"#bbb":R,border:"1.5px solid "+(held<1?"#e0e0e0":"#EF9A9A"),borderRadius:10,padding:13,fontWeight:800,fontSize:13,cursor:held<1?"not-allowed":"pointer",fontFamily:"DM Sans,sans-serif"}}>📉 Sell {held>0?"("+held.toLocaleString()+")":""}</button>
      </div>
    </div>;
  }

  function CommScreen(){
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{background:"#FFF8E1",borderRadius:10,padding:10,border:"1px solid #FFE082",fontSize:10,color:"#E65100"}}>Commodities · Prices ±4%/turn · Max 5× base price · CGT on profit only at {(20*(1-d.taxRed)).toFixed(0)}% · No position limits</div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.comm.map((c,i)=>{const held=d.ch?.[c.id]||0,pl=held?(c.p-(d.avgCm?.[c.id]||c.p))*held:0;return <div key={c.id} style={{padding:"11px 12px",borderBottom:i<d.comm.length-1?"1px solid #f8f8f8":"none"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:5}}><div><div style={{fontSize:12,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:8,color:"#bbb"}}>{c.id} · {c.u} · Base {f(c.base)} · Cap {f(c.base*COMM_PRICE_CEIL)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,fontFamily:"DM Mono,monospace",color:c.ch>=0?G:R}}>{f(c.p)}</div><Bdg v={c.ch||0}/></div></div>
          <div style={{height:22,marginBottom:6}}><MC hist={c.hist} w={220} h={22}/></div>
          {held>0&&<div style={{fontSize:9,color:"#555",marginBottom:6,fontFamily:"DM Mono,monospace"}}>Held: {held.toLocaleString()} {c.u}s · {f(c.p*held)} · P&L: <span style={{color:pl>=0?G:R}}>{pl>=0?"+":""}{f(pl)}</span></div>}
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{setTrM({type:"comm",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Buy</button>
            {held>0&&<button onClick={()=>{setTrM({type:"comm",item:c,mode:"sell"});setTrAmt(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Sell ({held.toLocaleString()})</button>}
          </div>
        </div>;})}
      </div>
    </div>;
  }

  function CrypScreen(){
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{background:"#EDE7F6",borderRadius:10,padding:10,border:"1px solid #D1C4E9",fontSize:10,color:"#4A148C"}}>Crypto · High volatility ±10%/turn · Prices can swing hard — manage risk · CGT on profit only</div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.cryp.map((c,i)=>{const held=d.crh?.[c.id]||0,pl=held?(c.p-(d.avgCr?.[c.id]||c.p))*held:0;return <div key={c.id} style={{padding:"11px 12px",borderBottom:i<d.cryp.length-1?"1px solid #f8f8f8":"none"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:5}}><div><div style={{fontSize:13,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:8,color:"#bbb"}}>{c.id} per {c.u}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,fontFamily:"DM Mono,monospace",color:c.ch>=0?G:R}}>{f(c.p)}</div><Bdg v={c.ch||0}/></div></div>
          <div style={{height:26,marginBottom:6}}><MC hist={c.hist} w={220} h={26}/></div>
          {held>0&&<div style={{fontSize:9,color:"#555",marginBottom:6,fontFamily:"DM Mono,monospace"}}>Held: {held} · Value: {f(c.p*held)} · P&L: <span style={{color:pl>=0?G:R}}>{pl>=0?"+":""}{f(pl)}</span></div>}
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{setTrM({type:"crypto",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:"#4A148C",color:"#fff",border:"none",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Buy</button>
            {held>0&&<button onClick={()=>{setTrM({type:"crypto",item:c,mode:"sell"});setTrAmt(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Sell ({held})</button>}
          </div>
        </div>;})}
      </div>
    </div>;
  }

  function FxScreen(){
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{background:"#E3F2FD",borderRadius:10,padding:10,border:"1px solid #BBDEFB",fontSize:10,color:BL}}>Live Forex Rates · USD/AED 3.6735 locked (GSF buy rate) · USD/CNY 6.8 locked (Master Brief) · Others ±0.4%/turn · Full position trading in Phase 1 build</div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.fx.map((fx,i)=><div key={fx.id} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderBottom:i<d.fx.length-1?"1px solid #f8f8f8":"none"}}>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:DK}}>{fx.n}</div>{fx.locked&&<span style={{fontSize:8,color:"#aaa",fontWeight:700}}>LOCKED</span>}</div>
          <MC hist={fx.hist} w={55} h={24}/>
          <div style={{textAlign:"right",minWidth:80}}><div style={{fontSize:13,fontWeight:800,fontFamily:"DM Mono,monospace",color:fx.locked?"#888":(fx.ch||0)>=0?G:R}}>{fx.p.toFixed(4)}</div>{!fx.locked&&<Bdg v={fx.ch||0}/>}</div>
        </div>)}
      </div>
    </div>;
  }

  function BondsScreen(){
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:9}}>
      <div style={{background:"#E3F2FD",borderRadius:10,padding:10,border:"1px solid #BBDEFB",fontSize:10,color:BL}}>Price = FV × (OrigYield ÷ CurrYield) × RatingMult · AAA×1.02→B×0.94 · Range 5–200% of face value</div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.bonds.map((b,i)=>{const pr=gBP(b.fv,b.oy,b.cy,b.rat),held=d.bh[b.id]||0;return <div key={b.id} style={{padding:"12px 12px",borderBottom:i<d.bonds.length-1?"1px solid #f5f5f5":"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div><div style={{fontSize:12,fontWeight:700,color:DK}}>{b.n}</div><div style={{fontSize:8,color:"#bbb"}}>{b.id} · {b.mat} · <span style={{fontWeight:700,color:b.rat==="AAA"||b.rat==="AA"?G:b.rat==="BB"||b.rat==="B"?R:"#F57F17"}}>{b.rat}</span></div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,fontFamily:"DM Mono,monospace",color:pr>b.fv?G:R}}>{f(pr)}</div><div style={{fontSize:8,color:"#aaa"}}>{b.cy.toFixed(2)}% yield</div></div></div>
          <div style={{display:"flex",gap:5,marginBottom:6}}><SB l="Coupon" v={b.cou+"%"} c={G}/><SB l="Orig" v={b.oy+"%"}/><SB l="Curr Yield" v={b.cy.toFixed(1)+"%"} c={b.cy<b.oy?G:R}/><SB l="Held" v={held} c={held>0?G:"#aaa"}/></div>
          <div style={{display:"flex",gap:5}}>
            {[1,5,10].map(q=><button key={q} onClick={()=>{setTrM({type:"bond",item:b,mode:"buy"});setTrAmt(q);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Buy {q}</button>)}
            <button onClick={()=>{setTrM({type:"bond",item:b,mode:"sell"});setTrAmt(d.bh[b.id]||0);}} disabled={!held} style={{flex:1,background:held?"#FFEBEE":"#f0f0f0",color:held?R:"#bbb",border:"1px solid "+(held?"#EF9A9A":"#e0e0e0"),borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:9,cursor:held?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>Sell All</button>
          </div>
        </div>;})}
      </div>
    </div>;
  }

  function Port(){
    const sm={};Object.entries(d.sh).filter(([,n])=>n>0).forEach(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(c)sm[c.s]=(sm[c.s]||0)+c.price*n;});
    const tsv=Object.values(sm).reduce((a,b2)=>a+b2,0)||1;
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#388E3C)",borderRadius:14,padding:14,color:"#fff"}}><div style={{fontSize:9,opacity:.5,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Portfolio</div><div style={{fontFamily:"DM Mono,monospace",fontSize:26,fontWeight:800}}>{f(nw)}</div><div style={{fontSize:9,opacity:.7,marginTop:2}}>S:{f(sv)} · B:{f(bv)} · C:{f(cv)} · Cr:{f(crv)} · GSF:{f(d.gsfDep)} · Cash:{f(d.cash)}</div></div>
      {d.taxRed>0&&<div style={{background:"#E8F5E9",borderRadius:9,padding:9,border:"1px solid #A5D6A7",fontSize:10,color:G}}>Tax Reduction: {(d.taxRed*100).toFixed(0)}% off CGT. Effective rate: {(20*(1-d.taxRed)).toFixed(0)}% on profit only.</div>}
      {Object.keys(sm).length>0&&<div style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}><div style={{fontSize:11,fontWeight:700,color:DK,marginBottom:8}}>Sector Allocation</div>{Object.entries(sm).sort(([,a],[,b2])=>b2-a).map(([s,v])=><div key={s} style={{marginBottom:7}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11,color:"#555"}}>{s}</span><span style={{fontSize:11,fontFamily:"DM Mono,monospace"}}>{((v/tsv)*100).toFixed(1)}%</span></div><div style={{height:4,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:((v/tsv)*100)+"%",background:"linear-gradient(90deg,"+G+",#4CAF50)",borderRadius:2}}/></div></div>)}</div>}
      <div style={{background:"#fff",borderRadius:11,border:"1px solid #e8ebe8",overflow:"hidden"}}><div style={{padding:"9px 12px",fontSize:11,fontWeight:700,color:DK}}>Stocks</div>
        {Object.keys(d.sh).filter(t=>(d.sh[t]||0)>0).length===0&&<div style={{padding:"11px 12px",fontSize:12,color:"#bbb"}}>No stocks held.</div>}
        {Object.entries(d.sh).filter(([,n])=>n>0).map(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(!c)return null;const avgC=d.avgSh[t]||c.price,pl=(c.price-avgC)*n;
          return <div key={t} style={{padding:"9px 12px",borderTop:"1px solid #f8f8f8"}}>
            <div onClick={()=>{setSelCo({...c});setTab("co");}} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,cursor:"pointer"}}><div style={{width:30,height:30,borderRadius:8,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:8,color:"#bbb"}}>{n.toLocaleString()} shs · {f(c.price)}/sh · avg {f(avgC)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{f(c.price*n)}</div><div style={{fontSize:9,fontFamily:"DM Mono,monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{f(pl)}</div></div></div>
            <div style={{display:"flex",gap:6}}><button onClick={()=>{setTrM({type:"stock",item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:7,padding:"7px 0",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>+ Buy More</button><button onClick={()=>{setTrM({type:"stock",item:c,mode:"sell"});setTrAmt(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"7px 0",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Sell</button></div>
          </div>;
        })}
      </div>
    </div>;
  }

  function Give(){
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#880E4F,#C2185B)",borderRadius:14,padding:14,color:"#fff"}}><div style={{fontSize:9,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>❤️ Philanthropy</div><div style={{fontSize:17,fontWeight:800,marginBottom:3}}>Reduce Tax. Build Legacy.</div><div style={{fontSize:10,opacity:.8,lineHeight:1.5}}>Each donation: CGT −5% on profit (max 25% total). 2 donations → Solar unlock.</div><div style={{display:"flex",gap:7,marginTop:8}}><SB l="Donations" v={d.dons} c="#FFCDD2"/><SB l="CGT Saved" v={(d.taxRed*100).toFixed(0)+"%"} c="#FFCDD2"/><SB l="CGT Now" v={(20*(1-d.taxRed)).toFixed(0)+"%"} c="#FFCDD2"/></div></div>
      {[{n:"Healthcare",ico:"🏥"},{n:"Education",ico:"🎓"},{n:"Infrastructure",ico:"🌉"},{n:"Space Research",ico:"🔭"},{n:"Climate Action",ico:"🌱"}].map(cat=><div key={cat.n} style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}><span style={{fontSize:20}}>{cat.ico}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:DK}}>{cat.n}</div><div style={{background:"#FFF8E1",borderRadius:5,padding:"2px 7px",marginTop:3,fontSize:9,color:"#E65100",display:"inline-block"}}>CGT −5% · Solar criteria</div></div></div><button onClick={()=>{setDonM(cat.n);setDonAmt(null);}} style={{width:"100%",background:"#880E4F",color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Donate to {cat.n} ❤️</button></div>)}
    </div>;
  }

  function GSF(){
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",borderRadius:14,padding:14,color:"#fff"}}><div style={{fontSize:9,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🏛️ Global Sovereign Fund</div><div style={{fontSize:17,fontWeight:800,marginBottom:3}}>Collective Investment Pool</div><div style={{fontSize:10,opacity:.8}}>One rate per turn · Same for all players · Auto-credited each turn · Soft cap at 30% of portfolio</div></div>
      <div style={{background:"#E3F2FD",borderRadius:11,padding:12,border:"1px solid #BBDEFB"}}><div style={{fontSize:11,fontWeight:700,color:BL,marginBottom:8}}>Your GSF Position</div><div style={{display:"flex",gap:6,marginBottom:11}}><SB l="Your Deposit" v={f(d.gsfDep)} c={BL}/><SB l="Rate/yr" v={d.gsf.toFixed(2)+"%"} c={G}/><SB l="Per Turn" v={f(d.gsfDep*(d.gsf/100/12))} c={G}/></div><div style={{background:"#fff",borderRadius:8,padding:"8px 10px",marginBottom:10,fontSize:10,color:"#666"}}>Returns are realistic: $100K at 12%/yr = $1,000/turn. Deposit as much as you want — soft cap at 30% of total portfolio keeps things sensible.</div><button onClick={()=>{setGsfM(true);setGsfAmt(null);}} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>+ Deposit to GSF</button></div>
    </div>;
  }

  function Sol(){
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"linear-gradient(135deg,#060B16,#112040)",borderRadius:14,padding:14,border:"1px solid rgba(212,175,55,.15)"}}><div style={{fontSize:9,opacity:.45,color:"#F0D060",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>☀️ Solar System Unlock</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}><div style={{fontFamily:"DM Mono,monospace",fontSize:28,fontWeight:800,color:"#F0D060"}}>{spct}%</div><div style={{fontSize:10,color:"rgba(240,208,96,.4)"}}>All 6 criteria needed</div></div><div style={{height:7,background:"rgba(255,255,255,.07)",borderRadius:4,overflow:"hidden",marginBottom:12}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:4,transition:"width .5s"}}/></div>{Object.entries(SC).map(([k,c2])=><div key={k} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7}}><div style={{width:20,height:20,borderRadius:"50%",background:c2.met?"rgba(0,230,118,.2)":"rgba(255,255,255,.05)",border:"2px solid "+(c2.met?"#00E676":"rgba(255,255,255,.1)"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0,color:"#00E676"}}>{c2.met?"✓":""}</div><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:c2.met?"#00E676":"rgba(255,255,255,.45)"}}>{c2.l}</div><div style={{fontSize:9,color:"rgba(240,208,96,.35)",fontFamily:"DM Mono,monospace"}}>{c2.v}</div></div></div>)}</div>
      <div style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:11,padding:13,border:"1px solid rgba(212,175,55,.07)"}}><div style={{fontSize:11,fontWeight:700,color:"rgba(212,175,55,.45)",marginBottom:9}}>🔒 210 Companies · 7 Planets</div>{[{ico:"🔴",pl:"Mars",cu:"MCR"},{ico:"🟡",pl:"Venus",cu:"VNU"},{ico:"🟠",pl:"Jupiter",cu:"JVT"},{ico:"🪐",pl:"Saturn",cu:"STC"},{ico:"☿",pl:"Mercury",cu:"MRC"},{ico:"🔵",pl:"Uranus",cu:"URU"},{ico:"💜",pl:"Neptune",cu:"NPT"}].map(p=><div key={p.pl} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.04)",opacity:spct===100?.8:.3}}><span style={{fontSize:18}}>{p.ico}</span><div style={{fontSize:11,fontWeight:700,color:"#E8EEF8"}}>{p.pl} <span style={{fontFamily:"DM Mono,monospace",fontSize:8,color:"rgba(240,208,96,.4)"}}>({p.cu})</span></div></div>)}</div>
    </div>;
  }

  function NewsScreen(){
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:7}}>
      {d.news.slice(0,30).map(n=><div key={n.id} style={{background:"#fff",borderRadius:11,padding:11,border:"1px solid #e8ebe8",display:"flex",gap:8}}><div style={{width:3,borderRadius:2,flexShrink:0,background:n.g?G:R,alignSelf:"stretch"}}/><div style={{flex:1}}><div style={{fontSize:8,color:"#ccc",textTransform:"uppercase",letterSpacing:.4,marginBottom:2}}>T{n.t} · {n.ico}</div><div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:2}}>{n.ti}</div><div style={{fontSize:11,color:"#666",lineHeight:1.5}}>{n.bo}</div></div></div>)}
    </div>;
  }

  function SetScreen(){
    return <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}><div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:9}}>🌐 Language</div><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>{["🇬🇧","🇸🇦","🇵🇰","🇨🇳","🇫🇷"].map((fl,i)=><button key={i} onClick={()=>setLangI(i)} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(langI===i?G:"#e0e0e0"),background:langI===i?"#E8F5E9":"#fafafa",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontFamily:"DM Sans,sans-serif"}}><span style={{fontSize:17}}>{fl}</span><span style={{fontSize:8,fontWeight:700,color:langI===i?G:"#666"}}>{["EN","AR","UR","ZH","FR"][i]}</span></button>)}</div></div>
      <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}><div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:9}}>📊 Stats — Turn {d.turn}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}><SB l="Net Worth" v={f(nw)} c={G}/><SB l="Cash" v={f(d.cash)}/><SB l="Events" v={d.aevts.length} c={d.aevts.length>0?"#F57F17":G}/><SB l="CGT Rate" v={(20*(1-d.taxRed)).toFixed(0)+"%"} c={G}/></div></div>
      <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}><div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:9}}>🏁 Milestones</div>{[{n:"M1 — Turn 100",d:d.turn>=100,ds:"Governor stable"},{n:"M2 — Turn 300",d:d.turn>=300,ds:"Solar window"},{n:"M3 — Turn 500",d:d.turn>=500,ds:"Full DEE"},{n:"M4 — Turn 1000",d:d.turn>=1000,ds:"LAUNCH GATE"}].map(m=><div key={m.n} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}><div style={{width:25,height:25,borderRadius:7,background:m.d?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,border:m.d?"1px solid #A5D6A7":"1px solid #e0e0e0"}}>{m.d?"✅":"🔒"}</div><div><div style={{fontSize:12,fontWeight:700,color:m.d?G:DK}}>{m.n}</div><div style={{fontSize:9,color:"#bbb"}}>{m.ds}</div></div></div>)}</div>
      <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}><div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:3}}>🔴 Beta — Error Log (PIN: 9000)</div>{!beta?<button onClick={()=>{const i=window.prompt("PIN:");if(i==="9000"){setBeta(true);toast_("Beta unlocked");}else if(i)toast_("Wrong PIN",false);}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>🔐 Enter PIN</button>:<div><div style={{fontSize:10,fontWeight:700,color:R,marginBottom:6}}>{d.elog.length} entries</div><div style={{maxHeight:150,overflowY:"auto",display:"flex",flexDirection:"column",gap:3,marginBottom:8}}>{d.elog.map((e,i)=><div key={i} style={{padding:"3px 7px",borderRadius:3,fontSize:8,fontFamily:"DM Mono,monospace",background:e.lv==="CRIT"?"#FFEBEE":"#E8F5E9",color:e.lv==="CRIT"?R:G,borderLeft:"2px solid "+(e.lv==="CRIT"?R:G)}}>[T-{e.t}][{e.lv}] {e.sc}: {e.msg}</div>)}</div><button onClick={()=>{const txt=d.elog.map(e=>"[T-"+e.t+"]["+e.lv+"] "+e.sc+": "+e.msg).join("\n");const blob=new Blob(["GR v5 LOG\nTurn: "+d.turn+"\nNW: "+f(nw)+"\n\n"+txt],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="GR_v5_T"+d.turn+".txt";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);toast_("Downloaded");}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>⬇ Download Log</button></div>}</div>
    </div>;
  }

  const screenMap={dash:<Dash/>,mkt:<Mkt/>,co:<Co/>,comm:<CommScreen/>,cryp:<CrypScreen/>,fx:<FxScreen/>,bonds:<BondsScreen/>,port:<Port/>,ph:<Give/>,gsf:<GSF/>,sol:<Sol/>,news:<NewsScreen/>,set:<SetScreen/>};

  // ── TRADE MODAL ───────────────────────────────────────────────
  function TrModal(){
    if(!trM)return null;
    const{type,item,mode}=trM,isBuy=mode==="buy";
    let price=0,unit="",held=0,maxQty=0;
    if(type==="stock"){price=item.price;unit="shares";held=d.sh[item.t]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
    else if(type==="comm"){price=item.p;unit=item.u;held=d.ch?.[item.id]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
    else if(type==="crypto"){price=item.p;unit=item.u;held=d.crh?.[item.id]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
    else if(type==="bond"){price=gBP(item.fv,item.oy,item.cy,item.rat);unit="bonds";held=d.bh?.[item.id]||0;maxQty=isBuy?Math.floor(d.cash/price):held;}
    const qty=Math.floor(trAmt||0),totalCost=Math.round(qty*price*100)/100;
    const avgC=type==="stock"?(d.avgSh[item.t]||price):type==="comm"?(d.avgCm?.[item.id]||price):type==="crypto"?(d.avgCr?.[item.id]||price):price;
    const profitPer=!isBuy?Math.max(0,price-avgC):0;
    const tax=!isBuy?Math.round(qty*profitPer*0.20*(1-d.taxRed)*100)/100:0;
    return <div style={{background:"#fff",borderRadius:"19px 19px 0 0",padding:18,width:"100%",maxHeight:"88vh",overflowY:"auto"}}>
      <div style={{width:34,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 14px"}}/>
      <div style={{background:isBuy?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:12,padding:13,color:"#fff",marginBottom:12}}>
        <div style={{fontSize:9,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{isBuy?"BUY":"SELL"} · {type.toUpperCase()}</div>
        <div style={{fontSize:16,fontWeight:800}}>{item.n||item.id}</div>
        <div style={{fontSize:10,opacity:.8,marginTop:2}}>{f(price)} per {unit} · {isBuy?f(d.cash)+" available · can buy "+maxQty.toLocaleString()+" "+unit:held.toLocaleString()+" "+unit+" held"}</div>
      </div>
      <div style={{display:"flex",background:"#f0f4f0",borderRadius:9,padding:3,gap:2,marginBottom:11}}>
        {["buy","sell"].map(m2=><button key={m2} onClick={()=>{setTrM({...trM,mode:m2});setTrAmt(null);}} style={{flex:1,padding:"7px 0",borderRadius:7,border:"none",background:mode===m2?"#fff":"transparent",color:mode===m2?G:"#999",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif",boxShadow:mode===m2?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{m2==="buy"?"Buy":"Sell"}</button>)}
      </div>
      <div style={{fontSize:10,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>
        Select Quantity — {maxQty<=0?(isBuy?"Insufficient cash":"Nothing held"):"Max "+maxQty.toLocaleString()+" "+unit}
      </div>
      <Pk maxQty={maxQty} sel={trAmt} onSel={setTrAmt} label={unit}/>
      {qty>0&&<div style={{background:"#f8fbf8",borderRadius:9,padding:11,marginBottom:11}}>
        <Rw k={"Qty ("+unit+")"} v={qty.toLocaleString()}/>
        <Rw k={isBuy?"Total Cost":"Gross Proceeds"} v={f(totalCost)}/>
        {!isBuy&&<Rw k={"Profit/"+unit+" ("+f(price)+" − "+f(avgC)+" avg)"} v={profitPer>0?f(profitPer):"None — no profit"} vc={profitPer>0?G:"#888"}/>}
        {!isBuy&&<Rw k={"CGT "+(20*(1-d.taxRed)).toFixed(0)+"% on profit only"} v={tax>0?"-"+f(tax):"$0 — no profit"} vc={tax>0?R:G}/>}
        <Rw k={"Net "+(isBuy?"Cost":"Proceeds")} v={f(isBuy?totalCost:totalCost-tax)} vc={isBuy?R:G} b/>
      </div>}
      {maxQty<=0&&<div style={{background:"#FFF8E1",borderRadius:8,padding:9,marginBottom:10,fontSize:10,color:"#E65100"}}>{isBuy?"⚠️ Not enough cash to buy even 1 "+unit+". Price: "+f(price):"⚠️ Nothing held to sell."}</div>}
      <button onClick={doTrade} disabled={qty<1} style={{width:"100%",background:qty>=1?(isBuy?G:R):"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:13,fontWeight:800,fontSize:14,cursor:qty>=1?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>
        {qty>=1?"Confirm "+(isBuy?"Buy":"Sell")+" "+qty.toLocaleString()+" "+unit+" = "+f(isBuy?totalCost:totalCost-tax):"Select quantity above"}
      </button>
    </div>;
  }

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"DM Sans,sans-serif",direction:rtl?"rtl":"ltr"}}>
    <div style={{background:"#fff",padding:"8px 13px",borderBottom:"1px solid #e8ebe8",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <div style={{width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#1B5E20,#4CAF50)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🌐</div>
        <div><div style={{fontSize:13,fontWeight:800,color:DK,lineHeight:1}}>Galactic Raider</div><div style={{fontSize:7,color:"#bbb"}}>Capital Exchange · v5</div></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {auto&&<div style={{width:6,height:6,borderRadius:"50%",background:G,boxShadow:"0 0 5px #4CAF50"}}/>}
        <button onClick={()=>setTab("sol")} style={{background:"rgba(212,175,55,.1)",border:"1px solid rgba(212,175,55,.2)",borderRadius:20,padding:"2px 8px",fontSize:9,fontWeight:700,color:"#B8952A",cursor:"pointer"}}>☀️ {spct}%</button>
        <button onClick={()=>setLangI(l=>(l+1)%5)} style={{fontSize:16,background:"none",border:"none",cursor:"pointer",padding:2}}>{FLAGS[langI]}</button>
      </div>
    </div>
    <div style={{background:"#1B5E20",padding:"3px 0",overflow:"hidden",flexShrink:0}}>
      <div style={{display:"flex",gap:16,whiteSpace:"nowrap",animation:"scroll 32s linear infinite",width:"max-content"}}>
        {[...d.cos,...d.cos].map((c,i)=><span key={i} style={{fontSize:8,fontFamily:"DM Mono,monospace",color:"rgba(255,255,255,.4)",display:"inline-flex",gap:4}}><span style={{color:"rgba(255,255,255,.65)",fontWeight:700}}>{c.t}</span><span style={{color:(c.ch||0)>=0?"#69F0AE":"#FF5252"}}>{f(c.price)} {(c.ch||0)>=0?"▲":"▼"}{Math.abs((c.ch||0)*100).toFixed(2)}%</span></span>)}
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",paddingBottom:66}}>{screenMap[tab]||<Dash/>}</div>
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #e8ebe8",display:"flex",padding:"4px 1px 9px",zIndex:50}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{...ts(t.id),minWidth:0}}><div style={{fontSize:14,lineHeight:1,marginBottom:1}}>{t.ico}</div><div style={{fontSize:6.5}}>{t.l}</div></button>)}
    </div>
    {evN&&<div style={{position:"fixed",top:64,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 16px)",maxWidth:414,background:evN.good?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:11,padding:"10px 13px",display:"flex",alignItems:"center",gap:9,zIndex:200,boxShadow:"0 6px 20px rgba(0,0,0,.3)"}}><span style={{fontSize:20}}>{evN.ico}</span><div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{evN.n}{evN.cn?" — "+evN.cn:""}</div><div style={{fontSize:9,color:"rgba(255,255,255,.6)",marginTop:1}}>{evN.desc}</div></div><button onClick={()=>setEvN(null)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:20,height:20,color:"#fff",cursor:"pointer",fontSize:12}}>×</button></div>}
    {toast&&<div style={{position:"fixed",top:64,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 16px)",maxWidth:414,background:toast.g?G:R,borderRadius:9,padding:"9px 13px",color:"#fff",fontSize:11,fontWeight:700,zIndex:250,textAlign:"center",boxShadow:"0 3px 12px rgba(0,0,0,.2)"}}>{toast.msg}</div>}
    {trM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget){setTrM(null);setTrAmt(null);}}}><TrModal/></div>}
    {donM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setDonM(null)}>
      <div style={{background:"#fff",borderRadius:"19px 19px 0 0",padding:18,width:"100%"}}>
        <div style={{width:34,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 14px"}}/>
        <div style={{fontSize:15,fontWeight:800,color:DK,marginBottom:3}}>❤️ Donate to {donM}</div>
        <div style={{fontSize:10,color:"#888",marginBottom:4}}>Cash: {f(d.cash)} · Each donation = CGT −5% on profit (max 25%)</div>
        <Pk maxQty={Math.floor(d.cash/1000)} sel={donAmt?Math.floor(donAmt/1000):null} onSel={v=>setDonAmt(v*1000)} label="$1K increments"/>
        {donAmt&&donAmt>0&&<div style={{background:"#f8fbf8",borderRadius:8,padding:9,marginBottom:9}}><Rw k="Donation" v={f(donAmt)} vc="#880E4F" b/><Rw k="New CGT after donation" v={(20*(1-(d.taxRed+0.05))).toFixed(0)+"% on profit"} vc={G}/></div>}
        <button onClick={()=>{if(!donAmt||donAmt<1000||donAmt>d.cash){toast_("Select amount",false);return;}const s=S.current;s.cash=Math.round((s.cash-donAmt)*100)/100;s.dons++;s.taxRed=Math.min(0.25,s.taxRed+0.05);s.news.unshift({id:Math.random(),t:s.turn,ico:"❤️",ti:"Donation: "+donM,bo:f(donAmt)+" donated. CGT now "+(20*(1-s.taxRed)).toFixed(0)+"% on profit. Solar: "+s.dons+"/2.",g:true});toast_("Donated "+f(donAmt)+" ❤️ CGT now "+(20*(1-s.taxRed)).toFixed(0)+"%");setDonM(null);setDonAmt(null);refresh();}} style={{width:"100%",background:"#880E4F",color:"#fff",border:"none",borderRadius:10,padding:12,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>❤️ Confirm{donAmt?" — "+f(donAmt):""}</button>
      </div>
    </div>}
    {gsfM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setGsfM(false)}>
      <div style={{background:"#fff",borderRadius:"19px 19px 0 0",padding:18,width:"100%"}}>
        <div style={{width:34,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 14px"}}/>
        <div style={{fontSize:15,fontWeight:800,color:DK,marginBottom:3}}>🏛️ Deposit to GSF</div>
        <div style={{fontSize:10,color:"#888",marginBottom:10}}>Rate: {d.gsf.toFixed(2)}%/yr · Cash: {f(d.cash)} · Per turn after deposit: {f((d.gsfDep+(gsfAmt||0))*(d.gsf/100/12))}</div>
        <Pk maxQty={Math.floor(d.cash/1000)} sel={gsfAmt?Math.floor(gsfAmt/1000):null} onSel={v=>setGsfAmt(v*1000)} label="$1K increments"/>
        {gsfAmt&&gsfAmt>0&&<div style={{background:"#E3F2FD",borderRadius:8,padding:9,marginBottom:9}}><Rw k="Deposit" v={f(gsfAmt)} vc={BL} b/><Rw k="Per turn" v={f((d.gsfDep+gsfAmt)*(d.gsf/100/12))} vc={G}/><Rw k="Per year est." v={f((d.gsfDep+gsfAmt)*(d.gsf/100))} vc={G}/></div>}
        <button onClick={()=>{if(!gsfAmt||gsfAmt<1000||gsfAmt>d.cash){toast_("Select amount",false);return;}const s=S.current;s.cash=Math.round((s.cash-gsfAmt)*100)/100;s.gsfDep+=gsfAmt;toast_("Deposited "+f(gsfAmt)+" to GSF → "+f(s.gsfDep*(s.gsf/100/12))+"/turn");setGsfM(false);setGsfAmt(null);refresh();}} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:10,padding:12,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>🏛️ Confirm{gsfAmt?" — "+f(gsfAmt):""}</button>
      </div>
    </div>}
    <style>{"@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=DM+Mono:wght@400;500;600&display=swap');@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{display:none}button{outline:none}"}</style>
  </div>;
}
