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
      <div className="relative flex min-h-[460px] flex-col justify-end gap-10 px-8 py-6 max-md:min-h-[320px] max-md:px-5">
        <div className="flex flex-col items-start gap-3.5">
          <h2 className="display text-[clamp(40px,8vw,104px)] leading-[1.25]">
            <span className="bg-(--color-canvas) px-2.5 [box-decoration-break:clone]">
              {landing.headline}
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
};
