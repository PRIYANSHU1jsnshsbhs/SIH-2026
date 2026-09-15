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
  const [format, setFormat] = useState<'pdf' | 'docx'>('pdf')
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
      <BackButton fallback="/reports" />
      <h1 className="text-lg font-semibold text-text-primary">Generate Report</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="space-y-4 rounded-lg bg-surface-1 p-6">
          <div>
            <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Investigation ID</label>
            <input
              required
              value={investigationId}
              onChange={(e) => setInvestigationId(e.target.value)}
              className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm font-mono text-text-primary"
              placeholder="INV-001"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'pdf' | 'docx')}
              className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
            >
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-text-tertiary">Sections</p>
            {(Object.keys(SECTION_LABELS) as (keyof ReportInclude)[]).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
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
            className="rounded-md bg-btn-bg px-4 py-2 text-sm font-medium text-btn-fg hover:bg-accent-strong disabled:opacity-50"
          >
            {createReport.isPending ? 'Submitting…' : 'Generate'}
          </button>
        </div>

        <div className="rounded-lg bg-surface-1 p-6">
          <p className="text-xs uppercase tracking-wide text-text-tertiary mb-3">Preview</p>
          <ul className="space-y-1.5 text-sm text-text-secondary">
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
            <div className="mt-6 border-t border-border-c pt-4">
              <p className="text-xs text-text-tertiary font-mono">{reportStatus.data.report_id}</p>
              <p className="text-sm text-text-primary mt-1">Status: {reportStatus.data.status}</p>
              {reportStatus.data.status === 'completed' && (
                <div className="mt-2 flex gap-2">
                  <Link
                    to={`/reports/${createdReportId}`}
                    className="text-xs px-3 py-1.5 rounded-md bg-btn-bg text-btn-fg hover:bg-accent-strong"
                  >
                    View report →
                  </Link>
                  <button
                    onClick={handleDownload}
                    className="text-xs px-3 py-1.5 rounded-md bg-surface-2 text-text-primary hover:brightness-125"
                  >
                    Download
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
