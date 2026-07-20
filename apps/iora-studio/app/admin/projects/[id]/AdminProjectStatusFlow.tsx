'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '../../../../lib/supabase'
import ProjectStatusFlow, {
  buildProjectFlowSteps,
  type ProjectFlowStageKey,
} from '../../../_components/project-status-flow/ProjectStatusFlow'
import styles from './page.module.scss'

type AdminProjectStatusFlowProps = {
  deadlineValue: string
  projectId: string
  currentStage: ProjectFlowStageKey
}

export default function AdminProjectStatusFlow({
  deadlineValue,
  projectId,
  currentStage,
}: AdminProjectStatusFlowProps) {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [stage, setStage] = useState<ProjectFlowStageKey>(currentStage)
  const [isUpdating, setIsUpdating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const steps = useMemo(() => buildProjectFlowSteps(stage), [stage])

  const handleStageChange = async (stepId: string) => {
    const nextStage = stepId as ProjectFlowStageKey

    if (isUpdating || nextStage === stage) {
      return
    }

    setIsUpdating(true)
    setErrorMessage(null)

    const previousStage = stage
    setStage(nextStage)

    const { error } = await supabase.from('projects').update({ current_stage: nextStage }).eq('id', projectId)

    if (error) {
      setStage(previousStage)
      setErrorMessage('진행 단계를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
      setIsUpdating(false)
      return
    }

    router.refresh()
    setIsUpdating(false)
  }

  return (
    <div className={styles.flowSection}>
      <ProjectStatusFlow
        title='프로젝트 진행 단계'
        steps={steps}
        deadlineValue={deadlineValue}
        tone='admin'
        editable
        isUpdating={isUpdating}
        onStepClick={handleStageChange}
      />
      {errorMessage ? <p className={styles.flowError}>{errorMessage}</p> : null}
    </div>
  )
}
