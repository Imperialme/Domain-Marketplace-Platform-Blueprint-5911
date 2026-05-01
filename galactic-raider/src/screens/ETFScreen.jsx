import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';
import { SOVEREIGN_FUNDS, IPOS } from '../constants';

const Card = ({ children, style }) => (
  <div style={{ background: C.card, borderRadius: 14, padding: 14, border: '1px solid '+C.border, ...style }}>{children}</div>
);

const SectionHeader = ({ label }) => (
  <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{label}</div>
);

function IPOCard({ ipo, d, onBook, showMsg }) {
  const [ipoQty, setIpoQty] = useState('');
  const booked = d.ipoBookings?.[ipo.id] || 0;
  const listed = d.ipoListed?.[ipo.id];
  const opensIn = ipo.opens - d.turn;

  return (
    <Card style={{ border: listed ? '1px solid '+C.green : opensIn <= 0 ? '1px solid '+C.red : '1px solid '+C.border }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 9, color: C.muted, textTransform:'uppercase', letterSpacing:1 }}>{ipo.sector} · {ipo.planet}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginTop: 2 }}>{ipo.n}</div>
        </div>
        {listed
          ? <div style={{ background:C.greenBg, color:C.greenText, padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:700 }}>LISTED</div>
          : <div style={{ background:C.bg, color:C.muted, padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:700 }}>T{ipo.opens}</div>
        }
      </div>
      <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.4, marginBottom: 10 }}>{ipo.desc}</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[['Price Range','$'+ipo.priceRange[0]+'-'+ipo.priceRange[1]],['Demand',ipo.oversubscribed.toFixed(1)+'×'],['Opens', listed ? 'LIVE' : (opensIn > 0 ? 'T'+ipo.opens : 'PASSED')],['Booked',booked.toLocaleString()]].map(([l,v]) => (
          <div key={l} style={{ flex:1, background:C.bg, borderRadius:6, padding:'5px 0', textAlign:'center' }}>
            <div style={{ fontSize:8, color:C.muted }}>{l}</div>
            <div style={{ fontSize:10, fontWeight:700, color:C.text, fontFamily:'monospace' }}>{v}</div>
          </div>
        ))}
      </div>
      {ipo.analysts.map((a, i) => (
        <div key={i} style={{ background:C.bg, borderRadius:8, padding:'7px 10px', marginBottom:6 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.green }}>{a.firm} · {a.view} · Target: ${a.target}</div>
          <div style={{ fontSize:10, color:C.dim, marginTop:2 }}>{a.note}</div>
        </div>
      ))}
      {!listed && opensIn > 0 && (
        <div style={{ display:'flex', gap:8, marginTop:4 }}>
          <input type="number" value={ipoQty} onChange={e => setIpoQty(e.target.value)} placeholder="Shares to book" style={{ flex:1, background:C.bg, border:'1px solid '+C.border, borderRadius:8, padding:'8px 10px', color:C.text, fontSize:12, outline:'none' }} />
          <button onClick={() => { onBook(ipo, ipoQty); setIpoQty(''); }} style={{ background:C.purple, color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontWeight:700, fontSize:12, cursor:'pointer' }}>
            Book
          </button>
        </div>
      )}
      {listed && (
        <div style={{ background:C.greenBg, borderRadius:8, padding:'8px 10px', fontSize:11, color:C.greenText }}>
          Listed @ ${listed.listPrice?.toFixed(2)} · {booked > 0 ? 'Your '+booked.toLocaleString()+' shares allocated.' : 'You had no booking.'}
        </div>
      )}
    </Card>
  );
}

