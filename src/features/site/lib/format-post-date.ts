/** ISO `YYYY-MM-DD` → `May 12, 2026`. */
export const formatPostDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
