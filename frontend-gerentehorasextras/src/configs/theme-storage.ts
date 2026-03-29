export const THEME_STORAGE_KEYS = {
  mode: "client-theme-mode",
  palette: "client-theme-palette",
  colorPrimary: "client-theme-color-primary",
  colorPrimaryContrast: "client-theme-color-primary-contrast",
  colorPrimaryAlpha: "client-theme-color-primary-alpha",
} as const;

/** Defaults do app (alinhados ao `theme.scss`); o script `define-pallete-color.js` mantém este bloco. */
export type ThemePrimaryColors = {
  colorPrimary: string;
  colorPrimaryContrast: string;
  colorPrimaryAlpha: string;
};

export const THEME_COLOR_DEFAULTS: ThemePrimaryColors = {
// AUTO-GENERATED--PALETTE-COLORS START
  colorPrimary: "#27427F",
  colorPrimaryContrast: "#ffffff",
  colorPrimaryAlpha: "#27427f33",
// AUTO-GENERATED--PALETTE-COLORS END
};
