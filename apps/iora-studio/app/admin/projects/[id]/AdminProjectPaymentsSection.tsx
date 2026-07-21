'use client'

import { Button, Input, SelectBox, Toast } from '@iora/ui'
import { useMemo, useState } from 'react'
import type { Tables } from '../../../../lib/database.types'
import { createBrowserSupabaseClient } from '../../../../lib/supabase'
import {
  formatAmountInput,
  INPUT_THEME,
  LIME_BUTTON_THEME,
  parseAmountInput,
  SECONDARY_BUTTON_THEME,
  SELECT_THEME,
} from '../AdminProjectCreateModal.shared'
import styles from './AdminProjectPaymentsSection.module.scss'

type PaymentRow = Tables<'payments'>

type AdminProjectPaymentsSectionProps = {
  initialPayments: PaymentRow[]
  projectId: string
}

const PAYMENT_TYPE_OPTIONS = [
  { label: '계약금', value: 'deposit' },
  { label: '중도금', value: 'interim' },
  { label: '잔금', value: 'final' },
  { label: '기타', value: 'other' },
] as const

function formatPaymentTypeLabel(value: PaymentRow['payment_type']) {
  return PAYMENT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? '기타'
}

function formatPaymentDate(value: string) {
  const [year, month, day] = value.split('-')

  if (!year || !month || !day) {
    return value
  }

  return `${year}.${month}.${day}`
}

function formatPaymentAmount(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

export default function AdminProjectPaymentsSection({
  initialPayments,
  projectId,
}: AdminProjectPaymentsSectionProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [payments, setPayments] = useState(initialPayments)
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState<PaymentRow['payment_type']>('deposit')
  const [paidAt, setPaidAt] = useState('')
  const [memo, setMemo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isToastVisible, setIsToastVisible] = useState(false)

  const parsedAmount = useMemo(() => parseAmountInput(amount), [amount])

  const handleSubmit = async () => {
    if (isSubmitting) {
      return
    }

    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMessage('입금 금액을 입력해 주세요.')
      return
    }

    if (!paidAt) {
      setErrorMessage('입금일을 선택해 주세요.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    const { data, error } = await supabase
      .from('payments')
      .insert({
        project_id: projectId,
        amount: parsedAmount,
        payment_type: paymentType,
        paid_at: paidAt,
        memo: memo.trim() || null,
      })
      .select('*')
      .single()

    if (error) {
      setErrorMessage(error.message || '입금 내역을 저장하지 못했습니다.')
      setIsSubmitting(false)
      return
    }

    setPayments((current) =>
      [data, ...current].sort((left, right) => right.paid_at.localeCompare(left.paid_at)),
    )
    setAmount('')
    setPaymentType('deposit')
    setPaidAt('')
    setMemo('')
    setIsSubmitting(false)
    setIsToastVisible(true)
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>입금 내역</h2>
          <p className={styles.sectionDescription}>프로젝트별 계약금, 중도금, 잔금 내역을 등록하고 추적합니다.</p>
        </div>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>입금 금액</span>
          <Input
            {...INPUT_THEME}
            className={styles.input}
            inputMode='numeric'
            placeholder='예: 1,500,000'
            value={amount}
            onChange={(event) => setAmount(formatAmountInput(event.target.value))}
          />
        </label>

        <label className={styles.field}>
          <span>구분</span>
          <SelectBox
            {...SELECT_THEME}
            className={styles.select}
            value={paymentType}
            options={PAYMENT_TYPE_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            onChange={(event) => setPaymentType(event.target.value as PaymentRow['payment_type'])}
          />
        </label>

        <label className={styles.field}>
          <span>입금일</span>
          <Input
            {...INPUT_THEME}
            className={styles.input}
            type='date'
            value={paidAt}
            onChange={(event) => setPaidAt(event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>메모</span>
          <Input
            {...INPUT_THEME}
            className={styles.input}
            placeholder='메모를 입력해 주세요.'
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
          />
        </label>
      </div>

      {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}

      <div className={styles.actions}>
        <Button
          {...SECONDARY_BUTTON_THEME}
          style={{ minHeight: '42px', minWidth: '96px' }}
          onClick={() => {
            setAmount('')
            setPaymentType('deposit')
            setPaidAt('')
            setMemo('')
            setErrorMessage(null)
          }}
        >
          초기화
        </Button>
        <Button
          {...LIME_BUTTON_THEME}
          style={{ minHeight: '42px', minWidth: '132px', opacity: isSubmitting ? 0.72 : 1 }}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting ? '저장 중...' : '입금 등록'}
        </Button>
      </div>

      <div className={styles.listSection}>
        {payments.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>구분</th>
                  <th>금액</th>
                  <th>입금일</th>
                  <th>메모</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatPaymentTypeLabel(payment.payment_type)}</td>
                    <td>{formatPaymentAmount(payment.amount)}</td>
                    <td>{formatPaymentDate(payment.paid_at)}</td>
                    <td>{payment.memo || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>등록된 입금 내역이 없습니다.</div>
        )}
      </div>

      <Toast
        visible={isToastVisible}
        title='입금 등록 완료'
        message='입금 내역이 저장되었습니다.'
        type='success'
        position='bottom-center'
        onClose={() => setIsToastVisible(false)}
      />
    </section>
  )
}
