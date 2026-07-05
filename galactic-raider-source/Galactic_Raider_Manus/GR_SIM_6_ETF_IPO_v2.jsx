import{useState,useRef,useCallback,useEffect}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const pc=n=>(n>=0?"+":"")+n.toFixed(2)+"%";
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);

// ── PLANET SOVEREIGN FUNDS ───────────────────────────────────
const PLANET_FUNDS=[
  {id:"ESF",planet:"Earth",ico:"🌍",n:"Earth Sovereign Fund",currency:"USD",rate:12.48,color:"#1B5E20",desc:"Flagship interplanetary fund. Anchored to Earth GDP. Quarterly distributions to all planet holders.",aum:2840000000000},
  {id:"MSF",planet:"Mars",ico:"🔴",n:"Mars Mining Sovereign Fund",currency:"MCR",rate:18.4,color:"#B71C1C",desc:"Backed by Martian lithium and rare earth reserves. Volatile but high yield. Feeds Jupiter's rebuilding after storms.",aum:480000000000},
  {id:"VSF",planet:"Venus",ico:"🟡",n:"Venus Solar Sovereign Fund",currency:"VCR",rate:14.2,color:"#E65100",desc:"Automated solar energy exports. Steady compounding. Acid cloud events temporarily reduce yield.",aum:620000000000},
  {id:"JSF",planet:"Jupiter",ico:"🟠",n:"Jupiter Autonomous Sovereign Fund",currency:"JCR",rate:24.8,color:"#F57F17",desc:"Highest rate in the system — reflects storm risk. Post-storm deposits earn maximum recovery yield.",aum:890000000000},
  {id:"SSF",planet:"Saturn",ico:"🪐",n:"Saturn Ryzolith Sovereign Fund",currency:"STC",rate:16.6,color:"#7B1FA2",desc:"Backed by Ryzolith monopoly reserves. Grows every 100 turns as quantum demand increases.",aum:310000000000},
  {id:"MRSF",planet:"Mercury",ico:"☿",n:"Mercury Solar Sovereign Fund",currency:"MRC",rate:15.8,color:"#455A64",desc:"Solar flare events boost returns temporarily. Extremely reliable baseline yield.",aum:240000000000},
  {id:"USF",planet:"Uranus",ico:"🔵",n:"Uranus Cryogenic Sovereign Fund",currency:"URU",rate:11.2,color:"#0277BD",desc:"Lowest volatility fund in the system. 42-year season changes create predictable rebalancing.",aum:180000000000},
  {id:"NSF",planet:"Neptune",ico:"💜",n:"Neptune Research Sovereign Fund",currency:"NPT",rate:28.4,color:"#4527A0",desc:"Highest rate of all funds — reflects extreme risk. Research breakthroughs can spike returns 200%.",aum:95000000000},
];

// ── ETFs ────────────────────────────────────────────────────
const ETFS=[
  {id:"GSFE",n:"GalacticSpace Global Equity",type:"Equity",aum:48500000000,expense:.12,price:142.50,div:1.8,sharpe:1.42,maxDD:-.18,bench:"MSCI Galactic",ytd:.142,oneY:.218,threeY:.412,
   desc:"Diversified global equity exposure across 15 Earth companies. Low cost, broad market access.",
   top5:[{t:"SLKT",w:.18},{t:"MDCR",w:.14},{t:"TNPT",w:.12},{t:"FRMN",w:.09},{t:"UTLS",w:.08}]},
  {id:"GSFT",n:"GalacticSpace Tech Focus",type:"Sector",aum:12800000000,expense:.25,price:89.40,div:.4,sharpe:1.85,maxDD:-.28,bench:"NovaTech-100",ytd:.285,oneY:.412,threeY:.892,
   desc:"Concentrated technology exposure. Higher volatility, higher potential. Growth-oriented.",
   top5:[{t:"SLKT",w:.35},{t:"EMTS",w:.28},{t:"MDCR",w:.22},{t:"AXMB",w:.10},{t:"OTHER",w:.05}]},
  {id:"GSFD",n:"GalacticSpace Dividend Income",type:"Income",aum:32100000000,expense:.18,price:58.20,div:4.8,sharpe:1.12,maxDD:-.09,bench:"Galactic High Div",ytd:.048,oneY:.092,threeY:.189,
   desc:"High dividend yield strategy. 4.8% annual distribution. Defensive income play.",
   top5:[{t:"UTLS",w:.22},{t:"TLCM",w:.20},{t:"RLST",w:.18},{t:"AGRO",w:.15},{t:"MRDB",w:.12}]},
  {id:"GSFM",n:"GalacticSpace Mining & Resources",type:"Sector",aum:8900000000,expense:.32,price:34.80,div:.9,sharpe:.92,maxDD:-.35,bench:"Solar Resources Index",ytd:-.028,oneY:.148,threeY:.312,
   desc:"Commodities and resources exposure. Cyclical. Benefits from inflation and supply shocks.",
   top5:[{t:"FRMN",w:.32},{t:"TNPT",w:.28},{t:"AGRO",w:.18},{t:"OTHER",w:.22}]},
  {id:"GSFP",n:"GalacticSpace Planet Gateway",type:"Thematic",aum:5200000000,expense:.45,price:28.60,div:.2,sharpe:1.65,maxDD:-.42,bench:"Custom Planet Index",ytd:.412,oneY:.680,threeY:null,
   desc:"Access to companies positioned for space economy expansion. All 7 planet exposure.",
   top5:[{t:"SLKT",w:.25},{t:"FRMN",w:.20},{t:"MDCR",w:.15},{t:"EMTS",w:.15},{t:"OTHER",w:.25}]},
];

