import type { FC, ReactNode } from 'react';
import { cn } from './cn';

/** Props for the List component. */
export interface ListProps {
  /** List row content. */
  children?: ReactNode;
  /** Extra class name appended after the DS classes. */
  className?: string;
}

/** Vertical container for ListRow items. */
export const List: FC<ListProps> = ({ children, className }) => {
  const classes = cn('list', className);
  return (
    <div className={classes}>
      {children}
    </div>
  );
};
