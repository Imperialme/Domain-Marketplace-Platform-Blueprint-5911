import{useState,useRef,useEffect,useCallback}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const pc=n=>(n>=0?"+":"")+n.toFixed(2)+"%";
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);

// ── PLANETARY ECONOMIES ───────────────────────────────────────
const PLANETS={
  Earth:{id:"earth",name:"Earth",ico:"🌍",currency:"USD",rate:1.0,gdp:2.5,desc:"Base economy. All other planets reference Earth.",color:"#2E7D32",bg:"#E8F5E9",companies:[
    {t:"SLKT",n:"Silk Road Tech",s:"Technology",ip:348.94,price:348.94,pe:18.4,div:.8,b:1.8},
    {t:"TNPT",n:"Titan Petroleum",s:"Energy",ip:351.54,price:351.54,pe:11.3,div:1.8,b:1.2},
    {t:"MDCR",n:"MediCore Group",s:"Healthcare",ip:198.40,price:198.40,pe:22.1,div:1.2,b:.8},
    {t:"FRMN",n:"Frontier Mining",s:"Mining",ip:15.80,price:15.80,pe:8.5,div:.5,b:1.6},
  ]},
  Mars:{id:"mars",name:"Mars",ico:"🔴",currency:"MCR",rate:.85,gdp:3.8,desc:"Mining economy. Lithium, iron ore, rare earths. Volatile. Contagion from Earth in 2 turns.",color:"#C62828",bg:"#FFEBEE",contagionDelay:2,contagionFactor:.5,companies:[
    {t:"MXMN",n:"Mars Extraction Co",s:"Mining",ip:42.50,price:42.50,pe:9.2,div:.3,b:2.1,desc:"Largest lithium and rare earth extractor on Mars. Supplies 30% of Earth EV battery materials."},
    {t:"RDST",n:"RedDust Energy",s:"Energy",ip:18.20,price:18.20,pe:7.8,div:.8,b:1.8,desc:"Solar and nuclear energy for Mars colony. Regulated utility. Stable."},
    {t:"MROBOT",n:"Mars Robotics Corp",s:"Technology",ip:95.30,price:95.30,pe:22.4,div:.1,b:2.5,desc:"Autonomous mining robots. High margin. Weather risk from dust storms."},
    {t:"MFOOD",n:"HydroFarm Mars",s:"Agriculture",ip:28.60,price:28.60,pe:14.1,div:1.2,b:1.1,desc:"Indoor hydroponic food production for 50,000 colonists. Essential service."},
  ]},
  Venus:{id:"venus",name:"Venus",ico:"🟡",currency:"VCR",rate:.75,gdp:2.1,desc:"Energy export economy. Extreme heat. Fully automated. High margins. Contagion from Earth in 2 turns.",color:"#F57F17",bg:"#FFF8E1",contagionDelay:2,contagionFactor:.67,companies:[
    {t:"VSOL",n:"Venus Solar Array",s:"Energy",ip:156.40,price:156.40,pe:16.8,div:2.4,b:.9,desc:"Largest solar energy harvester in the solar system. 99.8% uptime. Exports to Earth."},
    {t:"VATM",n:"AtmoRefine Venus",s:"Manufacturing",ip:67.20,price:67.20,pe:13.5,div:1.0,b:1.3,desc:"Atmospheric chemical processing. Sulfuric acid, carbon compounds for industrial use."},
    {t:"VROB",n:"Venus Autoworks",s:"Manufacturing",ip:38.90,price:38.90,pe:11.2,div:.6,b:1.6,desc:"Fully automated manufacturing. No human workers. 45% net margins."},
  ]},
  Jupiter:{id:"jupiter",name:"Jupiter",ico:"🟠",currency:"JCR",rate:.90,gdp:4.2,desc:"Robotic economy. Highest margins in solar system. Storm events every 50-100 turns cause massive disruption. Buy post-storm. Contagion from Earth in 3 turns.",color:"#E65100",bg:"#FFF3E0",contagionDelay:3,contagionFactor:.83,stormRisk:true,companies:[
    {t:"JATM",n:"Jupiter AutoMine",s:"Mining",ip:212.30,price:212.30,pe:18.4,div:.2,b:2.8,desc:"Deep atmosphere mining robots. Rare materials including Ryzolith. 52% net margin. Storm risk."},
    {t:"JRES",n:"JupiterResearch AI",s:"Technology",ip:445.60,price:445.60,pe:28.2,div:.1,b:3.2,desc:"AI research complex. Fully automated. Develops tech licensed to all planets."},
    {t:"JFUS",n:"Fusion Power Jupiter",s:"Energy",ip:88.40,price:88.40,pe:14.6,div:.8,b:1.9,desc:"Experimental fusion reactors. High risk, high reward. Could power the entire solar system."},
  ]},
};
const ALL_PLANETS=Object.values(PLANETS);

