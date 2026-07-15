import styles from './SelectBox.module.scss';
import type { CSSProperties, SelectHTMLAttributes } from 'react';

type SelectBoxOption = {
  label: string;
  value: string;
};

type SelectBoxProps = SelectHTMLAttributes<HTMLSelectElement> & {
  width?: string;
  fontSize?: string;
  padding?: string;
  round?: string;
  background?: string;
  textColor?: string;
  focusBorderColor?: string;
  options?: SelectBoxOption[];
};

export function SelectBox({
  className = '',
  children,
  width,
  fontSize,
  padding,
  round,
  background,
  textColor,
  focusBorderColor,
  options,
  style,
  ...props
}: SelectBoxProps) {
  const mergedClassName = [styles.container, className].filter(Boolean).join(' ');

  const customStyle: CSSProperties = {
    ...style,
    ...(width ? { width } : {}),
    ...(fontSize ? { fontSize } : {}),
    ...(padding ? { padding } : {}),
    ...(round ? { borderRadius: round } : {}),
    ...(background ? ({ '--select-background': background } as CSSProperties) : {}),
    ...(textColor ? ({ '--select-text-color': textColor } as CSSProperties) : {}),
    ...(focusBorderColor ? ({ '--select-focus-border-color': focusBorderColor } as CSSProperties) : {}),
  };

  return (
    <select className={mergedClassName} style={customStyle} {...props}>
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {children}
    </select>
  );
}
