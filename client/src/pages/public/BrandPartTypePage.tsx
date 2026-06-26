import { Link, useParams, Redirect } from "wouter";
import PublicNav from "@/components/PublicNav";
import { brands } from "@/data/brands";
import { ArrowLeft, CheckCircle, Globe, Package, TrendingUp, Shield, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getRelevantContinents } from "@/data/geoRegions";
import SeoHead from "@/components/SeoHead";

const partTypeDetails: Record<string, {
  icon: string;
  description: string;
  commonParts: string[];
  seoSuffix: string;
}> = {
  "engine-parts": {
    icon: "⚙️",
    description: "Complete engine component supply — from cylinder heads and pistons to gaskets, bearings, and timing components.",
    commonParts: ["Cylinder heads", "Pistons & rings", "Crankshafts", "Camshafts", "Engine gaskets", "Bearings", "Timing kits", "Turbochargers", "Injectors", "Fuel pumps"],
    seoSuffix: "Engine Parts Wholesale Supplier",
  },
  "engine": {
    icon: "⚙️",
    description: "Complete engine component supply — from cylinder heads and pistons to gaskets, bearings, and timing components.",
    commonParts: ["Cylinder heads", "Pistons & rings", "Crankshafts", "Camshafts", "Engine gaskets", "Bearings", "Timing kits", "Turbochargers", "Injectors", "Fuel pumps"],
    seoSuffix: "Engine Parts Wholesale Supplier",
  },
  "gearbox": {
    icon: "🔩",
    description: "Transmission and gearbox components — synchros, shafts, bearings, seals, and complete gearbox assemblies.",
    commonParts: ["Synchromesh rings", "Input/output shafts", "Gear sets", "Bearings & seals", "Clutch plates", "Shift forks", "Gearbox housings", "Torque converters"],
    seoSuffix: "Gearbox Parts Wholesale Supplier",
  },
  "transmission": {
    icon: "🔩",
    description: "Transmission and gearbox components — synchros, shafts, bearings, seals, and complete assemblies.",
    commonParts: ["Synchromesh rings", "Input/output shafts", "Gear sets", "Bearings & seals", "Clutch plates", "Shift forks", "Gearbox housings", "Torque converters"],
    seoSuffix: "Transmission Parts Wholesale Supplier",
  },
  "axle-components": {
    icon: "🛞",
    description: "Axle and drivetrain components — differential assemblies, axle shafts, wheel hubs, and bearing kits.",
    commonParts: ["Differential assemblies", "Axle shafts", "Wheel hubs", "Bearing kits", "Crown & pinion sets", "Axle seals", "Universal joints"],
    seoSuffix: "Axle Parts Wholesale Supplier",
  },
  "axle": {
    icon: "🛞",
    description: "Axle and drivetrain components — differential assemblies, axle shafts, wheel hubs, and bearing kits.",
    commonParts: ["Differential assemblies", "Axle shafts", "Wheel hubs", "Bearing kits", "Crown & pinion sets", "Axle seals", "Universal joints"],
    seoSuffix: "Axle Parts Wholesale Supplier",
  },
  "cab-parts": {
    icon: "🚪",
    description: "Cab and body parts — doors, mirrors, glass, interior trim, seats, and structural cab components.",
    commonParts: ["Cab doors", "Mirrors & brackets", "Windscreens", "Interior trim panels", "Seats & upholstery", "Dashboard components", "Cab mounts", "Bumpers"],
    seoSuffix: "Cab Parts Wholesale Supplier",
  },
  "cab": {
    icon: "🚪",
    description: "Cab and body parts — doors, mirrors, glass, interior trim, seats, and structural cab components.",
    commonParts: ["Cab doors", "Mirrors & brackets", "Windscreens", "Interior trim panels", "Seats & upholstery", "Dashboard components", "Cab mounts", "Bumpers"],
    seoSuffix: "Cab Parts Wholesale Supplier",
  },
  "electrical": {
    icon: "⚡",
    description: "Electrical system components — alternators, starters, sensors, wiring harnesses, and control modules.",
    commonParts: ["Alternators", "Starter motors", "Sensors (ABS, O2, temp)", "Wiring harnesses", "ECU/control modules", "Relays & fuses", "Switches", "Lighting"],
    seoSuffix: "Electrical Parts Wholesale Supplier",
  },
  "filters": {
    icon: "🔵",
    description: "Complete filtration supply — oil, fuel, air, hydraulic, and cabin air filters for all makes and models.",
    commonParts: ["Oil filters", "Fuel filters", "Air filters", "Hydraulic filters", "Cabin air filters", "Transmission filters", "Coolant filters"],
    seoSuffix: "Filters Wholesale Supplier",
  },
  "brakes": {
    icon: "🔴",
    description: "Brake system components — pads, discs, drums, calipers, master cylinders, and ABS components.",
    commonParts: ["Brake pads", "Brake discs/rotors", "Brake drums", "Calipers", "Master cylinders", "Wheel cylinders", "Brake hoses", "ABS sensors"],
    seoSuffix: "Brake Parts Wholesale Supplier",
  },
  "hydraulics": {
    icon: "💧",
    description: "Hydraulic system components — pumps, cylinders, hoses, seals, valves, and hydraulic oil.",
    commonParts: ["Hydraulic pumps", "Hydraulic cylinders", "Hoses & fittings", "Seal kits", "Control valves", "Hydraulic motors", "Filters"],
    seoSuffix: "Hydraulic Parts Wholesale Supplier",
  },
  "undercarriage": {
    icon: "🔗",
    description: "Undercarriage components for tracked equipment — track chains, rollers, idlers, sprockets, and track shoes.",
    commonParts: ["Track chains", "Track rollers", "Carrier rollers", "Front idlers", "Sprockets", "Track shoes", "Track bolts"],
    seoSuffix: "Undercarriage Parts Wholesale Supplier",
  },
  "suspension": {
    icon: "🔧",
    description: "Suspension and steering components — shock absorbers, springs, bushings, ball joints, and tie rods.",
    commonParts: ["Shock absorbers", "Leaf springs", "Coil springs", "Bushings", "Ball joints", "Tie rod ends", "Control arms", "Stabiliser bars"],
    seoSuffix: "Suspension Parts Wholesale Supplier",
  },
  "body-panels": {
    icon: "🚗",
    description: "Body panels and exterior components — bonnets, doors, fenders, bumpers, and structural panels.",
    commonParts: ["Bonnets/hoods", "Front doors", "Rear doors", "Fenders", "Bumpers", "Tailgates", "Roof panels", "Side skirts"],
    seoSuffix: "Body Parts Wholesale Supplier",
  },
  "hvac": {
    icon: "❄️",
    description: "HVAC and climate control components — compressors, condensers, evaporators, and blower motors.",
    commonParts: ["AC compressors", "Condensers", "Evaporators", "Blower motors", "Expansion valves", "Receiver driers", "AC hoses"],
    seoSuffix: "HVAC Parts Wholesale Supplier",
  },
};

