import { useState } from "react";
import { Shield, CheckCircle, ArrowRight, ArrowLeft, Globe, ChevronDown } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const STEPS = ["Company Info", "Procurement Profile", "Qualification", "Review"];

const COUNTRIES = [
  "United Arab Emirates","Saudi Arabia","Qatar","Kuwait","Bahrain","Oman",
  "Jordan","Egypt","Turkey","Germany","United Kingdom",
  "France","Italy","Spain","Netherlands","Belgium","Switzerland","Austria",
  "United States","Canada","Australia","India","Pakistan","Singapore",
  "Malaysia","Indonesia","Philippines","Vietnam","Thailand",
  "China","Japan","South Korea",
  "South Africa","Nigeria","Kenya","Ghana","Ethiopia","Tanzania",
  "Mozambique","Zambia","Zimbabwe","Angola","Cameroon","Senegal",
  "Morocco","Algeria","Tunisia","Other"
];

const industries = [
  "Automotive and Heavy Vehicles",
  "Heavy Equipment and Construction",
  "Marine and Offshore",
  "Power Generation",
  "Oil and Gas",
  "Industrials and Custom Projects",
  "Mining and Quarrying",
  "Agriculture and Agri-Processing",
  "Lubricants and Chemicals",
  "Other"
];

const DECISION_MAKER_ROLES = [
  "CEO / Managing Director","COO / Operations Director",
  "Procurement Manager","Supply Chain Manager","Technical Manager",
  "Maintenance Manager","Finance Manager","General Manager","Other"
];

const teamSizes = ["1-5", "6-20", "21-50", "50+"];
const orderValues = ["USD 1K-5K", "USD 5K-20K", "USD 20K-100K", "USD 100K+"];
const annualVolumes = ["Under USD 100K", "USD 100K-500K", "USD 500K-2M", "USD 2M+"];
const frequencies = ["Monthly", "Quarterly", "Project-Based"];
const regions = ["GCC", "MENA", "Africa", "Europe", "Asia", "Global"];

type FormData = {
  applicantName: string;
  legalName: string;
  country: string;
  operatingRegions: string[];
  industries: string[];
  industryOtherReason: string;
  website: string;
  businessEmail: string;
  applicantRole: string;
  teamSize: string;
  avgOrderValue: string;
  annualVolume: string;
  pastPurchaseExamples: string;
  sourcingRegions: string[];
  procurementFrequency: string;
  preferredTimeline: string;
  reasonForApplying: string;
};

const initialForm: FormData = {
  applicantName: "", legalName: "", country: "", operatingRegions: [], industries: [], industryOtherReason: "",
  website: "", businessEmail: "", applicantRole: "", teamSize: "",
  avgOrderValue: "", annualVolume: "", pastPurchaseExamples: "",
  sourcingRegions: [], procurementFrequency: "", preferredTimeline: "",
  reasonForApplying: "",
};

