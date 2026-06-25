import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DELAY, DURATION, EASE, duration } from "../lib/motionTokens.js";

function getFocusableElements(container) {
  if (!container) return [];
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ];
  return Array.from(container.querySelectorAll(selectors.join(","))).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
  );
}

export function EmilModalDemo() {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 });
  const triggerRef = useRef(null);
  const modalRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const prefersReducedMotion = useReducedMotion();
  const modalCardVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0, y: 24, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0 }
        },
        exit: {
          opacity: 0,
          y: 12,
          scale: 0.985,
          transition: { duration: 0 }
        }
      }
    : {
        hidden: { opacity: 0, y: 24, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 280,
            damping: 26,
            mass: 0.9,
            delay: DELAY.modalCard
          }
        },
        exit: {
          y: [0, 22, 34],
          scale: [1, 0.985, 0.97],
          opacity: [1, 1, 0],
          filter: ["blur(0px)", "blur(0.2px)", "blur(0.8px)"],
          transition: {
            y: { duration: DURATION.base, ease: EASE.standard, times: [0, 0.72, 1] },
            scale: { duration: DURATION.base, ease: EASE.standard, times: [0, 0.72, 1] },
            opacity: { duration: DURATION.base, ease: EASE.standard, times: [0, 0.72, 1] },
            filter: { duration: DURATION.base, ease: EASE.standard, times: [0, 0.72, 1] }
          }
        }
      };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const focusables = getFocusableElements(modalRef.current);
    const first = focusables[0] || modalRef.current;
    if (first && typeof first.focus === "function") first.focus();

    const onTrap = (event) => {
      if (event.key !== "Tab") return;
      const modalFocusables = getFocusableElements(modalRef.current);
      if (modalFocusables.length === 0) {
        event.preventDefault();
        if (modalRef.current) modalRef.current.focus();
        return;
      }
      const firstEl = modalFocusables[0];
      const lastEl = modalFocusables[modalFocusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && active === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    window.addEventListener("keydown", onTrap);
    return () => window.removeEventListener("keydown", onTrap);
  }, [open]);

  useEffect(() => {
    if (open) return;
    if (triggerRef.current && typeof triggerRef.current.focus === "function") {
      triggerRef.current.focus();
    }
  }, [open]);

  const openModal = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setOrigin({ x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 });
    }
    setOpen(true);
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "button",
      { ref: triggerRef, className: "modal-demo-button", type: "button", onClick: openModal },
      "Open modal"
    ),
    React.createElement(
      AnimatePresence,
      { mode: "wait" },
      null,
      open
        ? React.createElement(
            motion.div,
            {
              className: "ek-modal-overlay",
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              transition: {
                duration: duration(DURATION.base, prefersReducedMotion),
                ease: EASE.standard
              }
            },
            React.createElement(motion.div, {
              className: "ek-modal-bloom",
              onClick: () => setOpen(false),
              role: "presentation",
              initial: { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` },
              animate: { clipPath: `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${origin.x}px ${origin.y}px)` },
              exit: { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` },
              transition: prefersReducedMotion
                ? { duration: 0 }
                : {
                    duration: DURATION.panelSlow,
                    ease: EASE.emphasized
                  }
            }),
            React.createElement(
              motion.article,
              {
                ref: modalRef,
                className: "ek-modal-card",
                role: "dialog",
                "aria-modal": "true",
                "aria-labelledby": titleId,
                "aria-describedby": descriptionId,
                tabIndex: -1,
                variants: modalCardVariants,
                initial: "hidden",
                animate: "visible",
                exit: "exit"
              },
              React.createElement(
                "header",
                { className: "ek-modal-head" },
                React.createElement("h3", { id: titleId, className: "ek-modal-title" }, "Modal with Trigger-Bloom Entrance"),
                React.createElement(
                  "p",
                  { id: descriptionId, className: "ek-modal-body" },
                  "The backdrop grows from the trigger first, then the card settles in. It feels connected and less abrupt."
                )
              ),
              React.createElement(
                "div",
                { className: "ek-modal-actions" },
                React.createElement(
                  "button",
                  {
                    className: "toast-control",
                    type: "button",
                    "aria-label": "Close modal",
                    onClick: () => setOpen(false)
                  },
                  "Close"
                )
              )
            )
          )
        : null
    )
  );
}
