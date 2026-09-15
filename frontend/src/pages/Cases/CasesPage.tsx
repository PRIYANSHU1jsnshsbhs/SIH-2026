import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCases } from '@/hooks/useCases'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import clsx from 'clsx'

const PRIORITY_STYLE: Record<string, string> = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-text-secondary',
}

export function CasesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const cases = useCases({ search: search || undefined, status: status || undefined, priority: priority || undefined })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text-primary">Cases</h1>
        <Link to="/cases/new" className="text-xs px-3 py-1.5 rounded-md bg-btn-bg text-btn-fg hover:bg-accent-strong">
          + New Case
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or case ID…"
          className="rounded-md bg-surface-2 px-3 py-1.5 text-sm text-text-primary min-w-[220px]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md bg-surface-2 px-3 py-1.5 text-sm text-text-primary"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-md bg-surface-2 px-3 py-1.5 text-sm text-text-primary"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {cases.isLoading && <LoadingState />}
      {cases.data && cases.data.cases.length === 0 && (
        <EmptyState title="No cases match these filters" description="Try clearing search or filters." />
      )}
      {cases.data && cases.data.cases.length > 0 && (
        <div className="overflow-x-auto rounded-lg bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-strong bg-surface-2 text-xs uppercase text-text-tertiary">
                <th className="px-3 py-2 font-medium">Case ID</th>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Priority</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Wallets</th>
                <th className="px-3 py-2 font-medium">Last Activity</th>
                <th className="px-3 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {cases.data.cases.map((c) => (
                <tr key={c.case_id} className="border-b border-border-strong/15 hover:bg-surface-1/40">
                  <td className="px-3 py-2 font-mono text-xs text-text-tertiary">{c.case_id}</td>
                  <td className="px-3 py-2">
                    <Link to={`/cases/${c.case_id}`} className="text-accent hover:underline underline-offset-2">
                      {c.title}
                    </Link>
                  </td>
                  <td className={clsx('px-3 py-2 capitalize font-medium', PRIORITY_STYLE[c.priority])}>{c.priority}</td>
                  <td className="px-3 py-2 capitalize text-text-secondary">{c.status.replace('_', ' ')}</td>
                  <td className="px-3 py-2 text-text-primary">{c.wallets_count}</td>
                  <td className="px-3 py-2 text-xs text-text-tertiary">{new Date(c.updated_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-xs text-text-tertiary">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
