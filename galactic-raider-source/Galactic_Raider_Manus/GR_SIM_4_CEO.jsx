import{useState,useRef,useCallback}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const COS_CEO=[
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",price:348.94,ceo:"Dr. Lin Wei",rep:78,tenure:8,invConf:82,health:85,revenue:8500000000,profit:1870000000,div:0.8},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",price:198.40,ceo:"Dr. Sarah Chen",rep:88,tenure:5,invConf:90,health:91,revenue:4200000000,profit:1092000000,div:1.2},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",price:15.80,ceo:"Amara Diallo",rep:65,tenure:3,invConf:70,health:68,revenue:890000000,profit:106800000,div:0.5},
  {t:"UTLS",n:"Utility Systems",s:"Utilities",price:58.40,ceo:"Robert Keller",rep:72,tenure:12,invConf:75,health:80,revenue:1800000000,profit:396000000,div:4.2},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",price:351.54,ceo:"Sheikh Rashid",rep:81,tenure:15,invConf:78,health:77,revenue:12000000000,profit:2160000000,div:1.8},
];
const CEO_DECISIONS=[
  {type:"dividend",category:"Financial",icon:"💰",scenarios:[
    {q:"Annual profits up 18%. Investors expect dividend increase.",opts:[{l:"Increase 10%",imp:.03,rep:4,inv:5,desc:"Attracts income investors. Payout ratio safe at 38%."},{ l:"Maintain",imp:0,rep:0,inv:0,desc:"Stable. Preserves cash for growth."},{ l:"Decrease 10%",imp:-.05,rep:-8,inv:-10,desc:"Signals weakness. Frees cash but damages confidence."}]},
    {q:"Q3 profits down 8% due to raw material costs. Dividend decision.",opts:[{l:"Maintain (sacrifice cash)",imp:-.01,rep:3,inv:2,desc:"Shows confidence. Market interprets as bullish."},{ l:"Cut 20%",imp:-.04,rep:-5,inv:-8,desc:"Sensible but signals trouble to market."},{ l:"Cancel dividend",imp:-.08,rep:-15,inv:-20,desc:"Extreme. Capital preservation but severe confidence hit."}]},
  ]},
  {type:"acquisition",category:"Strategic",icon:"🤝",scenarios:[
    {q:"Competitor trading at 40% below fair value. Acquisition opportunity.",opts:[{l:"Acquire (bold move)",imp:.06,rep:6,inv:8,desc:"Revenue +40%. Integration risk medium. Debt increases."},{ l:"Strategic partnership",imp:.02,rep:2,inv:3,desc:"Lower risk. Some synergies without full integration."},{ l:"Pass",imp:0,rep:-2,inv:0,desc:"Competitor may grow stronger. Conservative choice."}]},
  ]},
  {type:"cost_cut",category:"Operational",icon:"✂️",scenarios:[
    {q:"Operating margins below industry average. Board pushing for efficiency.",opts:[{l:"Restructure (cut 8% staff)",imp:.03,rep:-5,inv:2,desc:"Margin improvement +3%. Culture risk. Short-term pain."},{ l:"Automate operations",imp:.02,rep:1,inv:3,desc:"2-year payoff. Less disruption than layoffs."},{ l:"Reject cuts",imp:-.02,rep:3,inv:-3,desc:"Maintains culture. Margins stay weak. Investors disappointed."}]},
  ]},
  {type:"expansion",category:"Strategic",icon:"🌍",scenarios:[
    {q:"New market opportunity in Southeast Asia. Requires $500M investment.",opts:[{l:"Full market entry",imp:.05,rep:5,inv:6,desc:"+8% revenue potential. 3-year payback. High execution risk."},{ l:"Joint venture (50/50)",imp:.02,rep:2,inv:3,desc:"Shared risk and reward. Slower but safer growth."},{ l:"Wait and watch",imp:0,rep:-1,inv:-2,desc:"Competitors may move first. Avoids risk but loses opportunity."}]},
  ]},
  {type:"crisis",category:"Crisis",icon:"🚨",scenarios:[
    {q:"Regulatory investigation announced. Stock down 12% today.",opts:[{l:"Full transparency",imp:.02,rep:8,inv:5,desc:"Short-term pain, long-term credibility. Correct response."},{ l:"Minimal disclosure",imp:-.03,rep:-5,inv:-8,desc:"Buys time but compounds crisis if more revealed later."},{ l:"Aggressive pushback",imp:-.05,rep:-12,inv:-15,desc:"Escalates situation. Rarely works. Severe reputation damage."}]},
  ]},
];

