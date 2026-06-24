import { useEffect, useRef, useState } from "react";
import { clamp, isMobileLayout } from "../lib/layout.js";

export function useDraggablePosition(defaultPosFactory) {
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
