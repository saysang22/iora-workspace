import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables } from './database.types'
import { formatDisplayDate } from './formatters'

type ProjectRow = Pick<
  Tables<'projects'>,
  'id' | 'user_id' | 'project_name' | 'company_name' | 'client_name' | 'current_stage' | 'updated_at'
>

type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'company_name' | 'full_name' | 'email'>
export type AdminSearchProjectItem = {
  id: string
  title: string
  subtitle: string
  href: string
  stageLabel: string
  updatedAt: string
}

export type AdminSearchContactItem = {
  id: string
  title: string
  subtitle: string
  href: string
  statusLabel: string
  createdAt: string
}

export type AdminSearchResult = {
  projects: AdminSearchProjectItem[]
  contacts: AdminSearchContactItem[]
}

const PROJECT_STAGE_LABELS: Record<Database['public']['Enums']['project_stage'], string> = {
  analysis: '상담 및 분석',
  planning: '기획',
  development: '개발',
  qa: '검수',
  launch: '배포',
  care: '유지보수',
  completed: '계약 완료',
}

const CONTACT_STATUS_LABELS: Record<Database['public']['Enums']['contact_request_status'], string> = {
  pending: '대기',
  confirmed: '확정',
  rejected: '반려',
}

function normalizeSearchTerm(value: string) {
  return value.trim().replace(/\s+/g, ' ').replace(/[(),]/g, ' ')
}

function toIlikePattern(value: string) {
  return `%${normalizeSearchTerm(value)}%`
}

function getProjectDisplayCompany(project: ProjectRow, profile?: ProfileRow) {
  return (
    profile?.company_name?.trim() ||
    project.company_name?.trim() ||
    profile?.full_name?.trim() ||
    project.client_name?.trim() ||
    profile?.email?.trim() ||
    '업체명 미등록'
  )
}

function getProjectDisplayClient(project: ProjectRow, profile?: ProfileRow) {
  return profile?.full_name?.trim() || project.client_name?.trim() || profile?.email?.trim() || '담당자 미등록'
}

export async function searchAdminRecords(
  client: SupabaseClient<Database>,
  rawQuery: string,
): Promise<AdminSearchResult> {
  const query = normalizeSearchTerm(rawQuery)

  if (query.length < 2) {
    return {
      projects: [],
      contacts: [],
    }
  }

  const pattern = toIlikePattern(query)

  const directProjectsPromise = client
    .from('projects')
    .select('id, user_id, project_name, company_name, client_name, current_stage, updated_at')
    .or(
      [
        `project_name.ilike.${pattern}`,
        `company_name.ilike.${pattern}`,
        `client_name.ilike.${pattern}`,
      ].join(','),
    )
    .order('updated_at', { ascending: false })
    .limit(5)

  const matchingProfilesPromise = client
    .from('profiles')
    .select('id, company_name, full_name, email')
    .or(
      [
        `company_name.ilike.${pattern}`,
        `full_name.ilike.${pattern}`,
        `email.ilike.${pattern}`,
      ].join(','),
    )
    .limit(10)

  const contactRequestsPromise = client
    .from('contact_requests')
    .select('id, name, service_type, email, created_at, status')
    .or(
      [
        `name.ilike.${pattern}`,
        `service_type.ilike.${pattern}`,
        `email.ilike.${pattern}`,
      ].join(','),
    )
    .order('created_at', { ascending: false })
    .limit(5)

  const [
    { data: directProjects, error: directProjectsError },
    { data: matchingProfiles, error: matchingProfilesError },
    { data: contactRequests, error: contactRequestsError },
  ] = await Promise.all([directProjectsPromise, matchingProfilesPromise, contactRequestsPromise])

  if (directProjectsError) {
    throw directProjectsError
  }

  if (matchingProfilesError) {
    throw matchingProfilesError
  }

  if (contactRequestsError) {
    throw contactRequestsError
  }

  const matchingProfileIds = (matchingProfiles ?? []).map((profile) => profile.id)
  const directProjectRows = directProjects ?? []

  let extraProjectRows: ProjectRow[] = []

  if (matchingProfileIds.length > 0) {
    const { data: profileProjects, error: profileProjectsError } = await client
      .from('projects')
      .select('id, user_id, project_name, company_name, client_name, current_stage, updated_at')
      .in('user_id', matchingProfileIds)
      .order('updated_at', { ascending: false })
      .limit(5)

    if (profileProjectsError) {
      throw profileProjectsError
    }

    extraProjectRows = profileProjects ?? []
  }

  const mergedProjects = [...directProjectRows, ...extraProjectRows]
  const projectRows = Array.from(new Map(mergedProjects.map((project) => [project.id, project])).values()).slice(0, 5)

  const profileIdsForProjects = Array.from(
    new Set(projectRows.map((project) => project.user_id).filter((value): value is string => Boolean(value))),
  )

  const additionalProfiles =
    profileIdsForProjects.length > 0
      ? await client.from('profiles').select('id, company_name, full_name, email').in('id', profileIdsForProjects)
      : { data: [], error: null }

  if (additionalProfiles.error) {
    throw additionalProfiles.error
  }

  const profileMap = new Map<string, ProfileRow>()

  for (const profile of matchingProfiles ?? []) {
    profileMap.set(profile.id, profile)
  }

  for (const profile of additionalProfiles.data ?? []) {
    profileMap.set(profile.id, profile)
  }

  const projects = projectRows.map((project) => {
    const profile = project.user_id ? profileMap.get(project.user_id) : undefined
    const companyName = getProjectDisplayCompany(project, profile)
    const clientName = getProjectDisplayClient(project, profile)

    return {
      id: project.id,
      title: project.project_name,
      subtitle: `${companyName} · ${clientName}`,
      href: `/admin/projects/${project.id}`,
      stageLabel: PROJECT_STAGE_LABELS[project.current_stage],
      updatedAt: formatDisplayDate(project.updated_at),
    }
  })

  const contacts = (contactRequests ?? []).map((request) => ({
    id: request.id,
    title: request.name.trim() || request.email,
    subtitle: `${request.service_type} · ${formatDisplayDate(request.created_at)}`,
    href: `/admin/reservations?requestId=${request.id}`,
    statusLabel: CONTACT_STATUS_LABELS[request.status],
    createdAt: formatDisplayDate(request.created_at),
  }))

  return {
    projects,
    contacts,
  }
}
