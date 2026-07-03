import { useState, useEffect, useRef, Component } from 'react';
import { GameProvider, useGame } from './store/gameStore';
import { C } from './utils';
import { getTheme } from './theme';
import { getT } from './i18n';
import HomeScreen from './screens/HomeScreen';
import UniverseScreen from './screens/UniverseScreen';
import WealthScreen from './screens/WealthScreen';
import CommandScreen from './screens/CommandScreen';
import GalaxyScreen from './screens/GalaxyScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) return (
      <div style={{ padding: 24, background: '#1a0a0a', color: '#ff6b6b', fontFamily: 'monospace', minHeight: '100vh' }}>
        <div style={{ fontSize: 20, marginBottom: 12 }}>⚠️ Game Error</div>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{String(this.state.err)}</pre>
        <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Reload</button>
      </div>
    );
    return this.props.children;
  }
}

const TABS = [
  { id: 'home',     label: 'Home',    ico: '🏠' },
  { id: 'markets',  label: 'Markets', ico: '🌌' },
  { id: 'wealth',   label: 'Wealth',  ico: '💰' },
  { id: 'command',  label: 'Command', ico: '🎯' },
  { id: 'galaxy',   label: 'Galaxy',  ico: '🔭' },
];

const MILESTONE_INFO = {
  '$1M':   { title:'Millionaire',        ico:'💰', color:'#34D399', blurb:'Your first million. The empire begins.' },
  '$10M':  { title:'Multi-Millionaire',  ico:'💎', color:'#22D3EE', blurb:'Ten million strong. The market knows your name.' },
  '$100M': { title:'Centi-Millionaire',  ico:'🏆', color:'#A78BFA', blurb:'A hundred million. You move markets now.' },
  '$1B':   { title:'Billionaire',        ico:'👑', color:'#FBBF24', blurb:'Ten figures. Welcome to the billionaire class.' },
  '$10B':  { title:'Deca-Billionaire',   ico:'🌟', color:'#F59E0B', blurb:'Ten billion. Planets are unlocking for you.' },
  '$100B': { title:'Centi-Billionaire',  ico:'⭐', color:'#FB7185', blurb:'A hundred billion. A cosmic-scale fortune.' },
  '$1T':   { title:'Trillionaire',       ico:'🌌', color:'#C4B5FD', blurb:'One trillion dollars. You rule the solar system.' },
};

function MilestoneModal({ milestone, onClose }) {
  const info = MILESTONE_INFO[milestone.label] || { title:milestone.label, ico:'🎉', color:'#34D399', blurb:'A new wealth milestone reached!' };
  // Auto-dismiss after 10 seconds, matching the requested "screen pauses for 10s" behaviour
  useEffect(() => {
    const id = setTimeout(onClose, 10000);
    return () => clearTimeout(id);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.86)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, animation:'cc-milefade .3s ease' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'linear-gradient(160deg,#0F1E35,#070D18)', border:`2px solid ${info.color}`, borderRadius:24, padding:'34px 26px', maxWidth:360, width:'100%', textAlign:'center', boxShadow:`0 0 60px ${info.color}55` }}>
        <div style={{ fontSize:11, letterSpacing:3, textTransform:'uppercase', color:info.color, marginBottom:10 }}>Achievement Unlocked</div>
        <div style={{ fontSize:80, lineHeight:1, marginBottom:14, animation:'cc-milepop .6s cubic-bezier(.34,1.56,.64,1)' }}>{info.ico}</div>
        <div style={{ fontSize:30, fontWeight:900, color:'#fff', marginBottom:6 }}>{info.title}</div>
        <div style={{ fontSize:34, fontWeight:900, fontFamily:'monospace', color:info.color, marginBottom:14, textShadow:`0 0 24px ${info.color}88` }}>{milestone.label}</div>
        <div style={{ fontSize:13, color:'#94A3B8', lineHeight:1.5, marginBottom:22 }}>{info.blurb}</div>
        <button onClick={onClose} style={{ width:'100%', background:info.color, color:'#06121E', border:'none', borderRadius:14, padding:'14px 0', fontWeight:900, fontSize:15, cursor:'pointer', letterSpacing:.5 }}>Continue →</button>
      </div>
    </div>
  );
}

