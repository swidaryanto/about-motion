export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
export function isMobileLayout() {
  return window.innerWidth <= 760;
}

function getMobileCenteredX(width) {
  return clamp((window.innerWidth - width) * 0.5, 8, window.innerWidth - width - 8);
}

function getMobileStackY(offset) {
  return clamp(offset, 12, window.innerHeight - 44);
}

export function getDefaultLoadingPos() {
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

export function getDefaultMotionExamplesPos() {
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

export function getDefaultToastPos() {
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
