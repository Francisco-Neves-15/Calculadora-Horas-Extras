"use client";

import { createContext, useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import { AVAILABLE_LANGCODE, ISO_LANG_MAP } from "../lang/main";

import { LangOptions } from "@/configs/lang.metadata";
import { getResolvedLang } from "@/utils/lang";

// context
export const LangContext = createContext({} as LangContextType);

// local storage / keys
const STORAGE_KEY_LANG = "client-lang";
const HTML_KEY_LANG = "lang";
const LANG_CHANGE_EVENT = "client-lang-change";

// fallback
const FALLBACK_LANG_OPTION: LangOptions = "system";

// types
type LangContextType = {
  langOption: LangOptions;
  resolvedLang: AVAILABLE_LANGCODE;
  setLang: (lang: LangOptions) => void;
};

function parseStoredLangOption(value: string | null): LangOptions | null {
  if (!value) return null;
  const candidate = value as AVAILABLE_LANGCODE;
  if (Object.values(ISO_LANG_MAP).includes(candidate)) return candidate as LangOptions;
  return null;
}

function subscribeLangOption(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(LANG_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(LANG_CHANGE_EVENT, handler);
  };
}

function getLangOptionSnapshot(): LangOptions {
  if (typeof window === "undefined") return FALLBACK_LANG_OPTION;
  const saved = parseStoredLangOption(localStorage.getItem(STORAGE_KEY_LANG));
  return saved ?? "system";
}

function subscribeBrowserLanguage(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("languagechange", onStoreChange);
  return () => window.removeEventListener("languagechange", onStoreChange);
}

// provider
export function LangProvider({ children }: { children: React.ReactNode }) {

  const langOption = useSyncExternalStore(
    subscribeLangOption,
    getLangOptionSnapshot,
    () => FALLBACK_LANG_OPTION
  );

  const browserLanguage = useSyncExternalStore(
    subscribeBrowserLanguage,
    () => navigator.language,
    () => ""
  );

  const resolvedLang = useMemo(() => {
    void browserLanguage;
    return getResolvedLang(langOption);
  }, [langOption, browserLanguage]);

  // sync attribute
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute(HTML_KEY_LANG, resolvedLang);

    // API POINT
  }, [resolvedLang]);

  // setter
  const setLang = useCallback((next: LangOptions) => {
    if (next === "system") {
      localStorage.removeItem(STORAGE_KEY_LANG);
    } else {
      localStorage.setItem(STORAGE_KEY_LANG, next);
    }

    window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
  }, []);

  return (
    <LangContext.Provider value={{ langOption, resolvedLang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}
