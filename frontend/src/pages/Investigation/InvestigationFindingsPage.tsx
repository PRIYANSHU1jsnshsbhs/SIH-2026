import { Link, useParams } from 'react-router-dom'
import { useInvestigationFindings, useInvestigationStatus, useAllInvestigations } from '@/hooks/useInvestigation'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { RiskBadge } from '@/components/risk/RiskBadge'
import { ConfidenceBadge } from '@/components/entity/ConfidenceBadge'
import { AddressDisplay } from '@/components/wallet/AddressDisplay'
import { BackButton } from '@/components/common/BackButton'
import { NearestVaspCard } from '@/components/investigation/NearestVaspCard'

export function InvestigationFindingsPage() {
  const { investigationId } = useParams<{ investigationId: string }>()
  const status = useInvestigationStatus(investigationId)
  const isComplete = status.data?.status === 'completed'
  const findings = useInvestigationFindings(investigationId, isComplete)

  const allInvestigations = useAllInvestigations()
  const chain = allInvestigations.data?.find(i => i.investigation_id === investigationId)?.chain ?? ''

  if (status.isLoading) return <LoadingState />
  if (status.isError) return <ErrorState message={status.error instanceof Error ? status.error.message : 'Could not load investigation.'} onRetry={() => status.refetch()} />
  if (status.data?.status === 'failed') {
    return <ErrorState message={status.data.error || 'Investigation failed — no failure reason provided.'} />
  }
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between border-b border-border-c pb-3">
        <div>
          <BackButton fallback="/explorer" />
          <h1 className="text-xl font-bold text-text-primary mt-2">Investigation Findings</h1>
          <p className="text-xs text-text-secondary font-mono mt-1">Trace ID: {investigationId}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/investigations/${investigationId}/graph`}
            className="text-sm font-medium px-4 py-2 rounded-md bg-surface-1 text-text-primary border border-border-strong hover:bg-surface-2 transition-colors shadow-sm"
          >
            Open in Graph
          </Link>
          <Link
            to={`/reports/new?investigation_id=${investigationId}`}
            className="text-sm font-medium px-4 py-2 rounded-md bg-saffron text-white hover:bg-accent-strong transition-colors shadow-sm"
          >
            Generate Report
          </Link>
        </div>
      </div>

      {findings.isLoading && <LoadingState />}
      {findings.isError && (
        <ErrorState
          message={findings.error instanceof Error ? findings.error.message : 'Could not load investigation findings.'}
          onRetry={() => findings.refetch()}
        />
      )}
      {findings.data && findings.data.findings.length === 0 && !findings.data.nearest_vasp && (
        <EmptyState title="No findings detected for this investigation." description="The completed trace did not match any configured rule." />
      )}

      {findings.data?.nearest_vasp && (
        <div className="mb-8">
          <NearestVaspCard 
            vasp={findings.data.nearest_vasp} 
            chain={chain} 
            investigationId={investigationId!} 
            caseId={allInvestigations.data?.find(i => i.investigation_id === investigationId)?.case_id || ''}
          />
        </div>
      )}

      <div className="space-y-4">
        {findings.data?.findings.map((f) => (
          <div key={f.id} className="rounded-lg bg-surface-1 p-5 space-y-4 border border-border-c shadow-sm hover:border-red-soft transition-colors">
            <div className="flex items-center justify-between border-b border-border-c pb-3">
              <RiskBadge level={f.severity === 'critical' ? 'high' : f.severity} />
              {f.confidence != null && <ConfidenceBadge value={f.confidence} />}
            </div>
            {f.title && <h2 className="text-base font-bold text-text-primary">{f.title}</h2>}
            <p className="text-sm font-medium text-text-primary leading-relaxed">{f.description}</p>
            {f.wallet && <div className="flex items-center justify-between text-sm text-text-secondary pt-2">
              <span className="flex items-center gap-2">
                <span className="font-semibold">Wallet:</span>
                <AddressDisplay chain={chain} address={f.wallet} />
              </span>
              <Link to={`/investigations/${investigationId}/graph`} className="text-saffron hover:underline underline-offset-2 font-medium">
                Open in Graph →
              </Link>
            </div>}
            {f.evidence && <div className="bg-bg-app rounded-md p-3 border border-border-c">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Evidence</p>
              <p className="text-xs text-text-primary font-mono">{f.evidence}</p>
            </div>}
          </div>
        ))}
      </div>
    </div>
  )
}
