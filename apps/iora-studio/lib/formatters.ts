export function formatDisplayDate(value: string | null | undefined, emptyLabel = '미정') {
  if (!value) {
    return emptyLabel
  }

  const normalized = value.trim()

  if (!normalized) {
    return emptyLabel
  }

  const plainDateMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (plainDateMatch) {
    return `${plainDateMatch[1]}.${plainDateMatch[2]}.${plainDateMatch[3]}`
  }

  const parsedDate = new Date(normalized)

  if (Number.isNaN(parsedDate.getTime())) {
    return normalized
  }

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

export function formatCurrency(value: number | null | undefined, emptyLabel = '미정') {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return emptyLabel
  }

  return `${value.toLocaleString('ko-KR')}원`
}

export function formatMetricValue(value: number, minLength = 2) {
  return String(value).padStart(minLength, '0')
}

export function formatRelativeTime(value: string) {
  const now = new Date()
  const target = new Date(value)

  if (Number.isNaN(target.getTime())) {
    return value
  }

  const diffMs = target.getTime() - now.getTime()
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' })

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)

  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)

  if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, 'day')
  }

  return formatDisplayDate(value, value)
}

export function getDeadlineDiffDays(deadline: string, baseDate = new Date()) {
  const todayStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())
  const [year, month, day] = deadline.split('-').map(Number)
  const deadlineDate = new Date(year, month - 1, day)
  const diffMs = deadlineDate.getTime() - todayStart.getTime()

  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

export function formatDeadlineLabel(diffDays: number) {
  if (diffDays === 0) {
    return 'D-DAY'
  }

  if (diffDays > 0) {
    return `D-${diffDays}`
  }

  return `D+${Math.abs(diffDays)}`
}
