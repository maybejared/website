import type { FC, CSSProperties } from 'react';
import { Marker } from './Marker';

/** Props for the Nav component. */
export interface NavProps {
  /** Brand name shown at the start of the nav. */
  brand: string;
  /** Optional tagline shown next to the brand. */
  tagline?: string;
  /** Navigation items rendered in order. */
  items: Array<{ index: string; label: string; href: string; active?: boolean }>;
  /** Optional call-to-action link shown at the end of the nav. */
  cta?: { label: string; href: string };
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Top navigation bar with a brand mark, items, and an optional call to action. */
export const Nav: FC<NavProps> = ({ brand, tagline, items, cta, className, style }) => {
  const classes = ['nav', className].filter(Boolean).join(' ');
  return (
    <nav className={classes} style={style}>
      <div className="nav__brand">
        <Marker />
        <span className="label label--ink" style={{ fontWeight: 600 }}>
          {brand}
        </span>
        {tagline && <span className="label">{tagline}</span>}
      </div>
      <div className="nav__items">
        {items.map((item) => (
          <a
            key={item.href}
            className={['nav__item', 'label', item.active && 'nav__item--active'].filter(Boolean).join(' ')}
            href={item.href}
          >
            <span className="nav__index">[{item.index}]</span> {item.label}
          </a>
        ))}
        {cta && (
          <>
            <span className="rule rule--v" style={{ height: 16 }} />
            <a className="label label--accent" href={cta.href}>
              {cta.label} ↗
            </a>
          </>
        )}
      </div>
    </nav>
  );
};
