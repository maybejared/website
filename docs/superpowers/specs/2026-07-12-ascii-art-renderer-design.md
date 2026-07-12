# ASCII Art Renderer — Design

## Problem

The decorative ASCII panels (`~/ascii.txt` in contact, the about hand art) are
static masked webp images. The contact panel currently renders as a squashed
strip, the beige scheme needed a blueprint special-case for contrast, and none
of it can animate or be reused. The user authors colour ASCII art in an
external tool (asciinator-style) that exports `.ansi` files and wants a
reusable component to render such art — with entrance animation — across any
terminal window or app in the portfolio.

## Input format

Canonical input: `.ans` files using truecolour SGR escapes. Confirmed against
the committed sample (`asciinator_12Jul_001.ans`, 61 rows × ~120 cols):

- `ESC[38;2;R;G;Bm` — set foreground colour
- `ESC[0m` — reset
- plain characters advance the cursor; newlines end rows; spaces are empty cells

No background codes, no cursor movement, no 16/256-colour forms. The parser
rejects nothing — unknown SGR sequences are skipped, so exports from other
tools degrade gracefully.

## Architecture

Three units:

### 1. Parser — `src/shared/lib/ascii/ansi.ts`

```ts
interface AsciiCell { ch: string; rgb: [number, number, number] | null }
interface AsciiArt { cols: number; rows: number; cells: AsciiCell[][] }
parseAnsi(text: string): AsciiArt
```

Pure function. `rgb: null` for uncoloured glyphs (render with the scheme's
default fg). `cols` = longest row. Unit-tested against the repo fixture.

### 2. Component — `src/shared/ui/ascii-art.tsx`

```ts
interface Props {
  src: string;                     // e.g. "/ascii/rose.ans" (public/)
  mode?: "original" | "tint";      // default "original"
  reveal?: boolean;                // default true — scanline entrance
  className?: string;
}
```

Canvas renderer:

- Fetches and parses `src` once (per src), caches the parsed art module-level.
- Canvas sized to container width; height from grid aspect (cell aspect ≈
  0.6 width/height, the mono font's advance/line-height ratio). DPR-aware.
- Glyphs drawn with the site mono stack via `fillText`, one pass per colour
  run for speed.
- `mode="tint"`: per-cell luminance from the exported rgb maps onto a ramp
  between the active scheme's `--fg-4` and `--fg-0` (read via
  `getComputedStyle` at draw time; redraws when the scheme class changes —
  observed via a `MutationObserver` on `body` class).
- `reveal`: rAF scanline — rows paint top→bottom over ~600ms on first
  intersection (IntersectionObserver), once. Skipped entirely under
  `prefers-reduced-motion` (paint everything immediately).
- Accessibility: canvas always gets `role="img"` + `aria-label` from a
  `label` prop (optional, default "ascii art").

### 3. Integration

- Sample export committed to `public/ascii/` and used by the contact window:
  the broken `~/ascii.txt` masked-webp panel body becomes
  `<AsciiArt src="/ascii/asciinator_12Jul_001.ans" mode="original" />`.
- About's `~/ascii.txt` panel swaps the same way.
- The `.ascii-panel` blueprint special-case in `globals.css` and the
  crest-mask styling on those two panels retire once both are swapped. The
  fastfetch wolf crest (a different visual: image mask, not character art)
  stays as-is.

## Error handling

- Fetch failure or empty parse → render nothing (decorative content, no
  fallback UI), log once in dev.
- Oversized art is safe: canvas scales to container; parsing is O(bytes).

## Testing

- Parser: fixture-driven unit tests — row/col counts, colour of a known cell,
  reset handling, unknown-sequence skip.
- Component: RTL smoke test with mocked fetch — canvas mounts, aria label set.
- Visual: Playwright screenshot of the contact window post-swap.

## Out of scope (seams left open)

- Multi-frame `.ans` sequences (animation clips) — the `AsciiArt` type and
  component structure don't preclude a future `frames: AsciiArt[]`.
- `.json`/`.html` exporter adapters.
- Ambient loop effects (shimmer/flicker).
