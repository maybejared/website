import type { FC } from 'react';
import { cn } from './cn';

/** Props for the Crosshair component. */
export interface CrosshairProps {
  /** Extra class name appended after the DS classes. */
  className?: string;
}

/** Crosshair mark with a centered dot; override size-20 via className. */
export const Crosshair: FC<CrosshairProps> = ({ className }) => {
  const classes = cn('crosshair size-20', className);
  return (
    <span className={classes}>
      <span className="crosshair__dot" />
    </span>
  );
};
