import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FileText, Eye } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";

const statusMap: Record<string,string> = { submitted:"badge-blue",reviewing:"badge-yellow",fee_requested:"badge-yellow",fee_paid:"badge-green",sourcing:"badge-blue",quoted:"badge-green",closed:"badge-gray" };

export default function AdminRFQs() {
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const utils = trpc.useUtils();

  const { data: rfqs } = trpc.rfqs.list.useQuery({ status: filter==="all"?undefined:filter, limit:100 });
  const rfqList = Array.isArray(rfqs) ? rfqs : [];

  const updateMutation = trpc.rfqs.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); setSelected(null); utils.rfqs.list.invalidate(); },
    onError: (e:any) => toast.error(e.message),
  });

  const statuses = ["all","submitted","reviewing","fee_requested","fee_paid","sourcing","quoted","closed"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">RFQ Queue</h1>
        <p className="text-sm text-slate-500">Manage all RFQs, assign paths, and update statuses.</p>
      </div>

      <div className="flex gap-1 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={"px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all "+(filter===s?"bg-blue-600 text-white":"bg-white/5 text-slate-400 hover:text-white")}>
            {s.replace(/_/g," ")}
          </button>
        ))}
      </div>

      <div className="card-premium border border-blue-900/20 p-4">
        <DataTable
          columns={[
            { key: "referenceNumber", header: "Reference", render: (item: any) => { const rfq = item.rfq||item; return <span className="font-mono text-blue-400 text-xs">{rfq.referenceNumber}</span>; }, exportValue: (item: any) => { const rfq = item.rfq||item; return rfq.referenceNumber||''; } },
            { key: "subject", header: "Subject", render: (item: any) => { const rfq = item.rfq||item; return <span className="text-white text-sm truncate max-w-[200px] block">{rfq.subject||'-'}</span>; }, exportValue: (item: any) => { const rfq = item.rfq||item; return rfq.subject||''; } },
            { key: "company", header: "Company", render: (item: any) => <span className="text-slate-400 text-xs">{item.company?.legalName||'-'}</span>, exportValue: (item: any) => item.company?.legalName||'' },
            { key: "priority", header: "Priority", render: (item: any) => { const rfq = item.rfq||item; return <span className={rfq.priority==="priority"?"badge-yellow":"badge-gray"}>{rfq.priority}</span>; }, exportValue: (item: any) => { const rfq = item.rfq||item; return rfq.priority||''; } },
            { key: "pathAssigned", header: "Path", render: (item: any) => { const rfq = item.rfq||item; return <span className="text-slate-400 text-xs">{rfq.pathAssigned||'-'}</span>; }, exportValue: (item: any) => { const rfq = item.rfq||item; return rfq.pathAssigned||''; } },
            { key: "status", header: "Status", render: (item: any) => { const rfq = item.rfq||item; return <span className={statusMap[rfq.status]||"badge-gray"}>{(rfq.status||"").replace(/_/g," ")}</span>; }, exportValue: (item: any) => { const rfq = item.rfq||item; return rfq.status||''; } },
            { key: "createdAt", header: "Submitted", render: (item: any) => { const rfq = item.rfq||item; return <span className="text-slate-500 text-xs">{new Date(rfq.createdAt).toLocaleDateString()}</span>; }, exportValue: (item: any) => { const rfq = item.rfq||item; return new Date(rfq.createdAt).toLocaleDateString(); } },
            { key: "actions", header: "Actions", render: (item: any) => <button onClick={() => setSelected(item)} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"><Eye className="w-4 h-4"/></button>, exportValue: () => '' },
          ] as Column<any>[]}
          data={rfqList}
          filename="rfqs-export"
          rowKey={(item: any) => { const rfq = item.rfq||item; return rfq.id; }}
          emptyMessage="No RFQs found."
        />
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card-premium border border-blue-900/30 p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-display text-lg font-bold text-white">{(selected.rfq||selected).referenceNumber}</h2>
                <div className="text-xs text-slate-500 mt-1">{(selected.rfq||selected).subject}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-600 hover:text-white text-lg font-bold">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-5">
              {[
                ["Company",selected.company?.legalName||"—"],
                ["Priority",(selected.rfq||selected).priority],
                ["Timeline",(selected.rfq||selected).timelineTier?.replace(/_/g," ")||"—"],
                ["Value",(selected.rfq||selected).estimatedValueTier?.replace(/_/g," ")||"—"],
                ["Current Status",(selected.rfq||selected).status?.replace(/_/g," ")||"—"],
                ["Path",(selected.rfq||selected).pathAssigned||"Not assigned"],
              ].map(([l,v]) => (
                <div key={l}>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{l}</div>
                  <div className="text-sm text-white capitalize">{v}</div>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Update Status</label>
              <div className="grid grid-cols-2 gap-2">
                {["reviewing","fee_requested","fee_paid","sourcing","quoted","closed"].map(s => (
                  <button key={s} onClick={() => updateMutation.mutate({ id:(selected.rfq||selected).id, status:s as any })}
                    disabled={updateMutation.isPending}
                    className={"py-2 px-3 rounded-lg text-xs font-semibold border capitalize transition-all "+(((selected.rfq||selected).status===s)?"bg-blue-600/20 border-blue-500 text-blue-300":"border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white")}>
                    {s.replace(/_/g," ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
