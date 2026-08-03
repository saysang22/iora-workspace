import type { CSSProperties, HTMLAttributes } from 'react'
import styles from './Spinner.module.scss'

type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number | string
  color?: string
  label?: string
  centered?: boolean
}

export function Spinner({
  className = '',
  size = 20,
  color = '#d8ff3f',
  label,
  centered = false,
  style,
  ...props
}: SpinnerProps) {
  const resolvedSize = typeof size === 'number' ? `${size}px` : size
  const mergedClassName = [
    styles.spinner,
    centered ? styles.centered : '',
    label ? styles.withLabel : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const customStyle: CSSProperties = {
    ...style,
    '--spinner-size': resolvedSize,
    '--spinner-color': color,
  } as CSSProperties

  return (
    <span
      className={mergedClassName}
      style={customStyle}
      role='status'
      aria-label={label ?? 'Loading'}
      {...props}
    >
      <span className={styles.ring} aria-hidden='true' />
      {label ? <span className={styles.label}>{label}</span> : null}
    </span>
  )
}
