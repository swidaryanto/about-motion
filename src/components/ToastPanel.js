import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDraggablePosition } from "../hooks/useDraggablePosition.js";
import { getDefaultToastPos } from "../lib/layout.js";
import { DELAY, DURATION, panelTransition, toastSpring } from "../lib/motionTokens.js";

export function ToastPanel({ motionMode, entranceReady }) {
  const drag = useDraggablePosition(getDefaultToastPos);
  const [mode, setMode] = useState("slide");
  const [toasts, setToasts] = useState([]);
  const [isIdleBreathing, setIsIdleBreathing] = useState(false);
  const idRef = useRef(0);
  const timersRef = useRef(new Map());
  const idleBreathTimerRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();
  const toastDurationMs = prefersReducedMotion ? 2200 : 3200;

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

  const itemTransition = toastSpring(motionMode, prefersReducedMotion, mode);

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
      transition: panelTransition({
        delay: DELAY.toast,
        duration: DURATION.panelSlow,
        motionMode,
        prefersReducedMotion
      }),
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
