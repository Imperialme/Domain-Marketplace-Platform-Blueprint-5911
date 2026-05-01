import{useState,useRef,useCallback,useEffect}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);

const COMPANIES=[
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",price:348.94,pe:18.4,div:.8,b:1.8,yr:2008,
   ceo:{name:"Dr. Lin Wei",rep:82,tenure:17,style:"Growth-focused",track:"Strong"},
   desc:"AI and cloud leader across 18 Asia Pacific markets."},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",price:198.40,pe:22.1,div:1.2,b:.8,yr:2005,
   ceo:{name:"Dr. Sarah Chen",rep:78,tenure:12,style:"Conservative",track:"Steady"},
   desc:"Medical devices, diagnostics and hospital management."},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",price:351.54,pe:11.3,div:1.8,b:1.2,yr:1995,
   ceo:{name:"Sheikh Rashid Al-Mansouri",rep:71,tenure:22,style:"Dividend-focused",track:"Reliable"},
   desc:"Third-largest petroleum producer in the Gulf."},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",price:15.80,pe:8.5,div:.5,b:1.6,yr:2005,
   ceo:{name:"Amara Diallo",rep:65,tenure:8,style:"Aggressive",track:"Volatile"},
   desc:"Pan-African critical minerals group."},
  {t:"UTLS",n:"Utility Systems",s:"Utilities",price:58.40,pe:14.2,div:4.2,b:.5,yr:1950,
   ceo:{name:"Robert Keller",rep:74,tenure:9,style:"Income-focused",track:"Stable"},
   desc:"US regulated electric and gas utility."},
];

// Pre-loaded CEO decisions — player sees these immediately
const PRELOADED_DECISIONS=[
  {id:1,ticker:"SLKT",company:"Silk Road Tech",ceo:"Dr. Lin Wei",type:"acquisition",turn:15,
   headline:"ACQUISITION OPPORTUNITY",
   context:"Dr. Lin Wei proposes acquiring a Korean AI startup for $2.8B. This would add 400 engineers and key patents.",
   opts:[
     {l:"Approve Acquisition",detail:"Add $2.8B debt. +15% revenue next 20 turns. Stock +8% on news.",priceImp:.08,repImp:5,good:true},
     {l:"Counter at $2.1B",detail:"Negotiate lower price. 60% chance deal completes. Stock +3% if success.",priceImp:.03,repImp:2,good:true},
     {l:"Decline — too expensive",detail:"No debt added. Rival may acquire instead. Stock −2%.",priceImp:-.02,repImp:-1,good:false},
   ],worstOpt:2,timeLimit:10},
  {id:2,ticker:"MDCR",company:"MediCore Group",ceo:"Dr. Sarah Chen",type:"dividend",turn:22,
   headline:"DIVIDEND POLICY DECISION",
   context:"Dr. Chen proposes increasing the annual dividend from 1.2% to 1.8% to attract income investors.",
   opts:[
     {l:"Increase to 1.8%",detail:"Higher yield attracts income investors. Stock +4%. Less cash for R&D.",priceImp:.04,repImp:4,good:true},
     {l:"Maintain 1.2%",detail:"Preserve R&D spending. No immediate impact.",priceImp:0,repImp:0,good:true},
     {l:"Cut to 0.8%",detail:"More cash for pipeline. Stock −5% short-term. Better long-term.",priceImp:-.05,repImp:-3,good:false},
   ],worstOpt:2,timeLimit:10},
  {id:3,ticker:"TNPT",company:"Titan Petroleum",ceo:"Sheikh Rashid",type:"expansion",turn:31,
   headline:"MARKET EXPANSION",
   context:"Sheikh Rashid proposes opening operations in Kazakhstan — estimated $500M investment, 8% revenue uplift.",
   opts:[
     {l:"Approve Kazakhstan expansion",detail:"$500M capex. +8% revenue over 30 turns. New regional exposure.",priceImp:.06,repImp:5,good:true},
     {l:"Smaller pilot first ($100M)",detail:"Test market with limited exposure. Lower risk, lower reward.",priceImp:.02,repImp:2,good:true},
     {l:"Stay focused on Gulf",detail:"No expansion. Preserve capital. Conservative.",priceImp:-.01,repImp:-2,good:false},
   ],worstOpt:2,timeLimit:10},
  {id:4,ticker:"FRMN",company:"Frontier Mining",ceo:"Amara Diallo",type:"cost_cut",turn:8,
   headline:"COST RESTRUCTURING PROPOSAL",
   context:"Amara Diallo proposes cutting 2,000 workers (7% of staff) to improve margins by 4%.",
   opts:[
     {l:"Approve restructuring",detail:"−2,000 jobs. +4% margin. Stock +6%. ESG risk.",priceImp:.06,repImp:-4,good:true},
     {l:"Smaller cut — 800 workers",detail:"−800 jobs. +1.5% margin. More palatable.",priceImp:.02,repImp:-1,good:true},
     {l:"Reject — invest in efficiency",detail:"No cuts. Find margin through technology instead. Slower.",priceImp:-.02,repImp:3,good:false},
   ],worstOpt:2,timeLimit:10},
];

