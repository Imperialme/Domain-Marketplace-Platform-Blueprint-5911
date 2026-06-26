import { trpc } from "@/lib/trpc";
import { FileText } from "lucide-react";
import { Link } from "wouter";

const statusMap: Record<string,string> = { submitted:"badge-blue",reviewing:"badge-yellow",fee_requested:"badge-yellow",fee_paid:"badge-green",sourcing:"badge-blue",quoted:"badge-green",closed:"badge-gray" };
const priorityMap: Record<string,string> = { standard:"badge-gray",priority:"badge-yellow" };

export default function BuyerReferences() {
  const { data: rfqs } = trpc.rfqs.myRfqs.useQuery({ limit:100, offset:0 });
  const rfqList = Array.isArray(rfqs) ? rfqs : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">My References</h1>
          <p className="text-sm text-slate-500">All your submitted RFQs and their current status.</p>
        </div>
        <Link href="/buyer/rfq/new" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold">+ New RFQ</Link>
      </div>

      <div className="card-premium border border-blue-900/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-800">
              {["Reference","Subject","Priority","Timeline","Status","Submitted","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rfqList.length > 0 ? rfqList.map((r:any,i:number) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-blue-900/5">
                  <td className="px-4 py-3 font-mono text-blue-400 text-xs">{r.referenceNumber}</td>
                  <td className="px-4 py-3 text-sm text-white max-w-xs truncate">{r.subject||"—"}</td>
                  <td className="px-4 py-3"><span className={priorityMap[r.priority]||"badge-gray"}>{r.priority}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-400 capitalize">{(r.timelineTier||"—").replace(/_/g," ")}</td>
                  <td className="px-4 py-3"><span className={statusMap[r.status]||"badge-gray"}>{(r.status||"").replace(/_/g," ")}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {r.status==="fee_requested" && (
                      <Link href="/buyer/fees" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">Pay Fee →</Link>
                    )}
                    {r.status==="quoted" && (
                      <Link href="/buyer/quotations" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">View Quote →</Link>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-4 py-10 text-center">
                  <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2"/>
                  <p className="text-sm text-slate-600 mb-3">No RFQs submitted yet.</p>
                  <Link href="/buyer/rfq/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">Submit your first RFQ</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
