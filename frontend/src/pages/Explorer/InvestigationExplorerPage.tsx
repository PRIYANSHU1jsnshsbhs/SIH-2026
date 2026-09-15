import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAllInvestigations, useInvestigationGraph } from '@/hooks/useInvestigation'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { RiskLegend } from '@/components/graph/RiskLegend'
import clsx from 'clsx'

const STATUS_COLOR: Record<string, string> = {
  completed: 'text-green-400',
  running: 'text-amber-400',
  queued: 'text-text-secondary',
  failed: 'text-red-400',
  cancelled: 'text-text-tertiary',
}

export function InvestigationExplorerPage() {
  const investigations = useAllInvestigations()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!investigations.data) return []
    const q = search.toLowerCase()
    return investigations.data.filter((inv) => {
      const matchesSearch =
        !q ||
        inv.case_title.toLowerCase().includes(q) ||
        inv.investigation_id.toLowerCase().includes(q) ||
        inv.start_address.toLowerCase().includes(q)
      const matchesStatus = !statusFilter || inv.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [investigations.data, search, statusFilter])

  const selected = filtered.find((inv) => inv.investigation_id === selectedId) ?? null
  const graph = useInvestigationGraph(selected?.investigation_id, selected?.status === 'completed')

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Investigation Explorer</h1>
        <p className="text-sm text-text-secondary mt-1">
          Browse every traced investigation across every case and preview its network before opening the full graph.
        </p>
      </div>

      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search case, investigation ID, or address…"
          className="flex-1 max-w-sm rounded-md bg-surface-2 px-3 py-1.5 text-sm text-text-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md bg-surface-2 px-3 py-1.5 text-sm text-text-primary"
        >
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="running">Running</option>
          <option value="queued">Queued</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="w-96 shrink-0 overflow-y-auto rounded-lg bg-surface-1">
          {investigations.isLoading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <EmptyState title="No investigations match" description="Try clearing the search or status filter." />
          ) : (
            <div className="divide-y divide-border-c">
              {filtered.map((inv) => (
                <button
                  key={inv.investigation_id}
                  onClick={() => setSelectedId(inv.investigation_id)}
                  className={clsx(
                    'block w-full px-4 py-3 text-left transition-colors',
                    selectedId === inv.investigation_id ? 'bg-accent/10' : 'hover:bg-surface-2',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-primary truncate">{inv.case_title}</span>
                    <span className={clsx('text-xs font-semibold uppercase shrink-0 ml-2', STATUS_COLOR[inv.status])}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-text-tertiary">
                    {inv.investigation_id} · {inv.chain} · {inv.node_count} nodes · {inv.edge_count} edges
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 rounded-lg bg-surface-1 overflow-hidden relative">
          {!selected && (
            <div className="flex h-full items-center justify-center">
              <EmptyState title="Select an investigation" description="Pick one from the list to preview its traced network here." />
            </div>
          )}

          {selected && selected.status !== 'completed' && (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                title={`This investigation is ${selected.status}`}
                description="A preview is only available once tracing has completed."
                action={
                  selected.status === 'running' || selected.status === 'queued' ? (
                    <Link
                      to={`/investigations/${selected.investigation_id}/progress`}
                      className="text-xs text-accent hover:underline underline-offset-2"
                    >
                      View progress →
                    </Link>
                  ) : undefined
                }
              />
            </div>
          )}

          {selected && selected.status === 'completed' && (
            <>
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <Link
                  to={`/investigations/${selected.investigation_id}/graph`}
                  className="text-xs px-3 py-1.5 rounded-md bg-btn-bg text-btn-fg hover:bg-accent-strong"
                >
                  Open full graph →
                </Link>
                <Link
                  to={`/investigations/${selected.investigation_id}/findings`}
                  className="text-xs px-3 py-1.5 rounded-md bg-[#12141b]/90 text-[#e8eaee] hover:bg-[#1c202c]"
                >
                  View findings
                </Link>
              </div>
              <div className="absolute top-3 right-3 z-10 rounded-md bg-[#12141b]/90 p-3">
                <RiskLegend />
              </div>
              {graph.isLoading ? (
                <LoadingState label="Loading preview…" />
              ) : (
                <GraphCanvas
                  nodes={graph.data?.nodes ?? []}
                  edges={graph.data?.edges ?? []}
                  onNodeSelect={() => {}}
                  onEdgeSelect={() => {}}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
