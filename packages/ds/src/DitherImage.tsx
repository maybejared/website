import type { FC, CSSProperties } from 'react';

/** Props for the DitherImage component. */
export interface DitherImageProps {
  /** Image source URL. */
  src: string;
  /** Image alt text. */
  alt: string;
  /** Visual treatment applied to the image. */
  mode?: 'dither' | 'halftone' | 'color';
  /** Optional caption shown over the image. */
  caption?: string;
  /** Height of the image container in pixels. */
  height?: number;
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Image with a dither, halftone, or color treatment that resolves on hover. */
export const DitherImage: FC<DitherImageProps> = ({ src, alt, mode = 'dither', caption, height, className, style }) => {
  const classes = ['jt-dither', mode === 'halftone' && 'jt-dither--halftone', mode === 'color' && 'jt-dither--color', className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} style={{ height, ...style }}>
      <img src={src} alt={alt} />
      {caption && <span className="jt-label jt-label--ink jt-dither__caption">{caption}</span>}
    </div>
  );
};
