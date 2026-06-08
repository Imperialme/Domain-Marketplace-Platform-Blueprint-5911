// TO INTEGRATE: In gameStore.jsx advanceTurn function,
// replace the local GEO_EVENTS array with:
//   import { GEO_EVENTS } from '../events';
// The array structure is identical to the existing local one.
// Each event now also has an optional 'affects' object for future use.

export const GEO_EVENTS = [
  // ── GEOPOLITICAL CONFLICTS ────────────────────────────────────
  { ico:'⚔️', ti:'Border Conflict Escalates', bo:'Long-disputed territory erupts into armed skirmishes. Rare earth exports halted. Commodity markets surge on supply fears.', region:'Eastern Europe', impact:'negative', affects:{gold:1.05,rareearth:1.08,tech:0.97} },
  { ico:'🤝', ti:'Pacific Trade Alliance Signed', bo:'14-nation trade bloc opens a $2.4T combined market. Shipping, logistics and agriculture sectors rally sharply.', region:'Asia-Pacific', impact:'positive', affects:{etf:1.03,agri:1.04} },
  { ico:'🛡️', ti:'New Sanctions Regime', bo:'Western coalition imposes sweeping financial sanctions on two major economies. Energy and banking sectors face major disruption.', region:'Multiple', impact:'negative', affects:{oil:1.06,gold:1.04} },
  { ico:'🗳️', ti:'G7 Leadership Transition', bo:'Simultaneous elections in 4 major economies. Markets pricing in policy uncertainty. Safe-haven inflows elevated.', region:'G7 Nations', impact:'neutral', affects:{gold:1.02,bonds:1.01} },
  { ico:'⚓', ti:'Strait Blockade Crisis', bo:'Naval standoff closes key shipping lane. Insurance premiums quadruple. Shipping stocks fall; commodities spike.', region:'Indian Ocean', impact:'negative', affects:{oil:1.09,shipping:0.92} },
  { ico:'🕊️', ti:'Historic Peace Agreement', bo:'Decades-long conflict formally ended with internationally brokered deal. Tourism, infrastructure and agriculture in affected nations surge.', region:'Middle East', impact:'positive', affects:{etf:1.04} },
  { ico:'🚫', ti:'Trade Embargo Imposed', bo:'Major trading partner imposes comprehensive embargo. Supply chains reorienting within 6 months. Near-term disruption expected.', region:'Global', impact:'negative', affects:{tech:0.95,mfg:0.96} },
  { ico:'💬', ti:'Diplomatic Normalization', bo:'Two historically adversarial nations restore full diplomatic ties. Cross-border investment unlocked after 40-year freeze.', region:'Southeast Asia', impact:'positive', affects:{etf:1.03} },
  { ico:'🔥', ti:'Civil Unrest in Resource Region', bo:'Popular uprising disrupts mining operations across 3 provinces. Copper, lithium output falls 18%.', region:'South America', impact:'mixed', affects:{copper:1.07,lithium:1.05,etf:0.97} },
  { ico:'🛢️', ti:'OPEC+ Emergency Supply Cut', bo:'Cartel announces 2.4M barrel/day reduction effective immediately. Energy stocks surge; inflation risk elevated.', region:'Middle East', impact:'positive', affects:{oil:1.12,energy:1.08} },

  // ── NATURAL DISASTERS ─────────────────────────────────────────
  { ico:'🌊', ti:'Magnitude 8.7 Earthquake', bo:'Devastating quake disrupts Pacific Rim supply chains. Insurance losses estimated $180B. Construction sector rally expected.', region:'Pacific Rim', impact:'negative', affects:{mfg:0.93,insure:0.88} },
  { ico:'🌀', ti:'Category 6 Hurricane Season', bo:'Record storm system devastates coastal infrastructure across 4 nations. Agricultural losses severe. Rebuilding contracts surge.', region:'Caribbean', impact:'negative', affects:{agri:0.90,insure:0.85} },
  { ico:'🌋', ti:'Super-Volcano Eruption', bo:'Massive eruption sends ash cloud across 3 continents. Air travel halted; agricultural output threatened. Safe havens rally.', region:'Iceland', impact:'negative', affects:{gold:1.08,agri:0.88} },
  { ico:'🏜️', ti:'Saharan Dust Superstorm', bo:'5,000 km dust wall disrupts solar generation across Southern Europe. Renewable energy output drops 40% for 10 days.', region:'North Africa', impact:'mixed', affects:{solar:0.85,gold:1.02} },
  { ico:'💧', ti:'Prolonged Drought: Food Crisis', bo:'Three consecutive dry years create food security emergency across 12 nations. Agricultural commodities hit decade highs.', region:'Sub-Saharan Africa', impact:'negative', affects:{wheat:1.15,agri:1.10} },
  { ico:'🌨️', ti:'Polar Vortex Collapse', bo:'Extreme cold event disrupts energy infrastructure across North America and Northern Europe. Natural gas demand spikes +35%.', region:'Northern Hemisphere', impact:'mixed', affects:{natgas:1.18,energy:1.08} },
  { ico:'🌊', ti:'Glacier Calving Blocks Arctic Route', bo:'Massive ice shelf collapse closes Northern Sea Route. Shipping redirected through traditional lanes. Freight costs +22%.', region:'Arctic Ocean', impact:'negative', affects:{shipping:0.88} },
  { ico:'🔥', ti:'Continent-Scale Wildfire Season', bo:'Unprecedented wildfires destroy 140M hectares across three continents. Carbon credits spike; timber and agriculture fall.', region:'Multiple', impact:'negative', affects:{agri:0.91,carbon:1.20} },

  // ── SPACE & TECHNOLOGY ────────────────────────────────────────
  { ico:'☀️', ti:'X10 Solar Flare Event', bo:'Powerful solar storm disrupts satellite communications globally. GPS degraded for 72 hours. Cryo-hardened chip demand surges.', region:'Solar System', impact:'mixed', affects:{tech:0.94,solarcry:1.12} },
  { ico:'☄️', ti:'Near-Earth Asteroid Detected', bo:'Planetary defense systems confirm close approach. Deflection mission announced. Space tech and mining stocks rally.', region:'Solar System', impact:'mixed', affects:{spacetech:1.15,gold:1.04} },
  { ico:'🚀', ti:'Reusable Rocket Milestone: 100th Launch', bo:'Landmark achievement halves launch costs overnight. Satellite deployment surges. Interplanetary trade economy accelerates.', region:'Global', impact:'positive', affects:{tech:1.05,space:1.08} },
  { ico:'⚡', ti:'Fusion Energy Breakthrough', bo:'Net-positive fusion energy achieved at scale. Energy sector shaken; platinum group metals in demand as catalysts.', region:'Global', impact:'positive', affects:{energy:1.10,platinum:1.15} },
  { ico:'🤖', ti:'AI Materials Science Discovery', bo:'Artificial intelligence discovers 15 new superconductors simultaneously. Copper and lithium demand forecast revised sharply upward.', region:'Global', impact:'positive', affects:{copper:1.06,lithium:1.08} },
  { ico:'🛸', ti:'Interplanetary Debris Field Cleared', bo:'Joint mission removes 40,000 pieces of orbital debris. New orbital corridors open. Satellite launch frequency doubles.', region:'Low Earth Orbit', impact:'positive', affects:{tech:1.04} },
  { ico:'🌌', ti:'Deep Space Anomaly Discovered', bo:'Automated probes detect unexplained energy readings in outer solar system. Speculation drives Neptune and Uranus stocks sharply higher.', region:'Outer Solar System', impact:'positive', affects:{neptune:1.12,uranus:1.08} },
  { ico:'💻', ti:'Quantum Computing Supremacy', bo:'Quantum computer solves protein folding and drug design simultaneously. Healthcare and biotech stocks surge. Encryption concerns hit banking.', region:'Global', impact:'mixed', affects:{health:1.10,banking:0.95} },
  { ico:'🔋', ti:'Solid-State Battery Revolution', bo:'Grid-scale solid-state batteries announced. EV manufacturers rally; lithium demand forecast revised up 300% for next decade.', region:'Global', impact:'positive', affects:{lithium:1.15,ev:1.12} },
  { ico:'🌐', ti:'Global Cyberattack Campaign', bo:'State-sponsored attack hits 23 nations simultaneously. Critical infrastructure disrupted. Cybersecurity stocks surge +18%.', region:'Multiple', impact:'mixed', affects:{tech:0.95,cyber:1.20} },
  { ico:'🧬', ti:'Cancer Cure Announced', bo:'Universal cancer treatment shows 98% remission in Phase 3 trials across all major cancer types. Healthcare stocks surge massively.', region:'Global', impact:'positive', affects:{health:1.25,biotech:1.30} },

  // ── ECONOMIC EVENTS ───────────────────────────────────────────
  { ico:'🏦', ti:'Coordinated Rate Cut Cycle', bo:'Major central banks announce synchronised rate cuts for first time in 15 years. Equities rally; bond yields fall. Growth unlocked.', region:'Global', impact:'positive', affects:{bonds:1.06,etf:1.05} },
  { ico:'📉', ti:'Stagflation Warning Issued', bo:'Simultaneous high inflation and stagnant growth forces emergency monetary review. Risk assets sell off. Gold and commodities bid.', region:'Global', impact:'negative', affects:{gold:1.08,etf:0.93} },
  { ico:'💸', ti:'Emerging Market Currency Collapse', bo:'Sovereign debt fears trigger capital flight from EM currencies. Safe-haven assets see record inflows. Dollar index hits 15-year high.', region:'South America', impact:'negative', affects:{gold:1.06,bonds:1.04} },
  { ico:'📈', ti:'Productivity Dividend: AI Era Begins', bo:'Economies report 4.2% productivity gains from AI adoption. Corporate earnings revised up 15% globally. Historic bull market begins.', region:'Global', impact:'positive', affects:{etf:1.08,tech:1.10} },
  { ico:'🏭', ti:'Manufacturing Renaissance', bo:'Geopolitical risk drives factory investment surge. $2.8T in new domestic manufacturing pledged globally. Industrial metals rally.', region:'North America', impact:'positive', affects:{copper:1.05,iron:1.06,mfg:1.08} },
  { ico:'🏘️', ti:'Global Real Estate Bubble Warning', bo:'IMF flags coordinated real estate overvaluation. Property prices 38% above fair value in 12 major cities. Correction risk acute.', region:'Global', impact:'negative', affects:{realestate:0.88,bonds:1.04} },
  { ico:'⚓', ti:'Record Trade Surplus Achieved', bo:'Largest trade surplus in recorded economic history. Manufacturing and agriculture exports at peak. Currency appreciation pressures exporters.', region:'East Asia', impact:'mixed', affects:{agri:1.04,mfg:0.97} },
  { ico:'💰', ti:'Commodity Supercycle Declared', bo:'Leading commodities research house declares new multi-decade supercycle. All raw material prices surge on structural demand outlook.', region:'Global', impact:'positive', affects:{gold:1.05,copper:1.06,oil:1.04} },
  { ico:'🌿', ti:'Carbon Tax Treaty Ratified', bo:'171 nations ratify binding carbon treaty. Clean energy and ESG funds surge. Fossil fuel majors fall sharply on stranded asset fears.', region:'Global', impact:'mixed', affects:{solar:1.12,oil:0.90,carbon:1.15} },
  { ico:'💎', ti:'Rare Mineral Megadeposit Found', bo:'Largest lithium-cobalt deposit in history discovered. Single deposit could supply EV demand for 200 years. Mining stocks surge.', region:'Central Africa', impact:'positive', affects:{lithium:0.85,cobalt:0.80,mfg:1.06} },

  // ── HEALTH & PANDEMIC ─────────────────────────────────────────
  { ico:'💊', ti:'Pandemic Alert Level 4 — Global', bo:'Novel pathogen spreads across 47 nations. Healthcare and biotech stocks surge. Aviation, hospitality and retail collapse.', region:'Southeast Asia', impact:'mixed', affects:{health:1.20,biotech:1.15,tourism:0.75} },
  { ico:'🧪', ti:'Universal Flu Vaccine Approved', bo:'Single injection provides lifetime immunity to all known influenza strains. Healthcare system costs forecast to fall 30%.', region:'Global', impact:'positive', affects:{health:1.08} },
  { ico:'🦠', ti:'Antibiotic Resistance Crisis', bo:'WHO declares post-antibiotic era. 6 common pathogens now fully drug resistant. Emergency biotech funding surge.', region:'Global', impact:'negative', affects:{biotech:1.12,health:0.90} },
  { ico:'🏥', ti:'Global Mental Health Emergency', bo:'Governments declare mental health a systemic crisis. $400B emergency funding package announced. Healthcare infrastructure boom.', region:'Global', impact:'mixed', affects:{health:1.06} },
  { ico:'💉', ti:'Longevity Drug Approved', bo:'First drug clinically proven to slow aging by 40% receives approval. Life extension sector explodes. Insurance industry scrambles.', region:'Global', impact:'positive', affects:{biotech:1.25,health:1.15} },
  { ico:'🌊', ti:'Waterborne Pathogen Outbreak', bo:'Contaminated water systems affect 8 nations. Infrastructure spending surges. Tourism and food sectors hit hard.', region:'Central Asia', impact:'negative', affects:{health:1.08,tourism:0.82} },

  // ── CEO & CORPORATE EVENTS ────────────────────────────────────
  { ico:'👔', ti:'Tech Industry CEO Fraud Arrest', bo:'Anonymous whistleblower exposes multi-billion dollar accounting scheme. Technology sector falls sharply on governance fears.', region:'Global', impact:'negative', affects:{tech:0.93} },
  { ico:'📊', ti:'Record Dividend Declared', bo:'Largest corporate dividend payout in history announced. Investor confidence peaks. Dividend-focused funds surge.', region:'Global', impact:'positive', affects:{dividends:1.10,etf:1.04} },
  { ico:'🤝', ti:'Mega-Merger Creates Industry Giant', bo:'$800B merger creates largest corporation in history. Antitrust regulators begin 18-month review. Sector reshuffled.', region:'Global', impact:'mixed', affects:{mfg:1.04} },
  { ico:'💻', ti:'Corporate Espionage Scandal', bo:'Major data breach exposes trade secrets across 12 corporations. Cybersecurity legislation accelerated. Tech sector destabilised.', region:'Global', impact:'negative', affects:{tech:0.95,cyber:1.18} },
  { ico:'🏆', ti:'Board Revolution: Activist Investors Win', bo:'Activist shareholders oust 3 major boards simultaneously. New leadership pledges cash returns. Dividend stocks rally.', region:'Multiple', impact:'positive', affects:{etf:1.05} },
  { ico:'⚖️', ti:'Landmark Antitrust Ruling', bo:'Court orders historic break-up of dominant technology firm. Sector fragments. New competitors emerge. Short-term disruption.', region:'Global', impact:'mixed', affects:{tech:0.93} },
  { ico:'🌱', ti:'ESG Mandate Sweeps Pension Funds', bo:'Largest sovereign wealth funds pledge 100% ESG portfolios. Fossil fuels face $2T forced divestment. Clean energy stocks surge.', region:'Global', impact:'mixed', affects:{solar:1.12,oil:0.88} },

  // ── ENVIRONMENTAL ─────────────────────────────────────────────
  { ico:'🌎', ti:'Ozone Recovery Milestone', bo:'Largest ozone hole in history closes ahead of schedule. Antarctic access improves for research and resource extraction.', region:'Antarctic', impact:'positive', affects:{space:1.03} },
  { ico:'🐋', ti:'Ocean Plastic Crisis Peak', bo:'Ocean plastic concentration reaches tipping point. Marine ecosystem damage triggers $600B fishing industry losses.', region:'Pacific Ocean', impact:'negative', affects:{agri:0.92} },
  { ico:'💚', ti:'Carbon Capture Breakthrough', bo:'Industrial carbon capture hits $10/ton cost. Economically viable at scale. Carbon credit markets transform overnight.', region:'Global', impact:'positive', affects:{carbon:0.70,energy:1.06} },
  { ico:'🌿', ti:'Amazon Regeneration Project', bo:'Government deploys AI-guided reforestation across 400M hectares. Carbon credits soar. Agriculture land prices fall.', region:'South America', impact:'mixed', affects:{carbon:1.08,agri:0.95} },

  // ── PLANET-SPECIFIC EVENTS ────────────────────────────────────
  { ico:'🔴', ti:'Great Mars Dust Storm', bo:'A planet-encircling dust storm reduces solar energy 80% and halts surface operations. Martian stocks fall; commodity prices spike.', region:'Mars', impact:'negative', affects:{mars:0.88,mlit:1.10} },
  { ico:'🟠', ti:'Jupiter Storm Intensifies', bo:'Storm belt expands to cover 40% of Jupiter surface. Hydrogen extraction halted. Fusion energy prices spike globally.', region:'Jupiter', impact:'negative', affects:{jgas:0.70,energy:1.12} },
  { ico:'☿', ti:'Mercury Solar Event', bo:'Mercury experiences triple-intensity solar event. Solar crystal formation rate triples. Mercury mining stocks surge.', region:'Mercury', impact:'positive', affects:{mercury:1.20,msol:1.25} },
  { ico:'💜', ti:'Neptune Deep Field Discovery', bo:'Automated probes detect unknown mineral compound in Neptune deep mantle. Deep Field Mineral prices surge on speculation.', region:'Neptune', impact:'positive', affects:{nfld:1.30,neptune:1.15} },
  { ico:'🪐', ti:'Saturn Ring Disruption', bo:'Comet impact disrupts Saturn ring structure. Ice export routes affected for estimated 8 turns. Ring Ice prices spike temporarily.', region:'Saturn', impact:'mixed', affects:{sice:1.18,saturn:0.93} },
  { ico:'🔵', ti:'Uranus Season Change', bo:'42-year seasonal cycle transition begins. Uranian cryo-methane supply patterns shift dramatically. Long-term positioning required.', region:'Uranus', impact:'mixed', affects:{ugas:1.15,uice:1.08} },

  // ── SOCIAL & MARKET STRUCTURE ─────────────────────────────────
  { ico:'📱', ti:'Digital Identity Revolution', bo:'Universal digital identity adopted by 4.2B people. Financial inclusion explodes. EM markets and fintech surge.', region:'Global', impact:'positive', affects:{fintech:1.15,etf:1.06} },
  { ico:'🏡', ti:'Four-Day Workweek Goes Global', bo:'40 nations legislate 4-day workweek. Productivity studies show +12% output. Consumer discretionary and wellness sectors boom.', region:'Global', impact:'positive', affects:{etf:1.04} },
  { ico:'🌍', ti:'Population Milestone: 10 Billion', bo:'Earth reaches 10 billion population. Food, water and energy demand projections revised sharply upward for all commodities.', region:'Global', impact:'positive', affects:{wheat:1.06,copper:1.05,oil:1.04} },
  { ico:'🏗️', ti:'Global Infrastructure Decade Begins', bo:'G20 launches $15T infrastructure initiative. Steel, cement, copper and construction stocks surge on multi-year demand outlook.', region:'Global', impact:'positive', affects:{copper:1.08,iron:1.10,mfg:1.06} },
];
