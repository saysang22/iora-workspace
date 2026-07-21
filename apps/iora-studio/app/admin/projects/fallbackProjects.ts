import { getProjectDetail, PROJECT_LIST } from './mockProjects'
import type { AdminProjectDetail, AdminProjectListItem, AdminProjectStats } from '../../../lib/projects'

function toIsoDate(value: string) {
  if (value === '미정' || value === '상시') {
    return null
  }

  return value.replace(/\./g, '-')
}

export function getFallbackAdminProjects() {
  const items: AdminProjectListItem[] = PROJECT_LIST.map((project) => ({
    id: project.id,
    companyName: project.companyName,
    companyCode: project.companyCode,
    projectName: project.projectName,
    projectType: 'member',
    status: project.status,
    startDate: project.startDate,
    dueDate: project.dueDate,
    startedAtValue: toIsoDate(project.startDate) ?? '',
    deadlineValue: toIsoDate(project.dueDate),
    careEndedAtValue: null,
    totalAmountValue: null,
    depositAmountValue: null,
  }))

  const stats: AdminProjectStats = {
    all: items.length,
    active: items.filter((item) => item.status !== '유지보수').length,
    deadline: items.filter((item) => item.dueDate !== '상시' && item.dueDate !== '미정').length,
    done: items.filter((item) => item.status === '배포').length,
  }

  return { items, stats }
}

export function getFallbackAdminProjectDetail(projectId: string): AdminProjectDetail {
  const project = getProjectDetail(projectId)

  return {
    id: project.id,
    title: project.title,
    statusLabel: project.statusLabel,
    clientName: project.clientName,
    contact: project.contact,
    totalAmount: project.budget,
    depositAmount: '미정',
    deadline: project.deadline,
    progress: project.progress,
    startedAt: '미정',
    careEndedAt: '미정',
    pages: [],
    currentStage: 'development',
  }
}

export function isMissingProjectsTableError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'PGRST205'
  )
}
