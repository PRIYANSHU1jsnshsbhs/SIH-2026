import { useParams } from 'react-router-dom'
import { useReport, useReportContent } from '@/hooks/useReports'
import { fetchReportHtml } from '@/api/reports'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { BackButton } from '@/components/common/BackButton'
import { useUiStore } from '@/stores/uiStore'

export function ReportViewPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const report = useReport(reportId)
  const isComplete = report.data?.status === 'completed'
  const content = useReportContent(reportId, isComplete)
  const pushToast = useUiStore((s) => s.pushToast)

  async function handleDownload() {
    if (!reportId) return
    try {
      const html = await fetchReportHtml(reportId)
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportId}.html`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      pushToast('Could not generate the report file', 'error')
    }
  }

  if (report.isLoading) return <LoadingState />
  if (report.isError || !report.data) return <ErrorState message="Could not load this report." />

  return (
    <div className="max-w-3xl space-y-6">
      <BackButton fallback="/reports" />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">{report.data.case_title}</h1>
          <p className="text-xs text-text-tertiary font-mono">
            {report.data.report_id} · {report.data.investigation_id} · {report.data.format.toUpperCase()}
          </p>
        </div>
        {isComplete && (
          <button
            onClick={handleDownload}
            className="shrink-0 text-xs px-3 py-1.5 rounded-md bg-btn-bg text-btn-fg hover:bg-accent-strong"
          >
            Download
          </button>
        )}
      </div>

      {!isComplete && (
        <div className="rounded-lg bg-surface-1 p-6 text-sm text-text-secondary">
          {report.data.status === 'failed' ? 'This report failed to generate.' : 'Still generating…'}
        </div>
      )}

      {isComplete && content.isLoading && <LoadingState />}
      {isComplete && content.isError && <ErrorState message="Could not load this report's content." />}
      {isComplete && content.data && (
        <div className="report-content rounded-lg bg-surface-1 p-6">
          {content.data.sections.map((s, i) => (
            <section key={i}>
              <h2>{s.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: s.bodyHtml }} />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
