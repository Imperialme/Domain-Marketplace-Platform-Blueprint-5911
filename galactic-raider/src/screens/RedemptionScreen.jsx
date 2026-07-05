import { useState, useEffect, useRef } from 'react';
import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';
import { PHI_CATS, WHEEL_SEGMENTS } from '../constants';

const Card = ({ children, style }) => (
  <div style={{ background: C.card, borderRadius: 14, padding: 14, border: '1px solid '+C.border, ...style }}>{children}</div>
);

export default function RedemptionScreen() {
  const { D, donate, spinWheel } = useGame();
  const d = D;
  const [activeTab, setActiveTab] = useState('wheel');
  const [donateModal, setDonateModal] = useState(null);
  const [donateAmt, setDonateAmt] = useState('');
  const [msg, setMsg] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const animRef = useRef(null);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const handleDonate = () => {
    const amt = parseFloat(donateAmt);
    if (isNaN(amt) || amt < 1000000) return showMsg('Minimum donation: $1M');
    const err = donate(donateModal.idx, amt);
    if (err) showMsg(err);
    else { showMsg('✅ Donated '+fm(amt)+' to '+donateModal.cat.n+'!'); setDonateModal(null); setDonateAmt(''); }
  };

  const handleSpin = () => {
    if (spinning) return;
    const result = spinWheel();
    if (typeof result === 'string') return showMsg(result);

    setSpinning(true);
    setSpinResult(null);
    const segSize = 360 / WHEEL_SEGMENTS.length;
    const targetAngle = 360 - (result.segIdx * segSize) - segSize / 2;
    const fullRotations = 1800 + targetAngle;
    const startRot = rotation;
    const endRot = startRot + fullRotations;
    const duration = 4000;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setRotation(startRot + (endRot - startRot) * ease);
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setRotation(endRot % 360);
        setSpinning(false);
        setSpinResult(result.msg);
        showMsg('🎡 ' + result.msg);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const canSpin = (d.spinTokens||0) >= 1 && (d.redeemPts||0) >= 500 && (d.donCount||0) >= 2 && (d.spinsUsed||0) < 5;
  const segSize = 360 / WHEEL_SEGMENTS.length;

  const tabs = ['wheel','donate','history'];
  const tabLabels = { wheel:'🎡 Wheel', donate:'🤲 Donate', history:'📋 History' };

  return (
    <div style={{ padding: '14px 14px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {msg && <div style={{ background: '#2D1B69', border: '1px solid '+C.purple, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#C4B5FD', fontWeight: 600 }}>{msg}</div>}

      {/* Header Stats */}
      <div style={{ background: 'linear-gradient(135deg, #1E1B4B, #2D1B69)', borderRadius: 16, padding: 14, border: '1px solid '+C.purple }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#C4B5FD', marginBottom: 10 }}>🎡 Wheel of Fortune · Redemption</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['Redeem Pts',(d.redeemPts||0).toLocaleString(),'#C4B5FD'],['Spin Tokens',d.spinTokens||0,C.amber],['Spins Used',(d.spinsUsed||0)+'/5',C.muted],['Donations',d.donCount||0,C.green],['Total Donated',fm(d.totalDonated||0),C.green],['Tax Relief',Math.round((d.taxRelief||0)*100)+'%',C.green]].map(([l,v,c]) => (
            <div key={l} style={{ flex:1, background:'rgba(0,0,0,0.3)', borderRadius:8, padding:'6px 0', textAlign:'center' }}>
              <div style={{ fontSize:7, color:'#888', textTransform:'uppercase', letterSpacing:.5 }}>{l}</div>
              <div style={{ fontSize:11, fontWeight:800, color:c, fontFamily:'monospace' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ flex:1, background:activeTab===t ? C.purple : C.card, border:'1px solid '+(activeTab===t ? C.purple : C.border), color:activeTab===t ? '#fff' : C.muted, borderRadius:10, padding:'8px 0', fontSize:11, fontWeight:700, cursor:'pointer' }}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {/* WHEEL TAB */}
      {activeTab === 'wheel' && <>
        {/* Wheel SVG */}
        <Card style={{ border: '1px solid '+C.purple, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5 }}>Wheel of Fortune</div>
          <div style={{ position: 'relative', width: 260, height: 260 }}>
            {/* Pointer */}
            <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', zIndex: 10, fontSize: 22, lineHeight: 1 }}>▼</div>
            <svg width="260" height="260" viewBox="0 0 260 260" style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'none' : 'transform .1s' }}>
              {WHEEL_SEGMENTS.map((seg, i) => {
                const start = (i * segSize - 90) * Math.PI / 180;
                const end = ((i + 1) * segSize - 90) * Math.PI / 180;
                const r = 120;
                const cx = 130, cy = 130;
                const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
                const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
                const mx = cx + (r * 0.65) * Math.cos((start + end) / 2);
                const my = cy + (r * 0.65) * Math.sin((start + end) / 2);
                return (
                  <g key={i}>
                    <path d={`M${cx},${cy} L${x1},${y1} A${r},${r},0,0,1,${x2},${y2} Z`} fill={seg.c} stroke="#0F172A" strokeWidth="1.5" />
                    <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="9" fontWeight="800" style={{ pointerEvents:'none' }}>
                      {seg.l}
                    </text>
                  </g>
                );
              })}
              <circle cx="130" cy="130" r="20" fill="#0F172A" stroke={C.purple} strokeWidth="3" />
              <text x="130" y="130" textAnchor="middle" dominantBaseline="middle" fill={C.purple} fontSize="12">🎡</text>
            </svg>
          </div>

          {spinResult && (
            <div style={{ background: '#2D1B69', border: '1px solid '+C.purple, borderRadius: 12, padding: '12px 20px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#C4B5FD' }}>
              🎉 {spinResult}
            </div>
          )}

          <button onClick={handleSpin} disabled={spinning || !canSpin} style={{ width: '100%', background: canSpin && !spinning ? 'linear-gradient(135deg, '+C.purple+', #4C1D95)' : C.bg, color: canSpin && !spinning ? '#fff' : C.muted, border: '1px solid '+(canSpin ? C.purple : C.border), borderRadius: 12, padding: '14px 0', fontWeight: 800, fontSize: 15, cursor: canSpin && !spinning ? 'pointer' : 'not-allowed', letterSpacing: 1, transition: 'all .2s' }}>
            {spinning ? '🎡 Spinning...' : canSpin ? '🎡 SPIN THE WHEEL' : '🔒 Requirements Not Met'}
          </button>

          {/* Requirements */}
          <div style={{ width: '100%', background: C.bg, borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Spin Requirements</div>
            {[['500+ Redemption Points',(d.redeemPts||0) >= 500,(d.redeemPts||0)+'/500 pts'],['2+ Donations',(d.donCount||0) >= 2,(d.donCount||0)+'/2 donations'],['Have Spin Tokens',(d.spinTokens||0) >= 1,(d.spinTokens||0)+' tokens'],['Under 5 Lifetime Spins',(d.spinsUsed||0) < 5,(d.spinsUsed||0)+'/5 used']].map(([l,done,cur]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0' }}>
                <div style={{ fontSize:11, color:done ? C.green : C.dim }}>{done ? '✅' : '⬜'} {l}</div>
                <div style={{ fontSize:10, color:C.muted, fontFamily:'monospace' }}>{cur}</div>
              </div>
            ))}
          </div>

          {/* Segment legend */}
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Possible Outcomes</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {[...new Set(WHEEL_SEGMENTS.map(s => s.outcome))].map(outcome => {
                const seg = WHEEL_SEGMENTS.find(s => s.outcome === outcome);
                return (
                  <div key={outcome} style={{ background: seg.c+'22', border: '1px solid '+seg.c, borderRadius: 6, padding: '4px 8px', fontSize: 9, color: seg.c, fontWeight: 700 }}>
                    {seg.l} {seg.sub}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </>}

      {/* DONATE TAB */}
      {activeTab === 'donate' && <>
        <div style={{ background: '#14532D', border: '1px solid '+C.green, borderRadius: 10, padding: '10px 14px', fontSize: 11, color: C.greenText }}>
          💡 Donations earn Redemption Points and provide multi-turn CGT tax relief. Minimum $1M per donation.
        </div>

        {/* Active benefits */}
        {(d.phiBenefits||[]).length > 0 && (
          <Card>
            <div style={{ fontSize: 10, color: C.muted, textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 }}>Active Tax Relief Buffs</div>
            {(d.phiBenefits||[]).map((b, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid '+C.border }}>
                <div style={{ fontSize:12, color:C.text }}>{b.name}</div>
                <div style={{ display:'flex', gap:8 }}>
                  <div style={{ background:C.greenBg, color:C.greenText, padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:700 }}>-{Math.round(b.rate*100)}% CGT</div>
                  <div style={{ background:C.bg, color:C.muted, padding:'2px 8px', borderRadius:6, fontSize:10 }}>{b.rem}T left</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop:8, fontSize:11, color:C.green, fontWeight:700 }}>Total Tax Relief: {Math.round((d.taxRelief||0)*100)}% (max 75%)</div>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {PHI_CATS.map((cat, idx) => (
            <Card key={idx} style={{ cursor: 'pointer' }} onClick={() => { setDonateModal({ cat, idx }); setDonateAmt(''); }}>
              <div style={{ fontSize: 24, marginBottom: 6, textAlign: 'center' }}>{cat.ico}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.text, textAlign: 'center' }}>{cat.n}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                {[['Tax Relief',Math.round(cat.rate*100)+'%',C.green],['Duration',cat.dur+' turns',C.blue],['Pts Mult',cat.mult+'×',C.amber]].map(([l,v,c]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:9, color:C.muted }}>{l}</span>
                    <span style={{ fontSize:9, fontWeight:700, color:c }}>{v}</span>
                  </div>
                ))}
              </div>
              <button style={{ marginTop:10, width:'100%', background:C.green, color:'#fff', border:'none', borderRadius:8, padding:'8px 0', fontWeight:700, fontSize:11, cursor:'pointer' }}>
                Donate
              </button>
            </Card>
          ))}
        </div>
      </>}

      {/* HISTORY TAB */}
      {activeTab === 'history' && <>
        {(d.donHistory||[]).length > 0 && (
          <Card>
            <div style={{ fontSize: 10, color: C.muted, textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 }}>Donation History</div>
            {(d.donHistory||[]).map((don, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid '+C.border }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:C.text }}>{don.cat}</div>
                  <div style={{ fontSize:10, color:C.muted }}>T{don.turn} · +{don.pts} pts</div>
                </div>
                <div style={{ fontSize:12, fontWeight:800, color:C.green, fontFamily:'monospace' }}>{fm(don.amt)}</div>
              </div>
            ))}
          </Card>
        )}
        {(d.spinHistory||[]).length > 0 && (
          <Card>
            <div style={{ fontSize: 10, color: C.muted, textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 }}>Spin History</div>
            {(d.spinHistory||[]).map((sp, i) => (
              <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid '+C.border }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <div style={{ fontSize:10, color:C.muted }}>T{sp.turn}</div>
                  <div style={{ fontSize:10, color:C.purple }}>{sp.outcome}</div>
                </div>
                <div style={{ fontSize:12, color:C.text, marginTop:2 }}>🎉 {sp.msg}</div>
              </div>
            ))}
          </Card>
        )}
        {(d.donHistory||[]).length === 0 && (d.spinHistory||[]).length === 0 && (
          <Card>
            <div style={{ textAlign:'center', padding:'24px 0' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🎡</div>
              <div style={{ fontSize:13, color:C.text, fontWeight:700 }}>No History Yet</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Make donations to earn points and unlock spins.</div>
            </div>
          </Card>
        )}
      </>}

      {/* Donate Modal */}
      {donateModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', display:'flex', alignItems:'flex-end', zIndex:200 }}>
          <div style={{ background:C.card, borderRadius:'18px 18px 0 0', padding:20, width:'100%', border:'1px solid '+C.border }}>
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:32 }}>{donateModal.cat.ico}</div>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text }}>{donateModal.cat.n}</div>
                <div style={{ fontSize:11, color:C.muted }}>-{Math.round(donateModal.cat.rate*100)}% CGT for {donateModal.cat.dur} turns · {donateModal.cat.mult}× pts</div>
              </div>
            </div>
            <div style={{ background:C.bg, borderRadius:8, padding:'10px 12px', marginBottom:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <div style={{ fontSize:10, color:C.muted }}>Min. Donation</div><div style={{ fontSize:11, fontWeight:700, color:C.text, fontFamily:'monospace', textAlign:'right' }}>$1,000,000</div>
              <div style={{ fontSize:10, color:C.muted }}>Tax Relief</div><div style={{ fontSize:11, fontWeight:700, color:C.green, textAlign:'right' }}>{Math.round(donateModal.cat.rate*100)}% CGT reduction</div>
              <div style={{ fontSize:10, color:C.muted }}>Duration</div><div style={{ fontSize:11, fontWeight:700, color:C.blue, textAlign:'right' }}>{donateModal.cat.dur} turns</div>
              <div style={{ fontSize:10, color:C.muted }}>Pts Multiplier</div><div style={{ fontSize:11, fontWeight:700, color:C.amber, textAlign:'right' }}>{donateModal.cat.mult}×</div>
            </div>
            <input type="number" value={donateAmt} onChange={e => setDonateAmt(e.target.value)} placeholder="Donation amount (min $1M)" style={{ width:'100%', background:C.bg, border:'1px solid '+C.border, borderRadius:8, padding:'10px 14px', color:C.text, fontSize:14, marginBottom:8, outline:'none', boxSizing:'border-box' }} />
            {donateAmt >= 1000000 && (
              <div style={{ background:C.greenBg, borderRadius:8, padding:'8px 12px', marginBottom:12, fontSize:11, color:C.greenText }}>
                Estimated pts: +{Math.round(parseFloat(donateAmt)/1000*donateModal.cat.mult).toLocaleString()}
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => { setDonateModal(null); setDonateAmt(''); }} style={{ flex:1, background:C.bg, border:'1px solid '+C.border, color:C.dim, borderRadius:10, padding:'11px 0', fontWeight:700, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleDonate} style={{ flex:2, background:C.green, color:'#fff', border:'none', borderRadius:10, padding:'11px 0', fontWeight:800, fontSize:14, cursor:'pointer' }}>
                Donate {donateAmt >= 1000000 ? fm(parseFloat(donateAmt)) : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
