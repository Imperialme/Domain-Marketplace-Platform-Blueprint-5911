import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Download, RefreshCw, CheckCircle, XCircle, AlertCircle,
  FileSpreadsheet, Users, Building2, FileText, Settings, ExternalLink
} from "lucide-react";

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminExports() {
  const [exportingBuyers, setExportingBuyers] = useState(false);
  const [exportingVendors, setExportingVendors] = useState(false);
  const [exportingRFQs, setExportingRFQs] = useState(false);

  const sheetsConfig = trpc.exports.checkGoogleSheetsConfig.useQuery();

  const exportBuyers = trpc.exports.exportBuyersCSV.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.csv, data.filename);
      toast.success(`Exported ${data.count} buyer records`);
      setExportingBuyers(false);
    },
    onError: (err) => {
      toast.error(`Export failed: ${err.message}`);
      setExportingBuyers(false);
    },
  });

  const exportVendors = trpc.exports.exportVendorsCSV.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.csv, data.filename);
      toast.success(`Exported ${data.count} vendor records`);
      setExportingVendors(false);
    },
    onError: (err) => {
      toast.error(`Export failed: ${err.message}`);
      setExportingVendors(false);
    },
  });

  const exportRFQs = trpc.exports.exportRFQsCSV.useMutation({
    onSuccess: (data) => {
      downloadCSV(data.csv, data.filename);
      toast.success(`Exported ${data.count} RFQ records`);
      setExportingRFQs(false);
    },
    onError: (err) => {
      toast.error(`Export failed: ${err.message}`);
      setExportingRFQs(false);
    },
  });

  const exportCards = [
    {
      title: "Buyer Companies",
      description: "Export all registered companies with status, risk flags, and contact details.",
      icon: <Building2 size={20} className="text-blue-400" />,
      columns: ["Company ID", "Legal Name", "Country", "Industry", "Email", "Role", "Status", "Risk Flag", "Created"],
      loading: exportingBuyers,
      onExport: () => {
        setExportingBuyers(true);
        exportBuyers.mutate();
      },
    },
    {
      title: "Vendor Directory",
      description: "Export all vendors with type, performance scores, and region data.",
      icon: <Users size={20} className="text-emerald-400" />,
      columns: ["Vendor ID", "Alias", "Type", "Industry Focus", "Region", "Status", "Accuracy", "Fulfilment"],
      loading: exportingVendors,
      onExport: () => {
        setExportingVendors(true);
        exportVendors.mutate();
      },
    },
    {
      title: "RFQ Log",
      description: "Export all RFQs with status, priority, value tier, and outcome codes.",
      icon: <FileText size={20} style={{ color: "var(--gold)" }} />,
      columns: ["Reference", "Status", "Priority", "Value Tier", "Timeline", "Outcome", "Created", "Closed"],
      loading: exportingRFQs,
      onExport: () => {
        setExportingRFQs(true);
        exportRFQs.mutate();
      },
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Data Export & Sync</h1>
        <p className="text-slate-500 text-sm">Download CSV snapshots or sync live data to Google Sheets.</p>
      </div>

      {/* CSV Export Section */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Download size={14} /> CSV Export
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exportCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-white/8 p-5 flex flex-col gap-4"
              style={{ background: "var(--navy-800)" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{card.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{card.description}</p>
                </div>
              </div>

              {/* Column preview */}
              <div className="flex flex-wrap gap-1">
                {card.columns.map((col) => (
                  <span key={col} className="text-xs px-1.5 py-0.5 rounded border border-white/8 text-slate-600">
                    {col}
                  </span>
                ))}
              </div>

              <button
                onClick={card.onExport}
                disabled={card.loading}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: card.loading ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.15)",
                  color: "var(--electric-blue)",
                  border: "1px solid rgba(59,130,246,0.3)",
                }}
              >
                {card.loading ? (
                  <><RefreshCw size={14} className="animate-spin" /> Exporting...</>
                ) : (
                  <><Download size={14} /> Download CSV</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Google Sheets Section */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileSpreadsheet size={14} /> Google Sheets Live Sync
        </h2>
        <div className="rounded-xl border border-white/8 p-6" style={{ background: "var(--navy-800)" }}>
          {sheetsConfig.isLoading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <RefreshCw size={14} className="animate-spin" /> Checking configuration...
            </div>
          ) : sheetsConfig.data?.configured ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircle size={16} /> Google Sheets integration is active
              </div>
              <p className="text-slate-500 text-sm">
                Your data is ready to sync to Google Sheets. Use the buttons below to push the latest data.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {["buyers", "vendors", "rfqs"].map((sheet) => (
                  <button
                    key={sheet}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: "rgba(16,185,129,0.1)",
                      color: "#10b981",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                    onClick={() => toast.info(`Syncing ${sheet} to Google Sheets...`)}
                  >
                    <RefreshCw size={13} />
                    Sync {sheet.charAt(0).toUpperCase() + sheet.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white mb-1">Google Sheets not configured</p>
                  <p className="text-xs text-slate-500">
                    To enable live sync, you need to add two secrets to your project: a Google Service Account JSON key and your Spreadsheet ID.
                  </p>
                </div>
              </div>

              {/* Status indicators */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg p-3 border border-white/8"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  {sheetsConfig.data?.hasServiceAccount ? (
                    <CheckCircle size={14} className="text-emerald-400" />
                  ) : (
                    <XCircle size={14} className="text-red-400" />
                  )}
                  <span className="text-xs text-slate-400">Service Account JSON</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg p-3 border border-white/8"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  {sheetsConfig.data?.hasSpreadsheetId ? (
                    <CheckCircle size={14} className="text-emerald-400" />
                  ) : (
                    <XCircle size={14} className="text-red-400" />
                  )}
                  <span className="text-xs text-slate-400">Spreadsheet ID</span>
                </div>
              </div>

              {/* Setup instructions */}
              <div className="rounded-lg p-4 border border-amber-500/20" style={{ background: "rgba(245,158,11,0.05)" }}>
                <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <Settings size={12} /> Setup Instructions
                </p>
                <ol className="space-y-1.5">
                  {sheetsConfig.data?.setupInstructions.map((step, i) => (
                    <li key={i} className="text-xs text-slate-500 leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink size={12} /> Google Cloud Console
                </a>
                <span className="text-slate-700">·</span>
                <a
                  href="https://sheets.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink size={12} /> Google Sheets
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data structure preview */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Google Sheets Structure (when connected)
        </h2>
        <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: "var(--navy-800)" }}>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Sheet Tab</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Data Source</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Columns</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Update Frequency</th>
              </tr>
            </thead>
            <tbody>
              {[
                { tab: "Buyers", source: "companies table", cols: "9 columns", freq: "On demand" },
                { tab: "Vendors", source: "vendors table", cols: "9 columns", freq: "On demand" },
                { tab: "RFQs", source: "rfqs table", cols: "8 columns", freq: "On demand" },
              ].map((row) => (
                <tr key={row.tab} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{row.tab}</td>
                  <td className="px-4 py-3 text-slate-500">{row.source}</td>
                  <td className="px-4 py-3 text-slate-500">{row.cols}</td>
                  <td className="px-4 py-3 text-slate-500">{row.freq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