function FundCard({ fund, d, onDeposit, onWithdraw }) {
  const [depAmt, setDepAmt] = useState('');
  const fd = d.fundDeposits?.[fund.id] || { deposit:0, earned:0 };

  return (
    <Card style={{ border: fd.deposit > 0 ? `1px solid ${fund.color}` : '1px solid '+C.border }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{fund.ico} {fund.n}</div>
          <div style={{ fontSize: 10, color: C.muted }}>{fund.id} · {fund.currency}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: fund.color, fontFamily: 'monospace' }}>{fund.rate}%</div>
          <div style={{ fontSize: 9, color: C.muted }}>APR</div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: C.dim, marginBottom: 10, lineHeight: 1.4 }}>{fund.desc}</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[['AUM',fm(fund.aum)],['Your Deposit',fm(fd.deposit)],['Earned',fm(fd.earned||0)]].map(([l,v]) => (
          <div key={l} style={{ flex:1, background:C.bg, borderRadius:6, padding:'6px 0', textAlign:'center' }}>
            <div style={{ fontSize:8, color:C.muted }}>{l}</div>
            <div style={{ fontSize:10, fontWeight:800, color: l==='Earned' ? C.green : C.text, fontFamily:'monospace' }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="number" value={depAmt} onChange={e => setDepAmt(e.target.value)} placeholder="Deposit amount" style={{ flex:1, background:C.bg, border:'1px solid '+C.border, borderRadius:8, padding:'8px 10px', color:C.text, fontSize:12, outline:'none' }} />
        <button onClick={() => { onDeposit(fund.id, depAmt); setDepAmt(''); }} style={{ background:C.green, color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontWeight:700, fontSize:12, cursor:'pointer' }}>
          Deposit
        </button>
        {fd.deposit > 0 && (
          <button onClick={() => onWithdraw(fund.id)} style={{ background:C.red, color:'#fff', border:'none', borderRadius:8, padding:'8px 10px', fontWeight:700, fontSize:12, cursor:'pointer' }}>
            Out
          </button>
        )}
      </div>
    </Card>
  );
}

export default function ETFScreen() {
  const { D, buyETF, sellETF, depositFund, withdrawFund, bookIPO } = useGame();
  const d = D;
  const [activeTab, setActiveTab] = useState('etf');
  const [tradeModal, setTradeModal] = useState(null);
  const [qty, setQty] = useState('');
  const [msg, setMsg] = useState('');

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const doETFTrade = (isBuy) => {
    const q = parseInt(qty);
    if (isNaN(q) || q <= 0) return showMsg('Enter valid quantity');
    if (isBuy) {
      const err = buyETF(tradeModal.id, q);
      if (err) showMsg(err);
      else showMsg(`Bought ${q} units of ${tradeModal.n}`);
    } else {
      sellETF(tradeModal.id, q);
      showMsg(`Sold ${q} units of ${tradeModal.n}`);
    }
    setTradeModal(null);
    setQty('');
  };

  const doFundDeposit = (fundId, amtStr) => {
    const amt = parseFloat(amtStr);
    if (isNaN(amt) || amt <= 0) return showMsg('Invalid amount');
    const err = depositFund(fundId, amt);
    if (err) showMsg(err);
    else showMsg('Deposited '+fm(amt)+' (2% entry fee)');
  };

  const doFundWithdraw = (fundId) => {
    withdrawFund(fundId);
    showMsg('Withdrawn from fund');
  };

  const doIPOBook = (ipo, sharesStr) => {
    const shares = parseInt(sharesStr);
    if (isNaN(shares) || shares <= 0) return showMsg('Invalid shares');
    const err = bookIPO(ipo.id, shares);
    if (err) showMsg(err);
    else showMsg('Booked '+shares.toLocaleString()+' shares in '+ipo.n);
  };

  const tabs = ['etf', 'ipo', 'funds'];
  const tabLabels = { etf: '📊 ETFs', ipo: '🚀 IPOs', funds: '💎 Funds' };

  return (
    <div style={{ padding: '14px 14px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {msg && <div style={{ background: '#1E3A5F', border: '1px solid '+C.blue, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.blueText, fontWeight: 600 }}>{msg}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, background: activeTab===t ? C.purple : C.card, border: '1px solid '+(activeTab===t ? C.purple : C.border), color: activeTab===t ? '#fff' : C.muted, borderRadius: 10, padding: '8px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {/* ETF TAB */}
      {activeTab === 'etf' && <>
        <div style={{ background: '#1E293B', border: '1px solid '+C.border, borderRadius: 10, padding: '10px 14px', fontSize: 10, color: C.dim }}>
          ETFs track baskets of assets. Expense ratios charged on purchase. Dividends paid to Trading Wallet every 30 turns.
        </div>
        {(d.etfs||[]).map(e => {
          const value = e.price * e.units;
          const gain = e.units > 0 ? ((e.price - e.avgCost) / e.avgCost * 100) : 0;
          return (
            <Card key={e.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{e.n}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{e.id} · {e.type} · {e.expense}% expense</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.text, fontFamily: 'monospace' }}>${e.price.toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: (e.ch||0) >= 0 ? C.green : C.red }}>{(e.ch||0) >= 0 ? '▲' : '▼'} {Math.abs((e.ch||0)*100).toFixed(2)}%</div>
                </div>
              </div>

              {/* Sparkline */}
              {(e.hist||[]).length > 2 && (
                <div style={{ height: 28, marginBottom: 8 }}>
                  <svg width="100%" height="28" viewBox="0 0 100 28" preserveAspectRatio="none">
                    {(() => {
                      const hist = (e.hist||[]).slice(-20);
                      const mn = Math.min(...hist), mx = Math.max(...hist);
                      const pts = hist.map((p,i) => `${i/(hist.length-1)*100},${28-(p-mn)/(mx-mn||1)*24}`).join(' ');
                      return <polyline points={pts} fill="none" stroke={(e.ch||0)>=0 ? C.green : C.red} strokeWidth="1.5" />;
                    })()}
                  </svg>
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {[['Div',e.div+'%'],['Sharpe',e.sharpe],['MaxDD',(e.maxDD*100).toFixed(0)+'%'],['YTD',((e.ytd||0)*100).toFixed(1)+'%']].map(([l,v]) => (
                  <div key={l} style={{ flex:1, background:C.bg, borderRadius:6, padding:'5px 0', textAlign:'center' }}>
                    <div style={{ fontSize:8, color:C.muted }}>{l}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:C.text }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: C.dim, marginBottom: 10, lineHeight: 1.4 }}>{e.desc}</div>

              {e.units > 0 && (
                <div style={{ background: C.bg, borderRadius: 8, padding: '8px 12px', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, color: C.dim }}>{e.units.toLocaleString()} units · {fm(value)}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: gain >= 0 ? C.green : C.red }}>{gain >= 0 ? '+' : ''}{gain.toFixed(1)}%</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setTradeModal({...e, isBuy:true}); setQty(''); }} style={{ flex:1, background:C.green, color:'#fff', border:'none', borderRadius:8, padding:'9px 0', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                  Buy
                </button>
                {e.units > 0 && (
                  <button onClick={() => { setTradeModal({...e, isBuy:false}); setQty(''); }} style={{ flex:1, background:C.red, color:'#fff', border:'none', borderRadius:8, padding:'9px 0', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                    Sell
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </>}

      {/* IPO TAB */}
      {activeTab === 'ipo' && <>
        <div style={{ background: '#1E293B', border: '1px solid '+C.border, borderRadius: 10, padding: '10px 14px', fontSize: 10, color: C.dim }}>
          Book IPO shares before listing. Funds locked at midpoint price. Allocated shares + profit/loss credited on listing day.
        </div>
        {IPOS.map(ipo => (
          <IPOCard key={ipo.id} ipo={ipo} d={d} onBook={doIPOBook} showMsg={showMsg} />
        ))}
      </>}

      {/* FUNDS TAB */}
      {activeTab === 'funds' && <>
        <div style={{ background: '#1E293B', border: '1px solid '+C.border, borderRadius: 10, padding: '10px 14px', fontSize: 10, color: C.dim }}>
          Planet Sovereign Funds compound daily. 2% entry fee on deposit. Interest credited to Trading Wallet every turn.
        </div>
        {SOVEREIGN_FUNDS.map(fund => (
          <FundCard key={fund.id} fund={fund} d={d} onDeposit={doFundDeposit} onWithdraw={doFundWithdraw} />
        ))}
      </>}

      {/* ETF Trade Modal */}
      {tradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}>
          <div style={{ background: C.card, borderRadius: '18px 18px 0 0', padding: 20, width: '100%', border: '1px solid '+C.border }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 4 }}>{tradeModal.isBuy ? 'Buy' : 'Sell'} {tradeModal.n}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>${tradeModal.price.toFixed(2)}/unit · {tradeModal.expense}% expense ratio{!tradeModal.isBuy ? ` · Held: ${tradeModal.units.toLocaleString()}` : ''}</div>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Units" style={{ width: '100%', background: C.bg, border: '1px solid '+C.border, borderRadius: 8, padding: '10px 14px', color: C.text, fontSize: 14, marginBottom: 12, outline: 'none', boxSizing: 'border-box' }} />
            {qty > 0 && (
              <div style={{ background: C.bg, borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: C.dim }}>
                Total: {fm((parseInt(qty)||0) * tradeModal.price * (tradeModal.isBuy ? (1 + tradeModal.expense/100) : 1))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setTradeModal(null); setQty(''); }} style={{ flex:1, background:C.bg, border:'1px solid '+C.border, color:C.dim, borderRadius:10, padding:'11px 0', fontWeight:700, cursor:'pointer' }}>Cancel</button>
              <button onClick={() => doETFTrade(tradeModal.isBuy)} style={{ flex:2, background:tradeModal.isBuy ? C.green : C.red, color:'#fff', border:'none', borderRadius:10, padding:'11px 0', fontWeight:800, cursor:'pointer' }}>
                Confirm {tradeModal.isBuy ? 'Buy' : 'Sell'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
