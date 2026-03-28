"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { 
  ThemeModeOptions,
  ThemeModeResolved,
} from "@/configs/theme-mode.metadata"

import { 
  ThemePaletteOptions,
  ThemePaletteResolved,
} from "@/configs/theme-palette.metadata"

import { getResolvedThemeMode, getResolvedThemePalette } from "@/utils/theme"

// context
const ThemeContext = createContext({} as ThemeContextType);

// local storage / keys
const STORAGE_KEY_MODE = "client-theme-mode";
const STORAGE_KEY_PALETTE = "client-theme-palette";

const HTML_KEY_MODE = "data-theme-mode";
const HTML_KEY_PALETTE = "data-theme-palette";

// fallback
const FALLBACK_MODE: ThemeModeOptions = "system";
const FALLBACK_PALETTE: ThemePaletteOptions = "default";

// fix values

const PATH_FAVICON_LIGHT: string = "/favicon/favicon-v2/favicon-v2-black.ico";
const PATH_FAVICON_DARK: string = "/favicon/favicon-v2/favicon-v2-white.ico";

// main

type ThemeContextType = {
  themeMode: ThemeModeOptions;
  resolvedThemeMode: ThemeModeResolved;
  setThemeMode: (t: ThemeModeOptions) => void;

  themePalette: ThemePaletteOptions;
  resolvedThemePalette: ThemePaletteResolved;
  setThemePalette: (t: ThemePaletteOptions) => void;

  colorPrimary: string;
  setColorPrimary: (c: string) => void;
  colorPrimaryContrast: string;
  setColorPrimaryContrast: (c: string) => void;
  colorPrimaryAlpha: string;
  setColorPrimaryAlpha: (c: string) => void;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeModeOptions>(FALLBACK_MODE);
  const [themePalette, setThemePaletteState] = useState<ThemePaletteOptions>(FALLBACK_PALETTE);

  const [colorPrimary, setColorPrimary] = useState("#27427F");
  const [colorPrimaryContrast, setColorPrimaryContrast] = useState("#ffffff");
  const [colorPrimaryAlpha, setColorPrimaryAlpha] = useState("#27427f26");

  // initial load
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeModeOptions | null;
    const savedPalette = localStorage.getItem(STORAGE_KEY_PALETTE) as ThemePaletteOptions | null;

    if (savedMode) {
      setThemeModeState(savedMode);
    } else {
      setThemeModeState("system");
    }

    if (savedPalette) {
      setThemePaletteState(savedPalette);
    } else {
      setThemePaletteState("default");
    }

  }, []);
  
  // Get Primary's Colors (do not change with the theme yet)
  useEffect(() => {
    const root = document.documentElement;
    
    const resolvedThemeMode = getResolvedThemeMode(themeMode);
    
    root.setAttribute(HTML_KEY_MODE, resolvedThemeMode);
    root.setAttribute(HTML_KEY_PALETTE, themePalette);
    
    root.style.setProperty("--color-primary", colorPrimary);
    root.style.setProperty("--color-primaryContrast", colorPrimaryContrast);
    root.style.setProperty("--color-primaryAlpha", colorPrimaryAlpha);

    // API POINT

  }, [themeMode, themePalette, colorPrimary, colorPrimaryContrast, colorPrimaryAlpha]);

  // listern when change the systemThemeMode
  useEffect(() => {
    if (themeMode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    // Change the App Favicon based on Navigator Theme
    const handleChangeFavicon = (resolved: ThemeModeResolved) => {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) {
        link.href = resolved === "dark" ? 
          `${PATH_FAVICON_DARK}?v=${Date.now()}` : 
          `${PATH_FAVICON_LIGHT}?v=${Date.now()}`;
      }
    }

    // main
    const handleChangeThemeMode = () => {
      const resolved = media.matches ? "dark" : "light";

      document.documentElement.setAttribute(HTML_KEY_MODE, resolved);
      handleChangeFavicon(resolved);
    };

    media.addEventListener("change", handleChangeThemeMode);

    return () => {
      media.removeEventListener("change", handleChangeThemeMode);
    };
  }, [themeMode]);

  // listern when change the theme palette
  useEffect(() => {
    if (themePalette !== "default") return;

    // main
    const handleChangeThemePalette = () => {
      document.documentElement.setAttribute(HTML_KEY_PALETTE, themePalette);
    };

    handleChangeThemePalette();

  }, [themePalette]);

  // sets

  const setThemeMode = (t: ThemeModeOptions) => {
    setThemeModeState(t);

    // if system theme remove the current resolved mode
    if (t === "system") {
      localStorage.removeItem(STORAGE_KEY_MODE);
    } else {
      localStorage.setItem(STORAGE_KEY_MODE, t);
    }
  };
  
  const setThemePalette = (t: ThemePaletteOptions) => {
    setThemePaletteState(t);

    // if system theme remove the current resolved palette
    if (t === "default") {
      localStorage.removeItem(STORAGE_KEY_PALETTE);
    } else {
      localStorage.setItem(STORAGE_KEY_PALETTE, t);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        resolvedThemeMode: getResolvedThemeMode(themeMode),
        setThemeMode,
        
        themePalette,
        resolvedThemePalette: getResolvedThemePalette(themePalette),
        setThemePalette,

        colorPrimary,
        setColorPrimary,
        colorPrimaryContrast,
        setColorPrimaryContrast,
        colorPrimaryAlpha,
        setColorPrimaryAlpha,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
