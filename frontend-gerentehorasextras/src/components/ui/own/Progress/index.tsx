"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import useGlobalStyles from "@/hooks/useGlobalStyles";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  barColor?: string | null;
  wrapperColor?: string | null;
  value?: number;
  max?: number;
  onComplete?: () => void;
  autoStart?: boolean;
  duration?: number; // fixed time (ignored if value)
  width?: number | "full";
  height?: number | "full";
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      barColor = null,
      wrapperColor = null,
      value,
      max = 100,
      duration,
      autoStart = true,
      onComplete,
      width = 160,
      height = 16,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const { gColors } = useGlobalStyles();

    const [internalValue, setInternalValue] = useState(0);
    const rafRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    useEffect(() => {
      if (!duration || !autoStart || isControlled) return;

      const step = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        setInternalValue(progress * max);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          onComplete?.();
        }
      };

      rafRef.current = requestAnimationFrame(step);

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [duration, autoStart, isControlled, max, onComplete]);

    const percent = Math.min((currentValue / max) * 100, 100);

    // Colors
    const finalBarColor = barColor ?? gColors.success;
    const finalWrapperColor = wrapperColor ?? gColors.bgBaseInverted;

    // Size
    const computedStyle: React.CSSProperties = {
      width: width === "full" ? "100%" : width,
      height: height === "full" ? "100%" : height,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden ${className ?? ""}`}
        style={computedStyle}
        {...props}
      >
        <div
          className="w-full h-full"
          style={{ backgroundColor: finalWrapperColor }}
        >
          <div
            className="h-full transition-[width] duration-100 ease-linear"
            style={{
              width: `${percent}%`,
              backgroundColor: finalBarColor,
            }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";
export default Progress;