// ── IPOs — staggered across 400 turns, fictional names only ──
const IPOS=[
  {id:"NVRA",n:"NovaMed Robotics",sector:"Healthcare",planet:"Earth",shares:50000000,priceRange:[18,22],bookings:285,oversubscribed:5.7,opens:50,
   desc:"AI-powered surgical robots. 40 hospitals signed. Revenue $180M growing 85% YoY.",
   founder:"Dr. Kira Osei, ex-Galactic Med Institute",fundedBy:"AstroVentures, Quantum Horizon",stage:"Series D → IPO",
   financials:{rev:180000000,growth:.85,margin:.28,debt:45000000},
   analysts:[{firm:"OrbitRating",view:"STRONG BUY",target:28,note:"Disruptive. Surgical robot TAM $45B. Founder has built two exits."},{firm:"StarCapital Research",view:"BUY",target:25,note:"Strong unit economics. Hospital pipeline highly visible."}]},
  {id:"CLDB",n:"CloudBase Systems",sector:"Technology",planet:"Earth",shares:80000000,priceRange:[12,15],bookings:142,oversubscribed:1.8,opens:120,
   desc:"Edge computing infrastructure. 2,400 enterprise clients. Revenue $420M.",
   founder:"Aria Nkosi, ex-Galactic Cloud",fundedBy:"Orbital Growth Fund, RedDust Capital",stage:"Series E → IPO",
   financials:{rev:420000000,growth:.42,margin:.18,debt:120000000},
   analysts:[{firm:"VegaAnalytics",view:"BUY",target:18,note:"Growing fast. Edge computing structural trend."},{firm:"NovaStar Research",view:"HOLD",target:15,note:"Valuation fair at midpoint. Wait for post-IPO clarity."}]},
  {id:"GRNX",n:"GreenX Energy",sector:"Energy",planet:"Venus",shares:120000000,priceRange:[8,11],bookings:98,oversubscribed:0.8,opens:200,
   desc:"Green hydrogen production across Venus orbital platforms. 12 government contracts.",
   founder:"Erik Vasquez, ex-SolarCrest",fundedBy:"Outer Ring Ventures, CosmicSeed",stage:"Series C → IPO",
   financials:{rev:95000000,growth:.65,margin:.12,debt:280000000},
   analysts:[{firm:"PlanetaryFunds Research",view:"SPECULATIVE BUY",target:14,note:"Hydrogen is the future. Near-term path to profit unclear."},{firm:"VegaAnalytics",view:"HOLD",target:9,note:"Undersubscribed is a yellow flag. Wait."}]},
  {id:"LOGX",n:"LogiXpress Freight",sector:"Logistics",planet:"Mars",shares:60000000,priceRange:[24,28],bookings:320,oversubscribed:5.3,opens:300,
   desc:"AI freight matching across inner planets. 18,000 transport partners. Revenue $890M profitable.",
   founder:"Marcus Adeyemi, serial entrepreneur",fundedBy:"AstroVentures, SolarCrest Fund",stage:"Series D → IPO",
   financials:{rev:890000000,growth:.38,margin:.22,debt:60000000},
   analysts:[{firm:"OrbitRating",view:"STRONG BUY",target:35,note:"Profitable, growing, asset-light. Prime IPO."},{firm:"StarCapital Research",view:"BUY",target:32,note:"Strong booking demand confirms conviction."}]},
  {id:"RYZX",n:"Ryzolith Dynamics",sector:"Mining",planet:"Saturn",shares:40000000,priceRange:[45,55],bookings:180,oversubscribed:4.2,opens:400,
   desc:"Only private company licensed to mine Ryzolith outside the Saturn Sovereign Fund. Quantum computing applications.",
   founder:"Yuki Tanaka, ex-Ryzolith Partners",fundedBy:"Ryzolith Partners, Quantum Horizon",stage:"Series B → IPO",
   financials:{rev:340000000,growth:1.20,margin:.45,debt:80000000},
   analysts:[{firm:"OuterRing Analytics",view:"STRONG BUY",target:75,note:"Monopoly-adjacent position. Ryzolith demand compounds. Generational opportunity."},{firm:"NovaStar Research",view:"BUY",target:65,note:"High risk, enormous upside. Size position accordingly."}]},
];

