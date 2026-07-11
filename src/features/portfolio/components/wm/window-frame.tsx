"use client";
import type { FC, ReactNode } from "react";
import { WindowFocusContext } from "@/src/features/portfolio/hooks/use-window-focus";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  focused: boolean;
  children: ReactNode;
}

// Body wrapper only — the title bar and focus/drag handling live in the leaf
// wrapper in desktop.tsx. This supplies the focused border, the scrollable
// content region, and the per-window focus context.
export const WindowFrame: FC<Props> = ({ focused, children }) => (
  <div
    className={cn(
      "wm-window-body wm-glass h-full min-h-0 flex-1 overflow-auto border border-t-0 bg-bg-1/85",
      focused ? "border-amber/70" : "border-fg-4",
    )}
  >
    <WindowFocusContext.Provider value={focused}>{children}</WindowFocusContext.Provider>
  </div>
);
