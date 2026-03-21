import { getSystemThemeMode } from "@/utils/theme"

// Availables themes modes
export const THEMES_MODES = {
  light: "light",
  dark: "dark",
  system: "system",
} as const;

export type ThemeModeOptions = keyof typeof THEMES_MODES; 
export type ThemeModeResolved = Exclude<ThemeModeOptions, "system">;

type ThemeModeMeta = {
  id: string;
  resolve: () => ThemeModeResolved;
};

export const THEME_MODE_META: Record<ThemeModeOptions, ThemeModeMeta> = {
  light: {
    id: "th-mode-opt-light",
    resolve: () => "light",
  },
  dark: {
    id: "th-mode-opt-dark",
    resolve: () => "dark",
  },
  system: {
    id: "th-mode-opt-system",
    resolve: () => getSystemThemeMode(),
  },
};