export default function ETFIPOSim(){
  const[tab,setTab]=useState("etf");
  const[selETF,setSelETF]=useState(null);
  const[selIPO,setSelIPO]=useState(null);
  const[selFund,setSelFund]=useState(null);
  const[speed,setSpeed]=useState(1);
  const[auto,setAuto]=useState(false);
  const speedRef=useRef(1);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  const aRef=useRef(null);
  const[toast,setToast]=useState(null);
  const[trAmt,setTrAmt]=useState(null);
  const[trMode,setTrMode]=useState("buy");
  const[ipoAmt,setIpoAmt]=useState(null);
  const[fundAmt,setFundAmt]=useState(null);
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2800);},[]);

  const S=useRef(null);
  if(!S.current){S.current={
    turn:1,cash:5000000,
    etfs:ETFS.map(e=>({...e,units:0,avgCost:e.price,hist:[e.price,e.price],ch:0})),
    ipos:IPOS.map(ip=>({...ip,status:"open",allocated:0,listed:false,listPrice:null,currentPrice:null})),
    funds:PLANET_FUNDS.map(f=>({...f,deposit:0,totalEarned:0})),
    news:[
      {id:1,t:1,ico:"📊",ti:"ETF & IPO Markets Open",bo:"5 ETFs active. 5 IPOs in pipeline — staggered across 400 turns. 8 Planet Sovereign Funds available.",g:true},
      {id:2,t:1,ico:"🌍",ti:"Planet Sovereign Funds Live",bo:"Each planet has its own sovereign fund. Earth: 12.48%/yr. Neptune highest at 28.4%/yr — reflects extreme risk.",g:true},
    ],
  };}
  const[D,setD]=useState(()=>({...S.current}));
  const refresh=useCallback(()=>setD({...S.current}),[]);

  const advance=useCallback(()=>{
    const s=S.current;s.turn++;
    const nn=[];
    // ETF price movement
    s.etfs=s.etfs.map(e=>{
      const move=1+(Math.random()-.5)*.06*(e.type==="Thematic"?1.8:e.type==="Sector"?1.4:1.0);
      const np=Math.max(1,Math.round(e.price*move*100)/100);
      return{...e,pp:e.price,price:np,ch:(np-e.price)/e.price,hist:[...e.hist.slice(-50),np]};
    });
    // ETF dividends every 30 turns
    if(s.turn%30===0){
      let totDiv=0;
      s.etfs.forEach(e=>{if(e.units>0){const d=Math.round(e.price*(e.div/100/4)*e.units*100)/100;if(d>0){totDiv+=d;s.cash=Math.round((s.cash+d)*100)/100;}}});
      if(totDiv>0)nn.push({id:Math.random(),t:s.turn,ico:"💰",ti:"ETF Distributions: "+fm(totDiv),bo:"Quarterly income from dividend ETFs credited.",g:true});
    }
    // Planet Sovereign Fund returns — credited every turn
    s.funds=s.funds.map(f=>{
      if(f.deposit>0){
        const ret=Math.round(f.deposit*(f.rate/100/365)*100)/100;
        s.cash=Math.round((s.cash+ret)*100)/100;
        return{...f,totalEarned:Math.round((f.totalEarned+ret)*100)/100};
      }
      return f;
    });
    // IPO listings — staggered
    s.ipos=s.ipos.map(ip=>{
      if(!ip.listed&&s.turn>=ip.opens){
        const mid=(ip.priceRange[0]+ip.priceRange[1])/2;
        const listPrice=Math.round(mid*(ip.oversubscribed>3?1.2:ip.oversubscribed>1?1.05:.95)*100)/100;
        const allocated=Math.round((ip.allocated||0)*0.85);
        nn.push({id:Math.random(),t:s.turn,ico:"🚀",ti:"IPO LISTING: "+ip.n,bo:"Listed at "+fm(listPrice)+" ("+ip.planet+" exchange). "+ip.oversubscribed.toFixed(1)+"× oversubscribed.",g:ip.oversubscribed>1});
        if(allocated>0){s.cash=Math.round((s.cash+allocated*listPrice)*100)/100;}
        return{...ip,listed:true,listPrice,currentPrice:listPrice};
      }
      if(ip.listed&&ip.currentPrice){
        const move=1+(Math.random()-.5)*.10;
        const np=Math.max(.50,Math.round(ip.currentPrice*move*100)/100);
        return{...ip,currentPrice:np};
      }
      return ip;
    });
    // Upcoming IPO reminders
    const upcoming=s.ipos.filter(ip=>!ip.listed&&ip.opens-s.turn<=10&&ip.opens-s.turn>0);
    upcoming.forEach(ip=>{if((ip.opens-s.turn)===10)nn.push({id:Math.random(),t:s.turn,ico:"⏰",ti:"IPO Alert: "+ip.n+" opens in 10 turns",bo:"Book now. "+ip.oversubscribed.toFixed(1)+"× demand. Range "+fm(ip.priceRange[0])+"–"+fm(ip.priceRange[1])+".",g:true});});
    s.news=[...nn,...s.news].slice(0,60);
    refresh();
  },[refresh]);

  useEffect(()=>{
    if(!auto){clearInterval(aRef.current);return;}
    clearInterval(aRef.current);
    aRef.current=setInterval(()=>advance(),speedRef.current*1000);
    return()=>clearInterval(aRef.current);
  },[auto,speed,advance]);

  const buyETF=(etf,units)=>{
    const s=S.current;const cost=Math.round(units*etf.price*100)/100;
    if(cost>s.cash){toast_("Need "+fm(cost)+" — have "+fm(s.cash),false);return;}
    setAuto(false);
    const e=s.etfs.find(x=>x.id===etf.id);
    const prev=e.units;e.units+=units;
    e.avgCost=Math.round(((e.avgCost*prev)+cost)/e.units*100)/100;
    s.cash=Math.round((s.cash-cost)*100)/100;
    s.news.unshift({id:Math.random(),t:s.turn,ico:"📈",ti:"Bought "+units.toLocaleString()+" "+etf.id,bo:units.toLocaleString()+" units @ "+fm(etf.price)+" · Cost: "+fm(cost),g:true});
    toast_("✅ Bought "+units.toLocaleString()+" units of "+etf.n);setTrAmt(null);refresh();
  };

  const sellETF=(etf,units)=>{
    const s=S.current;const e=s.etfs.find(x=>x.id===etf.id);
    if(units>e.units){toast_("Only "+e.units+" held",false);return;}
    setAuto(false);
    const proc=Math.round(units*etf.price*100)/100;
    const profit=Math.max(0,(etf.price-e.avgCost)*units);
    const cgt=Math.round(profit*.20*100)/100;
    const net=proc-cgt;
    s.cash=Math.round((s.cash+net)*100)/100;
    e.units-=units;
    s.news.unshift({id:Math.random(),t:s.turn,ico:"📉",ti:"Sold "+units.toLocaleString()+" "+etf.id,bo:"Proceeds: "+fm(proc)+" · CGT: "+fm(cgt)+" · Net: "+fm(net),g:net>0});
    toast_("✅ Sold "+units.toLocaleString()+" units · Net: "+fm(net)+" (CGT: "+fm(cgt)+")");setTrAmt(null);refresh();
  };

  const bookIPO=(ipo,shares)=>{
    const s=S.current;const ip=s.ipos.find(x=>x.id===ipo.id);
    if(ip.listed){toast_("Already listed — cannot book",false);return;}
    const est=Math.round(shares*(ipo.priceRange[0]+ipo.priceRange[1])/2*100)/100;
    if(est>s.cash){toast_("Estimated cost "+fm(est)+" exceeds cash",false);return;}
    setAuto(false);
    s.cash=Math.round((s.cash-est)*100)/100;
    ip.allocated=(ip.allocated||0)+shares;ip.bookings+=1;
    s.news.unshift({id:Math.random(),t:s.turn,ico:"📋",ti:"IPO Booked: "+ipo.n,bo:shares.toLocaleString()+" shares · Est. cost: "+fm(est)+" · Opens T"+ipo.opens,g:true});
    toast_("✅ Booked "+shares.toLocaleString()+" shares in "+ipo.n+" · Opens T"+ipo.opens);setIpoAmt(null);refresh();
  };

  const depositFund=(fund,amt)=>{
    const s=S.current;
    if(amt<50000){toast_("Min $50,000 deposit",false);return;}
    if(amt>s.cash){toast_("Insufficient cash",false);return;}
    const fee=Math.round(amt*.02*100)/100;
    const net=Math.round(amt*.98*100)/100;
    s.cash=Math.round((s.cash-amt)*100)/100;
    const f=s.funds.find(x=>x.id===fund.id);
    f.deposit=Math.round((f.deposit+net)*100)/100;
    s.news.unshift({id:Math.random(),t:s.turn,ico:"🏛️",ti:"Deposited to "+fund.n,bo:fm(net)+" deposited (2% fee: "+fm(fee)+"). Earns "+fund.rate+"%/yr = "+fm(Math.round(f.deposit*fund.rate/100/365*100)/100)+"/turn.",g:true});
    toast_("✅ "+fm(net)+" in "+fund.planet+" Fund · "+fm(Math.round(f.deposit*fund.rate/100/365*100)/100)+"/turn");
    setFundAmt(null);refresh();
  };

  const withdrawFund=(fund)=>{
    const s=S.current;const f=s.funds.find(x=>x.id===fund.id);
    if(f.deposit<=0){toast_("Nothing deposited",false);return;}
    const amt=f.deposit;s.cash=Math.round((s.cash+amt)*100)/100;f.deposit=0;
    s.news.unshift({id:Math.random(),t:s.turn,ico:"🏛️",ti:"Withdrew from "+fund.n,bo:fm(amt)+" returned to cash. Total earned: "+fm(f.totalEarned),g:true});
    toast_("Withdrawn "+fm(amt)+" from "+fund.planet+" Fund");refresh();
  };

  const d=D;
  const etfVal=d.etfs.reduce((x,e)=>x+e.price*e.units,0);
  const fundVal=d.funds.reduce((x,f)=>x+(f.deposit||0),0);
  const fundEarned=d.funds.reduce((x,f)=>x+(f.totalEarned||0),0);
  const nw=d.cash+etfVal+fundVal;

  const MC=({hist,w=60,h=24})=>{if(!hist||hist.length<2)return null;const mn=Math.min(...hist)*.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={hist[hist.length-1]>=(hist[0]||0)?G:R} strokeWidth="1.8" strokeLinejoin="round"/></svg>;};
  const RBar=({label,val,max,color})=><div style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:"#666"}}>{label}</span><span style={{fontSize:11,fontWeight:700,color,fontFamily:"monospace"}}>{typeof val==="number"?val.toFixed(2):val}</span></div><div style={{height:4,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,(val/max)*100)+"%",background:color,borderRadius:2}}/></div></div>;

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
    <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",padding:"14px 16px 0",color:"#fff"}}>
      <div style={{fontSize:11,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>SIM 6 — ETF · IPO · Planet Sovereign Funds</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div><div style={{fontSize:20,fontWeight:800}}>Turn {d.turn}</div><div style={{fontSize:12,opacity:.7}}>NW: {fm(nw)} · Earning: {fm(Math.round(d.funds.reduce((x,f)=>x+f.deposit*(f.rate/100/365),0)*100)/100)}/turn</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:700,fontFamily:"monospace"}}>{fm(d.cash)}</div><div style={{fontSize:10,opacity:.6}}>cash</div></div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:10}}>
        <button onClick={advance} disabled={auto} style={{flex:2,background:auto?"rgba(255,255,255,.1)":G,color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:12,cursor:auto?"not-allowed":"pointer"}}>▶ Turn</button>
        <button onClick={()=>setAuto(a=>!a)} style={{flex:1,background:auto?"#B71C1C":"rgba(255,255,255,.1)",color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>{auto?"⏹":"Auto"}</button>
        {[.5,1,5,10].map(s=><button key={s} onClick={()=>setSpeed(s)} style={{flex:1,background:speed===s?"rgba(255,255,255,.25)":"rgba(255,255,255,.1)",color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer"}}>{s<1?".5s":s+"s"}</button>)}
      </div>
      <div style={{display:"flex",gap:0,overflowX:"auto"}}>
        {[{id:"etf",l:"ETFs"},{id:"etfd",l:"ETF Detail"},{id:"ipo",l:"IPOs"},{id:"ipod",l:"IPO Detail"},{id:"funds",l:"🌍 Planet Funds"},{id:"port",l:"Portfolio"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flexShrink:0,padding:"10px 10px",border:"none",borderBottom:"3px solid "+(tab===t.id?"#fff":"transparent"),background:"transparent",color:tab===t.id?"#fff":"rgba(255,255,255,.5)",fontWeight:700,fontSize:9,cursor:"pointer"}}>{t.l}</button>)}
      </div>
    </div>

    <div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
      {/* ETF LIST */}
      {tab==="etf"&&<>
        <div style={{background:"#E3F2FD",borderRadius:11,padding:11,border:"1px solid #BBDEFB",fontSize:12,color:BL}}>5 ETFs · Quarterly distributions · Tap for full analytics and Buy/Sell</div>
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          {d.etfs.map((e,i)=>{const held=e.units>0;return <div key={e.id} onClick={()=>{setSelETF({...e});setTrAmt(null);setTrMode("buy");setTab("etfd");}} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderBottom:i<d.etfs.length-1?"1px solid #f5f5f5":"none",cursor:"pointer"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><span style={{fontSize:12,fontWeight:700,color:DK}}>{e.n}</span><span style={{background:"#EDE7F6",color:PU,padding:"1px 6px",borderRadius:10,fontSize:9,fontWeight:700}}>{e.type}</span></div>
              <div style={{fontSize:10,color:"#888"}}>{e.expense}% TER · {e.div}% div{held?" · "+e.units.toLocaleString()+" held":""}</div>
            </div>
            <MC hist={e.hist}/>
            <div style={{textAlign:"right",minWidth:65}}>
              <div style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{fm(e.price)}</div>
              <div style={{fontSize:10,fontWeight:700,color:e.ch>=0?G:R,fontFamily:"monospace"}}>{e.ch>=0?"+":""}{(e.ch*100).toFixed(2)}%</div>
            </div>
          </div>;})}
        </div>
      </>}

      {/* ETF DETAIL with Buy AND Sell */}
      {tab==="etfd"&&(()=>{
        const e=selETF?d.etfs.find(x=>x.id===selETF.id)||selETF:null;
        if(!e)return <div style={{padding:40,textAlign:"center",color:"#aaa",fontSize:14}}>← Select an ETF</div>;
        const held=e.units>0,val=e.units*e.price,pl=held?(e.price-e.avgCost)*e.units:0;
        const maxBuy=Math.floor(d.cash/e.price);
        const presets=isBuy=>[1,5,10,50,100,500,isBuy?maxBuy:e.units].filter((v,i2,a)=>v<=(isBuy?maxBuy:e.units)&&v>0&&a.indexOf(v)===i2).sort((a,b)=>a-b).slice(-6);
        return <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",borderRadius:14,padding:16,color:"#fff"}}>
            <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{e.type} ETF · {e.id}</div>
            <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>{e.n}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
              <div><div style={{fontSize:26,fontWeight:800,fontFamily:"monospace"}}>{fm(e.price)}</div><div style={{fontSize:11,color:e.ch>=0?"#A5D6A7":"#EF9A9A",marginTop:2}}>{e.ch>=0?"▲":"▼"} {(Math.abs(e.ch)*100).toFixed(2)}%</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:10,opacity:.7}}>AUM</div><div style={{fontSize:15,fontWeight:700}}>{fm(e.aum)}</div></div>
            </div>
            <div style={{fontSize:11,opacity:.8,lineHeight:1.5}}>{e.desc}</div>
          </div>
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>📊 Analytics</div>
            <RBar label="Sharpe Ratio" val={e.sharpe} max={3} color={e.sharpe>1.5?G:e.sharpe>1?AU:R}/>
            <RBar label="Max Drawdown %" val={Math.abs(e.maxDD)*100} max={50} color={Math.abs(e.maxDD)<.15?G:Math.abs(e.maxDD)<.25?AU:R}/>
            <RBar label="Expense Ratio %" val={e.expense} max={1} color={e.expense<.2?G:e.expense<.35?AU:R}/>
            <RBar label="Dividend Yield %" val={e.div} max={7} color={e.div>3?G:e.div>1?AU:R}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:8}}>
              {[["YTD",pc(e.ytd*100)],["1 Year",pc(e.oneY*100)],["3 Year",e.threeY?pc(e.threeY*100):"N/A"]].map(([k,v])=><div key={k} style={{background:"#f8fbf8",borderRadius:8,padding:"8px 6px",textAlign:"center"}}><div style={{fontSize:9,color:"#aaa",marginBottom:2}}>{k}</div><div style={{fontSize:13,fontWeight:800,color:parseFloat(v)>=0?G:R,fontFamily:"monospace"}}>{v}</div></div>)}
            </div>
          </div>
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Top Holdings · Benchmark: {e.bench}</div>
            {e.top5.map((h,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f5f5f5",alignItems:"center"}}>
              <span style={{fontSize:12,color:DK,fontWeight:600}}>{h.t}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:60,height:4,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:(h.w*100)+"%",background:BL,borderRadius:2}}/></div><span style={{fontSize:11,fontFamily:"monospace",color:"#666",minWidth:32}}>{(h.w*100).toFixed(0)}%</span></div>
            </div>)}
          </div>
          {held&&<div style={{background:"#E8F5E9",borderRadius:11,padding:12,border:"1px solid #A5D6A7"}}>
            <div style={{fontSize:12,fontWeight:700,color:G,marginBottom:8}}>Your Position</div>
            <div style={{display:"flex",gap:6}}><div style={{flex:1,background:"#fff",borderRadius:7,padding:"7px 6px",textAlign:"center"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>Units</div><div style={{fontSize:12,fontWeight:800,color:DK}}>{e.units.toLocaleString()}</div></div><div style={{flex:1,background:"#fff",borderRadius:7,padding:"7px 6px",textAlign:"center"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>Value</div><div style={{fontSize:12,fontWeight:800,color:DK}}>{fm(val)}</div></div><div style={{flex:1,background:"#fff",borderRadius:7,padding:"7px 6px",textAlign:"center"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>P&L</div><div style={{fontSize:12,fontWeight:800,color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</div></div></div>
          </div>}
          {/* BUY/SELL TOGGLE */}
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{display:"flex",background:"#f0f4f0",borderRadius:9,padding:3,gap:2,marginBottom:10}}>
              {["buy","sell"].map(m=><button key={m} onClick={()=>{setTrMode(m);setTrAmt(null);}} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",background:trMode===m?"#fff":"transparent",color:trMode===m?(m==="buy"?G:R):"#999",fontWeight:700,fontSize:12,cursor:"pointer",boxShadow:trMode===m?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{m==="buy"?"📈 Buy":"📉 Sell"}</button>)}
            </div>
            <div style={{fontSize:11,color:"#888",marginBottom:8}}>{trMode==="buy"?fm(d.cash)+" available · max "+maxBuy.toLocaleString()+" units":(e.units||0)+" units held"}</div>
            {(trMode==="buy"?maxBuy:e.units)>0?<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
              {presets(trMode==="buy").map(v=><button key={v} onClick={()=>setTrAmt(trAmt===v?null:v)} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(trAmt===v?(trMode==="buy"?G:R):"#e0e0e0"),background:trAmt===v?(trMode==="buy"?"#E8F5E9":"#FFEBEE"):"#fafafa",color:trAmt===v?(trMode==="buy"?G:R):"#555",fontWeight:700,fontSize:11,cursor:"pointer",textAlign:"center"}}>
                <div>{v>=1000?(v/1000).toFixed(0)+"K":v}</div>
                <div style={{fontSize:9,color:trAmt===v?(trMode==="buy"?G:R):"#aaa",marginTop:1}}>{fm(v*e.price)}</div>
              </button>)}
            </div>:<div style={{padding:"10px 0",color:"#aaa",fontSize:12,textAlign:"center"}}>{trMode==="buy"?"Not enough cash":"Nothing held"}</div>}
            {trAmt&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>{trMode==="buy"?"Cost":"Proceeds"}</span><span style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{fm(trAmt*e.price)}</span></div>
              {trMode==="sell"&&<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>CGT (20% on profit)</span><span style={{fontSize:12,fontWeight:700,color:R,fontFamily:"monospace"}}>−{fm(Math.max(0,(e.price-e.avgCost)*trAmt*.20))}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:13,fontWeight:700,color:DK}}>Net</span><span style={{fontSize:13,fontWeight:800,color:trMode==="buy"?R:G,fontFamily:"monospace"}}>{fm(trMode==="buy"?trAmt*e.price:trAmt*e.price-Math.max(0,(e.price-e.avgCost)*trAmt*.20))}</span></div>
            </div>}
            <button onClick={()=>{if(!trAmt)return;if(trMode==="buy")buyETF(e,trAmt);else sellETF(e,trAmt);}} disabled={!trAmt} style={{width:"100%",background:!trAmt?"#e0e0e0":trMode==="buy"?G:R,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:13,cursor:trAmt?"pointer":"not-allowed"}}>
              {trAmt?"Confirm "+(trMode==="buy"?"Buy":"Sell")+" "+trAmt.toLocaleString()+" units @ "+fm(e.price):"Select quantity above"}
            </button>
          </div>
        </div>;
      })()}

      {/* IPO LIST */}
      {tab==="ipo"&&<>
        <div style={{background:"#FFF8E1",borderRadius:11,padding:11,border:"1px solid #FFE082",fontSize:12,color:"#E65100",lineHeight:1.6}}>5 IPOs staggered across 400 turns · Advance turns to see upcoming listings · Alert fires 10 turns before each opens</div>
        {d.ipos.map(ip=>{
          const turnsTo=ip.opens-d.turn;const isOpen=!ip.listed&&turnsTo<=0;const upcoming=!ip.listed&&turnsTo>0;
          const overColor=ip.oversubscribed>=5?G:ip.oversubscribed>=2?AU:R;
          return <div key={ip.id} onClick={()=>{setSelIPO({...ip});setIpoAmt(null);setTab("ipod");}} style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid "+(isOpen?"#1565C0":"#e8ebe8"),cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{fontSize:13,fontWeight:700,color:DK}}>{ip.n}</span><span style={{background:"#f0f4f0",color:"#555",padding:"1px 7px",borderRadius:10,fontSize:9,fontWeight:700}}>{ip.sector}</span><span style={{background:"#EDE7F6",color:PU,padding:"1px 7px",borderRadius:10,fontSize:9,fontWeight:700}}>{ip.planet}</span></div><div style={{fontSize:11,color:"#888"}}>{ip.listed?"Listed T"+ip.opens:upcoming?"Opens T"+ip.opens+" ("+turnsTo+"t away)":"OPEN — Book now!"}</div></div>
              <div style={{textAlign:"right"}}>{ip.listed?<div style={{fontSize:13,fontWeight:800,fontFamily:"monospace",color:ip.currentPrice>=ip.listPrice?G:R}}>{fm(ip.currentPrice)}</div>:<div><div style={{fontSize:12,fontWeight:700,color:DK}}>{fm(ip.priceRange[0])}–{fm(ip.priceRange[1])}</div></div>}</div>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:6}}>
              <div style={{flex:1,background:"#f8fbf8",borderRadius:7,padding:"5px 6px",textAlign:"center"}}><div style={{fontSize:8,color:"#aaa",marginBottom:1}}>Demand</div><div style={{fontSize:11,fontWeight:800,color:overColor}}>{ip.oversubscribed.toFixed(1)}×</div></div>
              <div style={{flex:1,background:"#f8fbf8",borderRadius:7,padding:"5px 6px",textAlign:"center"}}><div style={{fontSize:8,color:"#aaa",marginBottom:1}}>Revenue</div><div style={{fontSize:11,fontWeight:800,color:DK}}>{fm(ip.financials.rev)}</div></div>
              <div style={{flex:1,background:"#f8fbf8",borderRadius:7,padding:"5px 6px",textAlign:"center"}}><div style={{fontSize:8,color:"#aaa",marginBottom:1}}>Growth</div><div style={{fontSize:11,fontWeight:800,color:G}}>{pc(ip.financials.growth*100)}</div></div>
              <div style={{flex:1,background:isOpen?"#E3F2FD":"#f8fbf8",borderRadius:7,padding:"5px 6px",textAlign:"center",border:isOpen?"1px solid #90CAF9":"none"}}><div style={{fontSize:8,color:"#aaa",marginBottom:1}}>Status</div><div style={{fontSize:10,fontWeight:800,color:ip.listed?"#888":isOpen?BL:"#aaa"}}>{ip.listed?"Listed":isOpen?"OPEN":"T"+ip.opens}</div></div>
            </div>
            {(ip.allocated||0)>0&&!ip.listed&&<div style={{fontSize:11,color:BL,fontWeight:700}}>📋 {(ip.allocated||0).toLocaleString()} shares booked</div>}
            {ip.listed&&(ip.allocated||0)>0&&<div style={{fontSize:11,color:G,fontWeight:700}}>✅ Listed @ {fm(ip.listPrice)} · Now: {fm(ip.currentPrice)}</div>}
          </div>;
        })}
      </>}

      {/* IPO DETAIL */}
      {tab==="ipod"&&(()=>{
        const ip=selIPO?d.ipos.find(x=>x.id===selIPO.id)||selIPO:null;
        if(!ip)return <div style={{padding:40,textAlign:"center",color:"#aaa",fontSize:14}}>← Select an IPO</div>;
        const mid=(ip.priceRange[0]+ip.priceRange[1])/2;
        const turnsTo=ip.opens-d.turn;
        const canBook=!ip.listed&&turnsTo>=0;
        const maxShares=Math.floor(d.cash/mid);
        const presets=[100,500,1000,5000,10000,maxShares].filter((v,i2,a)=>v<=maxShares&&v>0&&a.indexOf(v)===i2).sort((a,b)=>a-b).slice(-5);
        return <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"linear-gradient(135deg,#E65100,#F57F17)",borderRadius:14,padding:16,color:"#fff"}}>
            <div style={{fontSize:10,opacity:.7,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{ip.sector} · {ip.planet} Exchange · {ip.id}</div>
            <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>{ip.n}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
              {[["Price Range",fm(ip.priceRange[0])+"–"+fm(ip.priceRange[1])],["Demand",ip.oversubscribed.toFixed(1)+"× subscribed"],["Opens","Turn "+ip.opens+(turnsTo>0?" ("+turnsTo+"t)":"")]].map(([k,v])=><div key={k} style={{background:"rgba(255,255,255,.15)",borderRadius:8,padding:"7px 6px"}}><div style={{fontSize:8,opacity:.7,marginBottom:1}}>{k}</div><div style={{fontSize:10,fontWeight:700}}>{v}</div></div>)}
            </div>
            <div style={{fontSize:12,opacity:.9,lineHeight:1.5}}>{ip.desc}</div>
          </div>
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Leadership & Funding</div>
            <div style={{display:"flex",gap:6}}>
              {[["Founder",ip.founder],["Backed by",ip.fundedBy],["Stage",ip.stage]].map(([k,v])=><div key={k} style={{flex:1,background:"#f8fbf8",borderRadius:7,padding:"7px 6px"}}><div style={{fontSize:8,color:"#aaa",marginBottom:2}}>{k}</div><div style={{fontSize:10,fontWeight:600,color:DK}}>{v}</div></div>)}
            </div>
          </div>
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Analyst Views</div>
            {ip.analysts.map((a,i)=><div key={i} style={{padding:"9px 0",borderBottom:i<ip.analysts.length-1?"1px solid #f5f5f5":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><span style={{fontSize:12,fontWeight:700,color:DK}}>{a.firm}</span><div style={{display:"flex",gap:6}}><span style={{background:a.view.includes("BUY")?"#14532D":"#78350F",color:a.view.includes("BUY")?"#BBF7D0":"#FDE68A",padding:"2px 7px",borderRadius:10,fontSize:9,fontWeight:700}}>{a.view}</span><span style={{fontSize:11,color:G,fontWeight:700,fontFamily:"monospace"}}>Tgt {fm(a.target)}</span></div></div>
              <div style={{fontSize:11,color:"#888",lineHeight:1.5}}>{a.note}</div>
            </div>)}
          </div>
          {canBook&&<div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:4}}>Book Shares · Opens Turn {ip.opens}{turnsTo>0?" ("+turnsTo+" turns away)":""}</div>
            <div style={{fontSize:11,color:"#888",marginBottom:10}}>Mid: {fm(mid)} · Cash: {fm(d.cash)} · Typical allocation: 85% of booked</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:8}}>
              {presets.map(v=><button key={v} onClick={()=>setIpoAmt(ipoAmt===v?null:v)} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(ipoAmt===v?AU:"#e0e0e0"),background:ipoAmt===v?"#FFF8E1":"#fafafa",color:ipoAmt===v?AU:"#555",fontWeight:700,fontSize:11,cursor:"pointer",textAlign:"center"}}><div>{v.toLocaleString()}</div><div style={{fontSize:9,color:ipoAmt===v?AU:"#aaa",marginTop:1}}>{fm(v*mid)}</div></button>)}
            </div>
            <button onClick={()=>{if(!ipoAmt)return;bookIPO(ip,ipoAmt);}} disabled={!ipoAmt} style={{width:"100%",background:ipoAmt?AU:"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:12,cursor:ipoAmt?"pointer":"not-allowed"}}>{ipoAmt?"Book "+ipoAmt.toLocaleString()+" shares · Est. "+fm(ipoAmt*mid):"Select shares above"}</button>
          </div>}
          {ip.listed&&<div style={{background:"#E8F5E9",borderRadius:11,padding:12,border:"1px solid #A5D6A7"}}>
            <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:4}}>✅ Listed at {fm(ip.listPrice)}</div>
            <div style={{fontSize:12,color:"#555"}}>Current: {fm(ip.currentPrice)} · {ip.currentPrice>=ip.listPrice?"+"+fm(ip.currentPrice-ip.listPrice)+" above IPO":"BELOW IPO by "+fm(ip.listPrice-ip.currentPrice)}</div>
            {(ip.allocated||0)>0&&<div style={{fontSize:11,color:"#888",marginTop:4}}>Your {(ip.allocated||0).toLocaleString()} booked shares sold at listing: {fm((ip.allocated||0)*ip.listPrice)}</div>}
          </div>}
        </div>;
      })()}

      {/* PLANET SOVEREIGN FUNDS */}
      {tab==="funds"&&<>
        <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:14,padding:14,color:"#fff"}}>
          <div style={{fontSize:16,fontWeight:800,marginBottom:4}}>🌍 Planet Sovereign Funds</div>
          <div style={{fontSize:12,opacity:.85,lineHeight:1.6}}>Each planet runs its own sovereign fund backed by its primary industry. Deposit earns interest every single turn. Higher rate = higher risk.</div>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            {[["Total Deposited",fm(fundVal)],["Earned",fm(fundEarned)],["Per Turn",fm(Math.round(d.funds.reduce((x,f)=>x+f.deposit*(f.rate/100/365),0)*100)/100)]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.15)",borderRadius:8,padding:"7px 8px",textAlign:"center"}}><div style={{fontSize:9,opacity:.7,marginBottom:1}}>{k}</div><div style={{fontSize:13,fontWeight:800}}>{v}</div></div>)}
          </div>
        </div>
        {d.funds.map(f=>{
          const live=d.funds.find(x=>x.id===f.id);
          const perTurn=Math.round((live.deposit||0)*(f.rate/100/365)*100)/100;
          return <div key={f.id} style={{background:"#fff",borderRadius:13,padding:13,border:"2px solid "+(live.deposit>0?f.color+"44":"#e8ebe8")}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{fontSize:18}}>{f.ico}</span><div><div style={{fontSize:13,fontWeight:700,color:DK}}>{f.n}</div><div style={{fontSize:10,color:"#888"}}>{f.currency} · {f.rate}%/yr · {fm(f.aum)} AUM</div></div></div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,color:f.color,fontFamily:"monospace"}}>{f.rate}%</div><div style={{fontSize:10,color:"#aaa"}}>annual</div></div>
            </div>
            <div style={{fontSize:11,color:"#666",marginBottom:10,lineHeight:1.5}}>{f.desc}</div>
            {live.deposit>0&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:10}}>
              <div style={{display:"flex",gap:6}}>
                {[["Deposited",fm(live.deposit)],["Per Turn",fm(perTurn)],["Total Earned",fm(live.totalEarned)]].map(([k,v])=><div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:700,color:f.color}}>{v}</div></div>)}
              </div>
            </div>}
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{setSelFund(f);setFundAmt(null);}} style={{flex:2,background:f.color,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Deposit to {f.planet} Fund</button>
              {live.deposit>0&&<button onClick={()=>withdrawFund(f)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Withdraw</button>}
            </div>
          </div>;
        })}
      </>}

      {/* PORTFOLIO */}
      {tab==="port"&&<>
        <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",borderRadius:14,padding:14,color:"#fff"}}>
          <div style={{fontSize:11,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Portfolio</div>
          <div style={{fontSize:26,fontWeight:800,fontFamily:"monospace",marginBottom:6}}>{fm(nw)}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[["Cash",fm(d.cash)],["ETFs",fm(etfVal)],["Funds",fm(fundVal)],["Earned",fm(fundEarned)]].map(([k,v])=><div key={k} style={{background:"rgba(255,255,255,.1)",borderRadius:8,padding:"6px 10px"}}><div style={{fontSize:9,opacity:.6,marginBottom:1}}>{k}</div><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{v}</div></div>)}
          </div>
        </div>
        {d.etfs.filter(e=>e.units>0).length>0&&<div style={{background:"#fff",borderRadius:13,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          <div style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:DK}}>ETF Holdings</div>
          {d.etfs.filter(e=>e.units>0).map(e=>{const v=e.units*e.price,pl=(e.price-e.avgCost)*e.units;return <div key={e.id} style={{padding:"10px 14px",borderTop:"1px solid #f5f5f5"}}>
            <div onClick={()=>{setSelETF({...e});setTab("etfd");}} style={{display:"flex",justifyContent:"space-between",marginBottom:8,cursor:"pointer"}}>
              <div><div style={{fontSize:12,fontWeight:700,color:DK}}>{e.n}</div><div style={{fontSize:10,color:"#888"}}>{e.units.toLocaleString()} units · avg {fm(e.avgCost)}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{fm(v)}</div><div style={{fontSize:10,fontFamily:"monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</div></div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{setSelETF({...e});setTrMode("buy");setTrAmt(null);setTab("etfd");}} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Buy More</button>
              <button onClick={()=>{setSelETF({...e});setTrMode("sell");setTrAmt(null);setTab("etfd");}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell</button>
            </div>
          </div>;})}
        </div>}
        {d.funds.filter(f=>f.deposit>0).length>0&&<div style={{background:"#fff",borderRadius:13,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          <div style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:DK}}>Planet Sovereign Funds</div>
          {d.funds.filter(f=>f.deposit>0).map(f=><div key={f.id} style={{padding:"10px 14px",borderTop:"1px solid #f5f5f5"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{fontSize:12,fontWeight:700,color:DK}}>{f.ico} {f.n}</div><div style={{fontSize:12,fontWeight:700,color:f.color,fontFamily:"monospace"}}>{fm(f.deposit)}</div></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontSize:10,color:"#888"}}>{f.rate}%/yr · {fm(Math.round(f.deposit*(f.rate/100/365)*100)/100)}/turn</div><div style={{fontSize:10,color:G}}>Earned: {fm(f.totalEarned)}</div></div>
          </div>)}
        </div>}
        {d.ipos.filter(ip=>ip.allocated>0).length>0&&<div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>IPO Bookings</div>
          {d.ipos.filter(ip=>ip.allocated>0).map(ip=><div key={ip.id} style={{padding:"6px 0",borderBottom:"1px solid #f5f5f5"}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,fontWeight:700,color:DK}}>{ip.n}</span><span style={{fontSize:11,color:ip.listed?G:AU,fontWeight:700}}>{ip.listed?"Listed":"T"+ip.opens}</span></div><div style={{fontSize:10,color:"#888"}}>{(ip.allocated||0).toLocaleString()} shares · Est. {fm((ip.allocated||0)*(ip.priceRange[0]+ip.priceRange[1])/2)}</div></div>)}
        </div>}
        {d.news.length>0&&<div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Recent Events</div>
          {d.news.slice(0,5).map(n=><div key={n.id} style={{padding:"7px 0",borderBottom:"1px solid #f5f5f5",display:"flex",gap:8}}><div style={{width:4,borderRadius:2,background:n.g?G:R,flexShrink:0,alignSelf:"stretch"}}/><div><div style={{fontSize:10,color:"#aaa"}}>T{n.t} {n.ico}</div><div style={{fontSize:12,fontWeight:600,color:DK}}>{n.ti}</div><div style={{fontSize:11,color:"#666"}}>{n.bo}</div></div></div>)}
        </div>}
      </>}
    </div>

    {/* Deposit modal */}
    {selFund&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setSelFund(null)}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
        <div style={{width:36,height:5,background:"#e0e0e0",borderRadius:3,margin:"0 auto 14px"}}/>
        <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:4}}>{selFund.ico} Deposit to {selFund.n}</div>
        <div style={{fontSize:12,color:"#888",marginBottom:12}}>{selFund.rate}%/yr · 2% deposit fee · Cash: {fm(d.cash)} · Min $50K</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
          {[50000,100000,500000,1000000,5000000,10000000,Math.floor(d.cash*.25/1000)*1000,Math.floor(d.cash*.50/1000)*1000].filter((v,i2,a)=>v<=d.cash&&v>=50000&&a.indexOf(v)===i2).sort((a,b)=>a-b).slice(-8).map(v=><button key={v} onClick={()=>setFundAmt(fundAmt===v?null:v)} style={{padding:"11px 4px",borderRadius:10,border:"2px solid "+(fundAmt===v?selFund.color:"#e0e0e0"),background:fundAmt===v?selFund.color+"22":"#fafafa",color:fundAmt===v?selFund.color:"#555",fontWeight:700,fontSize:10,cursor:"pointer",textAlign:"center"}}><div>{fm(v)}</div></button>)}
        </div>
        {fundAmt&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>Gross</span><span style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{fm(fundAmt)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>2% fee</span><span style={{fontSize:12,fontWeight:700,color:R,fontFamily:"monospace"}}>−{fm(Math.round(fundAmt*.02*100)/100)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontSize:12,color:"#666"}}>Net deposited</span><span style={{fontSize:12,fontWeight:700,color:G,fontFamily:"monospace"}}>{fm(Math.round(fundAmt*.98*100)/100)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:12,color:"#666"}}>Return/turn</span><span style={{fontSize:12,fontWeight:700,color:selFund.color,fontFamily:"monospace"}}>{fm(Math.round(fundAmt*.98*selFund.rate/100/365*100)/100)}</span></div>
        </div>}
        <button onClick={()=>{if(fundAmt)depositFund(selFund,fundAmt);setSelFund(null);}} disabled={!fundAmt} style={{width:"100%",background:fundAmt?selFund.color:"#e0e0e0",color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:800,fontSize:14,cursor:fundAmt?"pointer":"not-allowed"}}>Deposit{fundAmt?" "+fm(fundAmt):""}</button>
      </div>
    </div>}
    {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:toast.g?G:R,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,zIndex:400,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>{toast.msg}</div>}
    <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
  </div>;
}
