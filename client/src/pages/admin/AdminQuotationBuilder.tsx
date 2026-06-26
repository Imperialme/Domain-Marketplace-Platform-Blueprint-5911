import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, X, Calculator, Eye } from "lucide-react";

type Line = {
  lineNo: number;
  partNumber: string;
  description: string;
  qty: number;
  oemCostUSD: string;
  amCostUSD: string;
  condition: "oem"|"aftermarket"|"both";
  notes: string;
  // Calculated
  oemSellUSD?: number;
  amSellUSD?: number;
  oemMarginPct?: number;
  amMarginPct?: number;
  amTier?: string;
};

function calcOEMSell(cost: number): number { return cost / 0.75; }
function calcAMSell(amCost: number, oemCost: number): number {
  const oemSell = calcOEMSell(oemCost);
  const diffPct = ((oemCost - amCost) / amCost) * 100;
  if (diffPct <= 100) return amCost * 1.30;
  if (diffPct <= 400) return amCost * 1.50;
  const optA = amCost * 2.50;
  const optB = oemSell * 0.40;
  return Math.max(optA, optB);
}
function getAMTier(amCost: number, oemCost: number): string {
  const diffPct = ((oemCost - amCost) / amCost) * 100;
  if (diffPct <= 100) return "Tier 1 (30%)";
  if (diffPct <= 400) return "Tier 2 (50%)";
  return "Tier 3 (150%/Cap)";
}
function marginPct(sell: number, cost: number): number {
  return ((sell - cost) / sell) * 100;
}

