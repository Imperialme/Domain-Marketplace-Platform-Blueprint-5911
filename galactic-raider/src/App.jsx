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

function AppShell() {
  const [activeTab, setActiveTab] = useState('home');
  const [autoAdv, setAutoAdv] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(3);
  const autoRef = useRef(null);
  const { D, advanceTurn } = useGame();
  const TH = getTheme(D.darkMode);
  const t = getT(D.language);
  const isRTL = D.language === 'ar';

  // Auto-advance lives at App level — persists across tab changes
  useEffect(() => {
    clearInterval(autoRef.current);
    if (autoAdv) {
      autoRef.current = setInterval(() => advanceTurn(), autoSpeed * 1000);
    }
    return () => clearInterval(autoRef.current);
  }, [autoAdv, autoSpeed, advanceTurn]);

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
