import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { unstable_cache } from 'next/cache'

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly'

export type AnalyticsTrendPoint = {
  label: string
  value: number
}

export type AnalyticsListItem = {
  label: string
  value: number
}

export type Ga4PeriodReport = {
  pageViews: AnalyticsListItem[]
  sources: AnalyticsListItem[]
  totalVisitors: number
  trend: AnalyticsTrendPoint[]
}

export type Ga4PeriodData =
  | {
      period: AnalyticsPeriod
      report: Ga4PeriodReport
      status: 'ready'
    }
  | {
      message: string
      period: AnalyticsPeriod
      status: 'unavailable'
    }

let analyticsClient: BetaAnalyticsDataClient | null = null

function getPrivateKey() {
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

  if (!privateKey) {
    return null
  }

  return privateKey.replace(/\\n/g, '\n')
}

function getAnalyticsClient() {
  if (analyticsClient) {
    return analyticsClient
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = getPrivateKey()

  if (!clientEmail || !privateKey) {
    return null
  }

  analyticsClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  })

  return analyticsClient
}

function getPeriodConfig(period: AnalyticsPeriod) {
  if (period === 'daily') {
    return {
      dateRange: { startDate: 'today', endDate: 'today' },
      trendDimension: 'hour',
      trendLabelFormatter: (value: string) => `${value.padStart(2, '0')}:00`,
    }
  }

  if (period === 'weekly') {
    return {
      dateRange: { startDate: '6daysAgo', endDate: 'today' },
      trendDimension: 'date',
      trendLabelFormatter: formatGaDate,
    }
  }

  return {
    dateRange: { startDate: '29daysAgo', endDate: 'today' },
    trendDimension: 'date',
    trendLabelFormatter: formatGaDate,
  }
}

function formatGaDate(value: string) {
  if (value.length !== 8) {
    return value
  }

  const year = value.slice(0, 4)
  const month = value.slice(4, 6)
  const day = value.slice(6, 8)

  return `${year}.${month}.${day}`
}

function toMetricValue(value: string | null | undefined) {
  if (!value) {
    return 0
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : 0
}

function formatDateLabel(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

function createTrendTemplate(period: AnalyticsPeriod) {
  const now = new Date()

  if (period === 'daily') {
    return Array.from({ length: 24 }, (_, hour) => ({
      label: `${String(hour).padStart(2, '0')}:00`,
      value: 0,
    }))
  }

  const totalDays = period === 'weekly' ? 7 : 30

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    date.setDate(date.getDate() - (totalDays - index - 1))

    return {
      label: formatDateLabel(date),
      value: 0,
    }
  })
}

function normalizeTrend(period: AnalyticsPeriod, trend: AnalyticsTrendPoint[]) {
  const template = createTrendTemplate(period)
  const valueMap = new Map(trend.map((item) => [item.label, item.value]))

  return template.map((item) => ({
    label: item.label,
    value: valueMap.get(item.label) ?? 0,
  }))
}

async function getPeriodReport(
  client: BetaAnalyticsDataClient,
  propertyId: string,
  period: AnalyticsPeriod,
): Promise<Ga4PeriodReport> {
  const config = getPeriodConfig(period)

  const [[trendResponse], [pageResponse], [sourceResponse]] = await Promise.all([
    client.runReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: config.trendDimension }],
      metrics: [{ name: 'activeUsers' }],
      dateRanges: [config.dateRange],
      orderBys: [{ dimension: { dimensionName: config.trendDimension } }],
    }),
    client.runReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      dateRanges: [config.dateRange],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    }),
    client.runReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'activeUsers' }],
      dateRanges: [config.dateRange],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10,
    }),
  ])

  const trend =
    trendResponse.rows?.map((row) => ({
      label: config.trendLabelFormatter(row.dimensionValues?.[0]?.value ?? ''),
      value: toMetricValue(row.metricValues?.[0]?.value),
    })) ?? []

  const normalizedTrend = normalizeTrend(period, trend)

  const pageViews =
    pageResponse.rows?.map((row) => ({
      label: row.dimensionValues?.[0]?.value || '/',
      value: toMetricValue(row.metricValues?.[0]?.value),
    })) ?? []

  const sources =
    sourceResponse.rows?.map((row) => ({
      label: row.dimensionValues?.[0]?.value || 'Direct',
      value: toMetricValue(row.metricValues?.[0]?.value),
    })) ?? []

  const totalVisitors = normalizedTrend.reduce((sum, item) => sum + item.value, 0)

  return {
    totalVisitors,
    trend: normalizedTrend,
    pageViews,
    sources,
  }
}

async function loadGa4PeriodData(period: AnalyticsPeriod): Promise<Ga4PeriodData> {
  const propertyId = process.env.GA4_PROPERTY_ID
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const client = getAnalyticsClient()

  if (!measurementId || !propertyId || !client) {
    return {
      period,
      status: 'unavailable',
      message: 'GA4 연동이 아직 설정되지 않았습니다.',
    }
  }

  try {
    const report = await getPeriodReport(client, propertyId, period)

    return {
      period,
      status: 'ready',
      report,
    }
  } catch {
    return {
      period,
      status: 'unavailable',
      message: 'GA4 연동이 아직 설정되지 않았습니다.',
    }
  }
}

export async function getGa4PeriodData(period: AnalyticsPeriod): Promise<Ga4PeriodData> {
  const getCachedPeriodData = unstable_cache(async () => loadGa4PeriodData(period), [`ga4-period-${period}`], {
    tags: [`ga4-period-${period}`],
    revalidate: 600,
  })

  return getCachedPeriodData()
}
