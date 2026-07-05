import{useState,useRef,useCallback,useEffect}from"react";
const G="#16A34A",R="#DC2626",BL="#1D4ED8",DK="#0F172A",AU="#D97706",PU="#7C3AED",SL="#64748B";
const fm=n=>{const a=Math.abs(n);return(n<0?"-":"")+(a>=1e12?"$"+(a/1e12).toFixed(2)+"T":a>=1e9?"$"+(a/1e9).toFixed(2)+"B":a>=1e6?"$"+(a/1e6).toFixed(2)+"M":a>=1e3?"$"+(a/1e3).toFixed(1)+"K":"$"+a.toFixed(2));};
const pc=n=>(n>=0?"+":"")+n.toFixed(2)+"%";
const cl=(v,a,b)=>Math.min(Math.max(v,a),b);
const PEB={Technology:{mn:15,mx:35},Banking:{mn:8,mx:15},Mining:{mn:6,mx:12},Energy:{mn:8,mx:20},Agriculture:{mn:10,mx:18},Healthcare:{mn:12,mx:35},Manufacturing:{mn:10,mx:25},Utilities:{mn:12,mx:18},"Real Estate":{mn:8,mx:16},Telecom:{mn:10,mx:16},Retail:{mn:10,mx:18}};

const COS=[
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",ip:348.94,pe0:18.4,div:.8,b:1.8,yr:2008,emp:125000,hq:"Singapore",
   ceo:"Dr. Lin Wei",founder:"Dr. Lin Wei",
   origin:"Lin Wei sold his Singapore apartment to fund the first server. Grew from 4 staff in a Jurong shophouse to 125,000 people across 18 countries.",
   ops:"Enterprise cloud, AI chips, cross-border data services. Offices in Singapore, Tokyo, Seoul, Mumbai, Sydney.",
   analysts:[
     {firm:"Goldman Sachs",rating:"STRONG BUY",target:420,note:"Dominant AI infrastructure play. Cloud margins expanding 200bps annually. Initiating at STRONG BUY."},
     {firm:"Morgan Stanley",rating:"BUY",target:395,note:"Valuation stretched but growth justifies premium. Semiconductor design moat is underappreciated."},
     {firm:"JPMorgan",rating:"BUY",target:410,note:"Asia Pacific cloud penetration still only 34%. Massive runway. Enterprise deals accelerating."},
     {firm:"Bernstein",rating:"HOLD",target:360,note:"Great company, fair price. Would add on any pullback below $320. Watching margin pressure."},
     {firm:"Citi",rating:"SELL",target:290,note:"P/E of 18× unjustified given slowing revenue growth. Risk/reward unfavourable at current levels."},
   ]},
  {t:"MRDB",n:"Meridian Bank",s:"Banking",ip:85.20,pe0:12.1,div:2.1,b:.9,yr:1985,emp:45000,hq:"New York",
   ceo:"Patricia Hernandez",founder:"James R. Meridian",
   origin:"James Meridian started as a teller in Brooklyn in 1972. Built one branch into a regional powerhouse through 14 acquisitions. Family holds 12%.",
   ops:"2,400 retail branches across US Midwest and Northeast. Corporate lending, wealth management, mortgage origination.",
   analysts:[
     {firm:"Wells Fargo",rating:"BUY",target:95,note:"NIM expansion in rising rate environment. Loan book quality excellent. 2.1% dividend is reliable."},
     {firm:"Deutsche Bank",rating:"HOLD",target:88,note:"Solid bank, limited upside. Commercial real estate exposure worth monitoring."},
     {firm:"Barclays",rating:"HOLD",target:86,note:"In-line with sector. Prefer banks with more capital market exposure. Neutral."},
   ]},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",ip:15.80,pe0:8.5,div:.5,b:1.6,yr:2005,emp:28000,hq:"Johannesburg",
   ceo:"Amara Diallo",founder:"Kwame Asante",
   origin:"Ghanaian geologist Kwame Asante discovered a rare earth deposit in rural Ghana while working for a junior explorer. Listed on JSE in 2009.",
   ops:"Iron ore in Mauritania, lithium in Zimbabwe, rare earths in DRC. Direct supply to Asian battery manufacturers.",
   analysts:[
     {firm:"Standard Bank",rating:"BUY",target:22,note:"Lithium reserve base severely undervalued. EV demand structural. 40% upside to our target."},
     {firm:"Nedbank Capital",rating:"BUY",target:20,note:"DRC expansion on track. Rare earth certification adds pricing power."},
     {firm:"Investec",rating:"HOLD",target:17,note:"Good company but commodity cycle risk is real. Hold and reassess at year-end."},
   ]},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",ip:351.54,pe0:11.3,div:1.8,b:1.2,yr:1995,emp:62000,hq:"Dubai",
   ceo:"Sheikh Rashid Al-Mansouri",founder:"Al-Mansouri family",
   origin:"Established as a private trading company by the Al-Mansouri family of Abu Dhabi in 1995. Listed on DFM in 2003.",
   ops:"Crude production in UAE, Kuwait and Oman. Pipeline infrastructure across Kazakhstan. Refinery operations in Oman.",
   analysts:[
     {firm:"HSBC MENA",rating:"HOLD",target:360,note:"Oil price dependency limits upside. Dividend coverage comfortable. Neutral."},
     {firm:"Emirates NBD",rating:"BUY",target:390,note:"Upstream cost structure among lowest globally. FCF yield attractive at 8.2%."},
     {firm:"Arqaam Capital",rating:"SELL",target:310,note:"Energy transition risk underpriced. Long-term structural decline in oil demand. Reduce."},
   ]},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",ip:198.40,pe0:22.1,div:1.2,b:.8,yr:2005,emp:38000,hq:"Boston",
   ceo:"Dr. Sarah Chen",founder:"Dr. Marcus Webb",
   origin:"Harvard oncologist Dr. Marcus Webb licensed his tumour-targeting patent in 2005. Built from IP licensing into hospital management.",
   ops:"180 hospitals, 400 diagnostic labs across North America. 3 oncology drugs in Phase 3 FDA trials.",
   analysts:[
     {firm:"Leerink Partners",rating:"STRONG BUY",target:240,note:"Phase 3 data transformational if successful. Pipeline alone worth more than current market cap."},
     {firm:"Cantor Fitzgerald",rating:"BUY",target:225,note:"Hospital management cashflows fund the pipeline. Lower risk than pure biotech."},
     {firm:"UBS Healthcare",rating:"BUY",target:215,note:"Defensive growth at reasonable valuation. Dividend growing."},
     {firm:"RBC Capital",rating:"HOLD",target:195,note:"Phase 3 binary risk in 6 months. Prefer to wait for data before adding."},
   ]},
  {t:"UTLS",n:"Utility Systems",s:"Utilities",ip:58.40,pe0:14.2,div:4.2,b:.5,yr:1950,emp:12000,hq:"Chicago",
   ceo:"Robert Keller",founder:"Chicago City Council",
   origin:"Created by Chicago City Council in 1950. Privatised in 1987. Regulated monopoly — rate increases require state approval.",
   ops:"Electric grid for 1.9M customers. Gas to 1.3M customers across US Midwest. 3 nuclear plants.",
   analysts:[
     {firm:"Mizuho",rating:"BUY",target:63,note:"4.2% yield with regulatory moat. Safe haven in volatile markets."},
     {firm:"KeyBanc",rating:"HOLD",target:59,note:"Fair value. Yield attractive but growth is zero. For income investors only."},
   ]},
  {t:"TLCM",n:"TeleCom Europe",s:"Telecom",ip:88.60,pe0:13.5,div:4.5,b:.6,yr:1985,emp:48000,hq:"Frankfurt",
   ceo:"Klaus Hoffman",founder:"West German government",
   origin:"Emerged from privatisation of West Germany's postal telephone monopoly in 1985. 22 acquisitions made it pan-European.",
   ops:"Mobile, broadband and enterprise telecoms across 22 European countries. 280M subscribers. Europe's largest 5G network.",
   analysts:[
     {firm:"Berenberg",rating:"HOLD",target:92,note:"5G rollout complete. 4.5% dividend is the thesis. Growth nil."},
     {firm:"Exane BNP",rating:"SELL",target:78,note:"Spectrum auction costs incoming. Dividend at risk if FCF deteriorates."},
   ]},
  {t:"RLST",n:"RealEstate Trust",s:"Real Estate",ip:44.20,pe0:12.8,div:3.8,b:.7,yr:1995,emp:2800,hq:"Dallas",
   ceo:"Michael Johnson",founder:"Texas pension funds",
   origin:"Created by Texas pension funds in 1995. Pivoted to logistics warehouses in 2018 — decision that tripled net asset value.",
   ops:"$18B portfolio. 40% logistics warehouses, 35% industrial, 25% office. Sun Belt focus.",
   analysts:[
     {firm:"Green Street",rating:"BUY",target:52,note:"Best-in-class logistics REIT. E-commerce structural demand. 3.8% yield safe."},
     {firm:"BTIG",rating:"BUY",target:50,note:"Sun Belt exposure is premium real estate. Office drag manageable."},
     {firm:"Piper Sandler",rating:"HOLD",target:45,note:"Good REIT, full valuation. Would accumulate below $40."},
   ]},
  {t:"EMTS",n:"Emerging Tech",s:"Technology",ip:28.40,pe0:22.0,div:.2,b:2.0,yr:2015,emp:6500,hq:"Mumbai",
   ceo:"Priya Patel",founder:"Priya Patel",
   origin:"MIT graduate Priya Patel returned to India in 2015 to build enterprise cloud for South Asian SMEs. Sequoia India Series A 2016.",
   ops:"B2B SaaS for 18,000 corporate clients across India, Bangladesh, Sri Lanka, Pakistan. 35% annual growth.",
   analysts:[
     {firm:"Ambit Capital",rating:"STRONG BUY",target:40,note:"Best founder-led EM tech story we cover. TAM $45B, penetration <1%."},
     {firm:"Motilal Oswal",rating:"BUY",target:37,note:"Profitable SaaS in EM is rare. Unit economics exceptional."},
     {firm:"CLSA",rating:"BUY",target:35,note:"Valuation elevated but growth trajectory justifies it. Long-term BUY."},
   ]},
  {t:"AGRO",n:"AgroLatin Corp",s:"Agriculture",ip:42.18,pe0:13.2,div:2.5,b:1.1,yr:1975,emp:18000,hq:"São Paulo",
   ceo:"Isabella Sousa",founder:"Carlos Sousa",
   origin:"Carlos Sousa started on a family farm in Mato Grosso in 1975. Third-generation family ownership.",
   ops:"4.2M hectares across Brazil and Argentina. Soy, corn, sugarcane and cattle exports to 22 countries.",
   analysts:[
     {firm:"Bradesco BBI",rating:"BUY",target:52,note:"Consistent dividend payer. Farmland as hard asset. 2.5% yield reliable."},
     {firm:"BTG Pactual",rating:"HOLD",target:44,note:"Commodity price risk. Good company but timing matters."},
   ]},
];

