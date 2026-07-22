import MaintenanceListClient from './MaintenanceListClient'
import { createServerSupabaseClient } from '../../../lib/supabase-server'
import type { Tables } from '../../../lib/database.types'
import styles from './page.module.scss'

type ProjectRow = Pick<
  Tables<'projects'>,
  'id' | 'user_id' | 'company_name' | 'client_name' | 'project_name' | 'current_stage' | 'care_ended_at' | 'started_at'
>
type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'company_name' | 'full_name' | 'email'>

export type MaintenanceListItem = {
  id: string
  clientName: string
  companyName: string
  projectName: string
  currentStage: ProjectRow['current_stage']
  careEndedAt: string | null
  startedAt: string
}

function formatDisplayName(project: ProjectRow, profile?: ProfileRow) {
  return {
    companyName:
      profile?.company_name ||
      project.company_name ||
      profile?.full_name ||
      project.client_name ||
      profile?.email ||
      '미등록 업체',
    clientName: profile?.full_name || project.client_name || profile?.email || '-',
  }
}

export default async function AdminMaintenancePage() {
  const supabase = await createServerSupabaseClient()
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, user_id, company_name, client_name, project_name, current_stage, care_ended_at, started_at')
    .in('current_stage', ['care', 'completed'])
    .order('care_ended_at', { ascending: true, nullsFirst: false })
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const userIds = Array.from(new Set((projects ?? []).map((project) => project.user_id).filter(Boolean)))
  const profileMap = new Map<string, ProfileRow>()

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, company_name')
      .in('id', userIds as string[])

    if (profilesError) {
      throw new Error(profilesError.message)
    }

    for (const profile of profiles ?? []) {
      profileMap.set(profile.id, profile)
    }
  }

  const items: MaintenanceListItem[] = (projects ?? []).map((project) => {
    const profile = project.user_id ? profileMap.get(project.user_id) : undefined
    const display = formatDisplayName(project, profile)

    return {
      id: project.id,
      companyName: display.companyName,
      clientName: display.clientName,
      projectName: project.project_name,
      currentStage: project.current_stage,
      careEndedAt: project.care_ended_at,
      startedAt: project.started_at,
    }
  })

  return (
    <div className={styles.content}>
      <section className={styles.heroSection}>
        <div>
          <p className={styles.kicker}>MAINTENANCE</p>
          <h1 className={styles.title}>유지보수</h1>
          <p className={styles.description}>
            유지보수 진행 중이거나 계약 완료된 프로젝트를 한 화면에서 관리합니다.
          </p>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>관리 대상</span>
          <strong className={styles.summaryValue}>{String(items.length).padStart(2, '0')}</strong>
        </div>
      </section>

      <MaintenanceListClient items={items} />
    </div>
  )
}
