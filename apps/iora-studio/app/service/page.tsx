import type { Metadata } from 'next'
import Link from 'next/link'
import { BUSINESS_PHONE, createPageMetadata } from '../../lib/seo'
import ServiceTables from './ServiceTables'
import styles from './page.module.scss'

export const metadata: Metadata = createPageMetadata({
  title: '서비스 및 가격 안내',
  description:
    '홈페이지 제작과 맞춤형 웹서비스 개발 가격, 포함 범위, 제작 기간을 한눈에 확인할 수 있는 이오라스튜디오 서비스 안내 페이지입니다.',
  path: '/service',
})

function ServiceStructuredData() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: '홈페이지 제작 및 맞춤형 웹서비스 개발',
    name: '이오라스튜디오 서비스 및 가격 안내',
    provider: {
      '@type': 'Organization',
      name: '이오라 스튜디오',
      url: 'https://www.iora-studio.com',
    },
    areaServed: 'KR',
    description:
      '기업 홈페이지 제작, React 기반 웹 개발, 맞춤형 웹 시스템 구축 가격과 범위를 안내하는 이오라스튜디오 서비스 페이지',
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
    />
  )
}

export default function ServicePage() {
  return (
    <main className={styles.main}>
      <ServiceStructuredData />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>SERVICE PRICING</p>
          <h1>서비스 및 가격 안내</h1>
          <p className={styles.heroDescription}>
            이오라스튜디오는 브랜드 소개용 홈페이지부터 회원, 데이터, 결제, 관리자 기능이 포함된 맞춤형 웹 시스템까지
            목적에 맞는 웹 개발 스튜디오 서비스 구조를 제공합니다.
          </p>
        </div>
        <div className={styles.heroSummary}>
          <span className={styles.heroSummaryLabel}>PROJECT TYPE</span>
          <strong>홈페이지 제작 / 웹서비스 개발</strong>
          <p>범위와 일정, 운영 구조를 미리 확인하고 예산에 맞춰 선택하실 수 있습니다.</p>
        </div>
      </section>

      <section className={styles.introSection} aria-labelledby='service-intro-title'>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>SERVICE CATEGORY</p>
          <h2 id='service-intro-title'>두 가지 방식으로 안내드립니다</h2>
        </div>
        <div className={styles.introGrid}>
          <article className={styles.introCard}>
            <span className={styles.introIndex}>1.</span>
            <h3>&nbsp;홈페이지 제작</h3>
            <p>브랜드와 서비스를 효과적으로 소개하는 반응형 홈페이지를 제작합니다.</p>
          </article>
          <article className={styles.introCard}>
            <span className={styles.introIndex}>2.</span>
            <h3>&nbsp;웹서비스 개발</h3>
            <p>회원, 데이터, 결제, 관리자 기능이 필요한 맞춤형 웹 시스템을 개발합니다.</p>
          </article>
        </div>
      </section>

      <section className={styles.pricingSection} aria-labelledby='homepage-pricing-title'>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>HOMEPAGE PACKAGE</p>
          <h2 id='homepage-pricing-title'>홈페이지 제작 가격</h2>
        </div>
        <ServiceTables variant='homepage' />
        <p className={styles.note}>* 수정 횟수는 텍스트·이미지 교체, 색상/버튼 등 경미한 조정에 한합니다.</p>
      </section>

      <section className={styles.optionsSection} aria-labelledby='homepage-options-title'>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>ADD-ON OPTIONS</p>
          <h2 id='homepage-options-title'>추가 옵션 (모든 상품에 선택 적용 가능)</h2>
        </div>
        <ServiceTables variant='options' />
      </section>

      <section className={styles.pricingSection} aria-labelledby='webservice-pricing-title'>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>WEB SERVICE PACKAGE</p>
          <h2 id='webservice-pricing-title'>웹서비스 개발 가격</h2>
          <p className={styles.caption}>기본 구축비 + 기능별 추가금 구조입니다.</p>
        </div>
        <ServiceTables variant='webservice' />
        <p className={styles.note}>결제와 예약을 모두 원하시는 경우 별도 협의 부탁드립니다.</p>
      </section>

      <section className={styles.highlightSection} aria-labelledby='service-highlight-title'>
        <div className={styles.highlightCard}>
          <div className={styles.highlightContent}>
            <p className={styles.eyebrow}>CLIENT PORTAL</p>
            <h2 id='service-highlight-title'>진행 상황을
              <br/>고객 전용 페이지에서 직접 확인</h2>
            <p>
              고객 전용 페이지에서 프로젝트 진행 단계, 일정, 자료 요청, 수정 내역을 직접 확인할 수 있습니다.
            </p>
          </div>
          <div className={styles.highlightPreview} aria-hidden='true'>
            <div className={styles.previewStage}>
              <span className={styles.previewStageDone}>상담 및 분석</span>
              <span className={styles.previewStageDone}>기획</span>
              <span className={styles.previewStageCurrent}>개발 진행 중</span>
              <span>검수</span>
              <span>배포</span>
            </div>
            <div className={styles.previewMeta}>
              <div>
                <strong>일정 확인</strong>
                <span>주간 진행 내역과 요청 자료를 한 번에 확인</span>
              </div>
              <div>
                <strong>수정 기록</strong>
                <span>남긴 요청과 반영 상태를 투명하게 공유</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div>
            <p className={styles.eyebrow}>START YOUR PROJECT</p>
            <h2>예산과 일정에 맞는 방향을 바로 상담해보세요</h2>
            <p className={styles.ctaDescription}>
              필요한 범위가 아직 모호해도 괜찮습니다. 목표와 예산을 알려주시면 가장 적절한 구성으로 안내해드립니다.
            </p>
            <p className={styles.contactInfo}>연락처 {BUSINESS_PHONE}</p>
          </div>
          <Link className={styles.ctaButton} href='/contact'>
            지금 문의하기
          </Link>
        </div>
      </section>
    </main>
  )
}
