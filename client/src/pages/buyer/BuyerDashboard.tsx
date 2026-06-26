import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { FileText, DollarSign, FileCheck, ArrowRight } from "lucide-react";

const statusMap: Record<string,string> = { submitted:"badge-blue",reviewing:"badge-yellow",fee_requested:"badge-yellow",fee_paid:"badge-green",sourcing:"badge-blue",quoted:"badge-green",closed:"badge-gray" };

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { data: rfqs } = trpc.rfqs.myRfqs.useQuery({ limit:5, offset:0 });
  const { data: quotations } = trpc.quotations.myQuotations.useQuery();
  const rfqList = Array.isArray(rfqs) ? rfqs : [];
  const quotationList = Array.isArray(quotations) ? quotations : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back{user?.name?", "+user.name.split(" ")[0]:""}</h1>
        <p className="text-sm text-slate-500">Here is a summary of your procurement activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label:"Total RFQs", val:rfqList.length, icon:FileText, color:"text-blue-400", bg:"bg-blue-500/10", link:"/buyer/references" },
          { label:"Pending Fees", val:rfqList.filter((r:any)=>r.status==="fee_requested").length, icon:DollarSign, color:"text-amber-400", bg:"bg-amber-500/10", link:"/buyer/fees" },
          { label:"Quotations", val:quotationList.length, icon:FileCheck, color:"text-emerald-400", bg:"bg-emerald-500/10", link:"/buyer/quotations" },
        ].map((s,i) => (
          <Link key={i} href={s.link} className="card-premium border border-blue-900/20 p-5 hover:border-blue-500/30 transition-all block">
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 "+s.bg}>
              <s.icon className={"w-5 h-5 "+s.color}/>
            </div>
            <div className="text-2xl font-bold text-white font-display">{s.val}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="card-premium border border-blue-900/20 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">Recent RFQs</h2>
          <Link href="/buyer/references" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">View all<ArrowRight className="w-3 h-3"/></Link>
        </div>
        {rfqList.length > 0 ? (
          <div className="divide-y divide-slate-800/50">
            {rfqList.slice(0,5).map((r:any,i:number) => (
              <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-blue-900/5">
                <div>
                  <div className="font-mono text-sm text-blue-400">{r.referenceNumber}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{r.subject||"—"}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusMap[r.status]||"badge-gray"}>{(r.status||"").replace(/_/g," ")}</span>
                  <span className="text-xs text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2"/>
            <p className="text-sm text-slate-600 mb-3">No RFQs yet.</p>
            <Link href="/buyer/rfq/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">Submit your first RFQ</Link>
          </div>
        )}
      </div>
    </div>
  );
}
