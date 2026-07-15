export type DashboardMetric = {
  id: string
  title: string
  value: string
  trend: string
  accent: 'pink' | 'slate' | 'green'
  icon: 'project' | 'reservation' | 'message' | 'profit'
}

export type DashboardScheduleItem = {
  id: string
  time: string
  meridiem: 'AM' | 'PM'
  title: string
  location: string
  tone: 'critical' | 'default' | 'muted'
  badge?: string
}

export type DashboardDeadlineItem = {
  id: string
  title: string
  dueLabel: string
  progress: number
  tone: 'hot' | 'default'
}

export type DashboardRequestItem = {
  id: string
  customerInitial: string
  customer: string
  detail: string
  status: 'pending' | 'done'
  statusLabel: string
  timeAgo: string
  actionLabel: string
}

export const DASHBOARD_METRICS: DashboardMetric[] = [
  { id: 'projects', title: '진행 중 프로젝트', value: '08', trend: '+2 신규', accent: 'pink', icon: 'project' },
  { id: 'reservations', title: '이번 달 예약 수', value: '14', trend: '이번 달', accent: 'slate', icon: 'reservation' },
  { id: 'pending', title: '답변 대기 고객', value: '05', trend: '긴급 2', accent: 'pink', icon: 'message' },
  // TODO: Replace this with the current-month revenue sum from the finalized payment/contract settlement table in Supabase.
  { id: 'profit', title: '이번 달 수익화', value: '4,200,000원', trend: '+12%', accent: 'green', icon: 'profit' },
]

export const DASHBOARD_SCHEDULE: DashboardScheduleItem[] = [
  {
    id: 'kickoff',
    time: '10:00',
    meridiem: 'AM',
    title: '넥스트 테크 파트너스 킥오프 미팅',
    location: '온라인 (Google Meet)',
    tone: 'critical',
    badge: 'CRITICAL',
  },
  {
    id: 'feedback',
    time: '02:00',
    meridiem: 'PM',
    title: '디자인 에이전시 UI 가이드라인 피드백',
    location: '오프라인 (강남 스튜디오)',
    tone: 'default',
  },
  {
    id: 'study',
    time: '05:30',
    meridiem: 'PM',
    title: '개인 학습: Three.js 어드밴스드',
    location: '자택',
    tone: 'muted',
  },
]

export const DASHBOARD_DEADLINES: DashboardDeadlineItem[] = [
  { id: 'meta', title: '메타버스 쇼핑몰 1차', dueLabel: 'D-2', progress: 85, tone: 'hot' },
  { id: 'landing', title: '블록체인 랜딩페이지', dueLabel: 'D-5', progress: 40, tone: 'default' },
  { id: 'chatbot', title: 'AI 챗봇 관리자 UI', dueLabel: 'D-12', progress: 20, tone: 'default' },
]

export const DASHBOARD_REQUESTS: DashboardRequestItem[] = [
  {
    id: 'avant',
    customerInitial: 'A',
    customer: '아반트 소프트',
    detail: '메인 배너 텍스트 수정 및 이미지 교체 요청',
    status: 'pending',
    statusLabel: '대기 중',
    timeAgo: '2시간 전',
    actionLabel: '답변하기',
  },
  {
    id: 'spark',
    customerInitial: 'S',
    customer: '스파크 랩스',
    detail: 'API 연동 문서 추가 전달 요청',
    status: 'done',
    statusLabel: '확인 완료',
    timeAgo: '5시간 전',
    actionLabel: '상세보기',
  },
]
