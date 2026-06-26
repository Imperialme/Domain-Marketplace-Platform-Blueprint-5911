import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Shield, AlertCircle } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";

export default function AdminAuditLog() {
  const [filter, setFilter] = useState("all");
  const { data: logs } = trpc.audit.list.useQuery({ limit: 500, entityType: filter === "all" ? undefined : filter as any });
  const logList: any[] = Array.isArray(logs) ? logs : [];

  const entityTypes = ["all", "rfq", "company", "vendor", "part", "quotation", "fee", "margin_rule", "ai_query"];

  const columns: Column<any>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      render: (l) => <span className="text-slate-500 text-xs whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</span>,
      exportValue: (l) => new Date(l.timestamp).toLocaleString(),
    },
    {
      key: "actionType",
      header: "Action",
      render: (l) => <span className="font-mono text-blue-400 text-xs">{l.actionType}</span>,
      exportValue: (l) => l.actionType,
    },
    {
      key: "entityType",
      header: "Entity",
      render: (l) => <span className="badge-gray text-xs capitalize">{l.entityType}</span>,
      exportValue: (l) => l.entityType,
    },
    {
      key: "entityId",
      header: "Entity ID",
      render: (l) => <span className="font-mono text-slate-400 text-xs">{l.entityId || "-"}</span>,
      exportValue: (l) => l.entityId || "",
    },
    {
      key: "actorRole",
      header: "Actor",
      render: (l) => <span className="text-slate-400 text-xs">{l.actorRole || "system"}</span>,
      exportValue: (l) => l.actorRole || "system",
    },
    {
      key: "isError",
      header: "Error",
      render: (l) => l.isError ? <AlertCircle className="w-4 h-4 text-red-400" /> : null,
      exportValue: (l) => l.isError ? "Yes" : "No",
    },
    {
      key: "notes",
      header: "Notes",
      render: (l) => <span className="text-slate-500 text-xs max-w-xs truncate block">{l.notes || "-"}</span>,
      exportValue: (l) => l.notes || "",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Audit Log</h1>
        <p className="text-sm text-slate-500">Complete immutable record of all platform actions, errors, and AI queries.</p>
      </div>

      <div className="flex gap-1 flex-wrap">
        {entityTypes.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={
              "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all " +
              (filter === t ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white")
            }
          >
            {t.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="card-premium border border-blue-900/20 p-4">
        {logList.length === 0 ? (
          <div className="py-16 text-center">
            <Shield className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-600">No audit entries yet.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={logList}
            filename="audit-log"
            rowKey={(l) => l.id}
            emptyMessage="No audit entries found."
          />
        )}
      </div>
    </div>
  );
}
