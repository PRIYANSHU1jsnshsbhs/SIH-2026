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
    <tr onClick={() => onSelect?.(tx)} className={clsx('border-b border-border-c transition-colors', onSelect && 'cursor-pointer hover:bg-bg-app')}>
      <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">{new Date(tx.timestamp).toLocaleString()}</td>
      <td className="px-4 py-3">
        <span
          className={clsx(
            'text-[10px] tracking-wider uppercase font-bold',
            tx.direction === 'in' ? 'text-green' : 'text-saffron',
          )}
        >
          {tx.direction === 'in' ? 'IN' : 'OUT'}
        </span>
      </td>
      <td className="px-4 py-3">
        <AddressDisplay chain={chain} address={tx.from} />
      </td>
      <td className="px-4 py-3">
        <AddressDisplay chain={chain} address={tx.to} />
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-text-primary">{tx.asset}</td>
      <td className="px-4 py-3 text-sm font-mono text-text-primary tabular-nums">{tx.amount}</td>
      <td className="px-4 py-3 font-mono text-xs text-text-tertiary">{tx.tx_hash.slice(0, 10)}…</td>
    </tr>
  )
}
