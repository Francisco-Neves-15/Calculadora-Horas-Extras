"use client";

import useGlobalStyles from "@/hooks/useGlobalStyles";
import { CSSProperties, forwardRef } from "react";

type TLineDirection =
  | "horizontal"
  | "vertical";


interface DivisorProps extends React.HTMLAttributes<HTMLDivElement> {
  show?: boolean;
  direction?: TLineDirection;
  thickness?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
};



export const DivisorLine = forwardRef<HTMLDivElement, DivisorProps>(
  (
    {
    show = true,
    direction = "horizontal",
    thickness = 1,
    color = undefined,
    className,
    style
    },
    ref
  ) => {  
    const { gColors } = useGlobalStyles();

    if (!show) return null;

    const resolvedColor = color ?? gColors.border;

    return (
      <div 
        ref={ref}
        style={{ 
          width: direction === "horizontal" ? "100%" : thickness, 
          minWidth: direction === "vertical" ? thickness : undefined,
          height: direction === "vertical" ? "100%" : thickness, 
          minHeight: direction === "horizontal" ? thickness : undefined,
          flexShrink: 0,
          alignSelf: direction === "horizontal" ? "stretch" : "auto",
          backgroundColor: resolvedColor, 
          borderRadius: 4, 
          ...style 
        }} 
        className={`${className}`}
      />
    )
  }
);
