"use client";

import React, { forwardRef } from "react";

// Style
import fStyles from "../style.module.scss";

interface IAlertsContainer {
  children: React.ReactNode
}

const AlertsContainer = forwardRef<HTMLDivElement, IAlertsContainer>(
  ({
    children
  }, ref) => {

    return (
      <div ref={ref} className={`${fStyles.alertsOverlay}`}>
        <div className={`${fStyles.alertsPopover}`}>
          {children}
        </div>
      </div>
    );
  }
);

export default AlertsContainer;
AlertsContainer.displayName = "AlertsContainer";
