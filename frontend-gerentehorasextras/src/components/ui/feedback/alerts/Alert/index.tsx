"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!time) return;

    setRemaining(timeSec);

    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setRemaining(Math.max(0, timeSec - elapsed));
    }, 0);

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, timeSec);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [time, timeSec, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center" }}>
      <div>
        {title ? <h2>{title}</h2> : null}
        {msg ? <p>{msg}</p> : null}

        <button type="button" onClick={onClose}>
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