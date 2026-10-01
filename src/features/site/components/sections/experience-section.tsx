import { DataTable, Label, SectionHeader } from "@/src/shared/ui";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

const columns = [
  { key: "year", label: "Year" },
  { key: "role", label: "Role" },
  { key: "org", label: "Organisation" },
  { key: "focus", label: "Focus", align: "right" as const },
];

const cleanTag = (tag: string) => tag.replace(/[[\]]/g, "");

export const ExperienceSection: FC = () => (
  <section
    id="experience"
    className="band flex flex-col gap-3.5"
    style={{ padding: "24px 32px 28px" }}
  >
    <SectionHeader title="Experience" />
    <div className="max-md:hidden">
      <DataTable
        columns={columns}
        rows={portfolioContent.experience.map((entry) => ({
          year: entry.date,
          role: (
            <span className="flex flex-col gap-1">
              <span className="title capitalize">{entry.role}</span>
              <span className="max-w-[48ch] text-(--color-ink-3)">
                {entry.detail}
              </span>
            </span>
          ),
          org: <span className="capitalize">{entry.org}</span>,
          focus: cleanTag(entry.tag),
        }))}
      />
    </div>
    <div className="flex flex-col border-t border-(--color-ink) md:hidden">
      {portfolioContent.experience.map((entry) => (
        <div
          key={entry.slug}
          className="flex flex-col gap-3 border-b border-(--color-rule) py-4 text-[11px]"
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <span className="flex flex-col gap-1">
              <Label>Year</Label>
              <span className="text-(--color-cobalt)">{entry.date}</span>
            </span>
            <span className="flex flex-col gap-1">
              <Label>Organisation</Label>
              <span className="capitalize">{entry.org}</span>
            </span>
            <span className="flex flex-col gap-1">
              <Label>Role</Label>
              <span className="title capitalize">{entry.role}</span>
            </span>
            <span className="flex flex-col gap-1">
              <Label>Focus</Label>
              <span>{cleanTag(entry.tag)}</span>
            </span>
          </div>
          <p className="body text-[11px] text-(--color-ink-3)">
            {entry.detail}
          </p>
        </div>
      ))}
    </div>
  </section>
);
