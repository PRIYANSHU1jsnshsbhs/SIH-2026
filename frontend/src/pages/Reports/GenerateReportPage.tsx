import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCreateReport } from '@/hooks/useReports'
import { useAllInvestigations } from '@/hooks/useInvestigation'
import type { ReportInclude } from '@/schemas/reports'
import { BackButton } from '@/components/common/BackButton'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { LoadingIcon } from '@/components/common/LoadingIcon'
import { EmptyState } from '@/components/common/EmptyState'

const SECTION_LABELS: Record<keyof ReportInclude, string> = {
  transactions: 'Transaction history',
  graph: 'Investigation graph',
  entity_attribution: 'Entity attribution',
  risk_analysis: 'Risk analysis',
  cross_chain: 'Cross-chain analysis',
  fund_flow: 'Fund-flow analysis',
}

export function GenerateReportPage() {
  const [params] = useSearchParams()
  const [investigationId, setInvestigationId] = useState(params.get('investigation_id') ?? '')
  const [format] = useState<'pdf' | 'docx'>('pdf')
  const [include, setInclude] = useState<ReportInclude>({
    transactions: true,
    graph: true,
    entity_attribution: true,
    risk_analysis: true,
    cross_chain: false,
    fund_flow: false,
  })
  const createReport = useCreateReport()
  const allInvestigations = useAllInvestigations()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const result = await createReport.mutateAsync({ investigation_id: investigationId, format, include })
      navigate(`/reports/${result.report_id}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not generate report')
    }
  }

  const completedInvs = allInvestigations.data?.filter(i => i.status === 'completed') || []

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col gap-1">
        <BackButton fallback="/reports" />
        <h1 className="text-2xl font-bold text-text-primary mt-2">Generate Report</h1>
        <p className="text-sm text-text-secondary">Create an official PDF export for case evidence.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="space-y-5 rounded-lg bg-surface-1 p-6 border border-border-c shadow-sm">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Investigation ID</label>
            <select
              required
              value={investigationId}
              onChange={(e) => setInvestigationId(e.target.value)}
              className="w-full rounded-md bg-bg-app border border-border-c px-3 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors"
            >
              <option value="" disabled>Select Investigation...</option>
              {completedInvs.map(inv => (
                <option key={inv.investigation_id} value={inv.investigation_id}>
                  {inv.case_title} - {inv.start_address.slice(0, 8)}... ({inv.chain})
                </option>
              ))}
            </select>
          </div>
          {allInvestigations.isLoading && <LoadingState label="Loading completed investigations…" />}
          {allInvestigations.isError && (
            <ErrorState
              message={allInvestigations.error instanceof Error ? allInvestigations.error.message : 'Could not load investigations.'}
              onRetry={() => allInvestigations.refetch()}
            />
          )}
          {!allInvestigations.isLoading && !allInvestigations.isError && completedInvs.length === 0 && (
            <EmptyState title="No completed investigations" description="Complete an investigation before generating a PDF report." />
          )}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Format</label>
            <div className="w-full rounded-md bg-surface-2 border border-border-c px-3 py-2 text-sm text-text-tertiary cursor-not-allowed font-medium">
              PDF Report
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Sections</p>
            {(Object.keys(SECTION_LABELS) as (keyof ReportInclude)[]).map((key) => (
              <label key={key} className="flex items-center gap-3 text-sm text-text-primary font-medium">
                <input
                  type="checkbox"
                  className="rounded border-border-c text-saffron focus:ring-saffron h-4 w-4"
                  checked={include[key]}
                  onChange={(e) => setInclude({ ...include, [key]: e.target.checked })}
                />
                {SECTION_LABELS[key]}
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={createReport.isPending || !investigationId}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-saffron px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong disabled:opacity-50 transition-colors shadow-sm"
          >
            {createReport.isPending ? <><LoadingIcon size="button" />Submitting…</> : 'Generate Report'}
          </button>
          {error && <p role="alert" className="text-sm font-medium text-red">{error}</p>}
        </div>

        <div className="rounded-lg bg-surface-1 p-6 border border-border-c shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-4">Preview content</p>
          <ul className="space-y-2 text-sm text-text-secondary marker:text-border-strong pl-4 list-disc">
            <li>Case information</li>
            <li>Seed wallet</li>
            {include.transactions && <li>Transaction timeline</li>}
            {include.graph && <li>Investigation graph (static export)</li>}
            {include.risk_analysis && <li>Risk analysis</li>}
            {include.entity_attribution && <li>Entity / VASP attribution</li>}
            {include.cross_chain && <li>Cross-chain activity</li>}
            {include.fund_flow && <li>Fund-flow analysis</li>}
            <li>Evidence sources &amp; confidence values</li>
          </ul>

        </div>
      </form>
    </div>
  )
}
