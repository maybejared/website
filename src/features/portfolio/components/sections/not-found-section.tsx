"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";

import { Panel } from "@/src/shared/ui/panel";

const H2 =
  "mb-4 font-mono text-[13px] font-medium uppercase tracking-[0.14em] text-red before:content-['>_']";
const DT = "text-[11px] uppercase tracking-[0.08em] text-fg-3";
const DD = "m-0 text-fg-1";
const LINK =
  "border-b border-dashed border-cyan-dim text-cyan no-underline hover:border-fg-0 hover:text-fg-0";

export const NotFoundSection: FC = () => {
  const pathname = usePathname();

  return (
    <>
      <Panel label="~/404" meta="route not found">
        <div className="text-[13px] leading-[1.65] text-fg-1">
          <pre className="m-0 select-none font-mono text-[clamp(28px,7vw,52px)] leading-[1.05] text-red">
            {`404`}
          </pre>
          <h2 className={H2 + " mt-5"}>no such file or directory</h2>
          <p className="mb-3 max-w-[56ch] text-fg-2">
            the path you followed does not resolve. it may have been moved,
            renamed, or never existed.
          </p>
          <dl className="mt-[22px] grid grid-cols-[90px_1fr] gap-x-[14px] gap-y-1.5 border-t border-dashed border-fg-4 pt-4 text-[12px]">
            <dt className={DT}>requested</dt>
            <dd className="m-0 break-all text-fg-1">{pathname}</dd>
            <dt className={DT}>status</dt>
            <dd className={DD}>404 · not found</dd>
            <dt className={DT}>return</dt>
            <dd className={DD}>
              <Link href="/" className={LINK}>
                cd ~
              </Link>
            </dd>
          </dl>
          <p className="mt-[22px] text-[11px] text-fg-3">
            {"// press [1] or run `cd ~` to head home"}
          </p>
        </div>
      </Panel>
      <Panel
        label="~/ascii.txt"
        meta="signal lost"
        className="ascii-panel max-md:aspect-square"
      >
        {/* The portrait is a single-colour ASCII SVG; rendering it as a
            currentColor-driven mask lets it inherit each theme's foreground
            (light-on-dark or dark-on-light) instead of its baked-in green.
            `absolute inset-0` anchors to the Panel's relative scroll box, so it
            bleeds past the viewport padding and fills the whole section. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-fg-1"
          style={{
            WebkitMaskImage: "url(/ascii/portrait.webp)",
            maskImage: "url(/ascii/portrait.webp)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "cover",
            maskSize: "cover",
          }}
        />
      </Panel>
    </>
  );
};
