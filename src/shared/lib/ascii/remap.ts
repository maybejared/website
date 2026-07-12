export type Rgb = [number, number, number];

/** Relative luminance, 0..1. */
export const luminance01 = ([r, g, b]: Rgb): number =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/** Low-chroma cells read as greys — they belong on the fg ramp, not an accent. */
export const isNeutral = ([r, g, b]: Rgb): boolean =>
  Math.max(r, g, b) - Math.min(r, g, b) < 28;

const hue = ([r, g, b]: Rgb): number => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};

const hueDistance = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/** Re-light `colour` so its luminance matches `l` (0..1), keeping its hue. */
export const withLuminance = (colour: Rgb, l: number): Rgb => {
  const cl = luminance01(colour);
  if (cl === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  if (l <= cl) {
    const f = l / cl;
    return colour.map((v) => Math.round(v * f)) as Rgb;
  }
  const f = (l - cl) / (1 - cl);
  return colour.map((v) => Math.round(v + (255 - v) * f)) as Rgb;
};

const ramp = (dark: Rgb, light: Rgb, l: number): Rgb =>
  [0, 1, 2].map((i) => Math.round(dark[i] + (light[i] - dark[i]) * l)) as Rgb;

/**
 * Re-express a cell colour in a scheme's palette: neutrals slide along the
 * fg ramp by luminance; saturated cells take the nearest-hue pool accent,
 * re-lit to the cell's original luminance so the art's shading survives.
 */
export const remap = (cell: Rgb, pool: Rgb[], dark: Rgb, light: Rgb): Rgb => {
  const l = luminance01(cell);
  if (isNeutral(cell) || pool.length === 0) return ramp(dark, light, l);
  const h = hue(cell);
  let best = pool[0];
  let bestDistance = Infinity;
  for (const candidate of pool) {
    const d = hueDistance(h, hue(candidate));
    if (d < bestDistance) {
      bestDistance = d;
      best = candidate;
    }
  }
  return withLuminance(best, l);
};
