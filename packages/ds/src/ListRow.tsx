import type { FC, CSSProperties } from 'react';

/** Props for the ListRow component. */
export interface ListRowProps {
  /** Date text shown in the left column. */
  date: string;
  /** Title text for the row. */
  title: string;
  /** Optional description text shown below the title. */
  description?: string;
  /** Destination URL for the row. */
  href: string;
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Single clickable row showing a date, title, and optional description. */
export const ListRow: FC<ListRowProps> = ({ date, title, description, href, className, style }) => {
  const classes = ['list-row', className].filter(Boolean).join(' ');
  return (
    <a className={classes} style={style} href={href}>
      <span className="label list-row__date">{date}</span>
      <span className="list-row__body">
        <span className="title">{title}</span>
        {description && <span className="list-row__desc">{description}</span>}
      </span>
      <span className="list-row__arrow">→</span>
    </a>
  );
};
