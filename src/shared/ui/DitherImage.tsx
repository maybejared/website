import type { FC } from 'react';
import { cn } from './cn';

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
  /** Extra class name appended after the DS classes. */
  className?: string;
}

/** Image with a dither, halftone, or color treatment that resolves on hover. */
export const DitherImage: FC<DitherImageProps> = ({ src, alt, mode = 'dither', caption, className }) => {
  const classes = cn('dither', mode === 'halftone' && 'dither--halftone', mode === 'color' && 'dither--color', className);
  return (
    <div className={classes}>
      <img src={src} alt={alt} />
      {caption && <span className="label label--ink dither__caption">{caption}</span>}
    </div>
  );
};
