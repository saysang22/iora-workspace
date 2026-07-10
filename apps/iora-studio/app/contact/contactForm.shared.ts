export const SERVICE_OPTIONS = [
  { label: '기업 홈페이지', value: 'company-homepage' },
  { label: '브랜드 랜딩 페이지', value: 'brand-landing-page' },
  { label: '이커머스 구축', value: 'ecommerce' },
  { label: '운영 및 리뉴얼', value: 'maintenance' },
] as const

export const BUDGET_OPTIONS = [
  { label: '100만원 미만', value: 'under-100' },
  { label: '100-300만원', value: '100-300' },
  { label: '300-700만원', value: '300-700' },
  { label: '700만원 이상', value: 'over-700' },
] as const

export const TONE_OPTIONS = [
  { label: 'Dark (다크)', value: 'dark' },
  { label: 'Neutral (뉴트럴)', value: 'neutral' },
  { label: 'Bold (강한 대비)', value: 'bold' },
] as const

export type ContactFormValues = {
  name: string
  email: string
  phone: string
  serviceType: string
  budgetRange: string
  deadline: string
  zoomMeetingAt: string
  referenceSite: string
  backgroundTone: string
  pointColor: string
  requestDetails: string
}

type ContactFormField = keyof ContactFormValues
type ContactFormErrors = Partial<Record<ContactFormField, string>>

export const INITIAL_FORM_VALUES: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  serviceType: '',
  budgetRange: '',
  deadline: '',
  zoomMeetingAt: '',
  referenceSite: '',
  backgroundTone: '',
  pointColor: '',
  requestDetails: '',
}

const REQUIRED_FIELDS: Record<ContactFormField, boolean> = {
  name: true,
  email: true,
  phone: true,
  serviceType: true,
  budgetRange: false,
  deadline: true,
  zoomMeetingAt: true,
  referenceSite: false,
  backgroundTone: false,
  pointColor: false,
  requestDetails: true,
}

export function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
}

export function formatPhoneNumber(value: string) {
  const digits = normalizePhoneNumber(value)

  if (digits.length < 4) {
    return digits
  }

  if (digits.length < 8) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  if (digits.length < 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidPhoneNumber(value: string) {
  return /^01[0-9]-?\d{3,4}-?\d{4}$/.test(value)
}

export function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateContactForm(values: ContactFormValues) {
  const errors: ContactFormErrors = {}

  ;(Object.keys(values) as ContactFormField[]).forEach((field) => {
    if (!REQUIRED_FIELDS[field]) {
      return
    }

    if (!values[field].trim()) {
      errors[field] = '필수 입력 항목입니다.'
    }
  })

  if (values.email.trim() && !isValidEmail(values.email.trim())) {
    errors.email = '이메일 형식을 확인해주세요.'
  }

  if (values.phone.trim() && !isValidPhoneNumber(values.phone.trim())) {
    errors.phone = '전화번호 형식을 확인해주세요.'
  }

  if (values.referenceSite.trim() && !isValidUrl(values.referenceSite.trim())) {
    errors.referenceSite = 'URL 형식을 확인해주세요.'
  }

  return errors
}
