import{useState}from"react";
const G="#2E7D32",R="#C62828",BL="#1565C0",DK="#0D1B2A",AU="#F57F17",PU="#6A1B9A";

const STEPS=[
  {id:1,title:"Welcome to Galactic Raider",ico:"🌌",color:"#1A237E",bg:"#E8EAF6",
   summary:"You start with $1,000,000. Your goal: grow it into a multi-billion dollar portfolio across Earth and the Solar System.",
   detail:"The game runs one turn per minute on the live server. Each turn markets move, dividends pay, taxes are deducted, and CEO decisions arrive. You decide everything — when to buy, when to sell, when to donate, when to spin.",
   tips:["You cannot lose more than you invest — the bankruptcy system protects you","Every mechanic mirrors real financial markets — this game will teach you","Read the Tax Era before doing anything — it changes everything"]},
  {id:2,title:"Your 3 Wallets",ico:"💼",color:"#1B5E20",bg:"#E8F5E9",
   summary:"You have three separate wallets. Understanding them is the most important thing in the game.",
   detail:"💵 CASH WALLET ($100K) — Day-to-day money. Tax payments, loan repayments, Foundation fees. Never auto-liquidated.\n\n🏦 SAVINGS WALLET ($100K) — Protected after you open a Foundation. Earns 2%/yr. Dividends land here.\n\n⚡ TRADING WALLET ($800K) — All investments happen here. First to be liquidated in bankruptcy.",
   tips:["Open a Foundation ASAP — $10K fee from Cash Wallet protects your Savings forever","Never put money in Trading Wallet you cannot afford to lose","Keep at least $10K in Cash Wallet at all times as an emergency buffer"]},
  {id:3,title:"Check the Tax Era First",ico:"🔔",color:"#E65100",bg:"#FFF3E0",
   summary:"The game rotates through 8 tax eras, each 60 turns. The era determines how much tax you pay on every profit.",
   detail:"The 8 eras: Normal (20% CGT), High Tax (30%), Low Tax (10%), Capital Gains (5%), Dividend (5% div tax), Transaction (near-zero txn fee), Wealth Tax (for $10B+ players), Normal again.\n\nCapital Gains era is the best time to sell profitable positions — you keep 95 cents of every dollar of profit. High Tax era is the worst — you only keep 70 cents.",
   tips:["NEVER sell a big profit in High Tax era — wait for Capital Gains era","In Dividend era, buy high-yield stocks (Utilities 4.2%, TeleCom 4.5%)","Philanthropy reduces your effective tax rate by up to 75%"]},
  {id:4,title:"Your First Investment",ico:"📈",color:"#1565C0",bg:"#E3F2FD",
   summary:"Go to Markets → Stocks. Sort by Analyst Rating. Read the company profile. Buy your first position.",
   detail:"Each company has a founder story, 2–5 named analyst opinions, a consensus rating, and a price target.\n\nStart with STRONG BUY companies — these have the highest analyst conviction. Read at least the story and one analyst opinion before buying. Tap any company to see the full profile.\n\nBuy a small position first — 1,000 shares. Watch how it moves for a few turns before adding more.",
   tips:["High beta (1.5+) = more volatile, higher potential gains AND losses","Low beta (0.5–0.8) = stable — good for Utilities and Banking stocks","The P/E ratio must stay within industry bounds — the Governor enforces this automatically"]},
  {id:5,title:"Add a Bond for Safety",ico:"📋",color:"#4A148C",bg:"#EDE7F6",
   summary:"Bonds pay quarterly coupons and protect your capital. Buy 5–10 US Treasury bonds in your first session.",
   detail:"Five bond types:\n• US Treasury 10Y — AAA, 4.5% coupon, safest\n• EU Govt 10Y — AA, 3.8% coupon, very safe\n• Silk Road Bond — AA, 5.2% coupon\n• African Govt Bond — BB, 12.5% coupon, higher risk\n• Emerging Mkt Bond — B, 14.8% coupon, highest risk\n\nBond price moves opposite to yield — when yields rise, prices fall. Coupons pay every 30 turns.",
   tips:["AAA bonds are like cash that pays interest — perfect for your first bond","High-yield bonds (BB/B) can double your coupon income but carry default risk","Buy bonds in Tax eras where dividend tax is low (Dividend era = 5% tax on coupons)"]},
  {id:6,title:"Try Your First Forex Trade",ico:"💱",color:AU,bg:"#FFF8E1",
   summary:"Forex lets you bet on currency movements. Long = profit when price rises. Short = profit when price falls. No limits.",
   detail:"Available pairs: EUR/USD, GBP/USD, USD/JPY, USD/INR. USD/AED and USD/CNY are locked (fixed rates).\n\nYou can put your entire Trading Wallet on one forex position. This is high risk — for experienced players.\n\nP&L updates every turn. Close the position any time.",
   tips:["Start with a small position (10% of Trading Wallet) to understand how it moves","Long EUR/USD = you think the Euro will strengthen against the Dollar","Short USD/JPY = you think the Dollar will weaken against the Yen","Forex is a hedge — use it when you expect markets to fall broadly"]},
  {id:7,title:"CEO Decisions — Do Not Ignore",ico:"👔",color:R,bg:"#FFEBEE",
   summary:"Every 30 turns, companies you own 10%+ in will send you a decision. You have 10 turns to respond. Ignore it and the worst outcome is auto-applied.",
   detail:"Decisions include acquisitions, dividend changes, expansion plans, and cost restructuring. Each option shows the exact price impact and CEO reputation change.\n\nAt 10% ownership: vote on dividends\nAt 25% ownership: propose strategy, veto acquisitions\nAt 50% ownership: replace CEO, declare special dividends\n\nCEO reputation affects the quality of future opportunities.",
   tips:["Buy shares from the Companies tab to reach ownership thresholds","The decision banner turns red when only 3 turns remain — urgent","Always read all options before choosing — the best financial outcome is not always the best long-term choice"]},
  {id:8,title:"Open the Global Sovereign Fund",ico:"🏛️",color:"#0277BD",bg:"#E1F5FE",
   summary:"The GSF is your passive income engine. Deposit once and earn daily interest every turn automatically.",
   detail:"Minimum deposit: $50,000. Deposit fee: 2% (deducted on entry). Returns: GSF rate ÷ 365 credited to your Trading Wallet every single turn.\n\nExample: $1,000,000 deposited at 12% annual rate = $328 per turn. Over 1,000 turns = $328,000 of passive income.\n\nWithdraw anytime to Trading Wallet. The rate fluctuates between 3–14% annually.",
   tips:["Deposit as early as possible — the daily compounding adds up over hundreds of turns","At $10M deposited and 12% rate, you earn $3,287 per turn — automatically","The GSF is never liquidated in bankruptcy — it is a separate pool"]},
  {id:9,title:"Philanthropy and the Wheel of Fortune",ico:"❤️",color:"#880E4F",bg:"#FCE4EC",
   summary:"Donate $1M+ to earn redemption points. Points convert to Wheel of Fortune spin tokens. Spin for debt forgiveness.",
   detail:"Donate to any of 8 categories. Education has the highest point multiplier (1.5×). Disaster Relief has the highest tax relief (35% for 8 turns).\n\nOnce you have 500 points and have made 2+ donations, you earn a spin token. Each spin costs 500 points + 1 token.\n\nWheel outcomes: 5% debt relief (most common, 30%) up to 50% jackpot (10%). Max 5 lifetime spins.",
   tips:["Donate to Education first for the highest points per dollar","The tax relief stacks — donate to two categories and get combined relief up to 75%","Even if you have no debt, spin the wheel — the consolation prize gives +100 to +200 points"]},
  {id:10,title:"The Solar System Awaits",ico:"☀️",color:"#F57F17",bg:"#FFF8E1",
   summary:"Reach $5B net worth, turn 300, 3 regions, 2 bonds, 2 donations — and 7 planets unlock. Each has its own economy.",
   detail:"7 planets:\n🔴 Mars — Mining (lithium, rare earths)\n🟡 Venus — Automated energy exports\n🟠 Jupiter — Robotic economy, storm events, boom after recovery\n🪐 Saturn — Ryzolith monopoly (rarest ore in system)\n☿ Mercury — Solar energy (24× Earth intensity)\n🔵 Uranus — Ice mining, long-term cycles\n💜 Neptune — Deep research, highest risk\n\nJupiter tip: BUY after every storm. Companies crash 30% then recover 100%+.",
   tips:["Diversify across planets — when Earth falls, Jupiter still has 3 turns of rising to do","Jupiter storm = buy signal, not a sell signal","Saturn's Ryzolith grows in value every 100 turns — long-term hold"]},
];