export default function ApplyAccess() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const applyMutation = trpc.companies.submitApplication.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err: any) => toast.error(err?.message || "Submission failed. Please try again."),
  });

  const set = (field: keyof FormData, value: string | string[]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const toggleArr = (field: keyof FormData, val: string) => {
    const arr = form[field] as string[];
    set(field, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const toggleIndustry = (ind: string) => {
    setForm(f => {
      const cur = f.industries;
      if (cur.includes(ind)) return { ...f, industries: cur.filter(i => i !== ind) };
      if (cur.length >= 3) { toast.error("Select up to 3 industries. Add more context in the reason field."); return f; }
      return { ...f, industries: [...cur, ind] };
    });
  };

  const filteredCountries = COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));

  const canNext = () => {
    if (step === 0) return form.applicantName && form.legalName && form.country && form.industries.length > 0 && form.businessEmail && form.applicantRole;
    if (step === 1) return form.teamSize && form.avgOrderValue && form.annualVolume && form.procurementFrequency;
    if (step === 2) return form.reasonForApplying.length > 20;
    return true;
  };

  const handleSubmit = () => {
    applyMutation.mutate({
      legalName: form.legalName,
      country: form.country,
      operatingRegions: form.operatingRegions.join(", "),
      industry: (form.industries.join(", ") + (form.industryOtherReason ? `  -  ${form.industryOtherReason}` : "")).toLowerCase().replace(/ /g, "_").slice(0, 50) as any,
      website: form.website,
      businessEmail: form.businessEmail,
      applicantRole: form.applicantRole.toLowerCase().replace(/ \/ /g, "_").replace(/ /g, "_") as any,
      teamSize: form.teamSize,
      avgOrderValue: form.avgOrderValue,
      annualVolume: form.annualVolume,
      pastPurchaseExamples: form.pastPurchaseExamples,
      sourcingRegions: form.sourcingRegions.join(", "),
      procurementFrequency: form.procurementFrequency.toLowerCase().replace(/-/g, "_").replace(/ /g, "_") as any,
      reasonForApplying: form.reasonForApplying,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-4">
        <PublicNav />
        <div className="max-w-md w-full text-center mt-16">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-3">Application Submitted</h1>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Your company application has been received. Our team will review your qualification within <strong className="text-slate-300">24-48 working hours</strong>. You will receive an email notification with the outcome.
          </p>
          <div className="p-4 rounded-xl bg-navy-light border border-blue-900/20 text-left mb-6">
            <div className="text-xs text-slate-500 mb-1">Application submitted for</div>
            <div className="text-sm font-semibold text-white">{form.legalName}</div>
            <div className="text-xs text-slate-400">{form.businessEmail}</div>
          </div>
          <p className="text-xs text-slate-600">
            No action required. If approved, you will receive portal login credentials via email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy">
      <PublicNav />

      <div className="pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">Apply for Access</h1>
            <p className="text-slate-400 text-sm">
              This is a qualification form, not a signup form. Every application is reviewed manually.
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 ${i <= step ? "text-blue-400" : "text-slate-600"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                    i < step ? "bg-blue-600 border-blue-600 text-white" :
                    i === step ? "border-blue-500 text-blue-400" :
                    "border-slate-700 text-slate-600"
                  }`}>
                    {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px ${i < step ? "bg-blue-600" : "bg-slate-800"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="card-premium border border-blue-900/30 p-8">
            {/* Step 0: Company Info */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="font-display text-lg font-bold text-white mb-1">Company Information</h2>
                <p className="text-xs text-slate-500 mb-5">All fields are mandatory unless marked optional.</p>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Your Full Name")} *</label>
                  <input className="w-full input-dark" value={form.applicantName} onChange={e => set("applicantName", e.target.value)} placeholder="First and last name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Legal Company Name")} *</label>
                  <input className="w-full input-dark" value={form.legalName} onChange={e => set("legalName", e.target.value)} placeholder="As registered with authorities" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Business Email")} *</label>
                  <input type="email" className="w-full input-dark" value={form.businessEmail} onChange={e => set("businessEmail", e.target.value)} placeholder="name@company.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Country of Registration")} *</label>
                  <button
                    type="button"
                    className="w-full input-dark flex items-center justify-between text-left"
                    onClick={() => setCountryOpen(!countryOpen)}
                  >
                    <span className={form.country ? "text-white" : "text-slate-500"}>{form.country || "Select country..."}</span>
                    <div className="flex items-center gap-1 text-slate-500 flex-shrink-0">
                      <Globe className="w-3.5 h-3.5" />
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </button>
                  {countryOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-blue-900/30 overflow-hidden shadow-2xl" style={{ background: "var(--navy-700, #1a2540)" }}>
                      <div className="p-2 border-b border-slate-800">
                        <input
                          className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 bg-white/10 focus:outline-none"
                          placeholder="Search country..."
                          value={countrySearch}
                          onChange={e => setCountrySearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {filteredCountries.map(c => (
                          <button key={c} type="button"
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              form.country === c ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/10"
                            }`}
                            onClick={() => { set("country", c); setCountryOpen(false); setCountrySearch(""); }}
                          >{c}</button>
                        ))}
                        {filteredCountries.length === 0 && <p className="px-4 py-3 text-sm text-slate-500">No results</p>}
                      </div>
                    </div>
                  )}
                </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("Company Website")} ({t("Optional")})</label>
                    <input className="w-full input-dark" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://www.yourcompany.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Industry Sector * <span className="text-slate-600 normal-case font-normal">(select up to 3)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {industries.map(ind => (
                      <button key={ind} type="button"
                        onClick={() => toggleIndustry(ind)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all text-left ${
                          form.industries.includes(ind)
                            ? "bg-blue-600/20 border-blue-500 text-blue-300"
                            : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center text-xs ${
                          form.industries.includes(ind) ? "bg-blue-500 border-blue-500 text-white" : "border-slate-600"
                        }`}>{form.industries.includes(ind) ? "v" : ""}</span>
                        {ind}
                      </button>
                    ))}
                  </div>
                  {form.industries.length >= 3 && (
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Additional industries  -  please explain</label>
                      <input className="w-full input-dark" value={form.industryOtherReason} onChange={e => set("industryOtherReason", e.target.value)} placeholder="e.g. We also operate in renewable energy..." />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Role / Title *</label>
                  <select
                    className="w-full input-dark"
                    style={{ colorScheme: "dark" }}
                    value={form.applicantRole}
                    onChange={e => set("applicantRole", e.target.value)}
                  >
                    <option value="">Select your role...</option>
                    {DECISION_MAKER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Operating Regions</label>
                  <div className="flex flex-wrap gap-2">
                    {regions.map(r => (
                      <button key={r} type="button"
                        onClick={() => toggleArr("operatingRegions", r)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          form.operatingRegions.includes(r)
                            ? "bg-blue-600/20 border-blue-500 text-blue-300"
                            : "border-slate-700 text-slate-500 hover:border-slate-600"
                        }`}
                      >{r}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Procurement Profile */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-lg font-bold text-white mb-1">Procurement Profile</h2>
                <p className="text-xs text-slate-500 mb-5">This information determines your procurement tier and fee structure.</p>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Procurement Team Size *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {teamSizes.map(s => (
                      <button key={s} type="button" onClick={() => set("teamSize", s)}
                        className={`py-2.5 rounded-lg text-xs font-medium border transition-all ${
                          form.teamSize === s ? "bg-blue-600/20 border-blue-500 text-blue-300" : "border-slate-700 text-slate-400 hover:border-slate-500"
                        }`}
                      >{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Average Order Value per Purchase *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {orderValues.map(v => (
                      <button key={v} type="button" onClick={() => set("avgOrderValue", v)}
                        className={`py-2.5 rounded-lg text-xs font-medium border transition-all ${
                          form.avgOrderValue === v ? "bg-blue-600/20 border-blue-500 text-blue-300" : "border-slate-700 text-slate-400 hover:border-slate-500"
                        }`}
                      >{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Annual Procurement Volume *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {annualVolumes.map(v => (
                      <button key={v} type="button" onClick={() => set("annualVolume", v)}
                        className={`py-2.5 rounded-lg text-xs font-medium border transition-all ${
                          form.annualVolume === v ? "bg-blue-600/20 border-blue-500 text-blue-300" : "border-slate-700 text-slate-400 hover:border-slate-500"
                        }`}
                      >{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Procurement Frequency *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {frequencies.map(f => (
                      <button key={f} type="button" onClick={() => set("procurementFrequency", f)}
                        className={`py-2.5 rounded-lg text-xs font-medium border transition-all ${
                          form.procurementFrequency === f ? "bg-blue-600/20 border-blue-500 text-blue-300" : "border-slate-700 text-slate-400 hover:border-slate-500"
                        }`}
                      >{f}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Preferred Sourcing Regions</label>
                  <div className="flex flex-wrap gap-2">
                    {regions.map(r => (
                      <button key={r} type="button" onClick={() => toggleArr("sourcingRegions", r)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          form.sourcingRegions.includes(r) ? "bg-blue-600/20 border-blue-500 text-blue-300" : "border-slate-700 text-slate-500 hover:border-slate-600"
                        }`}
                      >{r}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Qualification */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-lg font-bold text-white mb-1">Qualification Details</h2>
                <p className="text-xs text-slate-500 mb-5">This information is reviewed by our team to assess fit.</p>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Past Purchase Examples</label>
                  <textarea
                    className="w-full input-dark resize-none h-24"
                    value={form.pastPurchaseExamples}
                    onChange={e => set("pastPurchaseExamples", e.target.value)}
                    placeholder="Describe recent purchases: brands, item types, approximate values (e.g. Scania engine parts ~USD 50K, Caterpillar hydraulics ~USD 30K)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reason for Applying *</label>
                  <textarea
                    className="w-full input-dark resize-none h-28"
                    value={form.reasonForApplying}
                    onChange={e => set("reasonForApplying", e.target.value)}
                    placeholder="Describe your procurement challenge and why you are applying for access to Procure.parts. Be specific  -  vague applications are not approved."
                  />
                  <div className="text-right text-xs text-slate-600 mt-1">{form.reasonForApplying.length} chars (min. 20)</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <p className="text-xs text-amber-400 leading-relaxed">
                    <strong>Important:</strong> All applications are reviewed manually. Incomplete or vague applications will not be approved. You will receive a professional notification regardless of outcome.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-display text-lg font-bold text-white mb-1">Review Your Application</h2>
                <p className="text-xs text-slate-500 mb-5">Confirm all details before submitting.</p>

                {[
                  { label: "Company", value: form.legalName },
                  { label: "Country", value: form.country },
                  { label: "Email", value: form.businessEmail },
                  { label: "Industry", value: form.industries.join(", ") },
                  { label: "Role", value: form.applicantRole },
                  { label: "Team Size", value: form.teamSize },
                  { label: "Avg Order Value", value: form.avgOrderValue },
                  { label: "Annual Volume", value: form.annualVolume },
                  { label: "Frequency", value: form.procurementFrequency },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{row.label}</span>
                    <span className="text-xs text-slate-300 font-medium">{row.value || " - "}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Reason for Applying</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{form.reasonForApplying}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 mt-4">
                  <p className="text-xs text-blue-400">
                    By submitting, you confirm all information is accurate and agree to our terms of service. Procure.parts reserves the right to reject any application without detailed explanation.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {step < 3 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={applyMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-60"
                >
                  {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
