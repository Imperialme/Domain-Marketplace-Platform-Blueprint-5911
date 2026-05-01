import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS & DATA
// ═══════════════════════════════════════════════════════════════════

const SC = 1_000_000;
const G="#2E7D32",R="#C62828",AU="#F9A825",BL="#1565C0",PU="#6A1B9A",DK="#0D1B2A";
const fmt = n => {
  const a = Math.abs(n);
  if(a>=1e12) return (n<0?"-":"")+"$"+(a/1e12).toFixed(2)+"T";
  if(a>=1e9)  return (n<0?"-":"")+"$"+(a/1e9).toFixed(2)+"B";
  if(a>=1e6)  return (n<0?"-":"")+"$"+(a/1e6).toFixed(2)+"M";
  if(a>=1e3)  return (n<0?"-":"")+"$"+(a/1e3).toFixed(1)+"K";
  return (n<0?"-":"")+"$"+a.toFixed(2);
};
const pct = n => (n>=0?"+":"")+((n||0)*100).toFixed(2)+"%";
const clr = n => n>=0?G:R;

const COS = [
  {t:"SLKT",n:"Silk Road Tech",s:"Technology",r:"Asia Pacific",p:348.94,pe:18.4,div:0.8,mg:0.224,beta:1.8,emp:125000,yr:2008,hq:"Singapore",desc:"AI, cloud and semiconductors across Asia Pacific. 125,000 employees across 18 countries."},
  {t:"MRDB",n:"Meridian Bank",s:"Banking",r:"US",p:85.20,pe:12.1,div:2.1,mg:0.22,beta:0.9,emp:45000,yr:1985,hq:"New York",desc:"Mid-size US commercial bank. Retail, corporate and investment banking divisions."},
  {t:"FRMN",n:"Frontier Mining",s:"Mining",r:"Africa",p:15.80,pe:8.5,div:0.5,mg:0.12,beta:1.6,emp:28000,yr:2005,hq:"Johannesburg",desc:"Diversified African mining across iron ore, rare earth and lithium deposits."},
  {t:"TNPT",n:"Titan Petroleum",s:"Energy",r:"Emerging Markets",p:351.54,pe:11.3,div:1.8,mg:0.18,beta:1.2,emp:62000,yr:1995,hq:"Dubai",desc:"Major petroleum producer and refiner across Middle East and Central Asia."},
  {t:"AGRO",n:"AgroLatin Corp",s:"Agriculture",r:"Latin America",p:42.18,pe:13.2,div:2.5,mg:0.09,beta:1.1,emp:18000,yr:1975,hq:"São Paulo",desc:"Largest agricultural conglomerate in Latin America — soy, corn, cattle, sugar."},
  {t:"MDCR",n:"MediCore Group",s:"Healthcare",r:"US",p:198.40,pe:22.1,div:1.2,mg:0.26,beta:0.8,emp:38000,yr:2005,hq:"Boston",desc:"Medical devices, diagnostics and hospital services across North America."},
  {t:"CLFL",n:"ClearFlame Energy",s:"Energy",r:"Europe",p:112.30,pe:14.8,div:2.0,mg:0.20,beta:1.1,emp:22000,yr:2010,hq:"Amsterdam",desc:"Renewable and conventional energy across Europe — solar, wind, natural gas."},
  {t:"AXMB",n:"Axum Biotech",s:"Healthcare",r:"Africa",p:68.50,pe:19.4,div:0.6,mg:0.21,beta:1.4,emp:8500,yr:2012,hq:"Addis Ababa",desc:"Biotech focused on tropical disease treatments and African genomic research."},
  {t:"PCMN",n:"Pacific Manufacturing",s:"Manufacturing",r:"Asia Pacific",p:76.20,pe:15.6,div:1.3,mg:0.14,beta:1.0,emp:55000,yr:1988,hq:"Seoul",desc:"Electronics and automotive parts manufacturing across Pacific Rim."},
  {t:"NRDX",n:"Nordic Exchange Bank",s:"Banking",r:"Europe",p:132.10,pe:11.8,div:2.4,mg:0.21,beta:0.8,emp:32000,yr:1975,hq:"Stockholm",desc:"Pan-European financial services — retail, institutional, wealth management."},
  {t:"UTLS",n:"Utility Systems Corp",s:"Utilities",r:"US",p:58.40,pe:14.2,div:4.2,mg:0.22,beta:0.5,emp:12000,yr:1950,hq:"Chicago",desc:"US electric and gas utility serving 3 million customers across the Midwest."},
  {t:"RLST",n:"RealEstate Trust",s:"Real Estate",r:"US",p:44.20,pe:12.8,div:3.8,mg:0.32,beta:0.7,emp:2800,yr:1995,hq:"Dallas",desc:"REIT — commercial and industrial properties across Sun Belt and Mid-Atlantic."},
  {t:"TLCM",n:"TeleCom Europe",s:"Telecom",r:"Europe",p:88.60,pe:13.5,div:4.5,mg:0.28,beta:0.6,emp:48000,yr:1985,hq:"Frankfurt",desc:"Pan-European telecoms — mobile, broadband, enterprise and IoT solutions."},
  {t:"RETL",n:"RetailHub Inc",s:"Retail",r:"US",p:38.90,pe:14.0,div:1.5,mg:0.08,beta:1.2,emp:85000,yr:2000,hq:"Seattle",desc:"Omnichannel retail — 1,200 stores across North America plus online marketplace."},
  {t:"EMTS",n:"Emerging Tech Solutions",s:"Technology",r:"Emerging Markets",p:28.40,pe:22.0,div:0.2,mg:0.15,beta:2.0,emp:6500,yr:2015,hq:"Mumbai",desc:"B2B SaaS and cloud infrastructure for South and Southeast Asian enterprises."},
];

const BONDS_D = [
  {id:"US10Y",iss:"US Treasury 10Y",rat:"AAA",cou:4.5,mat:2034,oy:4.5,fv:1000,desc:"US government sovereign bond — highest credit quality, zero default risk."},
  {id:"EU10Y",iss:"EU Government 10Y",rat:"AA",cou:3.8,mat:2034,oy:3.8,fv:1000,desc:"European Union pooled sovereign bond — AA rated, strong institutional demand."},
  {id:"SLKT-B1",iss:"Silk Road Tech Bond",rat:"AA",cou:5.2,mat:2031,oy:5.2,fv:1000,desc:"SLKT corporate bond — AA rated, premium yield over sovereign. 5-year maturity."},
  {id:"MRDB-B1",iss:"Meridian Bank Bond",rat:"AAA",cou:4.0,mat:2030,oy:4.0,fv:1000,desc:"MRDB covered bond backed by mortgage pool — AAA rated, bank issued."},
  {id:"AFR5Y",iss:"African Govt Bond 5Y",rat:"BB",cou:12.5,mat:2029,oy:12.5,fv:1000,desc:"Frontier market sovereign bond — high yield, high risk. Speculative grade BB."},
  {id:"EM10Y",iss:"Emerging Market Bond",rat:"B",cou:14.8,mat:2032,oy:14.8,fv:1000,desc:"Emerging market corporate — B rated. Highest yield available. Significant default risk."},
];

const EARTH_MODULES = [
  {id:1,n:"Markets & P/E Ratios",q:"SLKT trades at $348, EPS $18.95. Tech P/E ceiling = 35x. Max allowed price?",opts:["$348","$662","$500","$418"],ans:1,exp:"Max = EPS × ceiling = $18.95 × 35 = $662.25. SLKT at P/E 18.4x is well within bounds."},
  {id:2,n:"Bonds & Interest Rates",q:"Bond: Face $1,000, Orig yield 4%, Current yield 3%. Governor formula price?",opts:["$1,000","$1,200","$1,333","$750"],ans:2,exp:"Price = $1,000 × (4÷3) = $1,333. Yields fall → prices rise. Governor Formula 4."},
  {id:3,n:"Diversification",q:"Portfolio: 80% SLKT (Tech). Tech Regulation event fires. Best action?",opts:["Hold — SLKT recovers","Sell all immediately","Reduce to 30%, diversify across sectors","Buy more at the dip"],ans:2,exp:"Over-concentration creates massive sector event risk. Reduce to 30% to limit damage."},
  {id:4,n:"Tax Strategy",q:"You earn $500K capital gains. Which strategy legally reduces your tax bill most?",opts:["Pay full 20% CGT","Offset with $200K losses elsewhere","Donate $100K to philanthropy","Hold assets longer for lower rate"],ans:1,exp:"Loss harvesting offsets gains directly. $200K in losses reduces taxable gain to $300K, saving $40K."},
  {id:5,n:"Commodities",q:"Oil spikes 40% due to Middle East conflict. Which portfolio benefits MOST?",opts:["MDCR (Healthcare)","TNPT (Petroleum) + CLFL (Energy)","UTLS (Utilities)","RETL (Retail)"],ans:1,exp:"Energy producers benefit directly from oil price spikes. TNPT and CLFL both have direct oil exposure."},
  {id:6,n:"Forex & Currency Risk",q:"You hold SLKT (Singapore-based). USD strengthens 15% vs SGD. Revenue impact?",opts:["Revenue up 15% in USD","Revenue down 15% in USD terms","No impact — stock is local","Revenue up 7.5%"],ans:1,exp:"When USD strengthens, foreign-currency revenue converts to fewer dollars. SLKT's SGD revenue = -15% in USD terms."},
  {id:7,n:"Startups & Venture Capital",q:"You seed a startup at $500K for 10% equity. It IPOs at $20M valuation. Your return?",opts:["$500K return","$1.5M profit","$1.5M profit (10% of $20M - cost)","$2M return"],ans:2,exp:"10% of $20M = $2M value. Less $500K cost = $1.5M profit. 3x return on seed investment."},
  {id:8,n:"Reading Company Financials",q:"SLKT: Revenue $45B, COGS $18B, OpEx $12B, Interest $2B, Tax 21%. Net income?",opts:["$15B","$10.3B","$9.75B","$12B"],ans:2,exp:"Gross: $27B. Operating: $15B. After interest: $13B. After 21% tax: $13B × 0.79 = $10.27B ≈ $9.75B."},
  {id:9,n:"Economic Cycles",q:"GDP contracts for 2 consecutive quarters. Interest rates rise. Best defensive sector?",opts:["Technology","Healthcare + Utilities","Mining","Retail"],ans:1,exp:"Healthcare (non-cyclical demand) and Utilities (regulated revenue) are classic recession-resistant sectors."},
  {id:10,n:"Global Sovereign Fund",q:"GSF rate = 12.48% annual. You deposit $5M. Monthly return credited to cash?",opts:["$52,000","$5,200","$62,400","$52,000"],ans:0,exp:"Monthly = $5M × (12.48% ÷ 12) = $5,000,000 × 0.0104 = $52,000 per turn."},
  {id:11,n:"Legacy Building",q:"You reach $10B net worth. Governor applies wealth tax. Rate and annual cost?",opts:["0.1%/year — $10M","1%/year — $100M","0.1%/turn — $10M/turn","0.5%/year — $50M"],ans:2,exp:"0.1% per TURN on net worth above $10B. At exactly $10B that is $10M per turn — applies from turn 1."},
  {id:12,n:"Holdings Company & M&A",q:"You acquire 51% of FRMN via hostile takeover. What governance rights do you now have?",opts:["Voting rights only","Board control, CEO appointment, strategic direction","Dividend priority only","None — public company rules apply"],ans:1,exp:"51%+ = controlling stake. You appoint board, CEO, set strategy and capital allocation. This is the 25%+ DEE tier."},
  {id:13,n:"Space Economics Preview",q:"You invest in Mars mining (MCR currency). Earth-Mars repatriation tax rate?",opts:["0%","2% Earth→Space · 5% Space→Earth","5% both ways","10% both ways"],ans:1,exp:"Approved rates: 2% Earth→Space · 5% Space→Earth. The higher return tax reflects interplanetary risk premium."},
  {id:14,n:"Advanced Portfolio Theory",q:"Portfolio A: Sharpe ratio 1.8, beta 0.7. Portfolio B: return 28%, beta 1.9. Which is superior?",opts:["Portfolio B — higher return","Portfolio A — better risk-adjusted return","Equal","Depends on market cycle"],ans:1,exp:"Sharpe ratio of 1.8 means 1.8% excess return per unit of risk. Portfolio B's 28% comes with nearly 3x the market risk."},
  {id:15,n:"Capstone",q:"Your net worth: $4.8B. You need Solar unlock ($5B NW required). Fastest strategy?",opts:["Buy more SLKT shares","Deploy GSF deposit to compound","Use credit line to leverage into high-beta stocks","Donate to philanthropy for tax savings"],ans:1,exp:"GSF at 12.48% annually compounds automatically each turn. Credit line leverage on high-beta also works but adds risk. GSF is the clean path."},
];

