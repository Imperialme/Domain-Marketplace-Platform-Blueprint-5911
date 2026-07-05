import{useState,useRef,useCallback,useEffect}from"react";
// ── GALACTIC RAIDER — TAX ENGINE DEMO ────────────────────────
// Focused file: All 8 tax eras, philanthropy, redemption points,
// Wheel of Fortune, tax breakdown. Simulated portfolio to show impact.
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);

const TAX_ERAS=[
  {name:"Normal",cgt:.20,div:.15,bond:.25,txn:.001,wealth:.001,desc:"Standard tax rates across all asset classes.",color:"#455A64"},
  {name:"High Tax",cgt:.30,div:.25,bond:.35,txn:.0015,wealth:.0015,desc:"Government spending surge — all rates elevated. Philanthropy more valuable now.",color:R},
  {name:"Low Tax",cgt:.10,div:.05,bond:.15,txn:.0005,wealth:.0005,desc:"Tax holiday — ideal time to realise gains. Sell winners now.",color:G},
  {name:"Capital Gains",cgt:.05,div:.15,bond:.25,txn:.001,wealth:.001,desc:"CGT slashed to 5%. Best era to sell profitable positions.",color:"#2E7D32"},
  {name:"Dividend",cgt:.20,div:.05,bond:.25,txn:.001,wealth:.001,desc:"Dividend tax cut to 5%. High-yield stocks pay you more this era.",color:"#1565C0"},
  {name:"Transaction",cgt:.20,div:.15,bond:.25,txn:.0001,wealth:.001,desc:"Trading tax near zero. High-frequency trading is efficient.",color:"#6A1B9A"},
  {name:"Wealth Tax",cgt:.20,div:.15,bond:.25,txn:.001,wealth:.002,desc:"Wealth above $10B taxed at 0.2%/turn. GSF and philanthropy reduce this.",color:"#B71C1C"},
  {name:"Normal",cgt:.20,div:.15,bond:.25,txn:.001,wealth:.001,desc:"Cycle resets. New strategies needed.",color:"#455A64"},
];
const PHI_CATS=[
  {n:"Healthcare",ico:"🏥",rate:.20,dur:3,mult:1.3,desc:"20% off all taxes for 3 turns. WHO partnership bonus."},
  {n:"Education",ico:"🎓",rate:.25,dur:5,mult:1.5,desc:"25% off for 5 turns. Highest point multiplier (1.5×)."},
  {n:"Environment",ico:"🌱",rate:.30,dur:7,mult:1.1,desc:"Highest rate (30%) for 7 turns. Long-lasting relief."},
  {n:"Infrastructure",ico:"🌉",rate:.15,dur:4,mult:1.0,desc:"15% off for 4 turns. GDP boost side effect."},
  {n:"Poverty",ico:"🤝",rate:.20,dur:3,mult:1.2,desc:"20% off for 3 turns. Consumer sector boost."},
  {n:"Science",ico:"🔬",rate:.25,dur:5,mult:1.0,desc:"25% off for 5 turns. Tech sector bonus."},
  {n:"Arts",ico:"🎨",rate:.10,dur:2,mult:1.0,desc:"Smallest benefit but cheapest. Min $1M."},
  {n:"Disaster",ico:"🚨",rate:.35,dur:8,mult:1.0,desc:"Highest rate (35%) for 8 turns. Longest relief."},
];

