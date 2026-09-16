import { Fragment } from 'react';
import type { FC, ReactNode, CSSProperties } from 'react';

/** Props for the KeyValue component. */
export interface KeyValueProps {
  /** Rows to render as key/value pairs. */
  rows: Array<{ key: string; value: ReactNode; live?: boolean }>;
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Definition list of key/value rows, with an optional live indicator dot. */
export const KeyValue: FC<KeyValueProps> = ({ rows, className, style }) => {
  const classes = ['jt-kv', className].filter(Boolean).join(' ');
  return (
    <dl className={classes} style={style}>
      {rows.map((row) => (
        <Fragment key={row.key}>
          <dt>{row.key}:</dt>
          <dd>
            {row.live && <span className="jt-live" />}
            {row.value}
          </dd>
        </Fragment>
      ))}
    </dl>
  );
};
