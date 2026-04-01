"use client";
import { ButtonHTMLAttributes, CSSProperties, forwardRef } from "react";

// Styles
import useGlobalStyles from "@/hooks/useGlobalStyles";
import fStyles from "./style.module.scss"

// Types
import { BaseColorConfig } from "@/types/theme";

// Types
type TButtonVariants = "primary" | "invert" | "outline" | "ghost" | "bg-dark" | "bg-light";
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
    variant = "primary",
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

    const getVariant = () => {
      let classes;
      switch (variant) {
        case "invert": {
          classes = `${fStyles.btnVariantInvert}`
        };
      }
      return classes;
    }

    const getStyle = () => {
      const c = resolveColors();
      let styles: CSSProperties = {};
      switch (variant) {
        case "primary":
          styles = { color: c.contrast ?? "#ffffff", backgroundColor: c.base }
        break;
        case "invert":
          styles = {
            "--btn-bg": c.contrast ?? "#ffffff",
            "--btn-color": c.base,
            "--btn-border": c.base,
          } as CSSProperties;
        break;
        case "outline":
          styles = { color: c.base, backgroundColor: "transparent", borderWidth: 2, borderColor: c.base, borderStyle: "solid" }
        break;
        case "ghost":
          styles = { color: gColors.text, backgroundColor: "transparent" }
        break;
        case "bg-light":
          styles = { color: "#000000", backgroundColor: "rgba(255, 255, 255, 0.75)" }
        break;
        case "bg-dark":
          styles = { color: "#ffffff", backgroundColor: "rgba(0, 0, 0, 0.75)" }
        break;
      }
      return styles;
    }

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
          ${getVariant}
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
