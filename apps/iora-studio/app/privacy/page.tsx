import type { Metadata } from 'next'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { readLegalDocument } from '../../lib/legal-documents'
import { createPageMetadata } from '../../lib/seo'
import styles from '../legal-page.module.scss'

export const metadata: Metadata = createPageMetadata({
  title: '개인정보처리방침',
  description: '이오라 스튜디오의 개인정보 수집, 이용, 보관, 파기 및 권리 보호 기준을 안내합니다.',
  path: '/privacy',
})

export default async function PrivacyPage() {
  const document = await readLegalDocument('개인정보처리방침.md')

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>PRIVACY POLICY</p>
          <h1 className={styles.title}>개인정보처리방침</h1>
          <p className={styles.description}>
            이오라 스튜디오가 서비스 이용 과정에서 처리하는 개인정보 기준과 이용자 권리를 안내합니다.
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
