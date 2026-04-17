"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Components
import { AlertsAlert } from "@/components/ui/feedback/alerts/AlertsAlert";
import { AlertsConfirm } from "@/components/ui/feedback/alerts/AlertsConfirm";
import { AlertsInput } from "@/components/ui/feedback/alerts/AlertsInput";

// Types
import {
  AlertsApi,
  IAlertsAlert,
  IAlertsConfirm,
  IAlertsInput,
  InternalItem,
} from "@/types/alerts";

// Utils
import useAlertsDefaultValues from "@/utils/values/alerts";

export const AlertsContext = createContext<AlertsApi | null>(null);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<InternalItem[]>([]);

  const {
    DEFAULT_ALERT_VALUES,
    DEFAULT_CONFIRM_VALUES,
    DEFAULT_INPUT_VALUES,
  } = useAlertsDefaultValues();

  const pathname = usePathname();

  const handledIdsRef = useRef<Set<string>>(new Set());

  const handleItem = useCallback((item: InternalItem) => {
    if (handledIdsRef.current.has(item.id)) return;
    handledIdsRef.current.add(item.id);

    if (item.type === "alert") {
      item.resolve();
      item.onClose?.();
      return;
    }

    if (item.type === "confirm") {
      item.resolve(false);
      return;
    }

    if (item.type === "input") {
      item.resolve(null);
      return;
    }
  }, []);

  // ALERT
  const alert = useCallback(
    (options: IAlertsAlert) => {
      return new Promise<void>((resolve) => {
        setQueue((q) => [
          ...q,
          {
            id: crypto.randomUUID(),
            type: "alert",
            resolve,
            // External
            ...DEFAULT_ALERT_VALUES,
            ...options,
            btnOptions: { ...DEFAULT_ALERT_VALUES.btnOptions, ...options.btnOptions },
            timeOptions: { ...DEFAULT_ALERT_VALUES.timeOptions, ...options.timeOptions },
          },
        ]);
      });
    },
    [DEFAULT_ALERT_VALUES]
  );

  // CONFIRM
  const confirm = useCallback(
    (options: IAlertsConfirm) => {
      return new Promise<boolean>((resolve) => {
        setQueue((q) => [
          ...q,
          {
            type: "confirm",
            id: crypto.randomUUID(),
            resolve,
            // External
            ...DEFAULT_CONFIRM_VALUES,
            ...options,
            confirmOptions: { ...DEFAULT_CONFIRM_VALUES.confirmOptions, ...options.confirmOptions },
            cancelOptions: { ...DEFAULT_CONFIRM_VALUES.cancelOptions, ...options.cancelOptions },
          },
        ]);
      });
    },
    [DEFAULT_CONFIRM_VALUES]
  );

  // INPUT
  const input = useCallback(
    (options: IAlertsInput) => {
      return new Promise<string | null>((resolve) => {
        setQueue((q) => [
          ...q,
          {
            type: "input",
            id: crypto.randomUUID(),
            resolve,
            // External
            ...DEFAULT_INPUT_VALUES,
            ...options,
            confirmOptions: { ...DEFAULT_INPUT_VALUES.confirmOptions, ...options.confirmOptions },
            cancelOptions: { ...DEFAULT_INPUT_VALUES.cancelOptions, ...options.cancelOptions },
          },
        ]);
      });
    },
    [DEFAULT_INPUT_VALUES]
  );

  const active = useMemo(() => queue[0] ?? null, [queue]);
  const activeRef = useRef<InternalItem | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const close = useCallback(() => {
    const current = activeRef.current;
    if (!current) return;
    handleItem(current);

    setQueue((q) => (q[0]?.id === current.id ? q.slice(1) : q));
  }, [handleItem]);

  const dismiss = useCallback(() => {
    setQueue((q) => {
      const [current, ...rest] = q;
      if (current) handleItem(current);
      return rest;
    });
  }, [handleItem]);

  const clear = useCallback(() => {
    setQueue((q) => {
      q.forEach(handleItem);
      return [];
    });
  }, [handleItem]);

  const resolveConfirm = useCallback((value: boolean) => {
    setQueue((q) => {
      const current = q[0];
      if (current?.type === "confirm") {
        if (!handledIdsRef.current.has(current.id)) {
          handledIdsRef.current.add(current.id);
          current.resolve(value);
        }
        return q.slice(1);
      }
      return q;
    });
  }, []);

  const resolveInput = useCallback((value: string | null) => {
    setQueue((q) => {
      if (q.length === 0) return q;

      const current = q[0];
      if (current.type === "input") {
        if (!handledIdsRef.current.has(current.id)) {
          handledIdsRef.current.add(current.id);
          current.resolve(value);
        }
        return q.slice(1);
      }
      return q;
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    clear();
  }, [pathname, clear]);

  return (
    <AlertsContext.Provider value={{ alert, confirm, input, dismiss, clear }}>
      {children}

      {active?.type === "alert" && <AlertsAlert key={active.id} {...active} onClose={close} />}

      {active?.type === "confirm" && (
        <AlertsConfirm
          key={active.id}
          {...active}
          onConfirm={() => resolveConfirm(true)}
          onCancel={() => resolveConfirm(false)}
        />
      )}

      {active?.type === "input" && (
        <AlertsInput key={active.id} {...active} onConfirm={resolveInput} onCancel={() => resolveInput(null)} />
      )}
    </AlertsContext.Provider>
  );
}
