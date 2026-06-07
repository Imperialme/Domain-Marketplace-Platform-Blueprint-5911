import { useState } from 'react';
import { GameProvider, useGame } from './store/gameStore';
import { C } from './utils';
import HomeScreen from './screens/HomeScreen';
import UniverseScreen from './screens/UniverseScreen';
import WealthScreen from './screens/WealthScreen';
import CommandScreen from './screens/CommandScreen';

const TABS = [
  { id: 'home',     label: 'Home',     ico: '🏠' },
  { id: 'universe', label: 'Universe', ico: '🌌' },
  { id: 'wealth',   label: 'Wealth',   ico: '💰' },
  { id: 'command',  label: 'Command',  ico: '🎯' },
];

function AppShell() {
  const [activeTab, setActiveTab] = useState('home');
  const { D } = useGame();
  const pendingCEO = (D.pendingDecisions || []).length;

  const screens = {
    home:     <HomeScreen onNavigate={setActiveTab} />,
    universe: <UniverseScreen />,
    wealth:   <WealthScreen />,
    command:  <CommandScreen />,
  };

  return (
    <div style={{ background: '#060B14', minHeight: '100dvh', maxWidth: 430, margin: '0 auto', position: 'relative', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: C.text }}>
      <div style={{ height: 'calc(100dvh - 64px)', overflowY: 'auto', overflowX: 'hidden' }}>
        {screens[activeTab]}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'rgba(6,11,20,0.97)', borderTop: '1px solid #1A2744', display: 'flex', height: 64, zIndex: 100 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 2px', position: 'relative' }}>
            {activeTab === tab.id && (
              <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)', borderRadius: '0 0 3px 3px' }} />
            )}
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{tab.ico}</span>
              {tab.id === 'command' && pendingCEO > 0 && (
                <div style={{ position: 'absolute', top: -4, right: -6, background: '#EF4444', borderRadius: 10, minWidth: 14, height: 14, fontSize: 8, color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{pendingCEO}</div>
              )}
            </div>
            <span style={{ fontSize: 10, color: activeTab === tab.id ? '#93C5FD' : '#4B5563', fontWeight: activeTab === tab.id ? 700 : 400, letterSpacing: 0.4 }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}
