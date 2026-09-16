import type { FC, ReactNode, CSSProperties } from 'react';

/** Props for the Button component. */
export interface ButtonProps {
  /** Visual style variant of the button. */
  variant?: 'outline' | 'fill' | 'accent';
  /** Optional trailing key hint text, such as a keyboard shortcut. */
  keyHint?: string;
  /** When set, renders an anchor instead of a button. */
  href?: string;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Click handler for the button. */
  onClick?: () => void;
  /** Button content. */
  children?: ReactNode;
  /** Extra class name appended after the DS classes. */
  className?: string;
  /** Inline style overrides. */
  style?: CSSProperties;
}

/** Bordered mono button, rendered as a link or a native button. */
export const Button: FC<ButtonProps> = ({ variant = 'outline', keyHint, href, disabled, onClick, children, className, style }) => {
  const classes = ['jt-btn', variant === 'fill' && 'jt-btn--fill', variant === 'accent' && 'jt-btn--accent', className]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      {children}
      {keyHint && <span className="jt-key">{keyHint}</span>}
    </>
  );
  if (href) {
    return (
      <a className={classes} style={style} href={href} aria-disabled={disabled ? 'true' : undefined} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <button className={classes} style={style} disabled={disabled} onClick={onClick}>
      {content}
    </button>
  );
};
