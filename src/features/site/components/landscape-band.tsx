import { Label, Marker } from "@jt/ds";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

const ridges = [
  {
    height: "78%",
    background: "oklch(0.62 0.17 152)",
    clipPath:
      "polygon(0% 100%,0% 52%,14% 34%,28% 48%,44% 12%,58% 40%,72% 26%,86% 46%,100% 30%,100% 100%)",
  },
  {
    height: "52%",
    background: "oklch(0.72 0.19 142)",
    clipPath:
      "polygon(0% 100%,0% 58%,18% 30%,36% 56%,52% 24%,70% 54%,84% 36%,100% 62%,100% 100%)",
  },
  {
    height: "26%",
    background: "oklch(0.66 0.19 46)",
    clipPath:
      "polygon(0% 100%,0% 62%,22% 34%,46% 66%,64% 40%,82% 68%,100% 48%,100% 100%)",
  },
];

/** Pixel-landscape closing band with the site headline set over it. */
export const LandscapeBand: FC = () => {
  const { landing } = portfolioContent;
  return (
    <div className="relative overflow-hidden border-t border-(--jt-border) bg-[#b8ddf2]">
      {ridges.map((ridge) => (
        <div
          key={ridge.height}
          className="absolute right-0 bottom-0 left-0"
          style={ridge}
        />
      ))}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "radial-gradient(#f4f3ef 1.1px,transparent 1.2px)",
          backgroundSize: "5px 5px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg,rgba(20,20,18,0.08) 1px,transparent 1px)",
          backgroundSize: "11.11% 100%",
        }}
      />
      <div className="relative flex h-[460px] flex-col justify-between px-8 py-6 max-md:h-[320px] max-md:px-5">
        <div className="flex items-center gap-2.5">
          <Marker style={{ background: "oklch(0.66 0.19 46)" }} />
          <Label tone="ink" className="bg-(--jt-canvas) px-[7px] py-[3px]">
            {landing.kicker}
          </Label>
        </div>
        <div className="flex flex-col items-start gap-3.5">
          <Label tone="ink" className="bg-(--jt-canvas) px-[7px] py-[3px]">
            Systems for a brighter tomorrow
          </Label>
          <h2 className="jt-display text-[clamp(40px,8vw,104px)]">
            <span className="bg-(--jt-canvas) px-2.5 [box-decoration-break:clone]">
              {landing.headline}
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
};
