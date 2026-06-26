"use client";

import type { FC } from "react";
import { useEffect, useRef, useState } from "react";

import { APPS } from "@/src/features/portfolio/lib/config/apps.config";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const Launcher: FC<Props> = ({ open, onClose }) => {
  const { openApp } = useWorkspace();
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = APPS.filter((a) =>
    (a.label + " " + a.id).toLowerCase().includes(query.toLowerCase()),
  );

  // Reset highlight to first row when the query changes.
  useEffect(() => {
    setHighlight(0);
  }, [query]);

  // When the palette opens, clear any stale query and focus the input.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setHighlight(0);
    inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const app = filtered[highlight];
      if (app) {
        openApp(app.id);
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-0/80">
      <div className="w-[480px] border border-fg-4 bg-bg-0 shadow-lg">
        <div className="border-b border-fg-4 px-3 py-1.5 text-[11px] uppercase tracking-[0.06em] text-fg-3">
          launch
        </div>
        <div className="flex items-center border-b border-fg-4 px-3 py-2">
          <span className="mr-2 text-[12px] text-amber">›</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[13px] text-fg-1 outline-none placeholder:text-fg-4"
            placeholder="type to filter…"
          />
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          {filtered.map((app, i) => (
            <button
              key={app.id}
              type="button"
              onMouseDown={() => {
                openApp(app.id);
                onClose();
              }}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2 text-left text-[13px]",
                i === highlight ? "bg-bg-2 text-fg-0" : "text-fg-2 hover:bg-bg-1",
              )}
            >
              <span className="w-3 text-[10px] text-amber">
                {i === highlight ? ">" : ""}
              </span>
              <span>{app.label}</span>
              <span className="ml-auto text-[11px] text-fg-4">{app.id}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-center text-[13px] text-fg-4">
              no matches
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
