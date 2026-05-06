"use client";

import { forwardRef } from "react";

type ViewProps = React.HTMLAttributes<HTMLDivElement>;

export const View = forwardRef<HTMLDivElement, ViewProps>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`
          flex flex-col
          ${className}
        `}
      {...props}
    >
      {children}
    </div>
  );
});
