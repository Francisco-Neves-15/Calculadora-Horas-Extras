// theme-palette.metadata.ts
import { getDefaultThemePalette } from "@/utils/theme";

export const THEMES_PALETTES = {
  ocean: "ocean",
  wine: "wine",
  default: "default",
} as const;

export type ThemePaletteOptions = keyof typeof THEMES_PALETTES;
export type ThemePaletteResolved = Exclude<ThemePaletteOptions, "default">;

type ThemePaletteMeta = {
  id: string;
  resolve: () => ThemePaletteResolved;
};

export const THEME_PALETTE_META: Record<ThemePaletteOptions, ThemePaletteMeta> = {
  ocean: {
    id: "th-palette-opt-ocean",
    resolve: () => "ocean",
  },
  wine: {
    id: "th-palette-opt-wine",
    resolve: () => "wine",
  },
  default: {
    id: "th-palette-opt-default",
    resolve: () => getDefaultThemePalette(),
  },
};

export const DEFAULT_THEME_PALETTE: ThemePaletteResolved = "ocean";
