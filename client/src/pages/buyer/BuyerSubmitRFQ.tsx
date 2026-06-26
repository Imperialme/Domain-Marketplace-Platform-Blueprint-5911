import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Upload, FileText, X } from "lucide-react";

export default function BuyerSubmitRFQ() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "standard" as "standard"|"priority",
    timelineTier: "0_14_days" as "0_14_days"|"15_30_days"|"budgeting",
    estimatedValueTier: "5k_20k" as "5k_20k"|"20k_100k"|"100k_plus",
    equipmentType: "",
    fleetSize: "",
    additionalNotes: "",
  });
  const [file, setFile] = useState<File|null>(null);
  const [uploading, setUploading] = useState(false);

  const submitMutation = trpc.rfqs.submit.useMutation({
    onSuccess: (d:any) => {
      toast.success("RFQ submitted! Reference: "+d.referenceNumber);
      navigate("/buyer/references");
    },
    onError: (e:any) => toast.error(e.message),
  });

  const uploadFile = trpc.rfqs.uploadItemFile.useMutation();

  const handleSubmit = async () => {
    if (!form.subject) { toast.error("Subject is required"); return; }
    let fileUrl: string|undefined;
    let fileName: string|undefined;
    if (file) {
      setUploading(true);
      try {
        const reader = new FileReader();
        const b64 = await new Promise<string>((res,rej) => {
          reader.onload = () => res((reader.result as string).split(",")[1]);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });
        const result = await uploadFile.mutateAsync({ fileName: file.name, fileBase64: b64, mimeType: file.type });
        fileUrl = result.fileUrl;
        fileName = result.fileName;
      } catch(e:any) { toast.error("File upload failed: "+e.message); setUploading(false); return; }
      setUploading(false);
    }
    submitMutation.mutate({ ...form, itemListFileUrl: fileUrl, itemListFileName: fileName });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Submit RFQ</h1>
        <p className="text-sm text-slate-500">Submit a new Request for Quotation. Your reference number will be generated automatically.</p>
      </div>

      <div className="card-premium border border-blue-900/20 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject / Title *</label>
          <input className="input-dark" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} placeholder="e.g. Scania P380 Engine Parts — 24 Lines"/>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
          <textarea className="input-dark resize-none h-24" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe your parts requirement..."/>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
            <div className="grid grid-cols-2 gap-2">
              {(["standard","priority"] as const).map(p => (
                <button key={p} onClick={() => setForm(f=>({...f,priority:p}))}
                  className={"py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize "+(form.priority===p?"bg-blue-600/20 border-blue-500 text-blue-300":"border-slate-700 text-slate-500 hover:border-slate-500 hover:text-white")}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Timeline</label>
            <select className="input-dark" value={form.timelineTier} onChange={e=>setForm(f=>({...f,timelineTier:e.target.value as any}))}>
              <option value="0_14_days">0–14 Days</option>
              <option value="15_30_days">15–30 Days</option>
              <option value="budgeting">Budgeting / Planning</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Estimated Value</label>
            <select className="input-dark" value={form.estimatedValueTier} onChange={e=>setForm(f=>({...f,estimatedValueTier:e.target.value as any}))}>
              <option value="5k_20k">$5,000 – $20,000</option>
              <option value="20k_100k">$20,000 – $100,000</option>
              <option value="100k_plus">Above $100,000</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Equipment Type</label>
            <input className="input-dark" value={form.equipmentType} onChange={e=>setForm(f=>({...f,equipmentType:e.target.value}))} placeholder="e.g. Heavy Trucks, Mining Equipment"/>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Item List (Excel/PDF)</label>
          {file ? (
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <FileText className="w-5 h-5 text-blue-400 flex-shrink-0"/>
              <span className="text-sm text-blue-300 flex-1 truncate">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-slate-500 hover:text-red-400"><X className="w-4 h-4"/></button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
              <Upload className="w-8 h-8 text-slate-600 mb-2"/>
              <span className="text-sm text-slate-500">Click to upload item list</span>
              <span className="text-xs text-slate-600 mt-1">Excel, PDF, CSV — max 10MB</span>
              <input type="file" className="hidden" accept=".xlsx,.xls,.pdf,.csv" onChange={e=>setFile(e.target.files?.[0]||null)}/>
            </label>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Additional Notes</label>
          <textarea className="input-dark resize-none h-16" value={form.additionalNotes} onChange={e=>setForm(f=>({...f,additionalNotes:e.target.value}))} placeholder="Any special requirements, preferred brands, etc."/>
        </div>

        <div className="pt-2">
          <button onClick={handleSubmit} disabled={!form.subject||submitMutation.isPending||uploading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-60 transition-all">
            {uploading?"Uploading file...":submitMutation.isPending?"Submitting...":"Submit RFQ"}
          </button>
          <p className="text-xs text-slate-600 text-center mt-2">A reference number (RFQ-26-XXXX) will be generated automatically upon submission.</p>
        </div>
      </div>
    </div>
  );
}
