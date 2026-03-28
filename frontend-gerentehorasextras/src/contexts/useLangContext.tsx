"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AVAILABLE_LANGCODE, ISO_LANG_MAP } from "../lang/main";

import { LangOptions } from "@/configs/lang.metadata";
import { getResolvedLang } from "@/utils/lang";

// context
const LangContext = createContext({} as LangContextType);

// local storage / keys
const STORAGE_KEY_LANG = "client-lang";
const HTML_KEY_LANG = "lang";

// fallback (preferência quando nada foi salvo — igual ao theme mode `system`)
const FALLBACK_LANG_OPTION: LangOptions = "system";

// types
type LangContextType = {
  langOption: LangOptions;
  resolvedLang: AVAILABLE_LANGCODE;
  setLang: (lang: LangOptions) => void;
};

// provider
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [langOption, setLangOptionState] = useState<LangOptions>(
    FALLBACK_LANG_OPTION
  );
  const [browserLangNonce, setBrowserLangNonce] = useState(0);

  const resolvedLang = useMemo(
    () => getResolvedLang(langOption),
    [langOption, browserLangNonce]
  );

  // initial load (localStorage -> padrão system)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG) as
      | AVAILABLE_LANGCODE
      | null;

    if (saved && Object.values(ISO_LANG_MAP).includes(saved)) {
      setLangOptionState(saved as LangOptions);
      return;
    }

    setLangOptionState("system");
  }, []);

  // sistema do navegador pode mudar com languagechange
  useEffect(() => {
    if (langOption !== "system") return;

    const onLanguageChange = () => setBrowserLangNonce((n) => n + 1);
    window.addEventListener("languagechange", onLanguageChange);
    return () =>
      window.removeEventListener("languagechange", onLanguageChange);
  }, [langOption]);

  // sync attribute (valor efetivo)
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute(HTML_KEY_LANG, resolvedLang);
    // API POINT
  }, [resolvedLang]);

  // setter (espelha Theme: system remove a chave do storage)
  const setLang = (next: LangOptions) => {
    setLangOptionState(next);

    if (next === "system") {
      localStorage.removeItem(STORAGE_KEY_LANG);
    } else {
      localStorage.setItem(STORAGE_KEY_LANG, next);
    }
  };

  return (
    <LangContext.Provider value={{ langOption, resolvedLang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used within a LangProvider");
  return context;
};
