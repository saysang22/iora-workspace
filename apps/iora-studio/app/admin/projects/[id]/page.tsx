import type { ComponentType } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiClock,
  FiDownload,
  FiEdit3,
  FiFileText,
  FiMessageSquare,
  FiPaperclip,
  FiUpload,
} from 'react-icons/fi'
import type { Database } from '../../../../lib/database.types'
import { createServerSupabaseClient } from '../../../../lib/supabase-server'
import { getAdminProjectDetail } from '../../../../lib/projects'
import { getFallbackAdminProjectDetail, isMissingProjectsTableError } from '../fallbackProjects'
import AdminProjectPaymentsSection from './AdminProjectPaymentsSection'
import AdminProjectStatusFlow from './AdminProjectStatusFlow'
import AdminProjectWorkTabs from './AdminProjectWorkTabs'
import styles from './page.module.scss'

type AssetCard = {
  id: string
  title: string
  meta: string
  icon: ComponentType<{ size?: number }>
}

type ActivityItem = {
  id: string
  time: string
  title: string
  description: string
  tone: 'success' | 'info' | 'upload' | 'warning'
  icon: ComponentType<{ size?: number }>
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
    title: '기획서_최종_rev2.pdf',
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

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: 'log-1',
    time: '오늘 오전 10:45',
    title: '메인 대시보드 UI 수정 완료',
    description: '요청받은 주요 수정 사항을 반영해 최신 시안을 업데이트했습니다.',
    tone: 'success',
    icon: FiCheck,
  },
  {
    id: 'log-2',
    time: '어제 오후 11:20',
    title: '추가 요청 코멘트 등록',
    description: '보안 로직과 사용자 인증 흐름에 대한 보완 요청을 메모로 남겼습니다.',
    tone: 'info',
    icon: FiMessageSquare,
  },
  {
    id: 'log-3',
    time: '2026.07.18',
    title: '파일 업로드 완료',
    description: '기획서 보조 자료가 프로젝트 문서함에 등록되었습니다.',
    tone: 'upload',
    icon: FiUpload,
  },
  {
    id: 'log-4',
    time: '2026.07.16',
    title: '일정 변경 알림',
    description: '진행 일정을 최신 상태로 조정해 관련 담당자에게 공유했습니다.',
    tone: 'warning',
    icon: FiAlertCircle,
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
  let payments = []

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

  const initialTabId = resolvedSearchParams?.tab === 'requests' ? 'requests' : 'pages'

  return (
    <div className={styles.content}>
      <section className={styles.heroSection}>
        <div className={styles.heroTitleRow}>
          <Link className={styles.backButton} href='/admin/projects' aria-label='프로젝트 목록으로 이동'>
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <div className={styles.headingRow}>
              <h1 className={styles.pageTitle}>{project.title}</h1>
              <span className={styles.statusBadge}>{project.statusLabel}</span>
            </div>
            <p className={styles.pageDescription}>
              프로젝트 상세 페이지입니다. URL의 <strong>{id}</strong> 값을 기반으로 데이터를 조회합니다.
            </p>
          </div>
        </div>
      </section>

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
        <div className={styles.leftColumn}>
          <AdminProjectPaymentsSection initialPayments={payments} projectId={project.id} />

          <AdminProjectWorkTabs
            currentStage={project.currentStage}
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
        </div>

        <aside className={styles.timelineSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>작업 로그</h2>
            <button className={styles.iconGhostButton} type='button' aria-label='로그 새로고침'>
              <FiClock size={16} />
            </button>
          </div>

          <div className={styles.timelinePanel}>
            <div className={styles.timelineRail} aria-hidden='true' />

            <div className={styles.timelineList}>
              {ACTIVITY_ITEMS.map((item) => {
                const Icon = item.icon

                return (
                  <article key={item.id} className={styles.timelineItem}>
                    <div className={`${styles.timelineIcon} ${styles[`timelineIcon${item.tone}`]}`.trim()}>
                      <Icon size={14} />
                    </div>

                    <div className={styles.timelineCard}>
                      <span className={styles.timelineTime}>{item.time}</span>
                      <strong className={styles.timelineTitle}>{item.title}</strong>
                      <p className={styles.timelineDescription}>{item.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>

            <button className={styles.timelineFooter} type='button'>
              전체 로그 보기
            </button>
          </div>
        </aside>
      </section>

      <button className={styles.fab} type='button' aria-label='프로젝트 수정'>
        <FiEdit3 size={22} />
      </button>

      <button className={styles.floatingAssetButton} type='button'>
        <FiDownload size={14} />
        <span>에셋 다운로드</span>
      </button>
    </div>
  )
}
