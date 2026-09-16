import { Corners, DitherImage, Label, SectionHeader } from "@jt/ds";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { cdnUrl } from "@/src/shared/lib/cdn";

export const EnvironmentSection: FC = () => {
  const { landing } = portfolioContent;
  return (
    <section
      className="band flex flex-col gap-3.5"
      style={{ padding: "20px 32px 28px" }}
    >
      <SectionHeader title="// Environments inspire better systems" />
      <div className="grid gap-4 md:-mr-8 md:grid-cols-[104px_minmax(0,1fr)]">
        <div className="hidden flex-col justify-between gap-5 md:flex">
          <Label className="whitespace-pre-line" style={{ lineHeight: 1.7 }}>
            {landing.coordinates}
          </Label>
          <Label style={{ lineHeight: 1.9 }}>
            Nature
            <br />
            Technology
            <br />
            People
            <br />A brighter
            <br />
            tomorrow
          </Label>
        </div>
        <Corners className="env-corners">
          <DitherImage
            src={cdnUrl("ascii/environment.webp")}
            alt="Mountain lake with pines"
            mode="color"
            className="env-hero"
          />
        </Corners>
      </div>
    </section>
  );
};
