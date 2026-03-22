"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Metadatas's

import {
  ThemeModeOptions,
  ThemeModeResolved,
} from "@/configs/theme-mode.metadata";

import {
  ThemePaletteOptions,
  ThemePaletteResolved,
  THEMES_PALETTES,
} from "@/configs/theme-palette.metadata";

// Hooks
import { HTML_KEY_MODE, HTML_KEY_PALETTE, useThemeStorage } from "@/hooks/useThemeStorage";
import { useApplyTheme } from "@/hooks/useApplyTheme";

// Utils
import { getResolvedThemeMode, getResolvedThemePalette, getSystemThemeMode } from "@/utils/theme";

// Types
import { ICustomPalettesColors, TCustomPalettesColors, ThemePaletteItem } from "@/types/theme";

const ThemeContext = createContext({} as ThemeContextType);


// It is intended to come from the API
//
// current selection coming from API:
// - null = never chose one, so use default system palette
// - otherwise = selected custom palette id

export const EXAMPLE_customColorsPaletteLimit = 3;

const EXAMPLE_currentCustomColorsPaletteId: string | null =
  "36b4fec0-923a-4d19-b6a9-defeb218cba9";

// list of customized palettes coming from API
const EXAMPLE_currentCustomColorsPaletteList: TCustomPalettesColors = [
  {
    id: "36b4fec0-923a-4d19-b6a9-defeb218cba9",
    code: "th-palette-c-custom",
    name: "custom1",
    displayName: "Customized",
    colors: {
      primaryColor: "#66277f",
      primaryColorContrast: "#ffffff",
    }
  },
];

