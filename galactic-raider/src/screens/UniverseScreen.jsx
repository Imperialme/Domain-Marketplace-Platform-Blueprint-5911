import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';
import { PLANETS_DATA, ETFS, IPOS, SOVEREIGN_FUNDS } from '../constants';

const CS = {
  bg: '#060B14',
  card: { background:'#0D1B2E', borderRadius:16, padding:14, border:'1px solid #1A2744', marginBottom:10 },
  label: { fontSize:10, color:'#4B5563', textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 },
  tab: (active) => ({ flex:1, padding:'9px 0', fontSize:11, fontWeight:700, border:'none', borderRadius:10, cursor:'pointer', background:active?'#1D4ED8':'#0D1B2E', color:active?'#fff':'#4B5563' }),
};

function Sparkline({ hist, ch }) {
  if (!hist || hist.length < 2) return null;
  const h = hist.slice(-20);
  const mn = Math.min(...h), mx = Math.max(...h);
  const pts = h.map((p,i)=>`${i/(h.length-1)*100},${26-(p-mn)/(mx-mn||1)*22}`).join(' ');
  return (
    <svg width="100%" height="26" viewBox="0 0 100 26" preserveAspectRatio="none" style={{display:'block'}}>
      <polyline points={pts} fill="none" stroke={(ch||0)>=0?'#34D399':'#EF4444'} strokeWidth="1.5"/>
    </svg>
  );
}

