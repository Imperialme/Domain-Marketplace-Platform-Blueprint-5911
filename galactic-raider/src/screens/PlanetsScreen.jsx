import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';
import { PLANETS_DATA } from '../constants';

const Card = ({ children, style }) => (
  <div style={{ background: C.card, borderRadius: 14, padding: 14, border: '1px solid '+C.border, ...style }}>{children}</div>
);

export default function PlanetsScreen() {
  const { D, buyPlanetStock, sellPlanetStock } = useGame();
  const d = D;
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [tradeModal, setTradeModal] = useState(null);
  const [qty, setQty] = useState('');
  const [msg, setMsg] = useState('');

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const planetList = Object.entries(PLANETS_DATA);

  const doTrade = (isBuy) => {
    const q = parseInt(qty);
    if (isNaN(q) || q <= 0) return showMsg('Enter valid quantity');
    if (isBuy) {
      const err = buyPlanetStock(tradeModal.planet, tradeModal.co.t, q);
      if (err) showMsg(err);
      else showMsg(`Bought ${q.toLocaleString()} ${tradeModal.co.t}`);
    } else {
      sellPlanetStock(tradeModal.planet, tradeModal.co.t, q);
      showMsg(`Sold ${q.toLocaleString()} ${tradeModal.co.t}`);
    }
    setTradeModal(null);
    setQty('');
  };

  if (selectedPlanet) {
    const pd = PLANETS_DATA[selectedPlanet];
    const pState = d.planetCompanies?.[selectedPlanet];
    if (!pd || !pState) return null;
    const planetColor = pd.color || C.muted;

    return (
      <div style={{ padding: '14px 14px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msg && <div style={{ background: '#1E3A5F', border: '1px solid '+C.blue, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.blueText, fontWeight: 600 }}>{msg}</div>}

        <button onClick={() => setSelectedPlanet(null)} style={{ background: C.card, border: '1px solid '+C.border, color: C.text, borderRadius: 10, padding: '9px 14px', cursor: 'pointer', fontSize: 12, textAlign: 'left' }}>
          ← Back to Solar System
        </button>

        {/* Planet Header */}
        <div style={{ background: `linear-gradient(135deg, ${planetColor}22, ${planetColor}44)`, borderRadius: 16, padding: 16, border: `1px solid ${planetColor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{pd.ico}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{pd.name}</div>
              <div style={{ fontSize: 11, color: '#ccc', marginTop: 4, lineHeight: 1.4 }}>{pd.desc}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: '#aaa' }}>Currency</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: planetColor, fontFamily: 'monospace' }}>{pd.currency}</div>
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>1 {pd.currency} = ${pd.rate.toFixed(2)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {[['GDP',pState.gdp+'%', pState.gdp >= 0 ? C.green : C.red],['Companies',pState.cos.length,C.blue],['Storm',pState.stormActive ? '⚡ ACTIVE' : 'Clear', pState.stormActive ? C.red : C.green],['Contagion',pd.contagionDelay+'T delay',C.muted]].map(([l,v,c]) => (
              <div key={l} style={{ flex:1, background:'rgba(0,0,0,0.3)', borderRadius:8, padding:'6px 0', textAlign:'center' }}>
                <div style={{ fontSize:8, color:'#888' }}>{l}</div>
                <div style={{ fontSize:11, fontWeight:700, color:c, fontFamily:'monospace' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {pState.stormActive && (
          <div style={{ background: '#7F1D1D', border: '1px solid '+C.red, borderRadius: 10, padding: '10px 14px', fontSize: 11, color: C.redText }}>
            ⚡ STORM EVENT ACTIVE — All company prices at 70%. Buy the dip now! Storm ends in ~20 turns.
          </div>
        )}

        {/* Planet Companies */}
        {pState.cos.map(co => {
          const key = selectedPlanet + '_' + co.t;
          const held = d.planetHoldings?.[key] || 0;
          const avgCost = d.planetAvgCost?.[key] || co.price;
          const gainPct = held > 0 ? ((co.price - avgCost) / avgCost * 100) : 0;

          return (
            <Card key={co.t}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{co.n}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{co.t} · {co.s}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.text, fontFamily: 'monospace' }}>{pd.currency} {co.price.toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: (co.ch||0) >= 0 ? C.green : C.red, fontFamily: 'monospace' }}>
                    {(co.ch||0) >= 0 ? '▲' : '▼'} {Math.abs((co.ch||0)*100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Sparkline */}
              {(co.hist||[]).length > 2 && (
                <div style={{ height: 32, marginBottom: 8, overflow: 'hidden' }}>
                  <svg width="100%" height="32" viewBox={`0 0 100 32`} preserveAspectRatio="none">
                    {(() => {
                      const hist = (co.hist||[]).slice(-20);
                      const mn = Math.min(...hist), mx = Math.max(...hist);
                      const pts = hist.map((p,i) => `${i/(hist.length-1)*100},${32-(p-mn)/(mx-mn||1)*28}`).join(' ');
                      return <polyline points={pts} fill="none" stroke={(co.ch||0)>=0 ? C.green : C.red} strokeWidth="1.5" />;
                    })()}
                  </svg>
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {[['USD Cost','$'+(co.price*pd.rate).toFixed(2)],['Div',co.div+'%/yr'],['Beta',co.b]].map(([l,v]) => (
                  <div key={l} style={{ flex:1, background:C.bg, borderRadius:6, padding:'5px 0', textAlign:'center' }}>
                    <div style={{ fontSize:8, color:C.muted }}>{l}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:C.text }}>{v}</div>
                  </div>
                ))}
              </div>

              {held > 0 && (
                <div style={{ background: C.bg, borderRadius: 8, padding: '7px 10px', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, color: C.dim }}>Holding: {held.toLocaleString()} shares</div>
                  <div style={{ fontSize: 11, color: gainPct >= 0 ? C.green : C.red, fontWeight: 700 }}>{gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setTradeModal({planet: selectedPlanet, co, pd, isBuy: true}); setQty(''); }} style={{ flex:1, background:C.green, color:'#fff', border:'none', borderRadius:8, padding:'9px 0', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                  Buy
                </button>
                {held > 0 && (
                  <button onClick={() => { setTradeModal({planet: selectedPlanet, co, pd, isBuy: false}); setQty(''); }} style={{ flex:1, background:C.red, color:'#fff', border:'none', borderRadius:8, padding:'9px 0', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                    Sell
                  </button>
                )}
              </div>
            </Card>
          );
        })}

        {/* Trade Modal */}
        {tradeModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}>
            <div style={{ background: C.card, borderRadius: '18px 18px 0 0', padding: 20, width: '100%', border: '1px solid '+C.border }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 4 }}>{tradeModal.isBuy ? 'Buy' : 'Sell'} {tradeModal.co.n}</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>{tradeModal.pd.currency} {tradeModal.co.price.toFixed(2)} · ~${(tradeModal.co.price * tradeModal.pd.rate).toFixed(2)} USD</div>
              <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Quantity" style={{ width: '100%', background: C.bg, border: '1px solid '+C.border, borderRadius: 8, padding: '10px 14px', color: C.text, fontSize: 14, marginBottom: 12, outline: 'none', boxSizing: 'border-box' }} />
              {qty > 0 && (
                <div style={{ background: C.bg, borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: C.dim }}>
                  Total USD: ~${(parseInt(qty)||0) * tradeModal.co.price * tradeModal.pd.rate > 0 ? fm((parseInt(qty)||0) * tradeModal.co.price * tradeModal.pd.rate) : '$0.00'}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setTradeModal(null); setQty(''); }} style={{ flex:1, background:C.bg, border:'1px solid '+C.border, color:C.dim, borderRadius:10, padding:'11px 0', fontWeight:700, cursor:'pointer' }}>Cancel</button>
                <button onClick={() => doTrade(tradeModal.isBuy)} style={{ flex:2, background:tradeModal.isBuy ? C.green : C.red, color:'#fff', border:'none', borderRadius:10, padding:'11px 0', fontWeight:800, cursor:'pointer' }}>
                  Confirm {tradeModal.isBuy ? 'Buy' : 'Sell'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PLANET LIST VIEW
  return (
    <div style={{ padding: '14px 14px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {msg && <div style={{ background: '#1E3A5F', border: '1px solid '+C.blue, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.blueText, fontWeight: 600 }}>{msg}</div>}

      <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', borderRadius: 16, padding: 14, border: '1px solid '+C.border }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 4 }}>🌌 Solar System Exchange</div>
        <div style={{ fontSize: 11, color: C.dim }}>8 planet economies with unique currencies, risk profiles, and contagion chains. Tap any planet to trade.</div>
      </div>

      {/* Planet Holdings Summary */}
      {Object.keys(d.planetHoldings||{}).length > 0 && (
        <Card>
          <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Your Planet Holdings</div>
          {Object.entries(d.planetHoldings||{}).filter(([,n]) => n > 0).map(([key, n]) => {
            const [planet, ticker] = key.split('_');
            const pd = PLANETS_DATA[planet];
            const pState = d.planetCompanies?.[planet];
            const co = pState?.cos?.find(c => c.t === ticker);
            if (!co || !pd) return null;
            const val = n * co.price * pd.rate;
            const avg = d.planetAvgCost?.[key] || co.price;
            const gain = (co.price - avg) / avg * 100;
            return (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid '+C.border }}>
                <div>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{pd.ico} {ticker} · {planet}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{n.toLocaleString()} shares</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.text, fontFamily: 'monospace' }}>{fm(val)}</div>
                  <div style={{ fontSize: 10, color: gain >= 0 ? C.green : C.red }}>{gain >= 0 ? '+' : ''}{gain.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Planet Grid */}
      {planetList.map(([pName, pd]) => {
        const pState = d.planetCompanies?.[pName];
        const planetColor = pd.color || C.muted;
        const holdings = Object.entries(d.planetHoldings||{}).filter(([k]) => k.startsWith(pName+'_') && d.planetHoldings[k] > 0);
        const totalVal = holdings.reduce((sum, [key, n]) => {
          const ticker = key.split('_')[1];
          const co = pState?.cos?.find(c => c.t === ticker);
          return sum + (co ? n * co.price * pd.rate : 0);
        }, 0);

        return (
          <div key={pName} onClick={() => setSelectedPlanet(pName)} style={{ background: `linear-gradient(135deg, ${planetColor}11, ${planetColor}22)`, borderRadius: 14, padding: 14, border: `1px solid ${planetColor}44`, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 28 }}>{pd.ico}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{pd.name}</div>
                  <div style={{ fontSize: 10, color: '#aaa' }}>{pd.currency} · {pd.companies.length} companies</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#aaa' }}>Exchange Rate</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: planetColor, fontFamily: 'monospace' }}>${pd.rate.toFixed(2)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['GDP',(pState?.gdp||0)+'%',(pState?.gdp||0)>=0?C.green:C.red],['Storm',pState?.stormActive?'⚡ Active':'Clear',pState?.stormActive?C.red:C.green],['Holdings',totalVal>0?fm(totalVal):'None',totalVal>0?C.amber:C.muted],['Rate','$'+pd.rate,C.blue]].map(([l,v,c]) => (
                <div key={l} style={{ flex:1, background:'rgba(0,0,0,0.3)', borderRadius:6, padding:'5px 0', textAlign:'center' }}>
                  <div style={{ fontSize:8, color:'#888' }}>{l}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:c, fontFamily:'monospace' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: '#888', lineHeight: 1.4 }}>{pd.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
