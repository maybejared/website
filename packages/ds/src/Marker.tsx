import type { FC, CSSProperties } from 'react';

/** Props for the Marker component. */
export interface MarkerProps {
  /** Visual tone of the marker square. */
  tone?: 'accent' | 'rule' | 'ink';
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** 8px square marker used as a bullet or indicator. */
export const Marker: FC<MarkerProps> = ({ tone = 'accent', className, style }) => {
  const classes = ['marker', tone === 'rule' && 'marker--rule', tone === 'ink' && 'marker--ink', className]
    .filter(Boolean)
    .join(' ');
  return <span className={classes} style={style} />;
};
