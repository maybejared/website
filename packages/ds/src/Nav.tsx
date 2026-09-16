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
  const classes = ['jt-nav', className].filter(Boolean).join(' ');
  return (
    <nav className={classes} style={style}>
      <div className="jt-nav__brand">
        <Marker />
        <span className="jt-label jt-label--ink" style={{ fontWeight: 600 }}>
          {brand}
        </span>
        {tagline && <span className="jt-label">{tagline}</span>}
      </div>
      <div className="jt-nav__items">
        {items.map((item) => (
          <a
            key={item.href}
            className={['jt-nav__item', 'jt-label', item.active && 'jt-nav__item--active'].filter(Boolean).join(' ')}
            href={item.href}
          >
            <span className="jt-nav__index">[{item.index}]</span> {item.label}
          </a>
        ))}
        {cta && (
          <>
            <span className="jt-rule jt-rule--v" style={{ height: 16 }} />
            <a className="jt-label jt-label--accent" href={cta.href}>
              {cta.label} ↗
            </a>
          </>
        )}
      </div>
    </nav>
  );
};
