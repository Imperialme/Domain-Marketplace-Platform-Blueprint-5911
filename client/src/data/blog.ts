export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  publishedAt: string; // ISO date string
  readingMinutes: number;
  brandSlug?: string;      // Links to /brands/[brandSlug]
  brandName?: string;
  excerpt: string;
  content: string; // Markdown-like HTML string
}

export const blogPosts: BlogPost[] = [
  {
    slug: "oem-vs-aftermarket-spare-parts-decision-framework",
    title: "OEM vs. Aftermarket Spare Parts: The Decision Framework Every Procurement Manager Needs",
    subtitle: "When genuine parts are worth the premium — and when they are not.",
    category: "Procurement Strategy",
    tags: ["OEM", "Aftermarket", "Procurement", "Cost Management"],
    publishedAt: "2026-03-15",
    readingMinutes: 8,
    excerpt: "The OEM vs. aftermarket debate is one of the most consequential decisions in industrial procurement. This framework helps procurement managers make the right call based on application criticality, warranty implications, and total cost of ownership.",
    content: `
<h2>The Core Question Is Not Price — It Is Risk</h2>
<p>Every procurement manager who has sourced spare parts at scale has faced the same question: do we buy the OEM part at a 40–60% premium, or do we source an aftermarket equivalent and protect the budget? The answer is rarely binary, and the wrong framework costs far more than the price difference.</p>
<p>The decision must be driven by three variables: <strong>application criticality</strong>, <strong>warranty and liability exposure</strong>, and <strong>total cost of ownership over the asset lifecycle</strong>.</p>

<h2>When OEM Is the Only Rational Choice</h2>
<p>For safety-critical components — engine management systems, brake assemblies, hydraulic control valves on lifting equipment, and fuel injection systems — the OEM specification is not a preference, it is a liability boundary. Using a non-OEM part on a Caterpillar 390 excavator's main control valve, for example, can void the machine warranty and create direct legal exposure if a failure causes injury or asset loss.</p>
<p>The same logic applies to components under active manufacturer warranty, parts in the first 2,000 operating hours of a new asset, and any component where the OEM has issued a technical service bulletin (TSB) specifying genuine parts only.</p>

<h2>When Aftermarket Delivers Equal or Superior Value</h2>
<p>Consumable and wear parts — filters, belts, seals, brake pads, lighting, and standard fasteners — are the natural domain of quality aftermarket supply. Brands such as <strong>Mann+Hummel</strong>, <strong>Mahle</strong>, <strong>Knecht</strong>, and <strong>Fleetguard</strong> manufacture filtration products that meet or exceed OEM specifications at 30–50% lower cost. Many of these manufacturers supply directly to OEMs under private label.</p>
<p>For assets beyond their primary warranty period, the calculus shifts further toward aftermarket. A Scania R-series truck at 800,000 km does not require OEM-branded brake discs. It requires parts that meet the dimensional and metallurgical specification — and reputable aftermarket suppliers deliver exactly that.</p>

<h2>The Procurement Framework</h2>
<p>Apply this three-question test to every line item:</p>
<ol>
  <li><strong>Is this component safety-critical or warranty-linked?</strong> If yes, OEM only.</li>
  <li><strong>Is the asset within its primary warranty period?</strong> If yes, OEM only.</li>
  <li><strong>Is there a Tier 1 aftermarket supplier with documented OEM-equivalent specification?</strong> If yes, aftermarket is viable and should be evaluated on price and lead time.</li>
</ol>
<p>This framework, applied consistently across a fleet of 50+ vehicles, typically reduces parts spend by 18–28% without increasing downtime or maintenance frequency.</p>

<h2>How Procure.parts Handles This Decision</h2>
<p>When a verified buyer submits an RFQ through Procure.parts, the procurement desk presents both OEM and aftermarket options where applicable, with specification equivalency notes and supplier credentials. The buyer makes the final decision with full information — not a salesperson's recommendation.</p>
    `,
  },
  {
    slug: "how-to-detect-counterfeit-spare-parts",
    title: "How to Detect Counterfeit Spare Parts Before They Enter Your Supply Chain",
    subtitle: "The risk is real, the cost is catastrophic, and the warning signs are visible — if you know where to look.",
    category: "Supply Chain Risk",
    tags: ["Counterfeit", "Quality Control", "Supply Chain", "Risk Management"],
    publishedAt: "2026-03-22",
    readingMinutes: 9,
    excerpt: "Counterfeit spare parts cause billions in asset damage and dozens of fatalities annually. This guide covers the detection methods, supplier vetting protocols, and procurement practices that protect your operation.",
    content: `
<h2>The Scale of the Problem</h2>
<p>The global counterfeit automotive and industrial parts market is estimated at over USD 45 billion annually. In the GCC and Africa, where grey market supply chains are common, the risk is disproportionately high. Counterfeit bearings, brake components, and hydraulic seals have caused documented equipment failures, fires, and fatalities.</p>
<p>The challenge is that high-quality counterfeits are visually indistinguishable from genuine parts. The difference is in the material specification, heat treatment, and dimensional tolerances — none of which are visible to the naked eye.</p>

<h2>Physical Inspection Protocols</h2>
<p>Before accepting any parts shipment, train your receiving team on these indicators:</p>
<ul>
  <li><strong>Packaging quality:</strong> OEM packaging uses consistent print quality, holographic seals, and part number formatting. Blurred text, inconsistent fonts, and missing country-of-origin markings are red flags.</li>
  <li><strong>Weight and finish:</strong> Counterfeit castings are often lighter due to inferior alloys. Surface finish on machined components should be consistent with OEM samples.</li>
  <li><strong>Part number verification:</strong> Cross-reference every part number against the OEM's official parts catalogue. Counterfeiters frequently use near-identical numbers with transposed digits.</li>
  <li><strong>Holographic and QR verification:</strong> Most Tier 1 OEMs — including Scania, Caterpillar, and Cummins — now include scannable authentication codes on genuine packaging.</li>
</ul>

<h2>Supplier Vetting: The Only Reliable Defence</h2>
<p>Physical inspection catches some counterfeits. Supplier vetting prevents them from entering your supply chain at all. A credible supplier should be able to provide:</p>
<ul>
  <li>Authorised dealer or distributor certificates from the OEM</li>
  <li>Country of origin documentation and customs clearance records</li>
  <li>Material test certificates (MTCs) for safety-critical components</li>
  <li>References from verifiable industrial buyers in your region</li>
</ul>
<p>Any supplier who cannot produce these documents on request should be disqualified immediately, regardless of price.</p>

<h2>Why Procure.parts Exists</h2>
<p>The Procure.parts platform was built specifically to address the counterfeit and grey-market risk in emerging market procurement. Every vendor in the network is vetted by the procurement desk before being introduced to a buyer. No anonymous marketplace, no unverified listings — every quotation comes with supplier credentials attached.</p>
    `,
  },
  {
    slug: "scania-truck-parts-procurement-guide-gcc-africa",
    title: "Scania Truck Parts: A Procurement Guide for Fleet Operators in the GCC and Africa",
    subtitle: "Sourcing Scania spare parts outside the dealer network — what works, what doesn't, and what to avoid.",
    category: "Brand Guides",
    tags: ["Scania", "Trucks", "Fleet Management", "GCC", "Africa"],
    publishedAt: "2026-03-28",
    readingMinutes: 10,
    brandSlug: "scania",
    brandName: "Scania",
    excerpt: "Scania's dealer network in the GCC and Africa is extensive but expensive. This guide covers the parts categories where authorised supply is essential, where quality aftermarket is viable, and how to structure your RFQ for the best outcome.",
    content: `
<h2>Scania in the GCC and Africa: Fleet Reality</h2>
<p>Scania trucks — particularly the R-series and G-series — are among the most common heavy-duty vehicles in GCC logistics, African mining, and cross-border transport. The brand's reputation for reliability is well-earned, but it comes with a parts cost structure that challenges fleet operators managing tight margins.</p>
<p>The Scania authorised dealer network (Al-Futtaim in the UAE, Petromin in Saudi Arabia, and various national distributors in East Africa) provides genuine parts with warranty coverage, but at a significant premium over grey market and aftermarket alternatives.</p>

<h2>Parts Categories: OEM vs. Aftermarket Decision</h2>
<p>For Scania fleets, the OEM/aftermarket decision should be made by component category:</p>
<table>
  <thead><tr><th>Category</th><th>Recommendation</th><th>Rationale</th></tr></thead>
  <tbody>
    <tr><td>Engine management (EMS, injectors, sensors)</td><td>OEM only</td><td>Proprietary calibration; aftermarket alternatives cause fault codes</td></tr>
    <tr><td>Gearbox (Opticruise components)</td><td>OEM only</td><td>Proprietary system; non-OEM parts cause transmission errors</td></tr>
    <tr><td>Engine filters (oil, fuel, air)</td><td>Aftermarket viable</td><td>Mann+Hummel and Mahle supply Scania OEM under private label</td></tr>
    <tr><td>Brake discs and pads</td><td>Aftermarket viable</td><td>Knorr-Bremse and Haldex are OEM-equivalent suppliers</td></tr>
    <tr><td>Suspension components</td><td>Aftermarket viable</td><td>SAF-Holland and BPW supply equivalent quality at lower cost</td></tr>
    <tr><td>Cabin and body parts</td><td>Aftermarket viable</td><td>Multiple European suppliers produce equivalent quality</td></tr>
  </tbody>
</table>

<h2>Common Procurement Challenges</h2>
<p>Fleet operators in Nigeria, Kenya, and Tanzania frequently report two problems: <strong>long lead times</strong> from authorised distributors (4–8 weeks for non-stock items) and <strong>counterfeit risk</strong> in the local grey market. The combination pushes operators toward unverified suppliers, which increases the counterfeit exposure.</p>
<p>The optimal procurement model for a Scania fleet of 20+ vehicles in sub-Saharan Africa is a hybrid approach: maintain a 60-day buffer stock of high-velocity consumables (filters, belts, brake pads) sourced through a verified wholesale supplier, and use the authorised dealer network only for proprietary electronic and drivetrain components.</p>

<h2>Submitting a Scania RFQ Through Procure.parts</h2>
<p>When submitting a Scania parts RFQ, include: model year, engine code (DC13, DC16, etc.), gearbox type (manual or Opticruise), and whether you require OEM or will accept aftermarket equivalents. This information allows the procurement desk to identify the right supplier and present options with specification equivalency notes.</p>
<p>View the full <a href="/brands/scania">Scania parts catalogue on Procure.parts</a> for part type categories and regional availability.</p>
    `,
  },
  {
    slug: "caterpillar-parts-procurement-why-buying-direct-isnt-fastest",
    title: "Caterpillar Parts Procurement: Why Buying Direct Isn't Always the Fastest Option",
    subtitle: "The CAT dealer network is comprehensive — but not always the fastest path to parts for operations in Africa and the Middle East.",
    category: "Brand Guides",
    tags: ["Caterpillar", "CAT", "Construction", "Mining", "Procurement"],
    publishedAt: "2026-04-02",
    readingMinutes: 9,
    brandSlug: "caterpillar",
    brandName: "Caterpillar",
    excerpt: "Caterpillar's global dealer network is one of the most extensive in heavy equipment. But for buyers in Africa and the Middle East, the fastest path to parts is not always through the authorised dealer — especially for non-critical components.",
    content: `
<h2>CAT's Dealer Network: Strengths and Limitations</h2>
<p>Caterpillar's authorised dealer network — Barloworld Equipment in southern Africa, Al-Bahar in the GCC, Mantrac in West and East Africa — provides genuine parts with OEM warranty and technical support. For critical components and warranty-covered machines, this is the correct procurement channel.</p>
<p>The limitation is lead time. Non-stock items ordered through the dealer network in sub-Saharan Africa typically carry 3–6 week lead times for air freight and 8–12 weeks for sea freight. For a mining operation with a fleet of 20 CAT 785 haul trucks, a 6-week wait for a transmission component means significant lost production.</p>

<h2>The Case for Parallel Sourcing</h2>
<p>The solution used by sophisticated fleet operators is parallel sourcing: maintain the dealer relationship for warranty-critical and proprietary components, and use a verified wholesale procurement channel for high-velocity consumables and non-proprietary parts.</p>
<p>For Caterpillar equipment, the following categories are well-served by quality aftermarket supply:</p>
<ul>
  <li>Filtration (oil, fuel, hydraulic, air) — Fleetguard, Baldwin, and Donaldson supply CAT-equivalent specifications</li>
  <li>Undercarriage components (track links, rollers, idlers) — multiple Tier 1 suppliers produce equivalent quality</li>
  <li>Ground engaging tools (GET) — Hensley and ESCO produce GET that meets or exceeds CAT specification</li>
  <li>Wear parts and bucket teeth — aftermarket is standard practice across the industry</li>
  <li>Seals and gaskets — Parker Hannifin and Freudenberg supply OEM-equivalent specifications</li>
</ul>

<h2>The Dubai Advantage for CAT Parts</h2>
<p>Dubai's position as a global trading hub means that CAT parts — both genuine and quality aftermarket — are available with significantly shorter lead times than ordering through in-country dealer networks. Imperial MEA's procurement desk sources from verified suppliers in the UAE, Europe, and the US, with typical delivery timelines of 5–10 working days to GCC destinations and 10–21 days to Africa.</p>
<p>View the full <a href="/brands/caterpillar">Caterpillar parts catalogue on Procure.parts</a> for part type categories and procurement options.</p>
    `,
  },
  {
    slug: "cummins-generator-parts-procurement-guide-africa",
    title: "Cummins Generator Spare Parts: A Procurement Guide for Facilities Teams in Africa",
    subtitle: "Cummins generators power hospitals, data centres, and industrial facilities across Africa. This guide covers parts procurement for operators managing multiple sites.",
    category: "Brand Guides",
    tags: ["Cummins", "Generators", "Power Generation", "Africa", "Facilities Management"],
    publishedAt: "2026-04-05",
    readingMinutes: 8,
    brandSlug: "cummins",
    brandName: "Cummins",
    excerpt: "Cummins is the dominant generator brand in sub-Saharan Africa. For facilities teams managing multiple generator sets, parts procurement strategy directly impacts uptime and operating cost.",
    content: `
<h2>Cummins in Sub-Saharan Africa: The Installed Base</h2>
<p>Cummins generators — particularly the QSB, QSL, QSM, and QSX series — represent the largest installed base of standby and prime power generation in sub-Saharan Africa. They power hospitals in Nigeria, data centres in Kenya, mining operations in Zambia, and telecommunications infrastructure across the continent.</p>
<p>The challenge for facilities teams managing multiple sites is parts procurement. Cummins' authorised distributor network in Africa (Mantrac, Cummins Africa, and country-specific distributors) provides genuine parts with OEM support, but at a cost premium and with lead times that can compromise uptime for critical facilities.</p>

<h2>High-Velocity Parts: Build a Buffer Stock</h2>
<p>For any Cummins generator fleet of 5 or more units, the most effective procurement strategy is maintaining a buffer stock of high-velocity consumables. These parts should be sourced in bulk to reduce unit cost and eliminate emergency procurement premiums:</p>
<ul>
  <li>Engine oil filters (Fleetguard LF series — OEM equivalent)</li>
  <li>Fuel filters (Fleetguard FF series)</li>
  <li>Air filters (Donaldson or Baldwin equivalents)</li>
  <li>Coolant filters and water pump impellers</li>
  <li>V-belts and alternator belts</li>
  <li>Injector O-ring and seal kits</li>
  <li>Thermostat and housing gaskets</li>
</ul>
<p>Fleetguard is a Cummins subsidiary and produces filtration products that are OEM-identical. Sourcing Fleetguard through a wholesale procurement channel rather than the authorised dealer network typically saves 25–35% on filtration costs.</p>

<h2>Critical Components: OEM Only</h2>
<p>For the following Cummins components, OEM-only procurement is the correct policy:</p>
<ul>
  <li>Electronic control modules (ECM) and sensors</li>
  <li>Injectors and high-pressure fuel pumps</li>
  <li>Turbocharger assemblies (Holset — a Cummins subsidiary)</li>
  <li>Cylinder liners and piston kits for major overhauls</li>
</ul>

<h2>Procurement Through Procure.parts</h2>
<p>Procure.parts sources Cummins parts — both genuine and Fleetguard-branded — from verified suppliers in the UAE, UK, and US. For facilities teams in East, West, and Southern Africa, typical delivery timelines are 10–21 days by air freight. View the <a href="/brands/cummins">Cummins parts catalogue on Procure.parts</a> for full category coverage.</p>
    `,
  },
  {
    slug: "rfq-discipline-why-industrial-buyers-get-poor-quotations",
    title: "The RFQ Discipline Problem: Why Most Industrial Buyers Get Poor Quotations",
    subtitle: "The quality of your quotation is a direct function of the quality of your RFQ. Most procurement teams underinvest in this step.",
    category: "Procurement Strategy",
    tags: ["RFQ", "Procurement", "Quotation", "Best Practices"],
    publishedAt: "2026-03-10",
    readingMinutes: 7,
    excerpt: "Poor RFQs produce poor quotations. This article covers the five elements of a high-quality industrial parts RFQ and why most procurement teams consistently underperform in this critical step.",
    content: `
<h2>The Root Cause of Poor Quotations</h2>
<p>The most common complaint from industrial procurement managers is that they receive quotations that are incomplete, inaccurate, or not comparable across suppliers. The root cause is almost always the quality of the RFQ they sent — not the quality of the suppliers.</p>
<p>A supplier cannot quote accurately on incomplete information. When a buyer sends a vague parts list without part numbers, application context, or quantity requirements, the supplier quotes conservatively — which means high prices and long lead times — to protect themselves from the risk of misidentification.</p>

<h2>The Five Elements of a High-Quality Industrial RFQ</h2>
<p><strong>1. Exact part numbers.</strong> OEM part numbers are the only unambiguous identifier in industrial parts procurement. Cross-references, descriptions, and photographs are supplements — not substitutes. If you do not have the OEM part number, your first step is to obtain it from the service manual or the OEM's parts catalogue.</p>
<p><strong>2. Application context.</strong> Specify the asset: make, model, year of manufacture, serial number, and engine/gearbox code. This allows the supplier to verify the part number and flag supersessions or compatibility issues.</p>
<p><strong>3. Quantity and packaging requirements.</strong> Specify exact quantities and whether you require individual packaging, bulk supply, or kit form. This affects pricing significantly.</p>
<p><strong>4. Quality tier specification.</strong> State explicitly whether you require OEM genuine parts, OEM-equivalent aftermarket (specify acceptable brands), or lowest-cost equivalent. This prevents the supplier from defaulting to the most expensive option.</p>
<p><strong>5. Timeline and delivery requirements.</strong> Specify your required delivery date, acceptable delivery method (air freight, sea freight, courier), and delivery address. Vague timelines produce vague commitments.</p>

<h2>How Procure.parts Structures RFQs</h2>
<p>The Procure.parts RFQ submission form enforces these five elements as mandatory fields. The procurement desk reviews every RFQ before supplier outreach to ensure completeness — and contacts the buyer for clarification before proceeding if any element is missing. This discipline is why every RFQ submitted through the platform closes with a definitive result.</p>
    `,
  },
  {
    slug: "wartsila-marine-engine-parts-procurement-guide",
    title: "Wärtsilä Engine Spare Parts: A Procurement Guide for Ship Operators in the Indian Ocean Region",
    subtitle: "Wärtsilä's service network is global but sparse in the Indian Ocean. This guide covers procurement options for operators in East Africa, the Gulf, and South Asia.",
    category: "Brand Guides",
    tags: ["Wärtsilä", "Marine", "Offshore", "Ship Operators", "Indian Ocean"],
    publishedAt: "2026-03-18",
    readingMinutes: 9,
    brandSlug: "wartsila",
    brandName: "Wärtsilä",
    excerpt: "Wärtsilä marine engines power vessels across the Indian Ocean region. For ship operators in East Africa, the Gulf, and South Asia, parts procurement requires a strategy that accounts for the limited local service network.",
    content: `
<h2>Wärtsilä in the Indian Ocean Region</h2>
<p>Wärtsilä four-stroke medium-speed engines — the 20, 26, 32, 34, and 46 series — are among the most common propulsion and auxiliary power units on vessels operating in the Indian Ocean, Red Sea, and Arabian Gulf. The brand's reputation for reliability and fuel efficiency makes it the preferred choice for ferry operators, offshore support vessels, and coastal cargo ships.</p>
<p>The challenge for operators in this region is that Wärtsilä's authorised service network is concentrated in Singapore, Rotterdam, and a handful of major ports. For vessels operating between East African ports (Mombasa, Dar es Salaam, Maputo) and Gulf ports (Jebel Ali, Sohar, Salalah), parts availability and service response times are a persistent operational challenge.</p>

<h2>Critical vs. Consumable Parts Strategy</h2>
<p>For Wärtsilä engines, the parts strategy must distinguish between:</p>
<p><strong>Critical components requiring OEM supply:</strong> fuel injection equipment (Wärtsilä proprietary), electronic control units, turbocharger assemblies (ABB or Napier, depending on specification), and cylinder head assemblies. These components have tight tolerances and proprietary calibration requirements that make non-OEM alternatives high-risk.</p>
<p><strong>Consumable and wear parts where alternatives exist:</strong> piston rings (Federal-Mogul and Mahle produce OEM-equivalent rings for Wärtsilä applications), cylinder liner O-rings and seals (Parker Hannifin), heat exchanger gaskets, and filtration components.</p>

<h2>The Dubai Hub Advantage</h2>
<p>Dubai (Jebel Ali) is the optimal procurement hub for Wärtsilä parts serving the Indian Ocean region. The port's position at the intersection of East-West shipping lanes, combined with the UAE's free trade zone infrastructure, means that parts can be sourced from European and Asian suppliers and consolidated in Dubai for onward delivery to any port in the region within 5–15 working days.</p>
<p>View the <a href="/brands/wartsila">Wärtsilä parts catalogue on Procure.parts</a> for full coverage of engine series and part categories.</p>
    `,
  },
  {
    slug: "dubai-global-hub-spare-parts-trading",
    title: "Why Dubai Has Become the Global Hub for Spare Parts Trading",
    subtitle: "Geography, infrastructure, and trade policy have made Dubai the world's most efficient spare parts distribution centre.",
    category: "Market Intelligence",
    tags: ["Dubai", "UAE", "Trade Hub", "Logistics", "Global Supply Chain"],
    publishedAt: "2026-02-28",
    readingMinutes: 8,
    excerpt: "Dubai's emergence as the world's leading spare parts trading hub is not accidental. This article examines the geographic, infrastructural, and policy factors that make Dubai the optimal sourcing base for buyers in Africa, the Middle East, and South Asia.",
    content: `
<h2>The Geographic Advantage</h2>
<p>Dubai sits at the intersection of three major trade corridors: Europe-Asia, Asia-Africa, and the intra-Gulf network. Within an 8-hour flight radius, Dubai serves a market of over 3 billion people across 60+ countries. This geographic centrality is the foundation of its role as a parts distribution hub.</p>
<p>For a procurement manager in Nairobi, Lagos, or Karachi, sourcing parts through Dubai typically means shorter lead times than sourcing directly from European or US manufacturers — because Dubai-based distributors maintain stock that European manufacturers hold only at their own warehouses.</p>

<h2>Jebel Ali: The World's Largest Man-Made Port</h2>
<p>Jebel Ali Free Zone (JAFZA) is home to over 9,000 companies, including the regional distribution centres of virtually every major industrial OEM. Caterpillar, Cummins, SKF, Parker Hannifin, ABB, Siemens, and dozens of other Tier 1 manufacturers maintain regional stock in JAFZA specifically to serve the Africa, Middle East, and South Asia markets.</p>
<p>The free zone's customs regime — zero import duties, 100% foreign ownership, and streamlined re-export procedures — makes it economically rational for manufacturers to consolidate regional stock in Dubai rather than maintaining separate warehouses in each country.</p>

<h2>The Grey Market Problem</h2>
<p>Dubai's openness has a downside: it is also the world's largest grey market for spare parts. Counterfeit and substandard parts enter the UAE through informal channels and are sold through unverified traders in Deira and Al Quoz. For buyers who source through unverified channels, Dubai's openness is a liability rather than an asset.</p>
<p>The Procure.parts platform was built specifically to capture the advantages of Dubai's position — access to genuine OEM stock, short lead times, competitive pricing — while eliminating the grey market risk through supplier verification and procurement desk oversight.</p>
    `,
  },
  {
    slug: "african-fleet-operators-sourcing-through-dubai",
    title: "Why African Fleet Operators Are Sourcing Spare Parts Through Dubai Instead of Local Markets",
    subtitle: "The economics and logistics of cross-border parts procurement are increasingly favouring Dubai over local supply chains.",
    category: "Market Intelligence",
    tags: ["Africa", "Fleet Management", "Dubai", "Logistics", "Supply Chain"],
    publishedAt: "2026-03-05",
    readingMinutes: 7,
    excerpt: "A growing number of fleet operators in East, West, and Southern Africa are bypassing local distributors and sourcing spare parts directly from Dubai. This article examines the economic and logistical drivers behind this shift.",
    content: `
<h2>The Local Supply Chain Problem in Africa</h2>
<p>Fleet operators in sub-Saharan Africa face a structural challenge: local spare parts supply chains are fragmented, unreliable, and — in many markets — dominated by counterfeit and substandard products. In Nigeria, Kenya, Tanzania, and Zambia, the authorised dealer networks for major OEMs (Scania, Volvo, Caterpillar, Cummins) are concentrated in capital cities and major ports, leaving operators in secondary cities and remote locations with limited access to genuine parts.</p>
<p>The alternative — local grey market traders — offers availability but at significant quality risk. Counterfeit filters, brake components, and engine parts are endemic in these markets, and the cost of a single catastrophic failure far exceeds any savings from buying cheap.</p>

<h2>The Dubai Alternative: Economics and Logistics</h2>
<p>For fleet operators managing 20 or more vehicles, the economics of sourcing through Dubai are compelling. A consolidated order of USD 20,000–50,000 in spare parts, sourced through a verified Dubai-based procurement desk and shipped by air freight, typically delivers:</p>
<ul>
  <li>Genuine OEM or verified Tier 1 aftermarket parts with full documentation</li>
  <li>10–21 day delivery to major African ports and airports</li>
  <li>Pricing 15–30% below authorised dealer network prices in-country</li>
  <li>A single point of contact for the entire order, eliminating the coordination cost of managing multiple local suppliers</li>
</ul>
<p>The key enabler is Dubai's air freight infrastructure. Emirates SkyCargo, Etihad Cargo, and Qatar Airways Cargo operate daily freighter services to Nairobi, Lagos, Johannesburg, Dar es Salaam, and Accra, with transit times of 24–48 hours from Jebel Ali.</p>

<h2>The Procure.parts Model for African Buyers</h2>
<p>Procure.parts was designed specifically for this procurement pattern. African fleet operators apply for verified buyer access, submit RFQs with their parts requirements, and receive formal quotations from the procurement desk within 24–48 hours. The engagement fee model ensures that every RFQ is handled with full seriousness — no price fishing, no wasted supplier time, no ambiguous outcomes.</p>
    `,
  },
  {
    slug: "procurement-slas-what-24-hour-turnaround-actually-means",
    title: "Procurement SLAs in Industrial Sourcing: What 24-Hour Turnaround Actually Means",
    subtitle: "SLA language in procurement is often vague. This article defines what a credible 24-hour procurement SLA actually commits to — and what it does not.",
    category: "Procurement Strategy",
    tags: ["SLA", "Procurement", "Service Level", "Operations"],
    publishedAt: "2026-02-20",
    readingMinutes: 6,
    excerpt: "The term '24-hour turnaround' appears in many procurement service offerings. This article examines what a credible SLA actually commits to at each stage of the procurement process, and how to evaluate whether a supplier can deliver on it.",
    content: `
<h2>What Does '24-Hour Turnaround' Actually Mean?</h2>
<p>The phrase '24-hour turnaround' in procurement services is almost always ambiguous. It could mean 24 hours to acknowledge receipt of an RFQ, 24 hours to provide a preliminary price indication, 24 hours to deliver a formal quotation, or — in some cases — 24 hours to deliver the physical parts. These are very different commitments.</p>
<p>A credible procurement SLA must specify the exact deliverable at each stage, not just the headline timeline.</p>

<h2>The Procure.parts SLA Structure</h2>
<p>At Procure.parts, the SLA is defined at each stage of the procurement process:</p>
<table>
  <thead><tr><th>Stage</th><th>Standard SLA</th><th>Priority SLA</th></tr></thead>
  <tbody>
    <tr><td>Application review</td><td>24–48 working hours</td><td>24 working hours</td></tr>
    <tr><td>RFQ acknowledgement</td><td>4 working hours</td><td>2 working hours</td></tr>
    <tr><td>Formal quotation delivery</td><td>24–48 working hours</td><td>4–8 working hours</td></tr>
    <tr><td>Supplier outreach (post-engagement fee)</td><td>Same working day</td><td>Immediate</td></tr>
    <tr><td>Quotation validity</td><td>7 calendar days</td><td>7 calendar days</td></tr>
  </tbody>
</table>
<p>The engagement fee model is central to the SLA commitment. When a buyer confirms an engagement fee, it signals genuine buying intent — which allows the procurement desk to commit supplier resources immediately, rather than treating the RFQ as a speculative inquiry.</p>

<h2>What No SLA Can Guarantee</h2>
<p>A procurement SLA can commit to process timelines — acknowledgement, quotation delivery, supplier outreach. It cannot commit to parts availability, shipping timelines, or customs clearance — these are external variables outside any procurement desk's control. A credible SLA is honest about this boundary.</p>
<p>At Procure.parts, every RFQ closes with a definitive result: either a formal quotation with confirmed availability and pricing, or a documented explanation of why the parts could not be sourced within the required parameters. No ambiguity, no silence, no open loops.</p>
    `,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(p => p.category === category);
}

export const blogCategories = Array.from(new Set(blogPosts.map(p => p.category)));
