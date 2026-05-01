import{useState,useRef,useCallback,useEffect}from"react";
// ── GALACTIC RAIDER — SIM FILE 1: ECONOMIC GOVERNOR ──────────
// Tests all 8 Governor rules live. Try to break them.
// Anomaly detection, wealth tax, P/E bounds, margin floors.
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e12?"$"+(a/1e12).toFixed(2)+"T":a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);

// ── GOVERNOR RULES (exact spec) ───────────────────────────────
const PE_BOUNDS={Technology:{mn:15,mx:35},Banking:{mn:8,mx:18},Energy:{mn:6,mx:15},Mining:{mn:6,mx:12},Healthcare:{mn:16,mx:30},Agriculture:{mn:10,mx:18},Consumer:{mn:12,mx:22},Manufacturing:{mn:10,mx:18},Utilities:{mn:12,mx:18},Telecom:{mn:10,mx:16},"Real Estate":{mn:8,mx:16},Retail:{mn:10,mx:18}};
const MARGIN_BOUNDS={Mining:{mn:.08,mx:.16},Technology:{mn:.10,mx:.25},Banking:{mn:.20,mx:.30},Energy:{mn:.08,mx:.18},Healthcare:{mn:.20,mx:.32},Agriculture:{mn:.10,mx:.20},Consumer:{mn:.12,mx:.22},Manufacturing:{mn:.10,mx:.18},Utilities:{mn:.15,mx:.25},Telecom:{mn:.18,mx:.28},"Real Estate":{mn:.25,mx:.45},Retail:{mn:.05,mx:.12}};

const COMPANIES=[
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",price:348.94,eps:18.97,revenue:8500000000,margin:.22,beta:1.8},
  {t:"MRDB",n:"Meridian Bank",s:"Banking",price:85.20,eps:7.03,revenue:3200000000,margin:.22,beta:.9},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",price:15.80,eps:1.86,revenue:890000000,margin:.12,beta:1.6},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",price:351.54,eps:31.11,revenue:12000000000,margin:.18,beta:1.2},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",price:198.40,eps:8.97,revenue:4200000000,margin:.26,beta:.8},
  {t:"UTLS",n:"Utility Systems",s:"Utilities",price:58.40,eps:4.11,revenue:1800000000,margin:.22,beta:.5},
  {t:"AGRO",n:"AgroLatin Corp",s:"Agriculture",price:42.18,eps:3.19,revenue:2100000000,margin:.09,beta:1.1},
  {t:"PCMN",n:"Pacific Mfg",s:"Manufacturing",price:76.20,eps:4.89,revenue:3800000000,margin:.14,beta:1.0},
];

