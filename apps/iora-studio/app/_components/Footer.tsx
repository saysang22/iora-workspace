import Image from 'next/image'
import Link from 'next/link'
import styles from './Footer.module.scss'

export type FooterLink = {
  href: string
  label: string
}

export type FooterGroup = {
  title: string
  links: FooterLink[]
}

type FooterProps = {
  businessAddress: string
  businessNumber: string
  groups: FooterGroup[]
  logo: string
  phone: string
  phoneHref: string
  representativeName: string
}

export default function Footer({
  businessAddress,
  businessNumber,
  groups,
  logo,
  phone,
  phoneHref,
  representativeName,
}: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerInfo}>
          <div className={styles.footerBrand}>
            <Image src={logo} alt='IORA STUDIO' width={229} height={128} />
            <p>AI 기반 프리미엄 웹개발 스튜디오. 기술의 정교함과 브랜드의 미학이 만나는 지점을 연구합니다.</p>
          </div>

          <dl className={styles.businessInfo}>
            <div>
              <dt>대표자</dt>
              <dd>{representativeName}</dd>
            </div>
            <div>
              <dt>사업자번호</dt>
              <dd>{businessNumber}</dd>
            </div>
            <div>
              <dt>대표 연락처</dt>
              <dd>
                <a href={phoneHref}>{phone}</a>
              </dd>
            </div>
            <div>
              <dt>주소</dt>
              <dd>{businessAddress}</dd>
            </div>
          </dl>
        </div>

        <nav className={styles.footerNav} aria-label='푸터 메뉴'>
          {groups.map((group) => (
            <section key={group.title}>
              <h2>{group.title}</h2>
              {group.links.map((link) => (
                <Link href={link.href} key={`${group.title}-${link.href}`}>
                  {link.label}
                </Link>
              ))}
            </section>
          ))}
        </nav>
      </div>
      <p className={styles.copyright}>© 2026 IORA STUDIO. All rights reserved.</p>
    </footer>
  )
}
