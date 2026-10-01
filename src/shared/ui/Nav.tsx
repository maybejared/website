import type { FC } from 'react';
import { Marker } from './Marker';
import { cn } from './cn';

/** Props for the Nav component. */
export interface NavProps {
  /** Brand name shown at the start of the nav. */
  brand: string;
  /** When set, the marker and brand become a link. */
  brandHref?: string;
  /** Optional tagline shown next to the brand. */
  tagline?: string;
  /** Navigation items rendered in order. */
  items: Array<{ index: string; label: string; href: string; active?: boolean }>;
  /** Optional call-to-action link shown at the end of the nav. */
  cta?: { label: string; href: string };
  /** Extra class name appended after the DS classes. */
  className?: string;
}

/** Top navigation bar with a brand mark, items, and an optional call to action. */
export const Nav: FC<NavProps> = ({ brand, brandHref, tagline, items, cta, className }) => {
  const classes = cn('nav', className);
  return (
    <nav className={classes}>
      <div className="nav__brand">
        {brandHref ? (
          <a href={brandHref} className="nav__brand-link">
            <Marker />
            <span className="label label--ink font-semibold">
              {brand}
            </span>
          </a>
        ) : (
          <>
            <Marker />
            <span className="label label--ink font-semibold">
              {brand}
            </span>
          </>
        )}
        {tagline && <span className="label">{tagline}</span>}
      </div>
      <div className="nav__items">
        {items.map((item) => (
          <a
            key={item.href}
            className={cn('nav__item', 'label', item.active && 'nav__item--active')}
            href={item.href}
          >
            <span className="nav__index">[{item.index}]</span> {item.label}
          </a>
        ))}
        {cta && (
          <>
            <span className="rule rule--v h-4" />
            <a className="label label--accent" href={cta.href}>
              {cta.label} ↗
            </a>
          </>
        )}
      </div>
    </nav>
  );
};
