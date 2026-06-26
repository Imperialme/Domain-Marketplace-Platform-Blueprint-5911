import { trpc } from "@/lib/trpc";
import { DollarSign } from "lucide-react";

export default function AdminFees() {
  const { data: rfqs } = trpc.rfqs.list.useQuery({ status:"fee_requested", limit:100 });
  const rfqList = Array.isArray(rfqs) ? rfqs : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Fee Ledger</h1>
        <p className="text-sm text-slate-500">Track engagement fees for Priority (Path B) RFQs.</p>
      </div>
      <div className="card-premium border border-blue-900/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-800">
              {["RFQ Reference","Company","Subject","Status","Fee Amount","Payment Method","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rfqList.length > 0 ? rfqList.map((item:any,i:number) => {
                const rfq = item.rfq||item;
                return (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-blue-900/5">
                    <td className="px-4 py-3 font-mono text-blue-400 text-xs">{rfq.referenceNumber}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{item.company?.legalName||"—"}</td>
                    <td className="px-4 py-3 text-sm text-white max-w-xs truncate">{rfq.subject||"—"}</td>
                    <td className="px-4 py-3"><span className="badge-yellow">Fee Requested</span></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{rfq.engagementFeeAmount?"$"+rfq.engagementFeeAmount:"TBD"}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">Stripe / PayPal</td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20">Mark Paid</button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={7} className="px-4 py-10 text-center">
                  <DollarSign className="w-8 h-8 text-slate-700 mx-auto mb-2"/>
                  <p className="text-sm text-slate-600">No pending fees.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
