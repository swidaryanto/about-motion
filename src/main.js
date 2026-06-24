      import React, { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.2.0";
      import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
      import { AnimatePresence, motion, useReducedMotion } from "https://esm.sh/framer-motion@11.2.10?deps=react@18.2.0";

      function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
      }

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
        return Array.from(container.querySelectorAll(selectors.join(","))).filter((el) => !el.hasAttribute("disabled"));
      }

      function isMobileLayout() {
        return window.innerWidth <= 760;
      }

      function getMobileCenteredX(width) {
        return clamp((window.innerWidth - width) * 0.5, 8, window.innerWidth - width - 8);
      }

      function getMobileStackY(offset) {
        return clamp(offset, 12, window.innerHeight - 44);
      }

      function getDefaultLoadingPos() {
        const toast = getDefaultToastPos();
        const panelWidth = Math.min(420, Math.max(240, window.innerWidth - 44));
        const panelHeight = 236;
        if (isMobileLayout()) {
          return {
            x: getMobileCenteredX(Math.min(420, Math.max(260, window.innerWidth - 16))),
            y: getMobileStackY(24)
          };
        }
        return {
          x: clamp(toast.x, 24, window.innerWidth - panelWidth - 24),
          y: clamp(toast.y - panelHeight - 34, 24, window.innerHeight - panelHeight - 24)
        };
      }

      function getDefaultMotionExamplesPos() {
        const toast = getDefaultToastPos();
        const width = Math.min(420, Math.max(240, window.innerWidth - 44));
        if (isMobileLayout()) {
          const mobileWidth = Math.min(420, Math.max(260, window.innerWidth - 16));
          return {
            x: getMobileCenteredX(mobileWidth),
            y: getMobileStackY(toast.y + 188)
          };
        }
        return {
          x: clamp(toast.x, 24, window.innerWidth - width - 24),
          y: clamp(toast.y + 286, 20, window.innerHeight - 240)
        };
      }

      function getDefaultToastPos() {
        const width = Math.min(420, Math.max(240, window.innerWidth - 44));
        const height = 252;
        if (isMobileLayout()) {
          const mobileWidth = Math.min(420, Math.max(260, window.innerWidth - 16));
          return {
            x: getMobileCenteredX(mobileWidth),
            y: clamp(438, 160, window.innerHeight - 208)
          };
        }
        return {
          x: clamp(window.innerWidth * 0.5 - 320, 24, window.innerWidth - width - 24),
          y: clamp(window.innerHeight * 0.36, 120, window.innerHeight - height - 24)
        };
      }

      function useDraggablePosition(defaultPosFactory) {
        const ref = useRef(null);
        const [pos, setPos] = useState(() => defaultPosFactory());
        const [dragging, setDragging] = useState(false);
        const drag = useRef({
          active: false,
          offsetX: 0,
          offsetY: 0,
          nextX: 0,
          nextY: 0,
          rafId: 0
        });

        useEffect(() => {
          const onMove = (event) => {
            if (!drag.current.active || !ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const left = event.clientX - drag.current.offsetX;
            const top = event.clientY - drag.current.offsetY;
            drag.current.nextX = clamp(left, 0, window.innerWidth - rect.width);
            drag.current.nextY = clamp(top, 0, window.innerHeight - rect.height);
            if (drag.current.rafId) return;
            drag.current.rafId = requestAnimationFrame(() => {
              drag.current.rafId = 0;
              setPos({ x: drag.current.nextX, y: drag.current.nextY });
            });
          };

          const onUp = () => {
            drag.current.active = false;
            setDragging(false);
          };

          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
          window.addEventListener("pointercancel", onUp);
          return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            if (drag.current.rafId) cancelAnimationFrame(drag.current.rafId);
          };
        }, []);

        useEffect(() => {
          const onResize = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            setPos((prev) => ({
              x: clamp(prev.x, 0, window.innerWidth - rect.width),
              y: clamp(prev.y, 0, window.innerHeight - rect.height)
            }));
          };
          window.addEventListener("resize", onResize);
          return () => window.removeEventListener("resize", onResize);
        }, []);

        const onPointerDown = (event) => {
          if (!ref.current) return;
          if (isMobileLayout()) return;
          if (event.button !== 0) return;
          if (event.target && event.target.closest("[data-no-drag='true']")) return;
          if (drag.current.rafId) {
            cancelAnimationFrame(drag.current.rafId);
            drag.current.rafId = 0;
          }
          const rect = ref.current.getBoundingClientRect();
          drag.current.active = true;
          drag.current.offsetX = event.clientX - rect.left;
          drag.current.offsetY = event.clientY - rect.top;
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        };

        return { ref, pos, dragging, onPointerDown };
      }

      function TopCornerProgress({ entranceReady, motionMode }) {
        return React.createElement(
          motion.div,
          {
            className: "top-progress",
            role: "progressbar",
            "aria-label": "Loading",
            "aria-valuetext": "In progress",
            initial: { opacity: 0, y: -6 },
            animate: { opacity: entranceReady ? 1 : 0, y: entranceReady ? 0 : -6 },
            transition: {
              duration: motionMode === "calm" ? 0.26 : 0.34,
              delay: motionMode === "calm" ? 0.02 : 0.04,
              ease: [0.22, 1, 0.36, 1]
            }
          },
          React.createElement("span", { className: "top-progress-bar", "aria-hidden": "true" })
        );
      }

      function ToastPanel({ motionMode, entranceReady }) {
        const drag = useDraggablePosition(getDefaultToastPos);
        const [mode, setMode] = useState("slide");
        const [toasts, setToasts] = useState([]);
        const [isIdleBreathing, setIsIdleBreathing] = useState(false);
        const idRef = useRef(0);
        const timersRef = useRef(new Map());
        const idleBreathTimerRef = useRef(0);
        const prefersReducedMotion = useReducedMotion();
        const toastDurationMs = prefersReducedMotion ? 2200 : 3200;
        const utilityEase = [0.22, 1, 0.36, 1];

        const clearIdleBreathTimer = () => {
          if (!idleBreathTimerRef.current) return;
          clearTimeout(idleBreathTimerRef.current);
          idleBreathTimerRef.current = 0;
        };

        const scheduleIdleBreath = () => {
          clearIdleBreathTimer();
          setIsIdleBreathing(false);
          if (prefersReducedMotion) return;
          idleBreathTimerRef.current = window.setTimeout(() => {
            setIsIdleBreathing(true);
            idleBreathTimerRef.current = 0;
          }, 1800);
        };

        const clearToastTimer = (id) => {
          const timer = timersRef.current.get(id);
          if (!timer) return;
          clearTimeout(timer);
          timersRef.current.delete(id);
        };

        const removeToast = (id) => {
          clearToastTimer(id);
          setToasts((prev) => {
            const next = prev.filter((toast) => toast.id !== id);
            if (next.length <= 1) {
              clearIdleBreathTimer();
              setIsIdleBreathing(false);
            }
            return next;
          });
        };

        const addToast = () => {
          idRef.current += 1;
          const id = idRef.current;
          const createdAt = performance.now();
          setToasts((prev) => {
            const next = [{ id, text: "This is a Sonner toast", createdAt, duration: toastDurationMs }, ...prev].slice(0, 3);
            const keep = new Set(next.map((toast) => toast.id));
            prev.forEach((toast) => {
              if (!keep.has(toast.id)) clearToastTimer(toast.id);
            });
            return next;
          });
          const timer = window.setTimeout(() => removeToast(id), toastDurationMs);
          timersRef.current.set(id, timer);
          scheduleIdleBreath();
        };

        const resetToasts = () => {
          timersRef.current.forEach((timer) => clearTimeout(timer));
          timersRef.current.clear();
          clearIdleBreathTimer();
          setIsIdleBreathing(false);
          setToasts([]);
        };

        useEffect(() => {
          if (toasts.length <= 1) {
            clearIdleBreathTimer();
            setIsIdleBreathing(false);
          }
        }, [toasts.length]);

        useEffect(() => {
          return () => {
            timersRef.current.forEach((timer) => clearTimeout(timer));
            timersRef.current.clear();
            clearIdleBreathTimer();
          };
        }, []);

        const variants = useMemo(
          () => ({
            initial: (idx) => {
              if (prefersReducedMotion) return { opacity: 0, y: -idx * 10, scale: 1 - idx * 0.01 };
              if (mode === "fade") return { opacity: 0, y: -idx * 10, scale: 1 - idx * 0.015 };
              if (mode === "scale") return { opacity: 0, y: -idx * 10 + 5, scale: 0.86 - idx * 0.012 };
              return { opacity: 0, y: -idx * 10 + 18, scale: 0.97 - idx * 0.015 };
            },
            animate: (idx) => ({
              opacity: 1 - idx * 0.08,
              y: -idx * 10,
              scale: 1 - idx * 0.015
            }),
            exit: (idx) => {
              if (prefersReducedMotion) return { opacity: 0, y: -idx * 10 - 6, scale: 1 - idx * 0.01 };
              if (mode === "fade") return { opacity: 0, y: -idx * 10 - 2, scale: 1 - idx * 0.015 };
              if (mode === "scale") return { opacity: 0, y: -idx * 10 - 8, scale: 0.88 - idx * 0.012 };
              return { opacity: 0, y: -idx * 10 - 14, scale: 0.98 - idx * 0.015 };
            }
          }),
          [mode, prefersReducedMotion]
        );

        const itemTransition = prefersReducedMotion
          ? { duration: 0.12, ease: "easeOut" }
          : mode === "scale"
            ? {
                type: "spring",
                stiffness: motionMode === "calm" ? 200 : 240,
                damping: motionMode === "calm" ? 30 : 28,
                mass: 0.95,
                opacity: { duration: motionMode === "calm" ? 0.14 : 0.18, ease: utilityEase }
              }
            : {
                type: "spring",
                stiffness: motionMode === "calm" ? 250 : 300,
                damping: motionMode === "calm" ? 32 : 30,
                mass: 0.9,
                opacity: { duration: motionMode === "calm" ? 0.16 : 0.2, ease: utilityEase }
              };

        const stopDragOnControl = (event) => {
          event.stopPropagation();
        };

        return React.createElement(
          motion.section,
          {
            ref: drag.ref,
            className: `toast-panel${drag.dragging ? " dragging" : ""}`,
            style: { left: `${drag.pos.x}px`, top: `${drag.pos.y}px` },
            onPointerDown: drag.onPointerDown,
            initial: { opacity: 0, y: 12, scale: 0.99 },
            animate: { opacity: entranceReady ? 1 : 0, y: entranceReady ? 0 : 12, scale: entranceReady ? 1 : 0.99 },
            transition: {
              duration: motionMode === "calm" ? 0.36 : 0.48,
              delay: motionMode === "calm" ? 0.2 : 0.3,
              ease: utilityEase
            },
            "aria-label": "Toast interaction"
          },
          React.createElement(
            "div",
            { className: "toast-stage" },
            React.createElement(
              "div",
              {
                className: `toast-layer${isIdleBreathing && toasts.length > 1 ? " idle-breathe" : ""}`,
                "aria-live": "polite",
                "aria-atomic": "true"
              },
              React.createElement(
                AnimatePresence,
                { initial: false },
                toasts.map((toast, idx) =>
                  React.createElement(
                    motion.article,
                    {
                      key: toast.id,
                      className: `toast-item${idx === 1 ? " depth-1" : ""}${idx === 2 ? " depth-2" : ""}${mode === "fade" ? " fade" : ""}${mode === "scale" ? " scale" : ""}`,
                      custom: idx,
                      layout: "position",
                      initial: "initial",
                      animate: "animate",
                      exit: "exit",
                      variants,
                      transition: itemTransition,
                      style: { zIndex: 30 - idx }
                    },
                    React.createElement("span", null, toast.text)
                  )
                )
              )
            )
          ),
          React.createElement(
            "div",
            { className: "toast-controls" },
            React.createElement(
              "div",
              { className: "toast-controls-left" },
              React.createElement(
                "button",
                {
                  className: "toast-control",
                  type: "button",
                  "data-no-drag": "true",
                  onPointerDown: stopDragOnControl,
                  onClick: addToast
                },
                "Add toast"
              ),
              React.createElement(
                "div",
                { className: "toast-select-wrap", "data-no-drag": "true", onPointerDown: stopDragOnControl },
                React.createElement(
                  "select",
                  {
                    className: "toast-control",
                    value: mode,
                    onChange: (e) => setMode(e.target.value),
                    "aria-label": "Transition mode"
                  },
                  React.createElement("option", { value: "slide" }, "Transitions"),
                  React.createElement("option", { value: "fade" }, "Fade"),
                  React.createElement("option", { value: "scale" }, "Scale")
                )
              )
            ),
            React.createElement(
              "div",
              { className: "toast-controls-right" },
              React.createElement(
                "button",
                {
                  className: "toast-control toast-reset",
                  type: "button",
                  "data-no-drag": "true",
                  onPointerDown: stopDragOnControl,
                  onClick: resetToasts
                },
                "Reset"
              )
            )
          )
        );
      }

      function UnifiedLoadingPanel({ motionMode, entranceReady }) {
        const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
        const [frame, setFrame] = useState(0);
        const [ghosts, setGhosts] = useState([]);
        const prefersReducedMotion = useReducedMotion();
        const drag = useDraggablePosition(getDefaultLoadingPos);

        useEffect(() => {
          if (prefersReducedMotion) {
            setGhosts([]);
            return;
          }
          const id = window.setInterval(() => {
            setFrame((prev) => {
              setGhosts((prevGhosts) => [prev, ...prevGhosts].slice(0, 3));
              return (prev + 1) % frames.length;
            });
          }, 88);
          return () => window.clearInterval(id);
        }, [prefersReducedMotion]);

        const frameValue = frames[prefersReducedMotion ? 0 : frame];

        return React.createElement(
          motion.section,
          {
            ref: drag.ref,
            className: `loading-suite-panel${drag.dragging ? " dragging" : ""}`,
            style: { left: `${drag.pos.x}px`, top: `${drag.pos.y}px` },
            onPointerDown: drag.onPointerDown,
            initial: { opacity: 0, y: 10, scale: 0.98 },
            animate: { opacity: entranceReady ? 1 : 0, y: entranceReady ? 0 : 10, scale: entranceReady ? 1 : 0.98 },
            transition: {
              duration: motionMode === "calm" ? 0.34 : 0.42,
              delay: motionMode === "calm" ? 0.12 : 0.18,
              ease: [0.22, 1, 0.36, 1]
            },
            "aria-label": "Loading examples"
          },
          React.createElement(
            "div",
            { className: "loading-suite-row" },
            React.createElement(
              "div",
              { className: "spinners" },
              React.createElement("div", { className: "spinner", "aria-hidden": "true" }),
              React.createElement("div", { className: "spinner", "aria-hidden": "true" })
            )
          ),
          React.createElement(
            "div",
            { className: "loading-suite-row" },
            React.createElement(
              "span",
              { className: "braille-slot" },
              React.createElement("span", { className: "loading-braille", "aria-hidden": "true" }, frameValue)
            ),
            React.createElement(
              "span",
              { className: "braille-slot" },
              React.createElement(
                "span",
                { className: "loading-braille loading-braille-trail", "aria-hidden": "true" },
                ghosts[2] !== undefined
                  ? React.createElement("span", { className: "loading-braille-layer loading-braille-ghost-3" }, frames[ghosts[2]])
                  : null,
                ghosts[1] !== undefined
                  ? React.createElement("span", { className: "loading-braille-layer loading-braille-ghost-2" }, frames[ghosts[1]])
                  : null,
                ghosts[0] !== undefined
                  ? React.createElement("span", { className: "loading-braille-layer loading-braille-ghost-1" }, frames[ghosts[0]])
                  : null,
                React.createElement("span", { className: "loading-braille-layer" }, frameValue)
              )
            )
          ),
          React.createElement(
            "div",
            { className: "loading-suite-row" },
            React.createElement(
              "div",
              { className: "dot-pulse" },
              React.createElement("span", { className: "dot-pulse-dot" }),
              React.createElement("span", { className: "dot-pulse-dot" }),
              React.createElement("span", { className: "dot-pulse-dot" })
            )
          ),
          React.createElement(
            "div",
            { className: "loading-suite-row" },
            React.createElement(
              "div",
              { className: "dot-matrix dot-matrix-3x3", "aria-hidden": "true" },
              React.createElement("span", { className: "dot-matrix-dot" }),
              React.createElement("span", { className: "dot-matrix-dot" }),
              React.createElement("span", { className: "dot-matrix-dot" }),
              React.createElement("span", { className: "dot-matrix-dot" }),
              React.createElement("span", { className: "dot-matrix-dot" }),
              React.createElement("span", { className: "dot-matrix-dot" }),
              React.createElement("span", { className: "dot-matrix-dot" }),
              React.createElement("span", { className: "dot-matrix-dot" }),
              React.createElement("span", { className: "dot-matrix-dot" })
            )
          )
        );
      }

      function EmilModalDemo() {
        const [open, setOpen] = useState(false);
        const [origin, setOrigin] = useState({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 });
        const triggerRef = useRef(null);
        const modalRef = useRef(null);
        const prefersReducedMotion = useReducedMotion();
        const modalCardVariants = prefersReducedMotion
          ? {
              hidden: { opacity: 0, y: 24, scale: 0.95 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.14, ease: [0.23, 1, 0.32, 1] }
              },
              exit: {
                opacity: 0,
                y: 12,
                scale: 0.985,
                transition: { duration: 0.14, ease: [0.23, 1, 0.32, 1] }
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
                  delay: 0.05
                }
              },
              exit: {
                y: [0, 22, 34],
                scale: [1, 0.985, 0.97],
                opacity: [1, 1, 0],
                filter: ["blur(0px)", "blur(0.2px)", "blur(0.8px)"],
                transition: {
                  y: { duration: 0.34, ease: [0.22, 1, 0.36, 1], times: [0, 0.72, 1] },
                  scale: { duration: 0.34, ease: [0.22, 1, 0.36, 1], times: [0, 0.72, 1] },
                  opacity: { duration: 0.34, ease: [0.22, 1, 0.36, 1], times: [0, 0.72, 1] },
                  filter: { duration: 0.34, ease: [0.22, 1, 0.36, 1], times: [0, 0.72, 1] }
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
                      duration: prefersReducedMotion ? 0.12 : 0.3,
                      ease: [0.22, 1, 0.36, 1]
                    }
                  },
                  React.createElement(motion.div, {
                    className: "ek-modal-bloom",
                    onClick: () => setOpen(false),
                    initial: { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` },
                    animate: { clipPath: `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${origin.x}px ${origin.y}px)` },
                    exit: { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` },
                    transition: prefersReducedMotion
                      ? { duration: 0.16, ease: [0.22, 1, 0.36, 1] }
                      : {
                          duration: 0.48,
                          ease: [0.32, 0.72, 0, 1]
                        }
                  }),
                  React.createElement(
                    motion.article,
                    {
                      ref: modalRef,
                      className: "ek-modal-card",
                      role: "dialog",
                      "aria-modal": "true",
                      "aria-label": "Unique modal animation",
                      tabIndex: -1,
                      variants: modalCardVariants,
                      initial: "hidden",
                      animate: "visible",
                      exit: "exit"
                    },
                    React.createElement(
                      "header",
                      { className: "ek-modal-head" },
                      React.createElement("h3", { className: "ek-modal-title" }, "Modal with Trigger-Bloom Entrance"),
                      React.createElement(
                        "p",
                        { className: "ek-modal-body" },
                        "The backdrop grows from the trigger first, then the card settles in. It feels connected and less abrupt."
                      )
                    ),
                    React.createElement(
                      "div",
                      { className: "ek-modal-actions" },
                      React.createElement(
                        "button",
                        { className: "toast-control", type: "button", onClick: () => setOpen(false) },
                        "Close"
                      )
                    )
                  )
                )
              : null
          )
        );
      }

      const SIMPLE_MOTION_LIST = [
        {
          id: "skeleton",
          name: "Skeleton Shimmer",
          duration: "1100ms",
          easing: "linear",
          note: "Use while content is loading."
        },
        {
          id: "progress",
          name: "Progress Step Transitions",
          duration: "650ms",
          easing: "cubic-bezier(0.22,1,0.36,1)",
          note: "Use for multi-step loading or onboarding."
        },
        {
          id: "success",
          name: "Success Checkmark Draw",
          duration: "500ms",
          easing: "cubic-bezier(0.22,1,0.36,1)",
          note: "Use to confirm completion."
        }
      ];

      function MotionExamples({ entranceReady, motionMode }) {
        const [index, setIndex] = useState(0);
        const [progressStep, setProgressStep] = useState(0);
        const [progressDirection, setProgressDirection] = useState(1);
        const [showSuccess, setShowSuccess] = useState(false);
        const drag = useDraggablePosition(getDefaultMotionExamplesPos);
        const current = SIMPLE_MOTION_LIST[index];

        useEffect(() => {
          setProgressStep(0);
          setProgressDirection(1);
          setShowSuccess(false);
        }, [index]);

        useEffect(() => {
          if (current.id !== "progress") return;
          const id = window.setInterval(() => {
            setProgressStep((prev) => {
              const next = prev + progressDirection;
              if (next >= 2) {
                setProgressDirection(-1);
                return 2;
              }
              if (next <= 0) {
                setProgressDirection(1);
                return 0;
              }
              return next;
            });
          }, 980);
          return () => window.clearInterval(id);
        }, [current.id, progressDirection]);

        useEffect(() => {
          if (current.id !== "success") return;
          const id = window.setTimeout(() => setShowSuccess(true), 80);
          return () => window.clearTimeout(id);
        }, [current.id]);

        const next = () => setIndex((prev) => (prev + 1) % SIMPLE_MOTION_LIST.length);
        const prev = () => setIndex((prev) => (prev - 1 + SIMPLE_MOTION_LIST.length) % SIMPLE_MOTION_LIST.length);
        const stopDragOnControl = (event) => event.stopPropagation();

        const renderExample = () => {
          if (current.id === "skeleton") {
            return React.createElement(
              "div",
              { className: "motion-skeleton" },
              React.createElement("div", { className: "skeleton-line" }),
              React.createElement("div", { className: "skeleton-line medium" }),
              React.createElement("div", { className: "skeleton-line short" })
            );
          }

          if (current.id === "progress") {
            return React.createElement(
              "div",
              { className: "motion-progress" },
              [0, 1, 2].map((step) =>
                React.createElement(
                  "div",
                  { key: `step-${step}`, className: "progress-step" },
                  React.createElement(motion.div, {
                    className: "progress-step-fill",
                    initial: false,
                    animate: {
                      scaleX: step <= progressStep ? 1 : 0,
                      opacity: step <= progressStep ? 1 : 0.18
                    },
                    transition: {
                      duration: 0.9,
                      ease: [0.32, 0.72, 0, 1]
                    }
                  })
                )
              )
            );
          }

          if (current.id === "success") {
            return React.createElement(
              "div",
              { className: "motion-success" },
              React.createElement(
                motion.svg,
                {
                  className: "motion-success-icon",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  initial: false
                },
                React.createElement(motion.circle, {
                  cx: "12",
                  cy: "12",
                  r: "9",
                  stroke: "#1f1f1f",
                  strokeWidth: "1.5",
                  initial: { pathLength: 0, opacity: 0.5 },
                  animate: { pathLength: showSuccess ? 1 : 0, opacity: showSuccess ? 1 : 0.5 },
                  transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] }
                }),
                React.createElement(motion.path, {
                  d: "M7 12.5l3.1 3.1L17 8.8",
                  stroke: "#1f1f1f",
                  strokeWidth: "1.9",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  initial: { pathLength: 0, opacity: 0 },
                  animate: { pathLength: showSuccess ? 1 : 0, opacity: showSuccess ? 1 : 0 },
                  transition: { duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }
                })
              )
            );
          }

          return React.createElement(
            motion.div,
            {
              key: `demo-${current.name}-${index}`,
              className: "motion-example-block",
              initial: current.name === "Page Enter" ? { opacity: 0, y: 12 } : { opacity: 1, y: 0, scale: 1 },
              animate: { opacity: 1, y: 0, scale: 1 },
              whileHover: current.name === "Hover Lift" ? { y: -3, scale: 1.02 } : undefined,
              whileTap: current.name === "Press Down" ? { scale: 0.96 } : undefined,
              transition: {
                duration: current.name === "Page Enter" ? 0.42 : current.name === "Press Down" ? 0.11 : 0.16,
                ease: [0.22, 1, 0.36, 1]
              }
            },
            current.name
          );
        };

        return React.createElement(
          React.Fragment,
          null,
          React.createElement(
            motion.section,
            {
              ref: drag.ref,
              className: `motion-example-panel${drag.dragging ? " dragging" : ""}`,
              style: { left: `${drag.pos.x}px`, top: `${drag.pos.y}px` },
              onPointerDown: drag.onPointerDown,
              initial: { opacity: 0, y: 10, scale: 0.99 },
              animate: { opacity: entranceReady ? 1 : 0, y: entranceReady ? 0 : 10, scale: entranceReady ? 1 : 0.99 },
              transition: {
                duration: motionMode === "calm" ? 0.34 : 0.42,
                delay: motionMode === "calm" ? 0.12 : 0.16,
                ease: [0.22, 1, 0.36, 1]
              }
            },
            React.createElement(
              "header",
              { className: "motion-example-head" },
              React.createElement("h2", { className: "motion-example-title" }, current.name),
              React.createElement("span", { className: "motion-example-counter" }, `${index + 1}/${SIMPLE_MOTION_LIST.length}`)
            ),
            React.createElement(
              "div",
              { className: "motion-example-stage" },
              React.createElement(
                AnimatePresence,
                { mode: "wait" },
                React.createElement(
                  motion.div,
                  {
                    key: `example-stage-${current.name}-${index}`,
                    initial: { opacity: 0, y: 6 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -6 },
                    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
                  },
                  renderExample()
                )
              )
            )
            ,
            React.createElement(
              "div",
              { className: "motion-example-controls" },
              React.createElement(
                "button",
                { className: "toast-control", type: "button", onPointerDown: stopDragOnControl, onClick: prev },
                "Prev"
              ),
              React.createElement(
                "button",
                { className: "toast-control", type: "button", onPointerDown: stopDragOnControl, onClick: next },
                "Next"
              )
            )
          )
        );
      }

      function App() {
        const motionMode = "normal";
        const [entranceReady, setEntranceReady] = useState(false);

        useEffect(() => {
          const id = requestAnimationFrame(() => setEntranceReady(true));
          return () => cancelAnimationFrame(id);
        }, []);

        return React.createElement(
          React.Fragment,
          null,
          React.createElement(TopCornerProgress, { motionMode, entranceReady }),
          React.createElement(UnifiedLoadingPanel, { motionMode, entranceReady }),
          React.createElement(ToastPanel, { motionMode, entranceReady }),
          React.createElement(MotionExamples, { motionMode, entranceReady }),
          React.createElement(EmilModalDemo)
        );
      }

      createRoot(document.getElementById("app")).render(React.createElement(App));
