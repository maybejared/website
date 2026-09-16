"use client";

import type { FC } from "react";
import { useEffect } from "react";

interface Props {
  /** Single-character keys mapped to the URL they open. */
  keys: Record<string, string>;
}

/** Binds the key hints shown on buttons to real shortcuts. */
export const Hotkeys: FC<Props> = ({ keys }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      const href = keys[e.key.toLowerCase()];
      if (href) window.location.assign(href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keys]);
  return null;
};
