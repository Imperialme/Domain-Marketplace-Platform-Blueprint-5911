import{useState,useRef,useCallback,useEffect}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const pc=n=>(n>=0?"+":"")+n.toFixed(2)+"%";
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);

const ETFS=[
  {id:"GSFE",n:"GalacticSpace Global Equity",type:"Equity",aum:48500000000,expense:.12,holdings:["SLKT","MDCR","TNPT","FRMN","UTLS"],price:142.50,div:1.8,sharpe:1.42,maxDD:-.18,bench:"MSCI World",ytd:.142,oneY:.218,threeY:.412,
   desc:"Diversified global equity exposure across 15 Earth companies. Low cost, broad market access.",
   top5:[{t:"SLKT",w:.18},{t:"MDCR",w:.14},{t:"TNPT",w:.12},{t:"FRMN",w:.09},{t:"UTLS",w:.08}]},
  {id:"GSFT",n:"GalacticSpace Tech Focus",type:"Sector",aum:12800000000,expense:.25,holdings:["SLKT","EMTS","MDCR"],price:89.40,div:.4,sharpe:1.85,maxDD:-.28,bench:"NASDAQ-100",ytd:.285,oneY:.412,threeY:.892,
   desc:"Concentrated technology exposure. Higher volatility, higher potential. Growth-oriented.",
   top5:[{t:"SLKT",w:.35},{t:"EMTS",w:.28},{t:"MDCR",w:.22},{t:"AXMB",w:.10},{t:"OTHER",w:.05}]},
  {id:"GSFD",n:"GalacticSpace Dividend Income",type:"Income",aum:32100000000,expense:.18,holdings:["UTLS","TLCM","RLST","AGRO","MRDB"],price:58.20,div:4.8,sharpe:1.12,maxDD:-.09,bench:"FTSE High Div",ytd:.048,oneY:.092,threeY:.189,
   desc:"High dividend yield strategy. 4.8% annual distribution. Defensive income play.",
   top5:[{t:"UTLS",w:.22},{t:"TLCM",w:.20},{t:"RLST",w:.18},{t:"AGRO",w:.15},{t:"MRDB",w:.12}]},
  {id:"GSFM",n:"GalacticSpace Mining & Resources",type:"Sector",aum:8900000000,expense:.32,holdings:["FRMN","TNPT","AGRO"],price:34.80,div:.9,sharpe:.92,maxDD:-.35,bench:"S&P Resources",ytd:-.028,oneY:.148,threeY:.312,
   desc:"Commodities and resources exposure. Cyclical. Benefits from inflation and supply shocks.",
   top5:[{t:"FRMN",w:.32},{t:"TNPT",w:.28},{t:"AGRO",w:.18},{t:"OTHER",w:.22}]},
  {id:"GSFP",n:"GalacticSpace Planet Gateway",type:"Thematic",aum:5200000000,expense:.45,holdings:["SLKT","FRMN","MDCR"],price:28.60,div:.2,sharpe:1.65,maxDD:-.42,bench:"Custom Planet Index",ytd:.412,oneY:.680,threeY:null,
   desc:"Access to companies positioned for space economy expansion. Mars, Jupiter and Venus sector exposure.",
   top5:[{t:"SLKT",w:.25},{t:"FRMN",w:.20},{t:"MDCR",w:.15},{t:"EMTS",w:.15},{t:"OTHER",w:.25}]},
];

