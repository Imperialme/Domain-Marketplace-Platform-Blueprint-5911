import { useState, useEffect, useRef } from 'react';
import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';
import { PHI_CATS, WHEEL_SEGMENTS, TOTAL_SHARES } from '../constants';

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
        {!(d.companies||[]).some(co=>(d.companyOwnership?.[co.t]||0)>0)&&(
          <div style={{fontSize:12,color:'#4B5563',textAlign:'center',padding:'12px 0'}}>Buy 10%+ in any company to unlock board access</div>
        )}
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

// ── WHEEL TAB ──────────────────────────────────────────────────
function WheelTab() {
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
    const target = 360-(res.segIdx*segSize)-segSize/2;
    const end = rotation + 1800 + target;
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

        {/* Wheel */}
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

      {(d.spinHistory||[]).length>0&&(
        <div style={CS.card}>
          <div style={CS.label}>Spin History</div>
          {(d.spinHistory||[]).map((sp,i)=>(
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

// ── PHILANTHROPY TAB ───────────────────────────────────────────
function PhilTab() {
  const { D, donate } = useGame();
  const d = D;
  const [modal, setModal] = useState(null);
  const [amt, setAmt] = useState('');
  const [msg, setMsg] = useState('');
  const showMsg = m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const handleDonate = () => {
    const a = parseFloat(amt);
    if(isNaN(a)||a<1000000) return showMsg('Minimum $1M');
    const err = donate(modal.idx, a);
    if(err) showMsg(err);
    else{showMsg('✅ Donated '+fm(a)+' to '+modal.cat.n+'!');setModal(null);setAmt('');}
  };

  return (
    <div>
      {msg&&<div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}
      <div style={{background:'#0A2010',border:'1px solid #16A34A',borderRadius:10,padding:'10px 14px',marginBottom:10,fontSize:11,color:'#34D399'}}>
        💡 Donations earn Redemption Points + multi-turn CGT tax relief. Min $1M.
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
            <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="Amount (min $1,000,000)" style={{width:'100%',background:'#060B14',border:'1px solid #1A2744',borderRadius:10,padding:'12px 14px',color:'#F8FAFC',fontSize:16,marginBottom:10,outline:'none',boxSizing:'border-box'}}/>
            {parseFloat(amt)>=1000000&&<div style={{background:'#0A2010',borderRadius:8,padding:'8px 12px',marginBottom:12,fontSize:11,color:'#34D399'}}>+{Math.round(parseFloat(amt)/1000*modal.cat.mult).toLocaleString()} redemption pts</div>}
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{setModal(null);setAmt('');}} style={{flex:1,padding:'12px 0',background:'#060B14',border:'1px solid #1A2744',color:'#6B7280',borderRadius:12,fontWeight:700,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleDonate} style={{flex:2,padding:'12px 0',background:'#059669',color:'#fff',border:'none',borderRadius:12,fontWeight:800,fontSize:15,cursor:'pointer'}}>Donate {parseFloat(amt)>=1e6?fm(parseFloat(amt)):''}</button>
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

// ── MAIN COMMAND SCREEN ────────────────────────────────────────
export default function CommandScreen() {
  const { D } = useGame();
  const pending = (D.pendingDecisions||[]).length;
  const [tab, setTab] = useState('ceo');
  const tabs=[{id:'ceo',l:'👔 CEO'},{id:'wheel',l:'🎡 Wheel'},{id:'phil',l:'🤲 Donate'}];
  return (
    <div style={{padding:'14px 14px 80px',background:'#060B14',minHeight:'100%'}}>
      <div style={{fontSize:18,fontWeight:900,color:'#F8FAFC',marginBottom:12}}>🎯 Command Center</div>
      <div style={{display:'flex',gap:6,marginBottom:14}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{...CS.tab(tab===t.id),position:'relative'}}>
            {t.l}
            {t.id==='ceo'&&pending>0&&<span style={{position:'absolute',top:2,right:4,background:'#EF4444',color:'#fff',borderRadius:10,fontSize:8,fontWeight:800,padding:'1px 4px'}}>{pending}</span>}
          </button>
        ))}
      </div>
      {tab==='ceo'&&<CEOTab/>}
      {tab==='wheel'&&<WheelTab/>}
      {tab==='phil'&&<PhilTab/>}
    </div>
  );
}
