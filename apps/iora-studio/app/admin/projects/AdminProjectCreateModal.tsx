'use client'

import { Modal } from '@iora/ui'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '../../../lib/supabase'
import ProjectCustomerSection from './ProjectCustomerSection'
import ProjectDatePickerModal from './ProjectDatePickerModal'
import ProjectDetailsSection from './ProjectDetailsSection'
import ProjectPagesSection from './ProjectPagesSection'
import {
  createDraftPage,
  DatePickerField,
  DraftPage,
  getTodayDate,
  LIME_BUTTON_THEME,
  ProfileOption,
  RegistrationMode,
  SECONDARY_BUTTON_THEME,
} from './AdminProjectCreateModal.shared'
import styles from './AdminProjectCreateModal.module.scss'

type AdminProjectCreateModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function AdminProjectCreateModal({ isOpen, onClose }: AdminProjectCreateModalProps) {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [customers, setCustomers] = useState<ProfileOption[]>([])
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>('member')
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [guestCompanyName, setGuestCompanyName] = useState('')
  const [guestClientName, setGuestClientName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [startedAt, setStartedAt] = useState(getTodayDate)
  const [careEndedAt, setCareEndedAt] = useState('')
  const [draftPageName, setDraftPageName] = useState('')
  const [bulkPageNames, setBulkPageNames] = useState('')
  const [pages, setPages] = useState<DraftPage[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [customerError, setCustomerError] = useState<string | null>(null)
  const [datePickerField, setDatePickerField] = useState<DatePickerField>(null)

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? null
  const filteredCustomers = useMemo(() => {
    const keyword = customerSearch.trim().toLowerCase()

    if (!keyword) {
      return customers
    }

    return customers.filter((customer) =>
      [customer.full_name, customer.email, customer.company_name]
        .filter(Boolean)
        .some((fieldValue) => fieldValue!.toLowerCase().includes(keyword)),
    )
  }, [customerSearch, customers])

  const activeDateValue =
    datePickerField === 'startedAt' ? startedAt : datePickerField === 'careEndedAt' ? careEndedAt : ''

  const resetForm = () => {
    setRegistrationMode('member')
    setCustomerSearch('')
    setSelectedCustomerId('')
    setGuestCompanyName('')
    setGuestClientName('')
    setProjectName('')
    setStartedAt(getTodayDate())
    setCareEndedAt('')
    setDraftPageName('')
    setBulkPageNames('')
    setPages([])
    setIsSubmitting(false)
    setSubmitError(null)
    setCustomerError(null)
    setDatePickerField(null)
  }

  const handleClose = () => {
    if (isSubmitting) {
      return
    }

    resetForm()
    onClose()
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let isMounted = true

    const loadCustomers = async () => {
      setIsLoadingCustomers(true)
      setCustomerError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, company_name, is_admin')
        .order('created_at', { ascending: false })

      if (!isMounted) {
        return
      }

      if (error) {
        setCustomerError('고객 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
        setCustomers([])
        setIsLoadingCustomers(false)
        return
      }

      setCustomers(data ?? [])
      setIsLoadingCustomers(false)
    }

    void loadCustomers()

    return () => {
      isMounted = false
    }
  }, [isOpen, supabase])

  const handleAddPage = () => {
    const normalizedName = draftPageName.trim()

    if (!normalizedName) {
      return
    }

    setPages((current) => [...current, createDraftPage(normalizedName, current.length)])
    setDraftPageName('')
  }

  const handleBulkAddPages = () => {
    const normalizedNames = bulkPageNames
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(Boolean)

    if (!normalizedNames.length) {
      return
    }

    setPages((current) => [
      ...current,
      ...normalizedNames.map((name, index) => createDraftPage(name, current.length + index)),
    ])
    setBulkPageNames('')
  }

  const handleSubmit = async () => {
    if (isSubmitting) {
      return
    }

    if (!projectName.trim()) {
      setSubmitError('프로젝트명을 입력해 주세요.')
      return
    }

    if (registrationMode === 'member' && !selectedCustomerId) {
      setSubmitError('회원 연결 모드에서는 고객 계정을 선택해 주세요.')
      return
    }

    if (registrationMode === 'guest' && !guestCompanyName.trim()) {
      setSubmitError('비회원 등록 모드에서는 업체명을 입력해 주세요.')
      return
    }

    if (registrationMode === 'guest' && !guestClientName.trim()) {
      setSubmitError('비회원 등록 모드에서는 클라이언트 이름을 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const { error } = await supabase.rpc('create_project_with_pages', {
      input_project_name: projectName.trim(),
      input_user_id: registrationMode === 'member' ? selectedCustomerId : null,
      input_company_name: registrationMode === 'guest' ? guestCompanyName.trim() : null,
      input_client_name: registrationMode === 'guest' ? guestClientName.trim() : null,
      input_current_stage: 'analysis',
      input_progress_percent: 0,
      input_started_at: startedAt,
      input_care_ended_at: careEndedAt || null,
      input_pages: pages.map((page, index) => ({
        page_name: page.pageName.trim(),
        status: 'pending',
        sort_order: index,
      })),
    })

    if (error) {
      setSubmitError(error.message || '프로젝트 등록 중 오류가 발생했습니다.')
      setIsSubmitting(false)
      return
    }

    handleClose()
    router.refresh()
  }

  return (
    <div className={styles.modalShell}>
      <Modal
        isOpen={isOpen}
        title='새 프로젝트 등록'
        width='min(100%, 840px)'
        background='#101010'
        confirmLabel={isSubmitting ? '등록 중...' : '등록'}
        cancelLabel='닫기'
        closeOnOverlayClick={!isSubmitting}
        onConfirm={() => void handleSubmit()}
        onClose={handleClose}
        titleStyle={{
          color: '#f8fafc',
          fontSize: '18px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
        cancelButtonProps={{
          ...SECONDARY_BUTTON_THEME,
          style: { minHeight: '42px', fontWeight: 700 },
        }}
        confirmButtonProps={{
          ...LIME_BUTTON_THEME,
          style: {
            minHeight: '42px',
            fontWeight: 800,
            opacity: isSubmitting ? 0.72 : 1,
          },
        }}
      >
        <div className={styles.body}>
          {submitError ? <p className={styles.errorBanner}>{submitError}</p> : null}

          <ProjectCustomerSection
            customerError={customerError}
            customerSearch={customerSearch}
            customers={filteredCustomers}
            guestClientName={guestClientName}
            guestCompanyName={guestCompanyName}
            isLoadingCustomers={isLoadingCustomers}
            mode={registrationMode}
            selectedCustomer={selectedCustomer}
            selectedCustomerId={selectedCustomerId}
            onGuestClientNameChange={setGuestClientName}
            onGuestCompanyNameChange={setGuestCompanyName}
            onCustomerSearchChange={setCustomerSearch}
            onCustomerSelect={setSelectedCustomerId}
            onModeChange={(nextMode) => {
              setRegistrationMode(nextMode)
              setSubmitError(null)
            }}
          />

          <ProjectDetailsSection
            careEndedAt={careEndedAt}
            projectName={projectName}
            startedAt={startedAt}
            onCareEndedAtClear={() => setCareEndedAt('')}
            onDatePickerOpen={setDatePickerField}
            onProjectNameChange={setProjectName}
          />

          <ProjectPagesSection
            bulkPageNames={bulkPageNames}
            draftPageName={draftPageName}
            pages={pages}
            onAddPage={handleAddPage}
            onBulkAddPages={handleBulkAddPages}
            onBulkPageNamesChange={setBulkPageNames}
            onDraftPageNameChange={setDraftPageName}
            onPageDelete={(pageId) => {
              setPages((current) => current.filter((item) => item.id !== pageId))
            }}
            onPageNameChange={(pageId, pageName) => {
              setPages((current) =>
                current.map((item) => (item.id === pageId ? { ...item, pageName } : item)),
              )
            }}
          />
        </div>
      </Modal>

      <ProjectDatePickerModal
        key={`${datePickerField ?? 'closed'}-${activeDateValue}`}
        isOpen={datePickerField !== null}
        title={datePickerField === 'careEndedAt' ? '유지보수 종료일 선택' : '시작일 선택'}
        value={activeDateValue}
        onClose={() => setDatePickerField(null)}
        onApply={(nextValue) => {
          if (datePickerField === 'careEndedAt') {
            setCareEndedAt(nextValue)
          } else {
            setStartedAt(nextValue)
          }

          setDatePickerField(null)
        }}
      />
    </div>
  )
}