const RATINGS_ORDER={"STRONG BUY":0,"BUY":1,"HOLD":2,"SELL":3,"SPECULATIVE BUY":1};
const getConsensus=c=>{const counts={};c.analysts.forEach(a=>counts[a.rating]=(counts[a.rating]||0)+1);return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];};
const getAvgTarget=c=>Math.round(c.analysts.reduce((x,a)=>x+a.target,0)/c.analysts.length);
const RatingBadge=({r})=>{const cols={"STRONG BUY":{bg:"#14532D",c:"#86EFAC"},"BUY":{bg:"#166534",c:"#BBF7D0"},"HOLD":{bg:"#92400E",c:"#FDE68A"},"SELL":{bg:"#7F1D1D",c:"#FCA5A5"},"SPECULATIVE BUY":{bg:"#312E81",c:"#A5B4FC"}};const col=cols[r]||{bg:"#374151",c:"#D1D5DB"};return <span style={{background:col.bg,color:col.c,padding:"2px 8px",borderRadius:12,fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>{r}</span>;};

export default function MarketsSim(){
  const[tab,setTab]=useState("market");
  const[sort,setSort]=useState("analyst");
  const[filter,setFilter]=useState("All");
  const[newsTab,setNewsTab]=useState("all");
  const[selCo,setSelCo]=useState(null);
  const[speed,setSpeed]=useState(1);
  const[auto,setAuto]=useState(false);
  const speedRef=useRef(1);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  const aRef=useRef(null);
  const[toast,setToast]=useState(null);
  const[trM,setTrM]=useState(null);
  const[trAmt,setTrAmt]=useState(null);
  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2800);},[]);

  const S=useRef(null);
  if(!S.current){S.current={
    turn:1,cash:1000000,
    cos:COS.map(c=>({...c,price:c.ip,pp:c.ip,pe:c.pe0,ch:0,hist:[c.ip,c.ip]})),
    sh:{},avgSh:{},cgtRate:.20,
    // Sample portfolio positions
    fxPos:{EURUSD:{entry:1.0850,cost:50000,side:"long",currency:"EUR/USD"}},
    bonds:{US10Y:5,AFR5Y:2},
    comm:{OIL:100,GOLD:5},
    news:[
      {id:1,t:1,ico:"🌐",ti:"Markets Open",bo:"Earth Markets live. 10 companies. Sorted by analyst consensus by default.",g:true,mine:false},
      {id:2,t:1,ico:"📊",ti:"Governor Active",bo:"Economic Governor enforcing P/E bounds and margin floors. All 8 rules running.",g:true,mine:false},
      {id:3,t:1,ico:"👔",ti:"CEO Watch: SLKT",bo:"Dr. Lin Wei signals interest in Korean AI acquisition. Analysts watching for announcement.",g:true,mine:false},
    ],
    myNews:[],
    divLog:[],
  };}
  const[D,setD]=useState(()=>({...S.current}));
  const refresh=useCallback(()=>setD({...S.current}),[]);

  const advance=useCallback(()=>{
    const s=S.current;s.turn++;
    const nn=[],myNn=[];
    s.cos=s.cos.map(c=>{
      const pp=c.price,eps=pp/c.pe,bnd=PEB[c.s]||{mn:10,mx:35};
      const move=1+(Math.random()-.5)*.10*c.b;
      let np=cl(Math.round(pp*move*100)/100,pp*.92,pp*1.08);
      if(np/eps<bnd.mn)np=eps*bnd.mn;if(np/eps>bnd.mx)np=eps*bnd.mx;
      np=Math.max(.50,Math.round(np*100)/100);
      if(Math.random()<.04){
        const evts=[
          {ico:"💰",ti:"Earnings Beat",bo:c.n+" beat consensus estimates. Revenue +12% YoY. Analyst upgrades incoming.",g:true,mult:1.04},
          {ico:"📉",ti:"Earnings Miss",bo:c.n+" disappointed. Revenue guidance cut for next quarter.",g:false,mult:.96},
          {ico:"📰",ti:"Analyst Upgrade",bo:c.n+" upgraded to BUY by "+c.analysts[0].firm+". Target raised to "+fm(c.analysts[0].target+20)+".",g:true,mult:1.02},
          {ico:"⚠️",ti:"Regulatory Notice",bo:c.n+" received inquiry from regulator. Under review.",g:false,mult:.97},
          {ico:"🤝",ti:"Partnership Announced",bo:c.n+" signs strategic partnership. Revenue uplift expected.",g:true,mult:1.03},
        ];
        const ev=evts[Math.floor(Math.random()*evts.length)];
        np=Math.round(np*ev.mult*100)/100;
        nn.push({id:Math.random(),t:s.turn,ico:ev.ico,ti:ev.ti+": "+c.n,bo:ev.bo,g:ev.g,mine:false});
        if(s.sh[c.t]>0)myNn.push({id:Math.random(),t:s.turn,ico:ev.ico,ti:"[YOUR HOLDING] "+ev.ti+": "+c.n,bo:ev.bo+" You hold "+s.sh[c.t].toLocaleString()+" shares.",g:ev.g,mine:true});
      }
      return{...c,pp,price:np,pe:Math.round(np/eps*10)/10,ch:(np-pp)/pp,hist:[...c.hist.slice(-50),np]};
    });
    // Dividends every 30 turns
    if(s.turn%30===0){
      let totalDiv=0;const lines=[];
      Object.entries(s.sh).forEach(([t,n])=>{const c=s.cos.find(x=>x.t===t);if(c&&n>0){const d=Math.round(c.price*(c.div/100/4)*n*100)/100;if(d>0){totalDiv+=d;lines.push(c.t+": "+fm(d));}}});
      if(totalDiv>0){
        s.cash=Math.round((s.cash+totalDiv)*100)/100;
        s.divLog=[{turn:s.turn,amount:totalDiv,lines},...(s.divLog||[])].slice(0,20);
        const msg="💰 Quarterly Dividends: "+fm(totalDiv)+" credited. "+lines.slice(0,3).join(", ")+(lines.length>3?" +"+( lines.length-3)+" more":"");
        myNn.push({id:Math.random(),t:s.turn,ico:"💰",ti:"Dividends Received: "+fm(totalDiv),bo:lines.join(" · "),g:true,mine:true});
        nn.push({id:Math.random(),t:s.turn,ico:"💰",ti:"Quarterly Dividends",bo:"Dividends paid to holders with qualifying positions.",g:true,mine:false});
      }
    }
    s.news=[...nn,...s.news].slice(0,60);
    s.myNews=[...myNn,...(s.myNews||[])].slice(0,40);
    refresh();
  },[refresh]);

  useEffect(()=>{
    if(!auto){clearInterval(aRef.current);return;}
    clearInterval(aRef.current);
    aRef.current=setInterval(()=>advance(),speedRef.current*1000);
    return()=>clearInterval(aRef.current);
  },[auto,speed,advance]);

  const d=D;
  const SH=d.sh||{};
  const sv=Object.entries(SH).reduce((x,[t,n])=>{const c=d.cos.find(y=>y.t===t);return x+(c?c.price*n:0);},0);
  const bv=Object.keys(d.bonds||{}).reduce((x,id)=>{const qty=d.bonds[id];return x+(qty*1000);},0);
  const cv=Object.keys(d.comm||{}).reduce((x,id)=>{const qty=d.comm[id];const prices={OIL:85,GOLD:1980,SLVR:23.4,CORN:4.42};return x+(qty*(prices[id]||100));},0);
  const fxv=Object.values(d.fxPos||{}).reduce((x,pos)=>x+(pos.cost||0),0);
  const nw=d.cash+sv+bv+cv+fxv;

  const trade=(item,mode,qty)=>{
    const s=S.current,isBuy=mode==="buy",q=Math.floor(qty);if(q<1)return;
    if(isBuy){
      const cost=Math.round(q*item.price*100)/100;
      if(cost>s.cash){toast_("Need "+fm(cost)+" — have "+fm(s.cash),false);return;}
      const prev=s.sh[item.t]||0;s.sh[item.t]=(prev)+q;
      s.avgSh[item.t]=Math.round(((s.avgSh[item.t]||item.price)*prev+cost)/s.sh[item.t]*100)/100;
      s.cash=Math.round((s.cash-cost)*100)/100;
      s.myNews.unshift({id:Math.random(),t:s.turn,ico:"📈",ti:"Bought "+q.toLocaleString()+" "+item.t,bo:q.toLocaleString()+" shares @ "+fm(item.price)+" · Total: "+fm(cost)+" · Avg cost: "+fm(s.avgSh[item.t]),g:true,mine:true});
      toast_("Bought "+q.toLocaleString()+" "+item.t+" @ "+fm(item.price));
    }else{
      const held=s.sh[item.t]||0;if(q>held){toast_("Only "+held+" held",false);return;}
      const proc=Math.round(q*item.price*100)/100;
      const profit=Math.max(0,(item.price-(s.avgSh[item.t]||item.price))*q);
      const cgt=Math.round(profit*s.cgtRate*100)/100;
      s.cash=Math.round((s.cash+proc-cgt)*100)/100;
      s.sh[item.t]=held-q;if(!s.sh[item.t])delete s.sh[item.t];
      s.myNews.unshift({id:Math.random(),t:s.turn,ico:"📉",ti:"Sold "+q.toLocaleString()+" "+item.t,bo:fm(proc)+" proceeds · CGT: "+fm(cgt)+" ("+Math.round(profit>0?(cgt/proc*100):0)+"%) · Net: "+fm(proc-cgt),g:cgt<proc*.1,mine:true});
      toast_("Sold "+q.toLocaleString()+" "+item.t+" · CGT: "+fm(cgt));
    }
    setTrM(null);setTrAmt(null);refresh();
  };

  // Sort and filter
  let displayed=[...d.cos];
  if(filter!=="All")displayed=displayed.filter(c=>getConsensus(c)===filter);
  if(sort==="price_hi")displayed.sort((a,b)=>b.price-a.price);
  else if(sort==="price_lo")displayed.sort((a,b)=>a.price-b.price);
  else if(sort==="div_hi")displayed.sort((a,b)=>b.div-a.div);
  else if(sort==="div_lo")displayed.sort((a,b)=>a.div-b.div);
  else if(sort==="analyst")displayed.sort((a,b)=>(RATINGS_ORDER[getConsensus(a)]||2)-(RATINGS_ORDER[getConsensus(b)]||2));
  else if(sort==="gain")displayed.sort((a,b)=>b.ch-a.ch);
  else if(sort==="loss")displayed.sort((a,b)=>a.ch-b.ch);

  const MC=({hist,w=68,h=28})=>{if(!hist||hist.length<2)return null;const mn=Math.min(...hist)*.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={hist[hist.length-1]>=(hist[0]||0)?G:R} strokeWidth="1.8" strokeLinejoin="round"/></svg>;};

  const myNewsCount=(d.myNews||[]).length;

  return <div style={{maxWidth:430,margin:"0 auto",background:"#0F172A",minHeight:"100vh",fontFamily:"system-ui,sans-serif",color:"#F8FAFC"}}>
    {/* Header */}
    <div style={{background:"linear-gradient(180deg,#0F172A 0%,#1E293B 100%)",padding:"14px 16px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div><div style={{fontSize:11,color:"#64748B",textTransform:"uppercase",letterSpacing:1.5,marginBottom:2}}>SIM 2 · Earth Markets</div><div style={{fontSize:20,fontWeight:700}}>Turn {d.turn}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:700,color:G,fontFamily:"monospace"}}>{fm(nw)}</div><div style={{fontSize:10,color:"#64748B"}}>Cash {fm(d.cash)} · Stocks {fm(sv)}</div></div>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:10,alignItems:"center"}}>
        <button onClick={advance} disabled={auto} style={{flex:2,background:auto?"#1E293B":G,color:auto?"#475569":"#fff",border:"1px solid "+(auto?"#334155":"transparent"),borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:12,cursor:auto?"not-allowed":"pointer"}}>▶ Turn</button>
        <button onClick={()=>setAuto(a=>!a)} style={{flex:1,background:auto?"#7F1D1D":"#1E293B",color:auto?"#FCA5A5":"#94A3B8",border:"1px solid "+(auto?"#991B1B":"#334155"),borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>{auto?"⏹":"Auto"}</button>
        {[.5,1,5,10].map(s=><button key={s} onClick={()=>setSpeed(s)} style={{flex:1,background:speed===s?"#1D4ED8":"#1E293B",color:speed===s?"#fff":"#64748B",border:"1px solid "+(speed===s?"#1D4ED8":"#334155"),borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:10,cursor:"pointer"}}>{s<1?".5s":s+"s"}</button>)}
      </div>
      <div style={{display:"flex",gap:0}}>
        {[{id:"market",l:"Markets"},{id:"co",l:"Company"},{id:"port",l:"Portfolio"},{id:"news",l:"News"+(myNewsCount>0?" ("+myNewsCount+")":"")}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px",border:"none",borderBottom:"2px solid "+(tab===t.id?G:"transparent"),background:"transparent",color:tab===t.id?"#F8FAFC":"#64748B",fontWeight:600,fontSize:12,cursor:"pointer"}}>{t.l}</button>)}
      </div>
    </div>

    <div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
      {/* MARKET TAB */}
      {tab==="market"&&<>
        {/* Sort */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:2}}>
          <button onClick={()=>setSort("analyst")} style={{padding:"5px 10px",borderRadius:20,border:"1px solid "+(sort==="analyst"?"#16A34A":"#334155"),background:sort==="analyst"?"#14532D":"#1E293B",color:sort==="analyst"?"#86EFAC":"#94A3B8",fontWeight:600,fontSize:10,cursor:"pointer"}}>★ Rating</button>
          <button onClick={()=>setSort(sort==="div_hi"?"div_lo":"div_hi")} style={{padding:"5px 10px",borderRadius:20,border:"1px solid "+(sort.startsWith("div")?"#16A34A":"#334155"),background:sort.startsWith("div")?"#14532D":"#1E293B",color:sort.startsWith("div")?"#86EFAC":"#94A3B8",fontWeight:600,fontSize:10,cursor:"pointer"}}>Div {sort==="div_hi"?"↓":"↑"}</button>
          <button onClick={()=>setSort(sort==="price_hi"?"price_lo":"price_hi")} style={{padding:"5px 10px",borderRadius:20,border:"1px solid "+(sort.startsWith("price")?"#16A34A":"#334155"),background:sort.startsWith("price")?"#14532D":"#1E293B",color:sort.startsWith("price")?"#86EFAC":"#94A3B8",fontWeight:600,fontSize:10,cursor:"pointer"}}>Price {sort==="price_hi"?"↓":"↑"}</button>
          <button onClick={()=>setSort("gain")} style={{padding:"5px 10px",borderRadius:20,border:"1px solid "+(sort==="gain"?"#16A34A":"#334155"),background:sort==="gain"?"#14532D":"#1E293B",color:sort==="gain"?"#86EFAC":"#94A3B8",fontWeight:600,fontSize:10,cursor:"pointer"}}>▲ Gainers</button>
          <button onClick={()=>setSort("loss")} style={{padding:"5px 10px",borderRadius:20,border:"1px solid "+(sort==="loss"?"#DC2626":"#334155"),background:sort==="loss"?"#7F1D1D":"#1E293B",color:sort==="loss"?"#FCA5A5":"#94A3B8",fontWeight:600,fontSize:10,cursor:"pointer"}}>▼ Losers</button>
        </div>
        {/* Filter by rating */}
        <div style={{overflowX:"auto"}}><div style={{display:"flex",gap:5,paddingBottom:3,width:"max-content"}}>
          {["All","STRONG BUY","BUY","HOLD","SELL"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{padding:"5px 10px",borderRadius:20,border:"1px solid "+(filter===f?"#7C3AED":"#334155"),background:filter===f?"#312E81":"#1E293B",color:filter===f?"#A5B4FC":"#64748B",fontWeight:600,fontSize:10,cursor:"pointer",whiteSpace:"nowrap"}}>{f}{f!=="All"?" ("+displayed.filter(c=>filter===f?true:getConsensus(c)===f).length+")":""}</button>)}
        </div></div>
        {displayed.length===0&&<div style={{padding:20,textAlign:"center",color:"#64748B",fontSize:13}}>No companies match this filter.</div>}
        <div style={{background:"#1E293B",borderRadius:12,border:"1px solid #334155",overflow:"hidden"}}>
          {displayed.map((c,i)=>{const consensus=getConsensus(c);const avgT=getAvgTarget(c);const upside=((avgT/c.price-1)*100).toFixed(1);const held=SH[c.t]||0;
            return <div key={c.t} onClick={()=>{setSelCo({...c});setTab("co");}} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:i<displayed.length-1?"1px solid rgba(255,255,255,.05)":"none",cursor:"pointer"}}>
              <div style={{width:36,height:36,borderRadius:9,background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#86EFAC",border:"1px solid #1E3A2E",flexShrink:0}}>{c.t}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2,flexWrap:"wrap"}}><span style={{fontSize:12,fontWeight:600,color:"#F8FAFC"}}>{c.n}</span><RatingBadge r={consensus}/></div>
                <div style={{fontSize:10,color:"#64748B"}}>{c.s} · {c.div}% div · Tgt {fm(avgT)} ({upside}%){held>0?" · "+held.toLocaleString()+" held":""}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <MC hist={c.hist}/>
                <div style={{textAlign:"right",minWidth:65}}>
                  <div style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:"#F8FAFC"}}>{fm(c.price)}</div>
                  <div style={{fontSize:10,fontWeight:700,color:c.ch>=0?G:R,fontFamily:"monospace"}}>{c.ch>=0?"+":""}{(c.ch*100).toFixed(2)}%</div>
                </div>
              </div>
            </div>;})}
        </div>
      </>}

      {/* COMPANY TAB */}
      {tab==="co"&&(()=>{
        const c=selCo?d.cos.find(x=>x.t===selCo.t)||selCo:null;
        if(!c)return <div style={{padding:40,textAlign:"center",color:"#64748B",fontSize:14}}>← Select a company from Markets</div>;
        const held=SH[c.t]||0,avgC=d.avgSh?.[c.t]||c.price,pl=held?(c.price-avgC)*held:0;
        const consensus=getConsensus(c),avgT=getAvgTarget(c);
        const upside=(avgT/c.price-1)*100;
        const bnd=PEB[c.s]||{mn:10,mx:35},eps=c.price/c.pe;
        return <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Header card */}
          <div style={{background:"#1E293B",borderRadius:14,padding:16,border:"1px solid #334155"}}>
            <div style={{fontSize:10,color:"#64748B",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{c.s} · {c.hq} · Est. {c.yr}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div><div style={{fontSize:20,fontWeight:700,color:"#F8FAFC",marginBottom:2}}>{c.n}</div><div style={{fontSize:11,color:"#64748B"}}>{c.t} · {((c.emp||0)/1000).toFixed(0)}K staff</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:26,fontWeight:800,color:G,fontFamily:"monospace"}}>{fm(c.price)}</div><div style={{fontSize:12,color:c.ch>=0?G:R,marginTop:2}}>{c.ch>=0?"▲":"▼"} {(Math.abs(c.ch)*100).toFixed(2)}% this turn</div></div>
            </div>
            <div style={{height:28,marginBottom:10}}>{c.hist&&c.hist.length>2&&<MC hist={c.hist} w={370} h={28}/>}</div>
            <div style={{display:"flex",gap:6}}>
              {[["P/E",c.pe.toFixed(1)+"×"],["Div",c.div+"%"],["Bounds",bnd.mn+"-"+bnd.mx+"×"],["Beta",c.b+"×"]].map(([k,v])=><div key={k} style={{flex:1,background:"#0F172A",borderRadius:7,padding:"6px 4px",textAlign:"center"}}><div style={{fontSize:8,color:"#64748B",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:"#F8FAFC"}}>{v}</div></div>)}
            </div>
          </div>
          {/* Analyst consensus */}
          <div style={{background:consensus==="STRONG BUY"?"#14532D":consensus==="BUY"?"#166534":consensus==="HOLD"?"#78350F":consensus==="SELL"?"#7F1D1D":"#374151",borderRadius:12,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:10,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Analyst Consensus ({c.analysts.length} firms)</div><div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{consensus}</div><div style={{fontSize:11,color:"rgba(255,255,255,.65)",marginTop:2}}>Avg score: {(c.analysts.reduce((x,a)=>x+({"STRONG BUY":5,"BUY":4,"HOLD":3,"SELL":2}[a.rating]||3),0)/c.analysts.length).toFixed(1)}/5.0</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"rgba(255,255,255,.6)",marginBottom:2}}>Avg Price Target</div><div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"monospace"}}>{fm(avgT)}</div><div style={{fontSize:11,color:"rgba(255,255,255,.65)",marginTop:2}}>{upside>=0?"▲":"▼"} {Math.abs(upside).toFixed(1)}% {upside>=0?"upside":"downside"}</div></div>
          </div>
          {/* Individual analyst opinions */}
          <div style={{background:"#1E293B",borderRadius:12,padding:13,border:"1px solid #334155"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#F8FAFC",marginBottom:10}}>Analyst Opinions — {c.analysts.length} firms</div>
            {c.analysts.map((a,i)=><div key={i} style={{padding:"10px 0",borderBottom:i<c.analysts.length-1?"1px solid rgba(255,255,255,.06)":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12,fontWeight:700,color:"#F8FAFC"}}>{a.firm}</span><RatingBadge r={a.rating}/></div>
                <span style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:a.target>c.price?G:R}}>Tgt {fm(a.target)}</span>
              </div>
              <div style={{fontSize:11,color:"#94A3B8",lineHeight:1.5}}>{a.note}</div>
            </div>)}
          </div>
          {/* Story */}
          <div style={{background:"#1E293B",borderRadius:12,padding:13,border:"1px solid #334155"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#F8FAFC",marginBottom:8}}>📖 Company Story</div>
            <div style={{fontSize:12,color:"#94A3B8",lineHeight:1.7,marginBottom:10}}>{c.origin}</div>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              {[["Founded By",c.founder],["CEO Today",c.ceo],["Est. · HQ",c.yr+" · "+c.hq]].map(([k,v])=><div key={k} style={{flex:1,background:"#0F172A",borderRadius:7,padding:"7px 8px"}}><div style={{fontSize:8,color:"#64748B",marginBottom:2}}>{k}</div><div style={{fontSize:10,fontWeight:600,color:"#F8FAFC"}}>{v}</div></div>)}
            </div>
            <div style={{background:"#0F172A",borderRadius:8,padding:"9px 11px",fontSize:11,color:"#94A3B8",lineHeight:1.6}}><span style={{color:"#64748B",fontWeight:600}}>Operations: </span>{c.ops}</div>
          </div>
          {held>0&&<div style={{background:"#0F172A",borderRadius:12,padding:12,border:"1px solid #1E3A2E"}}>
            <div style={{fontSize:12,fontWeight:700,color:G,marginBottom:8}}>💼 Your Position</div>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              {[["Shares",held.toLocaleString()],["Value",fm(c.price*held)],["Avg Cost",fm(avgC)],["P&L",(pl>=0?"+":"")+fm(pl)]].map(([k,v])=><div key={k} style={{flex:1,background:"#1E293B",borderRadius:7,padding:"7px 6px",textAlign:"center"}}><div style={{fontSize:8,color:"#64748B",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:700,color:k==="P&L"?(pl>=0?G:R):"#F8FAFC",fontFamily:"monospace"}}>{v}</div></div>)}
            </div>
            <div style={{fontSize:10,color:"#64748B"}}>CGT {(d.cgtRate*100).toFixed(0)}% on profit only. Selling at a loss = $0 tax.</div>
          </div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setTrM({item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:10,padding:13,fontWeight:800,fontSize:13,cursor:"pointer"}}>📈 Buy</button>
            <button onClick={()=>{setTrM({item:c,mode:"sell"});setTrAmt(null);}} disabled={held<1} style={{flex:1,background:held<1?"#1E293B":"#7F1D1D",color:held<1?"#475569":"#FCA5A5",border:"1px solid "+(held<1?"#334155":"#991B1B"),borderRadius:10,padding:13,fontWeight:800,fontSize:13,cursor:held<1?"not-allowed":"pointer"}}>📉 Sell{held>0?" ("+held.toLocaleString()+")":""}</button>
          </div>
        </div>;
      })()}

      {/* PORTFOLIO TAB */}
      {tab==="port"&&<>
        <div style={{background:"#1E293B",borderRadius:14,padding:14,border:"1px solid #334155"}}>
          <div style={{fontSize:11,color:"#64748B",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Total Portfolio</div>
          <div style={{fontSize:28,fontWeight:800,color:G,fontFamily:"monospace",marginBottom:6}}>{fm(nw)}</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {[["Cash",fm(d.cash),"#F8FAFC"],["Stocks",fm(sv),G],["Bonds",fm(bv),BL],["Forex",fm(fxv),AU],["Commodities",fm(cv),PU]].map(([k,v,c])=><div key={k} style={{background:"#0F172A",borderRadius:8,padding:"6px 10px"}}><div style={{fontSize:9,color:"#64748B",marginBottom:1}}>{k}</div><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:c}}>{v}</div></div>)}
          </div>
        </div>
        {/* Stock holdings */}
        {Object.keys(SH).filter(t=>(SH[t]||0)>0).length>0&&<div style={{background:"#1E293B",borderRadius:13,border:"1px solid #334155",overflow:"hidden"}}>
          <div style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:"#F8FAFC"}}>📊 Stock Holdings</div>
          {Object.entries(SH).filter(([,n])=>n>0).map(([t,n])=>{const c=d.cos.find(x=>x.t===t);if(!c)return null;const avgC=d.avgSh?.[t]||c.price,pl=(c.price-avgC)*n;
            return <div key={t} style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,.05)"}}>
              <div onClick={()=>{setSelCo({...c});setTab("co");}} style={{display:"flex",alignItems:"center",gap:9,marginBottom:8,cursor:"pointer"}}>
                <div style={{width:32,height:32,borderRadius:8,background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#86EFAC",border:"1px solid #1E3A2E",flexShrink:0}}>{t}</div>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"#F8FAFC"}}>{c.n}</div><div style={{fontSize:10,color:"#64748B"}}>{n.toLocaleString()} shs · avg {fm(avgC)}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:"#F8FAFC"}}>{fm(c.price*n)}</div><div style={{fontSize:10,fontFamily:"monospace",color:pl>=0?G:R}}>{pl>=0?"+":""}{fm(pl)}</div></div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{setTrM({item:c,mode:"buy"});setTrAmt(null);}} style={{flex:1,background:"#14532D",color:"#86EFAC",border:"1px solid #166534",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>+ More</button>
                <button onClick={()=>trade(c,"sell",Math.floor(n/2))} style={{flex:1,background:"#78350F",color:"#FDE68A",border:"1px solid #92400E",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell 50%</button>
                <button onClick={()=>trade(c,"sell",n)} style={{flex:1,background:"#7F1D1D",color:"#FCA5A5",border:"1px solid #991B1B",borderRadius:7,padding:"8px 0",fontWeight:700,fontSize:11,cursor:"pointer"}}>Sell All</button>
              </div>
            </div>;})}
        </div>}
        {/* Forex positions */}
        {Object.keys(d.fxPos||{}).length>0&&<div style={{background:"#1E293B",borderRadius:13,border:"1px solid #334155",overflow:"hidden"}}>
          <div style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:"#F8FAFC"}}>💱 Forex Positions</div>
          {Object.entries(d.fxPos||{}).map(([id,pos])=><div key={id} style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,.05)"}}><div style={{fontSize:12,fontWeight:700,color:"#F8FAFC"}}>{id} {pos.side.toUpperCase()}</div><div style={{fontSize:11,color:"#64748B"}}>Entry {pos.entry?.toFixed(4)||"—"} · Invested {fm(pos.cost||0)}</div></div>)}
        </div>}
        {/* Bond holdings */}
        {Object.keys(d.bonds||{}).length>0&&<div style={{background:"#1E293B",borderRadius:13,border:"1px solid #334155",overflow:"hidden"}}>
          <div style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:"#F8FAFC"}}>📋 Bond Holdings</div>
          {Object.entries(d.bonds||{}).map(([id,qty])=><div key={id} style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between"}}><div style={{fontSize:12,color:"#F8FAFC"}}>{id}</div><div style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:BL}}>{qty}× bonds · {fm(qty*1000)} face value</div></div>)}
        </div>}
        {/* Dividends */}
        {(d.divLog||[]).length>0&&<div style={{background:"#1E293B",borderRadius:13,padding:13,border:"1px solid #334155"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#F8FAFC",marginBottom:10}}>💰 Dividend History (quarterly)</div>
          {(d.divLog||[]).slice(0,5).map((e,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#94A3B8"}}>Turn {e.turn}</span><span style={{fontSize:12,fontWeight:700,color:G,fontFamily:"monospace"}}>{fm(e.amount)}</span></div><div style={{fontSize:10,color:"#475569"}}>{e.lines.join(" · ")}</div></div>)}
        </div>}
      </>}

      {/* NEWS TAB */}
      {tab==="news"&&<>
        <div style={{display:"flex",background:"#1E293B",borderRadius:10,padding:3,gap:2,marginBottom:2}}>
          {[{id:"all",l:"All Events"},{id:"mine",l:"My Events"+(myNewsCount>0?" ("+myNewsCount+")":"")}].map(t=><button key={t.id} onClick={()=>setNewsTab(t.id)} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",background:newsTab===t.id?"#0F172A":"transparent",color:newsTab===t.id?"#F8FAFC":"#64748B",fontWeight:700,fontSize:12,cursor:"pointer"}}>{t.l}</button>)}
        </div>
        {(newsTab==="all"?d.news:(d.myNews||[])).length===0&&<div style={{padding:30,textAlign:"center",color:"#64748B",fontSize:13}}>{newsTab==="mine"?"No personal events yet. Buy shares and advance turns.":"No news yet."}</div>}
        {(newsTab==="all"?d.news:(d.myNews||[])).map(n=><div key={n.id} style={{background:"#1E293B",borderRadius:11,padding:12,border:"1px solid #334155",display:"flex",gap:9}}>
          <div style={{width:4,borderRadius:2,flexShrink:0,background:n.g?G:R,alignSelf:"stretch"}}/>
          <div style={{flex:1}}><div style={{fontSize:10,color:"#475569",marginBottom:3}}>Turn {n.t} · {n.ico}</div><div style={{fontSize:13,fontWeight:700,color:"#F8FAFC",marginBottom:3}}>{n.ti}</div><div style={{fontSize:11,color:"#94A3B8",lineHeight:1.6}}>{n.bo}</div></div>
        </div>)}
      </>}
    </div>

    {trM&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget){setTrM(null);setTrAmt(null);}}}>
      <div style={{background:"#1E293B",borderRadius:"18px 18px 0 0",padding:20,width:"100%",maxHeight:"80vh",overflowY:"auto"}}>
        <div style={{width:36,height:5,background:"#334155",borderRadius:3,margin:"0 auto 14px"}}/>
        <div style={{background:trM.mode==="buy"?"#14532D":"#7F1D1D",borderRadius:12,padding:13,marginBottom:12}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,.65)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{trM.mode==="buy"?"BUY":"SELL"} · STOCK</div>
          <div style={{fontSize:17,fontWeight:800,color:"#fff"}}>{trM.item.n}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.8)",marginTop:2}}>{fm(trM.item.price)} per share · {trM.mode==="buy"?fm(d.cash)+" available":((SH[trM.item.t]||0).toLocaleString())+" held"}</div>
        </div>
        <div style={{display:"flex",background:"#0F172A",borderRadius:9,padding:3,gap:2,marginBottom:12}}>
          {["buy","sell"].map(m=><button key={m} onClick={()=>{setTrM({...trM,mode:m});setTrAmt(null);}} style={{flex:1,padding:"8px 0",borderRadius:7,border:"none",background:trM.mode===m?"#1E293B":"transparent",color:trM.mode===m?"#F8FAFC":"#64748B",fontWeight:700,fontSize:12,cursor:"pointer"}}>{m==="buy"?"Buy":"Sell"}</button>)}
        </div>
        {(()=>{
          const isBuy=trM.mode==="buy";const price=trM.item.price;
          const maxQty=isBuy?Math.floor(d.cash/price):SH[trM.item.t]||0;
          const candidates=[1,5,10,50,100,500,1000,5000,10000,50000,100000];
          const show=[...new Set([...candidates.filter(v=>v<=maxQty&&v>0),maxQty].filter(v=>v>0))].sort((a,b)=>a-b).slice(-8);
          const qty=Math.floor(trAmt||0),total=Math.round(qty*price*100)/100;
          const avgC=d.avgSh?.[trM.item.t]||price;
          const profit=!isBuy?Math.max(0,(price-avgC)*qty):0;
          const cgt=!isBuy?Math.round(profit*d.cgtRate*100)/100:0;
          return <>
            <div style={{fontSize:10,color:"#64748B",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Quantity — Max {maxQty.toLocaleString()} shares</div>
            {maxQty>0?<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
              {show.map(v=><button key={v} onClick={()=>setTrAmt(v)} style={{padding:"10px 4px",borderRadius:9,border:"2px solid "+(trAmt===v?(isBuy?"#16A34A":"#DC2626"):"#334155"),background:trAmt===v?(isBuy?"#14532D":"#7F1D1D"):"#0F172A",color:trAmt===v?(isBuy?"#86EFAC":"#FCA5A5"):"#94A3B8",fontWeight:700,fontSize:11,cursor:"pointer",textAlign:"center"}}>
                <div>{v>=1000?(v/1000).toFixed(0)+"K":v}</div>
              </button>)}
              <button onClick={()=>setTrAmt(maxQty)} style={{padding:"10px 4px",borderRadius:9,border:"2px solid "+(isBuy?"#16A34A":"#DC2626"),background:isBuy?"#14532D":"#7F1D1D",color:isBuy?"#86EFAC":"#FCA5A5",fontWeight:800,fontSize:11,cursor:"pointer"}}>{isBuy?"Buy Max":"Sell Max"}</button>
            </div>:<div style={{padding:"12px 0",color:"#64748B",fontSize:12,textAlign:"center"}}>{isBuy?"Not enough cash for even 1 share":"Nothing held"}</div>}
            {qty>0&&<div style={{background:"#0F172A",borderRadius:9,padding:11,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1E293B"}}><span style={{fontSize:12,color:"#64748B"}}>Qty</span><span style={{fontSize:12,fontWeight:700,color:"#F8FAFC",fontFamily:"monospace"}}>{qty.toLocaleString()} shares</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1E293B"}}><span style={{fontSize:12,color:"#64748B"}}>{isBuy?"Cost":"Proceeds"}</span><span style={{fontSize:12,fontWeight:700,color:"#F8FAFC",fontFamily:"monospace"}}>{fm(total)}</span></div>
              {!isBuy&&<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1E293B"}}><span style={{fontSize:12,color:"#64748B"}}>CGT {Math.round(d.cgtRate*100)}% on profit</span><span style={{fontSize:12,fontWeight:700,color:R,fontFamily:"monospace"}}>{profit>0?"-"+fm(cgt):"$0"}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:13,fontWeight:700,color:"#F8FAFC"}}>Net {isBuy?"cost":"proceeds"}</span><span style={{fontSize:13,fontWeight:800,color:isBuy?R:G,fontFamily:"monospace"}}>{fm(isBuy?total:total-cgt)}</span></div>
            </div>}
            <button onClick={()=>trade(trM.item,trM.mode,qty)} disabled={qty<1} style={{width:"100%",background:qty>=1?(isBuy?G:R):"#334155",color:"#fff",border:"none",borderRadius:11,padding:14,fontWeight:800,fontSize:14,cursor:qty>=1?"pointer":"not-allowed"}}>
              {qty>=1?"Confirm "+(isBuy?"Buy":"Sell")+" "+qty.toLocaleString()+" shares = "+fm(isBuy?total:total-cgt):"Select quantity above"}
            </button>
          </>;
        })()}
      </div>
    </div>}
    {toast&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:398,background:toast.g?G:R,borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:700,zIndex:400,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.4)"}}>{toast.msg}</div>}
    <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
  </div>;
}
