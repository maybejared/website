"use client";

import type { FC } from "react";

import { useDeskStamp } from "@/src/features/portfolio/hooks/use-desktop-clock";

// No props — matches the codebase convention for nullary components (FetchPanel,
// ContactSection, etc.); an empty Props interface trips no-empty-object-type.
export const ClockApp: FC = () => {
  const stamp = useDeskStamp();

  return (
    <div className="flex h-full items-center justify-center font-mono text-[11px] tracking-[0.1em] text-fg-2">
      {stamp}
    </div>
  );
};
