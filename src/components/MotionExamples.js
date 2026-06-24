import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDraggablePosition } from "../hooks/useDraggablePosition.js";
import { getDefaultMotionExamplesPos } from "../lib/layout.js";

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
                duration: prefersReducedMotion ? 0 : 0.9,
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
            transition: { duration: prefersReducedMotion ? 0 : 0.36, ease: [0.22, 1, 0.36, 1] }
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
              duration: prefersReducedMotion ? 0 : 0.5,
              delay: prefersReducedMotion ? 0 : 0.08,
              ease: [0.22, 1, 0.36, 1]
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
            ? 0
            : current.name === "Page Enter"
              ? 0.42
              : current.name === "Press Down"
                ? 0.11
                : 0.16,
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
          duration: prefersReducedMotion ? 0 : motionMode === "calm" ? 0.34 : 0.42,
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
              transition: { duration: prefersReducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }
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
