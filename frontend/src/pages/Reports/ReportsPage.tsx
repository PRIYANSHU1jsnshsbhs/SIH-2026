import { Link } from 'react-router-dom'
import { useReports } from '@/hooks/useReports'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import clsx from 'clsx'

export function ReportsPage() {
  const reports = useReports()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-c pb-3">
        <h1 className="text-2xl font-bold text-text-primary">Intelligence Reports</h1>
        <Link to="/reports/new" className="text-sm font-medium px-4 py-2 rounded-md bg-saffron text-white hover:bg-accent-strong shadow-sm transition-colors">
          + Generate Report
        </Link>
      </div>

      {reports.isLoading && <LoadingState />}
      {reports.isError && <ErrorState message={reports.error instanceof Error ? reports.error.message : 'Could not load reports.'} onRetry={() => reports.refetch()} />}
      {reports.data && reports.data.reports.length === 0 && (
        <EmptyState title="No reports yet" description="Generate a report from a completed investigation's findings page." />
      )}
      {reports.data && reports.data.reports.length > 0 && (
        <div className="overflow-x-auto rounded-lg bg-surface-1 border border-border-c shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-c bg-surface-2 text-xs uppercase text-text-secondary tracking-wide">
                <th className="px-4 py-3 font-semibold">Report ID</th>
                <th className="px-4 py-3 font-semibold">Case</th>
                <th className="px-4 py-3 font-semibold">Investigation</th>
                <th className="px-4 py-3 font-semibold">Format</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {reports.data.reports.map((r) => (
                <tr key={r.report_id} className="border-b border-border-c last:border-0 hover:bg-bg-app transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-text-primary font-medium">{r.report_id}</td>
                  <td className="px-4 py-3 text-text-primary font-semibold">{r.case_title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">{r.investigation_id}</td>
                  <td className="px-4 py-3 font-bold text-text-secondary">{r.format.toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        'text-[10px] tracking-wider uppercase font-bold',
                        r.status === 'completed' && 'text-green',
                        r.status === 'generating' && 'text-saffron',
                        r.status === 'failed' && 'text-red',
                      )}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{r.created_at ? new Date(r.created_at).toLocaleString() : 'Not available'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/reports/${r.report_id}`} className="text-sm font-medium text-saffron hover:underline underline-offset-2">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
