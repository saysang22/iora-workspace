import AdminPageHeader from './AdminPageHeader'
import styles from './AdminPlaceholder.module.scss'

type AdminPlaceholderProps = {
  description?: string
  eyebrow?: string
  title: string
}

export default function AdminPlaceholder({
  description = '관리자 설정과 운영 기준을 이 영역에서 정리합니다.',
  eyebrow = 'SETTINGS',
  title,
}: AdminPlaceholderProps) {
  return (
    <div className={styles.content}>
      <AdminPageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
    </div>
  )
}
