import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useWallet, useWalletEntity, useWalletRisk, useWalletTransactions } from '@/hooks/useWallet'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { AddressDisplay } from '@/components/wallet/AddressDisplay'
import { RiskBadge } from '@/components/risk/RiskBadge'
import { EntityBadge } from '@/components/entity/EntityBadge'
import { ConfidenceBadge } from '@/components/entity/ConfidenceBadge'
import { TransactionTable } from '@/components/transaction/TransactionTable'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { BackButton } from '@/components/common/BackButton'
import clsx from 'clsx'

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-surface-1 px-5 py-4 border border-border-c shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
    </div>
  )
}

export function WalletPage() {
  const { chain, address } = useParams<{ chain: string; address: string }>()
  const wallet = useWallet(chain, address)
  const entity = useWalletEntity(chain, address)
  const risk = useWalletRisk(chain, address)
  const transactions = useWalletTransactions(chain, address)
  const [tab, setTab] = useState<'overview' | 'transactions'>('overview')

  if (wallet.isLoading) return <LoadingState />
  if (wallet.isError || !wallet.data) return <ErrorState message="Could not load this wallet." />

  const w = wallet.data

  return (
    <div className="max-w-5xl space-y-6 pb-10">
      <BackButton fallback="/cases" />
      <Breadcrumbs items={[{ label: 'Wallet Intelligence Profile' }]} />

      <div className="flex items-start justify-between border-b border-border-c pb-4">
        <div>
          <AddressDisplay chain={w.chain} address={w.address} link={false} />
          <p className="text-xs font-bold tracking-widest uppercase text-text-secondary mt-2">{w.chain} Network</p>
        </div>
        <RiskBadge level={w.risk.level} score={w.risk.score} />
      </div>

      {entity.data?.entity && (
        <div className="flex items-center gap-3">
          <EntityBadge name={entity.data.entity.name} type={entity.data.entity.type} />
          <ConfidenceBadge value={entity.data.entity.confidence} />
          <span className="text-[11px] font-mono text-text-tertiary">
            SOURCE: {entity.data.evidence[0]?.source} · VERIFIED: {entity.data.evidence[0]?.last_verified}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Transactions" value={w.transaction_count} />
        <StatTile label="Total Received" value={`${w.total_received} ETH`} />
        <StatTile label="Total Sent" value={`${w.total_sent} ETH`} />
        <StatTile label="Counterparties" value={w.unique_counterparties} />
      </div>

      {risk.data && risk.data.reasons.length > 0 && (
        <div className="rounded-lg bg-surface-1 p-6 border border-border-c shadow-sm">
          <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-4">Risk Profile Analysis</p>
          <div className="space-y-3">
            {risk.data.reasons.map((r) => (
              <div key={r.signal} className="flex items-center gap-4 text-sm">
                <span className="w-48 font-medium text-text-primary">{r.signal.replaceAll('_', ' ')}</span>
                <div className="h-2 flex-1 rounded-full bg-surface-2 overflow-hidden shadow-inner">
                  <div className="h-full bg-red" style={{ width: `${r.weight * 200}%` }} />
                </div>
                <span className="text-xs font-mono font-bold text-red w-12 text-right">+{Math.round(r.weight * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6 border-b border-border-c pt-2">
        {(['overview', 'transactions'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px',
              tab === t ? 'border-saffron text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-6 text-sm text-text-primary bg-surface-1 p-6 rounded-lg border border-border-c shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">First Active</p>
            <p className="font-mono">{new Date(w.first_seen).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Last Active</p>
            <p className="font-mono">{new Date(w.last_seen).toLocaleString()}</p>
          </div>
        </div>
      )}

      {tab === 'transactions' &&
        (transactions.isLoading ? (
          <LoadingState />
        ) : (
          <div className="rounded-lg border border-border-c overflow-hidden shadow-sm">
            <TransactionTable chain={w.chain} transactions={transactions.data?.transactions ?? []} />
          </div>
        ))}
    </div>
  )
}
