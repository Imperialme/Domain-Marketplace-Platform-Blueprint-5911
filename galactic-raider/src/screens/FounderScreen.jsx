import React, { useState } from 'react';
import { useGame } from '../store/gameStore';
import { getT } from '../i18n';
import { fm as formatMoney, cl } from '../utils';

export function FounderTab({ lang }) {
  const { D, S, startFounderMode, takeLoanFounder, hireEmployees, runMarketingCampaign, setDividendPolicy, resolveDistressEmergencyRaise, resolveDistressLayoffs, proposeFundingRound, launchFounderIPO, confirmFounderIPO, acceptTenderOffer, declineTenderOffer, FOUNDER_MIN_CAPITAL, FUNDING_ROUNDS, founderCompanyValuation, setTradeLock } = useGame();
  const t = getT(lang);
  const fm = S.current.founderMode;
  const MIN_CAPITAL = FOUNDER_MIN_CAPITAL || 10000000;

  const [setupMode, setSetupMode] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('tech');
  const [capitalAmount, setCapitalAmount] = useState(MIN_CAPITAL);
  const [setupErr, setSetupErr] = useState('');

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState(10000);
  const [loanTerm, setLoanTerm] = useState(12);
  const [loanErr, setLoanErr] = useState('');

  const [showIPOModal, setShowIPOModal] = useState(false);
  const [ipoShares, setIpoShares] = useState(100000);
  const [ipoPrice, setIpoPrice] = useState(100);
  const [ipoErr, setIpoErr] = useState('');

  const [showFundingModal, setShowFundingModal] = useState(false);
  const [fundingValuation, setFundingValuation] = useState(50000000);
  const [fundingErr, setFundingErr] = useState('');

  const [showHireModal, setShowHireModal] = useState(false);
  const [hireCount, setHireCount] = useState(10);
  const [hireErr, setHireErr] = useState('');

  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [marketingBudget, setMarketingBudget] = useState(100000);
  const [marketingErr, setMarketingErr] = useState('');

  const [showDividendModal, setShowDividendModal] = useState(false);
  const [dividendPct, setDividendPct] = useState(0);
  const [dividendErr, setDividendErr] = useState('');

  const industries = ['tech', 'healthcare', 'energy', 'finance', 'retail', 'utilities'];

  if (!fm.active) {
    return (
      <div style={{ padding: '12px', fontSize: '13px', lineHeight: 1.5 }}>
        <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(100,200,255,0.1)', borderRadius: '6px', border: '1px solid rgba(100,200,255,0.2)' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>🚀 Founder Mode</div>
          <div style={{ fontSize: '12px', marginBottom: '12px', opacity: 0.8 }}>
            Start your own company. Inject capital, take loans, manage growth, and launch an IPO to go public.
          </div>
          <button
            onClick={() => setSetupMode(true)}
            style={{
              padding: '8px 14px',
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            Start Founder Mode
          </button>
        </div>

        {setupMode && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: D.darkMode ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '14px' }}>Founder Setup</div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., TechVenture Inc"
                  style={{ width: '100%', padding: '8px', background: D.darkMode ? '#2a2a3e' : '#f5f5f5', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: D.darkMode ? '#fff' : '#000', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Industry Niche</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{ width: '100%', padding: '8px', background: D.darkMode ? '#2a2a3e' : '#f5f5f5', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: D.darkMode ? '#fff' : '#000', boxSizing: 'border-box' }}
                >
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind.charAt(0).toUpperCase() + ind.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>
                  Initial Capital: ${capitalAmount.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={MIN_CAPITAL}
                  max={Math.max(MIN_CAPITAL, D.tradingWallet)}
                  value={capitalAmount}
                  onChange={(e) => setCapitalAmount(Math.floor(+e.target.value))}
                  style={{ width: '100%' }}
                  disabled={D.tradingWallet < MIN_CAPITAL}
                />
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                  Minimum: ${MIN_CAPITAL.toLocaleString()} · Available: ${D.tradingWallet.toLocaleString()}
                </div>
                {D.tradingWallet < MIN_CAPITAL && (
                  <div style={{ fontSize: '11px', color: '#FF6B6B', marginTop: '6px' }}>
                    You need at least ${MIN_CAPITAL.toLocaleString()} in your Trading Wallet to found a company.
                  </div>
                )}
              </div>

              {setupErr && <div style={{ fontSize: '11px', color: '#FF6B6B', marginBottom: '10px' }}>{setupErr}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => { setSetupMode(false); setSetupErr(''); }}
                  style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  disabled={D.tradingWallet < MIN_CAPITAL}
                  onClick={() => {
                    if (!companyName.trim()) { setSetupErr('Please enter a company name'); return; }
                    const err = startFounderMode(companyName, industry, capitalAmount);
                    if (err) { setSetupErr(err); return; }
                    setSetupMode(false);
                    setSetupErr('');
                  }}
                  style={{ padding: '8px', background: D.tradingWallet < MIN_CAPITAL ? 'rgba(76,175,80,0.4)' : '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: D.tradingWallet < MIN_CAPITAL ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  Launch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Founder mode active
  const totalDebt = fm.loans.reduce((x, l) => x + l.outstanding, 0);
  const ownershipPct = fm.sharesOutstanding > 0 ? (fm.founderShares / fm.sharesOutstanding) * 100 : 100;
  const equityValue = fm.stock.price * fm.founderShares;
  const netWorth = fm.currentCapital + equityValue - totalDebt;
  const maxLeverageRatio = fm.foundersCapital <= 10e6 ? 0.50 : fm.foundersCapital >= 100e6 ? 0.15
    : 0.50 + (0.15 - 0.50) * ((Math.log(fm.foundersCapital) - Math.log(10e6)) / (Math.log(100e6) - Math.log(10e6)));
  const maxTotalDebt = fm.foundersCapital * maxLeverageRatio;
  const debtRemaining = Math.max(0, maxTotalDebt - totalDebt);

  return (
    <div style={{ padding: '12px', fontSize: '13px' }}>
      {/* Tender Offer Modal */}
      {fm.pendingOffer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: D.darkMode ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>💼 Acquisition Offer</div>
            <div style={{ fontSize: '13px', marginBottom: '10px' }}>
              <strong>{fm.pendingOffer.buyer}</strong> wants to acquire {fm.companyName}.
            </div>
            <div style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '10px', marginBottom: '12px', lineHeight: 1.7 }}>
              <div>Offer: ${fm.pendingOffer.pricePerShare.toFixed(2)}/share</div>
              <div>Total company value: ${fm.pendingOffer.totalValue.toLocaleString()}</div>
              <div>Your payout ({ownershipPct.toFixed(1)}% stake): <strong style={{ color: '#4CAF50' }}>${(fm.pendingOffer.totalValue * ownershipPct / 100).toLocaleString()}</strong></div>
              <div style={{ opacity: 0.7, marginTop: 4 }}>Expires turn {fm.pendingOffer.expiresAtTurn}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button onClick={() => declineTenderOffer()} style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Decline
              </button>
              <button onClick={() => acceptTenderOffer()} style={{ padding: '10px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Accept & Cash Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company Header */}
      <div style={{ padding: '12px', background: 'rgba(100,200,255,0.1)', borderRadius: '6px', border: '1px solid rgba(100,200,255,0.2)', marginBottom: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{fm.companyName}</div>
        <div style={{ fontSize: '11px', opacity: 0.7 }}>
          Stage: <strong style={{ textTransform: 'uppercase' }}>{fm.stage}</strong> · Industry: <strong>{fm.industry}</strong>
        </div>
      </div>

      {/* Company Valuation */}
      <div style={{ padding: '10px', background: 'rgba(139,92,246,0.1)', borderRadius: '4px', border: '1px solid rgba(139,92,246,0.3)', marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>💎 Company Valuation</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#C4B5FD' }}>${Math.round(fm.valuation||0).toLocaleString()}</div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
          = Cash net of debt (${Math.max(0, fm.currentCapital - totalDebt).toLocaleString()}) + capitalized earnings premium. Never below what's actually in the bank.
        </div>
      </div>

      {/* Cap Table */}
      <div style={{ padding: '10px', background: 'rgba(255,215,0,0.08)', borderRadius: '4px', border: '1px solid rgba(255,215,0,0.25)', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>👑 Your Ownership</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
          <div>Your shares: <strong>{fm.founderShares.toLocaleString()}</strong></div>
          <div>Total shares: <strong>{fm.sharesOutstanding.toLocaleString()}</strong></div>
          <div>Ownership: <strong style={{ color: ownershipPct >= 51 ? '#4CAF50' : '#FF6B6B' }}>{ownershipPct.toFixed(1)}%</strong></div>
          <div>Your equity value: <strong>${Math.round(equityValue).toLocaleString()}</strong></div>
        </div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '6px' }}>
          {ownershipPct >= 51 ? 'You hold majority control — every decision here is final board policy.' : 'Your stake has fallen below majority.'}
        </div>
      </div>

      {/* Financial Distress — real choices instead of sudden bankruptcy */}
      {fm.distressEvent && (
        <div style={{ padding: '12px', background: 'rgba(220,38,38,0.18)', borderRadius: '6px', border: '2px solid #DC2626', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#FCA5A5', marginBottom: '4px' }}>🚨 Cash Crisis</div>
          <div style={{ fontSize: '11px', color: '#FCA5A5', opacity: 0.9, marginBottom: '10px' }}>
            Runway is critically low. The board must act now, or risk the company folding entirely with no payout.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => resolveDistressEmergencyRaise()}
              style={{ padding: '10px', background: '#B45309', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
            >
              💸 Emergency Shares<br/><span style={{ fontWeight: 'normal', fontSize: '10px' }}>Raise cash at 20% discount, dilutes you</span>
            </button>
            <button
              onClick={() => resolveDistressLayoffs()}
              style={{ padding: '10px', background: '#7C2D12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
            >
              ✂️ Layoffs<br/><span style={{ fontWeight: 'normal', fontSize: '10px' }}>Cut ~30% of staff, hurts demand</span>
            </button>
          </div>
        </div>
      )}

      {/* Burn Rate / Runway Banner */}
      <div style={{ padding: '10px 12px', background: fm.burnRate > 0 ? 'rgba(220,38,38,0.12)' : 'rgba(76,175,80,0.12)', borderRadius: '6px', border: '1px solid '+(fm.burnRate > 0 ? 'rgba(220,38,38,0.3)' : 'rgba(76,175,80,0.3)'), marginBottom: '12px' }}>
        {fm.burnRate > 0 ? (
          <>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#FCA5A5' }}>🔥 Burning ${fm.burnRate.toLocaleString()}/turn</div>
            <div style={{ fontSize: '11px', color: '#FCA5A5', opacity: 0.85, marginTop: '2px' }}>
              {fm.runwayTurns != null ? `${fm.runwayTurns} turns of runway left at this rate — the company folds if capital hits $0.` : 'Monitor your runway closely.'}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#86EFAC' }}>✅ Profitable — capital growing ${(-fm.burnRate).toLocaleString()}/turn</div>
            <div style={{ fontSize: '11px', color: '#86EFAC', opacity: 0.85, marginTop: '2px' }}>Revenue now covers operating costs and cost of goods.</div>
          </>
        )}
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <div style={{ padding: '10px', background: 'rgba(0,200,100,0.1)', borderRadius: '4px', border: '1px solid rgba(0,200,100,0.2)' }}>
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>Current Capital</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4CAF50' }}>${fm.currentCapital.toLocaleString()}</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(200,100,0,0.1)', borderRadius: '4px', border: '1px solid rgba(200,100,0,0.2)' }}>
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>Revenue (converging to ${Math.round(fm.targetRevenue).toLocaleString()})</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFA500' }}>${fm.revenue.toLocaleString()}</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,100,100,0.1)', borderRadius: '4px', border: '1px solid rgba(255,100,100,0.2)' }}>
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>Total Debt (max ${Math.round(maxTotalDebt).toLocaleString()})</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FF6B6B' }}>${totalDebt.toLocaleString()}</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(100,150,255,0.1)', borderRadius: '4px', border: '1px solid rgba(100,150,255,0.2)' }}>
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>Stock Price</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#6BB6FF' }}>${fm.stock.price.toFixed(2)}</div>
        </div>
      </div>

      {/* Revenue Formula Transparency */}
      <div style={{ padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px', fontSize: '11px', lineHeight: 1.7 }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📊 Revenue &amp; Cost Breakdown</div>
        <div>Revenue target = Total Capital Raised (${(fm.totalCapitalRaised||fm.foundersCapital).toLocaleString()}) × 2% × industry ceiling × demand × headcount capacity</div>
        <div>Revenue is {Math.round((fm.revenueRampProgress||0)*100)}% of the way to its target ceiling.</div>
        <div>Expenses = fixed operating cost (scales with capital raised + {fm.employees||20} employees × $2,000) + cost of goods (scales with revenue)</div>
        <div>
          {fm.profitMargin == null
            ? <span style={{ color: '#FBBF24' }}>Ramping up — too early in revenue growth for a meaningful margin %</span>
            : <>Profit margin: <strong style={{ color: fm.profitMargin >= 0 ? '#86EFAC' : '#FCA5A5' }}>{(fm.profitMargin * 100).toFixed(0)}%</strong></>
          } · Expenses: ${fm.expenses.toLocaleString()}
        </div>
        <div style={{ opacity: 0.7 }}>Revenue moves gradually toward its target each turn. Raising a funding round or hiring increases both your ceiling AND your burn — bigger bets, bigger stakes.</div>
      </div>

      {/* Itemized Expense Breakdown — where the money actually goes */}
      {fm.expenseBreakdown && (
        <div style={{ padding: '10px', background: 'rgba(255,100,100,0.05)', borderRadius: '4px', border: '1px solid rgba(255,100,100,0.15)', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>💵 Where The Money Goes (per turn)</div>
          {[
            ['👤 Salaries', fm.expenseBreakdown.salaries],
            ['📦 Cost of Goods', fm.expenseBreakdown.costOfGoods],
            ['🔬 R&D', fm.expenseBreakdown.rnd],
            ['📣 Marketing Upkeep', fm.expenseBreakdown.marketing],
            ['⚖️ Legal & Admin', fm.expenseBreakdown.legalAdmin],
            ['🏢 Rent & Facilities', fm.expenseBreakdown.rentFacilities],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '3px 0' }}>
              <span style={{ opacity: 0.8 }}>{label}</span>
              <strong>${Math.round(val||0).toLocaleString()}</strong>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '5px 0 0', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>
            <span>Total Expenses</span>
            <span>${Math.round(fm.expenses).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Team & Marketing */}
      <div style={{ padding: '10px', background: 'rgba(56,189,248,0.08)', borderRadius: '4px', border: '1px solid rgba(56,189,248,0.25)', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>👥 Team &amp; Marketing</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', marginBottom: '8px' }}>
          <div>Employees: <strong>{(fm.employees||20).toLocaleString()}</strong></div>
          <div>Salary cost: <strong>${((fm.employees||20)*2000).toLocaleString()}/turn</strong></div>
          <div>Dividend Yield: <strong>{(fm.dividendYield||0).toFixed(1)}%</strong></div>
          <div>Demand Trend: <strong style={{ color: fm.demandTrend > 0 ? '#4CAF50' : '#FF6B6B' }}>{(fm.demandTrend*100).toFixed(0)}%</strong></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <button onClick={() => { setShowHireModal(true); setTradeLock(true); }} style={{ padding: '10px', background: 'rgba(56,189,248,0.2)', border: '1px solid rgba(56,189,248,0.4)', color: '#7DD3FC', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            👥 Hire Employees
          </button>
          <button onClick={() => { setShowMarketingModal(true); setTradeLock(true); }} style={{ padding: '10px', background: 'rgba(236,72,153,0.2)', border: '1px solid rgba(236,72,153,0.4)', color: '#F9A8D4', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            📣 Marketing Campaign
          </button>
        </div>
        <button onClick={() => { setDividendPct(fm.dividendYield||0); setShowDividendModal(true); setTradeLock(true); }} style={{ width: '100%', padding: '10px', background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.4)', color: '#FDE047', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
          💰 Set Dividend Policy
        </button>
      </div>

      {/* Funding Rounds */}
      <div style={{ padding: '10px', background: 'rgba(255,215,0,0.06)', borderRadius: '4px', border: '1px solid rgba(255,215,0,0.2)', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold' }}>💰 Funding Stage: <span style={{ textTransform: 'uppercase' }}>{fm.fundingRound}</span></div>
        </div>
        {fm.leadInvestor && (
          <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '6px' }}>
            Lead Investor: <strong>{fm.leadInvestor.name}</strong> ({fm.leadInvestor.stakePct.toFixed(1)}% stake)
            {fm.leadInvestor.stakePct >= 15 && <span style={{ color: '#FCA5A5' }}> — can veto a lowball IPO price</span>}
          </div>
        )}
        {fm.lastRoundRejection && (
          <div style={{ fontSize: '11px', color: '#FCA5A5', marginBottom: '6px' }}>
            ❌ {fm.lastRoundRejection.round} rejected: {fm.lastRoundRejection.reason}
          </div>
        )}
        {fm.stage !== 'public' && fm.fundingRound !== 'seriesC' && (() => {
          const onCooldown = fm.fundingCooldownUntilTurn && D.turn < fm.fundingCooldownUntilTurn;
          return (
            <button
              disabled={onCooldown}
              onClick={() => { setShowFundingModal(true); setTradeLock(true); }}
              style={{ width: '100%', padding: '10px', background: onCooldown ? 'rgba(180,83,9,0.3)' : '#B45309', color: onCooldown ? 'rgba(255,255,255,0.5)' : '#fff', border: 'none', borderRadius: '4px', cursor: onCooldown ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}
            >
              {onCooldown ? `Investors unavailable (${fm.fundingCooldownUntilTurn - D.turn} turns)` : 'Raise ' + (FUNDING_ROUNDS?.[fm.fundingRound === 'seed' ? 'seriesA' : fm.fundingRound === 'seriesA' ? 'seriesB' : 'seriesC']?.label || 'Next Round')}
            </button>
          );
        })()}
        {fm.fundingHistory?.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            {fm.fundingHistory.map((r, i) => (
              <div key={i} style={{ fontSize: '10px', opacity: 0.7, padding: '3px 0' }}>
                {r.round}: ${r.raised.toLocaleString()} from {r.investor} @ ${Math.round(r.preMoney).toLocaleString()} pre-money ({r.dilutionPct}% dilution)
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demand & Weather */}
      <div style={{ padding: '10px', background: 'rgba(150,100,255,0.1)', borderRadius: '4px', border: '1px solid rgba(150,100,255,0.2)', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>Market Dynamics</div>
        <div style={{ fontSize: '12px', marginBottom: '4px' }}>
          Demand Trend: <strong style={{ color: fm.demandTrend > 0 ? '#4CAF50' : '#FF6B6B' }}>{(fm.demandTrend * 100).toFixed(0)}%</strong>
        </div>
        <div style={{ fontSize: '12px' }}>
          Weather Resistance: <strong>{(fm.weatherResistance * 100).toFixed(0)}%</strong> (Industry advantage vs economic downturns)
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <button
          onClick={() => { setShowLoanModal(true); setTradeLock(true); }}
          style={{
            padding: '10px',
            background: 'rgba(100,150,255,0.2)',
            border: '1px solid rgba(100,150,255,0.4)',
            color: '#6BB6FF',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          💳 Take Loan
        </button>
        {fm.stage === 'bootstrapped' && (
          <button
            onClick={() => { setShowIPOModal(true); setTradeLock(true); }}
            style={{
              padding: '10px',
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
              border: 'none',
              color: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            🚀 File IPO
          </button>
        )}
        {fm.stage === 'pre-ipo' && (
          <button
            onClick={() => { confirmFounderIPO(); setTradeLock(false); }}
            style={{
              padding: '10px',
              background: '#4CAF50',
              border: 'none',
              color: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            ✓ Launch IPO
          </button>
        )}
      </div>

      {/* Pre-IPO Book Building */}
      {fm.stage === 'pre-ipo' && fm.ipoBook?.length > 0 && (
        <div style={{ padding: '10px', background: 'rgba(100,200,255,0.08)', borderRadius: '4px', border: '1px solid rgba(100,200,255,0.2)', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>📖 Institutional Interest (Book Building)</div>
          {fm.ipoBook.map((inv, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '4px 0', borderBottom: i < fm.ipoBook.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <span>{inv.name}</span>
              <strong style={{ color: inv.demandPct >= 60 ? '#4CAF50' : inv.demandPct >= 30 ? '#FFA500' : '#FF6B6B' }}>{inv.demandPct.toFixed(0)}% interest</strong>
            </div>
          ))}
          <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '8px' }}>
            Overall demand: {(fm.investorDemand * 100).toFixed(0)}% · This determines how many of your filed shares actually get allocated at launch.
          </div>
        </div>
      )}

      {/* Loans Display */}
      {fm.loans.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Active Loans</div>
          {fm.loans.map((loan, idx) => (
            <div key={idx} style={{ padding: '8px', background: 'rgba(255,100,100,0.1)', borderRadius: '4px', border: '1px solid rgba(255,100,100,0.2)', marginBottom: '4px', fontSize: '11px' }}>
              <div>${loan.amount.toLocaleString()} @ {(loan.rate * 100).toFixed(1)}% APR · Outstanding: ${loan.outstanding.toLocaleString()}</div>
              <div style={{ opacity: 0.7 }}>Monthly: ${loan.monthlyPayment.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loan Modal */}
      {showLoanModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: D.darkMode ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '14px' }}>Take a Loan</div>

            <div style={{ fontSize: '11px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '12px' }}>
              Total debt cap: <strong>${Math.round(maxTotalDebt).toLocaleString()}</strong> ({(maxLeverageRatio*100).toFixed(0)}% of your ${fm.foundersCapital.toLocaleString()} founding capital)<br/>
              Currently borrowed: ${totalDebt.toLocaleString()} · Remaining room: <strong>${Math.round(debtRemaining).toLocaleString()}</strong>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>
                Loan Amount: ${loanAmount.toLocaleString()}
              </label>
              <input
                type="range"
                min="5000"
                max={Math.max(5000, Math.floor(debtRemaining))}
                value={Math.min(loanAmount, Math.max(5000, Math.floor(debtRemaining)))}
                onChange={(e) => setLoanAmount(Math.floor(+e.target.value))}
                style={{ width: '100%' }}
                disabled={debtRemaining < 5000}
              />
              {debtRemaining < 5000 && <div style={{ fontSize: '11px', color: '#FF6B6B', marginTop: '4px' }}>Debt cap reached — repay existing loans to borrow more.</div>}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Term (months)</label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(+e.target.value)}
                style={{ width: '100%', padding: '8px', background: D.darkMode ? '#2a2a3e' : '#f5f5f5', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: D.darkMode ? '#fff' : '#000', boxSizing: 'border-box' }}
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
                <option value={36}>36 months</option>
              </select>
            </div>

            <div style={{ fontSize: '11px', padding: '8px', background: 'rgba(200,200,0,0.1)', borderRadius: '4px', marginBottom: '12px' }}>
              Est. Monthly Payment: ${Math.floor(loanAmount / loanTerm).toLocaleString()}
            </div>

            {loanErr && <div style={{ fontSize: '11px', color: '#FF6B6B', marginBottom: '10px' }}>{loanErr}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => { setShowLoanModal(false); setTradeLock(false); setLoanErr(''); }}
                style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                disabled={debtRemaining < 5000}
                onClick={() => {
                  const err = takeLoanFounder(loanAmount, loanTerm);
                  if (err) { setLoanErr(err); return; }
                  setShowLoanModal(false);
                  setTradeLock(false);
                  setLoanErr('');
                }}
                style={{ padding: '8px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Borrow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Funding Round Modal */}
      {showFundingModal && (() => {
        const nextRoundKey = fm.fundingRound === 'seed' ? 'seriesA' : fm.fundingRound === 'seriesA' ? 'seriesB' : 'seriesC';
        const cfg = FUNDING_ROUNDS?.[nextRoundKey];
        const fairValue = Math.max(founderCompanyValuation(fm), fm.currentCapital);
        const minAsk = Math.round(fairValue * 0.5);
        const maxAsk = Math.round(fairValue * 2);
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: D.darkMode ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Raise {cfg?.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '12px' }}>
                Fair value estimate: ${fairValue.toLocaleString()}. Investors won't discuss anything above ${maxAsk.toLocaleString()} (2x fair value) — asking near or below fair value is safe, asking well above it risks rejection and a 25-turn cooldown.
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>
                  Pre-Money Valuation: ${fundingValuation.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={minAsk}
                  max={maxAsk}
                  step={Math.max(1, Math.round((maxAsk-minAsk)/100))}
                  value={cl(fundingValuation, minAsk, maxAsk)}
                  onChange={(e) => setFundingValuation(Math.floor(+e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ fontSize: '11px', padding: '8px', background: 'rgba(180,83,9,0.15)', borderRadius: '4px', marginBottom: '12px' }}>
                Expected dilution: {cfg ? `${Math.round(cfg.dilution[0]*100)}-${Math.round(cfg.dilution[1]*100)}%` : '—'} · Requires {cfg ? Math.round(cfg.minRevenueRatio*100) : '—'}% of revenue potential proven
              </div>

              {fm.fundingCooldownUntilTurn && D.turn < fm.fundingCooldownUntilTurn && (
                <div style={{ fontSize: '11px', color: '#FF6B6B', marginBottom: '10px' }}>
                  Investors need {fm.fundingCooldownUntilTurn - D.turn} more turns after the last rejection before they'll talk again.
                </div>
              )}

              {fundingErr && <div style={{ fontSize: '11px', color: '#FF6B6B', marginBottom: '10px' }}>{fundingErr}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => { setShowFundingModal(false); setTradeLock(false); setFundingErr(''); }}
                  style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const err = proposeFundingRound(nextRoundKey, fundingValuation);
                    if (err) { setFundingErr(err); return; }
                    setShowFundingModal(false);
                    setTradeLock(false);
                    setFundingErr('');
                  }}
                  style={{ padding: '8px', background: '#B45309', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Pitch Investors
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Hire Employees Modal */}
      {showHireModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: D.darkMode ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>👥 Hire Employees</div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '12px' }}>
              More headcount raises your revenue ceiling (more capacity to serve demand) but adds an ongoing $2,000/turn salary per hire.
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Hire: {hireCount.toLocaleString()} employees</label>
              <input type="range" min="1" max="500" value={hireCount} onChange={(e) => setHireCount(+e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ fontSize: '11px', padding: '8px', background: 'rgba(56,189,248,0.15)', borderRadius: '4px', marginBottom: '12px' }}>
              One-time onboarding cost: ${(hireCount*80000).toLocaleString()} · New salary cost: +${(hireCount*2000).toLocaleString()}/turn
            </div>
            {hireErr && <div style={{ fontSize: '11px', color: '#FF6B6B', marginBottom: '10px' }}>{hireErr}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button onClick={() => { setShowHireModal(false); setTradeLock(false); setHireErr(''); }} style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => {
                const err = hireEmployees(hireCount);
                if (err) { setHireErr(err); return; }
                setShowHireModal(false); setTradeLock(false); setHireErr('');
              }} style={{ padding: '8px', background: '#0284C7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hire</button>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Campaign Modal */}
      {showMarketingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: D.darkMode ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>📣 Marketing Campaign</div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '12px' }}>
              A one-time spend that immediately boosts demand trend. The effect persists but drifts over time like any campaign — it's not permanent.
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Budget: ${marketingBudget.toLocaleString()}</label>
              <input type="range" min="10000" max={Math.max(10000, Math.floor(fm.currentCapital*0.3))} step="10000" value={marketingBudget} onChange={(e) => setMarketingBudget(+e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ fontSize: '11px', padding: '8px', background: 'rgba(236,72,153,0.15)', borderRadius: '4px', marginBottom: '12px' }}>
              Estimated demand boost: +{Math.round(Math.min(0.35, marketingBudget / (fm.totalCapitalRaised||fm.foundersCapital) * 1.5) * 100)}pp
            </div>
            {marketingErr && <div style={{ fontSize: '11px', color: '#FF6B6B', marginBottom: '10px' }}>{marketingErr}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button onClick={() => { setShowMarketingModal(false); setTradeLock(false); setMarketingErr(''); }} style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => {
                const err = runMarketingCampaign(marketingBudget);
                if (err) { setMarketingErr(err); return; }
                setShowMarketingModal(false); setTradeLock(false); setMarketingErr('');
              }} style={{ padding: '8px', background: '#DB2777', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Launch Campaign</button>
            </div>
          </div>
        </div>
      )}

      {/* Dividend Policy Modal */}
      {showDividendModal && (() => {
        const industryBase = { tech: 0.3, healthcare: 1.2, energy: 3.5, finance: 2.8, retail: 1.5, utilities: 4.2 }[fm.industry] || 0.3;
        const maxYield = industryBase * 3;
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: D.darkMode ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>💰 Dividend Policy</div>
              <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '12px' }}>
                Set your target yield — 0% pauses dividends entirely, retaining all cash for growth. The actual payout each quarter is still capped at 25% of cash on hand, so declaring a high yield you can't afford just gets cut short.
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Dividend Yield: {dividendPct.toFixed(1)}%</label>
                <input type="range" min="0" max={maxYield} step="0.1" value={dividendPct} onChange={(e) => setDividendPct(+e.target.value)} style={{ width: '100%' }} />
                <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>Max for {fm.industry}: {maxYield.toFixed(1)}%</div>
              </div>
              {dividendErr && <div style={{ fontSize: '11px', color: '#FF6B6B', marginBottom: '10px' }}>{dividendErr}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={() => { setShowDividendModal(false); setTradeLock(false); setDividendErr(''); }} style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => {
                  const err = setDividendPolicy(dividendPct);
                  if (err) { setDividendErr(err); return; }
                  setShowDividendModal(false); setTradeLock(false); setDividendErr('');
                }} style={{ padding: '8px', background: '#CA8A04', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Set Policy</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* IPO Modal */}
      {showIPOModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: D.darkMode ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '90%', maxHeight: '85vh', overflow: 'auto' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>File for IPO</div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '12px' }}>
              These are newly-issued shares sold to the public — your {fm.founderShares.toLocaleString()} shares are never sold, only diluted. You'll keep at least 51% ownership.
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>
                New Shares to Issue: {ipoShares.toLocaleString()}
              </label>
              <input
                type="range"
                min="10000"
                max={Math.floor(fm.founderShares * 0.96)}
                value={Math.min(ipoShares, Math.floor(fm.founderShares * 0.96))}
                onChange={(e) => setIpoShares(Math.floor(+e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
                Post-IPO ownership: {((fm.founderShares / (fm.sharesOutstanding + ipoShares)) * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>
                Offer Price: ${ipoPrice.toFixed(2)}
              </label>
              <input
                type="number"
                value={ipoPrice}
                onChange={(e) => setIpoPrice(Math.max(1, parseFloat(e.target.value) || 100))}
                style={{ width: '100%', padding: '8px', background: D.darkMode ? '#2a2a3e' : '#f5f5f5', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: D.darkMode ? '#fff' : '#000', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ fontSize: '11px', padding: '8px', background: 'rgba(100,200,255,0.1)', borderRadius: '4px', marginBottom: '12px' }}>
              Expected Proceeds to You: ${(ipoShares * ipoPrice).toLocaleString()}
            </div>

            {ipoErr && <div style={{ fontSize: '11px', color: '#FF6B6B', marginBottom: '10px' }}>{ipoErr}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => { setShowIPOModal(false); setTradeLock(false); setIpoErr(''); }}
                style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const err = launchFounderIPO(ipoShares, ipoPrice);
                  if (err) { setIpoErr(err); return; }
                  setShowIPOModal(false);
                  setTradeLock(false);
                  setIpoErr('');
                }}
                style={{ padding: '8px', background: '#FF8C42', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                File IPO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
