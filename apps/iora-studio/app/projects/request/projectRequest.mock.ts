export type RequestStatus = 'completed' | 'processing' | 'received'

export type ProjectRequestHistoryItem = {
  id: string
  status: RequestStatus
  title: string
  date: string
  assignee: string
  assigneeInitials?: string
}

export type ProjectRequestSummary = {
  projectName: string
  servicePeriod: string
  statusText: string
  remainingDays: string
  currentStep: string
}

export type ProjectRequestPhase = {
  key: string
  label: string
  labelEn: string
  state: 'done' | 'current' | 'pending'
}

export const PROJECT_REQUEST_PHASES: ProjectRequestPhase[] = [
  { key: 'analysis', label: '상담 및 분석', labelEn: 'ANALYSIS', state: 'done' },
  { key: 'planning', label: '기획', labelEn: 'PLANNING', state: 'done' },
  { key: 'development', label: '개발', labelEn: 'DEVELOPMENT', state: 'done' },
  { key: 'qa', label: '검수', labelEn: 'QA', state: 'done' },
  { key: 'launch', label: '배포', labelEn: 'LAUNCH', state: 'done' },
  { key: 'care', label: '유지보수', labelEn: 'CARE', state: 'current' },
  { key: 'final', label: '계약 완료', labelEn: 'FINAL', state: 'pending' },
]

export const PROJECT_REQUEST_SUMMARY: ProjectRequestSummary = {
  projectName: 'Smart Factory Platform Renewal',
  servicePeriod: '2024.01.01 — 2024.12.31',
  statusText: 'In Progress',
  remainingDays: 'D-45',
  currentStep: '유지보수',
}

export const PROJECT_REQUEST_HISTORY: ProjectRequestHistoryItem[] = [
  {
    id: 'req-001',
    status: 'completed',
    title: '대시보드 실시간 데이터 로딩 최적화',
    date: '2024.03.15',
    assignee: 'Minjun Kim',
    assigneeInitials: 'MK',
  },
  {
    id: 'req-002',
    status: 'processing',
    title: '모바일 반응형 레이아웃 오동작 수정',
    date: '2024.03.12',
    assignee: 'Seoyun Lee',
    assigneeInitials: 'SL',
  },
  {
    id: 'req-003',
    status: 'received',
    title: 'API 연동 엔드포인트 보안 강화',
    date: '2024.03.10',
    assignee: 'Unassigned',
  },
  {
    id: 'req-004',
    status: 'completed',
    title: '시스템 모니터링 위젯 추가 요청',
    date: '2024.03.01',
    assignee: 'Minjun Kim',
    assigneeInitials: 'MK',
  },
  {
    id: 'req-005',
    status: 'processing',
    title: '계약 문서 다운로드 UX 개선',
    date: '2024.02.26',
    assignee: 'Jiwon Park',
    assigneeInitials: 'JP',
  },
  {
    id: 'req-006',
    status: 'received',
    title: '유지보수 이력 검색 필터 추가',
    date: '2024.02.20',
    assignee: 'Unassigned',
  },
]
