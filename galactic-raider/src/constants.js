// ── GOVERNOR ──────────────────────────────────────────────────
export const PE_BOUNDS = {
  Technology:{mn:15,mx:35}, Banking:{mn:8,mx:18}, Energy:{mn:6,mx:15},
  Mining:{mn:6,mx:12}, Healthcare:{mn:16,mx:30}, Agriculture:{mn:10,mx:18},
  Manufacturing:{mn:10,mx:18}, Utilities:{mn:12,mx:18}, Telecom:{mn:10,mx:16},
  'Real Estate':{mn:8,mx:16}, Retail:{mn:10,mx:18},
};

// ── TAX ERAS ──────────────────────────────────────────────────
export const TAX_ERAS = [
  { name:'Normal',      cgt:.20, divTax:.15, desc:'Standard tax environment.' },
  { name:'Capital Gains', cgt:.05, divTax:.15, desc:'Sell profitable positions NOW — 5% CGT.' },
  { name:'Low Tax',     cgt:.10, divTax:.05, desc:'Buy and sell freely. Low friction.' },
  { name:'High Tax',    cgt:.30, divTax:.25, desc:'HOLD — do not realise gains.' },
  { name:'Dividend',    cgt:.20, divTax:.05, desc:'Buy high-yield stocks — 5% dividend tax.' },
  { name:'Transaction', cgt:.20, divTax:.15, desc:'Trade frequently — low transaction costs.' },
  { name:'Wealth Tax',  cgt:.20, divTax:.15, desc:'Affects $10B+ portfolios — donate to reduce.' },
  { name:'Normal',      cgt:.20, divTax:.15, desc:'Cycle repeats.' },
];

