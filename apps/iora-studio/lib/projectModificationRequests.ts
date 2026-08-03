import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json, Tables } from './database.types'

export type ProjectModificationRequestRow = Tables<'project_modification_requests'>
export type ProjectModificationRequestStatus =
  Database['public']['Enums']['project_modification_request_status']

export type ProjectModificationRequestAttachment = {
  contentType: string | null
  name: string
  path: string
  size: number
}

export type ProjectModificationRequestListItem = {
  assignee: string
  attachmentCount: number
  attachments: ProjectModificationRequestAttachment[]
  date: string
  description: string
  id: string
  requestedAtValue: string
  requesterName: string
  status: ProjectModificationRequestStatus
  title: string
}

export const PROJECT_MODIFICATION_STATUS_LABELS: Record<ProjectModificationRequestStatus, string> = {
  pending: '대기',
  review: '검토 중',
  in_progress: '진행 중',
  completed: '완료',
}

function formatDisplayDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}.${month}.${day}`
}

function toAttachment(value: Json): ProjectModificationRequestAttachment | null {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return null
  }

  const name = typeof value.name === 'string' ? value.name : null
  const path = typeof value.path === 'string' ? value.path : null
  const size = typeof value.size === 'number' ? value.size : null
  const contentType = typeof value.contentType === 'string' ? value.contentType : null

  if (!name || !path || size === null) {
    return null
  }

  return {
    contentType,
    name,
    path,
    size,
  }
}

export function parseProjectModificationRequestAttachments(
  attachments: ProjectModificationRequestRow['attachments'],
) {
  if (!Array.isArray(attachments)) {
    return []
  }

  return attachments
    .map((item) => toAttachment(item))
    .filter((item): item is ProjectModificationRequestAttachment => Boolean(item))
}

function buildProfileDisplayName(profile: { email: string | null; full_name: string | null } | undefined) {
  return profile?.full_name?.trim() || profile?.email?.trim() || '미배정'
}

export async function listProjectModificationRequests(
  client: SupabaseClient<Database>,
  projectId: string,
): Promise<ProjectModificationRequestListItem[]> {
  const { data, error } = await client
    .from('project_modification_requests')
    .select('*')
    .eq('project_id', projectId)
    .order('requested_at', { ascending: false })

  if (error) {
    throw error
  }

  const rows = data ?? []
  const profileIds = Array.from(
    new Set(
      rows.flatMap((row) => {
        const ids = [row.requester_id]
        if (row.assigned_to) {
          ids.push(row.assigned_to)
        }
        return ids
      }),
    ),
  )

  const { data: profiles, error: profilesError } = profileIds.length
    ? await client.from('profiles').select('id, full_name, email').in('id', profileIds)
    : { data: [], error: null }

  if (profilesError) {
    throw profilesError
  }

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]))

  return rows.map((row) => {
    const attachments = parseProjectModificationRequestAttachments(row.attachments)

    return {
      assignee: row.assigned_to ? buildProfileDisplayName(profileMap.get(row.assigned_to)) : '미배정',
      attachmentCount: attachments.length,
      attachments,
      date: formatDisplayDate(row.requested_at),
      description: row.description,
      id: row.id,
      requestedAtValue: row.requested_at,
      requesterName: buildProfileDisplayName(profileMap.get(row.requester_id)),
      status: row.status,
      title: row.title,
    }
  })
}
