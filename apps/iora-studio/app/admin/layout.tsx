import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminHeader from './_components/AdminHeader'
import AdminSidebar from './_components/AdminSidebar'
import styles from './_components/AdminShell.module.scss'
import { createServerSupabaseClient } from '../../lib/supabase-server'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerStore = await headers()
  const currentPath = headerStore.get('x-iora-pathname') ?? '/admin/dashboard'
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/signin?next=${encodeURIComponent(currentPath)}`)
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('email, full_name, company_name, is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!currentProfile?.is_admin) {
    redirect('/home')
  }

  return (
    <main className={styles.page}>
      <AdminSidebar profile={currentProfile} />
      <section className={styles.dashboard}>
        <AdminHeader />
        {children}
      </section>
    </main>
  )
}
