import type { FC, ReactNode, CSSProperties } from 'react';
import { Marker } from './Marker';

/** Props for the Panel component. */
export interface PanelProps {
  /** Optional title shown in the panel head. */
  title?: string;
  /** Optional index label shown at the right of the panel head. */
  index?: string;
  /** Whether the panel uses the ink-bordered variant. */
  ink?: boolean;
  /** Optional footer content shown below the children. */
  footer?: ReactNode;
  /** Panel body content. */
  children?: ReactNode;
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Bordered panel with an optional head, body, and footer. */
export const Panel: FC<PanelProps> = ({ title, index, ink, footer, children, className, style }) => {
  const classes = ['panel', ink && 'panel--ink', className].filter(Boolean).join(' ');
  return (
    <section className={classes} style={style}>
      {title && (
        <div className="panel__head">
          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Marker />
            <span className="label label--ink">{title}</span>
          </span>
          {index && <span className="label label--accent">{index}</span>}
        </div>
      )}
      {children}
      {footer && (
        <div className="panel__foot">
          <span className="rule" style={{ flex: 'none', height: 1 }} />
          {footer}
        </div>
      )}
    </section>
  );
};