// ── EARTH COMPANIES ───────────────────────────────────────────
export const EARTH_COMPANIES = [
  { t:'SLKT', n:'Silk Road Tech',    s:'Technology',    ip:348.94, pe0:18.4, div:.8,  b:1.8, yr:2008, emp:125000, hq:'Singapore',
    ceo:'Dr. Lin Wei',  founder:'Dr. Lin Wei',
    origin:'Lin Wei sold his Singapore apartment to fund the first server. Grew from 4 staff in a Jurong shophouse to 125,000 people across 18 countries.',
    ops:'Enterprise cloud, AI chips, cross-border data services.',
    analysts:[{firm:'AstroCapital Research',rating:'STRONG BUY',target:420,note:'Dominant AI infrastructure play. Cloud margins expanding 200bps annually.'},{firm:'NebulaSecurities',rating:'BUY',target:395,note:'Asia Pacific cloud penetration still only 34%. Massive runway.'},{firm:'CosmosAlpha',rating:'HOLD',target:360,note:'Great company, fair price. Would add on any pullback below $320.'},{firm:'StarEdge Capital',rating:'SELL',target:290,note:'P/E of 18× unjustified given slowing revenue growth.'}],
    ceoProfile:{rep:82,tenure:17,style:'Growth-focused',track:'Strong'} },
  { t:'MRDB', n:'Meridian Bank',      s:'Banking',       ip:85.20,  pe0:12.1, div:2.1, b:.9,  yr:1985, emp:45000,  hq:'New York',
    ceo:'Patricia Hernandez', founder:'James R. Meridian',
    origin:'James Meridian started as a teller in Brooklyn in 1972. Built one branch into a regional powerhouse through 14 acquisitions.',
    ops:'2,400 retail branches across US Midwest and Northeast. Corporate lending, wealth management.',
    analysts:[{firm:'GalaxiaBank Research',rating:'BUY',target:95,note:'NIM expansion in rising rate environment. 2.1% dividend is reliable.'},{firm:'OrbitalFinance',rating:'HOLD',target:86,note:'In-line with sector. Neutral.'}],
    ceoProfile:{rep:74,tenure:9,style:'Conservative',track:'Steady'} },
  { t:'FRMN', n:'Frontier Mining',    s:'Mining',        ip:15.80,  pe0:8.5,  div:.5,  b:1.6, yr:2005, emp:28000,  hq:'Johannesburg',
    ceo:'Amara Diallo', founder:'Kwame Asante',
    origin:'Ghanaian geologist Kwame Asante discovered a rare earth deposit in rural Ghana while working for a junior explorer.',
    ops:'Iron ore in Mauritania, lithium in Zimbabwe, rare earths in DRC.',
    analysts:[{firm:'PlanetaryCredit SA',rating:'BUY',target:22,note:'Lithium reserve base severely undervalued. EV demand structural.'},{firm:'Interstellar Equity',rating:'HOLD',target:17,note:'Good company but commodity cycle risk is real.'}],
    ceoProfile:{rep:65,tenure:8,style:'Aggressive',track:'Volatile'} },
  { t:'TNPT', n:'Titan Petroleum',    s:'Energy',        ip:351.54, pe0:11.3, div:1.8, b:1.2, yr:1995, emp:62000,  hq:'Dubai',
    ceo:'Sheikh Rashid Al-Mansouri', founder:'Al-Mansouri family',
    origin:'Established as a private trading company in Abu Dhabi in 1995. Listed on DFM in 2003.',
    ops:'Crude production in UAE, Kuwait and Oman. Pipeline infrastructure across Kazakhstan.',
    analysts:[{firm:'CosmicVentures',rating:'BUY',target:390,note:'Upstream cost structure among lowest globally. FCF yield 8.2%.'},{firm:'DeltaQuad Research',rating:'SELL',target:310,note:'Energy transition risk underpriced.'}],
    ceoProfile:{rep:71,tenure:22,style:'Dividend-focused',track:'Reliable'} },
  { t:'MDCR', n:'MediCore Group',     s:'Healthcare',    ip:198.40, pe0:22.1, div:1.2, b:.8,  yr:2005, emp:38000,  hq:'Boston',
    ceo:'Dr. Sarah Chen', founder:'Dr. Marcus Webb',
    origin:'Harvard oncologist Dr. Marcus Webb licensed his tumour-targeting patent in 2005.',
    ops:'180 hospitals, 400 diagnostic labs across North America. 3 oncology drugs in Phase 3.',
    analysts:[{firm:'NovaMed Capital',rating:'STRONG BUY',target:240,note:'Phase 3 data transformational if successful.'},{firm:'HelixBio Funds',rating:'BUY',target:215,note:'Defensive growth at reasonable valuation.'},{firm:'ArcturusCapital',rating:'HOLD',target:195,note:'Phase 3 binary risk in 6 months.'}],
    ceoProfile:{rep:78,tenure:12,style:'Conservative',track:'Steady'} },
  { t:'UTLS', n:'Utility Systems',    s:'Utilities',     ip:58.40,  pe0:14.2, div:4.2, b:.5,  yr:1950, emp:12000,  hq:'Chicago',
    ceo:'Robert Keller', founder:'Chicago City Council',
    origin:'Created by Chicago City Council in 1950. Privatised in 1987. Regulated monopoly.',
    ops:'Electric grid for 1.9M customers. Gas to 1.3M across US Midwest. 3 nuclear plants.',
    analysts:[{firm:'SolarTrade Analytics',rating:'BUY',target:63,note:'4.2% yield with regulatory moat. Safe haven in volatile markets.'},{firm:'GravityCapital',rating:'HOLD',target:59,note:'Fair value. Yield attractive but growth is zero.'}],
    ceoProfile:{rep:74,tenure:9,style:'Income-focused',track:'Stable'} },
  { t:'TLCM', n:'TeleCom Europe',     s:'Telecom',       ip:88.60,  pe0:13.5, div:4.5, b:.6,  yr:1985, emp:48000,  hq:'Frankfurt',
    ceo:'Klaus Hoffman', founder:'West German government',
    origin:'Emerged from privatisation of West Germany\'s postal telephone monopoly in 1985.',
    ops:'Mobile, broadband and enterprise telecoms across 22 European countries. 280M subscribers.',
    analysts:[{firm:'VegaPartners',rating:'HOLD',target:92,note:'5G rollout complete. 4.5% dividend is the thesis.'},{firm:'PulsarResearch',rating:'SELL',target:78,note:'Spectrum auction costs incoming. Dividend at risk.'}],
    ceoProfile:{rep:68,tenure:6,style:'Defensive',track:'Stable'} },
  { t:'RLST', n:'RealEstate Trust',   s:'Real Estate',   ip:44.20,  pe0:12.8, div:3.8, b:.7,  yr:1995, emp:2800,   hq:'Dallas',
    ceo:'Michael Johnson', founder:'Texas pension funds',
    origin:'Created by Texas pension funds in 1995. Pivoted to logistics warehouses in 2018.',
    ops:'$18B portfolio. 40% logistics warehouses, 35% industrial, 25% office. Sun Belt focus.',
    analysts:[{firm:'OrbitalREIT Research',rating:'BUY',target:52,note:'Best-in-class logistics REIT. E-commerce structural demand.'},{firm:'VoidSpace Equity',rating:'HOLD',target:45,note:'Good REIT, full valuation.'}],
    ceoProfile:{rep:72,tenure:11,style:'Income-focused',track:'Steady'} },
  { t:'EMTS', n:'Emerging Tech',      s:'Technology',    ip:28.40,  pe0:22.0, div:.2,  b:2.0, yr:2015, emp:6500,   hq:'Mumbai',
    ceo:'Priya Patel', founder:'Priya Patel',
    origin:'MIT graduate Priya Patel returned to India in 2015 to build enterprise cloud for South Asian SMEs.',
    ops:'B2B SaaS for 18,000 corporate clients across India, Bangladesh, Sri Lanka, Pakistan.',
    analysts:[{firm:'NebulaTech Capital',rating:'STRONG BUY',target:40,note:'Best founder-led EM tech story we cover. TAM $45B.'},{firm:'VenusGrowth Advisors',rating:'BUY',target:35,note:'Valuation elevated but growth trajectory justifies it.'}],
    ceoProfile:{rep:80,tenure:10,style:'Growth-focused',track:'Strong'} },
  { t:'AGRO', n:'AgroLatin Corp',     s:'Agriculture',   ip:42.18,  pe0:13.2, div:2.5, b:1.1, yr:1975, emp:18000,  hq:'São Paulo',
    ceo:'Isabella Sousa', founder:'Carlos Sousa',
    origin:'Carlos Sousa started on a family farm in Mato Grosso in 1975. Third-generation family ownership.',
    ops:'4.2M hectares across Brazil and Argentina. Soy, corn, sugarcane and cattle exports.',
    analysts:[{firm:'HydraFarm Securities',rating:'BUY',target:52,note:'Consistent dividend payer. Farmland as hard asset.'},{firm:'AgroStar Research',rating:'HOLD',target:44,note:'Commodity price risk. Good company but timing matters.'}],
    ceoProfile:{rep:70,tenure:14,style:'Conservative',track:'Steady'} },
];

