import { DataTable, SectionHeader } from "@jt/ds";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

const columns = [
  { key: "year", label: "Year" },
  { key: "role", label: "Role" },
  { key: "org", label: "Organisation" },
  { key: "focus", label: "Focus", align: "right" as const },
];

export const ExperienceSection: FC = () => (
  <section
    id="experience"
    className="band flex flex-col gap-3.5"
    style={{ padding: "24px 32px 28px" }}
  >
    <SectionHeader title="Experience" />
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        style={{ minWidth: 640 }}
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
          focus: entry.tag.replace(/[[\]]/g, ""),
        }))}
      />
    </div>
  </section>
);
