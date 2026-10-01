import type { FC, ReactNode } from 'react';
import { cn } from './cn';

/** Props for the Button component. */
export interface ButtonProps {
  /** Visual style variant of the button. */
  variant?: 'outline' | 'fill' | 'accent';
  /** Optional trailing key hint text, such as a keyboard shortcut. */
  keyHint?: string;
  /** When set, renders an anchor instead of a button. */
  href?: string;
  /** Opens the link in a new tab; rel is set for you. */
  target?: '_blank';
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Click handler for the button. */
  onClick?: () => void;
  /** Button content. */
  children?: ReactNode;
  /** Extra class name appended after the DS classes. */
  className?: string;
}

/** Bordered mono button, rendered as a link or a native button. */
export const Button: FC<ButtonProps> = ({ variant = 'outline', keyHint, href, target, disabled, onClick, children, className }) => {
  const classes = cn('btn', variant === 'fill' && 'btn--fill', variant === 'accent' && 'btn--accent', className);
  const content = (
    <>
      {children}
      {keyHint && <span className="key">{keyHint}</span>}
    </>
  );
  if (href) {
    return (
      <a
        className={classes}
       
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        aria-disabled={disabled ? 'true' : undefined}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }
  return (
    <button className={classes} disabled={disabled} onClick={onClick}>
      {content}
    </button>
  );
};
