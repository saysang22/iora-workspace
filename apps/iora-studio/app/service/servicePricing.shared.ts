export type ServiceOptionValue =
  | 'homepage-light'
  | 'homepage-brand'
  | 'homepage-premium'
  | 'webservice-starter'
  | 'webservice-business'
  | 'webservice-custom'
  | 'undecided-consultation'

export type ServiceOption = {
  label: string
  value: ServiceOptionValue
}

export type ServiceSummary = {
  price: string
  summary: string
}

export type PackageRowData = {
  key: string
  name: string
  price: string
  scope: string
  duration: string
}

export type OptionRowData = {
  key: string
  option: string
  price: string
  description: string
}

export const SERVICE_SELECT_OPTIONS: ServiceOption[] = [
  { label: '홈페이지 제작 - 라이트', value: 'homepage-light' },
  { label: '홈페이지 제작 - 브랜드', value: 'homepage-brand' },
  { label: '홈페이지 제작 - 프리미엄', value: 'homepage-premium' },
  { label: '웹서비스 개발 - 스타터', value: 'webservice-starter' },
  { label: '웹서비스 개발 - 비즈니스', value: 'webservice-business' },
  { label: '웹서비스 개발 - 맞춤형', value: 'webservice-custom' },
  { label: '잘 모르겠음 / 상담 후 결정', value: 'undecided-consultation' },
]

export const SERVICE_SUMMARY_MAP: Record<ServiceOptionValue, ServiceSummary> = {
  'homepage-light': {
    price: '79만원',
    summary: '3페이지, 반응형, 문의폼, 기본 SEO, 수정 2회 포함',
  },
  'homepage-brand': {
    price: '159만원',
    summary: '5~7페이지, 문의 기능, 기본 SEO, 도메인·배포, 수정 3회 포함',
  },
  'homepage-premium': {
    price: '289만원',
    summary: '8~10페이지, 애니메이션, 콘텐츠 구조 기획, 간단 관리자 기능, 수정 3회 포함',
  },
  'webservice-starter': {
    price: '590만원부터',
    summary: '회원가입·로그인, 프로필, DB 설계, 기본 관리자 화면, 반응형, 배포 포함',
  },
  'webservice-business': {
    price: '1,100만원부터',
    summary: '회원·업체 관리, 권한, 결제 또는 예약, 관리자 대시보드, 파일 업로드, 외부 API 1개 연동',
  },
  'webservice-custom': {
    price: '2,200만원부터 (별도 견적)',
    summary: '정확한 견적은 상담 후 안내드립니다.',
  },
  'undecided-consultation': {
    price: '',
    summary: '요청 내용에 원하시는 기능을 자유롭게 적어주시면 적합한 상품을 안내드립니다.',
  },
}

export const HOMEPAGE_PACKAGE_ROWS: PackageRowData[] = [
  {
    key: 'homepage-light',
    name: '라이트',
    price: '79만원',
    scope: '템플릿 기반 3페이지, 반응형, 문의폼, 기본 SEO, 수정 2회 포함',
    duration: '5~7영업일',
  },
  {
    key: 'homepage-brand',
    name: '브랜드',
    price: '159만원',
    scope: '맞춤 디자인 보조 5~7페이지, 게시판 또는 문의 기능, 기본 SEO, 도메인·배포, 진행 현황 확인, 수정 3회 포함',
    duration: '10~14영업일',
  },
  {
    key: 'homepage-premium',
    name: '프리미엄',
    price: '289만원',
    scope: '완전 맞춤 디자인 8~10페이지, 애니메이션·인터랙션, 콘텐츠 구조 기획, 게시판+상담신청, 간단 관리자 기능, 분석도구 연동, 진행 현황 확인, 수정 3회 포함',
    duration: '15~20영업일',
  },
]

export const HOMEPAGE_OPTION_ROWS: OptionRowData[] = [
  {
    key: 'animation',
    option: '애니메이션·인터랙션 추가',
    price: '+20만원',
    description: '기본 인터랙션 최대 3개 영역까지 (스크롤 등장, 호버 효과 등)',
  },
  {
    key: 'page-add',
    option: '페이지 추가',
    price: '+15만원 (1페이지당)',
    description: '-',
  },
  {
    key: 'revision',
    option: '포함된 수정 횟수 초과 시',
    price: '+5만원 (1회당)',
    description: '-',
  },
  {
    key: 'section-add',
    option: '섹션 추가',
    price: '+5만원 (1개당)',
    description: '-',
  },
  {
    key: 'layout-rebuild',
    option: '레이아웃 재구성',
    price: '+20만원 (페이지 단위)',
    description: '-',
  },
]

export const WEBSERVICE_PACKAGE_ROWS: PackageRowData[] = [
  {
    key: 'webservice-starter',
    name: '스타터',
    price: '590만원부터',
    scope: '회원가입·로그인(소셜 로그인 포함), 사용자 프로필, 데이터베이스 설계, 기본 관리자 화면, 반응형, 배포, 진행 현황 확인',
    duration: '4~6주',
  },
  {
    key: 'webservice-business',
    name: '비즈니스',
    price: '1,100만원부터',
    scope: '회원·업체 관리, 역할별 권한, 결제 또는 예약 기능(택1), 관리자 대시보드, 알림, 파일 업로드, 검색·필터, 외부 API 1개 연동',
    duration: '6~9주',
  },
  {
    key: 'webservice-custom',
    name: '맞춤형',
    price: '2,200만원부터 (별도 견적)',
    scope: '결제+예약+정산 동시 구현, 실시간 기능, 자동화, 외부 서비스 다수 연동, 운영 도구, 고도화된 보안·로그 관리',
    duration: '10주 이상',
  },
]
