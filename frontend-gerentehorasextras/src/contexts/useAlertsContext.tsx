"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

  const DEFAULT_ALERT_VALUES = {
    title: "",
    msg: "",
    okBtnText: tCommon["common-ok"],
    time: false,
    timeSec: 3000,
    timeBar: true,
  };

  const DEFAULT_CONFIRM_VALUES = {
    title: "",
    msg: "",
    confirmText: tCommon["common-confirm"],
    cancelText: tCommon["common-cancel"],
  };

  const DEFAULT_INPUT_VALUES = {
    title: "",
    msg: "",
    placeholder: tCommon["common-typeHere"],
    confirmText: tCommon["common-confirm"],
    cancelText: tCommon["common-cancel"],
  };

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
          msg: options.msg ?? DEFAULT_ALERT_VALUES.msg,
          okBtnText: options.okBtnText ?? DEFAULT_ALERT_VALUES.okBtnText,
          onClose: options.onClose,
          time: options.time ?? DEFAULT_ALERT_VALUES.time,
          timeSec: options.timeSec ?? DEFAULT_ALERT_VALUES.timeSec,
          timeBar: options.timeBar ?? DEFAULT_ALERT_VALUES.timeBar,
        },
      ]);
    });
  }, []);

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
          msg: options.msg ?? DEFAULT_CONFIRM_VALUES.msg,
          confirmText: options.confirmText ?? DEFAULT_CONFIRM_VALUES.confirmText,
          cancelText: options.cancelText ?? DEFAULT_CONFIRM_VALUES.cancelText,
        },
      ]);
    });
  }, []);

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
          msg: options.msg ?? DEFAULT_INPUT_VALUES.msg,
          placeholder: options.placeholder ?? DEFAULT_INPUT_VALUES.placeholder,
          confirmText: options.confirmText ?? DEFAULT_INPUT_VALUES.confirmText,
          cancelText: options.cancelText ?? DEFAULT_INPUT_VALUES.cancelText,
        },
      ]);
    });
  }, []);


  const active = useMemo(() => queue[0] ?? null, [queue]);

  const close = useCallback(() => {
    setQueue((q) => {
      const [current, ...rest] = q;

      if (!current) return q;

      if (current.type === "alert") {
        current.resolve();
        current.onClose?.();
      }

      return rest;
    });
  }, []);

  const resolveConfirm = (value: boolean) => {
    setQueue((q) => {
      const [current, ...rest] = q;
      if (current?.type === "confirm") current.resolve(value);
      return rest;
    });
  };

  const resolveInput = (value: string | null) => {
    setQueue((q) => {
      const [current, ...rest] = q;
      if (current?.type === "input") current.resolve(value);
      return rest;
    });
  };

  useEffect(() => {
    globalThis.alerts = { alert, confirm, input };

    // const api: AlertsApi = { alert };
    // return () => {
    //   if (globalThis.alerts === api) {
    //     delete globalThis.alerts;
    //   }
    // };

  }, [alert, confirm, input]);

  return (
    <AlertsContext.Provider value={{ alert, confirm, input }}>
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