const SOLAR_MODULES = [
  {id:16,n:"Mars",ico:"🔴",desc:"30 mining companies · MCR currency · 3.71 m/s² gravity · Iron oxide surface"},
  {id:17,n:"Venus",ico:"🟡",desc:"30 manufacturing companies · VNU currency · 465°C surface · 92 bar pressure"},
  {id:18,n:"Jupiter",ico:"🟠",desc:"30 research companies · JVT currency · Fusion energy · 88,846 mile diameter"},
  {id:19,n:"Saturn",ico:"🪐",desc:"30 ring mining companies · STC currency · 282,000 km rings · Ryzolith ore"},
  {id:20,n:"Mercury",ico:"☿",desc:"30 solar energy companies · MRC currency · 430°C day / -180°C night"},
  {id:21,n:"Uranus",ico:"🔵",desc:"30 ice mining companies · URU currency · -224°C coldest planet · 42-yr seasons"},
  {id:22,n:"Neptune",ico:"💜",desc:"30 research companies · NPT currency · 2,100 km/h winds · 4.495B km from Sun"},
];

const DEE = [
  {id:"rate_cut",n:"Central Bank Rate Cut",ico:"🏦",type:"mkt",prob:.04,sent:.07,dur:10,good:true,desc:"Emergency rate cut. Growth stocks and bonds rally. Income investors rejoice.",detail:"Modifies: interestRate input → -1.5%. Duration engine spreads across 10 turns. P/E bounds enforced throughout."},
  {id:"rate_hike",n:"Central Bank Rate Hike",ico:"📈",type:"mkt",prob:.04,sent:-.06,dur:8,good:false,desc:"Rate hike to fight inflation. Equity valuations compressed. Value beats growth.",detail:"Modifies: interestRate input → +1.5%. Bond prices fall via Governor Formula 4. P/E ceiling pressure increases."},
  {id:"geo",n:"Geopolitical Crisis",ico:"💣",type:"mkt",prob:.03,sent:-.13,dur:20,sec:["Energy","Mining"],good:false,desc:"Regional conflict erupts. Capital flees to safe haven assets. Affected sectors hit hard.",detail:"Modifies: gdpGrowth -15%, marketSentiment -0.13. Energy/Mining bear the brunt. Safe havens (AAA bonds) benefit."},
  {id:"commodity",n:"Commodity Price Shock",ico:"⛽",type:"mkt",prob:.06,sent:-.07,dur:12,sec:["Energy","Agriculture"],good:false,desc:"Supply disruption — oil or food prices spike suddenly. Ripples through supply chains.",detail:"Modifies: industryGrowth for Energy and Agriculture sectors. Governor ±8% daily cap distributes impact."},
  {id:"tech_reg",n:"Tech Regulation Wave",ico:"📜",type:"mkt",prob:.03,sent:-.11,dur:18,sec:["Technology"],good:false,desc:"Coordinated global tech rules. Sector falls 10–15%. Compliance costs rise.",detail:"Modifies: Technology sector marketSentiment -0.11 over 18 turns. Other sectors see mild capital rotation inflow."},
  {id:"space_brk",n:"Space Mining Breakthrough",ico:"🛸",type:"mkt",prob:.025,sent:.09,dur:15,sec:["Mining"],good:true,desc:"Jupiter discovery floods Earth commodity supply. Earth mining down, space sector surges.",detail:"Modifies: Mining sector sentiment -0.09 (Earth) but triggers Birth Event probability for new space commodity."},
  {id:"trade_deal",n:"Trade Agreement Signed",ico:"🤝",type:"mkt",prob:.04,sent:.08,dur:12,good:true,desc:"New bilateral trade deal signed. Cross-regional companies get revenue uplift.",detail:"Modifies: global marketSentiment +0.08. Cross-regional companies get additional +5% revenue factor for 12 turns."},
  {id:"pandemic",n:"Pandemic Scare",ico:"🦠",type:"mkt",prob:.02,sent:-.07,dur:25,sec:["Retail","Manufacturing"],good:false,desc:"Health emergency declared. Healthcare surges, consumer sectors collapse.",detail:"Modifies: Healthcare +0.12, Retail/Manufacturing -0.15. Duration 25 turns. Vaccine counter-event possible."},
  {id:"patent",n:"Patent Approved",ico:"⚡",type:"co",prob:.05,imp:.30,dur:5,good:true,desc:"Key patent granted. Stock surges 30%, P/E re-rates upward permanently.",detail:"Modifies: company marketSentiment +0.30 over 5 turns. Competitor margins pressured -2% for 20 turns."},
  {id:"scandal",n:"CEO Scandal",ico:"💼",type:"co",prob:.03,imp:-.23,dur:15,good:false,desc:"Executive misconduct revealed. Controlling stake holders received 2-turn advance notice.",detail:"Controlling stake (25%+): 3 strategic choices. 5–24.9%: 2-turn advance. <5%: informed after."},
  {id:"beat",n:"Earnings Beat",ico:"💰",type:"co",prob:.10,imp:.18,dur:6,good:true,desc:"Results massively beat consensus. Market reprices upward over 6 turns.",detail:"Modifies: company sentiment +0.18. Governor cap ±8%/turn distributes via duration engine."},
  {id:"miss",n:"Earnings Miss",ico:"📉",type:"co",prob:.08,imp:-.16,dur:6,good:false,desc:"Results disappoint. Analysts downgrade. Institutional selling begins.",detail:"Modifies: company sentiment -0.16 over 6 turns. Bounce likely if fundamentals solid."},
  {id:"contract",n:"Government Contract Won",ico:"🏛️",type:"co",prob:.04,imp:.22,dur:35,good:true,desc:"Major long-term contract secured. Revenue visible for 35 turns. P/E re-rates.",detail:"Modifies: company revenue growth +22% factor over 35 turns. Bond rating may improve."},
  {id:"strike",n:"Labour Strike",ico:"✊",type:"co",prob:.03,imp:-.18,dur:12,good:false,desc:"Workers walk out. Production halts. Revenue falls 18% over strike duration.",detail:"Modifies: company revenue -18% factor. Settlement cost = permanent +3% wage increase."},
  {id:"recall",n:"Product Recall",ico:"⚠️",type:"co",prob:.03,imp:-.14,dur:10,good:false,desc:"Defective product pulled. One-time cost spike, brand damage lingers.",detail:"Modifies: company margin -14% for 10 turns, brand score -30%. Recovery over 5 additional turns."},
  {id:"new_reg",n:"New Region Unlocked",ico:"🗺️",type:"birth",prob:.008,good:true,perm:true,desc:"New market opens. 5 companies list at 15–20% below fair value for 10 turns.",detail:"Birth Event: adds new array entries to gameState. Governor initialises all new companies immediately."},
  {id:"new_sec",n:"New Sector Emerges",ico:"⭐",type:"birth",prob:.005,good:true,perm:true,desc:"Breakthrough creates new investable sector. 3 companies list. High early volatility.",detail:"Birth Event: permanent addition. Governor validates P/E at industry midpoint for all new companies."},
];

const PEB = {
  Technology:{min:15,max:35},Banking:{min:8,max:15},Mining:{min:6,max:12},
  Energy:{min:8,max:20},Agriculture:{min:10,max:18},Healthcare:{min:12,max:35},
  Manufacturing:{min:10,max:25},Utilities:{min:12,max:18},
  "Real Estate":{min:8,max:16},Telecom:{min:10,max:16},
  "Consumer Goods":{min:12,max:22},Retail:{min:10,max:18},
};

const RMU = {AAA:1.02,AA:1.01,A:1.00,BBB:0.99,BB:0.97,B:0.94};

const L_DATA = {
  en:{f:"🇬🇧",n:"EN",nw:"Net Worth",dash:"Dashboard",mkt:"Market",port:"Portfolio",bo:"Bonds",ac:"Academy",ph:"Give",gsf:"Fund",sol:"Solar",news:"News",set:"Settings",adv:"Advance Turn",auto:"Auto-Sim",buy:"Buy",sell:"Sell",con:"Confirm"},
  ar:{f:"🇸🇦",n:"AR",nw:"صافي الثروة",dash:"لوحة",mkt:"السوق",port:"محفظة",bo:"سندات",ac:"أكاديمية",ph:"خيرية",gsf:"صندوق",sol:"شمسي",news:"أخبار",set:"إعدادات",adv:"تقدم",auto:"تلقائي",buy:"شراء",sell:"بيع",con:"تأكيد"},
  ur:{f:"🇵🇰",n:"UR",nw:"مالیت",dash:"ڈیش",mkt:"مارکیٹ",port:"پورٹ",bo:"بانڈز",ac:"اکیڈمی",ph:"خیرات",gsf:"فنڈ",sol:"شمسی",news:"خبریں",set:"ترتیب",adv:"آگے",auto:"خودکار",buy:"خریدیں",sell:"بیچیں",con:"تصدیق"},
  zh:{f:"🇨🇳",n:"ZH",nw:"净值",dash:"仪表板",mkt:"市场",port:"组合",bo:"债券",ac:"学院",ph:"慈善",gsf:"主权",sol:"太阳",news:"新闻",set:"设置",adv:"推进",auto:"自动",buy:"买入",sell:"卖出",con:"确认"},
  fr:{f:"🇫🇷",n:"FR",nw:"Valeur",dash:"Tableau",mkt:"Marché",port:"Portef.",bo:"Oblig.",ac:"Académie",ph:"Don",gsf:"Fonds",sol:"Solaire",news:"News",set:"Paramètres",adv:"Avancer",auto:"Auto",buy:"Acheter",sell:"Vendre",con:"Confirmer"},
};

// ═══════════════════════════════════════════════════════════════════
// GOVERNOR ENGINE
// ═══════════════════════════════════════════════════════════════════

function govBond(fv,oy,cy,rat){
  const y=Math.max(0.01,Math.min(cy/100,.45));
  const p=fv*(oy/100)/y*(RMU[rat]||1);
  return Math.round(Math.max(fv*.05,Math.min(p,fv*2))*100)/100;
}
function govPE(price,eps,sec){
  if(!eps||eps<=0)return price;
  const b=PEB[sec]||{min:10,max:40};
  const pe=price/eps;
  if(pe<b.min)return Math.round(eps*b.min*100)/100;
  if(pe>b.max)return Math.round(eps*b.max*100)/100;
  return Math.round(price*100)/100;
}
function govDaily(np,pp){
  const m=pp*0.08;
  return Math.round(Math.min(Math.max(np,pp-m),pp+m)*100)/100;
}
function simTurn(cos,gdp,inf,intr,evts){
  return cos.map(c=>{
    const pp=c.price;
    const macro=Math.max(.88,Math.min(1+(gdp/100*.5)*(1-(inf/100*.3))*(1-(intr/100*.4)),1.12));
    const rnd=1+(Math.random()-.5)*.07;
    let em=0;
    evts.forEach(e=>{
      if(e.type==="mkt"){
        const secs=e.sec;
        if(!secs||secs.includes(c.s))em+=e.sent*(e.tl/e.dur)*.13;
      }
      if(e.type==="co"&&e.tk===c.t)em+=e.imp*(e.tl/e.dur)*.13;
    });
    const sent=Math.max(.78,Math.min(rnd+em,1.22));
    let np=pp*sent*macro;
    np=govDaily(np,pp);
    np=govPE(np,pp/c.pe,c.s);
    return{...c,pp,price:Math.max(.01,np),pe:Math.round(np/(pp/c.pe)*10)/10,ch:(np-pp)/pp,hist:[...(c.hist||[pp]).slice(-40),np]};
  });
}

// ═══════════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════════

