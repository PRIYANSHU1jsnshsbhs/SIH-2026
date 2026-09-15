import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAllInvestigations, useInvestigationGraph } from '@/hooks/useInvestigation'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { RiskLegend } from '@/components/graph/RiskLegend'
import clsx from 'clsx'

const STATUS_COLOR: Record<string, string> = {
  completed: 'text-green',
  running: 'text-text-primary',
  queued: 'text-saffron',
  failed: 'text-red',
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
      <div className="border-b border-border-c pb-3">
        <h1 className="text-2xl font-bold text-text-primary">Investigation Explorer</h1>
        <p className="text-sm text-text-secondary mt-1">
          Browse every traced investigation across every case and preview its network before opening the full graph.
        </p>
      </div>

      <div className="flex gap-4 bg-surface-1 p-3 rounded-lg border border-border-c shadow-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search case, trace ID, or target address…"
          className="flex-1 max-w-lg rounded-md bg-bg-app border border-border-c px-4 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors placeholder:text-text-tertiary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md bg-bg-app border border-border-c px-4 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors"
        >
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="running">Running</option>
          <option value="queued">Queued</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="flex flex-1 gap-5 overflow-hidden">
        <div className="w-96 shrink-0 overflow-y-auto rounded-lg bg-surface-1 border border-border-c shadow-sm">
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
                    'block w-full px-5 py-4 text-left transition-colors',
                    selectedId === inv.investigation_id ? 'bg-saffron/10 border-l-4 border-l-saffron' : 'hover:bg-bg-app border-l-4 border-l-transparent',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary truncate">{inv.case_title}</span>
                    <span className={clsx('text-[10px] tracking-widest font-bold uppercase shrink-0 ml-2', STATUS_COLOR[inv.status])}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-text-secondary">
                    {inv.investigation_id}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                    {inv.chain} • {inv.node_count} nodes • {inv.edge_count} edges
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 rounded-lg bg-surface-1 border border-border-c shadow-sm overflow-hidden relative">
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
                      className="text-sm font-medium text-saffron hover:underline underline-offset-2"
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
              <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                <Link
                  to={`/investigations/${selected.investigation_id}/graph`}
                  className="text-sm font-medium px-4 py-2 rounded-md bg-saffron text-white hover:bg-accent-strong shadow-sm transition-colors"
                >
                  Open full graph →
                </Link>
                <Link
                  to={`/investigations/${selected.investigation_id}/findings`}
                  className="text-sm font-medium px-4 py-2 rounded-md bg-surface-1 text-text-primary border border-border-strong hover:bg-surface-2 transition-colors shadow-sm"
                >
                  View findings
                </Link>
              </div>
              <div className="absolute top-4 right-4 z-10 rounded-md bg-surface-1 border border-border-c shadow-sm p-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-3">Legend</p>
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
