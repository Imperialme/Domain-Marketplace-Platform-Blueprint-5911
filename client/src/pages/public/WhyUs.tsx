import { Link } from "wouter";
import { ArrowRight, Shield, Target, Clock, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import { useLanguage } from "@/contexts/LanguageContext";
import SeoHead from "@/components/SeoHead";

const problems = [
  { icon: AlertCircle, title: "Excessive RFQs with no buying intent", desc: "Suppliers waste time on price-fishing buyers who never commit." },
  { icon: AlertCircle, title: "No accountability after quotes are received", desc: "Buyers delay decisions indefinitely, leaving suppliers in limbo." },
  { icon: AlertCircle, title: "Supplier fatigue from casual inquiries", desc: "Serious suppliers disengage from platforms flooded with low-quality RFQs." },
  { icon: AlertCircle, title: "No margin protection or pricing intelligence", desc: "Buyers receive inflated quotes with no market reference point." },
];

const solutions = [
  { icon: Shield, title: "Engagement fee confirms intent", desc: "A small fee before supplier outreach filters casual buyers and protects supplier time. Adjusted against your confirmed order." },
  { icon: Target, title: "Mandatory RFQ closure", desc: "Every RFQ closes with one of four definitive outcomes. Silence is not an outcome on this platform." },
  { icon: Clock, title: "SLA-backed response times", desc: "Standard: 24–48 working hours. Priority: 2–6 working hours. Commitments are tracked and enforced." },
  { icon: DollarSign, title: "Internal pricing intelligence", desc: "Admin builds quotations with full market visibility — lowest, highest, and median prices across vetted vendors." },
];

const objections = [
  {
    q: "Why should I pay an engagement fee?",
    a: "The fee is not a profit tool. It confirms you are a serious buyer, protects suppliers from price-fishing, and is fully adjusted against your order value if you proceed. If you receive a valid quotation and decline, the fee is retained — this is by design.",
  },
  {
    q: "Why can't I see supplier names or prices?",
    a: "Supplier confidentiality is a core platform rule. Exposing vendor identities or price ranges would destroy the intelligence network that makes this platform valuable. You receive a clean buyer-facing quotation — no internal data is ever visible.",
  },
  {
    q: "What if you can't source my parts?",
    a: "Every RFQ closes with a definitive outcome. If we cannot source your parts, you receive a clear explanation — not silence. The four possible outcomes are: Quotation Issued, Not Commercially Viable, Cannot Identify Item, or Not Sourceable.",
  },
  {
    q: "How is this different from a free RFQ portal?",
    a: "This is not a portal. It is a controlled procurement desk. Every buyer is manually verified. Every RFQ is reviewed by a human. Every outcome is documented. We manage procurement decisions — we do not sell quotations.",
  },
];

export default function WhyUs() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-navy">
      <SeoHead
        title="Why Procure.parts | B2B Spare Parts Procurement Advantages"
        description="Why choose Procure.parts? Vetted supplier network, OEM vs aftermarket comparison, bulk wholesale pricing, and fast delivery from Dubai to Africa, Middle East, and Southeast Asia."
        canonical="https://procure.parts/why-us"
        keywords="why Procure.parts, B2B spare parts advantages, vetted supplier network, OEM aftermarket comparison, bulk parts wholesale"
      />
      <PublicNav />

      <div className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-4">
              {t("Why Procure.parts")}
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-4">
              {t("Procurement Intelligence,")}{" "}
              <span className="text-gold">{t("Not a Free Utility")}</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              {t("Most procurement platforms are free because they sell your data or your attention. We charge a small engagement fee because we protect supplier relationships and deliver real outcomes.")}
            </p>
          </div>

          {/* Problems */}
          <div className="mb-16">
            <h2 className="font-display text-xl font-bold text-white mb-6 text-center">
              {t("Problems We Solve")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {problems.map((p, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-red-500/5 border border-red-500/15">
                  <p.icon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-red-300 mb-1">{t(p.title)}</div>
                    <div className="text-xs text-slate-500">{t(p.desc)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div className="mb-16">
            <h2 className="font-display text-xl font-bold text-white mb-6 text-center">
              {t("How We Solve Them")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {solutions.map((s, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-xl card-premium border border-blue-500/15">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">{t(s.title)}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{t(s.desc)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Objection handling */}
          <div className="mb-16">
            <h2 className="font-display text-xl font-bold text-white mb-6 text-center">
              {t("Common Questions")}
            </h2>
            <div className="space-y-4">
              {objections.map((obj, i) => (
                <div key={i} className="p-6 rounded-xl bg-navy-light border border-blue-900/20">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <h3 className="text-sm font-bold text-white">{t(obj.q)}</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed pl-7">{t(obj.a)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Philosophy quote */}
          <div className="rounded-2xl border border-gold/20 bg-amber-500/5 p-8 mb-12 text-center">
            <div className="text-2xl font-display font-bold text-gold mb-3">
              {t('"We do not sell quotations. We manage procurement decisions."')}
            </div>
            <p className="text-sm text-slate-500">{t("— Procure.parts Core Philosophy")}</p>
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
