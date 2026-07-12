"use client";

import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import {
  Fastfetch,
  FastFetchInfo,
} from "@/src/features/portfolio/components/fastfetch";
import { Panel } from "@/src/shared/ui/panel";
import { AsciiArt } from "@/src/shared/ui/ascii-art";

const H2 =
  "mb-4 font-mono text-[13px] font-medium uppercase tracking-[0.14em] text-amber before:content-['>_']";

export const AboutSection: FC = () => {
  const { about, now } = portfolioContent;

  const whoamiNow = (
    <>
      <div className="mt-7 border-t border-dashed border-fg-4 pt-5">
        <h2 className={H2}>whoami</h2>
        {about.intro.map((p, i) => (
          <p key={i} className="mb-3 max-w-[85ch]">
            {p}
          </p>
        ))}
      </div>
      <div className="mt-7 text-[13px] leading-[1.65] text-fg-1">
        <h2 className={H2}>now</h2>
        <p className="text-[11px] text-fg-3">
          a /now page — what i&apos;m doing this season.
        </p>
        <ul className="m-0 list-none p-0">
          {now.items.map((line, i) => (
            <li
              key={i}
              className="relative py-1 pl-[18px] before:absolute before:left-0 before:text-fg-3 before:content-['─']"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: one full-width panel — fastfetch crest + identity readout up
          top, whoami/now flowing beneath. Spans both grid columns and drops the
          inter-column rule so the root reads as a single pane. */}
      <Panel
        className="hidden md:flex md:col-span-2 md:border-r-0"
        label="~/about"
        meta={
          <span>
            edited <span className="text-fg-1">29.05.2026</span>
          </span>
        }
      >
        <div className="w-full">
          <Fastfetch />
          {whoamiNow}
        </div>
      </Panel>
      {/* Mobile: identity readout + whoami/now, then the ascii hand below. */}
      <Panel
        className="md:hidden"
        label="~/now"
        meta={
          <span>
            updated <span className="text-fg-1">{now.updated}</span>
          </span>
        }
      >
        <FastFetchInfo />
        {whoamiNow}
      </Panel>
      <Panel label="~/ascii.txt" className="max-md:aspect-square md:hidden">
        {/* Mobile-only panel: the aspect-square Panel bounds it, so the
            absolute fill has real height here. */}
        <AsciiArt
          src="/ascii/rose.ans"
          mode="scheme"
          reveal="dither"
          label="ascii rose"
          className="absolute inset-0"
        />
      </Panel>
    </>
  );
};
