import { FiCheck, FiClock, FiLoader } from 'react-icons/fi'
import styles from './ProjectStatusFlow.module.scss'

export type ProjectStatusFlowStepState = 'done' | 'active' | 'pending'

export type ProjectStatusFlowStep = {
  id: string
  label: string
  labelEn?: string
  state: ProjectStatusFlowStepState
}

type ProjectStatusFlowProps = {
  eyebrow?: string
  title: string
  steps: ProjectStatusFlowStep[]
  deadlineLabel?: string
  deadlineValue?: string
}

export default function ProjectStatusFlow({
  eyebrow = 'Project Flow',
  title,
  steps,
  deadlineLabel,
  deadlineValue,
}: ProjectStatusFlowProps) {
  return (
    <section className={styles.stepperSection} aria-labelledby='project-flow-title'>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.sectionEyebrow}>{eyebrow}</p>
          <h2 className={styles.sectionTitle} id='project-flow-title'>
            {title}
          </h2>
        </div>

        {deadlineValue ? (
          <div className={styles.deadlineBlock}>
            <span className={styles.deadlineLabel}>{deadlineLabel ?? '마감일'}</span>
            <strong className={styles.deadlineValue}>{deadlineValue}</strong>
          </div>
        ) : null}
      </div>

      <ol className={styles.stepperList}>
        {steps.map((step) => (
          <li
            key={step.id}
            className={[
              styles.stepItem,
              step.state === 'done' ? styles.stepDone : '',
              step.state === 'active' ? styles.stepActive : '',
              step.state === 'pending' ? styles.stepPending : '',
            ].join(' ')}
          >
            <span className={styles.stepIcon} aria-hidden='true'>
              {step.state === 'done' ? (
                <FiCheck size={16} />
              ) : step.state === 'active' ? (
                <FiLoader size={16} />
              ) : (
                <FiClock size={16} />
              )}
            </span>
            <div className={styles.stepText}>
              <strong>{step.label}</strong>
              {step.labelEn ? <span>{step.labelEn}</span> : null}
            </div>
            {step.state === 'active' ? <span className={styles.activeBadge}>진행 중</span> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
