import type { AlertsApi } from "@/types/alerts";

declare global {
  var alerts: AlertsApi | undefined;
}

export {};