import { Fragment } from 'react';
import type { FC, ReactNode } from 'react';
import { cn } from './cn';

/** Props for the KeyValue component. */
export interface KeyValueProps {
  /** Rows to render as key/value pairs. */
  rows: Array<{ key: string; value: ReactNode; live?: boolean }>;
  /** Extra class name appended after the DS classes. */
  className?: string;
}

/** Definition list of key/value rows, with an optional live indicator dot. */
export const KeyValue: FC<KeyValueProps> = ({ rows, className }) => {
  const classes = cn('kv', className);
  return (
    <dl className={classes}>
      {rows.map((row) => (
        <Fragment key={row.key}>
          <dt>{row.key}:</dt>
          <dd>
            {row.live && <span className="live" />}
            {row.value}
          </dd>
        </Fragment>
      ))}
    </dl>
  );
};
