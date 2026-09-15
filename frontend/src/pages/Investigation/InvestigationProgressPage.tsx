import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInvestigationStatus } from '@/hooks/useInvestigation'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { InvestigationProgress } from '@/components/investigation/InvestigationProgress'
import { BackButton } from '@/components/common/BackButton'

export function InvestigationProgressPage() {
  const { investigationId } = useParams<{ investigationId: string }>()
  const status = useInvestigationStatus(investigationId)
  const navigate = useNavigate()

  useEffect(() => {
    if (status.data?.status === 'completed') {
      const t = setTimeout(() => navigate(`/investigations/${investigationId}/graph`), 600)
      return () => clearTimeout(t)
    }
  }, [status.data?.status, investigationId, navigate])

  if (status.isLoading) return <LoadingState label="Fetching investigation status…" />
  if (status.isError || !status.data) return <ErrorState message="Could not load investigation status." />

  return (
    <div className="max-w-lg space-y-6">
      <BackButton fallback="/cases" />
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Investigation Running</h1>
        <p className="text-xs text-text-tertiary font-mono">{investigationId}</p>
      </div>
      <div className="rounded-lg bg-surface-1 p-6">
        <InvestigationProgress status={status.data} />
      </div>
      {status.data.status === 'completed' && (
        <p className="text-sm text-text-secondary">Completed — opening the investigation graph…</p>
      )}
    </div>
  )
}
