import type { FC, ReactNode } from 'react';
import { cn } from './cn';

/** Props for the ArrowLink component. */
export interface ArrowLinkProps {
  /** Destination URL for the link. */
  href: string;
  /** Link content. */
  children?: ReactNode;
  /** Extra class name appended after the DS classes. */
  className?: string;
}

/** Text link with a trailing arrow that steps right on hover. */
export const ArrowLink: FC<ArrowLinkProps> = ({ href, children, className }) => {
  const classes = cn('link', className);
  return (
    <a className={classes} href={href}>
      {children}
      <span className="link__arrow">↗</span>
    </a>
  );
};
