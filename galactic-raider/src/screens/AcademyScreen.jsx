import React, { useState } from 'react';

const ACADEMY_SECTIONS = [
  {
    id: 'turns',
    title: '⏱️ Turn System',
    icon: '⏳',
    body: 'Each turn is one trading cycle. Markets update every turn. Every 10 turns: auto-save. Every 30 turns: quarterly dividends. Every 60 turns: tax era rotates. Click the play button to auto-advance turns continuously.',
  },
  {
    id: 'wallets',
    title: '💰 Wallets',
    icon: '💳',
    body: 'Three accounts: Cash (100K, no interest), Trading (800K, settlement account), Savings (100K, 2% APR). Transfer between wallets to manage your capital. Foundation endowment grows at 3% and shields you from debt.',
  },
  {
    id: 'stocks',
    title: '📈 Stocks',
    icon: '📊',
    body: 'Earth stocks (blue-chip, PE-bounded) and planetary stocks (high volatility). Unlock planets by net worth: Mars 5B, Venus 50B, Jupiter 200B, Saturn 1T, Mercury 10T, Uranus 50T, Neptune 100T. Buy → hold → sell for capital gains.',
  },
  {
    id: 'crypto',
    title: '₿ Crypto',
    icon: '⚡',
    body: 'Bitcoin, Ethereum, and 18 others. Earth coins unlocked, planet coins unlock with planets. High volatility but mean-reverting (bounded price swings). No dividends—pure capital appreciation.',
  },
  {
    id: 'forex',
    title: '💱 Forex',
    icon: '🌍',
    body: 'Trade 12 currency pairs: EURUSD, GBPUSD, JPYUSD, CHFUSD, CADUSD, AUDUSD, CNYUSD, MXNUSD, INRUSD, BRLUSD, ZARUSD, SGDUSD. Long/short positions with leverage (up to 5x). Realize gains when you close positions.',
  },
  {
    id: 'commodities',
    title: '⛏️ Commodities',
    icon: '🪨',
    body: 'Oil, gold, lithium, Ryzolith (rare alien resource), helium-3. Mean-reverting, 0.2x-8x bounds. Supply shocks can spike prices. No tax relief (flat 15% commodity tax).',
  },
  {
    id: 'etfs',
    title: '📊 ETFs',
    icon: '💼',
    body: 'Diversified baskets: VTSAX (US stock), VTIAX (intl stock), BND (bonds), VNQ (real estate), VHT (healthcare). Quarterly dividends. Low volatility, low upside. Boring but stable.',
  },
  {
    id: 'ipos',
    title: '🚀 IPOs',
    icon: '📈',
    body: 'Book shares in upcoming offerings at mid-price. Allocations happen on listing day (85% if oversubscribed, 100% if not). Post-IPO stabilizer: 30 turns of dampened moves. Can also launch your own IPO with Founder Mode.',
  },
  {
    id: 'bonds',
    title: '🏦 Bonds',
    icon: '💰',
    body: 'Fixed income: 2yr (3.5%), 5yr (4.2%), 10yr (5%), 20yr (5.8%). Buy, hold to maturity, collect principal + interest. No volatility, no tax on interest. Safest income stream.',
  },
  {
    id: 'taxes',
    title: '📋 Taxes',
    icon: '🎯',
    body: 'Tax rates rotate every 60 turns across 8 eras (CGT 12-25%, dividend tax 10-22%). Capital gains tax only on profit. Donate to charities for tax relief (stacks to 75%). Foundation endowment and bond interest are tax-advantaged.',
  },
  {
    id: 'founder',
    title: '💼 Founder Mode',
    icon: '🏢',
    body: 'Create your own company: inject capital, pick industry niche (tech, healthcare, energy, finance, retail, utilities), take loans, manage growth, launch IPO. Revenue = capital × 2% × demand. Your company becomes tradeable like any stock.',
  },
  {
    id: 'planets',
    title: '🪐 Planets',
    icon: '🌍',
    body: 'Unlock Mars (5B), Venus (50B), Jupiter (200B), Saturn (1T), Mercury (10T), Uranus (50T), Neptune (100T) as you grow. Each planet has companies, unique risks (Jupiter storms), and exclusive cryptocurrencies.',
  },
  {
    id: 'strategy',
    title: '🎯 Strategies',
    icon: '📚',
    body: 'Dividend income: steady passive flow. Day trader: frequent buys/sells. Crypto bull: high volatility upside. Forex spec: leverage currency moves. Founder: build your company. Diversify: 40% stocks, 20% crypto, 15% forex, 15% bonds, 10% founder.',
  },
  {
    id: 'badges',
    title: '🏆 Badges',
    icon: '🎖️',
    body: 'Earn badges by reaching wealth tiers (1M millionaire → 1T trillionaire), executing trades (50 trade → 100 trade), making donations, unlocking planets. 7-day login streak gives spin token + debt forgiveness.',
  },
  {
    id: 'music',
    title: '🎵 Music',
    icon: '🎶',
    body: '7 tracks: Oasis of Sol, Quiet Capital, Nocturnal Raider I/II, Deep Space, Planetary Oversight, Solar Drift. Switch anytime in Command Center Settings. Click the music button (bottom-right, Netlify) or use Settings tab. 35% volume by default.',
  },
];

export function AcademyTab({ TH, t }) {
  const [selectedId, setSelectedId] = useState('turns');
  const selected = ACADEMY_SECTIONS.find(s => s.id === selectedId);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px', minHeight: '500px' }}>
      {/* Sidebar */}
      <div style={{ background: TH.card, borderRadius: '10px', padding: '8px', overflow: 'auto', border: '1px solid ' + TH.borderSolid, maxHeight: '600px' }}>
        {ACADEMY_SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => setSelectedId(section.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '8px 10px',
              margin: '2px 0',
              background: selectedId === section.id ? 'rgba(59,130,246,0.2)' : 'transparent',
              border: selectedId === section.id ? '1px solid #3B82F6' : '1px solid transparent',
              borderRadius: '6px',
              color: selectedId === section.id ? '#93C5FD' : TH.text,
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: selectedId === section.id ? '700' : '500',
              transition: 'all 0.15s',
            }}
            title={section.title}
          >
            <span style={{ marginRight: '4px' }}>{section.icon}</span>
            {section.title.split(' ')[1]}
          </button>
        ))}
      </div>

      {/* Content */}
      {selected && (
        <div style={{ background: TH.card, borderRadius: '10px', padding: '14px', overflow: 'auto', border: '1px solid ' + TH.borderSolid, maxHeight: '600px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: TH.text, marginBottom: '8px' }}>
            {selected.title}
          </div>
          <div style={{
            fontSize: '12px',
            lineHeight: '1.6',
            color: TH.sub,
          }}>
            {selected.body}
          </div>
        </div>
      )}
    </div>
  );
}
