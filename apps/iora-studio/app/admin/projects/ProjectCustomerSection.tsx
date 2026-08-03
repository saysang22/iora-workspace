import { Button, Input, Spinner } from '@iora/ui/server'
import { FiSearch, FiUser } from 'react-icons/fi'
import {
  getCustomerLabel,
  INPUT_THEME,
  type ProfileOption,
  type RegistrationMode,
  SECONDARY_BUTTON_THEME,
} from './AdminProjectCreateModal.shared'
import styles from './AdminProjectCreateModal.module.scss'

type ProjectCustomerSectionProps = {
  customerError: string | null
  customerSearch: string
  customers: ProfileOption[]
  guestClientName: string
  guestCompanyName: string
  isLoadingCustomers: boolean
  mode: RegistrationMode
  selectedCustomer: ProfileOption | null
  selectedCustomerId: string
  onGuestClientNameChange: (value: string) => void
  onGuestCompanyNameChange: (value: string) => void
  onCustomerSearchChange: (value: string) => void
  onCustomerSelect: (customerId: string) => void
  onModeChange: (mode: RegistrationMode) => void
}

export default function ProjectCustomerSection({
  customerError,
  customerSearch,
  customers,
  guestClientName,
  guestCompanyName,
  isLoadingCustomers,
  mode,
  selectedCustomer,
  selectedCustomerId,
  onGuestClientNameChange,
  onGuestCompanyNameChange,
  onCustomerSearchChange,
  onCustomerSelect,
  onModeChange,
}: ProjectCustomerSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>고객 정보</h2>
        <p className={styles.sectionDescription}>
          기존 회원 고객을 연결하거나, 비회원 고객 정보를 직접 입력해 프로젝트를 등록할 수 있습니다.
        </p>
      </div>

      <div className={styles.modeToggle} role='tablist' aria-label='고객 등록 방식 선택'>
        <Button
          {...SECONDARY_BUTTON_THEME}
          className={`${styles.modeButton} ${mode === 'member' ? styles.modeButtonActive : ''}`.trim()}
          style={{ minHeight: '44px' }}
          onClick={() => onModeChange('member')}
        >
          회원 고객
        </Button>
        <Button
          {...SECONDARY_BUTTON_THEME}
          className={`${styles.modeButton} ${mode === 'guest' ? styles.modeButtonActive : ''}`.trim()}
          style={{ minHeight: '44px' }}
          onClick={() => onModeChange('guest')}
        >
          비회원 등록
        </Button>
      </div>

      {mode === 'member' ? (
        <>
          <div className={styles.searchField}>
            <FiSearch size={16} />
            <Input
              {...INPUT_THEME}
              className={styles.searchInput}
              value={customerSearch}
              onChange={(event) => onCustomerSearchChange(event.target.value)}
              placeholder='이름 또는 이메일로 고객을 검색해 주세요'
            />
          </div>

          {selectedCustomer ? (
            <div className={styles.selectedCustomer}>
              <FiUser size={15} />
              <div>
                <strong>{getCustomerLabel(selectedCustomer)}</strong>
                <span>{selectedCustomer.email}</span>
              </div>
            </div>
          ) : null}

          <div className={styles.customerList} role='listbox' aria-label='회원 고객 목록'>
            {isLoadingCustomers ? (
              <div className={styles.customerListLoading}>
                <Spinner centered size={30} label='고객 목록을 불러오고 있어요' />
              </div>
            ) : null}

            {!isLoadingCustomers && customerError ? (
              <p className={styles.emptyText}>{customerError}</p>
            ) : null}

            {!isLoadingCustomers && !customerError && customers.length === 0 ? (
              <p className={styles.emptyText}>검색 결과와 일치하는 고객이 없습니다.</p>
            ) : null}

            {!isLoadingCustomers && !customerError
              ? customers.map((customer) => (
                  <Button
                    key={customer.id}
                    {...SECONDARY_BUTTON_THEME}
                    className={`${styles.customerButton} ${selectedCustomerId === customer.id ? styles.customerButtonActive : ''}`.trim()}
                    style={{ width: '100%', minHeight: '74px', justifyContent: 'space-between' }}
                    onClick={() => onCustomerSelect(customer.id)}
                  >
                    <div className={styles.customerMeta}>
                      <strong>
                        {getCustomerLabel(customer)}
                        {customer.is_admin ? ' · 관리자' : ''}
                      </strong>
                      <span>{customer.email}</span>
                    </div>
                    <span className={styles.customerCompany}>{customer.company_name || '개인 고객'}</span>
                  </Button>
                ))
              : null}
          </div>
        </>
      ) : (
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>업체명</span>
            <Input
              {...INPUT_THEME}
              className={styles.uiInput}
              value={guestCompanyName}
              onChange={(event) => onGuestCompanyNameChange(event.target.value)}
              placeholder='예: 이오라스튜디오'
            />
          </label>

          <label className={styles.field}>
            <span>클라이언트 이름</span>
            <Input
              {...INPUT_THEME}
              className={styles.uiInput}
              value={guestClientName}
              onChange={(event) => onGuestClientNameChange(event.target.value)}
              placeholder='예: 김민서'
            />
          </label>
        </div>
      )}
    </section>
  )
}
