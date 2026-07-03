import React, { useState } from 'react';
import { useGame } from '../store/gameStore';
import { getT } from '../i18n';
import { fm as formatMoney } from '../utils';

export function FounderTab({ lang }) {
  const { D, S, startFounderMode, takeLoanFounder, launchFounderIPO, confirmFounderIPO, setTradeLock } = useGame();
  const t = getT(lang);
  const fm = S.current.founderMode;

  const [setupMode, setSetupMode] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('tech');
  const [capitalAmount, setCapitalAmount] = useState(50000);

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState(10000);
  const [loanTerm, setLoanTerm] = useState(12);

  const [showIPOModal, setShowIPOModal] = useState(false);
  const [ipoShares, setIpoShares] = useState(100000);
  const [ipoPrice, setIpoPrice] = useState(100);

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
                  min="10000"
                  max={D.tradingWallet}
                  value={capitalAmount}
                  onChange={(e) => setCapitalAmount(Math.floor(+e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>Available: ${D.tradingWallet.toLocaleString()}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => setSetupMode(false)}
                  style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!companyName.trim()) { alert('Please enter a company name'); return; }
                    startFounderMode(companyName, industry, capitalAmount);
                    setSetupMode(false);
                  }}
                  style={{ padding: '8px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
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
  const equityValue = fm.stock.price * fm.sharesOutstanding;
  const netWorth = fm.currentCapital + equityValue - totalDebt;

  return (
    <div style={{ padding: '12px', fontSize: '13px' }}>
      {/* Company Header */}
      <div style={{ padding: '12px', background: 'rgba(100,200,255,0.1)', borderRadius: '6px', border: '1px solid rgba(100,200,255,0.2)', marginBottom: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{fm.companyName}</div>
        <div style={{ fontSize: '11px', opacity: 0.7 }}>
          Stage: <strong style={{ textTransform: 'uppercase' }}>{fm.stage}</strong> · Industry: <strong>{fm.industry}</strong>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <div style={{ padding: '10px', background: 'rgba(0,200,100,0.1)', borderRadius: '4px', border: '1px solid rgba(0,200,100,0.2)' }}>
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>Current Capital</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4CAF50' }}>${fm.currentCapital.toLocaleString()}</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(200,100,0,0.1)', borderRadius: '4px', border: '1px solid rgba(200,100,0,0.2)' }}>
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>Monthly Revenue</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFA500' }}>${fm.revenue.toLocaleString()}</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,100,100,0.1)', borderRadius: '4px', border: '1px solid rgba(255,100,100,0.2)' }}>
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>Total Debt</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FF6B6B' }}>${totalDebt.toLocaleString()}</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(100,150,255,0.1)', borderRadius: '4px', border: '1px solid rgba(100,150,255,0.2)' }}>
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>Stock Price</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#6BB6FF' }}>${fm.stock.price.toFixed(2)}</div>
        </div>
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

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>
                Loan Amount: ${loanAmount.toLocaleString()}
              </label>
              <input
                type="range"
                min="5000"
                max={Math.min(fm.currentCapital * 5, 1000000)}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.floor(+e.target.value))}
                style={{ width: '100%' }}
              />
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => { setShowLoanModal(false); setTradeLock(false); }}
                style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  takeLoanFounder(loanAmount, loanTerm);
                  setShowLoanModal(false);
                  setTradeLock(false);
                }}
                style={{ padding: '8px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Borrow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IPO Modal */}
      {showIPOModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: D.darkMode ? '#1a1a2e' : '#fff', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '14px' }}>File for IPO</div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>
                IPO Shares: {ipoShares.toLocaleString()}
              </label>
              <input
                type="range"
                min="10000"
                max={fm.sharesOutstanding / 2}
                value={ipoShares}
                onChange={(e) => setIpoShares(Math.floor(+e.target.value))}
                style={{ width: '100%' }}
              />
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
              Expected Proceeds: ${(ipoShares * ipoPrice).toLocaleString()}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => { setShowIPOModal(false); setTradeLock(false); }}
                style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  launchFounderIPO(ipoShares, ipoPrice);
                  setShowIPOModal(false);
                  setTradeLock(false);
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