type ThemeContextType = {
  themeMode: ThemeModeOptions;
  resolvedThemeMode: ThemeModeResolved;
  setThemeMode: (t: ThemeModeOptions) => void;

  themePalette: ThemePaletteOptions;
  resolvedThemePalette: ThemePaletteResolved;
  currentThemePaletteCode: string;
  setThemePalette: (t: ThemePaletteOptions) => void;

  customPalettes: TCustomPalettesColors;
  setCustomPalettes: (t: TCustomPalettesColors) => void;
  addCustomPalette: (t: ICustomPalettesColors) => void;

  selectedCustomPaletteId: string | null;
  setSelectedCustomPaletteId: (t: string | null) => void;
  selectedCustomPalette: ICustomPalettesColors | null;

  allThemePalettes: ThemePaletteItem[];
  customColorsPaletteLimit: number;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const {
    getThemeMode,
    getThemePalette,
    getCustomPalettes,
    getSelectedCustomPaletteId,
    setThemeMode: saveThemeMode,
    setThemePalette: saveThemePalette,
    setCustomPalettes: saveCustomPalettes,
    setSelectedCustomPaletteId: saveSelectedCustomPaletteId,
  } = useThemeStorage();

  const [themeMode, setThemeModeState] = useState<ThemeModeOptions>("system");
  const [themePalette, setThemePaletteState] = useState<ThemePaletteOptions>("default");
  const [customPalettes, setCustomPalettesState] = useState<TCustomPalettesColors>([]);
  const [selectedCustomPaletteId, setSelectedCustomPaletteIdState] = useState<string | null>(null);

  // ** ----- API SPACE START----- ** //

  //  API sync point *1* :customPaletteExample need to be replaced by "API USER PALETTE LIST"

  // const customColorsPaletteLimit = api.get.get() replace > "EXAMPLE_customColorsPaletteLimit"
  // const currentCustomColorsPaletteId = api.get.get() replace > "EXAMPLE_currentCustomColorsPaletteId"
  // const currentCustomColorsPaletteList = api.get.get() replace > "customized"
  
  // ** ----- API SPACE END----- ** //

  // React to Changes

  const selectedCustomPalette = useMemo(() => {
    if (!selectedCustomPaletteId) return null;
    return customPalettes.find((palette) => palette.id === selectedCustomPaletteId) ?? null;
  }, [customPalettes, selectedCustomPaletteId]);

  const currentThemePaletteCode = useMemo(() => {
    if (selectedCustomPalette?.code) return selectedCustomPalette.code;
    return getResolvedThemePalette(themePalette);
  }, [selectedCustomPalette, themePalette]);

  const allThemePalettes = useMemo<ThemePaletteItem[]>(() => {
    const systemPalettes: ThemePaletteItem[] = Object.keys(THEMES_PALETTES).map((key) => ({
      type: "system",
      key: key as ThemePaletteOptions,
      id: `th-palette-opt-${key}`,
      displayName: key,
    }));

    const userPalettes: ThemePaletteItem[] = customPalettes.map((palette) => ({
      type: "custom",
      key: palette.code ?? palette.id ?? palette.name ?? "",
      id: palette.id ?? "",
      displayName: palette.displayName ?? palette.name ?? "Custom",
      palette,
    }));

    return [...systemPalettes, ...userPalettes];
  }, [customPalettes]);

  // On Load
  const onLoad = () => {
    const savedMode = getThemeMode();
    const savedPalette = getThemePalette();
    const savedCustomPalettes = getCustomPalettes();
    const savedSelectedCustomPaletteId = getSelectedCustomPaletteId();

    setThemeModeState(savedMode ?? "system");
    setThemePaletteState(savedPalette ?? "default");
    setCustomPalettesState(savedCustomPalettes);

    // Initial
    const initialCustomPalettes =
      savedCustomPalettes.length > 0
      ? savedCustomPalettes
      : EXAMPLE_currentCustomColorsPaletteList; // <- API sync point *1*
    
    setCustomPalettesState(initialCustomPalettes);
    
    const initialSelectedId = savedSelectedCustomPaletteId ?? EXAMPLE_currentCustomColorsPaletteId ?? null;

    if (initialSelectedId) {
      const found =
        initialCustomPalettes.find(p => p.id === initialSelectedId) ?? null;

      setSelectedCustomPaletteIdState(found?.id ?? null);
    } else {
      setSelectedCustomPaletteIdState(null);
    }
  }

  // 
  const onChangeThemeMode = () => {
    if (themeMode !== "system") return;
    
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChangeFavicon = (resolved: ThemeModeResolved) => {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!link) return;

      link.href =
        resolved === "dark"
          ? `/favicon/favicon-v2/favicon-v2-white.ico?v=${Date.now()}`
          : `/favicon/favicon-v2/favicon-v2-black.ico?v=${Date.now()}`;
    };

    const handleChangeThemeMode = () => {
      const resolved = getSystemThemeMode();
      root.setAttribute(HTML_KEY_MODE, resolved);
      handleChangeFavicon(resolved);
    };

    media.addEventListener("change", handleChangeThemeMode);

    return () => {
      media.removeEventListener("change", handleChangeThemeMode);
    };
  }

  // 
  const onChangeThemePalette = () => {
    const root = document.documentElement;

    root.setAttribute(HTML_KEY_PALETTE, currentThemePaletteCode);

    if (selectedCustomPalette) {
      if (selectedCustomPalette.colors.primaryColor) {
        root.style.setProperty("--color-primary", selectedCustomPalette.colors.primaryColor);
      }

      if (selectedCustomPalette.colors.primaryColorContrast) {
        root.style.setProperty("--color-primaryContrast", selectedCustomPalette.colors.primaryColorContrast);
      }

      return;
    }

    root.style.removeProperty("--color-primary");
    root.style.removeProperty("--color-primaryContrast");
  }

  // Effects

  // Initial Load
  useEffect(() => {
    onLoad()
  }, []);

  useEffect(() => {
    saveThemeMode(themeMode);
  }, [themeMode]);

  useEffect(() => {
    saveThemePalette(themePalette);
  }, [themePalette]);

  useEffect(() => {
    saveCustomPalettes(customPalettes);
  }, [customPalettes]);

  useEffect(() => {
    saveSelectedCustomPaletteId(selectedCustomPaletteId);
  }, [selectedCustomPaletteId]);

  useApplyTheme({
    themeMode,
    currentThemePaletteCode,
    selectedCustomPalette,
  });

  // Theme Mode Change
  useEffect(() => {
    onChangeThemeMode()
  }, [themeMode]);

  // Theme Palette Change
  useEffect(() => {
    onChangeThemePalette()
  }, [themeMode, currentThemePaletteCode, selectedCustomPalette]);

  // Sets

  const setThemeMode = (mode: ThemeModeOptions) => {
    setThemeModeState(mode);
  };

  const setThemePalette = (palette: ThemePaletteOptions) => {
    setThemePaletteState(palette);
    setSelectedCustomPaletteIdState(null);
  };

  const setSelectedCustomPaletteId = (id: string | null) => {
    if (!id) {
      setSelectedCustomPaletteIdState(null);
      setThemePaletteState("default");
      return;
    }

    const found = customPalettes.find((palette) => palette.id === id) ?? null;

    if (!found) {
      setSelectedCustomPaletteIdState(null);
      setThemePaletteState("default");
      return;
    }

    setSelectedCustomPaletteIdState(found.id);
    setThemePaletteState("default");
  };

  const setCustomPalettes = (list: TCustomPalettesColors) => {
    const next = list.slice(0, EXAMPLE_customColorsPaletteLimit);
    setCustomPalettesState(next);

    if (selectedCustomPaletteId) {
      const stillExists = next.some((palette) => palette.id === selectedCustomPaletteId);
      if (!stillExists) {
        setSelectedCustomPaletteIdState(null);
        setThemePaletteState("default");
      }
    }
  };

  const addCustomPalette = (palette: ICustomPalettesColors) => {
    setCustomPalettesState((prev) => {
      if (prev.length >= EXAMPLE_customColorsPaletteLimit) {
        console.warn("Custom palette limit reached");
        return prev;
      }

      if (palette.id && prev.some((item) => item.id === palette.id)) {
        return prev;
      }

      return [...prev, palette];
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        resolvedThemeMode: getResolvedThemeMode(themeMode),
        setThemeMode,

        themePalette,
        resolvedThemePalette: getResolvedThemePalette(themePalette),
        currentThemePaletteCode,
        setThemePalette,

        customPalettes,
        setCustomPalettes,
        addCustomPalette,

        selectedCustomPaletteId,
        setSelectedCustomPaletteId,
        selectedCustomPalette,

        allThemePalettes,
        customColorsPaletteLimit: EXAMPLE_customColorsPaletteLimit,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
