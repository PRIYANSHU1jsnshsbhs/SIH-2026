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
    <div className="max-w-4xl space-y-6">
      <BackButton fallback="/reports" />

      <div className="flex items-start justify-between bg-surface-1 p-6 rounded-lg border border-border-c shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">{report.data.case_title}</h1>
          <div className="flex items-center gap-3 text-xs text-text-tertiary font-mono">
            <span className="bg-surface-2 px-2 py-1 rounded text-text-secondary">{report.data.report_id}</span>
            <span>Invest: {report.data.investigation_id}</span>
            <span className="uppercase font-sans font-bold text-saffron tracking-wider">HTML Report</span>
          </div>
        </div>
        {isComplete && (
          <button
            onClick={handleDownload}
            className="shrink-0 text-sm font-medium px-4 py-2 rounded-md bg-saffron text-white hover:bg-accent-strong shadow-sm transition-colors"
          >
            Download HTML
          </button>
        )}
      </div>

      {!isComplete && (
        <div className="rounded-lg bg-surface-1 p-8 text-center text-sm font-medium text-text-secondary border border-border-c shadow-sm">
          {report.data.status === 'failed' ? (
            <span className="text-red">This report failed to generate.</span>
          ) : (
            'Still generating…'
          )}
        </div>
      )}

      {isComplete && content.isLoading && <LoadingState />}
      {isComplete && content.isError && <ErrorState message="Could not load this report's content." />}
      {isComplete && content.data && (
        <div className="report-content rounded-lg bg-surface-1 p-8 md:p-12 border border-border-c shadow-sm print:shadow-none print:border-0">
          <div className="mb-10 pb-6 border-b-2 border-navy-900 text-center">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">INTELLIGENCE REPORT</h1>
            <p className="text-sm font-bold uppercase tracking-widest text-text-secondary">Official Document</p>
          </div>
          <div className="space-y-8">
            {content.data.sections.map((s, i) => (
              <section key={i}>
                <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide border-b border-border-strong pb-2 mb-4">{s.heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: s.bodyHtml }} className="prose prose-sm prose-slate max-w-none text-text-primary" />
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
