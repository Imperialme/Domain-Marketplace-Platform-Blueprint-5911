import { useState } from 'react';
import { GameProvider } from './store/gameStore';
import { C } from './utils';
import HomeScreen from './screens/HomeScreen';
import MarketsScreen from './screens/MarketsScreen';
import WalletsScreen from './screens/WalletsScreen';
import CEOScreen from './screens/CEOScreen';
import PlanetsScreen from './screens/PlanetsScreen';
import ETFScreen from './screens/ETFScreen';
import RedemptionScreen from './screens/RedemptionScreen';

const TABS = [
  { id: 'home',       label: 'Home',    ico: '🏠' },
  { id: 'markets',    label: 'Markets', ico: '📈' },
  { id: 'wallets',    label: 'Wallets', ico: '💰' },
  { id: 'ceo',        label: 'CEO',     ico: '👔' },
  { id: 'planets',    label: 'Planets', ico: '🌌' },
  { id: 'etf',        label: 'ETF',     ico: '📊' },
  { id: 'redeem',     label: 'Redeem',  ico: '🎡' },
];

function AppShell() {
  const [activeTab, setActiveTab] = useState('home');

  const screens = {
    home:    <HomeScreen />,
    markets: <MarketsScreen />,
    wallets: <WalletsScreen />,
    ceo:     <CEOScreen />,
    planets: <PlanetsScreen />,
    etf:     <ETFScreen />,
    redeem:  <RedemptionScreen />,
  };

  return (
    <div style={{ background: C.bg, minHeight: '100dvh', maxWidth: 430, margin: '0 auto', position: 'relative', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: C.text }}>
      {/* Content */}
      <div style={{ height: 'calc(100dvh - 60px)', overflowY: 'auto', overflowX: 'hidden' }}>
        {screens[activeTab]}
      </div>

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: C.card, borderTop: '1px solid '+C.border, display: 'flex', height: 60, zIndex: 100 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '4px 2px',
              borderTop: '2px solid '+(activeTab === tab.id ? C.blue : 'transparent'),
              transition: 'border-color .15s',
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{tab.ico}</span>
            <span style={{ fontSize: 9, color: activeTab === tab.id ? C.blue : C.muted, fontWeight: activeTab === tab.id ? 700 : 400, letterSpacing: .3 }}>
              {tab.label}
            </span>
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
