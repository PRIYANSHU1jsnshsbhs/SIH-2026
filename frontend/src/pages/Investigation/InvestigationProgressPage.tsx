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
  if (status.isError || !status.data) {
    return <ErrorState message={status.error instanceof Error ? status.error.message : 'Could not load investigation status.'} onRetry={() => status.refetch()} />
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex flex-col gap-1">
        <BackButton fallback="/cases" />
        <h1 className="text-2xl font-bold text-text-primary mt-2">Investigation Progress</h1>
        <p className="text-sm text-text-secondary font-mono mt-1">Trace ID: {investigationId}</p>
      </div>
      <div className="rounded-lg bg-surface-1 p-8 border border-border-c shadow-sm">
        <InvestigationProgress status={status.data} />
      </div>
      {status.data.status === 'completed' && (
        <p className="text-sm font-medium text-text-secondary text-center">Completed — opening the investigation graph…</p>
      )}
    </div>
  )
}
