import { useState, useRef, useEffect } from "react";
import { Shield, CheckCircle, ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react";
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

const ROLES = [
  "Procurement Manager","Fleet Manager","Operations Manager","Supply Chain Manager",
  "Plant Engineer","Maintenance Manager","CEO / Owner","Purchasing Officer","Other",
];

const ORDER_VALUES = ["Under $5,000","$5,000 – $25,000","$25,000 – $100,000","$100,000 – $500,000","Over $500,000"];
const ANNUAL_VOLUMES = ["Under $50,000","$50,000 – $250,000","$250,000 – $1M","$1M – $5M","Over $5M"];
const FREQUENCIES = ["One-time","Monthly","Weekly","Daily / Ongoing"];
const TEAM_SIZES = ["Just me","2 – 5","6 – 20","21 – 100","100+"];

const STEP_LABELS = ["Company Info","Procurement Profile","Why Procure.parts","Review"];

const emptyForm = {
  applicantName: "",
  legalName: "",
  businessEmail: "",
  contactPhone: "",
  country: "",
  website: "",
  industries: [] as string[],
  applicantRole: "",
  teamSize: "",
  avgOrderValue: "",
  annualVolume: "",
  procurementFrequency: "",
  pastPurchaseExamples: "",
  sourcingRegions: [] as string[],
  reasonForApplying: "",
};

export default function ApplyBuyer() {
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
      const has = prev.sourcingRegions.includes(r);
      return { ...prev, sourcingRegions: has ? prev.sourcingRegions.filter(x => x !== r) : [...prev.sourcingRegions, r] };
    });
  };

  const canNext = () => {
    if (step === 0) return form.applicantName && form.legalName && form.businessEmail && form.country && form.industries.length > 0 && form.applicantRole;
    if (step === 1) return form.teamSize && form.avgOrderValue && form.annualVolume && form.procurementFrequency;
    if (step === 2) return form.reasonForApplying.length > 20;
    return true;
  };

  const mapFrequency = (f: string): "monthly" | "quarterly" | "project_based" => {
    if (f === "Daily / Ongoing" || f === "Weekly") return "monthly";
    if (f === "Monthly") return "monthly";
    if (f === "One-time") return "project_based";
    return "quarterly";
  };

  const submit = () => {
    applyMutation.mutate({
      legalName: form.legalName,
      country: form.country,
      operatingRegions: form.sourcingRegions.join(", "),
      industry: (form.industries.join(", ")).toLowerCase().replace(/ /g, "_").slice(0, 50),
      website: form.website,
      businessEmail: form.businessEmail,
      contactPhone: form.contactPhone || undefined,
      applicantRole: form.applicantRole.toLowerCase().replace(/ \/ /g, "_").replace(/ /g, "_"),
      teamSize: form.teamSize,
      avgOrderValue: form.avgOrderValue,
      annualVolume: form.annualVolume,
      pastPurchaseExamples: form.pastPurchaseExamples,
      sourcingRegions: form.sourcingRegions.join(", "),
      procurementFrequency: mapFrequency(form.procurementFrequency),
      reasonForApplying: form.reasonForApplying,
    });
  };

  const filteredCountries = COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--navy-900)" }}>
        <div className="max-w-md w-full text-center p-10 rounded-2xl border border-blue-500/30" style={{ background: "var(--navy-800)" }}>
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{t("Application Submitted")}</h2>
          <p className="text-slate-400 mb-2">{t("Thank you for applying for Buyer Access.")}</p>
          <p className="text-slate-500 text-sm">{t("Our team reviews every application manually. You will receive a decision by email within 2 business days.")}</p>
          <a href="/" className="mt-8 inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
            <ShoppingCart className="w-4 h-4" />
            {t("Buyer Application")}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t("Apply for Buyer Access")}</h1>
          <p className="text-slate-400 text-sm">{t("This is a qualification form, not a signup form. Every application is reviewed manually.")}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center mb-8">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i <= step ? "text-blue-400" : "text-slate-600"}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i < step ? "bg-blue-600 border-blue-600 text-white" :
                  i === step ? "border-blue-500 text-blue-400" :
                  "border-slate-700 text-slate-600"
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs hidden sm:block">{t(label)}</span>
              </div>
              {i < STEP_LABELS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? "bg-blue-600" : "bg-slate-800"}`} />}
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
                            <button key={c} type="button" onClick={() => { set("country", c); setCountryOpen(false); setCountrySearch(""); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${form.country === c ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/10"}`}>{c}</button>
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
                  {t("Industry Sector")} * <span className="text-slate-600 normal-case font-normal">({t("select up to 3")})</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map(ind => (
                    <button key={ind} type="button" onClick={() => toggleIndustry(ind)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.industries.includes(ind) ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                      }`}>
                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${form.industries.includes(ind) ? "bg-blue-500 border-blue-500 text-white" : "border-slate-600"}`}>
                        {form.industries.includes(ind) ? "v" : ""}
                      </span>
                      {t(ind)}
                    </button>
                  ))}
                </div>
                {form.industries.length >= 3 && <p className="text-xs text-amber-400 mt-2">{t("Maximum 3 industries selected")}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Your Role")} *</label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(r => (
                    <button key={r} type="button" onClick={() => set("applicantRole", r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.applicantRole === r ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"
                      }`}>{t(r)}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Procurement Profile */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white">{t("Procurement Profile")}</h3>
              <p className="text-sm text-slate-500">{t("Help us understand your buying patterns.")}</p>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Team Size")} *</label>
                <div className="flex flex-wrap gap-2">
                  {TEAM_SIZES.map(s => (
                    <button key={s} type="button" onClick={() => set("teamSize", s)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${form.teamSize === s ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Average Order Value")} *</label>
                <div className="flex flex-wrap gap-2">
                  {ORDER_VALUES.map(v => (
                    <button key={v} type="button" onClick={() => set("avgOrderValue", v)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${form.avgOrderValue === v ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>{v}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Estimated Annual Spend")} *</label>
                <div className="flex flex-wrap gap-2">
                  {ANNUAL_VOLUMES.map(v => (
                    <button key={v} type="button" onClick={() => set("annualVolume", v)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${form.annualVolume === v ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>{v}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Procurement Frequency")} *</label>
                <div className="flex flex-wrap gap-2">
                  {FREQUENCIES.map(f => (
                    <button key={f} type="button" onClick={() => set("procurementFrequency", f)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${form.procurementFrequency === f ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>{t(f)}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Past Purchase Examples")} <span className="text-slate-600 normal-case font-normal">({t("Optional")})</span></label>
                <textarea className="w-full input-dark min-h-[80px] resize-none" value={form.pastPurchaseExamples} onChange={e => set("pastPurchaseExamples", e.target.value)} placeholder="e.g. Caterpillar 320 undercarriage parts, Cummins ISX filters..." />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Sourcing Regions")} <span className="text-slate-600 normal-case font-normal">({t("Optional")})</span></label>
                <div className="flex flex-wrap gap-2">
                  {["GCC","MENA","Sub-Saharan Africa","Europe","North America","South America","Asia Pacific","South Asia"].map(r => (
                    <button key={r} type="button" onClick={() => toggleRegion(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${form.sourcingRegions.includes(r) ? "bg-blue-600/20 border-blue-500/50 text-blue-300" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>{r}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Why Procure.parts */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white">{t("Why Procure.parts?")}</h3>
              <p className="text-sm text-slate-500">{t("Tell us about your current sourcing challenges and what you're looking for.")}</p>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Your Reason for Applying")} *</label>
                <textarea
                  className="w-full input-dark min-h-[160px] resize-none"
                  value={form.reasonForApplying}
                  onChange={e => set("reasonForApplying", e.target.value)}
                  placeholder={t("Describe your current sourcing challenges, what parts you typically need, and what you expect from the platform...")}
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
                  [t("Industries"), form.industries.join(", ")],
                  [t("Role"), form.applicantRole],
                  [t("Team Size"), form.teamSize],
                  [t("Avg Order Value"), form.avgOrderValue],
                  [t("Annual Spend"), form.annualVolume],
                  [t("Frequency"), form.procurementFrequency],
                ].map(([label, value]) => value ? (
                  <div key={label} className="flex gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-slate-500 w-32 flex-shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-white">{value}</span>
                  </div>
                ) : null)}
              </div>
              <div className="mt-4 p-4 rounded-xl bg-blue-600/10 border border-blue-500/20">
                <p className="text-xs text-blue-300">{t("By submitting, you confirm that all information provided is accurate. Applications with false information will be permanently rejected.")}</p>
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("Continue")} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={applyMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-60"
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
