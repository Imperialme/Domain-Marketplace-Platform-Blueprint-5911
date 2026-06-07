import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { fm } from '../utils';
import { PLANETS_DATA, IPOS } from '../constants';
import { PLANET_THRESHOLDS } from '../store/gameStore';

const T = {
  bg:'#030810', card:'#0A1628', raised:'#0F1E35',
  border:'rgba(255,255,255,0.08)', borderHi:'rgba(255,255,255,0.14)',
  text:'#F1F5F9', sub:'#94A3B8', muted:'#475569',
  green:'#10B981', red:'#F43F5E', blue:'#3B82F6',
  amber:'#F59E0B', purple:'#8B5CF6', cyan:'#06B6D4',
};

const SECTOR_COLOR = {
  Technology:'#3B82F6',Banking:'#10B981',Energy:'#F59E0B',Mining:'#F97316',
  Healthcare:'#EC4899',Agriculture:'#84CC16',Utilities:'#06B6D4',
  Telecom:'#6366F1','Real Estate':'#EAB308',Manufacturing:'#8B5CF6',Logistics:'#14B8A6',
};

const ANALYST_COLOR = {
  'STRONG BUY':'#10B981','BUY':'#34D399','HOLD':'#F59E0B','SELL':'#F43F5E','SPECULATIVE BUY':'#8B5CF6',
};

function Sparkline({hist,ch,h=32}) {
  if(!hist||hist.length<2) return <div style={{height:h}}/>;
  const pts=hist.slice(-24);
  const mn=Math.min(...pts),mx=Math.max(...pts);
  const points=pts.map((p,i)=>`${i/(pts.length-1)*100},${h-(p-mn)/(mx-mn||1)*(h-4)+2}`).join(' ');
  const c=(ch||0)>=0?T.green:T.red;
  return (
    <svg width="100%" height={h} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" style={{display:'block'}}>
      <polyline points={points} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function QuickPcts({onSelect,labels=['25%','50%','75%','Max']}) {
  return (
    <div style={{display:'flex',gap:5,marginBottom:10}}>
      {labels.map((l,i)=>(
        <button key={l} onClick={()=>onSelect(i)} style={{flex:1,padding:'7px 0',background:T.raised,border:'1px solid '+T.border,color:T.sub,borderRadius:9,fontSize:11,fontWeight:700,cursor:'pointer'}}>
          {l}
        </button>
      ))}
    </div>
  );
}

function TradeModal({title,price,priceSub,held,walletBalance,isBuyOnly,onBuy,onSell,onClose}) {
  const [mode,setMode]=useState('buy');
  const [qty,setQty]=useState('');
  const q=parseInt(qty)||0;
  const maxAffordable=(walletBalance&&price)?Math.floor(walletBalance/price):0;

  const setByPct=(idx)=>{
    const pcts=[0.25,0.50,0.75,1.00];
    if(mode==='buy') setQty(String(Math.floor(maxAffordable*pcts[idx])));
    else setQty(String(Math.floor((held||0)*pcts[idx])));
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'flex-end',zIndex:400,backdropFilter:'blur(4px)'}}>
      <div style={{background:'#0D1B2E',borderRadius:'22px 22px 0 0',padding:22,width:'100%',border:'1px solid rgba(255,255,255,0.12)',boxShadow:'0 -20px 60px rgba(0,0,0,0.5)'}}>
        <div style={{width:40,height:4,background:'rgba(255,255,255,0.15)',borderRadius:2,margin:'0 auto 16px'}}/>
        <div style={{fontSize:17,fontWeight:800,color:T.text,marginBottom:2}}>{title}</div>
        <div style={{fontSize:12,color:T.muted,marginBottom:16}}>{priceSub||('$'+price?.toFixed(2)+'/share')}{held>0?` · You hold ${held.toLocaleString()}`:''}  </div>
        {!isBuyOnly&&held>0&&(
          <div style={{display:'flex',gap:6,marginBottom:14,background:T.bg,borderRadius:12,padding:4}}>
            {['buy','sell'].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'9px 0',background:mode===m?(m==='buy'?T.green:T.red):'transparent',color:mode===m?'#fff':T.muted,border:'none',borderRadius:9,fontWeight:700,fontSize:13,cursor:'pointer',transition:'all .15s'}}>{m==='buy'?'Buy':'Sell'}</button>
            ))}
          </div>
        )}

        <div style={{marginBottom:6,fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:1}}>
          {mode==='buy'?`Quick buy — wallet: ${fm(walletBalance||0)} · max ${maxAffordable.toLocaleString()} shares`:`Quick sell — holding: ${(held||0).toLocaleString()} shares`}
        </div>
        <QuickPcts onSelect={setByPct} labels={['25%','50%','75%','Max']}/>

        <input type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder="Enter quantity" style={{width:'100%',background:T.bg,border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'14px 16px',color:T.text,fontSize:18,outline:'none',boxSizing:'border-box',marginBottom:10,fontFamily:'monospace'}}/>
        {q>0&&price&&(
          <div style={{background:mode==='buy'?'rgba(16,185,129,0.08)':'rgba(244,63,94,0.08)',border:'1px solid '+(mode==='buy'?'rgba(16,185,129,0.2)':'rgba(244,63,94,0.2)'),borderRadius:10,padding:'10px 14px',marginBottom:14,display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:12,color:T.sub}}>Total {mode==='buy'?'cost':'proceeds'}</span>
            <span style={{fontSize:14,fontWeight:800,color:mode==='buy'?T.green:T.red,fontFamily:'monospace'}}>{fm(q*price)}</span>
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:10}}>
          <button onClick={onClose} style={{padding:'14px 0',background:T.raised,border:'1px solid '+T.border,color:T.sub,borderRadius:14,fontWeight:700,fontSize:14,cursor:'pointer'}}>Cancel</button>
          <button onClick={()=>{if(q<=0)return;mode==='buy'?onBuy(q):onSell(q);}} style={{padding:'14px 0',background:mode==='buy'?T.green:T.red,color:'#fff',border:'none',borderRadius:14,fontWeight:800,fontSize:16,cursor:'pointer',boxShadow:'0 4px 16px '+(mode==='buy'?'rgba(16,185,129,0.3)':'rgba(244,63,94,0.3)')}}>
            {mode==='buy'?'Buy':'Sell'} {q>0?q.toLocaleString():''} Shares
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({msg}) {
  if(!msg) return null;
  return <div style={{position:'fixed',bottom:80,left:'50%',transform:'translateX(-50%)',background:'#0D1B2E',border:'1px solid rgba(255,255,255,0.15)',borderRadius:12,padding:'11px 18px',fontSize:12,color:T.text,whiteSpace:'nowrap',zIndex:500,boxShadow:'0 8px 24px rgba(0,0,0,0.4)'}}>{msg}</div>;
}

