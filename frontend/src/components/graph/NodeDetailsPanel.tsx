import { Link } from 'react-router-dom'
import type { GraphNode } from '@/schemas/investigations'
import { RiskBadge } from '@/components/risk/RiskBadge'
import { EntityBadge } from '@/components/entity/EntityBadge'
import { AddressDisplay } from '@/components/wallet/AddressDisplay'

export function NodeDetailsPanel({ chain, node, onClose }: { chain: string; node: GraphNode; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between border-b border-border-c pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">
            {node.is_seed ? 'Seed Target' : node.type}
          </p>
          <AddressDisplay chain={chain} address={node.id} link={false} />
        </div>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary text-2xl leading-none transition-colors">
          &times;
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <RiskBadge level={node.risk_level} score={node.risk_score} />
        {node.entity_name && <EntityBadge name={node.entity_name} type="VASP" />}
      </div>

      <Link
        to={`/wallets/${chain}/${node.id}`}
        className="inline-block text-sm font-medium px-4 py-2 rounded-md bg-surface-1 text-text-primary border border-border-strong hover:bg-surface-2 transition-colors shadow-sm w-full text-center mt-2"
      >
        Open full profile →
      </Link>
    </div>
  )
}
