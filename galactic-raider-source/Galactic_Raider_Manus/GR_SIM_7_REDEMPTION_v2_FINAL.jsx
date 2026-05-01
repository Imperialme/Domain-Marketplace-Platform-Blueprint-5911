import{useState,useRef,useCallback,useEffect}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};

// Wheel segments — 12 segments with outcome, color, probability weight
const SEGMENTS=[
  {l:"5%",sub:"Debt Relief",c:"#4CAF50",outcome:"debt5",prob:30},
  {l:"Bonus",sub:"+100 pts",c:"#9C27B0",outcome:"pts100",prob:15},
  {l:"10%",sub:"Debt Relief",c:"#2196F3",outcome:"debt10",prob:20},
  {l:"5%",sub:"Debt Relief",c:"#4CAF50",outcome:"debt5",prob:30},
  {l:"15%",sub:"Debt Relief",c:"#FF9800",outcome:"debt15",prob:15},
  {l:"5%",sub:"Debt Relief",c:"#4CAF50",outcome:"debt5",prob:30},
  {l:"25%",sub:"Debt Relief",c:"#F44336",outcome:"debt25",prob:10},
  {l:"Bonus",sub:"+200 pts",c:"#9C27B0",outcome:"pts200",prob:10},
  {l:"50%",sub:"Debt Relief",c:"#FFD700",outcome:"debt50",prob:10},
  {l:"5%",sub:"Debt Relief",c:"#4CAF50",outcome:"debt5",prob:30},
  {l:"15%",sub:"Debt Relief",c:"#FF9800",outcome:"debt15",prob:15},
  {l:"10%",sub:"Debt Relief",c:"#2196F3",outcome:"debt10",prob:20},
];
const SEG_ANGLE=360/SEGMENTS.length;

const PHI_CATS=[
  {n:"Healthcare",ico:"🏥",rate:.20,dur:3,mult:1.3},
  {n:"Education",ico:"🎓",rate:.25,dur:5,mult:1.5},
  {n:"Environment",ico:"🌱",rate:.30,dur:7,mult:1.1},
  {n:"Infrastructure",ico:"🌉",rate:.15,dur:4,mult:1.0},
  {n:"Poverty",ico:"🤝",rate:.20,dur:3,mult:1.2},
  {n:"Science",ico:"🔬",rate:.25,dur:5,mult:1.0},
  {n:"Arts",ico:"🎨",rate:.10,dur:2,mult:1.0},
  {n:"Disaster",ico:"🚨",rate:.35,dur:8,mult:1.0},
];

