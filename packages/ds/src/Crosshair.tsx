import type { FC, CSSProperties } from 'react';

/** Props for the Crosshair component. */
export interface CrosshairProps {
  /** Width and height of the crosshair in pixels. */
  size?: number;
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Crosshair mark with a centered dot, sized in pixels. */
export const Crosshair: FC<CrosshairProps> = ({ size = 80, className, style }) => {
  const classes = ['jt-crosshair', className].filter(Boolean).join(' ');
  return (
    <span className={classes} style={{ width: size, height: size, ...style }}>
      <span className="jt-crosshair__dot" />
    </span>
  );
};
