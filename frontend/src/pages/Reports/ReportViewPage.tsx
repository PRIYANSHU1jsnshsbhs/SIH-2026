import { useParams } from 'react-router-dom'
import { useReport } from '@/hooks/useReports'
import { downloadReportPdf } from '@/api/reports'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { BackButton } from '@/components/common/BackButton'
import { useUiStore } from '@/stores/uiStore'
import { useState } from 'react'
import { LoadingIcon } from '@/components/common/LoadingIcon'

export function ReportViewPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const report = useReport(reportId)
  const isComplete = report.data?.status === 'completed'
  const pushToast = useUiStore((s) => s.pushToast)
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleDownload() {
    if (!reportId) return
    setIsDownloading(true)
    try {
      const blob = await downloadReportPdf(reportId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (caught) {
      pushToast(caught instanceof Error ? caught.message : 'Could not download the PDF report', 'error')
    } finally {
      setIsDownloading(false)
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
            <span className="uppercase font-sans font-bold text-saffron tracking-wider">PDF Report</span>
          </div>
        </div>
        {isComplete && (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-saffron px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-strong"
          >
            {isDownloading ? <><LoadingIcon size="button" />Downloading…</> : 'Download PDF'}
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

      {isComplete && (
        <div className="flex flex-col items-center justify-center rounded-lg bg-surface-1 p-12 text-center border border-border-c shadow-sm">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">PDF Report Ready</h2>
          <p className="text-sm text-text-secondary max-w-md mb-8">
            The backend has successfully generated a full production PDF report containing transaction history, graph evidence, and risk analysis for this investigation.
          </p>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 rounded-md bg-saffron px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-accent-strong"
          >
            {isDownloading ? <><LoadingIcon size="button" />Downloading…</> : 'Download PDF Report'}
          </button>
        </div>
      )}
    </div>
  )
}
