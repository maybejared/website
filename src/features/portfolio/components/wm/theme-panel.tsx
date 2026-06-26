"use client";

import type { FC } from "react";
import { useEffect, useRef, useState } from "react";

import { SCHEMES } from "@/src/features/portfolio/lib/config/schemes";
import { WALLPAPERS } from "@/src/features/portfolio/lib/config/wallpapers";
import { cn } from "@/src/shared/lib/utils";
import type { SchemeName } from "@/src/shared/types/portfolio";

interface Props {
  scheme: SchemeName;
  setScheme: (s: SchemeName) => void;
  wallpaperId: string;
  setWallpaperId: (id: string) => void;
}

export const ThemePanel: FC<Props> = ({
  scheme,
  setScheme,
  wallpaperId,
  setWallpaperId,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 uppercase tracking-[0.06em] text-fg-2"
      >
        <span className="text-fg-3">theme</span>
        <span className="text-amber">{scheme}</span>
        <span className="text-[8px] text-fg-3">{open ? "▼" : "▲"}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[60] mt-1 flex min-w-[148px] flex-col border border-fg-4 bg-bg-0 py-1 shadow-sm">
          <div className="px-3 pb-0.5 pt-1 text-[9px] uppercase tracking-[0.1em] text-fg-4">
            scheme
          </div>
          {SCHEMES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setScheme(s);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-left uppercase tracking-[0.06em] text-fg-2 hover:bg-bg-2",
                s === scheme && "text-amber",
              )}
            >
              <span className="w-2 text-amber">{s === scheme ? ">" : " "}</span>
              {s}
            </button>
          ))}
          <div className="mt-1 border-t border-fg-4 px-3 pb-0.5 pt-1 text-[9px] uppercase tracking-[0.1em] text-fg-4">
            wallpaper
          </div>
          {WALLPAPERS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => {
                setWallpaperId(w.id);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-left uppercase tracking-[0.06em] text-fg-2 hover:bg-bg-2",
                w.id === wallpaperId && "text-amber",
              )}
            >
              <span className="w-2 text-amber">
                {w.id === wallpaperId ? ">" : " "}
              </span>
              {w.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