export const TOTAL_SHARES = {
  SLKT:1200000000, MRDB:800000000, FRMN:600000000, TNPT:900000000, MDCR:400000000,
  UTLS:300000000,  TLCM:550000000, RLST:250000000, EMTS:180000000, AGRO:500000000,
};

// ── CEO DECISIONS ─────────────────────────────────────────────
export const CEO_DECISIONS = [
  { id:1, ticker:'SLKT', company:'Silk Road Tech',  ceo:'Dr. Lin Wei',           type:'acquisition', turn:15, headline:'ACQUISITION OPPORTUNITY',
    context:'Dr. Lin Wei proposes acquiring a Korean AI startup for $2.8B. This would add 400 engineers and key patents.',
    opts:[{l:'Approve Acquisition',detail:'Add $2.8B debt. +15% revenue next 20 turns. Stock +8%.',priceImp:.08,repImp:5,good:true},{l:'Counter at $2.1B',detail:'60% chance deal completes. Stock +3% if success.',priceImp:.03,repImp:2,good:true},{l:'Decline',detail:'No debt added. Rival may acquire instead. Stock −2%.',priceImp:-.02,repImp:-1,good:false}], worstOpt:2, timeLimit:10 },
  { id:2, ticker:'MDCR', company:'MediCore Group',  ceo:'Dr. Sarah Chen',        type:'dividend',    turn:22, headline:'DIVIDEND POLICY DECISION',
    context:'Dr. Chen proposes increasing the annual dividend from 1.2% to 1.8% to attract income investors.',
    opts:[{l:'Increase to 1.8%',detail:'Higher yield attracts income investors. Stock +4%.',priceImp:.04,repImp:4,good:true},{l:'Maintain 1.2%',detail:'Preserve R&D spending. No immediate impact.',priceImp:0,repImp:0,good:true},{l:'Cut to 0.8%',detail:'More cash for pipeline. Stock −5% short-term.',priceImp:-.05,repImp:-3,good:false}], worstOpt:2, timeLimit:10 },
  { id:3, ticker:'TNPT', company:'Titan Petroleum', ceo:'Sheikh Rashid',         type:'expansion',   turn:31, headline:'MARKET EXPANSION',
    context:'Sheikh Rashid proposes opening operations in Kazakhstan — estimated $500M investment, 8% revenue uplift.',
    opts:[{l:'Approve Kazakhstan',detail:'$500M capex. +8% revenue over 30 turns.',priceImp:.06,repImp:5,good:true},{l:'Pilot $100M',detail:'Test market with limited exposure.',priceImp:.02,repImp:2,good:true},{l:'Stay in Gulf',detail:'No expansion. Preserve capital.',priceImp:-.01,repImp:-2,good:false}], worstOpt:2, timeLimit:10 },
  { id:4, ticker:'FRMN', company:'Frontier Mining', ceo:'Amara Diallo',          type:'cost_cut',    turn:8,  headline:'COST RESTRUCTURING PROPOSAL',
    context:'Amara Diallo proposes cutting 2,000 workers (7% of staff) to improve margins by 4%.',
    opts:[{l:'Approve restructuring',detail:'−2,000 jobs. +4% margin. Stock +6%. ESG risk.',priceImp:.06,repImp:-4,good:true},{l:'Smaller cut — 800 workers',detail:'−800 jobs. +1.5% margin.',priceImp:.02,repImp:-1,good:true},{l:'Reject',detail:'No cuts. Slower margin improvement.',priceImp:-.02,repImp:3,good:false}], worstOpt:2, timeLimit:10 },
];

// ── LOAN TIERS ────────────────────────────────────────────────
export const LOAN_TIERS = [
  {tier:1,max:50000,rate:.12,requires:'No prior loans',label:'Starter Loan'},
  {tier:2,max:250000,rate:.15,requires:'Tier 1 fully repaid',label:'Growth Loan'},
  {tier:3,max:500000,rate:.16,requires:'Tier 2 fully repaid',label:'Mini Business Loan'},
  {tier:4,max:1000000,rate:.18,requires:'Tier 3 repaid + $500K NW',label:'Business Loan'},
  {tier:5,max:5000000,rate:.22,requires:'Tier 4 repaid + $5M NW',label:'Corporate Loan'},
  {tier:6,max:25000000,rate:.25,requires:'Tier 5 repaid + $50M NW',label:'Premium Loan'},
];

