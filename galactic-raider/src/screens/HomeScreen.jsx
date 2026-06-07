import { useState, useEffect, useRef } from 'react';
import { useGame } from '../store/gameStore';
import { fm } from '../utils';
import { TAX_ERAS } from '../constants';

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

export default function HomeScreen({ onNavigate }) {
  const { D, advanceTurn } = useGame();
  const d = D;
  const era = TAX_ERAS[d.eraIdx];

  const [autoAdv, setAutoAdv] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(3);
  const autoRef = useRef(null);

  useEffect(() => {
    if (autoAdv) {
      autoRef.current = setInterval(() => advanceTurn(), autoSpeed * 1000);
    }
    return () => clearInterval(autoRef.current);
  }, [autoAdv, autoSpeed, advanceTurn]);

  const nw = (d.cashWallet||0)+(d.savingsWallet||0)+(d.tradingWallet||0)+(d.foundationBalance||0);
  const stockVal = Object.entries(d.stockHoldings||{}).reduce((x,[t,n])=>{
    const co=d.companies?.find(c=>c.t===t); return x+(co?co.price*n:0);},0);
  const etfVal = (d.etfs||[]).reduce((x,e)=>x+e.price*(e.units||0),0);
  const fundVal = Object.values(d.fundDeposits||{}).reduce((x,f)=>x+(f.deposit||0),0);
  const totalPortfolio = nw + stockVal + etfVal + fundVal;
  const pending = (d.pendingDecisions||[]).length;

  // Board access check — CEO decisions are relevant once you own 10%+ in any company
  const hasBoardAccess = Object.values(d.companyOwnership||{}).some(pct=>pct>=10);

  const stockRegions = new Set(Object.keys(d.stockHoldings||{}).map(t=>{
    const co=d.companies?.find(c=>c.t===t);return co?.hq;}).filter(Boolean));
  const unlockDone = [nw>=5e9,d.turn>=300,stockRegions.size>=3,(d.donCount||0)>=2].filter(Boolean).length;

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
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:5}}>
            <div style={pill(eraC)}>{era.name}</div>
            <div style={pill(d.gdp>=0?T.green:T.red)}>GDP {d.gdp>=0?'+':''}{d.gdp}%</div>
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

        {/* CEO Alert — only shown when you have board access AND pending decisions */}
        {pending>0&&hasBoardAccess&&(
          <div onClick={()=>onNavigate?.('command')} style={{background:'rgba(239,68,68,0.1)',borderRadius:14,padding:'14px 16px',border:'1px solid rgba(239,68,68,0.4)',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,cursor:'pointer',boxShadow:'0 0 20px rgba(239,68,68,0.1)'}}>
            <div>
              <div style={{fontSize:14,color:'#FCA5A5',fontWeight:800}}>⚠️ {pending} Board Decision{pending>1?'s':''} Pending</div>
              <div style={{fontSize:11,color:T.red,marginTop:3}}>You own 10%+ in a company — your vote matters</div>
            </div>
            <div style={{background:'rgba(239,68,68,0.2)',borderRadius:10,padding:'8px 12px',fontSize:13,fontWeight:800,color:'#FCA5A5'}}>Resolve →</div>
          </div>
        )}

        {/* Board access hint (no ownership yet, but decisions exist) */}
        {pending>0&&!hasBoardAccess&&(
          <div onClick={()=>onNavigate?.('command')} style={{background:'rgba(71,85,105,0.15)',borderRadius:14,padding:'12px 16px',border:'1px solid rgba(71,85,105,0.3)',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,cursor:'pointer'}}>
            <div>
              <div style={{fontSize:13,color:T.sub,fontWeight:700}}>🏛️ {pending} Board Decision{pending>1?'s':''} Available</div>
              <div style={{fontSize:11,color:T.muted,marginTop:2}}>Own 10%+ of a company to vote</div>
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

        {/* Solar System Unlock */}
        <div style={{background:T.card,borderRadius:16,padding:'14px 16px',border:'1px solid '+(d.solarUnlocked?T.amber:T.border),marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={{fontSize:14,fontWeight:700,color:T.text}}>🌌 Solar System Unlock</div>
            {d.solarUnlocked
              ?<div style={pill(T.amber)}>UNLOCKED</div>
              :<div style={{fontSize:12,color:T.muted}}>{unlockDone}/4</div>
            }
          </div>
          <div style={{background:T.bg,borderRadius:4,height:6,overflow:'hidden',marginBottom:12}}>
            <div style={{width:(unlockDone/4*100)+'%',height:'100%',background:'linear-gradient(90deg,#3B82F6,#F59E0B)',borderRadius:4,transition:'width .6s ease'}}/>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:2}}>
            {[['Net Worth $5B',nw>=5e9,fm(nw)+' / $5B'],['Turn 300+',d.turn>=300,'T'+d.turn+' / T300'],['3+ Stock Regions',stockRegions.size>=3,stockRegions.size+' / 3 regions'],['2+ Donations',(d.donCount||0)>=2,(d.donCount||0)+' / 2']].map(([l,done,cur])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{fontSize:16}}>{done?'✅':'⬜'}</div>
                <div style={{flex:1,fontSize:12,fontWeight:done?600:400,color:done?T.green:T.sub}}>{l}</div>
                <div style={{fontSize:10,color:T.muted,fontFamily:'monospace'}}>{cur}</div>
              </div>
            ))}
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
    </div>
  );
}
