"use client";

import { useContext } from "react";
import { AlertsContext } from "@/contexts/useAlertsContext";

export function useAlerts() {
  const context = useContext(AlertsContext);

  if (!context) {
    throw new Error("useAlerts must be used within AlertsProvider");
  }

  return context;
}
