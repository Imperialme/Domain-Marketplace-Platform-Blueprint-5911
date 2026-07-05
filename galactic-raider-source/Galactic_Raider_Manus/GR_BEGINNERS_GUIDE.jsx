import{useState}from"react";
const G="#16A34A",R="#DC2626",BL="#1D4ED8",DK="#0F172A",AU="#D97706",PU="#7C3AED";

const STEPS=[
  {
    id:1,ico:"🌍",title:"Welcome to Galactic Raider",color:"#1B5E20",bg:"#E8F5E9",
    subtitle:"You start with $1,000,000. Your goal: grow it into a galactic empire.",
    content:[
      {type:"rule",text:"You have 3 wallets: Cash ($100K), Savings ($100K), Trading ($800K)"},
      {type:"rule",text:"All trading happens from your Trading Wallet only"},
      {type:"rule",text:"Your Savings Wallet earns 2% interest per year automatically"},
      {type:"rule",text:"The game runs in turns — each turn = 1 day in production"},
      {type:"tip",text:"💡 Start by pressing Next Turn a few times to watch markets move"},
      {type:"warning",text:"⚠️ Never spend your Cash Wallet below $10K — keep it as emergency reserve"},
    ],
    quiz:{q:"What does your Trading Wallet start with?",opts:["$100,000","$800,000","$1,000,000","$50,000"],correct:1}
  },
  {
    id:2,ico:"💼",title:"Understanding Your 3 Wallets",color:"#1565C0",bg:"#E3F2FD",
    subtitle:"Three wallets, three purposes. Know which does what.",
    content:[
      {type:"wallet",name:"💵 Cash Wallet",detail:"Day-to-day money. Pay taxes, fees, and small expenses from here. Never auto-liquidated.",color:"#1565C0"},
      {type:"wallet",name:"🏦 Savings Wallet",detail:"Long-term money. Earns 2%/yr interest. Open a Foundation ($10K fee) to make it bankruptcy-proof.",color:G},
      {type:"wallet",name:"⚡ Trading Wallet",detail:"Your risk capital. ALL stocks, bonds, forex, commodities bought from here. First to be liquidated if you go bankrupt.",color:R},
      {type:"tip",text:"💡 Transfer money between wallets using 10% / 25% / 50% / 100% buttons"},
      {type:"tip",text:"💡 Trading → Savings takes 1 turn to settle. Savings → Trading is instant."},
      {type:"warning",text:"⚠️ If you go bankrupt, Trading Wallet is liquidated first. Savings is only safe if you opened a Foundation."},
    ],
    quiz:{q:"Which wallet do you use to buy stocks?",opts:["Cash Wallet","Savings Wallet","Trading Wallet","Any wallet"],correct:2}
  },
  {
    id:3,ico:"📊",title:"Your First Stock Purchase",color:"#2E7D32",bg:"#E8F5E9",
    subtitle:"Stocks are your primary way to grow wealth. Here is how to buy correctly.",
    content:[
      {type:"step",n:1,text:"Go to the Markets tab and browse the 10 listed companies"},
      {type:"step",n:2,text:"Tap any company to see its full profile — founder story, CEO, analyst ratings"},
      {type:"step",n:3,text:"Check the Analyst Consensus — STRONG BUY means most analysts think it will rise"},
      {type:"step",n:4,text:"Check the Price Target — if target is 20% above current price, there is potential upside"},
      {type:"step",n:5,text:"Tap BUY, select your quantity, review the confirmation screen, then Confirm"},
      {type:"rule",text:"Capital Gains Tax (CGT) is only charged on PROFIT when you sell — never on losses"},
      {type:"tip",text:"💡 Best strategy: buy STRONG BUY stocks during Low Tax or Capital Gains era — you keep more profit"},
      {type:"tip",text:"💡 Dividends are paid every 30 turns automatically to your Savings Wallet"},
    ],
    quiz:{q:"When do you pay Capital Gains Tax?",opts:["When you buy","Every turn","Only when you sell at a profit","Every 30 turns"],correct:2}
  },
  {
    id:4,ico:"🔔",title:"Tax Eras — The Most Important Mechanic",color:"#E65100",bg:"#FFF3E0",
    subtitle:"The tax system rotates every 60 turns. Timing your trades around eras is the key to wealth.",
    content:[
      {type:"era",name:"Capital Gains Era",cgt:"5%",div:"15%",desc:"Best time to sell profitable positions. CGT only 5%."},
      {type:"era",name:"Dividend Era",cgt:"20%",div:"5%",desc:"Best time to hold income stocks. Dividend tax nearly zero."},
      {type:"era",name:"Low Tax Era",cgt:"10%",div:"5%",desc:"Best overall era. Sell winners, reinvest quickly."},
      {type:"era",name:"High Tax Era",cgt:"30%",div:"25%",desc:"Worst era. Hold your positions, do not sell."},
      {type:"era",name:"Transaction Era",cgt:"20%",div:"15%",desc:"Near-zero transaction fees. Good for active trading."},
      {type:"tip",text:"💡 Watch the era timer in the top section. Plan your sells for Cap Gains or Low Tax era."},
      {type:"warning",text:"⚠️ Selling in High Tax era when you could wait = losing 20% more of your profit to the government"},
    ],
    quiz:{q:"In Capital Gains era, CGT is only 5%. When should you sell profitable stocks?",opts:["Never sell","Wait for High Tax era","Sell now while CGT is only 5%","Only sell in Normal era"],correct:2}
  },
  {
    id:5,ico:"❤️",title:"Philanthropy — Reduce Tax AND Earn Rewards",color:"#880E4F",bg:"#FCE4EC",
    subtitle:"Donating money is not just generous — it is a powerful tax strategy.",
    content:[
      {type:"step",n:1,text:"Go to the Give tab and choose a category (Education gives most points)"},
      {type:"step",n:2,text:"Donate minimum $1M — this earns Redemption Points"},
      {type:"step",n:3,text:"500 Redemption Points + 2 donations = 1 Wheel of Fortune spin token"},
      {type:"step",n:4,text:"Spin the Wheel — win 5% to 50% debt forgiveness"},
      {type:"rule",text:"Education: 25% tax relief for 5 turns + 1.5× point multiplier (best overall)"},
      {type:"rule",text:"Disaster Relief: 35% tax relief for 8 turns (highest rate, longest duration)"},
      {type:"rule",text:"Multiple donations stack — max 75% combined tax relief"},
      {type:"tip",text:"💡 Donate during High Tax era to get maximum relief when you need it most"},
      {type:"warning",text:"⚠️ Redemption points decay 1% per 100 turns and max at 5,000 — keep donating regularly"},
    ],
    quiz:{q:"What is the maximum combined tax relief you can get from philanthropy?",opts:["25%","50%","75%","100%"],correct:2}
  },
  {
    id:6,ico:"💱",title:"Forex Trading — Unlimited Risk",color:"#7C3AED",bg:"#EDE7F6",
    subtitle:"Forex is where you can make — or lose — serious money fast. No limits on position size.",
    content:[
      {type:"rule",text:"Long = you profit when the exchange rate RISES"},
      {type:"rule",text:"Short = you profit when the exchange rate FALLS"},
      {type:"rule",text:"Position size is unlimited — you can put your entire Trading Wallet on one trade"},
      {type:"step",n:1,text:"Go to Forex tab and select a currency pair (EUR/USD, GBP/USD, USD/JPY)"},
      {type:"step",n:2,text:"Choose Long or Short based on your view of where the rate is going"},
      {type:"step",n:3,text:"Select your position size (10% to 100% of Trading Wallet)"},
      {type:"step",n:4,text:"Preview shows P&L at +1% and −1% moves before you confirm"},
      {type:"step",n:5,text:"Your position updates in value every turn. Close when in profit."},
      {type:"warning",text:"⚠️ USD/AED and USD/CNY are locked — they never move (real-world pegged currencies)"},
      {type:"tip",text:"💡 Never put 100% of your Trading Wallet on one forex trade unless you are prepared to lose it all"},
    ],
    quiz:{q:"You go LONG on EUR/USD. When do you profit?",opts:["When EUR/USD falls","When EUR/USD rises","Every turn automatically","Only when you close the position"],correct:1}
  },
  {
    id:7,ico:"🏛️",title:"GSF — Your Third Wallet",color:"#F57F17",bg:"#FFF8E1",
    subtitle:"The Global Sovereign Fund earns daily interest on your deposit. Set it and forget it.",
    content:[
      {type:"rule",text:"GSF rate fluctuates between 3% and 14% per year depending on global macro"},
      {type:"rule",text:"Returns are credited to your Trading Wallet every single turn"},
      {type:"rule",text:"2% deposit fee applies when you put money in"},
      {type:"rule",text:"You can withdraw all of it anytime — no lock-in"},
      {type:"step",n:1,text:"Go to the GSF tab and tap Deposit"},
      {type:"step",n:2,text:"Choose your deposit amount (minimum $50,000)"},
      {type:"step",n:3,text:"GSF interest arrives in Trading Wallet every turn automatically"},
      {type:"tip",text:"💡 Deposit when GSF rate is high (above 10%) — you lock in more daily return"},
      {type:"tip",text:"💡 GSF is lower risk than stocks. Good place to park money during High Tax era when you are not trading."},
    ],
    quiz:{q:"Where does your daily GSF interest get credited?",opts:["GSF Wallet","Cash Wallet","Savings Wallet","Trading Wallet"],correct:3}
  },
  {
    id:8,ico:"🚀",title:"Unlocking the Solar System",color:"#455A64",bg:"#ECEFF1",
    subtitle:"Complete 5 criteria to unlock Mars, Venus, Jupiter and 4 more planets — each with its own economy.",
    content:[
      {type:"criteria",text:"Net Worth reaches $5 Billion"},
      {type:"criteria",text:"Survive to Turn 300"},
      {type:"criteria",text:"Hold stocks in 3 different world regions"},
      {type:"criteria",text:"Own 2 different bond types"},
      {type:"criteria",text:"Make at least 2 philanthropy donations"},
      {type:"rule",text:"Each planet has its own currency, companies and economic rules"},
      {type:"rule",text:"Mars: Mining economy — volatile, linked to Earth with 2-turn delay"},
      {type:"rule",text:"Jupiter: Robotic economy — highest margins but catastrophic storm events"},
      {type:"rule",text:"Saturn: Ryzolith mining — rarest ore in solar system"},
      {type:"tip",text:"💡 When Earth GDP is booming, invest in Jupiter early — the contagion effect arrives 3 turns later"},
      {type:"tip",text:"💡 Buy Jupiter companies AFTER a storm event — prices are cheapest, recovery boom follows"},
    ],
    quiz:{q:"How many criteria must you complete to unlock the Solar System?",opts:["3","4","5","7"],correct:2}
  },
  {
    id:9,ico:"👔",title:"CEO Decisions — Board Power",color:"#1A237E",bg:"#E8EAF6",
    subtitle:"Own 10%+ of a company and you get board access. Decisions shape the company's future.",
    content:[
      {type:"rule",text:"CEO decisions fire every 30 turns for companies where you own 10%+"},
      {type:"rule",text:"You have 10 turns to decide — ignore it and the worst option is auto-applied"},
      {type:"rule",text:"Each decision shows price impact % and CEO reputation impact"},
      {type:"tier",pct:"10%",label:"Board Seat",desc:"Vote on dividends. Attend board meetings. Receive advance notice of decisions."},
      {type:"tier",pct:"25%",label:"Significant Control",desc:"Propose strategic initiatives. Veto major acquisitions. Nominate directors."},
      {type:"tier",pct:"50%+",label:"Majority Control",desc:"Replace the CEO. Declare special dividends. Force asset sales."},
      {type:"warning",text:"⚠️ CEO reputation below 50/100 means poor decisions — consider replacing at 50% ownership"},
      {type:"tip",text:"💡 Good CEOs with 80+ reputation make better random decisions even without your input"},
    ],
    quiz:{q:"What happens if you ignore a CEO decision for 10 turns?",opts:["Nothing","Best option applied automatically","Worst option applied + CEO rep −5","Company goes bankrupt"],correct:2}
  },
  {
    id:10,ico:"🎡",title:"Bankruptcy & Recovery",color:"#B71C1C",bg:"#FFEBEE",
    subtitle:"If net worth goes negative, the system activates. Here is how to survive.",
    content:[
      {type:"rule",text:"Yellow Alert: Net worth below $100K — warning only"},
      {type:"rule",text:"Orange Alert: Net worth negative — forced liquidation begins (10% of Trading Wallet per turn)"},
      {type:"rule",text:"Red: Net worth below −$500K — BANKRUPT. Game over unless you have Foundation."},
      {type:"rule",text:"Foundation protects Savings Wallet — even in full bankruptcy it is never touched"},
      {type:"step",n:1,text:"If liquidation starts — stop buying, transfer Trading → Cash immediately"},
      {type:"step",n:2,text:"Sell your worst-performing positions to raise cash"},
      {type:"step",n:3,text:"Use philanthropy to earn Wheel of Fortune tokens"},
      {type:"step",n:4,text:"Spin the wheel — up to 50% debt forgiveness possible"},
      {type:"step",n:5,text:"7-day login streak gives 10% debt forgiveness + 1 free spin"},
      {type:"tip",text:"💡 Open a Foundation early ($10K) — best insurance policy in the game"},
    ],
    quiz:{q:"At what net worth does forced liquidation begin?",opts:["Below $100K","When net worth goes negative","Below −$250K","Below −$500K"],correct:1}
  },
];

