"use client";

import type { FC } from "react";

import { cn } from "@/src/shared/lib/utils";

interface Props {
  side: "top" | "right" | "bottom";
  label: string;
  active: boolean;
  onClick: () => void;
}

const SIDE_CLASS: Record<Props["side"], string> = {
  top: "left-1/2 top-0 h-[15px] w-[72px] -translate-x-1/2 rounded-b-lg border-t-0",
  right:
    "right-0 top-1/2 h-[72px] w-[15px] -translate-y-1/2 rounded-l-lg border-r-0",
  bottom:
    "bottom-0 left-1/2 h-[15px] w-[72px] -translate-x-1/2 rounded-t-lg border-b-0",
};

const BAR_CLASS: Record<Props["side"], string> = {
  top: "h-1 w-8",
  right: "h-8 w-1",
  bottom: "h-1 w-8",
};

/** A pull-tab cut from the shell frame; toggles one edge overlay. */
export const EdgeHandle: FC<Props> = ({ side, label, active, onClick }) => (
  <button
    type="button"
    aria-label={label}
    aria-expanded={active}
    onClick={onClick}
    className={cn(
      "group absolute z-[45] grid place-items-center bg-bg-1",
      SIDE_CLASS[side],
    )}
  >
    <span
      className={cn(
        "rounded-full transition-colors",
        BAR_CLASS[side],
        active ? "bg-amber" : "bg-fg-4 group-hover:bg-amber",
      )}
    />
  </button>
);