const QUICK_TIPS=[
  {q:"What should I do on Turn 1?",a:"Check the tax era. If it is Capital Gains or Low Tax, start buying immediately. If High Tax, just buy bonds and wait. Then check your 3 wallets and open a Foundation if you have $10K in Cash Wallet."},
  {q:"My stock is down 10%. Should I sell?",a:"Check if the fundamentals changed (earnings miss, CEO scandal) or if it is just market noise. If the analyst consensus is still BUY and no negative event fired, hold. Short-term drops in quality companies are usually buying opportunities."},
  {q:"What is the fastest way to grow net worth?",a:"GSF + philanthropy tax shield + Capital Gains era selling. Deposit 40% of Trading Wallet into GSF for passive income. Donate to Education and Environment to cut your tax rate by 55%. Sell big positions only in Capital Gains era (5% CGT)."},
  {q:"How do I unlock the Solar System faster?",a:"The 3 regions criteria is often the slowest. Buy stocks from US, Europe AND Emerging Markets at the same time. The 2 donations criteria requires $2M+ spent — plan this early. GSF + philanthropy together usually get you to $5B faster than pure trading."},
  {q:"My wallet says Insufficient Funds. What happened?",a:"All trades draw from your Trading Wallet. Check the Trading Wallet balance on the Home screen. If it is empty, transfer from Cash Wallet (instant) or Savings Wallet (1 turn delay). Remember: bonds, stocks, forex and auto-buys all draw from Trading Wallet."},
  {q:"What is the CEO reputation score?",a:"Each CEO has a reputation from 0–100. Above 75 = strong CEO who brings good acquisition targets and smart decisions. Below 50 = weak CEO who makes poor choices. If you own 50%+, you can replace a low-rep CEO. CEO rep is affected by your decision choices — picking the worst option repeatedly degrades reputation."},
  {q:"When should I spin the Wheel of Fortune?",a:"Only spin when you have significant debt. The wheel forgives a percentage of outstanding debt — if you have zero debt, the spin wastes 500 points. Save your spins for genuine debt crises. The 7-day streak gives a free 10% forgiveness — use that first."},
  {q:"Is it worth buying into a Jupiter storm?",a:"Yes — this is the best trade in the game. When the Jupiter storm event fires, JCR crashes and Jupiter companies drop 30%+. Buy immediately. The Mutual Space Council activates and Jupiter rebuilds in 15–20 turns, then booms to new highs. Buy the dip, hold through recovery."},
];

