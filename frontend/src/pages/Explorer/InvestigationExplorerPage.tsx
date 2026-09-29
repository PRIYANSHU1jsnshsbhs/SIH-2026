import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAllInvestigations, useInvestigationFindings, useInvestigationGraph } from '@/hooks/useInvestigation'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { GraphErrorBoundary } from '@/components/graph/GraphErrorBoundary'
import { RiskLegend } from '@/components/graph/RiskLegend'
import clsx from 'clsx'
import type { GraphEdge, GraphNode } from '@/schemas/investigations'

const STATUS_COLOR: Record<string, string> = {
  completed: 'text-green',
  running: 'text-text-primary',
  queued: 'text-saffron',
  pending: 'text-saffron',
  initializing: 'text-saffron',
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
  const findings = useInvestigationFindings(selected?.investigation_id, selected?.status === 'completed')

  const { previewNodes, previewEdges } = useMemo(() => {
    if (!graph.data || !selected) return { previewNodes: [], previewEdges: [] }
    let nodes = graph.data.nodes.map(n => ({
      ...n,
      is_seed: (n.label === selected.start_address || n.id === selected.start_address) ? true : n.is_seed
    }))
    let edges = graph.data.edges

    const adjacency: Record<string, string[]> = {}
    edges.forEach(e => {
      if (!adjacency[e.source]) adjacency[e.source] = []
      adjacency[e.source].push(e.target)
    })

    const seedNodes = nodes.filter(n => n.is_seed)
    const nearestVasp = findings.data?.nearest_vasp
    const vasps = nearestVasp ? nodes.filter(n => n.id === nearestVasp.deposit_wallet) : []
    const hasVasp = vasps.length > 0

    const distances: Record<string, number> = {}
    const queue: {id: string, dist: number}[] = []
    
    seedNodes.forEach(s => {
      distances[s.id] = 0
      queue.push({id: s.id, dist: 0})
    })

    const parents: Record<string, string[]> = {}

    while(queue.length > 0) {
      const {id, dist} = queue.shift()!
      const neighbors = adjacency[id] || []
      neighbors.forEach(nxt => {
        if (distances[nxt] === undefined) {
          distances[nxt] = dist + 1
          parents[nxt] = [id]
          queue.push({id: nxt, dist: dist + 1})
        } else if (distances[nxt] === dist + 1) {
          parents[nxt].push(id)
        }
      })
    }

    const attributionEdges = new Set<string>()
    const attributionNodes = new Set<string>()

    if (hasVasp) {
      vasps.forEach(v => {
        if (distances[v.id] !== undefined) {
          attributionNodes.add(v.id)
          const bQueue = [v.id]
          const visited = new Set<string>([v.id])
          while(bQueue.length > 0) {
            const curr = bQueue.shift()!
            attributionNodes.add(curr)
            const ps = parents[curr] || []
            ps.forEach(p => {
              const edge = edges.find(e => e.source === p && e.target === curr)
              if (edge) attributionEdges.add(edge.id)
              if (!visited.has(p)) {
                visited.add(p)
                bQueue.push(p)
              }
            })
          }
        }
      })
    }

    edges = edges.map(e => ({
      ...e,
      is_attribution_path: attributionEdges.has(e.id)
    })) as any

    const visibleNodes = new Set<string>()
    if (hasVasp && attributionNodes.size > 0) {
      attributionNodes.forEach(id => visibleNodes.add(id))
      seedNodes.forEach(s => {
        visibleNodes.add(s.id)
        ;(adjacency[s.id] || []).forEach(n => visibleNodes.add(n))
      })
    } else {
      Object.entries(distances).forEach(([id, d]) => {
        if (d <= 1) visibleNodes.add(id)
      })
    }

    const finalNodes = nodes.filter(n => visibleNodes.has(n.id))
    const finalEdges = edges.filter(e => visibleNodes.has(e.source) && visibleNodes.has(e.target))

    return { previewNodes: finalNodes as GraphNode[], previewEdges: finalEdges as GraphEdge[] }
  }, [graph.data, findings.data, selected])


  return (
    <div className="explorer-page flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="app-page-heading border-b border-border-c pb-3">
        <h1 className="text-2xl font-bold text-text-primary">Investigation Explorer</h1>
        <p className="text-sm text-text-secondary mt-1">
          Browse every traced investigation across every case and preview its network before opening the full graph.
        </p>
      </div>

      <div className="explorer-toolbar flex gap-4 bg-surface-1 p-3 rounded-lg border border-border-c shadow-sm">
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
           <option value="pending">Pending</option>
          <option value="queued">Queued</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="explorer-workspace flex flex-1 gap-5 overflow-hidden">
        <div className="explorer-list w-96 shrink-0 overflow-y-auto rounded-lg bg-surface-1 border border-border-c shadow-sm">
          {investigations.isLoading ? (
            <LoadingState />
          ) : investigations.isError ? (
            <ErrorState
              message={investigations.error instanceof Error ? investigations.error.message : 'Could not load investigations.'}
              onRetry={() => investigations.refetch()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState title="No investigations match" description="Try clearing the search or status filter." />
          ) : (
            <div className="divide-y divide-border-c">
              {filtered.map((inv) => (
                <button
                  key={inv.investigation_id}
                  onClick={() => setSelectedId(inv.investigation_id)}
                  className={clsx(
                    'explorer-list-item block w-full px-5 py-4 text-left transition-all duration-200',
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

        <div className="explorer-preview flex-1 rounded-lg bg-surface-1 border border-border-c shadow-sm overflow-hidden relative">
          {!selected && (
            <div className="explorer-empty-preview flex h-full items-center justify-center">
              <div className="explorer-radar" aria-hidden><i /><i /><i /><span /></div>
              <EmptyState title="Select an investigation" description="Pick one from the list to preview its traced network here." />
            </div>
          )}

          {selected && selected.status === 'failed' && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center max-w-md">
                <h3 className="text-xl font-bold text-red mb-2">Investigation Failed</h3>
                <p className="text-sm text-text-secondary">
                  {selected.error ? selected.error : "Investigation failed — no failure reason provided."}
                </p>
              </div>
            </div>
          )}

          {selected && ['running', 'queued', 'pending', 'initializing'].includes(selected.status) && (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                title={`This investigation is ${selected.status}`}
                description="A preview is only available once tracing has completed."
                action={
                  <Link
                    to={`/investigations/${selected.investigation_id}/progress`}
                    className="text-sm font-medium text-saffron hover:underline underline-offset-2"
                  >
                    View progress →
                  </Link>
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
                <RiskLegend />
              </div>
              {graph.isLoading ? (
                <LoadingState label="Loading preview…" />
              ) : graph.isError ? (
                <ErrorState
                  message={graph.error instanceof Error ? graph.error.message : 'Could not load graph preview.'}
                  onRetry={() => graph.refetch()}
                />
              ) : previewNodes.length === 0 ? (
                <EmptyState title="No graph data available" description="The completed investigation returned no visible nodes." />
              ) : (
                <GraphErrorBoundary key={graph.dataUpdatedAt}>
                  <GraphCanvas
                    nodes={previewNodes}
                    edges={previewEdges}
                    onNodeSelect={() => {}}
                    onEdgeSelect={() => {}}
                  />
                </GraphErrorBoundary>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
