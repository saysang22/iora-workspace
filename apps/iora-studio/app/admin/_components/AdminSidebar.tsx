'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './AdminShell.module.scss'
import { ADMIN_NAV_ITEMS, getAdminDisplayName, type AdminShellProfile } from './admin-shell'

type AdminSidebarProps = {
  profile: AdminShellProfile
}

function isActiveItem(itemHref: string, currentPath: string) {
  if (itemHref === '/admin/dashboard') {
    return currentPath === '/admin' || currentPath === '/admin/dashboard'
  }

  return currentPath === itemHref || currentPath.startsWith(`${itemHref}/`)
}

export default function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()
  const displayName = getAdminDisplayName(profile)

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandBlock}>
        <strong className={styles.brandTitle}>Outsource Pro</strong>
        <p className={styles.brandCaption}>프리랜서 관리 시스템</p>
      </div>

      <nav className={styles.sideNav} aria-label='관리자 대시보드 메뉴'>
        {ADMIN_NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = isActiveItem(href, pathname)

          return (
            <Link
              key={href}
              className={`${styles.sideNavItem} ${isActive ? styles.sideNavItemActive : ''}`.trim()}
              href={href}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className={styles.profilePanel}>
        <div className={styles.profileAvatar} aria-hidden='true'>
          {displayName.slice(0, 1)}
        </div>
        <div className={styles.profileMeta}>
          <strong className={styles.profileName}>{displayName}</strong>
          <p className={styles.profileRole}>FREELANCER</p>
        </div>
      </div>
    </aside>
  )
}
