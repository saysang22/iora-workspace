import Image from 'next/image'
import Link from 'next/link'
import styles from './Header.module.scss'

export type HeaderNavItem = {
  label: string
  href: string
  isButton?: boolean
}

type HeaderProps = {
  logo: string
  navItems: HeaderNavItem[]
}

export default function Header({ logo, navItems }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link className={styles.logoLink} href="/home" aria-label="IORA STUDIO 홈">
          <Image src={logo} alt="IORA STUDIO" width={172} height={96} priority />
        </Link>
        <nav className={styles.nav} aria-label="주요 메뉴">
          {navItems.map((item) => (
            <Link
              className={item.isButton ? styles.consultButton : undefined}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
