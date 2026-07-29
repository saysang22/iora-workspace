import type { Metadata } from 'next'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { readLegalDocument } from '../../lib/legal-documents'
import { createPageMetadata } from '../../lib/seo'
import styles from '../legal-page.module.scss'

export const metadata: Metadata = createPageMetadata({
  title: '이용약관',
  description: '이오라 스튜디오 웹사이트 및 관련 서비스 이용에 관한 약관을 안내합니다.',
  path: '/terms',
})

export default async function TermsPage() {
  const document = await readLegalDocument('이용약관.md')

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>TERMS OF SERVICE</p>
          <h1 className={styles.title}>이용약관</h1>
          <p className={styles.description}>
            이오라 스튜디오 웹사이트와 관련 서비스 이용 시 적용되는 기본 약관을 안내합니다.
          </p>
          <div className={styles.meta}>
            <span className={styles.metaLabel}>시행일</span>
            <span>{document.effectiveDateLabel ?? '부칙에 기재된 시행일을 확인해 주세요.'}</span>
          </div>
        </section>

        <article className={styles.contentCard}>
          <div className={styles.markdown}>
            <Markdown remarkPlugins={[remarkGfm]}>{document.content}</Markdown>
          </div>
        </article>
      </div>
    </main>
  )
}
