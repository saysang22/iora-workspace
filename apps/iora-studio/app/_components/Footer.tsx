import Image from 'next/image'
import Link from 'next/link'
import styles from './Footer.module.scss'

export type FooterGroup = {
  title: string
  links: string[]
}

type FooterProps = {
  logo: string
  groups: FooterGroup[]
}

export default function Footer({ logo, groups }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <Image src={logo} alt="IORA STUDIO" width={229} height={128} />
          <p>AI 기반 프리미엄 웹 개발 스튜디오. 기술의 정교함과 디자인의 미학이 만나는 지점을 탐구합니다.</p>
        </div>
        <nav className={styles.footerNav} aria-label="푸터 메뉴">
          {groups.map((group) => (
            <section key={group.title}>
              <h2>{group.title}</h2>
              {group.links.map((link) => (
                <Link href="#" key={link}>{link}</Link>
              ))}
            </section>
          ))}
        </nav>
      </div>
      <p className={styles.copyright}>© 2024 IORA STUDIO. All rights reserved.</p>
    </footer>
  )
}
