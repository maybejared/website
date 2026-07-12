"use client";

import type { FC } from "react";

import { cn } from "@/src/shared/lib/utils";

type Notch = "tl" | "tr" | "bl" | "br";

interface Props {
  /** Corner of the cap square carrying the concave cut. */
  notch: Notch;
  size?: number;
  className?: string;
}

const NOTCH_AT: Record<Notch, string> = {
  tl: "0% 0%",
  tr: "100% 0%",
  bl: "0% 100%",
  br: "100% 100%",
};

/**
 * Inverse-radius corner cap: a square of shell surface with a concave
 * quarter-circle masked out, so pull-out panels appear to flow out of the
 * shell skin (the eww/quickshell bar trick). Paints `bg-1` — place it flush
 * against a `bg-bg-1` panel edge and the shell gutter.
 */
export const ShellCorner: FC<Props> = ({ notch, size = 24, className }) => {
  const mask = `radial-gradient(${size}px at ${NOTCH_AT[notch]}, transparent ${
    size - 0.5
  }px, #000 ${size}px)`;
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none block bg-bg-1", className)}
      style={{ width: size, height: size, WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};
