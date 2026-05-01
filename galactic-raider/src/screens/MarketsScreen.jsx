import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';

const RATINGS_ORDER = { 'STRONG BUY':0, 'BUY':1, 'HOLD':2, 'SELL':3 };
const getConsensus = c => { const cnt = {}; c.analysts.forEach(a => cnt[a.rating] = (cnt[a.rating]||0)+1); return Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0]; };
const getAvgTarget = c => Math.round(c.analysts.reduce((x,a) => x+a.target, 0) / c.analysts.length);

const RatingBadge = ({ r }) => {
  const cols = { 'STRONG BUY':{bg:'#14532D',c:'#86EFAC'}, 'BUY':{bg:'#166534',c:'#BBF7D0'}, 'HOLD':{bg:'#92400E',c:'#FDE68A'}, 'SELL':{bg:'#7F1D1D',c:'#FCA5A5'}, 'SPECULATIVE BUY':{bg:'#312E81',c:'#A5B4FC'} };
  const col = cols[r] || {bg:'#374151',c:'#D1D5DB'};
  return <span style={{ background:col.bg, color:col.c, padding:'2px 8px', borderRadius:12, fontSize:10, fontWeight:700, whiteSpace:'nowrap' }}>{r}</span>;
};

const MiniChart = ({ hist, w=68, h=26 }) => {
  if (!hist || hist.length < 2) return null;
  const mn = Math.min(...hist)*0.99, mx = Math.max(...hist)*1.01, rng = mx-mn || 1;
  const pts = hist.map((v,i) => `${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(' ');
  const isUp = hist[hist.length-1] >= hist[0];
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={isUp ? C.green : C.red} strokeWidth="1.8" strokeLinejoin="round"/></svg>;
};

export default function MarketsScreen() {
  const { D, buyStock, sellStock } = useGame();
  const d = D;
  const [tab, setTab] = useState('market');
  const [sort, setSort] = useState('analyst');
  const [selTicker, setSelTicker] = useState(null);
  const [trMode, setTrMode] = useState(null); // {ticker, mode}
  const [trQty, setTrQty] = useState(null);
  const [toast, setToast] = useState(null);
  const [newsTab, setNewsTab] = useState('all');

  const showToast = (msg, g=true) => { setToast({msg,g}); setTimeout(()=>setToast(null),2800); };

  const SH = d.stockHoldings || {};
  const stockVal = Object.entries(SH).reduce((x,[t,n])=>{ const co=d.companies?.find(c=>c.t===t); return x+(co?co.price*n:0); },0);
  const nw = (d.cashWallet||0)+(d.savingsWallet||0)+(d.tradingWallet||0)+stockVal;

  let displayed = [...(d.companies||[])];
  if (sort==='analyst') displayed.sort((a,b)=>(RATINGS_ORDER[getConsensus(a)]||2)-(RATINGS_ORDER[getConsensus(b)]||2));
  else if (sort==='gain') displayed.sort((a,b)=>b.ch-a.ch);
  else if (sort==='loss') displayed.sort((a,b)=>a.ch-b.ch);
  else if (sort==='div') displayed.sort((a,b)=>b.div-a.div);
  else if (sort==='price_hi') displayed.sort((a,b)=>b.price-a.price);

  const selectedCo = selTicker ? (d.companies||[]).find(c=>c.t===selTicker) : null;

  const doTrade = () => {
    if (!trMode || !trQty) return;
    const err = trMode.mode==='buy' ? buyStock(trMode.ticker, trQty) : sellStock(trMode.ticker, trQty);
    if (err) showToast(err, false);
    else { showToast((trMode.mode==='buy'?'Bought ':'Sold ')+trQty.toLocaleString()+' '+trMode.ticker); setTrMode(null); setTrQty(null); }
  };

  const tabs = [{id:'market',l:'Markets'},{id:'co',l:'Company'},{id:'portfolio',l:'Portfolio'},{id:'news',l:'News'}];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg,#0F172A 0%,#1E293B 100%)', padding:'14px 16px 0', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
          <div>
            <div style={{ fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:1.5 }}>Earth Markets · Turn {d.turn}</div>
            <div style={{ fontSize:20, fontWeight:700, marginTop:2 }}>Capital Exchange</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:18, fontWeight:700, color:C.green, fontFamily:'monospace' }}>{fm(nw)}</div>
            <div style={{ fontSize:10, color:C.muted }}>Trading: {fm(d.tradingWallet||0)}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:0 }}>
          {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:'10px 4px', border:'none', borderBottom:'2px solid '+(tab===t.id?C.green:'transparent'), background:'transparent', color:tab===t.id?C.text:C.muted, fontWeight:600, fontSize:12, cursor:'pointer' }}>{t.l}</button>)}
        </div>
      </div>

      <div style={{ padding:14, display:'flex', flexDirection:'column', gap:10, paddingBottom:80 }}>
        {/* MARKET TAB */}
        {tab==='market' && <>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {[['analyst','★ Rating'],['gain','▲ Gainers'],['loss','▼ Losers'],['div','Dividend'],['price_hi','Price ↓']].map(([v,l])=>(
              <button key={v} onClick={()=>setSort(v)} style={{ padding:'5px 10px', borderRadius:20, border:'1px solid '+(sort===v?C.green:C.border), background:sort===v?C.greenBg:C.card, color:sort===v?C.greenText:C.muted, fontWeight:600, fontSize:10, cursor:'pointer' }}>{l}</button>
            ))}
          </div>
          <div style={{ background:C.card, borderRadius:12, border:'1px solid '+C.border, overflow:'hidden' }}>
            {displayed.map((c,i) => {
              const consensus = getConsensus(c);
              const avgT = getAvgTarget(c);
              const upside = ((avgT/c.price-1)*100).toFixed(1);
              const held = SH[c.t]||0;
              return (
                <div key={c.t} onClick={()=>{setSelTicker(c.t);setTab('co');}} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderBottom:i<displayed.length-1?'1px solid rgba(255,255,255,.05)':'none', cursor:'pointer' }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:800, color:C.greenText, border:'1px solid '+C.greenBg, flexShrink:0 }}>{c.t}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2, flexWrap:'wrap' }}>
                      <span style={{ fontSize:12, fontWeight:600 }}>{c.n}</span>
                      <RatingBadge r={consensus}/>
                    </div>
                    <div style={{ fontSize:10, color:C.muted }}>{c.s} · {c.div}% div · Tgt {fm(avgT)} ({upside}%){held>0?' · '+held.toLocaleString()+' held':''}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                    <MiniChart hist={c.hist}/>
                    <div style={{ textAlign:'right', minWidth:65 }}>
                      <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace' }}>{fm(c.price)}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:c.ch>=0?C.green:C.red, fontFamily:'monospace' }}>{c.ch>=0?'+':''}{(c.ch*100).toFixed(2)}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>}

        {/* COMPANY TAB */}
        {tab==='co' && (() => {
          const c = selectedCo;
          if (!c) return <div style={{ padding:40, textAlign:'center', color:C.muted }}>← Select a company from Markets</div>;
          const held = SH[c.t]||0;
          const avgC = d.avgCostBasis?.[c.t]||c.price;
          const pl = held ? (c.price-avgC)*held : 0;
          const consensus = getConsensus(c);
          const avgT = getAvgTarget(c);
          const upside = (avgT/c.price-1)*100;
          const ownership = d.companyOwnership?.[c.t]||0;
          return (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ background:C.card, borderRadius:14, padding:16, border:'1px solid '+C.border }}>
                <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>{c.s} · {c.hq} · Est. {c.yr}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div><div style={{ fontSize:20, fontWeight:700, marginBottom:2 }}>{c.n}</div><div style={{ fontSize:11, color:C.muted }}>{c.t} · {((c.emp||0)/1000).toFixed(0)}K staff</div></div>
                  <div style={{ textAlign:'right' }}><div style={{ fontSize:26, fontWeight:800, color:C.green, fontFamily:'monospace' }}>{fm(c.price)}</div><div style={{ fontSize:12, color:c.ch>=0?C.green:C.red }}>{c.ch>=0?'▲':'▼'} {(Math.abs(c.ch)*100).toFixed(2)}%</div></div>
                </div>
                {c.hist && c.hist.length>2 && <div style={{ marginBottom:10 }}><MiniChart hist={c.hist} w={370} h={36}/></div>}
                <div style={{ display:'flex', gap:6 }}>
                  {[['P/E',c.pe?.toFixed(1)+'×'],['Div',c.div+'%'],['Beta',c.b+'×'],['Own',ownership.toFixed(2)+'%']].map(([k,v])=>(
                    <div key={k} style={{ flex:1, background:C.bg, borderRadius:7, padding:'6px 4px', textAlign:'center' }}>
                      <div style={{ fontSize:8, color:C.muted, marginBottom:1 }}>{k}</div>
                      <div style={{ fontSize:11, fontWeight:700, fontFamily:'monospace' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background:`${consensus==='STRONG BUY'?'#14532D':consensus==='BUY'?'#166534':consensus==='HOLD'?'#78350F':'#7F1D1D'}`, borderRadius:12, padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.6)', textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>Analyst Consensus</div>
                  <div style={{ fontSize:20, fontWeight:800, color:'#fff' }}>{consensus}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.6)', marginBottom:2 }}>Avg Target</div>
                  <div style={{ fontSize:20, fontWeight:800, color:'#fff', fontFamily:'monospace' }}>{fm(avgT)}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.65)' }}>{upside>=0?'▲':'▼'} {Math.abs(upside).toFixed(1)}%</div>
                </div>
              </div>

              <div style={{ background:C.card, borderRadius:12, padding:13, border:'1px solid '+C.border }}>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>📖 Company Story</div>
                <div style={{ fontSize:12, color:C.dim, lineHeight:1.7, marginBottom:10 }}>{c.origin}</div>
                <div style={{ background:C.bg, borderRadius:8, padding:'9px 11px', fontSize:11, color:C.dim, lineHeight:1.6 }}><span style={{ color:C.muted, fontWeight:600 }}>Ops: </span>{c.ops}</div>
              </div>

              <div style={{ background:C.card, borderRadius:12, padding:13, border:'1px solid '+C.border }}>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Analyst Opinions</div>
                {(c.analysts||[]).map((a,i)=>(
                  <div key={i} style={{ padding:'10px 0', borderBottom:i<c.analysts.length-1?'1px solid rgba(255,255,255,.06)':'none' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:12, fontWeight:700 }}>{a.firm}</span><RatingBadge r={a.rating}/></div>
                      <span style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:a.target>c.price?C.green:C.red }}>Tgt {fm(a.target)}</span>
                    </div>
                    <div style={{ fontSize:11, color:C.dim, lineHeight:1.5 }}>{a.note}</div>
                  </div>
                ))}
              </div>

              {held > 0 && (
                <div style={{ background:C.bg, borderRadius:12, padding:12, border:'1px solid '+C.greenBg }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.green, marginBottom:8 }}>💼 Your Position</div>
                  <div style={{ display:'flex', gap:6 }}>
                    {[['Shares',held.toLocaleString()],['Value',fm(c.price*held)],['Avg',fm(avgC)],['P&L',(pl>=0?'+':'')+fm(pl)]].map(([k,v])=>(
                      <div key={k} style={{ flex:1, background:C.card, borderRadius:7, padding:'7px 6px', textAlign:'center' }}>
                        <div style={{ fontSize:8, color:C.muted, marginBottom:1 }}>{k}</div>
                        <div style={{ fontSize:11, fontWeight:700, color:k==='P&L'?(pl>=0?C.green:C.red):C.text, fontFamily:'monospace' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>{setTrMode({ticker:c.t,mode:'buy'});setTrQty(null);}} style={{ flex:1, background:C.green, color:'#fff', border:'none', borderRadius:10, padding:13, fontWeight:800, fontSize:13, cursor:'pointer' }}>📈 Buy</button>
                <button onClick={()=>{setTrMode({ticker:c.t,mode:'sell'});setTrQty(null);}} disabled={held<1} style={{ flex:1, background:held<1?C.card:C.redBg, color:held<1?C.muted:C.redText, border:'1px solid '+(held<1?C.border:C.red), borderRadius:10, padding:13, fontWeight:800, fontSize:13, cursor:held<1?'not-allowed':'pointer' }}>📉 Sell{held>0?' ('+held.toLocaleString()+')':''}</button>
              </div>
            </div>
          );
        })()}

        {/* PORTFOLIO TAB */}
        {tab==='portfolio' && <>
          <div style={{ background:C.card, borderRadius:14, padding:14, border:'1px solid '+C.border }}>
            <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>Total Portfolio Value</div>
            <div style={{ fontSize:28, fontWeight:800, color:C.green, fontFamily:'monospace', marginBottom:8 }}>{fm((d.cashWallet||0)+(d.tradingWallet||0)+stockVal)}</div>
          </div>
          {Object.keys(SH).filter(t=>(SH[t]||0)>0).length === 0 && (
            <div style={{ padding:30, textAlign:'center', color:C.muted, fontSize:14 }}>No stock positions yet. Go to Markets to buy.</div>
          )}
          {Object.entries(SH).filter(([,n])=>n>0).map(([ticker,n])=>{
            const co = (d.companies||[]).find(c=>c.t===ticker);
            if (!co) return null;
            const avgC = d.avgCostBasis?.[ticker]||co.price;
            const pl = (co.price-avgC)*n;
            return (
              <div key={ticker} style={{ background:C.card, borderRadius:13, padding:13, border:'1px solid '+C.border }}>
                <div onClick={()=>{setSelTicker(ticker);setTab('co');}} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10, cursor:'pointer' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:800, color:C.greenText, border:'1px solid '+C.greenBg, flexShrink:0 }}>{ticker}</div>
                  <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:600 }}>{co.n}</div><div style={{ fontSize:10, color:C.muted }}>{n.toLocaleString()} shs · avg {fm(avgC)}</div></div>
                  <div style={{ textAlign:'right' }}><div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace' }}>{fm(co.price*n)}</div><div style={{ fontSize:10, fontFamily:'monospace', color:pl>=0?C.green:C.red }}>{pl>=0?'+':''}{fm(pl)}</div></div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>{setTrMode({ticker,mode:'buy'});setTrQty(null);}} style={{ flex:1, background:C.greenBg, color:C.greenText, border:'1px solid #166534', borderRadius:7, padding:'8px 0', fontWeight:700, fontSize:11, cursor:'pointer' }}>+ More</button>
                  <button onClick={()=>{ const err=sellStock(ticker,Math.floor(n/2)); if(err)showToast(err,false); else showToast('Sold 50% of '+ticker); }} style={{ flex:1, background:C.amberBg, color:C.amberText, border:'1px solid #92400E', borderRadius:7, padding:'8px 0', fontWeight:700, fontSize:11, cursor:'pointer' }}>Sell 50%</button>
                  <button onClick={()=>{ const err=sellStock(ticker,n); if(err)showToast(err,false); else showToast('Sold all '+ticker); }} style={{ flex:1, background:C.redBg, color:C.redText, border:'1px solid #991B1B', borderRadius:7, padding:'8px 0', fontWeight:700, fontSize:11, cursor:'pointer' }}>Sell All</button>
                </div>
              </div>
            );
          })}
        </>}

        {/* NEWS TAB */}
        {tab==='news' && <>
          {(d.news||[]).map(n=>(
            <div key={n.id} style={{ background:C.card, borderRadius:11, padding:12, border:'1px solid '+C.border, display:'flex', gap:9 }}>
              <div style={{ width:4, borderRadius:2, flexShrink:0, background:n.g?C.green:C.red, alignSelf:'stretch' }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>T{n.t} · {n.ico}</div>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:2 }}>{n.ti}</div>
                <div style={{ fontSize:11, color:C.dim, lineHeight:1.6 }}>{n.bo}</div>
              </div>
            </div>
          ))}
        </>}
      </div>

      {/* Trade Modal */}
      {trMode && (() => {
        const c = (d.companies||[]).find(x=>x.t===trMode.ticker);
        if (!c) return null;
        const isBuy = trMode.mode==='buy';
        const maxQty = isBuy ? Math.floor((d.tradingWallet||0)/c.price) : (SH[c.t]||0);
        const candidates = [1,5,10,50,100,500,1000,5000,10000,50000,100000];
        const show = [...new Set([...candidates.filter(v=>v<=maxQty&&v>0),maxQty])].filter(v=>v>0).sort((a,b)=>a-b).slice(-8);
        const qty = trQty || 0;
        const total = Math.round(qty*c.price*100)/100;
        const profit = !isBuy ? Math.max(0,(c.price-(d.avgCostBasis?.[c.t]||c.price))*qty) : 0;
        const cgt = Math.round(profit*0.20*100)/100;
        return (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', zIndex:300, display:'flex', alignItems:'flex-end' }} onClick={e=>{if(e.target===e.currentTarget){setTrMode(null);setTrQty(null);}}}>
            <div style={{ background:C.card, borderRadius:'18px 18px 0 0', padding:20, width:'100%', maxHeight:'80vh', overflowY:'auto' }}>
              <div style={{ width:36, height:5, background:C.border, borderRadius:3, margin:'0 auto 14px' }}/>
              <div style={{ background:isBuy?C.greenBg:C.redBg, borderRadius:12, padding:13, marginBottom:12 }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.65)', textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>{isBuy?'BUY':'SELL'} · STOCK</div>
                <div style={{ fontSize:17, fontWeight:800, color:'#fff' }}>{c.n}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.8)', marginTop:2 }}>{fm(c.price)} per share · {isBuy?fm(d.tradingWallet||0)+' available':(SH[c.t]||0).toLocaleString()+' held'}</div>
              </div>
              <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>Quantity — Max {maxQty.toLocaleString()}</div>
              {maxQty > 0 ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:10 }}>
                  {show.map(v=>(
                    <button key={v} onClick={()=>setTrQty(v)} style={{ padding:'10px 4px', borderRadius:9, border:'2px solid '+(trQty===v?(isBuy?C.green:C.red):C.border), background:trQty===v?(isBuy?C.greenBg:C.redBg):C.bg, color:trQty===v?(isBuy?C.greenText:C.redText):C.dim, fontWeight:700, fontSize:11, cursor:'pointer', textAlign:'center' }}>
                      {v>=1000?(v/1000).toFixed(0)+'K':v}
                    </button>
                  ))}
                  <button onClick={()=>setTrQty(maxQty)} style={{ padding:'10px 4px', borderRadius:9, border:'2px solid '+(isBuy?C.green:C.red), background:isBuy?C.greenBg:C.redBg, color:isBuy?C.greenText:C.redText, fontWeight:800, fontSize:11, cursor:'pointer' }}>Max</button>
                </div>
              ) : <div style={{ padding:'12px 0', color:C.muted, fontSize:12, textAlign:'center' }}>{isBuy?'Not enough cash':'Nothing held'}</div>}
              {qty > 0 && (
                <div style={{ background:C.bg, borderRadius:9, padding:11, marginBottom:10 }}>
                  {[['Qty',qty.toLocaleString()+' shares'],[isBuy?'Cost':'Proceeds',fm(total)],!isBuy&&profit>0?['CGT 20% on profit','-'+fm(cgt)]:null,[isBuy?'Total cost':'Net proceeds',fm(isBuy?total:total-cgt)]].filter(Boolean).map(([k,v])=>(
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid '+C.card }}><span style={{ fontSize:12, color:C.muted }}>{k}</span><span style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:C.text }}>{v}</span></div>
                  ))}
                </div>
              )}
              <button onClick={doTrade} disabled={qty<1} style={{ width:'100%', background:qty>=1?(isBuy?C.green:C.red):C.border, color:'#fff', border:'none', borderRadius:11, padding:14, fontWeight:800, fontSize:14, cursor:qty>=1?'pointer':'not-allowed' }}>
                {qty>=1?`Confirm ${isBuy?'Buy':'Sell'} ${qty.toLocaleString()} shares = ${fm(isBuy?total:total-cgt)}`:'Select quantity above'}
              </button>
            </div>
          </div>
        );
      })()}

      {toast && <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', width:'calc(100% - 32px)', maxWidth:398, background:toast.g?C.green:C.red, borderRadius:10, padding:'12px 16px', color:'#fff', fontSize:12, fontWeight:700, zIndex:400, textAlign:'center', boxShadow:'0 4px 16px rgba(0,0,0,.4)' }}>{toast.msg}</div>}
    </div>
  );
}
