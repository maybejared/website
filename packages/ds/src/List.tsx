import type { FC, ReactNode, CSSProperties } from 'react';

/** Props for the List component. */
export interface ListProps {
  /** List row content. */
  children?: ReactNode;
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Vertical container for ListRow items. */
export const List: FC<ListProps> = ({ children, className, style }) => {
  const classes = ['jt-list', className].filter(Boolean).join(' ');
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
};
