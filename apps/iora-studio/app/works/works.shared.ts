export type WorkCategory = 'all' | 'company-homepage' | 'landing-page' | 'shopping-mall' | 'maintenance'

export type WorkArtifact = {
  src: string
  alt: string
  kind: 'hero' | 'dashboard' | 'mobile' | 'monitor'
}

export type WorkItem = {
  slug: string
  title: string
  description: string
  category: Exclude<WorkCategory, 'all'>
  categoryLabel: string
  badgeLabel: string
  thumbnailSrc: string
  thumbnailAlt: string
  client: string
  timeline: string
  service: string
  overview: string
  challenge: string
  solution: string
  result: string
  artifacts: WorkArtifact[]
}

export type ClientVoice = {
  quote: string
  name: string
  role: string
}

export const WORK_CATEGORIES: Array<{ id: WorkCategory; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'company-homepage', label: '기업 홈페이지' },
  { id: 'landing-page', label: '랜딩페이지' },
  { id: 'shopping-mall', label: '쇼핑몰' },
  { id: 'maintenance', label: '유지보수' },
]

export const WORK_ITEMS: WorkItem[] = [
  {
    slug: 'neo-finance-ecosystem',
    title: 'Modern SaaS Ecosystem',
    description: '복잡한 금융 데이터를 직관적으로 시각화한 차세대 기업용 통합 자산 관리 플랫폼.',
    category: 'company-homepage',
    categoryLabel: '기업 홈페이지',
    badgeLabel: 'Enterprise',
    thumbnailSrc: '/images/home/banner.png',
    thumbnailAlt: 'Modern SaaS Ecosystem 포트폴리오 썸네일',
    client: 'TechForward AI Enterprise',
    timeline: '2024 7Q-5Q',
    service: 'Full-Stack Dev & Design',
    overview:
      'AI 기반 운영 환경에 최적화된 엔터프라이즈 SaaS 플랫폼으로, 브랜드의 기술적 신뢰감과 운용 효율을 동시에 전달하는 것이 핵심 목표였습니다. IORA Studio는 금융 데이터의 복잡성을 직관적인 시각 경험으로 치환하는 데 집중했습니다.',
    challenge:
      '기존 서비스는 복잡한 데이터 흐름과 무거운 구조 때문에 처음 접하는 사용자에게 높은 진입 장벽을 주고 있었습니다. 또한 대시보드 구조가 파편화되어 정보 우선순위가 흐려지는 문제가 있었습니다.',
    solution:
      'React 기반 설계와 SPA 구조를 활용해 정보 계층을 재정렬하고, 핵심 지표 중심의 대시보드 패턴을 설계했습니다. 어두운 톤의 인터페이스와 라임 포인트를 결합해 기술 중심 브랜드 이미지를 강화했습니다.',
    result:
      '복잡한 기능을 명확한 화면 흐름으로 재구성해 데모 만족도를 높였고, 핵심 정보 탐색 시간이 단축되었습니다. 내부 제품 소개 자료와 영업용 시연 화면으로도 함께 활용할 수 있는 수준으로 확장성을 확보했습니다.',
    artifacts: [
      {
        src: '/images/home/banner.png',
        alt: 'Modern SaaS Ecosystem 대표 히어로 이미지',
        kind: 'hero',
      },
      {
        src: '/images/home/react_card.png',
        alt: 'Modern SaaS Ecosystem 대시보드 아티팩트 이미지',
        kind: 'dashboard',
      },
      {
        src: '/images/home/ai_card.png',
        alt: 'Modern SaaS Ecosystem 모바일 아티팩트 이미지',
        kind: 'mobile',
      },
      {
        src: '/images/home/free.png',
        alt: 'Modern SaaS Ecosystem 모니터 아티팩트 이미지',
        kind: 'monitor',
      },
    ],
  },
  {
    slug: 'urban-arch-studio',
    title: 'Urban Arch Studio',
    description: '건축 미학을 디지털로 전이시킨 고감도 포트폴리오 웹사이트 및 마케팅 사이트.',
    category: 'landing-page',
    categoryLabel: '랜딩페이지',
    badgeLabel: 'Architecture',
    thumbnailSrc: '/images/home/free.png',
    thumbnailAlt: 'Urban Arch Studio 포트폴리오 썸네일',
    client: 'Urban Design Group',
    timeline: '2024 5Q-8Q',
    service: 'Brand Site & Visual Direction',
    overview:
      '오프라인 공간의 질감과 건축적 미감을 디지털 상에서 자연스럽게 이어주는 것이 핵심 과제였습니다. 브랜드의 정제된 분위기를 유지하면서도 문의 전환이 가능한 마케팅 구조가 함께 필요했습니다.',
    challenge:
      '건축 포트폴리오는 이미지만 강조되기 쉬워 정보 설계가 약해지는 경우가 많았습니다. 또한 프로젝트 소개와 브랜드 스토리를 분리하지 않고 균형 있게 전달해야 했습니다.',
    solution:
      '여백 중심의 타이포그래피 시스템과 모듈형 콘텐츠 블록을 설계해 감도와 정보 전달력을 동시에 확보했습니다. 주요 섹션은 부드러운 전환과 일관된 이미지 비율로 통일했습니다.',
    result:
      '브랜드 아이덴티티를 유지한 채 상담 전환을 유도할 수 있는 랜딩 구조를 완성했습니다. 내부 제안서와 해외 파트너 소개 자료로도 재사용 가능한 수준의 포트폴리오 페이지가 되었습니다.',
    artifacts: [
      {
        src: '/images/home/free.png',
        alt: 'Urban Arch Studio 대표 히어로 이미지',
        kind: 'hero',
      },
      {
        src: '/images/home/banner.png',
        alt: 'Urban Arch Studio 대시보드 아티팩트 이미지',
        kind: 'dashboard',
      },
      {
        src: '/images/home/react_card.png',
        alt: 'Urban Arch Studio 모바일 아티팩트 이미지',
        kind: 'mobile',
      },
      {
        src: '/images/home/ai_card.png',
        alt: 'Urban Arch Studio 모니터 아티팩트 이미지',
        kind: 'monitor',
      },
    ],
  },
  {
    slug: 'veloce-gear-shop',
    title: 'Veloce Gear Shop',
    description: '고성능 테크 기어들을 위한 고도화된 인터랙션 기반의 프리미엄 쇼핑 경험.',
    category: 'shopping-mall',
    categoryLabel: '쇼핑몰',
    badgeLabel: 'E-Commerce',
    thumbnailSrc: '/images/home/ai_card.png',
    thumbnailAlt: 'Veloce Gear Shop 포트폴리오 썸네일',
    client: 'Veloce Mobility',
    timeline: '2024 4Q-6Q',
    service: 'Commerce UX & Frontend',
    overview:
      '프리미엄 테크 기어 브랜드를 위한 커머스 경험으로, 제품의 고급스러움과 기술적 디테일을 동시에 강조할 수 있는 화면 구성이 필요했습니다. 탐색과 구매 흐름 모두 속도감 있게 재설계하는 것이 목표였습니다.',
    challenge:
      '고가 제품군은 정보량이 많고 비교 요소가 복잡해 페이지가 쉽게 무거워집니다. 기존 구조에서는 제품 이해와 구매 동선이 분리되어 이탈률이 높아질 우려가 있었습니다.',
    solution:
      '구매 흐름에 직접 연결되는 정보 우선순위를 정리하고, 제품 특징을 시각 블록으로 재구성했습니다. 카드, 상세, 비교 섹션의 리듬을 통일해 탐색 경험이 자연스럽게 이어지도록 설계했습니다.',
    result:
      '프리미엄 브랜드 톤을 유지하면서도 구매 흐름을 단순화한 커머스 페이지 구조를 구축했습니다. 제품 캠페인 확장에도 대응 가능한 컴포넌트 기반 설계로 운영 효율까지 확보했습니다.',
    artifacts: [
      {
        src: '/images/home/ai_card.png',
        alt: 'Veloce Gear Shop 대표 히어로 이미지',
        kind: 'hero',
      },
      {
        src: '/images/home/react_card.png',
        alt: 'Veloce Gear Shop 대시보드 아티팩트 이미지',
        kind: 'dashboard',
      },
      {
        src: '/images/home/free.png',
        alt: 'Veloce Gear Shop 모바일 아티팩트 이미지',
        kind: 'mobile',
      },
      {
        src: '/images/home/banner.png',
        alt: 'Veloce Gear Shop 모니터 아티팩트 이미지',
        kind: 'monitor',
      },
    ],
  },
  {
    slug: 'ai-dev-hub',
    title: 'AI Dev Hub',
    description: '개발자 생산성을 극대화하는 워크플로우 자동화 도구의 웹 인터페이스 디자인.',
    category: 'company-homepage',
    categoryLabel: '기업 홈페이지',
    badgeLabel: 'SaaS',
    thumbnailSrc: '/images/home/react_card.png',
    thumbnailAlt: 'AI Dev Hub 포트폴리오 썸네일',
    client: 'Internal Productivity Team',
    timeline: '2024 2Q-4Q',
    service: 'Design System Maintenance',
    overview:
      '개발자 워크플로우 자동화 도구의 유지보수 프로젝트로, 반복적인 기능 개선과 정보 구조 정리가 지속적으로 필요한 환경이었습니다. 빠른 기능 반영 속도와 디자인 일관성 유지가 동시에 중요했습니다.',
    challenge:
      '서비스가 계속 확장되면서 기능은 늘어났지만 화면 구조는 일관성을 잃기 시작했습니다. 신규 기능이 추가될 때마다 UI 패턴이 분산되고 유지보수 비용이 높아지는 문제가 있었습니다.',
    solution:
      '기존 인터페이스를 컴포넌트 기준으로 다시 정리하고, 반복적으로 쓰이는 상태 표현과 카드 구조를 표준화했습니다. 개선 작업이 누적될수록 더 빨라지는 운영 구조를 목표로 리팩터링했습니다.',
    result:
      '지속적인 기능 추가에도 화면 일관성을 유지할 수 있는 기반을 만들었습니다. 운영 팀과 개발 팀 모두가 동일한 패턴을 공유하게 되면서 이후 개선 작업 속도도 안정적으로 유지되었습니다.',
    artifacts: [
      {
        src: '/images/home/react_card.png',
        alt: 'AI Dev Hub 대표 히어로 이미지',
        kind: 'hero',
      },
      {
        src: '/images/home/free.png',
        alt: 'AI Dev Hub 대시보드 아티팩트 이미지',
        kind: 'dashboard',
      },
      {
        src: '/images/home/banner.png',
        alt: 'AI Dev Hub 모바일 아티팩트 이미지',
        kind: 'mobile',
      },
      {
        src: '/images/home/ai_card.png',
        alt: 'AI Dev Hub 모니터 아티팩트 이미지',
        kind: 'monitor',
      },
    ],
  },
]

export const CLIENT_VOICES: ClientVoice[] = [
  {
    quote:
      '"AI를 활용한 빠른 개발 속도에 놀랐습니다. 단순히 빠른 것뿐만 아니라 결과물의 디자인 완성도와 코드 품질이 대단히 뛰어납니다."',
    name: '김민수',
    role: 'CEO, TechNova Solutions',
  },
  {
    quote:
      '"우리의 브랜드 가치를 정확히 이해하고 디지털로 구현해 주었습니다. IORA Studio는 단순한 외주사가 아닌 진정한 비즈니스 파트너입니다."',
    name: '이지은',
    role: 'Creative Director, Urban Design',
  },
  {
    quote:
      '"React 기반의 부드러운 사용자 경험이 매출 상승으로 이어졌습니다. 유지보수 또한 체계적이어서 안심하고 비즈니스에만 집중할 수 있습니다."',
    name: 'Robert Park',
    role: 'CTO, Global Retail Co.',
  },
]

export function getWorkBySlug(slug: string) {
  return WORK_ITEMS.find((item) => item.slug === slug)
}
