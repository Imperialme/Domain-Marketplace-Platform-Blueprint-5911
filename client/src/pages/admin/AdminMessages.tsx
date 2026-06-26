import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";

export default function AdminMessages() {
  const [form, setForm] = useState({ entityType:"rfq" as "rfq"|"company"|"vendor", entityId:"", contextTag:"", body:"" });
  const utils = trpc.useUtils();

  const { data: messages } = trpc.audit.messages.useQuery({ limit:50 });
  const msgList = Array.isArray(messages) ? messages : [];

  const sendMutation = trpc.audit.sendMessage.useMutation({
    onSuccess: () => { toast.success("Message sent"); setForm(f=>({...f,body:""})); utils.audit.messages.invalidate(); },
    onError: (e:any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Desk Messages</h1>
        <p className="text-sm text-slate-500">Internal structured messages tagged by entity and context.</p>
      </div>

      <div className="card-premium border border-blue-900/20 p-5">
        <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4">New Message</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Entity Type</label>
            <select className="w-full input-dark" value={form.entityType} onChange={e=>setForm(f=>({...f,entityType:e.target.value as any}))}>
              <option value="rfq">RFQ</option><option value="company">Company</option><option value="vendor">Vendor</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Entity ID</label>
            <input className="w-full input-dark" value={form.entityId} onChange={e=>setForm(f=>({...f,entityId:e.target.value}))} placeholder="e.g. RFQ-26-1234"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Context Tag</label>
            <input className="w-full input-dark" value={form.contextTag} onChange={e=>setForm(f=>({...f,contextTag:e.target.value}))} placeholder="e.g. fee-follow-up"/>
          </div>
        </div>
        <div className="flex gap-3">
          <textarea className="flex-1 input-dark resize-none h-20 text-sm" value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="Message body..."/>
          <button onClick={() => sendMutation.mutate(form)} disabled={!form.body||!form.entityId||sendMutation.isPending}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-60 self-end">
            <Send className="w-4 h-4"/>Send
          </button>
        </div>
      </div>

      <div className="card-premium border border-blue-900/20 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">Message Log</h2>
        </div>
        <div className="divide-y divide-slate-800/50">
          {msgList.length > 0 ? msgList.map((m:any,i:number) => (
            <div key={i} className="px-5 py-4 hover:bg-blue-900/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-blue text-xs">{m.entityType}</span>
                <span className="font-mono text-xs text-blue-400">{m.entityId}</span>
                {m.contextTag && <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-lg">{m.contextTag}</span>}
                <span className="text-xs text-slate-600 ml-auto">{new Date(m.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-300">{m.notes}</p>
            </div>
          )) : (
            <div className="px-5 py-10 text-center">
              <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2"/>
              <p className="text-sm text-slate-600">No messages yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