const IPOS=[
  {id:"NVRA",n:"NovaMed Robotics",sector:"Healthcare",shares:50000000,priceRange:[18,22],bookings:285,oversubscribed:5.7,opens:15,desc:"AI-powered surgical robots. 40 hospitals signed. Revenue $180M growing 85% YoY.",founder:"Dr. James Koh, ex-Johns Hopkins",fundedBy:"Sequoia, a16z",stage:"Series D → IPO",
   financials:{rev:180000000,growth:.85,margin:.28,debt:45000000},
   analysts:[{firm:"Leerink",view:"STRONG BUY",target:28,note:"Disruptive. TAM $45B. Founder has built two successful medtech exits."},{firm:"JPMorgan",view:"BUY",target:25,note:"Strong unit economics. Hospital pipeline highly visible."}]},
  {id:"CLDB",n:"CloudBase Systems",sector:"Technology",shares:80000000,priceRange:[12,15],bookings:142,oversubscribed:1.8,opens:8,desc:"Edge computing infrastructure. 2,400 enterprise clients. Revenue $420M.",founder:"Priya Sharma, ex-Google Cloud",fundedBy:"Tiger Global, Softbank",stage:"Series E → IPO",
   financials:{rev:420000000,growth:.42,margin:.18,debt:120000000},
   analysts:[{firm:"Morgan Stanley",view:"BUY",target:18,note:"Growing fast. Edge computing is structural trend."},{firm:"Goldman",view:"HOLD",target:15,note:"Good company. Valuation fair at midpoint. Wait for post-IPO clarity."}]},
  {id:"GRNX",n:"GreenX Energy",sector:"Energy",shares:120000000,priceRange:[8,11],bookings:98,oversubscribed:0.8,opens:22,desc:"Green hydrogen production. 12 government contracts. Revenue $95M.",founder:"Erik Hansen, ex-Shell",fundedBy:"European Climate Fund",stage:"Series C → IPO",
   financials:{rev:95000000,growth:.65,margin:.12,debt:280000000},
   analysts:[{firm:"Berenberg",view:"SPECULATIVE BUY",target:14,note:"Hydrogen is the future. But near-term path to profitability unclear."},{firm:"Exane",view:"HOLD",target:9,note:"Undersubscribed is a yellow flag. Wait."}]},
  {id:"LOGX",n:"LogiXpress Freight",sector:"Logistics",shares:60000000,priceRange:[24,28],bookings:320,oversubscribed:5.3,opens:5,desc:"AI freight matching. 18,000 trucking partners. Revenue $890M profitable.",founder:"Marcus Chen, serial entrepreneur",fundedBy:"Coatue, General Atlantic",stage:"Series D → IPO",
   financials:{rev:890000000,growth:.38,margin:.22,debt:60000000},
   analysts:[{firm:"William Blair",view:"STRONG BUY",target:35,note:"Profitable, growing, asset-light. Rare combination. Prime IPO."},{firm:"Needham",view:"BUY",target:32,note:"Strong booking demand confirms institutional conviction."}]},
];

