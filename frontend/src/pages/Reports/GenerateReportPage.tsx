import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCreateReport, useReport } from '@/hooks/useReports'
import { fetchReportHtml } from '@/api/reports'
import type { ReportInclude } from '@/schemas/reports'
import { useUiStore } from '@/stores/uiStore'
import { BackButton } from '@/components/common/BackButton'

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
  const [createdReportId, setCreatedReportId] = useState<string | null>(null)
  const createReport = useCreateReport()
  const reportStatus = useReport(createdReportId ?? undefined)
  const pushToast = useUiStore((s) => s.pushToast)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = await createReport.mutateAsync({ investigation_id: investigationId, format, include })
    setCreatedReportId(result.report_id)
  }

  async function handleDownload() {
    if (!createdReportId) return
    try {
      const html = await fetchReportHtml(createdReportId)
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${createdReportId}.html`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      pushToast('Could not generate the report file', 'error')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col gap-1">
        <BackButton fallback="/reports" />
        <h1 className="text-2xl font-bold text-text-primary mt-2">Generate Report</h1>
        <p className="text-sm text-text-secondary">Create an official HTML export for case evidence.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="space-y-5 rounded-lg bg-surface-1 p-6 border border-border-c shadow-sm">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Investigation ID</label>
            <input
              required
              value={investigationId}
              onChange={(e) => setInvestigationId(e.target.value)}
              className="w-full rounded-md bg-bg-app border border-border-c px-3 py-2 text-sm font-mono text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors placeholder:text-text-tertiary"
              placeholder="INV-001"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Format</label>
            <div className="w-full rounded-md bg-surface-2 border border-border-c px-3 py-2 text-sm text-text-tertiary cursor-not-allowed font-medium">
              HTML Report
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
            disabled={createReport.isPending}
            className="w-full rounded-md bg-saffron px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong disabled:opacity-50 transition-colors shadow-sm mt-2"
          >
            {createReport.isPending ? 'Submitting…' : 'Generate Report'}
          </button>
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

          {createdReportId && reportStatus.data && (
            <div className="mt-8 border-t border-border-c pt-5 bg-bg-app -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
              <p className="text-xs text-text-tertiary font-mono mb-1">{reportStatus.data.report_id}</p>
              <p className="text-sm text-text-primary font-bold capitalize mb-4">Status: <span className="text-saffron">{reportStatus.data.status}</span></p>
              {reportStatus.data.status === 'completed' && (
                <div className="mt-2 flex flex-col gap-2">
                  <Link
                    to={`/reports/${createdReportId}`}
                    className="text-sm text-center px-4 py-2 rounded-md bg-navy-900 text-white hover:bg-navy-800 transition-colors shadow-sm font-medium"
                  >
                    View in browser
                  </Link>
                  <button
                    onClick={handleDownload}
                    type="button"
                    className="text-sm text-center px-4 py-2 rounded-md bg-surface-1 border border-border-strong text-text-primary hover:bg-surface-2 transition-colors font-medium shadow-sm"
                  >
                    Download HTML
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
