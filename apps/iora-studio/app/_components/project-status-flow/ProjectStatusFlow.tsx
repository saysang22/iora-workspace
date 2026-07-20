'use client'

import { FiCheck, FiClock, FiLoader } from 'react-icons/fi'
import type { Database } from '../../../lib/database.types'
import styles from './ProjectStatusFlow.module.scss'

export type ProjectFlowStageKey = Database['public']['Enums']['project_stage']
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
  tone?: 'default' | 'admin'
  editable?: boolean
  isUpdating?: boolean
  onStepClick?: (stepId: string) => void
}

export const PROJECT_FLOW_STAGES: Array<{
  key: ProjectFlowStageKey
  label: string
  labelEn: string
}> = [
  { key: 'analysis', label: '상담 및 분석', labelEn: 'ANALYSIS' },
  { key: 'planning', label: '기획', labelEn: 'PLANNING' },
  { key: 'development', label: '개발', labelEn: 'DEVELOPMENT' },
  { key: 'qa', label: '검수', labelEn: 'QA' },
  { key: 'launch', label: '배포', labelEn: 'LAUNCH' },
  { key: 'care', label: '유지보수', labelEn: 'CARE' },
  { key: 'completed', label: '계약 완료', labelEn: 'FINAL' },
]

export function buildProjectFlowSteps(currentStage: ProjectFlowStageKey): ProjectStatusFlowStep[] {
  const currentIndex = PROJECT_FLOW_STAGES.findIndex((stage) => stage.key === currentStage)

  return PROJECT_FLOW_STAGES.map((stage, index) => ({
    id: stage.key,
    label: stage.label,
    labelEn: stage.labelEn,
    state: index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'pending',
  }))
}

export default function ProjectStatusFlow({
  eyebrow = 'PROJECT FLOW',
  title,
  steps,
  deadlineLabel,
  deadlineValue,
  tone = 'default',
  editable = false,
  isUpdating = false,
  onStepClick,
}: ProjectStatusFlowProps) {
  return (
    <section
      className={`${styles.stepperSection} ${tone === 'admin' ? styles.stepperSectionAdmin : ''}`.trim()}
      aria-labelledby='project-flow-title'
    >
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
        {steps.map((step) => {
          const isClickable = editable && typeof onStepClick === 'function'

          return (
            <li
              key={step.id}
              className={[
                styles.stepItem,
                step.state === 'done' ? styles.stepDone : '',
                step.state === 'active' ? styles.stepActive : '',
                step.state === 'pending' ? styles.stepPending : '',
                isClickable ? styles.stepItemEditable : '',
              ].join(' ')}
            >
              <button
                type='button'
                className={styles.stepButton}
                onClick={() => {
                  if (!isClickable || isUpdating) {
                    return
                  }

                  onStepClick(step.id)
                }}
                disabled={!isClickable || isUpdating}
                aria-pressed={step.state === 'active'}
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
                {step.state === 'active' ? (
                  <span className={styles.activeBadge}>{isUpdating ? '저장 중' : '진행 중'}</span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
