import type { FC, CSSProperties } from 'react';
import { Marker } from './Marker';
import { ArrowLink } from './ArrowLink';

/** Props for the SectionHeader component. */
export interface SectionHeaderProps {
  /** Title text shown next to the marker. */
  title: string;
  /** Optional trailing action link. */
  action?: { label: string; href: string };
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Section title row with a marker, a rule, and an optional action link. */
export const SectionHeader: FC<SectionHeaderProps> = ({ title, action, className, style }) => {
  const classes = ['section-header', className].filter(Boolean).join(' ');
  return (
    <div className={classes} style={style}>
      <Marker />
      <span className="label label--ink">{title}</span>
      <span className="rule" />
      {action && <ArrowLink href={action.href}>{action.label}</ArrowLink>}
    </div>
  );
};
