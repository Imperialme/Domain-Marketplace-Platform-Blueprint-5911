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
  { id:'☄️', label:'Comet Raider', color:'#EF4444', glow:'#FCA5A5', anim:'streak', bg:'linear-gradient(135deg,#7f1d1d,#991b1b)' },
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
  const totalPortfolio=walletVal+stockVal+etfVal+fundVal+planetVal+bondVal;

  const SUBTABS=['Profile','Journey','Trades','Finance','Holdings','Unlocks','Planets'];

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
              <div style={{fontSize:20,fontWeight:900,color:T.text}}>{d.playerName||'Raider'}</div>
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
            {[['Cash Wallets',walletVal,'#60A5FA'],['Earth Stocks',stockVal,'#A78BFA'],['Planet Stocks',planetVal,'#06B6D4'],['ETFs',etfVal,'#34D399'],['Sov. Funds',fundVal,'#F472B6'],['Bonds',bondVal,'#FBBF24']].map(([l,v,c])=>(
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
  Earth: {dist:'1 AU (150M km)',temp:'-88°C to 58°C',atm:'Nitrogen 78%, Oxygen 21%',fact:'Only known planet with life',ico:'🌍',color:'#2E7D32',econ:'GDP $100T · USD · 10 companies · Low risk'},
  Mars: {dist:'1.52 AU (228M km)',temp:'-125°C to 20°C',atm:'CO2 95%, thin',fact:'Olympus Mons — tallest volcano in solar system',ico:'🔴',color:'#C62828',econ:'GDP growing · MCR currency · 4 companies · Medium risk'},
  Venus: {dist:'0.72 AU (108M km)',temp:'462°C average',atm:'CO2 96%, crushing pressure',fact:'Rotates backwards, day longer than year',ico:'🟡',color:'#F57F17',econ:'Automated energy · VCR currency · 3 companies · Medium risk'},
  Jupiter: {dist:'5.2 AU (778M km)',temp:'-110°C cloud tops',atm:'Hydrogen & Helium gas giant',fact:'Great Red Spot: storm lasting 350+ years',ico:'🟠',color:'#E65100',econ:'Robotic economy · JCR · 3 companies · High risk (storms)'},
  Saturn: {dist:'9.5 AU (1.4B km)',temp:'-140°C',atm:'Hydrogen & Helium',fact:'Least dense planet — would float on water',ico:'🪐',color:'#7B1FA2',econ:'Ryzolith mining · STC currency · 3 companies · High risk'},
  Mercury: {dist:'0.39 AU (58M km)',temp:'-180°C to 430°C',atm:'Virtually none',fact:'Solar day = 176 Earth days',ico:'☿',color:'#455A64',econ:'Solar energy · MRC currency · 3 companies · Very high risk'},
  Uranus: {dist:'19.2 AU (2.9B km)',temp:'-195°C',atm:'Methane gives blue color',fact:'Rotates on its side — 98° axial tilt',ico:'🔵',color:'#0277BD',econ:'Ice mining · URU currency · 3 companies · Extreme risk'},
  Neptune: {dist:'30.1 AU (4.5B km)',temp:'-200°C',atm:'Methane, hydrogen, helium',fact:'Fastest winds in solar system: 2,100 km/h',ico:'💜',color:'#4527A0',econ:'Deep research · NPT currency · 3 companies · Extreme risk'},
};

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
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                    {[['Temperature',sci.temp],['Atmosphere',sci.atm]].map(([l,v])=>(
                      <div key={l} style={{background:'rgba(0,0,0,0.3)',borderRadius:10,padding:10}}>
                        <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:3}}>{l}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.8)',fontWeight:600}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'rgba(0,0,0,0.3)',borderRadius:10,padding:10,marginBottom:10}}>
                    <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:3}}>Amazing Fact</div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,0.9)',fontStyle:'italic'}}>✨ {sci.fact}</div>
                  </div>
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
];

function AcademyPanel({onBack}) {
  const [chapter,setChapter]=useState(null);
  const [completed,setCompleted]=useState(()=>{
    try{return JSON.parse(localStorage.getItem('CC_academy')||'[]');}catch(e){return[];}
  });

  const markComplete=(n)=>{
    const next=[...new Set([...completed,n])];
    setCompleted(next);
    try{localStorage.setItem('CC_academy',JSON.stringify(next));}catch(e){}
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
          Complete chapters to earn knowledge points. 8 chapters · 50 pts each.
        </div>
        <div style={{fontSize:12,color:T.muted,marginBottom:10}}>{completed.length}/8 completed</div>
        <div style={{background:T.border,borderRadius:4,height:6,overflow:'hidden',marginBottom:16}}>
          <div style={{width:(completed.length/8*100)+'%',height:'100%',background:T.green,borderRadius:4}}/>
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
  const [name,setName]=useState(d.playerName||'Raider');
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

  if(panel) return <PanelWrapper panel={panel} onBack={()=>setPanel(null)}/>;

  return (
    <div style={{background:TH.bg,minHeight:'100%',padding:'0 0 80px'}}>
      {/* Header */}
      <div style={{background:TH.isDark?'linear-gradient(180deg,#050F20,#030810)':TH.bg,padding:'18px 16px 18px',borderBottom:'1px solid '+TH.border}}>
        <div style={{fontSize:11,color:TH.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:2}}>Cosmos Capital</div>
        <div style={{fontSize:24,fontWeight:900,color:TH.text}}>🔭 Galaxy Hub</div>
        <div style={{fontSize:12,color:TH.muted,marginTop:4}}>Explore · Learn · Analyze</div>
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
