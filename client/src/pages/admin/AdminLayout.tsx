import { useState, useEffect } from "react";
import { Link, Route, Switch, useLocation, Redirect } from "wouter";
import {
  LayoutDashboard, Users, Building2, Package, FileText,
  MessageSquare, DollarSign, Settings, BarChart3, Shield,
  LogOut, Menu, X, Brain, ClipboardList, PenLine
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminOverview from "./AdminOverview";
import AdminOnboarding from "./AdminOnboarding";
import AdminDirectories from "./AdminDirectories";
import AdminRFQs from "./AdminRFQs";
import AdminPartsDNA from "./AdminPartsDNA";
import AdminQuotationBuilder from "./AdminQuotationBuilder";
import AdminFees from "./AdminFees";
import AdminMessages from "./AdminMessages";
import AdminMarginRules from "./AdminMarginRules";
import AdminAuditLog from "./AdminAuditLog";
import AdminAuditDashboard from "./AdminAuditDashboard";
import AdminExports from "./AdminExports";
import AdminBlogCMS from "./AdminBlogCMS";

const navItems = [
  { path: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { path: "/admin/onboarding", label: "Onboarding Gate", icon: Users },
  { path: "/admin/directories", label: "Directories", icon: Building2 },
  { path: "/admin/rfqs", label: "RFQ Queue", icon: FileText },
  { path: "/admin/parts", label: "Parts DNA", icon: Package },
  { path: "/admin/quotations", label: "Quotation Builder", icon: ClipboardList },
  { path: "/admin/fees", label: "Fee Ledger", icon: DollarSign },
  { path: "/admin/messages", label: "Desk Messages", icon: MessageSquare },
  { path: "/admin/margins", label: "Margin Rules", icon: Settings },
  { path: "/admin/audit", label: "Self-Audit AI", icon: Brain },
  { path: "/admin/exports", label: "Data Export", icon: BarChart3 },
  { path: "/admin/blog", label: "Blog CMS", icon: PenLine },
];

export default function AdminLayout() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => { setSidebarOpen(false); }, [location]);
  const { user, isAuthenticated, loading } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => window.location.href = "/" });

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Redirect to="/" />;

  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="font-display text-xl font-bold text-white mb-2">{t("Access Denied")}</h1>
          <p className="text-slate-400 text-sm mb-4">{t("Admin access required.")}</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">{t("← Return to Home")}</Link>
        </div>
      </div>
    );
  }

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location === path;
    return location.startsWith(path) && path !== "/admin";
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--navy-900)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 w-60 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--navy-800)", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-blue-900/30">
          <img
            src="/logo-icon.png"
            alt="Procure.parts"
            className="w-8 h-8 object-contain flex-shrink-0"
          />
          <div>
            <div className="font-bold text-sm text-white">PROCURE<span className="text-blue-400">.</span>PARTS</div>
            <div className="text-xs text-slate-500">{t("Admin Console")}</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-white ml-auto">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map(item => (
            <Link
              key={item.path}
              href={item.path}
              className={`admin-nav-item ${isActive(item.path, item.exact) ? "active" : ""}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{t(item.label)}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-blue-900/30 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-400">{user.name?.[0] || "A"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-300 truncate">{user.name || "Admin"}</div>
                <div className="text-xs text-slate-600 capitalize">{user.role}</div>
              </div>
              <button onClick={() => logoutMutation.mutate()} className="text-slate-600 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => logoutMutation.mutate()} className="w-full flex justify-center text-slate-600 hover:text-red-400 transition-colors p-1">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center gap-3 px-4 border-b border-blue-900/20 flex-shrink-0" style={{ background: "var(--navy-800)" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">
              {t(navItems.find(n => isActive(n.path, n.exact))?.label || "Admin Console")}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-600 hidden sm:block">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
            <LanguageSwitcher variant="compact" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System online" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Switch>
            <Route path="/admin" component={AdminOverview} />
            <Route path="/admin/onboarding" component={AdminOnboarding} />
            <Route path="/admin/directories" component={AdminDirectories} />
            <Route path="/admin/rfqs" component={AdminRFQs} />
            <Route path="/admin/parts" component={AdminPartsDNA} />
            <Route path="/admin/quotations" component={AdminQuotationBuilder} />
            <Route path="/admin/fees" component={AdminFees} />
            <Route path="/admin/messages" component={AdminMessages} />
            <Route path="/admin/margins" component={AdminMarginRules} />
            <Route path="/admin/audit" component={AdminAuditDashboard} />
            <Route path="/admin/audit/log" component={AdminAuditLog} />
            <Route path="/admin/exports" component={AdminExports} />
            <Route path="/admin/blog" component={AdminBlogCMS} />
          </Switch>
        </main>
      </div>
    </div>
  );
}
