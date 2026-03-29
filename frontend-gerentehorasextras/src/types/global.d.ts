import type { AlertsApi } from "@/types/alerts";

declare global {
  // eslint-disable-next-line no-var
  var alerts: AlertsApi;
}

export {};

import type { AlertsApi } from "@/types/alerts";

declare global {
  var alerts: AlertsApi | undefined;
}

export {};