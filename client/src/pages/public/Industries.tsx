import { Link } from "wouter";
import { ArrowRight, Truck, Factory, Anchor, Zap, Settings, Flame } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import { useLanguage } from "@/contexts/LanguageContext";
import SeoHead from "@/components/SeoHead";

const industries = [
  {
    icon: Truck,
    title: "Automotive & Heavy Vehicles",
    desc: "Trucks, buses, commercial fleets, and passenger vehicles. OEM and aftermarket parts for all major brands including Scania, MAN, Volvo, Mercedes-Benz, and more.",
    parts: ["Engine components", "Transmission parts", "Brake systems", "Suspension & steering", "Electrical systems"],
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Settings,
    title: "Industrials & Complex Projects",
    desc: "Factory equipment, production line machinery, and large-scale industrial systems. Parts sourcing for MRO, complex project builds, and specialised industrial applications.",
    parts: ["Hydraulic components", "Pneumatic systems", "Bearings & seals", "Gearboxes", "Pumps & motors"],
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: Truck,
    title: "Heavy Equipment & Construction",
    desc: "Excavators, cranes, loaders, and construction machinery. Parts sourcing for Caterpillar, Komatsu, JCB, Liebherr, and all major OEMs.",
    parts: ["Undercarriage parts", "Hydraulic cylinders", "Filters & fluids", "Track components", "Cab & controls"],
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Anchor,
    title: "Marine & Offshore",
    desc: "Vessels, offshore platforms, and marine equipment. Critical parts sourcing with strict lead time requirements and quality certification.",
    parts: ["Engine & propulsion", "Navigation systems", "Deck equipment", "Safety systems", "Hull components"],
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Zap,
    title: "Power Generation",
    desc: "Generators, turbines, and power plant equipment. Parts for standby and prime power systems across all major generator brands.",
    parts: ["Generator sets", "Control panels", "Fuel systems", "Cooling systems", "Alternator parts"],
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Flame,
    title: "Oil & Gas",
    desc: "Upstream, midstream, and downstream oil & gas operations. Critical parts sourcing for drilling equipment, refineries, pipelines, and processing facilities with full documentation.",
    parts: ["Valve assemblies", "Pump components", "Compressor parts", "Instrumentation", "Pressure vessels"],
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
];

export default function Industries() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-navy">
      <SeoHead
        title="Industries We Serve | Procure.parts Wholesale Spare Parts by Sector"
        description="Procure.parts supplies wholesale spare parts for construction, oil & gas, marine, power generation, automotive, and more. Serving industrial buyers across Middle East, Africa, and Southeast Asia."
        canonical="https://procure.parts/industries"
        keywords="industrial spare parts wholesale, construction equipment parts UAE, oil gas parts supplier, marine parts Dubai, power generation parts"
      />
      <PublicNav />

      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-4">
              {t("Industries Served")}
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-4">
              {t("Procurement Intelligence Across")}{" "}
              <span className="text-blue-400">{t("Six Sectors")}</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              {t("Procure.parts serves industrial buyers in GCC, Africa, and MENA. Our vendor network covers all major OEMs and qualified aftermarket sources across six core industries.")}
            </p>
          </div>

          {/* Industry cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            {industries.map((ind, i) => (
              <div
                key={i}
                className={`card-premium p-7 border ${ind.border} hover:scale-[1.01] transition-all duration-300 ${i === 4 ? "lg:col-span-2 lg:max-w-xl lg:mx-auto" : ""}`}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-11 h-11 rounded-xl ${ind.bg} flex items-center justify-center flex-shrink-0`}>
                    <ind.icon className={`w-5 h-5 ${ind.color}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white mb-1">{t(ind.title)}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{t(ind.desc)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ind.parts.map((part, j) => (
                    <span key={j} className={`text-xs px-2.5 py-1 rounded-full ${ind.bg} ${ind.color} border border-current/20 font-medium`}>
                      {t(part)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Target buyers */}
          <div className="rounded-2xl border border-blue-900/30 bg-navy-light p-8 mb-12">
            <h2 className="font-display text-xl font-bold text-white mb-6 text-center">{t("Who We Serve")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Trading companies requiring vetted sourcing support",
                "EPC contractors and project procurement teams",
                "Fleet owners and heavy equipment operators",
                "Factories needing spare parts at scale",
                "Industrial buyers in GCC, Africa, and MENA",
                "MRO procurement teams with recurring requirements",
              ].map((buyer, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-navy border border-blue-900/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{t(buyer)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all glow-blue"
            >
              {t("REQUEST ACCESS")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