export default function AdminQuotationBuilder() {
  const [rfqId, setRfqId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [fxRate, setFxRate] = useState("3.65");
  const [validityDays, setValidityDays] = useState("30");
  const [lines, setLines] = useState<Line[]>([{ lineNo:1, partNumber:"", description:"", qty:1, oemCostUSD:"", amCostUSD:"", condition:"both", notes:"" }]);
  const [showPreview, setShowPreview] = useState(false);
  const utils = trpc.useUtils();

  const createMutation = trpc.quotations.create.useMutation({
    onSuccess: (d:any) => { toast.success("Quotation created: "+d.quotationNumber); utils.quotations.list.invalidate(); },
    onError: (e:any) => toast.error(e.message),
  });

  const calculateLine = useCallback((l: Line): Line => {
    const oemCost = parseFloat(l.oemCostUSD)||0;
    const amCost = parseFloat(l.amCostUSD)||0;
    const oemSell = oemCost > 0 ? calcOEMSell(oemCost) : undefined;
    const amSell = (amCost > 0 && oemCost > 0) ? calcAMSell(amCost, oemCost) : (amCost > 0 ? amCost * 1.30 : undefined);
    return {
      ...l,
      oemSellUSD: oemSell,
      amSellUSD: amSell,
      oemMarginPct: oemSell && oemCost ? marginPct(oemSell, oemCost) : undefined,
      amMarginPct: amSell && amCost ? marginPct(amSell, amCost) : undefined,
      amTier: (amCost > 0 && oemCost > 0) ? getAMTier(amCost, oemCost) : undefined,
    };
  }, []);

  const updateLine = (i: number, field: keyof Line, val: any) => {
    setLines(ls => ls.map((l, idx) => idx === i ? calculateLine({ ...l, [field]: val }) : l));
  };

  const addLine = () => setLines(ls => [...ls, { lineNo: ls.length+1, partNumber:"", description:"", qty:1, oemCostUSD:"", amCostUSD:"", condition:"both", notes:"" }]);
  const removeLine = (i: number) => setLines(ls => ls.filter((_,idx)=>idx!==i).map((l,idx)=>({...l,lineNo:idx+1})));

  const calcLines = lines.map(calculateLine);
  const totalOEMCost = calcLines.reduce((s,l)=>(s+(parseFloat(l.oemCostUSD)||0)*l.qty),0);
  const totalOEMSell = calcLines.reduce((s,l)=>(s+(l.oemSellUSD||0)*l.qty),0);
  const totalAMCost = calcLines.reduce((s,l)=>(s+(parseFloat(l.amCostUSD)||0)*l.qty),0);
  const totalAMSell = calcLines.reduce((s,l)=>(s+(l.amSellUSD||0)*l.qty),0);
  const blendedOEMMargin = totalOEMSell > 0 ? marginPct(totalOEMSell, totalOEMCost) : 0;
  const blendedAMMargin = totalAMSell > 0 ? marginPct(totalAMSell, totalAMCost) : 0;

  const handleCreate = () => {
    if (!rfqId) { toast.error("RFQ ID required"); return; }
    createMutation.mutate({
      rfqId: parseInt(rfqId),
      currency,
      validityDays: parseInt(validityDays)||30,
      lineItems: calcLines.map(l => ({
        lineNo: l.lineNo,
        partNumber: l.partNumber,
        description: l.description,
        qty: l.qty,
        oemCostUSD: parseFloat(l.oemCostUSD)||undefined,
        amCostUSD: parseFloat(l.amCostUSD)||undefined,
        oemSellUSD: l.oemSellUSD,
        amSellUSD: l.amSellUSD,
        condition: l.condition,
        notes: l.notes,
      })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Quotation Builder</h1>
          <p className="text-sm text-slate-500">Build quotations with auto-calculated margins. OEM: 25% flat. AM: tiered by cost gap.</p>
        </div>
        <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-semibold">
          <Eye className="w-4 h-4"/>Preview
        </button>
      </div>

      {/* Header */}
      <div className="card-premium border border-blue-900/20 p-5">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">RFQ ID *</label>
            <input className="w-full input-dark" value={rfqId} onChange={e=>setRfqId(e.target.value)} placeholder="e.g. 42"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Currency</label>
            <select className="w-full input-dark" value={currency} onChange={e=>setCurrency(e.target.value)}>
              <option value="USD">USD</option><option value="EUR">EUR</option><option value="AED">AED</option><option value="GBP">GBP</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AED/USD FX Rate</label>
            <input type="number" className="w-full input-dark" value={fxRate} onChange={e=>setFxRate(e.target.value)} step="0.01"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Validity (days)</label>
            <input type="number" className="w-full input-dark" value={validityDays} onChange={e=>setValidityDays(e.target.value)}/>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="card-premium border border-blue-900/20 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">Line Items</h2>
          <button onClick={addLine} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5"/>Add Line
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-800 bg-navy-card/50">
              {["#","Part #","Description","Qty","OEM Cost","AM Cost","Cond.","OEM Sell","AM Sell","OEM Mgn","AM Mgn","AM Tier","Notes",""].map(h => (
                <th key={h} className="text-left px-3 py-2.5 text-slate-500 uppercase tracking-wider font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {calcLines.map((l,i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-blue-900/5">
                  <td className="px-3 py-2 text-slate-500 font-mono">{l.lineNo}</td>
                  <td className="px-3 py-2"><input className="input-dark text-xs w-24" value={l.partNumber} onChange={e=>updateLine(i,"partNumber",e.target.value)} placeholder="Part #"/></td>
                  <td className="px-3 py-2"><input className="input-dark text-xs w-28" value={l.description} onChange={e=>updateLine(i,"description",e.target.value)} placeholder="Desc"/></td>
                  <td className="px-3 py-2"><input type="number" className="input-dark text-xs w-14" value={l.qty} onChange={e=>updateLine(i,"qty",parseInt(e.target.value)||1)} min={1}/></td>
                  <td className="px-3 py-2"><input type="number" className="input-dark text-xs w-20" value={l.oemCostUSD} onChange={e=>updateLine(i,"oemCostUSD",e.target.value)} placeholder="0.00"/></td>
                  <td className="px-3 py-2"><input type="number" className="input-dark text-xs w-20" value={l.amCostUSD} onChange={e=>updateLine(i,"amCostUSD",e.target.value)} placeholder="0.00"/></td>
                  <td className="px-3 py-2">
                    <select className="input-dark text-xs w-24" value={l.condition} onChange={e=>updateLine(i,"condition",e.target.value as any)}>
                      <option value="oem">OEM</option><option value="aftermarket">AM</option><option value="both">Both</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 font-mono text-emerald-400 font-semibold">{l.oemSellUSD?l.oemSellUSD.toFixed(2):"—"}</td>
                  <td className="px-3 py-2 font-mono text-blue-400 font-semibold">{l.amSellUSD?l.amSellUSD.toFixed(2):"—"}</td>
                  <td className="px-3 py-2 font-mono text-emerald-300">{l.oemMarginPct?l.oemMarginPct.toFixed(1)+"%":"—"}</td>
                  <td className="px-3 py-2 font-mono text-blue-300">{l.amMarginPct?l.amMarginPct.toFixed(1)+"%":"—"}</td>
                  <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{l.amTier||"—"}</td>
                  <td className="px-3 py-2"><input className="input-dark text-xs w-24" value={l.notes} onChange={e=>updateLine(i,"notes",e.target.value)} placeholder="Notes"/></td>
                  <td className="px-3 py-2"><button onClick={() => removeLine(i)} className="text-red-500 hover:text-red-400"><X className="w-3.5 h-3.5"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* P&L Summary */}
      <div className="card-premium border border-blue-900/20 p-5">
        <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4">P&L Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label:"OEM Total Cost", val:"$"+totalOEMCost.toFixed(2), color:"text-slate-300" },
            { label:"OEM Total Sell", val:"$"+totalOEMSell.toFixed(2), color:"text-emerald-400" },
            { label:"AM Total Cost", val:"$"+totalAMCost.toFixed(2), color:"text-slate-300" },
            { label:"AM Total Sell", val:"$"+totalAMSell.toFixed(2), color:"text-blue-400" },
            { label:"OEM Blended Margin", val:blendedOEMMargin.toFixed(1)+"%", color:"text-emerald-300" },
            { label:"AM Blended Margin", val:blendedAMMargin.toFixed(1)+"%", color:"text-blue-300" },
            { label:"OEM Profit", val:"$"+(totalOEMSell-totalOEMCost).toFixed(2), color:"text-amber-400" },
            { label:"AM Profit", val:"$"+(totalAMSell-totalAMCost).toFixed(2), color:"text-amber-400" },
          ].map((s,i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">{s.label}</div>
              <div className={"text-lg font-bold font-mono "+s.color}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={handleCreate} disabled={!rfqId||createMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-60">
          <Calculator className="w-4 h-4"/>{createMutation.isPending?"Creating...":"Create Quotation"}
        </button>
      </div>

      {/* Preview Modal - Buyer-facing view */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[85vh] overflow-y-auto text-gray-900">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">QUOTATION</h2>
                <div className="text-sm text-gray-500 mt-1">Procure.parts · Operated by Imperial MEA General Trading LLC</div>
                <div className="text-sm text-gray-500">Validity: {validityDays} days · Currency: {currency}</div>
              </div>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <table className="w-full text-sm border-collapse mb-6">
              <thead><tr className="bg-gray-100">
                {["#","Part Number","Description","Qty","OEM Price","AM Price","Savings"].map(h => (
                  <th key={h} className="text-left px-3 py-2 font-semibold text-gray-700 border border-gray-200">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {calcLines.map((l,i) => {
                  const oemTotal = (l.oemSellUSD||0)*l.qty;
                  const amTotal = (l.amSellUSD||0)*l.qty;
                  const savings = oemTotal > 0 && amTotal > 0 ? ((oemTotal-amTotal)/oemTotal*100).toFixed(1)+"%" : "—";
                  return (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="px-3 py-2 text-gray-500">{l.lineNo}</td>
                      <td className="px-3 py-2 font-semibold">{l.partNumber||"—"}</td>
                      <td className="px-3 py-2 text-gray-600">{l.description||"—"}</td>
                      <td className="px-3 py-2 text-center">{l.qty}</td>
                      <td className="px-3 py-2 font-mono text-right">{l.oemSellUSD?(currency+" "+oemTotal.toFixed(2)):"—"}</td>
                      <td className="px-3 py-2 font-mono text-right text-blue-700">{l.amSellUSD?(currency+" "+amTotal.toFixed(2)):"—"}</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-semibold">{savings}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={4} className="px-3 py-2 text-right text-gray-700 border border-gray-200">TOTAL</td>
                  <td className="px-3 py-2 font-mono text-right border border-gray-200">{currency+" "+totalOEMSell.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono text-right text-blue-700 border border-gray-200">{currency+" "+totalAMSell.toFixed(2)}</td>
                  <td className="px-3 py-2 border border-gray-200"/>
                </tr>
              </tfoot>
            </table>
            <div className="text-xs text-gray-400 text-center">This quotation is confidential and intended solely for the named recipient. Prices exclude applicable taxes and duties.</div>
          </div>
        </div>
      )}
    </div>
  );
}
