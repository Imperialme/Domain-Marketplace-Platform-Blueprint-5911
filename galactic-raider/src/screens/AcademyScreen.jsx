import React, { useState } from 'react';

const PLANET_GUIDES = {
  earth: {
    name: 'Earth',
    emoji: '🌍',
    nwToUnlock: 0,
    society: 'Democratic federations with market-driven economies',
    governance: 'Multi-national governments, stock exchanges (NYSE, NASDAQ, LSE)',
    population: '8 billion+ diverse population across continents',
    resources: 'Oil, natural gas, minerals, agricultural output, technology hubs',
    climate: 'Variable by region; global market leader in green energy',
    uniqueFeature: 'Oldest established markets with Blue-chip companies (AAPL, MSFT, TSLA)',
    economy: 'Advanced service economy, fintech innovation, legacy industries',
    timeZone: 'Multiple zones drive 24/7 trading cycles',
    risks: 'Political instability, supply chain disruptions, commodity volatility',
  },
  mars: {
    name: 'Mars',
    emoji: '🔴',
    nwToUnlock: 5e9,
    society: 'International colonial settlements run by corporate consortiums',
    governance: 'Mars Authority oversees resource extraction and development',
    population: '50 million colonists in domed cities and underground habitats',
    resources: 'Iron oxide, water ice, rare elements, helium-3, terraforming materials',
    climate: 'Harsh dust storms, thin atmosphere, extreme temperature swings',
    uniqueFeature: 'High-growth frontier market with emerging tech companies',
    economy: 'Mining-based, infrastructure buildout, future terraforming contracts',
    timeZone: '24.6-hour day; slight trading lag vs Earth',
    risks: 'Supply shocks from dust storms, colony dependency on Earth',
  },
  venus: {
    name: 'Venus',
    emoji: '🟡',
    nwToUnlock: 50e9,
    society: 'Exclusive sky-city dwelling elite and research communities',
    governance: 'Venus Economic Consortium controls floating habitats',
    population: '5 million in cloud-based settlements at 50km altitude',
    resources: 'Sulfuric acid derivatives, phosphorus compounds, aerospace materials',
    climate: 'Surface uninhabitable; cloud-layers sustain engineered colonies',
    uniqueFeature: 'Ultra-premium luxury market with scientific breakthroughs',
    economy: 'High-margin biotech, materials science, zero-G manufacturing',
    timeZone: 'Synchronous rotation; longest "day" in solar system',
    risks: 'Extreme environmental volatility, isolated from support networks',
  },
  mercury: {
    name: 'Mercury',
    emoji: '⚫',
    nwToUnlock: 10e12,
    society: 'Hermetic corporate states focused on energy harvesting',
    governance: 'Solar Energy Cooperative manages orbital solar arrays',
    population: '2 million in heavily shielded subterranean cities',
    resources: 'Exotic metals, crystalline materials, thermal energy abundance',
    climate: 'Temperature extremes (1000°F day to -300°F night)',
    uniqueFeature: 'Dominates clean energy markets and advanced materials',
    economy: 'Solar power generation, advanced metallurgy, quantum computing',
    timeZone: '3:2 orbital resonance; unique market timing opportunities',
    risks: 'Thermal cycling stresses infrastructure, geopolitical control battles',
  },
  jupiter: {
    name: 'Jupiter',
    emoji: '🟠',
    nwToUnlock: 200e9,
    society: 'Nomadic floating city networks in cloud systems',
    governance: 'Jupiter Commerce League coordinates inter-city trade and defense',
    population: '100 million across floating stations in atmosphere',
    resources: 'Helium-3, exotic gases, hydrogen fuel, ammonia compounds',
    climate: 'Violent storms (Great Red Spot), radiation belts, constant turbulence',
    uniqueFeature: 'Untamed frontier with high-volatility growth sectors',
    economy: 'Fuel production, extreme weather research, mining equipment',
    timeZone: '10-hour rotation; rapid market cycles',
    risks: 'Frequent trading halts from mega-storms, settlement raids by pirates',
  },
  saturn: {
    name: 'Saturn',
    emoji: '💍',
    nwToUnlock: 1e12,
    society: 'Ring-based artificial habitats with leisure and research focus',
    governance: 'Saturn Ring Authority manages ice extraction and tourism',
    population: '200 million across ring stations and moon bases',
    resources: 'Water ice, methane, ammonia, rare isotopes, luxury materials',
    climate: 'Pristine ice rings; moon bases experience seasonal extremes',
    uniqueFeature: 'Luxury tourism, zero-G sports, and cutting-edge research zones',
    economy: 'Tourism (most profitable sector), scientific advancement, ice mining',
    timeZone: '10.7-hour day; predictable trading patterns',
    risks: 'Seasonal ice-harvest crashes, tourism bubble vulnerability',
  },
  uranus: {
    name: 'Uranus',
    emoji: '🔵',
    nwToUnlock: 50e12,
    society: 'Egalitarian science-first civilization of researchers and engineers',
    governance: 'Uranus Scientific Collective; merit-based decision making',
    population: '75 million researchers and engineers across orbital labs',
    resources: 'Methane atmosphere, diamond rain, exotic ice compounds',
    climate: 'Tilted 98°; extreme seasonal shifts, unpredictable magnetic fields',
    uniqueFeature: 'Innovation leader in physics, materials science, and clean energy',
    economy: 'Cutting-edge R&D, breakthrough patents, synthetic materials',
    timeZone: '17-hour rotation; long trading session cycles',
    risks: 'Research labs occasionally isolate; patent wars over discoveries',
  },
  neptune: {
    name: 'Neptune',
    emoji: '🌀',
    nwToUnlock: 100e12,
    society: 'Transcendent digital civilization with minimal physical infrastructure',
    governance: 'Neptune Network Collective; AI-assisted democratic governance',
    population: '50 million; mostly digital consciousness in quantum servers',
    resources: 'Theoretical particles, quantum computing substrates, dark matter candidates',
    climate: 'Eternal storms, cosmic radiation, dimensional anomalies (rumored)',
    uniqueFeature: 'Gateway to unknown; legendary for impossible discoveries',
    economy: 'Quantum computing, theoretical physics breakthroughs, dimensional trading',
    timeZone: '16-hour rotation; out-of-sync with solar standard',
    risks: 'Market stability unknown; rumored manipulation by superintelligence',
  },
};

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
    body: 'Each planet offers unique trading opportunities and risks. Click planet names to explore their civilizations, economies, and risks.',
    expanded: true,
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
  const [selectedPlanet, setSelectedPlanet] = useState('earth');
  const selected = ACADEMY_SECTIONS.find(s => s.id === selectedId);
  const planetData = PLANET_GUIDES[selectedPlanet];

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

          {selected.expanded && selectedId === 'planets' ? (
            <>
              <div style={{
                fontSize: '11px',
                lineHeight: '1.6',
                color: TH.sub,
                marginBottom: '12px',
              }}>
                {selected.body}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', marginBottom: '12px' }}>
                {Object.entries(PLANET_GUIDES).map(([key, planet]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPlanet(key)}
                    style={{
                      padding: '8px',
                      background: selectedPlanet === key ? '#3B82F6' : 'rgba(255,255,255,0.1)',
                      border: '1px solid ' + (selectedPlanet === key ? '#93C5FD' : TH.borderSolid),
                      color: selectedPlanet === key ? '#fff' : TH.text,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                      transition: 'all 0.15s',
                    }}
                  >
                    {planet.emoji} {planet.name}
                  </button>
                ))}
              </div>
              {planetData && (
                <div style={{ fontSize: '11px', lineHeight: '1.8', color: TH.sub }}>
                  <div style={{ color: TH.text, fontWeight: 'bold', marginBottom: '6px' }}>
                    {planetData.emoji} {planetData.name}
                  </div>
                  <div style={{ marginBottom: '4px' }}><strong>Unlock at:</strong> {planetData.nwToUnlock >= 1e12 ? '$' + (planetData.nwToUnlock/1e12).toFixed(0) + 'T' : planetData.nwToUnlock >= 1e9 ? '$' + (planetData.nwToUnlock/1e9).toFixed(0) + 'B' : '$' + planetData.nwToUnlock}</div>
                  <div style={{ marginBottom: '4px' }}><strong>Society:</strong> {planetData.society}</div>
                  <div style={{ marginBottom: '4px' }}><strong>Governance:</strong> {planetData.governance}</div>
                  <div style={{ marginBottom: '4px' }}><strong>Population:</strong> {planetData.population}</div>
                  <div style={{ marginBottom: '4px' }}><strong>Resources:</strong> {planetData.resources}</div>
                  <div style={{ marginBottom: '4px' }}><strong>Climate:</strong> {planetData.climate}</div>
                  <div style={{ marginBottom: '4px' }}><strong>Unique Feature:</strong> {planetData.uniqueFeature}</div>
                  <div style={{ marginBottom: '4px' }}><strong>Economy:</strong> {planetData.economy}</div>
                  <div style={{ marginBottom: '4px' }}><strong>Day Length:</strong> {planetData.timeZone}</div>
                  <div style={{ marginBottom: '4px', color: '#F87171' }}><strong>Risks:</strong> {planetData.risks}</div>
                </div>
              )}
            </>
          ) : (
            <div style={{
              fontSize: '12px',
              lineHeight: '1.6',
              color: TH.sub,
            }}>
              {selected.body}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
