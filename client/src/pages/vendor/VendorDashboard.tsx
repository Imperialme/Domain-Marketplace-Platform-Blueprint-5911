import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Send, FileText, Package, ArrowRight } from "lucide-react";

export default function VendorDashboard() {
  const { user } = useAuth();
  const { data: submissions } = trpc.vendors.mySubmissions.useQuery({ limit:100 });
  const subList = Array.isArray(submissions) ? submissions : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Vendor Dashboard</h1>
        <p className="text-sm text-slate-500">Welcome to your vendor portal. Submit prices and track your submissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label:"Total Submissions", val:subList.length, icon:FileText, color:"text-blue-400", bg:"bg-blue-500/10" },
          { label:"Pending Review", val:subList.filter((s:any)=>s.status==="pending").length, icon:Package, color:"text-amber-400", bg:"bg-amber-500/10" },
          { label:"Approved", val:subList.filter((s:any)=>s.status==="approved").length, icon:Send, color:"text-emerald-400", bg:"bg-emerald-500/10" },
        ].map((s,i) => (
          <div key={i} className="card-premium border border-blue-900/20 p-5">
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 "+s.bg}>
              <s.icon className={"w-5 h-5 "+s.color}/>
            </div>
            <div className="text-2xl font-bold text-white font-display">{s.val}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card-premium border border-blue-900/20 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">Recent Submissions</h2>
          <Link href="/vendor/submissions" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">View all<ArrowRight className="w-3 h-3"/></Link>
        </div>
        {subList.length > 0 ? (
          <div className="divide-y divide-slate-800/50">
            {subList.slice(0,5).map((s:any,i:number) => (
              <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-blue-900/5">
                <div>
                  <div className="text-sm text-white">{s.rfqReference||s.partNumber||"Submission"}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{new Date(s.submittedAt||s.createdAt||Date.now()).toLocaleDateString()}</div>
                </div>
                <span className={s.status==="approved"?"badge-green":s.status==="rejected"?"badge-red":"badge-yellow"}>{s.status||"pending"}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2"/>
            <p className="text-sm text-slate-600 mb-3">No submissions yet.</p>
            <Link href="/vendor/submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">Submit your first price</Link>
          </div>
        )}
      </div>
    </div>
  );
}