export default function TaxEngine(){
  const[turn,setTurn]=useState(1);
  const[tab,setTab]=useState("era");
  const[nw,setNw]=useState(5000000);
  const[cash,setCash]=useState(2000000);
  const[phiBen,setPhiBen]=useState([]);
  const[phiHistory,setPhiHistory]=useState([]);
  const[redeemPts,setRedeemPts]=useState(0);
  const[spinTokens,setSpinTokens]=useState(0);
  const[spinsUsed,setSpinsUsed]=useState(0);
  const[lastSpin,setLastSpin]=useState(0);
  const[taxPaid,setTaxPaid]=useState({cgt:0,div:0,bond:0,txn:0,wealth:0,total:0});
  const[toast,setToast]=useState(null);
  const[donM,setDonM]=useState(null);
  const[donAmt,setDonAmt]=useState(null);
  const[spinResult,setSpinResult]=useState(null);
  const[spinning,setSpinning]=useState(false);
  const[spinAngle,setSpinAngle]=useState(0);
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2800);},[]);

  const eraIdx=Math.floor((turn-1)/60)%TAX_ERAS.length;
  const era=TAX_ERAS[eraIdx];
  const eraProgress=((turn-1)%60)/60;
  const turnsLeft=60-((turn-1)%60);
  const taxRed=Math.min(.75,phiBen.reduce((x,b)=>x+b.rate,0));
  const effCgt=Math.round(era.cgt*(1-taxRed)*100*10)/10;
  const effDiv=Math.round(era.div*(1-taxRed)*100*10)/10;
  const effTxn=Math.round(era.txn*(1-taxRed)*10000*10)/10;

  const nextTurn=()=>{
    setTurn(t=>t+1);
    setPhiBen(b=>b.map(x=>({...x,rem:x.rem-1})).filter(x=>x.rem>0));
    // Simulate wealth tax if NW > $10B
    if(nw>10e9){const wt=Math.round((nw-10e9)*era.wealth*(1-taxRed)*100)/100;setCash(c=>Math.max(0,c-wt));setTaxPaid(t=>({...t,wealth:t.wealth+wt,total:t.total+wt}));}
  };

  const doSell=(profit)=>{
    const cgt=Math.round(profit*era.cgt*(1-taxRed)*100)/100;
    const txn=Math.round(profit*.001*(1-taxRed)*100)/100;
    setCash(c=>c+profit-cgt-txn);
    setTaxPaid(t=>({...t,cgt:t.cgt+cgt,txn:t.txn+txn,total:t.total+cgt+txn}));
    toast_("Realised "+fm(profit)+" profit. CGT: "+fm(cgt)+" ("+effCgt.toFixed(1)+"% effective). Txn: "+fm(txn));
  };

  const doDonate=(cat,amt)=>{
    if(amt<1000000){toast_("Min $1M donation",false);return;}
    if(amt>cash){toast_("Insufficient cash",false);return;}
    const pts=Math.round(amt/1000*cat.mult);
    setCash(c=>c-amt);
    setPhiBen(b=>[...b,{cat:cat.n,rate:cat.rate,rem:cat.dur,dur:cat.dur}]);
    setPhiHistory(h=>[{t:turn,cat:cat.n,amt,pts},...h]);
    const newPts=redeemPts+pts;
    setRedeemPts(Math.min(5000,newPts));
    if(newPts>=500&&phiHistory.length>=1)setSpinTokens(s=>s+1);
    setDonM(null);setDonAmt(null);
    toast_("Donated "+fm(amt)+" to "+cat.n+" ❤️ · "+pts.toLocaleString()+" pts · "+(cat.rate*100).toFixed(0)+"% relief for "+cat.dur+" turns"+(newPts>=500?" · 🎡 Spin token earned!":""));
  };

  const doSpin=()=>{
    if(redeemPts<500){toast_("Need 500 redemption points",false);return;}
    if(spinTokens<1){toast_("No spin tokens",false);return;}
    if(spinsUsed>=5){toast_("Max 5 spins reached",false);return;}
    if(turn-lastSpin<1000&&lastSpin>0){toast_("Wait "+(1000-(turn-lastSpin))+" more turns",false);return;}
    setSpinning(true);
    let angle=spinAngle,frames=0,total=2160+Math.floor(Math.random()*720);
    const tick=()=>{frames++;angle+=Math.max(2,20*(1-frames/150));if(frames>=150){setSpinAngle(angle%360);setSpinning(false);const roll=Math.random();let result,relief;if(roll<.30){result="5% debt relief";relief=5;}else if(roll<.50){result="10% debt relief";relief=10;}else if(roll<.65){result="15% debt relief";relief=15;}else if(roll<.75){result="25% debt relief";relief=25;}else if(roll<.85){result="50% debt relief";relief=50;}else{result="Bonus 100 pts";relief=0;setRedeemPts(r=>Math.min(5000,r+100));}setSpinResult({result,relief});setRedeemPts(r=>r-500);setSpinTokens(s=>s-1);setSpinsUsed(s=>s+1);setLastSpin(turn);return;}setSpinAngle(angle%360);requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
  };

  const SEGMENTS=[{l:"5%",c:"#4CAF50"},{l:"Bonus",c:"#9C27B0"},{l:"10%",c:"#2196F3"},{l:"5%",c:"#4CAF50"},{l:"15%",c:"#FF9800"},{l:"5%",c:"#4CAF50"},{l:"25%",c:"#F44336"},{l:"10%",c:"#2196F3"},{l:"50%",c:"#FFD700"},{l:"Bonus",c:"#9C27B0"},{l:"15%",c:"#FF9800"},{l:"5%",c:"#4CAF50"}];
  const segAngle=360/SEGMENTS.length;

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
    {/* Header */}
    <div style={{background:era.color,padding:"12px 16px",color:"#fff"}}>
      <div style={{fontSize:11,opacity:.7,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>🔔 Tax Era — Turn {turn}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{fontSize:22,fontWeight:800}}>{era.name}</div>
        <div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700}}>{turnsLeft} turns left</div><div style={{fontSize:10,opacity:.7}}>Era {eraIdx+1}/8</div></div>
      </div>
      <div style={{height:5,background:"rgba(255,255,255,.2)",borderRadius:3,overflow:"hidden",marginBottom:8}}><div style={{height:"100%",width:(eraProgress*100).toFixed(1)+"%",background:"rgba(255,255,255,.8)",borderRadius:3}}/></div>
      <div style={{fontSize:11,opacity:.85,lineHeight:1.5}}>{era.desc}</div>
    </div>
    {/* Tabs */}
    <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #e0e0e0"}}>
      {[{id:"era",l:"Tax Era"},{id:"phi",l:"Philanthropy"},{id:"spin",l:"🎡 Wheel"},{id:"calc",l:"Calculator"},{id:"hist",l:"History"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 4px",border:"none",borderBottom:"3px solid "+(tab===t.id?era.color:"transparent"),background:"#fff",color:tab===t.id?era.color:"#888",fontWeight:700,fontSize:11,cursor:"pointer"}}>{t.l}</button>)}
    </div>
    <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
      {/* TAX ERA TAB */}
      {tab==="era"&&<>
        {/* Current rates */}
        <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:14,fontWeight:700,color:DK,marginBottom:12}}>Current Tax Rates</div>
          {[
            {k:"Capital Gains Tax",spec:era.cgt,eff:effCgt,label:"On profit when you sell"},
            {k:"Dividend Withholding",spec:era.div,eff:Math.round(era.div*(1-taxRed)*100*10)/10,label:"Deducted from dividends paid"},
            {k:"Bond Interest Tax",spec:era.bond,eff:Math.round(era.bond*(1-taxRed)*100*10)/10,label:"On bond coupon payments"},
            {k:"Transaction Tax",spec:era.txn,eff:Math.round(era.txn*(1-taxRed)*10000*10)/10/100,label:"Per buy and sell trade (%)"},
            {k:"Wealth Tax",spec:era.wealth,eff:Math.round(era.wealth*(1-taxRed)*1000*10)/10/10,label:"Per turn on NW above $10B"},
          ].map(r=><div key={r.k} style={{padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:12,color:"#555",fontWeight:600}}>{r.k}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,color:"#aaa",textDecoration:taxRed>0?"line-through":"none"}}>{(r.spec*100).toFixed(2)}%</span>
                {taxRed>0&&<span style={{fontSize:13,fontWeight:800,color:G,fontFamily:"monospace"}}>{r.eff.toFixed(2)}%</span>}
              </div>
            </div>
            <div style={{fontSize:10,color:"#bbb"}}>{r.label}</div>
          </div>)}
          {taxRed>0&&<div style={{background:"#E8F5E9",borderRadius:9,padding:"8px 11px",marginTop:10,fontSize:11,color:G,fontWeight:600}}>❤️ Philanthropy relief active: {(taxRed*100).toFixed(0)}% off all rates · {phiBen.map(b=>b.cat+" ("+b.rem+"t)").join(", ")}</div>}
        </div>
        {/* Era timeline */}
        <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>8-Era Cycle (60 turns each)</div>
          {TAX_ERAS.map((e,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<TAX_ERAS.length-1?"1px solid #f5f5f5":"none",opacity:i===eraIdx?1:.55}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:e.color,flexShrink:0,border:i===eraIdx?"2px solid #000":"none"}}/>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:i===eraIdx?800:600,color:i===eraIdx?e.color:DK}}>{e.name}{i===eraIdx?" ← NOW":""}</div><div style={{fontSize:10,color:"#aaa"}}>CGT {(e.cgt*100).toFixed(0)}% · Div {(e.div*100).toFixed(0)}% · Txn {(e.txn*1000).toFixed(1)}‰</div></div>
          </div>)}
        </div>
        {/* Simulator */}
        <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Simulator — Click to test</div>
          <div style={{fontSize:11,color:"#888",marginBottom:10}}>Cash: {fm(cash)} · Total tax paid: {fm(taxPaid.total)}</div>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <button onClick={()=>doSell(100000)} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell $100K profit</button>
            <button onClick={()=>doSell(1000000)} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell $1M profit</button>
          </div>
          <button onClick={nextTurn} style={{width:"100%",background:era.color,color:"#fff",border:"none",borderRadius:9,padding:"12px 0",fontWeight:800,fontSize:13,cursor:"pointer"}}>▶ Advance Turn ({turn} → {turn+1})</button>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:10}}>
            {[["CGT Paid",fm(taxPaid.cgt)],["Div Tax",fm(taxPaid.div)],["Bond Tax",fm(taxPaid.bond)],["Wealth Tax",fm(taxPaid.wealth)]].map(([k,v])=><div key={k} style={{background:"#f8f8f8",borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:9,color:"#aaa",textTransform:"uppercase",marginBottom:2}}>{k}</div><div style={{fontSize:13,fontWeight:700,color:R,fontFamily:"monospace"}}>{v}</div></div>)}
          </div>
        </div>
      </>}
      {/* PHILANTHROPY TAB */}
      {tab==="phi"&&<>
        <div style={{background:"linear-gradient(135deg,#880E4F,#C2185B)",borderRadius:14,padding:14,color:"#fff"}}>
          <div style={{fontSize:16,fontWeight:800,marginBottom:6}}>❤️ Philanthropy Engine</div>
          <div style={{fontSize:12,opacity:.85,lineHeight:1.6}}>Donations earn Redemption Points. 500 pts = 1 Spin Token. 2 donations = Wheel of Fortune access. Max 75% combined tax relief.</div>
          <div style={{display:"flex",gap:6,marginTop:10}}>
            {[["Cash",fm(cash)],["Redeem Pts",(redeemPts).toLocaleString()],["Spin Tokens",spinTokens],["Tax Relief",(taxRed*100).toFixed(0)+"%"]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.15)",borderRadius:8,padding:"7px 6px",textAlign:"center"}}><div style={{fontSize:8,opacity:.7,textTransform:"uppercase",marginBottom:2}}>{k}</div><div style={{fontSize:12,fontWeight:800}}>{v}</div></div>)}
          </div>
        </div>
        {phiBen.length>0&&<div style={{background:"#E8F5E9",borderRadius:11,padding:11,border:"1px solid #A5D6A7"}}>
          <div style={{fontSize:12,fontWeight:700,color:G,marginBottom:7}}>Active Benefits — {(taxRed*100).toFixed(0)}% combined relief</div>
          {phiBen.map((b,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0",fontSize:12}}><span style={{color:"#555"}}>{b.cat}</span><span style={{fontWeight:700,color:G}}>{(b.rate*100).toFixed(0)}% · {b.rem}/{b.dur} turns</span></div>)}
        </div>}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {PHI_CATS.map(cat=><div key={cat.n} style={{background:"#fff",borderRadius:12,padding:12,border:"1px solid #e8ebe8"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
              <span style={{fontSize:22,flexShrink:0}}>{cat.ico}</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:DK}}>{cat.n}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{cat.desc}</div></div>
              <div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:13,fontWeight:800,color:PU}}>{(cat.rate*100).toFixed(0)}%</div><div style={{fontSize:9,color:"#aaa"}}>{cat.dur} turns</div></div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}><span style={{fontSize:10,background:"#EDE7F6",color:PU,padding:"2px 7px",borderRadius:20,fontWeight:700}}>Pts multiplier: {cat.mult.toFixed(1)}×</span><span style={{fontSize:10,color:"#aaa"}}>Min $1M donation</span></div>
            <button onClick={()=>{setDonM(cat);setDonAmt(null);}} style={{width:"100%",background:"#880E4F",color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Donate to {cat.n} ❤️</button>
          </div>)}
        </div>
      </>}
      {/* WHEEL OF FORTUNE TAB */}
      {tab==="spin"&&<>
        <div style={{background:"linear-gradient(135deg,#1A237E,#283593)",borderRadius:14,padding:14,border:"2px solid gold",textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:800,color:"gold",marginBottom:4}}>🎡 Wheel of Fortune</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.8)",marginBottom:12,lineHeight:1.5}}>Earn 500 redemption points + make 2 donations to unlock. Each spin costs 500 pts + 1 token. Max 5 spins per game.</div>
          {/* SVG Wheel */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:12,position:"relative"}}>
            <div style={{position:"relative",width:220,height:220}}>
              <svg width="220" height="220" style={{transform:`rotate(${spinAngle}deg)`,transition:spinning?"none":"transform 0.3s ease"}}>
                {SEGMENTS.map((seg,i)=>{
                  const a1=(i*segAngle-90)*Math.PI/180,a2=((i+1)*segAngle-90)*Math.PI/180,r=100,cx=110,cy=110;
                  const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2);
                  const mx=cx+r*.65*Math.cos((a1+a2)/2),my=cy+r*.65*Math.sin((a1+a2)/2);
                  return <g key={i}>
                    <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`} fill={seg.c} stroke="#fff" strokeWidth="2"/>
                    <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="800" fill="#fff" transform={`rotate(${i*segAngle+segAngle/2},${mx},${my})`}>{seg.l}</text>
                  </g>;
                })}
                <circle cx="110" cy="110" r="18" fill="#fff" stroke="#333" strokeWidth="3"/>
                <text x="110" y="110" textAnchor="middle" dominantBaseline="middle" fontSize="14">🎡</text>
              </svg>
              {/* Pointer */}
              <div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",fontSize:20,filter:"drop-shadow(0 2px 4px rgba(0,0,0,.5))"}}>▼</div>
            </div>
          </div>
          {spinResult&&<div style={{background:"rgba(255,255,255,.15)",borderRadius:10,padding:12,marginBottom:12,border:"2px solid gold"}}>
            <div style={{fontSize:16,fontWeight:800,color:"gold",marginBottom:4}}>🎉 Result: {spinResult.result}</div>
            {spinResult.relief>0&&<div style={{fontSize:12,color:"rgba(255,255,255,.85)"}}>Debt forgiveness applied. Net worth adjustment processed.</div>}
            <button onClick={()=>setSpinResult(null)} style={{marginTop:8,background:"rgba(255,255,255,.2)",border:"none",borderRadius:8,padding:"7px 16px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>Dismiss</button>
          </div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            {[["Redeem Pts",(redeemPts||0).toLocaleString()],["Spin Tokens",spinTokens||0],["Spins Left",5-(spinsUsed||0)]].map(([k,v])=><div key={k} style={{background:"rgba(255,255,255,.1)",borderRadius:8,padding:"8px 4px",textAlign:"center"}}><div style={{fontSize:9,color:"rgba(255,255,255,.6)",textTransform:"uppercase",marginBottom:2}}>{k}</div><div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{v}</div></div>)}
          </div>
          <button onClick={doSpin} disabled={spinning||(redeemPts||0)<500||(spinTokens||0)<1||(spinsUsed||0)>=5} style={{width:"100%",background:spinning||(redeemPts||0)<500||(spinTokens||0)<1||(spinsUsed||0)>=5?"rgba(255,255,255,.1)":"linear-gradient(135deg,#B8952A,#F0D060)",color:spinning||(redeemPts||0)<500?"rgba(255,255,255,.4)":"#000",border:"none",borderRadius:10,padding:"14px 0",fontWeight:800,fontSize:14,cursor:spinning||(redeemPts||0)<500||(spinTokens||0)<1?"not-allowed":"pointer"}}>
            {spinning?"🎡 Spinning...":(redeemPts||0)<500?"Need 500 pts (have "+(redeemPts||0)+")":(spinTokens||0)<1?"No spin tokens":(spinsUsed||0)>=5?"Max spins reached":"🎡 Spin! (500 pts + 1 token)"}
          </button>
          <div style={{marginTop:10,fontSize:11,color:"rgba(255,255,255,.5)",lineHeight:1.6}}>Unlock: 2+ donations · 500+ redemption points · 1+ spin token<br/>Outcomes: 5%(30%) · 10%(20%) · 15%(15%) · 25%(10%) · 50%(10%) · Bonus pts(15%)</div>
        </div>
      </>}
      {/* CALCULATOR TAB */}
      {tab==="calc"&&<>
        <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:14,fontWeight:700,color:DK,marginBottom:12}}>📊 Tax Calculator</div>
          <div style={{fontSize:12,color:"#888",marginBottom:14}}>See what you would pay on a $1M profit sale across all 8 eras. Current relief: {(taxRed*100).toFixed(0)}%.</div>
          {TAX_ERAS.slice(0,7).map((e,i)=>{
            const grossCgt=1000000*e.cgt;const effC=grossCgt*(1-taxRed);const txn=1000*e.txn;const net=1000000-effC-txn;
            return <div key={i} style={{padding:"10px 0",borderBottom:"1px solid #f5f5f5",opacity:i===eraIdx?1:.7}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:e.color}}/><span style={{fontSize:12,fontWeight:i===eraIdx?800:600,color:i===eraIdx?e.color:DK}}>{e.name}{i===eraIdx?" ← NOW":""}</span></div>
                <span style={{fontSize:13,fontWeight:800,fontFamily:"monospace",color:G}}>{fm(net)} net</span>
              </div>
              <div style={{display:"flex",gap:8}}><span style={{fontSize:10,color:"#aaa"}}>CGT: {fm(effC)}</span><span style={{fontSize:10,color:"#aaa"}}>Txn: {fm(txn)}</span><span style={{fontSize:10,fontWeight:600,color:G}}>Keep: {((net/1000000)*100).toFixed(1)}%</span></div>
            </div>;
          })}
          <div style={{background:"#f8fbf8",borderRadius:9,padding:11,marginTop:10,fontSize:11,color:"#555",lineHeight:1.6}}>💡 <strong>Best era to sell:</strong> Capital Gains (CGT only 5%, keep 94.9%). <strong>Worst:</strong> High Tax (CGT 30%, keep 69.9%). In Capital Gains era vs High Tax era you keep {fm((1000000*.949)-(1000000*.699))} more on each $1M profit.</div>
        </div>
      </>}
      {/* HISTORY TAB */}
      {tab==="hist"&&<>
        <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:14,fontWeight:700,color:DK,marginBottom:10}}>Donation History</div>
          {phiHistory.length===0&&<div style={{fontSize:12,color:"#bbb",padding:"20px 0",textAlign:"center"}}>No donations yet. Go to Philanthropy tab to donate.</div>}
          {phiHistory.map((h,i)=><div key={i} style={{padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:12,fontWeight:700,color:DK}}>{h.cat}</span><span style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:"#880E4F"}}>{fm(h.amt)}</span></div>
            <div style={{fontSize:11,color:"#aaa"}}>Turn {h.t} · {h.pts.toLocaleString()} redemption points earned</div>
          </div>)}
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:14,fontWeight:700,color:DK,marginBottom:10}}>Tax Paid Summary</div>
          {[["Capital Gains Tax",taxPaid.cgt],["Dividend Withholding",taxPaid.div],["Bond Interest Tax",taxPaid.bond],["Transaction Tax",taxPaid.txn],["Wealth Tax",taxPaid.wealth],["Total Tax Paid",taxPaid.total]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}><span style={{fontSize:12,color:"#666"}}>{k}</span><span style={{fontSize:12,fontWeight:k.includes("Total")?800:600,color:k.includes("Total")?R:"#555",fontFamily:"monospace"}}>{fm(v)}</span></div>)}
        </div>
      </>}
    </div>
    {/* Toast */}
    {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:toast.g?G:R,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,zIndex:200,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>{toast.msg}</div>}
    {/* Donate modal */}
    {donM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setDonM(null)}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
        <div style={{width:36,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 14px"}}/>
        <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:4}}>{donM.ico} Donate to {donM.n}</div>
        <div style={{background:"#FFF8E1",borderRadius:9,padding:10,marginBottom:12,fontSize:12,color:"#E65100",lineHeight:1.6}}>{donM.desc}<br/>Points multiplier: {donM.mult.toFixed(1)}× · Cash: {fm(cash)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:12}}>
          {[1000000,5000000,10000000,50000000,100000000].filter(v=>v<=cash).map(v=><button key={v} onClick={()=>setDonAmt(v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(donAmt===v?"#880E4F":"#e0e0e0"),background:donAmt===v?"#FCE4EC":"#fafafa",color:donAmt===v?"#880E4F":"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{fm(v)}</button>)}
        </div>
        {donAmt&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>Donation</span><span style={{fontSize:12,fontWeight:700,color:"#880E4F",fontFamily:"monospace"}}>{fm(donAmt)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>Points earned</span><span style={{fontSize:12,fontWeight:700,color:PU,fontFamily:"monospace"}}>{Math.round(donAmt/1000*donM.mult).toLocaleString()}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:12,color:"#666"}}>Tax relief</span><span style={{fontSize:12,fontWeight:700,color:G}}>{(donM.rate*100).toFixed(0)}% for {donM.dur} turns</span></div>
        </div>}
        <button onClick={()=>doDonate(donM,donAmt||0)} disabled={!donAmt||donAmt<1000000} style={{width:"100%",background:donAmt&&donAmt>=1000000?"#880E4F":"#e0e0e0",color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:14,cursor:donAmt&&donAmt>=1000000?"pointer":"not-allowed"}}>❤️ Confirm{donAmt?" — "+fm(donAmt):""}</button>
      </div>
    </div>}
    <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
  </div>;
}
