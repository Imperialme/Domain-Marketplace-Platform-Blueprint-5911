import { useState, useEffect, useRef } from 'react';
import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';
import { PHI_CATS, WHEEL_SEGMENTS } from '../constants';
import { getTheme } from '../theme';
import { getT, LANGS } from '../i18n';
import { AcademyTab } from './AcademyScreen';

const CS = {
  card: { background:'#0D1B2E', borderRadius:16, padding:14, border:'1px solid #1A2744', marginBottom:10 },
  tab: (a) => ({ flex:1, padding:'9px 0', fontSize:11, fontWeight:700, border:'none', borderRadius:10, cursor:'pointer', background:a?'#7C3AED':'#0D1B2E', color:a?'#fff':'#4B5563' }),
  label: { fontSize:10, color:'#4B5563', textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 },
};

// ── CEO TAB ────────────────────────────────────────────────────
function CEOTab() {
  const { D, resolveDecision } = useGame();
  const d = D;
  const [msg, setMsg] = useState('');
  const showMsg = m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const hasBoardAccess = Object.values(d.companyOwnership||{}).some(pct=>pct>=10);
  const maxOwnership = Math.max(0, ...Object.values(d.companyOwnership||{0:0}));

  if (!hasBoardAccess) {
    return (
      <div>
        {msg&&<div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}
        <div style={{textAlign:'center', padding:'40px 16px'}}>
          <div style={{fontSize:48, marginBottom:16}}>🔒</div>
          <div style={{fontSize:16, fontWeight:800, color:'#F8FAFC', marginBottom:8}}>No Board Access</div>
          <div style={{fontSize:12, color:'#6B7280', lineHeight:1.6}}>
            Buy 10%+ of any company to unlock voting rights.
            {'\n\n'}25%+ = propose strategy. 50%+ = replace CEO.
          </div>
          <div style={{marginTop:16, fontSize:11, color:'#4B5563'}}>
            Your highest ownership: {maxOwnership.toFixed(2)}%
          </div>
        </div>

        {/* Still show decisions so they can see what's pending */}
        {(d.pendingDecisions||[]).length>0&&(
          <div style={{...CS.card,border:'1px solid rgba(71,85,105,0.4)',marginTop:12}}>
            <div style={{fontSize:12,color:'#6B7280',marginBottom:8}}>{(d.pendingDecisions||[]).length} board decision{(d.pendingDecisions||[]).length>1?'s':''} pending — acquire 10%+ to vote</div>
            {(d.pendingDecisions||[]).map(dec=>(
              <div key={dec.id} style={{padding:'8px 0',borderBottom:'1px solid #0A1220'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#94A3B8'}}>{dec.company}</div>
                <div style={{fontSize:11,color:'#4B5563'}}>{dec.headline}</div>
              </div>
            ))}
          </div>
        )}

        {/* Board Access status */}
        <div style={{...CS.card,marginTop:12}}>
          <div style={CS.label}>Ownership Status</div>
          <div style={{fontSize:10,color:'#6B7280',marginBottom:10,lineHeight:1.5}}>10% = vote on dividends · 25% = strategy · 50% = replace CEO</div>
          {(d.companies||[]).filter(co=>(d.companyOwnership?.[co.t]||0)>0).map(co=>{
            const pct=d.companyOwnership?.[co.t]||0;
            const color=pct>=50?'#F59E0B':pct>=25?'#FBBF24':pct>=10?'#60A5FA':'#4B5563';
            return (
              <div key={co.t} style={{padding:'10px 0',borderBottom:'1px solid #0A1220'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC'}}>{co.n} <span style={{color:'#4B5563',fontSize:10}}>({co.t})</span></div>
                  <div style={{fontSize:12,fontWeight:700,color,fontFamily:'monospace'}}>{pct.toFixed(2)}%</div>
                </div>
                <div style={{background:'#060B14',borderRadius:3,height:4,overflow:'hidden'}}>
                  <div style={{width:Math.min(pct,100)+'%',height:'100%',background:color,borderRadius:3,transition:'width .4s'}}/>
                </div>
              </div>
            );
          })}
          {!(d.companies||[]).some(co=>(d.companyOwnership?.[co.t]||0)>0)&&(
            <div style={{fontSize:12,color:'#4B5563',textAlign:'center',padding:'12px 0'}}>No positions yet — buy stocks in Markets tab</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {msg&&<div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}
      {(d.pendingDecisions||[]).length===0?(
        <div style={{...CS.card,textAlign:'center',padding:'32px 16px'}}>
          <div style={{fontSize:36,marginBottom:10}}>✅</div>
          <div style={{fontSize:15,fontWeight:700,color:'#F8FAFC'}}>No Pending Decisions</div>
          <div style={{fontSize:12,color:'#4B5563',marginTop:6}}>Advance turns to generate new board decisions.</div>
        </div>
      ):(
        (d.pendingDecisions||[]).map(dec=>(
          <div key={dec.id} style={{...CS.card,border:'2px solid #F59E0B'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <div>
                <div style={{fontSize:9,color:'#F59E0B',textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>{dec.type?.toUpperCase()}</div>
                <div style={{fontSize:15,fontWeight:900,color:'#F8FAFC'}}>{dec.headline}</div>
                <div style={{fontSize:11,color:'#6B7280',marginTop:3}}>{dec.company} · {dec.ceo}</div>
              </div>
              <div style={{background:'#7F1D1D',color:'#FCA5A5',padding:'4px 9px',borderRadius:8,fontSize:9,fontWeight:700,textAlign:'center',lineHeight:1.4}}>DECIDE<br/>NOW</div>
            </div>
            <div style={{background:'#060B14',borderRadius:10,padding:'10px 12px',marginBottom:12,fontSize:11,color:'#9CA3AF',lineHeight:1.5}}>{dec.context}</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {dec.opts.map((opt,i)=>(
                <button key={i} onClick={()=>{resolveDecision(dec.id,i);showMsg('Decision made: '+opt.l);}} style={{background:i===dec.worstOpt?'#1C0A0A':'#0A2010',border:`1px solid ${i===dec.worstOpt?'#7F1D1D':'#16A34A'}`,borderRadius:12,padding:12,textAlign:'left',cursor:'pointer'}}>
                  <div style={{fontSize:13,fontWeight:700,color:i===dec.worstOpt?'#FCA5A5':'#34D399',marginBottom:4}}>{String.fromCharCode(65+i)}. {opt.l}</div>
                  <div style={{fontSize:10,color:'#6B7280'}}>{opt.detail}</div>
                  <div style={{fontSize:10,color:opt.priceImp>=0?'#34D399':'#EF4444',marginTop:3,fontFamily:'monospace'}}>
                    Price {opt.priceImp>=0?'+':''}{Math.round(opt.priceImp*100)}% · Rep {opt.repImp>=0?'+':''}{opt.repImp}
                  </div>
                </button>
              ))}
            </div>
            <div style={{marginTop:8,fontSize:10,color:'#4B5563'}}>⚠️ Ignored decisions auto-resolve to worst option.</div>
          </div>
        ))
      )}

      {/* Board Access */}
      <div style={CS.card}>
        <div style={CS.label}>Board Access</div>
        <div style={{fontSize:10,color:'#6B7280',marginBottom:10,lineHeight:1.5}}>10% = vote on dividends · 25% = strategy · 50% = replace CEO</div>
        {(d.companies||[]).filter(co=>(d.companyOwnership?.[co.t]||0)>0).map(co=>{
          const pct=d.companyOwnership?.[co.t]||0;
          const color=pct>=50?'#F59E0B':pct>=25?'#FBBF24':pct>=10?'#60A5FA':'#4B5563';
          return (
            <div key={co.t} style={{padding:'10px 0',borderBottom:'1px solid #0A1220'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC'}}>{co.n} <span style={{color:'#4B5563',fontSize:10}}>({co.t})</span></div>
                <div style={{fontSize:12,fontWeight:700,color,fontFamily:'monospace'}}>{pct.toFixed(2)}%</div>
              </div>
              <div style={{background:'#060B14',borderRadius:3,height:4,overflow:'hidden'}}>
                <div style={{width:Math.min(pct,100)+'%',height:'100%',background:color,borderRadius:3,transition:'width .4s'}}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* CEO Log */}
      <div style={CS.card}>
        <div style={CS.label}>Activity Log</div>
        {(d.ceoLog||[]).slice(0,15).map((e,i)=>(
          <div key={i} style={{display:'flex',gap:8,padding:'8px 0',borderBottom:'1px solid #0A1220'}}>
            <div style={{width:3,borderRadius:2,flexShrink:0,background:e.good?'#34D399':'#EF4444',alignSelf:'stretch'}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:'#4B5563'}}>T{e.turn} · {e.ticker}</div>
              <div style={{fontSize:11,color:'#9CA3AF',marginTop:2,lineHeight:1.4}}>{e.msg}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DEBT RELIEF WHEEL ──────────────────────────────────────────
function DebtReliefWheel() {
  const { D, spinWheel } = useGame();
  const d = D;
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const animRef = useRef(null);

  const canSpin = (d.spinTokens||0)>=1 && (d.redeemPts||0)>=500 && (d.donCount||0)>=2 && (d.spinsUsed||0)<5;

  const handleSpin = () => {
    if (spinning||!canSpin) return;
    const res = spinWheel();
    if (typeof res==='string') return;
    setSpinning(true); setResult(null);
    const segSize = 360/WHEEL_SEGMENTS.length;
    const target = 360-(res.segIdx*segSize)-segSize/2;        // desired final angle (mod 360) under the pointer
    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = (((target - currentMod) % 360) + 360) % 360; // forward distance to the target from where we are
    const end = rotation + 1800 + delta;                       // 5 full spins + delta → lands exactly on target
    const start = performance.now();
    const animate = (now) => {
      const t = Math.min((now-start)/4000,1);
      const ease = 1-Math.pow(1-t,4);
      setRotation(rotation+(end-rotation)*ease);
      if(t<1){animRef.current=requestAnimationFrame(animate);}
      else{setRotation(end%360);setSpinning(false);setResult(res.msg);}
    };
    animRef.current = requestAnimationFrame(animate);
  };
  useEffect(()=>()=>{if(animRef.current)cancelAnimationFrame(animRef.current);},[]);

  const segSize = 360/WHEEL_SEGMENTS.length;
  return (
    <div>
      <div style={{background:'linear-gradient(135deg,#1E1B4B,#2D1B69)',borderRadius:16,padding:14,border:'1px solid #4C1D95',marginBottom:12}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
          {[['Points',(d.redeemPts||0).toLocaleString(),'#C4B5FD'],['Tokens',d.spinTokens||0,'#FBBF24'],['Donations',d.donCount||0,'#34D399']].map(([l,v,c])=>(
            <div key={l} style={{background:'rgba(0,0,0,.3)',borderRadius:8,padding:'8px 0',textAlign:'center'}}>
              <div style={{fontSize:9,color:'#6B7280',textTransform:'uppercase'}}>{l}</div>
              <div style={{fontSize:18,fontWeight:800,color:c,fontFamily:'monospace'}}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
          <div style={{position:'relative',width:240,height:240}}>
            <div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',fontSize:20,zIndex:10}}>▼</div>
            <svg width="240" height="240" viewBox="0 0 240 240" style={{transform:`rotate(${rotation}deg)`,transition:spinning?'none':'transform .1s'}}>
              {WHEEL_SEGMENTS.map((seg,i)=>{
                const a1=(i*segSize-90)*Math.PI/180;
                const a2=((i+1)*segSize-90)*Math.PI/180;
                const r=110,cx=120,cy=120;
                const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1);
                const x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2);
                const mx=cx+r*.65*Math.cos((a1+a2)/2);
                const my=cy+r*.65*Math.sin((a1+a2)/2);
                return (
                  <g key={i}>
                    <path d={`M${cx},${cy}L${x1},${y1}A${r},${r},0,0,1,${x2},${y2}Z`} fill={seg.c} stroke="#060B14" strokeWidth="1.5"/>
                    <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="8" fontWeight="800" style={{pointerEvents:'none'}}>{seg.l}</text>
                  </g>
                );
              })}
              <circle cx="120" cy="120" r="18" fill="#060B14" stroke="#7C3AED" strokeWidth="3"/>
              <text x="120" y="120" textAnchor="middle" dominantBaseline="middle" fill="#A78BFA" fontSize="11">★</text>
            </svg>
          </div>

          {result&&<div style={{background:'rgba(124,58,237,0.2)',border:'1px solid #7C3AED',borderRadius:12,padding:'10px 20px',fontSize:13,fontWeight:800,color:'#C4B5FD',textAlign:'center'}}>🎉 {result}</div>}

          <button onClick={handleSpin} disabled={spinning||!canSpin} style={{width:'100%',background:canSpin&&!spinning?'linear-gradient(135deg,#7C3AED,#4C1D95)':'#0D1B2E',color:canSpin&&!spinning?'#fff':'#4B5563',border:`1px solid ${canSpin?'#7C3AED':'#1A2744'}`,borderRadius:12,padding:'14px 0',fontWeight:800,fontSize:15,cursor:canSpin&&!spinning?'pointer':'not-allowed',letterSpacing:.5}}>
            {spinning?'Spinning...':canSpin?'🎡 SPIN THE WHEEL':'🔒 Requirements Not Met'}
          </button>
        </div>

        <div style={{marginTop:12,background:'rgba(0,0,0,.3)',borderRadius:10,padding:10}}>
          <div style={{fontSize:9,color:'#6B7280',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Requirements</div>
          {[['500+ Points',(d.redeemPts||0)>=500,(d.redeemPts||0)+'/500'],['2+ Donations',(d.donCount||0)>=2,(d.donCount||0)+'/2'],['Spin Token',(d.spinTokens||0)>=1,d.spinTokens||0],['Under 5 Spins',(d.spinsUsed||0)<5,(d.spinsUsed||0)+'/5']].map(([l,ok,cur])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}>
              <div style={{fontSize:11,color:ok?'#34D399':'#9CA3AF'}}>{ok?'✅':'⬜'} {l}</div>
              <div style={{fontSize:10,color:'#4B5563',fontFamily:'monospace'}}>{cur}</div>
            </div>
          ))}
        </div>
      </div>

      {(d.spinHistory||[]).filter(sp=>sp.type!=='fortune').length>0&&(
        <div style={CS.card}>
          <div style={CS.label}>Spin History</div>
          {(d.spinHistory||[]).filter(sp=>sp.type!=='fortune').map((sp,i)=>(
            <div key={i} style={{padding:'8px 0',borderBottom:'1px solid #0A1220'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div style={{fontSize:10,color:'#4B5563'}}>Turn {sp.turn}</div>
                <div style={{fontSize:10,color:'#A78BFA'}}>{sp.outcome}</div>
              </div>
              <div style={{fontSize:12,color:'#F8FAFC',marginTop:2}}>🎉 {sp.msg}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FORTUNE WHEEL ──────────────────────────────────────────────
function FortuneWheelTab() {
  const { D, spinFortune, FORTUNE_SEGS } = useGame();
  const d = D;
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [stakeAmt, setStakeAmt] = useState('');
  const [activePct, setActivePct] = useState(null);
  const [insured, setInsured] = useState(false);
  const animRef = useRef(null);

  const maxStake = Math.floor((d.tradingWallet||0) * 0.75);
  const stake = parseFloat(stakeAmt)||0;
  const insuranceFee = insured ? Math.round(stake*0.05*100)/100 : 0;
  const canSpin = (d.spinTokens||0)>=1 && stake>0 && stake<=maxStake && stake<=(d.tradingWallet||0);

  const setByPct = (pct) => {
    const amt = Math.floor((d.tradingWallet||0)*pct/100);
    setStakeAmt(String(amt));
    setActivePct(pct);
  };

  const handleSpin = () => {
    if (spinning||!canSpin) return;
    const res = spinFortune(stake, insured);
    if (typeof res==='string') { setResult('❌ '+res); return; }
    setSpinning(true); setResult(null);
    const segSize = 360/FORTUNE_SEGS.length;
    const target = 360-(res.segIdx*segSize)-segSize/2;        // desired final angle (mod 360) under the pointer
    const currentMod = ((rotation % 360) + 360) % 360;
    const delta = (((target - currentMod) % 360) + 360) % 360; // forward distance to the target from where we are
    const end = rotation + 1800 + delta;                       // 5 full spins + delta → lands exactly on target
    const start = performance.now();
    const animate = (now) => {
      const t = Math.min((now-start)/4000,1);
      const ease = 1-Math.pow(1-t,4);
      setRotation(rotation+(end-rotation)*ease);
      if(t<1){animRef.current=requestAnimationFrame(animate);}
      else{setRotation(end%360);setSpinning(false);setResult(res.msg);}
    };
    animRef.current = requestAnimationFrame(animate);
  };
  useEffect(()=>()=>{if(animRef.current)cancelAnimationFrame(animRef.current);},[]);

  const segSize = 360/FORTUNE_SEGS.length;

  return !FORTUNE_SEGS ? null : (
    <div>
      <div style={{background:'linear-gradient(135deg,#1A0F2E,#2D1A0A)',borderRadius:16,padding:14,border:'1px solid #78350F',marginBottom:12}}>
        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:14}}>
          {[['Spin Tokens',d.spinTokens||0,'#FBBF24'],['Trading Wallet',fm(d.tradingWallet||0),'#34D399'],['Max Stake',fm(maxStake),'#F59E0B']].map(([l,v,c])=>(
            <div key={l} style={{background:'rgba(0,0,0,.4)',borderRadius:8,padding:'8px 6px',textAlign:'center'}}>
              <div style={{fontSize:9,color:'#6B7280',textTransform:'uppercase',marginBottom:3}}>{l}</div>
              <div style={{fontSize:13,fontWeight:800,color:c,fontFamily:'monospace'}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Stake selector */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:'#94A3B8',marginBottom:6,fontWeight:700}}>Stake Amount (max 75% of wallet)</div>
          <div style={{display:'flex',gap:6,marginBottom:8}}>
            {[10,25,50,75].map(p=>(
              <button key={p} onClick={()=>setByPct(p)} style={{flex:1,padding:'7px 0',background:activePct===p?'#D97706':'rgba(0,0,0,.3)',border:'1px solid '+(activePct===p?'#F59E0B':'rgba(255,255,255,0.1)'),color:activePct===p?'#000':'#94A3B8',borderRadius:8,fontSize:11,fontWeight:700,cursor:'pointer'}}>
                {p}%
              </button>
            ))}
          </div>
          <input
            type="number"
            value={stakeAmt}
            onChange={e=>{setStakeAmt(e.target.value);setActivePct(null);}}
            placeholder={`Enter stake (max ${fm(maxStake)})`}
            style={{width:'100%',background:'rgba(0,0,0,.4)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'12px 14px',color:'#F8FAFC',fontSize:15,outline:'none',boxSizing:'border-box',fontFamily:'monospace'}}
          />
        </div>

        {/* Insurance toggle */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(0,0,0,.3)',borderRadius:10,padding:'10px 14px',marginBottom:14}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC'}}>🛡️ Insurance (5% premium)</div>
            <div style={{fontSize:10,color:'#6B7280'}}>Guarantees minimum 50% return on bad spins</div>
            {insured&&stake>0&&<div style={{fontSize:10,color:'#FBBF24',marginTop:2}}>Fee: {fm(insuranceFee)}</div>}
          </div>
          <button onClick={()=>setInsured(x=>!x)} style={{background:insured?'#059669':'rgba(255,255,255,0.1)',border:'none',borderRadius:20,padding:'8px 16px',color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer'}}>
            {insured?'ON':'OFF'}
          </button>
        </div>

        {/* Wheel */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
          <div style={{position:'relative',width:240,height:240}}>
            <div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',fontSize:20,zIndex:10}}>▼</div>
            <svg width="240" height="240" viewBox="0 0 240 240" style={{transform:`rotate(${rotation}deg)`,transition:spinning?'none':'transform .1s'}}>
              {FORTUNE_SEGS.map((seg,i)=>{
                const a1=(i*segSize-90)*Math.PI/180;
                const a2=((i+1)*segSize-90)*Math.PI/180;
                const r=110,cx=120,cy=120;
                const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1);
                const x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2);
                const mx=cx+r*.65*Math.cos((a1+a2)/2);
                const my=cy+r*.65*Math.sin((a1+a2)/2);
                return (
                  <g key={i}>
                    <path d={`M${cx},${cy}L${x1},${y1}A${r},${r},0,0,1,${x2},${y2}Z`} fill={seg.c} stroke="#060B14" strokeWidth="1.5"/>
                    <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="9" fontWeight="800" style={{pointerEvents:'none'}}>{seg.l}</text>
                  </g>
                );
              })}
              <circle cx="120" cy="120" r="18" fill="#060B14" stroke="#D97706" strokeWidth="3"/>
              <text x="120" y="120" textAnchor="middle" dominantBaseline="middle" fill="#FBBF24" fontSize="11">$</text>
            </svg>
          </div>

          {result&&<div style={{background:result.includes('Won')?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)',border:'1px solid '+(result.includes('Won')?'#10B981':'#EF4444'),borderRadius:12,padding:'10px 20px',fontSize:13,fontWeight:800,color:result.includes('Won')?'#34D399':'#FCA5A5',textAlign:'center'}}>{result.includes('❌')?result:'🎰 '+result}</div>}

          <button onClick={handleSpin} disabled={spinning||!canSpin} style={{width:'100%',background:canSpin&&!spinning?'linear-gradient(135deg,#D97706,#92400E)':'#0D1B2E',color:canSpin&&!spinning?'#fff':'#4B5563',border:`1px solid ${canSpin?'#F59E0B':'#1A2744'}`,borderRadius:12,padding:'14px 0',fontWeight:800,fontSize:15,cursor:canSpin&&!spinning?'pointer':'not-allowed',letterSpacing:.5}}>
            {spinning?'Spinning...':canSpin?'🎰 SPIN FORTUNE WHEEL':'🔒 '+(d.spinTokens<1?'No Spin Tokens':stake<=0?'Enter Stake':stake>maxStake?'Stake Too Large':'Invalid')}
          </button>
        </div>

        {/* Segment legend */}
        <div style={{marginTop:12,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4}}>
          {FORTUNE_SEGS.map((seg,i)=>(
            <div key={i} style={{background:seg.c+'30',border:'1px solid '+seg.c+'50',borderRadius:6,padding:'4px 6px',textAlign:'center'}}>
              <div style={{fontSize:11,fontWeight:800,color:'#F8FAFC'}}>{seg.l}</div>
              <div style={{fontSize:8,color:'rgba(255,255,255,0.5)'}}>{seg.prob}%</div>
            </div>
          ))}
        </div>
      </div>

      {(d.spinHistory||[]).filter(sp=>sp.type==='fortune').length>0&&(
        <div style={CS.card}>
          <div style={CS.label}>Fortune History</div>
          {(d.spinHistory||[]).filter(sp=>sp.type==='fortune').map((sp,i)=>(
            <div key={i} style={{padding:'8px 0',borderBottom:'1px solid #0A1220'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div style={{fontSize:10,color:'#4B5563'}}>T{sp.turn} · Staked {fm(sp.stake)}</div>
                <div style={{fontSize:10,fontWeight:700,color:sp.net>=0?'#34D399':'#EF4444'}}>{sp.mult}× → {fm(sp.payout)}</div>
              </div>
              <div style={{fontSize:12,color:'#F8FAFC',marginTop:2}}>{sp.msg}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── WHEEL TAB (Combined) ───────────────────────────────────────
function WheelTab() {
  const [subTab, setSubTab] = useState('debtrelief');
  return (
    <div>
      <div style={{display:'flex',gap:6,marginBottom:14,background:'#060B14',borderRadius:12,padding:4}}>
        <button onClick={()=>setSubTab('debtrelief')} style={{flex:1,padding:'9px 0',background:subTab==='debtrelief'?'#4C1D95':'transparent',border:'none',borderRadius:9,color:subTab==='debtrelief'?'#C4B5FD':'#4B5563',fontWeight:700,fontSize:12,cursor:'pointer'}}>
          🎡 Debt Relief
        </button>
        <button onClick={()=>setSubTab('fortune')} style={{flex:1,padding:'9px 0',background:subTab==='fortune'?'#78350F':'transparent',border:'none',borderRadius:9,color:subTab==='fortune'?'#FBBF24':'#4B5563',fontWeight:700,fontSize:12,cursor:'pointer'}}>
          🎰 Fortune Wheel
        </button>
      </div>
      {subTab==='debtrelief'&&<DebtReliefWheel/>}
      {subTab==='fortune'&&<FortuneWheelTab/>}
    </div>
  );
}

// ── PHILANTHROPY TAB ───────────────────────────────────────────
function PhilTab() {
  const { D, donate } = useGame();
  const d = D;
  const [modal, setModal] = useState(null);
  const [amt, setAmt] = useState('');
  const [msg, setMsg] = useState('');
  const showMsg = m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const cashBal = d.cashWallet || 0;

  const handleDonate = () => {
    const a = parseFloat(amt);
    if(isNaN(a)||a<100000) return showMsg('Minimum $100,000');
    const err = donate(modal.idx, a);
    if(err) showMsg(err);
    else{showMsg('✅ Donated '+fm(a)+' to '+modal.cat.n+'!');setModal(null);setAmt('');}
  };

  return (
    <div>
      {msg&&<div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}
      <div style={{background:'#0A2010',border:'1px solid #16A34A',borderRadius:10,padding:'10px 14px',marginBottom:10,fontSize:11,color:'#34D399'}}>
        💡 Donations come from your <b>Cash Wallet</b> and earn Redemption Points + multi-turn CGT tax relief. Cash available: <b>{fm(cashBal)}</b>
      </div>

      {(d.phiBenefits||[]).length>0&&(
        <div style={{...CS.card,marginBottom:10}}>
          <div style={CS.label}>Active Tax Relief</div>
          {(d.phiBenefits||[]).map((b,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #0A1220'}}>
              <div style={{fontSize:12,color:'#F8FAFC'}}>{b.name}</div>
              <div style={{display:'flex',gap:6}}>
                <div style={{background:'#14532D',color:'#34D399',padding:'2px 8px',borderRadius:6,fontSize:10,fontWeight:700}}>-{Math.round(b.rate*100)}% CGT</div>
                <div style={{background:'#060B14',color:'#4B5563',padding:'2px 8px',borderRadius:6,fontSize:10}}>{b.rem}T left</div>
              </div>
            </div>
          ))}
          <div style={{marginTop:8,fontSize:12,color:'#34D399',fontWeight:700}}>Total Relief: {Math.round((d.taxRelief||0)*100)}% (max 75%)</div>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {PHI_CATS.map((cat,idx)=>(
          <div key={idx} style={{...CS.card,cursor:'pointer',marginBottom:0}} onClick={()=>{setModal({cat,idx});setAmt('');}}>
            <div style={{fontSize:28,textAlign:'center',marginBottom:6}}>{cat.ico}</div>
            <div style={{fontSize:13,fontWeight:800,color:'#F8FAFC',textAlign:'center',marginBottom:8}}>{cat.n}</div>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {[['CGT Relief',Math.round(cat.rate*100)+'%','#34D399'],['Duration',cat.dur+' turns','#60A5FA'],['Pts Mult',cat.mult+'×','#FBBF24']].map(([l,v,c])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:10,color:'#4B5563'}}>{l}</span>
                  <span style={{fontSize:10,fontWeight:700,color:c}}>{v}</span>
                </div>
              ))}
            </div>
            <button style={{marginTop:10,width:'100%',background:'#059669',color:'#fff',border:'none',borderRadius:8,padding:'8px 0',fontWeight:700,fontSize:11,cursor:'pointer'}}>Donate</button>
          </div>
        ))}
      </div>

      {modal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',display:'flex',alignItems:'flex-end',zIndex:300}}>
          <div style={{background:'#0D1B2E',borderRadius:'20px 20px 0 0',padding:22,width:'100%',border:'1px solid #1A2744'}}>
            <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:36}}>{modal.cat.ico}</div>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:'#F8FAFC'}}>{modal.cat.n}</div>
                <div style={{fontSize:11,color:'#4B5563'}}>-{Math.round(modal.cat.rate*100)}% CGT · {modal.cat.dur} turns · {modal.cat.mult}× pts</div>
              </div>
            </div>
            <div style={{fontSize:11,color:'#6B7280',marginBottom:8}}>Cash Wallet: <b style={{color:'#60A5FA'}}>{fm(cashBal)}</b></div>
            <div style={{display:'flex',gap:6,marginBottom:8}}>
              {[['5%',0.05],['10%',0.10],['20%',0.20],['All',1]].map(([lbl,pct])=>(
                <button key={lbl} onClick={()=>setAmt(String(Math.floor(cashBal*pct)))} style={{flex:1,padding:'9px 0',background:'#060B14',border:'1px solid #1A2744',color:'#94A3B8',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer'}}>{lbl}</button>
              ))}
            </div>
            <div style={{display:'flex',gap:6,marginBottom:10}}>
              {[['$100K',100000],['$1M',1000000],['$10M',10000000],['$100M',100000000]].map(([lbl,val])=>(
                <button key={lbl} onClick={()=>setAmt(String(val))} style={{flex:1,padding:'9px 0',background:'#060B14',border:'1px solid #1A2744',color:'#94A3B8',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer'}}>{lbl}</button>
              ))}
            </div>
            <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="Amount (min $100,000)" style={{width:'100%',background:'#060B14',border:'1px solid #1A2744',borderRadius:10,padding:'12px 14px',color:'#F8FAFC',fontSize:16,marginBottom:10,outline:'none',boxSizing:'border-box'}}/>
            {parseFloat(amt)>=100000&&<div style={{background:'#0A2010',borderRadius:8,padding:'8px 12px',marginBottom:12,fontSize:11,color:'#34D399'}}>+{Math.round(parseFloat(amt)/1000*modal.cat.mult).toLocaleString()} redemption pts</div>}
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{setModal(null);setAmt('');}} style={{flex:1,padding:'12px 0',background:'#060B14',border:'1px solid #1A2744',color:'#6B7280',borderRadius:12,fontWeight:700,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleDonate} style={{flex:2,padding:'12px 0',background:'#059669',color:'#fff',border:'none',borderRadius:12,fontWeight:800,fontSize:15,cursor:'pointer'}}>Donate {parseFloat(amt)>=100000?fm(parseFloat(amt)):''}</button>
            </div>
          </div>
        </div>
      )}

      {(d.donHistory||[]).length>0&&(
        <div style={{...CS.card,marginTop:12}}>
          <div style={CS.label}>Donation History</div>
          {(d.donHistory||[]).slice(0,10).map((don,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #0A1220'}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC'}}>{don.cat}</div>
                <div style={{fontSize:10,color:'#4B5563'}}>T{don.turn} · +{don.pts} pts</div>
              </div>
              <div style={{fontSize:13,fontWeight:800,color:'#34D399',fontFamily:'monospace'}}>{fm(don.amt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SETTINGS TAB ───────────────────────────────────────────────
function SettingsTab({ TH, t }) {
  const { D, setDarkMode, setLanguage, setMusicTrack, toggleMusic, MUSIC_PLAYLIST, saveGame, loadGame, S } = useGame();
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const showMsg = m => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const card = { background:TH.card, borderRadius:16, padding:16, border:'1px solid '+TH.borderSolid, marginBottom:12 };
  const lbl = { fontSize:10, color:TH.dim, textTransform:'uppercase', letterSpacing:1.5, marginBottom:10 };

  return (
    <div>
      {msg && <div style={{background:TH.card,border:'1px solid '+TH.borderSolid,borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}

      {/* Appearance */}
      <div style={card}>
        <div style={lbl}>{t('settings_theme')}</div>
        <div style={{display:'flex',gap:8}}>
          <button
            onClick={() => setDarkMode(true)}
            style={{flex:1,padding:'12px 0',borderRadius:12,border:'2px solid '+(D.darkMode!==false?'#7C3AED':TH.borderSolid),background:D.darkMode!==false?'rgba(124,58,237,0.15)':TH.raised,color:D.darkMode!==false?'#C4B5FD':TH.sub,fontWeight:700,fontSize:13,cursor:'pointer'}}>
            🌙 {t('settings_dark')}
          </button>
          <button
            onClick={() => setDarkMode(false)}
            style={{flex:1,padding:'12px 0',borderRadius:12,border:'2px solid '+(D.darkMode===false?'#F59E0B':TH.borderSolid),background:D.darkMode===false?'rgba(245,158,11,0.15)':TH.raised,color:D.darkMode===false?'#F59E0B':TH.sub,fontWeight:700,fontSize:13,cursor:'pointer'}}>
            ☀️ {t('settings_light')}
          </button>
        </div>
      </div>

      {/* Language */}
      <div style={card}>
        <div style={lbl}>{t('settings_language')}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {LANGS.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              style={{padding:'10px 12px',borderRadius:10,border:'2px solid '+(D.language===lang.code?'#3B82F6':TH.borderSolid),background:D.language===lang.code?'rgba(59,130,246,0.15)':TH.raised,display:'flex',alignItems:'center',gap:8,cursor:'pointer',textAlign:'left'}}>
              <span style={{fontSize:20}}>{lang.flag}</span>
              <span style={{fontSize:12,fontWeight:700,color:D.language===lang.code?'#93C5FD':TH.text}}>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Music */}
      <div style={card}>
        <div style={lbl}>🎵 {t('settings_music') || 'Background Music'}</div>
        <div style={{marginBottom:10,display:'flex',gap:8,alignItems:'center'}}>
          <button
            onClick={() => toggleMusic(!D.musicEnabled)}
            style={{flex:1,padding:'10px 0',borderRadius:10,border:'2px solid '+(D.musicEnabled?'#10B981':TH.borderSolid),background:D.musicEnabled?'rgba(16,185,129,0.15)':TH.raised,color:D.musicEnabled?'#10B981':TH.sub,fontWeight:700,fontSize:12,cursor:'pointer'}}>
            {D.musicEnabled ? '🔊 Enabled' : '🔇 Muted'}
          </button>
        </div>
        {D.musicEnabled && (
          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:6,maxHeight:'160px',overflowY:'auto'}}>
            {MUSIC_PLAYLIST.map(track => (
              <button
                key={track.id}
                onClick={() => setMusicTrack(track.id)}
                style={{padding:'10px 12px',borderRadius:8,border:'2px solid '+(D.musicTrack===track.id?'#3B82F6':TH.borderSolid),background:D.musicTrack===track.id?'rgba(59,130,246,0.15)':TH.raised,textAlign:'left',cursor:'pointer',transition:'all .15s'}}>
                <div style={{fontSize:12,fontWeight:700,color:D.musicTrack===track.id?'#93C5FD':TH.text}}>{track.name}</div>
                <div style={{fontSize:10,color:TH.sub,marginTop:2}}>{track.desc}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Save Slots */}
      <div style={card}>
        <div style={lbl}>{t('settings_save_slots')}</div>
        {['slot1','slot2','slot3'].map((slot,i) => (
          <div key={slot} style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
            <div style={{fontSize:12,color:TH.sub,width:50}}>Slot {i+1}</div>
            <button onClick={() => { const err=saveGame(slot); showMsg(err||'✅ Saved to slot '+(i+1)); }} style={{flex:1,padding:'8px 0',background:'#059669',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:11,cursor:'pointer'}}>{t('settings_save')}</button>
            <button onClick={() => { const err=loadGame(slot); showMsg(err||'✅ Loaded slot '+(i+1)); }} style={{flex:1,padding:'8px 0',background:TH.card,color:TH.sub,border:'1px solid '+TH.borderSolid,borderRadius:8,fontWeight:700,fontSize:11,cursor:'pointer'}}>{t('settings_load')}</button>
          </div>
        ))}
      </div>

      {/* Reset */}
      <div style={card}>
        <div style={lbl}>{t('settings_reset')}</div>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} style={{width:'100%',padding:'12px 0',background:'#7F1D1D',color:'#FCA5A5',border:'1px solid #991B1B',borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer'}}>
            ⚠️ {t('settings_reset')}
          </button>
        ) : (
          <div>
            <div style={{fontSize:12,color:'#FCA5A5',marginBottom:10,lineHeight:1.5}}>{t('settings_reset_confirm')}</div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => setConfirmReset(false)} style={{flex:1,padding:'10px 0',background:TH.card,color:TH.sub,border:'1px solid '+TH.borderSolid,borderRadius:8,fontWeight:700,cursor:'pointer'}}>{t('btn_cancel')}</button>
              <button onClick={() => { S.current = null; localStorage.removeItem('CC_autosave'); window.location.reload(); }} style={{flex:2,padding:'10px 0',background:'#991B1B',color:'#fff',border:'none',borderRadius:8,fontWeight:800,cursor:'pointer'}}>🗑️ {t('settings_reset')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMMAND SCREEN ────────────────────────────────────────
export default function CommandScreen() {
  const { D } = useGame();
  const TH = getTheme(D.darkMode);
  const t = getT(D.language);
  const CS_T = {
    card: { background:TH.card, borderRadius:16, padding:14, border:'1px solid '+TH.borderSolid, marginBottom:10 },
    tab: (a) => ({ flex:1, padding:'9px 0', fontSize:11, fontWeight:700, border:'none', borderRadius:10, cursor:'pointer', background:a?'#7C3AED':TH.card, color:a?'#fff':TH.dim }),
    label: { fontSize:10, color:TH.dim, textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 },
  };
  const pending = (D.pendingDecisions||[]).length;
  const [tab, setTab] = useState('ceo');
  const tabs=[
    {id:'ceo', l:t('tab_ceo')},
    {id:'wheel', l:t('tab_wheel')},
    {id:'phil', l:t('tab_donate')},
    {id:'academy', l:'Academy'},
    {id:'settings', l:t('tab_settings')},
  ];
  return (
    <div style={{padding:'14px 14px 80px',background:TH.bg,minHeight:'100%'}}>
      <div style={{fontSize:18,fontWeight:900,color:TH.text,marginBottom:12}}>🎯 Command Center</div>
      <div style={{display:'flex',gap:6,marginBottom:14}}>
        {tabs.map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)} style={{...CS_T.tab(tab===tb.id),position:'relative'}}>
            {tb.l}
            {tb.id==='ceo'&&pending>0&&<span style={{position:'absolute',top:2,right:4,background:'#EF4444',color:'#fff',borderRadius:10,fontSize:8,fontWeight:800,padding:'1px 4px'}}>{pending}</span>}
          </button>
        ))}
      </div>
      {tab==='ceo'&&<CEOTab/>}
      {tab==='wheel'&&<WheelTab/>}
      {tab==='phil'&&<PhilTab/>}
      {tab==='academy'&&<AcademyTab TH={TH} t={t}/>}
      {tab==='settings'&&<SettingsTab TH={TH} t={t}/>}
    </div>
  );
}
