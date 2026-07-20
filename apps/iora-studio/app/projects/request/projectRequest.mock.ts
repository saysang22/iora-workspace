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
  servicePeriod: '2024.01.01 ~ 2024.12.31',
  statusText: 'In Progress',
  remainingDays: 'D-45',
  currentStep: '유지보수',
}

export const PROJECT_REQUEST_HISTORY: ProjectRequestHistoryItem[] = [
  { id: 'req-001', status: 'completed', title: '대시보드 실시간 데이터 로딩 최적화', date: '2026.07.18', assignee: 'Minjun Kim', assigneeInitials: 'MK' },
  { id: 'req-002', status: 'processing', title: '모바일 반응형 레이아웃 정렬 수정', date: '2026.07.17', assignee: 'Seoyun Lee', assigneeInitials: 'SL' },
  { id: 'req-003', status: 'received', title: 'API 연동 보안 점검 요청', date: '2026.07.16', assignee: 'Unassigned' },
  { id: 'req-004', status: 'completed', title: '통계 카드 숫자 표시 방식 개선', date: '2026.07.15', assignee: 'Minjun Kim', assigneeInitials: 'MK' },
  { id: 'req-005', status: 'processing', title: '계약 문서 다운로드 UX 개선', date: '2026.07.14', assignee: 'Jiwon Park', assigneeInitials: 'JP' },
  { id: 'req-006', status: 'received', title: '유지보수 이력 필터 추가', date: '2026.07.13', assignee: 'Unassigned' },
  { id: 'req-007', status: 'completed', title: '메인 배너 문구 교체 반영', date: '2026.07.12', assignee: 'Minjun Kim', assigneeInitials: 'MK' },
  { id: 'req-008', status: 'processing', title: '프로젝트 현황 카드 여백 조정', date: '2026.07.11', assignee: 'Seoyun Lee', assigneeInitials: 'SL' },
  { id: 'req-009', status: 'received', title: '회원가입 폼 에러 문구 수정 요청', date: '2026.07.10', assignee: 'Unassigned' },
  { id: 'req-010', status: 'completed', title: '관리자 사이드바 아이콘 정렬 수정', date: '2026.07.09', assignee: 'Jiwon Park', assigneeInitials: 'JP' },
  { id: 'req-011', status: 'processing', title: '문의 등록 후 완료 메시지 디자인 개선', date: '2026.07.08', assignee: 'Minjun Kim', assigneeInitials: 'MK' },
  { id: 'req-012', status: 'received', title: '프로젝트 요청 페이지 문장 교정', date: '2026.07.07', assignee: 'Unassigned' },
  { id: 'req-013', status: 'completed', title: '로그인 드롭다운 링크 추가 반영', date: '2026.07.06', assignee: 'Seoyun Lee', assigneeInitials: 'SL' },
  { id: 'req-014', status: 'processing', title: '캘린더 선택 버튼 접근성 보완', date: '2026.07.05', assignee: 'Jiwon Park', assigneeInitials: 'JP' },
  { id: 'req-015', status: 'received', title: '프로필 수정 페이지 버튼 문구 변경', date: '2026.07.04', assignee: 'Unassigned' },
  { id: 'req-016', status: 'completed', title: 'Footer 연락처 링크 동작 수정', date: '2026.07.03', assignee: 'Minjun Kim', assigneeInitials: 'MK' },
  { id: 'req-017', status: 'processing', title: '공지사항 리스트 카드 간격 조정', date: '2026.07.02', assignee: 'Seoyun Lee', assigneeInitials: 'SL' },
  { id: 'req-018', status: 'received', title: '비밀번호 찾기 화면 문구 정리', date: '2026.07.01', assignee: 'Unassigned' },
  { id: 'req-019', status: 'completed', title: '브랜드 컬러 적용 범위 업데이트', date: '2026.06.30', assignee: 'Jiwon Park', assigneeInitials: 'JP' },
  { id: 'req-020', status: 'processing', title: '문의 상세 메일 템플릿 시인성 개선', date: '2026.06.29', assignee: 'Minjun Kim', assigneeInitials: 'MK' },
  { id: 'req-021', status: 'received', title: '예약 마감 뱃지 노출 기준 재검토', date: '2026.06.28', assignee: 'Unassigned' },
  { id: 'req-022', status: 'completed', title: '유지보수 기간 표시 포맷 통일', date: '2026.06.27', assignee: 'Seoyun Lee', assigneeInitials: 'SL' },
  { id: 'req-023', status: 'processing', title: '대시보드 최근 활동 영역 높이 조절', date: '2026.06.26', assignee: 'Jiwon Park', assigneeInitials: 'JP' },
  { id: 'req-024', status: 'received', title: '프로젝트 등록 모달 안내 문구 추가', date: '2026.06.25', assignee: 'Unassigned' },
  { id: 'req-025', status: 'completed', title: '모바일 메뉴 닫기 애니메이션 정리', date: '2026.06.24', assignee: 'Minjun Kim', assigneeInitials: 'MK' },
  { id: 'req-026', status: 'processing', title: '프로젝트 상태 뱃지 컬러 대비 향상', date: '2026.06.23', assignee: 'Seoyun Lee', assigneeInitials: 'SL' },
  { id: 'req-027', status: 'received', title: '고객사명 표기 방식 예외 처리 요청', date: '2026.06.22', assignee: 'Unassigned' },
  { id: 'req-028', status: 'completed', title: '다운로드 버튼 hover 효과 수정', date: '2026.06.21', assignee: 'Jiwon Park', assigneeInitials: 'JP' },
  { id: 'req-029', status: 'processing', title: '테이블 행 높이 통일 작업', date: '2026.06.20', assignee: 'Minjun Kim', assigneeInitials: 'MK' },
  { id: 'req-030', status: 'received', title: '상세페이지 빈 상태 문구 추가', date: '2026.06.19', assignee: 'Unassigned' },
]
