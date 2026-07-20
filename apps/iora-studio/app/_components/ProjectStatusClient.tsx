'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiCalendar, FiCheck, FiClock, FiLoader } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import {
  buildSharedProjectPageProgress,
  buildSharedProjectPageSummary,
  type ProjectPageRow,
} from '../../lib/projects'
import { buildProjectFlowSteps } from './project-status-flow/ProjectStatusFlow'
import {
  buildMockProjectStatus,
  type PageProgressStatus,
  type ProjectStatusData,
} from '../projects/projectStatus.mock'
import ProjectStatusFlow from './project-status-flow/ProjectStatusFlow'
import styles from './ProjectStatusClient.module.scss'

type SessionState = 'loading' | 'ready' | 'unauthorized'

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

function getPageStatusLabel(status: PageProgressStatus) {
  if (status === 'done') {
    return '완료'
  }

  if (status === 'active') {
    return '진행 중'
  }

  return '대기'
}

export default function ProjectStatusClient() {
  const router = useRouter()
  const [sessionState, setSessionState] = useState<SessionState>('loading')
  const [projectData, setProjectData] = useState<ProjectStatusData | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadProjectStatus = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user

      if (!isMounted) {
        return
      }

      if (!sessionUser) {
        setSessionState('unauthorized')
        router.push('/signin')
        return
      }

      const clientName =
        typeof sessionUser.user_metadata?.company_name === 'string' && sessionUser.user_metadata.company_name.trim()
          ? sessionUser.user_metadata.company_name.trim()
          : sessionUser.email ?? 'CLIENT'

      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, project_name, current_stage, progress_percent, started_at, care_ended_at, project_pages(id, page_name, sort_order, status)')
        .eq('user_id', sessionUser.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!isMounted) {
        return
      }

      if (error || !projects || projects.length === 0) {
        setProjectData(buildMockProjectStatus(clientName))
        setSessionState('ready')
        return
      }

      const project = projects[0]
      const mappedPages = buildSharedProjectPageProgress(
        (project.project_pages ?? []) as ProjectPageRow[],
      )
      const pageSummary = buildSharedProjectPageSummary(mappedPages)

      setProjectData({
        clientName,
        projectTitle: project.project_name,
        startDate: formatDisplayDate(project.started_at),
        deadlineDate: formatDisplayDate(project.care_ended_at),
        currentPhase: project.current_stage,
        totalProgress: project.progress_percent,
        devLogVersion: 'LIVE PROJECT',
        pageSummary,
        pages: mappedPages,
      })
      setSessionState('ready')
    }

    void loadProjectStatus()

    return () => {
      isMounted = false
    }
  }, [router])

  const flowSteps = useMemo(
    () => (projectData ? buildProjectFlowSteps(projectData.currentPhase) : []),
    [projectData],
  )

  if (sessionState !== 'ready' || !projectData) {
    return (
      <section className={styles.feedbackSection} aria-live='polite'>
        <p className={styles.feedbackText}>
          {sessionState === 'unauthorized'
            ? '로그인이 필요합니다. 로그인 페이지로 이동합니다.'
            : '프로젝트 진행 현황을 불러오는 중입니다...'}
        </p>
      </section>
    )
  }

  return (
    <div className={styles.content}>
      <section className={styles.heroSection} aria-labelledby='project-status-title'>
        <div className={styles.heroMain}>
          <p className={styles.clientLabel}>CLIENT: {projectData.clientName}</p>
          <h1 className={styles.heroTitle} id='project-status-title'>
            {projectData.projectTitle}
          </h1>
          <p className={styles.startDate}>
            <FiCalendar size={16} />
            <span>프로젝트 시작일 {projectData.startDate}</span>
          </p>
        </div>

        <div className={styles.metricsGrid}>
          <article className={styles.metricCard}>
            <span className={styles.metricLabel}>Current Phase</span>
            <strong className={styles.metricValue}>
              {flowSteps.find((step) => step.state === 'active')?.label ?? '-'}
            </strong>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Progress</span>
            <strong className={styles.metricValue}>{projectData.totalProgress}%</strong>
          </article>
        </div>
      </section>

      <ProjectStatusFlow steps={flowSteps} title='프로젝트 진행 단계' deadlineValue={projectData.deadlineDate} />

      <section className={styles.devSection} aria-labelledby='project-dev-title'>
        <div className={styles.devHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Development Details</p>
            <h2 className={styles.sectionTitle} id='project-dev-title'>
              페이지별 개발 현황
            </h2>
          </div>
          <span className={styles.versionBadge}>{projectData.devLogVersion}</span>
        </div>

        <div className={styles.progressSummary}>
          <div className={styles.progressTextGroup}>
            <p className={styles.progressSummaryText}>
              {projectData.pageSummary.completed}/{projectData.pageSummary.total} 페이지 완료
              <span className={styles.progressSummarySub}> 전체 공정을 {projectData.pageSummary.percent}%</span>
            </p>
            <strong className={styles.progressPercent}>{projectData.pageSummary.percent}%</strong>
          </div>
          <div className={styles.progressBar} aria-hidden='true'>
            <span className={styles.progressFill} style={{ width: `${projectData.pageSummary.percent}%` }} />
          </div>
        </div>

        <ul className={styles.pageList}>
          {projectData.pages.map((page) => (
            <li key={page.id} className={styles.pageItem}>
              <div className={styles.pageMeta}>
                <span
                  className={[
                    styles.pageIcon,
                    page.status === 'done' ? styles.pageIconDone : '',
                    page.status === 'active' ? styles.pageIconActive : '',
                    page.status === 'pending' ? styles.pageIconPending : '',
                  ].join(' ')}
                  aria-hidden='true'
                >
                  {page.status === 'done' ? (
                    <FiCheck size={15} />
                  ) : page.status === 'active' ? (
                    <FiLoader size={15} />
                  ) : (
                    <FiClock size={15} />
                  )}
                </span>
                <span className={styles.pageName}>{page.name}</span>
              </div>
              <span
                className={[
                  styles.pageBadge,
                  page.status === 'done' ? styles.pageBadgeDone : '',
                  page.status === 'active' ? styles.pageBadgeActive : '',
                  page.status === 'pending' ? styles.pageBadgePending : '',
                ].join(' ')}
              >
                {getPageStatusLabel(page.status)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
