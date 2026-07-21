import { getGa4PeriodData } from '../../../lib/ga4'
import AdminAnalyticsSection from './AdminAnalyticsSection'

export default async function AdminAnalyticsSectionServer() {
  const initialData = await getGa4PeriodData('weekly')

  return <AdminAnalyticsSection initialData={initialData} />
}
