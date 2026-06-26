"use client";

import type { FC } from "react";

import { useDeskStamp } from "@/src/features/portfolio/hooks/use-desktop-clock";

export const ClockApp: FC = () => {
  const stamp = useDeskStamp();

  return (
    <div className="flex h-full items-center justify-center font-mono text-[11px] tracking-[0.1em] text-fg-2">
      {stamp}
    </div>
  );
};
