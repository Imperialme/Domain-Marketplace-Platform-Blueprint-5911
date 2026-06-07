import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { fm } from '../utils';
import { TAX_ERAS } from '../constants';
import { PLANET_THRESHOLDS } from '../store/gameStore';

const T = {
  bg:'#030810', card:'#0A1628', raised:'#0F1E35',
  border:'rgba(255,255,255,0.08)', borderHi:'rgba(255,255,255,0.14)',
  text:'#F1F5F9', sub:'#94A3B8', muted:'#475569',
  green:'#10B981', red:'#F43F5E', blue:'#3B82F6',
  amber:'#F59E0B', purple:'#8B5CF6', cyan:'#06B6D4',
};

const pill = (c,bg,txt) => ({
  display:'inline-block', background:bg||c+'22', color:c,
  padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700,
  border:'1px solid '+c+'44',
});

const GEO_IMPACT_COLOR = { positive:T.green, negative:T.red, mixed:T.amber, neutral:T.muted };

const PLANET_ORDER = [
  {name:'Earth', ico:'🌍', color:'#2E7D32'},
  {name:'Mars', ico:'🔴', color:'#C62828'},
  {name:'Venus', ico:'🟡', color:'#F57F17'},
  {name:'Jupiter', ico:'🟠', color:'#E65100'},
  {name:'Saturn', ico:'🪐', color:'#7B1FA2'},
  {name:'Mercury', ico:'☿', color:'#455A64'},
  {name:'Uranus', ico:'🔵', color:'#0277BD'},
  {name:'Neptune', ico:'💜', color:'#4527A0'},
];

