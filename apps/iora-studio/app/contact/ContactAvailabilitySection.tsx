'use client'

import { useState } from 'react'
import UserCalendar from '../_components/UserCalendar'
import styles from './ContactAvailabilitySection.module.scss'

export default function ContactAvailabilitySection() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className={styles.section} aria-label='이번 달 작업 가능 현황'>
      <button
        type='button'
        className={styles.toggleButton}
        aria-expanded={isOpen}
        aria-controls='contact-availability-panel'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden='true' />
          {isOpen ? '이번 달 작업 가능 현황 접기' : '이번 달 작업 가능 현황 보기'}
        </span>
        <span className={styles.chevron} aria-hidden='true' />
      </button>

      <div
        id='contact-availability-panel'
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        aria-hidden={!isOpen}
      >
        <div className={styles.panelInner}>
          <UserCalendar />
        </div>
      </div>
    </section>
  )
}
