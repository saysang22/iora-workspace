'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AnalyticsTrendPoint } from '../../../lib/ga4'
import styles from './page.module.scss'

type TrendBarChartProps = {
  ariaLabel: string
  points: AnalyticsTrendPoint[]
}

type ChartDatum = AnalyticsTrendPoint & {
  fill: string
}

const ACTIVE_BAR_FILL = 'url(#analytics-bar-gradient)'
const EMPTY_BAR_FILL = 'rgb(148 163 184 / 0.22)'

function formatYAxisTick(value: number) {
  if (value >= 1000) {
    return `${Math.round(value / 100) / 10}k`
  }

  return value.toString()
}

function getTickInterval(totalPoints: number) {
  if (totalPoints <= 7) {
    return 0
  }

  if (totalPoints <= 24) {
    return 1
  }

  return 3
}

function getTickAngle(totalPoints: number) {
  return totalPoints > 14 ? -35 : 0
}

function AnalyticsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  label?: string
  payload?: Array<{ value?: number }>
}) {
  if (!active || !payload?.length) {
    return null
  }

  const value = typeof payload[0]?.value === 'number' ? payload[0].value : 0

  return (
    <div className={styles.chartTooltip}>
      <strong>{label}</strong>
      <span>활성 사용자 {value.toLocaleString('ko-KR')}명</span>
    </div>
  )
}

function CustomBarShape(props: {
  fill?: string
  height?: number
  payload?: ChartDatum
  width?: number
  x?: number
  y?: number
}) {
  const {
    height = 0,
    payload,
    width = 0,
    x = 0,
    y = 0,
  } = props
  const fill = payload?.fill ?? EMPTY_BAR_FILL

  if (width <= 0) {
    return null
  }

  const actualValue = payload?.value ?? 0
  const safeHeight = actualValue === 0 ? 2 : Math.max(height, 6)
  const safeY = actualValue === 0 ? y + Math.max(height - safeHeight, 0) : y + Math.max(height - safeHeight, 0)

  return (
    <Rectangle
      x={x}
      y={safeY}
      width={width}
      height={safeHeight}
      radius={[10, 10, 0, 0]}
      fill={fill}
    />
  )
}

export default function TrendBarChart({ ariaLabel, points }: TrendBarChartProps) {
  const chartData: ChartDatum[] = points.map((point) => ({
    ...point,
    fill: point.value > 0 ? ACTIVE_BAR_FILL : EMPTY_BAR_FILL,
  }))

  const maxValue = Math.max(...points.map((point) => point.value), 0)
  const yAxisDomainMax = maxValue === 0 ? 1 : Math.ceil(maxValue * 1.15)
  const tickInterval = getTickInterval(points.length)
  const tickAngle = getTickAngle(points.length)
  const showDenseTicks = points.length > 14

  return (
    <div className={styles.chartShell} aria-label={ariaLabel}>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart
          data={chartData}
          margin={{
            top: 12,
            right: 8,
            left: -12,
            bottom: showDenseTicks ? 26 : 8,
          }}
        >
          <defs>
            <linearGradient id='analytics-bar-gradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#ff77b0' />
              <stop offset='100%' stopColor='#ff2d78' />
            </linearGradient>
          </defs>

          <CartesianGrid stroke='rgb(148 163 184 / 0.08)' strokeDasharray='3 3' vertical={false} />
          <XAxis
            dataKey='label'
            interval={tickInterval}
            tickLine={false}
            axisLine={false}
            minTickGap={showDenseTicks ? 8 : 20}
            angle={tickAngle}
            textAnchor={tickAngle === 0 ? 'middle' : 'end'}
            height={showDenseTicks ? 54 : 34}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <YAxis
            width={40}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            domain={[0, yAxisDomainMax]}
            tickFormatter={formatYAxisTick}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: 'rgb(255 255 255 / 0.03)' }}
            content={<AnalyticsTooltip />}
          />
          <Bar
            dataKey='value'
            shape={<CustomBarShape />}
            radius={[10, 10, 0, 0]}
            barSize={points.length <= 7 ? 34 : points.length <= 24 ? 16 : 12}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
