import { trpc } from "@/lib/trpc";
import { Settings } from "lucide-react";

export default function AdminMarginRules() {
  const { data: rules } = trpc.parts.marginRules.useQuery();
  const ruleList = Array.isArray(rules) ? rules : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Margin Rules</h1>
        <p className="text-sm text-slate-500">Current margin calculation rules. Editable by Super Admin only.</p>
      </div>

      <div className="card-premium border border-amber-500/20 p-5">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"/>
          <div>
            <div className="text-sm font-semibold text-amber-300 mb-1">Locked Rules</div>
            <div className="text-xs text-slate-400">These rules are locked and require Super Admin access to modify. All changes are audit-logged.</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-premium border border-emerald-500/20 p-5">
          <h2 className="font-display text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">OEM Rule</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <span className="text-sm text-slate-400">Margin Type</span>
              <span className="text-sm font-semibold text-white">Fixed 25%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <span className="text-sm text-slate-400">Formula</span>
              <span className="text-sm font-mono text-emerald-400">Sell = Cost ÷ 0.75</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-400">Applies To</span>
              <span className="text-sm text-white">All OEM/Genuine parts</span>
            </div>
          </div>
        </div>

        <div className="card-premium border border-blue-500/20 p-5">
          <h2 className="font-display text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">Aftermarket (AM) Rules</h2>
          <div className="space-y-3">
            {[
              { tier:"Tier 1", range:"0–100% gap", margin:"30%", formula:"AM Cost × 1.30" },
              { tier:"Tier 2", range:"101–400% gap", margin:"50%", formula:"AM Cost × 1.50" },
              { tier:"Tier 3", range:"401%+ gap", margin:"150% or Cap", formula:"MAX(AM×2.5, OEM Sell×40%)" },
            ].map((r,i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                <div>
                  <div className="text-xs font-semibold text-blue-400">{r.tier}</div>
                  <div className="text-xs text-slate-500">{r.range}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{r.margin}</div>
                  <div className="text-xs font-mono text-slate-500">{r.formula}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {ruleList.length > 0 && (
        <div className="card-premium border border-blue-900/20 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800">
            <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">DB Margin Rules</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-800">
                {["Rule Name","Part Type","Margin %","Min Gap","Max Gap","Active"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {ruleList.map((r:any,i:number) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="px-4 py-3 font-semibold text-white">{r.ruleName}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 capitalize">{r.partType}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">{r.marginPct}%</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{r.minGapPct??"—"}%</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{r.maxGapPct??"—"}%</td>
                    <td className="px-4 py-3"><span className={r.isActive?"badge-green":"badge-gray"}>{r.isActive?"Yes":"No"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
