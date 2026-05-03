"use client";

import useGlobalStyles from "@/hooks/useGlobalStyles";
import { CSSProperties } from "react";

type TLineDirection =
  | "horizontal"
  | "vertical"

interface IDivisorLine {
  show?: boolean;
  direction?: TLineDirection;
  thickness?: number;
  color?: string | null;
  className?: string;
  style?: CSSProperties;
}

const DivisorLine = ({
  show = true,
  direction = "horizontal",
  thickness = 1,
  color = null,
  className,
  style
}: IDivisorLine) => {
  const { gColors } = useGlobalStyles();

  if (!show) return null;

  const resolvedColor = color ?? gColors.border;

  return (
    <div 
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

export default DivisorLine;
DivisorLine.displayName = "DivisorLine";
