import { trpc } from "@/lib/trpc";
import { FileText, Users, Package, TrendingUp, Clock, CheckCircle, AlertCircle, DollarSign } from "lucide-react";

export default function AdminOverview() {
  const { data: rfqStats } = trpc.rfqs.stats.useQuery();
  const { data: companyStats } = trpc.companies.stats.useQuery();

  const stats = [
    { label:"Total RFQs", value: rfqStats?.total??0, icon:FileText, color:"text-blue-400", bg:"bg-blue-500/10" },
    { label:"Pending Review", value: rfqStats?.reviewing??0, icon:Clock, color:"text-amber-400", bg:"bg-amber-500/10" },
    { label:"Fee Requested", value: rfqStats?.feeRequested??0, icon:DollarSign, color:"text-orange-400", bg:"bg-orange-500/10" },
    { label:"Sourcing", value: rfqStats?.sourcing??0, icon:Package, color:"text-purple-400", bg:"bg-purple-500/10" },
    { label:"Quoted", value: rfqStats?.quoted??0, icon:CheckCircle, color:"text-emerald-400", bg:"bg-emerald-500/10" },
    { label:"Closed", value: rfqStats?.closed??0, icon:TrendingUp, color:"text-slate-400", bg:"bg-slate-500/10" },
    { label:"Companies", value: companyStats?.total??0, icon:Users, color:"text-blue-400", bg:"bg-blue-500/10" },
    { label:"Pending Applications", value: companyStats?.pending??0, icon:AlertCircle, color:"text-amber-400", bg:"bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Admin Overview</h1>
        <p className="text-sm text-slate-500">Platform-wide KPIs and activity summary.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s,i) => (
          <div key={i} className="card-premium border border-blue-900/20 p-5">
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 "+s.bg}>
              <s.icon className={"w-5 h-5 "+s.color}/>
            </div>
            <div className="text-2xl font-bold text-white font-display">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-premium border border-blue-900/20 p-5">
          <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4">RFQ Pipeline</h2>
          <div className="space-y-3">
            {[
              { label:"Submitted", val:rfqStats?.submitted??0, color:"bg-blue-500" },
              { label:"Reviewing", val:rfqStats?.reviewing??0, color:"bg-amber-500" },
              { label:"Fee Requested", val:rfqStats?.feeRequested??0, color:"bg-orange-500" },
              { label:"Sourcing", val:rfqStats?.sourcing??0, color:"bg-purple-500" },
              { label:"Quoted", val:rfqStats?.quoted??0, color:"bg-emerald-500" },
              { label:"Closed", val:rfqStats?.closed??0, color:"bg-slate-500" },
            ].map((item,i) => {
              const total = rfqStats?.total||1;
              const pct = Math.round((item.val/total)*100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-semibold">{item.val}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={"h-full rounded-full "+item.color} style={{width:pct+"%"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card-premium border border-blue-900/20 p-5">
          <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4">Company Applications</h2>
          <div className="space-y-3">
            {[
              { label:"Total Companies", val:companyStats?.total??0, color:"bg-blue-500" },
              { label:"Pending Review", val:companyStats?.pending??0, color:"bg-amber-500" },
              { label:"Approved", val:companyStats?.approved??0, color:"bg-emerald-500" },
              { label:"Rejected", val:companyStats?.rejected??0, color:"bg-red-500" },
            ].map((item,i) => {
              const total = companyStats?.total||1;
              const pct = Math.round((item.val/total)*100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-semibold">{item.val}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={"h-full rounded-full "+item.color} style={{width:pct+"%"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
