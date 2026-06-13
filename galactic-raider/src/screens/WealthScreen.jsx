import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';
import { LOAN_TIERS, SOVEREIGN_FUNDS, PLANETS_DATA, COMMODITIES } from '../constants';
import { getTheme } from '../theme';
import { getT } from '../i18n';

const CS = {
  card: { background:'#0D1B2E', borderRadius:16, padding:14, border:'1px solid #1A2744', marginBottom:10 },
  tab: (a) => ({ flex:1, padding:'9px 0', fontSize:11, fontWeight:700, border:'none', borderRadius:10, cursor:'pointer', background:a?'#059669':'#0D1B2E', color:a?'#fff':'#4B5563' }),
  label: { fontSize:10, color:'#4B5563', textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 },
};

const PctRow = ({onSelect,opts=['25%','50%','75%','100%']}) => (
  <div style={{display:'flex',gap:5,marginBottom:8}}>
    {opts.map((l,i)=>(
      <button key={l} onClick={()=>onSelect(i)} style={{flex:1,padding:'6px 0',background:'#060B14',border:'1px solid #1A2744',color:'#94A3B8',borderRadius:8,fontSize:10,fontWeight:700,cursor:'pointer'}}>{l}</button>
    ))}
  </div>
);

function FundItem({ fund, d, walletBalance, onDeposit, onWithdraw }) {
  const [amt, setAmt] = useState('');
  const fd = d.fundDeposits?.[fund.id]||{deposit:0,earned:0};
  const maxDeposit = walletBalance || 0;

  const setByPct = (idx) => {
    const pcts=[0.10,0.25,0.50,1.00];
    setAmt(String(Math.floor(maxDeposit*pcts[idx])));
  };

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
      <div style={{fontSize:9,color:'#4B5563',marginBottom:5}}>Trading Wallet: {fm(maxDeposit)} · 2% entry fee</div>
      <PctRow onSelect={setByPct} opts={['10%','25%','50%','Max']}/>
      <div style={{display:'flex',gap:8}}>
        <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="Deposit amount" style={{flex:1,background:'#060B14',border:'1px solid #1A2744',borderRadius:8,padding:'9px 12px',color:'#F8FAFC',fontSize:12,outline:'none'}}/>
        <button onClick={()=>{onDeposit(fund.id,amt);setAmt('');}} style={{background:'#059669',color:'#fff',border:'none',borderRadius:8,padding:'9px 14px',fontWeight:700,fontSize:12,cursor:'pointer'}}>In</button>
        {fd.deposit>0&&<button onClick={()=>onWithdraw(fund.id)} style={{background:'#DC2626',color:'#fff',border:'none',borderRadius:8,padding:'9px 14px',fontWeight:700,fontSize:12,cursor:'pointer'}}>Out</button>}
      </div>
      {parseFloat(amt)>0&&(
        <div style={{marginTop:8,background:'rgba(5,150,105,0.08)',border:'1px solid rgba(5,150,105,0.2)',borderRadius:8,padding:'6px 10px',display:'flex',justifyContent:'space-between'}}>
          <span style={{fontSize:10,color:'#6B7280'}}>Net after 2% fee</span>
          <span style={{fontSize:11,fontWeight:700,color:'#34D399',fontFamily:'monospace'}}>{fm(parseFloat(amt)*0.98)}</span>
        </div>
      )}
    </div>
  );
}

