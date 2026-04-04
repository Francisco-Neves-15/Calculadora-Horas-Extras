"use client";

import React, { forwardRef } from "react";
import { createPortal } from "react-dom";

// Style
import useGlobalStyles from "@/hooks/useGlobalStyles";
import fStyles from "../style.module.scss";

// Icon
import { LuX } from "react-icons/lu"

interface IAlertsContainer {
  children: React.ReactNode
}

const AlertsContainer = forwardRef<HTMLDivElement, IAlertsContainer>(
  ({
    children
  }, ref) => {

    const { gColors } = useGlobalStyles();

    return (
      <div className={`${fStyles.alertsOverlay}`}>
        <div className={`${fStyles.alertsPopover}`}>
          {children}
        </div>
      </div>
    );
  }
);

export default AlertsContainer;
AlertsContainer.displayName = "AlertsContainer";
