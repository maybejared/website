import type { FC } from 'react';
import { cn } from './cn';

/** Props for the Marker component. */
export interface MarkerProps {
  /** Visual tone of the marker square. */
  tone?: 'accent' | 'rule' | 'ink';
  /** Extra class name appended after the DS classes. */
  className?: string;
}

/** 8px square marker used as a bullet or indicator. */
export const Marker: FC<MarkerProps> = ({ tone = 'accent', className }) => {
  const classes = cn('marker', tone === 'rule' && 'marker--rule', tone === 'ink' && 'marker--ink', className);
  return <span className={classes} />;
};
