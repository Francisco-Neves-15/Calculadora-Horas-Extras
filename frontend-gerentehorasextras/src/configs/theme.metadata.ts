import { getSystemThemeMode } from "@/utils/theme"

// Availables themes modes
export const THEMES_MODES = {
  light: "light",
  dark: "dark",
  system: "system",
} as const;

export type ThemeModeOptions = keyof typeof THEMES_MODES; 
export type ThemeModeResolved = Exclude<ThemeModeOptions, "system">;

// Availables themes palettes
export const THEMES_PALETTES = {
  blue: "blue",
  red: "red",
} as const;

export type ThemePaletteOptions = keyof typeof THEMES_PALETTES;

// Exposed infos to use

type ThemeModeMeta = {
  id: string;
  resolve: () => ThemeModeResolved;
};

export const THEME_MODE_META: Record<ThemeModeOptions, ThemeModeMeta> = {
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
    resolve: () => getSystemThemeMode(),
  },
};
