import { FiCreditCard, FiFilter, FiFolder, FiImage, FiMoreHorizontal, FiPlus, FiUsers } from 'react-icons/fi'
import { createServerSupabaseClient } from '../../../lib/supabase-server'
import styles from './page.module.scss'

type AdminProfileRow = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  phone_number: string | null
  is_admin: boolean
  created_at: string
}

type MaintenanceCard = {
  id: string
  title: string
  subtitle: string
  renewalDate: string
  monthlyFee: string
  progress: number
  status: string
  tone: 'urgent' | 'stable'
  actionLabel: string
}

type PortfolioCard = {
  id: string
  title: string
  summary: string
  monthLabel: string
  tagPrimary: string
  tagSecondary: string
  visualTone: 'analytics' | 'commerce' | 'finance'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function formatMonthlyFee(index: number) {
  return new Intl.NumberFormat('ko-KR').format(280000 + index * 170000)
}

function createMaintenanceCards(rows: AdminProfileRow[]): MaintenanceCard[] {
  const fallbackCards: MaintenanceCard[] = [
    {
      id: 'fallback-1',
      title: '뉴스파크 클리닉',
      subtitle: '브랜드 서버 및 보안 통합 관리',
      renewalDate: '2026. 07. 18',
      monthlyFee: '450,000',
      progress: 0.9,
      status: '만료 임박 (D-3)',
      tone: 'urgent',
      actionLabel: '청구서 발행',
    },
    {
      id: 'fallback-2',
      title: '비전 어드바이저스',
      subtitle: '웹사이트 유지보수 및 SEO 최적화',
      renewalDate: '2026. 08. 22',
      monthlyFee: '280,000',
      progress: 0.55,
      status: '정상 운영',
      tone: 'stable',
      actionLabel: '관리 이력',
    },
    {
      id: 'fallback-3',
      title: '글로벌 에듀케이션',
      subtitle: 'LMS 플랫폼 유지보수 및 기능 업데이트',
      renewalDate: '2026. 09. 12',
      monthlyFee: '1,200,000',
      progress: 0.28,
      status: '정상 운영',
      tone: 'stable',
      actionLabel: '관리 이력',
    },
  ]

  if (!rows.length) {
    return fallbackCards
  }

  return rows.slice(0, 3).map((profile, index) => ({
    id: profile.id,
    title: profile.company_name || profile.full_name || profile.email.split('@')[0],
    subtitle: profile.phone_number || profile.email,
    renewalDate: formatDate(profile.created_at),
    monthlyFee: formatMonthlyFee(index),
    progress: index === 0 ? 0.88 : index === 1 ? 0.56 : 0.3,
    status: index === 0 ? '만료 임박 (D-3)' : '정상 운영',
    tone: index === 0 ? 'urgent' : 'stable',
    actionLabel: index === 0 ? '청구서 발행' : '관리 이력',
  }))
}

const portfolioCards: PortfolioCard[] = [
  {
    id: 'portfolio-analytics',
    title: 'AI 데이터 분석 플랫폼',
    summary: '방문자 데이터를 시각화하고 AI 리포트를 생성하는 고성능 대시보드 엔진',
    monthLabel: 'SEP 2024',
    tagPrimary: 'REACT',
    tagSecondary: 'AWS',
    visualTone: 'analytics',
  },
  {
    id: 'portfolio-commerce',
    title: 'D2C 프리미엄 커머스',
    summary: '글로벌 명품 브랜드의 모바일 쇼핑 경험을 혁신하는 커스텀 이커머스',
    monthLabel: 'MAY 2024',
    tagPrimary: 'FLUTTER',
    tagSecondary: 'NODE.JS',
    visualTone: 'commerce',
  },
  {
    id: 'portfolio-finance',
    title: 'DeFi 자산 운용 센터',
    summary: '블록체인 기술을 기반으로 투자자산 관리와 분산 투자를 지원하는 서비스',
    monthLabel: 'DEC 2023',
    tagPrimary: 'WEB3',
    tagSecondary: 'SOLIDITY',
    visualTone: 'finance',
  },
]

export default async function AdminMaintenancePage() {
  const supabase = await createServerSupabaseClient()
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, company_name, phone_number, is_admin, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const rows = (profiles ?? []) as AdminProfileRow[]
  const maintenanceCards = createMaintenanceCards(rows)
  const adminCount = rows.filter((profile) => profile.is_admin).length
  const activeCount = maintenanceCards.length

  return (
    <>
      <div className={styles.content}>
        <section className={styles.heroSection}>
          <div className={styles.sectionTitleRow}>
            <div>
              <div className={styles.sectionKicker}>
                <span className={styles.kickerDot} />
                <span>유지보수 현황</span>
              </div>
              <p className={styles.sectionDescription}>
                정기 관리 고객사의 서비스 만료 및 운영 상태를 실시간 모니터링합니다.
              </p>
            </div>

            <button className={styles.primaryButton} type='button'>
              <FiUsers size={16} />
              <span>신규 고객 등록</span>
            </button>
          </div>

          <div className={styles.summaryStrip}>
            <article className={styles.summaryCard}>
              <span className={styles.summaryLabel}>관리 중 고객사</span>
              <strong className={styles.summaryValue}>{activeCount}</strong>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.summaryLabel}>등록 사용자</span>
              <strong className={styles.summaryValue}>{rows.length}</strong>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.summaryLabel}>관리자 계정</span>
              <strong className={styles.summaryValue}>{adminCount}</strong>
            </article>
          </div>

          <div className={styles.maintenanceGrid}>
            {maintenanceCards.map((card) => (
              <article
                key={card.id}
                className={`${styles.maintenanceCard} ${card.tone === 'urgent' ? styles.urgentCard : ''}`.trim()}
              >
                <div className={styles.cardHeader}>
                  <span className={`${styles.statusBadge} ${card.tone === 'urgent' ? styles.statusUrgent : styles.statusStable}`.trim()}>
                    {card.status}
                  </span>
                  <button className={styles.plainIconButton} type='button' aria-label='카드 메뉴'>
                    <FiMoreHorizontal size={18} />
                  </button>
                </div>

                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{card.title}</h2>
                  <p className={styles.cardSubtitle}>{card.subtitle}</p>

                  <div className={styles.progressMeta}>
                    <span>갱신 예정일</span>
                    <strong>{card.renewalDate}</strong>
                  </div>

                  <div className={styles.progressTrack}>
                    <span style={{ width: `${Math.round(card.progress * 100)}%` }} />
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div>
                    <span className={styles.feeLabel}>MONTHLY FEE</span>
                    <strong className={styles.feeValue}>₩{card.monthlyFee}</strong>
                  </div>

                  <button
                    className={`${styles.secondaryButton} ${card.tone === 'urgent' ? styles.secondaryButtonUrgent : ''}`.trim()}
                    type='button'
                  >
                    {card.actionLabel}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.portfolioSection}>
          <div className={styles.portfolioHeader}>
            <div className={styles.portfolioTitleGroup}>
              <h2 className={styles.portfolioTitle}>포트폴리오 라이브러리</h2>
              <div className={styles.filterTabs}>
                <button className={`${styles.filterTab} ${styles.filterTabActive}`.trim()} type='button'>
                  전체
                </button>
                <button className={styles.filterTab} type='button'>
                  공개용
                </button>
                <button className={styles.filterTab} type='button'>
                  비공개
                </button>
              </div>
            </div>

            <button className={styles.filterAction} type='button'>
              <FiFilter size={15} />
              <span>필터 설정</span>
            </button>
          </div>

          <div className={styles.portfolioGrid}>
            <article className={styles.addPortfolioCard}>
              <div className={styles.addIconWrap}>
                <FiImage size={18} />
              </div>
              <h3>새 포트폴리오 추가</h3>
              <p>성공적인 프로젝트 결과물을 업로드하고 공유하세요.</p>
            </article>

            {portfolioCards.map((card) => (
              <article key={card.id} className={styles.portfolioCard}>
                <div className={`${styles.portfolioVisual} ${styles[card.visualTone]}`.trim()}>
                  <div className={styles.visualGlow} />
                  <div className={styles.visualChart} />
                  <div className={styles.visualTags}>
                    <span className={styles.visualTagPrimary}>{card.tagPrimary}</span>
                    <span className={styles.visualTagSecondary}>{card.tagSecondary}</span>
                  </div>
                </div>

                <div className={styles.portfolioContent}>
                  <h3>{card.title}</h3>
                  <p>{card.summary}</p>

                  <div className={styles.portfolioMeta}>
                    <span>{card.monthLabel}</span>
                    <div className={styles.portfolioMetaActions}>
                      <button className={styles.plainIconButton} type='button' aria-label='결제 정보'>
                        <FiCreditCard size={14} />
                      </button>
                      <button className={styles.plainIconButton} type='button' aria-label='폴더에 추가'>
                        <FiFolder size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <button className={styles.fab} type='button' aria-label='새 작업 추가'>
        <FiPlus size={22} />
      </button>
    </>
  )
}