// ── PLANETS ───────────────────────────────────────────────────
export const PLANETS_DATA = {
  Earth:   {id:'earth',   name:'Earth',   ico:'🌍',currency:'USD',rate:1.0, gdp:2.5,color:'#2E7D32',desc:'Base economy.',contagionDelay:0,contagionFactor:1,
    companies:[{t:'SLKT',n:'Silk Road Tech',s:'Technology',ip:348.94,div:.8,b:1.8},{t:'MRDB',n:'Meridian Bank',s:'Banking',ip:85.20,div:2.1,b:.9},{t:'FRMN',n:'Frontier Mining',s:'Mining',ip:15.80,div:.5,b:1.6},{t:'TNPT',n:'Titan Petroleum',s:'Energy',ip:351.54,div:1.8,b:1.2},{t:'MDCR',n:'MediCore Group',s:'Healthcare',ip:198.40,div:1.2,b:.8},{t:'UTLS',n:'Utility Systems',s:'Utilities',ip:58.40,div:4.2,b:.5},{t:'TLCM',n:'TeleCom Europe',s:'Telecom',ip:88.60,div:4.5,b:.6},{t:'RLST',n:'RealEstate Trust',s:'Real Estate',ip:44.20,div:3.8,b:.7},{t:'EMTS',n:'Emerging Tech',s:'Technology',ip:28.40,div:.2,b:2.0},{t:'AGRO',n:'AgroLatin Corp',s:'Agriculture',ip:42.18,div:2.5,b:1.1}]},
  Mars:    {id:'mars',    name:'Mars',    ico:'🔴',currency:'MCR',rate:.85,gdp:3.8,color:'#C62828',desc:'Mining economy. Contagion from Earth in 2 turns.',contagionDelay:2,contagionFactor:.5,stormRisk:false,
    companies:[{t:'MXMN',n:'Mars Extraction Co',s:'Mining',ip:42.50,div:.3,b:2.1},{t:'RDST',n:'RedDust Energy',s:'Energy',ip:18.20,div:.8,b:1.8},{t:'MROBOT',n:'Mars Robotics Corp',s:'Technology',ip:95.30,div:.1,b:2.5},{t:'MFOOD',n:'HydroFarm Mars',s:'Agriculture',ip:28.60,div:1.2,b:1.1}]},
  Venus:   {id:'venus',   name:'Venus',   ico:'🟡',currency:'VCR',rate:.75,gdp:2.1,color:'#F57F17',desc:'Automated energy economy. Contagion from Earth in 2 turns.',contagionDelay:2,contagionFactor:.67,
    companies:[{t:'VSOL',n:'Venus Solar Array',s:'Energy',ip:156.40,div:2.4,b:.9},{t:'VATM',n:'AtmoRefine Venus',s:'Manufacturing',ip:67.20,div:1.0,b:1.3},{t:'VROB',n:'Venus Autoworks',s:'Manufacturing',ip:38.90,div:.6,b:1.6}]},
  Jupiter: {id:'jupiter', name:'Jupiter', ico:'🟠',currency:'JCR',rate:.90,gdp:4.2,color:'#E65100',desc:'Robotic economy. Storm events every 50–100 turns. Buy post-storm.',contagionDelay:3,contagionFactor:.83,stormRisk:true,
    companies:[{t:'JATM',n:'Jupiter AutoMine',s:'Mining',ip:212.30,div:.2,b:2.8},{t:'JRES',n:'JupiterResearch AI',s:'Technology',ip:445.60,div:.1,b:3.2},{t:'JFUS',n:'Fusion Power Jupiter',s:'Energy',ip:88.40,div:.8,b:1.9}]},
  Saturn:  {id:'saturn',  name:'Saturn',  ico:'🪐',currency:'STC',rate:.70,gdp:3.1,color:'#7B1FA2',desc:'Ryzolith mining. Ring ice exports. Contagion from Earth in 4 turns.',contagionDelay:4,contagionFactor:.45,
    companies:[{t:'SRYZ',n:'Ryzolith Corp',s:'Mining',ip:380.20,div:.4,b:2.2},{t:'SICE',n:'Saturn Ice Export',s:'Agriculture',ip:22.40,div:1.8,b:.9},{t:'SRNG',n:'Ring Dynamics',s:'Manufacturing',ip:145.60,div:.5,b:1.7}]},
  Mercury: {id:'mercury', name:'Mercury', ico:'☿', currency:'MRC',rate:.60,gdp:5.2,color:'#455A64',desc:'Solar energy economy. 24× Earth solar intensity. Contagion from Earth in 2 turns.',contagionDelay:2,contagionFactor:.55,
    companies:[{t:'MSOL',n:'Mercury Solar Prime',s:'Energy',ip:290.80,div:2.2,b:1.1},{t:'MTHM',n:'ThermoMine Mercury',s:'Mining',ip:48.30,div:.7,b:1.8},{t:'MRBT',n:'Mercury Robotics',s:'Technology',ip:124.50,div:.3,b:2.0}]},
  Uranus:  {id:'uranus',  name:'Uranus',  ico:'🔵',currency:'URU',rate:.55,gdp:1.8,color:'#0277BD',desc:'Ice mining. 42-year seasonal cycles. Very long-term. Contagion in 5 turns.',contagionDelay:5,contagionFactor:.35,
    companies:[{t:'UICE',n:'Uranus Ice Dynamics',s:'Mining',ip:65.40,div:2.8,b:.7},{t:'UCRY',n:'CryoTech Uranus',s:'Technology',ip:185.20,div:.4,b:1.2},{t:'URES',n:'Uranus Research Base',s:'Healthcare',ip:42.10,div:1.1,b:.8}]},
  Neptune: {id:'neptune', name:'Neptune', ico:'💜',currency:'NPT',rate:.50,gdp:2.4,color:'#4527A0',desc:'Deep research economy. Highest risk, highest potential. Contagion in 6 turns.',contagionDelay:6,contagionFactor:.28,
    companies:[{t:'NRES',n:'Neptune Deep Research',s:'Technology',ip:520.40,div:.05,b:3.5},{t:'NWIN',n:'Wind Energy Neptune',s:'Energy',ip:38.60,div:3.2,b:1.4},{t:'NMIN',n:'Neptune Minerals',s:'Mining',ip:156.90,div:.9,b:2.1}]},
};