// ── EARTH MARKETS ──────────────────────────────────────────────
function EarthTab() {
  const {D,buyStock,sellStock}=useGame();
  const d=D;
  const [selected,setSelected]=useState(null);
  const [modal,setModal]=useState(false);
  const [msg,setMsg]=useState('');
  const showMsg=m=>{setMsg(m);setTimeout(()=>setMsg(''),2500);};

  const co=selected?d.companies?.find(c=>c.t===selected):null;

  if(co) return (
    <div style={{paddingBottom:8}}>
      <button onClick={()=>{setSelected(null);setModal(false);}} style={{background:T.raised,border:'1px solid '+T.border,color:T.sub,borderRadius:10,padding:'9px 14px',cursor:'pointer',fontSize:12,marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
        ← Back to Markets
      </button>

      <div style={{background:`linear-gradient(135deg,${SECTOR_COLOR[co.s]||T.blue}15,${SECTOR_COLOR[co.s]||T.blue}05)`,borderRadius:18,padding:16,border:`1px solid ${SECTOR_COLOR[co.s]||T.blue}30`,marginBottom:10}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
          <div>
            <div style={{fontSize:11,color:SECTOR_COLOR[co.s]||T.blue,textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>{co.s}</div>
            <div style={{fontSize:20,fontWeight:900,color:T.text}}>{co.n}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{co.t} · {co.hq} · Est.{co.yr}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:26,fontWeight:900,color:T.text,fontFamily:'monospace',lineHeight:1}}>${co.price.toFixed(2)}</div>
            <div style={{fontSize:13,fontWeight:700,color:(co.ch||0)>=0?T.green:T.red,marginTop:3}}>{(co.ch||0)>=0?'▲':'▼'} {Math.abs((co.ch||0)*100).toFixed(2)}%</div>
          </div>
        </div>
        <div style={{height:56,marginBottom:12}}><Sparkline hist={co.hist} ch={co.ch} h={56}/></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
          {[['P/E',co.pe?.toFixed(1)],['Div Yield',co.div+'%'],['Beta',co.b],['Employees',((co.emp||0)/1000).toFixed(0)+'K']].map(([l,v])=>(
            <div key={l} style={{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'7px 0',textAlign:'center'}}>
              <div style={{fontSize:8,color:T.muted,textTransform:'uppercase'}}>{l}</div>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {(d.stockHoldings?.[co.t]||0)>0&&(
        <div style={{background:T.card,borderRadius:12,padding:'12px 14px',border:'1px solid '+T.border,marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:11,color:T.muted}}>Your Position</div>
            <div style={{fontSize:15,fontWeight:800,color:T.text,fontFamily:'monospace'}}>{(d.stockHoldings[co.t]).toLocaleString()} shares</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:'monospace'}}>{fm(d.stockHoldings[co.t]*co.price)}</div>
            <div style={{fontSize:12,fontWeight:700,color:co.price>=(d.avgCostBasis?.[co.t]||co.price)?T.green:T.red}}>
              {((co.price-(d.avgCostBasis?.[co.t]||co.price))/(d.avgCostBasis?.[co.t]||co.price)*100).toFixed(1)}% P&L
            </div>
          </div>
        </div>
      )}

      <div style={{background:T.card,borderRadius:14,padding:'12px 14px',border:'1px solid '+T.border,marginBottom:10}}>
        <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10}}>Analyst Views</div>
        {co.analysts?.map((a,i)=>(
          <div key={i} style={{padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text}}>{a.firm}</div>
              <div style={{display:'inline-block',background:(ANALYST_COLOR[a.rating]||T.muted)+'22',color:ANALYST_COLOR[a.rating]||T.muted,padding:'3px 9px',borderRadius:20,fontSize:10,fontWeight:700,border:'1px solid '+(ANALYST_COLOR[a.rating]||T.muted)+'44'}}>{a.rating} · ${a.target}</div>
            </div>
            <div style={{fontSize:11,color:T.sub,lineHeight:1.5}}>{a.note}</div>
          </div>
        ))}
      </div>

      <div style={{background:T.card,borderRadius:14,padding:'12px 14px',border:'1px solid '+T.border,marginBottom:12}}>
        <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Company Story</div>
        <div style={{fontSize:12,color:T.sub,lineHeight:1.6}}>{co.origin}</div>
        <div style={{marginTop:8,fontSize:12,color:T.text,fontWeight:600}}>{co.ops}</div>
      </div>

      <button onClick={()=>setModal(true)} style={{width:'100%',background:'linear-gradient(135deg,#059669,#065F46)',color:'#fff',border:'none',borderRadius:14,padding:'15px 0',fontWeight:800,fontSize:16,cursor:'pointer',boxShadow:'0 4px 20px rgba(16,185,129,0.25)'}}>
        Trade {co.t}
      </button>
      {modal&&(
        <TradeModal title={co.n} price={co.price} held={d.stockHoldings?.[co.t]||0}
          walletBalance={d.tradingWallet}
          onBuy={q=>{const e=buyStock(co.t,q);if(e)showMsg('❌ '+e);else{showMsg('✅ Bought '+q.toLocaleString()+' '+co.t);setModal(false);}}}
          onSell={q=>{const e=sellStock(co.t,q);if(e)showMsg('❌ '+e);else{showMsg('✅ Sold '+q.toLocaleString()+' '+co.t);setModal(false);}}}
          onClose={()=>setModal(false)}
        />
      )}
      <Toast msg={msg}/>
    </div>
  );

  return (
    <div>
      <Toast msg={msg}/>
      <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10}}>10 Earth Companies · Tap to trade</div>
      {(d.companies||[]).map(co=>{
        const sC=SECTOR_COLOR[co.s]||T.blue;
        const held=d.stockHoldings?.[co.t]||0;
        const topA=co.analysts?.[0];
        return (
          <div key={co.t} onClick={()=>setSelected(co.t)} style={{background:T.card,borderRadius:16,padding:'14px',border:'1px solid '+T.border,marginBottom:8,cursor:'pointer',transition:'border-color .2s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=sC+'50'}
            onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:3}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:sC,boxShadow:'0 0 6px '+sC,flexShrink:0}}/>
                  <div style={{fontSize:14,fontWeight:800,color:T.text}}>{co.n}</div>
                </div>
                <div style={{fontSize:10,color:T.muted}}>{co.t} · {co.s}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:18,fontWeight:900,color:T.text,fontFamily:'monospace'}}>${co.price.toFixed(2)}</div>
                <div style={{fontSize:12,fontWeight:700,color:(co.ch||0)>=0?T.green:T.red}}>{(co.ch||0)>=0?'▲':'▼'}{Math.abs((co.ch||0)*100).toFixed(2)}%</div>
              </div>
            </div>
            <div style={{height:32,marginBottom:8}}><Sparkline hist={co.hist} ch={co.ch} h={32}/></div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              {topA&&<div style={{fontSize:10,fontWeight:700,color:ANALYST_COLOR[topA.rating]||T.muted,background:(ANALYST_COLOR[topA.rating]||T.muted)+'15',padding:'3px 8px',borderRadius:6}}>{topA.rating}</div>}
              <div style={{display:'flex',gap:10,marginLeft:'auto'}}>
                <div style={{fontSize:10,color:T.muted}}>Div {co.div}%</div>
                {held>0&&<div style={{fontSize:10,fontWeight:700,color:T.amber,background:T.amber+'15',padding:'2px 7px',borderRadius:6}}>{held.toLocaleString()} held</div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── PLANETS ────────────────────────────────────────────────────
function PlanetsTab() {
  const {D,buyPlanetStock,sellPlanetStock}=useGame();
  const d=D;
  const [planet,setPlanet]=useState(null);
  const [modal,setModal]=useState(null);
  const [msg,setMsg]=useState('');
  const showMsg=m=>{setMsg(m);setTimeout(()=>setMsg(''),2500);};

  const totalPortfolio = (d.cashWallet||0)+(d.savingsWallet||0)+(d.tradingWallet||0)+(d.foundationBalance||0)+
    Object.entries(d.stockHoldings||{}).reduce((x,[t,n])=>{const co=d.companies?.find(c=>c.t===t);return x+(co?co.price*n:0);},0)+
    (d.etfs||[]).reduce((x,e)=>x+e.price*(e.units||0),0)+
    Object.values(d.fundDeposits||{}).reduce((x,f)=>x+(f.deposit||0),0);

  if(planet) {
    const pd=PLANETS_DATA[planet];
    const pState=d.planetCompanies?.[planet];
    const isUnlocked=d.planetUnlocks?.[planet]!==false;
    if(!pd||!pState) return null;
    const pc=pd.color||T.blue;

    if(!isUnlocked) {
      const threshold=PLANET_THRESHOLDS[planet]||0;
      const progress=Math.min(1,totalPortfolio/(threshold||1));
      return (
        <div>
          <button onClick={()=>setPlanet(null)} style={{background:T.raised,border:'1px solid '+T.border,color:T.sub,borderRadius:10,padding:'9px 14px',cursor:'pointer',fontSize:12,marginBottom:12}}>← Solar System</button>
          <div style={{background:`linear-gradient(135deg,${pc}15,${pc}05)`,borderRadius:18,padding:24,border:`1px solid ${pc}30`,textAlign:'center'}}>
            <div style={{fontSize:64,marginBottom:12}}>{pd.ico}</div>
            <div style={{fontSize:22,fontWeight:900,color:'#fff',marginBottom:8}}>{pd.name}</div>
            <div style={{fontSize:36,marginBottom:12}}>🔒</div>
            <div style={{fontSize:14,fontWeight:700,color:'#94A3B8',marginBottom:8}}>Locked — Need {fm(threshold)}</div>
            <div style={{background:'rgba(0,0,0,0.3)',borderRadius:8,height:8,overflow:'hidden',marginBottom:8}}>
              <div style={{width:(progress*100)+'%',height:'100%',background:pc,borderRadius:8}}/>
            </div>
            <div style={{fontSize:12,color:'#475569'}}>{fm(totalPortfolio)} / {fm(threshold)} ({(progress*100).toFixed(1)}%)</div>
            <div style={{marginTop:12,fontSize:11,color:'#475569',lineHeight:1.5}}>{pd.desc}</div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <button onClick={()=>setPlanet(null)} style={{background:T.raised,border:'1px solid '+T.border,color:T.sub,borderRadius:10,padding:'9px 14px',cursor:'pointer',fontSize:12,marginBottom:12}}>← Solar System</button>
        <div style={{background:`linear-gradient(135deg,${pc}20,${pc}08)`,borderRadius:18,padding:16,border:`1px solid ${pc}40`,marginBottom:12,boxShadow:`0 0 30px ${pc}15`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:36,marginBottom:4}}>{pd.ico}</div>
              <div style={{fontSize:22,fontWeight:900,color:'#fff'}}>{pd.name}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:3,lineHeight:1.4,maxWidth:200}}>{pd.desc}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:2}}>Exchange Rate</div>
              <div style={{fontSize:24,fontWeight:900,color:pc,fontFamily:'monospace'}}>1 {pd.currency}</div>
              <div style={{fontSize:14,fontWeight:700,color:T.sub}}>= ${pd.rate.toFixed(2)} USD</div>
              <div style={{marginTop:6,fontSize:12,color:pState.gdp>=0?T.green:T.red}}>GDP {pState.gdp>=0?'+':''}{pState.gdp}%</div>
            </div>
          </div>
          {pState.stormActive&&(
            <div style={{marginTop:12,background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.4)',borderRadius:10,padding:'10px 12px',fontSize:12,color:'#FCA5A5',fontWeight:600}}>
              ⚡ Jupiter Storm Active — Prices at 70% · Buy the dip · Recovery in ~20 turns
            </div>
          )}
        </div>
        {pState.cos.map(co=>{
          const key=planet+'_'+co.t;
          const held=d.planetHoldings?.[key]||0;
          const avg=d.planetAvgCost?.[key]||co.price;
          const gain=held>0?(co.price-avg)/avg*100:0;
          const sC=SECTOR_COLOR[co.s]||pc;
          return (
            <div key={co.t} style={{background:T.card,borderRadius:16,padding:14,border:'1px solid '+T.border,marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:sC}}/>
                    <div style={{fontSize:14,fontWeight:800,color:T.text}}>{co.n}</div>
                  </div>
                  <div style={{fontSize:10,color:T.muted}}>{co.t} · {co.s}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:16,fontWeight:800,color:T.text,fontFamily:'monospace'}}>{pd.currency} {co.price.toFixed(2)}</div>
                  <div style={{fontSize:11,color:(co.ch||0)>=0?T.green:T.red}}>{(co.ch||0)>=0?'▲':'▼'}{Math.abs((co.ch||0)*100).toFixed(1)}%</div>
                  <div style={{fontSize:10,color:T.muted,marginTop:2}}>≈ ${(co.price*pd.rate).toFixed(2)}</div>
                </div>
              </div>
              <div style={{height:28,marginBottom:8}}><Sparkline hist={co.hist} ch={co.ch} h={28}/></div>
              {held>0&&(
                <div style={{background:gain>=0?'rgba(16,185,129,0.08)':'rgba(244,63,94,0.08)',border:'1px solid '+(gain>=0?'rgba(16,185,129,0.2)':'rgba(244,63,94,0.2)'),borderRadius:8,padding:'8px 10px',marginBottom:8,display:'flex',justifyContent:'space-between'}}>
                  <div style={{fontSize:11,color:T.sub}}>{held.toLocaleString()} shares · {fm(held*co.price*pd.rate)}</div>
                  <div style={{fontSize:11,fontWeight:700,color:gain>=0?T.green:T.red}}>{gain>=0?'+':''}{gain.toFixed(1)}%</div>
                </div>
              )}
              <button onClick={()=>setModal({co,pd,planet,held})} style={{width:'100%',background:`linear-gradient(135deg,${pc}90,${pc}60)`,color:'#fff',border:'none',borderRadius:10,padding:'11px 0',fontWeight:700,fontSize:13,cursor:'pointer',opacity:.9}}>
                Trade {co.t}
              </button>
            </div>
          );
        })}
        {modal&&(
          <TradeModal
            title={`${modal.pd.ico} ${modal.co.n}`}
            price={modal.co.price*modal.pd.rate}
            priceSub={`${modal.pd.currency} ${modal.co.price.toFixed(2)} · ≈ $${(modal.co.price*modal.pd.rate).toFixed(2)} USD`}
            held={modal.held}
            walletBalance={d.tradingWallet}
            onBuy={q=>{const e=buyPlanetStock(modal.planet,modal.co.t,q);if(e)showMsg('❌ '+e);else{showMsg('✅ Bought '+q+' '+modal.co.t);setModal(null);}}}
            onSell={q=>{sellPlanetStock(modal.planet,modal.co.t,q);showMsg('✅ Sold '+q+' '+modal.co.t);setModal(null);}}
            onClose={()=>setModal(null)}
          />
        )}
        <Toast msg={msg}/>
      </div>
    );
  }

  return (
    <div>
      <Toast msg={msg}/>
      <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10}}>8 Planet Economies · Tap to explore</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {Object.entries(PLANETS_DATA).map(([pName,pd])=>{
          const pState=d.planetCompanies?.[pName];
          const pc=pd.color||T.blue;
          const isUnlocked=d.planetUnlocks?.[pName]!==false;
          const threshold=PLANET_THRESHOLDS[pName];
          const progress=threshold?Math.min(1,totalPortfolio/threshold):1;
          const holdings=Object.entries(d.planetHoldings||{}).filter(([k])=>k.startsWith(pName+'_'));
          const totalVal=holdings.reduce((s,[key,n])=>{
            const t=key.split('_')[1];const co=pState?.cos?.find(c=>c.t===t);return s+(co?n*co.price*pd.rate:0);},0);
          return (
            <div key={pName} onClick={()=>setPlanet(pName)} style={{background:`linear-gradient(135deg,${pc}18,${pc}08)`,borderRadius:16,padding:14,border:`1px solid ${pc}30`,cursor:'pointer',position:'relative',overflow:'hidden'}}>
              {!isUnlocked&&(
                <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)',borderRadius:16,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:2}}>
                  <div style={{fontSize:20,marginBottom:4}}>🔒</div>
                  <div style={{fontSize:10,color:'#94A3B8',fontWeight:700}}>{fm(threshold||0)}</div>
                  <div style={{width:'60%',background:'rgba(255,255,255,0.1)',borderRadius:3,height:4,marginTop:6,overflow:'hidden'}}>
                    <div style={{width:(progress*100)+'%',height:'100%',background:pc}}/>
                  </div>
                </div>
              )}
              <div style={{fontSize:32,marginBottom:8}}>{pd.ico}</div>
              <div style={{fontSize:15,fontWeight:800,color:'#fff',marginBottom:2}}>{pd.name}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.45)',marginBottom:8}}>{pd.currency} · {pd.companies.length} cos</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
                <div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.35)'}}>Rate</div>
                  <div style={{fontSize:13,fontWeight:800,color:pc,fontFamily:'monospace'}}>${pd.rate.toFixed(2)}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  {totalVal>0&&<div style={{fontSize:10,fontWeight:700,color:T.amber}}>{fm(totalVal)}</div>}
                  {pState?.stormActive&&<div style={{fontSize:11,color:T.red}}>⚡ Storm</div>}
                  <div style={{fontSize:10,color:(pState?.gdp||0)>=0?T.green:T.red}}>GDP {(pState?.gdp||0)>=0?'+':''}{pState?.gdp||0}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ETF TAB ────────────────────────────────────────────────────
function ETFTab() {
  const {D,buyETF,sellETF}=useGame();
  const d=D;
  const [modal,setModal]=useState(null);
  const [msg,setMsg]=useState('');
  const showMsg=m=>{setMsg(m);setTimeout(()=>setMsg(''),2500);};
  return (
    <div>
      <Toast msg={msg}/>
      <div style={{background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:12,padding:'10px 14px',marginBottom:12,fontSize:11,color:'#93C5FD',lineHeight:1.5}}>
        📊 ETFs give diversified exposure without picking individual stocks. Dividends paid every 30 turns to your Trading Wallet.
      </div>
      {(d.etfs||[]).map(e=>{
        const val=e.price*(e.units||0);
        const gain=e.units>0?(e.price-e.avgCost)/e.avgCost*100:0;
        return (
          <div key={e.id} style={{background:T.card,borderRadius:16,padding:14,border:'1px solid '+T.border,marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:T.text}}>{e.n}</div>
                <div style={{fontSize:10,color:T.muted}}>{e.id} · {e.type} · {e.expense}% expense ratio</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:20,fontWeight:900,color:T.text,fontFamily:'monospace'}}>${e.price.toFixed(2)}</div>
                <div style={{fontSize:12,color:(e.ch||0)>=0?T.green:T.red}}>{(e.ch||0)>=0?'▲':'▼'}{Math.abs((e.ch||0)*100).toFixed(2)}%</div>
              </div>
            </div>
            <div style={{height:32,marginBottom:10}}><Sparkline hist={e.hist} ch={e.ch} h={32}/></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:10}}>
              {[['Dividend',e.div+'%'],['Sharpe',e.sharpe.toFixed(2)],['Max DD',(e.maxDD*100).toFixed(0)+'%'],['YTD',((e.ytd||0)*100).toFixed(1)+'%']].map(([l,v])=>(
                <div key={l} style={{background:T.bg,borderRadius:8,padding:'7px 0',textAlign:'center'}}>
                  <div style={{fontSize:8,color:T.muted,textTransform:'uppercase'}}>{l}</div>
                  <div style={{fontSize:11,fontWeight:700,color:T.text,marginTop:2}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:T.sub,lineHeight:1.5,marginBottom:10}}>{e.desc}</div>
            {e.units>0&&(
              <div style={{background:gain>=0?'rgba(16,185,129,0.08)':'rgba(244,63,94,0.08)',border:'1px solid '+(gain>=0?'rgba(16,185,129,0.2)':'rgba(244,63,94,0.2)'),borderRadius:8,padding:'8px 12px',marginBottom:8,display:'flex',justifyContent:'space-between'}}>
                <div style={{fontSize:12,color:T.sub}}>{(e.units||0).toLocaleString()} units · {fm(val)}</div>
                <div style={{fontSize:12,fontWeight:700,color:gain>=0?T.green:T.red}}>{gain>=0?'+':''}{gain.toFixed(1)}%</div>
              </div>
            )}
            <button onClick={()=>setModal(e)} style={{width:'100%',background:'linear-gradient(135deg,#1D4ED8,#1E40AF)',color:'#fff',border:'none',borderRadius:12,padding:'12px 0',fontWeight:700,fontSize:14,cursor:'pointer'}}>
              Trade ETF
            </button>
          </div>
        );
      })}
      {modal&&(
        <TradeModal
          title={modal.n} price={modal.price}
          priceSub={`$${modal.price.toFixed(2)}/unit · ${modal.expense}% expense ratio`}
          held={modal.units||0}
          walletBalance={d.tradingWallet}
          onBuy={q=>{const e=buyETF(modal.id,q);if(e)showMsg('❌ '+e);else{showMsg('✅ Bought '+q+' units');setModal(null);}}}
          onSell={q=>{sellETF(modal.id,q);showMsg('✅ Sold '+q+' units');setModal(null);}}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
}

// ── IPO TAB ────────────────────────────────────────────────────
function IPOItem({ipo,d,onBook,walletBalance}) {
  const [qty,setQty]=useState('');
  const booked=d.ipoBookings?.[ipo.id]||0;
  const listed=d.ipoListed?.[ipo.id];
  const opensIn=ipo.opens-d.turn;
  const mid=(ipo.priceRange[0]+ipo.priceRange[1])/2;
  const maxShares=walletBalance?Math.floor(walletBalance/mid):0;
  const cost=parseInt(qty)*mid||0;

  const setByPct=(idx)=>{
    const pcts=[0.25,0.50,0.75,1.00];
    setQty(String(Math.floor(maxShares*pcts[idx])));
  };

  return (
    <div style={{background:T.card,borderRadius:16,padding:14,border:'1px solid '+(listed?T.green:T.border),marginBottom:8}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div>
          <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:2}}>{ipo.sector} · {ipo.planet}</div>
          <div style={{fontSize:16,fontWeight:800,color:T.text}}>{ipo.n}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:2}}>Founded by {ipo.founder}</div>
        </div>
        {listed
          ?<div style={{background:'rgba(16,185,129,0.15)',color:T.green,padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:700,border:'1px solid rgba(16,185,129,0.3)'}}>✅ LISTED</div>
          :opensIn>0
            ?<div style={{background:T.raised,color:T.sub,padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:600,border:'1px solid '+T.border}}>Opens T{ipo.opens}</div>
            :<div style={{background:'rgba(244,63,94,0.1)',color:T.red,padding:'4px 12px',borderRadius:20,fontSize:11,fontWeight:600}}>Passed</div>
        }
      </div>
      <div style={{fontSize:11,color:T.sub,lineHeight:1.5,marginBottom:10}}>{ipo.desc}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:10}}>
        {[['Price Range','$'+ipo.priceRange[0]+'-$'+ipo.priceRange[1]],['Demand',ipo.oversubscribed.toFixed(1)+'× oversubscribed'],['Your Booking',booked.toLocaleString()+' shares']].map(([l,v])=>(
          <div key={l} style={{background:T.bg,borderRadius:8,padding:'7px 6px',textAlign:'center'}}>
            <div style={{fontSize:8,color:T.muted,textTransform:'uppercase'}}>{l}</div>
            <div style={{fontSize:10,fontWeight:700,color:T.text,marginTop:2,lineHeight:1.2}}>{v}</div>
          </div>
        ))}
      </div>
      {ipo.analysts.map((a,i)=>(
        <div key={i} style={{background:T.bg,borderRadius:8,padding:'8px 10px',marginBottom:6}}>
          <div style={{fontSize:11,fontWeight:700,color:ANALYST_COLOR[a.view]||T.amber}}>{a.firm} · {a.view} · Target ${a.target}</div>
          <div style={{fontSize:10,color:T.sub,marginTop:3,lineHeight:1.4}}>{a.note}</div>
        </div>
      ))}
      {!listed&&opensIn>0&&(
        <div style={{marginTop:4}}>
          <div style={{fontSize:10,color:T.muted,marginBottom:6}}>
            Wallet: {fm(walletBalance||0)} · Max: {maxShares.toLocaleString()} shares @ ${mid.toFixed(2)}/share
          </div>
          <QuickPcts onSelect={setByPct}/>
          <div style={{display:'flex',gap:8}}>
            <input type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder="Shares to book" style={{flex:1,background:T.bg,border:'1px solid '+T.border,borderRadius:10,padding:'11px 12px',color:T.text,fontSize:14,outline:'none',fontFamily:'monospace'}}/>
            <button onClick={()=>{onBook(ipo,qty);setQty('');}} style={{background:T.purple,color:'#fff',border:'none',borderRadius:10,padding:'11px 18px',fontWeight:700,fontSize:14,cursor:'pointer'}}>Book</button>
          </div>
          {cost>0&&(
            <div style={{marginTop:8,background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:8,padding:'7px 12px',display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:11,color:T.sub}}>Total cost (midpoint)</span>
              <span style={{fontSize:12,fontWeight:700,color:T.purple,fontFamily:'monospace'}}>{fm(cost)}</span>
            </div>
          )}
        </div>
      )}
      {listed&&<div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:10,padding:'10px 12px',fontSize:12,color:T.green}}>Listed @ ${listed.listPrice?.toFixed(2)} · {booked>0?'Your '+booked.toLocaleString()+' shares allocated.':'No booking — missed this one.'}</div>}
    </div>
  );
}

