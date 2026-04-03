import { CSSProperties } from "react";

// Types
import { IPaletteColors } from "@/types/theme"

import { TButtonColors, TButtonSize, TButtonVariants } from ".";

// Internal Types

export type IColorConfig = {
  base: string;
  contrast?: string | null;
  alpha?: string | null;
};

interface ISizeConfig {
  class: string;
}

interface IVariantConfig { type: "uses-color" | "static"; class: string }

// ========== COLORS & VARIANT's ==========

const colorMap = (gColors: IPaletteColors): Record<TButtonColors, IColorConfig> => ({
  primary: {
    base: gColors.primary,
    contrast: gColors.primaryContrast,
    alpha: gColors.primaryAlpha,
  },
  info: {
    base: gColors.info,
    contrast: gColors.light,
    alpha: gColors.infoAlpha,
  },
  warning: {
    base: gColors.warning,
    contrast: gColors.light,
    alpha: gColors.warningAlpha,
  },
  danger: {
    base: gColors.danger,
    contrast: gColors.light,
    alpha: gColors.dangerAlpha,
  },
  success: {
    base: gColors.success,
    contrast: gColors.light,
    alpha: gColors.successAlpha,
  },
  neutral: {
    base: gColors.neutral,
    contrast: gColors.light,
    alpha: gColors.neutralAlpha,
  },
  theme: {
    base: gColors.bgBaseInverted,
    contrast: gColors.textSecondary,
    alpha: null,
  },
});

const variantConfig: Record<TButtonVariants, IVariantConfig> = {
  "main": { type: "uses-color", class: "btnVariantMain" },
  "outline": { type: "uses-color", class: "btnVariantOutline" },
  "ghost": { type: "uses-color", class: "btnVariantGhost" },
  "bg-light": { type: "static", class: "btnVariantBgLight" },
  "bg-dark": { type: "static", class: "btnVariantBgDark" },
} as const;

const resolveColors = (gColors: IPaletteColors, color: TButtonColors): IColorConfig => { 
  return colorMap(gColors)[color]; 
};

// ========== SIZE's ==========

const sizeConfig: Record<TButtonSize, ISizeConfig> = {
  small: { class: "btnSizeSmall" },
  normal: { class: "btnSizeNormal" },
} as const;

// ========== EXPORT's ==========

export const getStyle = (gColors: IPaletteColors, variant: TButtonVariants, color: TButtonColors): CSSProperties => {
  const config = variantConfig[variant];

  if (config.type === "static") return {};

  const c = resolveColors(gColors, color);

  return {
    "--btn-base": c.base,
    "--btn-contrast": c.contrast ?? gColors.text,
  } as CSSProperties;
};

export const getVariantConfig = (variant: TButtonVariants) => {
  return variantConfig[variant];
};

export const getSizeConfig = (size: TButtonSize) => {
  return sizeConfig[size];
};