function TradeModal({ title, price, currency, held, onConfirm, onClose }) {
  const [qty, setQty] = useState('');
  const [isBuy, setIsBuy] = useState(true);
  const q = parseInt(qty)||0;
  const total = q * price;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',display:'flex',alignItems:'flex-end',zIndex:300}}>
      <div style={{background:'#0D1B2E',borderRadius:'20px 20px 0 0',padding:22,width:'100%',border:'1px solid #1A2744'}}>
        <div style={{fontSize:16,fontWeight:800,color:'#F8FAFC',marginBottom:4}}>{title}</div>
        <div style={{fontSize:12,color:'#4B5563',marginBottom:16}}>{currency}{price.toFixed(2)}{held>0?` · Holding: ${held.toLocaleString()}`:''}</div>
        <div style={{display:'flex',gap:6,marginBottom:14}}>
          <button onClick={()=>setIsBuy(true)} style={{flex:1,padding:'9px 0',background:isBuy?'#16A34A':'#060B14',color:isBuy?'#fff':'#4B5563',border:`1px solid ${isBuy?'#16A34A':'#1A2744'}`,borderRadius:10,fontWeight:700,cursor:'pointer'}}>Buy</button>
          {held>0&&<button onClick={()=>setIsBuy(false)} style={{flex:1,padding:'9px 0',background:!isBuy?'#DC2626':'#060B14',color:!isBuy?'#fff':'#4B5563',border:`1px solid ${!isBuy?'#DC2626':'#1A2744'}`,borderRadius:10,fontWeight:700,cursor:'pointer'}}>Sell</button>}
        </div>
        <input type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder="Quantity" style={{width:'100%',background:'#060B14',border:'1px solid #1A2744',borderRadius:10,padding:'12px 14px',color:'#F8FAFC',fontSize:16,marginBottom:10,outline:'none',boxSizing:'border-box'}}/>
        {q>0&&<div style={{background:'#060B14',borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:12,color:'#9CA3AF'}}>Total: {currency}{total.toFixed(2)}{currency!=='$'?` (~${fm(total*(1))})`:''}</div>}
        <div style={{display:'flex',gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:'12px 0',background:'#060B14',border:'1px solid #1A2744',color:'#6B7280',borderRadius:12,fontWeight:700,cursor:'pointer'}}>Cancel</button>
          <button onClick={()=>{if(q>0){onConfirm(isBuy,q);onClose();}}} style={{flex:2,padding:'12px 0',background:isBuy?'#16A34A':'#DC2626',color:'#fff',border:'none',borderRadius:12,fontWeight:800,fontSize:15,cursor:'pointer'}}>
            Confirm {isBuy?'Buy':'Sell'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── EARTH MARKETS ──────────────────────────────────────────────
function EarthTab() {
  const { D, buyStock, sellStock } = useGame();
  const d = D;
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [msg, setMsg] = useState('');
  const showMsg = m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const co = selected ? d.companies?.find(c=>c.t===selected) : null;

  if (co) return (
    <div style={{padding:'0 0 12px'}}>
      <button onClick={()=>setSelected(null)} style={{background:'#0D1B2E',border:'1px solid #1A2744',color:'#9CA3AF',borderRadius:10,padding:'8px 14px',cursor:'pointer',fontSize:12,marginBottom:12}}>← Back</button>
      <div style={CS.card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:'#F8FAFC'}}>{co.n}</div>
            <div style={{fontSize:11,color:'#4B5563'}}>{co.t} · {co.s} · {co.hq}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:22,fontWeight:900,color:'#F8FAFC',fontFamily:'monospace'}}>${co.price.toFixed(2)}</div>
            <div style={{fontSize:12,color:(co.ch||0)>=0?'#34D399':'#EF4444'}}>{(co.ch||0)>=0?'▲':'▼'} {Math.abs((co.ch||0)*100).toFixed(2)}%</div>
          </div>
        </div>
        <div style={{height:50,marginBottom:12}}><Sparkline hist={co.hist} ch={co.ch}/></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:12}}>
          {[['P/E',co.pe?.toFixed(1)||'—'],['Div',co.div+'%'],['Beta',co.b],['CEO',co.ceo?.split(' ').pop()],['Est.',co.yr],['Emp.',''+Math.round((co.emp||0)/1000)+'K']].map(([l,v])=>(
            <div key={l} style={{background:'#060B14',borderRadius:8,padding:'7px 8px'}}>
              <div style={{fontSize:8,color:'#4B5563'}}>{l}</div>
              <div style={{fontSize:11,fontWeight:700,color:'#D1D5DB'}}>{v}</div>
            </div>
          ))}
        </div>
        {(co.analysts||[]).map((a,i)=>(
          <div key={i} style={{background:'#060B14',borderRadius:8,padding:'9px 12px',marginBottom:6}}>
            <div style={{fontSize:11,fontWeight:700,color:a.rating?.includes('BUY')?'#34D399':a.rating==='SELL'?'#EF4444':'#FBBF24'}}>{a.firm} · {a.rating} · ${a.target}</div>
            <div style={{fontSize:10,color:'#6B7280',marginTop:3,lineHeight:1.4}}>{a.note}</div>
          </div>
        ))}
        {d.stockHoldings?.[co.t]>0&&(
          <div style={{background:'#060B14',borderRadius:8,padding:'8px 12px',marginBottom:10,display:'flex',justifyContent:'space-between'}}>
            <div style={{fontSize:11,color:'#9CA3AF'}}>Holding: {(d.stockHoldings[co.t]||0).toLocaleString()} shares</div>
            <div style={{fontSize:11,fontWeight:700,color:co.price>=(d.avgCostBasis?.[co.t]||co.price)?'#34D399':'#EF4444'}}>
              {((co.price-(d.avgCostBasis?.[co.t]||co.price))/(d.avgCostBasis?.[co.t]||co.price)*100).toFixed(1)}%
            </div>
          </div>
        )}
        <button onClick={()=>setModal(co)} style={{width:'100%',background:'linear-gradient(135deg,#16A34A,#059669)',color:'#fff',border:'none',borderRadius:12,padding:'13px 0',fontWeight:800,fontSize:14,cursor:'pointer'}}>
          Trade {co.t}
        </button>
      </div>
      {modal&&<TradeModal title={`Trade ${modal.n}`} price={modal.price} currency="$" held={d.stockHoldings?.[modal.t]||0} onConfirm={(isBuy,q)=>{const err=isBuy?buyStock(modal.t,q):sellStock(modal.t,q);if(err)showMsg(err);else showMsg((isBuy?'Bought':'Sold')+' '+q.toLocaleString()+' '+modal.t);}} onClose={()=>setModal(null)}/>}
      {msg&&<div style={{position:'fixed',bottom:80,left:'50%',transform:'translateX(-50%)',background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 16px',fontSize:12,color:'#93C5FD',whiteSpace:'nowrap',zIndex:200}}>{msg}</div>}
    </div>
  );

  return (
    <div>
      {msg&&<div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}
      {(d.companies||[]).map(co=>(
        <div key={co.t} onClick={()=>setSelected(co.t)} style={{...CS.card,cursor:'pointer',display:'flex',gap:12,alignItems:'center'}}>
          <div style={{flex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:'#F8FAFC'}}>{co.n}</div>
                <div style={{fontSize:10,color:'#4B5563'}}>{co.t} · {co.hq}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:16,fontWeight:900,color:'#F8FAFC',fontFamily:'monospace'}}>${co.price.toFixed(2)}</div>
                <div style={{fontSize:11,color:(co.ch||0)>=0?'#34D399':'#EF4444'}}>{(co.ch||0)>=0?'▲':'▼'}{Math.abs((co.ch||0)*100).toFixed(1)}%</div>
              </div>
            </div>
            <div style={{height:28}}><Sparkline hist={co.hist} ch={co.ch}/></div>
          </div>
          {d.stockHoldings?.[co.t]>0&&<div style={{background:'#16A34A22',border:'1px solid #16A34A44',borderRadius:6,padding:'3px 7px',fontSize:9,color:'#34D399',fontWeight:700,whiteSpace:'nowrap'}}>{(d.stockHoldings[co.t]||0).toLocaleString()}</div>}
        </div>
      ))}
    </div>
  );
}

