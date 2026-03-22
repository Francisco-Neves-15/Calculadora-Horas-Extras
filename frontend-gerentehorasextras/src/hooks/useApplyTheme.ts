import { useEffect } from "react";

import { ThemeModeOptions } from "@/configs/theme-mode.metadata";

import { getResolvedThemeMode } from "@/utils/theme";
import { ICustomPalettesColors } from "@/types/theme";

interface IUseApplyTheme {
  themeMode: ThemeModeOptions;
  currentThemePaletteCode: string;
  selectedCustomPalette: ICustomPalettesColors | null;
}

export function useApplyTheme({
  themeMode,
  currentThemePaletteCode,
  selectedCustomPalette,
}: IUseApplyTheme) {
  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-theme-mode", getResolvedThemeMode(themeMode));
    root.setAttribute("data-theme-palette", currentThemePaletteCode);

    if (selectedCustomPalette) {
      root.style.setProperty("--color-primary", selectedCustomPalette.colors.primaryColor ?? "");
      root.style.setProperty("--color-primaryContrast", selectedCustomPalette.colors.primaryColorContrast ?? "");
    } else {
      root.style.removeProperty("--color-primary");
      root.style.removeProperty("--color-primaryContrast");
    }
  }, [themeMode, currentThemePaletteCode, selectedCustomPalette]);
}
