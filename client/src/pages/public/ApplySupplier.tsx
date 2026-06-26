import { useState, useRef, useEffect } from "react";
import { Truck, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

const COUNTRIES = [
  "United Arab Emirates","Saudi Arabia","Qatar","Kuwait","Bahrain","Oman",
  "Nigeria","Ghana","Kenya","South Africa","Egypt","Morocco","Algeria","Tanzania","Ethiopia",
  "Germany","France","United Kingdom","Netherlands","Belgium","Spain","Italy","Poland","Sweden","Switzerland",
  "United States","Canada","Brazil","Mexico","Argentina","Colombia",
  "India","Pakistan","Bangladesh","Sri Lanka","Indonesia","Malaysia","Singapore","Thailand","Philippines","Vietnam",
  "China","Japan","South Korea","Hong Kong","Taiwan",
  "Turkey","Jordan","Lebanon","Iraq","Libya","Tunisia",
  "Australia","New Zealand",
].sort();

const INDUSTRIES = [
  "Automotive","Heavy Equipment & Construction","Oil & Gas","Marine & Offshore",
  "Power Generation","Mining","Agriculture","Rail & Transit",
  "Aviation & Aerospace","Industrial MRO","Logistics & Fleet","Other",
];

// Improved vendor type options — clearer and more relevant to the platform
const VENDOR_TYPES = [
  "Authorized OEM Dealer",
  "Aftermarket Parts Supplier",
  "OEM Parts Manufacturer",
  "Multi-brand Distributor",
  "Wholesale Trader / Importer",
  "Logistics & Freight Provider",
  "Other",
];

const STOCK_LEVELS = ["Under 500 SKUs","500 – 5,000 SKUs","5,000 – 50,000 SKUs","Over 50,000 SKUs"];
const LEAD_TIMES = ["Same day","1 – 3 days","3 – 7 days","1 – 2 weeks","2 – 4 weeks","4+ weeks"];
const ANNUAL_REVENUES = ["Under $100K","$100K – $500K","$500K – $2M","$2M – $10M","Over $10M"];

const STEP_LABELS = ["Company Info","Inventory Profile","Why Procure.parts","Review"];

const emptyForm = {
  applicantName: "",
  legalName: "",
  businessEmail: "",
  contactPhone: "",
  country: "",
  website: "",
  industries: [] as string[],
  applicantRole: "",
  stockLevel: "",
  leadTime: "",
  annualRevenue: "",
  brandsCarried: "",
  exportRegions: [] as string[],
  reasonForApplying: "",
};

export default function ApplySupplier() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const applyMutation = trpc.companies.submitApplication.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const set = (k: keyof typeof form, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  const toggleIndustry = (ind: string) => {
    setForm(prev => {
      const has = prev.industries.includes(ind);
      if (!has && prev.industries.length >= 3) return prev;
      return { ...prev, industries: has ? prev.industries.filter(i => i !== ind) : [...prev.industries, ind] };
    });
  };

  const toggleRegion = (r: string) => {
    setForm(prev => {
      const has = prev.exportRegions.includes(r);
      return { ...prev, exportRegions: has ? prev.exportRegions.filter(x => x !== r) : [...prev.exportRegions, r] };
    });
  };

  const canNext = () => {
    if (step === 0) return form.applicantName && form.legalName && form.businessEmail && form.country && form.industries.length > 0 && form.applicantRole;
    if (step === 1) return form.stockLevel && form.leadTime && form.annualRevenue;
    if (step === 2) return form.reasonForApplying.length > 20;
    return true;
  };

  const submit = () => {
    const freq: "monthly" | "quarterly" | "project_based" = "monthly";
    applyMutation.mutate({
      legalName: form.legalName,
      country: form.country,
      operatingRegions: form.exportRegions.join(", "),
      industry: (form.industries.join(", ")).toLowerCase().replace(/ /g, "_").slice(0, 50),
      website: form.website,
      businessEmail: form.businessEmail,
      contactPhone: form.contactPhone || undefined,
      applicantRole: form.applicantRole.toLowerCase().replace(/ \/ /g, "_").replace(/ /g, "_"),
      teamSize: form.stockLevel,
      avgOrderValue: form.leadTime,
      annualVolume: form.annualRevenue,
      pastPurchaseExamples: form.brandsCarried,
      sourcingRegions: form.exportRegions.join(", "),
      procurementFrequency: freq,
      reasonForApplying: form.reasonForApplying,
    });
  };

  const filteredCountries = COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--navy-900)" }}>
        <div className="max-w-md w-full text-center p-10 rounded-2xl border border-amber-500/30" style={{ background: "var(--navy-800)" }}>
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{t("Application Submitted")}</h2>
          <p className="text-slate-400 mb-2">{t("Thank you for applying for Vendor Access.")}</p>
          <p className="text-slate-500 text-sm">{t("Our team reviews every application manually. You will receive a decision by email within 2 business days.")}</p>
          <a href="/" className="mt-8 inline-block px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors">
            {t("Back to Home")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4" style={{ background: "var(--navy-900)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium mb-4">
            <Truck className="w-4 h-4" />
            {t("Vendor Application")}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t("Apply for Vendor Access")}</h1>
          <p className="text-slate-400 text-sm">{t("This is a qualification form, not a signup form. Every application is reviewed manually.")}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center mb-8">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i <= step ? "text-amber-400" : "text-slate-600"}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i < step ? "bg-amber-600 border-amber-600 text-white" :
                  i === step ? "border-amber-500 text-amber-400" :
                  "border-slate-700 text-slate-600"
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs hidden sm:block">{t(label)}</span>
              </div>
              {i < STEP_LABELS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? "bg-amber-600" : "bg-slate-800"}`} />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/10 p-6 sm:p-8" style={{ background: "var(--navy-800)" }}>

          {/* Step 0: Company Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white">{t("Company Information")}</h3>
              <p className="text-sm text-slate-500">{t("All fields are mandatory unless marked optional.")}</p>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Your Full Name")} *</label>
                <input className="w-full input-dark" value={form.applicantName} onChange={e => set("applicantName", e.target.value)} placeholder="First and last name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Legal Company Name")} *</label>
                <input className="w-full input-dark" value={form.legalName} onChange={e => set("legalName", e.target.value)} placeholder="As registered with authorities" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Business Email")} *</label>
                  <input type="email" className="w-full input-dark" value={form.businessEmail} onChange={e => set("businessEmail", e.target.value)} placeholder="name@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Contact Phone")} ({t("Optional")})</label>
                  <input type="tel" className="w-full input-dark" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="+971 50 000 0000" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Country of Registration")} *</label>
                  <div className="relative" ref={countryRef}>
                    <button type="button" onClick={() => setCountryOpen(v => !v)} className="w-full input-dark flex items-center justify-between text-left">
                      <span className={form.country ? "text-white" : "text-slate-500"}>{form.country || t("Select country...")}</span>
                      <span className="text-slate-500 text-xs">&#9660;</span>
                    </button>
                    {countryOpen && (
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border border-blue-900/40 overflow-hidden shadow-2xl" style={{ background: "rgba(8,15,26,0.98)" }}>
                        <input className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 bg-white/10 focus:outline-none" placeholder={t("Search country...")} value={countrySearch} onChange={e => setCountrySearch(e.target.value)} autoFocus />
                        <div className="max-h-48 overflow-y-auto">
                          {filteredCountries.map(c => (
                            <button key={c} type="button" onClick={() => { set("country", c); setCountryOpen(false); setCountrySearch(""); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${form.country === c ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-white/10"}`}>{c}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Company Website")} ({t("Optional")})</label>
                  <input className="w-full input-dark" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://www.yourcompany.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {t("Parts Categories")} * <span className="text-slate-600 normal-case font-normal">({t("select up to 3")})</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map(ind => (
                    <button key={ind} type="button" onClick={() => toggleIndustry(ind)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.industries.includes(ind) ? "bg-amber-600 border-amber-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                      }`}>
                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${form.industries.includes(ind) ? "bg-amber-500 border-amber-500 text-white" : "border-slate-600"}`}>
                        {form.industries.includes(ind) ? "✓" : ""}
                      </span>
                      {t(ind)}
                    </button>
                  ))}
                </div>
                {form.industries.length >= 3 && <p className="text-xs text-amber-400 mt-2">{t("Maximum 3 categories selected")}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Vendor Type")} *</label>
                <p className="text-xs text-slate-500 mb-2">{t("Select the option that best describes your business model.")}</p>
                <div className="flex flex-wrap gap-2">
                  {VENDOR_TYPES.map(r => (
                    <button key={r} type="button" onClick={() => set("applicantRole", r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.applicantRole === r ? "bg-amber-600 border-amber-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"
                      }`}>{t(r)}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Inventory Profile */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white">{t("Inventory Profile")}</h3>
              <p className="text-sm text-slate-500">{t("Help us understand your supply capabilities.")}</p>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Stock Level (SKUs)")} *</label>
                <div className="flex flex-wrap gap-2">
                  {STOCK_LEVELS.map(s => (
                    <button key={s} type="button" onClick={() => set("stockLevel", s)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${form.stockLevel === s ? "bg-amber-600 border-amber-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Typical Lead Time")} *</label>
                <div className="flex flex-wrap gap-2">
                  {LEAD_TIMES.map(l => (
                    <button key={l} type="button" onClick={() => set("leadTime", l)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${form.leadTime === l ? "bg-amber-600 border-amber-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>{t(l)}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Annual Revenue (Parts)")} *</label>
                <div className="flex flex-wrap gap-2">
                  {ANNUAL_REVENUES.map(v => (
                    <button key={v} type="button" onClick={() => set("annualRevenue", v)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${form.annualRevenue === v ? "bg-amber-600 border-amber-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>{v}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Brands You Carry")} <span className="text-slate-600 normal-case font-normal">({t("Optional")})</span></label>
                <textarea className="w-full input-dark min-h-[80px] resize-none" value={form.brandsCarried} onChange={e => set("brandsCarried", e.target.value)} placeholder="e.g. Caterpillar, Cummins, Bosch, ZF, Scania..." />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Export Regions")} <span className="text-slate-600 normal-case font-normal">({t("Optional")})</span></label>
                <div className="flex flex-wrap gap-2">
                  {["GCC","MENA","Sub-Saharan Africa","Europe","North America","South America","Asia Pacific","South Asia"].map(r => (
                    <button key={r} type="button" onClick={() => toggleRegion(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${form.exportRegions.includes(r) ? "bg-amber-600/20 border-amber-500/50 text-amber-300" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>{r}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Why Procure.parts */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white">{t("Why Procure.parts?")}</h3>
              <p className="text-sm text-slate-500">{t("Tell us about your current sales channels and what you're looking for.")}</p>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Your Reason for Applying")} *</label>
                <textarea
                  className="w-full input-dark min-h-[160px] resize-none"
                  value={form.reasonForApplying}
                  onChange={e => set("reasonForApplying", e.target.value)}
                  placeholder={t("Describe your inventory, the markets you serve, and what you expect from the platform...")}
                />
                <p className={`text-xs mt-1 ${form.reasonForApplying.length < 20 ? "text-slate-600" : "text-green-500"}`}>
                  {form.reasonForApplying.length} / 20 {t("characters minimum")}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">{t("Review Your Application")}</h3>
              <p className="text-sm text-slate-500">{t("Please review before submitting. Our team will contact you at the email provided.")}</p>
              <div className="space-y-3">
                {[
                  [t("Name"), form.applicantName],
                  [t("Company"), form.legalName],
                  [t("Email"), form.businessEmail],
                  [t("Phone"), form.contactPhone],
                  [t("Country"), form.country],
                  [t("Categories"), form.industries.join(", ")],
                  [t("Vendor Type"), form.applicantRole],
                  [t("Stock Level"), form.stockLevel],
                  [t("Lead Time"), form.leadTime],
                  [t("Annual Revenue"), form.annualRevenue],
                ].map(([label, value]) => value ? (
                  <div key={label} className="flex gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-slate-500 w-32 flex-shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-white">{value}</span>
                  </div>
                ) : null)}
              </div>
              <div className="mt-4 p-4 rounded-xl bg-amber-600/10 border border-amber-500/20">
                <p className="text-xs text-amber-300">{t("By submitting, you confirm that all information provided is accurate. Applications with false information will be permanently rejected.")}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <ArrowLeft className="w-4 h-4" /> {t("Back")}
              </button>
            ) : (
              <a href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <ArrowLeft className="w-4 h-4" /> {t("Cancel")}
              </a>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("Continue")} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={applyMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all disabled:opacity-60"
              >
                {applyMutation.isPending ? t("Submitting...") : t("Submit Application")}
                {!applyMutation.isPending && <CheckCircle className="w-4 h-4" />}
              </button>
            )}
          </div>

          {applyMutation.isError && (
            <p className="text-red-400 text-sm text-center mt-4">{t("Something went wrong. Please try again.")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
