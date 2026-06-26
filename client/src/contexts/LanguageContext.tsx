import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { translate, LANG_META, type LangCode } from "@/lib/translations";
import { trpc } from "@/lib/trpc";

export type { LangCode };

export interface Language {
  code: LangCode;
  label: string;
  nativeLabel: string;
  flag: string;
  dir: "ltr" | "rtl";
}

export const LANGUAGES: Language[] = [
  { code: "en", label: "English",    nativeLabel: "English",    flag: "🇬🇧", dir: "ltr" },
  { code: "ar", label: "Arabic",     nativeLabel: "العربية",    flag: "🇦🇪", dir: "rtl" },
  { code: "fr", label: "French",     nativeLabel: "Français",   flag: "🇫🇷", dir: "ltr" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português",  flag: "🇧🇷", dir: "ltr" },
  { code: "de", label: "German",     nativeLabel: "Deutsch",    flag: "🇩🇪", dir: "ltr" },
  { code: "es", label: "Spanish",    nativeLabel: "Español",    flag: "🇪🇸", dir: "ltr" },
  { code: "zh", label: "Chinese",    nativeLabel: "中文",        flag: "🇨🇳", dir: "ltr" },
  { code: "ja", label: "Japanese",   nativeLabel: "日本語",      flag: "🇯🇵", dir: "ltr" },
  { code: "ru", label: "Russian",    nativeLabel: "Русский",    flag: "🇷🇺", dir: "ltr" },
];

interface LanguageContextValue {
  lang: LangCode;
  language: Language;
  setLang: (code: LangCode) => void;
  t: (text: string) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  language: LANGUAGES[0],
  setLang: () => {},
  t: (text) => text,
  isTranslating: false,
});

// LLM fallback cache for strings not in the static dictionary
const llmCache: Record<string, Record<string, string>> = {};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    try { return (localStorage.getItem("pp_lang") as LangCode) || "en"; }
    catch { return "en"; }
  });

  // cacheVersion bumps when LLM fallback cache updates → triggers re-render
  const [cacheVersion, setCacheVersion] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);

  const pendingRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const langRef = useRef<LangCode>(lang);
  langRef.current = lang;

  // LLM fallback — only fires for strings NOT in the static dictionary
  const translateMutation = trpc.i18n.translateBatch.useMutation({
    onSuccess: (data: { lang: string; translations: Record<string, string> }) => {
      if (!llmCache[data.lang]) llmCache[data.lang] = {};
      Object.assign(llmCache[data.lang], data.translations);
      setIsTranslating(false);
      setCacheVersion(v => v + 1);
    },
    onError: () => setIsTranslating(false),
  });

  const flush = useCallback(() => {
    const activeLang = langRef.current;
    if (activeLang === "en") return;
    // Only send strings that are NOT in the static dictionary
    const texts = Array.from(pendingRef.current).filter(
      text => text && text.trim().length > 1 && !llmCache[activeLang]?.[text]
    );
    pendingRef.current.clear();
    if (texts.length > 0) {
      setIsTranslating(true);
      translateMutation.mutate({ texts, targetLang: activeLang as "ar" | "fr" | "pt" | "de" | "zh" | "ja" | "es" | "ru" });
    }
  }, [translateMutation]);

  /**
   * t() — instant translation using static dictionary.
   * Falls back to LLM cache, then queues for LLM translation if still missing.
   */
  const t = useCallback(
    (text: string): string => {
      void cacheVersion; // reactive dependency
      if (!text || lang === "en") return text;

      // 1. Try static dictionary first — INSTANT, no API call
      const staticResult = translate(text, lang);
      if (staticResult !== text) return staticResult;

      // 2. Try LLM fallback cache
      const llmResult = llmCache[lang]?.[text];
      if (llmResult) return llmResult;

      // 3. Queue for LLM translation (only for strings missing from static dict)
      pendingRef.current.add(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, 300);

      return text; // Show original while waiting for LLM
    },
    [lang, cacheVersion, flush]
  );

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    try { localStorage.setItem("pp_lang", code); } catch {}
    const langObj = LANGUAGES.find(l => l.code === code);
    document.documentElement.dir = langObj?.dir || "ltr";
    document.documentElement.lang = code;
    // Immediately bump version so components re-render with static translations
    setCacheVersion(v => v + 1);
  }, []);

  // Apply direction on mount
  useEffect(() => {
    const langObj = LANGUAGES.find(l => l.code === lang);
    document.documentElement.dir = langObj?.dir || "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const language = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ lang, language, setLang, t, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
