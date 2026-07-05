import{useState,useRef,useEffect,useCallback}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const pc=n=>(n>=0?"+":"")+n.toFixed(2)+"%";
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);
const PEB={Technology:{mn:15,mx:35},Banking:{mn:8,mx:18},Mining:{mn:6,mx:12},Energy:{mn:6,mx:20},Agriculture:{mn:10,mx:18},Healthcare:{mn:12,mx:35},Manufacturing:{mn:10,mx:25},Utilities:{mn:12,mx:18},"Real Estate":{mn:8,mx:16},Telecom:{mn:10,mx:16},Retail:{mn:10,mx:18}};
const COS=[
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",r:"Asia Pacific",ip:348.94,pe0:18.4,div:0.8,b:1.8,yr:2008,emp:125000,hq:"Singapore",ceo:"Dr. Lin Wei",founder:"Dr. Lin Wei",origin:"Lin Wei sold his Singapore apartment to fund the first prototype. Grew from 4 staff to 125,000 across 18 countries in 17 years.",ops:"Enterprise cloud, AI chips, data services across Singapore, Tokyo, Seoul, Mumbai, Sydney.",analyst:"BUY",target:420,rating:4.2},
  {t:"MRDB",n:"Meridian Bank",s:"Banking",r:"US",ip:85.20,pe0:12.1,div:2.1,b:.9,yr:1985,emp:45000,hq:"New York",ceo:"Patricia Hernandez",founder:"James R. Meridian",origin:"James Meridian started as a teller in Brooklyn in 1972 with $200. Built one branch into a powerhouse through 14 acquisitions.",ops:"2,400 branches across US Midwest and Northeast. Corporate lending and wealth management.",analyst:"HOLD",target:90,rating:3.5},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",r:"Africa",ip:15.80,pe0:8.5,div:.5,b:1.6,yr:2005,emp:28000,hq:"Johannesburg",ceo:"Amara Diallo",founder:"Kwame Asante",origin:"Ghanaian geologist Kwame Asante discovered rare earth deposits while working for a junior explorer. Listed on JSE 2009.",ops:"Iron ore in Mauritania, lithium in Zimbabwe, rare earths in DRC. Supplies Asian battery makers.",analyst:"BUY",target:22,rating:4.0},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",r:"Emerging Markets",ip:351.54,pe0:11.3,div:1.8,b:1.2,yr:1995,emp:62000,hq:"Dubai",ceo:"Sheikh Rashid Al-Mansouri",founder:"Al-Mansouri family",origin:"Al-Mansouri family private trading company 1995. Listed DFM 2003. Expanded through Gulf concessions.",ops:"Crude production UAE, Kuwait, Oman. Pipeline infrastructure Kazakhstan.",analyst:"HOLD",target:360,rating:3.2},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",r:"US",ip:198.40,pe0:22.1,div:1.2,b:.8,yr:2005,emp:38000,hq:"Boston",ceo:"Dr. Sarah Chen",founder:"Dr. Marcus Webb",origin:"Harvard oncologist Webb licensed his tumour-targeting patent in 2005. Built from one IP licence into hospital management empire.",ops:"180 hospitals and 400 diagnostic labs across North America. 3 oncology drugs in Phase 3.",analyst:"STRONG BUY",target:240,rating:4.7},
  {t:"UTLS",n:"Utility Systems",s:"Utilities",r:"US",ip:58.40,pe0:14.2,div:4.2,b:.5,yr:1950,emp:12000,hq:"Chicago",ceo:"Robert Keller",founder:"Chicago City Council",origin:"Created by Chicago City Council 1950. Privatised 1987. Regulated monopoly — rate increases require state approval.",ops:"Electric grid 1.9M customers. Gas distribution 1.3M. 3 nuclear plants.",analyst:"HOLD",target:60,rating:3.3},
  {t:"AXMB",n:"Axum Biotech",s:"Healthcare",r:"Africa",ip:68.50,pe0:19.4,div:.6,b:1.4,yr:2012,emp:8500,hq:"Addis Ababa",ceo:"Dr. Yohannes Tesfaye",founder:"Dr. Yohannes Tesfaye",origin:"Ethiopian physician Tesfaye's malaria research rejected by Western pharma. Founded with African Union and Gates Foundation backing.",ops:"Vaccine manufacturing Ethiopia and Kenya. Genomic labs 8 African nations.",analyst:"SPECULATIVE BUY",target:85,rating:3.8},
  {t:"EMTS",n:"Emerging Tech",s:"Technology",r:"Emerging Markets",ip:28.40,pe0:22.0,div:.2,b:2.0,yr:2015,emp:6500,hq:"Mumbai",ceo:"Priya Patel",founder:"Priya Patel",origin:"MIT graduate Patel returned to India 2015 to build enterprise cloud for South Asian SMEs. Sequoia India backed 2016.",ops:"B2B SaaS 18,000 corporate clients across India, Bangladesh, Sri Lanka, Pakistan.",analyst:"STRONG BUY",target:40,rating:4.5},
];
const EVENTS=[
  {id:"rc",n:"Rate Cut",ico:"🏦",t:"mkt",prob:.04,sent:.08,dur:10,good:true},
  {id:"rh",n:"Rate Hike",ico:"📈",t:"mkt",prob:.04,sent:-.07,dur:8,good:false},
  {id:"geo",n:"Geopolitical Crisis",ico:"💣",t:"mkt",prob:.03,sent:-.14,dur:20,sec:["Energy","Mining"],good:false},
  {id:"bea",n:"Earnings Beat",ico:"💰",t:"co",prob:.10,imp:.20,dur:6,good:true},
  {id:"mis",n:"Earnings Miss",ico:"📉",t:"co",prob:.09,imp:-.18,dur:6,good:false},
  {id:"pat",n:"Patent Approved",ico:"⚡",t:"co",prob:.05,imp:.28,dur:5,good:true},
  {id:"scn",n:"CEO Scandal",ico:"💼",t:"co",prob:.03,imp:-.25,dur:15,good:false},
  {id:"con",n:"Govt Contract",ico:"🏛️",t:"co",prob:.04,imp:.22,dur:35,good:true},
];

