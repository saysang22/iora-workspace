import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export type CapacityAvailabilityRow = Database['public']['Functions']['get_capacity_availability']['Returns'][number]
export type ZoomMeetingAvailabilityRow = Database['public']['Functions']['get_zoom_meeting_availability']['Returns'][number]

export type CapacityAvailabilityMap = Record<
  string,
  {
    reservedCount: number
    maxCapacity: number | null
    isUnavailable: boolean
  }
>

export type ZoomMeetingAvailabilityMap = Record<
  string,
  {
    reservedCount: number
    isUnavailable: boolean
    reservedTimes: string[]
  }
>

export function getMonthDateRange(year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  return { startDate, endDate }
}

export function buildCapacityAvailabilityMap(rows: CapacityAvailabilityRow[]) {
  return rows.reduce<CapacityAvailabilityMap>((acc, row) => {
    acc[row.work_date] = {
      reservedCount: row.reserved_count,
      maxCapacity: row.max_capacity,
      isUnavailable: row.is_unavailable,
    }

    return acc
  }, {})
}

export function buildZoomMeetingAvailabilityMap(rows: ZoomMeetingAvailabilityRow[]) {
  return rows.reduce<ZoomMeetingAvailabilityMap>((acc, row) => {
    acc[row.work_date] = {
      reservedCount: row.reserved_count,
      isUnavailable: row.is_unavailable,
      reservedTimes: row.reserved_times,
    }

    return acc
  }, {})
}

export async function fetchCapacityAvailability(
  client: SupabaseClient<Database>,
  params: { year: number; month: number },
) {
  const { startDate, endDate } = getMonthDateRange(params.year, params.month)
  const { data, error } = await client.rpc('get_capacity_availability', {
    start_date: startDate,
    end_date: endDate,
  })

  if (error) {
    throw error
  }

  return buildCapacityAvailabilityMap(data ?? [])
}

export async function fetchZoomMeetingAvailability(
  client: SupabaseClient<Database>,
  params: { year: number; month: number },
) {
  const { startDate, endDate } = getMonthDateRange(params.year, params.month)
  const { data, error } = await client.rpc('get_zoom_meeting_availability', {
    start_date: startDate,
    end_date: endDate,
  })

  if (error) {
    throw error
  }

  return buildZoomMeetingAvailabilityMap(data ?? [])
}

export async function upsertCapacitySettings(
  client: SupabaseClient<Database>,
  params: { dateKeys: string[]; maxCapacity: number },
) {
  if (!params.dateKeys.length) {
    return
  }

  const payload = params.dateKeys.map((dateKey) => ({
    work_date: dateKey,
    max_capacity: params.maxCapacity,
  }))

  const { error } = await client.from('capacity_settings').upsert(payload, {
    onConflict: 'work_date',
  })

  if (error) {
    throw error
  }
}