export default function PlanetsSim(){
  const[tab,setTab]=useState("overview");
  const[selPlanet,setSelPlanet]=useState("Earth");
  const[turn,setTurn]=useState(1);
  const[auto,setAuto]=useState(false);
  const[speed,setSpeed]=useState(2);
  const speedRef=useRef(2);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  const aRef=useRef(null);
  const S=useRef(null);
  if(!S.current){
    S.current={
      turn:1,
      wallets:{Earth:500000,Mars:0,Venus:0,Jupiter:0},
      planets:Object.fromEntries(ALL_PLANETS.map(p=>([p.id,{
        gdp:p.gdp,inf:2.5,
        cos:p.companies.map(c=>({...c,pp:c.price,ch:0,hist:[c.price,c.price]})),
        stormTurn:0,stormActive:false,
        contagionQueue:[],
      }]))),
      sh:{},avgSh:{},
      newsLog:[],
      transferLog:[],
    };
  }
  const[D,setD]=useState(()=>({...S.current}));
  const[toast,setToast]=useState(null);
  const[trM,setTrM]=useState(null);
  const[trAmt,setTrAmt]=useState(null);
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2500);},[]);
  const refresh=useCallback(()=>setD({...S.current}),[]);

  const advance=useCallback(()=>{
    const s=S.current;s.turn++;
    const nn=[];
    // Step each planet
    ALL_PLANETS.forEach(pd=>{
      const p=s.planets[pd.id];
      // Macro drift
      p.gdp=Math.round(cl(p.gdp+(Math.random()-.48)*.5,-3,7)*10)/10;
      p.inf=Math.round(cl(p.inf+(Math.random()-.5)*.3,0,12)*10)/10;
      // Jupiter storm check
      if(pd.stormRisk&&!p.stormActive&&Math.random()<.01){
        p.stormActive=true;p.stormTurn=s.turn;
        nn.push({t:s.turn,ico:"⚡",planet:"Jupiter",msg:"JUPITER STORM EVENT! Production -30% for 20 turns. Mutual Space Council activating. Buy after storm.",bad:true});
        toast_("⚡ Jupiter storm! Economy hit -30%. Mutual Space Council funding incoming.",false);
      }
      if(p.stormActive&&s.turn-p.stormTurn>20){p.stormActive=false;nn.push({t:s.turn,ico:"✅",planet:"Jupiter",msg:"Jupiter storm cleared. Economy rebuilding. MSC funding helped recovery.",bad:false});}
      // Contagion from Earth
      if(pd.id!=="earth"){
        const earthGdp=s.planets["earth"].gdp;
        const laggedEffect=earthGdp*pd.contagionFactor*.5;
        p.contagionQueue=[...(p.contagionQueue||[]),{effect:laggedEffect,delay:pd.contagionDelay}];
        const ready=p.contagionQueue.filter(q=>q.delay<=0);
        const pending=p.contagionQueue.filter(q=>q.delay>0).map(q=>({...q,delay:q.delay-1}));
        p.contagionQueue=pending;
        const contagionBoost=ready.reduce((x,q)=>x+q.effect,0);
        if(Math.abs(contagionBoost)>.5)nn.push({t:s.turn,ico:"🌐",planet:pd.name,msg:pd.name+" GDP "+(contagionBoost>=0?"boosted by":"hit by")+" Earth contagion: "+(contagionBoost>=0?"+":"")+contagionBoost.toFixed(2)+"%",bad:contagionBoost<0});
      }
      // Price each company
      p.cos=p.cos.map(c=>{
        const stormMult=p.stormActive?-3:1;
        const move=1+(Math.random()-.5)*.08*c.b*(stormMult*.3+.7);
        const macroEffect=cl(1+(p.gdp/100*.2*c.b),.97,1.03);
        let np=Math.round(c.price*move*macroEffect*100)/100;
        // P/E BOUNDS — same Governor rules as Earth, prevent runaway prices
        const eps=c.price/(c.pe||15);
        const peMin=(c.pe||15)*.6, peMax=(c.pe||15)*1.6;
        if(np/eps<peMin)np=eps*peMin;
        if(np/eps>peMax)np=eps*peMax;
        // Hard price ceiling: max 20x starting price
        np=cl(np,c.ip*.05,c.ip*20);
        np=Math.max(.10,Math.round(np*100)/100);
        // Post-storm recovery bounce
        if(pd.stormRisk&&p.stormTurn>0&&!p.stormActive&&s.turn-p.stormTurn<10)np=Math.round(np*1.02*100)/100;
        return{...c,pp:c.price,price:np,ch:(np-c.price)/c.price,hist:[...c.hist.slice(-50),np]};
      });
    });
    // Cross-dimension: if Earth GDP negative, all planets affected
    if(s.planets.earth.gdp<0){
      nn.push({t:s.turn,ico:"📉",planet:"Earth",msg:"Earth recession — contagion spreading to all planets in 2-3 turns.",bad:true});
    }
    s.newsLog=[...nn,...s.newsLog].slice(0,50);
    refresh();
  },[refresh]);

  useEffect(()=>{
    if(!auto){clearInterval(aRef.current);return;}
    clearInterval(aRef.current);
    aRef.current=setInterval(()=>advance(),speedRef.current*1000);
    return()=>clearInterval(aRef.current);
  },[auto,speed,advance]);

  const doTrade=(planetId,co,mode,qty)=>{
    const s=S.current,isBuy=mode==="buy",q=Math.floor(qty);if(q<1)return;
    const pd=ALL_PLANETS.find(p=>p.id===planetId);
    const key=planetId+"_"+co.t;
    const walletBal=s.wallets[pd.name]||0;
    const cost=Math.round(q*co.price*100)/100;
    if(isBuy){
      if(cost>walletBal){toast_("Need "+fm(cost)+" in "+pd.name+" wallet (have "+fm(walletBal)+")",false);return;}
      s.sh[key]=(s.sh[key]||0)+q;
      const prev=s.sh[key]-q;
      s.avgSh[key]=Math.round(((s.avgSh[key]||co.price)*prev+cost)/s.sh[key]*100)/100;
      s.wallets[pd.name]=Math.round((walletBal-cost)*100)/100;
      toast_("Bought "+q+" "+co.t+" @ "+fm(co.price)+" in "+pd.name+" wallet");
    }else{
      const held=s.sh[key]||0;if(q>held){toast_("Only "+held+" held",false);return;}
      const proc=Math.round(q*co.price*100)/100;
      const profit=Math.max(0,(co.price-(s.avgSh[key]||co.price))*q);
      const cgt=Math.round(profit*.20*100)/100;
      s.wallets[pd.name]=Math.round((walletBal+proc-cgt)*100)/100;
      s.sh[key]=held-q;if(!s.sh[key])delete s.sh[key];
      toast_("Sold "+q+" "+co.t+" · CGT: "+fm(cgt));
    }
    setTrM(null);setTrAmt(null);refresh();
  };

  const doTransfer=(fromPlanet,toPlanet,amt)=>{
    const s=S.current;
    const fp=ALL_PLANETS.find(p=>p.name===fromPlanet);
    const tp=ALL_PLANETS.find(p=>p.name===toPlanet);
    if(!fp||!tp){return;}
    const fromBal=s.wallets[fromPlanet]||0;
    if(amt>fromBal){toast_("Insufficient "+fromPlanet+" wallet",false);return;}
    const inUSD=Math.round(amt*fp.rate*100)/100;
    const fee=Math.round(inUSD*.005*100)/100;// 0.5% transfer fee
    const netUSD=inUSD-fee;
    const toAmt=Math.round(netUSD/tp.rate*100)/100;
    s.wallets[fromPlanet]=Math.round((fromBal-amt)*100)/100;
    s.wallets[toPlanet]=Math.round(((s.wallets[toPlanet]||0)+toAmt)*100)/100;
    s.transferLog=[{t:s.turn,from:fromPlanet,to:toPlanet,sentAmt:amt,sentCur:fp.currency,recvAmt:toAmt,recvCur:tp.currency,fee},...(s.transferLog||[])].slice(0,20);
    toast_(fm(amt)+" "+fp.currency+" → "+fm(toAmt)+" "+tp.currency+" (0.5% fee: "+fm(fee)+" USD)");
    refresh();
  };

  const d=D;
  const totalNW=Object.entries(d.wallets||{}).reduce((x,[planet,bal])=>{const pd=ALL_PLANETS.find(p=>p.name===planet);return x+(pd?bal*pd.rate:bal);},0)+
    Object.entries(d.sh||{}).reduce((x,[key,n])=>{const[pid,t]=key.split("_");const pd=ALL_PLANETS.find(p=>p.id===pid);const cos=pd?d.planets[pid]?.cos?.find(c=>c.t===t):null;return x+(cos&&pd?cos.price*n*pd.rate:0);},0);

  const MC=({hist,w=60,h=22})=>{if(!hist||hist.length<2)return null;const mn=Math.min(...hist)*.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={hist[hist.length-1]>=(hist[0]||0)?G:R} strokeWidth="1.8" strokeLinejoin="round"/></svg>;};

  const selPD=PLANETS[selPlanet];
  const selPState=d.planets?.[selPD?.id];

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
    {/* Header */}
    <div style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",padding:"14px 16px",color:"#fff"}}>
      <div style={{fontSize:11,opacity:.5,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>SIM FILE 5 — Cross-Dimension Economics</div>
      <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>{fm(totalNW)} <span style={{fontSize:12,opacity:.6}}>total NW</span></div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {ALL_PLANETS.map(pd=><div key={pd.id} style={{flex:1,background:"rgba(255,255,255,.08)",borderRadius:8,padding:"6px 4px",textAlign:"center",border:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{fontSize:14,marginBottom:1}}>{pd.ico}</div>
          <div style={{fontSize:9,opacity:.6,marginBottom:1}}>{pd.currency}</div>
          <div style={{fontSize:10,fontWeight:800,color:"#fff"}}>{fm((d.wallets?.[pd.name]||0))}</div>
          <div style={{fontSize:8,opacity:.5}}>{d.planets?.[pd.id]?.stormActive?"⚡ STORM":pd.id==="earth"?"Base":"GDP "+(d.planets?.[pd.id]?.gdp||0).toFixed(1)+"%"}</div>
        </div>)}
      </div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={advance} disabled={auto} style={{flex:2,background:auto?"rgba(255,255,255,.08)":"rgba(255,255,255,.2)",color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:800,fontSize:12,cursor:auto?"not-allowed":"pointer"}}>▶ Turn {d.turn}</button>
        <button onClick={()=>setAuto(a=>!a)} style={{flex:1,background:auto?"#B71C1C":"rgba(255,255,255,.12)",color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>{auto?"⏹":"Auto"}</button>
        {[1,2,5].map(s2=><button key={s2} onClick={()=>setSpeed(s2)} style={{padding:"5px 8px",borderRadius:7,border:"1.5px solid "+(speed===s2?"#fff":"rgba(255,255,255,.25)"),background:speed===s2?"rgba(255,255,255,.2)":"transparent",color:"#fff",fontWeight:700,fontSize:9,cursor:"pointer"}}>{s2}s</button>)}
      </div>
    </div>
    {/* Tabs */}
    <div style={{display:"flex",background:"#fff",borderBottom:"1px solid #e0e0e0"}}>
      {[{id:"overview",l:"Overview"},{id:"planet",l:"Planet"},{id:"transfer",l:"Transfer"},{id:"contagion",l:"Contagion"},{id:"news",l:"News"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 4px",border:"none",borderBottom:"3px solid "+(tab===t.id?"#0D1E35":"transparent"),background:"#fff",color:tab===t.id?"#0D1E35":"#888",fontWeight:700,fontSize:10,cursor:"pointer"}}>{t.l}</button>)}
    </div>
    <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>

      {/* OVERVIEW */}
      {tab==="overview"&&<>
        {ALL_PLANETS.map(pd=>{const ps=d.planets?.[pd.id];const walletBal=d.wallets?.[pd.name]||0;const holdings=Object.entries(d.sh||{}).filter(([k])=>k.startsWith(pd.id+"_")).reduce((x,[k,n])=>{const t=k.split("_")[1];const c=ps?.cos?.find(x2=>x2.t===t);return x+(c?c.price*n*pd.rate:0);},0);
          return <div key={pd.id} style={{background:"#fff",borderRadius:14,border:"2px solid "+(ps?.stormActive?"#F57F17":pd.color+"33")}} onClick={()=>{setSelPlanet(pd.name);setTab("planet");}}>
            <div style={{background:pd.bg,borderRadius:"12px 12px 0 0",padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:24}}>{pd.ico}</span><div><div style={{fontSize:15,fontWeight:800,color:pd.color}}>{pd.name}</div><div style={{fontSize:11,color:"#888"}}>{pd.currency} · GDP {ps?.gdp?.toFixed(1)||pd.gdp}%{ps?.stormActive?" · ⚡ STORM ACTIVE":""}</div></div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,color:pd.color,fontFamily:"monospace"}}>{fm(walletBal)}</div><div style={{fontSize:10,color:"#aaa"}}>{pd.currency} wallet</div></div>
            </div>
            <div style={{padding:"10px 14px"}}>
              <div style={{fontSize:11,color:"#666",marginBottom:8}}>{pd.desc}</div>
              <div style={{display:"flex",gap:6,marginBottom:8}}>
                <div style={{flex:1,background:"#f8f8f8",borderRadius:7,padding:"6px 8px",textAlign:"center"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>Wallet (USD eq.)</div><div style={{fontSize:11,fontWeight:700,fontFamily:"monospace"}}>{fm(walletBal*pd.rate)}</div></div>
                <div style={{flex:1,background:"#f8f8f8",borderRadius:7,padding:"6px 8px",textAlign:"center"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>Holdings (USD)</div><div style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:holdings>0?G:"#aaa"}}>{fm(holdings)}</div></div>
                <div style={{flex:1,background:"#f8f8f8",borderRadius:7,padding:"6px 8px",textAlign:"center"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>Companies</div><div style={{fontSize:11,fontWeight:700}}>{pd.companies.length}</div></div>
              </div>
              <div style={{display:"flex",gap:4}}>
                {ps?.cos?.map(c=><div key={c.t} style={{flex:1,textAlign:"center"}}><div style={{fontSize:8,color:"#aaa",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.t}</div><div style={{fontSize:10,fontWeight:700,fontFamily:"monospace",color:(c.ch||0)>=0?G:R}}>{fm(c.price)}</div></div>)}
              </div>
            </div>
          </div>;
        })}
      </>}

      {/* PLANET DETAIL */}
      {tab==="planet"&&<>
        {/* Planet selector */}
        <div style={{display:"flex",gap:6}}>
          {ALL_PLANETS.map(pd=><button key={pd.id} onClick={()=>setSelPlanet(pd.name)} style={{flex:1,padding:"10px 4px",borderRadius:10,border:"2px solid "+(selPlanet===pd.name?pd.color:"#e0e0e0"),background:selPlanet===pd.name?pd.bg:"#fafafa",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:18}}>{pd.ico}</span><span style={{fontSize:9,fontWeight:700,color:selPlanet===pd.name?pd.color:"#888"}}>{pd.name}</span></button>)}
        </div>
        {selPState?.stormActive&&<div style={{background:"linear-gradient(135deg,#E65100,#F57F17)",borderRadius:11,padding:"11px 14px",color:"#fff"}}><div style={{fontSize:14,fontWeight:800,marginBottom:4}}>⚡ STORM EVENT ACTIVE — Turn {d.turn-selPState.stormTurn} of 20</div><div style={{fontSize:11,opacity:.9}}>Production -30%. Mutual Space Council funding active. All planets contributing raw materials. Buy now for post-storm recovery.</div></div>}
        <div style={{background:selPD?.bg,borderRadius:13,padding:13,border:"1.5px solid "+selPD?.color+"33"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div><div style={{fontSize:16,fontWeight:800,color:selPD?.color}}>{selPD?.ico} {selPlanet}</div><div style={{fontSize:11,color:"#888"}}>{selPD?.currency} · Rate: 1 {selPD?.currency} = ${selPD?.rate} USD</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,color:selPD?.color,fontFamily:"monospace"}}>{fm(d.wallets?.[selPlanet]||0)}</div><div style={{fontSize:10,color:"#aaa"}}>{selPD?.currency} in wallet</div></div>
          </div>
          <div style={{fontSize:11,color:"#555",marginBottom:10,lineHeight:1.6}}>{selPD?.desc}</div>
          {selPD?.id!=="earth"&&<div style={{fontSize:11,color:"#888",background:"rgba(0,0,0,.04)",borderRadius:7,padding:"6px 8px"}}><strong>Contagion:</strong> Earth GDP changes hit {selPlanet} at {(selPD?.contagionFactor||.5)*100}% strength after {selPD?.contagionDelay} turns.</div>}
        </div>
        {/* Companies on this planet */}
        <div style={{background:"#fff",borderRadius:13,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          {selPState?.cos?.map((c,i)=>{const held=d.sh?.[selPD.id+"_"+c.t]||0;const maxBuy=Math.floor((d.wallets?.[selPlanet]||0)/c.price);
            return <div key={c.t} style={{padding:"12px 14px",borderBottom:i<selPState.cos.length-1?"1px solid #f5f5f5":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:DK}}>{c.n}</div><div style={{fontSize:10,color:"#aaa"}}>{c.t} · {c.s} · Div {c.div}%{c.desc?" · "+c.desc.substring(0,50)+"...":""}</div></div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}><div style={{fontSize:14,fontWeight:800,fontFamily:"monospace",color:(c.ch||0)>=0?G:R}}>{fm(c.price)}</div><div style={{fontSize:10,fontFamily:"monospace",color:(c.ch||0)>=0?G:R,marginBottom:2}}>{(c.ch||0)>=0?"▲":"▼"} {Math.abs((c.ch||0)*100).toFixed(2)}%</div></div>
              </div>
              <div style={{height:22,marginBottom:7}}><MC hist={c.hist} w={220} h={22}/></div>
              {held>0&&<div style={{fontSize:10,color:"#555",marginBottom:7,fontFamily:"monospace"}}>Held: {held} · {fm(c.price*held)} · {selPD.currency}</div>}
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{setTrM({planet:selPD.id,co:c,mode:"buy"});setTrAmt(null);}} disabled={maxBuy<1} style={{flex:1,background:maxBuy<1?"#e0e0e0":selPD?.color,color:"#fff",border:"none",borderRadius:7,padding:"9px 0",fontWeight:700,fontSize:11,cursor:maxBuy<1?"not-allowed":"pointer"}}>Buy</button>
                {held>0&&<button onClick={()=>doTrade(selPD.id,c,"sell",held)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"9px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell All</button>}
              </div>
            </div>;})}
        </div>
      </>}

      {/* TRANSFER */}
      {tab==="transfer"&&<>
        <div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:6}}>Cross-Dimension Transfer</div>
          <div style={{fontSize:11,color:"#888",marginBottom:12,lineHeight:1.6}}>Transfer money between planet wallets. 0.5% fee applies. Destination tax era rate applies on conversion (spec: Gap 7).</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {ALL_PLANETS.map(pd=><div key={pd.id} style={{flex:1,background:pd.bg,borderRadius:9,padding:"8px 6px",border:"1px solid "+pd.color+"33",textAlign:"center"}}><div style={{fontSize:14}}>{pd.ico}</div><div style={{fontSize:9,color:pd.color,fontWeight:700,marginTop:1}}>{pd.currency}</div><div style={{fontSize:10,fontWeight:800,fontFamily:"monospace",color:pd.color}}>{fm(d.wallets?.[pd.name]||0)}</div></div>)}
          </div>
          {(()=>{
  const ROUTES=[["Earth","Mars"],["Earth","Venus"],["Earth","Jupiter"],["Mars","Earth"],["Venus","Earth"],["Jupiter","Earth"]];
  return ROUTES.filter(([from])=>(d.wallets?.[from]||0)>0).map(([from,to])=>{
    const fromBal=d.wallets?.[from]||0;
    const fpd=ALL_PLANETS.find(p=>p.name===from);
    const tpd=ALL_PLANETS.find(p=>p.name===to);
    if(!fpd||!tpd||fromBal<=0)return null;
    const rate=fpd.rate/tpd.rate;
    const fee=0.005;
    return <div key={from+to} style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:13,fontWeight:700,color:DK}}>{fpd.ico} {from} → {tpd.ico} {to}</div>
        <div style={{fontSize:11,color:"#aaa"}}>0.5% fee · {fpd.currency}→{tpd.currency}</div>
      </div>
      <div style={{fontSize:11,color:"#888",marginBottom:8}}>Available: {fm(fromBal)} {fpd.currency}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
        {[10,25,50,100].map(pct=>{
          const sendAmt=Math.floor(fromBal*(pct/100)*100)/100;
          const feeAmt=Math.round(sendAmt*fee*100)/100;
          const recvAmt=Math.round((sendAmt-feeAmt)*rate*100)/100;
          return <button key={pct} onClick={()=>{
            const s=S.current;
            if(sendAmt<=0||sendAmt>(s.wallets?.[from]||0)){toast_("Insufficient balance",false);return;}
            s.wallets[from]=Math.round(((s.wallets[from]||0)-sendAmt)*100)/100;
            s.wallets[to]=Math.round(((s.wallets[to]||0)+recvAmt)*100)/100;
            s.transferLog=[{t:s.turn,from,to,sentAmt:sendAmt,sentCur:fpd.currency,recvAmt,recvCur:tpd.currency,fee:feeAmt},...(s.transferLog||[])].slice(0,20);
            s.newsLog.unshift({t:s.turn,ico:"💱",planet:from,msg:"Transferred "+fm(sendAmt)+" "+fpd.currency+" → "+fm(recvAmt)+" "+tpd.currency+" (fee: "+fm(feeAmt)+")",bad:false});
            toast_("Transferred "+pct+"% = "+fm(sendAmt)+" → "+fm(recvAmt)+" "+tpd.currency);refresh();
          }} style={{padding:"9px 4px",borderRadius:9,border:"1.5px solid #e0e0e0",background:"#f8fbf8",color:DK,fontWeight:700,fontSize:11,cursor:sendAmt>0?"pointer":"not-allowed",textAlign:"center"}}>
            <div>{pct}%</div>
            <div style={{fontSize:9,color:"#888",marginTop:1}}>{fm(sendAmt)}</div>
          </button>;
        })}
      </div>
      <div style={{fontSize:10,color:"#aaa",textAlign:"center"}}>Rate: 1 {fpd.currency} = {(rate*.995).toFixed(4)} {tpd.currency} after fee</div>
    </div>;
  });
})()}
        </div>
        {(d.transferLog||[]).length>0&&<div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Transfer History</div>
          {(d.transferLog||[]).slice(0,8).map((t,i)=>{const fp=ALL_PLANETS.find(p=>p.name===t.from),tp=ALL_PLANETS.find(p=>p.name===t.to);return <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f5f5f5"}}><div><div style={{fontSize:11,fontWeight:700,color:DK}}>{fp?.ico} {t.from} → {tp?.ico} {t.to}</div><div style={{fontSize:10,color:"#aaa"}}>Turn {t.t} · Fee: {fm(t.fee)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,color:G}}>{fm(t.recvAmt)} {t.recvCur}</div><div style={{fontSize:10,color:"#aaa"}}>{fm(t.sentAmt)} {t.sentCur}</div></div></div>;})}
        </div>}
      </>}

      {/* CONTAGION */}
      {tab==="contagion"&&<>
        <div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:6}}>Economic Contagion (from spec Stage 11)</div>
          <div style={{fontSize:11,color:"#888",marginBottom:12,lineHeight:1.6}}>When Earth GDP changes, other planets are affected — but with a delay and reduced intensity. This creates diversification opportunities.</div>
          <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:6}}>Current Earth GDP: <span style={{color:d.planets?.earth?.gdp>=0?G:R,fontFamily:"monospace"}}>{d.planets?.earth?.gdp?.toFixed(1)||2.5}%</span></div>
          {[{name:"Mars",delay:2,factor:.50,ico:"🔴"},{name:"Venus",delay:2,factor:.67,ico:"🟡"},{name:"Jupiter",delay:3,factor:.83,ico:"🟠"}].map(p=>{
            const impact=Math.round((d.planets?.earth?.gdp||2.5)*p.factor*.5*10)/10;
            return <div key={p.name} style={{padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{p.ico}</span><div><div style={{fontSize:12,fontWeight:700,color:DK}}>{p.name}</div><div style={{fontSize:10,color:"#aaa"}}>{p.delay}-turn delay · {(p.factor*100).toFixed(0)}% of Earth GDP change</div></div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,fontFamily:"monospace",color:impact>=0?G:R}}>{impact>=0?"+":""}{impact}% <span style={{fontSize:9,color:"#aaa"}}>arriving in {p.delay}t</span></div><div style={{fontSize:11,color:"#aaa"}}>Current GDP: {d.planets?.[p.name.toLowerCase()]?.gdp?.toFixed(1)||"—"}%</div></div>
              </div>
            </div>;})}
        </div>
        <div style={{background:"#FFF8E1",borderRadius:13,padding:13,border:"1px solid #FFE082"}}>
          <div style={{fontSize:13,fontWeight:700,color:AU,marginBottom:8}}>⚡ Jupiter Storm System</div>
          <div style={{fontSize:11,color:"#555",lineHeight:1.6,marginBottom:8}}>Jupiter has a ~1% chance per turn of a catastrophic storm event. When it hits: production falls 30%, GDP craters, but the Mutual Space Council activates — other planets send raw materials and JCR companies bounce back within 20 turns. Buy Jupiter companies during the storm for maximum upside.</div>
          <div style={{display:"flex",gap:8}}>
            {[["Storm Risk","~1%/turn"],["Duration","20 turns"],["Production Hit","-30%"],["Recovery","Turns 21–30 bounce"],["MSC Support","Automatic"],["Strategy","BUY the dip"]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.7)",borderRadius:7,padding:"6px 4px",textAlign:"center"}}><div style={{fontSize:8,color:"#aaa",marginBottom:1}}>{k}</div><div style={{fontSize:9,fontWeight:700,color:AU}}>{v}</div></div>)}
          </div>
          <button onClick={()=>{const s=S.current;s.planets.jupiter.stormActive=true;s.planets.jupiter.stormTurn=s.turn;s.newsLog.unshift({t:s.turn,ico:"⚡",planet:"Jupiter",msg:"SIMULATED STORM: Production hit -30%! Buy now for recovery play.",bad:true});refresh();toast_("⚡ Jupiter storm triggered! Watch companies drop — buy for recovery.",false);}} style={{width:"100%",background:AU,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:800,fontSize:13,cursor:"pointer",marginTop:10}}>⚡ Trigger Jupiter Storm (Test)</button>
        </div>
      </>}

      {/* NEWS */}
      {tab==="news"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {d.newsLog.length===0&&<div style={{padding:30,textAlign:"center",color:"#aaa",fontSize:13}}>Advance turns to generate news.</div>}
        {d.newsLog.map((n,i)=>{const pd=ALL_PLANETS.find(p=>p.name===n.planet||p.id===n.planet);return <div key={i} style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8",display:"flex",gap:9}}>
          <div style={{width:4,borderRadius:2,flexShrink:0,background:n.bad?R:G,alignSelf:"stretch"}}/>
          <div style={{flex:1}}><div style={{fontSize:10,color:"#ccc",marginBottom:2}}>Turn {n.t} {pd?.ico||""} {n.planet}</div><div style={{fontSize:12,fontWeight:600,color:DK}}>{n.ico} {n.msg}</div></div>
        </div>;})}
      </div>}
    </div>
    {/* Trade modal */}
    {trM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget){setTrM(null);setTrAmt(null);}}}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:18,width:"100%"}}>
        <div style={{width:36,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 14px"}}/>
        <div style={{fontSize:16,fontWeight:800,color:DK,marginBottom:4}}>{trM.mode==="buy"?"Buy":"Sell"} {trM.co.n}</div>
        <div style={{fontSize:12,color:"#888",marginBottom:12}}>{fm(trM.co.price)}/sh · Wallet: {fm(d.wallets?.[PLANETS[selPlanet]?.name]||0)} {PLANETS[selPlanet]?.currency}</div>
        {(()=>{const maxQ=trM.mode==="buy"?Math.floor((d.wallets?.[PLANETS[selPlanet]?.name]||0)/trM.co.price):d.sh?.[trM.planet+"_"+trM.co.t]||0;
          const presets=[1,5,10,50,100,500,1000,maxQ].filter((v,i,a)=>v<=maxQ&&v>0&&a.indexOf(v)===i).sort((a,b)=>a-b).slice(-8);
          return <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
              {presets.map(v=><button key={v} onClick={()=>setTrAmt(v)} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(trAmt===v?(trM.mode==="buy"?G:R):"#e0e0e0"),background:trAmt===v?(trM.mode==="buy"?"#E8F5E9":"#FFEBEE"):"#fafafa",color:trAmt===v?(trM.mode==="buy"?G:R):"#555",fontWeight:700,fontSize:11,cursor:"pointer"}}>{v>=1000?(v/1000)+"K":v}</button>)}
            </div>
            <button onClick={()=>doTrade(trM.planet,trM.co,trM.mode,trAmt||0)} disabled={!(trAmt>0)} style={{width:"100%",background:!(trAmt>0)?"#e0e0e0":trM.mode==="buy"?G:R,color:"#fff",border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,fontSize:13,cursor:trAmt>0?"pointer":"not-allowed"}}>
              {trAmt>0?"Confirm "+(trM.mode==="buy"?"Buy":"Sell")+" "+trAmt+" @ "+fm(trM.co.price):" Select quantity"}
            </button>
          </>;
        })()}
      </div>
    </div>}
    {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:toast.g?G:R,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,zIndex:200,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>{toast.msg}</div>}
    <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
  </div>;
}
