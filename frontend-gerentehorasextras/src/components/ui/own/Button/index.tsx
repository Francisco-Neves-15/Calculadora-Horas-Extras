"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

// Styles
import useGlobalStyles from "@/hooks/useGlobalStyles";
import fStyles from "./style.module.scss";

// Types
export type TButtonVariants = "main" | "secondary" | "outline" | "ghost" | "bg-dark" | "bg-light";
export type TButtonColors =
  | "primary"
  | "info"
  | "warning"
  | "danger"
  | "success"
  | "neutral"
  | "theme";
export type TButtonSize = "small" | "normal";
export type TButtonProportion = "normal" | "square";

import { getStyle, getVariantConfig, getSizeConfig } from "./button.style.utils";
import { resolveButtonChildren } from "./button.children.utils";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: TButtonVariants;
  color?: TButtonColors;
  size?: TButtonSize;
  proportion?: TButtonProportion;
  underline?: boolean;
  icon?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  interaction?: boolean;
}

const Button = forwardRef<HTMLButtonElement, IButtonProps>(
  (
    {
      variant = "main",
      color = "primary",
      size = "normal",
      proportion = "normal",
      underline = false,
      icon = false,
      onClick,
      disabled = false,
      interaction = true,
      children,
      ...props
    },
    ref
  ) => {
    const { gColors } = useGlobalStyles();

    const { className: userClassName, style: userStyle, ...restProps } = props;

    // Styles
    const variantConfig = getVariantConfig(variant);
    const sizeConfig = getSizeConfig(size);

    // Child
    const resolvedChildren = resolveButtonChildren(children, { underline });

    return (
      <button
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled}
        inert={disabled || !interaction}
        onClick={onClick}
        style={getStyle(gColors, variant, color, icon, userStyle)}
        className={`
          ${fStyles.btnBase}
          ${fStyles[variantConfig.class]}
          ${fStyles[sizeConfig.class]}
          ${proportion === "square" ? fStyles.square : ""}
          ${fStyles.btnBaseEffects}
          ${!interaction ? fStyles.btnNoInteraction : ""}
          ${disabled ? fStyles.btnDisable : ""}
          ${userClassName ?? ""}
        `}
        {...restProps}
      >
        {resolvedChildren}
      </button>
    );
  }
);

export default Button;
Button.displayName = "Button";
