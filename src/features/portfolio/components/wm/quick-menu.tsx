"use client";

import type { FC, ReactNode } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenKeymap: () => void;
}

const itemClass =
  "group relative grid h-9 w-9 place-items-center rounded-lg text-[14px] text-fg-2 transition-colors hover:bg-fg-4/20 hover:text-fg-0";

const Tip: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="pointer-events-none absolute right-full top-1/2 z-50 mr-2.5 -translate-y-1/2 whitespace-nowrap rounded-md border border-fg-4 bg-bg-1 px-2.5 py-1 text-[10.5px] text-fg-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
    {children}
  </span>
);

export const QuickMenu: FC<Props> = ({ open, onClose, onOpenKeymap }) => {
  if (!open) return null;

  return (
    <section
      aria-label="quick menu"
      className="absolute right-0 top-1/2 z-40 flex w-[52px] -translate-y-1/2 flex-col items-center gap-1.5 rounded-l-2xl border border-r-0 border-fg-4/60 bg-bg-1 py-3 shadow-[-18px_0_48px_-20px_rgba(0,0,0,0.75)]"
    >
      <button
        type="button"
        aria-label="keybinds"
        onClick={() => {
          onOpenKeymap();
          onClose();
        }}
        className={itemClass}
      >
        ⌨<Tip>keybinds — ` ?</Tip>
      </button>
      <span aria-hidden className="my-1 w-[18px] border-t border-fg-4" />
      <a
        href="https://github.com/Dawaad"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="github"
        className={itemClass}
      >
        gh<Tip>github</Tip>
      </a>
      <a
        href="https://linkedin.com/in/ibuildshitgood"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="linkedin"
        className={itemClass}
      >
        in<Tip>linkedin — résumé</Tip>
      </a>
      <a
        href={`mailto:${portfolioContent.contact.email}`}
        aria-label="email"
        className={itemClass}
      >
        @<Tip>{portfolioContent.contact.email}</Tip>
      </a>
    </section>
  );
};