function IPOTab() {
  const {D,bookIPO}=useGame();
  const d=D;
  const [msg,setMsg]=useState('');
  const showMsg=m=>{setMsg(m);setTimeout(()=>setMsg(''),2500);};
  const doBook=(ipo,qStr)=>{const s=parseInt(qStr);if(!s||s<=0)return showMsg('❌ Invalid quantity');const e=bookIPO(ipo.id,s);if(e)showMsg('❌ '+e);else showMsg('✅ Booked '+s.toLocaleString()+' shares in '+ipo.n);};
  return (
    <div>
      <Toast msg={msg}/>
      <div style={{background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:12,padding:'10px 14px',marginBottom:12,fontSize:11,color:'#C4B5FD',lineHeight:1.5}}>
        🚀 Book shares before listing at the midpoint price. Oversubscribed IPOs reduce your allocation. Listing day profit/loss credited instantly.
      </div>
      {IPOS.map(ipo=><IPOItem key={ipo.id} ipo={ipo} d={d} onBook={doBook} walletBalance={d.tradingWallet}/>)}
    </div>
  );
}

// ── BONDS TAB ──────────────────────────────────────────────────
const BOND_DATA = {
  government: [
    {id:'US10Y', n:'Earth 10Y Treasury', yield:5.2, maturity:90, risk:'Low', currency:'USD', minInvest:10000, desc:'Earth government bond. Fixed 5.2% annual yield. Principal + interest returned at maturity (Turn +90).'},
    {id:'EU5Y', n:'Earth 5Y Eurozone', yield:4.1, maturity:60, risk:'Low', currency:'USD', minInvest:5000, desc:'EU sovereign bond. 4.1% yield. Lower rate, lower risk.'},
    {id:'EM3Y', n:'Emerging Market Bond', yield:7.8, maturity:45, risk:'Medium', currency:'USD', minInvest:25000, desc:'Higher yield from emerging economies. Moderate default risk.'},
  ],
  corporate: [
    {id:'SLKT_BOND', n:'Silk Road Tech Bond', yield:9.4, maturity:60, risk:'Medium', currency:'USD', company:'SLKT', minInvest:50000, desc:'Corporate bond issued by Silk Road Tech. Yield tied to company health.'},
    {id:'TNPT_BOND', n:'Titan Petroleum Bond', yield:8.1, maturity:90, risk:'Medium', currency:'USD', company:'TNPT', minInvest:25000, desc:'Energy sector corporate bond. Stable issuer.'},
    {id:'EMTS_BOND', n:'Emerging Tech High Yield', yield:14.2, maturity:30, risk:'High', currency:'USD', company:'EMTS', minInvest:100000, desc:'High-yield bond. Short maturity. Higher default risk.'},
  ],
  cosmic: [
    {id:'MARS_GOV', n:'Mars Government Bond', yield:18.4, maturity:120, risk:'High', currency:'MCR', planet:'Mars', minInvest:100000, desc:'Martian sovereign bond. High yield reflects planetary risk premium.', unlock:'Mars'},
    {id:'JUPITER_CORP', n:'Jupiter Autonomous Corp Bond', yield:24.8, maturity:150, risk:'Very High', currency:'JCR', planet:'Jupiter', minInvest:500000, desc:'Jupiter robotic economy bond. Storm events may delay maturity payout.', unlock:'Jupiter'},
    {id:'NEPTUNE_GOV', n:'Neptune Deep Research Bond', yield:35.0, maturity:200, risk:'Extreme', currency:'NPT', planet:'Neptune', minInvest:10000000, desc:'Highest yielding bond in the solar system. Extreme risk. Research breakthrough events spike value.', unlock:'Neptune'},
  ],
};

