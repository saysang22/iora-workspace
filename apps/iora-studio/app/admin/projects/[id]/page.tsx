import type { ComponentType } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FiArrowLeft, FiCalendar, FiEdit3, FiFileText, FiPaperclip } from 'react-icons/fi'
import type { Database, Tables } from '../../../../lib/database.types'
import type { ProjectModificationRequestListItem } from '../../../../lib/projectModificationRequests'
import { listProjectModificationRequests } from '../../../../lib/projectModificationRequests'
import { getAdminProjectDetail } from '../../../../lib/projects'
import { createServerSupabaseClient } from '../../../../lib/supabase-server'
import AdminPageHeader from '../../_components/AdminPageHeader'
import { getFallbackAdminProjectDetail, isMissingProjectsTableError } from '../fallbackProjects'
import AdminProjectPaymentsSection from './AdminProjectPaymentsSection'
import AdminProjectStatusFlow from './AdminProjectStatusFlow'
import AdminProjectWorkTabs from './AdminProjectWorkTabs'
import styles from './page.module.scss'

type AssetCard = {
  icon: ComponentType<{ size?: number }>
  id: string
  meta: string
  title: string
}

const STAGE_PROGRESS_LABEL: Record<Database['public']['Enums']['project_stage'], string> = {
  analysis: '상담 및 분석 중',
  planning: '기획 중',
  development: '개발 중',
  qa: '검수 중',
  launch: '배포 중',
  care: '유지보수 진행 중',
  completed: '계약 완료',
}

const ASSET_CARDS: AssetCard[] = [
  {
    id: 'brief',
    title: '기획안_최종_rev2.pdf',
    meta: '2.4 MB · 2일 전 업로드',
    icon: FiFileText,
  },
  {
    id: 'design-guide',
    title: '사용자_자산_가이드.zip',
    meta: '158 MB · 오늘 업데이트',
    icon: FiPaperclip,
  },
]

function isMissingRelationError(error: { code?: string } | null) {
  return error?.code === 'PGRST205' || error?.code === '42P01'
}

type AdminProjectDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ tab?: string }>
}

export default async function AdminProjectDetailPage({
  params,
  searchParams,
}: AdminProjectDetailPageProps) {
  const { id } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const supabase = await createServerSupabaseClient()

  let project = null
  let payments: Tables<'payments'>[] = []
  let modificationRequests: ProjectModificationRequestListItem[] = []

  try {
    project = await getAdminProjectDetail(supabase, id)
  } catch (error) {
    if (!isMissingProjectsTableError(error)) {
      throw error
    }

    project = getFallbackAdminProjectDetail(id)
  }

  if (!project) {
    redirect('/admin/projects')
  }

  const { data: paymentRows, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .eq('project_id', id)
    .order('paid_at', { ascending: false })

  if (paymentsError && !isMissingRelationError(paymentsError)) {
    throw paymentsError
  }

  payments = paymentRows ?? []

  try {
    modificationRequests = await listProjectModificationRequests(supabase, id)
  } catch (error) {
    if (!isMissingRelationError(error as { code?: string } | null)) {
      throw error
    }
  }

  const initialTabId = resolvedSearchParams?.tab === 'requests' ? 'requests' : 'pages'

  return (
    <div className={styles.content}>
      <AdminPageHeader
        eyebrow='PROJECT DETAIL'
        title={project.title}
        description={`프로젝트 상세 페이지입니다. 프로젝트 ID ${id} 기준으로 최신 데이터를 조회합니다.`}
        leading={
          <Link className={styles.backButton} href='/admin/projects' aria-label='프로젝트 목록으로 이동'>
            <FiArrowLeft size={20} />
          </Link>
        }
        summary={{
          label: '현재 단계',
          tone: 'pink',
          value: project.statusLabel,
          valueSize: 'compact',
        }}
        titleSuffix={<span className={styles.statusBadge}>{project.statusLabel}</span>}
      />

      <section className={styles.metricGrid} aria-label='프로젝트 기본 정보'>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>업체명</span>
          <strong className={styles.metricValue}>{project.clientName}</strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>연락처</span>
          <strong className={styles.metricValue}>{project.contact}</strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>시작일</span>
          <strong className={styles.metricValue}>
            <span className={styles.metricInline}>
              <FiCalendar size={18} />
              {project.startedAt}
            </span>
          </strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>프로젝트 마감일</span>
          <strong className={styles.metricValue}>
            <span className={styles.metricInline}>
              <FiCalendar size={18} />
              {project.deadline}
            </span>
          </strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>유지보수 종료일</span>
          <strong className={styles.metricValue}>
            <span className={styles.metricInline}>
              <FiCalendar size={18} />
              {project.careEndedAt}
            </span>
          </strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>총 금액</span>
          <strong className={`${styles.metricValue} ${styles.metricValuePink}`.trim()}>
            {project.totalAmount}
          </strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>계약금</span>
          <strong className={`${styles.metricValue} ${styles.metricValuePink}`.trim()}>
            {project.depositAmount}
          </strong>
        </article>
      </section>

      <AdminProjectStatusFlow
        projectId={project.id}
        currentStage={project.currentStage}
        deadlineValue={project.deadline}
      />

      <section className={styles.mainGrid}>
        <AdminProjectPaymentsSection initialPayments={payments} projectId={project.id} />

        <AdminProjectWorkTabs
          currentStage={project.currentStage}
          initialRequests={modificationRequests}
          initialTabId={initialTabId}
          pages={project.pages}
          projectId={project.id}
          stageProgressLabel={STAGE_PROGRESS_LABEL[project.currentStage]}
        />

        <section className={styles.assetGrid} aria-label='프로젝트 첨부 파일'>
          {ASSET_CARDS.map((asset) => {
            const Icon = asset.icon

            return (
              <article key={asset.id} className={styles.assetCard}>
                <div className={styles.assetContent}>
                  <strong>{asset.title}</strong>
                  <span>{asset.meta}</span>
                </div>
                <button className={styles.assetButton} type='button' aria-label={`${asset.title} 다운로드`}>
                  <Icon size={18} />
                </button>
              </article>
            )
          })}
        </section>
      </section>

      <button className={styles.fab} type='button' aria-label='프로젝트 수정'>
        <FiEdit3 size={22} />
      </button>
    </div>
  )
}
