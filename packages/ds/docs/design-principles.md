# JT design system: principles

One technical document, many panels. Every screen is a warm off-white sheet (`--jt-canvas`) holding one bordered `.jt-sheet`. Sections are `.jt-band` panels separated by 1px borders, never floating cards. No radii, no shadows, no gradients.

## Type

- Display: Inter Tight 800, `.jt-display--hero` 116px, `.jt-display--section` 64px. Tracking -0.03em, line-height under 1.
- Heading: Inter Tight 600, `.jt-display--heading` 32px.
- Everything else is IBM Plex Mono. `.jt-title` 13px/600 for item titles, `.jt-body` 12px/1.7 in `--jt-ink-2`, `.jt-label` 10px uppercase with 0.14em tracking for all metadata, nav, dates, coordinates and section identifiers such as `01 / WORK`.
- Headline emphasis is a cobalt fill behind ink text (`.jt-highlight`), never colour on the letters.

## Colour

Blue (`--jt-cobalt`) marks the active, the numbered and the interactive: index numbers, markers, arrows, crosshairs, hover states. It never fills an area larger than 12px except the crosshair dot and highlighted headline text. Panel borders use `--jt-border`, inner dividers use `--jt-rule`. Status uses one 8px green dot (`.jt-live`).

## Marks

Sparse and functional. `Marker` squares lead section titles. `Corners` bracket images (tall 20×64 on portraits, square 24×24 on wide bands). Images never take a full border; panels always do. `Crosshair` sits over the focal point of a landscape. Faint graph paper (`.jt-graph`) appears only behind image bands and diagram panels.

## Imagery

Landscapes, forests, water and mountains recur as the counterpoint to the technical frame. Render them through the system: `DitherImage` shows ordered dither at rest and resolves to colour on hover. Motion is stepped (`steps(6)`, 240ms), never eased.

## Layout

12 columns, 16px gutter, 1440px max. Panel padding 20px, hero padding 28 to 32px. Nav and footer are 44px bars. Controls are 32px tall, square, 1px ink border with keycap hints for primary actions.
