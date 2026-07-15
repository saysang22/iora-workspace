import ProjectsListClient from './ProjectsListClient'
import { createServerSupabaseClient } from '../../../lib/supabase-server'
import { listAdminProjects } from '../../../lib/projects'
import { getFallbackAdminProjects, isMissingProjectsTableError } from './fallbackProjects'

export default async function AdminProjectsPage() {
  const supabase = await createServerSupabaseClient()
  let items
  let stats

  try {
    const response = await listAdminProjects(supabase)
    items = response.items
    stats = response.stats
  } catch (error) {
    if (!isMissingProjectsTableError(error)) {
      throw error
    }

    const fallback = getFallbackAdminProjects()
    items = fallback.items
    stats = fallback.stats
  }

  return <ProjectsListClient projects={items} stats={stats} />
}
