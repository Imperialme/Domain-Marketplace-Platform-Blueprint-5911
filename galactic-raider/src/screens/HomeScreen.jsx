import { useGame } from '../store/gameStore';
import { fm, C } from '../utils';
import { TAX_ERAS } from '../constants';

const CS = {
  card: { background:'#0D1B2E', borderRadius:16, padding:16, border:'1px solid #1A2744', marginBottom:12 },
  label: { fontSize:10, color:'#4B5563', textTransform:'uppercase', letterSpacing:1.5, marginBottom:6 },
};

export default function HomeScreen({ onNavigate }) {
  const { D, advanceTurn } = useGame();
  const d = D;
  const era = TAX_ERAS[d.eraIdx];
  const nw = (d.cashWallet||0)+(d.savingsWallet||0)+(d.tradingWallet||0)+(d.foundationBalance||0);
  const stockVal = Object.entries(d.stockHoldings||{}).reduce((x,[t,n]) => {
    const co = d.companies?.find(c=>c.t===t); return x+(co?co.price*n:0);
  }, 0);
  const etfVal = (d.etfs||[]).reduce((x,e)=>x+e.price*(e.units||0),0);
  const fundVal = Object.values(d.fundDeposits||{}).reduce((x,f)=>x+(f.deposit||0),0);
  const pendingDecs = (d.pendingDecisions||[]).length;
  const stockRegions = new Set(Object.keys(d.stockHoldings||{}).map(t=>{
    const co=d.companies?.find(c=>c.t===t); return co?.hq;
  }).filter(Boolean));
  const criteria = [
    {label:'Net Worth $5B',   done:nw>=5e9,             cur:fm(nw)},
    {label:'Turn 300+',       done:d.turn>=300,          cur:'T'+d.turn},
    {label:'3+ Regions',      done:stockRegions.size>=3, cur:stockRegions.size+' rgns'},
    {label:'2+ Donations',    done:(d.donCount||0)>=2,   cur:(d.donCount||0)+' made'},
  ];
  const eraColors = {'Normal':'#64748B','Capital Gains':'#16A34A','Low Tax':'#3B82F6','High Tax':'#EF4444','Dividend':'#8B5CF6','Transaction':'#F59E0B','Wealth Tax':'#EC4899'};
  const eraColor = eraColors[era.name]||'#64748B';
  const doneCount = criteria.filter(c=>c.done).length;

  return (
    <div style={{padding:'16px 16px 80px',background:'#060B14',minHeight:'100%'}}>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:'#F8FAFC',letterSpacing:1}}>🌌 Cosmos Capital</div>
          <div style={{fontSize:11,color:'#4B5563',marginTop:2}}>Turn {d.turn} · {era.name} Era</div>
        </div>
        <div style={{background:'#0D1B2E',border:'1px solid #1A2744',borderRadius:10,padding:'6px 12px',fontSize:12,color:d.gdp>=0?'#34D399':'#EF4444',fontWeight:700}}>
          GDP {d.gdp>=0?'+':''}{d.gdp}%
        </div>
      </div>

      {/* Net Worth */}
      <div style={{background:'linear-gradient(135deg,#0A1628,#0F2040)',borderRadius:20,padding:20,border:'1px solid #1E3A5F',marginBottom:12}}>
        <div style={{fontSize:10,color:'#4B5563',textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Total Net Worth</div>
        <div style={{fontSize:40,fontWeight:900,color:'#34D399',fontFamily:'monospace',lineHeight:1,marginBottom:14}}>{fm(nw)}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {[['💵 Cash',fm(d.cashWallet||0),'#60A5FA'],['🏦 Savings',fm(d.savingsWallet||0),'#34D399'],['⚡ Trading',fm(d.tradingWallet||0),'#FBBF24'],['📊 Stocks',fm(stockVal),'#A78BFA'],['🌌 ETFs',fm(etfVal),'#22D3EE'],['💎 Funds',fm(fundVal),'#F472B6']].map(([l,v,c])=>(
            <div key={l} style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:'8px 10px'}}>
              <div style={{fontSize:9,color:'#4B5563',marginBottom:3}}>{l}</div>
              <div style={{fontSize:12,fontWeight:800,color:c,fontFamily:'monospace'}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Advance Turn */}
      <button onClick={advanceTurn} style={{width:'100%',background:'linear-gradient(135deg,#1D4ED8,#7C3AED)',color:'#fff',border:'none',borderRadius:14,padding:'16px 0',fontWeight:900,fontSize:17,cursor:'pointer',letterSpacing:1,marginBottom:12}}>
        ▶ ADVANCE TURN
      </button>

      {/* CEO Alert */}
      {pendingDecs>0&&(
        <div onClick={()=>onNavigate?.('command')} style={{background:'#1C0A0A',borderRadius:12,padding:'12px 16px',border:'1px solid #7F1D1D',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,cursor:'pointer'}}>
          <div>
            <div style={{fontSize:13,color:'#FCA5A5',fontWeight:800}}>⚠️ {pendingDecs} CEO Decision{pendingDecs>1?'s':''} Pending</div>
            <div style={{fontSize:11,color:'#EF4444',marginTop:2}}>Tap here → go to Command tab</div>
          </div>
          <div style={{fontSize:24,color:'#EF4444'}}>›</div>
        </div>
      )}

      {/* Tax Era */}
      <div style={CS.card}>
        <div style={CS.label}>Current Tax Era</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:eraColor}}>{era.name}</div>
            <div style={{fontSize:11,color:'#6B7280',marginTop:4,lineHeight:1.4}}>{era.desc}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:34,fontWeight:900,color:eraColor,fontFamily:'monospace'}}>{Math.round(era.cgt*100)}%</div>
            <div style={{fontSize:10,color:'#4B5563'}}>CGT rate</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {[['Div Tax',Math.round(era.divTax*100)+'%'],['Next Era','T'+(Math.ceil(d.turn/60)*60)],['Streak',(d.streak||0)+'/7 🔥']].map(([l,v])=>(
            <div key={l} style={{flex:1,background:'#060B14',borderRadius:8,padding:'8px 0',textAlign:'center'}}>
              <div style={{fontSize:9,color:'#4B5563'}}>{l}</div>
              <div style={{fontSize:12,fontWeight:700,color:'#D1D5DB',fontFamily:'monospace',marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Solar System Unlock */}
      <div style={{...CS.card,border:d.solarUnlocked?'1px solid #F59E0B':'1px solid #1A2744'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:700,color:'#F8FAFC'}}>🌌 Solar System Unlock</div>
          {d.solarUnlocked?<div style={{background:'#78350F',color:'#FDE68A',padding:'3px 10px',borderRadius:20,fontSize:10,fontWeight:700}}>UNLOCKED</div>:<div style={{fontSize:11,color:'#4B5563'}}>{doneCount}/4</div>}
        </div>
        <div style={{background:'#060B14',borderRadius:4,height:5,marginBottom:12,overflow:'hidden'}}>
          <div style={{width:(doneCount/4*100)+'%',height:'100%',background:'linear-gradient(90deg,#3B82F6,#F59E0B)',borderRadius:4,transition:'width .5s'}}/>
        </div>
        {criteria.map(c=>(
          <div key={c.label} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid #0A1220'}}>
            <div style={{fontSize:15}}>{c.done?'✅':'⬜'}</div>
            <div style={{flex:1,fontSize:12,fontWeight:600,color:c.done?'#34D399':'#9CA3AF'}}>{c.label}</div>
            <div style={{fontSize:10,color:'#4B5563',fontFamily:'monospace'}}>{c.cur}</div>
          </div>
        ))}
      </div>

      {/* News */}
      <div style={CS.card}>
        <div style={{fontSize:13,fontWeight:700,color:'#F8FAFC',marginBottom:12}}>📰 News Feed</div>
        {(d.news||[]).slice(0,5).map(n=>(
          <div key={n.id} style={{display:'flex',gap:10,padding:'10px 0',borderBottom:'1px solid #0A1220'}}>
            <div style={{width:3,borderRadius:2,flexShrink:0,background:n.g?'#34D399':'#EF4444',alignSelf:'stretch'}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:'#4B5563',marginBottom:3}}>T{n.t} · {n.ico}</div>
              <div style={{fontSize:13,fontWeight:700,color:'#F8FAFC',marginBottom:3}}>{n.ti}</div>
              <div style={{fontSize:11,color:'#6B7280',lineHeight:1.5}}>{n.bo}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
