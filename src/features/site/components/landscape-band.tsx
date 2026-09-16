import { Label, Marker } from "@jt/ds";
import Image from "next/image";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

/** Closing band: dithered landscape with the site headline set over it. */
export const LandscapeBand: FC = () => {
  const { landing } = portfolioContent;
  return (
    <div className="relative overflow-hidden border-t border-(--color-border)">
      <Image
        src="ascii/landscape.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-[50%_40%]"
      />
      <div className="relative flex h-[460px] flex-col justify-between px-8 py-6 max-md:h-[320px] max-md:px-5">
        <div className="flex items-center gap-2.5">
          <Marker style={{ background: "oklch(0.66 0.19 46)" }} />
          <Label tone="ink" className="bg-(--color-canvas) px-[7px] py-[3px]">
            {landing.kicker}
          </Label>
        </div>
        <div className="flex flex-col items-start gap-3.5">
          <Label tone="ink" className="bg-(--color-canvas) px-[7px] py-[3px]">
            Systems for a brighter tomorrow
          </Label>
          <h2 className="display text-[clamp(40px,8vw,104px)]">
            <span className="bg-(--color-canvas) px-2.5 [box-decoration-break:clone]">
              {landing.headline}
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
};
