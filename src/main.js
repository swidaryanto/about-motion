import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig, useReducedMotion } from "framer-motion";
import { EmilModalDemo } from "./components/EmilModalDemo.js";
import { MotionExamples } from "./components/MotionExamples.js";
import { ToastPanel } from "./components/ToastPanel.js";
import { TopCornerProgress } from "./components/TopCornerProgress.js";
import { UnifiedLoadingPanel } from "./components/UnifiedLoadingPanel.js";

function App() {
  const motionMode = "normal";
  const prefersReducedMotion = useReducedMotion();
  const [entranceReady, setEntranceReady] = useState(() => Boolean(prefersReducedMotion));

  useEffect(() => {
    if (prefersReducedMotion) {
      setEntranceReady(true);
      return;
    }
    const id = requestAnimationFrame(() => setEntranceReady(true));
    return () => cancelAnimationFrame(id);
  }, [prefersReducedMotion]);

  return React.createElement(
    MotionConfig,
    { reducedMotion: "user" },
    React.createElement(
      React.Fragment,
      null,
      React.createElement(TopCornerProgress, { motionMode, entranceReady }),
      React.createElement(UnifiedLoadingPanel, { motionMode, entranceReady }),
      React.createElement(ToastPanel, { motionMode, entranceReady }),
      React.createElement(MotionExamples, { motionMode, entranceReady }),
      React.createElement(EmilModalDemo)
    )
  );
}

createRoot(document.getElementById("app")).render(React.createElement(App));
