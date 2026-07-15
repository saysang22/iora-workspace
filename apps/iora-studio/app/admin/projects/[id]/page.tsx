import type { ComponentType } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowUpRight,
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
import { createServerSupabaseClient } from '../../../../lib/supabase-server'
import { getAdminProjectDetail } from '../../../../lib/projects'
import { getFallbackAdminProjectDetail, isMissingProjectsTableError } from '../fallbackProjects'
import ProjectFlow, { type ProjectFlowStep } from './ProjectFlow'
import styles from './page.module.scss'

type ProjectPageStatus = '완료' | '진행 중' | '대기'
type ProjectPagePriority = '매우 높음' | '높음' | '보통'

type RequestItem = {
  id: string
  checked: boolean
  status: ProjectPageStatus
  priority: ProjectPagePriority
  detail: string
  date: string
}

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

const STAGE_ORDER = ['analysis', 'planning', 'development', 'qa', 'launch', 'care', 'completed'] as const

const STAGE_LABEL_MAP: Record<(typeof STAGE_ORDER)[number], string> = {
  analysis: '상담 및 분석',
  planning: '기획',
  development: '개발',
  qa: '검수',
  launch: '배포',
  care: '유지보수',
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
    title: '사용자_에셋_가이드.zip',
    meta: '158 MB · 오늘 업데이트',
    icon: FiPaperclip,
  },
]

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: 'log-1',
    time: '오늘 오전 10:45',
    title: '메인 대시보드 UI 수정 완료',
    description: '담당자가 주요 수정 요청을 반영해 최신 시안을 업데이트했습니다.',
    tone: 'success',
    icon: FiCheck,
  },
  {
    id: 'log-2',
    time: '어제 오후 11:20',
    title: '추가 요청 코멘트 등록',
    description: '보안 로직과 사용자 인증 흐름에 대한 보완 요청이 남겨졌습니다.',
    tone: 'info',
    icon: FiMessageSquare,
  },
  {
    id: 'log-3',
    time: '2024.11.17',
    title: '파일 업로드 완료',
    description: '기획서와 보조 자료가 프로젝트 문서함에 등록되었습니다.',
    tone: 'upload',
    icon: FiUpload,
  },
  {
    id: 'log-4',
    time: '2024.11.16',
    title: '일정 변경 알림',
    description: '진행 일정이 최신 상태로 조정되어 팀 전원에게 공유되었습니다.',
    tone: 'warning',
    icon: FiAlertCircle,
  },
]

function buildSteps(currentStage: (typeof STAGE_ORDER)[number]): ProjectFlowStep[] {
  const currentIndex = STAGE_ORDER.indexOf(currentStage)

  return STAGE_ORDER.map((stage, index) => ({
    id: stage,
    label: STAGE_LABEL_MAP[stage],
    state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming',
  }))
}

function buildRequestItems(
  pages: Array<{ id: string; page_name: string; status: 'pending' | 'in_progress' | 'completed'; sort_order: number }>,
): RequestItem[] {
  if (!pages.length) {
    return [
      {
        id: 'empty',
        checked: false,
        status: '대기',
        priority: '보통',
        detail: '등록된 페이지 정보가 아직 없습니다.',
        date: '-',
      },
    ]
  }

  return pages.map((page) => ({
    id: page.id,
    checked: page.status === 'completed',
    status: page.status === 'completed' ? '완료' : page.status === 'in_progress' ? '진행 중' : '대기',
    priority: page.status === 'in_progress' ? '매우 높음' : page.status === 'pending' ? '높음' : '보통',
    detail: page.page_name,
    date: `정렬 ${page.sort_order}`,
  }))
}

type AdminProjectDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminProjectDetailPage({ params }: AdminProjectDetailPageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  let project = null

  try {
    project = await getAdminProjectDetail(supabase, id)
  } catch (error) {
    if (!isMissingProjectsTableError(error)) {
      throw error
    }

    project = getFallbackAdminProjectDetail(id)
  }

  if (!project) {
    notFound()
  }

  const steps = buildSteps(project.currentStage)
  const requestItems = buildRequestItems(project.pages)

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
              프로젝트 식별값 <strong>{id}</strong>를 URL 파라미터로 받아 조회하는 동적 상세 페이지입니다.
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
          <span className={styles.metricLabel}>예산</span>
          <strong className={`${styles.metricValue} ${styles.metricValuePink}`.trim()}>{project.budget}</strong>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>마감일</span>
          <strong className={styles.metricValue}>
            <span className={styles.metricInline}>
              <FiCalendar size={18} />
              {project.deadline}
            </span>
          </strong>
        </article>
      </section>

      <ProjectFlow
        progress={project.progress}
        steps={steps}
        title='프로젝트 진행 단계'
        helperText={`프로젝트 시작일 ${project.startedAt}`}
      />

      <section className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          <section className={styles.requestSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>페이지 현황</h2>
              <button className={styles.inlineAction} type='button'>
                <FiArrowUpRight size={14} />
                <span>페이지 추가</span>
              </button>
            </div>

            <div className={styles.requestTableWrap}>
              <table className={styles.requestTable}>
                <thead>
                  <tr>
                    <th scope='col'>#</th>
                    <th scope='col'>상태</th>
                    <th scope='col'>우선순위</th>
                    <th scope='col'>페이지명</th>
                    <th scope='col'>정렬</th>
                  </tr>
                </thead>
                <tbody>
                  {requestItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <span className={`${styles.checkCell} ${item.checked ? styles.checkCellActive : ''}`.trim()} aria-hidden='true'>
                          {item.checked ? <FiCheck size={12} /> : null}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusPill} ${
                            item.status === '완료'
                              ? styles.statusDone
                              : item.status === '진행 중'
                                ? styles.statusInProgress
                                : styles.statusPending
                          }`.trim()}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.priorityPill} ${
                            item.priority === '매우 높음'
                              ? styles.priorityCritical
                              : item.priority === '높음'
                                ? styles.priorityHigh
                                : styles.priorityNormal
                          }`.trim()}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className={styles.requestDetailCell}>{item.detail}</td>
                      <td className={styles.requestDateCell}>{item.id === 'empty' ? '-' : `${index + 1} / ${item.date}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

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
