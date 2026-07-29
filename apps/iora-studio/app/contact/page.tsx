import type { Metadata } from 'next'
import ContactFormClient from './ContactFormClient'
import {
  formatPhoneNumber,
  INITIAL_FORM_VALUES,
  isValidEmail,
  isValidPhoneNumber,
  isValidUrl,
  normalizePhoneNumber,
  type ContactFormValues,
  validateContactForm,
} from './contactForm.shared'
import styles from './ContactPageLayout.module.scss'
import { createPageMetadata } from '../../lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: '문의',
  description:
    '웹사이트 제작, 유지보수, 프로젝트 상담이 필요하다면 이오라 스튜디오 문의 페이지에서 일정과 요청 내용을 남겨주세요.',
  path: '/contact',
})

export {
  formatPhoneNumber,
  INITIAL_FORM_VALUES,
  isValidEmail,
  isValidPhoneNumber,
  isValidUrl,
  normalizePhoneNumber,
  validateContactForm,
}

export type { ContactFormValues }

export default function ContactPage() {
  const contactPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: '이오라 스튜디오 문의',
    url: 'https://www.iora-studio.com/contact',
    description:
      '웹사이트 제작, 유지보수, 프로젝트 상담 문의를 접수하는 이오라 스튜디오 문의 페이지',
  }

  return (
    <main className={styles.contact}>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      <section className={styles.hero} aria-labelledby="contact-title">
        <h1 id="contact-title">상담 신청</h1>
        <p>영업일 기준 24시간 이내에 답변 드립니다.</p>
        <strong className={styles.statusBadge}>
          <span aria-hidden="true" />
          이번 달 예약 가능
        </strong>
      </section>

      <section className={styles.formCard} aria-label="상담 신청 양식">
        <ContactFormClient />
      </section>
    </main>
  )
}
