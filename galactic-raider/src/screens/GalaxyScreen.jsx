import React, { useState } from 'react';
import { useGame } from '../store/gameStore';
import { BADGE_DEFS, PLANET_THRESHOLDS } from '../store/gameStore';
import { fm } from '../utils';
import { PLANETS_DATA } from '../constants';
import { getTheme } from '../theme';
import { getT } from '../i18n';

// Default T for module-level helpers that need it (sub-components will use their own TH)
const T_DEFAULT = {
  bg:'#030810', card:'#0A1628', raised:'#0F1E35',
  border:'rgba(255,255,255,0.08)',
  text:'#F1F5F9', sub:'#94A3B8', muted:'#475569',
  green:'#10B981', red:'#F43F5E', blue:'#3B82F6',
  amber:'#F59E0B', purple:'#8B5CF6', cyan:'#06B6D4',
};
// T will be overridden inside components; this is for static sub-helpers
const T = T_DEFAULT;

// ── TILE ───────────────────────────────────────────────────────
function Tile({ico,label,sub,color,onClick}) {
  return (
    <div onClick={onClick} style={{background:`linear-gradient(135deg,${color}18,${color}08)`,border:`1px solid ${color}30`,borderRadius:18,padding:'20px 16px',cursor:'pointer',textAlign:'center'}}>
      <div style={{fontSize:36,marginBottom:8}}>{ico}</div>
      <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:4}}>{label}</div>
      <div style={{fontSize:11,color:T.muted}}>{sub}</div>
    </div>
  );
}

// ── PANEL WRAPPER ──────────────────────────────────────────────
function PanelHeader({title,onBack}) {
  return (
    <div style={{background:'linear-gradient(180deg,#050F20,#030810)',padding:'18px 16px 14px',borderBottom:'1px solid '+T.border,marginBottom:0}}>
      <button onClick={onBack} style={{background:T.raised,border:'1px solid '+T.border,color:T.sub,borderRadius:10,padding:'8px 14px',cursor:'pointer',fontSize:12,marginBottom:12}}>← Back to Galaxy</button>
      <div style={{fontSize:22,fontWeight:900,color:T.text}}>{title}</div>
    </div>
  );
}

// ── AVATAR DEFINITIONS ────────────────────────────────────────
const SPACE_AVATARS = [
  { id:'🚀', label:'Pioneer',      color:'#3B82F6', glow:'#60A5FA', anim:'float',   bg:'linear-gradient(135deg,#1e3a8a,#1e40af)' },
  { id:'👨‍🚀', label:'Astronaut',    color:'#94A3B8', glow:'#CBD5E1', anim:'breathe', bg:'linear-gradient(135deg,#1e293b,#334155)' },
  { id:'🛸', label:'Commander',    color:'#10B981', glow:'#34D399', anim:'pulse',   bg:'linear-gradient(135deg,#064e3b,#065f46)' },
  { id:'⚡', label:'Flash Trader', color:'#F59E0B', glow:'#FCD34D', anim:'zap',    bg:'linear-gradient(135deg,#78350f,#92400e)' },
  { id:'🌌', label:'Galaxy Chief', color:'#8B5CF6', glow:'#A78BFA', anim:'nebula', bg:'linear-gradient(135deg,#4c1d95,#5b21b6)' },
  { id:'💫', label:'Starborn',     color:'#EC4899', glow:'#F472B6', anim:'twinkle',bg:'linear-gradient(135deg,#831843,#9d174d)' },
  { id:'🤖', label:'CosmoBot',     color:'#06B6D4', glow:'#67E8F9', anim:'scan',   bg:'linear-gradient(135deg,#0c4a6e,#075985)' },
  { id:'👑', label:'Space Baron',  color:'#F59E0B', glow:'#FDE68A', anim:'shimmer',bg:'linear-gradient(135deg,#713f12,#92400e)' },
  { id:'🔭', label:'The Watcher',  color:'#6366F1', glow:'#818CF8', anim:'orbit',  bg:'linear-gradient(135deg,#1e1b4b,#312e81)' },
  { id:'🌙', label:'Moon Sentinel',color:'#94A3B8', glow:'#E2E8F0', anim:'glow',   bg:'linear-gradient(135deg,#1e293b,#0f172a)' },
  { id:'☄️', label:'Comet Chaser', color:'#EF4444', glow:'#FCA5A5', anim:'streak', bg:'linear-gradient(135deg,#7f1d1d,#991b1b)' },
  { id:'🪐', label:'Ring Master',  color:'#7C3AED', glow:'#C4B5FD', anim:'ring',   bg:'linear-gradient(135deg,#4c1d95,#2e1065)' },
];

// ── INSIGHTS PANEL ─────────────────────────────────────────────
const PLANET_INFO = {
  Earth:{ico:'🌍',color:'#2E7D32'},Mars:{ico:'🔴',color:'#C62828'},Venus:{ico:'🟡',color:'#F57F17'},
  Jupiter:{ico:'🟠',color:'#E65100'},Saturn:{ico:'🪐',color:'#7B1FA2'},Mercury:{ico:'☿',color:'#455A64'},
  Uranus:{ico:'🔵',color:'#0277BD'},Neptune:{ico:'💜',color:'#4527A0'},
};

