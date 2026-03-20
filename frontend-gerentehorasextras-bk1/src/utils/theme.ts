import { THEME_MODE_META, ThemeModeOptions, ThemeModeResolved } from "@/configs/theme.metadata";

export const getResolvedThemeMode = (theme: ThemeModeOptions): ThemeModeResolved => {
  return THEME_MODE_META[theme].resolve();
};

export const getSystemThemeMode = (): ThemeModeResolved => {
  // fallback SSR
  if (typeof window === "undefined") return "light"; 

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};
