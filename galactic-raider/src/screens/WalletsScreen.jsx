import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';
import { LOAN_TIERS } from '../constants';

const Card = ({ children, style }) => (
  <div style={{ background: C.card, borderRadius: 14, padding: 14, border: '1px solid '+C.border, ...style }}>{children}</div>
);

const SectionHeader = ({ label }) => (
  <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{label}</div>
);

const WalletBox = ({ icon, label, value, color, sub }) => (
  <div style={{ background: C.bg, borderRadius: 12, padding: 12, border: '1px solid '+C.border, flex: 1 }}>
    <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
    <div style={{ fontSize: 15, fontWeight: 800, color: color || C.text, fontFamily: 'monospace', marginTop: 2 }}>{value}</div>
    {sub && <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{sub}</div>}
  </div>
);

const TransferBtn = ({ label, onClick }) => (
  <button onClick={onClick} style={{ flex: 1, background: '#1E3A5F', border: '1px solid '+C.blue, color: C.blueText, borderRadius: 8, padding: '7px 4px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
    {label}
  </button>
);

export default function WalletsScreen() {
  const { D, transfer, openFoundation, takeLoan, repayLoan } = useGame();
  const d = D;
  const [activeTab, setActiveTab] = useState('wallets');
  const [repayAmt, setRepayAmt] = useState('');
  const [msg, setMsg] = useState('');

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const doTransfer = (dir) => {
    const pctMap = { C2T:50, T2C:25, C2S:50, S2C:25, T2S:50, S2T:50 };
    transfer(dir, pctMap[dir]);
    showMsg(dir.replace('2','→')+' 50% transferred');
  };

  const handleLoan = (tier) => {
    const err = takeLoan(tier);
    if (err) showMsg(err);
    else showMsg(tier.label+' taken: '+fm(tier.max));
  };

  const handleRepay = () => {
    const amt = parseFloat(repayAmt);
    if (isNaN(amt) || amt <= 0) return showMsg('Enter a valid amount');
    repayLoan(amt);
    setRepayAmt('');
    showMsg('Repaid '+fm(amt));
  };

  const tabs = ['wallets','loans','txlog'];
  const tabLabels = { wallets:'💰 Wallets', loans:'🏦 Loans', txlog:'📋 Log' };

  return (
    <div style={{ padding: '14px 14px 80px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {msg && <div style={{ background: '#1E3A5F', border: '1px solid '+C.blue, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.blueText, fontWeight: 600 }}>{msg}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, background: activeTab===t ? C.blue : C.card, border: '1px solid '+(activeTab===t ? C.blue : C.border), color: activeTab===t ? '#fff' : C.muted, borderRadius: 10, padding: '8px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {/* WALLETS TAB */}
      {activeTab === 'wallets' && <>
        {/* Wallet Balances */}
        <div style={{ display: 'flex', gap: 8 }}>
          <WalletBox icon="💵" label="Cash Wallet" value={fm(d.cashWallet||0)} color={C.blue} sub="Day-to-day spending" />
          <WalletBox icon="🏦" label="Savings" value={fm(d.savingsWallet||0)} color={C.green} sub={d.foundationOpen ? '✅ Foundation protected' : '⚠️ 2% APR'} />
          <WalletBox icon="⚡" label="Trading" value={fm(d.tradingWallet||0)} color={C.amber} sub="Active investing" />
        </div>

        {/* Transfer Grid */}
        <Card>
          <SectionHeader label="Wallet Transfers (50% of source)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <TransferBtn label="Cash→Trading" onClick={() => doTransfer('C2T')} />
              <TransferBtn label="Trading→Cash" onClick={() => doTransfer('T2C')} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <TransferBtn label="Cash→Savings" onClick={() => doTransfer('C2S')} />
              <TransferBtn label="Savings→Cash" onClick={() => doTransfer('S2C')} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <TransferBtn label="Trading→Savings" onClick={() => doTransfer('T2S')} />
              <TransferBtn label="Savings→Trading" onClick={() => doTransfer('S2T')} />
            </div>
          </div>
          <div style={{ marginTop: 10, padding: '8px 10px', background: C.bg, borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: C.muted }}>Savings wallet: min $10K retained. All other wallets: 50% transferred per tap.</div>
          </div>
        </Card>

        {/* Foundation */}
        <Card style={{ border: d.foundationOpen ? '1px solid '+C.green : '1px solid '+C.border }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>🛡️ Asset Protection Foundation</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Shields Savings Wallet from bankruptcy liquidation. $50K one-time fee.</div>
            </div>
            {d.foundationOpen && <div style={{ background: C.greenBg, color: C.greenText, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>OPEN</div>}
          </div>
          {d.foundationOpen ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ background: C.bg, borderRadius: 8, padding: '8px 10px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: C.muted }}>Foundation Balance</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.green, fontFamily: 'monospace' }}>{fm(d.foundationBalance||0)}</div>
              </div>
              <div style={{ background: C.bg, borderRadius: 8, padding: '8px 10px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: C.muted }}>3% APR (protected)</div>
                <div style={{ fontSize: 11, color: C.greenText, fontWeight: 700 }}>Bankruptcy-proof</div>
              </div>
            </div>
          ) : (
            <button onClick={() => { const e = openFoundation(); if (e) showMsg(e); else showMsg('Foundation opened!'); }} style={{ width: '100%', background: C.green, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Open Foundation — $50K Fee
            </button>
          )}
        </Card>

        {/* Streak */}
        <Card>
          <SectionHeader label="Login Streak" />
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {Array.from({length:7}).map((_,i) => (
              <div key={i} style={{ flex:1, height:28, borderRadius:6, background: i < (d.streak||0) ? C.amber : C.bg, border: '1px solid '+(i < (d.streak||0) ? C.amber : C.border), display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color: i < (d.streak||0) ? '#fff' : C.muted }}>
                {i+1}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.dim }}>
            {(d.streak||0) >= 7 ? '🎯 7-day streak complete! Spin token awarded.' : `${d.streak||0}/7 days — reach 7 for a free spin token.`}
          </div>
        </Card>
      </>}

      {/* LOANS TAB */}
      {activeTab === 'loans' && <>
        {d.activeLoan && (
          <Card style={{ border: '1px solid '+C.amber }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>⚠️ Active Loan</div>
              <div style={{ background: C.amberBg, color: C.amberText, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{d.activeLoan.tier?.label}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {[['Principal',fm(d.activeLoan.amount)],['Outstanding',fm(d.activeLoan.outstanding)],['APR',Math.round(d.activeLoan.rate*100)+'%']].map(([l,v]) => (
                <div key={l} style={{ flex:1, background:C.bg, borderRadius:8, padding:'8px 0', textAlign:'center' }}>
                  <div style={{ fontSize:9, color:C.muted }}>{l}</div>
                  <div style={{ fontSize:12, fontWeight:800, color:C.amber, fontFamily:'monospace' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={repayAmt} onChange={e => setRepayAmt(e.target.value)} placeholder="Repay amount..." style={{ flex:1, background:C.bg, border:'1px solid '+C.border, borderRadius:8, padding:'8px 10px', color:C.text, fontSize:12, outline:'none' }} />
              <button onClick={handleRepay} style={{ background:C.red, color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontWeight:700, fontSize:12, cursor:'pointer' }}>Repay</button>
            </div>
            <button onClick={() => repayLoan(d.activeLoan.outstanding)} style={{ width:'100%', marginTop:6, background:'#7F1D1D', color:C.redText, border:'1px solid '+C.red, borderRadius:8, padding:'8px 0', fontWeight:700, fontSize:12, cursor:'pointer' }}>
              Repay All — {fm(d.activeLoan.outstanding)}
            </button>
          </Card>
        )}

        {!d.activeLoan && (
          <div style={{ background: C.greenBg, border: '1px solid '+C.green, borderRadius: 10, padding: '10px 14px', fontSize: 11, color: C.greenText }}>✅ No active loan. Borrow capital to amplify gains.</div>
        )}

        <Card>
          <SectionHeader label="Loan Tiers" />
          {LOAN_TIERS.map(tier => {
            const locked = d.activeLoan && d.activeLoan.tier?.tier !== tier.tier;
            const hasActive = !!d.activeLoan;
            return (
              <div key={tier.tier} style={{ padding: '10px 0', borderBottom: '1px solid '+C.border }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{tier.label}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{tier.requires}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.green, fontFamily: 'monospace' }}>{fm(tier.max)}</div>
                    <div style={{ fontSize: 10, color: C.amber }}>{Math.round(tier.rate*100)}% APR</div>
                  </div>
                </div>
                {!hasActive && (
                  <button onClick={() => handleLoan(tier)} style={{ marginTop: 8, width: '100%', background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 0', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                    Borrow {fm(tier.max)}
                  </button>
                )}
              </div>
            );
          })}
        </Card>

        <Card>
          <SectionHeader label="Loan Statistics" />
          {[['Total Debt',fm(d.totalDebt||0),C.red],['Interest Paid',fm(d.totalInterestPaid||0),C.amber],['Loan History',(d.loanHistory||[]).length+' loans',C.muted]].map(([l,v,c]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid '+C.border }}>
              <span style={{ fontSize:12, color:C.dim }}>{l}</span>
              <span style={{ fontSize:12, fontWeight:700, color:c, fontFamily:'monospace' }}>{v}</span>
            </div>
          ))}
        </Card>
      </>}

      {/* TX LOG TAB */}
      {activeTab === 'txlog' && (
        <Card>
          <SectionHeader label="Transaction Log" />
          {(d.txLog || []).slice(0, 50).map((tx, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '9px 0', borderBottom: '1px solid '+C.border }}>
              <div style={{ width: 4, borderRadius: 2, flexShrink: 0, background: tx.amount >= 0 ? C.green : C.red, alignSelf: 'stretch' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 10, color: C.muted }}>T{tx.turn} · {tx.type}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: tx.amount >= 0 ? C.green : C.red, fontFamily: 'monospace' }}>{tx.amount >= 0 ? '+' : ''}{fm(tx.amount)}</div>
                </div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{tx.desc}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
