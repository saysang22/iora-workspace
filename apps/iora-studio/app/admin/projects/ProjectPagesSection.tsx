import { Input } from '@iora/ui'
import { DraftPage, INPUT_THEME } from './AdminProjectCreateModal.shared'
import ProjectPageComposer from './ProjectPageComposer'
import ProjectPageDeleteButton from './ProjectPageDeleteButton'
import styles from './AdminProjectCreateModal.module.scss'

type ProjectPagesSectionProps = {
  bulkPageNames: string
  draftPageName: string
  pages: DraftPage[]
  onAddPage: () => void
  onBulkAddPages: () => void
  onBulkPageNamesChange: (value: string) => void
  onDraftPageNameChange: (value: string) => void
  onPageDelete: (pageId: string) => void
  onPageNameChange: (pageId: string, pageName: string) => void
}

export default function ProjectPagesSection({
  bulkPageNames,
  draftPageName,
  pages,
  onAddPage,
  onBulkAddPages,
  onBulkPageNamesChange,
  onDraftPageNameChange,
  onPageDelete,
  onPageNameChange,
}: ProjectPagesSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>개발 페이지 리스트</h2>
        <p className={styles.sectionDescription}>
          프로젝트와 함께 초기 페이지 목록을 등록할 수 있습니다.
        </p>
      </div>

      <ProjectPageComposer
        allowBulk
        onAddPages={async (pageNames) => {
          if (pageNames.length === 1 && pageNames[0] === draftPageName.trim()) {
            onAddPage()
            return
          }

          onBulkPageNamesChange(pageNames.join('\n'))
          onBulkAddPages()
        }}
      />

      <div className={styles.pageList}>
        {pages.length === 0 ? (
          <p className={styles.emptyText}>등록된 페이지가 아직 없습니다.</p>
        ) : null}
        {pages.map((page, index) => (
          <div key={page.id} className={styles.pageItem}>
            <div className={styles.pageItemMeta}>
              <span className={styles.pageOrder}>{String(index + 1).padStart(2, '0')}</span>
              <Input
                {...INPUT_THEME}
                className={styles.pageItemInput}
                value={page.pageName}
                onChange={(event) => onPageNameChange(page.id, event.target.value)}
                placeholder='페이지명을 입력해 주세요'
              />
            </div>

            <div className={styles.pageItemActions}>
              <span className={styles.pageStatusBadge}>대기</span>
              <ProjectPageDeleteButton
                ariaLabel={`${page.pageName} 삭제`}
                onClick={() => onPageDelete(page.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
