'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  FiCheckSquare,
  FiCode,
  FiFileText,
  FiSearch,
  FiSend,
  FiTool,
} from 'react-icons/fi'
import styles from './page.module.scss'

const HOME_IMAGES = {
  hero: '/images/home/banner.png',
  process: '/images/home/ai_card.png',
  react: '/images/home/react_card.png',
  design: '/images/home/free.png',
} as const

type FeatureCard = {
  icon: string
  title: string
  description: string
}

type ExperienceItem = {
  title: string
  description: string
}

type DesignStep = {
  number: string
  label: string
  icon: typeof FiSearch
}

type HomePageContentProps = {
  features?: FeatureCard[]
  experiences?: ExperienceItem[]
  designSteps?: DesignStep[]
}

const FEATURES: FeatureCard[] = [
  {
    icon: '⚡',
    title: '빠른 시작',
    description: '워크플로우의 각 단계마다 AI 에이전트를 투입하여 기존 대비 빠른 딜리버리를 보장합니다.',
  },
  {
    icon: '🎯',
    title: '높은 완성도',
    description: '검증된 데이터와 기술적 판단으로 사용자의 흐름과 브랜드 경험을 정교하게 설계합니다.',
  },
  {
    icon: '🛠',
    title: '지속 가능한 관리',
    description: '구축 이후에도 안정적인 운영과 개선이 가능하도록 구조와 관리 체계를 함께 제공합니다.',
  },
] as const

const EXPERIENCES: ExperienceItem[] = [
  {
    title: '최적화된 속도와 성능',
    description: '0.1초의 차이가 비즈니스의 성공을 결정합니다. 최고의 로딩 속도를 보장합니다.',
  },
  {
    title: '모듈화된 UI 시스템',
    description: '확장 가능한 컴포넌트 단위 개발로 일관된 브랜드 정체성을 유지합니다.',
  },
  {
    title: '반응형 모바일 대응',
    description: '다양한 디바이스 환경에서도 최적의 뷰를 제공하는 반응형 설계를 적용합니다.',
  },
] as const

const DESIGN_STEPS: DesignStep[] = [
  { number: '01', label: '상담 및 분석', icon: FiSearch },
  { number: '02', label: '기획', icon: FiFileText },
  { number: '03', label: '개발', icon: FiCode },
  { number: '04', label: '검수', icon: FiCheckSquare },
  { number: '05', label: '배포', icon: FiSend },
  { number: '06', label: '유지보수', icon: FiTool },
] as const

