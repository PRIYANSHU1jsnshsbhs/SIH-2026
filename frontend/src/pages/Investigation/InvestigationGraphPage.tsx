import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useInvestigationFindings, useInvestigationGraph, useInvestigationStatus, useAllInvestigations } from '@/hooks/useInvestigation'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { GraphErrorBoundary } from '@/components/graph/GraphErrorBoundary'
import { GraphFilters, type GraphFilterState } from '@/components/graph/GraphFilters'
import { RiskLegend } from '@/components/graph/RiskLegend'
import { NodeDetailsPanel } from '@/components/graph/NodeDetailsPanel'
import { TransactionDetailDrawer } from '@/components/transaction/TransactionDetailDrawer'
import { BackButton } from '@/components/common/BackButton'
import type { GraphEdge, GraphNode } from '@/schemas/investigations'

const RISK_ORDER = { high: 3, medium: 2, low: 1, unknown: 0 }

type ViewMode = 'attribution' | '1hop' | '2hops' | 'full'

export function InvestigationGraphPage() {
  const { investigationId } = useParams<{ investigationId: string }>()
  const status = useInvestigationStatus(investigationId)
  const isComplete = status.data?.status === 'completed'
  const graph = useInvestigationGraph(investigationId, isComplete)
  const findings = useInvestigationFindings(investigationId, isComplete)

  const [filters, setFilters] = useState<GraphFilterState>({
    riskLevel: 'all',
    minValue: 0,
    showCrossChainOverlay: false,
    showFundFlowOverlay: false,
  })
  
  const [viewMode, setViewMode] = useState<ViewMode>('attribution')
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null)
  const [fitRequest, setFitRequest] = useState(0)

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null)

  const allInvestigations = useAllInvestigations()
  const chain = status.data?.chain ?? allInvestigations.data?.find((i) => i.investigation_id === investigationId)?.chain ?? ''
  const seedAddress = status.data?.start_address ?? allInvestigations.data?.find((i) => i.investigation_id === investigationId)?.start_address

  const { filteredNodes, filteredEdges, hasAttribution, vaspNodes } = useMemo(() => {
    if (!graph.data) return { filteredNodes: [], filteredEdges: [], hasAttribution: false, vaspNodes: [] }
    
    // First, base filter
    const minRisk = filters.riskLevel
    let nodes = graph.data.nodes
    if (minRisk !== 'all') {
      nodes = nodes.filter((n) => RISK_ORDER[n.risk_level] >= RISK_ORDER[minRisk])
    }
    
    nodes = nodes.map((n) => ({
      ...n,
      is_seed: seedAddress && (n.label === seedAddress || n.id === seedAddress) ? true : n.is_seed
    }))

    const nodeIdsSet = new Set(nodes.map((n) => n.id))
    let edges = graph.data.edges.filter(
      (e) => nodeIdsSet.has(e.source) && nodeIdsSet.has(e.target) && (e.amount == null || Number(e.amount) >= filters.minValue),
    )

    // BFS Logic to compute attribution paths and hops
    const adjacency: Record<string, string[]> = {}
    edges.forEach(e => {
      if (!adjacency[e.source]) adjacency[e.source] = []
      adjacency[e.source].push(e.target)
    })

    const seedNodes = nodes.filter(n => n.is_seed)
    const nearestVasp = findings.data?.nearest_vasp ?? null

    // Distances from seed
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

    const incomingCounts: Record<string, number> = {}
    const outgoingCounts: Record<string, number> = {}
    edges.forEach((edge) => {
      outgoingCounts[edge.source] = (outgoingCounts[edge.source] || 0) + 1
      incomingCounts[edge.target] = (incomingCounts[edge.target] || 0) + 1
    })

    nodes = nodes.map((node) => {
      const isNearest = nearestVasp?.deposit_wallet === node.id
      return {
        ...node,
        hop: distances[node.id] ?? null,
        incoming_count: incomingCounts[node.id] || 0,
        outgoing_count: outgoingCounts[node.id] || 0,
        is_nearest_vasp: isNearest,
        confidence: isNearest ? nearestVasp?.confidence ?? null : node.confidence,
        attribution_amount: isNearest ? nearestVasp?.amount ?? null : null,
        attribution_asset: isNearest ? nearestVasp?.asset ?? null : null,
      }
    })

    const vasps = nodes.filter((node) => node.is_nearest_vasp)
    const hasAttribution = vasps.some((node) => distances[node.id] !== undefined)

    const attributionEdges = new Set<string>()
    const attributionNodes = new Set<string>()

    if (hasAttribution) {
      vasps.forEach(v => {
        if (distances[v.id] !== undefined) {
          attributionNodes.add(v.id)
          // backtrack
          const bQueue = [v.id]
          const visited = new Set<string>([v.id])
          while(bQueue.length > 0) {
            const curr = bQueue.shift()!
            attributionNodes.add(curr)
            const ps = parents[curr] || []
            ps.forEach(p => {
              // find edge p -> curr
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
    }))

    // View Mode Filtering
    let visibleNodes = new Set<string>()
    const actualViewMode = (!hasAttribution && viewMode === 'attribution') ? '1hop' : viewMode
    
    if (actualViewMode === 'full') {
      visibleNodes = new Set(nodes.map(n => n.id))
    } else if (actualViewMode === 'attribution') {
      if (hasAttribution && attributionNodes.size > 0) {
        visibleNodes = new Set(Array.from(attributionNodes))
        // add 1-hop from seed just to give context
        seedNodes.forEach(s => {
          visibleNodes.add(s.id)
          ;(adjacency[s.id] || []).forEach(n => visibleNodes.add(n))
        })
      } else {
        // Fallback to 1hop if no attribution path
        Object.entries(distances).forEach(([id, d]) => {
          if (d <= 1) visibleNodes.add(id)
        })
      }
    } else if (actualViewMode === '1hop') {
      Object.entries(distances).forEach(([id, d]) => {
        if (d <= 1) visibleNodes.add(id)
      })
    } else if (actualViewMode === '2hops') {
      Object.entries(distances).forEach(([id, d]) => {
        if (d <= 2) visibleNodes.add(id)
      })
    }

    if (actualViewMode === 'attribution') {
       vasps.forEach(v => visibleNodes.add(v.id))
    }

    const finalNodes = nodes.filter(n => visibleNodes.has(n.id))
    const finalEdges = edges.filter(e => visibleNodes.has(e.source) && visibleNodes.has(e.target))

    return { filteredNodes: finalNodes, filteredEdges: finalEdges, hasAttribution, vaspNodes: vasps }
  }, [graph.data, findings.data, filters.riskLevel, filters.minValue, seedAddress, viewMode])

  if (status.isLoading) return <LoadingState />
  if (status.isError) return <ErrorState message={status.error instanceof Error ? status.error.message : 'Could not load investigation.'} onRetry={() => status.refetch()} />
  if (!isComplete) {
    return (
      <div className="space-y-3">
        <BackButton fallback="/explorer" />
        <p className="text-sm text-text-secondary">This investigation hasn't finished running yet.</p>
        <Link to={`/investigations/${investigationId}/progress`} className="text-sm text-accent hover:underline underline-offset-2">
          View progress  
        </Link>
      </div>
    )
  }

  const effectiveViewMode = (!hasAttribution && viewMode === 'attribution') ? '1hop' : viewMode

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border-c pb-3">
        <div>
          <BackButton fallback="/explorer" />
          <h1 className="text-xl font-bold text-text-primary mt-2">Investigation Graph</h1>
          <p className="text-xs text-text-secondary font-mono mt-1">Trace ID: {investigationId}</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={effectiveViewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="rounded-md border border-border-c bg-bg-app px-3 py-1.5 text-sm font-medium text-text-primary outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
          >
            {hasAttribution && <option value="attribution">Attribution Path</option>}
            <option value="1hop">1 Hop</option>
            <option value="2hops">2 Hops</option>
            <option value="full">Full Graph</option>
          </select>

          <Link
            to={`/investigations/${investigationId}/findings`}
            className="text-sm font-medium px-4 py-2 rounded-md bg-saffron text-white hover:bg-accent-strong shadow-sm transition-colors"
          >
            View Findings  
          </Link>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-y-auto lg:overflow-hidden flex-col lg:flex-row">
        <aside className="w-full lg:w-64 shrink-0 space-y-6 overflow-y-auto rounded-lg bg-surface-1 p-5 border border-border-c shadow-sm flex flex-col">
          <GraphFilters filters={filters} onChange={setFilters} />
          
          <div className="pt-4 border-t border-border-c">
            <button 
              onClick={() => {
                if (seedAddress) {
                  setFocusNodeId(seedAddress)
                  // clear it slightly after so it can be re-triggered
                  setTimeout(() => setFocusNodeId(null), 500)
                }
              }} 
              className="text-xs font-bold text-saffron hover:underline w-full text-left"
            >
              → Go to Start
            </button>
            {hasAttribution && vaspNodes[0] && (
              <button
                onClick={() => {
                  setFocusNodeId(vaspNodes[0].id)
                  setTimeout(() => setFocusNodeId(null), 500)
                }}
                className="mt-3 text-xs font-bold text-saffron hover:underline w-full text-left"
              >
                → Go to VASP
              </button>
            )}
            <button
              onClick={() => setFitRequest((value) => value + 1)}
              className="mt-3 text-xs font-bold text-saffron hover:underline w-full text-left"
            >
              → Fit Visible
            </button>
          </div>

          <div className="pt-4 border-t border-border-c flex-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-3">Legend</p>
            <RiskLegend />
          </div>
          
          {hasAttribution && (
            <div className="pt-4 border-t border-border-c">
              <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-3">Nearest Identified VASP</p>
              {vaspNodes.map((v, i) => (
                <div key={i} className="mb-3 p-3 rounded-md bg-bg-app border border-border-c">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-1.5 py-0.5 rounded-sm bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wide">VASP</span>
                    <button 
                      onClick={() => {
                        setFocusNodeId(v.id)
                        setTimeout(() => setFocusNodeId(null), 500)
                      }} 
                      className="text-xs text-accent hover:underline"
                    >
                      Locate
                    </button>
                  </div>
                  <p className="font-bold text-sm text-text-primary">{v.entity_name || 'Name not available'}</p>
                  <p className="text-xs font-mono text-text-secondary truncate mt-1">{v.id}</p>
                  <p className="mt-1 text-[11px] text-text-secondary">Hop {v.hop ?? 'not available'}</p>
                  {v.attribution_amount != null && (
                    <p className="mt-1 text-[11px] font-mono text-text-primary">{v.attribution_amount} {v.attribution_asset || ''}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {!hasAttribution && !findings.isLoading && !findings.isError && (
            <div className="pt-4 border-t border-border-c">
              <p className="text-xs text-text-secondary italic">No identified VASP reached in this investigation.</p>
            </div>
          )}
          {findings.isError && (
            <div className="pt-4 border-t border-border-c">
              <p className="text-xs text-red">Attribution data could not be loaded: {findings.error instanceof Error ? findings.error.message : 'Unknown error'}</p>
            </div>
          )}
        </aside>

        <div className="flex-1 rounded-lg bg-surface-1 overflow-hidden min-h-[400px] lg:min-h-0 border border-border-c shadow-sm relative">
          {graph.isLoading ? (
            <LoadingState label="Loading graph." />
          ) : graph.isError || !graph.data ? (
            <ErrorState message={graph.error instanceof Error ? graph.error.message : 'Could not load graph data.'} onRetry={() => graph.refetch()} />
          ) : filteredNodes.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-center">
              <div className="max-w-md">
                <p className="text-lg font-bold text-text-primary mb-2">No nodes visible</p>
                <p className="text-sm text-text-secondary">
                  The graph is empty or all nodes have been filtered out. Adjust your filters or check the investigation results.
                </p>
              </div>
            </div>
          ) : (
            <GraphErrorBoundary key={graph.dataUpdatedAt}>
              <GraphCanvas
                nodes={filteredNodes}
                edges={filteredEdges}
                isFullGraph={effectiveViewMode === 'full'}
                focusNodeId={focusNodeId}
                fitRequest={fitRequest}
                onNodeSelect={(n) => {
                  setSelectedEdge(null)
                  setSelectedNode(n)
                }}
                onEdgeSelect={(e) => {
                  setSelectedNode(null)
                  setSelectedEdge(e)
                }}
              />
            </GraphErrorBoundary>
          )}
        </div>

        {(selectedNode || filters.showCrossChainOverlay || filters.showFundFlowOverlay) && (
          <aside className="w-full lg:w-80 shrink-0 space-y-5 overflow-y-auto rounded-lg bg-surface-1 p-5 border border-border-c shadow-sm">
            {selectedNode && <NodeDetailsPanel chain={chain} node={selectedNode} onClose={() => setSelectedNode(null)} />}

            {filters.showCrossChainOverlay && (
              <div className="pt-4 border-t border-border-c first:border-0 first:pt-0">
                <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-2">Cross-chain</p>
                <p className="text-sm text-text-primary leading-relaxed">
                  No cross-chain bridge events observed for this investigation - all traced activity stayed on{' '}
                  <span className="font-semibold capitalize">{chain}</span>.
                </p>
              </div>
            )}

            {filters.showFundFlowOverlay && graph.data && (
              <div className="pt-4 border-t border-border-c">
                <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-2">
                  Fund-flow summary
                </p>
                <div className="space-y-3 text-sm text-text-primary">
                  <p className="font-medium">Observed nodes in current trace:</p>
                  <ul className="list-disc pl-5 space-y-1 text-text-secondary marker:text-saffron">
                    <li>Wallets: <span className="font-semibold text-text-primary">{graph.data.nodes.filter(n => n.type === 'wallet').length}</span></li>
                    <li>Entities/VASPs: <span className="font-semibold text-text-primary">{graph.data.nodes.filter(n => n.type !== 'wallet').length}</span></li>
                    <li>Transactions: <span className="font-semibold text-text-primary">{graph.data.edges.length}</span></li>
                  </ul>
                  <p className="text-xs text-text-tertiary border-t border-border-c pt-3 mt-3">
                    Fund-flow path available in graph visualization.
                  </p>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {selectedEdge && (
        <TransactionDetailDrawer chain={chain} txHash={selectedEdge.tx_hash} onClose={() => setSelectedEdge(null)} />
      )}
    </div>
  )
}
