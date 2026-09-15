import { Link } from 'react-router-dom'
import type { GraphNode } from '@/schemas/investigations'
import { RiskBadge } from '@/components/risk/RiskBadge'
import { EntityBadge } from '@/components/entity/EntityBadge'
import { AddressDisplay } from '@/components/wallet/AddressDisplay'

export function NodeDetailsPanel({ chain, node, onClose }: { chain: string; node: GraphNode; onClose: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-tertiary">
            {node.is_seed ? 'Seed wallet' : node.type}
          </p>
          <AddressDisplay chain={chain} address={node.id} link={false} />
        </div>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary text-lg leading-none">
          ×
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <RiskBadge level={node.risk_level} score={node.risk_score} />
        {node.entity_name && <EntityBadge name={node.entity_name} type="VASP" />}
      </div>

      <Link
        to={`/wallets/${chain}/${node.id}`}
        className="inline-block text-xs px-3 py-1.5 rounded-md bg-surface-2 text-text-primary hover:bg-surface-3"
      >
        Open wallet overview →
      </Link>
    </div>
  )
}
