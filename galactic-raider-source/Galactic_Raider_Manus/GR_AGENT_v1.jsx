import{useState,useRef,useCallback}from"react";
const DK="#0F172A",G="#16A34A",R="#DC2626",BL="#1D4ED8",AU="#D97706";
const WIKI=`
# GALACTIC RAIDER GAME WIKI

## WALLETS (4 total)
**Cash Wallet** — Day-to-day spending, tax payments. No interest. Withdraw anytime.
**Savings Wallet** — Interest-bearing (2%/year). Protected by Foundation if opened. Minimum $10K to keep protected.
**Trading Wallet** — All investments draw from here. Stocks, bonds, crypto, commodities, ETFs, IPOs, planet funds.
**Foundation** — Bankruptcy protection. Costs $50,000 one-time from Cash Wallet. Shields Savings Wallet from liquidation if you go bankrupt.

## TRANSFERRING BETWEEN WALLETS
Use the Wallet Transfer buttons on Home screen. Choose direction (Cash→Trade, Trade→Savings, etc). Select percentage (10%, 25%, 50%, 100%). Confirm. Instant transfer.

## STOCKS — BUYING & SELLING
Markets tab shows 10 companies sorted by analyst rating/dividend/price/gainers/losers. Tap a company to see analyst opinions, founder story, share structure, your ownership %. 
BUY: Select quantity (buttons show presets), confirm, cost deducted from Trading Wallet.
SELL: Tap "Sell All" or select quantity. P&L calculated. Capital gains tax applied (depends on tax era). Net proceeds go to Trading Wallet.

## BONDS
Bonds tab shows 5 bonds (Treasury, EU, Corporate, African, Emerging Market). Each has a rating (AAA-B), coupon rate, yield, maturity date.
BUY: Select quantity (×1, ×5, ×10, ×50 buttons). Pay from Trading Wallet.
SELL: Tap "Sell" to liquidate. Price = face value adjusted for current yield.
Coupons pay quarterly every 30 turns automatically to Trading Wallet.

## COMMODITIES & CRYPTO
Assets tab (Commodities section): Oil, Gold, Lithium. Volatile, move daily.
Crypto section: Bitcoin, Ethereum. Much higher volatility than stocks.
BUY/SELL: Same as stocks. Tap asset, select quantity, confirm.

## FOREX (CURRENCY TRADING)
Assets tab bottom. EUR/USD, GBP/USD, USD/JPY. Long or Short positions.
OPEN: Select currency pair. Choose Long (bet price goes up) or Short (bet price goes down). Choose amount (10%, 25%, 50%, 100% of Trading Wallet). Confirm.
CLOSE: Tap "Close" button. P&L calculated instantly. Net proceeds return to Trading Wallet.

## ETFs
ETF/IPO tab. 3 ETFs: Global Equity, Dividend Income, Mining & Resources.
BUY: Select units. Choose from preset buttons. Confirm. Cost from Trading Wallet.
SELL: Tap "Sell All" to close position. P&L calculated.
Dividends: Distributed quarterly (every 30 turns) to Savings Wallet automatically.

## IPO BOOKINGS
IPO/IPO tab. Pipeline shows 2 IPOs staggered at Turn 60 and Turn 150.
BOOK: Before listing opens, tap "Book [quantity]". Cost reserved from Trading Wallet. 85% allocation typical.
LISTING: On opening turn, shares automatically sell at IPO price. Proceeds credited to Trading Wallet.
Your booked IPOs show in Portfolio tab.

## PLANET SOVEREIGN FUNDS
Funds tab. Earth (12.48%/yr), Jupiter (24.8%/yr), Mars (18.4%/yr).
DEPOSIT: Tap "+ Deposit", choose amount ($50K min), confirm. 2% fee deducted, net amount deposits.
EARN: Every turn, fund balance earns interest automatically. Credited to Trading Wallet.
WITHDRAW: Tap "Withdraw" to pull out balance. Returns to Trading Wallet.

## TAX ERAS
Home screen shows current era (Normal, High Tax, Low Tax, Capital Gains, Dividend, etc). Changes every 60 turns.
Capital Gains Tax (CGT) varies 5%–30% depending on era. Applied when you sell stocks/bonds/crypto/commodities at a profit.
Dividend Tax varies 5%–25%. Applied to dividend payouts from stocks and ETFs.
Philanthropy: If you donate (via Redemption wheel), you unlock tax relief (up to 75% tax reduction).

## PORTFOLIO
Portfolio tab shows complete holdings: stocks (with P&L), ETFs (with P&L), bonds, crypto, commodities, forex positions, IPO bookings, planet fund deposits.
All positions show entry price, current value, and unrealised P&L.

## NEWS
News tab. Two channels: Earth Feed (all game events) and My Events (your personal trades/dividends/alerts).
Filter by channel. Scroll through 30 most recent events.

## TUTORIAL
On first launch, a 7-step interactive tutorial walks through: wallets, tax eras, buying stocks, bonds, planet funds, diversification, and readiness to play.
Skip anytime. Return by restarting the game.

## GAME SPEED
Home screen controls. .5s, 1s, 5s, 10s, 1min per turn. Auto-sim runs continuously at selected speed.
Manual turn: Tap "▶ Next Turn" to advance one turn at a time.

## WEALTH & BANKRUPTCY
Liquidation: If net worth goes negative, forced 10% liquidation per turn from Trading Wallet.
Bankruptcy: If net worth drops below −$500K, game over (bankruptcy reached).
Foundation: Protects Savings Wallet during liquidation if opened. Prevents total loss.

## WINNING
Build net worth to $5B+ to unlock Solar System expansion (6 new planets, new market mechanics, new assets).
No hard end condition — play indefinitely, grow wealth, explore strategy.
`;

