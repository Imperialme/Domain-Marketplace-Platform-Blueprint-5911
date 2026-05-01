import{useState,useRef,useCallback,useEffect}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);

const LOAN_TIERS=[
  {tier:1,max:50000,rate:.12,requires:"No prior loans",label:"Starter Loan"},
  {tier:2,max:250000,rate:.15,requires:"Tier 1 fully repaid",label:"Growth Loan"},
  {tier:3,max:1000000,rate:.18,requires:"Tier 2 fully repaid",label:"Business Loan"},
  {tier:4,max:5000000,rate:.22,requires:"Tier 3 fully repaid + $500K NW",label:"Corporate Loan"},
  {tier:5,max:25000000,rate:.25,requires:"Tier 4 repaid + $5M NW",label:"Premium Loan"},
];

export default function WalletsSim(){
  const[tab,setTab]=useState("wallets");
  const[speed,setSpeed]=useState(1);
  const[auto,setAuto]=useState(false);
  const speedRef=useRef(1);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  const aRef=useRef(null);
  const[toast,setToast]=useState(null);
  const[wDir,setWDir]=useState("C2T"); // C2T=Cash→Trading, T2C, T2S, S2T, C2S, S2C
  const[wPct,setWPct]=useState(null);
  const[autoBuyM,setAutoBuyM]=useState(false);
  const[newAutoTicker,setNewAutoTicker]=useState("");
  const[newAutoAmt,setNewAutoAmt]=useState(null);
  const[foundationM,setFoundationM]=useState(false);
  const[loanM,setLoanM]=useState(false);
  const[logView,setLogView]=useState("quarterly"); // all, quarterly, mine
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2800);},[]);

  const S=useRef(null);
  if(!S.current){S.current={
    turn:1,
    // 3 WALLETS
    cashWallet:100000,      // Day-to-day. Cannot be auto-liquidated but not protected
    savingsWallet:100000,   // Protected IF foundation opened. 2%/yr interest
    tradingWallet:800000,   // Active trading. First to be liquidated
    // Foundation
    foundationOpen:false,
    foundationBalance:0,
    // Loan system — one at a time, must repay before next
    activeLoan:null,        // {tier, amount, rate, outstanding, taken}
    loanHistory:[],
    totalInterestPaid:0,
    // Auto-purchase
    autoBuys:[],
    // Bankruptcy
    liquidating:false,bankrupt:false,
    // 7-day streak
    streak:0,lastLogin:0,streakBonus:false,
    // History log
    txLog:[
      {turn:1,type:"INIT",wallet:"ALL",amount:1000000,desc:"Starting capital allocated: Cash $100K, Savings $100K, Trading $800K",balance:1000000,mine:true},
    ],
    divReceived:0,
    interestReceived:0,
  };}
  const[D,setD]=useState(()=>({...S.current}));
  const refresh=useCallback(()=>setD({...S.current}),[]);

  const logTx=(s,type,wallet,amount,desc,mine=true)=>{
    s.txLog=[{turn:s.turn,type,wallet,amount,desc,mine,ts:Date.now()},...s.txLog].slice(0,200);
  };

  const advance=useCallback(()=>{
    const s=S.current;s.turn++;
    const events=[];
    // Savings wallet 2%/yr interest (if savings > 0)
    if(s.savingsWallet>0){
      const int=Math.round(s.savingsWallet*(.02/365)*100)/100;
      s.savingsWallet=Math.round((s.savingsWallet+int)*100)/100;
      s.interestReceived=Math.round(((s.interestReceived||0)+int)*100)/100;
      if(s.turn%30===0)logTx(s,"INTEREST","Savings",int,"2%/yr interest credited to Savings Wallet (quarterly shown)");
    }
    // Foundation earns 3%/yr if open
    if(s.foundationOpen&&s.foundationBalance>0){
      const int=Math.round(s.foundationBalance*(.03/365)*100)/100;
      s.foundationBalance=Math.round((s.foundationBalance+int)*100)/100;
    }
    // Loan interest accrual
    if(s.activeLoan){
      const int=Math.round(s.activeLoan.outstanding*(s.activeLoan.rate/365)*100)/100;
      s.activeLoan.outstanding=Math.round((s.activeLoan.outstanding+int)*100)/100;
      s.activeLoan.accruedInterest=(s.activeLoan.accruedInterest||0)+int;
      if(s.turn%30===0){
        // Force quarterly interest payment from trading wallet
        const payment=Math.min(s.tradingWallet,int*30);
        s.tradingWallet=Math.round((s.tradingWallet-payment)*100)/100;
        s.totalInterestPaid=Math.round(((s.totalInterestPaid||0)+payment)*100)/100;
        logTx(s,"LOAN_INT","Trading",-payment,"Quarterly loan interest payment ("+s.activeLoan.tier.label+")");
      }
    }
    // Auto-buy from Trading Wallet ONLY
    if((s.autoBuys||[]).length>0&&s.turn%5===0){
      s.autoBuys.forEach(ab=>{
        if((s.tradingWallet||0)>=ab.amount){
          s.tradingWallet=Math.round((s.tradingWallet-ab.amount)*100)/100;
          logTx(s,"AUTO_BUY","Trading",-ab.amount,"Auto-buy: "+ab.ticker+" $"+fm(ab.amount)+" (from Trading Wallet only)",true);
          events.push("Auto-bought "+fm(ab.amount)+" of "+ab.ticker);
        }else{
          logTx(s,"AUTO_BUY_FAIL","Trading",0,"Auto-buy PAUSED: "+ab.ticker+" — insufficient Trading Wallet funds (have "+fm(s.tradingWallet||0)+", need "+fm(ab.amount)+")",true);
        }
      });
    }
    // Bankruptcy checks
    const nw=s.cashWallet+s.savingsWallet+s.tradingWallet+(s.foundationBalance||0);
    if(nw<0&&!s.liquidating){
      s.liquidating=true;
      logTx(s,"BANKRUPTCY","Trading",0,"FORCED LIQUIDATION STARTED. 10% of Trading Wallet per turn. Savings Wallet "+(s.foundationOpen?"PROTECTED by Foundation":"at risk — Foundation not opened"),false);
    }
    if(s.liquidating){
      const liq=Math.round((s.tradingWallet||0)*.10*100)/100;
      if(liq>0){s.tradingWallet=Math.round((s.tradingWallet-liq)*100)/100;logTx(s,"LIQ","Trading",-liq,"Forced liquidation: 10% of Trading Wallet");}
      if(!s.foundationOpen&&s.savingsWallet>0){
        // Without foundation, savings also at risk
        const savLiq=Math.round(s.savingsWallet*.05*100)/100;
        s.savingsWallet=Math.round((s.savingsWallet-savLiq)*100)/100;
        logTx(s,"LIQ","Savings",-savLiq,"Savings at risk (no Foundation) — 5% liquidated per turn");
      }
      if(nw>50000)s.liquidating=false;
    }
    if(nw<-500000&&!s.bankrupt){s.bankrupt=true;logTx(s,"BANKRUPT","ALL",nw,"BANKRUPT — Net worth below -$500K. All positions closed.",false);}
    // 7-day streak check
    s.streak=Math.min(s.streak+1,7);// simplified: each advance = 1 day for demo
    if(s.streak>=7&&!s.streakBonus){
      s.streakBonus=true;
      logTx(s,"STREAK","ALL",0,"🎉 7-DAY LOGIN STREAK! Bonus: 10% debt forgiveness + 1 free Wheel spin token",true);
    }
    s.txLog=[...s.txLog];
    refresh();
  },[refresh]);

  useEffect(()=>{
    if(!auto){clearInterval(aRef.current);return;}
    clearInterval(aRef.current);
    aRef.current=setInterval(()=>advance(),speedRef.current*1000);
    return()=>clearInterval(aRef.current);
  },[auto,speed,advance]);

  const doTransfer=()=>{
    if(!wPct)return;
    const s=S.current;
    const walletMap={cashWallet:"Cash",savingsWallet:"Savings",tradingWallet:"Trading"};
    const dirs={
      "C2T":{from:"cashWallet",to:"tradingWallet",instant:true},
      "T2C":{from:"tradingWallet",to:"cashWallet",instant:true},
      "C2S":{from:"cashWallet",to:"savingsWallet",instant:true},
      "S2C":{from:"savingsWallet",to:"cashWallet",instant:false,delay:1},
      "T2S":{from:"tradingWallet",to:"savingsWallet",instant:true},
      "S2T":{from:"savingsWallet",to:"tradingWallet",instant:false,delay:1},
    };
    const dir=dirs[wDir];if(!dir)return;
    const srcBal=s[dir.from]||0;
    const maxTransfer=dir.from==="savingsWallet"?Math.max(0,srcBal-10000):srcBal;
    const amt=Math.round(maxTransfer*(wPct/100)*100)/100;
    if(amt<=0){toast_("Nothing to transfer",false);return;}
    if(amt>srcBal){toast_("Insufficient balance",false);return;}
    s[dir.from]=Math.round((s[dir.from]-amt)*100)/100;
    s[dir.to]=Math.round((s[dir.to]+amt)*100)/100;
    logTx(s,"TRANSFER",walletMap[dir.from]+"→"+walletMap[dir.to],amt,wPct+"% transfer: "+fm(amt)+" from "+walletMap[dir.from]+" to "+walletMap[dir.to]+(dir.instant?" (instant)":" (1 turn settle)"));
    toast_(fm(amt)+" from "+walletMap[dir.from]+" → "+walletMap[dir.to]+(dir.instant?" (instant)":" (settled next turn)"));
    setWPct(null);refresh();
  };

  const takeLoan=(tier)=>{
    const s=S.current;
    if(s.activeLoan){toast_("Repay existing loan first — cannot have two loans",false);return;}
    const nw=s.cashWallet+s.savingsWallet+s.tradingWallet;
    if(tier.tier>=4&&nw<500000){toast_("Need $500K+ net worth for this tier",false);return;}
    if(tier.tier>=5&&nw<5000000){toast_("Need $5M+ net worth for this tier",false);return;}
    // Check prior tier repaid
    const lastLoan=s.loanHistory[0];
    if(lastLoan&&lastLoan.tier.tier>=tier.tier&&!lastLoan.repaid){toast_("Repay your current loan first",false);return;}
    s.tradingWallet=Math.round((s.tradingWallet+tier.max)*100)/100;
    s.activeLoan={tier,amount:tier.max,outstanding:tier.max,rate:tier.rate,taken:s.turn,accruedInterest:0};
    logTx(s,"LOAN","Trading",tier.max,"Loan taken: "+tier.label+" $"+fm(tier.max)+" @ "+Math.round(tier.rate*100)+"% APR. Credited to Trading Wallet.");
    toast_("Loan approved: "+fm(tier.max)+" credited to Trading Wallet @ "+Math.round(tier.rate*100)+"% APR");
    setLoanM(false);refresh();
  };

  const repayLoan=(amount)=>{
    const s=S.current;
    if(!s.activeLoan){toast_("No active loan",false);return;}
    if(amount>(s.tradingWallet||0)){toast_("Insufficient Trading Wallet funds",false);return;}
    s.tradingWallet=Math.round((s.tradingWallet-amount)*100)/100;
    s.activeLoan.outstanding=Math.round((s.activeLoan.outstanding-amount)*100)/100;
    s.totalInterestPaid=Math.round(((s.totalInterestPaid||0)+(s.activeLoan.accruedInterest||0))*100)/100;
    logTx(s,"REPAY","Trading",-amount,"Loan repayment: "+fm(amount)+" · Outstanding: "+fm(Math.max(0,s.activeLoan.outstanding)));
    if(s.activeLoan.outstanding<=0){
      s.loanHistory=[{...s.activeLoan,repaid:true,repaidTurn:s.turn},...s.loanHistory].slice(0,10);
      s.activeLoan=null;
      toast_("✅ Loan fully repaid! Next tier now available.");
    }else{
      toast_("Repaid "+fm(amount)+" · Remaining: "+fm(s.activeLoan.outstanding));
    }
    refresh();
  };

  const openFoundation=(name)=>{
    const s=S.current;
    const cost=10000;// Foundation setup fee
    if((s.cashWallet||0)<cost){toast_("Need $10K in Cash Wallet to open Foundation",false);return;}
    s.cashWallet=Math.round((s.cashWallet-cost)*100)/100;
    s.foundationOpen=true;
    s.foundationBalance=0;
    logTx(s,"FOUNDATION","Cash",-cost,"Foundation '"+name+"' opened. $10K setup fee. Savings Wallet now PROTECTED from bankruptcy. Foundation earns 3%/yr.");
    toast_("Foundation opened! Savings Wallet is now protected from bankruptcy.");
    setFoundationM(false);refresh();
  };

  const d=D;
  const nw=(d.cashWallet||0)+(d.savingsWallet||0)+(d.tradingWallet||0)+(d.foundationBalance||0);
  const loanTierReached=d.loanHistory.length>0?d.loanHistory[0].tier.tier:0;
  const nextLoanTier=LOAN_TIERS.find(t=>t.tier===loanTierReached+1)||LOAN_TIERS[0];

  // Filter logs
  const allLogs=d.txLog||[];
  const shownLogs=logView==="quarterly"?allLogs.filter((_,i)=>i===0||i%10===0).slice(0,30):logView==="mine"?allLogs.filter(l=>l.mine).slice(0,50):allLogs.slice(0,50);

  const dirs={
    "C2T":{label:"Cash → Trading",from:"Cash",to:"Trading",srcKey:"cashWallet",note:"Instant"},
    "T2C":{label:"Trading → Cash",from:"Trading",to:"Cash",srcKey:"tradingWallet",note:"Instant"},
    "C2S":{label:"Cash → Savings",from:"Cash",to:"Savings",srcKey:"cashWallet",note:"Instant"},
    "S2C":{label:"Savings → Cash",from:"Savings",to:"Cash",srcKey:"savingsWallet",note:"1 turn settle"},
    "T2S":{label:"Trading → Savings",from:"Trading",to:"Savings",srcKey:"tradingWallet",note:"Instant"},
    "S2T":{label:"Savings → Trading",from:"Savings",to:"Trading",srcKey:"savingsWallet",note:"1 turn settle"},
  };
  const dir=dirs[wDir];
  const srcBal=d[dir?.srcKey]||0;
  const maxT=dir?.srcKey==="savingsWallet"?Math.max(0,srcBal-10000):srcBal;

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
    {/* Header */}
    <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",padding:"14px 16px 0",color:"#fff"}}>
      <div style={{fontSize:11,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>SIM FILE 3 — Wallet System</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div><div style={{fontSize:22,fontWeight:800}}>Turn {d.turn}</div><div style={{fontSize:12,opacity:.7}}>Net Worth: {fm(nw)}</div></div>
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          {d.bankrupt&&<div style={{background:"#B71C1C",borderRadius:8,padding:"4px 8px",fontSize:10,fontWeight:800}}>💀 BANKRUPT</div>}
          {d.liquidating&&<div style={{background:AU,borderRadius:8,padding:"4px 8px",fontSize:10,fontWeight:800}}>🟠 LIQUIDATING</div>}
          {d.streakBonus&&<div style={{background:"#6A1B9A",borderRadius:8,padding:"4px 8px",fontSize:10,fontWeight:800}}>🎯 STREAK!</div>}
        </div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:10}}>
        <button onClick={advance} disabled={auto} style={{flex:2,background:auto?"rgba(255,255,255,.1)":G,color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:12,cursor:auto?"not-allowed":"pointer"}}>▶ Turn</button>
        <button onClick={()=>setAuto(a=>!a)} style={{flex:1,background:auto?"#B71C1C":"rgba(255,255,255,.1)",color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>{auto?"⏹":"Auto"}</button>
        {[.5,1,5,10].map(s=><button key={s} onClick={()=>setSpeed(s)} style={{flex:1,background:speed===s?"rgba(255,255,255,.25)":"rgba(255,255,255,.1)",color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer"}}>{s<1?".5s":s+"s"}</button>)}
      </div>
      <div style={{display:"flex",gap:0}}>
        {[{id:"wallets",l:"Wallets"},{id:"transfer",l:"Transfer"},{id:"autobuy",l:"Auto-Buy"},{id:"loans",l:"Loans"},{id:"log",l:"Log"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px",border:"none",borderBottom:"3px solid "+(tab===t.id?"#fff":"transparent"),background:"transparent",color:tab===t.id?"#fff":"rgba(255,255,255,.5)",fontWeight:700,fontSize:10,cursor:"pointer"}}>{t.l}</button>)}
      </div>
    </div>

    <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
      {/* WALLETS TAB */}
      {tab==="wallets"&&<>
        {/* 3 wallet cards */}
        {[
          {key:"cashWallet",label:"💵 Cash Wallet",color:"#1565C0",bg:"#E3F2FD",border:"#90CAF9",desc:"Day-to-day spending, tax payments. Not liquidated automatically but unprotected.",interest:"None",rule:"Used for: daily expenses, tax, loan repayments"},
          {key:"savingsWallet",label:"🏦 Savings Wallet",color:d.foundationOpen?G:AU,bg:d.foundationOpen?"#E8F5E9":"#FFF8E1",border:d.foundationOpen?"#A5D6A7":"#FFE082",desc:d.foundationOpen?"Protected by Foundation. Earns 2%/yr. Cannot be touched by bankruptcy.":"Unprotected without Foundation. Opens Foundation to protect it. Earns 2%/yr.",interest:"2%/yr credited each turn",rule:"Dividends land here · Protected only with Foundation"},
          {key:"tradingWallet",label:"⚡ Trading Wallet",color:R,bg:"#FFEBEE",border:"#EF9A9A",desc:"All trades draw from here. First to be liquidated in bankruptcy. Auto-buys draw from here only.",interest:"None",rule:"All stocks, bonds, forex, commodities trade from here"},
        ].map(w=><div key={w.key} style={{background:w.bg,borderRadius:14,padding:14,border:"2px solid "+w.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div><div style={{fontSize:14,fontWeight:800,color:w.color}}>{w.label}</div><div style={{fontSize:11,color:"#666",marginTop:2}}>{w.desc}</div></div>
            <div style={{fontSize:20,fontWeight:800,color:w.color,fontFamily:"monospace"}}>{fm(d[w.key]||0)}</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <div style={{flex:1,background:"rgba(255,255,255,.6)",borderRadius:7,padding:"6px 8px"}}><div style={{fontSize:9,color:"#999",marginBottom:1}}>Interest</div><div style={{fontSize:11,fontWeight:700,color:DK}}>{w.interest}</div></div>
            <div style={{flex:2,background:"rgba(255,255,255,.6)",borderRadius:7,padding:"6px 8px"}}><div style={{fontSize:9,color:"#999",marginBottom:1}}>Rule</div><div style={{fontSize:10,fontWeight:600,color:DK}}>{w.rule}</div></div>
          </div>
          {w.key==="savingsWallet"&&!d.foundationOpen&&<button onClick={()=>setFoundationM(true)} style={{width:"100%",marginTop:8,background:AU,color:"#fff",border:"none",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>🏛️ Open Foundation to Protect Savings ($10K fee)</button>}
          {w.key==="savingsWallet"&&d.foundationOpen&&<div style={{marginTop:8,background:"#E8F5E9",borderRadius:7,padding:"6px 10px",fontSize:11,color:G,fontWeight:600}}>✅ Protected by Foundation · Earns 3%/yr in Foundation pool</div>}
        </div>)}
        {/* Foundation balance if open */}
        {d.foundationOpen&&<div style={{background:"#EDE7F6",borderRadius:14,padding:13,border:"1px solid #D1C4E9"}}>
          <div style={{fontSize:14,fontWeight:800,color:PU,marginBottom:4}}>🏛️ Foundation Pool</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:12,color:"#555"}}>Earns 3%/yr · Tax-advantaged · Protected</div><div style={{fontSize:20,fontWeight:800,color:PU,fontFamily:"monospace"}}>{fm(d.foundationBalance||0)}</div></div>
          <div style={{marginTop:8,fontSize:11,color:"#888"}}>Foundation separates your philanthropic assets. During bankruptcy, Foundation balance is NEVER touched. Interest accrues daily.</div>
        </div>}
        {/* Net worth summary */}
        <div style={{background:"#fff",borderRadius:14,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Summary</div>
          {[["Cash Wallet",fm(d.cashWallet||0)],["Savings Wallet",fm(d.savingsWallet||0)],["Trading Wallet",fm(d.tradingWallet||0)],["Foundation",fm(d.foundationBalance||0)],["Interest Earned",fm(d.interestReceived||0)],["Net Worth",fm(nw)]].map(([k,v],i,arr)=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}><span style={{fontSize:12,color:k==="Net Worth"?DK:"#666",fontWeight:k==="Net Worth"?700:400}}>{k}</span><span style={{fontSize:12,fontWeight:k==="Net Worth"?800:600,color:k==="Net Worth"?G:DK,fontFamily:"monospace"}}>{v}</span></div>)}
        </div>
        {d.activeLoan&&<div style={{background:"#FFEBEE",borderRadius:12,padding:12,border:"1px solid #EF9A9A"}}>
          <div style={{fontSize:13,fontWeight:700,color:R,marginBottom:6}}>Active Loan: {d.activeLoan.tier.label}</div>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            {[["Original",fm(d.activeLoan.amount)],["Outstanding",fm(d.activeLoan.outstanding)],["Rate",Math.round(d.activeLoan.rate*100)+"%"],["Taken",d.activeLoan.taken]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.5)",borderRadius:7,padding:"6px 4px",textAlign:"center"}}><div style={{fontSize:8,color:"#aaa",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:700,color:DK}}>{v}</div></div>)}
          </div>
          <div style={{display:"flex",gap:6}}>
            {[{l:"Repay 25%",amt:Math.round(d.activeLoan.outstanding*.25*100)/100},{l:"Repay 50%",amt:Math.round(d.activeLoan.outstanding*.50*100)/100},{l:"Repay All",amt:d.activeLoan.outstanding}].map(b=><button key={b.l} onClick={()=>repayLoan(b.amt)} disabled={b.amt>(d.tradingWallet||0)} style={{flex:1,background:b.amt>(d.tradingWallet||0)?"#f0f0f0":R,color:b.amt>(d.tradingWallet||0)?"#aaa":"#fff",border:"none",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:11,cursor:b.amt>(d.tradingWallet||0)?"not-allowed":"pointer"}}>{b.l}</button>)}
          </div>
        </div>}
        {/* 7-day streak */}
        <div style={{background:"linear-gradient(135deg,#4A148C,#6A1B9A)",borderRadius:12,padding:12,border:"1px solid #7B1FA2"}}>
          <div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:6}}>🎯 Login Streak Bonus</div>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            {Array.from({length:7}).map((_,i)=><div key={i} style={{flex:1,height:28,borderRadius:6,background:i<d.streak?"#CE93D8":"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{i<d.streak?"✓":"·"}</div>)}
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.8)"}}>{d.streak}/7 days · {7-d.streak} more to reward</div>
          {d.streakBonus&&<div style={{marginTop:6,background:"rgba(255,255,255,.15)",borderRadius:7,padding:"6px 10px",fontSize:11,color:"#fff",fontWeight:700}}>🎉 STREAK BONUS: 10% debt forgiveness + 1 free Wheel spin token available!</div>}
        </div>
      </>}

      {/* TRANSFER TAB */}
      {tab==="transfer"&&<>
        <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:14,fontWeight:800,color:DK,marginBottom:12}}>💸 Transfer Between Wallets</div>
          {/* Wallet balances */}
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {[{k:"cashWallet",l:"💵 Cash",c:"#1565C0"},{k:"savingsWallet",l:"🏦 Savings",c:d.foundationOpen?G:AU},{k:"tradingWallet",l:"⚡ Trading",c:R}].map(w=><div key={w.k} style={{flex:1,background:"#f8fbf8",borderRadius:9,padding:"8px 8px",textAlign:"center",border:"1px solid #e8e8e8"}}><div style={{fontSize:9,color:w.c,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{w.l}</div><div style={{fontSize:13,fontWeight:800,color:w.c,fontFamily:"monospace"}}>{fm(d[w.k]||0)}</div></div>)}
          </div>
          {/* Direction selector */}
          <div style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>Transfer Direction</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
            {Object.entries(dirs).map(([k,v])=><button key={k} onClick={()=>{setWDir(k);setWPct(null);}} style={{padding:"9px 8px",borderRadius:9,border:"2px solid "+(wDir===k?G:"#e0e0e0"),background:wDir===k?"#E8F5E9":"#fafafa",color:wDir===k?G:"#555",fontWeight:700,fontSize:10,cursor:"pointer",textAlign:"left"}}>
              <div>{v.label}</div>
              <div style={{fontSize:9,color:wDir===k?G:"#aaa",marginTop:1}}>{v.note}</div>
            </button>)}
          </div>
          {/* Amount */}
          <div style={{fontSize:11,color:"#888",marginBottom:7}}>From {dir?.from}: {fm(srcBal)}{dir?.srcKey==="savingsWallet"?" (min $10K stays)":""}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:10}}>
            {[10,25,50,100].map(pct=>{const amt=Math.round(maxT*(pct/100)*100)/100;return <button key={pct} onClick={()=>setWPct(wPct===pct?null:pct)} style={{padding:"10px 4px",borderRadius:10,border:"2px solid "+(wPct===pct?G:"#e0e0e0"),background:wPct===pct?"#E8F5E9":"#fafafa",color:wPct===pct?G:"#555",fontWeight:800,fontSize:12,cursor:"pointer",textAlign:"center"}}><div>{pct}%</div><div style={{fontSize:9,color:wPct===pct?G:"#aaa",marginTop:2}}>{fm(amt)}</div></button>;})}
          </div>
          {wPct&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>From {dir.from}</span><span style={{fontSize:12,fontWeight:700,color:R,fontFamily:"monospace"}}>−{fm(Math.round(maxT*(wPct/100)*100)/100)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>To {dir.to}</span><span style={{fontSize:12,fontWeight:700,color:G,fontFamily:"monospace"}}>+{fm(Math.round(maxT*(wPct/100)*100)/100)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:12,color:"#666"}}>Timing</span><span style={{fontSize:12,fontWeight:600,color:dir.note==="Instant"?G:AU}}>{dir.note}</span></div>
          </div>}
          <button onClick={doTransfer} disabled={!wPct||maxT<=0} style={{width:"100%",background:wPct&&maxT>0?G:"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:13,cursor:wPct&&maxT>0?"pointer":"not-allowed"}}>
            {wPct&&maxT>0?`Transfer ${wPct}% = ${fm(Math.round(maxT*(wPct/100)*100)/100)} from ${dir.from} → ${dir.to}`:"Select percentage above"}
          </button>
          <div style={{marginTop:10,fontSize:11,color:"#aaa",lineHeight:1.5}}>Note: 100% always transfers the exact maximum available. Any remaining decimal cents stay in source wallet.</div>
        </div>
      </>}

      {/* AUTO-BUY TAB */}
      {tab==="autobuy"&&<>
        <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:14,fontWeight:800,color:DK,marginBottom:6}}>🔄 Auto-Buy System</div>
          <div style={{fontSize:11,color:"#888",marginBottom:12,lineHeight:1.6}}>Auto-buys draw from <strong>Trading Wallet only</strong>. If Trading Wallet has insufficient funds, the purchase is skipped that turn and logged. Your Cash and Savings wallets are never touched.</div>
          {/* Active auto-buys */}
          {(d.autoBuys||[]).length===0?<div style={{padding:"15px 0",textAlign:"center",color:"#aaa",fontSize:12}}>No auto-buys set. Add one below.</div>:(d.autoBuys||[]).map((ab,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div><div style={{fontSize:12,fontWeight:700,color:DK}}>{ab.ticker}</div><div style={{fontSize:10,color:"#888"}}>{fm(ab.amount)}/purchase · every {ab.freq} turns</div></div>
            <button onClick={()=>{const s=S.current;s.autoBuys=s.autoBuys.filter((_,j)=>j!==i);refresh();toast_("Auto-buy removed: "+ab.ticker);}} style={{background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"5px 10px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Remove</button>
          </div>)}
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Add New Auto-Buy</div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:"#999",marginBottom:5}}>Select Company (from your holdings or any ticker)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:8}}>
              {["SLKT","MDCR","TNPT","FRMN","UTLS","TLCM"].map(t=><button key={t} onClick={()=>setNewAutoTicker(t)} style={{padding:"9px 0",borderRadius:9,border:"2px solid "+(newAutoTicker===t?G:"#e0e0e0"),background:newAutoTicker===t?"#E8F5E9":"#fafafa",color:newAutoTicker===t?G:"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{t}</button>)}
            </div>
            <div style={{fontSize:11,color:"#999",marginBottom:5}}>Amount per purchase (from Trading Wallet)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
              {[1000,5000,10000,50000].map(amt=><button key={amt} onClick={()=>setNewAutoAmt(amt)} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(newAutoAmt===amt?G:"#e0e0e0"),background:newAutoAmt===amt?"#E8F5E9":"#fafafa",color:newAutoAmt===amt?G:"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(amt)}</button>)}
            </div>
          </div>
          <button onClick={()=>{
            if(!newAutoTicker){toast_("Select a company",false);return;}
            if(!newAutoAmt){toast_("Select an amount",false);return;}
            const s=S.current;
            s.autoBuys=[...s.autoBuys,{ticker:newAutoTicker,amount:newAutoAmt,freq:5}];
            logTx(s,"AUTO_BUY_SET","Trading",0,"Auto-buy set: "+newAutoTicker+" "+fm(newAutoAmt)+" every 5 turns from Trading Wallet");
            toast_("Auto-buy set: "+newAutoTicker+" "+fm(newAutoAmt)+" every 5 turns from Trading Wallet");
            setNewAutoTicker("");setNewAutoAmt(null);refresh();
          }} disabled={!newAutoTicker||!newAutoAmt} style={{width:"100%",background:newAutoTicker&&newAutoAmt?G:"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:13,cursor:newAutoTicker&&newAutoAmt?"pointer":"not-allowed"}}>
            {newAutoTicker&&newAutoAmt?"Add Auto-Buy: "+newAutoTicker+" "+fm(newAutoAmt)+" every 5 turns":"Select company and amount above"}
          </button>
          <div style={{marginTop:8,fontSize:10,color:"#aaa",lineHeight:1.5}}>Auto-buys run every 5 turns. If Trading Wallet balance is insufficient, the purchase is skipped (not deducted) and a warning is logged. Cash and Savings wallets are never used for auto-buys.</div>
        </div>
      </>}

      {/* LOANS TAB */}
      {tab==="loans"&&<>
        <div style={{background:"#1565C0",borderRadius:14,padding:14,color:"#fff",marginBottom:0}}>
          <div style={{fontSize:16,fontWeight:800,marginBottom:6}}>💳 Loan System</div>
          <div style={{fontSize:12,opacity:.85,lineHeight:1.6}}>One loan at a time. You must fully repay before accessing the next tier. Each tier is larger. Loan proceeds go to Trading Wallet only. Interest paid quarterly.</div>
          {d.activeLoan&&<div style={{background:"rgba(255,255,255,.15)",borderRadius:9,padding:10,marginTop:10}}>
            <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Active: {d.activeLoan.tier.label}</div>
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:9,opacity:.6}}>Outstanding</div><div style={{fontSize:14,fontWeight:800,fontFamily:"monospace"}}>{fm(d.activeLoan.outstanding)}</div></div>
              <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:9,opacity:.6}}>Rate</div><div style={{fontSize:14,fontWeight:800}}>{Math.round(d.activeLoan.rate*100)}% APR</div></div>
              <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:9,opacity:.6}}>Since Turn</div><div style={{fontSize:14,fontWeight:800}}>{d.activeLoan.taken}</div></div>
            </div>
          </div>}
        </div>
        {LOAN_TIERS.map((tier,i)=>{
          const isActive=d.activeLoan?.tier.tier===tier.tier;
          const isRepaid=(d.loanHistory||[]).find(l=>l.tier.tier===tier.tier&&l.repaid);
          const isLocked=d.activeLoan&&!isActive;
          const isNext=!d.activeLoan&&tier.tier===loanTierReached+1;
          return <div key={i} style={{background:"#fff",borderRadius:13,padding:13,border:"2px solid "+(isActive?"#B71C1C":isRepaid?"#A5D6A7":isNext?"#1565C0":"#e0e0e0"),opacity:isLocked?.5:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:24,height:24,borderRadius:7,background:isRepaid?"#E8F5E9":isActive?"#FFEBEE":isNext?"#E3F2FD":"#f0f0f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,border:"1px solid "+(isRepaid?"#A5D6A7":isActive?"#EF9A9A":isNext?"#90CAF9":"#e0e0e0")}}>{isRepaid?"✅":isActive?"🔴":isNext?"▶":"🔒"}</div><div><div style={{fontSize:13,fontWeight:700,color:DK}}>{tier.label}</div><div style={{fontSize:10,color:"#888"}}>Tier {tier.tier} · {Math.round(tier.rate*100)}% APR</div></div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,fontFamily:"monospace",color:isActive?R:isRepaid?G:DK}}>{fm(tier.max)}</div></div>
            </div>
            <div style={{fontSize:11,color:"#888",marginBottom:8}}>Requires: {tier.requires}</div>
            {isActive&&<div style={{marginBottom:8,fontSize:11,color:R,fontWeight:600}}>⚠️ Active loan — repay before taking another</div>}
            {isNext&&!d.activeLoan&&<button onClick={()=>takeLoan(tier)} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Take {tier.label} — {fm(tier.max)} to Trading Wallet</button>}
            {isRepaid&&<div style={{fontSize:11,color:G,fontWeight:600}}>✅ Fully repaid — tier unlocked next loan</div>}
          </div>;
        })}
        <div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Loan History</div>
          {(d.loanHistory||[]).length===0?<div style={{fontSize:12,color:"#aaa"}}>No loan history yet.</div>:(d.loanHistory||[]).map((l,i)=><div key={i} style={{padding:"7px 0",borderBottom:"1px solid #f5f5f5"}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,fontWeight:700,color:DK}}>{l.tier.label}</span><span style={{fontSize:12,fontWeight:700,color:l.repaid?G:R}}>{l.repaid?"✅ Repaid":"⏳ Outstanding"}</span></div><div style={{fontSize:10,color:"#aaa"}}>{fm(l.amount)} · Taken T{l.taken}{l.repaidTurn?" · Repaid T"+l.repaidTurn:""}</div></div>)}
        </div>
      </>}

      {/* LOG TAB */}
      {tab==="log"&&<>
        <div style={{background:"#fff",borderRadius:12,padding:12,border:"1px solid #e8ebe8"}}>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {[{v:"quarterly",l:"Quarterly"},{v:"mine",l:"My Actions"},{v:"all",l:"All Logs"}].map(o=><button key={o.v} onClick={()=>setLogView(o.v)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"2px solid "+(logView===o.v?G:"#e0e0e0"),background:logView===o.v?"#E8F5E9":"#fafafa",color:logView===o.v?G:"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{o.l}</button>)}
          </div>
          <div style={{fontSize:11,color:"#888",marginBottom:8}}>{logView==="quarterly"?"Showing every 10th entry — key events only":logView==="mine"?"Showing your actions only":"Showing all entries"}</div>
          {shownLogs.length===0?<div style={{padding:"15px 0",textAlign:"center",color:"#aaa",fontSize:12}}>No entries.</div>:shownLogs.map((e,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid #f5f5f5",display:"flex",gap:8,alignItems:"flex-start"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:e.amount>=0?G:R,flexShrink:0,marginTop:5}}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:10,color:"#aaa"}}>T{e.turn} · {e.type} · {e.wallet}</span><span style={{fontSize:11,fontWeight:700,color:e.amount>=0?G:R,fontFamily:"monospace"}}>{e.amount!==0?(e.amount>0?"+":"")+fm(e.amount):""}</span></div>
              <div style={{fontSize:11,color:"#555",lineHeight:1.4}}>{e.desc}</div>
            </div>
          </div>)}
        </div>
      </>}
    </div>

    {/* Foundation modal */}
    {foundationM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setFoundationM(false)}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
        <div style={{width:36,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 14px"}}/>
        <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:4}}>🏛️ Open a Foundation</div>
        <div style={{fontSize:12,color:"#888",marginBottom:12,lineHeight:1.6}}>A Foundation permanently protects your Savings Wallet from bankruptcy. The Foundation itself earns 3%/yr on its own balance. One-time $10K setup fee from Cash Wallet.</div>
        <div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>Setup fee</span><span style={{fontSize:12,fontWeight:700,color:R}}>−$10,000 from Cash</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>Savings protection</span><span style={{fontSize:12,fontWeight:700,color:G}}>Permanent ✅</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:12,color:"#666"}}>Foundation interest</span><span style={{fontSize:12,fontWeight:700,color:G}}>3%/yr on Foundation balance</span></div>
        </div>
        <button onClick={()=>openFoundation("My Foundation")} disabled={(d.cashWallet||0)<10000} style={{width:"100%",background:(d.cashWallet||0)>=10000?PU:"#e0e0e0",color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:14,cursor:(d.cashWallet||0)>=10000?"pointer":"not-allowed"}}>🏛️ Open Foundation — $10K fee{(d.cashWallet||0)<10000?" (need $10K in Cash)":""}</button>
      </div>
    </div>}
    {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:toast.g?G:R,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,zIndex:400,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>{toast.msg}</div>}
    <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
  </div>;
}