// ── PLANET SOVEREIGN FUNDS ────────────────────────────────────
export const SOVEREIGN_FUNDS = [
  {id:'ESF', planet:'Earth',   ico:'🌍',n:'Earth Sovereign Fund',     currency:'USD',rate:12.48,color:'#1B5E20',aum:2840000000000,desc:'Flagship interplanetary fund. Anchored to Earth GDP.'},
  {id:'MSF', planet:'Mars',    ico:'🔴',n:'Mars Mining Fund',          currency:'MCR',rate:18.4, color:'#B71C1C',aum:480000000000, desc:'Backed by Martian lithium and rare earth reserves. High yield.'},
  {id:'VSF', planet:'Venus',   ico:'🟡',n:'Venus Solar Fund',          currency:'VCR',rate:14.2, color:'#E65100',aum:620000000000, desc:'Automated solar energy exports. Steady compounding.'},
  {id:'JSF', planet:'Jupiter', ico:'🟠',n:'Jupiter Autonomous Fund',   currency:'JCR',rate:24.8, color:'#F57F17',aum:890000000000, desc:'Highest rate — reflects storm risk. Post-storm deposits earn maximum yield.'},
  {id:'SSF', planet:'Saturn',  ico:'🪐',n:'Saturn Ryzolith Fund',      currency:'STC',rate:16.6, color:'#7B1FA2',aum:310000000000, desc:'Backed by Ryzolith monopoly. Grows every 100 turns.'},
  {id:'MRSF',planet:'Mercury', ico:'☿', n:'Mercury Solar Fund',        currency:'MRC',rate:15.8, color:'#455A64',aum:240000000000, desc:'Solar flare events boost returns. Extremely reliable baseline.'},
  {id:'USF', planet:'Uranus',  ico:'🔵',n:'Uranus Cryogenic Fund',     currency:'URU',rate:11.2, color:'#0277BD',aum:180000000000, desc:'Lowest volatility fund. 42-year season changes create predictable rebalancing.'},
  {id:'NSF', planet:'Neptune', ico:'💜',n:'Neptune Research Fund',     currency:'NPT',rate:28.4, color:'#4527A0',aum:95000000000,  desc:'Highest rate of all funds — extreme risk. Research breakthroughs spike returns.'},
];

// ── ETFs ──────────────────────────────────────────────────────
export const ETFS = [
  {id:'GSFE',n:'Global Equity',       type:'Equity',   ip:142.50,expense:.12,div:1.8, sharpe:1.42,maxDD:-.18,ytd:.142,desc:'Diversified equity across 15 Earth companies. Low cost, broad market.'},
  {id:'GSFT',n:'Tech Focus',          type:'Sector',   ip:89.40, expense:.25,div:.4,  sharpe:1.85,maxDD:-.28,ytd:.285,desc:'Concentrated technology exposure. Higher volatility, higher potential.'},
  {id:'GSFD',n:'Dividend Income',     type:'Income',   ip:58.20, expense:.18,div:4.8, sharpe:1.12,maxDD:-.09,ytd:.048,desc:'High dividend yield strategy. 4.8% annual distribution. Defensive income.'},
  {id:'GSFM',n:'Mining & Resources',  type:'Sector',   ip:34.80, expense:.32,div:.9,  sharpe:.92, maxDD:-.35,ytd:-.028,desc:'Commodities exposure. Cyclical. Benefits from inflation and supply shocks.'},
  {id:'GSFP',n:'Planet Gateway',      type:'Thematic', ip:28.60, expense:.45,div:.2,  sharpe:1.65,maxDD:-.42,ytd:.412,desc:'Access to space economy expansion. All 7 planet exposure. High upside.'},
];

