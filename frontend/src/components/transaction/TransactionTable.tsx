import { useState } from 'react'
import { TransactionRow } from './TransactionRow'
import { TransactionDetailDrawer } from './TransactionDetailDrawer'
import { EmptyState } from '@/components/common/EmptyState'
import type { Transaction } from '@/schemas/transactions'

export function TransactionTable({ chain, transactions }: { chain: string; transactions: Transaction[] }) {
  const [selected, setSelected] = useState<Transaction | null>(null)

  if (transactions.length === 0) {
    return <EmptyState title="No transactions found" description="This wallet has no indexed activity yet." />
  }

  return (
    <>
      <div className="overflow-x-auto w-full bg-surface-1">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-c bg-surface-2 text-xs uppercase tracking-wide text-text-secondary">
              <th className="px-4 py-3 font-semibold">Time</th>
              <th className="px-4 py-3 font-semibold">Direction</th>
              <th className="px-4 py-3 font-semibold">From</th>
              <th className="px-4 py-3 font-semibold">To</th>
              <th className="px-4 py-3 font-semibold">Asset</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <TransactionRow key={tx.tx_hash} chain={chain} tx={tx} onSelect={setSelected} />
            ))}
          </tbody>
        </table>
      </div>
      <TransactionDetailDrawer chain={chain} txHash={selected?.tx_hash ?? null} onClose={() => setSelected(null)} />
    </>
  )
}
