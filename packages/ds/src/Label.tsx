import type { FC, ReactNode, CSSProperties } from 'react';

/** Props for the Label component. */
export interface LabelProps {
  /** Which element to render as the root. */
  as?: 'span' | 'div' | 'p';
  /** Visual tone of the label text. */
  tone?: 'muted' | 'ink' | 'accent';
  /** Whether the label renders in vertical writing mode. */
  vertical?: boolean;
  /** Label content. */
  children?: ReactNode;
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Small uppercase mono label used throughout the design system. */
export const Label: FC<LabelProps> = ({ as = 'span', tone = 'muted', vertical, children, className, style }) => {
  const Tag = as;
  const classes = [
    'jt-label',
    tone === 'ink' && 'jt-label--ink',
    tone === 'accent' && 'jt-label--accent',
    vertical && 'jt-label--vertical',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag className={classes} style={style}>
      {children}
    </Tag>
  );
};