// ── PORTFOLIO TAB ─────────────────────────────────────────────
function PortfolioTab({ d }) {
  const totalWallets = (d.cashWallet||0)+(d.savingsWallet||0)+(d.tradingWallet||0)+(d.foundationBalance||0);
  const stockEntries = Object.entries(d.stockHoldings||{}).filter(([,n])=>n>0);
  const etfEntries = (d.etfs||[]).filter(e=>e.units>0);
  const fundEntries = Object.entries(d.fundDeposits||{}).filter(([,f])=>f.deposit>0);
  const bondEntries = d.bondHoldings||[];

  const stockVal = stockEntries.reduce((x,[t,n])=>{const co=d.companies?.find(c=>c.t===t);return x+(co?co.price*n:0);},0);
  const etfVal = etfEntries.reduce((x,e)=>x+e.price*e.units,0);
  const fundVal = fundEntries.reduce((x,[,f])=>x+(f.deposit||0),0);
  const bondVal = bondEntries.reduce((x,b)=>x+b.principal,0);

  const planetEntries = Object.entries(d.planetHoldings||{}).filter(([,n])=>n>0);
  const planetVal = planetEntries.reduce((x,[key,n])=>{
    const parts=key.split('_');const pName=parts[0];const ticker=parts.slice(1).join('_');
    const pd=PLANETS_DATA[pName];const ps=d.planetCompanies?.[pName];
    const co=ps?.cos?.find(c=>c.t===ticker);
    return x+(co&&pd?co.price*pd.rate*n:0);
  },0);

  const cryptoEntries = Object.entries(d.cryptoHoldings||{}).filter(([,qty])=>qty>0);
  const cryptoVal = cryptoEntries.reduce((x,[id,qty])=>{
    return x + qty * (d.cryptoPrices?.[id]||0);
  }, 0);

  const commEntries = Object.entries(d.commodityHoldings||{}).filter(([,qty])=>qty>0.0001);
  const commVal = commEntries.reduce((x,[id,qty])=>{
    const hist = d.commodityHist?.[id];
    const price = hist && hist.length>0 ? hist[hist.length-1] : (COMMODITIES.find(c=>c.id===id)?.ip||0);
    return x + qty * price;
  }, 0);

  const totalPortfolio = totalWallets + stockVal + etfVal + fundVal + planetVal + bondVal + cryptoVal + commVal;

  const SectionHeader = ({label,value,color='#F8FAFC'}) => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0 6px',borderBottom:'1px solid #1A2744',marginBottom:6}}>
      <div style={{fontSize:11,color:'#4B5563',textTransform:'uppercase',letterSpacing:1.5,fontWeight:700}}>{label}</div>
      <div style={{fontSize:13,fontWeight:800,color,fontFamily:'monospace'}}>{fm(value)}</div>
    </div>
  );

  return (
    <div>
      {/* Total */}
      <div style={{background:'linear-gradient(135deg,#0A2010,#061A0E)',borderRadius:16,padding:'16px 14px',border:'1px solid #16A34A',marginBottom:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'#4B5563',textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Total Portfolio</div>
        <div style={{fontSize:38,fontWeight:900,color:'#34D399',fontFamily:'monospace'}}>{fm(totalPortfolio)}</div>
        <div style={{display:'flex',justifyContent:'center',gap:12,marginTop:8}}>
          {[['Wallets',totalWallets,'#60A5FA'],['Stocks',stockVal+planetVal,'#A78BFA'],['ETFs',etfVal,'#06B6D4'],['Funds',fundVal,'#F472B6'],['Bonds',bondVal,'#FBBF24'],['Crypto',cryptoVal,'#F59E0B'],['Comms',commVal,'#B45309']].map(([l,v,c])=>v>0&&(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontSize:9,color:'#4B5563'}}>{l}</div>
              <div style={{fontSize:11,fontWeight:700,color:c,fontFamily:'monospace'}}>{fm(v)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wallets summary */}
      <div style={CS.card}>
        <SectionHeader label="Wallets" value={totalWallets} color="#60A5FA"/>
        {[['💵 Cash','cashWallet','#60A5FA'],['🏦 Savings','savingsWallet','#34D399'],['⚡ Trading','tradingWallet','#FBBF24'],['🛡️ Foundation','foundationBalance','#A78BFA']].map(([l,k,c])=>(d[k]||0)>0&&(
          <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(0,0,0,0.2)'}}>
            <span style={{fontSize:12,color:'#94A3B8'}}>{l}</span>
            <span style={{fontSize:12,fontWeight:700,color:c,fontFamily:'monospace'}}>{fm(d[k]||0)}</span>
          </div>
        ))}
      </div>

      {/* Earth Stocks */}
      {stockEntries.length>0&&(
        <div style={CS.card}>
          <SectionHeader label="Earth Stocks" value={stockVal} color="#A78BFA"/>
          {stockEntries.map(([ticker,n])=>{
            const co=d.companies?.find(c=>c.t===ticker);if(!co)return null;
            const val=co.price*n;
            const avgCost=d.avgCostBasis?.[ticker]||co.price;
            const pnl=(co.price-avgCost)/avgCost*100;
            return (
              <div key={ticker} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,0.2)'}}>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:'#F8FAFC'}}>{ticker}</div>
                  <div style={{fontSize:10,color:'#4B5563'}}>{n.toLocaleString()} shares · avg ${avgCost.toFixed(2)}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC',fontFamily:'monospace'}}>{fm(val)}</div>
                  <div style={{fontSize:10,fontWeight:700,color:pnl>=0?'#34D399':'#EF4444'}}>{pnl>=0?'+':''}{pnl.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Planet Stocks */}
      {planetEntries.length>0&&(
        <div style={CS.card}>
          <SectionHeader label="Planet Stocks" value={planetVal} color="#06B6D4"/>
          {planetEntries.map(([key,n])=>{
            const parts=key.split('_');const pName=parts[0];const ticker=parts.slice(1).join('_');
            const pd=PLANETS_DATA[pName];const ps=d.planetCompanies?.[pName];
            const co=ps?.cos?.find(c=>c.t===ticker);
            if(!co||!pd)return null;
            const val=co.price*pd.rate*n;
            const avgCost=d.planetAvgCost?.[key]||co.price;
            const pnl=(co.price-avgCost)/avgCost*100;
            return (
              <div key={key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,0.2)'}}>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:'#F8FAFC'}}>{ticker} <span style={{fontSize:10,color:'#4B5563'}}>· {pName}</span></div>
                  <div style={{fontSize:10,color:'#4B5563'}}>{n.toLocaleString()} shares · {pd.currency} {avgCost.toFixed(2)} avg</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC',fontFamily:'monospace'}}>{fm(val)}</div>
                  <div style={{fontSize:10,fontWeight:700,color:pnl>=0?'#34D399':'#EF4444'}}>{pnl>=0?'+':''}{pnl.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ETFs */}
      {etfEntries.length>0&&(
        <div style={CS.card}>
          <SectionHeader label="ETFs" value={etfVal} color="#06B6D4"/>
          {etfEntries.map(e=>{
            const val=e.price*e.units;
            const gain=e.units>0?(e.price-e.avgCost)/e.avgCost*100:0;
            return (
              <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,0.2)'}}>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:'#F8FAFC'}}>{e.id}</div>
                  <div style={{fontSize:10,color:'#4B5563'}}>{e.units.toLocaleString()} units · avg ${e.avgCost?.toFixed(2)}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC',fontFamily:'monospace'}}>{fm(val)}</div>
                  <div style={{fontSize:10,fontWeight:700,color:gain>=0?'#34D399':'#EF4444'}}>{gain>=0?'+':''}{gain.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bonds */}
      {bondEntries.length>0&&(
        <div style={CS.card}>
          <SectionHeader label="Active Bonds" value={bondVal} color="#FBBF24"/>
          {bondEntries.map((b,i)=>{
            const turnsLeft=b.purchaseTurn+b.maturity-((d.turn)||1);
            const proj=r2(b.principal*(1+(b.yield/100)*(b.maturity/365)));
            return (
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,0.2)'}}>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:'#F8FAFC'}}>{b.n}</div>
                  <div style={{fontSize:10,color:'#4B5563'}}>{b.yield}% yield · {Math.max(0,turnsLeft)} turns left</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#FBBF24',fontFamily:'monospace'}}>{fm(b.principal)}</div>
                  <div style={{fontSize:10,color:'#34D399'}}>→ {fm(proj)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sovereign Funds */}
      {fundEntries.length>0&&(
        <div style={CS.card}>
          <SectionHeader label="Sovereign Funds" value={fundVal} color="#F472B6"/>
          {fundEntries.map(([fid,f])=>{
            const fund=SOVEREIGN_FUNDS.find(x=>x.id===fid);
            return (
              <div key={fid} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,0.2)'}}>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:'#F8FAFC'}}>{fid}</div>
                  <div style={{fontSize:10,color:'#4B5563'}}>{fund?.rate}% APR · Earned {fm(f.earned||0)}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#F472B6',fontFamily:'monospace'}}>{fm(f.deposit)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Crypto */}
      {cryptoEntries.length>0&&(
        <div style={CS.card}>
          <SectionHeader label="Crypto" value={cryptoVal} color="#F59E0B"/>
          {cryptoEntries.map(([id,qty])=>{
            const price=d.cryptoPrices?.[id]||0;
            const val=qty*price;
            const avgCost=d.cryptoAvgCost?.[id]||price;
            const pnl=avgCost>0?(price-avgCost)/avgCost*100:0;
            return (
              <div key={id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,0.2)'}}>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:'#F8FAFC'}}>{id}</div>
                  <div style={{fontSize:10,color:'#4B5563'}}>{qty.toFixed(6)} coins · avg ${avgCost.toFixed(4)}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC',fontFamily:'monospace'}}>{fm(val)}</div>
                  <div style={{fontSize:10,fontWeight:700,color:pnl>=0?'#34D399':'#EF4444'}}>{pnl>=0?'+':''}{pnl.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Commodities */}
      {commEntries.length>0&&(
        <div style={CS.card}>
          <SectionHeader label="⛏️ Commodities" value={commVal} color="#B45309"/>
          {commEntries.map(([id,qty])=>{
            const com=COMMODITIES.find(c=>c.id===id);
            if(!com)return null;
            const hist=d.commodityHist?.[id];
            const price=hist&&hist.length>0?hist[hist.length-1]:com.ip;
            const val=qty*price;
            const avg=d.commodityAvgCost?.[id]||price;
            const pnl=avg>0?(price-avg)/avg*100:0;
            const fmtP=p=>p>=1000?(p/1000).toFixed(1)+'K':p>=1?p.toFixed(2):p.toFixed(4);
            return (
              <div key={id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,0.2)'}}>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:'#F8FAFC'}}>{com.ico} {com.n}</div>
                  <div style={{fontSize:10,color:'#4B5563'}}>{qty.toLocaleString(undefined,{maximumFractionDigits:4})} {com.unit} · avg ${fmtP(avg)}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#F8FAFC',fontFamily:'monospace'}}>{fm(val)}</div>
                  <div style={{fontSize:10,fontWeight:700,color:pnl>=0?'#34D399':'#EF4444'}}>{pnl>=0?'+':''}{pnl.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {stockEntries.length===0&&planetEntries.length===0&&etfEntries.length===0&&fundEntries.length===0&&bondEntries.length===0&&cryptoEntries.length===0&&commEntries.length===0&&(
        <div style={{...CS.card,textAlign:'center',padding:'32px 16px',color:'#4B5563'}}>
          <div style={{fontSize:36,marginBottom:10}}>📊</div>
          <div style={{fontSize:14,fontWeight:700,color:'#6B7280'}}>No positions yet</div>
          <div style={{fontSize:12,marginTop:6}}>Go to Markets to buy stocks, ETFs, and more.</div>
        </div>
      )}
    </div>
  );
}

// ── EARTH FX TAB ──────────────────────────────────────────────
const FX_PAIRS = [
  {pair:'EURUSD',base:'EUR',quote:'USD',flag:'🇪🇺',name:'Euro'},
  {pair:'GBPUSD',base:'GBP',quote:'USD',flag:'🇬🇧',name:'British Pound'},
  {pair:'JPYUSD',base:'JPY',quote:'USD',flag:'🇯🇵',name:'Japanese Yen'},
  {pair:'CHFUSD',base:'CHF',quote:'USD',flag:'🇨🇭',name:'Swiss Franc'},
  {pair:'CADUSD',base:'CAD',quote:'USD',flag:'🇨🇦',name:'Canadian Dollar'},
  {pair:'AUDUSD',base:'AUD',quote:'USD',flag:'🇦🇺',name:'Australian Dollar'},
  {pair:'CNYUSD',base:'CNY',quote:'USD',flag:'🇨🇳',name:'Chinese Yuan'},
  {pair:'MXNUSD',base:'MXN',quote:'USD',flag:'🇲🇽',name:'Mexican Peso'},
  {pair:'INRUSD',base:'INR',quote:'USD',flag:'🇮🇳',name:'Indian Rupee'},
  {pair:'BRLUSD',base:'BRL',quote:'USD',flag:'🇧🇷',name:'Brazilian Real'},
  {pair:'ZARUSD',base:'ZAR',quote:'USD',flag:'🇿🇦',name:'South African Rand'},
  {pair:'SGDUSD',base:'SGD',quote:'USD',flag:'🇸🇬',name:'Singapore Dollar'},
];

function EarthFXTab({ d, showMsg }) {
  const { openFxPosition, closeFxPosition } = useGame();
  const [selected, setSelected] = useState(null);
  const [dir, setDir] = useState('long');
  const [usdSize, setUsdSize] = useState('');

  const positions = d.fxPositions || [];
  const fxRates = d.fxRates || {};
  const fxHist = d.fxHist || {};

  const openPos = () => {
    const size = parseFloat(usdSize);
    if (!selected || !size) return showMsg('Select a pair and enter amount');
    const err = openFxPosition(selected, dir, size);
    if (err) showMsg('❌ ' + err);
    else { showMsg('✅ Opened ' + dir.toUpperCase() + ' ' + selected); setUsdSize(''); }
  };

  const totalOpenPnl = positions.reduce((x, pos) => {
    const cur = fxRates[pos.pair] || pos.entryRate;
    const priceMoveRatio = pos.dir === 'long'
      ? (cur - pos.entryRate) / pos.entryRate
      : (pos.entryRate - cur) / pos.entryRate;
    return x + pos.size * priceMoveRatio;
  }, 0);

  return (
    <div>
      <div style={{background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:12,padding:'10px 14px',marginBottom:12,fontSize:11,color:'#93C5FD',lineHeight:1.5}}>
        🌐 Earth FX — Trade major world currency pairs. Go LONG (bet rate rises) or SHORT (bet rate falls) using USD from your Trading Wallet.
      </div>

      {positions.length > 0 && (
        <div style={{background:'#0D1B2E',borderRadius:14,padding:12,border:'1px solid #1A2744',marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div style={{fontSize:11,color:'#4B5563',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Open Positions</div>
            <div style={{fontSize:13,fontWeight:800,color:totalOpenPnl>=0?'#34D399':'#EF4444',fontFamily:'monospace'}}>{totalOpenPnl>=0?'+':''}{fm(totalOpenPnl)} P&L</div>
          </div>
          {positions.map(pos => {
            const cur = fxRates[pos.pair] || pos.entryRate;
            const priceMoveRatio = pos.dir === 'long'
              ? (cur - pos.entryRate) / pos.entryRate
              : (pos.entryRate - cur) / pos.entryRate;
            const pnl = pos.size * priceMoveRatio;
            const pnlPct = priceMoveRatio * 100;
            const pairInfo = FX_PAIRS.find(p => p.pair === pos.pair);
            return (
              <div key={pos.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'1px solid rgba(0,0,0,0.2)'}}>
                <div style={{fontSize:18}}>{pairInfo?.flag || '🌐'}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <span style={{fontSize:12,fontWeight:800,color:'#F8FAFC'}}>{pos.pair}</span>
                    <span style={{fontSize:9,fontWeight:700,color:pos.dir==='long'?'#34D399':'#EF4444',background:pos.dir==='long'?'rgba(52,211,153,0.12)':'rgba(239,68,68,0.12)',padding:'1px 6px',borderRadius:6}}>{pos.dir.toUpperCase()}</span>
                  </div>
                  <div style={{fontSize:9,color:'#4B5563'}}>Entry: {pos.entryRate.toFixed(6)} · Now: {cur.toFixed(6)} · Size: {fm(pos.size)}</div>
                </div>
                <div style={{textAlign:'right',marginRight:8}}>
                  <div style={{fontSize:12,fontWeight:800,color:pnl>=0?'#34D399':'#EF4444',fontFamily:'monospace'}}>{pnl>=0?'+':''}{fm(pnl)}</div>
                  <div style={{fontSize:9,color:pnl>=0?'#34D399':'#EF4444'}}>{pnlPct>=0?'+':''}{pnlPct.toFixed(2)}%</div>
                </div>
                <button onClick={()=>{ closeFxPosition(pos.id); showMsg('Position closed'); }} style={{background:'#7F1D1D',color:'#FCA5A5',border:'1px solid #DC2626',borderRadius:8,padding:'6px 10px',fontSize:11,fontWeight:700,cursor:'pointer'}}>✕</button>
              </div>
            );
          })}
          {d.fxPnlRealized !== 0 && (
            <div style={{fontSize:10,color:'#6B7280',marginTop:6}}>Realized P&L: <span style={{color:d.fxPnlRealized>=0?'#34D399':'#EF4444',fontWeight:700}}>{d.fxPnlRealized>=0?'+':''}{fm(d.fxPnlRealized)}</span></div>
          )}
        </div>
      )}

      <div style={{background:'#0D1B2E',borderRadius:14,padding:12,border:'1px solid #1A2744',marginBottom:12}}>
        <div style={{fontSize:11,color:'#4B5563',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>New Position</div>
        <div style={{display:'flex',gap:6,marginBottom:10}}>
          <button onClick={()=>setDir('long')} style={{flex:1,padding:'10px 0',background:dir==='long'?'#059669':'#060B14',border:'1px solid '+(dir==='long'?'#059669':'#1A2744'),color:dir==='long'?'#fff':'#6B7280',borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer'}}>📈 LONG</button>
          <button onClick={()=>setDir('short')} style={{flex:1,padding:'10px 0',background:dir==='short'?'#DC2626':'#060B14',border:'1px solid '+(dir==='short'?'#DC2626':'#1A2744'),color:dir==='short'?'#fff':'#6B7280',borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer'}}>📉 SHORT</button>
        </div>
        <div style={{display:'flex',gap:5,marginBottom:10}}>
          {[100,500,1000,5000].map(v=>(
            <button key={v} onClick={()=>setUsdSize(String(v))} style={{flex:1,padding:'7px 0',background:usdSize==v?'#1D4ED8':'#060B14',border:'1px solid '+(usdSize==v?'#3B82F6':'#1A2744'),color:usdSize==v?'#fff':'#6B7280',borderRadius:9,fontSize:10,fontWeight:700,cursor:'pointer'}}>${v>=1000?(v/1000)+'K':v}</button>
          ))}
        </div>
        <input type="number" value={usdSize} onChange={e=>setUsdSize(e.target.value)} placeholder="USD size (min $100)" style={{width:'100%',background:'#060B14',border:'1px solid #1A2744',borderRadius:8,padding:'9px 12px',color:'#F8FAFC',fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:10,fontFamily:'monospace'}}/>
        <div style={{fontSize:9,color:'#4B5563',marginBottom:8}}>Trading Wallet: {fm(d.tradingWallet||0)} · Select pair below then click Open</div>
        {selected && (
          <button onClick={openPos} style={{width:'100%',padding:'12px 0',background:dir==='long'?'#059669':'#DC2626',color:'#fff',border:'none',borderRadius:12,fontWeight:800,fontSize:14,cursor:'pointer',marginBottom:10}}>
            Open {dir.toUpperCase()} {selected} — {usdSize?fm(parseFloat(usdSize)||0):'$0'}
          </button>
        )}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {FX_PAIRS.map(({pair,base,flag,name}) => {
          const rate = fxRates[pair] || 0;
          const hist = fxHist[pair] || [rate];
          const prev = hist.length > 1 ? hist[hist.length-2] : rate;
          const ch = prev > 0 ? (rate - prev) / prev * 100 : 0;
          const isSelected = selected === pair;
          return (
            <div key={pair} onClick={()=>setSelected(isSelected ? null : pair)}
              style={{background:isSelected?'rgba(59,130,246,0.12)':'#0D1B2E',borderRadius:12,padding:'12px 14px',border:'1px solid '+(isSelected?'#3B82F6':'#1A2744'),cursor:'pointer',transition:'all 0.15s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:22}}>{flag}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:'#F8FAFC'}}>{pair}</div>
                    <div style={{fontSize:10,color:'#4B5563'}}>{name}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:14,fontWeight:800,color:'#F8FAFC',fontFamily:'monospace'}}>{rate.toFixed(6)}</div>
                  <div style={{fontSize:11,fontWeight:700,color:ch>=0?'#34D399':'#EF4444'}}>{ch>=0?'+':''}{ch.toFixed(3)}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PLANET FX TAB ─────────────────────────────────────────────
function PlanetFXTab({ d, showMsg }) {
  const { exchangeToLocal, exchangeToUSD } = useGame();
  const [buyModal, setBuyModal] = useState(null); // {planet, pd}
  const [sellModal, setSellModal] = useState(null); // {planet, pd}
  const [buyAmt, setBuyAmt] = useState('');
  const [sellAmt, setSellAmt] = useState('');

  const PLANET_FX = [
    {planet:'Mars',    currency:'MCR', rate:.85},
    {planet:'Venus',   currency:'VCR', rate:.75},
    {planet:'Jupiter', currency:'JCR', rate:.90},
    {planet:'Saturn',  currency:'STC', rate:.70},
    {planet:'Mercury', currency:'MRC', rate:.60},
    {planet:'Uranus',  currency:'URU', rate:.55},
    {planet:'Neptune', currency:'NPT', rate:.50},
  ];

  const handleBuy = () => {
    const amt = parseFloat(buyAmt);
    if (!amt || amt <= 0) return showMsg('Enter a USD amount');
    const err = exchangeToLocal(buyModal.planet, amt);
    if (err) showMsg('❌ '+err);
    else { showMsg('✅ Exchanged $'+amt.toFixed(2)+' → '+buyModal.pd.currency); setBuyModal(null); setBuyAmt(''); }
  };

  const handleSell = () => {
    const amt = parseFloat(sellAmt);
    if (!amt || amt <= 0) return showMsg('Enter a '+sellModal.pd.currency+' amount');
    const err = exchangeToUSD(sellModal.planet, amt);
    if (err) showMsg('❌ '+err);
    else { showMsg('✅ Exchanged '+sellModal.pd.currency+' '+amt.toFixed(4)+' → USD'); setSellModal(null); setSellAmt(''); }
  };

  return (
    <div>
      <div style={{background:'rgba(6,182,212,0.08)',border:'1px solid rgba(6,182,212,0.2)',borderRadius:12,padding:'10px 14px',marginBottom:12,fontSize:11,color:'#67E8F9',lineHeight:1.5}}>
        🌐 Planet FX — Exchange USD for planet currencies. Holding local currency before buying stocks gives a 5% fee discount. Rates fluctuate each turn.
      </div>
      {PLANET_FX.map(({planet, currency, rate}) => {
        const pd = PLANETS_DATA[planet];
        if (!pd) return null;
        const isUnlocked = d.planetUnlocks?.[planet] !== false;
        const pState = d.planetCompanies?.[planet];
        const fxRate = pState?.fxRate || rate;
        const balance = d.planetWallets?.[planet] || 0;
        const usdEquiv = Math.round(balance * fxRate * 100) / 100;
        const pc = pd.color || '#3B82F6';
        return (
          <div key={planet} style={{background:'#0D1B2E',borderRadius:14,padding:14,border:'1px solid #1A2744',marginBottom:8,position:'relative',overflow:'hidden'}}>
            {!isUnlocked && (
              <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',borderRadius:14,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:2}}>
                <div style={{fontSize:24,marginBottom:4}}>🔒</div>
                <div style={{fontSize:11,color:'#94A3B8',fontWeight:700}}>Unlock {planet} first</div>
              </div>
            )}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:24}}>{pd.ico}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:'#F8FAFC'}}>{planet}</div>
                  <div style={{fontSize:10,color:'#4B5563'}}>{currency}</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14,fontWeight:800,color:pc,fontFamily:'monospace'}}>1 USD = {(1/fxRate).toFixed(4)} {currency}</div>
                <div style={{fontSize:10,color:'#4B5563'}}>Rate: {fxRate.toFixed(4)}</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10}}>
              {[['Your Balance',balance.toFixed(4)+' '+currency,'#F8FAFC'],['USD Equiv','$'+usdEquiv.toFixed(2),'#34D399']].map(([l,v,c])=>(
                <div key={l} style={{background:'#060B14',borderRadius:8,padding:'7px 0',textAlign:'center'}}>
                  <div style={{fontSize:8,color:'#4B5563',textTransform:'uppercase'}}>{l}</div>
                  <div style={{fontSize:12,fontWeight:700,color:c,fontFamily:'monospace',marginTop:2}}>{v}</div>
                </div>
              ))}
            </div>
            {isUnlocked && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <button onClick={()=>{setBuyModal({planet,pd});setBuyAmt('');}} style={{padding:'10px 0',background:'#059669',color:'#fff',border:'none',borderRadius:10,fontWeight:700,fontSize:12,cursor:'pointer'}}>Buy {currency}</button>
                <button onClick={()=>{setSellModal({planet,pd});setSellAmt('');}} disabled={balance<=0} style={{padding:'10px 0',background:balance>0?'#DC2626':'rgba(0,0,0,0.3)',color:balance>0?'#fff':'#374151',border:'none',borderRadius:10,fontWeight:700,fontSize:12,cursor:balance>0?'pointer':'default'}}>Sell {currency}</button>
              </div>
            )}
          </div>
        );
      })}

      {buyModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'flex-end',zIndex:400}}>
          <div style={{background:'#0D1B2E',borderRadius:'22px 22px 0 0',padding:22,width:'100%',border:'1px solid rgba(255,255,255,0.12)'}}>
            <div style={{width:40,height:4,background:'rgba(255,255,255,0.15)',borderRadius:2,margin:'0 auto 16px'}}/>
            <div style={{fontSize:16,fontWeight:800,color:'#F8FAFC',marginBottom:4}}>{buyModal.pd.ico} Buy {buyModal.pd.currency}</div>
            <div style={{fontSize:12,color:'#4B5563',marginBottom:12}}>
              Rate: 1 USD = {(1/((d.planetCompanies?.[buyModal.planet]?.fxRate)||buyModal.pd.rate)).toFixed(4)} {buyModal.pd.currency} · 2% fee · Wallet: {fm(d.tradingWallet||0)}
            </div>
            {parseFloat(buyAmt)>0&&(
              <div style={{background:'rgba(5,150,105,0.08)',border:'1px solid rgba(5,150,105,0.2)',borderRadius:8,padding:'8px 12px',marginBottom:10,fontSize:12,color:'#34D399'}}>
                You get ≈ {(parseFloat(buyAmt)/(d.planetCompanies?.[buyModal.planet]?.fxRate||buyModal.pd.rate)*0.98).toFixed(4)} {buyModal.pd.currency} after fee
              </div>
            )}
            <input type="number" value={buyAmt} onChange={e=>setBuyAmt(e.target.value)} placeholder="USD to exchange" style={{width:'100%',background:'#060B14',border:'1px solid #1A2744',borderRadius:12,padding:'14px 16px',color:'#F8FAFC',fontSize:18,outline:'none',boxSizing:'border-box',marginBottom:10,fontFamily:'monospace'}}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:10}}>
              <button onClick={()=>setBuyModal(null)} style={{padding:'14px 0',background:'#060B14',border:'1px solid #1A2744',color:'#6B7280',borderRadius:14,fontWeight:700,fontSize:14,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleBuy} style={{padding:'14px 0',background:'#059669',color:'#fff',border:'none',borderRadius:14,fontWeight:800,fontSize:16,cursor:'pointer'}}>Buy {buyModal.pd.currency}</button>
            </div>
          </div>
        </div>
      )}

      {sellModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'flex-end',zIndex:400}}>
          <div style={{background:'#0D1B2E',borderRadius:'22px 22px 0 0',padding:22,width:'100%',border:'1px solid rgba(255,255,255,0.12)'}}>
            <div style={{width:40,height:4,background:'rgba(255,255,255,0.15)',borderRadius:2,margin:'0 auto 16px'}}/>
            <div style={{fontSize:16,fontWeight:800,color:'#F8FAFC',marginBottom:4}}>{sellModal.pd.ico} Sell {sellModal.pd.currency}</div>
            <div style={{fontSize:12,color:'#4B5563',marginBottom:12}}>
              Balance: {(d.planetWallets?.[sellModal.planet]||0).toFixed(4)} {sellModal.pd.currency} · 2% fee
            </div>
            {parseFloat(sellAmt)>0&&(
              <div style={{background:'rgba(220,38,38,0.08)',border:'1px solid rgba(220,38,38,0.2)',borderRadius:8,padding:'8px 12px',marginBottom:10,fontSize:12,color:'#FCA5A5'}}>
                You get ≈ ${(parseFloat(sellAmt)*(d.planetCompanies?.[sellModal.planet]?.fxRate||sellModal.pd.rate)*0.98).toFixed(2)} USD after fee
              </div>
            )}
            <input type="number" value={sellAmt} onChange={e=>setSellAmt(e.target.value)} placeholder={sellModal.pd.currency+' to sell'} style={{width:'100%',background:'#060B14',border:'1px solid #1A2744',borderRadius:12,padding:'14px 16px',color:'#F8FAFC',fontSize:18,outline:'none',boxSizing:'border-box',marginBottom:10,fontFamily:'monospace'}}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:10}}>
              <button onClick={()=>setSellModal(null)} style={{padding:'14px 0',background:'#060B14',border:'1px solid #1A2744',color:'#6B7280',borderRadius:14,fontWeight:700,fontSize:14,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSell} style={{padding:'14px 0',background:'#DC2626',color:'#fff',border:'none',borderRadius:14,fontWeight:800,fontSize:16,cursor:'pointer'}}>Sell {sellModal.pd.currency}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function r2(n){return Math.round(n*100)/100;}

export default function WealthScreen() {
  const { D, transfer, transferByAmount, openFoundation, takeLoan, repayLoan, depositFund, withdrawFund, exchangeToLocal, exchangeToUSD } = useGame();
  const d = D;
  const TH = getTheme(d.darkMode);
  const t = getT(d.language);
  const [tab, setTab] = useState('portfolio');
  const [repayAmt, setRepayAmt] = useState('');
  const [transferAmt, setTransferAmt] = useState('');
  const [activePct, setActivePct] = useState(null);
  const [msg, setMsg] = useState('');
  const showMsg = m=>{setMsg(m);setTimeout(()=>setMsg(''),3000);};

  const doTransfer = (dir) => {
    const amount = parseFloat(transferAmt);
    if (!amount || amount <= 0) return showMsg('Enter an amount');
    transferByAmount(dir, amount);
    const labels={C2T:'Cash→Trading',T2C:'Trading→Cash',C2S:'Cash→Savings',S2C:'Savings→Cash',T2S:'Trading→Savings',S2T:'Savings→Trading'};
    showMsg(labels[dir]+': '+fm(amount));
  };

  const handlePctSelect = (pct, walletKey) => {
    const bal = d[walletKey] || 0;
    const amt = Math.floor(bal * pct / 100);
    setTransferAmt(String(amt));
    setActivePct(pct);
  };

  const tabs=[{id:'portfolio',l:'📊 '+t('tab_portfolio')},{id:'wallets',l:'💰 '+t('tab_wallets')},{id:'loans',l:'🏦 '+t('tab_loans')},{id:'funds',l:t('tab_funds')},{id:'earthfx',l:'🌐 FX'},{id:'planetfx',l:'🪐 PlanetFX'},{id:'log',l:t('tab_log')}];

  return (
    <div style={{padding:'14px 14px 80px',background:TH.bg,minHeight:'100%'}}>
      <div style={{fontSize:18,fontWeight:900,color:TH.text,marginBottom:12}}>💰 Wealth Manager</div>
      <div style={{display:'flex',gap:4,marginBottom:14,overflowX:'auto',paddingBottom:4}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{...CS.tab(tab===t.id),flexShrink:0,padding:'9px 10px'}}>{t.l}</button>
        ))}
      </div>

      {msg&&<div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#93C5FD',marginBottom:10}}>{msg}</div>}

      {/* PORTFOLIO */}
      {tab==='portfolio'&&<PortfolioTab d={d}/>}

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
          <div style={CS.label}>Transfer Money</div>
          {/* % preset buttons */}
          <div style={{fontSize:10,color:'#4B5563',marginBottom:5}}>Quick % (from source wallet)</div>
          <div style={{display:'flex',gap:5,marginBottom:8}}>
            {[10,25,50,75].map(p=>(
              <button key={p} onClick={()=>handlePctSelect(p,'tradingWallet')} style={{flex:1,padding:'7px 0',background:activePct===p?'#1D4ED8':'#060B14',border:'1px solid '+(activePct===p?'#3B82F6':'#1A2744'),color:activePct===p?'#fff':'#6B7280',borderRadius:9,fontSize:11,fontWeight:700,cursor:'pointer'}}>
                {p}%
              </button>
            ))}
          </div>
          {/* Custom amount input */}
          <div style={{fontSize:10,color:'#4B5563',marginBottom:5}}>Or enter exact amount</div>
          <input
            type="number"
            value={transferAmt}
            onChange={e=>{setTransferAmt(e.target.value);setActivePct(null);}}
            placeholder="$ Amount"
            style={{width:'100%',background:'#060B14',border:'1px solid #1A2744',borderRadius:8,padding:'9px 12px',color:'#F8FAFC',fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:12,fontFamily:'monospace'}}
          />
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {[['C2T','💵 Cash → ⚡ Trading'],['T2C','⚡ Trading → 💵 Cash'],['C2S','💵 Cash → 🏦 Savings'],['S2C','🏦 Savings → 💵 Cash'],['T2S','⚡ Trading → 🏦 Savings'],['S2T','🏦 Savings → ⚡ Trading']].map(([dir,lbl])=>(
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
              <div style={{fontSize:10,color:'#4B5563',marginTop:2}}>Bankruptcy shield · 3% APR · $500M one-time fee (Trading Wallet)</div>
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
              Open Foundation — $500M
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
            <div style={{fontSize:9,color:'#4B5563',marginBottom:5}}>Quick repay</div>
            <PctRow
              onSelect={(i)=>{
                const pcts=[0.25,0.50,0.75,1.00];
                setRepayAmt(String(Math.floor(d.activeLoan.outstanding*pcts[i])));
              }}
              opts={['25%','50%','75%','All']}
            />
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <input value={repayAmt} onChange={e=>setRepayAmt(e.target.value)} placeholder="Amount to repay" style={{flex:1,background:'#060B14',border:'1px solid #1A2744',borderRadius:8,padding:'9px 12px',color:'#F8FAFC',fontSize:12,outline:'none'}}/>
              <button onClick={()=>{const err=repayLoan(parseFloat(repayAmt)||0);if(err)showMsg('❌ '+err);else{showMsg('✅ Repaid');setRepayAmt('');}}} style={{background:'#DC2626',color:'#fff',border:'none',borderRadius:8,padding:'9px 14px',fontWeight:700,fontSize:12,cursor:'pointer'}}>Repay</button>
            </div>
            <button onClick={()=>{
              const err=repayLoan(d.activeLoan.outstanding);
              if(err) showMsg('❌ '+err); else showMsg('✅ Loan fully repaid!');
            }} style={{width:'100%',background:'#7F1D1D',color:'#FCA5A5',border:'1px solid #DC2626',borderRadius:10,padding:'10px 0',fontWeight:700,fontSize:13,cursor:'pointer'}}>
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
          {[['Total Debt',fm(d.totalDebt||0),'#EF4444'],['Interest Paid',fm(d.totalInterestPaid||0),'#FBBF24'],['Tax Paid',fm(d.stats?.totalTaxPaid||0),'#F59E0B'],['Loans History',(d.loanHistory||[]).length+' loans','#9CA3AF']].map(([l,v,c])=>(
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
          <FundItem key={fund.id} fund={fund} d={d} walletBalance={d.tradingWallet}
            onDeposit={(id,amtStr)=>{const a=parseFloat(amtStr);if(!a||a<=0)return showMsg('Invalid');const e=depositFund(id,a);if(e)showMsg(e);else showMsg('Deposited '+fm(a));}}
            onWithdraw={(id)=>{withdrawFund(id);showMsg('Withdrawn');}}
          />
        ))}
      </>}

      {/* EARTH FX */}
      {tab==='earthfx'&&<EarthFXTab d={d} showMsg={showMsg}/>}

      {/* PLANET FX */}
      {tab==='planetfx'&&<PlanetFXTab d={d} showMsg={showMsg}/>}

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
