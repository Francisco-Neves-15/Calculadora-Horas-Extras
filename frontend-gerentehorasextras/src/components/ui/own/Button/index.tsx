"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

// Styles
import useGlobalStyles from "@/hooks/useGlobalStyles";
import fStyles from "./button.module.scss"

// Types
export type TButtonVariants = "main" | "outline" | "ghost" | "bg-dark" | "bg-light";
export type TButtonColors = "primary" | "info" | "warning" | "danger" | "success" | "neutral" | "theme";
export type TButtonSize = "small" | "normal";

import { getStyle, getVariantConfig, getSizeConfig } from "./button.style.utils";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariants;
  color?: TButtonColors;
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
    interaction = true,
    ...props 
  }, ref) => {

    const { gColors } = useGlobalStyles();

    // Styles
    const variantConfig = getVariantConfig(variant);
    const sizeConfig = getSizeConfig(size);

    return (
      <button 
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled}
        inert={disabled || !interaction}
        onClick={onClick}
        style={getStyle(gColors, variant, color)}
        className={`
          ${fStyles.btnBase}
          ${fStyles[variantConfig.class]}
          ${fStyles[sizeConfig.class]}
          ${fStyles.btnBaseEffects}
          ${disabled ? fStyles.btnDisable : null}
          ${!interaction ? fStyles.btnNoInteraction : null}
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
