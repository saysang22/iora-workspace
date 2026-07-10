import styles from './RadioButton.module.scss';
import type { CSSProperties, InputHTMLAttributes } from 'react';

type RadioButtonProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  size?: string;
  background?: string;
  dotColor?: string;
  checkedBackground?: string;
  dotSize?: string;
};

export function RadioButton({
  className = '',
  size,
  background,
  dotColor,
  checkedBackground,
  dotSize,
  style,
  ...props
}: RadioButtonProps) {
  const mergedClassName = [styles.container, className].filter(Boolean).join(' ');

  const customStyle: CSSProperties = {
    ...style,
    ...(size ? { width: size, height: size } : {}),
    ...(background ? ({ '--radio-background': background } as CSSProperties) : {}),
    ...(dotColor ? ({ '--radio-dot-color': dotColor } as CSSProperties) : {}),
    ...(checkedBackground ? ({ '--radio-checked-background': checkedBackground } as CSSProperties) : {}),
    ...(dotSize ? ({ '--radio-dot-size': dotSize } as CSSProperties) : {}),
  };

  return <input type="radio" className={mergedClassName} style={customStyle} {...props} />;
}
