import { Link } from "wouter";
import { ArrowRight, Shield, Clock, TrendingUp, CheckCircle, Lock, Globe, Zap } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import { useLanguage } from "@/contexts/LanguageContext";
import SeoHead from "@/components/SeoHead";

const outcomes = [
  {
    icon: Shield,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    title: "You Only Deal with Verified Parties",
    desc: "Every buyer and every supplier on this platform has been reviewed and approved before they can participate. There are no anonymous enquiries, no cold outreach, and no price-fishing. Every interaction is accountable.",
  },
  {
    icon: TrendingUp,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    title: "You Always See the Full Picture",
    desc: "Every quotation includes a side-by-side comparison of OEM and aftermarket options with transparent pricing. You decide which route to take — we never hide alternatives that save you money.",
  },
  {
    icon: Zap,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    title: "Priority Enquiries Move Faster",
    desc: "Standard enquiries are processed in order. Priority enquiries — backed by a small engagement commitment — are escalated immediately to our most capable suppliers. Serious buyers get serious results.",
  },
  {
    icon: Lock,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Your Supplier Network Stays Protected",
    desc: "We do not expose our supplier relationships to buyers. Pricing is presented through our desk, not as a direct introduction. This protects the integrity of the network and ensures competitive pricing remains available.",
  },
  {
    icon: Globe,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    title: "One Desk. Global Reach.",
    desc: "From a single enquiry, we engage suppliers across the UAE, Europe, and Asia simultaneously. You receive consolidated pricing — not a list of contacts to chase. The complexity stays on our side.",
  },
  {
    icon: CheckCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    title: "Every Outcome is Recorded",
    desc: "Win or lose, every enquiry closes with a documented outcome. This builds your procurement history, improves our sourcing accuracy over time, and gives you a clean audit trail for internal reporting.",
  },
];

const steps = [
  {
    number: "01",
    title: "Access is Earned, Not Assumed",
    desc: "Procure.parts is not open to everyone. Buyers apply, provide company information, and are reviewed before access is granted. This keeps the platform serious and the supplier network protected.",
    note: "Approval typically within 24–48 business hours.",
  },
  {
    number: "02",
    title: "Submit Your Requirements",
    desc: "Once approved, submit your parts list — part numbers, quantities, preferred brands, and any urgency requirements. Upload your existing documents if you have them. We handle the rest.",
    note: "Supports Excel, PDF, and typed entry.",
  },
  {
    number: "03",
    title: "We Engage Our Network",
    desc: "Your enquiry is reviewed by our procurement desk. Standard enquiries are processed in queue. Priority enquiries are escalated immediately. In both cases, we engage only verified, approved suppliers.",
    note: "Priority path requires a small engagement commitment.",
  },
  {
    number: "04",
    title: "You Receive a Structured Quotation",
    desc: "We return a clean, professional quotation with OEM and aftermarket options side by side. No raw supplier quotes, no confusing formats — just a clear comparison with our recommendation.",
    note: "All pricing in USD unless otherwise requested.",
  },
  {
    number: "05",
    title: "Confirm and We Coordinate",
    desc: "Approve the quotation, confirm the order, and we coordinate fulfilment from Dubai. You receive shipping documentation, tracking, and post-delivery support through SpareParts.me.",
    note: "Delivery to GCC, Africa, MENA, and Southeast Asia.",
  },
];

export default function HowItWorks() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen" style={{ background: "var(--navy-900)" }}>
      <SeoHead
        title="How It Works | Procure.parts B2B Spare Parts Procurement Process"
        description="Learn how Procure.parts works: apply for buyer access, submit your RFQ, receive OEM vs aftermarket quotes within 24–48 hours, and confirm your order. B2B only."
        canonical="https://procure.parts/how-it-works"
        keywords="how to buy spare parts wholesale, B2B parts procurement process, RFQ spare parts Dubai, OEM aftermarket quote"
      />
      <PublicNav />

      <div className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "var(--electric-blue)" }}>
              {t("How It Works")}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              {t("What You Get When You")}<br />
              <span style={{ color: "var(--gold)" }}>{t("Work with Procure.parts")}</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              {t("Procure.parts is a managed procurement desk — not a marketplace, not a directory. Here is what that means for your business.")}
            </p>
          </div>

          {/* Outcomes grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
            {outcomes.map((item, i) => (
              <div key={i} className={`rounded-2xl p-6 border ${item.border}`}
                style={{ background: "var(--navy-800)" }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${item.bg}`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm leading-snug">{t(item.title)}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t(item.desc)}</p>
              </div>
            ))}
          </div>

          {/* Process steps */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">{t("The Process")}</h2>
            <p className="text-slate-500 text-center text-sm mb-10">{t("Five steps from enquiry to delivery.")}</p>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-5 p-6 rounded-2xl border border-white/8 hover:border-white/12 transition-all"
                  style={{ background: "var(--navy-800)" }}>
                  <div className="text-3xl font-black flex-shrink-0 w-12 text-right leading-none mt-1"
                    style={{ color: "rgba(59,130,246,0.2)" }}>
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1.5">{t(step.title)}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-2">{t(step.desc)}</p>
                    <p className="text-xs font-medium" style={{ color: "var(--gold)" }}>→ {t(step.note)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Who this is for */}
          <div className="rounded-2xl p-8 mb-12 border border-white/8" style={{ background: "var(--navy-800)" }}>
            <h2 className="text-xl font-bold text-white mb-6">{t("Who This Platform Is For")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--electric-blue)" }}>{t("Approved Buyers")}</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  {[
                    "Fleet operators sourcing parts in bulk",
                    "Trading companies and importers",
                    "Industrial and construction firms",
                    "Procurement managers with recurring needs",
                    "Buyers in GCC, Africa, MENA, and Southeast Asia",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                      {t(item)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--gold)" }}>{t("Trusted Suppliers")}</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  {[
                    "Authorised distributors of OEM brands",
                    "Reputable aftermarket parts suppliers",
                    "Specialist suppliers for heavy equipment",
                    "Lubricant and filtration suppliers",
                    "Invite-only — no open registration",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle size={13} style={{ color: "var(--gold)" }} className="flex-shrink-0" />
                      {t(item)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-3">{t("Ready to Apply?")}</h2>
            <p className="text-slate-400 mb-6 max-w-lg mx-auto">
              {t("Buyer access is approval-based. Submit your company details and our team will review your application within 24–48 hours.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/apply"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "var(--electric-blue)" }}>
                Apply for Buyer Access <ArrowRight size={16} />
              </Link>
              <Link href="/brands"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all border border-white/10 hover:border-white/20"
                style={{ color: "rgba(255,255,255,0.7)" }}>
                Browse Brands
              </Link>
            </div>
          </div>

        </div>
      </div>

      <footer className="border-t border-white/5 py-8">
        <div className="container px-4 max-w-6xl mx-auto text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Procure.parts · Operated by Imperial MEA General Trading LLC · Dubai, UAE</p>
        </div>
      </footer>
    </div>
  );
}
