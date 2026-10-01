import type { FC } from "react";
import { ArrowLink } from "./ArrowLink";
import { Marker } from "./Marker";
import { cn } from "./cn";

/** Props for the SectionHeader component. */
export interface SectionHeaderProps {
  /** Title text shown next to the marker. */
  title?: string;
  /** Optional trailing action link. */
  action?: { label: string; href: string };
  /** Extra class name appended after the DS classes. */
  className?: string;
}

/** Section title row with a marker, a rule, and an optional action link. */
export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  action,
  className,
}) => {
  const classes = cn("section-header", className);
  return (
    <div className={classes}>
      <Marker />
      <span className="label label--ink">{title}</span>
      <span className="rule" />
      {action && <ArrowLink href={action.href}>{action.label}</ArrowLink>}
    </div>
  );
};
