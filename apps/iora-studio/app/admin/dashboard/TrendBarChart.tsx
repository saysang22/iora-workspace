import type { CSSProperties } from 'react'
import styles from './page.module.scss'

type TrendBarChartPoint = {
  label: string
  value: number
}

type TrendBarChartProps = {
  ariaLabel: string
  points: TrendBarChartPoint[]
}

function getColumnCount(total: number) {
  if (total <= 7) {
    return total
  }

  if (total <= 24) {
    return 12
  }

  return 10
}

function getFillHeight(value: number, maxValue: number) {
  if (maxValue <= 0) {
    return '4px'
  }

  if (value <= 0) {
    return '4px'
  }

  const percent = Math.max((value / maxValue) * 100, 8)

  return `${Math.min(percent, 100)}%`
}

export default function TrendBarChart({ ariaLabel, points }: TrendBarChartProps) {
  const maxValue = points.length ? Math.max(...points.map((point) => point.value), 0) : 0
  const columnCount = Math.max(getColumnCount(points.length), 1)
  const chartStyle = {
    '--trend-chart-columns': columnCount,
  } as CSSProperties & Record<'--trend-chart-columns', number>

  return (
    <div
      className={styles.chartShell}
      style={chartStyle}
      aria-label={ariaLabel}
    >
      {points.map((point) => (
        <div key={point.label} className={styles.chartColumn}>
          <div className={styles.chartBarTrack}>
            <span
              className={styles.chartBarFill}
              style={{ height: getFillHeight(point.value, maxValue) }}
            />
          </div>
          <span className={styles.chartLabel}>{point.label}</span>
          <strong className={styles.chartValue}>{point.value.toLocaleString('ko-KR')}</strong>
        </div>
      ))}
    </div>
  )
}
