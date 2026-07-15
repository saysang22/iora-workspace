import type { ComponentType } from 'react'
import { FiCalendar, FiClock, FiLink2, FiLock, FiPlus, FiZap } from 'react-icons/fi'
import ReservationsCalendar from './ReservationsCalendar'
import styles from './page.module.scss'

type ReservationRequest = {
  id: string
  name: string
  role: string
  summary: string
  time: string
  avatar: string
  accent: 'pink' | 'blue' | 'violet'
}

type SettingCard = {
  id: string
  title: string
  description: string
  icon: ComponentType<{ size?: number }>
  accent: 'pink' | 'blue' | 'rose'
  action?: string
  enabled?: boolean
}

const RESERVATION_REQUESTS: ReservationRequest[] = [
  {
    id: 'request-1',
    name: '김민지 대표',
    role: '스타트업 플랫폼 UI 고도화 상담',
    summary: '브랜드 리뉴얼 이후 예약 동선과 관리자 화면을 함께 검토하고 싶어요.',
    time: '5월 18일(금) 14:00 - 15:00',
    avatar: 'KM',
    accent: 'pink',
  },
  {
    id: 'request-2',
    name: '이도윤 CTO',
    role: 'API 연동 및 인프라 구조 검토',
    summary: '기존 서비스 운영 중인 백오피스를 확장 가능한 구조로 바꾸는 미팅입니다.',
    time: '5월 20일(일) 10:30 - 11:30',
    avatar: 'DY',
    accent: 'blue',
  },
  {
    id: 'request-3',
    name: '이서윤 마케터',
    role: '브랜드 캠페인 페이지 제작 상담',
    summary: '런칭 시점에 맞춰 빠르게 오픈 가능한 랜딩 페이지 범위를 조율합니다.',
    time: '5월 21일(월) 16:00 - 17:00',
    avatar: 'SY',
    accent: 'violet',
  },
]

const SETTING_CARDS: SettingCard[] = [
  {
    id: 'auto-close',
    title: '자동 마감 설정',
    description: '24시간 전 자동 마감 중',
    icon: FiLock,
    accent: 'pink',
    enabled: true,
  },
  {
    id: 'meet-sync',
    title: '미팅 플랫폼 연결',
    description: 'Google Meet 연동 완료',
    icon: FiLink2,
    accent: 'blue',
    action: '연결됨',
  },
  {
    id: 'block-days',
    title: '특정 요일 차단',
    description: '주말 예약 차단 활성화',
    icon: FiCalendar,
    accent: 'rose',
    action: '수정',
  },
]

export default function AdminReservationsPage() {
  return (
    <div className={styles.content}>
      <section className={styles.heroSection}>
        <div>
          <h1 className={styles.pageTitle}>예약 및 슬롯 관리</h1>
          <p className={styles.pageDescription}>현재 활성화된 상담 슬롯과 신규 예약 요청을 확인하세요.</p>
        </div>

        <button className={styles.primaryButton} type='button'>
          <FiPlus size={16} />
          <span>새 슬롯 생성</span>
        </button>
      </section>

      <section className={styles.dashboardGrid}>
        <article className={styles.calendarPanel}>
          <ReservationsCalendar />
        </article>

        <aside className={styles.sidePanel}>
          <article className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div>
                <span className={styles.metricLabel}>현재 신규 가능 슬롯</span>
                <strong className={styles.metricValue}>
                  2 <span>/ 5</span>
                </strong>
              </div>
              <div className={styles.metricIconWrap}>
                <FiCalendar size={24} />
              </div>
            </div>
            <div className={styles.metricTrack}>
              <span style={{ width: '52%' }} />
            </div>
            <p className={styles.metricDescription}>이번 주 예정된 상담이 3건 있습니다. 슬롯을 추가하려면 상단 버튼을 클릭하세요.</p>
          </article>

          <article className={styles.requestPanel}>
            <div className={styles.requestPanelHeader}>
              <h2 className={styles.requestPanelTitle}>신규 예약 요청</h2>
              <span className={styles.requestCount}>3 NEW</span>
            </div>

            <div className={styles.requestList}>
              {RESERVATION_REQUESTS.map((request) => (
                <article key={request.id} className={styles.requestCard}>
                  <div className={styles.requestTopRow}>
                    <div className={`${styles.requestAvatar} ${styles[`requestAvatar${request.accent}`]}`.trim()}>{request.avatar}</div>
                    <div className={styles.requestIdentity}>
                      <strong>{request.name}</strong>
                      <span>{request.role}</span>
                    </div>
                  </div>

                  <p className={styles.requestSummary}>{request.summary}</p>

                  <div className={styles.requestTime}>
                    <FiClock size={14} />
                    <span>{request.time}</span>
                  </div>

                  <div className={styles.requestActions}>
                    <button className={styles.secondaryButton} type='button'>
                      거절
                    </button>
                    <button className={styles.primaryActionButton} type='button'>
                      승인
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <div className={styles.settingsGrid}>
            {SETTING_CARDS.map((card) => {
              const Icon = card.icon

              return (
                <article key={card.id} className={styles.settingCard}>
                  <div className={`${styles.settingIconWrap} ${styles[`settingIconWrap${card.accent}`]}`.trim()}>
                    <Icon size={18} />
                  </div>
                  <div className={styles.settingContent}>
                    <strong>{card.title}</strong>
                    <span>{card.description}</span>
                  </div>
                  {typeof card.enabled === 'boolean' ? (
                    <button
                      className={`${styles.toggleButton} ${card.enabled ? styles.toggleButtonActive : ''}`.trim()}
                      type='button'
                      aria-pressed={card.enabled}
                    >
                      <span />
                    </button>
                  ) : (
                    <button className={styles.textActionButton} type='button'>
                      {card.action}
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        </aside>
      </section>

      <button className={styles.fab} type='button' aria-label='빠른 자동화 실행'>
        <FiZap size={22} />
      </button>
    </div>
  )
}
