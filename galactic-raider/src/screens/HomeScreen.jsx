import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';
import { TAX_ERAS } from '../constants';

const Card = ({ children, style }) => (
  <div style={{ background: C.card, borderRadius: 14, padding: 14, border: '1px solid '+C.border, ...style }}>
    {children}
  </div>
);

const Stat = ({ label, value, color }) => (
  <div style={{ background: C.bg, borderRadius: 9, padding: '8px 10px', textAlign: 'center' }}>
    <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 800, color: color || C.text, fontFamily: 'monospace' }}>{value}</div>
  </div>
);

export default function HomeScreen() {
  const { D, advanceTurn } = useGame();
  const d = D;

  const era = TAX_ERAS[d.eraIdx];
  const nw = (d.cashWallet||0) + (d.savingsWallet||0) + (d.tradingWallet||0) + (d.foundationBalance||0);
  const stockVal = Object.entries(d.stockHoldings||{}).reduce((x,[t,n]) => {
    const co = d.companies?.find(c => c.t === t); return x + (co ? co.price * n : 0);
  }, 0);
  const etfVal = (d.etfs||[]).reduce((x,e) => x + e.price * (e.units||0), 0);
  const fundVal = Object.values(d.fundDeposits||{}).reduce((x,f) => x + (f.deposit||0), 0);
  const pendingDecs = (d.pendingDecisions||[]).length;

  // Solar System unlock progress
  const stockRegions = new Set(Object.keys(d.stockHoldings||{}).map(t => {
    const co = d.companies?.find(c => c.t === t); return co?.hq;
  }).filter(Boolean));
  const criteria = [
    { label: 'Net Worth $5B', done: nw >= 5e9, current: fm(nw), target: '$5B' },
    { label: 'Turn 300+', done: d.turn >= 300, current: 'T'+d.turn, target: 'T300' },
    { label: '3+ Stock Regions', done: stockRegions.size >= 3, current: stockRegions.size+' regions', target: '3' },
    { label: '2+ Donations', done: (d.donCount||0) >= 2, current: (d.donCount||0)+' made', target: '2' },
  ];

  const eraColors = { 'Normal':'#64748B','Capital Gains':'#16A34A','Low Tax':'#1D4ED8','High Tax':'#DC2626','Dividend':'#7C3AED','Transaction':'#D97706','Wealth Tax':'#C026D3' };
  const eraColor = eraColors[era.name] || C.muted;

  return (
    <div style={{ padding: '14px 14px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Net Worth Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', borderRadius: 16, padding: 16, border: '1px solid '+C.border }}>
        <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Net Worth · Turn {d.turn}</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: C.green, fontFamily: 'monospace', marginBottom: 8 }}>{fm(nw)}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['Cash',fm(d.cashWallet||0),C.blue],['Savings',fm(d.savingsWallet||0),C.green],['Trading',fm(d.tradingWallet||0),C.amber],['Stocks',fm(stockVal),C.purple],['ETFs',fm(etfVal),'#06B6D4'],['Funds',fm(fundVal),'#EC4899']].map(([l,v,c])=>(
            <div key={l} style={{ background: C.bg, borderRadius: 8, padding: '5px 9px' }}>
              <div style={{ fontSize: 8, color: C.muted }}>{l}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: c, fontFamily: 'monospace' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Advance Turn Button */}
      <button onClick={advanceTurn} style={{ background: 'linear-gradient(135deg,'+C.green+',#15803D)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontWeight: 800, fontSize: 16, cursor: 'pointer', letterSpacing: 1 }}>
        ▶ Advance Turn
      </button>

      {/* Alerts */}
      {pendingDecs > 0 && (
        <div style={{ background: '#7F1D1D', borderRadius: 12, padding: '12px 14px', border: '1px solid #991B1B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'pulse 1.5s infinite' }}>
          <div>
            <div style={{ fontSize: 12, color: '#FCA5A5', fontWeight: 800 }}>⚠️ {pendingDecs} CEO DECISION{pendingDecs > 1 ? 'S' : ''} PENDING</div>
            <div style={{ fontSize: 11, color: '#F87171', marginTop: 2 }}>Switch to CEO tab — decisions auto-resolve with worst option if ignored</div>
          </div>
        </div>
      )}

      {/* Tax Era */}
      <Card>
        <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Current Tax Era</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: eraColor }}>{era.name}</div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{era.desc}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: C.muted }}>CGT Rate</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: eraColor, fontFamily: 'monospace' }}>{Math.round(era.cgt * 100)}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Stat label="CGT" value={Math.round(era.cgt*100)+'%'} color={era.cgt <= 0.10 ? C.green : era.cgt >= 0.25 ? C.red : C.amber} />
          <Stat label="Div Tax" value={Math.round(era.divTax*100)+'%'} color={C.text} />
          <Stat label="Next Era" value={'T'+(Math.ceil(d.turn/60)*60)} color={C.muted} />
          <Stat label="GDP" value={(d.gdp >= 0 ? '+' : '')+d.gdp+'%'} color={d.gdp >= 0 ? C.green : C.red} />
        </div>
      </Card>

      {/* Portfolio Breakdown */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>💼 Portfolio Breakdown</div>
        {[['💵 Cash Wallet', fm(d.cashWallet||0), 'Day-to-day spending, tax payments.'],
          ['🏦 Savings Wallet', fm(d.savingsWallet||0), (d.foundationOpen ? '✅ Protected by Foundation · ' : '⚠️ Unprotected · ')+'2%/yr interest.'],
          ['⚡ Trading Wallet', fm(d.tradingWallet||0), 'Active trading. Auto-buys. First liquidated.'],
          ['📊 Stocks', fm(stockVal), Object.keys(d.stockHoldings||{}).length+' positions'],
          ['🌌 ETF Holdings', fm(etfVal), (d.etfs||[]).filter(e=>e.units>0).length+' ETFs'],
          ['💎 Sovereign Funds', fm(fundVal), 'Planet fund deposits'],
        ].map(([l,v,d]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid '+C.border }}>
            <div>
              <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{l}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{d}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.text, fontFamily: 'monospace' }}>{v}</div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontWeight: 800 }}>
          <span style={{ fontSize: 14, color: C.text }}>Total Net Worth</span>
          <span style={{ fontSize: 16, color: C.green, fontFamily: 'monospace' }}>{fm(nw)}</span>
        </div>
      </Card>

      {/* Solar System Unlock */}
      <Card style={{ border: d.solarUnlocked ? '1px solid #F59E0B' : '1px solid '+C.border }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>🌌 Solar System Unlock</div>
          {d.solarUnlocked && <div style={{ background: '#78350F', color: '#FDE68A', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>UNLOCKED</div>}
        </div>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>Complete all 4 criteria to unlock 7 planet economies.</div>
        {criteria.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid '+C.border }}>
            <div style={{ fontSize: 14 }}>{c.done ? '✅' : '⬜'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.done ? C.green : C.text }}>{c.label}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{c.current} / {c.target}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* Recent News */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>📰 Recent Events</div>
        {(d.news || []).slice(0, 6).map(n => (
          <div key={n.id} style={{ display: 'flex', gap: 9, padding: '9px 0', borderBottom: '1px solid '+C.border }}>
            <div style={{ width: 4, borderRadius: 2, flexShrink: 0, background: n.g ? C.green : C.red, alignSelf: 'stretch' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>T{n.t} · {n.ico}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>{n.ti}</div>
              <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.5 }}>{n.bo}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
