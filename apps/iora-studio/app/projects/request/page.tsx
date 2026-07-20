import { redirect } from 'next/navigation'
import ProjectRequestClient from './ProjectRequestClient'
import styles from './page.module.scss'
import { createServerSupabaseClient } from '../../../lib/supabase-server'
import { buildMockProjectStatus } from '../projectStatus.mock'

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

  const clientName =
    typeof user.user_metadata?.company_name === 'string' && user.user_metadata.company_name.trim()
      ? user.user_metadata.company_name.trim()
      : user.email ?? 'CLIENT'

  const { data: projects } = await supabase
    .from('projects')
    .select('project_name, current_stage, started_at, care_ended_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const project = projects?.[0]
  const fallbackProject = buildMockProjectStatus(clientName)
  const servicePeriod = project
    ? `${formatDisplayDate(project.started_at)} ~ ${formatDisplayDate(project.care_ended_at)}`
    : `${fallbackProject.startDate} ~ ${fallbackProject.deadlineDate}`

  return (
    <main className={styles.requestPage}>
      <div className={styles.requestInner}>
        <ProjectRequestClient
          clientName={clientName}
          currentStage={project?.current_stage ?? fallbackProject.currentPhase}
          projectDeadline={formatDisplayDate(project?.care_ended_at ?? null)}
          projectName={project?.project_name ?? fallbackProject.projectTitle}
          servicePeriod={servicePeriod}
        />
      </div>
    </main>
  )
}
