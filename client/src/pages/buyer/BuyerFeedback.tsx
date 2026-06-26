import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MessageSquare, Star } from "lucide-react";

export default function BuyerFeedback() {
  const [form, setForm] = useState({ rfqReference:"", overallRating:5, responseTime:5, quotationQuality:5, comments:"" });
  const utils = trpc.useUtils();

  const submitMutation = trpc.rfqs.submitFeedback.useMutation({
    onSuccess: () => { toast.success("Feedback submitted. Thank you!"); setForm({ rfqReference:"", overallRating:5, responseTime:5, quotationQuality:5, comments:"" }); },
    onError: (e:any) => toast.error(e.message),
  });

  const StarRating = ({ value, onChange }: { value:number, onChange:(v:number)=>void }) => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} onClick={() => onChange(s)} className={"text-xl transition-all "+(s<=value?"text-amber-400":"text-slate-700")}>★</button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Feedback</h1>
        <p className="text-sm text-slate-500">Share your experience to help us improve our service.</p>
      </div>

      <div className="card-premium border border-blue-900/20 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">RFQ Reference</label>
          <input className="input-dark" value={form.rfqReference} onChange={e=>setForm(f=>({...f,rfqReference:e.target.value}))} placeholder="e.g. RFQ-26-1234"/>
        </div>

        {[
          { label:"Overall Experience", key:"overallRating" },
          { label:"Response Time", key:"responseTime" },
          { label:"Quotation Quality", key:"quotationQuality" },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
            <StarRating value={(form as any)[key]} onChange={v=>setForm(f=>({...f,[key]:v}))}/>
          </div>
        ))}

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Comments</label>
          <textarea className="input-dark resize-none h-24" value={form.comments} onChange={e=>setForm(f=>({...f,comments:e.target.value}))} placeholder="Tell us about your experience..."/>
        </div>

        <button onClick={() => submitMutation.mutate(form)} disabled={!form.rfqReference||!form.comments||submitMutation.isPending}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-60">
          {submitMutation.isPending?"Submitting...":"Submit Feedback"}
        </button>
      </div>
    </div>
  );
}