// ── IPOs ──────────────────────────────────────────────────────
// offerSize = total raise. A single investor may book at most 10% of the offer (maxBook).
export const IPOS = [
  {id:'NVRA',n:'NovaMed Robotics', sector:'Healthcare',planet:'Earth',  priceRange:[18,22],oversubscribed:5.7,opens:50, offerSize:400000000,
   desc:'AI-powered surgical robots. 40 hospitals signed. Revenue $180M growing 85% YoY.',
   founder:'Dr. Kira Osei',analysts:[{firm:'OrbitRating',view:'STRONG BUY',target:28,note:'Disruptive. Surgical robot TAM $45B.'}]},
  {id:'CLDB',n:'CloudBase Systems', sector:'Technology',planet:'Earth',  priceRange:[12,15],oversubscribed:1.8,opens:120, offerSize:600000000,
   desc:'Edge computing infrastructure. 2,400 enterprise clients. Revenue $420M.',
   founder:'Aria Nkosi',analysts:[{firm:'VegaAnalytics',view:'BUY',target:18,note:'Growing fast. Edge computing structural trend.'}]},
  {id:'GRNX',n:'GreenX Energy',    sector:'Energy',   planet:'Venus',  priceRange:[8,11], oversubscribed:.8, opens:200, offerSize:250000000,
   desc:'Green hydrogen production across Venus orbital platforms. 12 government contracts.',
   founder:'Erik Vasquez',analysts:[{firm:'PlanetaryFunds',view:'SPECULATIVE BUY',target:14,note:'Hydrogen is the future. Near-term path to profit unclear.'}]},
  {id:'LOGX',n:'LogiXpress Freight',sector:'Logistics',planet:'Mars',   priceRange:[24,28],oversubscribed:5.3,opens:300, offerSize:1200000000,
   desc:'AI freight matching across inner planets. 18,000 transport partners. Revenue $890M profitable.',
   founder:'Marcus Adeyemi',analysts:[{firm:'OrbitRating',view:'STRONG BUY',target:35,note:'Profitable, growing, asset-light. Prime IPO.'}]},
  {id:'RYZX',n:'Ryzolith Dynamics', sector:'Mining',   planet:'Saturn', priceRange:[45,55],oversubscribed:4.2,opens:400, offerSize:900000000,
   desc:'Only private company licensed to mine Ryzolith outside the Saturn Sovereign Fund.',
   founder:'Yuki Tanaka',analysts:[{firm:'OuterRing Analytics',view:'STRONG BUY',target:75,note:'Monopoly-adjacent position. Generational opportunity.'}]},
  {id:'ASTRX',n:'AstroShip Labs', sector:'Technology',planet:'Earth', priceRange:[32,38],oversubscribed:3.2,opens:80, offerSize:550000000,
   desc:'Spacecraft design & manufacturing. 12 contracts with planetary transit companies. Revenue $260M.',
   founder:'Chen Wei',analysts:[{firm:'VegaAnalytics',view:'STRONG BUY',target:50,note:'Aerospace boom underway. Growth trajectory exceptional.'}]},
  {id:'BIOPX',n:'BioPharma Nexus', sector:'Healthcare',planet:'Earth', priceRange:[22,26],oversubscribed:4.1,opens:160, offerSize:480000000,
   desc:'Gene therapy for rare diseases. 8 drugs in Phase 3 trials. Zero revenue yet but pipeline worth $8B.',
   founder:'Dr. Amira Hassan',analysts:[{firm:'HealthTech Research',view:'BUY',target:35,note:'Pipeline de-risks in 2-3 years. High upside if trials succeed.'}]},
  {id:'SOLPW',n:'SolarPower Grid', sector:'Energy',planet:'Mercury', priceRange:[28,34],oversubscribed:2.7,opens:250, offerSize:700000000,
   desc:'Orbital solar panels harvesting Mercury solar energy. 15 governments signed contracts. Revenue $420M.',
   founder:'Dr. Rashid Al-Maktoum',analysts:[{firm:'OuterRing Analytics',view:'BUY',target:48,note:'Clean energy megatrend. Mercury location provides 8x Earth solar intensity.'}]},
  {id:'QUANTM',n:'Quantum Networks', sector:'Technology',planet:'Earth', priceRange:[15,19],oversubscribed:6.2,opens:110, offerSize:520000000,
   desc:'Quantum computing as a service. 340 enterprise customers. Revenue $185M. Fastest growing cloud segment.',
   founder:'Dr. Kenji Yamamoto',analysts:[{firm:'TechFuture Capital',view:'STRONG BUY',target:28,note:'Quantum adoption accelerating. Market expanding 47% annually.'}]},
  {id:'TERAFD',n:'Terraform Solutions', sector:'Infrastructure',planet:'Mars', priceRange:[16,20],oversubscribed:2.3,opens:280, offerSize:600000000,
   desc:'Atmosphere processing & habitat construction for Mars. Govt contracts worth $2.4B over 10 years.',
   founder:'Robert Jacobson',analysts:[{firm:'PlanetaryFunds',view:'BUY',target:26,note:'Mars colonization lock-in. Non-cyclical government revenue.'}]},
  {id:'NANOMT',n:'NanoMaterials Tech', sector:'Manufacturing',planet:'Earth', priceRange:[11,14],oversubscribed:3.8,opens:190, offerSize:420000000,
   desc:'Graphene & carbon nanotubes. 200+ industrial clients. Revenue $95M, scaling 60% YoY.',
   founder:'Prof. Lisa Chen',analysts:[{firm:'ManufacturingTrends',view:'BUY',target:22,note:'Advanced materials TAM $180B. Early consolidation play.'}]},
  {id:'CYBXN',n:'CyberDefense Networks', sector:'Technology',planet:'Earth', priceRange:[25,30],oversubscribed:4.9,opens:150, offerSize:500000000,
   desc:'Blockchain security infrastructure. 1,200 enterprise customers. Revenue $340M. 75% margins.',
   founder:'Dr. Zara Okafor',analysts:[{firm:'SecurityFirst Ventures',view:'STRONG BUY',target:42,note:'Cybersecurity spending accelerating. Margins exceptional.'}]},
  {id:'AQUATX',n:'AquaHarvest Systems', sector:'Utilities',planet:'Venus', priceRange:[19,23],oversubscribed:1.9,opens:220, offerSize:380000000,
   desc:'Water extraction & purification on Venus. 8 atmospheric processors deployed. Revenue $110M.',
   founder:'Sophia Petrov',analysts:[{firm:'PlanetaryFunds',view:'BUY',target:32,note:'Venus water is critical for life support. Secular growth.'}]},
  {id:'DRONAI',n:'DroneAI Systems', sector:'Technology',planet:'Earth', priceRange:[17,21],oversubscribed:3.4,opens:170, offerSize:480000000,
   desc:'Autonomous drone fleet management. 45 cities use platform. Revenue $165M. 85% recurring revenue.',
   founder:'James Sullivan',analysts:[{firm:'VegaAnalytics',view:'BUY',target:31,note:'Urban logistics transformation. Sticky, scalable SaaS.'}]},
  {id:'METAML',n:'MetaMin & Logistics', sector:'Mining',planet:'Saturn', priceRange:[38,46],oversubscribed:3.6,opens:380, offerSize:800000000,
   desc:'Automated asteroid mining + space logistics. 5 active mining operations. Revenue $520M.',
   founder:'Isabella Rossi',analysts:[{firm:'OuterRing Analytics',view:'BUY',target:62,note:'Space resource economy emerging. First-mover advantage.'}]},
  {id:'SYNBIO',n:'SyntheticBio Corp', sector:'Healthcare',planet:'Earth', priceRange:[20,25],oversubscribed:5.1,opens:240, offerSize:450000000,
   desc:'Synthetic biology for agriculture. 12 patents. Partnerships with 3 major ag conglomerates. Revenue $78M.',
   founder:'Dr. Priya Mehta',analysts:[{firm:'AgTechLeaders',view:'STRONG BUY',target:36,note:'Food security crisis driving adoption. Patent moat strong.'}]},
];

