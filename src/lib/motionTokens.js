export const EASE = {
  standard: [0.22, 1, 0.36, 1],
  emphasized: [0.32, 0.72, 0, 1]
};

export const DURATION = {
  instant: 0,
  press: 0.11,
  fast: 0.18,
  base: 0.34,
  panel: 0.42,
  panelSlow: 0.48,
  draw: 0.5,
  progress: 0.9
};

export const DELAY = {
  none: 0,
  topProgress: 0.04,
  panel: 0.16,
  loading: 0.18,
  toast: 0.3,
  modalCard: 0.05,
  successPath: 0.08
};

export function duration(value, prefersReducedMotion) {
  return prefersReducedMotion ? DURATION.instant : value;
}

export function panelTransition({ delay = DELAY.panel, duration: panelDuration = DURATION.panel, motionMode, prefersReducedMotion }) {
  return {
    duration: duration(motionMode === "calm" ? DURATION.base : panelDuration, prefersReducedMotion),
    delay: prefersReducedMotion ? DELAY.none : motionMode === "calm" ? Math.max(DELAY.none, delay - 0.06) : delay,
    ease: EASE.standard
  };
}

export function toastSpring(motionMode, prefersReducedMotion, mode) {
  if (prefersReducedMotion) return { duration: DURATION.instant };

  const isScale = mode === "scale";
  return {
    type: "spring",
    stiffness: motionMode === "calm" ? (isScale ? 200 : 250) : isScale ? 240 : 300,
    damping: motionMode === "calm" ? (isScale ? 30 : 32) : isScale ? 28 : 30,
    mass: isScale ? 0.95 : 0.9,
    opacity: {
      duration: motionMode === "calm" ? DURATION.fast - 0.04 : DURATION.fast,
      ease: EASE.standard
    }
  };
}
