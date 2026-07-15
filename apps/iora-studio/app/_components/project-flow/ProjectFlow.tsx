import styles from './ProjectFlow.module.scss'

export type ProjectFlowStep = {
  id: string
  label: string
  state: 'done' | 'current' | 'upcoming'
}

type ProjectFlowProps = {
  steps: ProjectFlowStep[]
  progress?: number
  title?: string
  progressLabel?: string
  helperText?: string
}

export default function ProjectFlow({
  steps,
  progress,
  title = '진행 상태',
  progressLabel,
  helperText,
}: ProjectFlowProps) {
  const resolvedProgressLabel =
    progressLabel ?? (typeof progress === 'number' ? `${progress}% Completed` : undefined)

  return (
    <section className={styles.panel} aria-label={title || 'Project flow'}>
      {title || resolvedProgressLabel ? (
        <div className={styles.header}>
          {title ? <h2 className={styles.title}>{title}</h2> : <span />}
          {resolvedProgressLabel ? <strong className={styles.progressValue}>{resolvedProgressLabel}</strong> : null}
        </div>
      ) : null}

      {typeof progress === 'number' ? (
        <div className={styles.progressBar} aria-hidden='true'>
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <div className={styles.steps}>
        {steps.map((step) => (
          <div key={step.id} className={styles.step}>
            <span
              className={`${styles.dot} ${
                step.state === 'done' ? styles.dotDone : step.state === 'current' ? styles.dotCurrent : styles.dotUpcoming
              }`.trim()}
            />
            <div className={styles.textBlock}>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          </div>
        ))}
      </div>

      {helperText ? <p className={styles.helperText}>{helperText}</p> : null}
    </section>
  )
}
