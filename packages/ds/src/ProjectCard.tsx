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
  const classes = ['card', className].filter(Boolean).join(' ');
  return (
    <a className={classes} style={style} href={href}>
      <div className="card__media">
        {media}
        <span className="label label--accent card__index">{index}</span>
        <span className="label label--vertical card__year">{year}</span>
        <span className="card__plus">+</span>
      </div>
      <div className="card__body">
        <span className="card__title title">
          <span>{title}</span>
          <span>↗</span>
        </span>
        <span className="label">{tags.join('  /  ')}</span>
        <p className="body" style={{ fontSize: 11 }}>
          {description}
        </p>
      </div>
    </a>
  );
};