// ── PHILANTHROPY CATEGORIES ───────────────────────────────────
export const PHI_CATS = [
  {n:'Healthcare',    ico:'🏥',rate:.20,dur:3, mult:1.3},
  {n:'Education',     ico:'🎓',rate:.25,dur:5, mult:1.5},
  {n:'Environment',   ico:'🌱',rate:.30,dur:7, mult:1.1},
  {n:'Infrastructure',ico:'🌉',rate:.15,dur:4, mult:1.0},
  {n:'Poverty',       ico:'🤝',rate:.20,dur:3, mult:1.2},
  {n:'Science',       ico:'🔬',rate:.25,dur:5, mult:1.0},
  {n:'Arts',          ico:'🎨',rate:.10,dur:2, mult:1.0},
  {n:'Disaster',      ico:'🚨',rate:.35,dur:8, mult:1.0},
];

// ── WHEEL SEGMENTS ────────────────────────────────────────────
export const WHEEL_SEGMENTS = [
  {l:'5%',  sub:'Debt Relief', c:'#4CAF50',outcome:'debt5',  prob:30},
  {l:'Pts', sub:'+100 pts',    c:'#9C27B0',outcome:'pts100', prob:15},
  {l:'10%', sub:'Debt Relief', c:'#2196F3',outcome:'debt10', prob:20},
  {l:'5%',  sub:'Debt Relief', c:'#4CAF50',outcome:'debt5',  prob:30},
  {l:'15%', sub:'Debt Relief', c:'#FF9800',outcome:'debt15', prob:15},
  {l:'5%',  sub:'Debt Relief', c:'#4CAF50',outcome:'debt5',  prob:30},
  {l:'25%', sub:'Debt Relief', c:'#F44336',outcome:'debt25', prob:10},
  {l:'Pts', sub:'+200 pts',    c:'#9C27B0',outcome:'pts200', prob:10},
  {l:'50%', sub:'Jackpot!',    c:'#FFD700',outcome:'debt50', prob:10},
  {l:'5%',  sub:'Debt Relief', c:'#4CAF50',outcome:'debt5',  prob:30},
  {l:'15%', sub:'Debt Relief', c:'#FF9800',outcome:'debt15', prob:15},
  {l:'10%', sub:'Debt Relief', c:'#2196F3',outcome:'debt10', prob:20},
];

