import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Package, Plus, Search } from "lucide-react";

export default function AdminPartsDNA() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ oemPartNumber:"", brand:"", description:"", category:"", subCategory:"", equipmentType:"", compatibleModels:"", unitOfMeasure:"unit" });
  const utils = trpc.useUtils();

  const { data: parts } = trpc.parts.search.useQuery({ query: search||"", limit:100 });
  const partList = Array.isArray(parts) ? parts : [];

  const createMutation = trpc.parts.create.useMutation({
    onSuccess: () => { toast.success("Part created"); setShowCreate(false); utils.parts.list.invalidate(); },
    onError: (e:any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Parts DNA</h1>
          <p className="text-sm text-slate-500">Master parts database. Each part has a unique DNA-XXXXXX identifier.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold">
          <Plus className="w-4 h-4"/>Add Part
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/>
        <input className="w-full input-dark pl-9" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by part number, brand, description..."/>
      </div>

      <div className="card-premium border border-blue-900/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-800">
              {["DNA ID","OEM Part #","Brand","Description","Category","Equipment","Status"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {partList.length > 0 ? partList.map((p:any,i:number) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-blue-900/5">
                  <td className="px-4 py-3 font-mono text-blue-400 text-xs">{p.dnaId||"—"}</td>
                  <td className="px-4 py-3 font-semibold text-white text-sm">{p.oemPartNumber}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{p.brand||"—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-300 max-w-xs truncate">{p.description||"—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{p.category||"—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{p.equipmentType||"—"}</td>
                  <td className="px-4 py-3"><span className={p.isActive?"badge-green":"badge-gray"}>{p.isActive?"Active":"Inactive"}</span></td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-4 py-10 text-center">
                  <Package className="w-8 h-8 text-slate-700 mx-auto mb-2"/>
                  <p className="text-sm text-slate-600">No parts yet. Add your first part.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card-premium border border-blue-900/30 p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <h2 className="font-display text-lg font-bold text-white mb-5">Add Part to DNA</h2>
            <div className="space-y-4">
              {[
                { field:"oemPartNumber", label:"OEM Part Number *", ph:"e.g. 1392648" },
                { field:"brand", label:"Brand", ph:"e.g. Scania" },
                { field:"description", label:"Description", ph:"e.g. Engine Oil Filter" },
                { field:"category", label:"Category", ph:"e.g. Engine" },
                { field:"subCategory", label:"Sub-Category", ph:"e.g. Filtration" },
                { field:"equipmentType", label:"Equipment Type", ph:"e.g. Heavy Truck" },
                { field:"compatibleModels", label:"Compatible Models", ph:"e.g. P380, R450" },
              ].map(({ field, label, ph }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
                  <input className="w-full input-dark" value={(form as any)[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} placeholder={ph}/>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold">Cancel</button>
              <button onClick={() => createMutation.mutate(form as any)} disabled={!form.oemPartNumber||createMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-60">
                {createMutation.isPending?"Creating...":"Create Part"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
