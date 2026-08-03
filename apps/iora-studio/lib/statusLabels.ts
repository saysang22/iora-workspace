import type { Database } from './database.types'

export type ProjectPageProgressStatus = 'done' | 'active' | 'pending'

export const CONTACT_REQUEST_STATUS_LABELS: Record<
  Database['public']['Enums']['contact_request_status'],
  string
> = {
  pending: '대기',
  confirmed: '확정',
  rejected: '반려',
}

export const PROJECT_MODIFICATION_STATUS_LABELS: Record<
  Database['public']['Enums']['project_modification_request_status'],
  string
> = {
  pending: '대기',
  review: '검토 중',
  in_progress: '진행 중',
  completed: '완료',
}

export const PROJECT_PAGE_PROGRESS_STATUS_LABELS: Record<ProjectPageProgressStatus, string> = {
  done: '완료',
  active: '진행 중',
  pending: '대기',
}

export const PROJECT_PAGE_STATUS_LABELS: Record<Database['public']['Enums']['page_status'], string> = {
  pending: '대기',
  in_progress: '진행 중',
  completed: '완료',
}
