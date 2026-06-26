import { trpc } from "@/lib/trpc";
import { FileText } from "lucide-react";
import { Link } from "wouter";

export default function VendorSubmissions() {
  const { data: submissions } = trpc.vendors.mySubmissions.useQuery({ limit:100 });
  const subList = Array.isArray(submissions) ? submissions : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">My Submissions</h1>
          <p className="text-sm text-slate-500">All your price submissions and their review status.</p>
        </div>
        <Link href="/vendor/submit" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold">+ New Submission</Link>
      </div>

      <div className="card-premium border border-blue-900/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-800">
              {["RFQ Reference","Part Number","Condition","Unit Price","Currency","Lead Time","Stock","Status","Submitted"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {subList.length > 0 ? subList.map((s:any,i:number) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-blue-900/5">
                  <td className="px-4 py-3 font-mono text-blue-400 text-xs">{s.rfqReference||"—"}</td>
                  <td className="px-4 py-3 font-semibold text-white text-sm">{s.partNumber||"—"}</td>
                  <td className="px-4 py-3"><span className={s.condition==="oem"?"badge-blue":"badge-gray"}>{s.condition}</span></td>
                  <td className="px-4 py-3 font-mono text-emerald-400">{s.unitPrice?s.unitPrice.toFixed(2):"—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{s.currency||"USD"}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{s.leadTimeDays?s.leadTimeDays+"d":"—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 capitalize">{(s.stockStatus||"—").replace(/_/g," ")}</td>
                  <td className="px-4 py-3"><span className={s.status==="approved"?"badge-green":s.status==="rejected"?"badge-red":"badge-yellow"}>{s.status||"pending"}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{s.submittedAt?new Date(s.submittedAt).toLocaleDateString():"—"}</td>
                </tr>
              )) : (
                <tr><td colSpan={9} className="px-4 py-10 text-center">
                  <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2"/>
                  <p className="text-sm text-slate-600 mb-3">No submissions yet.</p>
                  <Link href="/vendor/submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">Submit your first price</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
