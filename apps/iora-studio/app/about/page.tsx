import styles from './page.module.scss'

type ServiceItem = {
  title: string
  description: string
  price: string
}

type ProcessStep = {
  number: string
  label: string
  isActive?: boolean
}

type PolicyItem = {
  icon: string
  label: string
  content: string
  accent?: string
}

type AboutPageProps = {
  services: ServiceItem[]
  processSteps: ProcessStep[]
  policies: PolicyItem[]
  faqs: string[]
}

const SERVICES: ServiceItem[] = [
  {
    title: '기업 홈페이지',
    description: '브랜드 가치를 높이는 맞춤형 기업 홍보 사이트',
    price: '협의 후 결정',
  },
  {
    title: '랜딩페이지',
    description: '전환율을 극대화하는 마케팅 특화 단일 페이지',
    price: '50만원 ~',
  },
  {
    title: '쇼핑몰',
    description: '안정적인 결제 시스템과 효율적인 관리 도구가 포함된 커머스',
    price: '150만원 ~',
  },
  {
    title: '유지보수',
    description: '배포 후에도 안심하고 운영할 수 있는 실시간 모니터링 및 업데이트',
    price: '월 5만원 ~',
  },
]

const PROCESS_STEPS: ProcessStep[] = [
  { number: '01', label: '상담' },
  { number: '02', label: '기획' },
  { number: '03', label: '개발', isActive: true },
  { number: '04', label: '검수' },
  { number: '05', label: '배포' },
  { number: '06', label: '유지보수' },
]

const POLICIES: PolicyItem[] = [
  {
    icon: '◷',
    label: 'RESPONSE POLICY',
    content: '평일 10~19시 응답 / 평균 답변 2~4시간 / ',
    accent: '긴급 장애만 실시간 대응',
  },
  {
    icon: '↬',
    label: 'REVISION POLICY',
    content: '기본 수정 2회 포함, 추가 수정은 별도 협의를 통해 신속하게 진행됩니다.',
  },
]

const FAQS = [
  '제작 기간은 얼마나 소요되나요?',
  '호스팅과 도메인은 직접 준비해야 하나요?',
  '제작 후 직접 내용을 수정할 수 있나요?',
  '결제 방식은 어떻게 되나요?',
]

function AboutContent({
  services,
  processSteps,
  policies,
  faqs,
}: AboutPageProps) {
  return (
    <main className={styles.main}>
      <section className={styles.pageHeader}>
        <p className={styles.eyebrow}>SERVICE OVERVIEW</p>
        <h1>서비스 소개</h1>
        <p>
          IORA Studio는 비즈니스의 목적에 최적화된 고성능 웹 서비스와 안정적인 운영 솔루션을 제공합니다.
          우리는 단순한 개발을 넘어, 클라이언트의 성장을 가속화하는 기술적 파트너로서 함께합니다.
        </p>
      </section>

      <section className={styles.serviceList} aria-label="서비스 종류">
        {services.map((service) => (
          <article className={styles.serviceItem} key={service.title}>
            <h2>{service.title}</h2>
            <p>{service.description}</p>
            <strong>{service.price}</strong>
          </article>
        ))}
      </section>

      <section className={styles.processSection}>
        <h2>Work Process</h2>
        <ol className={styles.processList}>
          {processSteps.map((step) => (
            <li className={step.isActive ? styles.activeStep : undefined} key={step.number}>
              <span>{step.number}</span>
              <p>{step.label}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.policyGrid} aria-label="응답 및 수정 정책">
        {policies.map((policy) => (
          <article className={styles.policyCard} key={policy.label}>
            <h2>
              <span>{policy.icon}</span>
              {policy.label}
            </h2>
            <p>
              {policy.content}
              {policy.accent ? <strong>{policy.accent}</strong> : null}
            </p>
          </article>
        ))}
      </section>

      <section className={styles.faqSection}>
        <h2>자주 묻는 질문</h2>
        <ul>
          {faqs.map((faq) => (
            <li key={faq}>
              <button type="button">
                <span>{faq}</span>
                <span aria-hidden="true">⌄</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default function AboutPage() {
  return (
    <AboutContent
      services={SERVICES}
      processSteps={PROCESS_STEPS}
      policies={POLICIES}
      faqs={FAQS}
    />
  )
}