function AppShell() {
  const [activeTab, setActiveTab] = useState('home');
  const [autoAdv, setAutoAdv] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(3);
  const autoRef = useRef(null);
  const { D, advanceTurn, clearMilestone, navigateTo, clearNavTarget, markOnboardingShown } = useGame();
  const TH = getTheme(D.darkMode);
  const t = getT(D.language);
  const isRTL = D.language === 'ar';

  // Auto-advance lives at App level — persists across tab changes.
  // It pauses whenever a milestone popup is showing so the celebration isn't skipped past.
  useEffect(() => {
    clearInterval(autoRef.current);
    if (autoAdv && !D.pendingMilestone && !D.uiModalOpen) {
      autoRef.current = setInterval(() => advanceTurn(), autoSpeed * 1000);
    }
    return () => clearInterval(autoRef.current);
  }, [autoAdv, autoSpeed, advanceTurn, D.pendingMilestone, D.uiModalOpen]);

  // React to cross-screen navigation intents set via navigateTo()
  useEffect(() => {
    if (D.navTarget?.screen && D.navTarget.screen !== activeTab) {
      setActiveTab(D.navTarget.screen);
    }
  }, [D.navTarget, activeTab]);

  const pendingCEO = (D.pendingDecisions || []).length;
  const hasBoardAccess = Object.values(D.companyOwnership || {}).some(pct => pct >= 10);
  const showBadge = pendingCEO > 0 && hasBoardAccess;

  // Wealth notification: check if any position held
  const stockVal = Object.entries(D.stockHoldings||{}).reduce((x,[tk,n])=>{
    const co=D.companies?.find(c=>c.t===tk); return x+(co?co.price*n:0);},0);
  const etfVal = (D.etfs||[]).reduce((x,e)=>x+e.price*(e.units||0),0);
  const fundVal = Object.values(D.fundDeposits||{}).reduce((x,f)=>x+(f.deposit||0),0);
  const wealthHasGain = stockVal + etfVal + fundVal > 0;

  const screens = {
    home:    <HomeScreen onNavigate={setActiveTab} autoAdv={autoAdv} setAutoAdv={setAutoAdv} autoSpeed={autoSpeed} setAutoSpeed={setAutoSpeed} />,
    markets: <UniverseScreen />,
    wealth:  <WealthScreen />,
    command: <CommandScreen />,
    galaxy:  <GalaxyScreen />,
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: TH.bg, minHeight: '100vh', maxWidth: 430, margin: '0 auto', position: 'relative', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: TH.text }}>
      <style>{`@keyframes cc-milefade{from{opacity:0}to{opacity:1}}@keyframes cc-milepop{0%{transform:scale(0) rotate(-20deg)}100%{transform:scale(1) rotate(0)}}`}</style>
      {!D.showedOnboarding && <OnboardingScreen onComplete={markOnboardingShown} />}
      {D.pendingMilestone && <MilestoneModal milestone={D.pendingMilestone} onClose={clearMilestone} />}
      <div style={{ height: 'calc(100vh - 64px)', overflowY: 'auto', overflowX: 'hidden' }}>
        {screens[activeTab]}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: TH.navBg, borderTop: '1px solid '+TH.borderSolid, display: 'flex', height: 64, zIndex: 100 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 2px', position: 'relative' }}>
            {activeTab === tab.id && (
              <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 2, background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)', borderRadius: '0 0 3px 3px' }} />
            )}
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.ico}</span>
              {tab.id === 'command' && showBadge && (
                <div style={{ position: 'absolute', top: -4, right: -6, background: '#EF4444', borderRadius: 10, minWidth: 14, height: 14, fontSize: 8, color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{pendingCEO}</div>
              )}
              {tab.id === 'wealth' && wealthHasGain && (
                <div style={{ position: 'absolute', top: -4, right: -6, width: 8, height: 8, background: '#10B981', borderRadius: '50%', border: '1px solid '+TH.bg }} />
              )}
              {tab.id === 'home' && autoAdv && (
                <div style={{ position: 'absolute', top: -4, right: -6, width: 8, height: 8, background: '#F59E0B', borderRadius: '50%', border: '1px solid '+TH.bg }} />
              )}
            </div>
            <span style={{ fontSize: 9, color: activeTab === tab.id ? '#93C5FD' : TH.dim, fontWeight: activeTab === tab.id ? 700 : 400, letterSpacing: 0.3 }}>{t('nav_'+tab.id)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppShell />
      </GameProvider>
    </ErrorBoundary>
  );
}
