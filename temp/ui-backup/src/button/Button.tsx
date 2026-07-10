import styles from './Button.module.scss';
import type { ButtonHTMLAttributes, CSSProperties, KeyboardEvent } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size: string;
  background: string;
  round: string;
  padding: string;
  pendding?: string;
  textColor: string;
  borderColor: string;
  hoverBackground: string;
  hoverTextColor: string;
  hoverBorderColor: string;
};

export function Button({
  className = '',
  children = 'Button',
  type = 'button',
  size,
  background,
  round,
  padding,
  pendding,
  textColor,
  borderColor,
  hoverBackground,
  hoverTextColor,
  hoverBorderColor,
  style,
  onKeyDown,
  disabled,
  ...props
}: ButtonProps) {
  const mergedClassName = [styles.container, className].filter(Boolean).join(' ');
  const resolvedPadding = padding ?? pendding;

  const customStyle: CSSProperties = {
    ...style,
    ...(size ? { fontSize: size } : {}),
    ...(round ? { borderRadius: round } : {}),
    ...(resolvedPadding ? { padding: resolvedPadding } : {}),
    ...(background ? ({ '--button-background': background } as CSSProperties) : {}),
    ...(textColor ? ({ '--button-text-color': textColor } as CSSProperties) : {}),
    ...(borderColor ? ({ '--button-border-color': borderColor } as CSSProperties) : {}),
    ...(hoverBackground ? ({ '--button-hover-background': hoverBackground } as CSSProperties) : {}),
    ...(hoverTextColor ? ({ '--button-hover-text-color': hoverTextColor } as CSSProperties) : {}),
    ...(hoverBorderColor ? ({ '--button-hover-border-color': hoverBorderColor } as CSSProperties) : {}),
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented || disabled) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <button
      type={type}
      className={mergedClassName}
      style={customStyle}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
