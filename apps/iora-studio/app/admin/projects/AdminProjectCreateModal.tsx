'use client'

import { Modal } from '@iora/ui'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import type { AdminProjectListItem } from '../../../lib/projects'
import { createBrowserSupabaseClient } from '../../../lib/supabase'
import ProjectCustomerSection from './ProjectCustomerSection'
import ProjectDatePickerModal from './ProjectDatePickerModal'
import ProjectDetailsSection from './ProjectDetailsSection'
import ProjectPagesSection from './ProjectPagesSection'
import {
  createDraftPage,
  DatePickerField,
  DraftPage,
  formatAmountInput,
  getTodayDate,
  LIME_BUTTON_THEME,
  parseAmountInput,
  ProfileOption,
  RegistrationMode,
  SECONDARY_BUTTON_THEME,
} from './AdminProjectCreateModal.shared'
import styles from './AdminProjectCreateModal.module.scss'

type AdminProjectCreateModalProps = {
  isOpen: boolean
  mode?: 'create' | 'edit'
  initialProject?: Pick<
    AdminProjectListItem,
    | 'id'
    | 'projectName'
    | 'startedAtValue'
    | 'deadlineValue'
    | 'careEndedAtValue'
    | 'totalAmountValue'
    | 'depositAmountValue'
  > | null
  onClose: () => void
  onSaveComplete?: (payload: {
    careEndedAt: string | null
    deadline: string | null
    depositAmount: number | null
    id: string
    projectName: string
    startedAt: string
    totalAmount: number | null
  }) => void
  onSaveFailed?: (message: string) => void
}

const projectCreateSchema = z
  .object({
    depositAmount: z.number().nullable(),
    guestClientName: z.string(),
    guestCompanyName: z.string(),
    projectName: z.string().trim().min(1, '프로젝트명을 입력해 주세요.'),
    registrationMode: z.enum(['member', 'guest']),
    selectedCustomerId: z.string(),
    totalAmount: z.number().nullable(),
  })
  .superRefine((value, context) => {
    if (value.registrationMode === 'member' && !value.selectedCustomerId.trim()) {
      context.addIssue({
        code: 'custom',
        message: '회원 연결 모드에서는 고객 계정을 선택해 주세요.',
        path: ['selectedCustomerId'],
      })
    }

    if (value.registrationMode === 'guest' && !value.guestCompanyName.trim()) {
      context.addIssue({
        code: 'custom',
        message: '비회원 등록 모드에서는 업체명을 입력해 주세요.',
        path: ['guestCompanyName'],
      })
    }

    if (value.registrationMode === 'guest' && !value.guestClientName.trim()) {
      context.addIssue({
        code: 'custom',
        message: '비회원 등록 모드에서는 클라이언트 이름을 입력해 주세요.',
        path: ['guestClientName'],
      })
    }

    if (
      value.totalAmount !== null &&
      value.depositAmount !== null &&
      value.depositAmount > value.totalAmount
    ) {
      context.addIssue({
        code: 'custom',
        message: '계약금은 총 금액을 초과할 수 없습니다.',
        path: ['depositAmount'],
      })
    }
  })