function partTypeToSlug(partType: string): string {
  return partType.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function BrandPartTypePage() {
  const { t } = useLanguage();
  const params = useParams<{ slug: string; partType: string }>();
  const brand = brands.find(b => b.slug === params.slug);

  if (!brand) return <Redirect to="/brands" />;

  const partTypeSlug = params.partType;
  const matchedPartType = brand.partTypes.find(pt => partTypeToSlug(pt) === partTypeSlug);
  if (!matchedPartType) return <Redirect to={`/brands/${params.slug}`} />;

  const details = partTypeDetails[partTypeSlug] || partTypeDetails[partTypeSlug.split("-")[0]] || {
    icon: "🔧",
    description: `${matchedPartType} components for ${brand.name} — OEM and aftermarket supply from Dubai.`,
    commonParts: ["Contact us for full parts list"],
    seoSuffix: `${matchedPartType} Wholesale Supplier`,
  };

  const seoTitle = `${brand.name} ${matchedPartType} Wholesale Supplier UAE | Bulk ${brand.name} ${matchedPartType} Dubai`;
  const seoDesc = `Buy ${brand.name} ${matchedPartType.toLowerCase()} in bulk from Dubai. OEM and aftermarket wholesale supply to Middle East, Africa, Southeast Asia. B2B buyers only.`;
  const canonicalUrl = `https://procure.parts/brands/${brand.slug}/${partTypeSlug}`;

  return (
    <div className="min-h-screen" style={{ background: "var(--navy-900)" }}>
      <SeoHead
        title={seoTitle}
        description={seoDesc}
        canonical={canonicalUrl}
        keywords={brand.keywords.join(", ")}
      />
      <PublicNav />

      {/* Breadcrumb */}
      <div className="border-b border-white/5 mt-16" style={{ background: "var(--navy-800)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">{t("Home")}</Link>
          <ChevronRight size={12} />
          <Link href="/brands" className="hover:text-slate-300 transition-colors">{t("Brands")}</Link>
          <ChevronRight size={12} />
          <Link href={`/brands/${brand.slug}`} className="hover:text-slate-300 transition-colors">{brand.name}</Link>
          <ChevronRight size={12} />
          <span className="text-slate-300">{t(matchedPartType)}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link href={`/brands/${brand.slug}`} className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-8">
          <ArrowLeft size={14} /> {t("Back to")} {brand.name}
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{details.icon}</span>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: "rgba(59,130,246,0.1)", color: "var(--electric-blue)", border: "1px solid rgba(59,130,246,0.2)" }}>
              {t(brand.category)}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {brand.name} {t(matchedPartType)}
            <span className="block text-xl md:text-2xl font-normal mt-2" style={{ color: "var(--gold)" }}>
              {t("Wholesale Supplier")} — Dubai, UAE
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
            {t("Bulk")} {brand.name} {t(matchedPartType.toLowerCase())} {t("supply from Dubai. OEM and aftermarket for Middle East, Africa, Southeast Asia and beyond.")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What we supply */}
            <div className="rounded-xl border border-white/8 p-6" style={{ background: "var(--navy-800)" }}>
              <h2 className="text-lg font-bold text-white mb-4">
                {brand.name} {t(matchedPartType)} — {t("What We Supply")}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">{details.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {details.commonParts.map((part) => (
                  <div key={part} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    {t(part)}
                  </div>
                ))}
              </div>
            </div>

            {/* All part types for this brand */}
            <div className="rounded-xl border border-white/8 p-6" style={{ background: "var(--navy-800)" }}>
              <h2 className="text-lg font-bold text-white mb-4">
                {t("Other")} {brand.name} {t("Part Categories")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {brand.partTypes.map((pt) => {
                  const ptSlug = partTypeToSlug(pt);
                  const isCurrent = ptSlug === partTypeSlug;
                  return (
                    <Link
                      key={pt}
                      href={`/brands/${brand.slug}/${ptSlug}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        isCurrent
                          ? "text-white font-medium"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                      style={isCurrent ? { background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" } : {}}
                    >
                      <Package size={14} className={isCurrent ? "text-blue-400" : "text-slate-600"} />
                      {t(pt)}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Regions */}
            <div className="rounded-xl border border-white/8 p-6" style={{ background: "var(--navy-800)" }}>
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Globe size={18} style={{ color: "var(--gold)" }} />
                {t("Supply Regions")}
              </h2>
              <p className="text-slate-500 text-sm mb-4">
                {t("We supply")} {brand.name} {t(matchedPartType.toLowerCase())} {t("to buyers across all major markets:")}
              </p>
              <div className="space-y-3">
                {getRelevantContinents(brand.regions).map((geo) => (
                  <div key={geo.continent}>
                    <p className="text-xs font-semibold text-slate-500 mb-1.5">{geo.emoji} {t(geo.continent)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {geo.countries.map((c) => (
                        <span key={c} className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: "rgba(255,255,255,0.05)", color: "var(--slate-300)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {c}
                        </span>
                      ))}
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium text-slate-600"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        {t("& more")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why source through Procure.parts */}
            <div className="rounded-xl border border-white/8 p-6" style={{ background: "var(--navy-800)" }}>
              <h2 className="text-lg font-bold text-white mb-4">
                {t("Why Source")} {brand.name} {t(matchedPartType)} {t("Through Procure.parts?")}
              </h2>
              <div className="space-y-3">
                {[
                  { icon: <Shield size={16} className="text-blue-400" />, title: t("Verified Trusted Suppliers Only"), desc: t("Every parts supplier in our network is vetted and approved before they can submit pricing.") },
                  { icon: <TrendingUp size={16} style={{ color: "var(--gold)" }} />, title: t("OEM & Aftermarket Comparison"), desc: t("We provide side-by-side OEM vs aftermarket pricing so you can make informed decisions.") },
                  { icon: <Package size={16} className="text-emerald-400" />, title: t("Bulk & Wholesale Quantities"), desc: t("Minimum order quantities designed for fleet operators, distributors, and wholesale buyers — not retail.") },
                  { icon: <Globe size={16} className="text-purple-400" />, title: t("Shipped from Dubai Worldwide"), desc: t("All orders are processed and shipped from Dubai with full documentation.") },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar CTA */}
          <div className="space-y-5">
            {/* Primary CTA */}
            <div className="rounded-xl p-6 text-center sticky top-24"
              style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(245,158,11,0.08))", border: "1px solid rgba(59,130,246,0.25)" }}>
              <div className="text-2xl mb-3">📦</div>
              <h3 className="font-bold text-white mb-2">{t("Request")} {brand.name} {t(matchedPartType)}</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                {t("Submit your parts list and receive competitive pricing from our trusted supplier network within 24–48 hours.")}
              </p>
              <Link href="/apply"
                className="block w-full py-3 rounded-lg text-sm font-bold text-white text-center transition-all hover:opacity-90"
                style={{ background: "var(--electric-blue)" }}>
                {t("Apply for Wholesale Access")}
              </Link>
              <p className="text-xs text-slate-600 mt-3">{t("Approval-based. B2B buyers only.")}</p>
            </div>

            {/* Brand quick info */}
            <div className="rounded-xl border border-white/8 p-5" style={{ background: "var(--navy-800)" }}>
              <h3 className="text-sm font-semibold text-white mb-3">{brand.name} {t("at a Glance")}</h3>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>{t("Category")}</span>
                  <span className="text-slate-300">{t(brand.category)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("Part types")}</span>
                  <span className="text-slate-300"><bdi>{brand.partTypes.length}</bdi> {t("categories")}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("Supply type")}</span>
                  <span className="text-slate-300">{t("OEM + Aftermarket")}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("Origin")}</span>
                  <span className="text-slate-300">Dubai, UAE</span>
                </div>
              </div>
            </div>

            {/* Related brands */}
            <div className="rounded-xl border border-white/8 p-5" style={{ background: "var(--navy-800)" }}>
              <h3 className="text-sm font-semibold text-white mb-3">{t("Related Brands")}</h3>
              <div className="space-y-1">
                {brands
                  .filter(b => b.categorySlug === brand.categorySlug && b.slug !== brand.slug)
                  .slice(0, 5)
                  .map(b => (
                    <Link key={b.slug} href={`/brands/${b.slug}`}
                      className="flex items-center justify-between py-1.5 text-xs text-slate-400 hover:text-white transition-colors group">
                      <span>{b.name}</span>
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
