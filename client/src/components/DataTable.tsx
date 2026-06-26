/**
 * DataTable — Reusable table with:
 * - Rows-per-page selector (20 / 50 / 100)
 * - CSV download
 * - Excel (.xlsx) download
 * - Copy all rows to clipboard (tab-separated)
 * - Client-side pagination
 */
import { useState, useCallback } from "react";
import { Download, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  /** Value used for export (plain string). Defaults to (row as any)[key] */
  exportValue?: (row: T) => string | number;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  filename?: string;
  rowKey?: (row: T) => string | number;
  emptyMessage?: string;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

export function DataTable<T>({
  columns,
  data,
  filename = "export",
  rowKey,
  emptyMessage = "No data available.",
  className = "",
}: DataTableProps<T>) {
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState(0);
  const [copied, setCopied] = useState(false);

  const totalPages = Math.ceil(data.length / pageSize);
  const pageData = data.slice(page * pageSize, (page + 1) * pageSize);

  // ── Export helpers ──────────────────────────────────────────────────────────

  function getExportRows(): Array<Record<string, string | number>> {
    return data.map(row => {
      const obj: Record<string, string | number> = {};
      for (const col of columns) {
        const val = col.exportValue
          ? col.exportValue(row)
          : String((row as Record<string, unknown>)[col.key] ?? "");
        obj[col.header] = val;
      }
      return obj;
    });
  }

  function downloadCSV() {
    const rows = getExportRows();
    const headers = columns.map(c => c.header);
    const lines = [
      headers.join(","),
      ...rows.map(r =>
        headers.map(h => {
          const v = String(r[h] ?? "");
          return v.includes(",") || v.includes('"') || v.includes("\n")
            ? `"${v.replace(/"/g, '""')}"`
            : v;
        }).join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadExcel() {
    const rows = getExportRows();
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  const copyToClipboard = useCallback(async () => {
    const rows = getExportRows();
    const headers = columns.map(c => c.header).join("\t");
    const lines = rows.map(r => columns.map(c => String(r[c.header] ?? "")).join("\t"));
    const text = [headers, ...lines].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [data, columns]);

  // ── Pagination ──────────────────────────────────────────────────────────────

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(0);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Rows per page */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Rows per page:</span>
          <div className="flex gap-1">
            {PAGE_SIZE_OPTIONS.map(size => (
              <button
                key={size}
                onClick={() => handlePageSizeChange(size)}
                className={`px-2.5 py-1 rounded border text-xs font-medium transition-all ${
                  pageSize === size
                    ? "bg-blue-600/20 border-blue-500 text-blue-300"
                    : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <span className="text-slate-600 ml-2">
            {data.length} total
          </span>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-700 text-xs text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-all"
            title="Copy all rows to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-700 text-xs text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-all"
            title="Download as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            onClick={downloadExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-green-800/50 text-xs text-green-400/70 hover:border-green-600/50 hover:text-green-300 transition-all"
            title="Download as Excel"
          >
            <Download className="w-3.5 h-3.5" />
            Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-blue-900/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-blue-900/20 bg-navy-light">
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-600 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => (
                <tr
                  key={rowKey ? rowKey(row) : i}
                  className="border-b border-blue-900/10 hover:bg-blue-500/5 transition-colors"
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-slate-300 text-xs">
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded border border-slate-700 disabled:opacity-30 hover:border-slate-500 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pageNum = totalPages <= 7 ? i : Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 rounded border text-xs font-medium transition-all ${
                    pageNum === page
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1.5 rounded border border-slate-700 disabled:opacity-30 hover:border-slate-500 transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
