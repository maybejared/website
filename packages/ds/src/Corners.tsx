import type { FC, ReactNode, CSSProperties } from 'react';

/** Props for the Corners component. */
export interface CornersProps {
  /** Corner bracket size variant. */
  variant?: 'square' | 'tall';
  /** Content wrapped by the corner brackets. */
  children?: ReactNode;
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Wraps children with four bracket-style corner marks. */
export const Corners: FC<CornersProps> = ({ variant = 'square', children, className, style }) => {
  const classes = ['jt-corners', variant === 'tall' && 'jt-corners--tall', className].filter(Boolean).join(' ');
  return (
    <div className={classes} style={style}>
      <span className="jt-corner jt-corner--tl" />
      <span className="jt-corner jt-corner--tr" />
      <span className="jt-corner jt-corner--bl" />
      <span className="jt-corner jt-corner--br" />
      {children}
    </div>
  );
};
