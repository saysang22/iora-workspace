import { NextResponse } from 'next/server'
import { getGa4PeriodData, type AnalyticsPeriod } from '../../../../lib/ga4'

function isAnalyticsPeriod(value: string | null): value is AnalyticsPeriod {
  return value === 'daily' || value === 'weekly' || value === 'monthly'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const periodParam = searchParams.get('period')
  const period = isAnalyticsPeriod(periodParam) ? periodParam : 'weekly'
  const data = await getGa4PeriodData(period)

  return NextResponse.json(data)
}
