"use client";

import type { FC, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

import { ShellCorner } from "@/src/features/portfolio/components/wm/shell-corner";
import { shellSpring } from "@/src/features/portfolio/lib/wm/transitions";
import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

interface Props {
  onClose: () => void;
  onOpenKeymap: () => void;
}

const itemClass =
  "group relative grid h-9 w-9 place-items-center rounded-full text-[14px] text-fg-2 transition-colors hover:bg-bg-3 hover:text-fg-0";

const Tip: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="pointer-events-none absolute right-full top-1/2 z-50 mr-2.5 -translate-y-1/2 whitespace-nowrap rounded-md border border-fg-4 bg-bg-1 px-2.5 py-1 text-[10.5px] text-fg-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
    {children}
  </span>
);

export const QuickMenu: FC<Props> = ({ onClose, onOpenKeymap }) => {
  const reduced = useReducedMotion();
  const transition = reduced ? { duration: 0 } : shellSpring;
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (panelRef.current?.contains(t)) return;
      if ((t as HTMLElement).closest?.('[aria-label="toggle quick menu"]')) return;
      onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onClose]);

  return (
    <motion.section
      ref={panelRef}
      aria-label="quick menu"
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={transition}
      style={{ y: "-50%" }}
      className="absolute right-0 top-1/2 z-40 w-[52px]"
    >
      <ShellCorner notch="tl" className="absolute bottom-full right-0" />
      <ShellCorner notch="bl" className="absolute top-full right-0" />
      <div className="flex flex-col items-center gap-1.5 rounded-l-2xl bg-bg-1 py-3 shadow-[-16px_0_40px_-20px_rgba(0,0,0,0.5)]">
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
      </div>
    </motion.section>
  );
};
