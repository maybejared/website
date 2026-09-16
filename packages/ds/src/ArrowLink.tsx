import type { FC, ReactNode, CSSProperties } from 'react';

/** Props for the ArrowLink component. */
export interface ArrowLinkProps {
  /** Destination URL for the link. */
  href: string;
  /** Link content. */
  children?: ReactNode;
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Text link with a trailing arrow that steps right on hover. */
export const ArrowLink: FC<ArrowLinkProps> = ({ href, children, className, style }) => {
  const classes = ['jt-link', className].filter(Boolean).join(' ');
  return (
    <a className={classes} style={style} href={href}>
      {children}
      <span className="jt-link__arrow">↗</span>
    </a>
  );
};
