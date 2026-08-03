import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminHeader from './_components/AdminHeader'
import AdminSidebar from './_components/AdminSidebar'
import styles from './_components/AdminShell.module.scss'
import { ADMIN_PATHNAME_HEADER, getCachedAdminRequestState } from '../../lib/admin-auth'
import { NO_INDEX_METADATA } from '../../lib/seo'

export const metadata: Metadata = NO_INDEX_METADATA

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerStore = await headers()
  const currentPath = headerStore.get(ADMIN_PATHNAME_HEADER) ?? '/admin/dashboard'
  const { profile, user } = await getCachedAdminRequestState()

  if (!user) {
    redirect(`/signin?next=${encodeURIComponent(currentPath)}`)
  }

  if (!profile?.is_admin) {
    redirect('/home')
  }

  return (
    <main className={styles.page}>
      <AdminSidebar profile={profile} />
      <section className={styles.dashboard}>
        <AdminHeader currentPath={currentPath} />
        <div className={styles.contentFrame}>
          <div className={styles.contentInner}>{children}</div>
        </div>
      </section>
    </main>
  )
}
