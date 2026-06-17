import styles from './page.module.scss'

type SelectOption = {
  label: string
  value: string
}

type FieldLabelProps = {
  htmlFor: string
  label: string
  required?: boolean
}

const SERVICE_OPTIONS: SelectOption[] = [
  { label: '기업 홈페이지', value: 'company-homepage' },
]

const BUDGET_OPTIONS: SelectOption[] = [
  { label: '100-300만원', value: '100-300' },
]

const TONE_OPTIONS: SelectOption[] = [
  { label: 'Dark (다크)', value: 'dark' },
]

function FieldLabel({ htmlFor, label, required }: FieldLabelProps) {
  return (
    <label className={styles.fieldLabel} htmlFor={htmlFor}>
      {label}
      {required ? <span aria-hidden="true"> *</span> : null}
    </label>
  )
}

export default function ContactPage() {
  return (
    <main className={styles.contact}>
      <section className={styles.hero} aria-labelledby="contact-title">
        <h1 id="contact-title">상담 신청</h1>
        <p>영업일 기준 24시간 이내에 답변 드립니다.</p>
        <strong className={styles.statusBadge}>
          <span aria-hidden="true" />
          이번 달 예약 가능
        </strong>
      </section>

      <section className={styles.formCard} aria-label="상담 신청 양식">
        <form className={styles.form}>
          <fieldset className={styles.fieldset}>
            <FieldLabel htmlFor="serviceType" label="서비스 종류" required />
            <select className={styles.selectControl} id="serviceType" name="serviceType" defaultValue={SERVICE_OPTIONS[0].value}>
              {SERVICE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <FieldLabel htmlFor="budgetRange" label="예산 범위" required />
            <select className={styles.selectControl} id="budgetRange" name="budgetRange" defaultValue={BUDGET_OPTIONS[0].value}>
              {BUDGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </fieldset>

          <section className={styles.fieldRow} aria-label="일정 정보">
            <fieldset className={styles.fieldset}>
              <FieldLabel htmlFor="deadline" label="희망 마감일" required />
              <span className={styles.iconField}>
                <input
                  className={styles.inputControl}
                  id="deadline"
                  name="deadline"
                  placeholder="연도-월-일"
                  type="text"
                />
                <span aria-hidden="true" className={styles.calendarIcon} />
              </span>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <FieldLabel htmlFor="zoomMeetingAt" label="Zoom 미팅 희망 일시" required />
              <span className={styles.iconField}>
                <input
                  className={styles.inputControl}
                  id="zoomMeetingAt"
                  name="zoomMeetingAt"
                  placeholder="연도-월-일 --:--"
                  type="text"
                />
                <span aria-hidden="true" className={styles.calendarIcon} />
              </span>
            </fieldset>
          </section>

          <fieldset className={styles.fieldset}>
            <FieldLabel htmlFor="referenceSite" label="참고 사이트" />
            <input
              className={styles.inputControl}
              id="referenceSite"
              name="referenceSite"
              placeholder="참고하고 싶은 사이트 URL을 입력해주세요."
              type="url"
            />
          </fieldset>

          <fieldset className={styles.fieldset}>
            <FieldLabel htmlFor="backgroundTone" label="선호하는 배경 톤" />
            <select className={styles.selectControl} id="backgroundTone" name="backgroundTone" defaultValue={TONE_OPTIONS[0].value}>
              {TONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <FieldLabel htmlFor="pointColor" label="선호하는 포인트 색상" />
            <input
              className={styles.inputControl}
              id="pointColor"
              name="pointColor"
              placeholder="예: 일렉트릭 라임, 블루, 오렌지 등"
              type="text"
            />
          </fieldset>

          <fieldset className={styles.fieldset}>
            <FieldLabel htmlFor="requestDetails" label="요청 내용" required />
            <textarea
              id="requestDetails"
              name="requestDetails"
              placeholder="프로젝트의 목적과 필수 기능에 대해 설명해주세요."
              rows={6}
            />
          </fieldset>

          <button className={styles.submitButton} type="button">
            상담 신청하기
            <span aria-hidden="true">→</span>
          </button>

          <hr className={styles.divider} />

          <section className={styles.chatBlock} aria-label="실시간 채팅 문의">
            <p>또는 실시간 채팅으로 상담이 필요하신가요?</p>
            <a href="#kakao-chat">
              카카오톡으로 빠르게 문의하기
              <span aria-hidden="true" />
            </a>
          </section>
        </form>
      </section>
    </main>
  )
}