// ── COMMODITIES ───────────────────────────────────────────────
export const COMMODITIES = [
  // ── EARTH (always unlocked) ──────────────────────────────────
  {id:'XAU',  n:'Gold',              ico:'🥇', cat:'Earth',   unit:'oz',    ip:2100,  vol:.06, tax:.15, desc:'Eternal store of value. Spikes during crises, conflict and recession.', unlock:null,     color:'#F59E0B'},
  {id:'XAG',  n:'Silver',            ico:'⚪', cat:'Earth',   unit:'oz',    ip:26,    vol:.09, tax:.15, desc:'Industrial and precious. Tracks gold with higher volatility.', unlock:null,     color:'#94A3B8'},
  {id:'XWTI', n:'Crude Oil (WTI)',   ico:'🛢️', cat:'Earth',   unit:'bbl',   ip:78,    vol:.10, tax:.15, desc:'Lifeblood of Earth economy. OPEC decisions and geopolitical events drive price swings.', unlock:null,     color:'#78350F'},
  {id:'XGAS', n:'Natural Gas',       ico:'🔥', cat:'Earth',   unit:'MMBtu', ip:3.50,  vol:.14, tax:.15, desc:'Clean transition fuel. Seasonal spikes. Volatile but recovers fast.', unlock:null,     color:'#F97316'},
  {id:'XCOP', n:'Copper',            ico:'🟤', cat:'Earth',   unit:'lb',    ip:4.20,  vol:.08, tax:.15, desc:'Metal of civilization. Tracks global GDP closely. Essential for electrification.', unlock:null,     color:'#B45309'},
  {id:'XLIT', n:'Lithium',           ico:'⚡', cat:'Earth',   unit:'ton',   ip:18000, vol:.15, tax:.15, desc:'EV revolution fuel. Earth reserves are scarce. Martian deposits could transform supply.', unlock:null,     color:'#6366F1'},
  {id:'XRARE',n:'Rare Earth Bundle', ico:'💎', cat:'Earth',   unit:'unit',  ip:450,   vol:.11, tax:.15, desc:'17 critical elements needed for EVs, satellites and space tech. Geopolitically sensitive.', unlock:null,     color:'#8B5CF6'},
  {id:'XIRON',n:'Iron Ore',          ico:'⚙️', cat:'Earth',   unit:'ton',   ip:125,   vol:.09, tax:.15, desc:'Foundation of industry. Demand driven by construction and heavy manufacturing.', unlock:null,     color:'#6B7280'},
  {id:'XPLAT',n:'Platinum',          ico:'🔘', cat:'Earth',   unit:'oz',    ip:980,   vol:.07, tax:.15, desc:'Hydrogen economy catalyst. Rising with fuel cell adoption across space fleets.', unlock:null,     color:'#CBD5E1'},
  {id:'XWHT', n:'Wheat',             ico:'🌾', cat:'Earth',   unit:'bushel',ip:6.50,  vol:.12, tax:.15, desc:"Earth's food staple. Conflict and drought cause violent price spikes.", unlock:null,     color:'#D97706'},
  // ── MARS ($5B unlock) ────────────────────────────────────────
  {id:'MLIT', n:'Martian Lithium',   ico:'🔴', cat:'Mars',    unit:'ton',   ip:54000, vol:.18, tax:.15, desc:'Ultra-pure, 3× Earth grade. Powers the entire solar EV industry. Rising fast.', unlock:'Mars',    color:'#C62828'},
  {id:'MIRO', n:'Red Dust Iron',     ico:'🌋', cat:'Mars',    unit:'ton',   ip:390,   vol:.14, tax:.15, desc:'Higher purity than Earth iron. Core material for Mars robotics and interplanetary construction.', unlock:'Mars',    color:'#B45309'},
  {id:'MPER', n:'Martian Perchlorates',ico:'🧪',cat:'Mars',  unit:'kg',    ip:1200,  vol:.20, tax:.15, desc:'Unique Martian chemical compounds. Used in life support systems and fuel synthesis.', unlock:'Mars',    color:'#7F1D1D'},
  // ── VENUS ($50B unlock) ───────────────────────────────────────
  {id:'VSUL', n:'Venus Compounds',   ico:'🟡', cat:'Venus',   unit:'unit',  ip:2800,  vol:.16, tax:.15, desc:'Sulfuric industrial compounds extracted from Venus atmosphere. Chemical manufacturing base.', unlock:'Venus',   color:'#F57F17'},
  {id:'VATM', n:'Atmospheric Carbon',ico:'🌫️', cat:'Venus',   unit:'ton',   ip:380,   vol:.13, tax:.15, desc:'Captured from Venus 96% CO₂ atmosphere. Used in carbon-composite manufacturing.', unlock:'Venus',   color:'#92400E'},
  // ── JUPITER ($200B unlock) ────────────────────────────────────
  {id:'JGAS', n:'Fusion Hydrogen',   ico:'🟠', cat:'Jupiter', unit:'unit',  ip:45,    vol:.22, tax:.15, desc:'Fusion-grade hydrogen from Jupiter atmosphere. Storm events cause massive supply disruptions.', unlock:'Jupiter', color:'#E65100'},
  {id:'JICE', n:'Jupiter Ice',       ico:'❄️', cat:'Jupiter', unit:'unit',  ip:220,   vol:.16, tax:.15, desc:'Ice crystal formations unique to Jupiter upper atmosphere. Used in cryo-propulsion systems.', unlock:'Jupiter', color:'#0891B2'},
  // ── SATURN ($1T unlock) ───────────────────────────────────────
  {id:'SRYZ', n:'Ryzolith',          ico:'🪐', cat:'Saturn',  unit:'unit',  ip:8500,  vol:.20, tax:.15, desc:'The most valuable substance in the solar system. Ryzolith Corp controls 94% of supply. Scarcity drives price.', unlock:'Saturn',  color:'#7B1FA2'},
  {id:'SICE', n:'Ring Ice',          ico:'💧', cat:'Saturn',  unit:'unit',  ip:180,   vol:.08, tax:.15, desc:'Ultra-pure water ice from Saturn rings. Exported for terraforming operations across the system.', unlock:'Saturn',  color:'#0277BD'},
  // ── MERCURY ($10T unlock) ─────────────────────────────────────
  {id:'MSOL', n:'Solar Crystals',    ico:'☀️', cat:'Mercury', unit:'unit',  ip:6200,  vol:.17, tax:.15, desc:'Energy storage medium grown in Mercury extreme solar conditions. Powers interplanetary grid.', unlock:'Mercury', color:'#455A64'},
  {id:'MTHM', n:'Thermal Ore',       ico:'🌡️', cat:'Mercury', unit:'ton',   ip:3400,  vol:.15, tax:.15, desc:'Ore transformed by Mercury extreme heat cycles. Ultra-dense energy storage material.', unlock:'Mercury', color:'#78350F'},
  // ── URANUS ($50T unlock) ──────────────────────────────────────
  {id:'UGAS', n:'Cryo-Methane',      ico:'🔵', cat:'Uranus',  unit:'unit',  ip:420,   vol:.19, tax:.15, desc:'Cold-process ultra-efficient methane fuel. Seasonal Uranus cycles cause 42-year supply patterns.', unlock:'Uranus',  color:'#0277BD'},
  {id:'UICE', n:'Uranian Ice',       ico:'🧊', cat:'Uranus',  unit:'ton',   ip:890,   vol:.14, tax:.15, desc:'Diamond-ice crystals from Uranus mantle. Extreme hardness. Used in space drill technology.', unlock:'Uranus',  color:'#38BDF8'},
  // ── NEPTUNE ($100T unlock) ────────────────────────────────────
  {id:'NFLD', n:'Deep Field Minerals',ico:'💜',cat:'Neptune', unit:'unit',  ip:25000, vol:.28, tax:.15, desc:'Unknown composition. Neptune deep field extraction sites. Extreme value. Extreme risk.', unlock:'Neptune', color:'#4527A0'},
  {id:'NWIN', n:'Wind Energy Crystals',ico:'🌊',cat:'Neptune',unit:'unit',  ip:4800,  vol:.22, tax:.15, desc:'Formed by Neptune 2,100 km/h winds. Most efficient energy storage medium ever discovered.', unlock:'Neptune', color:'#6D28D9'},
];
