"use client";
import type { FC } from "react";

interface Props {
  title: string;
  onClose: () => void;
}

// Rendered via Mosaic's `renderToolbar`, so the element returned here is wrapped
// as the window's drag source — this faux-terminal title bar doubles as the
// drag handle. Keeps the close dot + truncated title from the old chrome.
export const WindowToolbar: FC<Props> = ({ title, onClose }) => (
  <div className="flex h-full flex-1 items-center gap-2 px-2 py-1 text-[11px] text-fg-2">
    <button
      type="button"
      aria-label="close"
      onClick={onClose}
      className="h-2 w-2 flex-none rounded-full bg-red-dim hover:bg-red"
    />
    <span className="truncate">{title}</span>
  </div>
);
