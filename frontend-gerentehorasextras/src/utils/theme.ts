import { 
  THEME_MODE_META,
  ThemeModeOptions,
  ThemeModeResolved 
} from "@/configs/theme-mode.metadata";

import { 
  THEME_PALETTE_META, 
  ThemePaletteOptions, 
  ThemePaletteResolved, 
  DEFAULT_THEME_PALETTE 
} from "@/configs/theme-palette.metadata";

// Mode

export const getResolvedThemeMode = (mode: ThemeModeOptions): ThemeModeResolved => {
  return THEME_MODE_META[mode].resolve();
};

export const getSystemThemeMode = (): ThemeModeResolved => {
  // fallback SSR
  if (typeof window === "undefined") return "light"; 

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Palette

export const getResolvedThemePalette = (palette: ThemePaletteOptions): ThemePaletteResolved => {
  return THEME_PALETTE_META[palette].resolve();
};

export const getDefaultThemePalette = (): ThemePaletteResolved => {
  return DEFAULT_THEME_PALETTE;
};