// Simple SettingsModal inline
function SettingsModal({ onClose }) {
  const { D, S, saveGame, loadGame } = useGame();
  const d = D;
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState('');
  const showMsg = m => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const nw = (d.cashWallet||0)+(d.savingsWallet||0)+(d.tradingWallet||0)+(d.foundationBalance||0);
  const stockVal = Object.entries(d.stockHoldings||{}).reduce((x,[t,n])=>{
    const co=d.companies?.find(c=>c.t===t); return x+(co?co.price*n:0);},0);
  const totalPortfolio = nw + stockVal + (d.etfs||[]).reduce((x,e)=>x+e.price*(e.units||0),0) + Object.values(d.fundDeposits||{}).reduce((x,f)=>x+(f.deposit||0),0);

  return (
    <div style={{position:'fixed',inset:0,zIndex:500,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)'}}/>
      <div style={{position:'relative',background:'#060B14',borderRadius:'22px 22px 0 0',padding:20,maxHeight:'85vh',overflowY:'auto',border:'1px solid rgba(255,255,255,0.1)'}}>
        <div style={{width:40,height:4,background:'rgba(255,255,255,0.15)',borderRadius:2,margin:'0 auto 16px'}}/>
        <div style={{fontSize:18,fontWeight:900,color:'#F1F5F9',marginBottom:16}}>⚙️ Settings</div>

        {msg&&<div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}

        {/* Stats */}
        <div style={{background:'#0A1628',borderRadius:14,padding:14,border:'1px solid rgba(255,255,255,0.08)',marginBottom:12}}>
          <div style={{fontSize:10,color:'#475569',textTransform:'uppercase',letterSpacing:1.5,marginBottom:8}}>Game Stats</div>
          {[['Turn','T'+d.turn],['Net Worth',fm(totalPortfolio)],['Peak NW',fm(d.stats?.peakNetWorth||totalPortfolio)],['Trades',(d.stats?.tradesTotal||0).toLocaleString()]].map(([l,v])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(0,0,0,0.3)'}}>
              <span style={{fontSize:12,color:'#6B7280'}}>{l}</span>
              <span style={{fontSize:12,fontWeight:700,color:'#F8FAFC',fontFamily:'monospace'}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Save / Load */}
        <div style={{background:'#0A1628',borderRadius:14,padding:14,border:'1px solid rgba(255,255,255,0.08)',marginBottom:12}}>
          <div style={{fontSize:10,color:'#475569',textTransform:'uppercase',letterSpacing:1.5,marginBottom:10}}>Save / Load</div>
          {['slot1','slot2','slot3'].map(slot=>{
            const saved = localStorage.getItem('CC_save_'+slot);
            const info = saved ? (() => { try { const d = JSON.parse(saved); return 'T'+d.turn+' · '+fm((d.cashWallet||0)+(d.savingsWallet||0)+(d.tradingWallet||0)); } catch(e) { return 'Save data'; } })() : null;
            return (
              <div key={slot} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:'#F8FAFC',fontWeight:700}}>{slot.toUpperCase()}</div>
                  {info&&<div style={{fontSize:10,color:'#475569'}}>{info}</div>}
                </div>
                <button onClick={()=>{const e=saveGame(slot);showMsg(e||'Saved to '+slot+'!');}} style={{background:'#059669',color:'#fff',border:'none',borderRadius:8,padding:'7px 12px',fontWeight:700,fontSize:11,cursor:'pointer'}}>Save</button>
                <button onClick={()=>{const e=loadGame(slot);showMsg(e||'Loaded '+slot+'!');}} style={{background:'#1D4ED8',color:'#fff',border:'none',borderRadius:8,padding:'7px 12px',fontWeight:700,fontSize:11,cursor:'pointer'}}>Load</button>
              </div>
            );
          })}
        </div>

        {/* Reset */}
        <div style={{background:'#0A1628',borderRadius:14,padding:14,border:'1px solid rgba(239,68,68,0.2)',marginBottom:12}}>
          {!confirmReset?(
            <button onClick={()=>setConfirmReset(true)} style={{width:'100%',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#FCA5A5',borderRadius:10,padding:'12px 0',fontWeight:700,fontSize:14,cursor:'pointer'}}>
              🗑️ Reset Game
            </button>
          ):(
            <div>
              <div style={{fontSize:12,color:'#FCA5A5',marginBottom:10}}>This will delete all progress. Sure?</div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setConfirmReset(false)} style={{flex:1,padding:'10px 0',background:'#060B14',border:'1px solid #1A2744',color:'#6B7280',borderRadius:10,fontWeight:700,cursor:'pointer'}}>Cancel</button>
                <button onClick={()=>window.location.reload()} style={{flex:2,padding:'10px 0',background:'#7F1D1D',color:'#FCA5A5',border:'1px solid #DC2626',borderRadius:10,fontWeight:800,fontSize:14,cursor:'pointer'}}>Reset Everything</button>
              </div>
            </div>
          )}
        </div>

        <button onClick={onClose} style={{width:'100%',background:'#0A1628',border:'1px solid rgba(255,255,255,0.1)',color:'#94A3B8',borderRadius:14,padding:'13px 0',fontWeight:700,fontSize:15,cursor:'pointer'}}>Close</button>
      </div>
    </div>
  );
}

export default function HomeScreen({ onNavigate, autoAdv, setAutoAdv, autoSpeed, setAutoSpeed }) {
  const { D, advanceTurn } = useGame();
  const d = D;
  const era = TAX_ERAS[d.eraIdx];
  const [showSettings, setShowSettings] = useState(false);

  const nw = (d.cashWallet||0)+(d.savingsWallet||0)+(d.tradingWallet||0)+(d.foundationBalance||0);
  const stockVal = Object.entries(d.stockHoldings||{}).reduce((x,[t,n])=>{
    const co=d.companies?.find(c=>c.t===t); return x+(co?co.price*n:0);},0);
  const etfVal = (d.etfs||[]).reduce((x,e)=>x+e.price*(e.units||0),0);
  const fundVal = Object.values(d.fundDeposits||{}).reduce((x,f)=>x+(f.deposit||0),0);
  const totalPortfolio = nw + stockVal + etfVal + fundVal;
  const pending = (d.pendingDecisions||[]).length;
  const hasBoardAccess = Object.values(d.companyOwnership||{}).some(pct=>pct>=10);

  const eraC = {'Normal':T.muted,'Capital Gains':T.green,'Low Tax':T.blue,'High Tax':T.red,'Dividend':T.purple,'Transaction':T.amber,'Wealth Tax':'#EC4899'}[era.name]||T.muted;

  return (
    <div style={{background:T.bg,minHeight:'100%',padding:'0 0 80px'}}>

      {/* Top bar */}
      <div style={{background:'linear-gradient(180deg,#050F20,#030810)',padding:'18px 16px 14px',borderBottom:'1px solid '+T.border}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
          <div>
            <div style={{fontSize:11,color:T.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:2}}>Cosmos Capital</div>
            <div style={{fontSize:28,fontWeight:900,color:T.text,lineHeight:1}}>Turn {d.turn}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:5}}>
              <div style={pill(eraC)}>{era.name}</div>
              <div style={pill(d.gdp>=0?T.green:T.red)}>GDP {d.gdp>=0?'+':''}{d.gdp}%</div>
            </div>
            <button onClick={()=>setShowSettings(true)} style={{background:'transparent',border:'none',cursor:'pointer',fontSize:20,color:T.muted,padding:'4px',borderRadius:8}}>⚙️</button>
          </div>
        </div>

        {/* Net worth */}
        <div style={{marginBottom:4}}>
          <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Total Net Worth</div>
          <div style={{fontSize:44,fontWeight:900,color:T.green,fontFamily:'monospace',lineHeight:1,textShadow:'0 0 30px rgba(16,185,129,0.4)'}}>{fm(totalPortfolio)}</div>
        </div>

        {/* Breakdown chips */}
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:12}}>
          {[['💵',fm(d.cashWallet||0),T.blue],['🏦',fm(d.savingsWallet||0),T.green],['⚡',fm(d.tradingWallet||0),T.amber],['📊',fm(stockVal),T.purple],['🌌',fm(etfVal),T.cyan],['💎',fm(fundVal),'#F472B6']].map(([ico,v,c])=>(
            <div key={ico} style={{background:c+'15',border:'1px solid '+c+'30',borderRadius:8,padding:'5px 9px',display:'flex',alignItems:'center',gap:4}}>
              <span style={{fontSize:11}}>{ico}</span>
              <span style={{fontSize:11,fontWeight:700,color:c,fontFamily:'monospace'}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:'14px 16px'}}>

        {/* ADVANCE TURN + AUTO */}
        <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'stretch'}}>
          <button onClick={advanceTurn} style={{flex:1,background:'linear-gradient(135deg,#1D4ED8,#7C3AED)',color:'#fff',border:'none',borderRadius:16,padding:'16px 0',fontWeight:900,fontSize:17,cursor:'pointer',letterSpacing:1,boxShadow:'0 8px 32px rgba(124,58,237,0.35)'}}>
            ▶ &nbsp;ADVANCE TURN
          </button>
          <button onClick={()=>setAutoAdv(a=>!a)} style={{background:autoAdv?T.amber+'22':'#0A1628',border:'1px solid '+(autoAdv?T.amber:T.border),color:autoAdv?T.amber:T.muted,borderRadius:16,padding:'0 14px',fontWeight:800,fontSize:12,cursor:'pointer',whiteSpace:'nowrap'}}>
            {autoAdv?'⏸ Auto':'⏩ Auto'}
          </button>
        </div>

        {/* Auto-advance speed selector */}
        {autoAdv&&(
          <div style={{background:T.amber+'11',border:'1px solid '+T.amber+'33',borderRadius:12,padding:'10px 14px',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:11,color:T.amber,fontWeight:700,flexShrink:0}}>Speed:</span>
            {[1,3,5,10].map(s=>(
              <button key={s} onClick={()=>setAutoSpeed(s)} style={{flex:1,padding:'6px 0',background:autoSpeed===s?T.amber:'transparent',color:autoSpeed===s?'#000':T.amber,border:'1px solid '+T.amber+'44',borderRadius:8,fontSize:11,fontWeight:700,cursor:'pointer'}}>
                {s}s
              </button>
            ))}
          </div>
        )}

        {/* CEO Alert */}
        {pending>0&&hasBoardAccess&&(
          <div onClick={()=>onNavigate?.('command')} style={{background:'rgba(239,68,68,0.1)',borderRadius:14,padding:'14px 16px',border:'1px solid rgba(239,68,68,0.4)',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,cursor:'pointer',boxShadow:'0 0 20px rgba(239,68,68,0.1)'}}>
            <div>
              <div style={{fontSize:14,color:'#FCA5A5',fontWeight:800}}>⚠️ {pending} Board Decision{pending>1?'s':''} Pending</div>
              <div style={{fontSize:11,color:T.red,marginTop:3}}>You own 10%+ in a company — your vote matters</div>
            </div>
            <div style={{background:'rgba(239,68,68,0.2)',borderRadius:10,padding:'8px 12px',fontSize:13,fontWeight:800,color:'#FCA5A5'}}>Resolve →</div>
          </div>
        )}

        {pending>0&&!hasBoardAccess&&(
          <div onClick={()=>onNavigate?.('command')} style={{background:'rgba(71,85,105,0.15)',borderRadius:14,padding:'12px 16px',border:'1px solid rgba(71,85,105,0.3)',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,cursor:'pointer'}}>
            <div>
              <div style={{fontSize:13,color:T.sub,fontWeight:700}}>🏛️ Board decisions exist — own 10%+ of a company to vote</div>
              <div style={{fontSize:11,color:T.muted,marginTop:2}}>{pending} decision{pending>1?'s':''} pending</div>
            </div>
            <div style={{fontSize:12,color:T.muted}}>View →</div>
          </div>
        )}

        {/* Streak */}
        {(d.streak||0)>0&&(
          <div style={{background:T.card,borderRadius:14,padding:'12px 14px',border:'1px solid '+T.border,marginBottom:12,display:'flex',alignItems:'center',gap:12}}>
            <div style={{fontSize:28}}>🔥</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',gap:4,marginBottom:4}}>
                {Array.from({length:7}).map((_,i)=>(
                  <div key={i} style={{flex:1,height:6,borderRadius:3,background:i<(d.streak||0)?T.amber:T.border}}/>
                ))}
              </div>
              <div style={{fontSize:11,color:T.sub}}>{(d.streak||0)>=7?'🎯 7-day streak! Spin token awarded.':d.streak+'/7 day streak — keep advancing turns'}</div>
            </div>
          </div>
        )}

        {/* Tax Era Card */}
        <div style={{background:T.card,borderRadius:16,padding:'14px 16px',border:'1px solid '+T.border,marginBottom:12}}>
          <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10}}>Tax Environment</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:eraC,marginBottom:4}}>{era.name}</div>
              <div style={{fontSize:12,color:T.sub,lineHeight:1.5,maxWidth:180}}>{era.desc}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:38,fontWeight:900,color:eraC,fontFamily:'monospace',lineHeight:1}}>{Math.round(era.cgt*100)}%</div>
              <div style={{fontSize:10,color:T.muted,marginTop:2}}>Capital Gains Tax</div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {[['Div Tax',Math.round(era.divTax*100)+'%'],['Next Era','T'+(Math.ceil(d.turn/60)*60)],['Tax Relief',Math.round((d.taxRelief||0)*100)+'%']].map(([l,v])=>(
              <div key={l} style={{background:T.bg,borderRadius:10,padding:'9px 0',textAlign:'center'}}>
                <div style={{fontSize:9,color:T.muted,textTransform:'uppercase',letterSpacing:1}}>{l}</div>
                <div style={{fontSize:14,fontWeight:700,color:T.text,fontFamily:'monospace',marginTop:3}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Planet Unlock Progress */}
        <div style={{background:T.card,borderRadius:16,padding:'14px 16px',border:'1px solid '+T.border,marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>🌌 Planet Unlock Progress</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {PLANET_ORDER.map(({name,ico,color})=>{
              const unlocked = d.planetUnlocks?.[name] !== false;
              const threshold = PLANET_THRESHOLDS[name];
              const progress = threshold ? Math.min(1, totalPortfolio / threshold) : 1;
              return (
                <div key={name} style={{background:unlocked?color+'15':T.bg,borderRadius:12,padding:'10px 12px',border:'1px solid '+(unlocked?color+'40':T.border)}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                      <span style={{fontSize:16}}>{ico}</span>
                      <span style={{fontSize:12,fontWeight:800,color:unlocked?T.text:T.muted}}>{name}</span>
                    </div>
                    {unlocked
                      ?<div style={{fontSize:9,background:color+'30',color,padding:'2px 6px',borderRadius:6,fontWeight:700}}>ACTIVE</div>
                      :<div style={{fontSize:9,color:T.muted}}>🔒</div>
                    }
                  </div>
                  {threshold&&(
                    <>
                      <div style={{background:T.border,borderRadius:3,height:4,overflow:'hidden',marginBottom:4}}>
                        <div style={{width:(progress*100)+'%',height:'100%',background:unlocked?color:'#374151',borderRadius:3,transition:'width .4s'}}/>
                      </div>
                      <div style={{fontSize:9,color:T.muted,fontFamily:'monospace'}}>
                        {unlocked?'Unlocked at '+fm(threshold):'Need '+fm(threshold)}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Geopolitical Events */}
        {(d.geoEvents||[]).length>0&&(
          <div style={{background:T.card,borderRadius:16,padding:'14px 16px',border:'1px solid '+T.border,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>🌐 World Intelligence</div>
            {(d.geoEvents||[]).slice(0,4).map(ev=>(
              <div key={ev.id} style={{display:'flex',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{width:3,borderRadius:2,flexShrink:0,background:GEO_IMPACT_COLOR[ev.impact]||T.muted,alignSelf:'stretch'}}/>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                    <div style={{fontSize:10,color:T.muted}}>T{ev.t} · {ev.ico} {ev.region}</div>
                    <div style={{fontSize:9,fontWeight:700,color:GEO_IMPACT_COLOR[ev.impact]||T.muted,background:(GEO_IMPACT_COLOR[ev.impact]||T.muted)+'18',padding:'2px 7px',borderRadius:6,textTransform:'uppercase'}}>{ev.impact}</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:2}}>{ev.ti}</div>
                  <div style={{fontSize:11,color:T.sub,lineHeight:1.5}}>{ev.bo}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* News Feed */}
        <div style={{background:T.card,borderRadius:16,padding:'14px 16px',border:'1px solid '+T.border}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>📰 Market Intelligence</div>
          {(d.news||[]).slice(0,6).map(n=>(
            <div key={n.id} style={{display:'flex',gap:12,padding:'11px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <div style={{width:3,borderRadius:2,flexShrink:0,background:n.g?T.green:T.red,alignSelf:'stretch',boxShadow:'0 0 6px '+(n.g?T.green:T.red)}}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <div style={{fontSize:10,color:T.muted}}>T{n.t} · {n.ico}</div>
                  <div style={pill(n.g?T.green:T.red,undefined)}>{n.g?'▲':'▼'}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:3}}>{n.ti}</div>
                <div style={{fontSize:11,color:T.sub,lineHeight:1.5}}>{n.bo}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSettings && <SettingsModal onClose={()=>setShowSettings(false)} />}
    </div>
  );
}
