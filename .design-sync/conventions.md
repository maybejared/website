# Building with @jt/ds

## Setup

Add `className="jt-root"` to the outermost element of every screen. It sets the warm off-white ground (`--jt-canvas`), IBM Plex Mono at 12px and ink text. Without it, components render in the browser default font on white. No provider is needed.

Wrap page content in `<div className="jt-sheet">` (one 1px-bordered sheet) and split it into `<section className="jt-band">` panels. Sections are panels inside one document, never floating cards.

```jsx
import { Nav, SectionHeader, ProjectCard, ListRow, List } from '@jt/ds';

<div className="jt-root" style={{ padding: 24 }}>
  <div className="jt-sheet">
    <Nav brand="JT" items={[{ index: '01', label: 'Home', href: '/', active: true }, { index: '02', label: 'Work', href: '/work' }]} />
    <section className="jt-band" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionHeader title="Featured projects" action={{ label: 'View all projects', href: '/work' }} />
      <div className="jt-grid-4">
        <ProjectCard index="01" year="2026" title="signal/cli" tags={['Tool']} description="A terminal client for our IDE backend." href="/work/signal" />
      </div>
    </section>
  </div>
</div>
```

## Styling idiom

Style with the `jt-*` classes from `styles.css` and the `--jt-*` tokens. Never add radii, shadows or gradients.

| Need | Use |
|---|---|
| Ground and panels | `--jt-canvas`, `--jt-panel`, `.jt-sheet`, `.jt-band`, `.jt-panel` |
| Borders | `--jt-border` for panel edges, `--jt-rule` for inner dividers, `.jt-rule`, `.jt-rule--v` |
| Text colour | `--jt-ink`, `--jt-ink-2` (body), `--jt-ink-3` (labels) |
| Accent | `--jt-cobalt` for markers, indices, arrows, hover. Never a background larger than 12px. `.jt-highlight` for headline emphasis |
| Display type | `.jt-display` with `--hero` (116px), `--section` (64px), `--heading` (32px) |
| Mono type | `.jt-title` (13px 600), `.jt-body` (12px), `.jt-label` (10px uppercase) with `--ink`, `--accent`, `--vertical` |
| Marks | `Marker`, `Corners` (images only), `Crosshair`, `.jt-graph` dot pattern, `.jt-hatch` |
| Spacing | `--jt-space-1` (4px) to `--jt-space-8` (48px). Panel padding 20px. Grid gap 16px |
| Layout | `.jt-grid-12`, `.jt-grid-4`. Flex and grid with `gap`, no margins |
| Controls | `Button` 32px tall, `keyHint` on the primary action. `ArrowLink` for "view all" |

Images use `DitherImage`, never a plain `<img>`. Images sit inside `Corners`, never inside a full border.

## Where the truth lives

Read `styles.css` for every token and class. Read `components/<group>/<Name>/<Name>.prompt.md` before using a component. `guidelines/design-principles.md` states the rules behind the look.
