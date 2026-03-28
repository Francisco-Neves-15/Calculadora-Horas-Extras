"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { 
  AVAILABLE_LANGCODE, 
  ISO_LANG_MAP 
} from "../lang/main";

import { generalizeLang } from "../lang/utils";

// context
const LangContext = createContext({} as LangContextType);

// local storage / keys
const STORAGE_KEY_LANG = "client-lang";
const HTML_KEY_LANG = "lang";

// fallback
const FALLBACK_LANG: AVAILABLE_LANGCODE = "en-US";

// types
type LangContextType = {
  lang: AVAILABLE_LANGCODE;
  setLang: (lang: AVAILABLE_LANGCODE) => void;
};

// helpers

function resolveBrowserLang(): AVAILABLE_LANGCODE {
  if (typeof navigator === "undefined") return FALLBACK_LANG;

  const browserLang = navigator.language;

  // match
  if (Object.values(ISO_LANG_MAP).includes(browserLang as AVAILABLE_LANGCODE)) {
    return browserLang as AVAILABLE_LANGCODE;
  }

  // generalize (en-GB -> en)
  const generalized = generalizeLang(browserLang as AVAILABLE_LANGCODE);

  const found = Object.values(ISO_LANG_MAP).find(
    (lang) => lang.startsWith(generalized)
  );

  if (found) return found;

  return FALLBACK_LANG;
}

// provider
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AVAILABLE_LANGCODE>(FALLBACK_LANG);

  // initial load (localStorage -> browser -> fallback)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG) as AVAILABLE_LANGCODE | null;

    if (saved && Object.values(ISO_LANG_MAP).includes(saved)) {
      setLangState(saved);
      return;
    }

    const resolved = resolveBrowserLang();
    setLangState(resolved);
  }, []);

  // sync
  useEffect(() => {
    const root = document.documentElement;

    // HTML tag
    root.setAttribute(HTML_KEY_LANG, lang);

    // localStorage
    localStorage.setItem(STORAGE_KEY_LANG, lang);

    // API POINT

  }, [lang]);

  // setter
  const setLang = (newLang: AVAILABLE_LANGCODE) => {
    setLangState(newLang);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used within a LangProvider");
  return context;
};