export default function ETFIPOSim(){
  const[tab,setTab]=useState("etf");
  const[selETF,setSelETF]=useState(null);
  const[selIPO,setSelIPO]=useState(null);
  const[speed,setSpeed]=useState(1);
  const[auto,setAuto]=useState(false);
  const speedRef=useRef(1);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  const aRef=useRef(null);
  const[toast,setToast]=useState(null);
  const[trAmt,setTrAmt]=useState(null);
  const[ipoAmt,setIpoAmt]=useState(null);
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2800);},[]);

  const S=useRef(null);
  if(!S.current){S.current={
    turn:1,cash:1000000,
    etfs:ETFS.map(e=>({...e,units:0,avgCost:e.price,hist:[e.price,e.price],ch:0})),
    ipos:IPOS.map(ip=>({...ip,status:"open",allocated:0,listed:false,listPrice:null,currentPrice:null})),
    portfolio:{etfValue:0,ipoValue:0},
    news:[{id:1,t:1,ico:"📊",ti:"ETF & IPO Markets Open",bo:"5 ETFs available for purchase. 4 IPOs in pipeline. Use analytics to compare ETF metrics and assess IPO demand.",g:true}],
    divLog:[],
  };}
  const[D,setD]=useState(()=>({...S.current}));
  const refresh=useCallback(()=>setD({...S.current}),[]);

  const advance=useCallback(()=>{
    const s=S.current;s.turn++;
    const nn=[];
    // Step ETF prices
    s.etfs=s.etfs.map(e=>{
      const move=1+(Math.random()-.5)*.06*(e.type==="Thematic"?1.8:e.type==="Sector"?1.4:1.0);
      const np=Math.max(1,Math.round(e.price*move*100)/100);
      return{...e,pp:e.price,price:np,ch:(np-e.price)/e.price,hist:[...e.hist.slice(-50),np]};
    });
    // ETF dividends every 30 turns
    if(s.turn%30===0){
      let totDiv=0;
      s.etfs.forEach(e=>{if(e.units>0){const d=Math.round(e.price*(e.div/100/4)*e.units*100)/100;if(d>0){totDiv+=d;s.cash=Math.round((s.cash+d)*100)/100;}}});
      if(totDiv>0)nn.push({id:Math.random(),t:s.turn,ico:"💰",ti:"ETF Distributions: "+fm(totDiv),bo:"Quarterly income from dividend ETFs credited to cash.",g:true});
    }
    // IPO listings
    s.ipos=s.ipos.map(ip=>{
      if(!ip.listed&&s.turn>=ip.opens){
        const midPrice=(ip.priceRange[0]+ip.priceRange[1])/2;
        const listPrice=Math.round(midPrice*(ip.oversubscribed>3?1.2:ip.oversubscribed>1?1.05:.95)*100)/100;
        const allocated=Math.round(ip.allocated*0.85); // 85% allocation typical in oversubscribed
        nn.push({id:Math.random(),t:s.turn,ico:"🚀",ti:"IPO LISTING: "+ip.n+" ("+ip.id+")",bo:"Listed at "+fm(listPrice)+" ("+( listPrice>midPrice?"above":"below")+" midpoint "+fm(midPrice)+"). "+( ip.oversubscribed>3?"Strong debut expected.":ip.oversubscribed>1?"Neutral debut.":"Weak demand — caution."),g:ip.oversubscribed>1});
        if(allocated>0){s.cash=Math.round((s.cash+allocated*listPrice)*100)/100;nn.push({id:Math.random(),t:s.turn,ico:"✅",ti:"IPO Allocation: "+ip.n,bo:allocated.toLocaleString()+" shares allocated @ "+fm(listPrice)+" = "+fm(allocated*listPrice)+" proceeds.",g:true});}
        return{...ip,listed:true,listPrice,currentPrice:listPrice};
      }
      if(ip.listed&&ip.currentPrice){
        const move=1+(Math.random()-.5)*.10;
        const np=Math.max(.50,Math.round(ip.currentPrice*move*100)/100);
        return{...ip,currentPrice:np};
      }
      return ip;
    });
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
    const e=s.etfs.find(x=>x.id===etf.id);
    const prev=e.units;e.units+=units;
    e.avgCost=Math.round(((e.avgCost*prev)+cost)/e.units*100)/100;
    s.cash=Math.round((s.cash-cost)*100)/100;
    toast_("Bought "+units.toLocaleString()+" units of "+etf.n+" @ "+fm(etf.price));refresh();
  };

  const sellETF=(etf,units)=>{
    const s=S.current;const e=s.etfs.find(x=>x.id===etf.id);
    if(units>e.units){toast_("Only "+e.units+" held",false);return;}
    const proc=Math.round(units*etf.price*100)/100;
    const profit=Math.max(0,(etf.price-e.avgCost)*units);
    const cgt=Math.round(profit*.20*100)/100;
    s.cash=Math.round((s.cash+proc-cgt)*100)/100;
    e.units-=units;
    toast_("Sold "+units.toLocaleString()+" units · Proceeds: "+fm(proc)+" · CGT: "+fm(cgt));refresh();
  };

  const bookIPO=(ipo,shares)=>{
    const s=S.current;const ip=s.ipos.find(x=>x.id===ipo.id);
    if(ip.listed){toast_("Already listed",false);return;}
    const est=Math.round(shares*(ipo.priceRange[0]+ipo.priceRange[1])/2*100)/100;
    if(est>s.cash){toast_("Estimated cost "+fm(est)+" exceeds cash",false);return;}
    s.cash=Math.round((s.cash-est)*100)/100;
    ip.allocated+=shares;
    ip.bookings+=1;
    s.news.unshift({id:Math.random(),t:s.turn,ico:"📋",ti:"IPO Booking: "+ipo.n,bo:shares.toLocaleString()+" shares booked @ midpoint "+fm((ipo.priceRange[0]+ipo.priceRange[1])/2)+". Estimated cost: "+fm(est)+". Allocation confirmed at listing.",g:true});
    toast_("Booked "+shares.toLocaleString()+" shares in "+ipo.n+" IPO · Opens T"+ipo.opens);refresh();
  };

  const d=D;
  const etfVal=d.etfs.reduce((x,e)=>x+e.price*e.units,0);
  const nw=d.cash+etfVal;

  const MC=({hist,w=60,h=24})=>{if(!hist||hist.length<2)return null;const mn=Math.min(...hist)*.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={hist[hist.length-1]>=(hist[0]||0)?G:R} strokeWidth="1.8" strokeLinejoin="round"/></svg>;};

  const RatingBar=({label,val,max,color})=><div style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:"#666"}}>{label}</span><span style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color}}>{typeof val==="number"?val.toFixed(2):val}</span></div><div style={{height:4,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,(val/max)*100)+"%",background:color,borderRadius:2}}/></div></div>;

  return <div style={{maxWidth:430,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
    <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",padding:"14px 16px 0",color:"#fff"}}>
      <div style={{fontSize:11,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>SIM FILE 6 — ETF & IPO Markets</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div><div style={{fontSize:20,fontWeight:800}}>Turn {d.turn}</div><div style={{fontSize:12,opacity:.7}}>NW: {fm(nw)} · ETFs: {fm(etfVal)}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:700,fontFamily:"monospace"}}>{fm(d.cash)}</div><div style={{fontSize:10,opacity:.6}}>available cash</div></div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:10}}>
        <button onClick={advance} disabled={auto} style={{flex:2,background:auto?"rgba(255,255,255,.1)":G,color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:12,cursor:auto?"not-allowed":"pointer"}}>▶ Turn</button>
        <button onClick={()=>setAuto(a=>!a)} style={{flex:1,background:auto?"#B71C1C":"rgba(255,255,255,.1)",color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>{auto?"⏹":"Auto"}</button>
        {[.5,1,5,10].map(s=><button key={s} onClick={()=>setSpeed(s)} style={{flex:1,background:speed===s?"rgba(255,255,255,.25)":"rgba(255,255,255,.1)",color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer"}}>{s<1?".5s":s+"s"}</button>)}
      </div>
      <div style={{display:"flex",gap:0}}>
        {[{id:"etf",l:"ETFs"},{id:"etfdetail",l:"ETF Detail"},{id:"ipo",l:"IPOs"},{id:"ipodetail",l:"IPO Detail"},{id:"port",l:"Portfolio"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 3px",border:"none",borderBottom:"3px solid "+(tab===t.id?"#fff":"transparent"),background:"transparent",color:tab===t.id?"#fff":"rgba(255,255,255,.5)",fontWeight:700,fontSize:9,cursor:"pointer"}}>{t.l}</button>)}
      </div>
    </div>

    <div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
      {/* ETF LIST */}
      {tab==="etf"&&<>
        <div style={{background:"#E3F2FD",borderRadius:11,padding:11,border:"1px solid #BBDEFB",fontSize:12,color:BL,lineHeight:1.6}}>5 ETFs available · Existing funds only (creation is Phase 2) · Lower cost than individual stocks · Quarterly distributions · Click ETF for full analytics</div>
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          {d.etfs.map((e,i)=>{const held=e.units>0;return <div key={e.id} onClick={()=>{setSelETF({...e});setTab("etfdetail");}} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderBottom:i<d.etfs.length-1?"1px solid #f5f5f5":"none",cursor:"pointer"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                <span style={{fontSize:12,fontWeight:700,color:DK}}>{e.n}</span>
                <span style={{background:"#EDE7F6",color:PU,padding:"1px 6px",borderRadius:10,fontSize:9,fontWeight:700}}>{e.type}</span>
              </div>
              <div style={{fontSize:10,color:"#888"}}>AUM {fm(e.aum)} · {e.expense}% TER · {e.div}% div{held?" · "+e.units.toLocaleString()+" held":""}</div>
            </div>
            <MC hist={e.hist}/>
            <div style={{textAlign:"right",minWidth:65}}>
              <div style={{fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{fm(e.price)}</div>
              <div style={{fontSize:10,fontWeight:700,color:e.ch>=0?G:R,fontFamily:"monospace"}}>{e.ch>=0?"+":""}{(e.ch*100).toFixed(2)}%</div>
            </div>
          </div>;})}
        </div>
      </>}

      {/* ETF DETAIL */}
      {tab==="etfdetail"&&(()=>{
        const e=selETF?d.etfs.find(x=>x.id===selETF.id)||selETF:null;
        if(!e)return <div style={{padding:40,textAlign:"center",color:"#aaa",fontSize:14}}>← Select an ETF from the ETF tab</div>;
        const held=e.units>0,val=e.units*e.price,pl=held?(e.price-e.avgCost)*e.units:0;
        const maxUnits=Math.floor(d.cash/e.price);
        const presets=[1,5,10,50,100,500,maxUnits].filter((v,i,a)=>v<=maxUnits&&v>0&&a.indexOf(v)===i).sort((a,b)=>a-b).slice(-6);
        return <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",borderRadius:14,padding:16,color:"#fff"}}>
            <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{e.type} ETF · {e.id}</div>
            <div style={{fontSize:18,fontWeight:800,marginBottom:2}}>{e.n}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
              <div><div style={{fontSize:26,fontWeight:800,fontFamily:"monospace"}}>{fm(e.price)}</div><div style={{fontSize:11,color:e.ch>=0?"#A5D6A7":"#EF9A9A",marginTop:2}}>{e.ch>=0?"▲":"▼"} {(Math.abs(e.ch)*100).toFixed(2)}%</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:11,opacity:.7}}>AUM</div><div style={{fontSize:16,fontWeight:700}}>{fm(e.aum)}</div></div>
            </div>
            <div style={{fontSize:11,opacity:.8,lineHeight:1.5}}>{e.desc}</div>
          </div>
          {/* Analytics */}
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>📊 ETF Analytics</div>
            <RatingBar label="Sharpe Ratio (risk-adjusted return)" val={e.sharpe} max={3} color={e.sharpe>1.5?G:e.sharpe>1?AU:R}/>
            <RatingBar label="Max Drawdown (worst peak-to-trough)" val={Math.abs(e.maxDD)*100} max={50} color={Math.abs(e.maxDD)<.15?G:Math.abs(e.maxDD)<.25?AU:R}/>
            <RatingBar label="Expense Ratio (annual cost)" val={e.expense} max={1} color={e.expense<.2?G:e.expense<.35?AU:R}/>
            <RatingBar label="Dividend Yield" val={e.div} max={7} color={e.div>3?G:e.div>1?AU:R}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:8}}>
              {[["YTD",pc(e.ytd*100)],["1Y",pc(e.oneY*100)],["3Y",e.threeY?pc(e.threeY*100):"N/A"]].map(([k,v])=><div key={k} style={{background:"#f8fbf8",borderRadius:8,padding:"8px 6px",textAlign:"center"}}><div style={{fontSize:9,color:"#aaa",marginBottom:2}}>{k} Return</div><div style={{fontSize:13,fontWeight:800,color:parseFloat(v)>=0?G:R,fontFamily:"monospace"}}>{v}</div></div>)}
            </div>
          </div>
          {/* Top holdings */}
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Top Holdings</div>
            {e.top5.map((h,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f5f5f5"}}>
              <span style={{fontSize:12,color:DK,fontWeight:600}}>{h.t}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:60,height:4,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:(h.w*100).toFixed(0)+"%",background:BL,borderRadius:2}}/></div>
                <span style={{fontSize:11,fontFamily:"monospace",color:"#666",minWidth:35}}>{(h.w*100).toFixed(0)}%</span>
              </div>
            </div>)}
            <div style={{fontSize:10,color:"#aaa",marginTop:8}}>Benchmark: {e.bench}</div>
          </div>
          {held&&<div style={{background:"#E8F5E9",borderRadius:11,padding:12,border:"1px solid #A5D6A7"}}>
            <div style={{fontSize:12,fontWeight:700,color:G,marginBottom:8}}>Your Position</div>
            <div style={{display:"flex",gap:6}}><div style={{flex:1,background:"#fff",borderRadius:7,padding:"7px 8px",textAlign:"center"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>Units</div><div style={{fontSize:12,fontWeight:800,color:DK}}>{e.units.toLocaleString()}</div></div><div style={{flex:1,background:"#fff",borderRadius:7,padding:"7px 8px",textAlign:"center"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>Value</div><div style={{fontSize:12,fontWeight:800,color:DK}}>{fm(val)}</div></div><div style={{flex:1,background:"#fff",borderRadius:7,padding:"7px 8px",textAlign:"center"}}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>P&L</div><div style={{fontSize:12,fontWeight:800,color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</div></div></div>
          </div>}
          {/* Buy/Sell */}
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:8}}>Trade — {fm(e.price)}/unit · Cash: {fm(d.cash)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
              {presets.map(v=><button key={v} onClick={()=>setTrAmt(trAmt===v?null:v)} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(trAmt===v?G:"#e0e0e0"),background:trAmt===v?"#E8F5E9":"#fafafa",color:trAmt===v?G:"#555",fontWeight:700,fontSize:11,cursor:"pointer",textAlign:"center"}}>
                <div>{v>=1000?(v/1000).toFixed(0)+"K":v}</div>
                <div style={{fontSize:9,color:trAmt===v?G:"#aaa",marginTop:1}}>{fm(v*e.price)}</div>
              </button>)}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{if(!trAmt)return;buyETF(e,trAmt);setTrAmt(null);}} disabled={!trAmt} style={{flex:1,background:trAmt?G:"#e0e0e0",color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:12,cursor:trAmt?"pointer":"not-allowed"}}>{trAmt?"Buy "+trAmt+" = "+fm(trAmt*e.price):"Select units"}</button>
              {held&&<button onClick={()=>{sellETF(e,e.units);setTrAmt(null);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:12,cursor:"pointer"}}>Sell All ({e.units})</button>}
            </div>
          </div>
        </div>;
      })()}

      {/* IPO LIST */}
      {tab==="ipo"&&<>
        <div style={{background:"#FFF8E1",borderRadius:11,padding:11,border:"1px solid #FFE082",fontSize:12,color:"#E65100",lineHeight:1.6}}>IPO Pipeline · Book shares before listing · Allocation based on demand · Oversubscribed = harder to get full allocation · Click for full analysis</div>
        {d.ipos.map(ip=>{
          const overColor=ip.oversubscribed>=5?G:ip.oversubscribed>=2?AU:R;
          return <div key={ip.id} onClick={()=>{setSelIPO({...ip});setTab("ipodetail");}} style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8",cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{fontSize:13,fontWeight:700,color:DK}}>{ip.n}</span><span style={{background:"#f0f4f0",color:"#555",padding:"1px 7px",borderRadius:10,fontSize:9,fontWeight:700}}>{ip.sector}</span></div><div style={{fontSize:11,color:"#888"}}>{ip.id} · {ip.listed?"Listed @ "+fm(ip.listPrice):"Opens Turn "+ip.opens}</div></div>
              <div style={{textAlign:"right"}}>{ip.listed?<div style={{fontSize:13,fontWeight:800,fontFamily:"monospace",color:ip.currentPrice>=ip.listPrice?G:R}}>{fm(ip.currentPrice)}</div>:<div><div style={{fontSize:12,fontWeight:700,color:DK}}>{fm(ip.priceRange[0])}–{fm(ip.priceRange[1])}</div><div style={{fontSize:9,color:"#888"}}>Price range</div></div>}</div>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <div style={{flex:1,background:"#f8fbf8",borderRadius:7,padding:"6px 6px",textAlign:"center"}}><div style={{fontSize:8,color:"#aaa",marginBottom:1}}>Demand</div><div style={{fontSize:12,fontWeight:800,color:overColor}}>{ip.oversubscribed.toFixed(1)}×</div></div>
              <div style={{flex:1,background:"#f8fbf8",borderRadius:7,padding:"6px 6px",textAlign:"center"}}><div style={{fontSize:8,color:"#aaa",marginBottom:1}}>Bookings</div><div style={{fontSize:12,fontWeight:800,color:DK}}>{ip.bookings.toLocaleString()}</div></div>
              <div style={{flex:1,background:"#f8fbf8",borderRadius:7,padding:"6px 6px",textAlign:"center"}}><div style={{fontSize:8,color:"#aaa",marginBottom:1}}>Revenue</div><div style={{fontSize:12,fontWeight:800,color:DK}}>{fm(ip.financials.rev)}</div></div>
              <div style={{flex:1,background:"#f8fbf8",borderRadius:7,padding:"6px 6px",textAlign:"center"}}><div style={{fontSize:8,color:"#aaa",marginBottom:1}}>Growth</div><div style={{fontSize:12,fontWeight:800,color:G}}>{pc(ip.financials.growth*100)}</div></div>
            </div>
            <div style={{fontSize:11,color:"#555",lineHeight:1.5}}>{ip.desc}</div>
            {ip.allocated>0&&!ip.listed&&<div style={{marginTop:6,fontSize:11,color:BL,fontWeight:700}}>📋 {ip.allocated.toLocaleString()} shares booked · Opens T{ip.opens}</div>}
            {ip.listed&&ip.allocated>0&&<div style={{marginTop:6,fontSize:11,color:G,fontWeight:700}}>✅ Listed · Your allocation sold at {fm(ip.listPrice)} · {ip.currentPrice>ip.listPrice?"Trading above":"Trading below"} IPO price</div>}
          </div>;
        })}
      </>}

      {/* IPO DETAIL */}
      {tab==="ipodetail"&&(()=>{
        const ip=selIPO?d.ipos.find(x=>x.id===selIPO.id)||selIPO:null;
        if(!ip)return <div style={{padding:40,textAlign:"center",color:"#aaa",fontSize:14}}>← Select an IPO</div>;
        const mid=(ip.priceRange[0]+ip.priceRange[1])/2;
        const maxShares=Math.floor(d.cash/mid);
        const presets=[100,500,1000,5000,10000,maxShares].filter((v,i,a)=>v<=maxShares&&v>0&&a.indexOf(v)===i).sort((a,b)=>a-b).slice(-5);
        return <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"linear-gradient(135deg,#E65100,#F57F17)",borderRadius:14,padding:16,color:"#fff"}}>
            <div style={{fontSize:10,opacity:.7,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{ip.sector} · IPO · {ip.id}</div>
            <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>{ip.n}</div>
            <div style={{fontSize:12,opacity:.9,lineHeight:1.5,marginBottom:10}}>{ip.desc}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
              {[["Price Range",fm(ip.priceRange[0])+"–"+fm(ip.priceRange[1])],["Demand",ip.oversubscribed.toFixed(1)+"× oversubscribed"],["Opens","Turn "+ip.opens]].map(([k,v])=><div key={k} style={{background:"rgba(255,255,255,.15)",borderRadius:8,padding:"7px 8px"}}><div style={{fontSize:8,opacity:.7,marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:700}}>{v}</div></div>)}
            </div>
          </div>
          {/* Founder & backers */}
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Leadership & Backing</div>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              {[["Founder",ip.founder],["Backed by",ip.fundedBy],["Stage",ip.stage]].map(([k,v])=><div key={k} style={{flex:1,background:"#f8fbf8",borderRadius:7,padding:"7px 6px"}}><div style={{fontSize:8,color:"#aaa",marginBottom:2}}>{k}</div><div style={{fontSize:10,fontWeight:600,color:DK}}>{v}</div></div>)}
            </div>
          </div>
          {/* Financials */}
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Key Financials</div>
            {[["Revenue",fm(ip.financials.rev)],["Growth Rate",pc(ip.financials.growth*100)],["Net Margin",pc(ip.financials.margin*100)],["Total Debt",fm(ip.financials.debt)],["Demand",ip.oversubscribed.toFixed(1)+"× oversubscribed ("+ip.bookings+" institutions)"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f5f5f5"}}><span style={{fontSize:12,color:"#666"}}>{k}</span><span style={{fontSize:12,fontWeight:600,color:DK,fontFamily:"monospace"}}>{v}</span></div>)}
          </div>
          {/* Analyst views */}
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Analyst Views</div>
            {ip.analysts.map((a,i)=><div key={i} style={{padding:"9px 0",borderBottom:i<ip.analysts.length-1?"1px solid #f5f5f5":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <span style={{fontSize:12,fontWeight:700,color:DK}}>{a.firm}</span>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{background:a.view==="STRONG BUY"?"#14532D":a.view==="BUY"?"#166534":a.view==="HOLD"?"#78350F":"#7F1D1D",color:a.view==="STRONG BUY"||a.view==="BUY"?"#BBF7D0":a.view==="HOLD"?"#FDE68A":"#FCA5A5",padding:"2px 7px",borderRadius:10,fontSize:9,fontWeight:700}}>{a.view}</span>
                  <span style={{fontSize:11,fontFamily:"monospace",color:G,fontWeight:700}}>Tgt {fm(a.target)}</span>
                </div>
              </div>
              <div style={{fontSize:11,color:"#888",lineHeight:1.5}}>{a.note}</div>
            </div>)}
          </div>
          {/* Book shares */}
          {!ip.listed&&<div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:4}}>Book IPO Shares · Opens Turn {ip.opens}</div>
            <div style={{fontSize:11,color:"#888",marginBottom:10}}>Midpoint: {fm(mid)} · Cash available: {fm(d.cash)} · Allocation at listing (typically 85% of booked)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:8}}>
              {presets.map(v=><button key={v} onClick={()=>setIpoAmt(ipoAmt===v?null:v)} style={{padding:"9px 4px",borderRadius:9,border:"2px solid "+(ipoAmt===v?AU:"#e0e0e0"),background:ipoAmt===v?"#FFF8E1":"#fafafa",color:ipoAmt===v?AU:"#555",fontWeight:700,fontSize:11,cursor:"pointer",textAlign:"center"}}>
                <div>{v.toLocaleString()}</div>
                <div style={{fontSize:9,color:ipoAmt===v?AU:"#aaa",marginTop:1}}>{fm(v*mid)}</div>
              </button>)}
            </div>
            <button onClick={()=>{if(!ipoAmt)return;bookIPO(ip,ipoAmt);setIpoAmt(null);}} disabled={!ipoAmt} style={{width:"100%",background:ipoAmt?AU:"#e0e0e0",color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:12,cursor:ipoAmt?"pointer":"not-allowed"}}>{ipoAmt?"Book "+ipoAmt.toLocaleString()+" shares · Est. cost "+fm(ipoAmt*mid):"Select share count above"}</button>
          </div>}
          {ip.listed&&<div style={{background:"#E8F5E9",borderRadius:11,padding:12,border:"1px solid #A5D6A7"}}>
            <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:4}}>✅ Listed at {fm(ip.listPrice)}</div>
            <div style={{fontSize:12,color:"#555"}}>Current price: {fm(ip.currentPrice)} · {ip.currentPrice>=ip.listPrice?fm(ip.currentPrice-ip.listPrice)+" above IPO price":"BELOW IPO price"}</div>
            {ip.allocated>0&&<div style={{fontSize:11,color:"#888",marginTop:4}}>Your allocation of {ip.allocated.toLocaleString()} shares was sold at listing price {fm(ip.listPrice)} = {fm(ip.allocated*ip.listPrice)} proceeds.</div>}
          </div>}
        </div>;
      })()}

      {/* PORTFOLIO */}
      {tab==="port"&&<>
        <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",borderRadius:14,padding:14,color:"#fff"}}>
          <div style={{fontSize:11,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>ETF Portfolio</div>
          <div style={{fontSize:26,fontWeight:800,fontFamily:"monospace",marginBottom:6}}>{fm(nw)}</div>
          <div style={{display:"flex",gap:8}}>
            {[["Cash",fm(d.cash)],["ETF Value",fm(etfVal)]].map(([k,v])=><div key={k} style={{flex:1,background:"rgba(255,255,255,.1)",borderRadius:8,padding:"6px 10px"}}><div style={{fontSize:9,opacity:.6,marginBottom:1}}>{k}</div><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace"}}>{v}</div></div>)}
          </div>
        </div>
        {d.etfs.filter(e=>e.units>0).length===0?<div style={{padding:20,textAlign:"center",color:"#aaa",fontSize:13,background:"#fff",borderRadius:12,border:"1px solid #e8ebe8"}}>No ETF positions yet. Go to ETFs tab to buy.</div>:d.etfs.filter(e=>e.units>0).map(e=>{const val=e.units*e.price,pl=(e.price-e.avgCost)*e.units;return <div key={e.id} style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div><div style={{fontSize:13,fontWeight:700,color:DK}}>{e.n}</div><div style={{fontSize:10,color:"#888"}}>{e.units.toLocaleString()} units · avg {fm(e.avgCost)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"monospace"}}>{fm(val)}</div><div style={{fontSize:11,fontFamily:"monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</div></div></div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{setSelETF({...e});setTab("etfdetail");}} style={{flex:1,background:"#E3F2FD",color:BL,border:"1px solid #90CAF9",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>View Details</button>
            <button onClick={()=>{sellETF(e,e.units);}} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell All</button>
          </div>
        </div>;})}
        {d.ipos.filter(ip=>ip.allocated>0).length>0&&<div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>IPO Bookings</div>
          {d.ipos.filter(ip=>ip.allocated>0).map(ip=><div key={ip.id} style={{padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,fontWeight:700,color:DK}}>{ip.n} ({ip.id})</span><span style={{fontSize:11,color:ip.listed?G:AU,fontWeight:700}}>{ip.listed?"Listed ✅":"Opens T"+ip.opens}</span></div>
            <div style={{fontSize:10,color:"#888"}}>{ip.allocated.toLocaleString()} shares · {ip.listed?fm(ip.allocated*ip.listPrice)+" received":"Est. "+fm(ip.allocated*(ip.priceRange[0]+ip.priceRange[1])/2)}</div>
          </div>)}
        </div>}
        {/* News */}
        {d.news.length>0&&<div style={{background:"#fff",borderRadius:13,padding:13,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:8}}>Recent Events</div>
          {d.news.slice(0,5).map(n=><div key={n.id} style={{padding:"7px 0",borderBottom:"1px solid #f5f5f5",display:"flex",gap:8}}>
            <div style={{width:4,borderRadius:2,background:n.g?G:R,flexShrink:0,alignSelf:"stretch"}}/>
            <div><div style={{fontSize:10,color:"#aaa"}}>T{n.t} {n.ico}</div><div style={{fontSize:12,fontWeight:600,color:DK}}>{n.ti}</div><div style={{fontSize:11,color:"#666"}}>{n.bo}</div></div>
          </div>)}
        </div>}
      </>}
    </div>
    {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:toast.g?G:R,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,zIndex:400,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>{toast.msg}</div>}
    <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
  </div>;
}
