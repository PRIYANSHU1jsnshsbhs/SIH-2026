import clsx from 'clsx'
import type { InvestigationStatusResponse } from '@/schemas/investigations'

export function InvestigationProgress({ status }: { status: InvestigationStatusResponse }) {
  const failed = status.status === 'failed'
  const cancelled = status.status === 'cancelled'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            'text-xs font-semibold uppercase tracking-wide',
            status.status === 'completed' && 'text-green-400',
            status.status === 'running' && 'text-accent',
            status.status === 'queued' && 'text-text-secondary',
            (failed || cancelled) && 'text-red-400',
          )}
        >
          {status.status.replace('_', ' ')}
        </span>
        <span className="text-xs text-text-tertiary">{status.progress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', failed || cancelled ? 'bg-red-600' : 'bg-accent')}
          style={{ width: `${status.progress}%` }}
        />
      </div>
      <p className="text-sm text-text-primary">Stage: {status.stage}</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-surface-1 px-3 py-2">
          <p className="text-xs text-text-tertiary">Nodes discovered</p>
          <p className="text-text-primary tabular-nums">{status.nodes_found.toLocaleString()}</p>
        </div>
        <div className="rounded-md bg-surface-1 px-3 py-2">
          <p className="text-xs text-text-tertiary">Relationships</p>
          <p className="text-text-primary tabular-nums">{status.edges_found.toLocaleString()}</p>
        </div>
      </div>
      {status.error && <p className="text-sm text-red-400">{status.error}</p>}
    </div>
  )
}
