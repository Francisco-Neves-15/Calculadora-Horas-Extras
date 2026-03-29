"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type AlertProps = {
  title: string;
  msg: string;
  okBtnText: string;
  time: boolean;
  timeSec: number;
  timeBar: boolean;
  onClose: () => void;
};

export function Alert({
  title,
  msg,
  okBtnText,
  time,
  timeSec,
  timeBar,
  onClose,
}: AlertProps) {
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState(timeSec);
  const closedRef = useRef(false);

  const requestClose = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose();
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!time) return;

    setRemaining(timeSec);
    closedRef.current = false;

    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setRemaining(Math.max(0, timeSec - elapsed));
    }, 50);

    const timeoutId = window.setTimeout(() => {
      requestClose();
    }, timeSec);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [time, timeSec, requestClose]);

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center" }}>
      <div>
        {title ? <h2>{title}</h2> : null}
        {msg ? <p>{msg}</p> : null}

        <button type="button" onClick={requestClose}>
          {okBtnText}
        </button>

        {time && timeBar ? (
          <progress value={remaining} max={timeSec} />
        ) : null}
      </div>
    </div>,
    document.body
  );
}