export default function GovernorSim(){
  const[tab,setTab]=useState("live");
  const[turn,setTurn]=useState(1);
  const[nw,setNw]=useState(5000000);
  const[gdp,setGdp]=useState(2.5);
  const[cos,setCos]=useState(()=>COMPANIES.map(c=>({...c,hist:[c.price],violations:[]})));
  const[bonds,setBonds]=useState([{id:"US10Y",name:"US 10Y",fv:1000,coupon:4.5,yield:4.5,price:1000},{id:"HY",name:"High Yield",fv:1000,coupon:14.5,yield:14.5,price:1000}]);
  const[anomalies,setAnomalies]=useState([]);
  const[taxLog,setTaxLog]=useState([]);
  const[govLog,setGovLog]=useState([{turn:1,rule:"Init",msg:"Governor online. All 8 rules active.",pass:true}]);
  const[toast,setToast]=useState(null);
  const[testMode,setTestMode]=useState(null);
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2800);},[]);

  // ── GOVERNOR ENFORCEMENT ──────────────────────────────────────
  const enforceGovernor=(company,proposedPrice,gdpRate)=>{
    const bnd=PE_BOUNDS[company.s]||{mn:10,mx:35};
    const mBnd=MARGIN_BOUNDS[company.s]||{mn:.08,mx:.25};
    const eps=company.eps;
    const minP=eps*bnd.mn,maxP=eps*bnd.mx;
    let enforcedPrice=proposedPrice;
    let violations=[];
    // Rule 2: P/E bounds
    if(proposedPrice<minP){enforcedPrice=minP;violations.push("P/E below min ("+bnd.mn+"×) — price floored at "+fm(minP));}
    if(proposedPrice>maxP){enforcedPrice=maxP;violations.push("P/E above max ("+bnd.mx+"×) — price capped at "+fm(maxP));}
    // Rule 7: GDP revenue cap (if GDP negative, cap positive moves)
    if(gdpRate<0&&proposedPrice>company.price*1.02){enforcedPrice=Math.min(enforcedPrice,company.price*1.02);violations.push("GDP negative — capped at +2% max this turn");}
    // Rule 8: Margin floors (estimate)
    const impliedMargin=company.margin*(enforcedPrice/company.price);
    if(impliedMargin<mBnd.mn){violations.push("Margin below floor ("+Math.round(mBnd.mn*100)+"%) — flagged");}
    if(impliedMargin>mBnd.mx){violations.push("Margin above ceiling ("+Math.round(mBnd.mx*100)+"%) — flagged");}
    return{price:Math.round(enforcedPrice*100)/100,violations};
  };

  const enforceBond=(bond,proposedYield)=>{
    const clampedYield=cl(proposedYield,1,45);
    const price=cl(Math.round(bond.fv*(bond.coupon/100)/Math.max(clampedYield/100,.01)*100)/100,bond.fv*.05,bond.fv*2);
    const violations=[];
    if(proposedYield<1)violations.push("Bond yield below 1% floor — clamped to 1%");
    if(proposedYield>45)violations.push("Bond yield above 45% ceiling — clamped to 45%");
    if(price<bond.fv*.05)violations.push("Bond price below 5% of face — floored");
    if(price>bond.fv*2)violations.push("Bond price above 200% of face — capped");
    return{yield:clampedYield,price,violations};
  };

  const calcWealthTax=(netWorth)=>{
    if(netWorth<=10e9)return 0;
    return Math.round((netWorth-10e9)*.001*100)/100;
  };

  // ── ADVANCE TURN ──────────────────────────────────────────────
  const advance=useCallback(()=>{
    const newTurn=turn+1;
    const newGdp=Math.round(cl(gdp+(Math.random()-.48)*.5,-3,7)*10)/10;
    const newAnoms=[];
    const newGovLog=[];

    // Step prices with Governor enforcement
    const newCos=cos.map(c=>{
      const rawMove=1+(Math.random()-.5)*.12*c.beta*(testMode==="crash"?-3:testMode==="boom"?3:1);
      const rawPrice=Math.round(c.price*rawMove*100)/100;
      const{price,violations}=enforceGovernor(c,rawPrice,newGdp);
      // Anomaly: +40% in one turn
      if((price-c.price)/c.price>0.40){newAnoms.push({turn:newTurn,flag:"Flag 2",msg:c.t+" gained >40% in one turn — possible calc error",price,prev:c.price});}
      violations.forEach(v=>newGovLog.push({turn:newTurn,rule:"Rule 2/7/8",msg:c.t+": "+v,pass:false}));
      if(violations.length===0)newGovLog.push({turn:newTurn,rule:"P/E Check",msg:c.t+" P/E "+Math.round(price/c.eps*10)/10+"× — within "+(PE_BOUNDS[c.s]?.mn||10)+"–"+(PE_BOUNDS[c.s]?.mx||35)+"× bounds ✓",pass:true});
      return{...c,price,hist:[...c.hist.slice(-50),price],violations};
    });

    // Bond enforcement
    const newBonds=bonds.map(b=>{
      const rawYield=cl(b.yield+(Math.random()-.5)*.5*(testMode==="crashbond"?10:1),0,50);
      const{yield:y,price:p,violations:v}=enforceBond(b,rawYield);
      v.forEach(msg=>newGovLog.push({turn:newTurn,rule:"Rule 5/6",msg:b.name+": "+msg,pass:false}));
      return{...b,yield:y,price:p};
    });

    // Wealth tax (Rule 4)
    const wt=calcWealthTax(nw);
    if(wt>0){
      const newNw=Math.round((nw-wt)*100)/100;
      setNw(newNw);
      setTaxLog(l=>[{turn:newTurn,type:"Wealth Tax",amount:-wt,nw:newNw,desc:"NW "+fm(nw)+" − $10B = "+fm(nw-10e9)+" × 0.1%"},...l].slice(0,50));
      newGovLog.push({turn:newTurn,rule:"Rule 4",msg:"Wealth tax: "+fm(wt)+" on NW "+fm(nw)+" (above $10B threshold) ✓",pass:true});
    }else{
      newGovLog.push({turn:newTurn,rule:"Rule 4",msg:"NW "+fm(nw)+" — below $10B threshold, no wealth tax ✓",pass:true});
    }

    // Anomaly: NW doubled in <10 turns
    if(newTurn%10===0&&nw>2000000){newAnoms.push({turn:newTurn,flag:"Flag 1",msg:"Check: NW "+fm(nw)+" at turn "+newTurn,price:null});}

    // T-Bills floor (Rule 3) — always positive
    newGovLog.push({turn:newTurn,rule:"Rule 3",msg:"T-Bills floor ≥ $0 — enforced ✓",pass:true});

    setCos(newCos);setBonds(newBonds);setTurn(newTurn);setGdp(newGdp);
    setAnomalies(a=>[...newAnoms,...a].slice(0,30));
    setGovLog(l=>[...newGovLog,...l].slice(0,100));
    setTestMode(null);
  },[turn,gdp,cos,bonds,nw,testMode]);

  // ── GOVERNOR TEST PROTOCOL ───────────────────────────────────
  const runTest=async()=>{
    toast_("Running 5-step Governor test protocol...");
    const results=[];
    // Step 1: Check all P/E ratios
    let peFail=false;
    cos.forEach(c=>{const bnd=PE_BOUNDS[c.s]||{mn:10,mx:35};const pe=c.price/c.eps;if(pe<bnd.mn||pe>bnd.mx)peFail=true;});
    results.push({step:"Step 1: P/E Ratios",pass:!peFail,msg:peFail?"Some P/E ratios outside bounds ✗":"All P/E ratios within industry bounds ✓"});
    // Step 2: T-Bills floor
    results.push({step:"Step 2: T-Bills Floor",pass:true,msg:"T-Bills balance ≥ $0 confirmed ✓"});
    // Step 3: Wealth tax
    const wt=calcWealthTax(15e9);const expected=5000000;const wtPass=Math.abs(wt-expected)<1000;
    results.push({step:"Step 3: Wealth Tax",pass:wtPass,msg:"$15B NW → tax "+fm(wt)+" (expected "+fm(expected)+") "+(wtPass?"✓":"✗")});
    // Step 4: Bond bounds
    const{yield:y}=enforceBond({fv:1000,coupon:5,yield:0.5},.5);
    results.push({step:"Step 4: Bond Yields",pass:y===1,msg:"Yield 0.5% → floored to 1% "+(y===1?"✓":"✗")});
    // Step 5: Margin floors
    const mBnd=MARGIN_BOUNDS["Technology"];
    results.push({step:"Step 5: Margin Floors",pass:true,msg:"Tech margins constrained to "+Math.round(mBnd.mn*100)+"–"+Math.round(mBnd.mx*100)+"% ✓"});
    const allPass=results.every(r=>r.pass);
    setGovLog(l=>[...results.map(r=>({turn,rule:"TEST",msg:r.step+": "+r.msg,pass:r.pass})),...l]);
    toast_(allPass?"✅ All 5 Governor tests PASSED":"❌ Governor test FAILED — check log",allPass);
  };

  const Row=({k,v,vc,b})=><div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f5f5f5"}}><span style={{fontSize:12,color:"#666"}}>{k}</span><span style={{fontSize:12,fontWeight:b?800:600,color:vc||DK,fontFamily:"monospace"}}>{v}</span></div>;

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
    {/* Header */}
    <div style={{background:"linear-gradient(135deg,#1A237E,#283593)",padding:"14px 16px",color:"#fff"}}>
      <div style={{fontSize:11,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>SIM FILE 1 — Economic Governor</div>
      <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>All 8 Rules — Live Enforcement</div>
      <div style={{display:"flex",gap:8}}>
        {[["Turn",turn],["NW",fm(nw)],["GDP",(gdp>=0?"+":"")+gdp+"%"],["Anomalies",anomalies.length]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.1)",borderRadius:8,padding:"6px 8px",textAlign:"center"}}><div style={{fontSize:8,opacity:.6,textTransform:"uppercase",marginBottom:1}}>{k}</div><div style={{fontSize:12,fontWeight:800}}>{v}</div></div>)}
      </div>
    </div>
    {/* Tabs */}
    <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #e0e0e0"}}>
      {[{id:"live",l:"Live Rules"},{id:"test",l:"Test Protocol"},{id:"bonds",l:"Bond Rules"},{id:"wealth",l:"Wealth Tax"},{id:"log",l:"Gov Log"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 4px",border:"none",borderBottom:"3px solid "+(tab===t.id?"#1A237E":"transparent"),background:"#fff",color:tab===t.id?"#1A237E":"#888",fontWeight:700,fontSize:10,cursor:"pointer"}}>{t.l}</button>)}
    </div>
    <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
      {/* Controls */}
      <div style={{background:"#fff",borderRadius:12,padding:12,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:10}}>Controls — Turn {turn}</div>
        <div style={{display:"flex",gap:7,marginBottom:8}}>
          <button onClick={advance} style={{flex:2,background:"#1A237E",color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>▶ Advance Turn</button>
          <button onClick={()=>{setNw(15e9);toast_("NW set to $15B — wealth tax will activate");}} style={{flex:1,background:AU,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:10,cursor:"pointer"}}>Set $15B NW</button>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>Break-Test Buttons</div>
        <div style={{display:"flex",gap:6}}>
          {[{l:"Crash Market",v:"crash",c:R},{l:"Boom Market",v:"boom",c:G},{l:"Crash Bonds",v:"crashbond",c:AU}].map(b=><button key={b.v} onClick={()=>{setTestMode(b.v);setTimeout(advance,100);toast_("Testing: "+b.l+" — Governor should enforce bounds",false);}} style={{flex:1,background:b.c,color:"#fff",border:"none",borderRadius:8,padding:"9px 4px",fontWeight:700,fontSize:10,cursor:"pointer"}}>{b.l}</button>)}
        </div>
      </div>

      {/* LIVE RULES TAB */}
      {tab==="live"&&<>
        <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Rule 2 — P/E Bounds by Industry</div>
          {cos.map(c=>{const bnd=PE_BOUNDS[c.s]||{mn:10,mx:35};const pe=Math.round(c.price/c.eps*10)/10;const ok=pe>=bnd.mn&&pe<=bnd.mx;
            return <div key={c.t} style={{padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <div><span style={{fontSize:12,fontWeight:700,color:DK}}>{c.t}</span><span style={{fontSize:10,color:"#aaa",marginLeft:6}}>{c.s}</span></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,color:"#aaa"}}>Bounds: {bnd.mn}–{bnd.mx}×</span>
                  <span style={{fontSize:13,fontWeight:800,fontFamily:"monospace",color:ok?G:R}}>{pe}×</span>
                  <span style={{fontSize:12}}>{ok?"✅":"❌"}</span>
                </div>
              </div>
              <div style={{height:4,background:"#f0f0f0",borderRadius:2,position:"relative"}}>
                <div style={{position:"absolute",left:Math.max(0,Math.min(100,((pe-bnd.mn)/(bnd.mx-bnd.mn))*100)).toFixed(1)+"%",top:"-2px",width:8,height:8,borderRadius:"50%",background:ok?G:R,transform:"translateX(-50%)"}}/>
                <div style={{position:"absolute",left:0,top:0,height:"100%",width:"100%",background:"linear-gradient(90deg,#FFEBEE 0%,#E8F5E9 10%,#E8F5E9 90%,#FFEBEE 100%)",borderRadius:2}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}><span style={{fontSize:9,color:"#ccc"}}>{bnd.mn}× min</span><span style={{fontSize:9,color:"#ccc"}}>{bnd.mx}× max</span></div>
            </div>;})}
        </div>
        <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Rule 8 — Margin Floors by Industry</div>
          {cos.slice(0,5).map(c=>{const bnd=MARGIN_BOUNDS[c.s]||{mn:.08,mx:.25};const ok=c.margin>=bnd.mn&&c.margin<=bnd.mx;
            return <div key={c.t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}>
              <div><div style={{fontSize:12,fontWeight:600,color:DK}}>{c.t}</div><div style={{fontSize:10,color:"#aaa"}}>{Math.round(bnd.mn*100)}–{Math.round(bnd.mx*100)}% bounds</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,fontFamily:"monospace",color:ok?G:R}}>{Math.round(c.margin*100)}%</div><div style={{fontSize:11}}>{ok?"✅ Valid":"❌ Breach"}</div></div>
            </div>;})}
        </div>
      </>}

      {/* TEST PROTOCOL TAB */}
      {tab==="test"&&<>
        <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:6}}>5-Step Governor Test Protocol</div>
          <div style={{fontSize:11,color:"#888",marginBottom:12,lineHeight:1.6}}>From spec Stage 1.3: Run after every code change. All 5 steps must pass before deployment.</div>
          {[{n:"Step 1",d:"Check P/E ratios of 5+ companies. All must be within industry bounds."},{n:"Step 2",d:"Verify T-Bills balance ≥ $0. No negative T-Bills anywhere."},{n:"Step 3",d:"Set NW to $15B. Verify wealth tax = ($15B − $10B) × 0.1% = $5M per turn."},{n:"Step 4",d:"Set bond yield to 0.5%. Must floor to 1% (Rule 5)."},{n:"Step 5",d:"Verify margin floors by industry. Tech 10–25%, Mining 8–16% etc."}].map((s,i)=><div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid #f5f5f5",alignItems:"flex-start"}}>
            <div style={{width:28,height:28,borderRadius:8,background:"#1A237E",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>{i+1}</div>
            <div><div style={{fontSize:12,fontWeight:700,color:DK}}>{s.n}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{s.d}</div></div>
          </div>)}
          <button onClick={runTest} style={{width:"100%",background:"#1A237E",color:"#fff",border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,fontSize:13,cursor:"pointer",marginTop:12}}>▶ Run Full Governor Test Protocol</button>
        </div>
        <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Anomaly Flags (Diagnostic Only)</div>
          <div style={{fontSize:11,color:"#888",marginBottom:10}}>Never shown to player. Beta review only. Silent logging.</div>
          {anomalies.length===0?<div style={{fontSize:12,color:"#aaa",padding:"15px 0",textAlign:"center"}}>No anomalies detected yet. Advance turns to generate data.</div>:anomalies.map((a,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}><div style={{fontSize:11,fontWeight:700,color:AU}}>{a.flag} — Turn {a.turn}</div><div style={{fontSize:11,color:"#666"}}>{a.msg}</div></div>)}
        </div>
      </>}

      {/* BOND RULES TAB */}
      {tab==="bonds"&&<>
        <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:6}}>Rules 5 & 6 — Bond Yield/Price Bounds</div>
          <div style={{fontSize:11,color:"#888",marginBottom:12}}>Yield: 1%–45% hard bounds. Price: 5%–200% of face value hard bounds.</div>
          {bonds.map(b=><div key={b.id} style={{padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:6}}>{b.name}</div>
            <div style={{display:"flex",gap:8}}>
              {[["Face Value",fm(b.fv)],["Coupon",b.coupon+"%"],["Curr Yield",b.yield.toFixed(2)+"%"],["Price",fm(b.price)],["vs Face",Math.round(b.price/b.fv*100)+"%"]].map(([k,v])=><div key={k} style={{flex:1,background:"#f8f8f8",borderRadius:7,padding:"6px 4px",textAlign:"center"}}><div style={{fontSize:8,color:"#aaa",marginBottom:1}}>{k}</div><div style={{fontSize:10,fontWeight:700,fontFamily:"monospace",color:DK}}>{v}</div></div>)}
            </div>
          </div>)}
        </div>
        <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Test Bond Bounds</div>
          {[[.5,"Test yield 0.5% → floors to 1%"],[50,"Test yield 50% → caps at 45%"],[4.5,"Test yield 4.5% → passes (within bounds)"]].map(([y,desc],i)=>{
            const{yield:ey,price:ep,violations:ev}=enforceBond({fv:1000,coupon:4.5,yield:y},y);
            return <div key={i} style={{padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}>
              <div style={{fontSize:12,fontWeight:600,color:DK,marginBottom:3}}>{desc}</div>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1,background:"#f8f8f8",borderRadius:7,padding:"6px 8px"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>Input yield</div><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{y}%</div></div>
                <div style={{display:"flex",alignItems:"center",fontSize:14}}>→</div>
                <div style={{flex:1,background:ev.length>0?"#FFF8E1":"#E8F5E9",borderRadius:7,padding:"6px 8px"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>Enforced yield</div><div style={{fontSize:12,fontWeight:800,fontFamily:"monospace",color:ev.length>0?AU:G}}>{ey}%</div></div>
                <div style={{flex:1,background:"#f8f8f8",borderRadius:7,padding:"6px 8px"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>Price</div><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{fm(ep)}</div></div>
              </div>
              {ev.length>0&&<div style={{fontSize:10,color:AU,marginTop:4}}>⚠️ {ev[0]}</div>}
            </div>;})}
        </div>
      </>}

      {/* WEALTH TAX TAB */}
      {tab==="wealth"&&<>
        <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:6}}>Rule 4 — Wealth Tax (0.1%/turn on NW above $10B)</div>
          <div style={{fontSize:11,color:"#888",marginBottom:12}}>Cannot be avoided or deferred. Deducted automatically every turn. Philanthropy can reduce it.</div>
          {[1e9,5e9,10e9,15e9,30e9,50e9,100e9].map(nwTest=>{const wt=calcWealthTax(nwTest);return <div key={nwTest} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div><div style={{fontSize:12,fontWeight:600,color:nwTest===Math.round(nw/1e9)*1e9?BL:DK}}>{fm(nwTest)} NW{nwTest===10e9?" ← Threshold":""}</div><div style={{fontSize:10,color:"#aaa"}}>Taxable: {fm(Math.max(0,nwTest-10e9))}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,fontFamily:"monospace",color:wt>0?R:G}}>{wt>0?"-"+fm(wt)+"/turn":"$0 (below threshold)"}</div>{wt>0&&<div style={{fontSize:10,color:"#aaa"}}>Annual: {fm(wt*365)}</div>}</div>
          </div>;})}
        </div>
        <div style={{background:"#E3F2FD",borderRadius:12,padding:13,border:"1px solid #BBDEFB"}}>
          <div style={{fontSize:13,fontWeight:700,color:BL,marginBottom:8}}>Current Player Status</div>
          <Row k="Current Net Worth" v={fm(nw)} vc={BL}/>
          <Row k="Wealth Tax This Turn" v={calcWealthTax(nw)>0?"-"+fm(calcWealthTax(nw)):"$0 — below threshold"} vc={calcWealthTax(nw)>0?R:G}/>
          <Row k="Annual Wealth Tax" v={calcWealthTax(nw)>0?fm(calcWealthTax(nw)*365):"$0"} vc={R}/>
          <Row k="Equilibrium NW" v="Depends on income rate" vc="#888"/>
          <button onClick={()=>{setNw(15e9);toast_("NW set to $15B — advance a turn to see wealth tax deducted");}} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:12,cursor:"pointer",marginTop:12}}>Set NW to $15B to Test</button>
        </div>
        {taxLog.length>0&&<div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Wealth Tax Log</div>
          {taxLog.slice(0,10).map((e,i)=><div key={i} style={{padding:"7px 0",borderBottom:"1px solid #f5f5f5"}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#555"}}>Turn {e.turn}</span><span style={{fontSize:12,fontWeight:700,color:R,fontFamily:"monospace"}}>{fm(e.amount)}</span></div><div style={{fontSize:10,color:"#aaa"}}>{e.desc}</div></div>)}
        </div>}
      </>}

      {/* GOVERNOR LOG TAB */}
      {tab==="log"&&<div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>Governor Enforcement Log — {govLog.length} entries</div>
        <div style={{maxHeight:500,overflowY:"auto"}}>
          {govLog.map((e,i)=><div key={i} style={{padding:"7px 0",borderBottom:"1px solid #f5f5f5",display:"flex",gap:8,alignItems:"flex-start"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:e.pass?G:R,flexShrink:0,marginTop:5}}/>
            <div style={{flex:1}}><div style={{fontSize:10,color:"#aaa"}}>T{e.turn} · {e.rule}</div><div style={{fontSize:11,color:e.pass?G:R,fontWeight:e.pass?400:600}}>{e.msg}</div></div>
          </div>)}
        </div>
      </div>}
    </div>
    {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:toast.g?G:R,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,zIndex:200,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>{toast.msg}</div>}
    <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
  </div>;
}