const RISK_COLOR = {Low:T.green, Medium:T.amber, High:T.red, 'Very High':'#DC2626', Extreme:'#7F1D1D'};

function BondsTab() {
  const {D, buyBond}=useGame();
  const d=D;
  const [buyModal,setBuyModal]=useState(null);
  const [buyAmt,setBuyAmt]=useState('');
  const [msg,setMsg]=useState('');
  const showMsg=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const allBonds=[...BOND_DATA.government,...BOND_DATA.corporate,...BOND_DATA.cosmic];

  const handleBuy=()=>{
    const amt=parseFloat(buyAmt);
    if(!amt||amt<=0) return showMsg('Enter an amount');
    const err=buyBond(buyModal.id,amt,buyModal);
    if(err) showMsg('❌ '+err);
    else{showMsg('✅ Purchased '+buyModal.n);setBuyModal(null);setBuyAmt('');}
  };

  const BondSection=({title,bonds,ico})=>(
    <div style={{marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:800,color:T.sub,marginBottom:8,textTransform:'uppercase',letterSpacing:1}}>{ico} {title}</div>
      {bonds.map(bond=>{
        const locked=bond.unlock&&d.planetUnlocks?.[bond.unlock]===false;
        return (
          <div key={bond.id} style={{background:T.card,borderRadius:14,padding:14,border:'1px solid '+T.border,marginBottom:8,position:'relative',overflow:'hidden'}}>
            {locked&&(
              <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',borderRadius:14,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:2}}>
                <div style={{fontSize:24,marginBottom:4}}>🔒</div>
                <div style={{fontSize:11,color:'#94A3B8',fontWeight:700}}>Unlock {bond.unlock} first</div>
              </div>
            )}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:800,color:T.text}}>{bond.n}</div>
                <div style={{fontSize:10,color:T.muted,marginTop:2}}>{bond.currency} · Min {fm(bond.minInvest)}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:22,fontWeight:900,color:T.green,fontFamily:'monospace'}}>{bond.yield}%</div>
                <div style={{fontSize:9,color:T.muted}}>annual yield</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <div style={{background:T.bg,borderRadius:6,padding:'5px 8px',fontSize:10,fontWeight:700,color:RISK_COLOR[bond.risk]||T.muted}}>{bond.risk} Risk</div>
              <div style={{background:T.bg,borderRadius:6,padding:'5px 8px',fontSize:10,color:T.muted}}>Matures: T+{bond.maturity}</div>
            </div>
            <div style={{fontSize:11,color:T.sub,lineHeight:1.5,marginBottom:10}}>{bond.desc}</div>
            {!locked&&(
              <button onClick={()=>{setBuyModal(bond);setBuyAmt('');}} style={{width:'100%',background:'linear-gradient(135deg,#1D4ED8,#7C3AED)',color:'#fff',border:'none',borderRadius:10,padding:'11px 0',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                Buy Bond
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <Toast msg={msg}/>
      <div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:12,padding:'10px 14px',marginBottom:12,fontSize:11,color:'#6EE7B7',lineHeight:1.5}}>
        🏦 Bonds pay fixed yield on maturity. Principal + total interest credited to Savings Wallet when bond matures.
      </div>

      {/* Active bonds */}
      {(d.bondHoldings||[]).length>0&&(
        <div style={{background:T.card,borderRadius:14,padding:14,border:'1px solid rgba(16,185,129,0.3)',marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:800,color:T.green,marginBottom:10}}>Your Active Bonds</div>
          {(d.bondHoldings||[]).map((b,i)=>{
            const turnsLeft=b.purchaseTurn+b.maturity-(d.turn||1);
            return (
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,0.3)'}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:T.text}}>{b.n}</div>
                  <div style={{fontSize:10,color:T.muted}}>{b.yield}% · {Math.max(0,turnsLeft)} turns left</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.green,fontFamily:'monospace'}}>{fm(b.principal)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BondSection title="Government Bonds" bonds={BOND_DATA.government} ico="🏛️"/>
      <BondSection title="Corporate Bonds" bonds={BOND_DATA.corporate} ico="🏢"/>
      <BondSection title="Cosmic Bonds" bonds={BOND_DATA.cosmic} ico="🌌"/>

      {buyModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'flex-end',zIndex:400}}>
          <div style={{background:'#0D1B2E',borderRadius:'22px 22px 0 0',padding:22,width:'100%',border:'1px solid rgba(255,255,255,0.12)'}}>
            <div style={{width:40,height:4,background:'rgba(255,255,255,0.15)',borderRadius:2,margin:'0 auto 16px'}}/>
            <div style={{fontSize:16,fontWeight:800,color:T.text,marginBottom:4}}>{buyModal.n}</div>
            <div style={{fontSize:12,color:T.muted,marginBottom:16}}>{buyModal.yield}% annual yield · Matures T+{buyModal.maturity} · Min {fm(buyModal.minInvest)}</div>
            <div style={{fontSize:11,color:T.sub,marginBottom:12}}>Trading Wallet: {fm(d.tradingWallet||0)}</div>
            <input type="number" value={buyAmt} onChange={e=>setBuyAmt(e.target.value)} placeholder={`Min $${buyModal.minInvest.toLocaleString()}`} style={{width:'100%',background:T.bg,border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'14px 16px',color:T.text,fontSize:18,outline:'none',boxSizing:'border-box',marginBottom:10,fontFamily:'monospace'}}/>
            {parseFloat(buyAmt)>0&&(
              <div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:8,padding:'8px 12px',marginBottom:12,fontSize:12,color:T.green}}>
                Projected payout: {fm(parseFloat(buyAmt)*(1+(buyModal.yield/100)*(buyModal.maturity/365)))}
              </div>
            )}
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setBuyModal(null)} style={{flex:1,padding:'14px 0',background:T.raised,border:'1px solid '+T.border,color:T.sub,borderRadius:14,fontWeight:700,fontSize:14,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleBuy} style={{flex:2,padding:'14px 0',background:T.green,color:'#fff',border:'none',borderRadius:14,fontWeight:800,fontSize:16,cursor:'pointer'}}>Buy Bond</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN SCREEN ────────────────────────────────────────────────
const TABS=[{id:'earth',ico:'🌍',l:'Earth'},{id:'planets',ico:'🪐',l:'Planets'},{id:'etf',ico:'📊',l:'ETFs'},{id:'ipo',ico:'🚀',l:'IPOs'},{id:'bonds',ico:'🏦',l:'Bonds'}];

export default function UniverseScreen() {
  const [tab,setTab]=useState('earth');
  return (
    <div style={{background:T.bg,minHeight:'100%'}}>
      <div style={{background:'linear-gradient(180deg,#050F20,#030810)',padding:'18px 16px 0',borderBottom:'1px solid '+T.border}}>
        <div style={{fontSize:11,color:T.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:2}}>Cosmos Capital</div>
        <div style={{fontSize:24,fontWeight:900,color:T.text,marginBottom:14}}>🌌 Universe Exchange</div>
        <div style={{display:'flex',gap:0,background:T.bg,borderRadius:14,padding:3,overflowX:'auto'}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,minWidth:52,padding:'9px 4px',background:tab===t.id?T.card:'transparent',border:tab===t.id?'1px solid '+T.border:'1px solid transparent',borderRadius:11,cursor:'pointer',transition:'all .15s'}}>
              <div style={{fontSize:16}}>{t.ico}</div>
              <div style={{fontSize:10,fontWeight:tab===t.id?700:400,color:tab===t.id?T.text:T.muted,marginTop:2}}>{t.l}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:'14px 16px 80px'}}>
        {tab==='earth'&&<EarthTab/>}
        {tab==='planets'&&<PlanetsTab/>}
        {tab==='etf'&&<ETFTab/>}
        {tab==='ipo'&&<IPOTab/>}
        {tab==='bonds'&&<BondsTab/>}
      </div>
    </div>
  );
}
