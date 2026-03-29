"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

export function Input({
  title,
  message,
  placeholder,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: any) {
  const [value, setValue] = useState("");

  return createPortal(
    <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center" }}>
      <div>
        <h2>{title}</h2>
        <p>{message}</p>

        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
        />

        <button onClick={() => onConfirm(value)}>
          {confirmText}
        </button>

        <button onClick={onCancel}>
          {cancelText}
        </button>
      </div>
    </div>,
    document.body
  );
}