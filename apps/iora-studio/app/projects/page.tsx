import ProjectStatusClient from '../_components/ProjectStatusClient'
import styles from './page.module.scss'

export default function ProjectsPage() {
  return (
    <main className={styles.projectsPage}>
      <div className={styles.projectsInner}>
        <ProjectStatusClient />
      </div>
    </main>
  )
}