export default function CEOSim(){
  const[tab,setTab]=useState("decisions");
  const[speed,setSpeed]=useState(1);
  const[auto,setAuto]=useState(false);
  const speedRef=useRef(1);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  const aRef=useRef(null);
  const[toast,setToast]=useState(null);
  const[selCoT,setSelCoT]=useState(null);
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2800);},[]);

  const S=useRef(null);
  if(!S.current){S.current={
    turn:1,cash:1000000,
    cos:COMPANIES.map(c=>({...c,hist:[c.price],ownership:0})),
    sh:{},avgSh:{},
    decisions:[...PRELOADED_DECISIONS],
    resolvedDecisions:[],
    ceoLog:[
      {turn:1,ticker:"SYSTEM",msg:"CEO Decision System online. Decisions fire every 30 turns for companies you own 10%+. Pre-loaded 4 example decisions for demo.",good:true},
      {turn:1,ticker:"SLKT",msg:"Dr. Lin Wei (CEO Rep: 82/100) — Track record: Strong. Style: Growth-focused. Watch for acquisition opportunities.",good:true},
      {turn:1,ticker:"MDCR",msg:"Dr. Sarah Chen (CEO Rep: 78/100) — Track record: Steady. Style: Conservative. Pipeline management is key.",good:true},
      {turn:1,ticker:"TNPT",msg:"Sheikh Rashid (CEO Rep: 71/100) — Track record: Reliable. Style: Dividend-focused. Gulf expansion ongoing.",good:true},
    ],
    boardLog:[
      {turn:1,action:"System","msg":"Board access unlocked at 10%+ ownership. Demo showing all three tiers below.",good:true},
    ],
  };}
  const[D,setD]=useState(()=>({...S.current}));
  const refresh=useCallback(()=>setD({...S.current}),[]);

  const advance=useCallback(()=>{
    const s=S.current;s.turn++;
    // Update prices
    s.cos=s.cos.map(c=>{
      const pp=c.price,move=1+(Math.random()-.5)*.08*c.b;
      const np=cl(Math.round(pp*move*100)/100,pp*.94,pp*1.06);
      return{...c,price:Math.max(.50,np),hist:[...c.hist.slice(-50),np]};
    });
    // Fire new decisions every 30 turns for owned companies
    if(s.turn%30===0){
      const owned=s.cos.filter(c=>(s.sh[c.t]||0)>0&&c.ownership>=10);
      if(owned.length>0){
        const tg=owned[Math.floor(Math.random()*owned.length)];
        const decTypes=[
          {type:"dividend",headline:"DIVIDEND REVIEW",context:tg.ceo.name+" is reviewing the dividend policy for "+tg.n+". What direction should the company take?",opts:[{l:"Raise dividend 20%",detail:"Higher yield. Stock +3%. Less retained cash.",priceImp:.03,repImp:3,good:true},{l:"Maintain current",detail:"No change. Stable.",priceImp:0,repImp:0,good:true},{l:"Cut dividend 15%",detail:"More cash for growth. Short-term pain.",priceImp:-.04,repImp:-2,good:false}],worstOpt:2},
          {type:"expansion",headline:"NEW MARKET OPPORTUNITY",context:tg.ceo.name+" has identified a new market opportunity in "+["Southeast Asia","West Africa","Eastern Europe","Latin America"][Math.floor(Math.random()*4)]+".",opts:[{l:"Invest fully ($500M)",detail:"Full commitment. High upside, high risk.",priceImp:.07,repImp:5,good:true},{l:"Pilot programme ($100M)",detail:"Test first. Lower risk.",priceImp:.02,repImp:2,good:true},{l:"Pass",detail:"Focus on core markets.",priceImp:-.01,repImp:-1,good:false}],worstOpt:2},
        ];
        const dec=decTypes[Math.floor(Math.random()*decTypes.length)];
        s.decisions=[...s.decisions,{id:Math.random(),ticker:tg.t,company:tg.n,ceo:tg.ceo.name,turn:s.turn,...dec,timeLimit:10}];
        s.ceoLog.unshift({turn:s.turn,ticker:tg.t,msg:"NEW DECISION: "+dec.headline+" — "+tg.ceo.name+" requires your input. "+Math.max(1,10)+" turns to decide.",good:true});
      }
    }
    // Auto-resolve decisions ignored for 10+ turns
    s.decisions=s.decisions.filter(dec=>{
      if(s.turn-dec.turn>dec.timeLimit){
        const worst=dec.opts[dec.worstOpt];
        const co=s.cos.find(c=>c.t===dec.ticker);
        if(co){
          const np=Math.max(.50,Math.round(co.price*(1+worst.priceImp)*100)/100);
          co.price=np;co.ceo.rep=Math.max(0,Math.min(100,co.ceo.rep+worst.repImp-5));
          s.ceoLog.unshift({turn:s.turn,ticker:dec.ticker,msg:"AUTO-RESOLVED (ignored "+dec.timeLimit+" turns): "+worst.l+". CEO rep −5. Price impact: "+(worst.priceImp>=0?"+":"")+Math.round(worst.priceImp*100)+"%",good:false});
          s.resolvedDecisions=[{...dec,chosen:worst,auto:true,resolvedTurn:s.turn},...s.resolvedDecisions].slice(0,20);
        }
        return false;
      }
      return true;
    });
    refresh();
  },[refresh]);

  useEffect(()=>{
    if(!auto){clearInterval(aRef.current);return;}
    clearInterval(aRef.current);
    aRef.current=setInterval(()=>advance(),speedRef.current*1000);
    return()=>clearInterval(aRef.current);
  },[auto,speed,advance]);

  const resolveDecision=(dec,optIdx)=>{
    const s=S.current;const opt=dec.opts[optIdx];
    const co=s.cos.find(c=>c.t===dec.ticker);
    if(!co)return;
    const pp=co.price;const np=Math.max(.50,Math.round(pp*(1+opt.priceImp)*100)/100);
    co.price=np;co.ceo.rep=Math.max(0,Math.min(100,co.ceo.rep+opt.repImp));
    s.decisions=s.decisions.filter(d=>d.id!==dec.id);
    s.resolvedDecisions=[{...dec,chosen:opt,auto:false,resolvedTurn:s.turn},...s.resolvedDecisions].slice(0,20);
    s.ceoLog.unshift({turn:s.turn,ticker:dec.ticker,msg:"YOU DECIDED: "+opt.l+" · "+dec.company+" · Price: "+fm(pp)+" → "+fm(np)+" ("+( opt.priceImp>=0?"+":"")+Math.round(opt.priceImp*100)+"%) · CEO Rep: "+co.ceo.rep+"/100",good:opt.good});
    s.boardLog.unshift({turn:s.turn,action:dec.ticker,msg:"Board vote cast: "+opt.l+". Proposal "+( opt.good?"approved":"rejected")+". "+dec.company+" CEO notified.",good:opt.good});
    toast_("Decision made: "+opt.l+" · "+dec.company);refresh();
  };

  const buyShares=(ticker,qty)=>{
    const s=S.current;const co=s.cos.find(c=>c.t===ticker);
    if(!co)return;const cost=Math.round(qty*co.price*100)/100;
    if(cost>s.cash){toast_("Insufficient cash",false);return;}
    const prev=s.sh[ticker]||0;s.sh[ticker]=(prev)+qty;
    s.avgSh[ticker]=Math.round(((s.avgSh[ticker]||co.price)*prev+cost)/s.sh[ticker]*100)/100;
    s.cash=Math.round((s.cash-cost)*100)/100;
    // Update ownership % (simulated: 1B shares outstanding)
    co.ownership=Math.round(s.sh[ticker]/10000000*100)/100;// 1B shares, buy qty means pct
    const TOTAL_SHARES={SLKT:1200000000,MDCR:400000000,TNPT:900000000,FRMN:600000000,UTLS:300000000};
    co.ownership=Math.round((s.sh[ticker]/(TOTAL_SHARES[ticker]||500000000))*10000)/100;
    if(co.ownership>=10)s.boardLog.unshift({turn:s.turn,action:ticker,msg:"🎉 BOARD SEAT UNLOCKED at "+co.ownership.toFixed(2)+"% ownership in "+co.n+". You can now vote on dividends and CEO decisions.",good:true});
    if(co.ownership>=25)s.boardLog.unshift({turn:s.turn,action:ticker,msg:"🎉 SIGNIFICANT CONTROL at "+co.ownership.toFixed(2)+"% in "+co.n+". You can propose strategy changes.",good:true});
    if(co.ownership>=50)s.boardLog.unshift({turn:s.turn,action:ticker,msg:"🎉 MAJORITY CONTROL at "+co.ownership.toFixed(2)+"% in "+co.n+". You can replace the CEO and declare special dividends.",good:true});
    toast_("Bought "+qty.toLocaleString()+" "+ticker+" @ "+fm(co.price)+" · Ownership: "+co.ownership.toFixed(2)+"%");refresh();
  };

  const d=D;
  const SH=d.sh||{};
  const sv=Object.entries(SH).reduce((x,[t,n])=>{const c=d.cos.find(y=>y.t===t);return x+(c?c.price*n:0);},0);
  const nw=d.cash+sv;
  const pendingDecs=d.decisions||[];
  const hasPending=pendingDecs.length>0;

  const BoardTierCard=({pct,title,desc,actions,color,unlocked})=><div style={{background:unlocked?"#fff":"#f8f8f8",borderRadius:12,padding:13,border:"2px solid "+(unlocked?color:"#e0e0e0"),marginBottom:10,opacity:unlocked?1:.6}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <div style={{fontSize:13,fontWeight:800,color:unlocked?color:DK}}>{unlocked?"✅":"🔒"} {title}</div>
      <div style={{fontSize:11,fontWeight:700,color:unlocked?color:"#aaa",background:unlocked?color+"22":"#f0f0f0",padding:"2px 8px",borderRadius:20}}>{pct}%+</div>
    </div>
    <div style={{fontSize:11,color:"#888",marginBottom:unlocked?8:0,lineHeight:1.5}}>{desc}</div>
    {unlocked&&<div style={{display:"flex",flexWrap:"wrap",gap:6}}>
      {actions.map((a,i)=><button key={i} onClick={()=>toast_(a+" action initiated")} style={{background:color+"22",color,border:"1px solid "+color+"44",borderRadius:7,padding:"6px 10px",fontWeight:700,fontSize:11,cursor:"pointer"}}>{a}</button>)}
    </div>}
  </div>;

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
    {/* Header */}
    <div style={{background:"linear-gradient(135deg,#1A237E,#283593)",padding:"14px 16px 0",color:"#fff"}}>
      <div style={{fontSize:11,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>SIM FILE 4 — CEO Decision System</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div><div style={{fontSize:22,fontWeight:800}}>Turn {d.turn}</div><div style={{fontSize:12,opacity:.7}}>NW: {fm(nw)} · Cash: {fm(d.cash)}</div></div>
        {hasPending&&<div style={{background:"#F44336",borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:800,animation:"pulse 1s infinite"}}>⚠️ {pendingDecs.length} DECISION{pendingDecs.length>1?"S":""} PENDING</div>}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
        <button onClick={advance} disabled={auto} style={{flex:2,background:auto?"rgba(255,255,255,.1)":G,color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:12,cursor:auto?"not-allowed":"pointer"}}>▶ Turn</button>
        <button onClick={()=>setAuto(a=>!a)} style={{flex:1,background:auto?"#B71C1C":"rgba(255,255,255,.1)",color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>{auto?"⏹":"Auto"}</button>
        {[.5,1,5,10].map(s=><button key={s} onClick={()=>setSpeed(s)} style={{flex:1,background:speed===s?"rgba(255,255,255,.25)":"rgba(255,255,255,.1)",color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer"}}>{s<1?".5s":s+"s"}</button>)}
      </div>
      <div style={{display:"flex",gap:0}}>
        {[{id:"decisions",l:"Decisions"+(hasPending?" ("+pendingDecs.length+")":"")},{id:"companies",l:"Companies"},{id:"board",l:"Board Access"},{id:"log",l:"CEO Log"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px",border:"none",borderBottom:"3px solid "+(tab===t.id?"#fff":"transparent"),background:"transparent",color:tab===t.id?"#fff":"rgba(255,255,255,.5)",fontWeight:700,fontSize:10,cursor:"pointer"}}>{t.l}</button>)}
      </div>
    </div>

    <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
      {/* DECISIONS TAB */}
      {tab==="decisions"&&<>
        {pendingDecs.length===0&&<>
          <div style={{background:"#fff",borderRadius:14,padding:16,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:40,marginBottom:8,textAlign:"center"}}>✅</div>
            <div style={{fontSize:15,fontWeight:700,color:DK,marginBottom:6,textAlign:"center"}}>No Pending Decisions</div>
            <div style={{fontSize:12,color:"#888",lineHeight:1.6,textAlign:"center",marginBottom:14}}>Decisions fire every 30 turns for companies where you own 10%+.</div>
            <div style={{background:"#E3F2FD",borderRadius:11,padding:12,border:"1px solid #BBDEFB"}}>
              <div style={{fontSize:12,fontWeight:700,color:BL,marginBottom:8}}>How to take control of a company:</div>
              {[{pct:"0%",label:"No access",desc:"You own nothing. Go to Companies tab to buy shares.",c:"#aaa",done:false},{pct:"10%+",label:"Board Seat",desc:"Vote on dividends. Receive advance notice of CEO decisions.",c:G,done:false},{pct:"25%+",label:"Significant Control",desc:"Propose strategy. Veto acquisitions. Nominate directors.",c:BL,done:false},{pct:"50%+",label:"Majority Control",desc:"Replace CEO. Declare special dividends. Full control.",c:PU,done:false}].map((s,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:i<3?"1px solid rgba(0,0,0,.05)":"none",alignItems:"flex-start"}}>
                <div style={{width:44,height:44,borderRadius:10,background:s.c+"22",border:"2px solid "+s.c+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:s.c,flexShrink:0}}>{s.pct}</div>
                <div><div style={{fontSize:12,fontWeight:700,color:DK}}>{s.label}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{s.desc}</div></div>
              </div>)}
              <button onClick={()=>setTab("companies")} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:12,cursor:"pointer",marginTop:10}}>→ Go to Companies tab to buy shares</button>
            </div>
          </div>
        </>}
        {pendingDecs.map(dec=>{
          const co=d.cos.find(c=>c.t===dec.ticker);
          const turnsLeft=Math.max(0,dec.timeLimit-(d.turn-dec.turn));
          const urgent=turnsLeft<=3;
          return <div key={dec.id} style={{background:"#fff",borderRadius:14,border:"2px solid "+(urgent?"#B71C1C":"#1A237E"),overflow:"hidden"}}>
            <div style={{background:urgent?"linear-gradient(135deg,#7F1515,#B71C1C)":"linear-gradient(135deg,#1A237E,#283593)",padding:"12px 14px",color:"#fff"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div style={{fontSize:10,opacity:.7,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>👔 CEO Decision Required</div><div style={{fontSize:16,fontWeight:800}}>{dec.company}</div><div style={{fontSize:11,opacity:.8,marginTop:1}}>{dec.ceo} · {dec.type.replace("_"," ").toUpperCase()}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:800,color:urgent?"#FFCDD2":"#fff"}}>{turnsLeft}t</div><div style={{fontSize:9,opacity:.7}}>left to decide</div></div>
              </div>
            </div>
            <div style={{padding:14}}>
              <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:6}}>{dec.headline}</div>
              <div style={{fontSize:12,color:"#555",lineHeight:1.6,marginBottom:12,background:"#f8fbf8",borderRadius:9,padding:10}}>{dec.context}</div>
              {urgent&&<div style={{background:"#FFEBEE",borderRadius:8,padding:"8px 11px",marginBottom:10,fontSize:11,color:R,fontWeight:700}}>⚠️ URGENT: {turnsLeft} turns left. After that, the worst option is auto-applied and CEO reputation drops −5.</div>}
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {dec.opts.map((opt,i)=><button key={i} onClick={()=>resolveDecision(dec,i)} style={{padding:"11px 13px",borderRadius:10,border:"1.5px solid "+(opt.good?"#A5D6A7":"#EF9A9A"),background:opt.good?"#F8FFF8":"#FFF8F8",textAlign:"left",cursor:"pointer"}}>
                  <div style={{fontSize:13,fontWeight:700,color:opt.good?G:R,marginBottom:3}}>{opt.l}</div>
                  <div style={{fontSize:11,color:"#777"}}>{opt.detail}</div>
                  <div style={{display:"flex",gap:8,marginTop:5}}><span style={{fontSize:10,background:opt.priceImp>=0?"#E8F5E9":"#FFEBEE",color:opt.priceImp>=0?G:R,padding:"2px 6px",borderRadius:10,fontWeight:700}}>Stock {opt.priceImp>=0?"+":""}{Math.round(opt.priceImp*100)}%</span><span style={{fontSize:10,background:"#EDE7F6",color:PU,padding:"2px 6px",borderRadius:10,fontWeight:700}}>CEO Rep {opt.repImp>=0?"+":""}{opt.repImp}</span></div>
                </button>)}
              </div>
              {co&&<div style={{marginTop:10,padding:"8px 11px",background:"#f0f4f0",borderRadius:8,fontSize:11,color:"#666"}}>Current: {co.n} @ {fm(co.price)} · CEO Rep: {co.ceo.rep}/100 · Your ownership: {co.ownership.toFixed(2)}%</div>}
            </div>
          </div>;
        })}
        {(d.resolvedDecisions||[]).length>0&&<div style={{background:"#fff",borderRadius:14,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Resolved Decisions ({d.resolvedDecisions.length})</div>
          {(d.resolvedDecisions||[]).slice(0,5).map((dec,i)=><div key={i} style={{padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:12,fontWeight:700,color:DK}}>{dec.company}</span>
              <span style={{fontSize:10,color:dec.auto?R:"#888",fontWeight:dec.auto?700:400}}>{dec.auto?"AUTO-RESOLVED":"You decided"} T{dec.resolvedTurn}</span>
            </div>
            <div style={{fontSize:11,color:dec.chosen.good?G:R,fontWeight:600}}>{dec.chosen.l}</div>
            <div style={{fontSize:10,color:"#aaa"}}>{dec.headline}</div>
          </div>)}
        </div>}
      </>}

      {/* COMPANIES TAB */}
      {tab==="companies"&&<>
        {/* Note: all data reads from live d.cos array not cached selCo */}
        <div style={{background:"#E3F2FD",borderRadius:11,padding:11,border:"1px solid #BBDEFB",fontSize:12,color:BL,lineHeight:1.6}}>Buy shares to unlock board access. 10% = board seat · 25% = propose strategy · 50% = replace CEO. Cash: {fm(d.cash)}</div>
        {d.cos.map(c=>{
          const held=SH[c.t]||0;const val=held*c.price;const pct=c.ownership||0;
          const tier=pct>=50?"Majority Control":pct>=25?"Significant Control":pct>=10?"Board Seat":"No Access";
          const tierColor=pct>=50?PU:pct>=25?BL:pct>=10?G:"#aaa";
          return <div key={c.t} style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div><div style={{fontSize:14,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:11,color:"#888"}}>{c.t} · {c.s} · {c.yr}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,fontFamily:"monospace"}}>{fm(c.price)}</div><div style={{fontSize:10,color:tierColor,fontWeight:700}}>{tier}</div></div>
            </div>
            {/* CEO info */}
            <div style={{background:"#f8fbf8",borderRadius:9,padding:"9px 11px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontSize:12,fontWeight:700,color:DK}}>👔 {c.ceo.name}</div><div style={{fontSize:11,fontWeight:700,color:c.ceo.rep>=75?G:c.ceo.rep>=60?AU:R}}>{c.ceo.rep}/100 rep</div></div>
              <div style={{display:"flex",gap:6}}>
                {[["Tenure",c.ceo.tenure+"yrs"],["Style",c.ceo.style],["Track",c.ceo.track]].map(([k,v])=><div key={k} style={{flex:1,background:"#fff",borderRadius:6,padding:"5px 6px",textAlign:"center",border:"1px solid #eee"}}><div style={{fontSize:8,color:"#bbb",marginBottom:1}}>{k}</div><div style={{fontSize:10,fontWeight:700,color:DK}}>{v}</div></div>)}
              </div>
              {/* CEO rep bar */}
              <div style={{height:4,background:"#f0f0f0",borderRadius:2,overflow:"hidden",marginTop:7}}><div style={{height:"100%",width:c.ceo.rep+"%",background:c.ceo.rep>=75?G:c.ceo.rep>=60?AU:R,borderRadius:2,transition:"width .3s"}}/></div>
            </div>
            {/* Ownership */}
            <div style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:"#888"}}>Your ownership</span><span style={{fontSize:12,fontWeight:700,color:tierColor}}>{pct.toFixed(3)}%{held>0?" ("+held.toLocaleString()+" shares)":""}</span></div>
              <div style={{position:"relative",height:8,background:"#f0f0f0",borderRadius:4,overflow:"hidden",marginBottom:3}}>
                <div style={{position:"absolute",top:0,left:0,height:"100%",background:"linear-gradient(90deg,"+G+","+PU+")",borderRadius:4,width:Math.min(100,pct*2)+"%",transition:"width .3s"}}/>
                {[10,25,50].map(thresh=><div key={thresh} style={{position:"absolute",top:0,left:(thresh*2)+"%",width:2,height:"100%",background:"rgba(0,0,0,.15)"}}/>)}
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:8,color:"#ccc"}}>0%</span>
                <span style={{fontSize:8,color:pct>=10?G:"#ccc",fontWeight:pct>=10?700:400}}>{pct>=10?"✅":""} 10% Board</span>
                <span style={{fontSize:8,color:pct>=25?BL:"#ccc",fontWeight:pct>=25?700:400}}>{pct>=25?"✅":""} 25% Strategy</span>
                <span style={{fontSize:8,color:pct>=50?PU:"#ccc",fontWeight:pct>=50?700:400}}>{pct>=50?"✅":""} 50% Control</span>
              </div>
            </div>
            {/* Buy buttons */}
            <div style={{display:"flex",gap:6}}>
              {[{l:"Buy 1K",q:1000},{l:"Buy 10K",q:10000},{l:"Buy 100K",q:100000},{l:"Buy 1M",q:1000000}].map(btn=><button key={btn.q} onClick={()=>buyShares(c.t,btn.q)} disabled={btn.q*c.price>d.cash} style={{flex:1,background:btn.q*c.price>d.cash?"#f0f0f0":G,color:btn.q*c.price>d.cash?"#aaa":"#fff",border:"none",borderRadius:8,padding:"9px 4px",fontWeight:700,fontSize:10,cursor:btn.q*c.price>d.cash?"not-allowed":"pointer"}}>{btn.l}</button>)}
            </div>
            <div style={{fontSize:10,color:"#aaa",marginTop:5,textAlign:"center"}}>Cost: 1K={fm(c.price*1000)} · 10K={fm(c.price*10000)} · 100K={fm(c.price*100000)}</div>
          </div>;
        })}
      </>}

      {/* BOARD ACCESS TAB */}
      {tab==="board"&&<>
        <div style={{background:"linear-gradient(135deg,#1A237E,#283593)",borderRadius:14,padding:14,color:"#fff",marginBottom:0}}>
          <div style={{fontSize:16,fontWeight:800,marginBottom:6}}>👔 Board Access Tiers</div>
          <div style={{fontSize:12,opacity:.85,lineHeight:1.6}}>Your ownership % in each company determines your governance rights. Higher ownership = more influence = more responsibility.</div>
        </div>
        {d.cos.map(c=>{
          const pct=c.ownership||0;
          return <div key={c.t} style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:14,fontWeight:700,color:DK}}>{c.n}</span>
              <span style={{fontSize:12,fontWeight:700,color:pct>=10?G:"#aaa"}}>{pct.toFixed(2)}% owned</span>
            </div>
            <BoardTierCard pct={10} title="Board Seat" desc="Vote on dividend proposals, attend quarterly board meetings, receive advance notice of CEO decisions before public announcement." actions={["Vote on Dividend","Attend Board Meeting","View CEO Pipeline"]} color={G} unlocked={pct>=10}/>
            <BoardTierCard pct={25} title="Significant Control" desc="Propose strategic initiatives, veto major acquisitions, nominate board candidates, access management accounts." actions={["Propose Strategy","Veto Acquisition","Nominate Director"]} color={BL} unlocked={pct>=25}/>
            <BoardTierCard pct={50} title="Majority Control" desc="Replace the CEO, declare special dividends, force asset sales, initiate hostile takeovers of subsidiaries." actions={["Replace CEO","Special Dividend","Force Asset Sale","Restructure Board"]} color={PU} unlocked={pct>=50}/>
          </div>;
        })}
        {(d.boardLog||[]).length>0&&<div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Board Activity Log</div>
          {(d.boardLog||[]).map((e,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid #f5f5f5",display:"flex",gap:8}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:e.good?G:R,flexShrink:0,marginTop:5}}/>
            <div><div style={{fontSize:10,color:"#aaa"}}>T{e.turn} · {e.action}</div><div style={{fontSize:12,color:e.good?G:R,fontWeight:e.good?400:600}}>{e.msg}</div></div>
          </div>)}
        </div>}
      </>}

      {/* CEO LOG TAB */}
      {tab==="log"&&<div style={{background:"#fff",borderRadius:14,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:14,fontWeight:700,color:DK,marginBottom:10}}>CEO Decision Log — {(d.ceoLog||[]).length} entries</div>
        <div style={{fontSize:11,color:"#888",marginBottom:12}}>Key events only — decisions, ownership changes, auto-resolved alerts. Routine turns not logged.</div>
        {(d.ceoLog||[]).map((e,i)=><div key={i} style={{padding:"9px 0",borderBottom:"1px solid #f5f5f5",display:"flex",gap:9,alignItems:"flex-start"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:e.good?G:R,flexShrink:0,marginTop:4}}/>
          <div style={{flex:1}}><div style={{fontSize:10,color:"#aaa",marginBottom:2}}>T{e.turn} · {e.ticker}</div><div style={{fontSize:12,color:e.good?"#333":R,fontWeight:e.good?400:600,lineHeight:1.5}}>{e.msg}</div></div>
        </div>)}
      </div>}
    </div>

    {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:toast.g?G:R,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,zIndex:200,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>{toast.msg}</div>}
    <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}"}</style>
  </div>;
}