export default function RedemptionSim(){
  const[tab,setTab]=useState("wheel");
  const[speed,setSpeed]=useState(1);
  const[auto,setAuto]=useState(false);
  const speedRef=useRef(1);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  const aRef=useRef(null);
  const[toast,setToast]=useState(null);
  const[donM,setDonM]=useState(null);
  const[donAmt,setDonAmt]=useState(null);
  // Wheel animation state
  const[spinning,setSpinning]=useState(false);
  const[wheelAngle,setWheelAngle]=useState(0);
  const[spinResult,setSpinResult]=useState(null);
  const[showResult,setShowResult]=useState(false);
  const angleRef=useRef(0);
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),3000);},[]);

  const S=useRef(null);
  if(!S.current){S.current={
    turn:1,
    tradingWallet:1000000,
    personalWallet:100000,
    savingsWallet:100000,
    totalDebt:250000,        // Starting with some debt to demonstrate
    redeemPts:350,           // Near threshold to demonstrate
    spinTokens:0,
    spinsUsed:0,
    lastSpin:0,
    totalDonated:0,
    dons:1,                  // One prior donation
    phiBen:[],
    taxRed:0,
    donHistory:[{turn:1,cat:"Healthcare",amt:1000000,pts:1300}],
    spinHistory:[],
    streak:5,                // 5-day streak shown
    lastLogin:0,
    debtHistory:[],
    log:[
      {turn:1,type:"SYSTEM",msg:"Redemption System online. Earn points through philanthropy → spin tokens → Wheel of Chance debt relief. Current debt: $250K.",good:true},
      {turn:1,type:"DONATION",msg:"Previous donation: $1M to Healthcare → 1,300 redemption points earned.",good:true},
    ],
  };}
  const[D,setD]=useState(()=>({...S.current}));
  const refresh=useCallback(()=>setD({...S.current}),[]);

  const advance=useCallback(()=>{
    const s=S.current;s.turn++;
    // Philanthropy benefit decay
    s.phiBen=(s.phiBen||[]).map(b=>({...b,rem:b.rem-1})).filter(b=>b.rem>0);
    s.taxRed=Math.min(.75,s.phiBen.reduce((x,b)=>x+b.rate,0));
    // Redemption pts decay 1% per 100 turns
    if(s.turn%100===0&&s.redeemPts>0){
      const decay=Math.round(s.redeemPts*.01);
      s.redeemPts=Math.max(0,s.redeemPts-decay);
      if(decay>0)s.log.unshift({turn:s.turn,type:"DECAY",msg:"Redemption points decay: −"+decay+" pts (1%/100 turns). Current: "+s.redeemPts,good:false});
    }
    // Streak
    s.streak=Math.min(7,s.streak+1);
    if(s.streak>=7&&!s.streakClaimed){
      s.streakClaimed=true;
      s.spinTokens=(s.spinTokens||0)+1;
      const forgiveness=Math.round((s.totalDebt||0)*0.10*100)/100;
      s.totalDebt=Math.max(0,(s.totalDebt||0)-forgiveness);
      s.log.unshift({turn:s.turn,type:"STREAK",msg:"7-DAY STREAK BONUS! 1 free spin token + 10% debt forgiveness ("+fm(forgiveness)+"). Debt now: "+fm(s.totalDebt),good:true});
    }
    refresh();
  },[refresh]);

  useEffect(()=>{
    if(!auto){clearInterval(aRef.current);return;}
    clearInterval(aRef.current);
    aRef.current=setInterval(()=>advance(),speedRef.current*1000);
    return()=>clearInterval(aRef.current);
  },[auto,speed,advance]);

  // Spin the wheel — smooth SVG animation
  const spinWheel=()=>{
    const s=S.current;
    if(spinning)return;
    if(s.redeemPts<500){toast_("Need 500 redemption points (have "+s.redeemPts+")",false);return;}
    if(s.spinTokens<1){toast_("Need a spin token. Donate $1M+ to earn one.",false);return;}
    if(s.spinsUsed>=5){toast_("Max 5 lifetime spins reached.",false);return;}
    if(s.turn-s.lastSpin<100&&s.lastSpin>0){toast_("Wait "+(100-(s.turn-s.lastSpin))+" more turns before next spin.",false);return;}

    // Deduct cost
    s.redeemPts-=500;
    s.spinTokens-=1;
    s.spinsUsed+=1;
    s.lastSpin=s.turn;
    refresh();

    // Determine outcome via weighted random
    const roll=Math.random()*100;
    const outcomes=[
      {min:0,max:30,outcome:"debt5",pct:5},
      {min:30,max:45,outcome:"debt10",pct:10},
      {min:45,max:60,outcome:"debt15",pct:15},
      {min:60,max:70,outcome:"debt25",pct:25},
      {min:70,max:80,outcome:"debt50",pct:50},
      {min:80,max:90,outcome:"pts100",pct:0,bonus:100},
      {min:90,max:100,outcome:"pts200",pct:0,bonus:200},
    ];
    const result=outcomes.find(o=>roll>=o.min&&roll<o.max)||outcomes[0];

    // Map outcome to segment index for landing
    const segMap={debt5:[0,3,5,9],debt10:[2,11],debt15:[4,10],debt25:[6],debt50:[8],pts100:[1],pts200:[7]};
    const targetSegs=segMap[result.outcome]||[0];
    const targetSeg=targetSegs[Math.floor(Math.random()*targetSegs.length)];

    // Calculate target angle — spin 5-8 full rotations + land on segment
    const targetSegCenter=targetSeg*SEG_ANGLE+SEG_ANGLE/2;
    const currentAngle=angleRef.current%360;
    const extraRotations=(5+Math.floor(Math.random()*4))*360;
    const targetFinal=extraRotations+(360-targetSegCenter)-currentAngle;

    setSpinning(true);
    setShowResult(false);

    // Animate
    let start=null;const duration=4000;
    const startAngle=angleRef.current;
    const endAngle=startAngle+targetFinal;

    const animate=(ts)=>{
      if(!start)start=ts;
      const progress=Math.min(1,(ts-start)/duration);
      // Ease out cubic
      const eased=1-Math.pow(1-progress,3);
      const current=startAngle+targetFinal*eased;
      angleRef.current=current;
      setWheelAngle(current);
      if(progress<1){requestAnimationFrame(animate);}
      else{
        angleRef.current=endAngle;
        setWheelAngle(endAngle);
        setSpinning(false);
        // Apply result
        const s2=S.current;
        if(result.outcome.startsWith("debt")&&result.pct>0){
          const relief=Math.round((s2.totalDebt||0)*(result.pct/100)*100)/100;
          s2.totalDebt=Math.max(0,(s2.totalDebt||0)-relief);
          s2.spinHistory=[{turn:s2.turn,outcome:result.pct+"% debt relief",amount:relief,good:true},...(s2.spinHistory||[])];
          s2.log.unshift({turn:s2.turn,type:"SPIN",msg:"CHANCE WHEEL RESULT: "+result.pct+"% debt relief — "+fm(relief)+" forgiven! Debt now: "+fm(s2.totalDebt),good:true});
          setSpinResult({type:"debt",pct:result.pct,amount:relief});
        }else if(result.bonus){
          s2.redeemPts=Math.min(5000,(s2.redeemPts||0)+result.bonus);
          s2.spinHistory=[{turn:s2.turn,outcome:"Bonus +"+result.bonus+" pts",amount:result.bonus,good:true},...(s2.spinHistory||[])];
          s2.log.unshift({turn:s2.turn,type:"SPIN",msg:"CHANCE WHEEL RESULT: Consolation prize — +"+result.bonus+" redemption points. Total: "+s2.redeemPts,good:true});
          setSpinResult({type:"bonus",pts:result.bonus});
        }
        setShowResult(true);
        refresh();
      }
    };
    requestAnimationFrame(animate);
  };

  const doDonate=(cat,amt)=>{
    if(amt<1000000){toast_("Min $1M donation",false);return;}
    const s=S.current;
    if(amt>s.tradingWallet){toast_("Insufficient Trading Wallet",false);return;}
    const pts=Math.round(amt/1000*cat.mult);
    s.tradingWallet=Math.round((s.tradingWallet-amt)*100)/100;
    s.totalDonated=(s.totalDonated||0)+amt;
    s.dons=(s.dons||0)+1;
    const newPts=Math.min(5000,(s.redeemPts||0)+pts);
    s.redeemPts=newPts;
    // Award spin token if threshold crossed
    if(newPts>=500&&s.dons>=2){
      s.spinTokens=(s.spinTokens||0)+1;
      s.log.unshift({turn:s.turn,type:"TOKEN",msg:"🎡 SPIN TOKEN EARNED! You have "+((s.spinTokens||0))+" token(s). Donate more or spin now.",good:true});
    }
    s.phiBen=[...(s.phiBen||[]),{cat:cat.n,rate:cat.rate,rem:cat.dur,dur:cat.dur}];
    s.donHistory=[{turn:s.turn,cat:cat.n,amt,pts},...(s.donHistory||[])].slice(0,20);
    s.log.unshift({turn:s.turn,type:"DONATION",msg:"Donated "+fm(amt)+" to "+cat.n+" → "+pts.toLocaleString()+" pts earned. "+cat.rate*100+"% tax relief for "+cat.dur+" turns."+(newPts>=500?" 🎡 Spin token earned!":""),good:true});
    setDonM(null);setDonAmt(null);
    toast_("❤️ "+fm(amt)+" donated → "+pts.toLocaleString()+" pts"+(s.spinTokens>0?" · Spin token unlocked!":""));
    refresh();
  };

  const d=D;
  const canSpin=d.redeemPts>=500&&d.spinTokens>=1&&d.spinsUsed<5&&(d.turn-d.lastSpin>=100||d.lastSpin===0);

  return <div style={{maxWidth:430,margin:"0 auto",background:"#0D1B2A",minHeight:"100vh",fontFamily:"system-ui,sans-serif",color:"#F8FAFC"}}>
    {/* Header */}
    <div style={{background:"linear-gradient(135deg,#1A0533,#3A0D5E)",padding:"14px 16px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{fontSize:11,color:"#9F7AEA",textTransform:"uppercase",letterSpacing:1.5,marginBottom:2}}>SIM FILE 7 — Redemption & Recovery</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div><div style={{fontSize:20,fontWeight:800,color:"#F8FAFC"}}>Turn {d.turn}</div><div style={{fontSize:12,color:"#9F7AEA"}}>Debt: {fm(d.totalDebt||0)} · Pts: {(d.redeemPts||0).toLocaleString()}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:700,color:"#F8FAFC",fontFamily:"monospace"}}>{fm((d.tradingWallet||0))}</div><div style={{fontSize:10,color:"#9F7AEA"}}>Trading Wallet</div></div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:10}}>
        <button onClick={advance} disabled={auto} style={{flex:2,background:auto?"rgba(255,255,255,.1)":G,color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:12,cursor:auto?"not-allowed":"pointer"}}>▶ Turn</button>
        <button onClick={()=>setAuto(a=>!a)} style={{flex:1,background:auto?"#7F1D1D":"rgba(255,255,255,.1)",color:auto?"#FCA5A5":"#94A3B8",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>{auto?"⏹":"Auto"}</button>
        {[.5,1,5,10].map(s=><button key={s} onClick={()=>setSpeed(s)} style={{flex:1,background:speed===s?"rgba(255,255,255,.2)":"rgba(255,255,255,.08)",color:speed===s?"#fff":"#64748B",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer"}}>{s<1?".5s":s+"s"}</button>)}
      </div>
      <div style={{display:"flex",gap:0}}>
        {[{id:"wheel",l:"🎡 Wheel"},{id:"points",l:"Points"},{id:"donate",l:"❤️ Donate"},{id:"streak",l:"Streak"},{id:"log",l:"Log"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 3px",border:"none",borderBottom:"3px solid "+(tab===t.id?"#9F7AEA":"transparent"),background:"transparent",color:tab===t.id?"#F8FAFC":"#64748B",fontWeight:700,fontSize:10,cursor:"pointer"}}>{t.l}</button>)}
      </div>
    </div>

    <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
      {/* WHEEL TAB */}
      {tab==="wheel"&&<>
        <div style={{background:"linear-gradient(135deg,#1A0533,#2D1054)",borderRadius:16,padding:16,border:"2px solid rgba(159,122,234,.3)",textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#E9D5FF",marginBottom:4}}>🎡 Wheel of Chance</div>
          <div style={{fontSize:12,color:"rgba(233,213,255,.7)",marginBottom:14,lineHeight:1.5}}>500 pts + 1 token per spin · Max 5 lifetime spins · Debt forgiveness or bonus points</div>
          {/* SVG Wheel */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:12,position:"relative"}}>
            <div style={{position:"relative",width:240,height:240}}>
              {/* Pointer */}
              <div style={{position:"absolute",top:-2,left:"50%",transform:"translateX(-50%)",zIndex:10,fontSize:22,filter:"drop-shadow(0 2px 6px rgba(0,0,0,.6))"}}>▼</div>
              <svg width="240" height="240" style={{transform:`rotate(${wheelAngle}deg)`,transition:"none",display:"block"}}>
                <defs>
                  <filter id="shadow"><feDropShadow dx="0" dy="0" stdDeviation="3" floodOpacity="0.3"/></filter>
                </defs>
                {SEGMENTS.map((seg,i)=>{
                  const a1=(i*SEG_ANGLE-90)*Math.PI/180;
                  const a2=((i+1)*SEG_ANGLE-90)*Math.PI/180;
                  const r=112,cx=120,cy=120;
                  const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1);
                  const x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2);
                  const mx=cx+r*.65*Math.cos((a1+a2)/2),my=cy+r*.65*Math.sin((a1+a2)/2);
                  const lx=cx+r*.65*Math.cos((a1+a2)/2);
                  const ly=cy+r*.65*Math.sin((a1+a2)/2);
                  return <g key={i}>
                    <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`} fill={seg.c} stroke="#0D1B2A" strokeWidth="1.5"/>
                    <text x={lx} y={ly-4} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="800" fill="#fff" transform={`rotate(${i*SEG_ANGLE+SEG_ANGLE/2},${lx},${ly})`}>{seg.l}</text>
                    <text x={lx} y={ly+7} textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="600" fill="rgba(255,255,255,.8)" transform={`rotate(${i*SEG_ANGLE+SEG_ANGLE/2},${lx},${ly})`}>{seg.sub}</text>
                  </g>;
                })}
                {/* Center hub */}
                <circle cx="120" cy="120" r="20" fill="#1A0533" stroke="#9F7AEA" strokeWidth="2.5"/>
                <text x="120" y="120" textAnchor="middle" dominantBaseline="middle" fontSize="16">🎡</text>
              </svg>
            </div>
          </div>
          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
            {[["Redeem Pts",(d.redeemPts||0).toLocaleString()],["Tokens",d.spinTokens||0],["Spins Left",5-(d.spinsUsed||0)]].map(([k,v])=><div key={k} style={{background:"rgba(255,255,255,.08)",borderRadius:9,padding:"8px 4px"}}><div style={{fontSize:9,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{k}</div><div style={{fontSize:18,fontWeight:800,color:"#E9D5FF"}}>{v}</div></div>)}
          </div>
          {/* Result banner */}
          {showResult&&spinResult&&<div style={{background:"linear-gradient(135deg,rgba(212,175,55,.2),rgba(212,175,55,.1))",borderRadius:12,padding:14,marginBottom:12,border:"2px solid rgba(212,175,55,.5)"}}>
            <div style={{fontSize:20,marginBottom:4}}>🎉</div>
            {spinResult.type==="debt"&&<><div style={{fontSize:16,fontWeight:800,color:"#FDE68A",marginBottom:3}}>{spinResult.pct}% Debt Relief!</div><div style={{fontSize:13,color:"rgba(253,230,138,.8)"}}>{fm(spinResult.amount)} forgiven · Debt now: {fm(d.totalDebt)}</div></>}
            {spinResult.type==="bonus"&&<><div style={{fontSize:16,fontWeight:800,color:"#E9D5FF",marginBottom:3}}>Consolation: +{spinResult.pts} Points</div><div style={{fontSize:13,color:"rgba(233,213,255,.8)"}}>Total: {(d.redeemPts||0).toLocaleString()} redemption points</div></>}
            <button onClick={()=>setShowResult(false)} style={{marginTop:8,background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,padding:"6px 16px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>Dismiss</button>
          </div>}
          {/* Spin button */}
          <button onClick={spinWheel} disabled={spinning||!canSpin} style={{width:"100%",background:spinning?"rgba(255,255,255,.1)":canSpin?"linear-gradient(135deg,#B8952A,#F0D060)":"rgba(255,255,255,.08)",color:spinning||!canSpin?"rgba(255,255,255,.3)":"#000",border:"none",borderRadius:12,padding:"15px 0",fontWeight:800,fontSize:15,cursor:spinning||!canSpin?"not-allowed":"pointer",transition:"all .2s"}}>
            {spinning?"🎡 Spinning...":canSpin?"🎡 SPIN! (500 pts + 1 token)":(d.redeemPts||0)<500?"Need "+(500-(d.redeemPts||0))+" more points":d.spinTokens<1?"No spin tokens — donate to earn":d.spinsUsed>=5?"Max 5 spins reached":"Conditions not met"}
          </button>
          {/* Conditions checklist */}
          <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:5}}>
            {[
              {ok:(d.redeemPts||0)>=500,l:"500+ redemption points (have "+(d.redeemPts||0)+")"},
              {ok:(d.spinTokens||0)>=1,l:"1+ spin token (have "+(d.spinTokens||0)+")"},
              {ok:(d.spinsUsed||0)<5,l:"Under 5 lifetime spins ("+(d.spinsUsed||0)+" used)"},
              {ok:(d.dons||0)>=2,l:"2+ donations ("+(d.dons||0)+" made)"},
            ].map((c,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.05)",borderRadius:7,padding:"6px 10px"}}>
              <span style={{fontSize:13}}>{c.ok?"✅":"⬜"}</span>
              <span style={{fontSize:11,color:c.ok?"#86EFAC":"rgba(255,255,255,.4)"}}>{c.l}</span>
            </div>)}
          </div>
        </div>
        {/* Outcomes reference */}
        <div style={{background:"rgba(255,255,255,.05)",borderRadius:13,padding:13,border:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#E9D5FF",marginBottom:8}}>Wheel Outcomes & Probabilities</div>
          {[["5% debt relief","Most common — 30% chance"],["10% debt relief","Common — 20% chance"],["15% debt relief","Uncommon — 15% chance"],["25% debt relief","Rare — 10% chance"],["50% debt relief","Jackpot — 10% chance"],["Bonus pts (+100/200)","Consolation — 15% chance"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}><span style={{fontSize:11,color:"#E9D5FF"}}>{k}</span><span style={{fontSize:10,color:"rgba(233,213,255,.5)"}}>{v}</span></div>)}
        </div>
      </>}

      {/* POINTS TAB */}
      {tab==="points"&&<>
        <div style={{background:"linear-gradient(135deg,#1A0533,#2D1054)",borderRadius:14,padding:14,border:"1px solid rgba(159,122,234,.3)"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#E9D5FF",marginBottom:10}}>Redemption Points System</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            {[["Current Points",(d.redeemPts||0).toLocaleString()+" / 5,000"],["Spin Tokens",d.spinTokens||0],["Total Donated",fm(d.totalDonated||0)],["Tax Relief",Math.round((d.taxRed||0)*100)+"%"]].map(([k,v])=><div key={k} style={{background:"rgba(255,255,255,.08)",borderRadius:9,padding:"10px 10px"}}><div style={{fontSize:9,color:"rgba(255,255,255,.5)",textTransform:"uppercase",marginBottom:3}}>{k}</div><div style={{fontSize:14,fontWeight:800,color:"#E9D5FF"}}>{v}</div></div>)}
          </div>
          {/* Points bar */}
          <div style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>Points Progress</span><span style={{fontSize:11,color:"#E9D5FF",fontWeight:700}}>{d.redeemPts||0} / 5,000</span></div><div style={{height:8,background:"rgba(255,255,255,.1)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,((d.redeemPts||0)/5000)*100)+"%",background:"linear-gradient(90deg,#7C3AED,#F0D060)",borderRadius:4,transition:"width .3s"}}/></div><div style={{display:"flex",justifyContent:"space-between",marginTop:3}}><span style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>0</span><span style={{fontSize:9,color:"#9F7AEA"}}>500 = spin</span><span style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>5,000 max</span></div></div>
        </div>
        <div style={{background:"rgba(255,255,255,.04)",borderRadius:13,padding:13,border:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#E9D5FF",marginBottom:10}}>How to Earn Points</div>
          {[["Donate $1M to Healthcare","1,300 pts (1.3× multiplier)","#EF4444"],["Donate $1M to Education","1,500 pts (1.5× multiplier — highest)","#F59E0B"],["Donate $1M to Poverty","1,200 pts (1.2× multiplier)","#10B981"],["Donate $1M to any category","1,000 pts base rate","#6B7280"],["7-day login streak","1 free spin token + 10% debt forgiveness","#8B5CF6"],["Wheel consolation prize","100–200 bonus pts","#9F7AEA"]].map(([k,v,c])=><div key={k} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.06)",alignItems:"flex-start"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:c,flexShrink:0,marginTop:4}}/>
            <div><div style={{fontSize:12,color:"#F8FAFC",fontWeight:600}}>{k}</div><div style={{fontSize:10,color:"rgba(255,255,255,.5)"}}>{v}</div></div>
          </div>)}
        </div>
        {(d.donHistory||[]).length>0&&<div style={{background:"rgba(255,255,255,.04)",borderRadius:13,padding:13,border:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#E9D5FF",marginBottom:8}}>Donation History</div>
          {(d.donHistory||[]).map((h,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}><div><div style={{fontSize:11,fontWeight:600,color:"#F8FAFC"}}>{h.cat}</div><div style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>Turn {h.turn}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,color:"#E9D5FF"}}>{fm(h.amt)}</div><div style={{fontSize:10,color:"#9F7AEA"}}>+{h.pts.toLocaleString()} pts</div></div></div>)}
        </div>}
      </>}

      {/* DONATE TAB */}
      {tab==="donate"&&<>
        <div style={{background:"linear-gradient(135deg,#7F1D1D,#991B1B)",borderRadius:14,padding:14,border:"1px solid rgba(239,68,68,.3)"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#FEE2E2",marginBottom:6}}>❤️ Philanthropy</div>
          <div style={{fontSize:12,color:"rgba(254,226,226,.8)",lineHeight:1.6}}>Minimum $1M per donation. Earns redemption points → spin tokens. Also reduces your tax rate for multiple turns.</div>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            {[["Trading Wallet",fm(d.tradingWallet||0)],["Points",(d.redeemPts||0).toLocaleString()],["Tax Relief",Math.round((d.taxRed||0)*100)+"%"]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.1)",borderRadius:8,padding:"7px 6px",textAlign:"center"}}><div style={{fontSize:8,color:"rgba(255,255,255,.6)",marginBottom:1}}>{k}</div><div style={{fontSize:12,fontWeight:800,color:"#FEE2E2"}}>{v}</div></div>)}
          </div>
          {(d.phiBen||[]).length>0&&<div style={{marginTop:10,background:"rgba(255,255,255,.1)",borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:"rgba(254,226,226,.8)",fontWeight:700,marginBottom:4}}>Active Benefits</div>{(d.phiBen||[]).map((b,i)=><div key={i} style={{fontSize:10,color:"rgba(254,226,226,.7)"}}>{b.cat}: {(b.rate*100).toFixed(0)}% relief · {b.rem}/{b.dur} turns left</div>)}</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {PHI_CATS.map(cat=><div key={cat.n} style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:12,border:"1px solid rgba(255,255,255,.08)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:22}}>{cat.ico}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,fontWeight:700,color:"#F8FAFC"}}>{cat.n}</span><div style={{display:"flex",gap:5}}><span style={{background:"rgba(159,122,234,.2)",color:"#C4B5FD",padding:"2px 7px",borderRadius:10,fontSize:9,fontWeight:700}}>{(cat.rate*100).toFixed(0)}% tax relief</span><span style={{background:"rgba(212,175,55,.15)",color:"#FDE68A",padding:"2px 7px",borderRadius:10,fontSize:9,fontWeight:700}}>{cat.dur}t duration</span></div></div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:1}}>{cat.mult.toFixed(1)}× point multiplier · $1M = {(1000*cat.mult).toFixed(0)} pts</div>
              </div>
            </div>
            <button onClick={()=>{setDonM(cat);setDonAmt(null);}} style={{width:"100%",background:"rgba(239,68,68,.2)",color:"#FCA5A5",border:"1px solid rgba(239,68,68,.3)",borderRadius:9,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Donate to {cat.n} ❤️</button>
          </div>)}
        </div>
      </>}

      {/* STREAK TAB */}
      {tab==="streak"&&<>
        <div style={{background:"linear-gradient(135deg,#312E81,#4338CA)",borderRadius:14,padding:14,border:"1px solid rgba(99,102,241,.3)"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#E0E7FF",marginBottom:10}}>🎯 Login Streak Bonus</div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {Array.from({length:7}).map((_,i)=><div key={i} style={{flex:1,height:48,borderRadius:10,background:i<(d.streak||0)?"rgba(99,102,241,.4)":"rgba(255,255,255,.05)",border:"1px solid "+(i<(d.streak||0)?"rgba(99,102,241,.6)":"rgba(255,255,255,.08)"),display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:2}}><span style={{fontSize:i<(d.streak||0)?16:11}}>{i<(d.streak||0)?"✓":"·"}</span><span style={{fontSize:8,color:"rgba(255,255,255,.4)"}}>D{i+1}</span></div>)}
          </div>
          <div style={{fontSize:13,color:"rgba(224,231,255,.8)",marginBottom:4}}>{d.streak||0}/7 days complete · {7-(d.streak||0)} more to reward</div>
          <div style={{fontSize:11,color:"rgba(224,231,255,.5)",lineHeight:1.6}}>Each advance = 1 simulated day. In the real game this tracks calendar days.</div>
          {(d.streakClaimed||d.streak>=7)&&<div style={{marginTop:10,background:"rgba(255,255,255,.1)",borderRadius:9,padding:"10px 12px"}}>
            <div style={{fontSize:14,fontWeight:800,color:"#FDE68A",marginBottom:4}}>🎉 STREAK COMPLETE!</div>
            <div style={{fontSize:12,color:"rgba(253,230,138,.8)"}}>Rewards: 1 free spin token + 10% debt forgiveness</div>
          </div>}
        </div>
        <div style={{background:"rgba(255,255,255,.04)",borderRadius:13,padding:13,border:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#E9D5FF",marginBottom:10}}>Streak Rewards</div>
          {[{d:3,r:"Small bonus: +50 redemption points"},{d:7,r:"MAIN REWARD: 10% debt forgiveness + 1 free spin token"},{d:14,r:"MEGA REWARD: 20% debt forgiveness + 2 spin tokens"},{d:30,r:"LEGEND: 35% debt forgiveness + guaranteed 50% wheel outcome"}].map((s,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
            <div style={{width:28,height:28,borderRadius:7,background:(d.streak||0)>=s.d?"rgba(99,102,241,.3)":"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#C4B5FD",flexShrink:0}}>{s.d}</div>
            <div><div style={{fontSize:11,color:(d.streak||0)>=s.d?"#C4B5FD":"rgba(255,255,255,.4)",fontWeight:(d.streak||0)>=s.d?700:400}}>{s.r}</div></div>
          </div>)}
        </div>
      </>}

      {/* LOG TAB */}
      {tab==="log"&&<div style={{background:"rgba(255,255,255,.04)",borderRadius:13,padding:13,border:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#E9D5FF",marginBottom:10}}>Redemption Log — {(d.log||[]).length} entries</div>
        {(d.log||[]).map((e,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",gap:8}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:e.good?"#86EFAC":"#FCA5A5",flexShrink:0,marginTop:5}}/>
          <div><div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginBottom:2}}>T{e.turn} · {e.type}</div><div style={{fontSize:11,color:e.good?"#F8FAFC":"#FCA5A5",lineHeight:1.5}}>{e.msg}</div></div>
        </div>)}
      </div>}
    </div>

    {/* Donate modal */}
    {donM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setDonM(null)}>
      <div style={{background:"#1E1035",borderRadius:"20px 20px 0 0",padding:20,width:"100%",border:"1px solid rgba(159,122,234,.3)"}}>
        <div style={{width:36,height:5,background:"rgba(255,255,255,.2)",borderRadius:3,margin:"0 auto 14px"}}/>
        <div style={{fontSize:17,fontWeight:800,color:"#E9D5FF",marginBottom:4}}>{donM.ico} Donate to {donM.n}</div>
        <div style={{fontSize:12,color:"rgba(233,213,255,.6)",marginBottom:12,lineHeight:1.6}}>{donM.mult.toFixed(1)}× multiplier · {(donM.rate*100).toFixed(0)}% tax relief for {donM.dur} turns · Min $1M · Trading Wallet: {fm(d.tradingWallet||0)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:12}}>
          {[1000000,5000000,10000000,50000000,100000000].filter(v=>v<=(d.tradingWallet||0)).map(v=><button key={v} onClick={()=>setDonAmt(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(donAmt===v?"#9F7AEA":"rgba(255,255,255,.1)"),background:donAmt===v?"rgba(159,122,234,.2)":"rgba(255,255,255,.04)",color:donAmt===v?"#E9D5FF":"rgba(255,255,255,.5)",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(v)}</button>)}
        </div>
        {donAmt&&<div style={{background:"rgba(255,255,255,.05)",borderRadius:9,padding:10,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}><span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>Donation</span><span style={{fontSize:12,fontWeight:700,color:"#EF4444",fontFamily:"monospace"}}>{fm(donAmt)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}><span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>Points earned</span><span style={{fontSize:12,fontWeight:700,color:"#C4B5FD",fontFamily:"monospace"}}>+{Math.round(donAmt/1000*donM.mult).toLocaleString()}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>Tax relief</span><span style={{fontSize:12,fontWeight:700,color:"#86EFAC"}}>{(donM.rate*100).toFixed(0)}% for {donM.dur} turns</span></div>
        </div>}
        <button onClick={()=>doDonate(donM,donAmt||0)} disabled={!donAmt||donAmt<1000000} style={{width:"100%",background:donAmt&&donAmt>=1000000?"#7C3AED":"rgba(255,255,255,.1)",color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:14,cursor:donAmt&&donAmt>=1000000?"pointer":"not-allowed"}}>❤️ Donate{donAmt?" "+fm(donAmt):""}</button>
      </div>
    </div>}

    {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:toast.g?"#7C3AED":R,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,zIndex:400,textAlign:"center",boxShadow:"0 4px 20px rgba(0,0,0,.5)"}}>{toast.msg}</div>}
    <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
  </div>;
}
