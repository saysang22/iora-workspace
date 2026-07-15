import styles from './AdminPlaceholder.module.scss'

type AdminPlaceholderProps = {
  title: string
}

export default function AdminPlaceholder({ title }: AdminPlaceholderProps) {
  return (
    <div className={styles.content}>
      <h1 className={styles.title}>{title}</h1>
    </div>
  )
}
