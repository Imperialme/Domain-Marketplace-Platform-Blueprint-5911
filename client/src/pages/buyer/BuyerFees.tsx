import { trpc } from "@/lib/trpc";
import { DollarSign, CreditCard, ExternalLink } from "lucide-react";

export default function BuyerFees() {
  const { data: rfqs } = trpc.rfqs.myRfqs.useQuery({ limit:100, offset:0 });
  const rfqList = Array.isArray(rfqs) ? rfqs : [];
  const feeRfqs = rfqList.filter((r:any) => r.status === "fee_requested" || r.engagementFeeAmount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Fees & Payments</h1>
        <p className="text-sm text-slate-500">Engagement fees for Priority (Path B) RFQs. Payment required before sourcing begins.</p>
      </div>

      <div className="card-premium border border-amber-500/20 p-5">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"/>
          <div>
            <div className="text-sm font-semibold text-amber-300 mb-1">About Engagement Fees</div>
            <div className="text-xs text-slate-400">Priority RFQs (Path B) require an engagement fee before we contact our vendor network. This ensures serious enquiries only and protects our vendors from price-fishing. Fees are applied to your first order.</div>
          </div>
        </div>
      </div>

      {feeRfqs.length > 0 ? (
        <div className="space-y-4">
          {feeRfqs.map((r:any,i:number) => (
            <div key={i} className="card-premium border border-blue-900/20 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-mono text-sm text-blue-400">{r.referenceNumber}</div>
                  <div className="text-sm text-white mt-1">{r.subject||"—"}</div>
                </div>
                <span className={r.status==="fee_requested"?"badge-yellow":"badge-green"}>
                  {r.status==="fee_requested"?"Payment Required":"Paid"}
                </span>
              </div>
              {r.status === "fee_requested" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-sm text-slate-400">Engagement Fee</span>
                    <span className="text-lg font-bold text-white font-mono">{r.engagementFeeAmount?"$"+r.engagementFeeAmount:"Contact Admin"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm">
                      <CreditCard className="w-4 h-4"/>Pay via Stripe
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#003087] hover:bg-[#002070] text-white font-semibold text-sm">
                      <ExternalLink className="w-4 h-4"/>Pay via PayPal
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 text-center">Secure payment. Your sourcing begins immediately upon confirmation.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card-premium border border-blue-900/20 p-10 text-center">
          <DollarSign className="w-10 h-10 text-slate-700 mx-auto mb-3"/>
          <p className="text-sm text-slate-500">No pending fees. Standard RFQs (Path A) are processed at no charge.</p>
        </div>
      )}
    </div>
  );
}
