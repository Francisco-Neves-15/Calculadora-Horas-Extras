"use client";

import { createContext, useCallback, useMemo, useState } from "react";

import { ToastsViewport } from "@/components/ui/feedback/toasts/ToastsViewport";
import type {
  InternalToast,
  ToastOptions,
  ToastPosition,
  ToastsApi,
} from "@/types/toasts";

export const ToastsContext = createContext<ToastsApi | null>(null);

type ToastsState = {
  visible: InternalToast[];
  queued: InternalToast[];
};

function fillVisible(state: ToastsState, maxVisible: number): ToastsState {
  if (state.visible.length >= maxVisible) return state;
  if (state.queued.length === 0) return state;

  const space = maxVisible - state.visible.length;
  const promoted = state.queued.slice(0, space);
  const remaining = state.queued.slice(space);

  return {
    visible: [...state.visible, ...promoted],
    queued: remaining,
  };
}

function normalizeGroup(group?: string): string | null {
  const value = group?.trim();
  return value ? value : null;
}

export function ToastsProvider({
  children,
  maxVisible = 3,
  defaultPosition = "bottom-left",
}: {
  children: React.ReactNode;
  maxVisible?: number;
  defaultPosition?: ToastPosition;
}) {
  const [state, setState] = useState<ToastsState>({ visible: [], queued: [] });

  const DEFAULT_VALUES = useMemo(
    () => ({
      variant: "default" as const,
      mode: "default" as const,
      position: defaultPosition,
      title: "",
      message: "",
      timeSec: 12000 as const,
      slide: true as const,
      stack: true as const,
      showDismissAction: false as const,
      actions: [] as const,
    }),
    [defaultPosition]
  );

  const dismiss = useCallback((id: string) => {
    setState((prev) => {
      const visible = prev.visible.filter((t) => t.id !== id);
      const queued = prev.queued.filter((t) => t.id !== id);
      return fillVisible({ visible, queued }, maxVisible);
    });
  }, [maxVisible]);

  const dismissGroup = useCallback((group: string) => {
    const normalized = normalizeGroup(group);
    if (!normalized) return;

    setState((prev) => {
      const visible = prev.visible.filter((t) => t.group !== normalized);
      const queued = prev.queued.filter((t) => t.group !== normalized);
      return fillVisible({ visible, queued }, maxVisible);
    });
  }, [maxVisible]);

  const clear = useCallback(() => {
    setState({ visible: [], queued: [] });
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const now = Date.now();
      const group = normalizeGroup(options.group);
      const stack = options.stack ?? DEFAULT_VALUES.stack;
      const showDismissAction =
        options.showDismissAction ?? DEFAULT_VALUES.showDismissAction;

      setState((prev) => {
        const nextBase: Omit<InternalToast, "id" | "createdAt" | "updatedAt"> = {
          group,
          stack,
          variant: options.variant ?? DEFAULT_VALUES.variant,
          mode: options.mode ?? DEFAULT_VALUES.mode,
          position: options.position ?? DEFAULT_VALUES.position,
          title: options.title ?? DEFAULT_VALUES.title,
          message: options.message ?? DEFAULT_VALUES.message,
          timeSec:
            options.timeSec ??
            (showDismissAction ? "inf" : DEFAULT_VALUES.timeSec),
          slide: options.slide ?? DEFAULT_VALUES.slide,
          showDismissAction,
          actions: options.actions ?? [...DEFAULT_VALUES.actions],
        };

        // stack=false + group => update latest toast of the same group, reset timer
        if (group && !stack) {
          const visibleIndex = [...prev.visible]
            .map((t, idx) => ({ t, idx }))
            .filter(({ t }) => t.group === group)
            .map(({ idx }) => idx)
            .at(-1);

          if (visibleIndex !== undefined) {
            const visible = prev.visible.slice();
            const current = visible[visibleIndex];
            visible[visibleIndex] = {
              ...current,
              ...nextBase,
              updatedAt: now,
            };
            return { visible, queued: prev.queued };
          }

          const queuedIndex = [...prev.queued]
            .map((t, idx) => ({ t, idx }))
            .filter(({ t }) => t.group === group)
            .map(({ idx }) => idx)
            .at(-1);

          if (queuedIndex !== undefined) {
            const queued = prev.queued.slice();
            const current = queued[queuedIndex];
            queued[queuedIndex] = {
              ...current,
              ...nextBase,
              updatedAt: now,
            };
            return { visible: prev.visible, queued };
          }
        }

        const item: InternalToast = {
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
          ...nextBase,
        };

        if (prev.visible.length < maxVisible) {
          return { visible: [...prev.visible, item], queued: prev.queued };
        }

        return { visible: prev.visible, queued: [...prev.queued, item] };
      });
    },
    [DEFAULT_VALUES, maxVisible]
  );

  const api = useMemo<ToastsApi>(
    () => ({ toast, dismiss, dismissGroup, clear }),
    [toast, dismiss, dismissGroup, clear]
  );

  // useEffect(() => {
  //   globalThis.toasts = api;
  // }, [api]);

  return (
    <ToastsContext.Provider value={api}>
      {children}
      <ToastsViewport items={state.visible} onDismiss={dismiss} />
    </ToastsContext.Provider>
  );
}
