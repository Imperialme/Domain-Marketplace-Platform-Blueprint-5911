import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';
import { LOAN_TIERS, SOVEREIGN_FUNDS } from '../constants';

const CS = {
  card: { background:'#0D1B2E', borderRadius:16, padding:14, border:'1px solid #1A2744', marginBottom:10 },
  tab: (a) => ({ flex:1, padding:'9px 0', fontSize:11, fontWeight:700, border:'none', borderRadius:10, cursor:'pointer', background:a?'#059669':'#0D1B2E', color:a?'#fff':'#4B5563' }),
  label: { fontSize:10, color:'#4B5563', textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 },
};

function FundItem({ fund, d, onDeposit, onWithdraw }) {
  const [amt, setAmt] = useState('');
  const fd = d.fundDeposits?.[fund.id]||{deposit:0,earned:0};
  return (
    <div style={{...CS.card, border:fd.deposit>0?`1px solid ${fund.color}`:'1px solid #1A2744'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <div>
          <div style={{fontSize:13,fontWeight:800,color:'#F8FAFC'}}>{fund.ico} {fund.n}</div>
          <div style={{fontSize:10,color:'#4B5563'}}>{fund.id} · {fund.currency}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:22,fontWeight:900,color:fund.color,fontFamily:'monospace'}}>{fund.rate}%</div>
          <div style={{fontSize:9,color:'#4B5563'}}>APR</div>
        </div>
      </div>
      <div style={{fontSize:10,color:'#6B7280',lineHeight:1.4,marginBottom:10}}>{fund.desc}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:10}}>
        {[['AUM',fm(fund.aum)],['Deposited',fm(fd.deposit)],['Earned',fm(fd.earned||0)]].map(([l,v])=>(
          <div key={l} style={{background:'#060B14',borderRadius:8,padding:'7px 0',textAlign:'center'}}>
            <div style={{fontSize:8,color:'#4B5563'}}>{l}</div>
            <div style={{fontSize:11,fontWeight:800,color:l==='Earned'?'#34D399':'#D1D5DB',fontFamily:'monospace'}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8}}>
        <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="Deposit amount" style={{flex:1,background:'#060B14',border:'1px solid #1A2744',borderRadius:8,padding:'9px 12px',color:'#F8FAFC',fontSize:12,outline:'none'}}/>
        <button onClick={()=>{onDeposit(fund.id,amt);setAmt('');}} style={{background:'#059669',color:'#fff',border:'none',borderRadius:8,padding:'9px 14px',fontWeight:700,fontSize:12,cursor:'pointer'}}>In</button>
        {fd.deposit>0&&<button onClick={()=>onWithdraw(fund.id)} style={{background:'#DC2626',color:'#fff',border:'none',borderRadius:8,padding:'9px 14px',fontWeight:700,fontSize:12,cursor:'pointer'}}>Out</button>}
      </div>
    </div>
  );
}