export default function AdminProjectCreateModal({
  isOpen,
  mode = 'create',
  initialProject = null,
  onClose,
  onSaveComplete,
  onSaveFailed,
}: AdminProjectCreateModalProps) {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [customers, setCustomers] = useState<ProfileOption[]>([])
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>('member')
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [guestCompanyName, setGuestCompanyName] = useState('')
  const [guestClientName, setGuestClientName] = useState('')
  const [projectName, setProjectName] = useState(initialProject?.projectName ?? '')
  const [startedAt, setStartedAt] = useState(initialProject?.startedAtValue ?? getTodayDate())
  const [deadline, setDeadline] = useState(initialProject?.deadlineValue ?? '')
  const [careEndedAt, setCareEndedAt] = useState(initialProject?.careEndedAtValue ?? '')
  const [totalAmount, setTotalAmount] = useState(
    initialProject?.totalAmountValue !== null && initialProject?.totalAmountValue !== undefined
      ? formatAmountInput(String(initialProject.totalAmountValue))
      : '',
  )
  const [depositAmount, setDepositAmount] = useState(
    initialProject?.depositAmountValue !== null && initialProject?.depositAmountValue !== undefined
      ? formatAmountInput(String(initialProject.depositAmountValue))
      : '',
  )
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
    datePickerField === 'startedAt'
      ? startedAt
      : datePickerField === 'deadline'
        ? deadline
        : datePickerField === 'careEndedAt'
          ? careEndedAt
          : ''

  const parsedTotalAmount = useMemo(() => parseAmountInput(totalAmount), [totalAmount])
  const parsedDepositAmount = useMemo(() => parseAmountInput(depositAmount), [depositAmount])
  const amountError =
    parsedTotalAmount !== null &&
    parsedDepositAmount !== null &&
    parsedDepositAmount > parsedTotalAmount
      ? '계약금은 총 금액을 초과할 수 없습니다.'
      : null

  const handleClose = () => {
    if (isSubmitting) {
      return
    }

    onClose()
  }

  useEffect(() => {
    if (!isOpen || mode !== 'create') {
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
  }, [isOpen, mode, supabase])

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

    if (mode === 'create') {
      const validation = projectCreateSchema.safeParse({
        depositAmount: parsedDepositAmount,
        guestClientName,
        guestCompanyName,
        projectName,
        registrationMode,
        selectedCustomerId,
        totalAmount: parsedTotalAmount,
      })

      if (!validation.success) {
        setSubmitError(validation.error.issues[0]?.message ?? '입력값을 다시 확인해 주세요.')
        return
      }
    } else if (!initialProject) {
      setSubmitError('수정할 프로젝트 정보를 찾지 못했습니다.')
      return
    } else if (!projectName.trim()) {
      setSubmitError('프로젝트명을 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    if (mode === 'edit' && initialProject) {
      const { data, error } = await supabase
        .from('projects')
        .update({
          project_name: projectName.trim(),
          started_at: startedAt,
          deadline: deadline || null,
          care_ended_at: careEndedAt || null,
          total_amount: parsedTotalAmount,
          deposit_amount: parsedDepositAmount,
        })
        .eq('id', initialProject.id)
        .select(
          'id, project_name, started_at, deadline, care_ended_at, total_amount, deposit_amount',
        )
        .single()

      if (error) {
        const message = error.message || '프로젝트 수정 중 오류가 발생했습니다.'
        setSubmitError(message)
        onSaveFailed?.(message)
        setIsSubmitting(false)
        return
      }

      onSaveComplete?.({
        id: data.id,
        projectName: data.project_name,
        startedAt: data.started_at,
        deadline: data.deadline,
        careEndedAt: data.care_ended_at,
        totalAmount: data.total_amount,
        depositAmount: data.deposit_amount,
      })
      onClose()
      router.refresh()
      return
    }

    const { data, error } = await supabase.rpc('create_project_with_pages', {
      input_project_name: projectName.trim(),
      input_user_id: registrationMode === 'member' ? selectedCustomerId : null,
      input_company_name: registrationMode === 'guest' ? guestCompanyName.trim() : null,
      input_client_name: registrationMode === 'guest' ? guestClientName.trim() : null,
      input_current_stage: 'analysis',
      input_progress_percent: 0,
      input_started_at: startedAt,
      input_deadline: deadline || null,
      input_care_ended_at: careEndedAt || null,
      input_total_amount: parsedTotalAmount,
      input_deposit_amount: parsedDepositAmount,
      input_pages: pages.map((page, index) => ({
        page_name: page.pageName.trim(),
        status: 'pending',
        sort_order: index,
      })),
    })

    if (error) {
      const message = error.message || '프로젝트 등록 중 오류가 발생했습니다.'
      setSubmitError(message)
      onSaveFailed?.(message)
      setIsSubmitting(false)
      return
    }

    onSaveComplete?.({
      id: data,
      projectName: projectName.trim(),
      startedAt,
      deadline: deadline || null,
      careEndedAt: careEndedAt || null,
      totalAmount: parsedTotalAmount,
      depositAmount: parsedDepositAmount,
    })
    onClose()
    router.refresh()
  }

  return (
    <div className={styles.modalShell}>
      <Modal
        isOpen={isOpen}
        title={mode === 'edit' ? '프로젝트 수정' : '새 프로젝트 등록'}
        width='min(100%, 840px)'
        background='#101010'
        confirmLabel={isSubmitting ? (mode === 'edit' ? '수정 중...' : '등록 중...') : mode === 'edit' ? '수정완료' : '등록'}
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

          {mode === 'create' ? (
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
          ) : null}

          <ProjectDetailsSection
            careEndedAt={careEndedAt}
            deadline={deadline}
            depositAmount={depositAmount}
            projectName={projectName}
            startedAt={startedAt}
            totalAmount={totalAmount}
            amountError={amountError}
            onCareEndedAtClear={() => setCareEndedAt('')}
            onDeadlineClear={() => setDeadline('')}
            onDatePickerOpen={setDatePickerField}
            onDepositAmountChange={(value) => setDepositAmount(formatAmountInput(value))}
            onProjectNameChange={setProjectName}
            onTotalAmountChange={(value) => setTotalAmount(formatAmountInput(value))}
          />

          {mode === 'create' ? (
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
          ) : null}
        </div>
      </Modal>

      <ProjectDatePickerModal
        key={`${datePickerField ?? 'closed'}-${activeDateValue}`}
        isOpen={datePickerField !== null}
        title={
          datePickerField === 'careEndedAt'
            ? '유지보수 종료일 선택'
            : datePickerField === 'deadline'
              ? '프로젝트 마감일 선택'
              : '시작일 선택'
        }
        value={activeDateValue}
        onClose={() => setDatePickerField(null)}
        onApply={(nextValue) => {
          if (datePickerField === 'careEndedAt') {
            setCareEndedAt(nextValue)
          } else if (datePickerField === 'deadline') {
            setDeadline(nextValue)
          } else {
            setStartedAt(nextValue)
          }

          setDatePickerField(null)
        }}
      />
    </div>
  )
}
