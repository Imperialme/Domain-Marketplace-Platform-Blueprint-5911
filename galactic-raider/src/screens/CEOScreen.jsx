import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';
import { TOTAL_SHARES } from '../constants';

const Card = ({ children, style }) => (
  <div style={{ background: C.card, borderRadius: 14, padding: 14, border: '1px solid '+C.border, ...style }}>{children}</div>
);

const SectionHeader = ({ label }) => (
  <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{label}</div>
);

export default function CEOScreen() {
  const { D, resolveDecision, buyStock } = useGame();
  const d = D;
  const [selectedDec, setSelectedDec] = useState(null);
  const [activeTab, setActiveTab] = useState('decisions');
  const [msg, setMsg] = useState('');

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const boardTier = (pct) => {
    if (pct >= 50) return { label: '👑 Majority Control', color: '#FFD700', bg: '#78350F' };
    if (pct >= 25) return { label: '🎯 Significant Control', color: C.amber, bg: C.amberBg };
    if (pct >= 10) return { label: '🏛️ Board Seat', color: C.blue, bg: C.blueBg };
    return { label: 'No Board Access', color: C.muted, bg: C.bg };
  };

  const handleDecide = (decId, optIdx) => {
    resolveDecision(decId, optIdx);
    setSelectedDec(null);
    showMsg('Decision resolved!');
  };

  const tabs = ['decisions', 'board', 'log'];
  const tabLabels = { decisions: '⚡ Decisions', board: '🏛️ Board', log: '📋 Log' };

  return (
    <div style={{ padding: '14px 14px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {msg && <div style={{ background: '#1E3A5F', border: '1px solid '+C.blue, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.blueText, fontWeight: 600 }}>{msg}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, background: activeTab===t ? C.blue : C.card, border: '1px solid '+(activeTab===t ? C.blue : C.border), color: activeTab===t ? '#fff' : C.muted, borderRadius: 10, padding: '8px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            {tabLabels[t]}
            {t === 'decisions' && (d.pendingDecisions||[]).length > 0 && (
              <span style={{ marginLeft: 5, background: C.red, color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 9 }}>{(d.pendingDecisions||[]).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* DECISIONS TAB */}
      {activeTab === 'decisions' && <>
        {(d.pendingDecisions||[]).length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 14, color: C.text, fontWeight: 700 }}>No Pending Decisions</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>All CEO decisions resolved. Advance turns to generate new decisions.</div>
            </div>
          </Card>
        ) : (
          (d.pendingDecisions||[]).map(dec => (
            <Card key={dec.id} style={{ border: '2px solid '+C.amber }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 9, color: C.amber, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{dec.type?.toUpperCase()}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{dec.headline}</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{dec.company} · {dec.ticker} · {dec.ceo}</div>
                </div>
                <div style={{ background: C.redBg, color: C.redText, padding: '4px 8px', borderRadius: 8, fontSize: 9, fontWeight: 700, textAlign: 'center' }}>
                  ⚠️<br/>DECIDE<br/>NOW
                </div>
              </div>
              <div style={{ background: C.bg, borderRadius: 8, padding: '10px 12px', marginBottom: 10, fontSize: 11, color: C.dim, lineHeight: 1.5 }}>
                {dec.context}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {dec.opts.map((opt, i) => (
                  <button key={i} onClick={() => handleDecide(dec.id, i)} style={{ background: i === dec.worstOpt ? C.redBg : C.greenBg, border: '1px solid '+(i === dec.worstOpt ? C.red : C.green), borderRadius: 10, padding: 10, textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: i === dec.worstOpt ? C.redText : C.greenText, marginBottom: 4 }}>
                      {String.fromCharCode(65+i)}. {opt.l}
                    </div>
                    <div style={{ fontSize: 10, color: C.dim }}>{opt.detail}</div>
                    <div style={{ fontSize: 10, color: opt.priceImp >= 0 ? C.green : C.red, marginTop: 2, fontFamily: 'monospace' }}>
                      Price: {opt.priceImp >= 0 ? '+' : ''}{Math.round(opt.priceImp * 100)}% · Rep: {opt.repImp >= 0 ? '+' : ''}{opt.repImp}
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 10, color: C.muted }}>⚠️ Ignored decisions auto-resolve to worst option.</div>
            </Card>
          ))
        )}

        {/* Resolved Decisions */}
        {(d.resolvedDecisions||[]).length > 0 && (
          <Card>
            <SectionHeader label="Recent Decisions" />
            {(d.resolvedDecisions||[]).slice(0, 5).map((dec, i) => (
              <div key={i} style={{ padding: '9px 0', borderBottom: '1px solid '+C.border }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{dec.company}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>T{dec.resolvedTurn}</div>
                </div>
                <div style={{ fontSize: 10, color: dec.auto ? C.red : C.green, marginTop: 2 }}>
                  {dec.auto ? '⚠️ Auto-resolved (worst)' : '✅ '}{dec.chosen?.l}
                </div>
              </div>
            ))}
          </Card>
        )}
      </>}

      {/* BOARD TAB */}
      {activeTab === 'board' && <>
        <div style={{ background: '#1E3A5F', border: '1px solid '+C.blue, borderRadius: 10, padding: '10px 14px', fontSize: 11, color: C.blueText }}>
          🏛️ Board access unlocks at 10% ownership. 25% = strategy votes. 50% = CEO replacement.
        </div>
        {(d.companies||[]).map(co => {
          const held = d.stockHoldings?.[co.t] || 0;
          const total = TOTAL_SHARES[co.t] || 500000000;
          const pct = d.companyOwnership?.[co.t] || 0;
          const tier = boardTier(pct);
          return (
            <Card key={co.t}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{co.n}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{co.t} · {co.s} · {co.hq}</div>
                </div>
                <div style={{ background: tier.bg, color: tier.color, padding: '4px 10px', borderRadius: 20, fontSize: 9, fontWeight: 700 }}>{tier.label}</div>
              </div>
              {/* Ownership bar */}
              <div style={{ background: C.bg, borderRadius: 4, height: 6, marginBottom: 8, overflow: 'hidden' }}>
                <div style={{ width: Math.min(pct, 100)+'%', height: '100%', background: pct >= 50 ? '#FFD700' : pct >= 25 ? C.amber : pct >= 10 ? C.blue : C.muted, borderRadius: 4, transition: 'width .4s' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['Owned',held.toLocaleString()+' shares'],['%',pct.toFixed(2)+'%'],['CEO Rep',(co.ceoProfile?.rep||0)+'/100']].map(([l,v]) => (
                  <div key={l} style={{ flex:1, background:C.bg, borderRadius:8, padding:'6px 0', textAlign:'center' }}>
                    <div style={{ fontSize:8, color:C.muted }}>{l}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:C.text, fontFamily:'monospace' }}>{v}</div>
                  </div>
                ))}
              </div>
              {/* Board privileges */}
              {pct >= 10 && (
                <div style={{ marginTop: 8, background: C.bg, borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: C.amber, fontWeight: 700, marginBottom: 4 }}>Board Privileges:</div>
                  {pct >= 10 && <div style={{ fontSize: 10, color: C.dim }}>✅ Vote on dividends</div>}
                  {pct >= 25 && <div style={{ fontSize: 10, color: C.dim }}>✅ Propose strategy</div>}
                  {pct >= 50 && <div style={{ fontSize: 10, color: '#FFD700' }}>✅ Replace CEO</div>}
                </div>
              )}
              {co.ceoProfile && (
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  {[['Style',co.ceoProfile.style],['Track',co.ceoProfile.track],['Tenure',co.ceoProfile.tenure+'yr']].map(([l,v]) => (
                    <div key={l} style={{ flex:1, background:C.bg, borderRadius:6, padding:'5px 0', textAlign:'center' }}>
                      <div style={{ fontSize:8, color:C.muted }}>{l}</div>
                      <div style={{ fontSize:9, fontWeight:600, color:C.dim }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </>}

      {/* LOG TAB */}
      {activeTab === 'log' && (
        <Card>
          <SectionHeader label="CEO Activity Log" />
          {(d.ceoLog||[]).slice(0, 30).map((entry, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid '+C.border }}>
              <div style={{ width: 4, borderRadius: 2, flexShrink: 0, background: entry.good ? C.green : C.red, alignSelf: 'stretch' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: C.muted }}>T{entry.turn} · {entry.ticker}</div>
                <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.4, marginTop: 2 }}>{entry.msg}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
