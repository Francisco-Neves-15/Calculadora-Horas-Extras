"use client";

import React, { forwardRef, useCallback, useEffect, useRef } from "react";

// Style
import fStyles from "../style.module.scss";

interface IAlertsContainer {
  children: React.ReactNode;
}

let alertsModalLockCount = 0;
let unlockBodyScrollFn: null | (() => void) = null;

function lockBodyScroll() {
  const body = document.body;
  const docEl = document.documentElement;

  const scrollY = window.scrollY || docEl.scrollTop || 0;
  const scrollbarWidth = Math.max(0, window.innerWidth - docEl.clientWidth);

  const prevStyle = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    paddingRight: body.style.paddingRight,
  };

  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.width = "100%";
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

  return () => {
    body.style.overflow = prevStyle.overflow;
    body.style.position = prevStyle.position;
    body.style.top = prevStyle.top;
    body.style.width = prevStyle.width;
    body.style.paddingRight = prevStyle.paddingRight;
    window.scrollTo(0, scrollY);
  };
}

function setMainInert(isInert: boolean) {
  const main = document.querySelector("main") as (HTMLElement & { inert?: boolean }) | null;
  if (!main) return () => {};

  const prevAriaHidden = main.getAttribute("aria-hidden");
  const prevInert = Boolean(main.inert);

  if (isInert) {
    main.setAttribute("aria-hidden", "true");
    main.inert = true;
  } else {
    if (prevAriaHidden === null) main.removeAttribute("aria-hidden");
    else main.setAttribute("aria-hidden", prevAriaHidden);
    main.inert = prevInert;
  }

  return () => {
    if (prevAriaHidden === null) main.removeAttribute("aria-hidden");
    else main.setAttribute("aria-hidden", prevAriaHidden);
    main.inert = prevInert;
  };
}

function getFocusableElements(container: HTMLElement) {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ];

  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(","))).filter((el) => {
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.hasAttribute("inert")) return false;
    const style = window.getComputedStyle(el);
    return style.visibility !== "hidden" && style.display !== "none";
  });
}

function focusInitial(container: HTMLElement) {
  const preferred = container.querySelector<HTMLElement>("[data-alert-autofocus]");
  if (preferred?.focus) {
    preferred.focus();
    return;
  }

  const focusables = getFocusableElements(container);
  if (focusables.length > 0) {
    focusables[0].focus();
    return;
  }

  container.focus();
}

const AlertsContainer = forwardRef<HTMLDivElement, IAlertsContainer>(({ children }, ref) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const setOverlayRef = useCallback(
    (node: HTMLDivElement | null) => {
      overlayRef.current = node;
      if (!ref) return;
      if (typeof ref === "function") ref(node);
      else ref.current = node;
    },
    [ref]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const container = popoverRef.current;
    if (!container) return;

    const focusables = getFocusableElements(container);
    if (focusables.length === 0) {
      e.preventDefault();
      container.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (!active || active === first || !container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    const prevActiveElement = document.activeElement as HTMLElement | null;

    alertsModalLockCount += 1;
    if (alertsModalLockCount === 1) unlockBodyScrollFn = lockBodyScroll();

    const restoreMain = setMainInert(true);

    const container = popoverRef.current;
    if (container) {
      // Ensures focus after the portal mounts.
      requestAnimationFrame(() => focusInitial(container));
    }

    const handleFocusIn = (event: FocusEvent) => {
      const currentContainer = popoverRef.current;
      if (!currentContainer) return;
      const target = event.target as Node | null;
      if (target && currentContainer.contains(target)) return;
      focusInitial(currentContainer);
    };

    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      restoreMain();

      alertsModalLockCount -= 1;
      if (alertsModalLockCount === 0) {
        unlockBodyScrollFn?.();
        unlockBodyScrollFn = null;
      }

      prevActiveElement?.focus?.();
    };
  }, []);

  return (
    <div ref={setOverlayRef} className={`${fStyles.alertsOverlay}`}>
      <div
        ref={popoverRef}
        className={`${fStyles.alertsPopover}`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  );
});

export default AlertsContainer;
AlertsContainer.displayName = "AlertsContainer";
