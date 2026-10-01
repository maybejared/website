import type { FC } from 'react';
import { cn } from './cn';

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
}

/** Single clickable row showing a date, title, and optional description. */
export const ListRow: FC<ListRowProps> = ({ date, title, description, href, className }) => {
  const classes = cn('list-row', className);
  return (
    <a className={classes} href={href}>
      <span className="label list-row__date">{date}</span>
      <span className="list-row__body">
        <span className="title">{title}</span>
        {description && <span className="list-row__desc">{description}</span>}
      </span>
      <span className="list-row__arrow">→</span>
    </a>
  );
};
