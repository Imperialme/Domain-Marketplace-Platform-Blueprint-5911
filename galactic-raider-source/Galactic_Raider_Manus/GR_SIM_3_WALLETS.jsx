import{useState,useRef,useCallback}from"react";
// ── GALACTIC RAIDER — SIM FILE 3: 3-WALLET SYSTEM ────────────
// Cash Wallet + Savings Wallet + Trading Wallet
// Wallet log, auto-purchase, bankruptcy liquidation demo
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};

const INITIAL={
  cash:100000,     // Cash Wallet — daily use, tax payments, NOT liquidated
  savings:100000,  // Savings Wallet — protected, earns 2%/yr, dividends land here
  trading:800000,  // Trading Wallet — all trades, FIRST liquidated in bankruptcy
  pending:{cash:0,savings:0},  // settlement pending
  log:[
    {t:1,w:"system",dir:"in",amt:100000,bal:100000,desc:"Initial Cash Wallet allocation"},
    {t:1,w:"system",dir:"in",amt:100000,bal:100000,desc:"Initial Savings Wallet allocation"},
    {t:1,w:"system",dir:"in",amt:800000,bal:800000,desc:"Initial Trading Wallet allocation"},
  ],
  autoBuys:[],
  turn:1,
  loginStreak:0,
  lastLogin:0,
  streakReward:false,
  debtTotal:0,
  liquidating:false,
};

