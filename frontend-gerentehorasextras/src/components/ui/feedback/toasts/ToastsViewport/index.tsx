"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { InternalToast, ToastAction } from "@/types/toasts";
import { useI18n } from "@/hooks/useI18n";

type ToastsViewportProps = {
  items: InternalToast[];
  onDismiss: (id: string) => void;
};

const POSITION = "bottom-left" as const;

function getViewportStyle(position: typeof POSITION): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    pointerEvents: "none",
    maxWidth: 360,
  };

  switch (position) {
    case "bottom-left":
      return { ...base, left: 16, bottom: 16, alignItems: "flex-start" };
  }
}

export function ToastsViewport({ items, onDismiss }: ToastsViewportProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div style={getViewportStyle(POSITION)}>
      {items.map((item) => (
        <ToastItem key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}

function ToastItem({
  item,
  onDismiss,
}: {
  item: InternalToast;
  onDismiss: (id: string) => void;
}) {
  const tCommon = useI18n("common");

  const isInfinite = item.timeSec === "inf";
  const timeMs = typeof item.timeSec === "number" ? item.timeSec : null;

  const [remaining, setRemaining] = useState(timeMs ?? 0);
  const closedRef = useRef(false);

  const requestDismiss = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onDismiss(item.id);
  }, [onDismiss, item.id]);

  useEffect(() => {
    closedRef.current = false;
  }, [item.updatedAt]);

  useEffect(() => {
    if (isInfinite) return;
    if (!timeMs) return;

    setRemaining(timeMs);
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setRemaining(Math.max(0, timeMs - elapsed));
    }, 50);

    const timeoutId = window.setTimeout(() => {
      requestDismiss();
    }, timeMs);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [isInfinite, timeMs, item.updatedAt, requestDismiss]);

  const handleActionClick = useCallback(
    async (action: ToastAction) => {
      try {
        await action.onClick();
        requestDismiss();
      } catch {
        // keep toast open on action errors
      }
    },
    [requestDismiss]
  );

  const progress = useMemo(() => {
    if (isInfinite) return null;
    if (!timeMs) return null;
    return { value: remaining, max: timeMs };
  }, [isInfinite, timeMs, remaining]);

  return (
    <SwipeableToastCard
      enabled={item.slide}
      onSwipeDismiss={requestDismiss}
      style={{
        pointerEvents: "auto",
        width: 320,
        border: "1px solid rgba(0,0,0,0.25)",
        background: "white",
        padding: 12,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {item.title ? (
            <div style={{ fontWeight: 600 }}>{item.title}</div>
          ) : null}
          {item.message ? <div>{item.message}</div> : null}
        </div>

        <button
          type="button"
          onClick={requestDismiss}
          aria-label={tCommon["common-close"] ?? "Close"}
          title={tCommon["common-close"] ?? "Close"}
          style={{ flex: "0 0 auto" }}
        >
          x
        </button>
      </div>

      {item.mode === "action" && item.actions.length ? (
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {item.actions.map((action, idx) => (
            <button
              key={`${item.id}-action-${idx}`}
              type="button"
              onClick={() => handleActionClick(action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}

      {progress ? (
        <progress style={{ marginTop: 8, width: "100%" }} value={progress.value} max={progress.max} />
      ) : null}
    </SwipeableToastCard>
  );
}

function SwipeableToastCard({
  enabled,
  onSwipeDismiss,
  style,
  children,
}: {
  enabled: boolean;
  onSwipeDismiss: () => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const startXRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const reset = useCallback(() => {
    setOffsetX(0);
    setDragging(false);
    startXRef.current = null;
    pointerIdRef.current = null;
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      pointerIdRef.current = event.pointerId;
      startXRef.current = event.clientX;
      setDragging(true);
      (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    },
    [enabled]
  );

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    if (!dragging) return;
    if (pointerIdRef.current !== event.pointerId) return;
    if (startXRef.current == null) return;
    setOffsetX(event.clientX - startXRef.current);
  }, [enabled, dragging]);

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      if (pointerIdRef.current !== event.pointerId) return;

      const shouldDismiss = Math.abs(offsetX) > 80;
      if (shouldDismiss) {
        onSwipeDismiss();
      } else {
        reset();
      }
    },
    [enabled, offsetX, onSwipeDismiss, reset]
  );

  const onPointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      if (pointerIdRef.current !== event.pointerId) return;
      reset();
    },
    [enabled, reset]
  );

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        ...style,
        transform: `translateX(${offsetX}px)`,
        transition: dragging ? "none" : "transform 150ms ease",
        touchAction: enabled ? "pan-y" : undefined,
      }}
    >
      {children}
    </div>
  );
}

