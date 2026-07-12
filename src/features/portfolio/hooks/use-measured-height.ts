"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks an element's rendered height so a motion wrapper can animate
 * `height` between content swaps (framer-motion can't animate to "auto").
 */
export const useMeasuredHeight = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    setHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  return { ref, height };
};
