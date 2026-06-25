import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useDraggablePosition } from "../hooks/useDraggablePosition.js";
import { getDefaultLoadingPos } from "../lib/layout.js";
import { DELAY, DURATION, panelTransition } from "../lib/motionTokens.js";

export function UnifiedLoadingPanel({ motionMode, entranceReady }) {
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
      transition: panelTransition({
        delay: DELAY.loading,
        duration: DURATION.panel,
        motionMode,
        prefersReducedMotion
      }),
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
