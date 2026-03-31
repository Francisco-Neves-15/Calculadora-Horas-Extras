"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

import useGlobalStyles from "@/hooks/useGlobalStyles";

import fStyles from "./style.module.scss"

// Types
type TButtonVariants = "primary" | "outline" | "ghost" | "bg-dark" | "bg-light";
type TButtonColored = "primary" | "secondary" | "info" | "warning" | "danger" | "success" | "neutral";
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

    const getVariant = () => {
      let classes;
      switch (variant) {
        case "primary": {
          classes = `${fStyles.btnVariantPrimary}`
        }
      }
      return classes;
    }

    return (
      <button 
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled}
        inert={disabled || interaction}
        onClick={onClick}
        className={`
          ${fStyles.btnBase}
          ${getVariant()}
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
