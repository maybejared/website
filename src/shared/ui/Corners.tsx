import type { FC, ReactNode } from 'react';
import { cn } from './cn';

/** Props for the Corners component. */
export interface CornersProps {
  /** Corner bracket size variant. */
  variant?: 'square' | 'tall';
  /** Content wrapped by the corner brackets. */
  children?: ReactNode;
  /** Extra class name appended after the DS classes. */
  className?: string;
}

/** Wraps children with four bracket-style corner marks. */
export const Corners: FC<CornersProps> = ({ variant = 'square', children, className }) => {
  const classes = cn('corners', variant === 'tall' && 'corners--tall', className);
  return (
    <div className={classes}>
      <span className="corner corner--tl" />
      <span className="corner corner--tr" />
      <span className="corner corner--bl" />
      <span className="corner corner--br" />
      {children}
    </div>
  );
};
