import type { FC, ReactNode } from 'react';
import { Marker } from './Marker';
import { cn } from './cn';

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
}

/** Bordered panel with an optional head, body, and footer. */
export const Panel: FC<PanelProps> = ({ title, index, ink, footer, children, className }) => {
  const classes = cn('panel', ink && 'panel--ink', className);
  return (
    <section className={classes}>
      {title && (
        <div className="panel__head">
          <span className="flex items-center gap-2.5">
            <Marker />
            <span className="label label--ink">{title}</span>
          </span>
          {index && <span className="label label--accent">{index}</span>}
        </div>
      )}
      {children}
      {footer && (
        <div className="panel__foot">
          <span className="rule h-px flex-none" />
          {footer}
        </div>
      )}
    </section>
  );
};
