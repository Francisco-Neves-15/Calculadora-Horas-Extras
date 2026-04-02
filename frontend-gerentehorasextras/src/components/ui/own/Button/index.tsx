"use client";
import { ButtonHTMLAttributes, CSSProperties, forwardRef } from "react";

// Styles
import useGlobalStyles from "@/hooks/useGlobalStyles";
import fStyles from "./style.module.scss"

// Types
import { BaseColorConfig } from "@/types/theme";

// Types
type TButtonVariants = "main" | "invert" | "outline" | "ghost" | "bg-dark" | "bg-light";
interface IVariantConfig { type: "uses-color" | "static"; class: string }

type TButtonColored = "primary" | "info" | "warning" | "danger" | "success" | "neutral" | "theme" | "muted";

type TButtonSize = "small" | "normal" | "large";


interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariants;
  color?: TButtonColored;
  size?: TButtonSize;
  icon?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  interaction?: boolean;
}

const Button = forwardRef<HTMLButtonElement, IButtonProps>(
  ({ 
    variant = "main",
    color = "primary",
    size = "normal",
    icon = false,
    onClick,
    disabled = false,
    interaction = false,
    ...props 
  }, ref) => {

    const { gColors } = useGlobalStyles();

    const colorMap = (): Record<TButtonColored, BaseColorConfig> => ({
      primary: {
        base: gColors.primary,
        contrast: gColors.primaryContrast,
        alpha: gColors.primaryAlpha,
      },
      info: {
        base: gColors.info,
        contrast: null,
        alpha: gColors.infoAlpha,
      },
      warning: {
        base: gColors.warning,
        contrast: null,
        alpha: gColors.warningAlpha,
      },
      danger: {
        base: gColors.danger,
        contrast: null,
        alpha: gColors.dangerAlpha,
      },
      success: {
        base: gColors.success,
        contrast: null,
        alpha: gColors.successAlpha,
      },
      neutral: {
        base: gColors.neutral,
        contrast: null,
        alpha: gColors.neutralAlpha,
      },
      theme: {
        base: gColors.bgBase,
        contrast: gColors.bgBaseInverted,
        alpha: null,
      },
      muted: {
        base: gColors.muted,
        contrast: null,
        alpha: null,
      },
    });
  
    const resolveColors = (): BaseColorConfig => { return colorMap()[color]; };

    const variantConfig: Record<TButtonVariants, IVariantConfig> = {
      "main": { type: "uses-color", class: "btnVariantFilled" },
      "outline": { type: "uses-color", class: "btnVariantOutline" },
      "invert": { type: "uses-color", class: "btnVariantInvert" },
      "ghost": { type: "uses-color", class: "btnVariantGhost" },
      "bg-light": { type: "static", class: "btnVariantBgLight" },
      "bg-dark": { type: "static", class: "btnVariantBgDark" },
    } as const;

    const getStyle = (): CSSProperties => {
      const config = variantConfig[variant];

      if (config.type === "static") return {};

      const c = resolveColors();

      return {
        "--btn-base": c.base,
        "--btn-contrast": c.contrast ?? "#fff",
      } as CSSProperties;
    };

    const config = variantConfig[variant];

    return (
      <button 
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled}
        inert={disabled || interaction}
        onClick={onClick}
        style={getStyle()}
        className={`
          ${fStyles.btnBase}
          ${fStyles[config.class]}
          ${fStyles.btnBaseEffects}
        `}
        {...props}
      >
        {props.children}
      </button>
    );
  }
);

export default Button;
Button.displayName = "Button";
