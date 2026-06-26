import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Loader2, Check } from "lucide-react";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";

interface LanguageSwitcherProps {
  /** "floating" = fixed bottom-right pill (for internal portals)
   *  "inline"   = inline button for nav bars (PublicNav already uses this)
   *  "compact"  = icon-only for tight spaces */
  variant?: "floating" | "inline" | "compact";
  className?: string;
}

export default function LanguageSwitcher({ variant = "inline", className = "" }: LanguageSwitcherProps) {
  const { lang, language, setLang, isTranslating } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dropdown = (
    <div
      className={`absolute z-[200] w-56 rounded-xl border border-white/10 shadow-2xl overflow-hidden
        ${variant === "floating" ? "bottom-full mb-2 right-0" : "top-full mt-2 right-0"}`}
      style={{ background: "rgba(8, 15, 26, 0.98)", backdropFilter: "blur(20px)" }}
    >
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Language</p>
        {isTranslating && (
          <span className="flex items-center gap-1 text-xs text-blue-400">
            <Loader2 className="w-3 h-3 animate-spin" /> Translating…
          </span>
        )}
      </div>
      {LANGUAGES.map(l => (
        <button
          key={l.code}
          onClick={() => { setLang(l.code); setOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 ${
            lang === l.code
              ? "bg-blue-600/20 text-blue-300"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
          }`}
        >
          <span className="text-base leading-none w-6 text-center">{l.flag}</span>
          <span className="flex-1 text-left">
            <span className="block font-medium leading-tight">{l.nativeLabel}</span>
            <span className="block text-xs text-slate-600 leading-tight">{l.label}</span>
          </span>
          {lang === l.code && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
        </button>
      ))}
      <div className="px-4 py-2 border-t border-white/10 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
        <p className="text-xs text-slate-600">AI-powered · 8 languages</p>
      </div>
    </div>
  );

  /* ── FLOATING variant ── fixed bottom-right pill */
  if (variant === "floating") {
    return (
      <div ref={ref} className={`fixed bottom-6 right-6 z-[150] ${className}`}>
        <div className="relative">
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-full border border-white/15 shadow-xl text-sm font-medium text-slate-300 hover:text-white transition-all duration-200 hover:border-blue-500/40"
            style={{ background: "rgba(15, 27, 45, 0.95)", backdropFilter: "blur(16px)" }}
            title="Change language"
          >
            {isTranslating
              ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              : <Globe className="w-4 h-4 text-blue-400" />
            }
            <span>{language.flag}</span>
            <span className="font-semibold text-xs">{language.code.toUpperCase()}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
          {open && dropdown}
        </div>
      </div>
    );
  }

  /* ── COMPACT variant ── icon only */
  if (variant === "compact") {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all"
          title="Change language"
        >
          {isTranslating
            ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            : <Globe className="w-4 h-4" />
          }
          <span className="text-xs font-bold">{language.code.toUpperCase()}</span>
        </button>
        {open && dropdown}
      </div>
    );
  }

  /* ── INLINE variant ── default, for nav bars */
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {isTranslating
          ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
          : <Globe className="w-3.5 h-3.5" />
        }
        <span>{language.flag}</span>
        <span className="font-medium text-xs">{language.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && dropdown}
    </div>
  );
}
