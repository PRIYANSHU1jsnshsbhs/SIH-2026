import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCases } from '@/hooks/useCases'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PriorityBadge } from '@/components/cases/PriorityBadge'

export function CasesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const cases = useCases({ search: search || undefined, status: status || undefined, priority: priority || undefined })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-c pb-3">
        <h1 className="text-2xl font-bold text-text-primary">Cases Directory</h1>
        <Link to="/cases/new" className="text-sm font-medium px-4 py-2 rounded-md bg-saffron text-white hover:bg-accent-strong shadow-sm transition-colors">
          + New Case
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 bg-surface-1 p-3 rounded-lg border border-border-c shadow-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or case ID…"
          className="rounded-md bg-bg-app border border-border-c px-4 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors min-w-[280px] placeholder:text-text-tertiary"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md bg-bg-app border border-border-c px-4 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-md bg-bg-app border border-border-c px-4 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {cases.isLoading && <LoadingState />}
      {cases.isError && <ErrorState message={cases.error instanceof Error ? cases.error.message : 'Could not load cases.'} onRetry={() => cases.refetch()} />}
      {cases.data && cases.data.cases.length === 0 && (
        <EmptyState title="No cases match these filters" description="Try clearing search or filters." />
      )}
      {cases.data && cases.data.cases.length > 0 && (
        <div className="overflow-x-auto rounded-lg bg-surface-1 border border-border-c shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-c bg-surface-2 text-xs uppercase text-text-secondary tracking-wide">
                <th className="px-4 py-3 font-semibold">Case ID</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Wallets</th>
                <th className="px-4 py-3 font-semibold">Investigations</th>
                <th className="px-4 py-3 font-semibold">Last Activity</th>
                <th className="px-4 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {cases.data.cases.map((c) => (
                <tr key={c.case_id} className="border-b border-border-c last:border-0 hover:bg-bg-app transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">{c.case_id}</td>
                  <td className="px-4 py-3">
                    <Link to={`/cases/${c.case_id}`} className="font-semibold text-text-primary hover:text-saffron">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge level={c.priority} />
                  </td>
                  <td className="px-4 py-3 capitalize text-text-secondary font-medium">{c.status.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-text-primary font-medium">{c.wallets_count}</td>
                  <td className="px-4 py-3 text-text-primary font-medium">{c.investigations_count}</td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{new Date(c.updated_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
