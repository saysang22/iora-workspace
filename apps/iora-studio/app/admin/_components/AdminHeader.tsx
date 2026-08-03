import Link from 'next/link'
import { FiBell, FiHelpCircle, FiLogOut, FiPlus } from 'react-icons/fi'
import AdminHeaderSearch from './AdminHeaderSearch'
import styles from './AdminShell.module.scss'

type AdminHeaderProps = {
  currentPath: string
}

export default function AdminHeader({ currentPath }: AdminHeaderProps) {
  return (
    <header className={styles.topbar}>
      <AdminHeaderSearch key={currentPath} />

      <div className={styles.topbarActions}>
        <button className={styles.iconButton} type='button' aria-label='알림'>
          <FiBell size={18} />
          <span className={styles.notificationDot} />
        </button>
        <button className={styles.iconButton} type='button' aria-label='도움말'>
          <FiHelpCircle size={20} />
        </button>
        <div className={styles.topbarDivider} />
        <Link href='/' className={styles.secondaryButton}>
          <FiLogOut size={14} />
          <span>관리자 페이지 나가기</span>
        </Link>
        <button className={styles.primaryButton} type='button'>
          <FiPlus size={14} />
          <span>새 프로젝트</span>
        </button>
      </div>
    </header>
  )
}