const SCREENS=[
  {id:"home",name:"Home",desc:"Net worth display, wallet balances, tax era, speed controls, wallet transfers"},
  {id:"market",name:"Markets",desc:"10 companies, analyst ratings, buy/sell stocks"},
  {id:"stocks",name:"Stock Detail",desc:"Company story, analyst opinions, share structure, your position"},
  {id:"bonds",name:"Bonds",desc:"Treasury, corporate, emerging market bonds, buy/sell"},
  {id:"comm",name:"Commodities & Crypto",desc:"Oil, Gold, Lithium, Bitcoin, Ethereum, Forex"},
  {id:"etf",name:"ETF & IPO",desc:"3 ETFs, 2 IPO bookings, distributions"},
  {id:"funds",name:"Planet Funds",desc:"Earth, Jupiter, Mars sovereign funds, deposits, withdrawals"},
  {id:"port",name:"Portfolio",desc:"All holdings, P&L, complete position breakdown"},
  {id:"news",name:"News",desc:"Earth Feed and My Events, game log"},
];

export default function GalacticRaiderAgent(){
  const[screen,setScreen]=useState("home");
  const[question,setQuestion]=useState("");
  const[answer,setAnswer]=useState(null);
  const[loading,setLoading]=useState(false);
  const[thinking,setThinking]=useState("");
  const answerRef=useRef(null);

  const askAgent=useCallback(async()=>{
    if(!question.trim()){alert("Ask a question");return;}
    setLoading(true);
    setThinking("🤖 Thinking...");
    setAnswer(null);
    try{
      const screenInfo=SCREENS.find(s=>s.id===screen);
      const systemPrompt=`You are the Galactic Raider AI Agent. You have access to the complete game wiki. Your job is to answer player questions with MAXIMUM 3 LINES of text. Be direct, helpful, warm, never lecture. 

CRITICAL RULES:
- Answer ONLY questions about Galactic Raider
- Maximum 3 lines (break lines with \n)
- Screen context: ${screenInfo.name} — ${screenInfo.desc}
- Use screen context to answer. If they ask "how do I sell" on the Stocks screen, explain selling stocks. If on Bonds screen, explain selling bonds.
- If answer needs more detail, end with "See full guide in wiki"
- Never give unsolicited information
- Sound like a knowledgeable friend, not a robot
- Use emojis sparingly (max 1)

WIKI KNOWLEDGE BASE:
${WIKI}

Answer the player's question now. Max 3 lines. Start answering immediately.`;
      
      const response=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:300,
          system:systemPrompt,
          messages:[{role:"user",content:`Screen: ${screenInfo.name}\nQuestion: ${question}`}],
        }),
      });
      
      if(!response.ok){
        setAnswer("⚠️ API error. Try again.");
        setThinking("");
        setLoading(false);
        return;
      }
      
      const data=await response.json();
      const text=data.content?.[0]?.text||"No response";
      setAnswer(text);
      setThinking("");
    }catch(e){
      setAnswer("❌ Error: "+e.message);
      setThinking("");
    }
    setLoading(false);
  },[question,screen]);

  return <div style={{maxWidth:480,margin:"0 auto",background:"linear-gradient(135deg,#0F172A,#1E293B)",minHeight:"100vh",fontFamily:"system-ui",color:"#F8FAFC",padding:20,display:"flex",flexDirection:"column"}}>
    {/* Header */}
    <div style={{marginBottom:24,textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:8}}>🤖</div>
      <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>Galactic Raider Agent</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>Context-aware game assistant</div>
    </div>

    {/* Screen selector */}
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>What screen are you on?</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
        {SCREENS.map(s=><button key={s.id} onClick={()=>setScreen(s.id)} style={{padding:"10px 12px",borderRadius:10,border:"2px solid "+(screen===s.id?G:"rgba(255,255,255,.1)"),background:screen===s.id?"rgba(22,163,74,.15)":"transparent",color:screen===s.id?"#86EFAC":"rgba(255,255,255,.5)",fontWeight:700,fontSize:11,cursor:"pointer",textAlign:"center",lineHeight:1.3}}>{s.name}</button>)}
      </div>
      <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginTop:8}}>{SCREENS.find(s=>s.id===screen)?.desc}</div>
    </div>

    {/* Question input */}
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Your question</div>
      <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="E.g. How do I withdraw money? What does the Foundation do? How do I buy stocks?" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.04)",color:"#F8FAFC",fontSize:13,fontFamily:"inherit",resize:"none",minHeight:80,outline:"none",boxSizing:"border-box"}} onKeyDown={e=>{if(e.key==="Enter"&&e.ctrlKey)askAgent();}}/>
      <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:6}}>Tip: Be specific. "How do I sell stocks?" works better than "How do I sell?"</div>
    </div>

    {/* Ask button */}
    <button onClick={askAgent} disabled={loading||!question.trim()} style={{padding:"14px 0",borderRadius:12,border:"none",background:loading||!question.trim()?"rgba(255,255,255,.05)":G,color:loading||!question.trim()?"rgba(255,255,255,.3)":"#fff",fontWeight:800,fontSize:15,cursor:loading||!question.trim()?"not-allowed":"pointer",marginBottom:16}}>
      {loading?"🔄 Thinking...":"Ask Agent"}
    </button>

    {/* Thinking animation */}
    {thinking&&<div style={{padding:14,background:"rgba(124,58,237,.15)",borderRadius:10,border:"1px solid rgba(124,58,237,.3)",marginBottom:16,textAlign:"center",fontSize:13,color:"#C4B5FD"}}>{thinking}</div>}

    {/* Answer */}
    {answer&&<div ref={answerRef} style={{padding:16,background:"rgba(22,163,74,.15)",borderRadius:12,border:"1px solid rgba(22,163,74,.3)",lineHeight:1.7,fontSize:13,whiteSpace:"pre-wrap",wordWrap:"break-word",color:"#F8FAFC"}}>
      {answer}
    </div>}

    {/* Info */}
    <div style={{marginTop:24,padding:14,background:"rgba(29,78,216,.1)",borderRadius:10,border:"1px solid rgba(29,78,216,.2)",fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:1.6}}>
      <div style={{fontWeight:700,color:"#93C5FD",marginBottom:6}}>ℹ️ How the Agent works</div>
      The agent knows the complete Galactic Raider wiki. It answers your question in MAX 3 LINES based on your current screen. Answers are specific to the game and screen you selected. Ask anything about wallets, stocks, bonds, ETFs, IPOs, planet funds, taxes, portfolio, or gameplay mechanics.
    </div>

    {/* Test questions */}
    <div style={{marginTop:20}}>
      <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Quick test questions</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {[
          {s:"home",q:"How do I transfer money between wallets?"},
          {s:"market",q:"What does analyst rating mean?"},
          {s:"bonds",q:"When do bonds pay coupons?"},
          {s:"etf",q:"How do I book an IPO?"},
          {s:"funds",q:"What's the minimum to deposit in planet funds?"},
          {s:"port",q:"How do I calculate my P&L?"},
        ].map((item,i)=><button key={i} onClick={()=>{setScreen(item.s);setQuestion(item.q);setTimeout(()=>document.querySelector('textarea').focus(),0);}} style={{padding:"10px 12px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.7)",fontSize:11,textAlign:"left",cursor:"pointer",transition:"all .2s"}}>
          "{item.q.substring(0,45)}..."
        </button>)}
      </div>
    </div>
  </div>;
}
