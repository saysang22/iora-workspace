'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiCalendar, FiCheck, FiClock, FiLoader } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import {
  buildMockProjectStatus,
  PROJECT_PHASES,
  type PageProgressStatus,
  type ProjectStatusData,
} from '../projects/projectStatus.mock'
import styles from './ProjectStatusClient.module.scss'

type SessionState = 'loading' | 'ready' | 'unauthorized'

function getPhaseState(currentIndex: number, targetIndex: number) {
  if (targetIndex < currentIndex) {
    return 'done'
  }

  if (targetIndex === currentIndex) {
    return 'active'
  }

  return 'pending'
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

      setProjectData(buildMockProjectStatus(clientName))
      setSessionState('ready')
    }

    void loadProjectStatus()

    return () => {
      isMounted = false
    }
  }, [router])

  const currentPhaseIndex = useMemo(() => {
    if (!projectData) {
      return -1
    }

    return PROJECT_PHASES.findIndex((phase) => phase.key === projectData.currentPhase)
  }, [projectData])

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
              {PROJECT_PHASES.find((phase) => phase.key === projectData.currentPhase)?.label ?? '-'}
            </strong>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Progress</span>
            <strong className={styles.metricValue}>{projectData.totalProgress}%</strong>
          </article>
        </div>
      </section>

      <section className={styles.stepperSection} aria-labelledby='project-stepper-title'>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionEyebrow}>Project Flow</p>
          <h2 className={styles.sectionTitle} id='project-stepper-title'>
            프로젝트 진행 단계
          </h2>
        </div>

        <ol className={styles.stepperList}>
          {PROJECT_PHASES.map((phase, index) => {
            const phaseState = getPhaseState(currentPhaseIndex, index)

            return (
              <li
                key={phase.key}
                className={[
                  styles.stepItem,
                  phaseState === 'done' ? styles.stepDone : '',
                  phaseState === 'active' ? styles.stepActive : '',
                  phaseState === 'pending' ? styles.stepPending : '',
                ].join(' ')}
              >
                <span className={styles.stepIcon} aria-hidden='true'>
                  {phaseState === 'done' ? <FiCheck size={16} /> : phaseState === 'active' ? <FiLoader size={16} /> : <FiClock size={16} />}
                </span>
                <div className={styles.stepText}>
                  <strong>{phase.label}</strong>
                  <span>{phase.labelEn}</span>
                </div>
                {phaseState === 'active' ? <span className={styles.activeBadge}>진행 중</span> : null}
              </li>
            )
          })}
        </ol>
      </section>

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
              <span className={styles.progressSummarySub}> 전체 공정의 {projectData.pageSummary.percent}%</span>
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
                  {page.status === 'done' ? <FiCheck size={15} /> : page.status === 'active' ? <FiLoader size={15} /> : <FiClock size={15} />}
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
