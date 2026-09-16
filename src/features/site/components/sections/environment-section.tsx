import { Corners, Crosshair, Label, Marker, SectionHeader } from "@jt/ds";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { ImagePlaceholder } from "@/src/features/site/components/image-placeholder";

export const EnvironmentSection: FC = () => {
  const { landing } = portfolioContent;
  return (
    <section
      className="jt-band flex flex-col gap-3.5"
      style={{ padding: "20px 32px 28px" }}
    >
      <SectionHeader title="// Environments inspire better systems" />
      <div className="grid gap-4 md:grid-cols-[104px_minmax(0,1fr)_92px]">
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
        <Corners>
          <ImagePlaceholder
            caption="environmental hero — 1600×600, dithered"
            height={300}
          >
            <Crosshair
              size={120}
              className="z-[2]"
              style={{
                position: "absolute",
                left: "62%",
                top: "34%",
                transform: "translate(-50%,-50%)",
              }}
            />
          </ImagePlaceholder>
        </Corners>
        <div className="hidden flex-col items-end justify-between gap-5 text-right md:flex">
          <Marker />
          <Label style={{ lineHeight: 1.9 }}>
            Systems
            <br />
            for a
            <br />
            brighter
            <br />
            tomorrow
          </Label>
          <Label>
            {"// JT.2026"}
            <br />
            V01
          </Label>
        </div>
      </div>
    </section>
  );
};
