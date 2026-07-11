"use client";
import type { FC, ReactNode } from "react";
import { WindowFocusContext } from "@/src/features/portfolio/hooks/use-window-focus";

interface Props {
  focused: boolean;
  children: ReactNode;
}

// Body wrapper only — the title bar, focus/drag handling, and the focused
// border all live in the leaf wrapper in desktop.tsx. This supplies the
// scrollable content region and the per-window focus context.
export const WindowFrame: FC<Props> = ({ focused, children }) => (
  <div className="wm-window-body wm-glass h-full min-h-0 flex-1 overflow-auto bg-bg-1/85">
    <WindowFocusContext.Provider value={focused}>
      {children}
    </WindowFocusContext.Provider>
  </div>
);