export default function CeoSim(){
  const[tab,setTab]=useState("overview");
  const[turn,setTurn]=useState(1);
  const[cos,setCos]=useState(COS_CEO.map(c=>({...c,sh:0,ownership:0,boardSeat:false,decisions:[],pendingDec:null,decTurn:0,hist:[c.price]})));
  const[cash,setCash]=useState(900000);
  const[activeDec,setActiveDec]=useState(null);
  const[chosenOpt,setChosenOpt]=useState(null);
  const[toast,setToast]=useState(null);
  const[decLog,setDecLog]=useState([]);
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2600);},[]);

  const hasPending=cos.some(c=>c.pendingDec&&c.sh>0);

  const advanceTurn=()=>{
    if(hasPending){toast_("CEO decision pending — make your choice first",false);return;}
    const newTurn=turn+1;
    setCos(prev=>prev.map(c=>{
      // Natural price movement
      const move=1+(Math.random()-.5)*.08;
      const np=Math.max(.5,Math.round(c.price*move*100)/100);
      const newHist=[...c.hist.slice(-40),np];
      // Fire CEO decision every 30 turns for owned companies (ownership >= 10%)
      let pendingDec=c.pendingDec;let decTurn=c.decTurn;
      if(!pendingDec&&c.ownership>=10&&newTurn%30===0){
        const allDecs=CEO_DECISIONS.flatMap(d=>d.scenarios.map(s=>({...s,type:d.type,category:d.category,icon:d.icon})));
        pendingDec=allDecs[Math.floor(Math.random()*allDecs.length)];
        decTurn=newTurn;
        toast_("👔 CEO Decision: "+c.n+" needs your call!",false);
      }
      // Auto-resolve if ignored 10+ turns
      if(pendingDec&&(newTurn-decTurn)>10){
        const worst=pendingDec.opts.reduce((a,b)=>b.imp<a.imp?b:a);
        const adjPrice=Math.max(.5,Math.round(np*(1+worst.imp)*100)/100);
        return{...c,price:adjPrice,hist:[...newHist.slice(-1),adjPrice],rep:Math.max(0,Math.min(100,c.rep+worst.rep-5)),invConf:Math.max(0,Math.min(100,c.invConf+worst.inv-5)),pendingDec:null,decTurn:0,decisions:[{turn:newTurn,dec:pendingDec.q,choice:"AUTO: "+worst.l,imp:worst.imp,rep:worst.rep},...c.decisions].slice(0,20)};
      }
      return{...c,price:np,hist:newHist,pendingDec,decTurn};
    }));
    setTurn(newTurn);
  };

  const makeDecision=(company,optIndex)=>{
    if(!activeDec)return;
    const opt=activeDec.dec.opts[optIndex];
    const adjPrice=Math.max(.5,Math.round(company.price*(1+opt.imp)*100)/100);
    setCos(prev=>prev.map(c=>c.t===company.t?{...c,price:adjPrice,hist:[...c.hist.slice(-1),adjPrice],rep:Math.max(0,Math.min(100,c.rep+opt.rep)),invConf:Math.max(0,Math.min(100,c.invConf+opt.inv)),pendingDec:null,decTurn:0,decisions:[{turn,dec:activeDec.dec.q,choice:opt.l,imp:opt.imp,rep:opt.rep,outcome:opt.desc},...c.decisions].slice(0,20)}:c));
    setDecLog(prev=>[{turn,company:company.n,decision:activeDec.dec.q,choice:opt.l,priceImp:opt.imp,repImp:opt.rep,price:adjPrice},...prev].slice(0,30));
    toast_("Decision made for "+company.n+": "+opt.l+". Price: "+fm(adjPrice)+(opt.imp>=0?" ▲":" ▼"));
    setActiveDec(null);setChosenOpt(null);
  };

  const buyShares=(c,qty)=>{
    const cost=Math.round(qty*c.price*100)/100;
    if(cost>cash){toast_("Need "+fm(cost),false);return;}
    setCash(prev=>prev-cost);
    setCos(prev=>prev.map(x=>{if(x.t!==c.t)return x;const newSh=x.sh+qty,newOwn=Math.min(100,Math.round(newSh/1000000000*10000)/100);return{...x,sh:newSh,ownership:newOwn,boardSeat:newOwn>=10};}));
    toast_("Bought "+qty.toLocaleString()+" "+c.t+" @ "+fm(c.price)+". Ownership: "+Math.round((c.sh+qty)/1000000000*10000)/100+"%");
  };

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
    {/* Header */}
    <div style={{background:"linear-gradient(135deg,#1A237E,#283593)",padding:"14px 16px",color:"#fff"}}>
      <div style={{fontSize:11,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>SIM FILE 4 — CEO Decision System</div>
      <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Corporate Governance</div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {[["Turn",turn],["Cash",fm(cash)],["Pending",cos.filter(c=>c.pendingDec&&c.sh>0).length+" decisions"],["Board Seats",cos.filter(c=>c.boardSeat).length]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.12)",borderRadius:8,padding:"6px 6px",textAlign:"center"}}><div style={{fontSize:8,opacity:.6,textTransform:"uppercase",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:800}}>{v}</div></div>)}
      </div>
      <button onClick={advanceTurn} disabled={hasPending} style={{width:"100%",background:hasPending?"rgba(255,100,100,.3)":"rgba(255,255,255,.2)",color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:800,fontSize:13,cursor:hasPending?"not-allowed":"pointer"}}>{hasPending?"⚠️ Resolve CEO Decision Before Advancing":"▶ Advance Turn"}</button>
    </div>
    {/* Pending decisions banner */}
    {cos.filter(c=>c.pendingDec&&c.sh>0).map(c=><div key={c.t} style={{background:"linear-gradient(135deg,#E65100,#F57F17)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><div style={{fontSize:11,color:"rgba(255,255,255,.8)",marginBottom:2}}>👔 CEO Decision Required: {c.n}</div><div style={{fontSize:12,fontWeight:800,color:"#fff"}}>{c.pendingDec.q.substring(0,50)}...</div><div style={{fontSize:10,color:"rgba(255,255,255,.7)",marginTop:2}}>Auto-resolves (worst outcome) in {Math.max(0,10-(turn-c.decTurn))} turns if ignored</div></div>
      <button onClick={()=>{setActiveDec({company:c,dec:c.pendingDec});setChosenOpt(null);setTab("decide");}} style={{background:"#fff",color:AU,border:"none",borderRadius:9,padding:"8px 14px",fontWeight:800,fontSize:12,cursor:"pointer",flexShrink:0}}>Decide →</button>
    </div>)}
    {/* Tabs */}
    <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #e0e0e0"}}>
      {[{id:"overview",l:"Companies"},{id:"decide",l:"Decision"},{id:"board",l:"Board"},{id:"log",l:"Log"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 4px",border:"none",borderBottom:"3px solid "+(tab===t.id?"#1A237E":"transparent"),background:"#fff",color:tab===t.id?"#1A237E":"#888",fontWeight:700,fontSize:11,cursor:"pointer"}}>{t.l}</button>)}
    </div>
    <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>

      {/* COMPANIES TAB */}
      {tab==="overview"&&cos.map(c=>{const repColor=c.rep>=80?G:c.rep>=60?AU:R;
        return <div key={c.t} style={{background:"#fff",borderRadius:13,padding:13,border:"1.5px solid "+(c.pendingDec&&c.sh>0?"#F57F17":c.boardSeat?"#9C27B0":"#e8ebe8")}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div><div style={{fontSize:14,fontWeight:800,color:DK}}>{c.n}</div><div style={{fontSize:11,color:"#888"}}>CEO: {c.ceo} · {c.s}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:800,fontFamily:"monospace",color:DK}}>{fm(c.price)}</div>{c.boardSeat&&<div style={{fontSize:9,background:PU,color:"#fff",padding:"2px 6px",borderRadius:10,fontWeight:700,marginTop:2}}>BOARD SEAT {c.ownership>=50?"— MAJORITY":""}  {c.ownership>=25?"— SIGNIFICANT":""}</div>}</div>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            {[["CEO Rep",c.rep+"/100",repColor],["Inv. Conf.",c.invConf+"/100",c.invConf>=80?G:AU],["Health",c.health+"/100",c.health>=80?G:AU],["Ownership",c.ownership.toFixed(1)+"%",c.ownership>=10?PU:"#aaa"]].map(([k,v,col])=><div key={k} style={{flex:1,background:"#f8f8f8",borderRadius:7,padding:"6px 4px",textAlign:"center"}}><div style={{fontSize:8,color:"#aaa",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:800,color:col,fontFamily:"monospace"}}>{v}</div></div>)}
          </div>
          {/* CEO Rep bar */}
          <div style={{marginBottom:8}}><div style={{fontSize:9,color:"#aaa",marginBottom:3}}>CEO Reputation</div><div style={{height:5,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:c.rep+"%",background:repColor,borderRadius:3,transition:"width .3s"}}/></div></div>
          {c.pendingDec&&c.sh>0&&<div style={{background:"#FFF3E0",borderRadius:8,padding:"8px 10px",marginBottom:8,border:"1px solid #FFCC80"}}><div style={{fontSize:11,fontWeight:700,color:AU}}>⏰ Decision Pending — {Math.max(0,10-(turn-c.decTurn))} turns until auto-resolve</div><div style={{fontSize:10,color:"#666",marginTop:2}}>{c.pendingDec.q}</div></div>}
          {/* Board actions */}
          {c.boardSeat&&<div style={{marginBottom:8}}>
            <div style={{fontSize:10,fontWeight:700,color:PU,marginBottom:5}}>Board Actions (Ownership {c.ownership.toFixed(1)}%)</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {c.ownership>=10&&<button onClick={()=>{setCos(prev=>prev.map(x=>x.t===c.t?{...x,decisions:[{turn,dec:"Board vote",choice:"Voted to increase dividend",imp:.02,rep:2},...x.decisions]}:x));toast_("Voted on dividend for "+c.n);}} style={{background:"#EDE7F6",color:PU,border:"none",borderRadius:7,padding:"6px 10px",fontWeight:700,fontSize:10,cursor:"pointer"}}>Vote on Dividend</button>}
              {c.ownership>=25&&<button onClick={()=>{setCos(prev=>prev.map(x=>x.t===c.t?{...x,price:Math.round(x.price*1.03*100)/100}:x));toast_("Strategy proposed — stock +3%");}} style={{background:"#E3F2FD",color:BL,border:"none",borderRadius:7,padding:"6px 10px",fontWeight:700,fontSize:10,cursor:"pointer"}}>Propose Strategy</button>}
              {c.ownership>=50&&<button onClick={()=>{setCos(prev=>prev.map(x=>x.t===c.t?{...x,rep:Math.min(100,x.rep+15),invConf:Math.min(100,x.invConf+10)}:x));toast_("New CEO appointed — reputation reset up");}} style={{background:"#FFEBEE",color:R,border:"none",borderRadius:7,padding:"6px 10px",fontWeight:700,fontSize:10,cursor:"pointer"}}>Replace CEO</button>}
              {c.ownership>=50&&<button onClick={()=>{const div=Math.round(c.price*.05*c.sh*100)/100;setCash(prev=>prev+Math.min(div,1000000));toast_("Special dividend: "+fm(Math.min(div,1000000))+" credited");}} style={{background:"#E8F5E9",color:G,border:"none",borderRadius:7,padding:"6px 10px",fontWeight:700,fontSize:10,cursor:"pointer"}}>Special Dividend</button>}
            </div>
          </div>}
          <div style={{display:"flex",gap:6}}>
            {[100,1000,10000,100000].map(qty=><button key={qty} onClick={()=>buyShares(c,qty)} disabled={qty*c.price>cash} style={{flex:1,background:qty*c.price<=cash?G:"#f0f0f0",color:qty*c.price<=cash?"#fff":"#bbb",border:"none",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:9,cursor:qty*c.price<=cash?"pointer":"not-allowed"}}>{qty>=1000?(qty/1000)+"K":qty}</button>)}
          </div>
        </div>;
      })}

      {/* DECISION TAB */}
      {tab==="decide"&&(activeDec?<div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:"linear-gradient(135deg,#1A237E,#283593)",borderRadius:14,padding:16,color:"#fff"}}>
          <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{activeDec.company.n} · {activeDec.dec.category||"Decision"}</div>
          <div style={{fontSize:17,fontWeight:800,marginBottom:8,lineHeight:1.4}}>{activeDec.dec.q}</div>
          <div style={{display:"flex",gap:8}}>
            {[["CEO Rep",activeDec.company.rep+"/100"],["Inv. Conf.",activeDec.company.invConf+"/100"],["Price",fm(activeDec.company.price)]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.12)",borderRadius:7,padding:"6px 6px",textAlign:"center"}}><div style={{fontSize:8,opacity:.6,marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:800}}>{v}</div></div>)}
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Choose Your Action</div>
          {activeDec.dec.opts.map((opt,i)=>{const chosen=chosenOpt===i;return <button key={i} onClick={()=>setChosenOpt(chosen?null:i)} style={{width:"100%",background:chosen?"#E8EAF6":"#fafafa",border:"2px solid "+(chosen?"#3949AB":"#e0e0e0"),borderRadius:11,padding:12,marginBottom:8,cursor:"pointer",textAlign:"left"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:13,fontWeight:800,color:chosen?"#1A237E":DK}}>{["A","B","C"][i]}. {opt.l}</div>
              <div style={{display:"flex",gap:5}}>
                <span style={{fontSize:10,background:opt.imp>=0?"#E8F5E9":"#FFEBEE",color:opt.imp>=0?G:R,padding:"2px 6px",borderRadius:8,fontWeight:700}}>{opt.imp>=0?"▲":"▼"} {Math.abs(opt.imp*100).toFixed(0)}% stock</span>
                <span style={{fontSize:10,background:opt.rep>=0?"#E3F2FD":"#FFF3E0",color:opt.rep>=0?BL:AU,padding:"2px 6px",borderRadius:8,fontWeight:700}}>Rep {opt.rep>=0?"+":""}{opt.rep}</span>
              </div>
            </div>
            <div style={{fontSize:11,color:"#666",lineHeight:1.5}}>{opt.desc}</div>
          </button>;})}
        </div>
        <button onClick={()=>chosenOpt!==null&&makeDecision(activeDec.company,chosenOpt)} disabled={chosenOpt===null} style={{width:"100%",background:chosenOpt!==null?"#1A237E":"#e0e0e0",color:"#fff",border:"none",borderRadius:11,padding:14,fontWeight:800,fontSize:14,cursor:chosenOpt!==null?"pointer":"not-allowed"}}>
          {chosenOpt!==null?"Confirm: Option "+["A","B","C"][chosenOpt]+" — "+activeDec.dec.opts[chosenOpt].l:"Select an option above"}
        </button>
        <button onClick={()=>{setActiveDec(null);setChosenOpt(null);setTab("overview");}} style={{width:"100%",background:"none",border:"none",color:"#aaa",padding:"8px 0",cursor:"pointer",fontSize:12}}>Cancel</button>
      </div>:<div style={{padding:40,textAlign:"center",color:"#aaa"}}>No pending decisions. Buy ≥10% of a company and advance 30 turns to trigger one.</div>)}

      {/* BOARD TAB */}
      {tab==="board"&&<>
        <div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Board Seat Mechanics (from spec)</div>
          {[{own:"10%+",rights:["Receive CEO decisions","Vote on dividends","Earn director compensation ($50K/yr)"],color:BL},{own:"25%+",rights:["All 10% rights","Propose company strategy","Block hostile acquisitions"],color:PU},{own:"50%+",rights:["All 25% rights","Replace CEO","Declare special dividends","Set executive compensation"],color:G}].map(t=><div key={t.own} style={{padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{background:t.color,color:"#fff",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:800}}>{t.own} ownership</div></div>
            {t.rights.map(r=><div key={r} style={{fontSize:11,color:"#555",padding:"3px 0",paddingLeft:8}}>• {r}</div>)}
          </div>)}
        </div>
        <div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Your Board Positions</div>
          {cos.filter(c=>c.sh>0).length===0?<div style={{fontSize:12,color:"#bbb",padding:"15px 0",textAlign:"center"}}>Buy shares in companies to earn board positions.</div>:cos.filter(c=>c.sh>0).map(c=><div key={c.t} style={{padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{fontSize:12,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:12,fontWeight:800,color:c.ownership>=50?G:c.ownership>=25?PU:c.ownership>=10?BL:"#aaa"}}>{c.ownership.toFixed(2)}%{c.boardSeat?" — BOARD":""}</div></div>
            <div style={{fontSize:10,color:"#888"}}>{c.sh.toLocaleString()} shares · {c.boardSeat?c.ownership>=50?"Majority control — can replace CEO":c.ownership>=25?"Significant influence — can propose strategy":"Board seat — vote on dividends":"No board position (need 10%)"}</div>
          </div>)}
        </div>
      </>}

      {/* LOG TAB */}
      {tab==="log"&&<div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Decision History</div>
        {decLog.length===0?<div style={{fontSize:12,color:"#bbb",padding:"15px 0",textAlign:"center"}}>No decisions made yet.</div>:decLog.map((d,i)=><div key={i} style={{padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,fontWeight:700,color:DK}}>{d.company}</span><span style={{fontSize:10,color:"#aaa"}}>Turn {d.turn}</span></div>
          <div style={{fontSize:11,color:"#555",marginBottom:3}}>{d.decision.substring(0,60)}</div>
          <div style={{display:"flex",gap:6}}><span style={{fontSize:10,background:"#E8EAF6",color:"#1A237E",padding:"2px 7px",borderRadius:8,fontWeight:700}}>Choice: {d.choice}</span><span style={{fontSize:10,background:d.priceImp>=0?"#E8F5E9":"#FFEBEE",color:d.priceImp>=0?G:R,padding:"2px 7px",borderRadius:8,fontWeight:700}}>Stock {d.priceImp>=0?"+":""}{ (d.priceImp*100).toFixed(0)}%</span></div>
        </div>)}
      </div>}
    </div>
    {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:toast.g?G:R,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,zIndex:200,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>{toast.msg}</div>}
    <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
  </div>;
}
