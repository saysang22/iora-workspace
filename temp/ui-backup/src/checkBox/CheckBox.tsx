import styles from './CheckBox.module.scss';
import type { CSSProperties, InputHTMLAttributes } from 'react';

type CheckBoxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  size?: string;
  round?: string;
  background?: string;
  borderColor?: string;
  borderWidth?: string;
  checkColor?: string;
  checkSize?: string;
  checkThickness?: string;
  checkedBackground?: string;
  checkedBorderColor?: string;
};

export function CheckBox({
  className = '',
  size,
  round,
  background,
  borderColor,
  borderWidth,
  checkColor,
  checkSize,
  checkThickness,
  checkedBackground,
  checkedBorderColor,
  style,
  ...props
}: CheckBoxProps) {
  const mergedClassName = [styles.container, className].filter(Boolean).join(' ');

  const customStyle: CSSProperties = {
    ...style,
    ...(size ? { width: size, height: size } : {}),
    ...(round ? { borderRadius: round } : {}),
    ...(background ? ({ '--checkbox-background': background } as CSSProperties) : {}),
    ...(borderColor ? ({ '--checkbox-border-color': borderColor } as CSSProperties) : {}),
    ...(borderWidth ? { borderWidth } : {}),
    ...(checkColor ? ({ '--checkbox-check-color': checkColor } as CSSProperties) : {}),
    ...(checkSize ? ({ '--checkbox-check-size': checkSize } as CSSProperties) : {}),
    ...(checkThickness ? ({ '--checkbox-check-thickness': checkThickness } as CSSProperties) : {}),
    ...(checkedBackground ? ({ '--checkbox-checked-background': checkedBackground } as CSSProperties) : {}),
    ...(checkedBorderColor ? ({ '--checkbox-checked-border-color': checkedBorderColor } as CSSProperties) : {}),
  };

  return <input type="checkbox" className={mergedClassName} style={customStyle} {...props} />;
}