// ── PLANETS ────────────────────────────────────────────────────
function PlanetsTab() {
  const { D, buyPlanetStock, sellPlanetStock } = useGame();
  const d = D;
  const [planet, setPlanet] = useState(null);
  const [modal, setModal] = useState(null);
  const [msg, setMsg] = useState('');
  const showMsg = m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  if (planet) {
    const pd = PLANETS_DATA[planet];
    const pState = d.planetCompanies?.[planet];
    if (!pd||!pState) return null;
    return (
      <div>
        <button onClick={()=>setPlanet(null)} style={{background:'#0D1B2E',border:'1px solid #1A2744',color:'#9CA3AF',borderRadius:10,padding:'8px 14px',cursor:'pointer',fontSize:12,marginBottom:12}}>← Solar System</button>
        <div style={{background:`linear-gradient(135deg,${pd.color}18,${pd.color}28)`,borderRadius:16,padding:14,border:`1px solid ${pd.color}40`,marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:24}}>{pd.ico}</div>
              <div style={{fontSize:18,fontWeight:900,color:'#F8FAFC'}}>{pd.name}</div>
              <div style={{fontSize:10,color:'#9CA3AF',marginTop:3}}>{pd.desc}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:10,color:'#4B5563'}}>Rate</div>
              <div style={{fontSize:20,fontWeight:800,color:pd.color,fontFamily:'monospace'}}>${pd.rate.toFixed(2)}</div>
              <div style={{fontSize:10,color:'#4B5563'}}>GDP: {pState.gdp}%</div>
            </div>
          </div>
          {pState.stormActive&&<div style={{marginTop:8,background:'#7F1D1D',border:'1px solid #EF4444',borderRadius:8,padding:'6px 10px',fontSize:11,color:'#FCA5A5'}}>⚡ Storm active — prices 70%. Buy the dip!</div>}
        </div>
        {pState.cos.map(co=>{
          const key=planet+'_'+co.t;
          const held=d.planetHoldings?.[key]||0;
          const avg=d.planetAvgCost?.[key]||co.price;
          const gain=held>0?(co.price-avg)/avg*100:0;
          return (
            <div key={co.t} style={CS.card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:'#F8FAFC'}}>{co.n}</div>
                  <div style={{fontSize:10,color:'#4B5563'}}>{co.t} · {co.s}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:16,fontWeight:800,color:'#F8FAFC',fontFamily:'monospace'}}>{pd.currency} {co.price.toFixed(2)}</div>
                  <div style={{fontSize:11,color:(co.ch||0)>=0?'#34D399':'#EF4444'}}>{(co.ch||0)>=0?'▲':'▼'}{Math.abs((co.ch||0)*100).toFixed(1)}%</div>
                </div>
              </div>
              <div style={{height:26,marginBottom:8}}><Sparkline hist={co.hist} ch={co.ch}/></div>
              {held>0&&<div style={{background:'#060B14',borderRadius:8,padding:'6px 10px',marginBottom:8,display:'flex',justifyContent:'space-between'}}>
                <div style={{fontSize:11,color:'#9CA3AF'}}>{held.toLocaleString()} shares · {fm(held*co.price*pd.rate)}</div>
                <div style={{fontSize:11,fontWeight:700,color:gain>=0?'#34D399':'#EF4444'}}>{gain>=0?'+':''}{gain.toFixed(1)}%</div>
              </div>}
              <button onClick={()=>setModal({co,pd,planet,held})} style={{width:'100%',background:'#16A34A',color:'#fff',border:'none',borderRadius:10,padding:'10px 0',fontWeight:700,fontSize:13,cursor:'pointer'}}>Trade</button>
            </div>
          );
        })}
        {modal&&<TradeModal title={`Trade ${modal.co.n}`} price={modal.co.price} currency={modal.pd.currency+' '} held={modal.held} onConfirm={(isBuy,q)=>{const err=isBuy?buyPlanetStock(modal.planet,modal.co.t,q):null;if(!isBuy)sellPlanetStock(modal.planet,modal.co.t,q);if(err)showMsg(err);else showMsg((isBuy?'Bought':'Sold')+' '+q+' '+modal.co.t);}} onClose={()=>setModal(null)}/>}
        {msg&&<div style={{position:'fixed',bottom:80,left:'50%',transform:'translateX(-50%)',background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 16px',fontSize:12,color:'#93C5FD',whiteSpace:'nowrap',zIndex:200}}>{msg}</div>}
      </div>
    );
  }

  return (
    <div>
      {Object.entries(PLANETS_DATA).map(([pName,pd])=>{
        const pState=d.planetCompanies?.[pName];
        const holdings=Object.entries(d.planetHoldings||{}).filter(([k])=>k.startsWith(pName+'_'));
        const totalVal=holdings.reduce((s,[key,n])=>{
          const t=key.split('_')[1];const co=pState?.cos?.find(c=>c.t===t);return s+(co?n*co.price*pd.rate:0);
        },0);
        return (
          <div key={pName} onClick={()=>setPlanet(pName)} style={{...CS.card,background:`linear-gradient(135deg,${pd.color}10,${pd.color}18)`,border:`1px solid ${pd.color}30`,cursor:'pointer'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{fontSize:26}}>{pd.ico}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:'#F8FAFC'}}>{pd.name}</div>
                  <div style={{fontSize:10,color:'#4B5563'}}>{pd.currency} · {pd.companies.length} cos · GDP {pState?.gdp||0}%</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14,fontWeight:800,color:pd.color,fontFamily:'monospace'}}>${pd.rate.toFixed(2)}</div>
                {totalVal>0&&<div style={{fontSize:10,color:'#34D399'}}>{fm(totalVal)}</div>}
                {pState?.stormActive&&<div style={{fontSize:10,color:'#EF4444'}}>⚡ Storm</div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── ETF TAB ────────────────────────────────────────────────────
function ETFTab() {
  const { D, buyETF, sellETF } = useGame();
  const d = D;
  const [modal, setModal] = useState(null);
  const [msg, setMsg] = useState('');
  const showMsg = m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};
  return (
    <div>
      {msg&&<div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}
      <div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',marginBottom:10,fontSize:11,color:'#6B7280'}}>
        ETFs track asset baskets. Dividends paid every 30 turns to Trading Wallet.
      </div>
      {(d.etfs||[]).map(e=>{
        const val=e.price*e.units;
        const gain=e.units>0?(e.price-e.avgCost)/e.avgCost*100:0;
        return (
          <div key={e.id} style={CS.card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:'#F8FAFC'}}>{e.n}</div>
                <div style={{fontSize:10,color:'#4B5563'}}>{e.id} · {e.type} · {e.expense}% fee</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:18,fontWeight:900,color:'#F8FAFC',fontFamily:'monospace'}}>${e.price.toFixed(2)}</div>
                <div style={{fontSize:11,color:(e.ch||0)>=0?'#34D399':'#EF4444'}}>{(e.ch||0)>=0?'▲':'▼'}{Math.abs((e.ch||0)*100).toFixed(2)}%</div>
              </div>
            </div>
            <div style={{height:26,marginBottom:8}}><Sparkline hist={e.hist} ch={e.ch}/></div>
            <div style={{display:'flex',gap:6,marginBottom:10}}>
              {[['Div',e.div+'%'],['Sharpe',e.sharpe],['MaxDD',(e.maxDD*100).toFixed(0)+'%']].map(([l,v])=>(
                <div key={l} style={{flex:1,background:'#060B14',borderRadius:6,padding:'6px 0',textAlign:'center'}}>
                  <div style={{fontSize:8,color:'#4B5563'}}>{l}</div>
                  <div style={{fontSize:11,fontWeight:700,color:'#D1D5DB'}}>{v}</div>
                </div>
              ))}
            </div>
            {e.units>0&&<div style={{background:'#060B14',borderRadius:8,padding:'7px 10px',marginBottom:8,display:'flex',justifyContent:'space-between'}}>
              <div style={{fontSize:11,color:'#9CA3AF'}}>{e.units.toLocaleString()} units · {fm(val)}</div>
              <div style={{fontSize:11,fontWeight:700,color:gain>=0?'#34D399':'#EF4444'}}>{gain>=0?'+':''}{gain.toFixed(1)}%</div>
            </div>}
            <button onClick={()=>setModal(e)} style={{width:'100%',background:'#1D4ED8',color:'#fff',border:'none',borderRadius:10,padding:'10px 0',fontWeight:700,fontSize:13,cursor:'pointer'}}>Trade ETF</button>
          </div>
        );
      })}
      {modal&&<TradeModal title={`Trade ${modal.n}`} price={modal.price} currency="$" held={modal.units} onConfirm={(isBuy,q)=>{const err=isBuy?buyETF(modal.id,q):null;if(!isBuy)sellETF(modal.id,q);if(err)showMsg(err);else showMsg((isBuy?'Bought':'Sold')+' '+q+' units');}} onClose={()=>setModal(null)}/>}
    </div>
  );
}

