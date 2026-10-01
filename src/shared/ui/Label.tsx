import type { FC, ReactNode } from 'react';
import { cn } from './cn';

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
}

/** Small uppercase mono label used throughout the design system. */
export const Label: FC<LabelProps> = ({ as = 'span', tone = 'muted', vertical, children, className }) => {
  const Tag = as;
  const classes = cn('label', tone === 'ink' && 'label--ink', tone === 'accent' && 'label--accent', vertical && 'label--vertical', className);
  return (
    <Tag className={classes}>
      {children}
    </Tag>
  );
};
