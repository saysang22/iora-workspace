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
  return (
    <main className={styles.contact}>
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
