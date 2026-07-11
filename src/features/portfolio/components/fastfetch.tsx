import type { FC } from "react";

import { cn } from "@/src/shared/lib/utils";
import { portfolioContent } from "../../../content/portfolio/portfolio-content";

interface FastfetchProps {
  className?: string;
}

interface Row {
  icon: string;
  key: string;
  value: string;
}

// Nerd Font glyph codepoints (resolved by Symbols Nerd Font Mono — see
// globals.css). Kept as escapes so the source stays ASCII-clean.
const NF = {
  user: "", // nf-fa-user
  briefcase: "", // nf-fa-briefcase
  at: "", // nf-fa-at
  mapMarker: "", // nf-fa-map_marker
  crosshairs: "", // nf-fa-crosshairs
  bolt: "", // nf-fa-bolt
} as const;

// Palette swatch — mirrors fastfetch's trailing colour dots, mapped onto the
// site's accent tokens so it re-tints with every theme.
const DOTS = [
  "bg-red",
  "bg-yellow",
  "bg-amber",
  "bg-cyan",
  "bg-cyan-dim",
  "bg-magenta",
  "bg-fg-1",
];

interface BoxProps {
  rows: Row[];
}

/**
 * A fastfetch info box: a bordered group whose top rule is notched open near
 * the left (the "space where the icons sit"). The top edge is drawn as a 1px
 * gradient line with a transparent window rather than a real border, so the gap
 * reads cleanly over the panel's translucent glass instead of being patched
 * with an opaque strip.
 */
const Box: FC<BoxProps> = ({ rows }) => (
  <div className="relative rounded-[3px] border border-t-0 border-fg-4 px-4 py-3">
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-px"
      style={{
        background:
          "linear-gradient(to right, var(--fg-4) 0 14px, transparent 14px 44px, var(--fg-4) 44px)",
      }}
    />
    <div className="grid grid-cols-[16px_64px_minmax(0,1fr)] items-baseline gap-x-2.5 gap-y-2 text-[12px]">
      {rows.map((row) => (
        <div key={row.key} className="contents">
          <span className="font-mono text-[13px] leading-none text-amber">
            {row.icon}
          </span>
          <span className="text-cyan">
            {row.key}
            <span className="text-amber">:</span>
          </span>
          <span className="text-fg-1">{row.value}</span>
        </div>
      ))}
    </div>
  </div>
);

/**
 * A fastfetch-style identity readout: themed wolf crest on the left, a
 * `jared@linux` header, and the bio fields grouped into notched boxes
 * (identity / place / status), capped by a colour-swatch row. Pulls straight
 * from portfolioContent.
 */
export const Fastfetch: FC<FastfetchProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12",
        className,
      )}
    >
      {/* Themed wolf crest. The SVG is a single-colour glyph map (transparent
          background) used as a mask so it inherits the theme's foreground
          instead of its baked-in grey. The aspect ratio plus a fixed height
          sizes the art on stacked layouts; on lg it sits beside the info column
          at a fixed proportion (`mask-size: contain` scales it to fit). */}
      <div
        aria-hidden
        className="aspect-[1080/1344] h-[300px] flex-none self-center lg:h-auto lg:w-2/5 lg:max-w-[340px] lg:self-start"
        style={{
          backgroundColor: "var(--crest)",
          // Two mask layers, intersected: the glyph shape AND a diagonal
          // opacity ramp that fades the crest out toward the top-left and
          // bottom-right corners so it dissolves softly into the panel.
          WebkitMaskImage:
            "url(/ascii/hand.webp), linear-gradient(135deg, transparent 0%, #000 26%, #000 74%, transparent 100%)",
          maskImage:
            "url(/ascii/hand.webp), linear-gradient(135deg, transparent 0%, #000 26%, #000 74%, transparent 100%)",
          WebkitMaskRepeat: "no-repeat, no-repeat",
          maskRepeat: "no-repeat, no-repeat",
          WebkitMaskPosition: "top left, center",
          maskPosition: "top left, center",
          WebkitMaskSize: "contain, 100% 100%",
          maskSize: "contain, 100% 100%",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
          // Promote to its own compositor layer so the intro's animating
          // clip-path sweep composites a cached mask texture instead of
          // repainting the crest each frame.
          transform: "translateZ(0)",
          contain: "paint",
        }}
      />
      <FastFetchInfo classname="w-full lg:flex-1" />
    </div>
  );
};

interface Props {
  classname?: string;
}

export const FastFetchInfo: FC<Props> = ({ classname }) => {
  const { user, about } = portfolioContent;
  const bullet = (k: string) =>
    about.bullets.find(([key]) => key === k)?.[1] ?? "";

  const groups: Row[][] = [
    [
      { icon: NF.user, key: "name", value: user.name },
      { icon: NF.briefcase, key: "role", value: user.role },
      { icon: NF.at, key: "handle", value: `@${user.handle}` },
    ],
    [
      { icon: NF.mapMarker, key: "based", value: user.based },
      { icon: NF.crosshairs, key: "focus", value: bullet("focus") },
    ],
    [{ icon: NF.bolt, key: "status", value: bullet("status") }],
  ];

  return (
    <div className={cn(" min-w-0  flex-1 space-y-4", classname)}>
      <div>
        <div className="text-[13px] font-medium tracking-[0.04em]">
          <span className="text-cyan">jared</span>
          <span className="text-fg-3">@</span>
          <span className="text-amber">linux</span>
        </div>
        <div aria-hidden className="select-none text-fg-4">
          -----------
        </div>
      </div>

      {groups.map((rows, i) => (
        <Box key={i} rows={rows} />
      ))}

      <div className="flex gap-2 pt-0.5" aria-hidden>
        {DOTS.map((dot, i) => (
          <span key={i} className={cn("h-2.5 w-2.5 rounded-full", dot)} />
        ))}
      </div>
    </div>
  );
};