export default function MarketsSim(){
  const[tab,setTab]=useState("market");
  const[selCo,setSelCo]=useState(null);
  const[trM,setTrM]=useState(null);
  const[trAmt,setTrAmt]=useState(null);
  const[toast,setToast]=useState(null);
  const[speed,setSpeed]=useState(1);
  const[auto,setAuto]=useState(false);
  const speedRef=useRef(1);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  const aRef=useRef(null);
  const S=useRef(null);
  if(!S.current)S.current={
    turn:1,cash:900000,gdp:2.5,inf:3.2,intr:4.5,
    cos:COS.map(c=>({...c,price:c.ip,pp:c.ip,pe:c.pe0,ch:0,hist:[c.ip,c.ip]})),
    aevts:[],sh:{},avgSh:{},
    divLog:[],newsLog:[],txLog:[],
    totalDiv:0,totalCgt:0,
  };
  const[D,setD]=useState(()=>({...S.current}));
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2500);},[]);
  const refresh=useCallback(()=>setD({...S.current}),[]);

  const advance=useCallback(()=>{
    const s=S.current;s.turn++;
    s.gdp=Math.round(cl(s.gdp+(Math.random()-.48)*.5,-3,7)*10)/10;
    s.inf=Math.round(cl(s.inf+(Math.random()-.5)*.3,0,12)*10)/10;
    s.intr=Math.round(cl(s.intr+(Math.random()-.5)*.2,.5,12)*10)/10;
    s.aevts=s.aevts.map(e=>({...e,tl:e.tl-1})).filter(e=>e.tl>0);
    EVENTS.forEach(ed=>{
      if(Math.random()<ed.prob){
        if(ed.t==="co"){const el=s.cos.filter(c=>!s.aevts.find(a=>a.id===ed.id&&a.tk===c.t));if(el.length){const tg=el[Math.floor(Math.random()*el.length)];s.aevts.push({...ed,tk:tg.t,tl:ed.dur,dur:ed.dur});s.newsLog.unshift({t:s.turn,ico:ed.ico,ti:ed.n+" — "+tg.n,g:ed.good});}}
        else if(!s.aevts.find(a=>a.id===ed.id)){s.aevts.push({...ed,tl:ed.dur,dur:ed.dur});s.newsLog.unshift({t:s.turn,ico:ed.ico,ti:ed.n,g:ed.good});}
      }
    });
    s.cos=s.cos.map(c=>{
      const pp=c.price,eps=pp/c.pe,bnd=PEB[c.s]||{mn:10,mx:35};
      const macro=cl(1+(s.gdp/100*.35*c.b)-(s.inf/100*.15)-(s.intr/100*.15*c.b),.94,1.06);
      let em=0;s.aevts.forEach(e=>{if(e.t==="mkt"&&(!e.sec||e.sec.includes(c.s)))em+=(e.sent||0)*(e.tl/e.dur)*.10;if(e.t==="co"&&e.tk===c.t)em+=(e.imp||0)*(e.tl/e.dur)*.10;});
      // Early game boost (turns 1-100): ±10% instead of ±6%
      const vol=s.turn<100?.10:.06;
      let np=cl(pp*(1+(Math.random()-.5)*vol*c.b)*macro*(1+em*.3),pp*.94,pp*1.06);
      if(np/eps<bnd.mn)np=eps*bnd.mn;if(np/eps>bnd.mx)np=eps*bnd.mx;
      np=Math.max(.5,Math.round(np*100)/100);
      return{...c,pp,price:np,pe:Math.round(np/eps*10)/10,ch:(np-pp)/pp,hist:[...c.hist.slice(-60),np]};
    });
    // Quarterly dividends every 30 turns (faster for testing)
    if(s.turn%30===0){
      let divTotal=0;
      const divDetail=[];
      Object.entries(s.sh).forEach(([t,n])=>{const c=s.cos.find(x=>x.t===t);if(c&&n>0){const amt=Math.round(c.price*(c.div/100/4)*n*100)/100;divTotal+=amt;divDetail.push({t:c.t,n:c.n,amt,shares:n,priceAtDiv:c.price});}});
      if(divTotal>0){s.cash=Math.round((s.cash+divTotal)*100)/100;s.totalDiv+=divTotal;s.divLog.unshift({turn:s.turn,total:divTotal,detail:divDetail});s.newsLog.unshift({t:s.turn,ico:"💰",ti:"Dividends: "+fm(divTotal),g:true});}
    }
    s.newsLog=s.newsLog.slice(0,50);
    refresh();
  },[refresh]);

  useEffect(()=>{
    if(!auto){clearInterval(aRef.current);return;}
    clearInterval(aRef.current);
    aRef.current=setInterval(()=>advance(),speedRef.current*1000);
    return()=>clearInterval(aRef.current);
  },[auto,speed,advance]);

  const doTrade=(type,item,mode,qty)=>{
    const s=S.current,isBuy=mode==="buy",q=Math.floor(qty);if(q<1)return;
    const cost=Math.round(q*item.price*100)/100;
    if(isBuy){
      if(cost>s.cash){toast_("Need "+fm(cost)+" — have "+fm(s.cash),false);return;}
      s.sh[item.t]=(s.sh[item.t]||0)+q;
      const prev=(s.sh[item.t]-q)||0;
      s.avgSh[item.t]=Math.round(((s.avgSh[item.t]||item.price)*prev+cost)/s.sh[item.t]*100)/100;
      s.cash=Math.round((s.cash-cost)*100)/100;
      s.txLog.unshift({t:s.turn,type:"BUY",ticker:item.t,qty:q,price:item.price,total:cost});
      toast_("Bought "+q.toLocaleString()+" "+item.t+" @ "+fm(item.price));
    }else{
      const held=s.sh[item.t]||0;if(q>held){toast_("Only "+held+" held",false);return;}
      const profit=Math.max(0,(item.price-(s.avgSh[item.t]||item.price))*q);
      const cgt=Math.round(profit*.20*100)/100;
      const net=cost-cgt;
      s.cash=Math.round((s.cash+net)*100)/100;
      s.sh[item.t]=held-q;if(!s.sh[item.t])delete s.sh[item.t];
      s.totalCgt+=cgt;
      s.txLog.unshift({t:s.turn,type:"SELL",ticker:item.t,qty:q,price:item.price,total:cost,profit,cgt});
      toast_("Sold "+q.toLocaleString()+" "+item.t+" · CGT: "+fm(cgt));
    }
    setTrM(null);setTrAmt(null);refresh();
  };

  const d=D;
  const SH=d.sh||{};
  const sv=Object.entries(SH).reduce((x,[t,n])=>{const c=d.cos.find(y=>y.t===t);return x+(c?c.price*n:0);},0);
  const nw=d.cash+sv;

  const MC=({hist,w=68,h=26})=>{if(!hist||hist.length<2)return null;const mn=Math.min(...hist)*.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={hist[hist.length-1]>=(hist[0]||0)?G:R} strokeWidth="1.8" strokeLinejoin="round"/></svg>;};
  const Bdg=({v})=><span style={{background:v>=0?"#E8F5E9":"#FFEBEE",color:v>=0?G:R,padding:"2px 6px",borderRadius:20,fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{pc(v*100)}</span>;

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
    <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",padding:"14px 16px",color:"#fff"}}>
      <div style={{fontSize:11,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>SIM FILE 2 — Earth Stock Market</div>
      <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>{fm(nw)}</div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        {[["Turn",d.turn],["Cash",fm(d.cash)],["Stocks",fm(sv)],["GDP",(d.gdp>=0?"+":"")+d.gdp+"%"]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.12)",borderRadius:8,padding:"6px 6px",textAlign:"center"}}><div style={{fontSize:8,opacity:.6,textTransform:"uppercase",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:800}}>{v}</div></div>)}
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <button onClick={advance} disabled={auto} style={{flex:2,background:auto?"rgba(255,255,255,.1)":"rgba(255,255,255,.25)",color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:800,fontSize:13,cursor:auto?"not-allowed":"pointer"}}>▶ Next Turn</button>
        <button onClick={()=>setAuto(a=>!a)} style={{flex:1,background:auto?"#B71C1C":"rgba(255,255,255,.15)",color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>{auto?"⏹ Stop":"Auto"}</button>
        <div style={{display:"flex",gap:3}}>
          {[.5,1,5,10].map(s2=><button key={s2} onClick={()=>setSpeed(s2)} style={{padding:"5px 7px",borderRadius:7,border:"1.5px solid "+(speed===s2?"#fff":"rgba(255,255,255,.3)"),background:speed===s2?"rgba(255,255,255,.3)":"transparent",color:"#fff",fontWeight:700,fontSize:9,cursor:"pointer"}}>{s2<1?"0.5s":s2+"s"}</button>)}
        </div>
      </div>
    </div>
    <div style={{background:"#1B5E20",padding:"3px 0",overflow:"hidden"}}>
      <div style={{display:"flex",gap:14,whiteSpace:"nowrap",animation:"scroll 28s linear infinite",width:"max-content"}}>
        {[...d.cos,...d.cos].map((c,i)=><span key={i} style={{fontSize:10,fontFamily:"monospace",color:"rgba(255,255,255,.45)",display:"inline-flex",gap:4}}><span style={{color:"rgba(255,255,255,.7)",fontWeight:700}}>{c.t}</span><span style={{color:(c.ch||0)>=0?"#69F0AE":"#FF5252"}}>{fm(c.price)} {(c.ch||0)>=0?"▲":"▼"}{Math.abs((c.ch||0)*100).toFixed(2)}%</span></span>)}
      </div>
    </div>
    <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #e0e0e0"}}>
      {[{id:"market",l:"Markets"},{id:"co",l:"Company"},{id:"port",l:"Portfolio"},{id:"div",l:"Dividends"},{id:"news",l:"News"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 4px",border:"none",borderBottom:"3px solid "+(tab===t.id?G:"transparent"),background:"#fff",color:tab===t.id?G:"#888",fontWeight:700,fontSize:10,cursor:"pointer"}}>{t.l}</button>)}
    </div>
    <div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
      {tab==="market"&&<div style={{background:"#fff",borderRadius:13,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {d.cos.map((c,i)=><div key={c.t} onClick={()=>{setSelCo(c);setTab("co");}} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",borderBottom:i<d.cos.length-1?"1px solid #f5f5f5":"none",cursor:"pointer"}}>
          <div style={{width:36,height:36,borderRadius:9,background:SH[c.t]>0?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:SH[c.t]>0?G:"#999",border:"1px solid "+(SH[c.t]>0?"#C8E6C9":"#e0e0e0"),flexShrink:0}}>{c.t}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:DK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.n}</div><div style={{fontSize:10,color:"#aaa"}}>{c.s} · P/E {c.pe.toFixed(1)}× {SH[c.t]>0?"· "+SH[c.t].toLocaleString()+" held":""}</div></div>
          <MC hist={c.hist}/>
          <div style={{textAlign:"right",minWidth:68}}><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{fm(c.price)}</div><Bdg v={c.ch||0}/></div>
        </div>)}
      </div>}

      {tab==="co"&&(()=>{
        const c=selCo?d.cos.find(x=>x.t===selCo.t)||selCo:null;
        if(!c)return <div style={{padding:40,textAlign:"center",color:"#aaa"}}>← Select a company from Markets tab</div>;
        const held=SH[c.t]||0,avgC=d.avgSh?.[c.t]||c.price,pl=held?(c.price-avgC)*held:0;
        const ev=d.aevts.find(e=>e.t==="co"&&e.tk===c.t);
        const maxBuy=Math.floor(d.cash/c.price);
        const presets=[1,5,10,50,100,500,1000,maxBuy].filter((v,i,a)=>v<=maxBuy&&v>0&&a.indexOf(v)===i).sort((a,b)=>a-b).slice(-8);
        const ratingColor=c.analyst==="STRONG BUY"?"#1B5E20":c.analyst==="BUY"?G:c.analyst==="HOLD"?AU:c.analyst==="SELL"?R:"#607D8B";
        return <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:14,padding:16,color:"#fff"}}>
            <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{c.s} · {c.r}</div>
            <div style={{fontSize:19,fontWeight:800,marginBottom:2}}>{c.n}</div>
            <div style={{fontSize:10,opacity:.6,marginBottom:8}}>{c.t} · {c.hq} · Est. {c.yr} · {((c.emp||0)/1000).toFixed(0)}K staff</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              <div><div style={{fontFamily:"monospace",fontSize:28,fontWeight:800,lineHeight:1}}>{fm(c.price)}</div><div style={{fontSize:12,marginTop:3,color:(c.ch||0)>=0?"#C8E6C9":"#FFCDD2"}}>{(c.ch||0)>=0?"▲":"▼"} {pc((c.ch||0)*100)} this turn</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:10,opacity:.45,marginBottom:2}}>P/E</div><div style={{fontSize:18,fontWeight:800,fontFamily:"monospace"}}>{c.pe.toFixed(1)}×</div></div>
            </div>
          </div>
          {ev&&<div style={{background:ev.good?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:10,border:"1px solid "+(ev.good?"#A5D6A7":"#EF9A9A"),display:"flex",gap:9,alignItems:"center"}}><span style={{fontSize:16}}>{ev.ico}</span><div><div style={{fontSize:12,fontWeight:700,color:ev.good?G:R}}>Active: {ev.n}</div><div style={{fontSize:10,color:"#888"}}>{ev.tl}/{ev.dur} turns remaining</div></div></div>}
          <div style={{background:ratingColor,borderRadius:11,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:10,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Analyst Rating</div><div style={{fontSize:19,fontWeight:800,color:"#fff"}}>{c.analyst||"HOLD"}</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>{(c.rating||3.5).toFixed(1)}/5.0</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"rgba(255,255,255,.7)",marginBottom:2}}>Target</div><div style={{fontSize:19,fontWeight:800,color:"#fff",fontFamily:"monospace"}}>{fm(c.target||c.ip)}</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>{(c.target||c.ip)>c.price?"▲ "+fm((c.target||c.ip)-c.price)+" upside":"▼ "+fm(c.price-(c.target||c.ip))+" downside"}</div></div>
          </div>
          <div style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>📖 The Story</div>
            <div style={{fontSize:12,color:"#444",lineHeight:1.8,marginBottom:10}}>{c.origin}</div>
            <div style={{display:"flex",gap:6}}>
              {[["Founded by",c.founder||"—"],["Est. · HQ",c.yr+" · "+(c.hq||"—")],["CEO",c.ceo||"—"]].map(([k,v])=><div key={k} style={{flex:1,background:"#f8fbf8",borderRadius:8,padding:"7px 8px",border:"1px solid #eee"}}><div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.4,marginBottom:2}}>{k}</div><div style={{fontSize:10,fontWeight:700,color:DK}}>{v}</div></div>)}
            </div>
          </div>
          <div style={{background:"#EDE7F6",borderRadius:11,padding:11,border:"1px solid #D1C4E9"}}><div style={{fontSize:12,fontWeight:700,color:PU,marginBottom:5}}>🌍 Operations</div><div style={{fontSize:12,color:"#444",lineHeight:1.7}}>{c.ops}</div></div>
          {held>0&&<div style={{background:"#E8F5E9",borderRadius:11,padding:11,border:"1px solid #A5D6A7"}}>
            <div style={{fontSize:12,fontWeight:700,color:G,marginBottom:8}}>Your Position</div>
            <div style={{display:"flex",gap:6}}>
              {[["Shares",held.toLocaleString()],["Value",fm(c.price*held)],["Avg Cost",fm(avgC)],["P&L",(pl>=0?"+":"")+fm(pl)]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.7)",borderRadius:7,padding:"7px 6px",textAlign:"center"}}><div style={{fontSize:8,color:"#888",textTransform:"uppercase",marginBottom:2}}>{k}</div><div style={{fontSize:11,fontWeight:700,color:k==="P&L"?(pl>=0?G:R):DK,fontFamily:"monospace"}}>{v}</div></div>)}
            </div>
          </div>}
          {/* Buy/Sell */}
          {trM&&trM.t===c.t?<div style={{background:"#fff",borderRadius:12,padding:13,border:"2px solid "+(trM.mode==="buy"?G:R)}}>
            <div style={{display:"flex",background:"#f0f4f0",borderRadius:9,padding:3,gap:2,marginBottom:10}}>
              {["buy","sell"].map(m=><button key={m} onClick={()=>{setTrM({t:c.t,mode:m});setTrAmt(null);}} style={{flex:1,padding:"8px 0",borderRadius:7,border:"none",background:trM.mode===m?"#fff":"transparent",color:trM.mode===m?(m==="buy"?G:R):"#999",fontWeight:700,fontSize:12,cursor:"pointer",boxShadow:trM.mode===m?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{m==="buy"?"📈 Buy":"📉 Sell"}</button>)}
            </div>
            <div style={{fontSize:11,color:"#aaa",marginBottom:7}}>{trM.mode==="buy"?"Max: "+maxBuy.toLocaleString()+" shares ("+fm(d.cash)+" available)":"Held: "+(SH[c.t]||0).toLocaleString()+" shares"}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
              {(trM.mode==="buy"?presets:[1,5,10,Math.floor((SH[c.t]||0)/4),Math.floor((SH[c.t]||0)/2),SH[c.t]||0].filter((v,i,a)=>v>0&&a.indexOf(v)===i)).slice(-8).map(v=><button key={v} onClick={()=>setTrAmt(v)} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(trAmt===v?(trM.mode==="buy"?G:R):"#e0e0e0"),background:trAmt===v?(trM.mode==="buy"?"#E8F5E9":"#FFEBEE"):"#fafafa",color:trAmt===v?(trM.mode==="buy"?G:R):"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{v>=1000?(v/1000).toFixed(0)+"K":v}</button>)}
            </div>
            {trAmt>0&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>Qty</span><span style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{trAmt.toLocaleString()} shares</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>Price</span><span style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{fm(c.price)}/sh</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>{trM.mode==="buy"?"Total Cost":"Gross Proceeds"}</span><span style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{fm(Math.round(trAmt*c.price*100)/100)}</span></div>
              {trM.mode==="sell"&&<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:12,color:"#666"}}>CGT 20% on profit</span><span style={{fontSize:12,fontWeight:700,color:R,fontFamily:"monospace"}}>−{fm(Math.round(Math.max(0,c.price-(d.avgSh?.[c.t]||c.price))*trAmt*.20*100)/100)}</span></div>}
            </div>}
            <button onClick={()=>doTrade("stock",c,trM.mode,trAmt||0)} disabled={!(trAmt>0)} style={{width:"100%",background:!(trAmt>0)?"#e0e0e0":trM.mode==="buy"?G:R,color:"#fff",border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,fontSize:13,cursor:trAmt>0?"pointer":"not-allowed"}}>
              {trAmt>0?"Confirm "+(trM.mode==="buy"?"Buy":"Sell")+" "+trAmt.toLocaleString()+" "+c.t+" = "+fm(Math.round(trAmt*c.price*100)/100):"Select quantity"}
            </button>
            <button onClick={()=>{setTrM(null);setTrAmt(null);}} style={{width:"100%",background:"none",border:"none",color:"#aaa",padding:"8px 0",cursor:"pointer",fontSize:12,marginTop:4}}>Cancel</button>
          </div>:<div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setTrM({t:c.t,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:11,padding:13,fontWeight:800,fontSize:13,cursor:"pointer"}}>📈 Buy</button>
            <button onClick={()=>{setTrM({t:c.t,mode:"sell"});setTrAmt(null);}} disabled={!held} style={{flex:1,background:held?"#FFEBEE":"#f0f0f0",color:held?R:"#bbb",border:"1.5px solid "+(held?"#EF9A9A":"#e0e0e0"),borderRadius:11,padding:13,fontWeight:800,fontSize:13,cursor:held?"pointer":"not-allowed"}}>📉 Sell {held>0?"("+held.toLocaleString()+")":""}</button>
          </div>}
          <div style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:8}}>Price History</div>
            <div style={{height:52,display:"flex",alignItems:"flex-end",gap:2}}>
              {(c.hist||[]).slice(-40).map((pr,i,arr)=>{const mn=Math.min(...arr),mx=Math.max(...arr),rng=mx-mn||1;const h=Math.max(4,Math.round(((pr-mn)/rng)*48));return <div key={i} style={{flex:1,height:h,background:(i===0||pr>=arr[i-1])?G:R,borderRadius:"2px 2px 0 0",opacity:.8}}/>;})}</div>
          </div>
        </div>;
      })()}

      {tab==="port"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div style={{fontSize:14,fontWeight:700,color:DK}}>Holdings</div><div style={{fontSize:12,color:"#888"}}>Cash: {fm(d.cash)}</div></div>
          {Object.keys(SH).filter(t=>(SH[t]||0)>0).length===0&&<div style={{fontSize:12,color:"#bbb",padding:"15px 0",textAlign:"center"}}>No stocks held. Go to Markets tab to buy.</div>}
          {Object.entries(SH).filter(([,n])=>n>0).map(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(!c)return null;const avgC=d.avgSh?.[t]||c.price,pl=(c.price-avgC)*n;
            return <div key={t} style={{padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,cursor:"pointer"}} onClick={()=>{setSelCo(c);setTab("co");}}>
                <div style={{width:34,height:34,borderRadius:8,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:G,border:"1px solid #C8E6C9",flexShrink:0}}>{t}</div>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:10,color:"#aaa"}}>{n.toLocaleString()} shs · avg {fm(avgC)}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{fm(c.price*n)}</div><div style={{fontSize:10,fontFamily:"monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</div></div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{setSelCo(c);setTab("co");setTrM({t:c.t,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>+ More</button>
                <button onClick={()=>doTrade("stock",c,"sell",Math.floor(n/2))} style={{flex:1,background:"#FFF3E0",color:AU,border:"1px solid #FFCC80",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell 50%</button>
                <button onClick={()=>doTrade("stock",c,"sell",n)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell All</button>
              </div>
            </div>;})}
        </div>
        <div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Transaction Log</div>
          {(d.txLog||[]).length===0&&<div style={{fontSize:12,color:"#bbb",padding:"10px 0"}}>No transactions yet.</div>}
          {(d.txLog||[]).slice(0,15).map((tx,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div><div style={{fontSize:11,fontWeight:700,color:tx.type==="BUY"?G:R}}>{tx.type} {tx.ticker}</div><div style={{fontSize:10,color:"#aaa"}}>T{tx.t} · {tx.qty.toLocaleString()} × {fm(tx.price)}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:tx.type==="BUY"?R:G}}>{tx.type==="BUY"?"-":"+"+""}{fm(tx.total)}</div>{tx.cgt>0&&<div style={{fontSize:9,color:R}}>CGT: {fm(tx.cgt)}</div>}</div>
          </div>)}
        </div>
        <div style={{background:"#E8F5E9",borderRadius:13,padding:13,border:"1px solid #A5D6A7"}}>
          <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:8}}>Earnings Summary</div>
          {[["Total Dividends Received",fm(d.totalDiv||0)],["Total CGT Paid","-"+fm(d.totalCgt||0)],["Net From Market",((d.totalDiv||0)-(d.totalCgt||0))>=0?"+"+fm((d.totalDiv||0)-(d.totalCgt||0)):fm((d.totalDiv||0)-(d.totalCgt||0))]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(0,0,0,.05)"}}><span style={{fontSize:12,color:"#555"}}>{k}</span><span style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:k.includes("CGT")?R:G}}>{v}</span></div>)}
        </div>
      </div>}

      {tab==="div"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:"#E8F5E9",borderRadius:13,padding:13,border:"1px solid #A5D6A7"}}>
          <div style={{fontSize:14,fontWeight:700,color:G,marginBottom:8}}>💰 Dividend Dashboard</div>
          <div style={{fontSize:12,color:"#555",marginBottom:10,lineHeight:1.6}}>Dividends paid every 30 turns (quarterly). Annual yield ÷ 4 per payment. 15% withholding tax applied.</div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {[["Total Earned",fm(d.totalDiv||0)],["Holdings",Object.keys(SH).filter(t=>(SH[t]||0)>0).length+" stocks"],["Next Payment","Turn "+Math.ceil(d.turn/30)*30]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.8)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}><div style={{fontSize:9,color:"#888",textTransform:"uppercase",marginBottom:2}}>{k}</div><div style={{fontSize:12,fontWeight:800,color:G}}>{v}</div></div>)}
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Expected Next Payment</div>
          {Object.keys(SH).filter(t=>(SH[t]||0)>0).length===0?<div style={{fontSize:12,color:"#bbb",padding:"10px 0"}}>Buy dividend-paying stocks to earn dividends.</div>:Object.entries(SH).filter(([,n])=>n>0).map(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(!c)return null;const quarterly=Math.round(c.price*(c.div/100/4)*n*100)/100;
            return <div key={t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
              <div><div style={{fontSize:12,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:10,color:"#aaa"}}>{n.toLocaleString()} × {fm(c.price)} × {c.div}%/yr ÷ 4</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:G,fontFamily:"monospace"}}>{fm(quarterly)}</div><div style={{fontSize:10,color:"#aaa"}}>per quarter</div></div>
            </div>;})}
          {Object.keys(SH).filter(t=>(SH[t]||0)>0).length>0&&<div style={{background:"#f8fbf8",borderRadius:8,padding:"8px 10px",marginTop:8}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#555",fontWeight:600}}>Total next payment</span><span style={{fontSize:13,fontWeight:800,color:G,fontFamily:"monospace"}}>{fm(Object.entries(SH).filter(([,n])=>n>0).reduce((x,[t,n])=>{const c=d.cos.find(y=>y.t===t);return x+(c?Math.round(c.price*(c.div/100/4)*n*100)/100:0);},0))}</span></div></div>}
        </div>
        {(d.divLog||[]).length>0&&<div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Dividend History</div>
          {(d.divLog||[]).slice(0,8).map((dl,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:"#888"}}>Turn {dl.turn}</span><span style={{fontSize:13,fontWeight:800,color:G,fontFamily:"monospace"}}>{fm(dl.total)}</span></div>{dl.detail.map((d2,j)=><div key={j} style={{fontSize:10,color:"#aaa",marginLeft:8}}>{d2.t}: {d2.shares.toLocaleString()} × {fm(d2.priceAtDiv)} × {d2.shares>0?((d2.amt/(d2.priceAtDiv*d2.shares))*400).toFixed(2):"0"}%yr ÷ 4 = {fm(d2.amt)}</div>)}</div>)}
        </div>}
      </div>}

      {tab==="news"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {d.aevts.length>0&&<div style={{background:"#fff",borderRadius:12,padding:12,border:"1px solid #e8ebe8"}}><div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:8}}>Active Events</div>
          {d.aevts.map((e,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}><span style={{fontSize:16}}>{e.ico}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:e.good?G:R}}>{e.n}{e.tk?" — "+e.tk:""}</div><div style={{fontSize:10,color:"#888"}}>{e.tl}/{e.dur} turns remaining</div></div></div>)}
        </div>}
        {(d.newsLog||[]).map((n,i)=><div key={i} style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8",display:"flex",gap:9}}><div style={{width:4,borderRadius:2,flexShrink:0,background:n.g?G:R,alignSelf:"stretch"}}/><div><div style={{fontSize:10,color:"#ccc",marginBottom:2}}>Turn {n.t} · {n.ico}</div><div style={{fontSize:12,fontWeight:600,color:DK}}>{n.ti}</div></div></div>)}
      </div>}
    </div>
    {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100%-32px)",maxWidth:398,background:toast.g?G:R,borderRadius:10,padding:"11px 15px",color:"#fff",fontSize:12,fontWeight:700,zIndex:200,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>{toast.msg}</div>}
    <style>{"@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
  </div>;
}
