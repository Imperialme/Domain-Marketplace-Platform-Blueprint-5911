import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle, Brain, RefreshCw, Download, Shield, TrendingUp, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

export default function AdminAuditDashboard() {
  const [selectedError, setSelectedError] = useState<{
    errorType: string; errorMessage: string; route?: string; count?: number;
  } | null>(null);
  const [fixNotes, setFixNotes] = useState("");
  const [resolvingType, setResolvingType] = useState<string | null>(null);

  const { data: patterns, isLoading: patternsLoading, refetch: refetchPatterns } = trpc.selfAudit.getErrorPatterns.useQuery();
  const { data: errorLog, isLoading: logLoading } = trpc.selfAudit.getErrorLog.useQuery({ limit: 30, errorOnly: true });
  const { data: resolutions } = trpc.selfAudit.getResolutionHistory.useQuery();
  const { data: csvData } = trpc.selfAudit.exportAuditCSV.useQuery({ errorsOnly: false, days: 30 });

  const getAIFix = trpc.selfAudit.getAIFixSuggestion.useMutation();
  const markResolved = trpc.selfAudit.markResolved.useMutation({
    onSuccess: () => {
      toast.success("Error pattern marked as resolved");
      setResolvingType(null);
      setFixNotes("");
      refetchPatterns();
    },
  });

  const handleGetAIFix = (pattern: { errorType: string; lastMessage: string; lastRoute: string; count: number }) => {
    setSelectedError({ errorType: pattern.errorType, errorMessage: pattern.lastMessage, route: pattern.lastRoute, count: pattern.count });
    getAIFix.mutate({
      errorType: pattern.errorType,
      errorMessage: pattern.lastMessage,
      route: pattern.lastRoute,
      occurrenceCount: pattern.count,
    });
  };

  const downloadCSV = () => {
    if (!csvData?.csv) return;
    const blob = new Blob([csvData.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const severityColor = (s: string) =>
    s === "critical" ? "text-red-400 bg-red-500/10 border-red-500/30" :
    s === "warning" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" :
    "text-blue-400 bg-blue-500/10 border-blue-500/30";

  const severityDot = (s: string) =>
    s === "critical" ? "bg-red-500 animate-pulse" :
    s === "warning" ? "bg-yellow-500" : "bg-blue-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Self-Audit Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time error detection, pattern analysis, and AI-powered fix suggestions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetchPatterns()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Patterns (7d)", value: patterns?.length || 0, icon: <AlertTriangle size={18} />, color: "text-yellow-400" },
          { label: "Critical Issues", value: patterns?.filter(p => p.severity === "critical").length || 0, icon: <Zap size={18} />, color: "text-red-400" },
          { label: "Resolved (all time)", value: resolutions?.length || 0, icon: <CheckCircle size={18} />, color: "text-emerald-400" },
          { label: "AI Analyses Run", value: resolutions?.filter(r => r.actionType === "ai_fix_analysis").length || 0, icon: <Brain size={18} />, color: "text-purple-400" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl p-4 border border-white/8" style={{ background: "var(--navy-800)" }}>
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Error Patterns */}
        <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: "var(--navy-800)" }}>
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-yellow-400" />
              <h2 className="text-sm font-semibold text-white">Error Patterns (Last 7 Days)</h2>
            </div>
            <span className="text-xs text-slate-500">{patterns?.length || 0} patterns</span>
          </div>
          <div className="divide-y divide-white/5">
            {patternsLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading patterns...</div>
            ) : patterns?.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-emerald-400 font-medium">No error patterns detected</p>
                <p className="text-xs text-slate-500 mt-1">System is running cleanly</p>
              </div>
            ) : patterns?.map((pattern, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityDot(pattern.severity)}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white truncate">{pattern.errorType}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${severityColor(pattern.severity)}`}>
                          {pattern.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{pattern.lastMessage}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-600">
                          <Clock size={10} className="inline mr-1" />
                          {pattern.lastSeen ? new Date(pattern.lastSeen).toLocaleString() : "—"}
                        </span>
                        <span className="text-xs font-semibold text-yellow-400">{pattern.count}× occurrences</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleGetAIFix({ errorType: pattern.errorType, lastMessage: pattern.lastMessage || "", lastRoute: pattern.lastRoute || "", count: pattern.count })}
                      disabled={getAIFix.isPending}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all disabled:opacity-50"
                    >
                      <Brain size={12} />
                      AI Fix
                    </button>
                    <button
                      onClick={() => setResolvingType(pattern.errorType)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all"
                    >
                      <CheckCircle size={12} />
                      Resolve
                    </button>
                  </div>
                </div>
                {/* Resolve form */}
                {resolvingType === pattern.errorType && (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/20">
                    <p className="text-xs text-emerald-300 mb-2">Describe the fix applied (feeds self-improving knowledge base):</p>
                    <textarea
                      value={fixNotes}
                      onChange={e => setFixNotes(e.target.value)}
                      rows={2}
                      className="w-full text-xs bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 resize-none"
                      placeholder="e.g. Fixed missing comma in rfqs.ts line 203, added proper closing bracket..."
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => markResolved.mutate({ errorType: pattern.errorType, fixNotes })}
                        disabled={!fixNotes.trim() || markResolved.isPending}
                        className="px-3 py-1.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-all"
                      >
                        Save Resolution
                      </button>
                      <button onClick={() => setResolvingType(null)} className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Fix Panel */}
        <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: "var(--navy-800)" }}>
          <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2">
            <Brain size={16} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-white">AI Fix Suggestions</h2>
            {getAIFix.isPending && (
              <div className="ml-auto flex items-center gap-1.5 text-xs text-purple-300">
                <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                Analysing...
              </div>
            )}
          </div>
          <div className="p-5">
            {!selectedError && !getAIFix.data && !getAIFix.isPending ? (
              <div className="text-center py-8">
                <Brain size={40} className="text-purple-400/30 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Click "AI Fix" on any error pattern</p>
                <p className="text-xs text-slate-600 mt-1">Claude AI will analyse the error and suggest a fix</p>
              </div>
            ) : getAIFix.isPending ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${70 + i * 10}%` }} />
                ))}
              </div>
            ) : getAIFix.data ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-900/20 border border-purple-500/20">
                  <Shield size={14} className="text-purple-400 flex-shrink-0" />
                  <span className="text-xs text-purple-300 font-medium">Analysis for: {getAIFix.data.errorType}</span>
                </div>
                <div className="prose prose-sm prose-invert max-w-none">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-black/20 rounded-lg p-4 border border-white/5">
                    {getAIFix.data.suggestion}
                  </pre>
                </div>
                <button
                  onClick={() => setResolvingType(getAIFix.data!.errorType)}
                  className="w-full py-2 rounded-lg text-sm bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all"
                >
                  Mark as Resolved
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Recent Error Log */}
      <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: "var(--navy-800)" }}>
        <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-white">Recent Error Log</h2>
          <span className="ml-auto text-xs text-slate-500">Last 30 entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {["Timestamp", "Error Type", "Route", "Message", "Actor"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : errorLog?.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No errors logged</td></tr>
              ) : errorLog?.map((entry, i) => (
                <tr key={i} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-red-400 font-medium">{entry.actionType?.replace("error:", "") || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 max-w-[120px] truncate">{entry.entityId || "—"}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">{entry.notes || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{entry.actorId || "system"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Knowledge Base */}
      {resolutions && resolutions.length > 0 && (
        <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: "var(--navy-800)" }}>
          <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Self-Improving Knowledge Base</h2>
            <span className="ml-auto text-xs text-slate-500">{resolutions.length} resolved patterns</span>
          </div>
          <div className="divide-y divide-white/5">
            {resolutions.slice(0, 10).map((r, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={12} className="text-emerald-400" />
                  <span className="text-xs font-medium text-white">{r.entityId}</span>
                  <span className="text-xs text-slate-600 ml-auto">
                    {r.timestamp ? new Date(r.timestamp).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="text-xs text-slate-400 pl-5">
                  {(r.afterStateJson as any)?.fixNotes || r.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
