"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

// Components
import { Alert } from "@/components/ui/feedback/alerts/Alert";
import { Confirm } from "@/components/ui/feedback/alerts/Confirm";
import { Input } from "@/components/ui/feedback/alerts/Input";

// Types
import {
  AlertsApi,
  AlertOptions,
  ConfirmOptions,
  InputOptions,
  InternalItem,
} from "@/types/alerts";

// Hooks
import { useI18n } from "@/hooks/useI18n";

export const AlertsContext = createContext<AlertsApi | null>(null);

export function AlertsProvider({ children }: { children: React.ReactNode }) {

  const [queue, setQueue] = useState<InternalItem[]>([]);
  
  const tCommon = useI18n("common");

  // Default Values

  const DEFAULT_ALERT_VALUES = useMemo(
    () => ({
      title: "",
      message: "",
      okBtnText: tCommon["common-ok"],
      time: false,
      timeSec: 60000,
      timeBar: true,
    }),
    [tCommon]
  );

  const DEFAULT_CONFIRM_VALUES = useMemo(
    () => ({
      title: "",
      message: "",
      confirmText: tCommon["common-confirm"],
      cancelText: tCommon["common-cancel"],
    }),
    [tCommon]
  );

  const DEFAULT_INPUT_VALUES = useMemo(
    () => ({
      title: "",
      message: "",
      placeholder: tCommon["common-typeHere"],
      confirmText: tCommon["common-confirm"],
      cancelText: tCommon["common-cancel"],
    }),
    [tCommon]
  );

  // ALERT
  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setQueue((q) => [
        ...q,
        {
          type: "alert",
          id: crypto.randomUUID(),
          resolve,
          title: options.title ?? DEFAULT_ALERT_VALUES.title,
          message: options.message ?? DEFAULT_ALERT_VALUES.message,
          okBtnText: options.okBtnText ?? DEFAULT_ALERT_VALUES.okBtnText,
          onClose: options.onClose,
          time: options.time ?? DEFAULT_ALERT_VALUES.time,
          timeSec: options.timeSec ?? DEFAULT_ALERT_VALUES.timeSec,
          timeBar: options.timeBar ?? DEFAULT_ALERT_VALUES.timeBar,
        },
      ]);
    });
  }, [DEFAULT_ALERT_VALUES]);

  // CONFIRM
  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setQueue((q) => [
        ...q,
        {
          type: "confirm",
          id: crypto.randomUUID(),
          resolve,
          title: options.title ?? DEFAULT_CONFIRM_VALUES.title,
          message: options.message ?? DEFAULT_CONFIRM_VALUES.message,
          confirmText: options.confirmText ?? DEFAULT_CONFIRM_VALUES.confirmText,
          cancelText: options.cancelText ?? DEFAULT_CONFIRM_VALUES.cancelText,
        },
      ]);
    });
  }, [DEFAULT_CONFIRM_VALUES]);

  // INPUT
  const input = useCallback((options: InputOptions) => {
    return new Promise<string | null>((resolve) => {
      setQueue((q) => [
        ...q,
        {
          type: "input",
          id: crypto.randomUUID(),
          resolve,
          title: options.title ?? DEFAULT_INPUT_VALUES.title,
          message: options.message ?? DEFAULT_INPUT_VALUES.message,
          placeholder: options.placeholder ?? DEFAULT_INPUT_VALUES.placeholder,
          confirmText: options.confirmText ?? DEFAULT_INPUT_VALUES.confirmText,
          cancelText: options.cancelText ?? DEFAULT_INPUT_VALUES.cancelText,
        },
      ]);
    });
  }, [DEFAULT_INPUT_VALUES]);


  const active = useMemo(() => queue[0] ?? null, [queue]);
  const activeRef = useRef<InternalItem | null>(null);
  const handledIdsRef = useRef<Set<string>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

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

  const resolveConfirm = (value: boolean) => {
    setQueue((q) => {
      const [current, ...rest] = q;
      if (current?.type === "confirm") {
        if (!handledIdsRef.current.has(current.id)) {
          handledIdsRef.current.add(current.id);
          current.resolve(value);
        }
      }
      return rest;
    });
  };

  const resolveInput = (value: string | null) => {
    setQueue((q) => {
      const [current, ...rest] = q;
      if (current?.type === "input") {
        if (!handledIdsRef.current.has(current.id)) {
          handledIdsRef.current.add(current.id);
          current.resolve(value);
        }
      }
      return rest;
    });
  };

  useEffect(() => {
    clear();
  }, [pathname, clear]);

  // useEffect(() => {
  //   globalThis.alerts = { alert, confirm, input, dismiss, clear };

  //   // const api: AlertsApi = { alert };
  //   // return () => {
  //   //   if (globalThis.alerts === api) {
  //   //     delete globalThis.alerts;
  //   //   }
  //   // };

  // }, [alert, confirm, input, dismiss, clear]);

  return (
    <AlertsContext.Provider value={{ alert, confirm, input, dismiss, clear }}>
      {children}

      {active?.type === "alert" && (
        <Alert {...active} onClose={close} />
      )}

      {active?.type === "confirm" && (
        <Confirm
          {...active}
          onConfirm={() => resolveConfirm(true)}
          onCancel={() => resolveConfirm(false)}
        />
      )}

      {active?.type === "input" && (
        <Input
          {...active}
          onConfirm={resolveInput}
          onCancel={() => resolveInput(null)}
        />
      )}
    </AlertsContext.Provider>
  );
}
