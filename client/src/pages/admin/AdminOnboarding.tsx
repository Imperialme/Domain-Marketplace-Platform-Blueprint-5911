import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, CheckCircle, XCircle, Eye } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";

const riskColors: Record<string,string> = { green:"text-emerald-400 bg-emerald-500/10 border-emerald-500/20", yellow:"text-amber-400 bg-amber-500/10 border-amber-500/20", red:"text-red-400 bg-red-500/10 border-red-500/20" };

export default function AdminOnboarding() {
  const [selected, setSelected] = useState<any>(null);
  const [riskFlag, setRiskFlag] = useState<"green"|"yellow"|"red">("green");
  const [notes, setNotes] = useState("");
  const utils = trpc.useUtils();

  const { data: companies } = trpc.companies.list.useQuery({ status:"pending", limit:100 });
  const companyList = Array.isArray(companies) ? companies : [];

  const approveMutation = trpc.companies.approve.useMutation({
    onSuccess: () => { toast.success("Company approved"); setSelected(null); utils.companies.list.invalidate(); },
    onError: (e:any) => toast.error(e.message),
  });
  const rejectMutation = trpc.companies.reject.useMutation({
    onSuccess: () => { toast.success("Company rejected"); setSelected(null); utils.companies.list.invalidate(); },
    onError: (e:any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Onboarding Gate</h1>
        <p className="text-sm text-slate-500">Review and approve company applications. Assign risk flags before approval.</p>
      </div>

      <div className="card-premium border border-blue-900/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">Pending Applications</h2>
          <span className="text-xs text-slate-500">{companyList.length} pending</span>
        </div>
        {companyList.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-600">No pending applications.</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: "legalName", header: "Company", render: (c: any) => <div><div className="font-semibold text-white text-sm">{c.legalName}</div><div className="text-xs text-slate-500 font-mono">{c.companyId||''}</div></div>, exportValue: (c: any) => c.legalName },
              { key: "country", header: "Country", exportValue: (c: any) => c.country||'' },
              { key: "industry", header: "Industry", exportValue: (c: any) => c.industry||'' },
              { key: "businessEmail", header: "Email", render: (c: any) => <span className="text-slate-400 text-xs">{c.businessEmail}</span>, exportValue: (c: any) => c.businessEmail },
              { key: "createdAt", header: "Applied", render: (c: any) => <span className="text-slate-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>, exportValue: (c: any) => new Date(c.createdAt).toLocaleDateString() },
              { key: "riskFlag", header: "Risk", render: (c: any) => c.riskFlag ? <span className={"text-xs px-2 py-1 rounded-lg border font-semibold "+riskColors[c.riskFlag]}>{c.riskFlag.toUpperCase()}</span> : <span className="text-xs text-slate-600">Not set</span>, exportValue: (c: any) => c.riskFlag||'' },
              { key: "actions", header: "Actions", render: (c: any) => <button onClick={() => { setSelected(c); setRiskFlag(c.riskFlag||'green'); setNotes(''); }} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"><Eye className="w-4 h-4"/></button>, exportValue: () => '' },
            ] as Column<any>[]}
            data={companyList}
            filename="pending-applications"
            rowKey={(c: any) => c.id}
            emptyMessage="No pending applications."
          />
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card-premium border border-blue-900/30 p-6 w-full max-w-lg">
            <h2 className="font-display text-lg font-bold text-white mb-4">{selected.legalName}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm mb-5">
              {[["Country",selected.country],["Industry",selected.industryType],["Contact",selected.contactName],["Email",selected.contactEmail],["Phone",selected.contactPhone],["Website",selected.website]].map(([l,v]) => (
                <div key={l}>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{l}</div>
                  <div className="text-sm text-white">{v||"—"}</div>
                </div>
              ))}
            </div>
            {selected.description && (
              <div className="mb-4">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Description</div>
                <p className="text-sm text-slate-300">{selected.description}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Risk Flag *</label>
              <div className="flex gap-2">
                {(["green","yellow","red"] as const).map(flag => (
                  <button key={flag} onClick={() => setRiskFlag(flag)}
                    className={"flex-1 py-2 rounded-xl text-sm font-semibold border transition-all capitalize "+(riskFlag===flag?riskColors[flag]:"border-slate-700 text-slate-500 hover:border-slate-500")}>
                    {flag}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin Notes</label>
              <textarea className="w-full input-dark resize-none h-20 text-sm" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Internal notes (not visible to applicant)..."/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold">Cancel</button>
              <button onClick={() => rejectMutation.mutate({ id:selected.id, adminNotes:notes })}
                disabled={rejectMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 text-sm font-semibold">
                <XCircle className="w-4 h-4"/>Reject
              </button>
              <button onClick={() => approveMutation.mutate({ id:selected.id, riskFlag, adminNotes:notes })}
                disabled={approveMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 text-sm font-semibold">
                <CheckCircle className="w-4 h-4"/>Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