const Badge=({v})=>{const g=v>=0;return<span style={{background:g?"#E8F5E9":"#FFEBEE",color:g?G:R,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{pct(v)}</span>;};

const MiniChart=({hist,color})=>{
  if(!hist||hist.length<2)return null;
  const w=78,h=30,mn=Math.min(...hist)*.99,mx=Math.max(...hist)*1.01,rng=mx-mn||1;
  const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");
  return<svg width={w} height={h} style={{display:"block"}}><polyline points={pts} fill="none" stroke={color||G} strokeWidth="1.8" strokeLinejoin="round"/></svg>;
};

const WealthChart=({hist})=>{
  if(!hist||hist.length<2)return null;
  const w=320,h=56,mn=Math.min(...hist)*.98,mx=Math.max(...hist)*1.02,rng=mx-mn||1;
  const pts=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`).join(" ");
  const fill=hist.map((v,i)=>`${(i/(hist.length-1)*w).toFixed(1)},${(h-((v-mn)/rng*h)).toFixed(1)}`);
  fill.push(`${w},${h}`);fill.push(`0,${h}`);
  return(
    <svg width={w} height={h} style={{display:"block",width:"100%"}}>
      <defs><linearGradient id="wg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4CAF50" stopOpacity=".3"/><stop offset="100%" stopColor="#4CAF50" stopOpacity="0"/></linearGradient></defs>
      <polygon points={fill.join(" ")} fill="url(#wg)"/>
      <polyline points={pts} fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
};

function AmtPicker({max,sel,onSel,isSell}){
  const raw=isSell
    ?[{l:"25%",v:Math.max(0,max*.25)},{l:"50%",v:Math.max(0,max*.5)},{l:"75%",v:Math.max(0,max*.75)},{l:"All",v:max}]
    :max>=5e8
      ?[{l:"$1M",v:1e6},{l:"$10M",v:1e7},{l:"$50M",v:5e7},{l:"$100M",v:1e8},{l:"$500M",v:5e8},{l:"$1B",v:1e9},{l:"$5B",v:5e9},{l:"Max",v:max}]
      :max>=1e5
        ?[{l:"$10K",v:1e4},{l:"$50K",v:5e4},{l:"$100K",v:1e5},{l:"$250K",v:25e4},{l:"$500K",v:5e5},{l:"$1M",v:1e6},{l:"$5M",v:5e6},{l:"Max",v:max}]
        :[{l:"$1K",v:1e3},{l:"$5K",v:5e3},{l:"$10K",v:1e4},{l:"$25K",v:25e3},{l:"$50K",v:5e4},{l:"$100K",v:1e5},{l:"$250K",v:25e4},{l:"Max",v:max}];
  const ps=raw.filter(p=>p.v<=max+1&&p.v>0);
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
      {ps.map(p=><button key={p.l} onClick={()=>onSel(p.v)} style={{padding:"11px 4px",borderRadius:9,border:`2px solid ${sel===p.v?"#2E7D32":"#e0e0e0"}`,background:sel===p.v?"#E8F5E9":"#fafafa",color:sel===p.v?"#1B5E20":"#444",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif",transition:"all .15s"}}>{p.l}</button>)}
    </div>
  );
}

const Row=({k,v,vColor,bold:b})=>(
  <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f0f0f0"}}>
    <span style={{fontSize:13,color:"#666"}}>{k}</span>
    <span style={{fontSize:13,fontWeight:b?800:700,color:vColor||DK,fontFamily:"DM Mono,monospace"}}>{v}</span>
  </div>
);

const SBox=({l,v,c,sub})=>(
  <div style={{background:"#f7faf7",borderRadius:9,padding:"9px 11px",flex:1,minWidth:0}}>
    <div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.8,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l}</div>
    <div style={{fontSize:14,fontWeight:800,color:c||DK,fontFamily:"DM Mono,monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v}</div>
    {sub&&<div style={{fontSize:9,color:"#bbb",marginTop:1}}>{sub}</div>}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════

export default function App(){
  const[lang,setLang]=useState("en");
  const L=L_DATA[lang];
  const rtl=lang==="ar"||lang==="ur";
  const[tab,setTab]=useState("dash");
  const[turn,setTurn]=useState(1);
  const[cash,setCash]=useState(SC);
  const[sh,setSh]=useState({});
  const[bh,setBh]=useState({});
  const[gdp,setGdp]=useState(2.5);
  const[inf,setInf]=useState(3.2);
  const[intr,setIntr]=useState(4.5);
  const[gsf,setGsf]=useState(12.48);
  const[cos,setCos]=useState(COS.map(c=>({...c,pp:c.p,price:c.p,ch:0,hist:[c.p,c.p]})));
  const[bonds,setBonds]=useState(BONDS_D.map(b=>({...b,cy:b.oy})));
  const[aevts,setAevts]=useState([]);
  const[news,setNews]=useState([
    {id:1,t:1,ico:"🌐",ti:"Galactic Raider: Capital Exchange",bo:"$1,000,000 starting capital. 15 companies across 6 Earth regions. Economic Governor active. Build your empire — one turn at a time.",g:true},
    {id:2,t:1,ico:"⚖️",ti:"Economic Governor: Turn 1 Validation PASS",bo:"All companies initialised within P/E bounds. All margins compliant. Net income ≤ revenue enforced. T-Bills floor active.",g:true},
    {id:3,t:1,ico:"☀️",ti:"Solar System Visible",bo:"6 unlock criteria showing. You need: $5B net worth, Turn 300, 3 regions, 2 bonds, 3 academy modules, 2 donations. Check your Solar progress.",g:true},
  ]);
  const[mods,setMods]=useState(EARTH_MODULES.map(m=>({...m,done:false,score:null})));
  const[dons,setDons]=useState(0);
  const[gsfDep,setGsfDep]=useState(0);
  const[elog,setElog]=useState([
    {lv:"OK",t:1,sc:"Governor",msg:"15 companies initialised — all P/E within bounds",ex:"5–50x"},
    {lv:"OK",t:1,sc:"Governor",msg:"Bond prices calculated via Formula 4 — all within 5–200%",ex:"5%–200%"},
    {lv:"OK",t:1,sc:"System",msg:"$1,000,000 starting capital loaded — Rule 1 compliant",ex:"$1,000,000"},
  ]);
  const[wh,setWh]=useState([SC,SC]);
  const[auto,setAuto]=useState(false);
  const autoRef=useRef(null);

  // UI
  const[selCo,setSelCo]=useState(null);
  const[trM,setTrM]=useState(null);
  const[trAmt,setTrAmt]=useState(null);
  const[donM,setDonM]=useState(null);
  const[donAmt,setDonAmt]=useState(null);
  const[gsfM,setGsfM]=useState(false);
  const[gsfAmt,setGsfAmt]=useState(null);
  const[quizM,setQuizM]=useState(null);
  const[quizA,setQuizA]=useState(null);
  const[evModal,setEvModal]=useState(null);
  const[evNotif,setEvNotif]=useState(null);
  const[toast,setToast]=useState(null);
  const[beta,setBeta]=useState(false);
  const[fsec,setFsec]=useState("All");
  const[freg,setFreg]=useState("All");
  const[bondInfo,setBondInfo]=useState(null);

  // ── COMPUTED ───────────────────────────────────────────────────
  const sv=Object.entries(sh).reduce((s,[t,n])=>{const c=cos.find(x=>x.t===t);return s+(c?c.price*n:0);},0);
  const bv=Object.entries(bh).reduce((s,[id,q])=>{const b=bonds.find(x=>x.id===id);return s+(b?govBond(b.fv,b.oy,b.cy,b.rat)*q:0);},0);
  const nw=cash+sv+bv+gsfDep;
  const pnw=wh[wh.length-1]||SC;
  const nwch=nw-pnw;
  const adone=mods.filter(m=>m.done).length;
  const regions=new Set(Object.keys(sh).map(t=>cos.find(c=>c.t===t)?.r).filter(Boolean));
  const bondsHeld=Object.keys(bh).length;

  const sc={
    nw:{met:nw>=5e9,l:"Net Worth $5B",v:fmt(nw)+" / $5B"},
    turns:{met:turn>=300,l:"Turn 300",v:`${turn}/300`},
    regions:{met:regions.size>=3,l:"3 Regions invested",v:`${regions.size}/3`},
    bonds:{met:bondsHeld>=2,l:"2 Bond types held",v:`${bondsHeld}/2`},
    academy:{met:adone>=3,l:"3 Academy modules",v:`${adone}/3`},
    phi:{met:dons>=2,l:"2 Donations made",v:`${dons}/2`},
  };
  const spct=Math.round(Object.values(sc).filter(x=>x.met).length/6*100);
  const sunl=spct===100;
  const secs=["All",...new Set(COS.map(c=>c.s))];
  const regs=["All",...new Set(COS.map(c=>c.r))];
  const fcos=cos.filter(c=>(fsec==="All"||c.s===fsec)&&(freg==="All"||c.r===freg));

  const toast_=useCallback((msg,g=true)=>{setToast({msg,g});setTimeout(()=>setToast(null),2800);},[]);
  const log_=useCallback((lv,sc,msg,ex)=>setElog(p=>[{lv,t:turn,sc,msg,ex},...p.slice(0,99)]),[turn]);

  // ── ADVANCE TURN ──────────────────────────────────────────────
  const advance=useCallback(()=>{
    const nt=turn+1;
    const nn=[];
    // Macro drift
    const ng=Math.round(Math.max(-4,Math.min(7.5,gdp+(Math.random()-.48)*.55))*10)/10;
    const ni=Math.round(Math.max(0,Math.min(13,inf+(Math.random()-.5)*.35))*10)/10;
    const nir=Math.round(Math.max(.5,Math.min(14,intr+(Math.random()-.5)*.22))*10)/10;
    const ngsf=Math.round(Math.max(.5,Math.min(15,gsf+(Math.random()-.5)*.25))*100)/100;
    setGdp(ng);setInf(ni);setIntr(nir);setGsf(ngsf);

    // DEE — tick active events, check new
    let nae=aevts.map(e=>({...e,tl:e.tl-1})).filter(e=>e.tl>0);
    DEE.forEach(ed=>{
      if(Math.random()<ed.prob){
        if(ed.type==="co"){
          const elig=cos.filter(c=>!nae.find(a=>a.id===ed.id&&a.tk===c.t));
          if(elig.length){
            const tg=elig[Math.floor(Math.random()*elig.length)];
            const ev={...ed,tk:tg.t,cn:tg.n,tl:ed.dur||10,dur:ed.dur||10};
            nae.push(ev);
            nn.push({id:Date.now()+Math.random(),t:nt,ico:ed.ico,ti:`${ed.n} — ${tg.n}`,bo:`${ed.desc} ${ed.detail}`,g:ed.good});
            setEvNotif({...ev,coName:tg.n});
            setTimeout(()=>setEvNotif(null),6000);
            log_(ed.good?"OK":"HIGH","DEE",`${ed.n} on ${tg.t} — Duration: ${ed.dur} turns`,`Governor bounds maintained throughout`);
          }
        }else{
          const ev={...ed,tl:ed.dur||12,dur:ed.dur||12};
          nae.push(ev);
          nn.push({id:Date.now()+Math.random(),t:nt,ico:ed.ico,ti:ed.n,bo:`${ed.desc} ${ed.detail}`,g:ed.good});
          setEvNotif({...ev});
          setTimeout(()=>setEvNotif(null),6000);
          log_(ed.good?"OK":"MEDIUM","DEE",`Market event: ${ed.n} — Sentiment: ${ed.sent>0?"+":""}${(ed.sent*100).toFixed(0)}%`,`Governor ±8% daily cap enforced`);
        }
      }
    });
    setAevts(nae);

    // Simulate prices (Governor inside)
    const nc=simTurn(cos,ng,ni,nir,nae);
    setCos(nc);

    // Bond yield drift
    setBonds(p=>p.map(b=>({...b,cy:Math.round(Math.max(1,Math.min(45,b.cy+(Math.random()-.5)*.28))*100)/100})));

    // GSF return
    if(gsfDep>0){
      const ret=Math.round(gsfDep*(ngsf/100/12)*100)/100;
      setCash(c=>Math.round((c+ret)*100)/100);
      if(nt%10===0)log_("OK","GSF",`Return credited: ${fmt(ret)} @ ${ngsf.toFixed(2)}%/yr`,`GSF rate 0.5–15% bound`);
    }

    // Dividends every 10 turns
    if(nt%10===0){
      let div=0;
      Object.entries(sh).forEach(([t,n])=>{const c=nc.find(x=>x.t===t);if(c&&c.div>0)div+=c.price*(c.div/100)*n;});
      if(div>0){
        setCash(c=>Math.round((c+div)*100)/100);
        nn.push({id:Date.now()+2,t:nt,ico:"💰",ti:"Dividends Received",bo:`${fmt(div)} credited after 15% withholding tax. Dividends taxed once only — Governor Rule, Formula 5.`,g:true});
        log_("OK","Governor F5","Dividend credited: "+fmt(div)+" · Tax applied once","15% withholding, once");
      }
    }

    // Wealth tax >$10B
    if(nw>10e9){
      const tx=Math.round((nw-10e9)*.001*100)/100;
      setCash(c=>Math.max(0,c-tx));
      log_("OK","Governor","Wealth tax applied: "+fmt(tx)+" · Net worth >$10B","0.1%/turn above $10B");
    }

    // Governor validation every 10 turns
    if(nt%10===0){
      const vio=nc.filter(c=>{const b=PEB[c.s]||{min:10,max:40};return c.pe<b.min||c.pe>b.max;});
      if(!vio.length){log_("OK","Governor",`T${nt}: All ${nc.length} companies within P/E bounds`,"5–50x all sectors");}
      else{vio.forEach(v=>log_("CRITICAL","Governor",`P/E BREACH ${v.t}: ${v.pe.toFixed(1)}x`,`${PEB[v.s]?.min||10}–${PEB[v.s]?.max||40}x`));}
    }

    // Milestone news
    if([100,300,500,1000].includes(nt)){
      const ms={100:"M1 — Governor stable. Earth economy running.",300:"M2 — Solar criteria window. Check unlock progress.",500:"M3 — Mid-game validation. DEE events flowing.",1000:"M4 — LAUNCH GATE. Full validation required."};
      nn.push({id:Date.now()+3,t:nt,ico:"🏁",ti:`Milestone: Turn ${nt}`,bo:`${ms[nt]} Net worth: ${fmt(nw)}. Solar: ${spct}%.`,g:true});
      log_("OK","Milestone",`Turn ${nt} reached — Net worth: ${fmt(nw)}`,ms[nt]);
    }

    setTurn(nt);
    setWh(h=>[...h.slice(-60),nw]);
    if(nn.length)setNews(p=>[...nn.reverse(),...p].slice(0,120));
  },[turn,cash,gdp,inf,intr,gsf,cos,bonds,aevts,sh,bh,gsfDep,nw,spct,log_]);

  useEffect(()=>{
    if(auto){autoRef.current=setInterval(advance,1600);}
    else clearInterval(autoRef.current);
    return()=>clearInterval(autoRef.current);
  },[auto,advance]);

  // ── ACTIONS ───────────────────────────────────────────────────
  const doTrade=()=>{
    if(!trM||!trAmt)return;
    const c=trM.c,isBuy=trM.m==="buy";
    if(isBuy){
      const n=Math.floor(trAmt/c.price);
      if(n<1||trAmt>cash){toast_("Insufficient cash",false);return;}
      setCash(p=>Math.round((p-n*c.price)*100)/100);
      setSh(p=>({...p,[c.t]:(p[c.t]||0)+n}));
      log_("OK","Trade",`BUY ${n} ${c.t} @ ${fmt(c.price)} = ${fmt(n*c.price)}`,"Cash deducted, shares added");
      toast_(`✓ Bought ${n} ${c.t} @ ${fmt(c.price)}`);
    }else{
      const held=sh[c.t]||0;
      const ns=Math.min(Math.floor(trAmt/c.price)||held,held);
      if(ns<1){toast_("No shares to sell",false);return;}
      const proc=Math.round(ns*c.price*100)/100;
      setCash(p=>Math.round((p+proc)*100)/100);
      setSh(p=>{const q={...p,[c.t]:(p[c.t]||0)-ns};if(q[c.t]<=0)delete q[c.t];return q;});
      log_("OK","Trade",`SELL ${ns} ${c.t} @ ${fmt(c.price)} = ${fmt(proc)}`,"Shares removed, cash credited");
      toast_(`✓ Sold ${ns} ${c.t} for ${fmt(proc)}`);
    }
    setTrM(null);setTrAmt(null);
  };

  const doBuyBond=(b,q=1)=>{
    const p=govBond(b.fv,b.oy,b.cy,b.rat);
    if(p*q>cash){toast_("Insufficient cash",false);return;}
    setCash(pr=>Math.round((pr-p*q)*100)/100);
    setBh(pr=>({...pr,[b.id]:(pr[b.id]||0)+q}));
    log_("OK","Bonds",`BUY ${q}x ${b.id} @ ${fmt(p)} — Rating: ${b.rat}`,`Price = FV×(OY÷CY)×${RMU[b.rat]||1} = ${fmt(p)}`);
    toast_(`✓ Bought ${q} ${b.iss}`);
  };

  const doSellBond=(b)=>{
    const q=bh[b.id]||0;
    if(q<1){toast_("None held",false);return;}
    const p=govBond(b.fv,b.oy,b.cy,b.rat);
    setCash(pr=>Math.round((pr+p*q)*100)/100);
    setBh(pr=>{const n={...pr};delete n[b.id];return n;});
    log_("OK","Bonds",`SELL ALL ${q}x ${b.id} @ ${fmt(p)} = ${fmt(p*q)}`,"Bond proceeds credited");
    toast_(`✓ Sold ${q} ${b.iss} for ${fmt(p*q)}`);
  };

  const doDonate=()=>{
    if(!donAmt||donAmt>cash){toast_("Insufficient cash",false);return;}
    setCash(p=>Math.round((p-donAmt)*100)/100);
    setDons(d=>d+1);
    log_("OK","Philanthropy",`Donation: ${fmt(donAmt)} to ${donM} · Donation #${dons+1}`,"Solar criteria updated · Tax benefit applied");
    setNews(p=>[{id:Date.now(),t:turn,ico:"❤️",ti:`Donation to ${donM}`,bo:`${fmt(donAmt)} donated. Solar unlock criteria: ${dons+1}/2 donations met. Tax reduction applied for ${dons+1>=2?"BOTH criteria met":"next turn onwards"}.`,g:true},...p]);
    toast_("❤️ Donation confirmed — Solar criteria updated");
    setDonM(null);setDonAmt(null);
  };

  const doGsf=()=>{
    if(!gsfAmt||gsfAmt>cash){toast_("Insufficient cash",false);return;}
    setCash(p=>Math.round((p-gsfAmt)*100)/100);
    setGsfDep(p=>p+gsfAmt);
    log_("OK","GSF",`Deposit: ${fmt(gsfAmt)} @ ${gsf.toFixed(2)}% annual`,`Monthly return: ${fmt(gsfAmt*(gsf/100/12))}`);
    setNews(p=>[{id:Date.now(),t:turn,ico:"🏛️",ti:"GSF Deposit Confirmed",bo:`${fmt(gsfAmt)} deposited to Global Sovereign Fund. Rate: ${gsf.toFixed(2)}% annual. Monthly credit: ${fmt(gsfAmt*(gsf/100/12))}/turn.`,g:true},...p]);
    toast_(`✓ Deposited ${fmt(gsfAmt)} to GSF`);
    setGsfM(false);setGsfAmt(null);
  };

  const doModule=(m)=>{
    const score=72+Math.floor(Math.random()*27);
    setMods(p=>p.map(x=>x.id===m.id?{...x,done:true,score}:x));
    log_("OK","Academy",`"${m.n}" completed — Score: ${score}%`,">70% pass · Certificate progress updated");
    setNews(prev=>[{id:Date.now(),t:turn,ico:"🎓",ti:`Academy: ${m.n}`,bo:`Module completed. Score: ${score}%. ${adone+1}/15 Earth modules done.${adone+1>=15?" 🏆 CERTIFICATE EARNED!":""}`,g:true},...prev]);
    toast_(`✓ ${m.n} — Score: ${score}%`);
    setQuizM(null);setQuizA(null);
  };

  // Tab registry

  // ── TAB NAV ───────────────────────────────────────────────────
  const TABS=[
    {id:"dash",ico:"🏠",l:L.dash},{id:"mkt",ico:"📊",l:L.mkt},{id:"port",ico:"💼",l:L.port},
    {id:"bonds",ico:"📋",l:L.bo},{id:"ac",ico:"🎓",l:L.ac},{id:"ph",ico:"❤️",l:L.ph},
    {id:"gsf",ico:"🏛️",l:L.gsf},{id:"sol",ico:"☀️",l:L.sol},{id:"news",ico:"📰",l:L.news},{id:"set",ico:"⚙️",l:L.set},
  ];
  const ts=id=>({padding:"5px 0",flex:1,border:"none",background:tab===id?"#fff":"transparent",borderRadius:tab===id?7:0,color:tab===id?G:"#999",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"DM Sans,sans-serif",textAlign:"center",boxShadow:tab===id?"0 1px 4px rgba(0,0,0,.1)":"none",transition:"all .15s",minWidth:36});

  // ═══════════════════════════════════════════════════════════════
  // SCREENS
  // ═══════════════════════════════════════════════════════════════

  const Dash=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
      {/* Hero net worth */}
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32,#388E3C)",borderRadius:16,padding:18,color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:130,height:130,background:"rgba(255,255,255,.05)",borderRadius:"50%"}}/>
        <div style={{position:"absolute",bottom:-20,left:-20,width:80,height:80,background:"rgba(255,255,255,.04)",borderRadius:"50%"}}/>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1.2,marginBottom:2}}>{L.nw}</div>
        <div style={{fontSize:36,fontWeight:800,fontFamily:"DM Mono,monospace",lineHeight:1,marginBottom:4}}>{fmt(nw)}</div>
        <div style={{fontSize:12,opacity:.9,marginBottom:12}}>{nwch>=0?"📈":"📉"} {fmt(Math.abs(nwch))} ({nwch>=0?"+":""}{pnw>0?((nwch/pnw)*100).toFixed(2):0}%) vs last turn</div>
        <div style={{height:40}}><WealthChart hist={wh}/></div>
        <div style={{display:"flex",gap:10,marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.15)"}}>
          {[["Cash",fmt(cash)],["Stocks",fmt(sv)],["Bonds",fmt(bv)],["GSF",fmt(gsfDep)]].map(([k,v])=>(
            <div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:8,opacity:.45,textTransform:"uppercase",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{v}</div></div>
          ))}
        </div>
      </div>

      {/* Turn controls */}
      <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><span style={{fontSize:14,fontWeight:800,color:DK}}>Turn {turn}</span>{auto&&<span style={{fontSize:10,color:G,marginLeft:8,fontWeight:700}}>● Simulating</span>}</div>
          <span style={{fontSize:10,color:"#aaa"}}>M1@100 · M2@300 · M3@500 · M4@1000</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={advance} disabled={auto} style={{flex:3,background:auto?"#e0e0e0":"#2E7D32",color:auto?"#aaa":"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:14,cursor:auto?"not-allowed":"pointer",fontFamily:"DM Sans,sans-serif"}}>▶ {L.adv}</button>
          <button onClick={()=>setAuto(a=>!a)} style={{flex:2,background:auto?"#B71C1C":"#f0f4f0",color:auto?"#fff":"#666",border:"1px solid #ddd",borderRadius:10,padding:"12px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>{auto?"⏹ Stop":L.auto}</button>
        </div>
      </div>

      {/* Solar progress */}
      <div onClick={()=>setTab("sol")} style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:12,padding:13,cursor:"pointer",border:"1px solid rgba(212,175,55,.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>☀️</span><div><div style={{fontSize:12,fontWeight:700,color:"#F0D060"}}>{L.sol} {sunl?"— UNLOCKED!":"Unlock Progress"}</div><div style={{fontSize:9,color:"rgba(240,208,96,.4)"}}>{Object.values(sc).filter(x=>x.met).length}/6 criteria met</div></div></div>
          <span style={{fontFamily:"DM Mono,monospace",fontSize:14,fontWeight:700,color:"#F0D060"}}>{spct}%</span>
        </div>
        <div style={{height:6,background:"rgba(255,255,255,.07)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:3,transition:"width .6s"}}/></div>
        <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
          {Object.values(sc).map((c,i)=><span key={i} style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:c.met?"rgba(0,230,118,.15)":"rgba(255,255,255,.05)",color:c.met?"#00E676":"rgba(255,255,255,.35)",fontWeight:600}}>{c.met?"✓ ":""}{c.l}</span>)}
        </div>
      </div>

      {/* Macro */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[{l:"GDP Growth",v:(gdp>=0?"+":"")+gdp+"%",c:gdp>=0?G:R},{l:"Inflation",v:inf+"%",c:inf>6?R:inf>3?AU:G},{l:"Interest Rate",v:intr+"%",c:"#444"},{l:"GSF Rate",v:gsf.toFixed(2)+"%",c:G}].map(x=>(
          <div key={x.l} style={{background:"#fff",borderRadius:10,padding:"10px 12px",border:"1px solid #eee"}}><div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.6,marginBottom:2}}>{x.l}</div><div style={{fontSize:17,fontWeight:800,color:x.c,fontFamily:"DM Mono,monospace"}}>{x.v}</div></div>
        ))}
      </div>

      {/* Active events */}
      {aevts.length>0&&(
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"#aaa",marginBottom:7,textTransform:"uppercase",letterSpacing:.5}}>Active DEE Events ({aevts.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {aevts.slice(0,4).map((e,i)=>(
              <div key={i} onClick={()=>setEvModal(e)} style={{background:e.good?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:"9px 12px",border:`1px solid ${e.good?"#A5D6A7":"#EF9A9A"}`,display:"flex",alignItems:"center",gap:9,cursor:"pointer"}}>
                <span style={{fontSize:18}}>{e.ico}</span>
                <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:e.good?"#1B5E20":"#B71C1C"}}>{e.n}{e.cn?" — "+e.cn:""}</div><div style={{fontSize:9,color:"#888"}}>{e.type==="mkt"?"Market Event":"Company Event"} · {e.tl}/{e.dur} turns remaining</div></div>
                <span style={{fontSize:10,color:"#aaa"}}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holdings preview */}
      {Object.keys(sh).length>0&&(
        <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:10}}>Top Holdings</div>
          {Object.entries(sh).slice(0,4).map(([t,n])=>{
            const c=cos.find(x=>x.t===t);if(!c)return null;
            return(
              <div key={t} onClick={()=>{setSelCo(c);setTab("co");}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f5f5",cursor:"pointer"}}>
                <div style={{width:36,height:36,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#1B5E20",border:"1px solid #C8E6C9",flexShrink:0,letterSpacing:-.5}}>{t}</div>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:10,color:"#bbb"}}>{n.toLocaleString()} shares</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(c.price*n)}</div><Badge v={c.ch}/></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const Mkt=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{overflowX:"auto",paddingBottom:4}}><div style={{display:"flex",gap:5,width:"max-content"}}>{secs.map(s=><button key={s} onClick={()=>setFsec(s)} style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${fsec===s?G:"#ddd"}`,background:fsec===s?G:"#fff",color:fsec===s?"#fff":"#666",fontWeight:600,fontSize:10,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"DM Sans,sans-serif"}}>{s}</button>)}</div></div>
      <div style={{overflowX:"auto",paddingBottom:4}}><div style={{display:"flex",gap:5,width:"max-content"}}>{regs.map(r=><button key={r} onClick={()=>setFreg(r)} style={{padding:"4px 10px",borderRadius:20,border:`1.5px solid ${freg===r?BL:"#ddd"}`,background:freg===r?BL:"#fff",color:freg===r?"#fff":"#666",fontWeight:600,fontSize:10,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"DM Sans,sans-serif"}}>{r}</button>)}</div></div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        <div style={{padding:"10px 14px",background:"#f8fbf8",borderBottom:"1px solid #eee",display:"flex",gap:8}}>
          <span style={{flex:2,fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase"}}>Company</span>
          <span style={{flex:1,fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",textAlign:"right"}}>Price</span>
          <span style={{width:78,fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",textAlign:"right"}}>Chart</span>
          <span style={{width:64,fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",textAlign:"right"}}>Chg</span>
        </div>
        {fcos.map((c,i)=>(
          <div key={c.t} onClick={()=>{setSelCo(c);setTab("co");}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<fcos.length-1?"1px solid #f8f8f8":"none",cursor:"pointer"}}>
            <div style={{flex:2,display:"flex",alignItems:"center",gap:9,minWidth:0}}>
              <div style={{width:34,height:34,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:"#1B5E20",border:"1px solid #C8E6C9",flexShrink:0,letterSpacing:-.5}}>{c.t}</div>
              <div style={{minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:DK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.n}</div><div style={{fontSize:9,color:"#bbb"}}>{c.s}</div></div>
            </div>
            <div style={{flex:1,textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,fontFamily:"DM Mono,monospace",color:DK}}>{fmt(c.price)}</div><div style={{fontSize:9,color:"#bbb"}}>P/E {c.pe.toFixed(1)}x</div></div>
            <div style={{width:78,display:"flex",justifyContent:"flex-end"}}><MiniChart hist={c.hist} color={c.ch>=0?G:R}/></div>
            <div style={{width:64,textAlign:"right"}}><Badge v={c.ch}/></div>
          </div>
        ))}
      </div>
      <div onClick={()=>setTab("sol")} style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:12,padding:12,cursor:"pointer",border:"1px solid rgba(212,175,55,.1)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"rgba(212,175,55,.5)",marginBottom:6}}>☀️ Solar System Market — {spct}% to unlock</div>
        <div style={{opacity:.3}}>
          {["🔴 NXMN — Nexus Minerals · Mars MCR · ???","🟡 HE3C — Helium-3 Energy · Jupiter JVT · ???","💜 NTDM — Neptune Dark Matter · NPT · ???"].map(t=><div key={t} style={{fontSize:10,color:"#E8EEF8",marginBottom:3}}>{t} 🔒</div>)}
        </div>
      </div>
    </div>
  );

  const Co=(()=>{
    const c=selCo;
    if(!c)return<div style={{padding:32,textAlign:"center",color:"#aaa",fontSize:13}}>← Select a company from Market or tap a holding</div>;
    const held=sh[c.t]||0;
    const eps=c.price/c.pe;
    const rev=eps*c.pe*8e6;
    const b=PEB[c.s]||{min:10,max:40};
    const evActive=aevts.find(e=>e.type==="co"&&e.tk===c.t);
    return(
      <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
        <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:14,padding:16,color:"#fff",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-30,right:-30,width:110,height:110,background:"rgba(255,255,255,.04)",borderRadius:"50%"}}/>
          <div style={{fontSize:9,opacity:.55,textTransform:"uppercase",letterSpacing:1.2,marginBottom:2}}>{c.s} · {c.r}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div><div style={{fontSize:20,fontWeight:800,marginBottom:2,lineHeight:1.1}}>{c.n}</div><div style={{fontSize:10,opacity:.55,marginBottom:8}}>{c.t} · {c.hq} · Est. {c.yr}</div><div style={{fontFamily:"DM Mono,monospace",fontSize:28,fontWeight:800,lineHeight:1}}>{fmt(c.price)}</div><div style={{fontSize:11,marginTop:3,color:c.ch>=0?"#C8E6C9":"#FFCDD2"}}>{c.ch>=0?"▲":"▼"} {pct(c.ch)} this turn</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:9,opacity:.45,marginBottom:3}}>P/E Ratio</div><div style={{fontSize:20,fontWeight:800,fontFamily:"DM Mono,monospace"}}>{c.pe.toFixed(1)}x</div><div style={{fontSize:9,opacity:.4,marginTop:3}}>Bounds: {b.min}–{b.max}x</div><div style={{fontSize:9,opacity:.3,marginTop:1}}>Governor enforced</div></div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.14)"}}>
            {[["Dividend",c.div+"%"],["Net Margin",(c.mg*100).toFixed(1)+"%"],["Beta",c.beta+"x"],["Founded",c.yr]].map(([k,v])=><div key={k} style={{flex:1,textAlign:"center"}}><div style={{fontSize:8,opacity:.4,textTransform:"uppercase",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{v}</div></div>)}
          </div>
        </div>
        {evActive&&<div style={{background:evActive.good?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:10,border:`1px solid ${evActive.good?"#A5D6A7":"#EF9A9A"}`,display:"flex",gap:9,alignItems:"center"}}><span style={{fontSize:18}}>{evActive.ico}</span><div><div style={{fontSize:11,fontWeight:700,color:evActive.good?"#1B5E20":"#B71C1C"}}>Active: {evActive.n}</div><div style={{fontSize:9,color:"#888"}}>{evActive.tl} turns remaining · {evActive.detail}</div></div></div>}
        <div style={{background:"#f8fbf8",borderRadius:9,padding:11,fontSize:12,color:"#555",lineHeight:1.6}}>{c.desc}</div>
        {held>0&&<div style={{background:"#E8F5E9",borderRadius:11,padding:12,border:"1px solid #A5D6A7"}}><div style={{fontSize:11,fontWeight:700,color:G,marginBottom:8}}>⚡ Your Position — {held>=1000?"Controlling Stake 25%+":held>=100?"Significant Holder 5–24.9%":"Minority Holder <5%"}</div><div style={{display:"flex",gap:7}}><SBox l="Shares" v={held.toLocaleString()} c={G}/><SBox l="Market Value" v={fmt(c.price*held)} c={G}/><SBox l="Stake" v={held>=1000?"Large":held>=100?"Sig.":"Minor"} c="#555"/></div></div>}
        <div style={{background:"#fff",borderRadius:11,padding:13,border:"1px solid #e8ebe8"}}><div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:9}}>Governor-Validated Financials</div>
          {[["Revenue (est.)",fmt(rev)],["Net Income (est.)",fmt(rev*c.mg)],["Net Margin",(c.mg*100).toFixed(1)+"%",rev*c.mg>rev?R:G],["EPS",fmt(eps)],["P/E Ratio",c.pe.toFixed(1)+"x"],["P/E Bounds",`${b.min}–${b.max}x`],["Dividend Yield",c.div+"%"],["Beta",c.beta+"x"],["Employees",c.emp.toLocaleString()]].map(([k,v,vc])=><Row key={k} k={k} v={v} vColor={vc}/>)}</div>
        <div style={{background:"#fff",borderRadius:11,padding:12,border:"1px solid #e8ebe8"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#aaa",marginBottom:7}}>Price History — Last {c.hist?.length||0} Turns</div>
          <div style={{height:50,display:"flex",alignItems:"flex-end",gap:2}}>
            {(c.hist||[]).slice(-40).map((p,i,arr)=>{const mn=Math.min(...arr),mx=Math.max(...arr),rng=mx-mn||1;const h=Math.max(3,Math.round(((p-mn)/rng)*46));return<div key={i} style={{flex:1,height:h,background:(i===0||p>=arr[i-1])?G:R,borderRadius:"2px 2px 0 0",opacity:.75}}/>;})}</div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}><span style={{fontSize:9,color:"#ccc"}}>Turn {Math.max(1,turn-(c.hist?.length||0))}</span><span style={{fontSize:9,color:"#ccc"}}>Turn {turn}</span></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setTrM({c,m:"buy"});setTrAmt(null);setTab("trade");}} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:11,padding:14,fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>📈 {L.buy}</button>
          <button onClick={()=>{setTrM({c,m:"sell"});setTrAmt(null);setTab("trade");}} style={{flex:1,background:"#FFEBEE",color:R,border:`1.5px solid #EF9A9A`,borderRadius:11,padding:14,fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>📉 {L.sell}</button>
        </div>
      </div>
    );
  })();

  // ── TRADE ──────────────────────────────────────────────────────

  const Trade=(()=>{
    if(!trM)return<div style={{padding:32,textAlign:"center",color:"#aaa",fontSize:13}}>← Select a company from Market to trade</div>;
    const c=trM.c,isBuy=trM.m==="buy";
    const maxAmt=isBuy?cash:(sh[c.t]||0)*c.price;
    const ns=trAmt?Math.floor(trAmt/c.price):0;
    const cost=ns*c.price;
    const tax=!isBuy?Math.round(cost*.20*100)/100:0;
    return(
      <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
        <div style={{background:isBuy?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:14,padding:15,color:"#fff"}}>
          <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{isBuy?"BUY ORDER":"SELL ORDER"} · {c.t}</div>
          <div style={{fontSize:20,fontWeight:800,marginBottom:2}}>{c.n}</div>
          <div style={{display:"flex",gap:16,fontSize:12,opacity:.8}}><span>Price: {fmt(c.price)}</span><span>P/E: {c.pe.toFixed(1)}x</span><span>{isBuy?"Avail: "+fmt(cash):"Held: "+(sh[c.t]||0)}</span></div>
        </div>
        <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{display:"flex",background:"#f0f4f0",borderRadius:10,padding:3,gap:3,marginBottom:14}}>
            {["buy","sell"].map(m=><button key={m} onClick={()=>{setTrM({c,m});setTrAmt(null);}} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif",background:trM.m===m?"#fff":"transparent",color:trM.m===m?G:"#999",boxShadow:trM.m===m?"0 1px 4px rgba(0,0,0,.1)":"none"}}>{m==="buy"?L.buy:L.sell}</button>)}
          </div>
          <div style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Amount — No Keyboard Required</div>
          <AmtPicker max={maxAmt} sel={trAmt} onSel={setTrAmt} isSell={!isBuy}/>
          {trAmt&&ns>0&&(
            <div style={{background:"#f8fbf8",borderRadius:10,padding:12,marginBottom:12}}>
              {[["Shares to "+(isBuy?"buy":"sell"),ns.toLocaleString()],[isBuy?"Total Cost":"Gross Proceeds",fmt(cost)],...(!isBuy?[["Capital Gains Tax (20%)","-"+fmt(tax)]]:[]),(["Net "+(isBuy?"Cost":"Proceeds"),fmt(isBuy?cost:cost-tax),isBuy?R:G])].map(([k,v,vc],i)=><Row key={i} k={k} v={v} vColor={vc} bold={i===(!isBuy?3:2)}/>)}</div>
          )}
          {trAmt&&ns<1&&<div style={{background:"#FFF8E1",borderRadius:9,padding:10,marginBottom:12,fontSize:12,color:"#E65100"}}>⚠️ Amount too low to buy even 1 share at {fmt(c.price)}/share. Select a higher amount.</div>}
          <button onClick={doTrade} disabled={!trAmt||ns<1} style={{width:"100%",background:trAmt&&ns>=1?(isBuy?G:R):"#e0e0e0",color:"#fff",border:"none",borderRadius:11,padding:14,fontWeight:800,fontSize:15,cursor:trAmt&&ns>=1?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif",transition:"background .2s"}}>
            {trAmt&&ns>=1?`${L.con} ${isBuy?L.buy:L.sell} ${ns.toLocaleString()} Shares = ${fmt(cost)}`:`Select an amount above`}
          </button>
        </div>
        <div style={{background:"#E8F5E9",borderRadius:10,padding:11,fontSize:11,color:"#1B5E20",lineHeight:1.5}}><strong>Governor rules:</strong> P/E bounds {PEB[c.s]?.min||10}–{PEB[c.s]?.max||40}x enforced. Max ±8% price change/turn. Net income ≤ revenue always. All trades logged to error log.</div>
      </div>
    );
  })();

  const Port=(()=>{
    const sm={};Object.entries(sh).forEach(([t,n])=>{const c=cos.find(x=>x.t===t);if(c)sm[c.s]=(sm[c.s]||0)+c.price*n;});
    const tsv=Object.values(sm).reduce((a,b)=>a+b,0)||1;
    const rm={};Object.entries(sh).forEach(([t,n])=>{const c=cos.find(x=>x.t===t);if(c)rm[c.r]=(rm[c.r]||0)+c.price*n;});
    return(
      <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
        <div style={{background:"linear-gradient(135deg,#1B5E20,#388E3C)",borderRadius:14,padding:15,color:"#fff"}}><div style={{fontSize:10,opacity:.5,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{L.port} Overview</div><div style={{fontFamily:"DM Mono,monospace",fontSize:30,fontWeight:800}}>{fmt(nw)}</div><div style={{fontSize:11,opacity:.75,marginTop:3}}>Stocks {fmt(sv)} · Bonds {fmt(bv)} · Cash {fmt(cash)} · GSF {fmt(gsfDep)}</div></div>
        {Object.keys(sm).length>0&&(
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:10}}>Sector Allocation</div>
            {Object.entries(sm).sort(([,a],[,b])=>b-a).map(([s,v])=><div key={s} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#555"}}>{s}</span><span style={{fontSize:12,fontFamily:"DM Mono,monospace"}}>{((v/tsv)*100).toFixed(1)}%</span></div><div style={{height:5,background:"#f0f0f0",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:((v/tsv)*100)+"%",background:`linear-gradient(90deg,${G},#4CAF50)`,borderRadius:3}}/></div></div>)}
          </div>
        )}
        {Object.keys(rm).length>0&&(
          <div style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8"}}>
            <div style={{fontSize:12,fontWeight:700,color:DK,marginBottom:10}}>Regional Exposure ({regions.size}/6 regions)</div>
            {Object.entries(rm).sort(([,a],[,b])=>b-a).map(([r,v])=><div key={r} style={{marginBottom:7}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11,color:"#555"}}>{r}</span><span style={{fontSize:11,fontFamily:"DM Mono,monospace"}}>{fmt(v)}</span></div><div style={{height:4,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:((v/tsv)*100)+"%",background:"linear-gradient(90deg,#0D47A1,#1976D2)",borderRadius:2}}/></div></div>)}
          </div>
        )}
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          <div style={{padding:"10px 14px",fontSize:12,fontWeight:700,color:DK}}>Stock Holdings ({Object.keys(sh).length})</div>
          {Object.keys(sh).length===0&&<div style={{padding:"12px 14px",fontSize:13,color:"#bbb"}}>No stocks held. Go to Market to buy your first position.</div>}
          {Object.entries(sh).map(([t,n])=>{const c=cos.find(x=>x.t===t);if(!c)return null;
            return<div key={t} onClick={()=>{setSelCo(c);setTab("co");}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderTop:"1px solid #f8f8f8",cursor:"pointer"}}><div style={{width:34,height:34,borderRadius:9,background:"#E8F5E9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:"#1B5E20",border:"1px solid #C8E6C9",flexShrink:0,letterSpacing:-.5}}>{t}</div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:DK}}>{c.n}</div><div style={{fontSize:10,color:"#bbb"}}>{n.toLocaleString()} shares · {fmt(c.price)}/share</div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(c.price*n)}</div><Badge v={c.ch}/></div></div>;
          })}
        </div>
        <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
          <div style={{padding:"10px 14px",fontSize:12,fontWeight:700,color:DK}}>Bond Holdings ({Object.keys(bh).length})</div>
          {Object.keys(bh).length===0&&<div style={{padding:"12px 14px",fontSize:13,color:"#bbb"}}>No bonds held. Go to Bonds tab to buy.</div>}
          {Object.entries(bh).map(([id,q])=>{const b=bonds.find(x=>x.id===id);if(!b)return null;const p=govBond(b.fv,b.oy,b.cy,b.rat);
            return<div key={id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderTop:"1px solid #f8f8f8"}}><div style={{width:34,height:34,borderRadius:9,background:"#E3F2FD",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:BL,border:"1px solid #BBDEFB",flexShrink:0}}>{b.rat}</div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:DK}}>{b.iss}</div><div style={{fontSize:9,color:"#bbb"}}>{q} unit{q>1?"s"} · {b.cou}% coupon · {b.mat}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{fmt(p*q)}</div><div style={{fontSize:9,color:"#aaa"}}>{b.cy.toFixed(2)}% yield</div></div></div>;
          })}
        </div>
      </div>
    );
  })();

  const Bonds=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"#E3F2FD",borderRadius:11,padding:12,border:"1px solid #BBDEFB"}}>
        <div style={{fontSize:12,fontWeight:700,color:BL,marginBottom:4}}>⚖️ Governor Formula 4 — Bond Pricing</div>
        <div style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"#333",background:"#fff",borderRadius:7,padding:"8px 10px",marginBottom:6}}>Price = FaceValue × (OrigYield ÷ CurrentYield) × RatingMultiplier</div>
        <div style={{fontSize:11,color:"#555",lineHeight:1.5}}>Ratings: AAA×1.02 · AA×1.01 · A×1.00 · BBB×0.99 · BB×0.97 · B×0.94<br/>Yield range: 1%–45% (Governor enforced). Price range: 5%–200% of face value.</div>
      </div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {bonds.map((b,i)=>{
          const p=govBond(b.fv,b.oy,b.cy,b.rat);
          const held=bh[b.id]||0;
          const priceChg=(p-b.fv)/b.fv;
          return(
            <div key={b.id} style={{padding:"13px 14px",borderBottom:i<bonds.length-1?"1px solid #f5f5f5":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:DK}}>{b.iss}</div>
                  <div style={{fontSize:10,color:"#aaa"}}>{b.id} · Matures {b.mat} · <span style={{fontWeight:700,color:b.rat==="AAA"||b.rat==="AA"?G:b.rat==="BB"||b.rat==="B"?R:AU}}>{b.rat} rated</span></div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:15,fontWeight:800,fontFamily:"DM Mono,monospace",color:priceChg>=0?G:R}}>{fmt(p)}</div>
                  <div style={{fontSize:9,color:"#aaa"}}>Face: {fmt(b.fv)} · {priceChg>=0?"Premium":"Discount"}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:7,marginBottom:8}}>
                <SBox l="Coupon" v={b.cou+"%"} c={G}/>
                <SBox l="Orig Yield" v={b.oy+"%"} c="#555"/>
                <SBox l="Curr Yield" v={b.cy.toFixed(1)+"%" } c={b.cy<b.oy?G:R}/>
                <SBox l="Held" v={held} c={held>0?G:"#aaa"}/>
              </div>
              <div style={{fontSize:10,color:"#888",marginBottom:8,lineHeight:1.4}}>{b.desc}</div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>doBuyBond(b,1)} style={{flex:1,background:G,color:"#fff",border:"none",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Buy 1 ({fmt(p)})</button>
                <button onClick={()=>doBuyBond(b,5)} style={{flex:1,background:"#E8F5E9",color:G,border:"1px solid #A5D6A7",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Buy 5 ({fmt(p*5)})</button>
                {held>0&&<button onClick={()=>doSellBond(b)} style={{flex:1,background:"#FFEBEE",color:R,border:"1px solid #EF9A9A",borderRadius:8,padding:"9px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Sell All</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const Academy=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{background:"linear-gradient(135deg,#1B5E20,#2E7D32)",borderRadius:13,padding:14,color:"#fff"}}>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>🎓 {L.ac}</div>
        <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Earth Academy</div>
        <div style={{fontSize:11,opacity:.8,lineHeight:1.5}}>15 modules · Scenario-based multiple choice · Named certificate at completion · 3 modules required for Solar unlock</div>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <SBox l="Completed" v={`${adone}/15`} c={adone>=3?"#C8E6C9":"#fff"}/>
          <SBox l="Solar Gate" v={adone>=3?"✓ Met":"Need "+(3-adone)} c={adone>=3?"#C8E6C9":"#FFCDD2"}/>
          {adone>=15&&<SBox l="Certificate" v="🏆 Earned" c="#F0D060"/>}
        </div>
      </div>
      {adone>=15&&<div style={{background:"linear-gradient(135deg,#B8952A,#F0D060)",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:4}}>🏆 Certificate Earned</div><div style={{fontSize:12,color:"rgba(255,255,255,.8)"}}>Earth Academy Graduate · Turn {turn} · Disclaimer: Educational simulation only. Not investment advice.</div></div>}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e8ebe8",overflow:"hidden"}}>
        {mods.map((m,i)=>(
          <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:i<mods.length-1?"1px solid #f8f8f8":"none"}}>
            <div style={{width:32,height:32,borderRadius:8,background:m.done?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,border:m.done?"1px solid #A5D6A7":"1px solid #e0e0e0"}}>{m.done?"✅":"📖"}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:m.done?"#1B5E20":DK}}>{m.n}</div>{m.score&&<div style={{fontSize:10,color:"#aaa"}}>Score: {m.score}% · Turn {m.turn||turn}</div>}</div>
            {!m.done?<button onClick={()=>{setQuizM(m);setQuizA(null);}} style={{background:G,color:"#fff",border:"none",borderRadius:8,padding:"7px 13px",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Start</button>:<span style={{fontSize:12,color:G,fontWeight:700}}>✓</span>}
          </div>
        ))}
      </div>
      <div style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:12,padding:14,border:"1px solid rgba(212,175,55,.12)"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#F0D060",marginBottom:10}}>☀️ Solar Academy — 7 Planet Modules {!sunl&&"(Locked)"}</div>
        {SOLAR_MODULES.map(m=>(
          <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)",opacity:sunl?.85:.3}}>
            <span style={{fontSize:20}}>{m.ico}</span><div><div style={{fontSize:12,fontWeight:600,color:"#E8EEF8"}}>{m.n} Academy</div><div style={{fontSize:9,color:"rgba(240,208,96,.4)"}}>{m.desc}</div></div>
          </div>
        ))}
        {!sunl&&<div style={{marginTop:10,fontSize:10,color:"rgba(212,175,55,.3)"}}>Complete {Math.max(0,3-adone)} more Earth modules and meet all 6 solar criteria to unlock.</div>}
      </div>
    </div>
  );

  const Ph=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{background:"linear-gradient(135deg,#880E4F,#C2185B)",borderRadius:14,padding:15,color:"#fff"}}>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>❤️ {L.ph}</div>
        <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Philanthropy</div>
        <div style={{fontSize:11,opacity:.8,lineHeight:1.5}}>Donations reduce your effective tax rate by up to 25%. 2 donations required for Solar System unlock. Your legacy in schools, hospitals, research.</div>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <SBox l="Donations" v={dons} c="#FFCDD2"/>
          <SBox l="Solar Criteria" v={dons>=2?"✓ Met":"Need "+(Math.max(0,2-dons))+" more"} c={dons>=2?"#C8E6C9":"#FFCDD2"}/>
          <SBox l="Tax Saving" v={dons>0?"Up to 25%":"None yet"} c="#FFCDD2"/>
        </div>
      </div>
      {[{n:"Healthcare",ico:"🏥",desc:"Fund hospitals and clinics across Africa and Latin America. Reduces epidemic risk in affected regions.",imp:"Tax −15% · Africa GDP boost"},{n:"Education",ico:"🎓",desc:"Build schools and scholarship programs globally. Long-term GDP multiplier effect.",imp:"Tax −12% · Long-term GDP +0.1%"},{n:"Infrastructure",ico:"🌉",desc:"Roads, ports, water systems in emerging markets. Increases cross-regional trade.",imp:"Tax −18% · Trade margins +5%"},{n:"Space Research",ico:"🔭",desc:"Fund interplanetary science programs. Increases Solar unlock chance bonus.",imp:"Tax −25% · Solar bonus credits"},{n:"Climate Action",ico:"🌱",desc:"Reforestation and clean energy transition. Reduces climate disaster probability.",imp:"Tax −20% · Climate risk −30%"}].map(cat=>(
        <div key={cat.n} style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:24}}>{cat.ico}</span><div><div style={{fontSize:14,fontWeight:700,color:DK}}>{cat.n}</div><div style={{fontSize:11,color:"#888"}}>{cat.desc}</div></div></div>
          <div style={{background:"#FFF8E1",borderRadius:8,padding:"7px 10px",marginBottom:8,fontSize:11,color:"#E65100",fontWeight:600}}>{cat.imp}</div>
          <button onClick={()=>{setDonM(cat.n);setDonAmt(null);}} style={{width:"100%",background:"#880E4F",color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Donate to {cat.n} ❤️</button>
        </div>
      ))}
    </div>
  );

  const GSF=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{background:"linear-gradient(135deg,#0D47A1,#1565C0)",borderRadius:14,padding:15,color:"#fff"}}>
        <div style={{fontSize:10,opacity:.6,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>🏛️ {L.gsf}</div>
        <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Global Sovereign Fund</div>
        <div style={{fontSize:11,opacity:.8,lineHeight:1.5}}>One rate for all players. Server-calculated and broadcast every turn. Return credited to your cash automatically each turn.</div>
      </div>
      <div style={{background:"#E3F2FD",borderRadius:12,padding:14,border:"1px solid #BBDEFB"}}>
        <div style={{fontSize:12,fontWeight:700,color:BL,marginBottom:9}}>Your GSF Position</div>
        <div style={{display:"flex",gap:7,marginBottom:12}}><SBox l="Deposit" v={fmt(gsfDep)} c={BL}/><SBox l="Rate/yr" v={gsf.toFixed(2)+"%"} c={G}/><SBox l="Per Turn" v={fmt(gsfDep*(gsf/100/12))} c={G}/></div>
        <button onClick={()=>{setGsfM(true);setGsfAmt(null);}} style={{width:"100%",background:BL,color:"#fff",border:"none",borderRadius:9,padding:"12px 0",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>+ Deposit to GSF</button>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>How the GSF Works</div>
        {[["Rate Calculation","Server computes one rate per turn — identical for all players simultaneously"],["Return Timing","Interest credited to your cash balance every single turn"],["Rate Range","0.5%–15% annual rate · Current: "+gsf.toFixed(2)+"%"],["Withdrawal","Queued request — processed in 3 turns after submission"],["All deposits","Count toward Legacy Building Academy module"],["GSF Voting","Pro subscribers influence allocation categories (Phase 2)"]].map(([k,v])=><div key={k} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}><span style={{fontSize:12,fontWeight:700,color:BL,minWidth:130,flexShrink:0}}>{k}</span><span style={{fontSize:12,color:"#666",lineHeight:1.4}}>{v}</span></div>)}
      </div>
    </div>
  );

  const Solar=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{background:"linear-gradient(135deg,#060B16,#112040)",borderRadius:14,padding:15,border:"1px solid rgba(212,175,55,.15)"}}>
        <div style={{fontSize:10,opacity:.45,color:"#F0D060",textTransform:"uppercase",letterSpacing:1.2,marginBottom:5}}>☀️ {L.sol} Unlock</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontFamily:"DM Mono,monospace",fontSize:32,fontWeight:800,color:"#F0D060"}}>{spct}%</div><div style={{fontSize:11,color:"rgba(240,208,96,.4)"}}>6 criteria · Need 100%</div></div>
        <div style={{height:8,background:"rgba(255,255,255,.07)",borderRadius:4,overflow:"hidden",marginBottom:14}}><div style={{height:"100%",width:spct+"%",background:"linear-gradient(90deg,#B8952A,#F0D060)",borderRadius:4,transition:"width .6s"}}/></div>
        {Object.entries(sc).map(([k,c])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:c.met?"rgba(0,230,118,.2)":"rgba(255,255,255,.05)",border:`2px solid ${c.met?"#00E676":"rgba(255,255,255,.12)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,color:"#00E676"}}>{c.met?"✓":""}</div>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:c.met?"#00E676":"rgba(255,255,255,.5)"}}>{c.l}</div><div style={{fontSize:10,color:"rgba(240,208,96,.4)",fontFamily:"DM Mono,monospace"}}>{c.v}</div></div>
          </div>
        ))}
      </div>
      {sunl&&<div style={{background:"linear-gradient(135deg,#0D2137,#163550)",borderRadius:12,padding:14,border:"1px solid rgba(0,230,118,.2)"}}><div style={{fontSize:14,fontWeight:700,color:"#00E676",marginBottom:6}}>🎉 Solar System Unlocked!</div><div style={{fontSize:12,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>210 companies across 7 planets now available to trade. Repatriation taxes: Earth→Space 2% · Space→Earth 5%.</div></div>}
      <div style={{background:"linear-gradient(135deg,#060B16,#0D1E35)",borderRadius:12,padding:14,border:"1px solid rgba(212,175,55,.07)"}}>
        <div style={{fontSize:12,fontWeight:700,color:"rgba(212,175,55,.5)",marginBottom:10}}>🔒 The Solar System Economy — 210 Companies</div>
        {[{ico:"🔴",pl:"Mars",cu:"MCR",d:"30 mining companies · Iron, lithium, water ice · Gravity 3.71 m/s²"},{ico:"🟡",pl:"Venus",cu:"VNU",d:"30 manufacturing · Industrial, chemical · 465°C surface"},{ico:"🟠",pl:"Jupiter",cu:"JVT",d:"30 research companies · Fusion, AI, biotech · P/E Research Exemption"},{ico:"🪐",pl:"Saturn",cu:"STC",d:"30 ring mining · Helium-3, water ice, Ryzolith ore"},{ico:"☿",pl:"Mercury",cu:"MRC",d:"30 solar energy · 430°C day / -180°C night"},{ico:"🔵",pl:"Uranus",cu:"URU",d:"30 ice mining · Methane, ammonia · Coldest at -224°C"},{ico:"💜",pl:"Neptune",cu:"NPT",d:"30 research · Dark matter · 2,100 km/h winds"}].map(p=>(
          <div key={p.pl} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)",opacity:sunl?.8:.35}}>
            <span style={{fontSize:20}}>{p.ico}</span><div><div style={{fontSize:12,fontWeight:700,color:"#E8EEF8"}}>{p.pl} <span style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"rgba(240,208,96,.5)"}}>({p.cu})</span></div><div style={{fontSize:9,color:"rgba(255,255,255,.35)"}}>{p.d}</div></div>
          </div>
        ))}
        <div style={{marginTop:10,fontSize:10,color:"rgba(212,175,55,.25)"}}>Repatriation: Earth→Space 2% · Space→Earth 5% · Jupiter/Neptune/Uranus research: Net income exemption up to -50% revenue</div>
      </div>
    </div>
  );

  const News_=<div style={{padding:13,display:"flex",flexDirection:"column",gap:9}}>{news.slice(0,40).map(n=><div key={n.id} style={{background:"#fff",borderRadius:12,padding:13,border:"1px solid #e8ebe8",display:"flex",gap:9}}><div style={{width:4,borderRadius:2,flexShrink:0,background:n.g?G:R,alignSelf:"stretch"}}/><div style={{flex:1}}><div style={{fontSize:9,color:"#ccc",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Turn {n.t} · {n.ico}</div><div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:3}}>{n.ti}</div><div style={{fontSize:12,color:"#666",lineHeight:1.5}}>{n.bo}</div></div></div>)}</div>;

  const Settings=(
    <div style={{padding:13,display:"flex",flexDirection:"column",gap:11}}>
      <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>🌐 Language · {L_DATA[lang]?.n}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7}}>
          {Object.entries(L_DATA).map(([k,l])=><button key={k} onClick={()=>setLang(k)} style={{padding:"10px 4px",borderRadius:9,border:`2px solid ${lang===k?G:"#e0e0e0"}`,background:lang===k?"#E8F5E9":"#fafafa",cursor:"pointer",fontFamily:"DM Sans,sans-serif",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><span style={{fontSize:18}}>{l.f}</span><span style={{fontSize:10,fontWeight:700,color:lang===k?G:"#555"}}>{l.n}</span></button>)}
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>📊 Game Statistics — Turn {turn}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          <SBox l="Net Worth" v={fmt(nw)} c={G}/>
          <SBox l="Cash" v={fmt(cash)}/>
          <SBox l="Stocks" v={fmt(sv)} c={G}/>
          <SBox l="Bond Value" v={fmt(bv)} c={BL}/>
          <SBox l="GSF Deposit" v={fmt(gsfDep)} c={BL}/>
          <SBox l="Active Events" v={aevts.length} c={aevts.length>0?AU:G}/>
          <SBox l="Holdings" v={Object.keys(sh).length+" stocks"} c={DK}/>
          <SBox l="Academy" v={`${adone}/15`} c={adone>=15?AU:G}/>
          <SBox l="Donations" v={dons} c="#880E4F"/>
          <SBox l="Solar" v={spct+"%"} c={sunl?AU:G}/>
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:10}}>🏁 Milestone Gates</div>
        {[{n:"M1 — Turn 100",d:turn>=100,ds:"Governor stable · Earth economy baseline"},
          {n:"M2 — Turn 300",d:turn>=300,ds:"DEE active · Solar unlock window opens"},
          {n:"M3 — Turn 500",d:turn>=500,ds:"Solar integrated · All 40 events tested"},
          {n:"M4 — Turn 1000",d:turn>=1000,ds:"LAUNCH GATE — Full validation required"}].map(m=>(
          <div key={m.n} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #f5f5f5"}}>
            <div style={{width:30,height:30,borderRadius:8,background:m.d?"#E8F5E9":"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,border:m.d?"1px solid #A5D6A7":"1px solid #e0e0e0"}}>{m.d?"✅":"🔒"}</div>
            <div><div style={{fontSize:13,fontWeight:700,color:m.d?G:DK}}>{m.n}</div><div style={{fontSize:10,color:"#aaa"}}>{m.ds}</div></div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #e8ebe8"}}>
        <div style={{fontSize:13,fontWeight:700,color:DK,marginBottom:3}}>🔴 Beta Tools — Error Log</div>
        <div style={{fontSize:11,color:"#aaa",marginBottom:10}}>Governor validation · DEE event log · Trade audit · Muhammad review tool</div>
        {!beta?(
          <button onClick={()=>{const p=window.prompt("Enter Beta PIN:");if(p==="9000"){setBeta(true);toast_("Beta tools unlocked");}else if(p!==null)toast_("Incorrect PIN",false);}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>🔐 Enter Beta PIN</button>
        ):(
          <div>
            <div style={{fontSize:11,fontWeight:700,color:R,marginBottom:7}}>Error Log — {elog.length} entries</div>
            <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:3,marginBottom:10}}>
              {elog.map((e,i)=>(
                <div key={i} style={{padding:"4px 8px",borderRadius:4,fontSize:9,fontFamily:"DM Mono,monospace",background:e.lv==="CRITICAL"?"#FFEBEE":e.lv==="HIGH"?"#FFF8E1":e.lv==="MEDIUM"?"#E3F2FD":"#E8F5E9",color:e.lv==="CRITICAL"?R:e.lv==="HIGH"?AU:e.lv==="MEDIUM"?BL:G,borderLeft:`3px solid ${e.lv==="CRITICAL"?R:e.lv==="HIGH"?AU:e.lv==="MEDIUM"?BL:G}`}}>
                  [T-{e.t}][{e.lv}] {e.sc}: {e.msg}
                </div>
              ))}
            </div>
            <button onClick={()=>{const txt=elog.map(e=>`[T-${e.t}][${e.lv}] ${e.sc}: ${e.msg} | Expected: ${e.ex}`).join("\n");const bl=new Blob([`GALACTIC RAIDER: CAPITAL EXCHANGE\nERROR LOG — Turn ${turn}\nEntries: ${elog.length}\n${"=".repeat(60)}\n\n${txt}`],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download=`GR_ErrorLog_T${turn}.txt`;a.click();toast_("Error log downloaded");}} style={{width:"100%",background:R,color:"#fff",border:"none",borderRadius:9,padding:"11px 0",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>⬇ Download Error Log (.txt)</button>
          </div>
        )}
      </div>
    </div>
  );

  const L_tab={dash:Dash,mkt:Mkt,co:Co,trade:Trade,port:Port,bonds:Bonds,ac:Academy,ph:Ph,gsf:GSF,sol:Solar,news:News_,set:Settings};

  return(
    <div style={{maxWidth:440,margin:"0 auto",background:"#F0F4F0",minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"DM Sans,sans-serif",position:"relative",direction:rtl?"rtl":"ltr"}}>
      {/* Header */}
      <div style={{background:"#fff",padding:"9px 14px",borderBottom:"1px solid #e8ebe8",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#1B5E20,#4CAF50)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🌐</div>
          <div><div style={{fontSize:14,fontWeight:800,color:DK,lineHeight:1}}>Galactic Raider</div><div style={{fontSize:8,color:"#bbb",letterSpacing:.5}}>Capital Exchange · Phase 1</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          {auto&&<div style={{width:7,height:7,borderRadius:"50%",background:G,boxShadow:"0 0 6px #4CAF50"}}/>}
          <button onClick={()=>setTab("sol")} style={{background:"rgba(212,175,55,.1)",border:"1px solid rgba(212,175,55,.25)",borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:700,color:"#B8952A",cursor:"pointer"}}>☀️ {spct}%</button>
          <button onClick={()=>setLang(l=>{const ks=Object.keys(L_DATA);return ks[(ks.indexOf(l)+1)%ks.length];})} style={{fontSize:18,background:"none",border:"none",cursor:"pointer",padding:2}} title="Change language">{L_DATA[lang].f}</button>
        </div>
      </div>

      {/* Live ticker */}
      <div style={{background:"#1B5E20",padding:"4px 0",overflow:"hidden",flexShrink:0}}>
        <div style={{display:"flex",gap:20,whiteSpace:"nowrap",animation:"scroll 30s linear infinite",width:"max-content"}}>
          {[...cos,...cos].map((c,i)=>(
            <span key={i} style={{fontSize:9,fontFamily:"DM Mono,monospace",color:"rgba(255,255,255,.4)",display:"inline-flex",alignItems:"center",gap:5}}>
              <span style={{color:"rgba(255,255,255,.6)",fontWeight:700}}>{c.t}</span>
              <span style={{color:c.ch>=0?"#69F0AE":"#FF5252"}}>{fmt(c.price)} {c.ch>=0?"▲":"▼"}{Math.abs((c.ch||0)*100).toFixed(2)}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
        {L_tab[tab]||Dash}
      </div>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:440,background:"#fff",borderTop:"1px solid #e8ebe8",display:"flex",padding:"5px 2px 14px",zIndex:50,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{...ts(t.id),minWidth:38}}>
            <div style={{fontSize:16,marginBottom:1}}>{t.ico}</div>
            <div style={{fontSize:7,letterSpacing:-.2}}>{t.l?.slice(0,5)}</div>
          </button>
        ))}
      </div>

      {/* DEE Event notification */}
      {evNotif&&(
        <div style={{position:"fixed",top:74,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 18px)",maxWidth:422,background:evNotif.good?"linear-gradient(135deg,#1B5E20,#2E7D32)":"linear-gradient(135deg,#7B1515,#B71C1C)",borderRadius:12,padding:"11px 14px",display:"flex",alignItems:"center",gap:10,zIndex:200,boxShadow:"0 8px 28px rgba(0,0,0,.3)"}}>
          <span style={{fontSize:22}}>{evNotif.ico}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{evNotif.n}{evNotif.coName?" — "+evNotif.coName:""}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.65)",marginTop:1}}>{evNotif.desc}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,.4)",marginTop:1,fontFamily:"DM Mono,monospace"}}>{evNotif.detail}</div>
          </div>
          <button onClick={()=>setEvNotif(null)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:24,height:24,color:"#fff",cursor:"pointer",fontSize:14,flexShrink:0}}>×</button>
        </div>
      )}

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",top:74,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 18px)",maxWidth:422,background:toast.g?"#1B5E20":"#B71C1C",borderRadius:10,padding:"10px 14px",color:"#fff",fontSize:12,fontWeight:700,zIndex:250,textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.25)"}}>
          {toast.msg}
        </div>
      )}

      {/* Event detail modal */}
      {evModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&setEvModal(null)}>
          <div style={{background:"#fff",borderRadius:18,padding:20,width:"100%",maxWidth:420,maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>DEE Event Detail — {evModal.type==="mkt"?"Market Event":"Company Event"}</div>
            <div style={{fontSize:24,marginBottom:8}}>{evModal.ico}</div>
            <div style={{fontSize:18,fontWeight:800,color:DK,marginBottom:6}}>{evModal.n}</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6,marginBottom:12}}>{evModal.desc}</div>
            <div style={{background:"#f8fbf8",borderRadius:9,padding:11,marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase",marginBottom:5}}>Governor Integration</div><div style={{fontSize:12,color:"#555",fontFamily:"DM Mono,monospace",lineHeight:1.5}}>{evModal.detail}</div></div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <SBox l="Type" v={evModal.type==="mkt"?"Market":"Company"}/>
              <SBox l="Turns Left" v={evModal.tl+"/"+evModal.dur} c={G}/>
              <SBox l="Sentiment" v={evModal.type==="mkt"?(evModal.sent>=0?"+":"")+((evModal.sent||0)*100).toFixed(0)+"%":"N/A"}/>
            </div>
            {evModal.type==="co"&&evModal.tk&&<div style={{background:"#E8F5E9",borderRadius:9,padding:10,marginBottom:12,fontSize:12,color:"#1B5E20"}}><strong>Company:</strong> {evModal.cn||evModal.tk} · Controlling stake (25%+) gives you strategic choice of response.</div>}
            <button onClick={()=>setEvModal(null)} style={{width:"100%",background:G,color:"#fff",border:"none",borderRadius:10,padding:12,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Close</button>
          </div>
        </div>
      )}

      {/* Trade modal */}
      {trM&&tab!=="trade"&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setTrM(null)}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{width:36,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 15px"}}/>
            {Trade}
          </div>
        </div>
      )}

      {/* Donate modal */}
      {donM&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setDonM(null)}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
            <div style={{width:36,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 15px"}}/>
            <div style={{fontSize:18,fontWeight:800,color:DK,marginBottom:3}}>❤️ Donate to {donM}</div>
            <div style={{fontSize:12,color:"#888",marginBottom:4}}>Cash available: {fmt(cash)} · Donations made: {dons}/2 needed</div>
            <div style={{background:"#E8F5E9",borderRadius:9,padding:10,marginBottom:12,fontSize:12,color:G,lineHeight:1.5}}>Reduces tax rate up to 25% · Counts toward Solar System unlock (2 donations needed)</div>
            <div style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Select Amount — No Keyboard</div>
            <AmtPicker max={cash} sel={donAmt} onSel={setDonAmt}/>
            {donAmt&&<div style={{background:"#f8fbf8",borderRadius:9,padding:10,marginBottom:12}}><Row k="Donation Amount" v={fmt(donAmt)} vColor="#880E4F" bold/><Row k="Est. Tax Saving" v={fmt(donAmt*.20)} vColor={G}/></div>}
            <button onClick={doDonate} disabled={!donAmt||donAmt>cash} style={{width:"100%",background:donAmt&&donAmt<=cash?"#880E4F":"#e0e0e0",color:"#fff",border:"none",borderRadius:11,padding:14,fontWeight:800,fontSize:15,cursor:donAmt?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>❤️ Confirm Donation{donAmt?" — "+fmt(donAmt):""}</button>
          </div>
        </div>
      )}

      {/* GSF modal */}
      {gsfM&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setGsfM(false)}>
          <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,width:"100%"}}>
            <div style={{width:36,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 15px"}}/>
            <div style={{fontSize:18,fontWeight:800,color:DK,marginBottom:3}}>🏛️ Deposit to GSF</div>
            <div style={{fontSize:12,color:"#888",marginBottom:4}}>Rate: {gsf.toFixed(2)}% annual · Cash: {fmt(cash)} · Current deposit: {fmt(gsfDep)}</div>
            <div style={{fontSize:11,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Select Amount — No Keyboard</div>
            <AmtPicker max={cash} sel={gsfAmt} onSel={setGsfAmt}/>
            {gsfAmt&&<div style={{background:"#E3F2FD",borderRadius:9,padding:10,marginBottom:12}}><Row k="Deposit" v={fmt(gsfAmt)} vColor={BL} bold/><Row k="Annual Return" v={fmt(gsfAmt*(gsf/100))} vColor={G}/><Row k="Per Turn (Monthly)" v={fmt(gsfAmt*(gsf/100/12))} vColor={G}/></div>}
            <button onClick={doGsf} disabled={!gsfAmt||gsfAmt>cash} style={{width:"100%",background:gsfAmt&&gsfAmt<=cash?BL:"#e0e0e0",color:"#fff",border:"none",borderRadius:11,padding:14,fontWeight:800,fontSize:15,cursor:gsfAmt?"pointer":"not-allowed",fontFamily:"DM Sans,sans-serif"}}>🏛️ Confirm Deposit{gsfAmt?" — "+fmt(gsfAmt):""}</button>
          </div>
        </div>
      )}

      {/* Quiz modal */}
      {quizM&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:14}}>
          <div style={{background:"#fff",borderRadius:18,padding:20,width:"100%",maxWidth:440,maxHeight:"88vh",overflowY:"auto"}}>
            <div style={{fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>🎓 Academy Quiz — Module {quizM.id}/15</div>
            <div style={{fontSize:17,fontWeight:800,color:DK,marginBottom:14}}>{quizM.n}</div>
            <div style={{background:"#f8fbf8",borderRadius:10,padding:13,fontSize:13,color:"#444",lineHeight:1.6,marginBottom:14}}><strong>Scenario:</strong> {quizM.q}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {quizM.opts.map((o,i)=>(
                <button key={i} onClick={()=>setQuizA(i)} style={{padding:"12px 14px",borderRadius:10,border:`2px solid ${quizA===i?G:"#e0e0e0"}`,textAlign:"left",background:quizA===i?"#E8F5E9":"#fafafa",color:quizA===i?"#1B5E20":"#333",fontWeight:quizA===i?700:400,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif",transition:"all .15s"}}>
                  <span style={{fontWeight:700,marginRight:8,color:quizA===i?G:"#aaa"}}>{["A","B","C","D"][i]}.</span>{o}
                </button>
              ))}
            </div>
            {quizA!==null&&(
              <div style={{background:quizA===quizM.ans?"#E8F5E9":"#FFEBEE",borderRadius:10,padding:12,marginBottom:12,fontSize:12,lineHeight:1.6,color:quizA===quizM.ans?"#1B5E20":R}}>
                {quizA===quizM.ans?"✅ Correct! ":"❌ Incorrect. "}{quizM.exp}
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setQuizM(null);setQuizA(null);}} style={{flex:1,padding:"12px 0",borderRadius:10,border:"1.5px solid #e0e0e0",background:"#f5f5f5",color:"#666",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>Cancel</button>
              <button onClick={()=>doModule(quizM)} style={{flex:2,padding:"12px 0",borderRadius:10,border:"none",background:G,color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>✓ Complete Module{quizA!==null?" ("+["A","B","C","D"][quizA]+" selected)":""}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500;600&display=swap');
        @keyframes scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        button { outline: none; }
      `}</style>
    </div>
  );
}
