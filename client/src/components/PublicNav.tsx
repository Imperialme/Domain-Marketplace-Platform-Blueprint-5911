import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Globe, ChevronDown, Loader2, LogIn, UserPlus, ShoppingCart, Truck, Shield } from "lucide-react";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { useContentProtection } from "@/hooks/useContentProtection";
import { getLoginUrl } from "@/const";

export default function PublicNav() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  const { lang, language, setLang, t, isTranslating } = useLanguage();
  useContentProtection();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (portalRef.current && !portalRef.current.contains(e.target as Node)) setPortalOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  const navLinks = [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/brands",       label: "Brands" },
    { href: "/industries",   label: "Industries" },
    { href: "/why-us",       label: "Why Us" },
    { href: "/blog",         label: "Blog" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-blue-900/30"
      style={{ background: "rgba(10, 18, 30, 0.95)", backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo-icon.png"
              alt="Procure.parts"
              className="w-8 h-8 object-contain"
            />
            <span className="font-display font-bold text-lg tracking-tight">
              PROCURE.<span className="text-blue-400">PARTS</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === link.href
                    ? "text-blue-400 bg-blue-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {t(link.label)}
              </Link>
            ))}
          </div>

          {/* Right: Language + Portal CTA */}
          <div className="hidden md:flex items-center gap-2">

            {/* Language selector */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
              >
                {isTranslating
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  : <Globe className="w-3.5 h-3.5" />
                }
                <span className="flex items-center gap-1">
                  <span>{language.flag}</span>
                  <span className="font-medium">{language.code.toUpperCase()}</span>
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>

              {langOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-blue-900/40 shadow-2xl overflow-hidden z-50"
                  style={{ background: "rgba(8, 15, 26, 0.98)", backdropFilter: "blur(16px)" }}
                  role="listbox"
                >
                  <div className="px-3 py-2 border-b border-blue-900/30">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("Select Language")}</p>
                  </div>
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      role="option"
                      aria-selected={lang === l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 ${
                        lang === l.code
                          ? "bg-blue-600/20 text-blue-300"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-base leading-none">{l.flag}</span>
                      <span className="flex-1 text-left">
                        <span className="block font-medium">{l.nativeLabel}</span>
                        <span className="block text-xs text-slate-600">{l.label}</span>
                      </span>
                      {lang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                    </button>
                  ))}
                  <div className="px-4 py-2.5 border-t border-blue-900/30 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-xs text-slate-500">{t("AI-powered translation")}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Combined Portal dropdown (Sign In + Apply) ── */}
            <div className="relative" ref={portalRef}>
              <button
                onClick={() => { setPortalOpen(v => !v); setLangOpen(false); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 glow-blue"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t("Portal")}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${portalOpen ? "rotate-180" : ""}`} />
              </button>
              {portalOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-blue-900/40 shadow-2xl overflow-hidden z-50"
                  style={{ background: "rgba(8, 15, 26, 0.98)", backdropFilter: "blur(16px)" }}
                >
                  {/* Sign In section */}
                  <div className="px-3 py-2 border-b border-blue-900/30">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <LogIn className="w-3 h-3" /> {t("Sign In")}
                    </p>
                  </div>
                  <a
                    href={getLoginUrl("/buyer")}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                    onClick={() => setPortalOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold">{t("Sign in as Buyer")}</div>
                      <div className="text-xs text-slate-500">{t("Access Buyer Portal")}</div>
                    </div>
                  </a>
                  <a
                    href={getLoginUrl("/vendor")}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all border-t border-blue-900/20"
                    onClick={() => setPortalOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-semibold">{t("Sign in as Vendor")}</div>
                      <div className="text-xs text-slate-500">{t("Access Supplier Portal")}</div>
                    </div>
                  </a>
                  {/* Apply section */}
                  <div className="px-3 py-2 border-t border-blue-900/30">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <UserPlus className="w-3 h-3" /> {t("Apply for Access")}
                    </p>
                  </div>
                  <Link
                    href="/apply/buyer"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                    onClick={() => setPortalOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold">{t("Sign up as Buyer")}</div>
                      <div className="text-xs text-slate-500">{t("Source spare parts globally")}</div>
                    </div>
                  </Link>
                  <Link
                    href="/apply/supplier"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all border-t border-blue-900/20"
                    onClick={() => setPortalOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-semibold">{t("Sign up as Vendor")}</div>
                      <div className="text-xs text-slate-500">{t("List your parts inventory")}</div>
                    </div>
                  </Link>
                  {/* Admin access — subtle, not advertised */}
                  <div className="border-t border-blue-900/30 px-4 py-2">
                    <a
                      href={getLoginUrl("/admin")}
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-400 transition-colors"
                      onClick={() => setPortalOpen(false)}
                    >
                      <Shield className="w-3 h-3" />
                      <span>Admin Console</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

          {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-blue-900/30 bg-[#080F1A] px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location === link.href
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {t(link.label)}
            </Link>
          ))}

          {/* Language selector — compact horizontal pills */}
          <div className="pt-3 border-t border-blue-900/20">
            <div className="flex items-center gap-2 px-1 mb-2">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{t("Language")}</p>
              {isTranslating && <Loader2 className="w-3 h-3 animate-spin text-blue-400 ml-auto" />}
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                    lang === l.code
                      ? "bg-blue-600/25 text-blue-300 border border-blue-500/40"
                      : "text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700"
                  }`}
                >
                  <span>{l.flag}</span>
                  <span className="font-medium">{l.nativeLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Portal section — Sign In + Apply */}
          <div className="pt-3 border-t border-blue-900/30 space-y-1">
            <p className="text-xs text-slate-600 uppercase tracking-wider px-1 font-semibold pb-1">{t("Sign In")}</p>
            <a
              href={getLoginUrl("/buyer")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5"
            >
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              {t("Sign in as Buyer")}
            </a>
            <a
              href={getLoginUrl("/vendor")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              {t("Sign in as Vendor")}
            </a>

            <p className="text-xs text-slate-600 uppercase tracking-wider px-1 font-semibold pt-2 pb-1">{t("Apply for Access")}</p>
            <Link
              href="/apply/buyer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white"
            >
              <ShoppingCart className="w-4 h-4" />
              {t("Sign up as Buyer")}
            </Link>
            <Link
              href="/apply/supplier"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-amber-600 text-white"
            >
              <Truck className="w-4 h-4" />
              {t("Sign up as Vendor")}
            </Link>
            {/* Admin — subtle */}
            <a
              href={getLoginUrl("/admin")}
              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              <Shield className="w-3 h-3" />
              <span>Admin Console</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
