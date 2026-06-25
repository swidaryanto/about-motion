import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DELAY, DURATION, panelTransition } from "../lib/motionTokens.js";

export function TopCornerProgress({ entranceReady, motionMode }) {
  const prefersReducedMotion = useReducedMotion();
  return React.createElement(
    motion.div,
    {
      className: "top-progress",
      role: "progressbar",
      "aria-label": "Loading",
      "aria-valuetext": "In progress",
      initial: { opacity: 0, y: -6 },
      animate: { opacity: entranceReady ? 1 : 0, y: entranceReady ? 0 : -6 },
      transition: panelTransition({
        delay: DELAY.topProgress,
        duration: DURATION.base,
        motionMode,
        prefersReducedMotion
      })
    },
    React.createElement("span", { className: "top-progress-bar", "aria-hidden": "true" })
  );
}
