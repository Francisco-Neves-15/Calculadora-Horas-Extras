import { ThemePaletteOptions } from "@/configs/theme-palette.metadata";

// Palette/Colors types
export interface IPaletteColors {
// AUTO-GENERATED--PALETTE-COLORS START
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
// AUTO-GENERATED--PALETTE-COLORS END
}

export interface ICustomPalettesColors {
  id: string | null; // 36b4fec0-923a-4d19-b6a9-defeb218cba9 (uuid)
  code: string | null; // th-palette-c-custom
  name: string | null; // custom1
  displayName: string | null; // Customized
  colors: {
    primaryColor: string | null; // #66277f
    primaryColorContrast: string | null; // #ffffff
  }
}

export type TCustomPalettesColors = ICustomPalettesColors[];

export type ThemePaletteItem =
  | {
      type: "system";
      key: ThemePaletteOptions;
      id: string;
      displayName: string;
    }
  | {
      type: "custom";
      key: string;
      id: string;
      displayName: string;
      palette: ICustomPalettesColors;
    };
