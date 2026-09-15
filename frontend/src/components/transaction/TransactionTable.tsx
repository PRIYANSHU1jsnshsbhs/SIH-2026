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
      <div className="overflow-x-auto rounded-lg bg-surface-1">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-c bg-surface-2 text-xs uppercase tracking-wide text-text-tertiary">
              <th className="px-3 py-2 font-medium">Time</th>
              <th className="px-3 py-2 font-medium">Direction</th>
              <th className="px-3 py-2 font-medium">From</th>
              <th className="px-3 py-2 font-medium">To</th>
              <th className="px-3 py-2 font-medium">Asset</th>
              <th className="px-3 py-2 font-medium">Amount</th>
              <th className="px-3 py-2 font-medium">Tx Hash</th>
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
