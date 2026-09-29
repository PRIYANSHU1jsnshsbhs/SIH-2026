import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AddressDisplay } from '@/components/wallet/AddressDisplay'
import { ConfidenceBadge } from '@/components/entity/ConfidenceBadge'
import { EntityBadge } from '@/components/entity/EntityBadge'
import type { NearestVaspAttribution } from '@/schemas/investigations'
import { createVaspRequest } from '@/api/cases'
import { useUiStore } from '@/stores/uiStore'
import { LoadingIcon } from '@/components/common/LoadingIcon'

export function NearestVaspCard({ 
  vasp, 
  chain, 
  investigationId,
  caseId
}: { 
  vasp: NearestVaspAttribution
  chain: string
  investigationId: string
  caseId: string
}) {
  const [loading, setLoading] = useState(false)
  const pushToast = useUiStore(s => s.pushToast)

  async function handlePrepareRequest() {
    setLoading(true)
    try {
      await createVaspRequest(caseId, investigationId, chain, vasp.deposit_wallet)
      pushToast('VASP Request Drafted successfully', 'success')
    } catch (err: any) {
      pushToast(err.message || 'Failed to prepare VASP request', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg bg-surface-1 p-6 border border-border-c shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-c">
        <div>
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-1">Nearest Identified VASP</h2>
          <p className="text-xs text-text-secondary font-mono">Hop {vasp.hop_count}</p>
        </div>
        <div className="flex gap-2 items-center">
          {vasp.vasp_name && <EntityBadge name={vasp.vasp_name} type={vasp.vasp_type || 'VASP'} />}
          <ConfidenceBadge value={vasp.confidence} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Destination Wallet</p>
          <AddressDisplay chain={chain} address={vasp.deposit_wallet} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Amount Transferred</p>
          <p className="font-mono text-text-primary">
            {vasp.amount != null ? `${vasp.amount}${vasp.asset ? ` ${vasp.asset}` : ''}` : 'Not available'}
          </p>
        </div>
      </div>

      {vasp.evidence && <div className="mb-5 bg-bg-app rounded-md p-3 border border-border-c">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Evidence</p>
        <p className="text-xs text-text-primary font-mono">{vasp.evidence}</p>
      </div>}

      <div className="flex gap-3 pt-2">
        <Link
          to={`/investigations/${investigationId}/graph`}
          className="text-sm font-medium px-4 py-2 rounded-md bg-saffron text-white hover:bg-accent-strong transition-colors shadow-sm"
        >
          Open in Graph
        </Link>
        <button className="text-sm font-medium px-4 py-2 rounded-md bg-surface-1 text-text-primary border border-border-strong hover:bg-surface-2 transition-colors shadow-sm">
          View Path
        </button>
        <button 
          onClick={handlePrepareRequest}
          disabled={loading || !caseId}
          className="ml-auto inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface-1 px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-surface-2 disabled:opacity-50"
        >
          {loading ? <><LoadingIcon size="button" />Preparing…</> : 'Prepare Request'}
        </button>
      </div>
    </div>
  )
}
