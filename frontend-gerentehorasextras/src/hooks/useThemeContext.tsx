"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { ThemeOption, ThemeResolved } from "@/types/pallete-theme"

// context
const ThemeContext = createContext({} as ThemeContextType);

// local storage or storage key
const STORAGE_KEY = "client-theme";

// utility
const getResolvedTheme = (theme: ThemeOption): ThemeResolved => {
  return THEME_META[theme].resolve();
};

const getSystemTheme = (): ThemeResolved => {
  // fallback SSR
  if (typeof window === "undefined") return "light"; 

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// exposed infos to use

type ThemeMeta = {
  id: string;
  resolve: () => ThemeResolved;
};

export const THEME_META: Record<ThemeOption, ThemeMeta> = {
  light: {
    id: "th-opt-light",
    resolve: () => "light",
  },
  dark: {
    id: "th-opt-dark",
    resolve: () => "dark",
  },
  system: {
    id: "th-opt-system",
    resolve: () => getSystemTheme(),
  },
};

// main

type ThemeContextType = {
  theme: ThemeOption;
  resolvedTheme: ThemeResolved;

  setTheme: (t: ThemeOption) => void;

  colorPrimary: string;
  setColorPrimary: (c: string) => void;

  colorPrimaryContrast: string;
  setColorPrimaryContrast: (c: string) => void;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeOption>("system");
  const [colorPrimary, setColorPrimary] = useState("#27427F");
  const [colorPrimaryContrast, setColorPrimaryContrast] = useState("#ffffff");

  // load inicial
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeOption | null;

    if (saved) {
      setThemeState(saved);
    } else {
      // nunca escolheu → system (não salva)
      setThemeState("system");
    }
  }, []);
  
  // Get Primary's Colors (do not change with the theme yet)
  useEffect(() => {
    const root = document.documentElement;
    
    const resolved = getResolvedTheme(theme);
    
    root.setAttribute("data-theme", resolved);
    
    root.style.setProperty("--color-primary", colorPrimary);
    root.style.setProperty("--color-primaryContrast", colorPrimaryContrast);
  }, [theme, colorPrimary, colorPrimaryContrast]);

  // listern when change the systemTheme
  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    // Change the App Favicon based on Navigator Theme
    const handleChangeFavicon = (resolved: ThemeResolved) => {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) {
        link.href = resolved === "dark" ?
          `/favicon/favicon-v2/favicon-v2-white.ico?v=${Date.now()}` : 
          `/favicon/favicon-v2/favicon-v2-black.ico?v=${Date.now()}`;
      }
    }

    // main
    const handleChange = () => {
      const resolved = media.matches ? "dark" : "light";

      document.documentElement.setAttribute("data-theme", resolved);
      handleChangeFavicon(resolved)
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const setTheme = (t: ThemeOption) => {
    setThemeState(t);

    // só salva se não for "system"
    if (t === "system") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, t);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme: getResolvedTheme(theme),
        colorPrimary,
        setColorPrimary,
        colorPrimaryContrast,
        setColorPrimaryContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
