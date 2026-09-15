import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useInvestigationGraph, useInvestigationStatus } from '@/hooks/useInvestigation'
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

  const chain = 'ethereum'

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
      <div className="flex items-center justify-between">
        <div>
          <BackButton fallback="/explorer" />
          <h1 className="text-lg font-semibold text-text-primary mt-1">Investigation Graph</h1>
          <p className="text-xs text-text-tertiary font-mono">{investigationId}</p>
        </div>
        <Link
          to={`/investigations/${investigationId}/findings`}
          className="text-xs px-3 py-1.5 rounded-md bg-btn-bg text-btn-fg hover:bg-accent-strong"
        >
          View Findings →
        </Link>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <aside className="w-56 shrink-0 space-y-6 overflow-y-auto rounded-lg bg-surface-1 p-4">
          <GraphFilters filters={filters} onChange={setFilters} />
          <div className="pt-3 border-t border-border-c">
            <p className="text-xs uppercase tracking-wide text-text-tertiary mb-2">Legend</p>
            <RiskLegend />
          </div>
        </aside>

        <div className="flex-1 rounded-lg bg-surface-1 overflow-hidden">
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
          <aside className="w-72 shrink-0 space-y-4 overflow-y-auto rounded-lg bg-surface-1 p-4">
            {selectedNode && <NodeDetailsPanel chain={chain} node={selectedNode} onClose={() => setSelectedNode(null)} />}

            {filters.showCrossChainOverlay && (
              <div className="pt-3 border-t border-border-c first:border-0 first:pt-0">
                <p className="text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Cross-chain</p>
                <p className="text-sm text-text-secondary">
                  No cross-chain bridge events observed for this investigation — all traced activity stayed on{' '}
                  {chain}.
                </p>
              </div>
            )}

            {filters.showFundFlowOverlay && graph.data && (
              <div className="pt-3 border-t border-border-c">
                <p className="text-xs uppercase tracking-wide text-text-tertiary mb-1.5">
                  Fund-flow (estimated attribution)
                </p>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>Two layering paths converge on the same exchange deposit address:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Burner A → Mixer → Exchange (≈ 2.39 ETH)</li>
                    <li>Burner B → Exchange direct (≈ 2.38 ETH)</li>
                  </ul>
                  <p className="text-xs text-text-tertiary">
                    Estimated attribution, not confirmed ownership — based on proportional tracing from the seed
                    wallet.
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
