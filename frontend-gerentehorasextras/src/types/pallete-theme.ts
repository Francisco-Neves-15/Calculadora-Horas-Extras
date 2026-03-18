// Availables themes
export const THEMES = {
  light: "light",
  dark: "dark",
  system: "system",
} as const;

export type ThemeOption = keyof typeof THEMES; 
export type ThemeResolved = Exclude<ThemeOption, "system">;

// Pallete/Colors types
export default interface IPalleteTheme {
// AUTO-GENERATED--PALLETE-THEME START
  "primary": string;
  "primaryContrast": string;
  "link": string;
  "info": string;
  "warning": string;
  "danger": string;
  "success": string;
  "neutral": string;
  "infoBg": string;
  "warningBg": string;
  "dangerBg": string;
  "successBg": string;
  "neutralBg": string;
  "text": string;
  "textSecondary": string;
  "bgBase": string;
  "bgBaseInverted": string;
  "bgSecondary": string;
  "bgSecondaryInverted": string;
  "muted": string;
  "mutedInverted": string;
  "border": string;
// AUTO-GENERATED--PALLETE-THEME END
}
