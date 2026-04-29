"use client";

import { forwardRef } from "react";

// Styles
import fStyles from "./style.module.scss";

type TTextFonts = "urbanist" | "sora";
type TTextSizes = "display" | "h1" | "h2" | "h3" | "body" | "caption" | "micro" | "nano" | "button";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size: TTextSizes;
  font?: TTextFonts;
  color?: string | undefined;
  span?: boolean;
}

const Text = forwardRef<HTMLDivElement, TextProps>(({
  size,
  font = "urbanist", 
  color = null, 
  span = false, 
  className, 
  children, 
  ...props 
}, ref) => {

    const sizeConfig: Record<TTextSizes, string> = {
      display: "textDisplay",
      h1: "textH1",
      h2: "textH2",
      h3: "textH3",
      body: "textBody",
      caption: "textCaption",
      micro: "textMicro",
      nano: "textNano",
      button: "textButton",
    } as const;

    const getSize = (size: TTextSizes) => {
      return sizeConfig[size];
    };
    
    const fontConfig: Record<TTextFonts, string> = {
      sora: "fontSora",
      urbanist: "fontUrbanist",
    } as const;

    const getFont = (font: TTextFonts) => {
      return fontConfig[font];
    };

    return (
      <p
        ref={ref}
        className={`
          ${fStyles.textBase}
          ${fStyles[getSize(size)]}
          ${fStyles[getFont(font)]}
          ${span ? fStyles.textSpan : ""}
          ${className ?? ""}
        `}
        style={color ? { color } : undefined}
        {...props}
      >
        {children}
      </p>
    );
  }
);

export default Text;
Text.displayName = "Text";
