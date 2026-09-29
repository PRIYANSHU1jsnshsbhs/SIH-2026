import { Link } from 'react-router-dom'
import type { GraphNode } from '@/schemas/investigations'
import { RiskBadge } from '@/components/risk/RiskBadge'
import { EntityBadge } from '@/components/entity/EntityBadge'
import { AddressDisplay } from '@/components/wallet/AddressDisplay'
import { ConfidenceBadge } from '@/components/entity/ConfidenceBadge'

export function NodeDetailsPanel({ chain, node, onClose }: { chain: string; node: GraphNode; onClose: () => void }) {
  const isVasp = Boolean(node.is_vasp) || node.type === 'vasp' || node.type === 'exchange'
  const isStart = node.is_seed
  const hopCount = node.hop
  const nodeChain = node.chain || chain

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between border-b border-border-c pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">
            {node.is_seed ? 'Start Wallet' : node.type}
          </p>
          <AddressDisplay chain={nodeChain} address={node.address} link={false} />
        </div>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary text-2xl leading-none transition-colors">
          &times;
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <RiskBadge level={node.risk_level} score={node.risk_score} />
        {node.entity_name && <EntityBadge name={node.entity_name} type={node.type.toUpperCase()} />}
        {node.confidence != null && <ConfidenceBadge value={node.confidence} />}
      </div>

      <div className="space-y-2 py-2 border-y border-border-c text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary font-medium">Chain:</span>
          <span className="text-text-primary font-semibold uppercase">{nodeChain}</span>
        </div>
        
        {hopCount !== undefined && (
          <div className="flex justify-between">
            <span className="text-text-secondary font-medium">Hop Count:</span>
            <span className="text-text-primary font-semibold">{hopCount}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-text-secondary font-medium">Entity Type:</span>
          <span className="text-text-primary font-semibold capitalize">{node.type}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary font-medium">Incoming Transactions:</span>
          <span className="text-text-primary font-semibold">{node.incoming_count ?? 0}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary font-medium">Outgoing Transactions:</span>
          <span className="text-text-primary font-semibold">{node.outgoing_count ?? 0}</span>
        </div>

        {isStart && (
          <div className="flex justify-between">
            <span className="text-text-secondary font-medium">Role:</span>
            <span className="text-saffron font-bold">START WALLET</span>
          </div>
        )}

        {isVasp && (
          <div className="flex justify-between">
            <span className="text-text-secondary font-medium">Attribution:</span>
            <span className="text-saffron font-bold">{node.is_nearest_vasp ? 'NEAREST IDENTIFIED VASP' : 'IDENTIFIED VASP'}</span>
          </div>
        )}

        {node.is_nearest_vasp && node.attribution_amount != null && (
          <div className="flex justify-between">
            <span className="text-text-secondary font-medium">Received Amount:</span>
            <span className="text-text-primary font-semibold font-mono">{node.attribution_amount} {node.attribution_asset || ''}</span>
          </div>
        )}
      </div>

      <Link
        to={`/wallets/${nodeChain}/${node.address}`}
        className="inline-block text-sm font-medium px-4 py-2 rounded-md bg-surface-1 text-text-primary border border-border-strong hover:bg-surface-2 transition-colors shadow-sm w-full text-center mt-2"
      >
        Open full profile  
      </Link>
    </div>
  )
}
