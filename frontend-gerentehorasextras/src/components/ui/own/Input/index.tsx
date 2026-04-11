"use client"

import { forwardRef, useState } from "react";

// Styles
import useGlobalStyles from "@/hooks/useGlobalStyles";
import fStyles from "./style.module.scss"

// Icons
import { LuEye, LuEyeClosed, LuSearch } from "react-icons/lu"

type TInputVariant = "text" | "number" | "date" | "time" | "password" | "search";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: TInputVariant;

  containerClassName?: string;
  containerStyle?: React.CSSProperties;

  className?: string;
  style?: React.CSSProperties;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    variant = "text",
    placeholder,

    containerClassName,
    containerStyle,

    className,
    style,

    ...props 
  }, ref) => {

    const { gColors } = useGlobalStyles();

    const [focused, setFocused] = useState(false);

    const classConfig: Record<TInputVariant, string> = {
      text: "",
      number: "",
      date: "",
      time: "",
      password: "",
      search: "",
    } as const;

    // const getClassConfig = (size: TTextSizes) => { return classConfig[size]; };
      
    return (
      <div
        className={`
          ${fStyles.inputContainer}
          ${focused ? fStyles.inputContainerFocused : ""}
          ${containerClassName ?? ""}
        `}
        style={containerStyle}
      >
        {variant === "text" && (
          <input
            ref={ref}
            type="text"
            placeholder={placeholder}
            className={className}
            style={style}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
        )}
      </div>
      // <p
      //   ref={ref}
      //   className={`
      //     ${fStyles.textBase}
      //     ${fStyles[getClassConfig(size)]}
      //     ${span ? fStyles.textSpan : ""}
      //     ${className}
      //   `}
      //   style={{ color: color ? color : gColors.text }}
      //   {...props}
      // >
      //   {children}
      // </p>
    )
  }
);

export default Input;
Input.displayName = "Input";
