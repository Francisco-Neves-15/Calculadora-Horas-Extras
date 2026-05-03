import React from "react";

export function normalizeSearchText(raw: unknown): string {
  return String(raw ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function extractTextFromNode(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromNode).join(" ");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) { return extractTextFromNode(node.props.children); }
  return "";
}
