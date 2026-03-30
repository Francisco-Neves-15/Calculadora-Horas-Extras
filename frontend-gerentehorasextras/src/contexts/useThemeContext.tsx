"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  ThemeModeOptions,
  ThemeModeResolved,
} from "@/configs/theme-mode.metadata";

import {
  ThemePaletteOptions,
  ThemePaletteResolved,
} from "@/configs/theme-palette.metadata";

import { THEME_STORAGE_KEYS, THEME_COLOR_DEFAULTS, HTML_KEY_MODE, HTML_KEY_PALETTE } from "@/configs/theme-storage";
import {
  readStoredPrimaryColors,
  readStoredThemeMode,
  readStoredThemePalette,
} from "@/utils/read-theme-prefs";
import { getResolvedThemeMode, getResolvedThemePalette } from "@/utils/theme";

// context
const ThemeContext = createContext({} as ThemeContextType);

// fallback
const FALLBACK_MODE: ThemeModeOptions = "system";
const FALLBACK_PALETTE: ThemePaletteOptions = "default";

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

// Body Classname to theme mode
function setClassNameBody(resolved: ThemeModeResolved) {
  const addClass = resolved === "dark" ? "dark" : "light";
  const removeClass = resolved === "dark" ? "light" : "dark";
  document.body.classList.add(addClass);
  document.body.classList.remove(removeClass);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeModeOptions>(() =>
    typeof window === "undefined" ? FALLBACK_MODE : readStoredThemeMode()
  );
  const [themePalette, setThemePaletteState] = useState<ThemePaletteOptions>(
    () =>
      typeof window === "undefined" ? FALLBACK_PALETTE : readStoredThemePalette()
  );

  const initColors =
    typeof window === "undefined"
      ? { ...THEME_COLOR_DEFAULTS }
      : readStoredPrimaryColors();

  const [colorPrimary, setColorPrimaryState] = useState<string>(initColors.colorPrimary);
  const [colorPrimaryContrast, setColorPrimaryContrastState] = useState<string>(
    initColors.colorPrimaryContrast
  );
  const [colorPrimaryAlpha, setColorPrimaryAlphaState] = useState<string>(
    initColors.colorPrimaryAlpha
  );

  // Sincroniza DOM (e variáveis CSS) com o estado — sem efeitos colaterais de API aqui.
  useEffect(() => {
    const root = document.documentElement;

    const resolvedThemeMode = getResolvedThemeMode(themeMode);

    root.setAttribute(HTML_KEY_MODE, resolvedThemeMode);
    root.setAttribute(HTML_KEY_PALETTE, themePalette);

    setClassNameBody(resolvedThemeMode);

    root.style.setProperty("--color-primary", colorPrimary);
    root.style.setProperty("--color-primaryContrast", colorPrimaryContrast);
    root.style.setProperty("--color-primaryAlpha", colorPrimaryAlpha);
  }, [themeMode, themePalette, colorPrimary, colorPrimaryContrast, colorPrimaryAlpha]);

  // listern when change the systemThemeMode
  useEffect(() => {
    if (themeMode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    // main
    const handleChangeThemeMode = () => {
      const resolved = media.matches ? "dark" : "light";

      document.documentElement.setAttribute(HTML_KEY_MODE, resolved);
      setClassNameBody(resolved);
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

  const setThemeMode = useCallback((t: ThemeModeOptions) => {
    setThemeModeState(t);

    if (t === "system") {
      localStorage.removeItem(THEME_STORAGE_KEYS.mode);
    } else {
      localStorage.setItem(THEME_STORAGE_KEYS.mode, t);
    }

    // API POINT
  }, []);

  const setThemePalette = useCallback((t: ThemePaletteOptions) => {
    setThemePaletteState(t);

    if (t === "default") {
      localStorage.removeItem(THEME_STORAGE_KEYS.palette);
    } else {
      localStorage.setItem(THEME_STORAGE_KEYS.palette, t);
    }

    // API POINT
  }, []);

  const setColorPrimary = useCallback((c: string) => {
    setColorPrimaryState(c);
    localStorage.setItem(THEME_STORAGE_KEYS.colorPrimary, c);
    // API POINT
  }, []);

  const setColorPrimaryContrast = useCallback((c: string) => {
    setColorPrimaryContrastState(c);
    localStorage.setItem(THEME_STORAGE_KEYS.colorPrimaryContrast, c);
    // API POINT
  }, []);

  const setColorPrimaryAlpha = useCallback((c: string) => {
    setColorPrimaryAlphaState(c);
    localStorage.setItem(THEME_STORAGE_KEYS.colorPrimaryAlpha, c);
    // API POINT
  }, []);

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
