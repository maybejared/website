import type { FC, ReactNode, CSSProperties } from 'react';

/** Props for the ProjectCard component. */
export interface ProjectCardProps {
  /** Index label shown over the media. */
  index: string;
  /** Year label shown over the media. */
  year: string;
  /** Project title. */
  title: string;
  /** Tags shown below the title. */
  tags: string[];
  /** Short project description. */
  description: string;
  /** Destination URL for the card. */
  href: string;
  /** Optional media content shown above the body. */
  media?: ReactNode;
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Clickable project card with media, a title, tags, and a description. */
export const ProjectCard: FC<ProjectCardProps> = ({ index, year, title, tags, description, href, media, className, style }) => {
  const classes = ['jt-card', className].filter(Boolean).join(' ');
  return (
    <a className={classes} style={style} href={href}>
      <div className="jt-card__media">
        {media}
        <span className="jt-label jt-label--accent jt-card__index">{index}</span>
        <span className="jt-label jt-label--vertical jt-card__year">{year}</span>
        <span className="jt-card__plus">+</span>
      </div>
      <div className="jt-card__body">
        <span className="jt-card__title jt-title">
          <span>{title}</span>
          <span>↗</span>
        </span>
        <span className="jt-label">{tags.join('  /  ')}</span>
        <p className="jt-body" style={{ fontSize: 11 }}>
          {description}
        </p>
      </div>
    </a>
  );
};
