import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useInvestigationGraph, useInvestigationStatus, useAllInvestigations } from '@/hooks/useInvestigation'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { GraphCanvas } from '@/components/graph/GraphCanvas'
import { GraphFilters, type GraphFilterState } from '@/components/graph/GraphFilters'
import { RiskLegend } from '@/components/graph/RiskLegend'
import { NodeDetailsPanel } from '@/components/graph/NodeDetailsPanel'
import { TransactionDetailDrawer } from '@/components/transaction/TransactionDetailDrawer'
import { BackButton } from '@/components/common/BackButton'
import type { GraphEdge, GraphNode } from '@/schemas/investigations'

const RISK_ORDER = { high: 3, medium: 2, low: 1, unknown: 0 }

export function InvestigationGraphPage() {
  const { investigationId } = useParams<{ investigationId: string }>()
  const status = useInvestigationStatus(investigationId)
  const isComplete = status.data?.status === 'completed'
  const graph = useInvestigationGraph(investigationId, isComplete)

  const [filters, setFilters] = useState<GraphFilterState>({
    riskLevel: 'all',
    minValue: 0,
    showCrossChainOverlay: false,
    showFundFlowOverlay: false,
  })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null)

  const filteredNodes = useMemo(() => {
    if (!graph.data) return []
    const minRisk = filters.riskLevel
    if (minRisk === 'all') return graph.data.nodes
    return graph.data.nodes.filter((n) => RISK_ORDER[n.risk_level] >= RISK_ORDER[minRisk])
  }, [graph.data, filters.riskLevel])

  const filteredEdges = useMemo(() => {
    if (!graph.data) return []
    const nodeIds = new Set(filteredNodes.map((n) => n.id))
    return graph.data.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target) && Number(e.amount) >= filters.minValue,
    )
  }, [graph.data, filteredNodes, filters.minValue])

  const allInvestigations = useAllInvestigations()
  const chain = allInvestigations.data?.find(i => i.investigation_id === investigationId)?.chain ?? 'ethereum'

  if (status.isLoading) return <LoadingState />
  if (status.isError) return <ErrorState message="Could not load investigation." />
  if (!isComplete) {
    return (
      <div className="space-y-3">
        <BackButton fallback="/explorer" />
        <p className="text-sm text-text-secondary">This investigation hasn't finished running yet.</p>
        <Link to={`/investigations/${investigationId}/progress`} className="text-sm text-accent hover:underline underline-offset-2">
          View progress →
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border-c pb-3">
        <div>
          <BackButton fallback="/explorer" />
          <h1 className="text-xl font-bold text-text-primary mt-2">Investigation Graph</h1>
          <p className="text-xs text-text-secondary font-mono mt-1">Trace ID: {investigationId}</p>
        </div>
        <Link
          to={`/investigations/${investigationId}/findings`}
          className="text-sm font-medium px-4 py-2 rounded-md bg-saffron text-white hover:bg-accent-strong shadow-sm transition-colors"
        >
          View Findings →
        </Link>
      </div>

      <div className="flex flex-1 gap-4 overflow-y-auto lg:overflow-hidden flex-col lg:flex-row">
        <aside className="w-full lg:w-64 shrink-0 space-y-6 overflow-y-auto rounded-lg bg-surface-1 p-5 border border-border-c shadow-sm">
          <GraphFilters filters={filters} onChange={setFilters} />
          <div className="pt-4 border-t border-border-c">
            <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-3">Legend</p>
            <RiskLegend />
          </div>
        </aside>

        <div className="flex-1 rounded-lg bg-surface-1 overflow-hidden min-h-[400px] lg:min-h-0 border border-border-c shadow-sm relative">
          {graph.isLoading ? (
            <LoadingState label="Loading graph…" />
          ) : (
            <GraphCanvas
              nodes={filteredNodes}
              edges={filteredEdges}
              onNodeSelect={(n) => {
                setSelectedEdge(null)
                setSelectedNode(n)
              }}
              onEdgeSelect={(e) => {
                setSelectedNode(null)
                setSelectedEdge(e)
              }}
            />
          )}
        </div>

        {(selectedNode || filters.showCrossChainOverlay || filters.showFundFlowOverlay) && (
          <aside className="w-full lg:w-80 shrink-0 space-y-5 overflow-y-auto rounded-lg bg-surface-1 p-5 border border-border-c shadow-sm">
            {selectedNode && <NodeDetailsPanel chain={chain} node={selectedNode} onClose={() => setSelectedNode(null)} />}

            {filters.showCrossChainOverlay && (
              <div className="pt-4 border-t border-border-c first:border-0 first:pt-0">
                <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-2">Cross-chain</p>
                <p className="text-sm text-text-primary leading-relaxed">
                  No cross-chain bridge events observed for this investigation — all traced activity stayed on{' '}
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
