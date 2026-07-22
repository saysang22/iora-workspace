import PortfolioListClient from './PortfolioListClient'
import { createServerSupabaseClient } from '../../../lib/supabase-server'
import type { Tables } from '../../../lib/database.types'
import styles from './page.module.scss'

export type PortfolioRow = Tables<'portfolios'>
type ProjectRow = Pick<Tables<'projects'>, 'id' | 'user_id' | 'company_name' | 'client_name' | 'project_name'>
type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'company_name' | 'full_name' | 'email'>

export type PortfolioProjectOption = {
  id: string
  label: string
}

export type PortfolioListItem = PortfolioRow & {
  project_name: string | null
  project_label: string | null
}

function buildProjectLabel(project: ProjectRow, profile?: ProfileRow) {
  const companyName =
    profile?.company_name ||
    project.company_name ||
    profile?.full_name ||
    project.client_name ||
    profile?.email ||
    '미등록 업체'

  return `${companyName} / ${project.project_name}`
}

export default async function AdminPortfolioPage() {
  const supabase = await createServerSupabaseClient()
  const [{ data: portfolios, error: portfoliosError }, { data: projects, error: projectsError }] = await Promise.all([
    supabase.from('portfolios').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
    supabase
      .from('projects')
      .select('id, user_id, company_name, client_name, project_name')
      .order('created_at', { ascending: false }),
  ])

  if (portfoliosError) {
    throw new Error(portfoliosError.message)
  }

  if (projectsError) {
    throw new Error(projectsError.message)
  }

  const userIds = Array.from(new Set((projects ?? []).map((project) => project.user_id).filter(Boolean)))
  const profileMap = new Map<string, ProfileRow>()

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, company_name, full_name, email')
      .in('id', userIds as string[])

    if (profilesError) {
      throw new Error(profilesError.message)
    }

    for (const profile of profiles ?? []) {
      profileMap.set(profile.id, profile)
    }
  }

  const projectOptions: PortfolioProjectOption[] = (projects ?? []).map((project) => ({
    id: project.id,
    label: buildProjectLabel(project, project.user_id ? profileMap.get(project.user_id) : undefined),
  }))

  const projectMap = new Map(projectOptions.map((project) => [project.id, project.label]))

  const items: PortfolioListItem[] = (portfolios ?? []).map((portfolio) => ({
    ...portfolio,
    project_name: portfolio.project_id ? (projects ?? []).find((project) => project.id === portfolio.project_id)?.project_name ?? null : null,
    project_label: portfolio.project_id ? projectMap.get(portfolio.project_id) ?? null : null,
  }))

  return (
    <div className={styles.content}>
      <section className={styles.heroSection}>
        <div>
          <p className={styles.kicker}>PORTFOLIO</p>
          <h1 className={styles.title}>포트폴리오</h1>
          <p className={styles.description}>
            홈페이지 Works 섹션에 연결될 포트폴리오 항목을 등록하고 공개 여부를 관리합니다.
          </p>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>등록 항목</span>
          <strong className={styles.summaryValue}>{String(items.length).padStart(2, '0')}</strong>
        </div>
      </section>

      <PortfolioListClient items={items} projectOptions={projectOptions} />
    </div>
  )
}
