import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables } from './database.types'

export type ProjectRow = Tables<'projects'>
export type ProjectPageRow = Tables<'project_pages'>
export type ProfileRow = Tables<'profiles'>

export type ProjectWithPages = ProjectRow & {
  project_pages: ProjectPageRow[]
}

export type SharedProjectPageProgressStatus = 'active' | 'done' | 'pending'

export type SharedProjectPageProgress = {
  id: string
  name: string
  status: SharedProjectPageProgressStatus
}

export type AdminProjectStatus = '개발' | '배포' | '기획' | '검수' | '유지보수'
export type AdminProjectType = 'member' | 'guest'

export type AdminProjectListItem = {
  id: string
  companyName: string
  companyCode: string
  projectName: string
  projectType: AdminProjectType
  status: AdminProjectStatus
  startDate: string
  dueDate: string
  startedAtValue: string
  deadlineValue: string | null
  careEndedAtValue: string | null
  totalAmountValue: number | null
  depositAmountValue: number | null
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
  totalAmount: string
  depositAmount: string
  deadline: string
  progress: number
  startedAt: string
  careEndedAt: string
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

function formatCurrency(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return '미정'
  }

  return `${value.toLocaleString('ko-KR')}원`
}

function buildCompanyCode(companyName: string) {
  const normalized = companyName.replace(/\s+/g, '')

  if (!normalized) {
    return '--'
  }

  return normalized.slice(0, 2).toUpperCase()
}

async function getProfileMap(client: SupabaseClient<Database>, userIds: string[]) {
  if (!userIds.length) {
    return new Map<string, ProfileRow>()
  }

  const { data: profiles } = await client.from('profiles').select('*').in('id', userIds)

  return new Map((profiles ?? []).map((profile) => [profile.id, profile]))
}

function getProjectCompanyName(project: ProjectRow, profile?: ProfileRow) {
  return (
    profile?.company_name ||
    project.company_name ||
    profile?.full_name ||
    project.client_name ||
    profile?.email ||
    '미등록 업체'
  )
}

export function toSharedProjectPageProgressStatus(
  status: ProjectPageRow['status'],
): SharedProjectPageProgressStatus {
  if (status === 'completed') {
    return 'done'
  }

  if (status === 'in_progress') {
    return 'active'
  }

  return 'pending'
}

export function buildSharedProjectPageProgress(pages: ProjectPageRow[]): SharedProjectPageProgress[] {
  return [...pages]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((page) => ({
      id: page.id,
      name: page.page_name,
      status: toSharedProjectPageProgressStatus(page.status),
    }))
}

export function buildSharedProjectPageSummary(pages: SharedProjectPageProgress[]) {
  const completed = pages.filter((page) => page.status === 'done').length
  const total = pages.length

  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

export async function listProjects(client: SupabaseClient<Database>) {
  return client.from('projects').select('*, project_pages(*)').order('created_at', { ascending: false })
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

  const userIds = Array.from(
    new Set((projects ?? []).map((project) => project.user_id).filter((value): value is string => Boolean(value))),
  )
  const profileMap = await getProfileMap(client, userIds)

  const items: AdminProjectListItem[] = (projects ?? []).map((project) => {
    const profile = project.user_id ? profileMap.get(project.user_id) : undefined
    const companyName = getProjectCompanyName(project, profile)

    return {
      id: project.id,
      companyName,
      companyCode: buildCompanyCode(companyName),
      projectName: project.project_name,
      projectType: project.user_id ? 'member' : 'guest',
      status: STAGE_STATUS_MAP[project.current_stage],
      startDate: formatDate(project.started_at),
      dueDate: formatDate(project.deadline),
      startedAtValue: project.started_at,
      deadlineValue: project.deadline,
      careEndedAtValue: project.care_ended_at,
      totalAmountValue: project.total_amount,
      depositAmountValue: project.deposit_amount,
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

  const profile = project.user_id
    ? (
        await client
          .from('profiles')
          .select('*')
          .eq('id', project.user_id)
          .maybeSingle()
      ).data
    : null

  const clientName = getProjectCompanyName(project, profile ?? undefined)
  const contact = profile?.phone_number || profile?.email || project.client_name || '-'

  return {
    id: project.id,
    title: project.project_name,
    statusLabel: STAGE_BADGE_MAP[project.current_stage],
    clientName,
    contact,
    totalAmount: formatCurrency(project.total_amount),
    depositAmount: formatCurrency(project.deposit_amount),
    deadline: formatDate(project.deadline),
    progress: project.progress_percent,
    startedAt: formatDate(project.started_at),
    careEndedAt: formatDate(project.care_ended_at),
    pages: [...(project.project_pages ?? [])].sort((left, right) => left.sort_order - right.sort_order),
    currentStage: project.current_stage,
  } satisfies AdminProjectDetail
}
