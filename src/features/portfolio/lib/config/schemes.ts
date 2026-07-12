import type { SchemeName } from "@/src/shared/types/portfolio";

export const SCHEMES: SchemeName[] = ["beige", "mono", "moonlit"];

export const DEFAULT_SCHEME: SchemeName = "moonlit";

/** Mini palette chips for the >theme swatch cards; mirrors globals.css. */
export const SCHEME_PREVIEWS: Record<
  SchemeName,
  { surfaces: [string, string, string]; accent: string }
> = {
  beige: { surfaces: ["#f1ded7", "#f7eae4", "#fcf3ee"], accent: "#a04b3a" },
  mono: { surfaces: ["#101013", "#181820", "#22222c"], accent: "#ff9b50" },
  moonlit: { surfaces: ["#0c1020", "#141a2e", "#1e263e"], accent: "#f0b878" },
};
