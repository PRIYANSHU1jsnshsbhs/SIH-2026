import { Link } from 'react-router-dom'
import { useReports } from '@/hooks/useReports'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import clsx from 'clsx'

export function ReportsPage() {
  const reports = useReports()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text-primary">Reports</h1>
        <Link to="/reports/new" className="text-xs px-3 py-1.5 rounded-md bg-btn-bg text-btn-fg hover:bg-accent-strong">
          + Generate Report
        </Link>
      </div>

      {reports.isLoading && <LoadingState />}
      {reports.data && reports.data.reports.length === 0 && (
        <EmptyState title="No reports yet" description="Generate a report from a completed investigation's findings page." />
      )}
      {reports.data && reports.data.reports.length > 0 && (
        <div className="overflow-x-auto rounded-lg bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-c bg-surface-2 text-xs uppercase text-text-tertiary">
                <th className="px-3 py-2 font-medium">Report</th>
                <th className="px-3 py-2 font-medium">Case</th>
                <th className="px-3 py-2 font-medium">Investigation</th>
                <th className="px-3 py-2 font-medium">Format</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Created</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {reports.data.reports.map((r) => (
                <tr key={r.report_id} className="border-b border-border-c/70">
                  <td className="px-3 py-2 font-mono text-xs text-text-secondary">{r.report_id}</td>
                  <td className="px-3 py-2 text-text-primary">{r.case_title}</td>
                  <td className="px-3 py-2 font-mono text-xs text-text-tertiary">{r.investigation_id}</td>
                  <td className="px-3 py-2 uppercase text-text-primary">{r.format}</td>
                  <td className="px-3 py-2">
                    <span
                      className={clsx(
                        'text-xs uppercase font-medium',
                        r.status === 'completed' && 'text-green-400',
                        r.status === 'generating' && 'text-amber-400',
                        r.status === 'failed' && 'text-red-400',
                      )}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-text-tertiary">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">
                    <Link to={`/reports/${r.report_id}`} className="text-xs text-accent hover:underline underline-offset-2">
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
