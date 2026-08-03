'use client'

import { Table } from '@iora/ui/server'
import {
  HOMEPAGE_OPTION_ROWS,
  HOMEPAGE_PACKAGE_ROWS,
  WEBSERVICE_PACKAGE_ROWS,
} from './servicePricing.shared'
import styles from './page.module.scss'

type ServiceTablesProps = {
  variant: 'homepage' | 'options' | 'webservice'
}

const TABLE_THEME = {
  thColor: '#97a8c3',
  thBackground: 'rgb(28 41 67 / 0.72)',
  tdColor: '#f8fafc',
  tdBackground: 'rgb(20 31 53 / 0.96)',
  borderColor: 'rgb(148 163 184 / 0.08)',
  headerPadding: '18px 20px',
  cellPadding: '18px 20px',
  thFontSize: '14px',
  tdFontSize: '15px',
  thFontWeight: '600',
  rowHoverBackground: 'rgb(24 38 63 / 0.96)',
} as const

const PACKAGE_COLUMNS = [
  { key: 'name', header: '상품명' },
  { key: 'price', header: '가격', align: 'center' as const },
  { key: 'scope', header: '포함 범위' },
  { key: 'duration', header: '제작 기간', align: 'center' as const },
]

const OPTION_COLUMNS = [
  { key: 'option', header: '옵션' },
  { key: 'price', header: '추가 비용', align: 'center' as const },
  { key: 'description', header: '설명' },
]

const homepageRows = HOMEPAGE_PACKAGE_ROWS.map((row) => ({
  name: <strong className={styles.productName}>{row.name}</strong>,
  price: <span className={styles.priceValue}>{row.price}</span>,
  scope: <span className={styles.scopeText}>{row.scope}</span>,
  duration: <span className={styles.durationValue}>{row.duration}</span>,
}))

const optionRows = HOMEPAGE_OPTION_ROWS.map((row) => ({
  option: <strong className={styles.optionName}>{row.option}</strong>,
  price: <span className={styles.optionPrice}>{row.price}</span>,
  description: row.description === '-' ? <span className={styles.optionEmpty}>-</span> : <span className={styles.scopeText}>{row.description}</span>,
}))

const webserviceRows = WEBSERVICE_PACKAGE_ROWS.map((row) => ({
  name: <strong className={styles.productName}>{row.name}</strong>,
  price: <span className={styles.priceValue}>{row.price}</span>,
  scope: <span className={styles.scopeText}>{row.scope}</span>,
  duration: <span className={styles.durationValue}>{row.duration}</span>,
}))

export default function ServiceTables({ variant }: ServiceTablesProps) {
  if (variant === 'options') {
    return (
      <div className={`${styles.tableShell} ${styles.optionTableShell}`.trim()}>
        <Table columns={OPTION_COLUMNS} rows={optionRows} mobileCard minWidth='100%' {...TABLE_THEME} />
      </div>
    )
  }

  return (
    <div className={styles.tableShell}>
      <Table
        columns={PACKAGE_COLUMNS}
        rows={variant === 'homepage' ? homepageRows : webserviceRows}
        mobileCard
        minWidth='100%'
        {...TABLE_THEME}
      />
    </div>
  )
}
