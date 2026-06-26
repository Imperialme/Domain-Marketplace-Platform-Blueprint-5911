import { Link } from "wouter";
import { Shield, Lock, Target, Zap, ArrowRight, CheckCircle, ChevronRight } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import { useLanguage } from "@/contexts/LanguageContext";
import SeoHead from "@/components/SeoHead";

export default function Home() {
  const { t } = useLanguage();

  const features = [
    { icon: Lock,   title: t("APPROVAL BASED"),   desc: t("Strictly B2B verification mandatory for all members."),                   color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
    { icon: Shield, title: t("PRIVATE INTEL"),     desc: t("Access non-public supplier records and inventory."),                     color: "text-gold",        bg: "bg-amber-500/10",   border: "border-amber-500/20" },
    { icon: Target, title: t("OUTCOME DRIVEN"),    desc: t("Every RFQ closes with a definitive business status."),                   color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { icon: Zap,    title: t("PRIORITY DESK"),     desc: t("SLA-backed sourcing for high-volume operations."),                       color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20" },
  ];

  const stats = [
    { value: "24–48 Hours Response", label: t("Standard Review SLA") },
    { value: "6–12 Hours Response", label: t("Priority Processing") },
    { value: "100%",   label: t("RFQ Closure Rate") },
    { value: "B2B",    label: t("Verified Members Only") },
  ];

  const steps = [
    t("Apply for verified access — qualification review within 48 hours"),
    t("Submit your RFQ with item list, value tier, and timeline"),
    t("Admin reviews and assigns procurement path"),
    t("Priority buyers confirm engagement fee — sourcing begins immediately"),
    t("Receive formal quotation with OEM and aftermarket options"),
    t("Accept quotation — fee adjusted against order value"),
    t("Order executed through SpareParts.me"),
  ];

  const feeTiers = [
    { range: t("USD 5K–20K RFQ"),   fee: "USD 50–75" },
    { range: t("USD 20K–100K RFQ"), fee: "USD 100–150" },
    { range: t("USD 100K+ RFQ"),    fee: "USD 250–500" },
  ];

  const feeNotes = [
    t("Adjusted against confirmed order"),
    t("Non-refundable if valid quote declined"),
    t("Admin may waive for strategic accounts"),
  ];

  return (
    <div className="min-h-screen bg-navy">
      <SeoHead
        title="Procure.parts — B2B Spare Parts Procurement | Wholesale OEM & Aftermarket Parts Dubai"
        description="Procure.parts is a controlled B2B procurement platform for industrial spare parts. Wholesale OEM and aftermarket parts sourced from Dubai — serving Middle East, Africa, and Southeast Asia."
        canonical="https://procure.parts/"
        keywords="B2B spare parts procurement, wholesale spare parts Dubai, OEM parts supplier UAE, aftermarket parts Middle East Africa"
      />
      <PublicNav />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(37,99,235,0.3) 1px, transparent 0)", backgroundSize: "40px 40px" }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #2563EB, transparent)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-amber-500/5">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-semibold tracking-widest text-gold uppercase">
                {t("Procurement is a Priority Service, Not a Free Utility")}
              </span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-white">{t("A Controlled Decision Layer")}</span>
              <br />
              <span className="text-shimmer">{t("for Professional Procurement")}</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-4">
              {t("A controlled decision layer for professional spare parts procurement.")}{" "}
              <span className="text-slate-300 font-medium">{t("Private. Approval-based. Outcome-driven.")}</span>
            </p>
            <p className="text-sm text-slate-500 mb-10">
              {t("Operated by Imperial MEA General Trading LLC")} · {t("Execution via SpareParts.me")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/apply" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200 glow-blue text-sm tracking-wide">
                {t("REQUEST ACCESS")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition-all duration-200 text-sm">
                {t("HOW IT WORKS")} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-px bg-blue-900/20 rounded-2xl overflow-hidden border border-blue-900/30">
            {stats.map((stat, i) => (
              <div key={i} className="bg-navy-light px-6 py-5 text-center">
                <div className="font-display text-2xl font-bold text-blue-400 mb-1"><bdi>{stat.value}</bdi></div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section className="py-20 border-t border-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-white mb-3">
              {t("Controlled Access.")}{" "}<span className="text-blue-400">{t("Serious Buyers Only.")}</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              {t("Every feature is designed to protect supplier relationships and ensure procurement accountability.")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className={`card-premium p-6 border ${f.border} hover:scale-[1.02] transition-all duration-300`}>
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className={`font-display text-sm font-bold tracking-wider mb-2 ${f.color}`}>{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS PREVIEW ── */}
      <section className="py-20 border-t border-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-4">
                {t("Buyer Journey")}
              </div>
              <h2 className="font-display text-3xl font-bold text-white mb-4">
                {t("From Application to")}{" "}<span className="text-gold">{t("Confirmed Quotation")}</span>
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                {t("Every step is controlled, documented, and outcome-driven. No ambiguity. No silence. Every RFQ closes with a definitive result.")}
              </p>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors">
                {t("View full buyer journey")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {steps.slice(0, 5).map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-navy-light border border-blue-900/20 hover:border-blue-500/20 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
                </div>
              ))}
              <Link href="/how-it-works" className="block text-center text-xs text-slate-500 hover:text-slate-400 pt-2">
                {t("+ 2 more steps")} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENGAGEMENT FEE SECTION ── */}
      <section className="py-20 border-t border-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-amber-500/5 to-transparent p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-5">
              <Shield className="w-6 h-6 text-gold" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-3">
              {t("Engagement Fee")} — <span className="text-gold">{t("Supplier Protection")}</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              {t("Priority procurement requires a small engagement fee before supplier outreach begins. This confirms buying intent, protects suppliers from price-fishing, and is adjusted against your confirmed order.")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              {feeTiers.map((tier, i) => (
                <div key={i} className="p-4 rounded-xl border border-gold/15 bg-amber-500/5">
                  <div className="text-xs text-slate-500 mb-1">{tier.range}</div>
                  <div className="font-display text-lg font-bold text-gold"><bdi>{tier.fee}</bdi></div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-500">
              {feeNotes.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 border-t border-blue-900/20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            {t("Ready to Source with Confidence?")}
          </h2>
          <p className="text-slate-400 mb-8">
            {t("Apply for verified buyer access. Qualification review within 48 hours.")}
          </p>
          <Link href="/apply" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200 glow-blue">
            {t("REQUEST ACCESS")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-blue-900/20 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo-icon.png" alt="Procure.parts" className="w-6 h-6 object-contain" />
              <span className="font-display font-bold text-sm">PROCURE.<span className="text-blue-400">PARTS</span></span>
            </div>
            <p className="text-xs text-slate-600 text-center">
              © 2026 Imperial MEA General Trading LLC. {t("All rights reserved.")} · {t("Confidential & Internal Platform")}
            </p>
            <div className="flex gap-4 text-xs text-slate-600">
              <Link href="/how-it-works" className="hover:text-slate-400">{t("How It Works")}</Link>
              <Link href="/industries" className="hover:text-slate-400">{t("Industries")}</Link>
              <Link href="/apply" className="hover:text-slate-400">{t("Apply")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
