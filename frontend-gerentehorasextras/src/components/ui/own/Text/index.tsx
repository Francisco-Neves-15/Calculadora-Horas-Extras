"use client";

import { forwardRef } from "react";

// Styles
import fStyles from "./style.module.scss";

type TTextSizes = "display" | "h1" | "h2" | "h3" | "body" | "caption" | "micro" | "nano" | "button";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size: TTextSizes;
  color?: string | undefined;
  span?: boolean;
}

const Text = forwardRef<HTMLDivElement, TextProps>(
  ({ size, color = null, span = false, className, children, ...props }, ref) => {

    const classConfig: Record<TTextSizes, string> = {
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

    const getClassConfig = (size: TTextSizes) => {
      return classConfig[size];
    };

    return (
      <p
        ref={ref}
        className={`
          ${fStyles.textBase}
          ${fStyles[getClassConfig(size)]}
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
