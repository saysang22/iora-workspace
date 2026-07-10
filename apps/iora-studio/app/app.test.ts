import { describe, expect, it } from 'vitest'
import {
  INITIAL_FORM_VALUES,
  formatPhoneNumber,
  isValidEmail,
  isValidPhoneNumber,
  isValidUrl,
  validateContactForm,
} from './contact/page'

describe('contact form utils', () => {
  it('전화번호를 입력 중 형식에 맞게 정리한다', () => {
    expect(formatPhoneNumber('01012341234')).toBe('010-1234-1234')
    expect(formatPhoneNumber('0101234567')).toBe('010-123-4567')
    expect(formatPhoneNumber('010-12ab34-5678')).toBe('010-1234-5678')
  })

  it('이메일, 전화번호, URL 형식을 검증한다', () => {
    expect(isValidEmail('hello@example.com')).toBe(true)
    expect(isValidEmail('broken-email')).toBe(false)

    expect(isValidPhoneNumber('010-1234-5678')).toBe(true)
    expect(isValidPhoneNumber('01012345678')).toBe(true)
    expect(isValidPhoneNumber('02-123-4567')).toBe(false)

    expect(isValidUrl('https://iora.studio')).toBe(true)
    expect(isValidUrl('notaurl')).toBe(false)
  })

  it('필수값 누락과 형식 오류를 함께 반환한다', () => {
    const errors = validateContactForm({
      ...INITIAL_FORM_VALUES,
      email: 'wrong',
      phone: '123',
      referenceSite: 'invalid-url',
    })

    expect(errors.name).toBe('필수 입력 항목입니다.')
    expect(errors.serviceType).toBe('필수 입력 항목입니다.')
    expect(errors.email).toBe('이메일 형식을 확인해주세요.')
    expect(errors.phone).toBe('전화번호 형식을 확인해주세요.')
    expect(errors.referenceSite).toBe('URL 형식을 확인해주세요.')
  })

  it('유효한 값이면 오류가 없다', () => {
    const errors = validateContactForm({
      name: '홍길동',
      email: 'hello@example.com',
      phone: '010-1234-5678',
      serviceType: 'company-homepage',
      budgetRange: '100-300',
      deadline: '2026-08-01',
      zoomMeetingAt: '2026-08-01T10:30',
      referenceSite: 'https://iora.studio',
      backgroundTone: 'dark',
      pointColor: 'lime',
      requestDetails: '브랜드 사이트 제작 문의입니다.',
    })

    expect(errors).toEqual({})
  })
})
