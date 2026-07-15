import Link from 'next/link'
import { FiBell, FiHelpCircle, FiLogOut, FiPlus, FiSearch } from 'react-icons/fi'
import styles from './AdminShell.module.scss'

export default function AdminHeader() {
  return (
    <header className={styles.topbar}>
      <label className={styles.searchShell}>
        <FiSearch size={18} />
        <input type='search' placeholder='프로젝트, 고객사, 예약 검색...' aria-label='프로젝트, 고객사, 예약 검색' />
      </label>

      <div className={styles.topbarActions}>
        <button className={styles.iconButton} type='button' aria-label='알림'>
          <FiBell size={18} />
          <span className={styles.notificationDot} />
        </button>
        <button className={styles.iconButton} type='button' aria-label='도움말'>
          <FiHelpCircle size={20} />
        </button>
        <div className={styles.topbarDivider} />
        <Link href='/home' className={styles.secondaryButton}>
          <FiLogOut size={14} />
          <span>관리자페이지 나가기</span>
        </Link>
        <button className={styles.primaryButton} type='button'>
          <FiPlus size={14} />
          <span>새 프로젝트</span>
        </button>
      </div>
    </header>
  )
}
