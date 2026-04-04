import React, {
  ReactNode,
  ReactElement,
  isValidElement,
  cloneElement,
  Children,
} from "react";

import fStyles from "./style.module.scss"

const TEXT_TAGS = new Set([
  "p",
  "span",
  "strong",
  "em",
  "b",
  "i",
  "small",
  "label",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
]);

// Safely merge className
const mergeClassName = (existing?: string) => {
  if (!existing) return fStyles.buttonText;
  if (existing.includes(fStyles.buttonText)) return existing;
  return `${fStyles.buttonText} ${existing}`;
};

// Recursive children resolver
export const resolveButtonChildren = (children: ReactNode): ReactNode => {
  return Children.map(children, (child) => {
    // Case: plain text
    if (typeof child === "string" || typeof child === "number") {
      if (String(child).trim() === "") return null;

      return <span className={fStyles.buttonText}>{child}</span>;
    }

    // Case: not a valid React element
    if (!isValidElement(child)) return child;

    const element = child as ReactElement<any>;
    const { type, props } = element;

    // Case: native HTML element
    if (typeof type === "string") {
      const isTextTag = TEXT_TAGS.has(type);

      const resolvedChildren = resolveButtonChildren(props.children);

      // Apply class only for text-related tags
      if (isTextTag) {
        return cloneElement(element, {
          className: mergeClassName(props.className),
          children: resolvedChildren,
        });
      }

      // Non-text elements: only propagate children
      return cloneElement(element, {
        children: resolvedChildren,
      });
    }

    // Case: custom component (e.g., icons)
    if (props?.children) {
      return cloneElement(element, {
        children: resolveButtonChildren(props.children),
      });
    }

    return element;
  });
};
