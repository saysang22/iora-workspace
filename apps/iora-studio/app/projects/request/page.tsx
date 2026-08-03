import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import {
  listProjectModificationRequests,
  type ProjectModificationRequestListItem,
} from '../../../lib/projectModificationRequests'
import { NO_INDEX_METADATA } from '../../../lib/seo'
import { createServerSupabaseClient } from '../../../lib/supabase-server'
import ProjectRequestClient from './ProjectRequestClient'
import styles from './page.module.scss'

export const metadata: Metadata = NO_INDEX_METADATA

function isMissingRelationError(error: { code?: string } | null) {
  return error?.code === 'PGRST205' || error?.code === '42P01'
}

function formatDisplayDate(value: string | null) {
  if (!value) {
    return '미정'
  }

  const [year, month, day] = value.split('-')

  if (!year || !month || !day) {
    return value
  }

  return `${year}.${month}.${day}`
}

export default async function ProjectRequestPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/signin?next=${encodeURIComponent('/projects/request')}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name, full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  const clientName =
    profile?.company_name?.trim() || profile?.full_name?.trim() || profile?.email?.trim() || user.email || 'CLIENT'

  const { data: projects } = await supabase
    .from('projects')
    .select('id, project_name, current_stage, started_at, care_ended_at, deadline')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const project = projects?.[0]
  const servicePeriod = project
    ? `${formatDisplayDate(project.started_at)} ~ ${formatDisplayDate(project.care_ended_at ?? project.deadline)}`
    : '연결된 프로젝트가 없습니다.'

  let history: ProjectModificationRequestListItem[] = []

  if (project) {
    try {
      history = await listProjectModificationRequests(supabase, project.id)
    } catch (error) {
      if (!isMissingRelationError(error as { code?: string } | null)) {
        throw error
      }
    }
  }

  const deadlineValue = project?.deadline ?? project?.care_ended_at ?? null

  return (
    <main className={styles.requestPage}>
      <div className={styles.requestInner}>
        <ProjectRequestClient
          clientName={clientName}
          currentStage={project?.current_stage ?? null}
          history={history}
          projectDeadline={formatDisplayDate(deadlineValue)}
          projectId={project?.id ?? null}
          projectName={project?.project_name ?? '연결된 프로젝트가 없습니다.'}
          servicePeriod={servicePeriod}
        />
      </div>
    </main>
  )
}