export default function WalletSim(){
  const[tab,setTab]=useState("wallets");
  const[state,setState]=useState(INITIAL);
  const[wDir,setWDir]=useState("T2S");
  const[wPct,setWPct]=useState(null);
  const[toast,setToast]=useState(null);
  const[abM,setAbM]=useState(false);
  const[abTicker,setAbTicker]=useState("SLKT");
  const[abAmt,setAbAmt]=useState(null);
  const[abFreq,setAbFreq]=useState(10);
  const[loanAmt,setLoanAmt]=useState(null);
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2800);},[]);

  const addLog=(s,wallet,dir,amt,desc)=>{
    const bal=wallet==="cash"?s.cash:wallet==="savings"?s.savings:s.trading;
    s.log=[{t:s.turn,w:wallet,dir,amt,bal,desc},...s.log].slice(0,60);
  };

  const doTransfer=()=>{
    if(!wPct)return;
    setState(prev=>{
      const s={...prev,log:[...prev.log],pending:{...prev.pending},autoBuys:[...prev.autoBuys]};
      const dirs={
        T2S:{from:"trading",to:"savings",fromBal:s.trading,delay:true},
        T2C:{from:"trading",to:"cash",fromBal:s.trading,delay:true},
        S2T:{from:"savings",to:"trading",fromBal:Math.max(0,s.savings-10000),delay:false},
        S2C:{from:"savings",to:"cash",fromBal:Math.max(0,s.savings-10000),delay:false},
        C2T:{from:"cash",to:"trading",fromBal:s.cash,delay:false},
        C2S:{from:"cash",to:"savings",fromBal:s.cash,delay:false},
      };
      const d=dirs[wDir];if(!d)return prev;
      const maxT=d.fromBal;
      const amt=Math.round(maxT*(wPct/100)*100)/100;
      if(amt<=0){toast_("Nothing to transfer",false);return prev;}
      s[d.from]=Math.round((s[d.from]-amt)*100)/100;
      if(d.delay){s.pending[d.to]=(s.pending[d.to]||0)+amt;addLog(s,d.from,"out",amt,"Transfer to "+d.to+" (1 turn settlement)");}
      else{s[d.to]=Math.round((s[d.to]+amt)*100)/100;addLog(s,d.to,"in",amt,"Transfer from "+d.from+" (instant)");}
      toast_(fm(amt)+" "+d.from+" → "+d.to+(d.delay?" (1 turn)":"(instant)"));
      setWPct(null);
      return s;
    });
  };

  const advanceTurn=()=>{
    setState(prev=>{
      const s={...prev,log:[...prev.log],pending:{...prev.pending},autoBuys:[...prev.autoBuys]};
      s.turn++;
      // Settle pending transfers
      if((s.pending.savings||0)>0){s.savings=Math.round((s.savings+s.pending.savings)*100)/100;addLog(s,"savings","in",s.pending.savings,"Settlement from trading (arrived)");s.pending.savings=0;}
      if((s.pending.cash||0)>0){s.cash=Math.round((s.cash+s.pending.cash)*100)/100;addLog(s,"cash","in",s.pending.cash,"Settlement from trading (arrived)");s.pending.cash=0;}
      // Savings interest (2%/yr = 0.00548%/turn)
      const interest=Math.round(s.savings*.02/365*100)/100;
      if(interest>=.01){s.savings=Math.round((s.savings+interest)*100)/100;addLog(s,"savings","in",interest,"Daily interest (2%/yr)");}
      // Auto-purchases from trading wallet
      s.autoBuys.forEach(ab=>{
        if(s.turn-ab.lastRun>=ab.freq&&s.trading>=ab.amount){
          s.trading=Math.round((s.trading-ab.amount)*100)/100;
          ab.lastRun=s.turn;ab.totalInvested=(ab.totalInvested||0)+ab.amount;ab.runs=(ab.runs||0)+1;
          addLog(s,"trading","out",ab.amount,"Auto-buy: "+ab.ticker+" "+fm(ab.amount)+" (run #"+ab.runs+")");
        }
      });
      // Bankruptcy check
      const nw=s.cash+s.savings+s.trading;
      if(nw<0&&!s.liquidating){s.liquidating=true;addLog(s,"system","out",0,"⚠️ FORCED LIQUIDATION STARTED — Trading wallet 10%/turn");}
      if(s.liquidating){const lq=Math.round(s.trading*.10*100)/100;s.trading=Math.round((s.trading-lq)*100)/100;addLog(s,"trading","out",lq,"Forced liquidation (10% per turn)");}
      if(s.liquidating&&(s.cash+s.savings+s.trading)>=50000){s.liquidating=false;addLog(s,"system","in",0,"✅ Liquidation stopped — NW recovered above $50K");}
      return s;
    });
  };

  const addAutoBuy=()=>{
    if(!abAmt||abAmt<100){toast_("Minimum auto-buy is $100",false);return;}
    if(abAmt>state.trading){toast_("More than Trading Wallet",false);return;}
    setState(prev=>({...prev,autoBuys:[...prev.autoBuys,{ticker:abTicker,amount:abAmt,freq:abFreq,lastRun:prev.turn,totalInvested:0,runs:0}]}));
    toast_("Auto-buy set: "+fm(abAmt)+" of "+abTicker+" every "+abFreq+" turns");
    setAbM(false);setAbAmt(null);
  };

  const takeLoan=()=>{
    if(!loanAmt||loanAmt<1000){toast_("Minimum loan $1,000",false);return;}
    const maxLoan=Math.max(0,(state.savings+state.trading)*0.5);
    if(loanAmt>maxLoan){toast_("Max loan is 50% of Savings+Trading = "+fm(maxLoan),false);return;}
    setState(prev=>{
      const s={...prev,log:[...prev.log]};
      s.trading=Math.round((s.trading+loanAmt)*100)/100;
      s.debtTotal=(s.debtTotal||0)+loanAmt;
      addLog(s,"trading","in",loanAmt,"Loan disbursed to Trading Wallet (interest 8%/yr)");
      return s;
    });
    toast_(fm(loanAmt)+" loan added to Trading Wallet (8%/yr interest)");
    setLoanAmt(null);
  };

  const st=state;
  const nw=st.cash+st.savings+st.trading;
  const totalNw=nw;

  const WalletCard=({label,bal,color,bg,border,desc,icon,protected:prot,pending:pend})=><div style={{background:bg,borderRadius:12,padding:"12px 14px",border:"1.5px solid "+border}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
      <div><div style={{fontSize:10,color,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{icon} {label}</div><div style={{fontSize:11,color:"#888"}}>{desc}</div></div>
      {prot&&<span style={{background:G,color:"#fff",fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:10,textTransform:"uppercase"}}>Protected</span>}
    </div>
    <div style={{fontSize:22,fontWeight:800,color,fontFamily:"monospace",marginTop:4}}>{fm(bal)}</div>
    <div style={{fontSize:10,color:"#888",marginTop:2}}>{Math.round(bal/totalNw*100)}% of total net worth</div>
    {pend>0&&<div style={{marginTop:6,fontSize:10,color:AU,fontWeight:600}}>⏳ {fm(pend)} settling next turn</div>}
  </div>;

  const Row=({k,v,vc})=><div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f5f5f5"}}><span style={{fontSize:12,color:"#666"}}>{k}</span><span style={{fontSize:12,fontWeight:600,color:vc||DK,fontFamily:"monospace"}}>{v}</span></div>;

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
    {/* Header */}
    <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",padding:"14px 16px",color:"#fff"}}>
      <div style={{fontSize:11,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>SIM FILE 3 — 3-Wallet System</div>
      <div style={{fontSize:26,fontWeight:800,fontFamily:"monospace",marginBottom:4}}>{fm(nw)}</div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {[["Turn",st.turn],["Debt",fm(st.debtTotal||0)],["Auto-Buys",st.autoBuys.length],["Liquidating",st.liquidating?"YES":"No"]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.12)",borderRadius:8,padding:"6px 6px",textAlign:"center"}}><div style={{fontSize:8,opacity:.6,textTransform:"uppercase",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:800,color:k==="Liquidating"&&v==="YES"?AU:"#fff"}}>{v}</div></div>)}
      </div>
      <button onClick={advanceTurn} style={{width:"100%",background:"rgba(255,255,255,.2)",color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:800,fontSize:13,cursor:"pointer"}}>▶ Advance Turn (settle pending, interest, auto-buys)</button>
    </div>
    {/* Tabs */}
    <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #e0e0e0"}}>
      {[{id:"wallets",l:"Wallets"},{id:"transfer",l:"Transfer"},{id:"loan",l:"Loan"},{id:"auto",l:"Auto-Buy"},{id:"log",l:"Log"},{id:"bankrupt",l:"Bankruptcy"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 2px",border:"none",borderBottom:"3px solid "+(tab===t.id?BL:"transparent"),background:"#fff",color:tab===t.id?BL:"#888",fontWeight:700,fontSize:9,cursor:"pointer"}}>{t.l}</button>)}
    </div>
    <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>

      {/* WALLETS TAB */}
      {tab==="wallets"&&<>
        <WalletCard label="Cash Wallet" bal={st.cash} color="#455A64" bg="#ECEFF1" border="#B0BEC5" desc="Day-to-day spending. Tax payments. Not liquidated in bankruptcy." icon="💵" pending={st.pending.cash||0}/>
        <WalletCard label="Savings Wallet" bal={st.savings} color={G} bg="#E8F5E9" border="#A5D6A7" desc="Protected funds. Earns 2%/yr interest. Dividends credited here. Bankruptcy cannot touch this." icon="🔒" protected pending={st.pending.savings||0}/>
        <WalletCard label="Trading Wallet" bal={st.trading} color={BL} bg="#E3F2FD" border="#90CAF9" desc="Active risk capital. All trades, GSF deposits, auto-buys draw here. First liquidated in bankruptcy." icon="⚡"/>
        <div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Wallet Rules (from spec)</div>
          {[["Cash → Trading","Instant. No fee. No limit."],["Cash → Savings","Instant. No fee."],["Savings → Trading","Instant. Minimum $10K stays in Savings."],["Trading → Savings","1 turn settlement delay. No fee."],["Trading → Cash","1 turn settlement delay. No fee."],["Dividends land in","Savings Wallet always."],["Auto-buy draws from","Trading Wallet only. Stops if insufficient."],["Bankruptcy liquidates","Trading Wallet first. Cash second. Savings NEVER."]].map(([k,v])=><div key={k} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}><span style={{fontSize:11,color:"#555",fontWeight:600,flex:1}}>{k}</span><span style={{fontSize:11,color:"#888",flex:2}}>{v}</span></div>)}
        </div>
      </>}

      {/* TRANSFER TAB */}
      {tab==="transfer"&&<div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:12}}>Transfer Between Wallets</div>
        {/* Balances quick view */}
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {[["💵 Cash",st.cash,"#455A64"],["🔒 Savings",st.savings,G],["⚡ Trading",st.trading,BL]].map(([l,b,c])=><div key={l} style={{flex:1,background:"#f8f8f8",borderRadius:9,padding:"8px 6px",textAlign:"center",border:"1px solid #eee"}}><div style={{fontSize:9,color:"#aaa",marginBottom:2}}>{l}</div><div style={{fontSize:12,fontWeight:800,color:c,fontFamily:"monospace"}}>{fm(b)}</div></div>)}
        </div>
        {/* Direction */}
        <div style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>Transfer Direction</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
          {[{v:"T2S",l:"Trading → Savings",delay:true},{v:"T2C",l:"Trading → Cash",delay:true},{v:"S2T",l:"Savings → Trading",delay:false},{v:"S2C",l:"Savings → Cash",delay:false},{v:"C2T",l:"Cash → Trading",delay:false},{v:"C2S",l:"Cash → Savings",delay:false}].map(o=><button key={o.v} onClick={()=>{setWDir(o.v);setWPct(null);}} style={{padding:"10px 8px",borderRadius:9,border:"2px solid "+(wDir===o.v?BL:"#e0e0e0"),background:wDir===o.v?"#E3F2FD":"#fafafa",color:wDir===o.v?BL:"#555",fontWeight:700,fontSize:11,cursor:"pointer",textAlign:"left"}}>
            {o.l}<br/><span style={{fontSize:9,fontWeight:400,color:wDir===o.v?"#1565C0":"#aaa"}}>{o.delay?"1 turn delay":"Instant"}</span>
          </button>)}
        </div>
        {/* Amounts */}
        {(()=>{
          const srcMap={T2S:st.trading,T2C:st.trading,S2T:Math.max(0,st.savings-10000),S2C:Math.max(0,st.savings-10000),C2T:st.cash,C2S:st.cash};
          const src=srcMap[wDir]||0;
          return <>
            <div style={{fontSize:11,color:"#aaa",marginBottom:7}}>Available: {fm(src)}{wDir.startsWith("S")?" (min $10K stays in Savings)":""}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
              {[10,25,50,100].map(pct=>{const amt=Math.round(src*(pct/100)*100)/100;return <button key={pct} onClick={()=>setWPct(wPct===pct?null:pct)} style={{padding:"10px 4px",borderRadius:10,border:"2px solid "+(wPct===pct?BL:"#e0e0e0"),background:wPct===pct?"#E3F2FD":"#fafafa",color:wPct===pct?BL:"#555",fontWeight:800,fontSize:12,cursor:"pointer"}}><div>{pct}%</div><div style={{fontSize:9,marginTop:2,color:wPct===pct?BL:"#aaa"}}>{fm(amt)}</div></button>;})}
            </div>
            {wPct&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:10}}>
              <Row k="Transfer Amount" v={fm(Math.round(src*(wPct/100)*100)/100)} vc={BL}/>
              <Row k="Settlement" v={["T2S","T2C"].includes(wDir)?"1 turn delay":"Instant"} vc={["T2S","T2C"].includes(wDir)?AU:G}/>
            </div>}
            <button onClick={doTransfer} disabled={!wPct||src<=0} style={{width:"100%",background:wPct&&src>0?BL:"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:13,cursor:wPct&&src>0?"pointer":"not-allowed"}}>
              {wPct&&src>0?`Transfer ${wPct}% = ${fm(Math.round(src*(wPct/100)*100)/100)}`:"Select percentage above"}
            </button>
          </>;
        })()}
      </div>}

      {/* LOAN TAB */}
      {tab==="loan"&&<>
        <div style={{background:"#FFF8E1",borderRadius:13,padding:13,border:"1px solid #FFE082"}}>
          <div style={{fontSize:14,fontWeight:800,color:AU,marginBottom:6}}>💳 Credit Line</div>
          <div style={{fontSize:12,color:"#555",lineHeight:1.6,marginBottom:10}}>Borrow up to 50% of your Savings + Trading combined. Interest 8%/yr charged to Cash Wallet each turn. Loan credited directly to Trading Wallet.</div>
          <Row k="Max Loan (50% of Savings+Trading)" v={fm(Math.max(0,(st.savings+st.trading)*.5))} vc={AU}/>
          <Row k="Current Debt" v={fm(st.debtTotal||0)} vc={st.debtTotal>0?R:G}/>
          <Row k="Interest Rate" v="8% per year (0.022%/turn)" vc="#555"/>
          <Row k="Interest per turn (on current debt)" v={fm(Math.round((st.debtTotal||0)*.08/365*100)/100)} vc={R}/>
        </div>
        <div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Take a Loan</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:10}}>
            {[1000,5000,10000,50000,100000,Math.floor(Math.max(0,(st.savings+st.trading)*.5/1000)*1000)].filter((v,i,a)=>v>0&&a.indexOf(v)===i&&v<=Math.max(0,(st.savings+st.trading)*.5)).slice(-6).map(v=><button key={v} onClick={()=>setLoanAmt(v)} style={{padding:"10px 4px",borderRadius:9,border:"2px solid "+(loanAmt===v?AU:"#e0e0e0"),background:loanAmt===v?"#FFF8E1":"#fafafa",color:loanAmt===v?AU:"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(v)}</button>)}
          </div>
          {loanAmt&&<div style={{background:"#FFF8E1",borderRadius:9,padding:10,marginBottom:10}}>
            <Row k="Loan Amount" v={fm(loanAmt)} vc={AU}/>
            <Row k="Credited To" v="Trading Wallet" vc={BL}/>
            <Row k="Interest per turn" v={fm(Math.round(loanAmt*.08/365*100)/100)} vc={R}/>
            <Row k="Annual interest cost" v={fm(Math.round(loanAmt*.08*100)/100)} vc={R}/>
          </div>}
          <button onClick={takeLoan} disabled={!loanAmt} style={{width:"100%",background:loanAmt?AU:"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:13,cursor:loanAmt?"pointer":"not-allowed"}}>
            {loanAmt?"Take Loan of "+fm(loanAmt)+" → Trading Wallet":"Select loan amount above"}
          </button>
          <div style={{marginTop:10,fontSize:11,color:"#aaa",lineHeight:1.6}}>💡 7-day login streak: 10% debt forgiven automatically + 1 free Wheel spin token. Wheel can add up to 50% more forgiveness.</div>
        </div>
        {/* 7-day streak simulation */}
        <div style={{background:"linear-gradient(135deg,#1A237E,#283593)",borderRadius:13,padding:13,border:"1px solid rgba(255,215,0,.2)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"gold",marginBottom:6}}>🔥 Login Streak Rewards</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.75)",lineHeight:1.6,marginBottom:10}}>Log in 7 days straight = 10% debt forgiven + 1 free Wheel spin token. Combined with Wheel max (50%): up to 60% debt relief!</div>
          {[{d:1,r:"$50 Cash bonus"},{d:3,r:"$200 Cash bonus"},{d:7,r:"10% debt forgiven + 1 Wheel token"},{d:14,r:"$1,000 Cash bonus + 5% debt"},{d:30,r:"Full guaranteed Wheel spin + 10% debt"}].map(item=><div key={item.d} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}><span style={{fontSize:11,color:"rgba(255,255,255,.55)"}}>Day {item.d}</span><span style={{fontSize:11,color:"rgba(255,215,0,.8)",fontWeight:600}}>{item.r}</span></div>)}
          {(st.debtTotal||0)>0&&<button onClick={()=>{setState(prev=>{const s={...prev,log:[...prev.log]};const forgiven=Math.round(s.debtTotal*.10*100)/100;s.debtTotal=Math.round((s.debtTotal-forgiven)*100)/100;addLog(s,"system","in",forgiven,"🔥 7-Day Streak: 10% debt forgiven ("+fm(forgiven)+")");return s;});toast_("🔥 7-Day Streak! 10% debt forgiven = "+fm(Math.round(st.debtTotal*.10*100)/100));}} style={{width:"100%",background:"linear-gradient(135deg,#B8952A,#F0D060)",color:"#000",border:"none",borderRadius:9,padding:"11px 0",fontWeight:800,fontSize:12,cursor:"pointer",marginTop:10}}>Simulate 7-Day Streak Reward</button>}
        </div>
      </>}

      {/* AUTO-BUY TAB */}
      {tab==="auto"&&<>
        <div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:6}}>📅 Auto-Purchase (Dollar-Cost Averaging)</div>
          <div style={{fontSize:11,color:"#888",marginBottom:12,lineHeight:1.6}}>Set recurring buys from Trading Wallet only. Stops automatically if Trading Wallet has insufficient funds. Savings and Cash Wallets are never touched.</div>
          {st.autoBuys.length===0?<div style={{fontSize:12,color:"#bbb",padding:"15px 0",textAlign:"center"}}>No auto-buys set. Add one below.</div>:st.autoBuys.map((ab,i)=><div key={i} style={{padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div><div style={{fontSize:12,fontWeight:700,color:DK}}>{ab.ticker} — {fm(ab.amount)} every {ab.freq} turns</div><div style={{fontSize:10,color:"#aaa"}}>Total invested: {fm(ab.totalInvested||0)} · Runs: {ab.runs||0}</div></div><button onClick={()=>setState(prev=>({...prev,autoBuys:prev.autoBuys.filter((_,j)=>j!==i)}))} style={{background:"#FFEBEE",color:R,border:"none",borderRadius:7,padding:"4px 10px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Remove</button></div>
            <div style={{height:4,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,((ab.runs||0)/10*100)).toFixed(0)+"%",background:"linear-gradient(90deg,"+BL+",#42A5F5)",borderRadius:2}}/></div>
          </div>)}
          <button onClick={()=>setAbM(true)} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:10,padding:"11px 0",fontWeight:700,fontSize:13,cursor:"pointer",marginTop:10}}>+ Add Auto-Buy</button>
        </div>
        {abM&&<div style={{background:"#E3F2FD",borderRadius:13,padding:13,border:"1px solid #BBDEFB"}}>
          <div style={{fontSize:13,fontWeight:700,color:BL,marginBottom:10}}>New Auto-Buy</div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:11,color:"#888",marginBottom:5}}>Ticker</div>
            <div style={{display:"flex",gap:6}}>
              {["SLKT","MDCR","UTLS","FRMN","EMTS"].map(t=><button key={t} onClick={()=>setAbTicker(t)} style={{flex:1,padding:"8px 4px",borderRadius:8,border:"2px solid "+(abTicker===t?BL:"#ddd"),background:abTicker===t?"#E3F2FD":"#fafafa",color:abTicker===t?BL:"#555",fontWeight:700,fontSize:10,cursor:"pointer"}}>{t}</button>)}
            </div>
          </div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:11,color:"#888",marginBottom:5}}>Amount per buy (from Trading Wallet)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
              {[100,500,1000,5000,10000,50000,100000,Math.floor(st.trading*.1/100)*100].filter((v,i,a)=>v<=st.trading&&v>0&&a.indexOf(v)===i).slice(-8).map(v=><button key={v} onClick={()=>setAbAmt(v)} style={{padding:"8px 4px",borderRadius:8,border:"2px solid "+(abAmt===v?BL:"#ddd"),background:abAmt===v?"#E3F2FD":"#fafafa",color:abAmt===v?BL:"#555",fontWeight:700,fontSize:10,cursor:"pointer"}}>{fm(v)}</button>)}
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:"#888",marginBottom:5}}>Frequency (every N turns)</div>
            <div style={{display:"flex",gap:6}}>
              {[5,10,30,91].map(f=><button key={f} onClick={()=>setAbFreq(f)} style={{flex:1,padding:"8px 4px",borderRadius:8,border:"2px solid "+(abFreq===f?BL:"#ddd"),background:abFreq===f?"#E3F2FD":"#fafafa",color:abFreq===f?BL:"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{f===91?"Qtrly":f+"t"}</button>)}
            </div>
          </div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={addAutoBuy} style={{flex:2,background:BL,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Add Auto-Buy</button>
            <button onClick={()=>setAbM(false)} style={{flex:1,background:"#f5f5f5",color:"#888",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>}
      </>}

      {/* LOG TAB */}
      {tab==="log"&&<div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Wallet Transaction Log — {st.log.length} entries</div>
        {st.log.map((e,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f5f5",alignItems:"flex-start"}}>
          <div style={{width:28,height:28,borderRadius:7,background:e.w==="savings"?"#E8F5E9":e.w==="trading"?"#E3F2FD":e.w==="cash"?"#ECEFF1":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>{e.w==="savings"?"🔒":e.w==="trading"?"⚡":e.w==="cash"?"💵":"⚙️"}</div>
          <div style={{flex:1}}><div style={{fontSize:10,color:"#aaa"}}>T{e.t} · {e.w.toUpperCase()}</div><div style={{fontSize:11,color:"#444"}}>{e.desc}</div></div>
          {e.amt>0&&<div style={{fontSize:12,fontWeight:800,color:e.dir==="in"?G:R,fontFamily:"monospace",flexShrink:0}}>{e.dir==="in"?"+":"-"}{fm(e.amt)}</div>}
        </div>)}
      </div>}

      {/* BANKRUPTCY TAB */}
      {tab==="bankrupt"&&<>
        <div style={{background:"#FFEBEE",borderRadius:13,padding:13,border:"1px solid #EF9A9A"}}>
          <div style={{fontSize:14,fontWeight:800,color:R,marginBottom:6}}>⚠️ Bankruptcy & Liquidation</div>
          <div style={{fontSize:11,color:"#555",lineHeight:1.6,marginBottom:10}}>When NW goes negative, forced liquidation begins. Trading Wallet liquidated at 10%/turn. Cash Wallet can be used but is not auto-liquidated. Savings Wallet is NEVER touched.</div>
          {[["Yellow Alert","NW < $100K","Warning only. No action required.","🟡"],["Orange Alert","NW < $0","Forced liquidation. Cannot open new positions.","🟠"],["Red — Bankruptcy","NW < -$500K","Game over. Savings Academy progress kept.","🔴"]].map(([level,trigger,effect,ico])=><div key={level} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #FFCDD2",alignItems:"flex-start"}}><span style={{fontSize:16,flexShrink:0}}>{ico}</span><div><div style={{fontSize:12,fontWeight:700,color:R}}>{level} — {trigger}</div><div style={{fontSize:11,color:"#555"}}>{effect}</div></div></div>)}
        </div>
        <div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Liquidation Order (spec)</div>
          {[["1st","Cryptocurrency","Most volatile, liquidated first"],["2nd","Commodities","High volatility"],["3rd","Forex Positions","Moderate risk"],["4th","Stocks (largest gains)","Lock in profits"],["5th","Bonds","Lower risk but liquid"],["6th","Stocks (smallest gains)","Preserve loss harvesting"],["Protected","Savings Wallet","NEVER LIQUIDATED"]].map(([order,asset,reason])=><div key={asset} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f5f5",alignItems:"flex-start"}}>
            <div style={{width:30,height:24,borderRadius:6,background:order==="Protected"?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:order==="Protected"?G:"#888",flexShrink:0}}>{order==="Protected"?"🔒":order}</div>
            <div><div style={{fontSize:12,fontWeight:600,color:order==="Protected"?G:DK}}>{asset}</div><div style={{fontSize:10,color:"#aaa"}}>{reason}</div></div>
          </div>)}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setState(prev=>{const s={...prev,log:[...prev.log]};s.trading=Math.round(s.trading-s.trading*.90);addLog(s,"trading","out",s.trading*.90,"TEST: Trading wallet drained 90%");return s;});toast_("Trading wallet drained — check liquidation");}} style={{flex:1,background:R,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Simulate Crash</button>
          <button onClick={()=>setState(INITIAL)} style={{flex:1,background:"#f5f5f5",color:"#555",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Reset Wallets</button>
        </div>
      </>}
    </div>
    {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:toast.g?G:R,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,zIndex:200,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>{toast.msg}</div>}
    <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
  </div>;
}
