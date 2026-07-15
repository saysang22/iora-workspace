import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables } from './database.types'

export type ProjectRow = Tables<'projects'>
export type ProjectPageRow = Tables<'project_pages'>
export type ProfileRow = Tables<'profiles'>

export type ProjectWithPages = ProjectRow & {
  project_pages: ProjectPageRow[]
}

export type AdminProjectStatus = '개발' | '배포' | '기획' | '검수' | '유지보수'
export type AdminProjectPriority = '긴급' | '높음' | '보통' | '낮음'

export type AdminProjectListItem = {
  id: string
  companyName: string
  companyCode: string
  projectName: string
  status: AdminProjectStatus
  startDate: string
  dueDate: string
  priority: AdminProjectPriority
}

export type AdminProjectStats = {
  all: number
  active: number
  deadline: number
  done: number
}

export type AdminProjectDetail = {
  id: string
  title: string
  statusLabel: string
  clientName: string
  contact: string
  budget: string
  deadline: string
  progress: number
  startedAt: string
  pages: ProjectPageRow[]
  currentStage: Database['public']['Enums']['project_stage']
}

const ACTIVE_STAGES: Array<Database['public']['Enums']['project_stage']> = [
  'analysis',
  'planning',
  'development',
  'qa',
  'launch',
  'care',
]

const STAGE_STATUS_MAP: Record<Database['public']['Enums']['project_stage'], AdminProjectStatus> = {
  analysis: '기획',
  planning: '기획',
  development: '개발',
  qa: '검수',
  launch: '배포',
  care: '유지보수',
  completed: '유지보수',
}

const STAGE_BADGE_MAP: Record<Database['public']['Enums']['project_stage'], string> = {
  analysis: 'ANALYSIS',
  planning: 'PLANNING',
  development: 'DEVELOPMENT',
  qa: 'QA',
  launch: 'LAUNCH',
  care: 'CARE',
  completed: 'COMPLETED',
}

function formatDate(value: string | null) {
  if (!value) {
    return '미정'
  }

  const [year, month, day] = value.split('-')

  if (!year || !month || !day) {
    return value
  }

  return `${year}.${month}.${day}`
}

function buildCompanyCode(companyName: string) {
  const normalized = companyName.replace(/\s+/g, '')

  if (!normalized) {
    return '--'
  }

  return normalized.slice(0, 2).toUpperCase()
}

function toPriority(stage: Database['public']['Enums']['project_stage']): AdminProjectPriority {
  if (stage === 'launch' || stage === 'qa') {
    return '긴급'
  }

  if (stage === 'development' || stage === 'planning') {
    return '높음'
  }

  if (stage === 'completed') {
    return '낮음'
  }

  return '보통'
}

async function getProfileMap(client: SupabaseClient<Database>, userIds: string[]) {
  if (!userIds.length) {
    return new Map<string, ProfileRow>()
  }

  const { data: profiles } = await client
    .from('profiles')
    .select('*')
    .in('id', userIds)

  return new Map((profiles ?? []).map((profile) => [profile.id, profile]))
}

export async function listProjects(client: SupabaseClient<Database>) {
  return client
    .from('projects')
    .select('*, project_pages(*)')
    .order('created_at', { ascending: false })
}

export async function getProjectById(client: SupabaseClient<Database>, projectId: string) {
  return client.from('projects').select('*, project_pages(*)').eq('id', projectId).maybeSingle()
}

export async function listProjectPages(client: SupabaseClient<Database>, projectId: string) {
  return client
    .from('project_pages')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
}

export async function listAdminProjects(client: SupabaseClient<Database>) {
  const { data: projects, error } = await listProjects(client)

  if (error) {
    throw error
  }

  const userIds = Array.from(new Set((projects ?? []).map((project) => project.user_id)))
  const profileMap = await getProfileMap(client, userIds)

  const items: AdminProjectListItem[] = (projects ?? []).map((project) => {
    const profile = profileMap.get(project.user_id)
    const companyName = profile?.company_name || profile?.full_name || profile?.email || '미등록 업체'

    return {
      id: project.id,
      companyName,
      companyCode: buildCompanyCode(companyName),
      projectName: project.project_name,
      status: STAGE_STATUS_MAP[project.current_stage],
      startDate: formatDate(project.started_at),
      dueDate: formatDate(project.care_ended_at),
      priority: toPriority(project.current_stage),
    }
  })

  const stats: AdminProjectStats = {
    all: items.length,
    active: (projects ?? []).filter((project) => ACTIVE_STAGES.includes(project.current_stage)).length,
    deadline: (projects ?? []).filter((project) => project.care_ended_at !== null).length,
    done: (projects ?? []).filter((project) => project.current_stage === 'completed').length,
  }

  return { items, stats }
}

export async function getAdminProjectDetail(client: SupabaseClient<Database>, projectId: string) {
  const { data: project, error } = await getProjectById(client, projectId)

  if (error) {
    throw error
  }

  if (!project) {
    return null
  }

  const { data: profile } = await client
    .from('profiles')
    .select('*')
    .eq('id', project.user_id)
    .maybeSingle()

  const clientName = profile?.company_name || profile?.full_name || profile?.email || '미등록 업체'
  const contact = profile?.phone_number || profile?.email || '-'

  return {
    id: project.id,
    title: project.project_name,
    statusLabel: STAGE_BADGE_MAP[project.current_stage],
    clientName,
    contact,
    budget: '미정',
    deadline: formatDate(project.care_ended_at),
    progress: project.progress_percent,
    startedAt: formatDate(project.started_at),
    pages: [...(project.project_pages ?? [])].sort((left, right) => left.sort_order - right.sort_order),
    currentStage: project.current_stage,
  } satisfies AdminProjectDetail
}