export default function BeginnersGuide(){
  const[step,setStep]=useState(0);
  const[answered,setAnswered]=useState(null);
  const[score,setScore]=useState(0);
  const[showScore,setShowScore]=useState(false);
  const s=STEPS[step];

  const handleAnswer=(idx)=>{
    if(answered!==null)return;
    setAnswered(idx);
    if(idx===s.quiz.correct)setScore(sc=>sc+1);
  };

  const next=()=>{
    if(step<STEPS.length-1){setStep(st=>st+1);setAnswered(null);}
    else setShowScore(true);
  };

  if(showScore)return(
    <div style={{maxWidth:430,margin:"0 auto",background:"#0F172A",minHeight:"100vh",fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{fontSize:60,marginBottom:16}}>🏆</div>
      <div style={{fontSize:24,fontWeight:800,color:"#F8FAFC",marginBottom:8,textAlign:"center"}}>Guide Complete!</div>
      <div style={{fontSize:16,color:"#94A3B8",marginBottom:24,textAlign:"center"}}>You scored {score}/{STEPS.length} on the quiz questions</div>
      <div style={{background:score>=8?"#14532D":score>=5?"#78350F":"#7F1D1D",borderRadius:16,padding:20,width:"100%",textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:32,fontWeight:800,color:"#fff",marginBottom:6}}>{score>=8?"Master Investor 🌟":score>=5?"Developing Trader 📈":"Keep Studying 📚"}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.8)"}}>{score>=8?"You understand the game mechanics. Ready to build your galactic empire.":score>=5?"Good foundation. Review the tax era and philanthropy sections again.":"Re-read the guide and try again. The tax system is key."}</div>
      </div>
      <button onClick={()=>{setStep(0);setAnswered(null);setScore(0);setShowScore(false);}} style={{width:"100%",background:"#1D4ED8",color:"#fff",border:"none",borderRadius:12,padding:14,fontWeight:700,fontSize:14,cursor:"pointer"}}>Restart Guide</button>
      <div style={{marginTop:20,fontSize:12,color:"#475569",textAlign:"center",lineHeight:1.6}}>Now open the game and apply what you learned. Start with stocks in the STRONG BUY category, watch your tax era, and open a Foundation early.</div>
    </div>
  );

  return(
    <div style={{maxWidth:430,margin:"0 auto",background:"#0F172A",minHeight:"100vh",fontFamily:"system-ui,sans-serif"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,"+s.color+","+s.color+"CC)",padding:"16px 16px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:1.5}}>Step {s.id} of {STEPS.length}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>Score: {score}/{step}</div>
        </div>
        {/* Progress bar */}
        <div style={{height:4,background:"rgba(255,255,255,.2)",borderRadius:2,marginBottom:14,overflow:"hidden"}}>
          <div style={{height:"100%",width:((step+1)/STEPS.length*100)+"%",background:"rgba(255,255,255,.8)",borderRadius:2,transition:"width .3s"}}/>
        </div>
        <div style={{fontSize:32,marginBottom:8}}>{s.ico}</div>
        <div style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:4}}>{s.title}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.8)",lineHeight:1.5}}>{s.subtitle}</div>
      </div>

      <div style={{padding:16,display:"flex",flexDirection:"column",gap:10}}>
        {/* Content items */}
        {s.content.map((item,i)=>{
          if(item.type==="rule")return <div key={i} style={{background:"rgba(255,255,255,.05)",borderRadius:10,padding:"10px 13px",border:"1px solid rgba(255,255,255,.08)",display:"flex",gap:10,alignItems:"flex-start"}}><span style={{fontSize:16,flexShrink:0}}>📌</span><div style={{fontSize:13,color:"#E2E8F0",lineHeight:1.6}}>{item.text}</div></div>;
          if(item.type==="tip")return <div key={i} style={{background:"rgba(22,163,74,.1)",borderRadius:10,padding:"10px 13px",border:"1px solid rgba(22,163,74,.2)",display:"flex",gap:10,alignItems:"flex-start"}}><span style={{fontSize:14,flexShrink:0}}>💡</span><div style={{fontSize:13,color:"#86EFAC",lineHeight:1.6}}>{item.text.replace("💡 ","")}</div></div>;
          if(item.type==="warning")return <div key={i} style={{background:"rgba(220,38,38,.1)",borderRadius:10,padding:"10px 13px",border:"1px solid rgba(220,38,38,.2)",display:"flex",gap:10,alignItems:"flex-start"}}><span style={{fontSize:14,flexShrink:0}}>⚠️</span><div style={{fontSize:13,color:"#FCA5A5",lineHeight:1.6}}>{item.text.replace("⚠️ ","")}</div></div>;
          if(item.type==="step")return <div key={i} style={{background:"rgba(255,255,255,.04)",borderRadius:10,padding:"10px 13px",border:"1px solid rgba(255,255,255,.06)",display:"flex",gap:12,alignItems:"flex-start"}}><div style={{width:26,height:26,borderRadius:8,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff",flexShrink:0}}>{item.n}</div><div style={{fontSize:13,color:"#E2E8F0",lineHeight:1.6,paddingTop:2}}>{item.text}</div></div>;
          if(item.type==="wallet")return <div key={i} style={{background:"rgba(255,255,255,.05)",borderRadius:10,padding:"10px 13px",border:"1px solid rgba(255,255,255,.08)"}}><div style={{fontSize:13,fontWeight:700,color:item.color,marginBottom:4}}>{item.name}</div><div style={{fontSize:12,color:"#94A3B8",lineHeight:1.5}}>{item.detail}</div></div>;
          if(item.type==="era")return <div key={i} style={{background:"rgba(255,255,255,.04)",borderRadius:10,padding:"10px 13px",border:"1px solid rgba(255,255,255,.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:"#F8FAFC"}}>{item.name}</div><div style={{fontSize:11,color:"#64748B",marginTop:2}}>{item.desc}</div></div><div style={{textAlign:"right",flexShrink:0,marginLeft:10}}><div style={{fontSize:11,color:"#86EFAC",fontWeight:700}}>CGT {item.cgt}</div><div style={{fontSize:11,color:"#FDE68A"}}>Div {item.div}</div></div></div>;
          if(item.type==="criteria")return <div key={i} style={{background:"rgba(255,255,255,.04)",borderRadius:10,padding:"10px 13px",border:"1px solid rgba(255,255,255,.06)",display:"flex",gap:10,alignItems:"center"}}><div style={{width:22,height:22,borderRadius:6,background:"rgba(159,122,234,.2)",border:"1px solid rgba(159,122,234,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#C4B5FD",flexShrink:0}}>★</div><div style={{fontSize:13,color:"#E2E8F0"}}>{item.text}</div></div>;
          if(item.type==="tier")return <div key={i} style={{background:"rgba(255,255,255,.04)",borderRadius:10,padding:"10px 13px",border:"1px solid rgba(255,255,255,.06)"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:700,color:"#F8FAFC"}}>{item.label}</span><span style={{fontSize:12,fontWeight:700,color:"#C4B5FD",background:"rgba(124,58,237,.2)",padding:"1px 8px",borderRadius:10}}>{item.pct}</span></div><div style={{fontSize:12,color:"#64748B",lineHeight:1.5}}>{item.desc}</div></div>;
          return null;
        })}

        {/* Quiz */}
        <div style={{background:"rgba(255,255,255,.06)",borderRadius:14,padding:14,border:"1px solid rgba(255,255,255,.1)",marginTop:4}}>
          <div style={{fontSize:11,color:"#9F7AEA",textTransform:"uppercase",letterSpacing:1,marginBottom:8,fontWeight:700}}>Quick Check</div>
          <div style={{fontSize:14,fontWeight:600,color:"#F8FAFC",marginBottom:12,lineHeight:1.5}}>{s.quiz.q}</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {s.quiz.opts.map((opt,i)=>{
              const isCorrect=i===s.quiz.correct;
              const isSelected=i===answered;
              const revealed=answered!==null;
              return <button key={i} onClick={()=>handleAnswer(i)} disabled={answered!==null} style={{padding:"11px 13px",borderRadius:10,border:"2px solid "+(revealed?(isCorrect?"#16A34A":isSelected?"#DC2626":"rgba(255,255,255,.08)"):"rgba(255,255,255,.1)"),background:revealed?(isCorrect?"rgba(22,163,74,.2)":isSelected?"rgba(220,38,38,.15)":"rgba(255,255,255,.03)"):"rgba(255,255,255,.05)",color:revealed?(isCorrect?"#86EFAC":isSelected?"#FCA5A5":"#475569"):"#E2E8F0",textAlign:"left",fontWeight:revealed&&isCorrect?700:400,fontSize:13,cursor:answered===null?"pointer":"default",transition:"all .2s"}}>
                {revealed&&isCorrect?"✅ ":revealed&&isSelected&&!isCorrect?"❌ ":""}{opt}
              </button>;
            })}
          </div>
          {answered!==null&&<div style={{marginTop:10,padding:"8px 11px",background:answered===s.quiz.correct?"rgba(22,163,74,.15)":"rgba(220,38,38,.15)",borderRadius:8,fontSize:12,color:answered===s.quiz.correct?"#86EFAC":"#FCA5A5"}}>{answered===s.quiz.correct?"✅ Correct! "+( step<STEPS.length-1?"Press Next to continue.":"You've finished all steps!"):"❌ Not quite. The correct answer is highlighted above."}</div>}
        </div>

        {/* Navigation */}
        <div style={{display:"flex",gap:8,marginTop:4}}>
          {step>0&&<button onClick={()=>{setStep(st=>st-1);setAnswered(null);}} style={{flex:1,background:"rgba(255,255,255,.08)",color:"#94A3B8",border:"1px solid rgba(255,255,255,.1)",borderRadius:11,padding:"13px 0",fontWeight:700,fontSize:13,cursor:"pointer"}}>← Back</button>}
          <button onClick={next} disabled={answered===null} style={{flex:2,background:answered===null?"rgba(255,255,255,.05)":"linear-gradient(135deg,"+s.color+","+s.color+"CC)",color:answered===null?"#475569":"#fff",border:"none",borderRadius:11,padding:"13px 0",fontWeight:800,fontSize:14,cursor:answered===null?"not-allowed":"pointer",transition:"all .2s"}}>
            {answered===null?"Answer the question to continue":step<STEPS.length-1?"Next Step →":"See My Score 🏆"}
          </button>
        </div>

        {/* Step dots */}
        <div style={{display:"flex",justifyContent:"center",gap:5,paddingBottom:8}}>
          {STEPS.map((_,i)=><div key={i} style={{width:i===step?20:7,height:7,borderRadius:4,background:i<step?"#16A34A":i===step?s.color:"rgba(255,255,255,.1)",transition:"all .3s"}}/>)}
        </div>
      </div>
    </div>
  );
}
