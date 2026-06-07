import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { fm } from '../utils';

const CS = {
  card: { background:'#0D1B2E', borderRadius:16, padding:14, border:'1px solid #1A2744', marginBottom:10 },
  label: { fontSize:10, color:'#4B5563', textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 },
  row: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #0A1220' },
};

export default function SettingsScreen() {
  const { D, S } = useGame();
  const d = D;
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState('');
  const showMsg = m => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const nw = (d.cashWallet||0)+(d.savingsWallet||0)+(d.tradingWallet||0)+(d.foundationBalance||0);
  const stockVal = Object.entries(d.stockHoldings||{}).reduce((x,[t,n])=>{
    const co=d.companies?.find(c=>c.t===t); return x+(co?co.price*n:0);},0);
  const totalPortfolio = nw + stockVal + (d.etfs||[]).reduce((x,e)=>x+e.price*(e.units||0),0) + Object.values(d.fundDeposits||{}).reduce((x,f)=>x+(f.deposit||0),0);

  return (
    <div style={{padding:'14px 14px 80px',background:'#060B14',minHeight:'100%'}}>
      <div style={{background:'linear-gradient(180deg,#050F20,#030810)',padding:'18px 16px 18px',borderBottom:'1px solid rgba(255,255,255,0.08)',marginBottom:14,marginLeft:-14,marginRight:-14,marginTop:-14,paddingLeft:14,paddingRight:14}}>
        <div style={{fontSize:11,color:'#475569',letterSpacing:3,textTransform:'uppercase',marginBottom:2}}>Cosmos Capital</div>
        <div style={{fontSize:24,fontWeight:900,color:'#F1F5F9'}}>⚙️ Settings</div>
      </div>

      {msg&&<div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}

      {/* Portfolio Summary */}
      <div style={CS.card}>
        <div style={CS.label}>Current Game Stats</div>
        {[
          ['Turn', 'T'+d.turn],
          ['Net Worth', fm(totalPortfolio)],
          ['Companies Held', Object.keys(d.stockHoldings||{}).length+' positions'],
          ['Donations Made', (d.donCount||0)+' · $'+fm(d.totalDonated||0)],
          ['Spins Used', (d.spinsUsed||0)+' / 5 lifetime'],
          ['Loans Taken', (d.loanHistory||[]).length+' historical'],
          ['Total Interest Paid', fm(d.totalInterestPaid||0)],
        ].map(([l,v])=>(
          <div key={l} style={CS.row}>
            <span style={{fontSize:12,color:'#6B7280'}}>{l}</span>
            <span style={{fontSize:12,fontWeight:700,color:'#F8FAFC',fontFamily:'monospace'}}>{v}</span>
          </div>
        ))}
      </div>

      {/* Game Info */}
      <div style={CS.card}>
        <div style={CS.label}>How to Play</div>
        {[
          ['🏠 Home', 'Advance turns, track portfolio, view world events'],
          ['🌌 Markets', 'Trade Earth stocks, planet companies, ETFs and IPOs'],
          ['💰 Wealth', 'Move money between wallets, take loans, deposit into funds'],
          ['🎯 Command', 'Vote on board decisions (needs 10%+ ownership), spin wheel, donate'],
          ['🌌 Solar Unlock', 'Reach $5B NW, Turn 300, 3 regions, 2 donations to unlock all 8 planets'],
          ['📊 Tax Eras', 'Tax regime rotates every 60 turns — time buys and sells accordingly'],
          ['🎡 Wheel of Fortune', 'Need 500 pts, 2 donations, and a spin token to spin'],
        ].map(([l,v])=>(
          <div key={l} style={{padding:'9px 0',borderBottom:'1px solid #0A1220'}}>
            <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC',marginBottom:3}}>{l}</div>
            <div style={{fontSize:11,color:'#6B7280',lineHeight:1.4}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Board Access Clarification */}
      <div style={{...CS.card,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.06)'}}>
        <div style={CS.label}>About CEO / Board Decisions</div>
        <div style={{fontSize:12,color:'#C4B5FD',lineHeight:1.6}}>
          Board decisions are corporate events at companies in your portfolio. They only become actionable once you own <span style={{fontWeight:800}}>10%+</span> of a company's shares.
          {'\n\n'}
          Thresholds: 10% = dividend vote · 25% = strategy vote · 50% = replace the CEO.
          {'\n\n'}
          If you ignore a decision, it auto-resolves to the worst outcome.
        </div>
      </div>

      {/* Reset Game */}
      <div style={{...CS.card,border:'1px solid rgba(239,68,68,0.2)'}}>
        <div style={CS.label}>Danger Zone</div>
        {!confirmReset?(
          <button onClick={()=>setConfirmReset(true)} style={{width:'100%',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#FCA5A5',borderRadius:10,padding:'12px 0',fontWeight:700,fontSize:14,cursor:'pointer'}}>
            🗑️ Reset Game
          </button>
        ):(
          <div>
            <div style={{fontSize:12,color:'#FCA5A5',marginBottom:10,lineHeight:1.5}}>
              This will permanently delete all progress. Turn {d.turn}, {fm(totalPortfolio)} net worth — are you sure?
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setConfirmReset(false)} style={{flex:1,padding:'11px 0',background:'#060B14',border:'1px solid #1A2744',color:'#6B7280',borderRadius:10,fontWeight:700,cursor:'pointer'}}>Cancel</button>
              <button onClick={()=>{
                S.current = (window._gameReset = (() => {
                  // Reload page to reset all state cleanly
                  window.location.reload();
                })());
              }} style={{flex:2,padding:'11px 0',background:'#7F1D1D',color:'#FCA5A5',border:'1px solid #DC2626',borderRadius:10,fontWeight:800,fontSize:14,cursor:'pointer'}}>
                Reset Everything
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App Info */}
      <div style={{textAlign:'center',padding:'16px 0',color:'#1E293B',fontSize:11}}>
        Cosmos Capital · Capital Exchange · Build No.5
      </div>
    </div>
  );
}