export default function StarterGuide(){
  const[step,setStep]=useState(0);
  const[faq,setFaq]=useState(null);
  const[tab,setTab]=useState("guide");
  const cur=step>=0&&step<STEPS.length?STEPS[step]:null;

  return <div style={{maxWidth:430,margin:"0 auto",background:"#0D1B2A",minHeight:"100vh",fontFamily:"system-ui,sans-serif",color:"#F8FAFC"}}>
    <div style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",padding:"16px 16px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{fontSize:11,color:"rgba(240,208,96,.6)",textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>🌌 Galactic Raider</div>
      <div style={{fontSize:22,fontWeight:800,color:"#F0D060",marginBottom:2}}>Player Guide & Wiki</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:12}}>Everything you need to build a galactic empire</div>
      <div style={{display:"flex",gap:0}}>
        {[{id:"guide",l:"Step-by-Step"},{id:"faq",l:"Quick Answers"},{id:"ref",l:"Reference"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px",border:"none",borderBottom:"3px solid "+(tab===t.id?"#F0D060":"transparent"),background:"transparent",color:tab===t.id?"#F0D060":"rgba(255,255,255,.4)",fontWeight:700,fontSize:11,cursor:"pointer"}}>{t.l}</button>)}
      </div>
    </div>
    <div style={{padding:14,display:"flex",flexDirection:"column",gap:12}}>
      {tab==="guide"&&cur&&<>
        <div style={{background:"rgba(255,255,255,.05)",borderRadius:12,padding:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>Progress</span><span style={{fontSize:11,color:"#F0D060",fontWeight:700}}>Step {step+1} of {STEPS.length}</span></div>
          <div style={{height:4,background:"rgba(255,255,255,.1)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:((step+1)/STEPS.length*100)+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:2}}/></div>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center"}}>
          {STEPS.map((s,i)=><button key={i} onClick={()=>setStep(i)} style={{width:30,height:30,borderRadius:"50%",border:"2px solid "+(i===step?"#F0D060":i<step?"rgba(240,208,96,.4)":"rgba(255,255,255,.1)"),background:i===step?"rgba(240,208,96,.2)":"transparent",color:i===step?"#F0D060":i<step?"rgba(240,208,96,.5)":"rgba(255,255,255,.3)",fontWeight:700,fontSize:10,cursor:"pointer"}}>{i<step?"✓":i+1}</button>)}
        </div>
        <div style={{background:"linear-gradient(135deg,"+cur.color+"33,"+cur.color+"11)",borderRadius:16,padding:18,border:"2px solid "+cur.color+"55"}}>
          <div style={{fontSize:32,marginBottom:8}}>{cur.ico}</div>
          <div style={{fontSize:10,color:cur.color,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4,fontWeight:700}}>Step {cur.id} of {STEPS.length}</div>
          <div style={{fontSize:20,fontWeight:800,color:"#F8FAFC",marginBottom:8,lineHeight:1.3}}>{cur.title}</div>
          <div style={{fontSize:13,color:"rgba(248,250,252,.8)",lineHeight:1.7}}>{cur.summary}</div>
        </div>
        <div style={{background:"rgba(255,255,255,.04)",borderRadius:13,padding:14,border:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>How it works</div>
          <div style={{fontSize:12,color:"rgba(248,250,252,.7)",lineHeight:1.8,whiteSpace:"pre-line"}}>{cur.detail}</div>
        </div>
        <div style={{background:"rgba(240,208,96,.06)",borderRadius:13,padding:14,border:"1px solid rgba(240,208,96,.15)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#F0D060",marginBottom:10}}>Pro Tips</div>
          {cur.tips.map((tip,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:i<cur.tips.length-1?10:0}}><span style={{color:"#F0D060",fontSize:12,flexShrink:0}}>→</span><span style={{fontSize:12,color:"rgba(248,250,252,.8)",lineHeight:1.6}}>{tip}</span></div>)}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{flex:1,background:"rgba(255,255,255,.08)",color:step===0?"rgba(255,255,255,.2)":"rgba(255,255,255,.7)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:13,cursor:step===0?"not-allowed":"pointer"}}>← Previous</button>
          <button onClick={()=>setStep(s=>Math.min(STEPS.length-1,s+1))} disabled={step===STEPS.length-1} style={{flex:2,background:step===STEPS.length-1?"rgba(255,255,255,.08)":"linear-gradient(135deg,#B8952A,#F0D060)",color:step===STEPS.length-1?"rgba(255,255,255,.2)":"#000",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:13,cursor:step===STEPS.length-1?"not-allowed":"pointer"}}>{step===STEPS.length-1?"Guide Complete":"Next Step →"}</button>
        </div>
        {step===STEPS.length-1&&<div style={{background:"linear-gradient(135deg,rgba(240,208,96,.15),rgba(240,208,96,.05))",borderRadius:13,padding:16,border:"2px solid rgba(240,208,96,.3)",textAlign:"center"}}><div style={{fontSize:32,marginBottom:8}}>🏆</div><div style={{fontSize:18,fontWeight:800,color:"#F0D060",marginBottom:6}}>Ready to Play!</div><div style={{fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:1.6}}>You know the core mechanics. Start with Markets, build a portfolio, watch the tax eras, and work toward the Solar System.</div></div>}
      </>}
      {tab==="faq"&&<>
        {QUICK_TIPS.map((q,i)=><div key={i} style={{background:"rgba(255,255,255,.04)",borderRadius:13,border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
          <button onClick={()=>setFaq(faq===i?null:i)} style={{width:"100%",padding:"14px",background:"transparent",border:"none",color:"#F8FAFC",fontWeight:700,fontSize:13,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",gap:10}}>
            <span>{q.q}</span><span style={{color:"#F0D060",fontSize:16,flexShrink:0}}>{faq===i?"▲":"▼"}</span>
          </button>
          {faq===i&&<div style={{padding:"0 14px 14px",fontSize:12,color:"rgba(248,250,252,.75)",lineHeight:1.7,borderTop:"1px solid rgba(255,255,255,.06)"}}><br/>{q.a}</div>}
        </div>)}
      </>}
      {tab==="ref"&&<>
        {[
          {t:"Tax Eras",i:"🔔",rows:[["Normal","CGT 20%"],["High Tax","CGT 30% — HOLD"],["Low Tax","CGT 10% — BUY"],["Capital Gains","CGT 5% — SELL NOW"],["Dividend","Div 5% — YIELD STOCKS"],["Transaction","Low txn — TRADE"],["Wealth Tax","0.1%/t above $10B"]]},
          {t:"Planet Currencies",i:"🌍",rows:[["Earth","USD base"],["Mars","MCR $0.85"],["Venus","VCR $0.75"],["Jupiter","JCR $0.90"],["Saturn","STC $0.70"],["Mercury","MRC $0.60"],["Uranus","URU $0.55"],["Neptune","NPT $0.50"]]},
          {t:"Starting Capital",i:"💼",rows:[["Cash","$100K"],["Savings","$100K"],["Trading","$800K"],["Total","$1,000,000"]]},
          {t:"Philanthropy",i:"❤️",rows:[["Education","1.5× pts"],["Healthcare","1.3× pts"],["Poverty","1.2× pts"],["Environment","1.1× 7 turns"],["Disaster","35% relief 8t"]]},
          {t:"Wheel Odds",i:"🎡",rows:[["5% relief","30%"],["10% relief","20%"],["15% relief","15%"],["25% relief","10%"],["50% jackpot","10%"],["Bonus pts","15%"]]},
          {t:"Board Tiers",i:"👔",rows:[["10%+","Vote dividends"],["25%+","Propose strategy"],["50%+","Replace CEO"]]},
        ].map((s,si)=><div key={si} style={{background:"rgba(255,255,255,.04)",borderRadius:13,padding:13,border:"1px solid rgba(255,255,255,.08)",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700,color:"#F0D060",marginBottom:8}}>{s.i} {s.t}</div>
          {s.rows.map(([k,v],ri)=><div key={ri} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:ri<s.rows.length-1?"1px solid rgba(255,255,255,.06)":"none"}}><span style={{fontSize:11,color:"rgba(255,255,255,.6)",fontWeight:600}}>{k}</span><span style={{fontSize:11,color:"rgba(248,250,252,.8)"}}>{v}</span></div>)}
        </div>)}
      </>}
    </div>
    <style>{"*{box-sizing:border-box;margin:0;padding:0}button{outline:none;font-family:inherit}::-webkit-scrollbar{display:none}"}</style>
  </div>;
}