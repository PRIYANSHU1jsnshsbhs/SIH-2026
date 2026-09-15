import { Link, useParams } from 'react-router-dom'
import { useInvestigationFindings, useInvestigationStatus } from '@/hooks/useInvestigation'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { RiskBadge } from '@/components/risk/RiskBadge'
import { ConfidenceBadge } from '@/components/entity/ConfidenceBadge'
import { AddressDisplay } from '@/components/wallet/AddressDisplay'
import { BackButton } from '@/components/common/BackButton'

export function InvestigationFindingsPage() {
  const { investigationId } = useParams<{ investigationId: string }>()
  const status = useInvestigationStatus(investigationId)
  const isComplete = status.data?.status === 'completed'
  const findings = useInvestigationFindings(investigationId, isComplete)

  if (status.isLoading) return <LoadingState />
  if (status.isError) return <ErrorState message="Could not load investigation." />
  if (!isComplete) {
    return (
      <div className="space-y-3">
        <BackButton fallback="/explorer" />
        <p className="text-sm text-text-secondary">Findings appear once this investigation completes.</p>
        <Link to={`/investigations/${investigationId}/progress`} className="text-sm text-accent hover:underline underline-offset-2">
          View progress →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <BackButton fallback="/explorer" />
          <h1 className="text-lg font-semibold text-text-primary mt-1">Investigation Findings</h1>
          <p className="text-xs text-text-tertiary font-mono">{investigationId}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/investigations/${investigationId}/graph`}
            className="text-xs px-3 py-1.5 rounded-md bg-surface-2 text-text-primary hover:brightness-125"
          >
            Open in Graph
          </Link>
          <Link
            to={`/reports/new?investigation_id=${investigationId}`}
            className="text-xs px-3 py-1.5 rounded-md bg-btn-bg text-btn-fg hover:bg-accent-strong"
          >
            Generate Report
          </Link>
        </div>
      </div>

      {findings.isLoading && <LoadingState />}
      {findings.data && findings.data.findings.length === 0 && (
        <EmptyState title="No findings surfaced" description="The traced graph did not match any known risk patterns." />
      )}

      <div className="space-y-3">
        {findings.data?.findings.map((f) => (
          <div key={f.id} className="rounded-lg bg-surface-1 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <RiskBadge level={f.severity} />
              <ConfidenceBadge value={f.confidence} />
            </div>
            <p className="text-sm text-text-primary">{f.description}</p>
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span>
                Wallet: <AddressDisplay chain="ethereum" address={f.wallet} />
              </span>
              <Link to={`/investigations/${investigationId}/graph`} className="text-accent hover:underline underline-offset-2">
                Open in Graph →
              </Link>
            </div>
            <p className="text-xs text-text-tertiary">Evidence: {f.evidence}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
