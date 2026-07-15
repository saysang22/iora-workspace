import { redirect } from 'next/navigation'
import ProjectRequestClient from './ProjectRequestClient'
import styles from './page.module.scss'
import { createServerSupabaseClient } from '../../../lib/supabase-server'

export default async function ProjectRequestPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/signin?next=${encodeURIComponent('/projects/request')}`)
  }

  const clientName =
    typeof user.user_metadata?.company_name === 'string' && user.user_metadata.company_name.trim()
      ? user.user_metadata.company_name.trim()
      : user.email ?? 'CLIENT'

  return (
    <main className={styles.requestPage}>
      <div className={styles.requestInner}>
        <ProjectRequestClient clientName={clientName} />
      </div>
    </main>
  )
}
