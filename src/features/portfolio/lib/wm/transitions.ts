import type { Transition } from "motion/react";

/** One motion character for every shell morph — panels, tabs, popups. */
export const shellSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.9,
};

/** Cross-fade + slight vertical shift for swapped tab/panel content. */
export const fadeShift = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.16, ease: "easeOut" },
} as const;
