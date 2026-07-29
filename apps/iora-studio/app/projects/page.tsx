import type { Metadata } from 'next'
import ProjectStatusClient from '../_components/ProjectStatusClient'
import styles from './page.module.scss'
import { NO_INDEX_METADATA } from '../../lib/seo'

export const metadata: Metadata = NO_INDEX_METADATA

export default function ProjectsPage() {
  return (
    <main className={styles.projectsPage}>
      <div className={styles.projectsInner}>
        <ProjectStatusClient />
      </div>
    </main>
  )
}