// ── IPO TAB ────────────────────────────────────────────────────
function IPOItem({ ipo, d, onBook }) {
  const [qty, setQty] = useState('');
  const booked = d.ipoBookings?.[ipo.id]||0;
  const listed = d.ipoListed?.[ipo.id];
  const opensIn = ipo.opens - d.turn;
  return (
    <div style={{...CS.card,border:listed?'1px solid #34D399':opensIn<=0?'1px solid #EF4444':'1px solid #1A2744'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div>
          <div style={{fontSize:11,color:'#4B5563',textTransform:'uppercase',letterSpacing:1}}>{ipo.sector}·{ipo.planet}</div>
          <div style={{fontSize:14,fontWeight:800,color:'#F8FAFC',marginTop:2}}>{ipo.n}</div>
        </div>
        {listed?<div style={{background:'#14532D',color:'#34D399',padding:'3px 10px',borderRadius:20,fontSize:10,fontWeight:700}}>LISTED</div>
        :<div style={{background:'#060B14',color:'#4B5563',padding:'3px 10px',borderRadius:20,fontSize:10}}>T{ipo.opens}</div>}
      </div>
      <div style={{fontSize:11,color:'#6B7280',lineHeight:1.5,marginBottom:8}}>{ipo.desc}</div>
      <div style={{display:'flex',gap:6,marginBottom:8}}>
        {[['Range','$'+ipo.priceRange[0]+'-'+ipo.priceRange[1]],['Demand',ipo.oversubscribed.toFixed(1)+'×'],['Booked',booked.toLocaleString()]].map(([l,v])=>(
          <div key={l} style={{flex:1,background:'#060B14',borderRadius:6,padding:'6px 0',textAlign:'center'}}>
            <div style={{fontSize:8,color:'#4B5563'}}>{l}</div>
            <div style={{fontSize:11,fontWeight:700,color:'#D1D5DB',fontFamily:'monospace'}}>{v}</div>
          </div>
        ))}
      </div>
      {!listed&&opensIn>0&&(
        <div style={{display:'flex',gap:8}}>
          <input type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder="Shares" style={{flex:1,background:'#060B14',border:'1px solid #1A2744',borderRadius:8,padding:'9px 12px',color:'#F8FAFC',fontSize:13,outline:'none'}}/>
          <button onClick={()=>{onBook(ipo,qty);setQty('');}} style={{background:'#7C3AED',color:'#fff',border:'none',borderRadius:8,padding:'9px 16px',fontWeight:700,fontSize:13,cursor:'pointer'}}>Book</button>
        </div>
      )}
      {listed&&<div style={{background:'#14532D',borderRadius:8,padding:'8px 10px',fontSize:11,color:'#34D399'}}>Listed @ ${listed.listPrice?.toFixed(2)} · {booked>0?'Your '+booked.toLocaleString()+' shares allocated.':'No booking.'}</div>}
    </div>
  );
}

function IPOTab() {
  const { D, bookIPO } = useGame();
  const d = D;
  const [msg, setMsg] = useState('');
  const showMsg = m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};
  const doBook=(ipo,qtyStr)=>{
    const s=parseInt(qtyStr);
    if(isNaN(s)||s<=0)return showMsg('Invalid quantity');
    const err=bookIPO(ipo.id,s);
    if(err)showMsg(err);else showMsg('Booked '+s.toLocaleString()+' in '+ipo.n);
  };
  return (
    <div>
      {msg&&<div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}
      <div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',marginBottom:10,fontSize:11,color:'#6B7280'}}>
        Book IPO shares before listing day. Funds held at midpoint. Allocation credited on open.
      </div>
      {IPOS.map(ipo=><IPOItem key={ipo.id} ipo={ipo} d={d} onBook={doBook}/>)}
    </div>
  );
}

// ── MAIN UNIVERSE SCREEN ───────────────────────────────────────
export default function UniverseScreen() {
  const [tab, setTab] = useState('earth');
  const tabs = [{id:'earth',l:'🌍 Earth'},{id:'planets',l:'🌌 Planets'},{id:'etf',l:'📊 ETFs'},{id:'ipo',l:'🚀 IPOs'}];
  return (
    <div style={{padding:'14px 14px 80px',background:'#060B14',minHeight:'100%'}}>
      <div style={{fontSize:18,fontWeight:900,color:'#F8FAFC',marginBottom:12}}>🌌 Universe Exchange</div>
      <div style={{display:'flex',gap:6,marginBottom:14}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={CS.tab(tab===t.id)}>{t.l}</button>
        ))}
      </div>
      {tab==='earth'&&<EarthTab/>}
      {tab==='planets'&&<PlanetsTab/>}
      {tab==='etf'&&<ETFTab/>}
      {tab==='ipo'&&<IPOTab/>}
    </div>
  );
}
