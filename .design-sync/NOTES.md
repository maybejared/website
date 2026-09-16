# design-sync notes

- The DS package lives at `packages/ds` inside the Next.js site repo. It has no dependencies of its own; React and TypeScript resolve from the root `node_modules`. Pass `--node-modules ./node_modules --entry ./packages/ds/dist/index.js`.
- The old terminal-themed site components under `src/` are NOT part of the design system and must never be synced.
- Fonts are Google Fonts loaded by the `@import` at the top of `src/styles.css` (Inter Tight, IBM Plex Mono). Expect `[FONT_REMOTE]`.
- Render check imports `playwright` 1.61 from root `node_modules`, which pins Chromium build 1228. `npx playwright` and `node_modules/.bin/playwright` resolve to `@playwright/test` 1.60 (build 1223) and install the wrong browser. Install with `node node_modules/playwright/cli.js install chromium`.
- Base link rule in `styles.css` is `.jt-root :where(a)` on purpose. A plain `.jt-root a` outranks single-class component colours and paints card titles, nav items and fill-button text cobalt.
- Wide components (Button, DitherImage, Nav, Panel, DataTable, ListRow, List, ProjectCard) use `cardMode: column` in config so the product grid does not crop them.
- Known render warns: `[FONT_REMOTE]` for IBM Plex Mono and Inter Tight (Google Fonts at runtime).

## Re-sync risks

- Fonts come from Google Fonts at runtime. If claude.ai/design blocks that host, every card falls back to system mono. Ship woff2 files via `extraFonts` if that happens.
- Preview content (project names, post titles) is copied from `src/content`. It does not update when the site content changes.
- Chromium build pin moves with the `playwright` version in root `package.json`. Reinstall via the CLI line above after a bump.
