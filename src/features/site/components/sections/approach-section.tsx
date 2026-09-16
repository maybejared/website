import { Label, SectionHeader } from "@jt/ds";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

export const ApproachSection: FC = () => (
  <section
    id="about"
    className="jt-band flex flex-col gap-4"
    style={{ padding: "24px 32px 28px" }}
  >
    <SectionHeader title="Approach" />
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
      {portfolioContent.landing.approach.map((item) => (
        <div key={item.title} className="flex flex-col gap-2">
          <Label tone="accent">{item.title}</Label>
          <p className="jt-body">{item.body}</p>
        </div>
      ))}
    </div>
  </section>
);
