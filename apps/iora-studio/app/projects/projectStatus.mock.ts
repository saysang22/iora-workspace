export type ProjectPhaseKey =
  | 'analysis'
  | 'planning'
  | 'development'
  | 'qa'
  | 'launch'
  | 'care'
  | 'final'

export type PageProgressStatus = 'done' | 'active' | 'pending'

export type ProjectPhase = {
  key: ProjectPhaseKey
  label: string
  labelEn: string
}

export type ProjectPageProgress = {
  id: string
  name: string
  status: PageProgressStatus
}

export type ProjectStatusData = {
  clientName: string
  projectTitle: string
  startDate: string
  deadlineDate: string
  currentPhase: ProjectPhaseKey
  totalProgress: number
  devLogVersion: string
  pageSummary: {
    completed: number
    total: number
    percent: number
  }
  pages: ProjectPageProgress[]
}

export const PROJECT_PHASES: ProjectPhase[] = [
  { key: 'analysis', label: '상담 및 분석', labelEn: 'ANALYSIS' },
  { key: 'planning', label: '기획', labelEn: 'PLANNING' },
  { key: 'development', label: '개발', labelEn: 'DEVELOPMENT' },
  { key: 'qa', label: '검수', labelEn: 'QA' },
  { key: 'launch', label: '배포', labelEn: 'LAUNCH' },
  { key: 'care', label: '유지보수', labelEn: 'CARE' },
  { key: 'final', label: '계약 완료', labelEn: 'FINAL' },
]

const MOCK_PAGES: ProjectPageProgress[] = [
  { id: 'home', name: '홈', status: 'done' },
  { id: 'about', name: '회사 소개', status: 'done' },
  { id: 'service', name: '서비스 소개', status: 'done' },
  { id: 'works', name: '포트폴리오', status: 'done' },
  { id: 'work-detail', name: '포트폴리오 상세', status: 'done' },
  { id: 'contact', name: '문의하기', status: 'done' },
  { id: 'signin', name: '로그인', status: 'done' },
  { id: 'signup', name: '회원가입', status: 'done' },
  { id: 'profile', name: '회원 수정', status: 'done' },
  { id: 'status', name: '프로젝트 현황', status: 'active' },
  { id: 'admin-dashboard', name: '관리자 대시보드', status: 'active' },
  { id: 'project-list', name: '프로젝트 목록', status: 'pending' },
  { id: 'project-detail', name: '프로젝트 상세', status: 'pending' },
  { id: 'faq', name: 'FAQ', status: 'pending' },
  { id: 'notice', name: '공지사항', status: 'pending' },
  { id: 'terms', name: '이용약관', status: 'pending' },
  { id: 'privacy', name: '개인정보처리방침', status: 'pending' },
  { id: 'support', name: '고객지원', status: 'pending' },
  { id: 'report', name: '리포트 다운로드', status: 'pending' },
  { id: 'maintenance', name: '유지보수 이력', status: 'pending' },
]

export function buildMockProjectStatus(clientName: string): ProjectStatusData {
  const completed = MOCK_PAGES.filter((page) => page.status === 'done').length
  const total = MOCK_PAGES.length
  const percent = Math.round((completed / total) * 100)

  return {
    clientName,
    projectTitle: 'Project Status',
    startDate: '2026.06.03',
    deadlineDate: '2026.08.31',
    currentPhase: 'development',
    totalProgress: 62,
    devLogVersion: 'DEV_LOG v.2.1',
    pageSummary: {
      completed,
      total,
      percent,
    },
    pages: MOCK_PAGES,
  }
}
