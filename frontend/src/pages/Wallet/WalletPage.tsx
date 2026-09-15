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
    <div className="rounded-lg bg-surface-1 px-4 py-3">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text-primary">{value}</p>
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
    <div className="space-y-6">
      <BackButton fallback="/cases" />
      <Breadcrumbs items={[{ label: 'Wallet Overview' }]} />

      <div className="flex items-start justify-between">
        <div>
          <AddressDisplay chain={w.chain} address={w.address} link={false} />
          <p className="text-xs text-text-tertiary capitalize mt-1">{w.chain}</p>
        </div>
        <RiskBadge level={w.risk.level} score={w.risk.score} />
      </div>

      {entity.data?.entity && (
        <div className="flex items-center gap-2">
          <EntityBadge name={entity.data.entity.name} type={entity.data.entity.type} />
          <ConfidenceBadge value={entity.data.entity.confidence} />
          <span className="text-xs text-text-tertiary">
            source: {entity.data.evidence[0]?.source} · verified {entity.data.evidence[0]?.last_verified}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Transactions" value={w.transaction_count} />
        <StatTile label="Total received" value={`${w.total_received} ETH`} />
        <StatTile label="Total sent" value={`${w.total_sent} ETH`} />
        <StatTile label="Counterparties" value={w.unique_counterparties} />
      </div>

      {risk.data && risk.data.reasons.length > 0 && (
        <div className="rounded-lg bg-surface-1 p-4">
          <p className="text-xs uppercase tracking-wide text-text-tertiary mb-2">Why this score</p>
          <div className="space-y-1.5">
            {risk.data.reasons.map((r) => (
              <div key={r.signal} className="flex items-center gap-2 text-sm">
                <span className="w-40 text-text-secondary">{r.signal.replaceAll('_', ' ')}</span>
                <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${r.weight * 200}%` }} />
                </div>
                <span className="text-xs text-text-tertiary w-10 text-right">+{Math.round(r.weight * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 border-b border-border-c">
        {(['overview', 'transactions'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'pb-2 text-sm capitalize border-b-2 -mb-px',
              tab === t ? 'border-accent text-accent' : 'border-transparent text-text-tertiary hover:text-text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4 text-sm text-text-secondary">
          <p>First seen: {new Date(w.first_seen).toLocaleString()}</p>
          <p>Last seen: {new Date(w.last_seen).toLocaleString()}</p>
        </div>
      )}

      {tab === 'transactions' &&
        (transactions.isLoading ? (
          <LoadingState />
        ) : (
          <TransactionTable chain={w.chain} transactions={transactions.data?.transactions ?? []} />
        ))}
    </div>
  )
}
