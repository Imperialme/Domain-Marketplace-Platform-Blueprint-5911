import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, Plus, Building2, Copy } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";

const EMPTY_FORM = {
  internalAlias: "",
  vendorType: "distributor" as "distributor" | "supplier" | "dealer",
  region: "",
  industryFocus: "",
  internalNotes: "",
  inviteEmail: "",
};

export default function AdminDirectories() {
  const [tab, setTab] = useState<"companies" | "vendors">("companies");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState(EMPTY_FORM);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const { data: companies } = trpc.companies.list.useQuery({ limit: 500 });
  const { data: vendors } = trpc.vendors.list.useQuery({ limit: 500 });
  const companyList: any[] = Array.isArray(companies) ? companies : [];
  const vendorList: any[] = Array.isArray(vendors) ? vendors : [];
  const utils = trpc.useUtils();

  const inviteMutation = trpc.vendors.invite.useMutation({
    onSuccess: (data) => {
      toast.success("Vendor invite link generated");
      setInviteUrl(data.inviteUrl);
      utils.vendors.list.invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const closeInvite = () => {
    setShowInvite(false);
    setInviteUrl(null);
    setInviteForm(EMPTY_FORM);
  };

  const riskColors: Record<string, string> = {
    green: "badge-green",
    yellow: "badge-yellow",
    red: "badge-red",
  };
  const statusColors: Record<string, string> = {
    approved: "badge-green",
    pending: "badge-yellow",
    rejected: "badge-red",
    active: "badge-green",
    inactive: "badge-gray",
    suspended: "badge-red",
  };

  const companyColumns: Column<any>[] = [
    {
      key: "companyId",
      header: "Company ID",
      render: (c) => <span className="font-mono text-blue-400 text-xs">{c.companyId || "-"}</span>,
      exportValue: (c) => c.companyId || "",
    },
    {
      key: "legalName",
      header: "Legal Name",
      render: (c) => <span className="font-semibold text-white text-sm">{c.legalName}</span>,
      exportValue: (c) => c.legalName,
    },
    { key: "country", header: "Country", exportValue: (c) => c.country || "" },
    { key: "industry", header: "Industry", exportValue: (c) => c.industry || "" },
    { key: "businessEmail", header: "Email", exportValue: (c) => c.businessEmail || "" },
    {
      key: "status",
      header: "Status",
      render: (c) => <span className={statusColors[c.status] || "badge-gray"}>{c.status}</span>,
      exportValue: (c) => c.status,
    },
    {
      key: "riskFlag",
      header: "Risk",
      render: (c) =>
        c.riskFlag ? (
          <span className={riskColors[c.riskFlag] || "badge-gray"}>{c.riskFlag}</span>
        ) : (
          <span className="text-slate-600 text-xs">-</span>
        ),
      exportValue: (c) => c.riskFlag || "",
    },
  ];

  const vendorColumns: Column<any>[] = [
    {
      key: "vendorId",
      header: "Vendor ID",
      render: (v) => <span className="font-mono text-blue-400 text-xs">{v.vendorId || "-"}</span>,
      exportValue: (v) => v.vendorId || "",
    },
    {
      key: "internalAlias",
      header: "Alias",
      render: (v) => <span className="font-semibold text-white text-sm">{v.internalAlias}</span>,
      exportValue: (v) => v.internalAlias,
    },
    {
      key: "vendorType",
      header: "Type",
      render: (v) => <span className="badge-blue capitalize">{v.vendorType}</span>,
      exportValue: (v) => v.vendorType,
    },
    { key: "region", header: "Region", exportValue: (v) => v.region || "" },
    { key: "industryFocus", header: "Industry", exportValue: (v) => v.industryFocus || "" },
    {
      key: "status",
      header: "Status",
      render: (v) => <span className={statusColors[v.status] || "badge-gray"}>{v.status}</span>,
      exportValue: (v) => v.status,
    },
    {
      key: "createdAt",
      header: "Invited",
      render: (v) => <span className="text-slate-500 text-xs">{new Date(v.createdAt).toLocaleDateString()}</span>,
      exportValue: (v) => new Date(v.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Directories</h1>
          <p className="text-sm text-slate-500">Manage approved companies and vendors.</p>
        </div>
        {tab === "vendors" && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Invite Vendor
          </button>
        )}
      </div>

      <div className="flex gap-1 p-1 bg-navy-card rounded-xl border border-slate-800/50 w-fit">
        {(["companies", "vendors"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all " +
              (tab === t ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "companies" && (
        <div className="card-premium border border-blue-900/20 p-4">
          {companyList.length === 0 ? (
            <div className="py-16 text-center">
              <Building2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-600">No companies yet.</p>
            </div>
          ) : (
            <DataTable
              columns={companyColumns}
              data={companyList}
              filename="companies-directory"
              rowKey={(c) => c.id}
              emptyMessage="No companies found."
            />
          )}
        </div>
      )}

      {tab === "vendors" && (
        <div className="card-premium border border-blue-900/20 p-4">
          {vendorList.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-600">No vendors yet. Invite your first vendor.</p>
            </div>
          ) : (
            <DataTable
              columns={vendorColumns}
              data={vendorList}
              filename="vendors-directory"
              rowKey={(v) => v.id}
              emptyMessage="No vendors found."
            />
          )}
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card-premium border border-blue-900/30 p-6 w-full max-w-md">
            <h2 className="font-display text-lg font-bold text-white mb-5">Invite Vendor</h2>

            {inviteUrl ? (
              /* Step 2: Show the generated invite link */
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <p className="text-xs text-emerald-400 font-semibold mb-1">Invite link generated!</p>
                  <p className="text-xs text-slate-400 mb-3">
                    {inviteForm.inviteEmail
                      ? `An invite email has been sent to ${inviteForm.inviteEmail}. You can also share this link directly:`
                      : "Share this link with the vendor to let them activate their account:"}
                  </p>
                  <div className="bg-black/30 rounded-lg p-2.5 font-mono text-xs text-blue-300 break-all select-all leading-relaxed">
                    {inviteUrl}
                  </div>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(inviteUrl); toast.success("Link copied to clipboard!"); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copy Invite Link
                </button>
                <button
                  onClick={closeInvite}
                  className="w-full py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Step 1: Fill in vendor details */
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Internal Alias *
                    </label>
                    <input
                      className="w-full input-dark"
                      value={inviteForm.internalAlias}
                      onChange={(e) => setInviteForm((f) => ({ ...f, internalAlias: e.target.value }))}
                      placeholder="e.g. Scania DE Distributor"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Vendor Type *
                    </label>
                    <select
                      className="w-full input-dark"
                      value={inviteForm.vendorType}
                      onChange={(e) => setInviteForm((f) => ({ ...f, vendorType: e.target.value as any }))}
                    >
                      <option value="distributor">Distributor</option>
                      <option value="dealer">Dealer</option>
                      <option value="supplier">Trusted Supplier</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Region
                      </label>
                      <input
                        className="w-full input-dark"
                        value={inviteForm.region}
                        onChange={(e) => setInviteForm((f) => ({ ...f, region: e.target.value }))}
                        placeholder="e.g. DE, AE, EU"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Industry Focus
                      </label>
                      <input
                        className="w-full input-dark"
                        value={inviteForm.industryFocus}
                        onChange={(e) => setInviteForm((f) => ({ ...f, industryFocus: e.target.value }))}
                        placeholder="e.g. Heavy Trucks"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Internal Notes
                    </label>
                    <textarea
                      className="w-full input-dark resize-none h-16 text-sm"
                      value={inviteForm.internalNotes}
                      onChange={(e) => setInviteForm((f) => ({ ...f, internalNotes: e.target.value }))}
                      placeholder="Notes about this vendor..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Vendor Email <span className="text-slate-600 normal-case font-normal">(optional — sends invite email)</span>
                    </label>
                    <input
                      className="w-full input-dark"
                      type="email"
                      value={inviteForm.inviteEmail}
                      onChange={(e) => setInviteForm((f) => ({ ...f, inviteEmail: e.target.value }))}
                      placeholder="vendor@company.com"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={closeInvite}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => inviteMutation.mutate({
                      ...inviteForm,
                      inviteEmail: inviteForm.inviteEmail || undefined,
                      origin: window.location.origin,
                    })}
                    disabled={!inviteForm.internalAlias || inviteMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-60"
                  >
                    {inviteMutation.isPending ? "Generating..." : "Generate Invite Link"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
