"use client";

import { useContext } from "react";
import { ToastsContext } from "@/contexts/useToastsContext";

export function useToasts() {
  const context = useContext(ToastsContext);

  if (!context) {
    throw new Error("useToasts must be used within ToastsProvider");
  }

  return context;
}

