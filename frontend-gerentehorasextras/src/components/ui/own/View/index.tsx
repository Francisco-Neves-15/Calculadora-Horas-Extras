"use client"

import { forwardRef } from "react";

interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {}

const View = forwardRef<HTMLDivElement, ViewProps>(
  ({
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          flex flex-col justify-start justify-items-start items-start content-start
          ${props.className}
        `}
        {...props}
      >
        {props.children}
      </div>
    )
  }
);

export default View;
View.displayName = "View";
