const base = process.env.NEXT_PUBLIC_CDN_URL ?? "";

/** URL for an object in the preview-media bucket; root-relative when no CDN is configured. */
export const cdnUrl = (key: string): string => `${base}/${key}`;