function NWSparkline({data}) {
  if(!data||data.length<2) return <div style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',color:T.muted,fontSize:12}}>No data yet</div>;
  const vals=data.map(d=>d[1]);
  const turns=data.map(d=>d[0]);
  const minV=Math.min(...vals),maxV=Math.max(...vals);
  const minT=Math.min(...turns),maxT=Math.max(...turns);
  const w=300,h=80;
  const pts=data.map(([t,v])=>`${((t-minT)/(maxT-minT||1))*(w-10)+5},${h-((v-minV)/(maxV-minV||1))*(h-10)+5}`).join(' ');
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{display:'block'}}>
      <defs>
        <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.green} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={T.green} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function InsightsPanel({onBack}) {
  const {D}=useGame();
  const d=D;
  const [subTab,setSubTab]=useState('profile');
  const stats=d.stats||{};

  React.useEffect(() => {
    const id = 'avatar-anim-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes cc-float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-6px) scale(1.05)} }
      @keyframes cc-breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      @keyframes cc-pulse { 0%,100%{box-shadow:0 0 0 0 currentColor} 50%{box-shadow:0 0 0 8px transparent} }
      @keyframes cc-zap { 0%{filter:brightness(1)} 25%{filter:brightness(1.8)} 50%{filter:brightness(1)} 75%{filter:brightness(1.6)} 100%{filter:brightness(1)} }
      @keyframes cc-nebula { 0%{opacity:1;transform:scale(1) rotate(0deg)} 50%{opacity:.85;transform:scale(1.06) rotate(3deg)} 100%{opacity:1;transform:scale(1) rotate(0deg)} }
      @keyframes cc-twinkle { 0%,100%{filter:brightness(1) drop-shadow(0 0 2px #F472B6)} 50%{filter:brightness(1.5) drop-shadow(0 0 12px #F472B6)} }
      @keyframes cc-scan { 0%{filter:hue-rotate(0deg) brightness(1)} 50%{filter:hue-rotate(180deg) brightness(1.3)} 100%{filter:hue-rotate(360deg) brightness(1)} }
      @keyframes cc-shimmer { 0%,100%{filter:brightness(1)} 33%{filter:brightness(1.4)} 66%{filter:brightness(.9)} }
      @keyframes cc-orbit { 0%,100%{transform:translateX(0) scale(1)} 25%{transform:translateX(3px) scale(1.02)} 75%{transform:translateX(-3px) scale(.98)} }
      @keyframes cc-glow { 0%,100%{filter:drop-shadow(0 0 3px #94A3B8)} 50%{filter:drop-shadow(0 0 14px #E2E8F0)} }
      @keyframes cc-streak { 0%{transform:translateX(-2px) skewX(0deg)} 50%{transform:translateX(2px) skewX(-5deg)} 100%{transform:translateX(-2px) skewX(0deg)} }
      @keyframes cc-ring { 0%,100%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.05) rotate(5deg)} }
    `;
    document.head.appendChild(style);
  }, []);

  const avatarDef = SPACE_AVATARS.find(a => a.id === (d.playerAvatar || '🚀'));

  const stockVal=Object.entries(d.stockHoldings||{}).reduce((x,[t,n])=>{const co=d.companies?.find(c=>c.t===t);return x+(co?co.price*n:0);},0);
  const etfVal=(d.etfs||[]).reduce((x,e)=>x+e.price*(e.units||0),0);
  const fundVal=Object.values(d.fundDeposits||{}).reduce((x,f)=>x+(f.deposit||0),0);
  const walletVal=(d.cashWallet||0)+(d.savingsWallet||0)+(d.tradingWallet||0)+(d.foundationBalance||0);
  const planetVal=Object.entries(d.planetHoldings||{}).reduce((x,[key,n])=>{
    const parts=key.split('_');const pn=parts[0];const tk=parts.slice(1).join('_');
    const pd=PLANETS_DATA[pn];const ps=d.planetCompanies?.[pn];const co=ps?.cos?.find(c=>c.t===tk);
    return x+(co&&pd?co.price*pd.rate*n:0);
  },0);
  const bondVal=(d.bondHoldings||[]).reduce((x,b)=>x+b.principal,0);
  const cryptoVal=Object.entries(d.cryptoHoldings||{}).reduce((x,[id,qty])=>{
    const hist=d.cryptoHist?.[id];const price=hist&&hist.length>0?hist[hist.length-1]:(d.cryptoPrices?.[id]||0);
    return x+qty*price;
  },0);
  const commVal=Object.entries(d.commodityHoldings||{}).reduce((x,[id,qty])=>{
    const hist=d.commodityHist?.[id];const price=hist&&hist.length>0?hist[hist.length-1]:0;
    return x+qty*price;
  },0);
  const totalPortfolio=walletVal+stockVal+etfVal+fundVal+planetVal+bondVal+cryptoVal+commVal;

  // Individual trade log pulled from the transaction history
  const tradeLog=(d.txLog||[]).filter(tx=>['BUY','SELL','BUY_PLANET','SELL_PLANET','BUY_ETF','SELL_ETF','BUY_CRYPTO','SELL_CRYPTO','BUY_COMM','SELL_COMM','IPO_BOOK'].includes(tx.type));

  const SUBTABS=['Profile','Journey','Trades','Finance','Holdings','Badges','Unlocks','Planets'];

  return (
    <div style={{background:T.bg,minHeight:'100%',paddingBottom:80}}>
      <PanelHeader title="📊 Insights" onBack={onBack}/>
      {/* Hero stats */}
      <div style={{padding:'12px 16px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,borderBottom:'1px solid '+T.border}}>
        {[['Peak NW',fm(stats.peakNetWorth||totalPortfolio),T.green],['Turn','T'+d.turn,T.blue],['Trades',(stats.tradesTotal||0).toLocaleString(),T.amber]].map(([l,v,c])=>(
          <div key={l} style={{background:T.card,borderRadius:10,padding:'10px 8px',textAlign:'center'}}>
            <div style={{fontSize:9,color:T.muted,textTransform:'uppercase',marginBottom:4}}>{l}</div>
            <div style={{fontSize:14,fontWeight:800,color:c,fontFamily:'monospace'}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{padding:'8px 16px',overflowX:'auto',display:'flex',gap:6}}>
        {SUBTABS.map(t=>(
          <button key={t} onClick={()=>setSubTab(t.toLowerCase())} style={{flexShrink:0,padding:'7px 12px',background:subTab===t.toLowerCase()?T.blue:'rgba(255,255,255,0.05)',border:'1px solid '+(subTab===t.toLowerCase()?T.blue:T.border),borderRadius:20,color:subTab===t.toLowerCase()?'#fff':T.muted,fontSize:11,fontWeight:700,cursor:'pointer'}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{padding:'12px 16px'}}>
        {subTab==='profile'&&(
          <div>
            <div style={{background: avatarDef ? avatarDef.bg : T.card,borderRadius:14,padding:16,border:`1px solid ${avatarDef ? avatarDef.glow+'55' : T.border}`,marginBottom:12,textAlign:'center',boxShadow: avatarDef ? `0 0 24px ${avatarDef.glow}33` : 'none'}}>
              <div style={{
                fontSize:48,
                marginBottom:8,
                display:'inline-block',
                animation: avatarDef ? `cc-${avatarDef.anim} 2.5s ease-in-out infinite` : 'none',
              }}>{d.playerAvatar||'🚀'}</div>
              <div style={{fontSize:20,fontWeight:900,color:T.text}}>{d.playerName||'Trader'}</div>
              {avatarDef && <div style={{fontSize:11,color:avatarDef.glow,fontWeight:700,marginTop:2}}>{avatarDef.label}</div>}
              <div style={{fontSize:12,color:T.muted,marginTop:4}}>Turn {d.turn} · {(d.badges||[]).length} badges earned</div>
            </div>
            {[['Net Worth',fm(totalPortfolio),T.green],['Peak NW',fm(stats.peakNetWorth||totalPortfolio),T.green],['Trades Won',stats.tradesWon||0,T.green],['Trades Lost',stats.tradesLost||0,T.red],['Tax Paid',fm(stats.totalTaxPaid||0),T.amber],['GSF Income',fm(stats.totalGSFIncome||0),T.cyan],['Savings Int.',fm(stats.totalSavingsInterest||0),T.blue],['Donations','$'+fm(d.totalDonated||0),T.purple]].map(([l,v,c])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid rgba(0,0,0,0.3)'}}>
                <span style={{fontSize:12,color:T.sub}}>{l}</span>
                <span style={{fontSize:12,fontWeight:700,color:c,fontFamily:'monospace'}}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {subTab==='journey'&&(
          <div>
            <div style={{background:T.card,borderRadius:14,padding:14,border:'1px solid '+T.border,marginBottom:12}}>
              <div style={{fontSize:11,color:T.muted,marginBottom:8}}>Net Worth Over Time</div>
              <NWSparkline data={stats.nwHistory}/>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
                <div style={{fontSize:10,color:T.muted}}>Start: {fm((stats.nwHistory||[[1,1000000]])[0]?.[1]||1000000)}</div>
                <div style={{fontSize:10,color:T.green}}>Now: {fm(totalPortfolio)}</div>
              </div>
            </div>
            {(stats.unlockLog||[]).length>0&&(
              <div style={{background:T.card,borderRadius:14,padding:14,border:'1px solid '+T.border}}>
                <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:10}}>Milestone Log</div>
                {(stats.unlockLog||[]).slice(0,20).map((ev,i)=>(
                  <div key={i} style={{display:'flex',gap:10,padding:'7px 0',borderBottom:'1px solid rgba(0,0,0,0.3)'}}>
                    <div style={{fontSize:10,color:T.muted,flexShrink:0}}>T{ev.turn}</div>
                    <div style={{fontSize:11,color:T.sub}}>{ev.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {subTab==='trades'&&(
          <div>
            {[['Total Trades',stats.tradesTotal||0,T.text],['Trades Won',stats.tradesWon||0,T.green],['Trades Lost',stats.tradesLost||0,T.red],['Win Rate',(stats.tradesTotal>0?((stats.tradesWon||0)/(stats.tradesTotal||1)*100).toFixed(1):0)+'%',T.amber],['Biggest Win',fm(stats.biggestWin||0),T.green],['Biggest Loss',fm(stats.biggestLoss||0),T.red],['Total Tax Paid',fm(stats.totalTaxPaid||0),T.amber]].map(([l,v,c])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(0,0,0,0.3)',background:T.card,marginBottom:1,paddingLeft:14,paddingRight:14,borderRadius:0}}>
                <span style={{fontSize:12,color:T.sub}}>{l}</span>
                <span style={{fontSize:12,fontWeight:700,color:c,fontFamily:'monospace'}}>{v}</span>
              </div>
            ))}
            {stats.biggestWinDesc&&<div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:10,padding:'10px 14px',marginTop:12,fontSize:11,color:T.green}}>{stats.biggestWinDesc}</div>}
            {stats.biggestLossDesc&&<div style={{background:'rgba(244,63,94,0.08)',border:'1px solid rgba(244,63,94,0.2)',borderRadius:10,padding:'10px 14px',marginTop:8,fontSize:11,color:T.red}}>{stats.biggestLossDesc}</div>}

            {/* Full trade-by-trade history */}
            <div style={{marginTop:14,fontSize:11,fontWeight:700,color:T.text,marginBottom:8}}>All Trades ({tradeLog.length})</div>
            {tradeLog.length===0?(
              <div style={{textAlign:'center',padding:'24px 16px',color:T.muted,fontSize:12}}>No trades yet — buy your first asset in Markets</div>
            ):(
              tradeLog.slice(0,100).map((tx,i)=>{
                const isBuy=tx.type.startsWith('BUY')||tx.type==='IPO_BOOK';
                return (
                  <div key={i} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,0.3)'}}>
                    <div style={{width:4,borderRadius:2,flexShrink:0,background:isBuy?T.blue:T.green,alignSelf:'stretch'}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
                        <span style={{fontSize:10,fontWeight:700,color:isBuy?T.blue:T.green}}>{tx.type.replace('_',' ')}</span>
                        <span style={{fontSize:10,color:T.muted,flexShrink:0}}>T{tx.turn}</span>
                      </div>
                      <div style={{fontSize:11,color:T.sub,marginTop:2,lineHeight:1.4}}>{tx.desc}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {subTab==='badges'&&(
          <div>
            <div style={{fontSize:11,color:T.muted,marginBottom:10}}>{(d.badges||[]).length} of {BADGE_DEFS.length} earned</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {BADGE_DEFS.map(b=>{
                const earned=(d.badges||[]).includes(b.id);
                return (
                  <div key={b.id} style={{background:earned?'rgba(251,191,36,0.10)':T.card,borderRadius:12,padding:'12px 10px',border:'1px solid '+(earned?'rgba(251,191,36,0.4)':T.border),textAlign:'center',opacity:earned?1:0.5}}>
                    <div style={{fontSize:30,marginBottom:6,filter:earned?'none':'grayscale(1)'}}>{earned?b.ico:'🔒'}</div>
                    <div style={{fontSize:12,fontWeight:800,color:earned?'#FBBF24':T.muted}}>{b.label}</div>
                    <div style={{fontSize:9,color:T.muted,marginTop:3,lineHeight:1.3}}>{b.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {subTab==='finance'&&(
          <div>
            {[['GSF Interest Income',fm(stats.totalGSFIncome||0),T.cyan],['Savings Interest',fm(stats.totalSavingsInterest||0),T.blue],['Total Tax Paid',fm(stats.totalTaxPaid||0),T.amber],['Total Donated',fm(d.totalDonated||0),T.purple],['Total Debt',fm(d.totalDebt||0),T.red],['Interest Paid',fm(d.totalInterestPaid||0),T.red],['Spin Tokens',d.spinTokens||0,T.amber],['Redeem Points',d.redeemPts||0,T.purple]].map(([l,v,c])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(0,0,0,0.3)'}}>
                <span style={{fontSize:12,color:T.sub}}>{l}</span>
                <span style={{fontSize:12,fontWeight:700,color:c,fontFamily:'monospace'}}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {subTab==='holdings'&&(
          <div>
            {[['Cash Wallets',walletVal,'#60A5FA'],['Earth Stocks',stockVal,'#A78BFA'],['Planet Stocks',planetVal,'#06B6D4'],['ETFs',etfVal,'#34D399'],['Sov. Funds',fundVal,'#F472B6'],['Bonds',bondVal,'#FBBF24'],['Crypto',cryptoVal,'#F59E0B'],['Commodities',commVal,'#10B981']].map(([l,v,c])=>(
              <div key={l}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}>
                  <span style={{fontSize:12,color:T.sub}}>{l}</span>
                  <span style={{fontSize:12,fontWeight:700,color:c,fontFamily:'monospace'}}>{fm(v)}</span>
                </div>
                <div style={{background:T.border,borderRadius:3,height:6,overflow:'hidden',marginBottom:8}}>
                  <div style={{width:(totalPortfolio>0?v/totalPortfolio*100:0)+'%',height:'100%',background:c,borderRadius:3}}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {subTab==='unlocks'&&(
          <div>
            {(stats.unlockLog||[]).length===0?(
              <div style={{textAlign:'center',padding:'32px 16px',color:T.muted}}>
                <div style={{fontSize:36,marginBottom:10}}>🔒</div>
                <div>No unlocks yet — grow your portfolio!</div>
              </div>
            ):(
              (stats.unlockLog||[]).map((ev,i)=>(
                <div key={i} style={{background:T.card,borderRadius:10,padding:'10px 14px',marginBottom:8,border:'1px solid '+T.border}}>
                  <div style={{fontSize:10,color:T.muted,marginBottom:3}}>Turn {ev.turn}</div>
                  <div style={{fontSize:13,fontWeight:700,color:T.text}}>{ev.desc}</div>
                </div>
              ))
            )}
          </div>
        )}

        {subTab==='planets'&&(
          <div>
            {Object.entries(PLANET_INFO).map(([name,{ico,color}])=>{
              const unlocked=d.planetUnlocks?.[name]!==false;
              const threshold=PLANET_THRESHOLDS[name];
              const progress=threshold?Math.min(1,totalPortfolio/threshold):1;
              return (
                <div key={name} style={{background:T.card,borderRadius:12,padding:14,border:'1px solid '+(unlocked?color+'40':T.border),marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:24}}>{ico}</span>
                      <div>
                        <div style={{fontSize:14,fontWeight:800,color:T.text}}>{name}</div>
                        {threshold&&<div style={{fontSize:10,color:T.muted}}>Unlock at {fm(threshold)}</div>}
                      </div>
                    </div>
                    <div style={{fontSize:11,fontWeight:700,color:unlocked?color:'#374151',background:unlocked?color+'20':'rgba(255,255,255,0.05)',padding:'4px 10px',borderRadius:20}}>
                      {unlocked?'ACTIVE':'LOCKED'}
                    </div>
                  </div>
                  {threshold&&(
                    <>
                      <div style={{background:'rgba(0,0,0,0.3)',borderRadius:4,height:6,overflow:'hidden',marginBottom:4}}>
                        <div style={{width:(progress*100)+'%',height:'100%',background:unlocked?color:'#374151',borderRadius:4}}/>
                      </div>
                      <div style={{fontSize:10,color:T.muted,fontFamily:'monospace'}}>{(progress*100).toFixed(1)}% — {fm(totalPortfolio)} / {fm(threshold)}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── SPACE GUIDE PANEL ──────────────────────────────────────────
const PLANET_SCIENCE = {
  Earth: {dist:'1 AU (150M km)',temp:'-88°C to 58°C',atm:'Nitrogen 78%, Oxygen 21%',fact:'Only known planet with life',ico:'🌍',color:'#2E7D32',econ:'GDP $100T · USD · 10 companies · Low risk',
    area:'510 million km² surface · 71% ocean',gov:'Federated planetary markets governed by the Earth Exchange Commission. Stable rule of law, deep liquidity, transparent reporting.',
    resources:'Diversified — technology, banking, energy, healthcare, mining, agriculture and real estate. The most balanced economy in the system.',
    paras:[
      'Earth is the financial heart of the solar system and your home base. With the deepest, most liquid markets and the lowest volatility, it is where most players build their first fortune before venturing outward.',
      'The Earth economy spans ten public companies across seven sectors, from Silk Road Tech to AgroLatin Corp. Prices are anchored by the Economic Governor, which keeps valuations within realistic price-to-earnings bounds, so crashes and bubbles are gentler here than anywhere else.',
      'Investment thesis: Earth is your low-risk core. Use blue chips (SLKT, MRDB, TNPT) and the Global Equity ETF to compound steadily, then redeploy gains into higher-risk planetary plays as your net worth grows.'
    ],
    sci:{'Diameter':'12,742 km — the 1× baseline','From Sun':'149.6M km (1 AU)','Year':'365.25 days','Day':'24 hours','Moons':'1 — the Moon','Claim to Fame':'Only known world with life'}},
  Mars: {dist:'1.52 AU (228M km)',temp:'-125°C to 20°C',atm:'CO2 95%, thin',fact:'Olympus Mons — tallest volcano in solar system',ico:'🔴',color:'#C62828',econ:'GDP growing · MCR currency · 4 companies · Medium risk',
    area:'145 million km² · roughly Earth\'s land area',gov:'Corporate-colonial charter economy. The Mars Colonisation Society administers mining rights and the MCR currency. Light regulation, fast growth.',
    resources:'Ultra-pure lithium (3× Earth grade), red-dust iron, perchlorates for fuel and life support. The supply backbone of the solar EV industry.',
    paras:[
      'Mars is the first frontier — unlocking at $5B net worth. Its economy is built on extraction: the lithium and iron that power robotics and construction across the inner planets.',
      'The Martian market runs on the MCR currency at roughly 0.85 USD. Because Mars trades close to Earth, contagion from Earth shocks arrives within two turns but at half intensity — a useful diversifier without being fully decoupled.',
      'Investment thesis: Mars rewards growth investors. Mining and robotics names carry high beta, so position sizes should be moderate. Holding MCR before buying gives a fee discount on stock purchases.'
    ],
    sci:{'Diameter':'6,779 km (0.53× Earth)','From Sun':'227.9M km','Year':'687 Earth days','Day':'24.6 hours','Moons':'2 — Phobos & Deimos','Claim to Fame':'Olympus Mons (21.9 km) — tallest volcano in the solar system'}},
  Venus: {dist:'0.72 AU (108M km)',temp:'462°C average',atm:'CO2 96%, crushing pressure',fact:'Rotates backwards, day longer than year',ico:'🟡',color:'#F57F17',econ:'Automated energy · VCR currency · 3 companies · Medium risk',
    area:'460 million km² · nearly Earth-sized',gov:'Fully automated economy run by autonomous industrial collectives. No human surface presence; governance is algorithmic and energy-export driven.',
    resources:'Solar energy at scale, sulfuric industrial compounds, and atmospheric carbon for composite manufacturing.',
    paras:[
      'Venus unlocks at $50B and offers a steady, energy-anchored economy. Its automated solar arrays export power across the inner system, giving Venusian equities a defensive, utility-like character.',
      'The crushing 462°C surface means all industry is robotic and orbital. This makes Venus less prone to the labour and storm shocks that hit other planets — its GDP drifts slowly and predictably.',
      'Investment thesis: Venus is a medium-risk income play. Solar and manufacturing names pay reliable dividends. A good place to park capital between aggressive bets elsewhere.'
    ],
    sci:{'Diameter':'12,104 km (0.95× Earth)','From Sun':'108.2M km','Year':'225 Earth days','Day':'243 Earth days — retrograde (spins backwards)','Moons':'0','Claim to Fame':'Hottest planet — 465°C surface'}},
  Jupiter: {dist:'5.2 AU (778M km)',temp:'-110°C cloud tops',atm:'Hydrogen & Helium gas giant',fact:'Great Red Spot: storm lasting 350+ years',ico:'🟠',color:'#E65100',econ:'Robotic economy · JCR · 3 companies · High risk (storms)',
    area:'Gas giant · 11× Earth diameter · no solid surface',gov:'Orbital-platform robotic economy. Operations float in the upper atmosphere; the Jupiter Authority licenses fusion-fuel extraction.',
    resources:'Fusion-grade hydrogen, atmospheric ice crystals for cryo-propulsion, and the system\'s richest energy reserves.',
    paras:[
      'Jupiter unlocks at $200B and is defined by one mechanic: storms. Roughly every 50–100 turns a storm cuts prices to about 70% before a sharp recovery. The disciplined investor buys the dip.',
      'The Jovian economy is almost entirely robotic, centred on fusion-hydrogen extraction from the upper atmosphere. Its companies carry the highest betas of the gas giants — JRES research AI can move violently.',
      'Investment thesis: Jupiter is a timing game. Keep dry powder, buy aggressively during storms, and trim into the recovery. Post-storm entries are historically the best risk/reward in the entire game.'
    ],
    sci:{'Diameter':'139,820 km (11× Earth)','From Sun':'778.5M km','Year':'11.9 Earth years','Day':'9.9 hours — fastest spinner','Moons':'95 known','Claim to Fame':'Great Red Spot — a storm bigger than Earth'}},
  Saturn: {dist:'9.5 AU (1.4B km)',temp:'-140°C',atm:'Hydrogen & Helium',fact:'Least dense planet — would float on water',ico:'🪐',color:'#7B1FA2',econ:'Ryzolith mining · STC currency · 3 companies · High risk',
    area:'Gas giant · spectacular ring system',gov:'Ryzolith-backed monetary economy. The Saturn Sovereign Fund and Ryzolith Corp jointly control the system\'s scarcest resource.',
    resources:'Ryzolith — the most valuable substance in the solar system — plus ultra-pure ring ice exported for terraforming.',
    paras:[
      'Saturn unlocks at $1T and is the gateway to the truly rich planets. Its economy is anchored by Ryzolith, a substance so scarce that a single company controls 94% of supply and prices rise with time.',
      'The famous rings are more than scenery: ring-ice exports feed terraforming projects across the system. Saturn trades on the STC currency at a low 0.70 USD, so currency timing matters on entry and exit.',
      'Investment thesis: Saturn is a scarcity play. Ryzolith exposure (stock and commodity) appreciates structurally over a long game. Pair it with ring-ice names for a balanced Saturnian book.'
    ],
    sci:{'Diameter':'116,460 km (9.1× Earth)','From Sun':'1.43B km','Year':'29.4 Earth years','Moons':'146','Rings':'282,000 km wide, yet only ~10 m thick','Claim to Fame':'Least dense planet — it would float in water'}},
  Mercury: {dist:'0.39 AU (58M km)',temp:'-180°C to 430°C',atm:'Virtually none',fact:'Solar day = 176 Earth days',ico:'☿',color:'#455A64',econ:'Solar energy · MRC currency · 3 companies · Very high risk',
    area:'75 million km² · smallest planet',gov:'Solar-energy export economy. Mercury Solar Prime operates the closest, most intense solar capture in the system under a state-utility charter.',
    resources:'Solar crystals (energy-storage medium grown in extreme heat), thermal ore, and 24× Earth solar intensity.',
    paras:[
      'Mercury unlocks at $10T. Sitting closest to the Sun, it captures 24× Earth\'s solar intensity, making it the system\'s premier energy producer despite its tiny size.',
      'Extreme temperature swings — from -180°C to 430°C across its long solar day — forge unique materials like solar crystals and thermal ore. Solar-flare events can boost output and prices sharply.',
      'Investment thesis: Mercury is very high risk with strong energy upside. Mercury Solar Prime pays a solid dividend and anchors the book; thermal and robotics names add volatility for the aggressive investor.'
    ],
    sci:{'Diameter':'4,879 km (0.38× Earth)','From Sun':'57.9M km — closest planet','Year':'88 Earth days','Day':'176 Earth days (solar day)','Moons':'0','Claim to Fame':'Wildest temperature swing — −173°C to 427°C'}},
  Uranus: {dist:'19.2 AU (2.9B km)',temp:'-195°C',atm:'Methane gives blue color',fact:'Rotates on its side — 98° axial tilt',ico:'🔵',color:'#0277BD',econ:'Ice mining · URU currency · 3 companies · Extreme risk',
    area:'Ice giant · 4× Earth diameter',gov:'Long-cycle cryogenic economy. Governance adapts to 42-year seasons; the Uranus Research Base coordinates ice extraction and cryo-tech.',
    resources:'Cryo-methane fuel and diamond-hard "Uranian ice" used in space-drilling technology.',
    paras:[
      'Uranus unlocks at $50T and operates on a uniquely long horizon. Its 98° axial tilt produces 42-year seasons, creating predictable multi-decade supply cycles rather than the fast shocks seen elsewhere.',
      'The ice giant\'s signature exports are cryo-methane fuel and diamond-ice crystals so hard they tip the system\'s best mining drills. Activity is sparse but structurally valuable.',
      'Investment thesis: Uranus is an extreme-risk, patient-capital planet. Its low currency (0.55 USD) and thin liquidity reward long holds. Best suited to late-game players diversifying a trillion-dollar book.'
    ],
    sci:{'Diameter':'50,724 km (4× Earth)','From Sun':'2.87B km','Year':'84 Earth years','Moons':'28','Tilt':'98° — rotates on its side','Claim to Fame':'Coldest planetary atmosphere — −224°C'}},
  Neptune: {dist:'30.1 AU (4.5B km)',temp:'-200°C',atm:'Methane, hydrogen, helium',fact:'Fastest winds in solar system: 2,100 km/h',ico:'💜',color:'#4527A0',econ:'Deep research · NPT currency · 3 companies · Extreme risk',
    area:'Ice giant · most distant economy',gov:'Frontier research economy. The Neptune Deep Research consortium operates with minimal oversight at the edge of the system — highest risk, highest potential.',
    resources:'Deep-field minerals of unknown composition and wind-energy crystals formed by 2,100 km/h winds — the most efficient energy storage ever discovered.',
    paras:[
      'Neptune unlocks at $100T — the final and richest frontier. As the most distant economy, it is the most volatile and the most rewarding, built around deep-field research and extraction.',
      'Its 2,100 km/h winds — the fastest in the solar system — forge wind-energy crystals of unmatched efficiency, while deep-field mineral sites yield materials of unknown, extreme value.',
      'Investment thesis: Neptune is pure high-conviction speculation. NRES research carries the highest beta in the game and the Neptune Sovereign Fund offers the system\'s top APR (28.4%). Size positions for survivability — the swings are brutal.'
    ],
    sci:{'Diameter':'49,244 km (3.9× Earth)','From Sun':'4.5B km — farthest planet','Year':'165 Earth years','Moons':'16','Winds':'Fastest in the solar system — 2,100 km/h','Claim to Fame':'Completed its first full orbit since its 1846 discovery only in 2011'}},
};

// Real-astronomy cards for objects beyond the eight planets
const BEYOND_THE_EIGHT = [
  {ico:'🧊',color:'#90A4AE',title:'Pluto — Dwarf Planet',
   body:'Just 2,377 km across — 0.19× Earth and smaller than our own Moon. It orbits 5.9B km from the Sun, taking 248 Earth years per lap, and has 5 moons including huge Charon. Reclassified from planet to dwarf planet in 2006.'},
  {ico:'🌙',color:'#B0BEC5',title:'The Moon',
   body:'Earth\'s companion is 3,474 km across and orbits 384,400 km away. It is slowly drifting from us at about 3.8 cm per year — roughly the speed your fingernails grow.'},
  {ico:'☀️',color:'#F59E0B',title:'The Sun',
   body:'A ball of plasma 1.39 million km across — 109 Earths lined up edge to edge. It contains 99.86% of the entire solar system\'s mass; everything else, all planets included, is the leftover 0.14%.'},
  {ico:'⭐',color:'#8B5CF6',title:'Proxima Centauri — Nearest Star',
   body:'The closest star beyond the Sun sits 4.24 light-years away. At the speed of today\'s fastest space probes, the journey would take roughly 70,000 years.'},
  {ico:'🪨',color:'#A1887F',title:'Ceres',
   body:'The largest object in the asteroid belt (about 940 km across) and the only dwarf planet in the inner solar system.'},
  {ico:'🌑',color:'#78909C',title:'Eris',
   body:'A distant dwarf planet nearly the size of Pluto — its 2005 discovery is what triggered Pluto\'s reclassification.'},
  {ico:'❄️',color:'#4FC3F7',title:'Makemake',
   body:'A bright, reddish dwarf planet in the Kuiper Belt beyond Neptune, with one known tiny moon.'},
  {ico:'🥚',color:'#CE93D8',title:'Haumea',
   body:'An egg-shaped dwarf planet that spins so fast (one day lasts about 4 hours) it has stretched itself — and it even has a ring.'},
];

const SCALE_PARAGRAPH = 'Cosmic scale: if Earth were a 1 cm marble, the Sun would be a 109 cm ball about 117 m away — and Proxima Centauri, the very nearest star, would sit roughly 31,000 km away, most of the way around the planet.';

function SpaceGuidePanel({onBack}) {
  const {D}=useGame();
  const d=D;
  const [selected,setSelected]=useState(null);

  const stockVal=Object.entries(d.stockHoldings||{}).reduce((x,[t,n])=>{const co=d.companies?.find(c=>c.t===t);return x+(co?co.price*n:0);},0);
  const etfVal=(d.etfs||[]).reduce((x,e)=>x+e.price*(e.units||0),0);
  const fundVal=Object.values(d.fundDeposits||{}).reduce((x,f)=>x+(f.deposit||0),0);
  const walletVal=(d.cashWallet||0)+(d.savingsWallet||0)+(d.tradingWallet||0)+(d.foundationBalance||0);
  const totalPortfolio=walletVal+stockVal+etfVal+fundVal;

  return (
    <div style={{background:T.bg,minHeight:'100%',paddingBottom:80}}>
      <PanelHeader title="🪐 Space Guide" onBack={onBack}/>
      <div style={{padding:'14px 16px'}}>
        {Object.entries(PLANET_SCIENCE).map(([name,sci])=>{
          const unlocked=d.planetUnlocks?.[name]!==false;
          const threshold=PLANET_THRESHOLDS[name];
          const progress=threshold?Math.min(1,totalPortfolio/threshold):1;
          const isOpen=selected===name;
          return (
            <div key={name} onClick={()=>setSelected(isOpen?null:name)} style={{background:`linear-gradient(135deg,${sci.color}20,${sci.color}08)`,borderRadius:18,padding:16,border:`1px solid ${sci.color}40`,marginBottom:12,cursor:'pointer',boxShadow:isOpen?`0 0 20px ${sci.color}30`:undefined,transition:'box-shadow .3s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:isOpen?12:0}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{fontSize:36}}>{sci.ico}</div>
                  <div>
                    <div style={{fontSize:18,fontWeight:900,color:T.text}}>{name}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>{sci.dist}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:11,fontWeight:700,color:unlocked?sci.color:'#374151',background:unlocked?sci.color+'20':'rgba(255,255,255,0.05)',padding:'4px 10px',borderRadius:20}}>
                    {unlocked?'ACTIVE':'🔒'}
                  </div>
                </div>
              </div>

              {isOpen&&(
                <div>
                  {/* Multi-paragraph briefing */}
                  {(sci.paras||[]).map((p,i)=>(
                    <div key={i} style={{fontSize:12,color:'rgba(255,255,255,0.82)',lineHeight:1.65,marginBottom:10}}>{p}</div>
                  ))}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                    {[['Temperature',sci.temp],['Atmosphere',sci.atm],['Size',sci.area],['Distance',sci.dist]].map(([l,v])=>(
                      <div key={l} style={{background:'rgba(0,0,0,0.3)',borderRadius:10,padding:10}}>
                        <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:3}}>{l}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.8)',fontWeight:600}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'rgba(0,0,0,0.3)',borderRadius:10,padding:10,marginBottom:10}}>
                    <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:3}}>Governance</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.75)',lineHeight:1.5}}>{sci.gov}</div>
                  </div>
                  <div style={{background:'rgba(0,0,0,0.3)',borderRadius:10,padding:10,marginBottom:10}}>
                    <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:3}}>Key Resources</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.75)',lineHeight:1.5}}>{sci.resources}</div>
                  </div>
                  <div style={{background:'rgba(0,0,0,0.3)',borderRadius:10,padding:10,marginBottom:10}}>
                    <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:3}}>Amazing Fact</div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,0.9)',fontStyle:'italic'}}>✨ {sci.fact}</div>
                  </div>
                  {sci.sci&&(
                    <div style={{background:'rgba(0,0,0,0.3)',borderRadius:10,padding:10,marginBottom:10}}>
                      <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:8}}>🔭 Real Astronomy</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                        {Object.entries(sci.sci).map(([l,v])=>(
                          <div key={l} style={{background:'#0D1B2E',borderRadius:8,padding:'8px 9px',border:'1px solid rgba(255,255,255,0.06)'}}>
                            <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:3}}>{l}</div>
                            <div style={{fontSize:11,color:'rgba(255,255,255,0.85)',fontWeight:600,lineHeight:1.4}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{background:'rgba(0,0,0,0.3)',borderRadius:10,padding:10,marginBottom:threshold?10:0}}>
                    <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:3}}>Game Economy</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.7)'}}>{sci.econ}</div>
                  </div>
                  {threshold&&!unlocked&&(
                    <div>
                      <div style={{background:'rgba(0,0,0,0.4)',borderRadius:8,height:6,overflow:'hidden',marginBottom:6}}>
                        <div style={{width:(progress*100)+'%',height:'100%',background:sci.color,borderRadius:8}}/>
                      </div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',textAlign:'center'}}>Need {fm(threshold)} to unlock · You have {fm(totalPortfolio)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Beyond the Eight — real astronomy past the planets */}
        <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:2,margin:'18px 2px 10px'}}>🔭 Beyond the Eight</div>
        {BEYOND_THE_EIGHT.map(item=>(
          <div key={item.title} style={{background:'#0D1B2E',borderRadius:14,padding:'12px 14px',border:'1px solid #1A2744',marginBottom:8,display:'flex',gap:12,alignItems:'flex-start'}}>
            <div style={{fontSize:26,lineHeight:1,marginTop:2}}>{item.ico}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800,color:item.color,marginBottom:4}}>{item.title}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.65)',lineHeight:1.55}}>{item.body}</div>
            </div>
          </div>
        ))}
        <div style={{background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:14,padding:'12px 14px',marginTop:4,fontSize:11,color:'#C4B5FD',lineHeight:1.6}}>
          🌌 {SCALE_PARAGRAPH}
        </div>
      </div>
    </div>
  );
}

// ── ACADEMY PANEL ──────────────────────────────────────────────
const CHAPTERS = [
  {n:1,title:'What Is Investing?',desc:'Learn the fundamentals — why investing beats saving, and how money grows over time through returns.',
   content:'Investing is the act of allocating money with the expectation of generating a profit or return. Unlike saving (which preserves value), investing grows wealth by putting capital to work. In Cosmos Capital, you invest across stocks, ETFs, bonds, sovereign funds, and planetary economies. The core principle: risk and return are related. Higher potential returns come with higher risk. Diversification — spreading investments across different assets — reduces risk without sacrificing expected returns.'},
  {n:2,title:'Understanding Stocks',desc:'What a stock is, how ownership works, and why prices move.',
   content:'A stock (or share) represents partial ownership of a company. When you buy SLKT stock, you own a tiny fraction of Silk Road Tech. Stock prices reflect market expectations about future earnings. If investors expect strong growth, prices rise. If outlook worsens, prices fall. In Cosmos Capital, the Economic Governor keeps P/E ratios within realistic bounds, preventing runaway prices. Key drivers: earnings reports, analyst ratings, CEO decisions, and geopolitical events.'},
  {n:3,title:'Reading a Company (P/E, Beta, Dividends)',desc:'Decode the key metrics that tell you if a stock is cheap or expensive.',
   content:'P/E Ratio (Price-to-Earnings): Stock price divided by annual earnings per share. A P/E of 20 means you pay $20 for every $1 of annual earnings. Lower P/E = cheaper. Beta: Measures volatility relative to the market. Beta 1.8 = moves 80% more than average. High beta = more risk, more reward. Dividend Yield: Annual dividend divided by price. A 4% yield on a $100 stock = $4/year per share. Good for income investors.'},
  {n:4,title:'ETFs & Diversification',desc:'How to invest in hundreds of companies through a single ticker.',
   content:'An ETF (Exchange-Traded Fund) holds a basket of securities. The GSFE (Global Equity ETF) in Cosmos Capital gives you exposure to 15 Earth companies in one trade. Benefits: instant diversification, low cost (expense ratio), professional rebalancing. Downside: capped upside vs single-stock picks. Dividends from ETF holdings are distributed to your Trading Wallet every 30 turns. Expense ratios are deducted automatically from returns.'},
  {n:5,title:'Loans, Leverage & Risk',desc:'Why borrowing can supercharge returns — or destroy them.',
   content:'Leverage means using borrowed money to amplify returns. If you borrow $500K at 15% APR and earn 25% on it, you profit the spread. But if your investment drops, losses are magnified AND you still owe interest. In Cosmos Capital, 6 loan tiers are available. The loan accrues interest daily, with payments auto-deducted monthly. Tip: borrow in bull markets, repay before downturns. Never borrow more than you can service from cash flow.'},
  {n:6,title:'Tax Strategy (The Tax Eras)',desc:'How to time your trades around the 8 rotating tax regimes.',
   content:'Cosmos Capital cycles through 8 tax eras every 60 turns. Capital Gains Tax (CGT) is deducted from your profits when you SELL a position. Strategy: SELL in Capital Gains era (5% CGT) and Low Tax era (10%). HOLD during High Tax era (30%). Build positions in Normal era (20%). Philanthropy donations create multi-turn CGT relief — up to 75% reduction. The Foundation also protects your Savings Wallet from bankruptcy scenarios.'},
  {n:7,title:'Planet Economics',desc:'How planetary markets work, risk premia, and when to invest.',
   content:'Each planet has its own currency, GDP, risk level, and company set. Currency rates affect USD returns when you buy/sell. Higher-risk planets (Neptune, Uranus) offer bigger swings but extreme volatility. Planetary unlock thresholds gate access by net worth — Mars opens at $5B, Neptune requires $100T. Post-storm on Jupiter is historically the best buying opportunity in the game. Sovereign funds compound daily and offer some of the highest APRs available.'},
  {n:8,title:'Building a Trillion-Dollar Empire',desc:'End-game strategies: tax optimization, planet diversification, and the road to $1T.',
   content:'Late-game strategy: 1) Maximize planet diversification — all 8 planets active. 2) Time large sells during Capital Gains tax eras. 3) Stack philanthropy donations for 75% CGT relief. 4) Deposit into high-yield sovereign funds (Neptune: 28.4% APR). 5) Use bonds as low-risk base — Cosmic bonds yield 18-35%. 6) Own 50%+ in key companies for CEO control. 7) Complete 7-turn streaks for spin tokens. The path from $100B to $1T is through compound growth — let time work for you.'},
  {n:9,title:'The Power of Compounding',desc:'Why time in the market beats timing the market — the eighth wonder of the world.',
   content:'Compounding is earning returns on your returns. $1M growing at 12% becomes $3.1M in 10 turns-of-years, $9.6M in 20, and $29M in 30 — the curve bends upward because each period builds on a larger base. In Cosmos Capital, sovereign funds compound daily, savings accrue interest, and reinvested gains snowball. The lesson: start early, reinvest everything, and avoid interrupting compounding with unnecessary taxable sells. The biggest fortunes come from patience, not frantic trading.'},
  {n:10,title:'Dollar-Cost Averaging',desc:'How buying in steady increments tames volatility and removes emotion.',
   content:'Dollar-cost averaging (DCA) means investing a fixed amount at regular intervals regardless of price. When prices are low you buy more units; when high, fewer. Over time your average cost smooths out, and you avoid the trap of dumping everything at a peak. In a volatile game like this — where planet stocks and crypto swing hard — DCA into positions across several turns rather than all at once. It protects you from bad timing and from your own fear and greed.'},
  {n:11,title:'Risk Management & Position Sizing',desc:'The single most important skill: never let one bet sink the ship.',
   content:'Position sizing is deciding how much to put into any single trade. A common rule: never risk more than you can afford to lose on one position. High-beta names (JRES, NRES, crypto) should be small slices; stable blue chips and bonds can be larger. Diversify across asset classes and planets so no single shock is fatal. The Foundation protects your Savings Wallet as a last line of defense. Survival first — you cannot compound if you are wiped out.'},
  {n:12,title:'Asset Allocation',desc:'Splitting capital across stocks, bonds, funds, crypto and commodities.',
   content:'Asset allocation is the mix of asset types in your portfolio, and it drives most of your long-run results. A balanced Cosmos Capital portfolio might hold growth stocks for upside, bonds and sovereign funds for stable yield, commodities (gold) as a crisis hedge, and a small crypto sleeve for asymmetric bets. Rebalance periodically — sell what has grown too large, add to what has lagged — to keep your risk where you want it. Allocation matters more than individual stock picks.'},
  {n:13,title:'Market Cycles: Bull & Bear',desc:'Recognizing the rhythm of greed and fear, expansion and recession.',
   content:'Markets move in cycles. Bull markets — rising prices, positive GDP, optimism — eventually give way to bear markets — falling prices, negative GDP, fear. Geopolitical events and storms can trigger turns. The skilled investor accumulates during fear (buy the dip), trims during euphoria, and never assumes a trend lasts forever. Watch the GDP indicator and the world-events feed: persistent negative readings warn of a coming downturn, while recovery signals an entry point.'},
  {n:14,title:'Behavioral Finance',desc:'Your worst enemy is often the investor in the mirror.',
   content:'Behavioral finance studies the psychological biases that cost investors money: FOMO (chasing pumps), loss aversion (refusing to sell losers), recency bias (assuming the last trend continues), and overconfidence (over-sizing bets after a win). The Fortune Wheel is a perfect test — gambling feels exciting but the math favors patience. Build rules, follow them, and let discipline beat emotion. The market rewards the calm and punishes the impulsive.'},
  {n:15,title:'Cryptocurrency',desc:'Digital assets, volatility, and the 30% flat tax.',
   content:'Crypto in Cosmos Capital spans 14 Earth coins (BTC, ETH and more) plus locked planet tokens. Prices are highly volatile with gentle mean-reversion toward their anchors. Crypto profits are taxed at a flat 30% — higher than most stock eras — so factor that into your exits. Treat crypto as a small, high-risk sleeve: position sizes should be modest, and never invest money you need. Planet tokens unlock as you reach their worlds, adding speculative upside late game.'},
  {n:16,title:'Commodities & Hard Assets',desc:'Gold, oil, lithium and the raw materials that move with the real economy.',
   content:'Commodities are physical goods — gold, silver, oil, copper, lithium and more, plus exotic planetary materials. Gold and silver spike during crises (a classic hedge), oil reacts to geopolitical events, and lithium tracks the Martian economy. Commodity gains are taxed at a flat 15%. Prices mean-revert and are clamped to realistic bands, so they trend rather than explode. Use commodities to hedge equity risk and to express macro views on the real economy.'},
  {n:17,title:'Foreign Exchange (FX)',desc:'Currencies, exchange rates, and why holding local money matters.',
   content:'Each planet trades in its own currency at a USD exchange rate that fluctuates each turn. When you buy planet stocks, your USD is converted at the prevailing rate — so currency moves affect your returns. Holding local currency before buying gives a fee discount. A weakening planet currency erodes USD gains; a strengthening one boosts them. Advanced players watch FX rates and exchange when rates are favorable, treating currency as its own source of profit and risk.'},
  {n:18,title:'Bonds In Depth',desc:'Fixed income, yields, maturity and the risk ladder.',
   content:'Bonds are loans you make to governments or corporations in exchange for fixed interest plus principal at maturity. Yield reflects risk: safe Earth government bonds pay modest rates; corporate bonds pay more; Cosmic bonds (Mars, Jupiter, Neptune) yield 18–35% but require planet unlocks. Maturity is measured in turns — longer bonds lock your capital but pay more. Bonds anchor a portfolio with predictable income and lower volatility than equities. Ladder maturities to balance liquidity and yield.'},
  {n:19,title:'Sovereign Funds',desc:'High-yield, daily-compounding state funds — the lazy investor\'s friend.',
   content:'Planet Sovereign Funds are state-run investment vehicles that compound daily and pay interest straight into your Trading Wallet every turn. APRs range from Earth\'s 12.5% to Neptune\'s 28.4%, with a 2% entry fee. Higher rates reflect higher planetary risk. Funds are ideal for capital you want growing passively without active trading. A core allocation to sovereign funds provides a steady income stream that fuels new investments elsewhere.'},
  {n:20,title:'Philanthropy & Tax Relief',desc:'Doing good while legally slashing your capital gains tax.',
   content:'Donations from your Cash Wallet earn Redemption Points and multi-turn CGT relief — stacking up to a 75% reduction. Different causes offer different relief rates and durations: Disaster relief gives 35% for 8 turns, Education 25% for 5 turns with a points multiplier. Time donations before large profitable sells to minimize tax. Donations also count toward the Wheel of Fortune requirements. Generosity is genuinely profitable here — a rare win-win.'},
  {n:21,title:'CEO Control & Board Power',desc:'Buy enough of a company and you start running it.',
   content:'Ownership unlocks governance. Hold 10%+ of a company for a board seat (vote on dividends), 25%+ to propose strategy, and 50%+ to replace the CEO. Board decisions appear in the Command Center and carry real price and reputation impacts — and ignored decisions auto-resolve to the worst option, so stay engaged. Controlling key companies lets you steer their fortunes, but concentration is risk: a controlled company that stumbles hits your portfolio hard.'},
  {n:22,title:'Reading Analyst Ratings',desc:'STRONG BUY to SELL — what the targets really mean.',
   content:'Each Earth company carries analyst ratings with price targets and notes. STRONG BUY and BUY signal conviction upside; HOLD means fairly valued; SELL warns of downside. But analysts disagree, and targets are opinions, not guarantees. Use ratings as one input among many — combine them with the P/E, beta, dividend yield and the world-events feed. A SELL on a stock you understand may be a contrarian opportunity; a STRONG BUY at a stretched P/E may be a trap.'},
  {n:23,title:'Storms, Events & Timing',desc:'Turning chaos — geopolitics, disasters and Jovian storms — into opportunity.',
   content:'Random world events shift markets every few turns: geopolitical tensions, natural disasters, tech breakthroughs and corporate scandals each tilt prices. Jupiter storms cut its prices to ~70% before recovery. The world-intelligence feed on the Home screen is your early-warning system. Negative events often create the best entry points if you have dry powder. The disciplined investor treats volatility as a sale, not a threat — buying quality when others panic.'},
  {n:24,title:'The Endgame: Diversified Dominance',desc:'Putting it all together for a resilient trillion-dollar empire.',
   content:'A mature empire is diversified across every dimension: all eight planets active, every asset class represented, income streams from funds, bonds and dividends, and tax minimized through era timing and philanthropy. Keep a cash reserve for storm dips, control a few key companies, and let compounding do the heavy lifting. The final lesson of Cosmos Capital mirrors real investing: survive the downturns, stay diversified, keep costs and taxes low, and give time the room to make you rich.'},
];

function AcademyPanel({onBack}) {
  const [chapter,setChapter]=useState(null);
  const [completed,setCompleted]=useState(()=>{
    try{return JSON.parse(localStorage.getItem('CC_academy')||'[]');}catch(e){return[];}
  });

  const markComplete=(n)=>{
    const next=[...new Set([...completed,n])];
    setCompleted(next);
    try{localStorage.setItem('CC_academy',JSON.stringify(next));}catch(e){/* ignore */}
  };

  if(chapter) {
    const ch=CHAPTERS.find(c=>c.n===chapter);
    const done=completed.includes(chapter);
    return (
      <div style={{background:T.bg,minHeight:'100%',paddingBottom:80}}>
        <PanelHeader title={`Chapter ${ch.n}: ${ch.title}`} onBack={()=>setChapter(null)}/>
        <div style={{padding:'16px'}}>
          <div style={{background:T.card,borderRadius:14,padding:16,border:'1px solid '+T.border,marginBottom:16,fontSize:13,color:T.sub,lineHeight:1.8}}>{ch.content}</div>
          {done?(
            <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:14,padding:14,textAlign:'center',color:T.green,fontWeight:700}}>
              ✅ Chapter Completed! +50 points earned.
            </div>
          ):(
            <button onClick={()=>markComplete(chapter)} style={{width:'100%',background:T.green,color:'#fff',border:'none',borderRadius:14,padding:'15px 0',fontWeight:800,fontSize:16,cursor:'pointer'}}>
              Mark Complete — Earn 50 pts
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{background:T.bg,minHeight:'100%',paddingBottom:80}}>
      <PanelHeader title="🎓 Academy" onBack={onBack}/>
      <div style={{padding:'14px 16px'}}>
        <div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:12,padding:'10px 14px',marginBottom:14,fontSize:11,color:'#6EE7B7'}}>
          Complete chapters to earn knowledge points. {CHAPTERS.length} chapters · 50 pts each.
        </div>
        <div style={{fontSize:12,color:T.muted,marginBottom:10}}>{completed.length}/{CHAPTERS.length} completed</div>
        <div style={{background:T.border,borderRadius:4,height:6,overflow:'hidden',marginBottom:16}}>
          <div style={{width:(completed.length/CHAPTERS.length*100)+'%',height:'100%',background:T.green,borderRadius:4}}/>
        </div>
        {CHAPTERS.map(ch=>{
          const done=completed.includes(ch.n);
          return (
            <div key={ch.n} onClick={()=>setChapter(ch.n)} style={{background:T.card,borderRadius:14,padding:14,border:'1px solid '+(done?'rgba(16,185,129,0.4)':T.border),marginBottom:8,cursor:'pointer',display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:done?T.green:'#1A2744',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff',flexShrink:0}}>
                {done?'✓':ch.n}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:3}}>{ch.title}</div>
                <div style={{fontSize:11,color:T.muted,lineHeight:1.4}}>{ch.desc}</div>
              </div>
              {done&&<div style={{fontSize:11,color:T.green,fontWeight:700,flexShrink:0}}>+50 pts</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── GLOSSARY PANEL ─────────────────────────────────────────────
const GLOSSARY_TERMS = [
  {t:'P/E Ratio',d:'Price-to-Earnings: stock price divided by earnings per share. Lower = cheaper. High-growth companies command higher P/E.'},
  {t:'Beta',d:'Volatility relative to the market. Beta 1.5 = 50% more volatile than average. High beta = higher risk and potential reward.'},
  {t:'Dividend',d:'A portion of company profits paid regularly to shareholders, typically quarterly. Credited to your Savings Wallet.'},
  {t:'Dividend Yield',d:'Annual dividend divided by stock price. A 4% yield = $4 per year for every $100 invested.'},
  {t:'CGT (Capital Gains Tax)',d:'Tax on profits from selling assets. Applied to the gain (sell price minus cost basis) at the current tax era rate.'},
  {t:'ETF',d:'Exchange-Traded Fund — a basket of securities traded as one ticker. Provides diversification with a single trade.'},
  {t:'IPO',d:'Initial Public Offering — a private company\'s first sale of shares to the public. Often oversubscribed, allocations are limited.'},
  {t:'Sovereign Fund',d:'A state-owned investment fund. In Cosmos Capital, planet sovereign funds compound daily at high APRs.'},
  {t:'Bond',d:'A fixed-income debt instrument. You lend money to a government or corporation and receive interest plus principal at maturity.'},
  {t:'Yield',d:'The return on an investment, expressed as a percentage. Bond yield = annual interest / principal.'},
  {t:'Maturity',d:'The date when a bond\'s principal and final interest are repaid. In-game, measured in turns from purchase.'},
  {t:'Portfolio',d:'The total collection of all your investments — stocks, ETFs, bonds, funds, and cash across all wallets.'},
  {t:'Leverage',d:'Using borrowed capital to amplify potential returns (and losses). Taking a $500K loan is a form of leverage.'},
  {t:'Short Selling',d:'Selling shares you don\'t own, profiting if price falls. Not implemented in Cosmos Capital (long positions only).'},
  {t:'Bull Market',d:'A sustained period of rising prices and investor optimism. Positive GDP and high earnings signal bull conditions.'},
  {t:'Bear Market',d:'A sustained decline of 20%+ from recent highs. Negative GDP, falling earnings, and rising risk.'},
  {t:'GDP',d:'Gross Domestic Product — total value of goods/services produced. Each planet has its own GDP that drifts each turn.'},
  {t:'Inflation',d:'Rising prices eroding purchasing power. High GDP growth can signal inflation, impacting real returns.'},
  {t:'Market Cap',d:'Total market value of a company\'s shares. Price × total shares outstanding. SLKT has 1.2B total shares.'},
  {t:'Liquidity',d:'How easily an asset can be bought or sold without affecting its price. Cash is perfectly liquid; planet stocks less so.'},
  {t:'Volatility',d:'The degree of price variation over time. High-beta stocks and outer-planet companies exhibit more volatility.'},
  {t:'Hedge',d:'An investment that reduces risk of another. E.g., buying defensive stocks (UTLS) hedges against tech drawdowns.'},
  {t:'Derivative',d:'A financial instrument whose value derives from an underlying asset. Not directly available in Cosmos Capital.'},
  {t:'Spread',d:'The difference between buy and sell prices. Wider spreads indicate less liquid markets — like outer planet stocks.'},
  {t:'Bid/Ask',d:'Bid = price buyers will pay. Ask = price sellers will accept. The spread between them is the transaction cost.'},
  {t:'Blue Chip',d:'Large, financially stable, well-established company. SLKT, MRDB, and TNPT are Cosmos Capital\'s blue chips.'},
  {t:'Penny Stock',d:'Very low-priced, highly speculative stock. FRMN at early prices and some planet stocks qualify.'},
  {t:'REIT',d:'Real Estate Investment Trust — required to distribute 90%+ of income as dividends. RLST is the game\'s REIT.'},
  {t:'Planet Bond',d:'Bonds issued by planetary governments or corporations. Yield reflects the risk premium of that planet\'s economy.'},
  {t:'Cosmic Bond',d:'The highest-risk, highest-yield bonds in the game. Mars, Jupiter, and Neptune bonds require planet unlock first.'},
  {t:'Tax Era',d:'Cosmos Capital\'s rotating 8-regime tax system cycling every 60 turns. Determines CGT and dividend tax rates.'},
  {t:'Net Worth',d:'Total value of all assets minus liabilities (loans). The main progress metric in Cosmos Capital.'},
  {t:'Cost Basis',d:'The original price paid for an investment, used to calculate capital gains when selling.'},
  {t:'Unrealized Gain',d:'Profit on a position you still hold — the paper gain that exists but hasn\'t been taxed yet.'},
  {t:'Realized Gain',d:'Profit from a completed sale. This is what gets taxed by CGT in the current tax era.'},
  {t:'Compounding',d:'Earning returns on your previous returns. The core engine of long-term wealth — sovereign funds compound daily in-game.'},
  {t:'Dollar-Cost Averaging',d:'Investing a fixed amount at regular intervals to smooth out your average entry price and reduce timing risk.'},
  {t:'Asset Allocation',d:'How you split capital across asset classes (stocks, bonds, funds, crypto, commodities). Drives most of your long-run results.'},
  {t:'Diversification',d:'Spreading investments across many assets and planets so no single shock can sink your portfolio.'},
  {t:'Rebalancing',d:'Periodically selling what has grown too large and buying what has lagged to keep your risk mix on target.'},
  {t:'Position Sizing',d:'Deciding how much capital to put into a single trade. High-risk assets warrant smaller positions.'},
  {t:'Expense Ratio',d:'The annual fee an ETF charges, deducted from returns. Lower is better — it compounds against you over time.'},
  {t:'APR',d:'Annual Percentage Rate — the yearly interest rate on a loan or the yearly yield on a fund or savings account.'},
  {t:'Compound Interest',d:'Interest calculated on both the principal and accumulated interest. Sovereign funds use daily compounding.'},
  {t:'Principal',d:'The original amount invested or borrowed, before any interest or returns are added.'},
  {t:'Capital Gain',d:'The profit when you sell an asset for more than its cost basis. Subject to CGT in Cosmos Capital.'},
  {t:'Capital Loss',d:'The loss when you sell an asset for less than its cost basis. No tax is owed on a loss.'},
  {t:'Dividend Tax',d:'Tax applied to dividend income, set by the current tax era. Separate from capital gains tax.'},
  {t:'Tax Relief',d:'A reduction in your capital gains tax earned by donating to philanthropic causes — stacks up to 75%.'},
  {t:'Redemption Points',d:'Points earned from donations, used to qualify for the Debt Relief Wheel and other rewards.'},
  {t:'Trading Wallet',d:'Your active investing account. Most buys and sells draw from and return to this wallet.'},
  {t:'Savings Wallet',d:'A protected account that earns interest and is shielded by the Foundation. Dividends are credited here.'},
  {t:'Cash Wallet',d:'Liquid spending money. Donations are drawn from here. Transfer between wallets in the Wealth tab.'},
  {t:'Foundation',d:'A $500M asset-protection vehicle that shields your Savings Wallet and earns 3% APR.'},
  {t:'Beta Coefficient',d:'A precise measure of how much an asset moves relative to the market. Beta 2.0 swings twice as hard.'},
  {t:'Alpha',d:'Returns above what the market or a benchmark would predict — the value added by skilled investing.'},
  {t:'Sharpe Ratio',d:'Return earned per unit of risk taken. Higher Sharpe means better risk-adjusted performance.'},
  {t:'Max Drawdown',d:'The largest peak-to-trough drop an asset has experienced. A gauge of worst-case pain.'},
  {t:'Risk Premium',d:'The extra return demanded for taking on more risk. Outer planets carry large risk premia.'},
  {t:'Risk-Adjusted Return',d:'Return measured against the risk taken to achieve it — not just raw gains.'},
  {t:'Defensive Stock',d:'A stable, low-beta company (like utilities) that holds up better in downturns.'},
  {t:'Cyclical Stock',d:'A company whose fortunes rise and fall with the economic cycle — mining and energy, for example.'},
  {t:'Growth Stock',d:'A company expected to grow earnings rapidly. Higher P/E, higher beta, higher potential and risk.'},
  {t:'Value Stock',d:'A company trading cheaply relative to fundamentals. Lower P/E, often higher dividend.'},
  {t:'Earnings',d:'A company\'s profit. Rising earnings push prices up; misses push them down.'},
  {t:'EPS',d:'Earnings Per Share — a company\'s profit divided by its shares outstanding. The "E" in P/E.'},
  {t:'Revenue',d:'A company\'s total sales before costs. Growing revenue signals expanding business.'},
  {t:'Margin',d:'The percentage of revenue left as profit after costs. Higher margins mean a more efficient business.'},
  {t:'Oversubscription',d:'When IPO demand exceeds shares available. Heavily oversubscribed IPOs allocate only part of your booking.'},
  {t:'Allocation',d:'The number of shares you actually receive in an IPO, often less than booked if oversubscribed.'},
  {t:'Offer Size',d:'The total value an IPO raises. A single investor may book at most 10% of the offer in Cosmos Capital.'},
  {t:'FX Rate',d:'The exchange rate between USD and a planet currency. It fluctuates each turn and affects your returns.'},
  {t:'Currency Risk',d:'The chance that a planet currency moves against you, reducing your USD gains on local holdings.'},
  {t:'Safe Haven',d:'An asset that holds or gains value during crises. Gold is the classic safe haven in-game.'},
  {t:'Storm Event',d:'A Jupiter-specific shock that cuts prices to ~70% before recovery — a prime buying opportunity.'},
  {t:'Contagion',d:'How an Earth market shock spreads to other planets, with a delay and reduced intensity per planet.'},
  {t:'Mean Reversion',d:'The tendency of prices to drift back toward an average over time. Commodities and crypto use it in-game.'},
  {t:'Speculation',d:'High-risk investing aimed at large, uncertain gains — outer-planet stocks and crypto, for example.'},
  {t:'Drawdown',d:'A decline from a recent peak in your portfolio value. Managing drawdowns is key to survival.'},
  {t:'Stop Loss',d:'A discipline of exiting a position once losses hit a set level, to protect capital from larger drops.'},
  {t:'Dry Powder',d:'Cash kept in reserve to deploy when opportunities — like storm dips — appear.'},
  {t:'Bagholder',d:'An investor stuck holding an asset that has fallen sharply, hoping in vain for recovery.'},
  {t:'FOMO',d:'Fear Of Missing Out — the emotional urge to chase a rising asset, often near its peak.'},
  {t:'Loss Aversion',d:'The bias of feeling losses more strongly than equivalent gains, leading to poor selling decisions.'},
  {t:'Recency Bias',d:'Assuming recent trends will continue indefinitely — a common and costly mistake.'},
  {t:'Compounding Frequency',d:'How often interest is added. Daily compounding (sovereign funds) beats annual at the same rate.'},
  {t:'Yield Curve',d:'The relationship between bond yields and their maturities. Longer bonds usually pay more.'},
  {t:'Coupon',d:'The periodic interest a bond pays, expressed as a percentage of principal.'},
  {t:'Default Risk',d:'The chance a borrower fails to repay a bond. Higher-yield Cosmic bonds carry more of it.'},
  {t:'Sovereign Wealth',d:'State-owned investment capital. The planet Sovereign Funds compound it daily for depositors.'},
  {t:'Tax Era',d:'One of 8 rotating tax regimes cycling every 60 turns, setting CGT and dividend rates.'},
  {t:'Capital Preservation',d:'A strategy prioritizing protecting your money over growing it — useful in high-tax or bear eras.'},
  {t:'Total Return',d:'Your full gain including price appreciation plus dividends and interest, after taxes and fees.'},
  {t:'Benchmark',d:'A standard (like the Global Equity ETF) against which you measure your own performance.'},
  {t:'Concentration Risk',d:'The danger of having too much wealth in one position or planet. Diversification is the cure.'},
  {t:'Liquidation',d:'Selling assets to raise cash, sometimes forced — for example, to repay a loan.'},
  {t:'Insolvency',d:'When liabilities exceed assets. The Foundation shields your Savings Wallet against this scenario.'},
];

function GlossaryPanel({onBack}) {
  const [search,setSearch]=useState('');
  const filtered=GLOSSARY_TERMS.filter(t=>t.t.toLowerCase().includes(search.toLowerCase())||t.d.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{background:T.bg,minHeight:'100%',paddingBottom:80}}>
      <PanelHeader title="📚 Glossary" onBack={onBack}/>
      <div style={{padding:'12px 16px'}}>
        <input
          type="text"
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Search terms..."
          style={{width:'100%',background:T.card,border:'1px solid '+T.border,borderRadius:12,padding:'12px 16px',color:T.text,fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:12}}
        />
        <div style={{fontSize:11,color:T.muted,marginBottom:10}}>{filtered.length} terms</div>
        {filtered.map(({t,d})=>(
          <div key={t} style={{background:T.card,borderRadius:12,padding:'12px 14px',border:'1px solid '+T.border,marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:800,color:T.text,marginBottom:4}}>{t}</div>
            <div style={{fontSize:11,color:T.sub,lineHeight:1.6}}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BADGES PANEL ───────────────────────────────────────────────
function BadgesPanel({onBack}) {
  const {D}=useGame();
  const d=D;
  const earned=d.badges||[];
  return (
    <div style={{background:T.bg,minHeight:'100%',paddingBottom:80}}>
      <PanelHeader title="🏅 Badges" onBack={onBack}/>
      <div style={{padding:'14px 16px'}}>
        <div style={{fontSize:12,color:T.muted,marginBottom:12}}>{earned.length}/{BADGE_DEFS.length} earned</div>
        <div style={{background:T.border,borderRadius:4,height:6,overflow:'hidden',marginBottom:16}}>
          <div style={{width:(earned.length/BADGE_DEFS.length*100)+'%',height:'100%',background:T.amber,borderRadius:4}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {BADGE_DEFS.map(b=>{
            const e=earned.includes(b.id);
            return (
              <div key={b.id} style={{background:e?'rgba(245,158,11,0.12)':'rgba(0,0,0,0.3)',borderRadius:14,padding:'14px 12px',border:'1px solid '+(e?'rgba(245,158,11,0.4)':'rgba(255,255,255,0.05)'),textAlign:'center',opacity:e?1:0.5}}>
                <div style={{fontSize:28,marginBottom:6,filter:e?'none':'grayscale(1)'}}>{b.ico}</div>
                <div style={{fontSize:12,fontWeight:800,color:e?T.amber:T.muted,marginBottom:4}}>{b.label}</div>
                <div style={{fontSize:10,color:T.muted,lineHeight:1.4}}>{b.desc}</div>
                {e&&<div style={{marginTop:6,fontSize:10,color:T.amber,fontWeight:700}}>✓ Earned</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS PANEL ─────────────────────────────────────────────
function SettingsPanelGalaxy({onBack}) {
  const {D,setPlayerAvatar,setPlayerName}=useGame();
  const d=D;
  const TH = getTheme(D.darkMode);
  const [name,setName]=useState(d.playerName||'Trader');
  const [msg,setMsg]=useState('');
  const [currentAvatar,setCurrentAvatar]=useState(d.playerAvatar||'🚀');
  const showMsg=m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  React.useEffect(() => {
    const id = 'avatar-anim-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes cc-float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-6px) scale(1.05)} }
      @keyframes cc-breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      @keyframes cc-pulse { 0%,100%{box-shadow:0 0 0 0 currentColor} 50%{box-shadow:0 0 0 8px transparent} }
      @keyframes cc-zap { 0%{filter:brightness(1)} 25%{filter:brightness(1.8)} 50%{filter:brightness(1)} 75%{filter:brightness(1.6)} 100%{filter:brightness(1)} }
      @keyframes cc-nebula { 0%{opacity:1;transform:scale(1) rotate(0deg)} 50%{opacity:.85;transform:scale(1.06) rotate(3deg)} 100%{opacity:1;transform:scale(1) rotate(0deg)} }
      @keyframes cc-twinkle { 0%,100%{filter:brightness(1) drop-shadow(0 0 2px #F472B6)} 50%{filter:brightness(1.5) drop-shadow(0 0 12px #F472B6)} }
      @keyframes cc-scan { 0%{filter:hue-rotate(0deg) brightness(1)} 50%{filter:hue-rotate(180deg) brightness(1.3)} 100%{filter:hue-rotate(360deg) brightness(1)} }
      @keyframes cc-shimmer { 0%,100%{filter:brightness(1)} 33%{filter:brightness(1.4)} 66%{filter:brightness(.9)} }
      @keyframes cc-orbit { 0%,100%{transform:translateX(0) scale(1)} 25%{transform:translateX(3px) scale(1.02)} 75%{transform:translateX(-3px) scale(.98)} }
      @keyframes cc-glow { 0%,100%{filter:drop-shadow(0 0 3px #94A3B8)} 50%{filter:drop-shadow(0 0 14px #E2E8F0)} }
      @keyframes cc-streak { 0%{transform:translateX(-2px) skewX(0deg)} 50%{transform:translateX(2px) skewX(-5deg)} 100%{transform:translateX(-2px) skewX(0deg)} }
      @keyframes cc-ring { 0%,100%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.05) rotate(5deg)} }
    `;
    document.head.appendChild(style);
  }, []);

  const saveName=()=>{setPlayerName(name);showMsg('Name saved!');};
  const saveAvatar=(avatar)=>{setPlayerAvatar(avatar.id);setCurrentAvatar(avatar.id);showMsg('Avatar set: '+avatar.label+'!');};

  return (
    <div style={{background:T.bg,minHeight:'100%',paddingBottom:80}}>
      <PanelHeader title="⚙️ Profile" onBack={onBack}/>
      <div style={{padding:'14px 16px'}}>
        {msg&&<div style={{background:T.card,border:'1px solid '+T.border,borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}

        {/* Profile */}
        <div style={{background:T.card,borderRadius:14,padding:14,border:'1px solid '+T.border,marginBottom:12}}>
          <div style={{fontSize:11,color:T.muted,textTransform:'uppercase',letterSpacing:1.5,marginBottom:10}}>Profile</div>
          <div style={{display:'flex',gap:8,marginBottom:14}}>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} style={{flex:1,background:'#060B14',border:'1px solid #1A2744',borderRadius:8,padding:'9px 12px',color:T.text,fontSize:14,outline:'none'}}/>
            <button onClick={saveName} style={{background:T.blue,color:'#fff',border:'none',borderRadius:8,padding:'9px 14px',fontWeight:700,fontSize:12,cursor:'pointer'}}>Save</button>
          </div>
          <div style={{fontSize:11,color:T.muted,marginBottom:10}}>Choose Avatar</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {SPACE_AVATARS.map(avatar => {
              const selected = currentAvatar === avatar.id;
              const animName = `cc-${avatar.anim}`;
              return (
                <button key={avatar.id} onClick={() => saveAvatar(avatar)}
                  style={{
                    background: selected ? avatar.bg : TH.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    border: `2px solid ${selected ? avatar.glow : T.border}`,
                    borderRadius: 16,
                    padding: '14px 8px 10px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all .2s',
                    boxShadow: selected ? `0 0 18px ${avatar.glow}55` : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                  {selected && <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 50% 50%, ${avatar.glow}18, transparent 70%)`,pointerEvents:'none'}}/>}
                  <div style={{
                    fontSize: 32,
                    marginBottom: 6,
                    animation: selected ? `${animName} ${avatar.anim==='scan'?'2s':avatar.anim==='zap'?'1.5s':avatar.anim==='twinkle'?'1.8s':'2.5s'} ease-in-out infinite` : 'none',
                    display: 'inline-block',
                    lineHeight: 1,
                  }}>
                    {avatar.id}
                  </div>
                  <div style={{fontSize: 9, color: selected ? '#fff' : T.muted, fontWeight: 700, lineHeight: 1.2, letterSpacing: .3}}>
                    {avatar.label}
                  </div>
                  {selected && <div style={{position:'absolute',top:4,right:6,fontSize:8,color:avatar.glow,fontWeight:800}}>✓</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Redirect note */}
        <div style={{background:T.card,borderRadius:14,padding:14,border:'1px solid '+T.border,marginBottom:12,fontSize:12,color:T.sub,lineHeight:1.6}}>
          💡 For theme, language & save slots: go to <strong style={{color:T.text}}>Command → ⚙️ Settings</strong>
        </div>
      </div>
    </div>
  );
}

// ── PANEL WRAPPER ──────────────────────────────────────────────
function PanelWrapper({panel,onBack}) {
  if(panel==='insights') return <InsightsPanel onBack={onBack}/>;
  if(panel==='space') return <SpaceGuidePanel onBack={onBack}/>;
  if(panel==='academy') return <AcademyPanel onBack={onBack}/>;
  if(panel==='glossary') return <GlossaryPanel onBack={onBack}/>;
  if(panel==='badges') return <BadgesPanel onBack={onBack}/>;
  if(panel==='settings') return <SettingsPanelGalaxy onBack={onBack}/>;
  return null;
}

// ── MAIN GALAXY SCREEN ─────────────────────────────────────────
export default function GalaxyScreen() {
  const [panel,setPanel]=useState(null);
  const { D } = useGame();
  const TH = getTheme(D.darkMode);
  const t = getT(D.language);
  const avatarDef = SPACE_AVATARS.find(a => a.id === (D.playerAvatar || '🚀'));

  React.useEffect(() => {
    const id = 'avatar-anim-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes cc-float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-6px) scale(1.05)} }
      @keyframes cc-breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      @keyframes cc-pulse { 0%,100%{box-shadow:0 0 0 0 currentColor} 50%{box-shadow:0 0 0 8px transparent} }
      @keyframes cc-zap { 0%{filter:brightness(1)} 25%{filter:brightness(1.8)} 50%{filter:brightness(1)} 75%{filter:brightness(1.6)} 100%{filter:brightness(1)} }
      @keyframes cc-nebula { 0%{opacity:1;transform:scale(1) rotate(0deg)} 50%{opacity:.85;transform:scale(1.06) rotate(3deg)} 100%{opacity:1;transform:scale(1) rotate(0deg)} }
      @keyframes cc-twinkle { 0%,100%{filter:brightness(1) drop-shadow(0 0 2px #F472B6)} 50%{filter:brightness(1.5) drop-shadow(0 0 12px #F472B6)} }
      @keyframes cc-scan { 0%{filter:hue-rotate(0deg) brightness(1)} 50%{filter:hue-rotate(180deg) brightness(1.3)} 100%{filter:hue-rotate(360deg) brightness(1)} }
      @keyframes cc-shimmer { 0%,100%{filter:brightness(1)} 33%{filter:brightness(1.4)} 66%{filter:brightness(.9)} }
      @keyframes cc-orbit { 0%,100%{transform:translateX(0) scale(1)} 25%{transform:translateX(3px) scale(1.02)} 75%{transform:translateX(-3px) scale(.98)} }
      @keyframes cc-glow { 0%,100%{filter:drop-shadow(0 0 3px #94A3B8)} 50%{filter:drop-shadow(0 0 14px #E2E8F0)} }
      @keyframes cc-streak { 0%{transform:translateX(-2px) skewX(0deg)} 50%{transform:translateX(2px) skewX(-5deg)} 100%{transform:translateX(-2px) skewX(0deg)} }
      @keyframes cc-ring { 0%,100%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.05) rotate(5deg)} }
    `;
    document.head.appendChild(style);
  }, []);

  if(panel) return <PanelWrapper panel={panel} onBack={()=>setPanel(null)}/>;

  return (
    <div style={{background:TH.bg,minHeight:'100%',padding:'0 0 80px'}}>
      {/* Header */}
      <div style={{background:TH.isDark?'linear-gradient(180deg,#050F20,#030810)':TH.bg,padding:'18px 16px 18px',borderBottom:'1px solid '+TH.border}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:11,color:TH.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:2}}>Cosmos Capital</div>
            <div style={{fontSize:24,fontWeight:900,color:TH.text}}>🔭 Galaxy Hub</div>
            <div style={{fontSize:12,color:TH.muted,marginTop:4}}>Explore · Learn · Analyze</div>
          </div>
          <div onClick={()=>setPanel('settings')} style={{cursor:'pointer',textAlign:'center',padding:'8px 12px',background: avatarDef ? avatarDef.bg : 'rgba(255,255,255,0.06)',borderRadius:16,border:`1px solid ${avatarDef ? avatarDef.glow+'44' : TH.border}`,boxShadow: avatarDef ? `0 0 16px ${avatarDef.glow}33` : 'none'}}>
            <div style={{
              fontSize:32,
              display:'inline-block',
              animation: avatarDef ? `cc-${avatarDef.anim} 2.5s ease-in-out infinite` : 'none',
              lineHeight:1,
            }}>{D.playerAvatar||'🚀'}</div>
            <div style={{fontSize:9,color: avatarDef ? avatarDef.glow : TH.muted,fontWeight:700,marginTop:4,letterSpacing:.3}}>{D.playerName||'Trader'}</div>
          </div>
        </div>
      </div>

      <div style={{padding:'14px 16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <Tile ico='📊' label={t('tab_insights')} sub='Your analytics' color='#3B82F6' onClick={()=>setPanel('insights')}/>
          <Tile ico='🪐' label='Space Guide' sub='Planet deep dives' color='#8B5CF6' onClick={()=>setPanel('space')}/>
          <Tile ico='🎓' label={t('tab_academy')} sub='Learn the game' color='#10B981' onClick={()=>setPanel('academy')}/>
          <Tile ico='📚' label={t('tab_glossary')} sub='All terms defined' color='#F59E0B' onClick={()=>setPanel('glossary')}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <Tile ico='🏅' label={t('tab_badges')} sub='Achievements' color='#F43F5E' onClick={()=>setPanel('badges')}/>
          <Tile ico='⚙️' label={t('tab_profile')} sub='Profile & Avatar' color='#475569' onClick={()=>setPanel('settings')}/>
        </div>
      </div>
    </div>
  );
}
