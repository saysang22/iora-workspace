import type { Database } from '../../../lib/database.types'

export type ProjectStage = Database['public']['Enums']['project_stage']
export type PageStatus = Database['public']['Enums']['page_status']
export type DatePickerField = 'startedAt' | 'careEndedAt' | null
export type RegistrationMode = 'member' | 'guest'

export type ProfileOption = {
  id: string
  full_name: string | null
  email: string
  company_name: string | null
  is_admin: boolean
}

export type DraftPage = {
  id: string
  pageName: string
  status: PageStatus
}

export const INPUT_THEME = {
  fontSize: '15px',
  background: '#0b1423',
  textColor: '#f8fafc',
  round: '14px',
  padding: '0 14px',
  focusBorderColor: '#c8f135',
}

export const SELECT_THEME = {
  fontSize: '15px',
  background: '#0b1423',
  textColor: '#f8fafc',
  round: '14px',
  padding: '0 14px',
  focusBorderColor: '#c8f135',
}

export const SECONDARY_BUTTON_THEME = {
  size: '14px',
  background: '#182338',
  textColor: '#dce6f7',
  borderColor: 'rgb(148 163 184 / 0.16)',
  hoverBackground: '#223149',
  hoverTextColor: '#ffffff',
  hoverBorderColor: 'rgb(148 163 184 / 0.28)',
  round: '14px',
  padding: '0 18px',
}

export const PRIMARY_BUTTON_THEME = {
  size: '14px',
  background: '#ff2d7a',
  textColor: '#ffffff',
  borderColor: '#ff2d7a',
  hoverBackground: '#ff4f9f',
  hoverTextColor: '#ffffff',
  hoverBorderColor: '#ff4f9f',
  round: '14px',
  padding: '0 18px',
}

export const LIME_BUTTON_THEME = {
  size: '14px',
  background: '#c8f135',
  textColor: '#172100',
  borderColor: '#c8f135',
  hoverBackground: '#d6fb55',
  hoverTextColor: '#172100',
  hoverBorderColor: '#d6fb55',
  round: '14px',
  padding: '0 22px',
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

export function getCustomerLabel(profile: ProfileOption) {
  return profile.company_name || profile.full_name || profile.email
}

export function createDraftPage(pageName: string, seed: number): DraftPage {
  return {
    id: `${Date.now()}-${seed}`,
    pageName,
    status: 'pending',
  }
}

export function formatDisplayDate(value: string) {
  if (!value) {
    return ''
  }

  const [year, month, day] = value.split('-')

  if (!year || !month || !day) {
    return value
  }

  return `${year}.${month}.${day}`
}

export function getInitialDateSelection(value: string) {
  if (!value) {
    return null
  }

  return { dateKey: value }
}

export function getCalendarMonth(selection: { dateKey: string } | null) {
  if (!selection) {
    const today = new Date()

    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    }
  }

  const [year, month] = selection.dateKey.split('-').map(Number)

  return { year, month }
}