export default function HomePageContent({
  features = FEATURES,
  experiences = EXPERIENCES,
  designSteps = DESIGN_STEPS,
}: HomePageContentProps) {
  const homeRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const rootElement = homeRef.current

    if (!rootElement) {
      return
    }

    const revealTargets = Array.from(rootElement.querySelectorAll<HTMLElement>('[data-home-reveal]'))

    if (revealTargets.length === 0) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let observer: IntersectionObserver | null = null

    const revealAll = () => {
      revealTargets.forEach((element) => {
        element.dataset.revealed = 'true'
      })
    }

    const observeTargets = () => {
      observer?.disconnect()
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return
            }

            const target = entry.target as HTMLElement
            target.dataset.revealed = 'true'
            observer?.unobserve(target)
          })
        },
        {
          threshold: 0.18,
          rootMargin: '0px 0px -8% 0px',
        },
      )

      revealTargets.forEach((element) => {
        delete element.dataset.revealed
        observer?.observe(element)
      })
    }

    const syncMotionPreference = (reducedMotion: boolean) => {
      if (reducedMotion) {
        observer?.disconnect()
        revealAll()
        return
      }

      observeTargets()
    }

    syncMotionPreference(mediaQuery.matches)

    const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
      syncMotionPreference(event.matches)
    }

    mediaQuery.addEventListener('change', handleMotionPreferenceChange)

    return () => {
      observer?.disconnect()
      mediaQuery.removeEventListener('change', handleMotionPreferenceChange)
    }
  }, [])

  const getRevealStyle = (delay: number) =>
    ({
      '--reveal-delay': `${delay}ms`,
    }) as CSSProperties

  return (
    <main className={styles.home} ref={homeRef}>
      <section className={`${styles.hero} ${styles.revealItem}`} data-home-reveal style={getRevealStyle(0)}>
        <Image
          className={styles.heroImage}
          src={HOME_IMAGES.hero}
          alt='이오라 스튜디오 메인 비주얼'
          fill
          priority
          sizes='100vw'
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.badge}>PREMIUM WEB STUDIO</p>
          <h1>
            AI로 완성하는
            <br />
            더 빠르고 더 선명한<span>웹</span>
          </h1>
          <p>
            AI 기술과 React 기반 웹 개발 역량으로 비즈니스의 가치를 높이는 차세대 웹 서비스를 제작합니다.
            이오라스튜디오는 단순한 구축을 넘어 기업 웹사이트 구축과 소프트웨어 개발 전반의 사용자 경험을
            정교하게 설계하는 웹 개발 스튜디오입니다.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href='/contact'>문의하기</Link>
            <Link className={styles.secondaryButton} href='/works'>포트폴리오 보기</Link>
          </div>
        </div>
      </section>

      <section className={`${styles.processSection} ${styles.revealItem}`} data-home-reveal style={getRevealStyle(20)}>
        <div className={styles.container}>
          <div className={`${styles.sectionHeader} ${styles.revealItem}`} data-home-reveal style={getRevealStyle(40)}>
            <p className={styles.eyebrow}>AI-POWERED WORKFLOW</p>
            <h2 className={styles.processTitle}>정교한 기술로 앞서가는 프로세스</h2>
            <p>
              AI를 사용해 반복 작업을 자동화로 시작 시간을 단축하고, 데이터 기반의 분석을 통해 결과물의
              완성도를 극대화합니다. 기업 웹사이트 구축부터 맞춤형 소프트웨어 개발까지 같은 기준으로
              설계합니다.
            </p>
          </div>
          <div className={`${styles.imagePanel} ${styles.revealItem}`} data-home-reveal style={getRevealStyle(90)}>
            <Image
              src={HOME_IMAGES.process}
              alt='AI 기반 제작 프로세스'
              width={1535}
              height={1024}
              sizes='(max-width: 768px) 100vw, 1232px'
            />
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <article
                className={`${styles.featureCard} ${styles.revealItem}`}
                data-home-reveal
                key={feature.title}
                style={getRevealStyle(130 + index * 90)}
              >
                <span>{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.experienceSection} ${styles.revealItem}`} data-home-reveal style={getRevealStyle(20)}>
        <div className={`${styles.container} ${styles.experienceGrid}`}>
          <div className={styles.revealItem} data-home-reveal style={getRevealStyle(50)}>
            <p className={styles.eyebrow}>SMOOTH EXPERIENCE</p>
            <h2>
              React 기반의
              <br />
              부드러운 사용자 경험
            </h2>
            <p className={styles.sectionText}>
              React와 컴포넌트 기반 아키텍처, 최신 렌더링 기술을 사용하여 사용자에게 최상의 웹 경험을
              제공합니다. React 기반 웹 개발에 최적화된 확장성 있는 코드 구조로 유지보수와 일관성을
              극대화합니다.
            </p>
            <ul className={styles.experienceList}>
              {experiences.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${styles.reactPanel} ${styles.revealItem}`} data-home-reveal style={getRevealStyle(120)}>
            <Image
              src={HOME_IMAGES.react}
              alt='React 기반 사용자 경험 시각화'
              width={1535}
              height={1024}
              sizes='(max-width: 768px) 100vw, 576px'
            />
          </div>
        </div>
      </section>

      <section className={`${styles.designSection} ${styles.revealItem}`} data-home-reveal style={getRevealStyle(20)}>
        <div className={styles.container}>
          <div className={`${styles.splitHeader} ${styles.revealItem}`} data-home-reveal style={getRevealStyle(50)}>
            <div>
              <p className={styles.eyebrow}>CUSTOM DESIGN</p>
              <h2>자유도 높은 맞춤형 디자인</h2>
            </div>
            <p>
              이오라스튜디오는 템플릿을 쓰지 않습니다. 브랜드의 고유한 가치를 담아낸 입체적인 디자인으로
              인상에 남는 결과물을 만듭니다. 감각적인 화면 위에 실제 비즈니스에 필요한 웹 개발 스튜디오의
              실행력을 함께 더합니다.
            </p>
          </div>
          <div className={`${styles.designPanel} ${styles.revealItem}`} data-home-reveal style={getRevealStyle(110)}>
            <Image
              src={HOME_IMAGES.design}
              alt='맞춤형 디자인 프로세스 인터페이스'
              width={1536}
              height={1024}
              sizes='(max-width: 768px) 100vw, 1232px'
            />
          </div>
          <div className={styles.stepGrid}>
            {designSteps.map((step, index) => (
              <div
                className={`${styles.stepCard} ${styles.revealItem}`}
                data-home-reveal
                key={step.number}
                style={getRevealStyle(150 + index * 70)}
              >
                <span className={styles.stepIcon} aria-hidden='true'>
                  <step.icon size={18} />
                </span>
                <strong>{step.number}</strong>
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.ctaSection} ${styles.revealItem}`} data-home-reveal style={getRevealStyle(0)}>
        <div className={`${styles.container} ${styles.revealItem}`} data-home-reveal style={getRevealStyle(40)}>
          <h2>
            다음 비즈니스의 성장을 위해
            <br />
            <span>IORA STUDIO</span>와 상담하세요
          </h2>
          <p>
            비즈니스의 목표와 현재의 고민을 알려주세요. 최적의 기술 스택과 디자인 구조로 해결책을
            제안해드립니다.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href='/contact'>프로젝트 문의하기</Link>
            <Link className={styles.darkButton} href='/contact'>카카오톡 상담</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
