"use client";

import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { Panel } from "@/src/shared/ui/panel";
import { AsciiArt } from "@/src/shared/ui/ascii-art";

const H2 =
  "mb-4 font-mono text-[13px] font-medium uppercase tracking-[0.14em] text-amber before:content-['>_']";
const DT = "text-[11px] uppercase tracking-[0.08em] text-fg-3";
const DD = "m-0 text-fg-1";
const LINK =
  "border-b border-dashed border-cyan-dim text-cyan no-underline hover:border-fg-0 hover:text-fg-0";

interface ElsewhereLink {
  when: string;
  handle: string;
  href: string;
  note: string;
}

const ELSEWHERE: ElsewhereLink[] = [
  {
    when: "github",
    handle: "github.com/Dawaad",
    href: "https://github.com/Dawaad",
    note: "open source · 25 repos",
  },
  {
    when: "linkedin",
    handle: "linkedin.com/in/ibuildshitgood",
    href: "https://linkedin.com/in/ibuildshitgood",
    note: "résumé · long-form work history",
  },
  {
    when: "instagram",
    handle: "instagram.com/dawad.t",
    href: "https://instagram.com/dawad.t",
    note: "content · videography",
  },
  {
    when: "substack",
    handle: "substack.com/@byjared",
    href: "https://substack.com/@byjared",
    note: "all my thoughts · system design & architecture breakdowns",
  },
];

export const ContactSection: FC = () => {
  const c = portfolioContent.contact;

  return (
    <>
      <Panel label="~/contact.card">
        <div className="text-[13px] leading-[1.65] text-fg-1">
          <h2 className={H2}>contact</h2>
          <dl className="grid grid-cols-[90px_1fr] gap-x-[14px] gap-y-1.5 text-[12px]">
            <dt className={DT}>email</dt>
            <dd className={DD}>
              <a href={"mailto:" + c.email} className={LINK}>
                {c.email}
              </a>
            </dd>
          </dl>
          <p className="mt-[22px] text-[11px] text-fg-3">
            {"// replies in 1–3 days · no recruiter pitches"}
          </p>
        </div>
        <div className="mt-7 text-[13px] leading-[1.65] text-fg-1">
          <h2 className={H2}>elsewhere</h2>
          <div className="mt-3 flex flex-col">
            {ELSEWHERE.map((l) => (
              <div
                key={l.when}
                className="grid grid-cols-[90px_1fr] items-baseline gap-3.5 border-b border-dashed border-fg-4 px-1.5 py-2.5 text-[12.5px]"
              >
                <span className="text-[11px] tracking-[0.06em] text-fg-3">
                  {l.when}
                </span>
                <span className="text-fg-1">
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={LINK}
                  >
                    {l.handle}
                  </a>
                  <small className="mt-[3px] block text-[11px] text-fg-3">
                    {l.note}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <Panel label="~/ascii.txt" className="max-md:aspect-square">
        {/* Colour ASCII export rendered live on canvas — swap the .ans file
            under public/ascii/ to change the art. */}
        <AsciiArt
          src="/ascii/rose.ans"
          mode="original"
          label="ascii rose"
          className="absolute inset-0"
        />
      </Panel>
    </>
  );
};
