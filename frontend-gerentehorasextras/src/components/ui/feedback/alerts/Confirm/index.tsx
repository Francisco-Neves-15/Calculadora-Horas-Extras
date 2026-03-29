"use client";

import { createPortal } from "react-dom";

export function Confirm({
  title,
  msg,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: any) {
  return createPortal(
    <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center" }}>
      <div>
        <h2>{title}</h2>
        <p>{msg}</p>

        <button onClick={onConfirm}>{confirmText}</button>
        <button onClick={onCancel}>{cancelText}</button>
      </div>
    </div>,
    document.body
  );
}