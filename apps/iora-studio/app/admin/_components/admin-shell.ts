import type { IconType } from 'react-icons'
import { FiBookOpen, FiCalendar, FiFolder, FiGrid, FiImage, FiSettings } from 'react-icons/fi'

export type AdminShellProfile = {
  email: string
  full_name: string | null
  company_name: string | null
}

export type AdminNavItem = {
  href: string
  icon: IconType
  label: string
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin/dashboard', icon: FiGrid, label: '대시보드' },
  { href: '/admin/projects', icon: FiFolder, label: '프로젝트 관리' },
  { href: '/admin/reservations', icon: FiCalendar, label: '예약 관리' },
  { href: '/admin/maintenance', icon: FiBookOpen, label: '유지보수' },
  { href: '/admin/portfolio', icon: FiImage, label: '포트폴리오' },
  { href: '/admin/settings', icon: FiSettings, label: '설정' },
]

export function getAdminDisplayName(profile: AdminShellProfile) {
  return profile.full_name || profile.company_name || profile.email
}
