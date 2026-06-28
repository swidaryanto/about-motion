import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDraggablePosition } from "../hooks/useDraggablePosition.js";
import { getDefaultMotionExamplesPos } from "../lib/layout.js";
import { DELAY, DURATION, EASE, duration, panelTransition } from "../lib/motionTokens.js";

const SIMPLE_MOTION_LIST = [
  {
    id: "skeleton",
    name: "About Page Entrance",
    duration: "400ms",
    easing: "easeOut",
    note: "Use this for a clean about-page reveal: fade in, slide up 12px, keep it subtle."
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

export function MotionExamples({ entranceReady, motionMode }) {
  const prefersReducedMotion = useReducedMotion();
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
    if (current.id !== "progress" || prefersReducedMotion) return;
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
  }, [current.id, prefersReducedMotion, progressDirection]);

  useEffect(() => {
    if (current.id !== "success") return;
    if (prefersReducedMotion) {
      setShowSuccess(true);
      return;
    }
    const id = window.setTimeout(() => setShowSuccess(true), 80);
    return () => window.clearTimeout(id);
  }, [current.id, prefersReducedMotion]);

  const next = () => setIndex((prev) => (prev + 1) % SIMPLE_MOTION_LIST.length);
  const prev = () => setIndex((prev) => (prev - 1 + SIMPLE_MOTION_LIST.length) % SIMPLE_MOTION_LIST.length);
  const stopDragOnControl = (event) => event.stopPropagation();

  const renderExample = () => {
    if (current.id === "skeleton") {
      return React.createElement(
        motion.div,
        {
          className: "motion-example-card",
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: duration(0.4, prefersReducedMotion), ease: EASE.standard }
        },
        React.createElement("div", { className: "motion-example-kicker" }, "ABOUT"),
        React.createElement("h3", { className: "motion-example-heading" }, "Simple entrance"),
        React.createElement(
          "p",
          { className: "motion-example-body" },
          "Fade in + slide up 12px. Clean, subtle, no drama."
        )
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
                duration: duration(DURATION.progress, prefersReducedMotion),
                ease: EASE.emphasized
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
            transition: { duration: duration(DURATION.base, prefersReducedMotion), ease: EASE.standard }
          }),
          React.createElement(motion.path, {
            d: "M7 12.5l3.1 3.1L17 8.8",
            stroke: "#1f1f1f",
            strokeWidth: "1.9",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            initial: { pathLength: 0, opacity: 0 },
            animate: { pathLength: showSuccess ? 1 : 0, opacity: showSuccess ? 1 : 0 },
            transition: {
              duration: duration(DURATION.draw, prefersReducedMotion),
              delay: prefersReducedMotion ? DELAY.none : DELAY.successPath,
              ease: EASE.standard
            }
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
          duration: prefersReducedMotion
            ? DURATION.instant
            : current.name === "Page Enter"
              ? 0.42
              : current.name === "Press Down"
                ? DURATION.press
                : DURATION.fast,
          ease: EASE.standard
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
        "aria-label": `Motion example: ${current.name}`,
        initial: { opacity: 0, y: 10, scale: 0.99 },
        animate: { opacity: entranceReady ? 1 : 0, y: entranceReady ? 0 : 10, scale: entranceReady ? 1 : 0.99 },
        transition: panelTransition({ motionMode, prefersReducedMotion })
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
              transition: { duration: duration(DURATION.fast, prefersReducedMotion), ease: EASE.standard }
            },
            renderExample()
          )
        )
      ),
      React.createElement(
        "div",
        { className: "motion-example-copy" },
        React.createElement("p", { className: "motion-example-note" }, current.note),
        React.createElement(
          "dl",
          { className: "motion-example-meta", "aria-label": "Motion timing details" },
          React.createElement("div", null, React.createElement("dt", null, "Duration"), React.createElement("dd", null, current.duration)),
          React.createElement("div", null, React.createElement("dt", null, "Easing"), React.createElement("dd", null, current.easing))
        )
      ),
      React.createElement(
        "div",
        { className: "motion-example-controls" },
        React.createElement(
          "button",
          {
            className: "toast-control",
            type: "button",
            "aria-label": "Show previous motion example",
            onPointerDown: stopDragOnControl,
            onClick: prev
          },
          "Prev"
        ),
        React.createElement(
          "button",
          {
            className: "toast-control",
            type: "button",
            "aria-label": "Show next motion example",
            onPointerDown: stopDragOnControl,
            onClick: next
          },
          "Next"
        )
      )
    )
  );
}