export default function WealthScreen() {
  const { D, transfer, openFoundation, takeLoan, repayLoan, depositFund, withdrawFund } = useGame();
  const d = D;
  const [tab, setTab] = useState('wallets');
  const [repayAmt, setRepayAmt] = useState('');
  const [msg, setMsg] = useState('');
  const showMsg = m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const doTransfer = (dir) => {
    transfer(dir, 50);
    const labels={C2T:'Cash→Trading',T2C:'Trading→Cash',C2S:'Cash→Savings',S2C:'Savings→Cash',T2S:'Trading→Savings',S2T:'Savings→Trading'};
    showMsg(labels[dir]+' (50%)');
  };

  const tabs=[{id:'wallets',l:'💰 Wallets'},{id:'loans',l:'🏦 Loans'},{id:'funds',l:'💎 Funds'},{id:'log',l:'📋 Log'}];

  return (
    <div style={{padding:'14px 14px 80px',background:'#060B14',minHeight:'100%'}}>
      <div style={{fontSize:18,fontWeight:900,color:'#F8FAFC',marginBottom:12}}>💰 Wealth Manager</div>
      <div style={{display:'flex',gap:6,marginBottom:14}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={CS.tab(tab===t.id)}>{t.l}</button>
        ))}
      </div>

      {msg&&<div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}

      {/* WALLETS */}
      {tab==='wallets'&&<>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
          {[['💵','Cash',fm(d.cashWallet||0),'#60A5FA'],['🏦','Savings',fm(d.savingsWallet||0),'#34D399'],['⚡','Trading',fm(d.tradingWallet||0),'#FBBF24']].map(([ico,l,v,c])=>(
            <div key={l} style={{background:'#0D1B2E',borderRadius:14,padding:'14px 10px',border:'1px solid #1A2744',textAlign:'center'}}>
              <div style={{fontSize:22,marginBottom:6}}>{ico}</div>
              <div style={{fontSize:9,color:'#4B5563',textTransform:'uppercase',letterSpacing:1}}>{l}</div>
              <div style={{fontSize:13,fontWeight:800,color:c,fontFamily:'monospace',marginTop:4}}>{v}</div>
            </div>
          ))}
        </div>

        <div style={CS.card}>
          <div style={CS.label}>Transfers (50% of source)</div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {[['C2T','Cash → Trading'],['T2C','Trading → Cash'],['C2S','Cash → Savings'],['S2C','Savings → Cash'],['T2S','Trading → Savings'],['S2T','Savings → Trading']].map(([dir,lbl])=>(
              <button key={dir} onClick={()=>doTransfer(dir)} style={{background:'#060B14',border:'1px solid #1A2744',color:'#93C5FD',borderRadius:10,padding:'11px 14px',fontSize:12,fontWeight:600,cursor:'pointer',textAlign:'left'}}>
                ⇄ {lbl}
              </button>
            ))}
          </div>
        </div>

        <div style={{...CS.card,border:d.foundationOpen?'1px solid #34D399':'1px solid #1A2744'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:'#F8FAFC'}}>🛡️ Asset Protection Foundation</div>
              <div style={{fontSize:10,color:'#4B5563',marginTop:2}}>Bankruptcy shield · 3% APR · $50K one-time fee</div>
            </div>
            {d.foundationOpen&&<div style={{background:'#14532D',color:'#34D399',padding:'3px 10px',borderRadius:20,fontSize:10,fontWeight:700}}>OPEN</div>}
          </div>
          {d.foundationOpen?(
            <div style={{display:'flex',gap:8}}>
              <div style={{flex:1,background:'#060B14',borderRadius:8,padding:'8px 0',textAlign:'center'}}>
                <div style={{fontSize:9,color:'#4B5563'}}>Foundation Balance</div>
                <div style={{fontSize:14,fontWeight:800,color:'#34D399',fontFamily:'monospace'}}>{fm(d.foundationBalance||0)}</div>
              </div>
              <div style={{flex:1,background:'#060B14',borderRadius:8,padding:'8px 0',textAlign:'center'}}>
                <div style={{fontSize:9,color:'#4B5563'}}>Status</div>
                <div style={{fontSize:12,fontWeight:700,color:'#34D399'}}>✅ Protected</div>
              </div>
            </div>
          ):(
            <button onClick={()=>{const e=openFoundation();if(e)showMsg(e);else showMsg('Foundation opened!');}} style={{width:'100%',background:'#059669',color:'#fff',border:'none',borderRadius:10,padding:'12px 0',fontWeight:700,fontSize:14,cursor:'pointer'}}>
              Open Foundation — $50K
            </button>
          )}
        </div>

        <div style={CS.card}>
          <div style={CS.label}>Login Streak</div>
          <div style={{display:'flex',gap:5,marginBottom:8}}>
            {Array.from({length:7}).map((_,i)=>(
              <div key={i} style={{flex:1,height:32,borderRadius:8,background:i<(d.streak||0)?'#F59E0B':'#060B14',border:`1px solid ${i<(d.streak||0)?'#F59E0B':'#1A2744'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:i<(d.streak||0)?'#fff':'#4B5563',fontWeight:700}}>
                {i+1}
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:'#6B7280'}}>{(d.streak||0)>=7?'🎯 7-day streak! Free spin earned.':`${d.streak||0}/7 — reach 7 for a free spin token`}</div>
        </div>
      </>}

      {/* LOANS */}
      {tab==='loans'&&<>
        {d.activeLoan?(
          <div style={{...CS.card,border:'1px solid #F59E0B'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:800,color:'#FBBF24'}}>⚠️ Active Loan</div>
              <div style={{background:'#78350F',color:'#FDE68A',padding:'3px 10px',borderRadius:20,fontSize:10,fontWeight:700}}>{d.activeLoan.tier?.label}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
              {[['Principal',fm(d.activeLoan.amount)],['Outstanding',fm(d.activeLoan.outstanding)],['APR',Math.round(d.activeLoan.rate*100)+'%']].map(([l,v])=>(
                <div key={l} style={{background:'#060B14',borderRadius:8,padding:'8px 0',textAlign:'center'}}>
                  <div style={{fontSize:9,color:'#4B5563'}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:800,color:'#FBBF24',fontFamily:'monospace'}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <input value={repayAmt} onChange={e=>setRepayAmt(e.target.value)} placeholder="Amount to repay" style={{flex:1,background:'#060B14',border:'1px solid #1A2744',borderRadius:8,padding:'9px 12px',color:'#F8FAFC',fontSize:12,outline:'none'}}/>
              <button onClick={()=>{repayLoan(parseFloat(repayAmt)||0);setRepayAmt('');showMsg('Repaid');}} style={{background:'#DC2626',color:'#fff',border:'none',borderRadius:8,padding:'9px 14px',fontWeight:700,fontSize:12,cursor:'pointer'}}>Repay</button>
            </div>
            <button onClick={()=>{repayLoan(d.activeLoan.outstanding);showMsg('Loan fully repaid!');}} style={{width:'100%',background:'#7F1D1D',color:'#FCA5A5',border:'1px solid #DC2626',borderRadius:10,padding:'10px 0',fontWeight:700,fontSize:13,cursor:'pointer'}}>
              Repay All — {fm(d.activeLoan.outstanding)}
            </button>
          </div>
        ):(
          <div style={{background:'#0A2010',border:'1px solid #34D399',borderRadius:10,padding:'10px 14px',fontSize:11,color:'#34D399',marginBottom:10}}>✅ No active loan. Borrow to amplify your capital.</div>
        )}
        {LOAN_TIERS.map(tier=>(
          <div key={tier.tier} style={CS.card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:'#F8FAFC'}}>{tier.label}</div>
                <div style={{fontSize:10,color:'#4B5563',marginTop:2}}>{tier.requires}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:16,fontWeight:800,color:'#34D399',fontFamily:'monospace'}}>{fm(tier.max)}</div>
                <div style={{fontSize:10,color:'#FBBF24'}}>{Math.round(tier.rate*100)}% APR</div>
              </div>
            </div>
            {!d.activeLoan&&(
              <button onClick={()=>{const e=takeLoan(tier);if(e)showMsg(e);else showMsg(tier.label+' taken!');}} style={{width:'100%',background:'#059669',color:'#fff',border:'none',borderRadius:10,padding:'10px 0',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                Borrow {fm(tier.max)}
              </button>
            )}
          </div>
        ))}
        <div style={CS.card}>
          <div style={CS.label}>Stats</div>
          {[['Total Debt',fm(d.totalDebt||0),'#EF4444'],['Interest Paid',fm(d.totalInterestPaid||0),'#FBBF24'],['Loans History',(d.loanHistory||[]).length+' loans','#9CA3AF']].map(([l,v,c])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #0A1220'}}>
              <span style={{fontSize:12,color:'#6B7280'}}>{l}</span>
              <span style={{fontSize:12,fontWeight:700,color:c,fontFamily:'monospace'}}>{v}</span>
            </div>
          ))}
        </div>
      </>}

      {/* FUNDS */}
      {tab==='funds'&&<>
        <div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',marginBottom:10,fontSize:11,color:'#6B7280'}}>
          Planet Sovereign Funds compound daily. 2% entry fee. Interest goes to Trading Wallet every turn.
        </div>
        {SOVEREIGN_FUNDS.map(fund=>(
          <FundItem key={fund.id} fund={fund} d={d}
            onDeposit={(id,amtStr)=>{const a=parseFloat(amtStr);if(!a||a<=0)return showMsg('Invalid');const e=depositFund(id,a);if(e)showMsg(e);else showMsg('Deposited '+fm(a));}}
            onWithdraw={(id)=>{withdrawFund(id);showMsg('Withdrawn');}}
          />
        ))}
      </>}

      {/* LOG */}
      {tab==='log'&&(
        <div style={CS.card}>
          <div style={CS.label}>Transaction Log</div>
          {(d.txLog||[]).slice(0,50).map((tx,i)=>(
            <div key={i} style={{display:'flex',gap:10,padding:'9px 0',borderBottom:'1px solid #0A1220'}}>
              <div style={{width:3,borderRadius:2,flexShrink:0,background:tx.amount>=0?'#34D399':'#EF4444',alignSelf:'stretch'}}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <div style={{fontSize:10,color:'#4B5563'}}>T{tx.turn} · {tx.type}</div>
                  <div style={{fontSize:11,fontWeight:800,color:tx.amount>=0?'#34D399':'#EF4444',fontFamily:'monospace'}}>{tx.amount>=0?'+':''}{fm(tx.amount)}</div>
                </div>
                <div style={{fontSize:11,color:'#6B7280',marginTop:2}}>{tx.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
