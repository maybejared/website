"use client";

import type { ImageLoaderProps } from "next/image";

import { cdnUrl } from "./cdn";

/** R2 serves the stored webp as-is, so width and quality are ignored. */
export default function cdnImageLoader({ src }: ImageLoaderProps): string {
  return cdnUrl(src);
}
