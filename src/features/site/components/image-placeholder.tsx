import type { FC, ReactNode } from "react";

import { hatchStyle } from "@/src/features/site/lib/hatch";

interface Props {
  caption: string;
  height: number;
  children?: ReactNode;
}

/** Hatched stand-in for an image slot; swap for DitherImage once the asset exists. */
export const ImagePlaceholder: FC<Props> = ({ caption, height, children }) => (
  <div className="jt-dither jt-graph" style={{ height, ...hatchStyle }}>
    <span className="jt-label jt-dither__caption z-[3]">{caption}</span>
    {children}
  </div>
);
