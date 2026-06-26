import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface PortalLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  portalTitle: string;
  portalSubtitle?: string;
  basePath: string;
}

export default function PortalLayout({
  children,
  navItems,
  portalTitle,
  portalSubtitle,
  basePath,
}: PortalLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Close sidebar on outside click
  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = (e: MouseEvent) => {
      const sidebar = document.getElementById("portal-sidebar");
      if (sidebar && !sidebar.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sidebarOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--navy-900)" }}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--navy-900)" }}>
        <div className="w-full max-w-sm p-8 rounded-2xl border border-white/10 text-center" style={{ background: "var(--navy-800)" }}>
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{t(portalTitle)}</h2>
          <p className="text-sm text-gray-400 mb-6">{t("Sign in to access your portal")}</p>
          <a
            href={getLoginUrl()}
            className="block w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm text-center transition-colors"
          >
            {t("Sign In")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--navy-900)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="portal-sidebar"
        className={`
          fixed top-0 left-0 h-full z-40 w-64 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "var(--navy-800)", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white tracking-tight">
              <img src="/logo-icon.png" alt="Procure.parts" className="w-6 h-6 object-contain" />
              PROCURE<span className="text-blue-400">.</span>PARTS
            </Link>
            {portalSubtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{portalSubtitle}</p>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2 mb-2">{t(portalTitle)}</p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.path || (item.path !== basePath && location.startsWith(item.path));
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                        : "text-gray-400 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    <span className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{t(item.label)}</span>
                    {isActive && <ChevronRight size={14} className="text-blue-300" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut size={16} />
            <span>{t("Sign Out")}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:overflow-hidden">
        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10 sticky top-0 z-20"
          style={{ background: "var(--navy-800)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Menu size={20} />
          </button>
          <img src="/logo-icon.png" alt="Procure.parts" className="w-5 h-5 object-contain" />
          <span className="text-sm font-semibold text-white">{t(portalTitle)}</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Floating language switcher — visible on all portal pages */}
      <LanguageSwitcher variant="floating" />
    </div>
  );
}
