import clsx from 'clsx'
import { AddressDisplay } from '@/components/wallet/AddressDisplay'
import type { Transaction } from '@/schemas/transactions'

export function TransactionRow({
  chain,
  tx,
  onSelect,
}: {
  chain: string
  tx: Transaction
  onSelect?: (tx: Transaction) => void
}) {
  return (
    <tr onClick={() => onSelect?.(tx)} className={clsx('border-b border-border-c/70', onSelect && 'cursor-pointer hover:bg-surface-1/60')}>
      <td className="px-3 py-2 text-xs text-text-secondary whitespace-nowrap">{new Date(tx.timestamp).toLocaleString()}</td>
      <td className="px-3 py-2">
        <span
          className={clsx(
            'text-xs font-semibold',
            tx.direction === 'in' ? 'text-green-400' : 'text-orange-400',
          )}
        >
          {tx.direction === 'in' ? 'IN' : 'OUT'}
        </span>
      </td>
      <td className="px-3 py-2">
        <AddressDisplay chain={chain} address={tx.from} />
      </td>
      <td className="px-3 py-2">
        <AddressDisplay chain={chain} address={tx.to} />
      </td>
      <td className="px-3 py-2 text-sm text-text-primary">{tx.asset}</td>
      <td className="px-3 py-2 text-sm text-text-primary tabular-nums">{tx.amount}</td>
      <td className="px-3 py-2 font-mono text-xs text-text-tertiary">{tx.tx_hash.slice(0, 10)}…</td>
    </tr>
  )
}
