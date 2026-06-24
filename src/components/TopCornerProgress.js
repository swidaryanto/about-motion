import React from "react";
import { motion, useReducedMotion } from "framer-motion";

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
      transition: {
        duration: prefersReducedMotion ? 0 : motionMode === "calm" ? 0.26 : 0.34,
        delay: motionMode === "calm" ? 0.02 : 0.04,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    React.createElement("span", { className: "top-progress-bar", "aria-hidden": "true" })
  );
}
