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

import { ICustomPalettesColors, TCustomPalettesColors } from "@/types/theme"

// context
const ThemeContext = createContext({} as ThemeContextType);

// local storage or storage key
const STORAGE_KEY_MODE = "client-theme-mode";
const STORAGE_KEY_PALETTE = "client-theme-palette";

const HTML_KEY_MODE = "data-theme-mode";
const HTML_KEY_PALETTE = "data-theme-palette";

// main

type ThemeContextType = {
  themeMode: ThemeModeOptions;
  resolvedThemeMode: ThemeModeResolved;
  setThemeMode: (t: ThemeModeOptions) => void;

  themePalette: ThemePaletteOptions;
  resolvedThemePalette: ThemePaletteResolved;
  setThemePalette: (t: ThemePaletteOptions) => void;

  // transformar em objeto?
  customPalettesColors: TCustomPalettesColors;
  setCustomPalettesColors: (t: ICustomPalettesColors | null) => void;
};

// It is intended to come from the API

// Current selected
const currentCustomPaletteExample: ICustomPalettesColors["name"] = "custom1"

// list of customized palettes
const customPaletteExample: TCustomPalettesColors = [
  {
    id: "36b4fec0-923a-4d19-b6a9-defeb218cba9",
    code: "th-palette-c-custom",
    name: "custom1",
    displayName: "Customized",
    primaryColor: "#66277f",
    primaryColorContrast: "#ffffff",
  },
]

export function ThemeProvider({ children }: { children: React.ReactNode }) {

  const [themeMode, setThemeModeState] = useState<ThemeModeOptions>("system");
  const [themePalette, setThemePaletteState] = useState<ThemePaletteOptions>("default");
  
  const [customPalettesColors, setCustomPaletteColorsState] = useState<TCustomPalettesColors | null>(null);

  // load inicial
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

    customPaletteExample.forEach((palette) => {
      if (palette.name === currentCustomPaletteExample) setCustomPaletteColorsState(palette);
    })

  }, []);
  
  // Get Primary's Colors (do not change with the theme yet)
  useEffect(() => {
    const root = document.documentElement;
    
    const resolvedThemeMode = getResolvedThemeMode(themeMode);
    
    // inicial key
    root.setAttribute(HTML_KEY_MODE, resolvedThemeMode);
    root.setAttribute(HTML_KEY_PALETTE, themePalette);
    
    // custom palette settings
    if (customPaletteColorsState?.primaryColor) {
      root.style.setProperty("--color-primary", customPaletteColorsState?.primaryColor);
    };
    if (customPaletteColorsState?.primaryColorContrast) {
      root.style.setProperty("--color-primaryContrast", customPaletteColorsState?.primaryColorContrast);
    };

  }, [themeMode, themePalette, customPaletteColorsState]);

  // listern when change the systemThemeMode
  useEffect(() => {
    if (themeMode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    // Change the App Favicon based on Navigator Theme
    const handleChangeFavicon = (resolved: ThemeModeResolved) => {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) {
        link.href = resolved === "dark" ? 
          `/favicon/favicon-v2/favicon-v2-white.ico?v=${Date.now()}` : 
          `/favicon/favicon-v2/favicon-v2-black.ico?v=${Date.now()}`;
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
  
  const setCustomPalettesColors = (t: ICustomPalettesColors) => {
    setCustomPaletteColorsState(t);
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

        customPalettesColors:,
        setCustomPalettesColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
