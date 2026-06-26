import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function VendorSubmitPrice() {
  const [form, setForm] = useState({
    rfqReference: "",
    partNumber: "",
    description: "",
    qty: 1,
    unitPrice: "",
    currency: "USD",
    condition: "oem" as "oem"|"aftermarket",
    brand: "",
    moq: "",
    availableQty: "",
    leadTimeDays: "",
    stockStatus: "in_stock" as "in_stock"|"on_order"|"available_to_order"|"discontinued",
    region: "",
    notes: "",
  });

  const submitMutation = trpc.vendors.submitQuote.useMutation({
    onSuccess: () => {
      toast.success("Price submitted successfully! Pending admin review.");
      setForm({ rfqReference:"", partNumber:"", description:"", qty:1, unitPrice:"", currency:"USD", condition:"oem", brand:"", moq:"", availableQty:"", leadTimeDays:"", stockStatus:"in_stock", region:"", notes:"" });
    },
    onError: (e:any) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!form.rfqReference||!form.partNumber||!form.unitPrice) { toast.error("RFQ Reference, Part Number and Unit Price are required"); return; }
    submitMutation.mutate({
      rfqReference: form.rfqReference,
      notes: form.notes||undefined,
      lines: [{
        partNumber: form.partNumber,
        description: form.description,
        qty: form.qty,
        unitCostUSD: parseFloat(form.unitPrice),
        condition: form.condition as "oem"|"aftermarket",
        leadTimeDays: form.leadTimeDays?parseInt(form.leadTimeDays):undefined,
      }],
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Submit Price</h1>
        <p className="text-sm text-slate-500">Submit your pricing for a specific RFQ. All submissions are reviewed by our team before use.</p>
      </div>

      <div className="card-premium border border-blue-900/20 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">RFQ Reference *</label>
            <input className="input-dark" value={form.rfqReference} onChange={e=>setForm(f=>({...f,rfqReference:e.target.value}))} placeholder="e.g. RFQ-26-1234"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Part Number *</label>
            <input className="input-dark" value={form.partNumber} onChange={e=>setForm(f=>({...f,partNumber:e.target.value}))} placeholder="e.g. 1392648"/>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
          <input className="input-dark" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Part description"/>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Unit Price *</label>
            <input type="number" className="input-dark" value={form.unitPrice} onChange={e=>setForm(f=>({...f,unitPrice:e.target.value}))} placeholder="0.00" step="0.01"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Currency</label>
            <select className="input-dark" value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}>
              <option value="USD">USD</option><option value="EUR">EUR</option><option value="AED">AED</option><option value="GBP">GBP</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quantity</label>
            <input type="number" className="input-dark" value={form.qty} onChange={e=>setForm(f=>({...f,qty:parseInt(e.target.value)||1}))} min={1}/>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Condition</label>
            <div className="grid grid-cols-2 gap-2">
              {(["oem","aftermarket"] as const).map(c => (
                <button key={c} onClick={() => setForm(f=>({...f,condition:c}))}
                  className={"py-2.5 rounded-xl text-sm font-semibold border transition-all "+(form.condition===c?"bg-blue-600/20 border-blue-500 text-blue-300":"border-slate-700 text-slate-500 hover:border-slate-500 hover:text-white")}>
                  {c==="oem"?"OEM/Genuine":"Aftermarket"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Brand</label>
            <input className="input-dark" value={form.brand} onChange={e=>setForm(f=>({...f,brand:e.target.value}))} placeholder="e.g. Scania, Knorr-Bremse"/>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">MOQ</label>
            <input type="number" className="input-dark" value={form.moq} onChange={e=>setForm(f=>({...f,moq:e.target.value}))} placeholder="1"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Qty</label>
            <input type="number" className="input-dark" value={form.availableQty} onChange={e=>setForm(f=>({...f,availableQty:e.target.value}))} placeholder="0"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Lead Time (days)</label>
            <input type="number" className="input-dark" value={form.leadTimeDays} onChange={e=>setForm(f=>({...f,leadTimeDays:e.target.value}))} placeholder="7"/>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stock Status</label>
            <select className="input-dark" value={form.stockStatus} onChange={e=>setForm(f=>({...f,stockStatus:e.target.value as any}))}>
              <option value="in_stock">In Stock</option>
              <option value="on_order">On Order</option>
              <option value="available_to_order">Available to Order</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Region / Origin</label>
            <input className="input-dark" value={form.region} onChange={e=>setForm(f=>({...f,region:e.target.value}))} placeholder="e.g. DE, EU, AE"/>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</label>
          <textarea className="input-dark resize-none h-16" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any additional information..."/>
        </div>

        <button onClick={handleSubmit} disabled={!form.rfqReference||!form.partNumber||!form.unitPrice||submitMutation.isPending}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
          <Send className="w-4 h-4"/>{submitMutation.isPending?"Submitting...":"Submit Price"}
        </button>
      </div>
    </div>
  );
}
