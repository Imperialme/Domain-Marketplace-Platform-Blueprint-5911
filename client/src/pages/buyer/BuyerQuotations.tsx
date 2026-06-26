import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { FileCheck, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

function downloadBase64(base64: string, filename: string, mimeType: string) {
  const byteChars = atob(base64);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
  const blob = new Blob([byteArr], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function QuotationCard({ q }: { q: any }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [xlsxLoading, setXlsxLoading] = useState(false);

  const exportPDF = trpc.quotations.exportPDF.useMutation({
    onSuccess: (data) => {
      downloadBase64(data.base64, data.filename, data.mimeType);
      toast.success("PDF downloaded");
      setPdfLoading(false);
    },
    onError: (e) => {
      toast.error("PDF export failed: " + e.message);
      setPdfLoading(false);
    },
  });

  const exportExcel = trpc.quotations.exportExcel.useMutation({
    onSuccess: (data) => {
      downloadBase64(data.base64, data.filename, data.mimeType);
      toast.success("Excel downloaded");
      setXlsxLoading(false);
    },
    onError: (e) => {
      toast.error("Excel export failed: " + e.message);
      setXlsxLoading(false);
    },
  });

  const totalOem = q.finalBuyerPriceOem ? Number(q.finalBuyerPriceOem) : null;
  const totalAm = q.finalBuyerPriceAm ? Number(q.finalBuyerPriceAm) : null;

  return (
    <div className="card-premium border border-blue-900/20 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-mono text-sm text-blue-400">Q-{String(q.id).padStart(4, "0")}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            Issued {q.issuedAt ? new Date(q.issuedAt).toLocaleDateString() : new Date(q.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium capitalize">
            {q.status}
          </span>
          <button
            onClick={() => { setPdfLoading(true); exportPDF.mutate({ id: q.id }); }}
            disabled={pdfLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 disabled:opacity-50 transition-colors"
          >
            {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            PDF
          </button>
          <button
            onClick={() => { setXlsxLoading(true); exportExcel.mutate({ id: q.id }); }}
            disabled={xlsxLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
          >
            {xlsxLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
            Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">Currency</div>
          <div className="text-sm font-semibold text-white">{q.currency || "USD"}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">OEM Total</div>
          <div className="text-sm font-semibold text-white">
            {totalOem ? `${q.currency || "USD"} ${totalOem.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">AM Total</div>
          <div className="text-sm font-semibold text-emerald-400">
            {totalAm ? `${q.currency || "USD"} ${totalAm.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">Valid For</div>
          <div className="text-sm font-semibold text-white">{q.validityDays || 30} days</div>
        </div>
      </div>

      {q.leadTimeDays && (
        <div className="mt-3 text-xs text-slate-500">
          Lead time: <span className="text-slate-300 font-medium">{q.leadTimeDays} days</span>
        </div>
      )}
    </div>
  );
}

export default function BuyerQuotations() {
  const { data: quotations, isLoading } = trpc.quotations.myQuotations.useQuery();
  const quotationList = Array.isArray(quotations) ? quotations : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Quotations</h1>
        <p className="text-sm text-slate-500">
          Quotations issued for your RFQs. Download as PDF or Excel for your records.
        </p>
      </div>

      {isLoading ? (
        <div className="card-premium border border-blue-900/20 p-10 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading quotations...</p>
        </div>
      ) : quotationList.length > 0 ? (
        <div className="space-y-4">
          {quotationList.map((q: any) => (
            <QuotationCard key={q.id} q={q} />
          ))}
        </div>
      ) : (
        <div className="card-premium border border-blue-900/20 p-10 text-center">
          <FileCheck className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No quotations yet. Submit an RFQ to get started.</p>
        </div>
      )}
    </div>
  );
}
