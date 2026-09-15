import { useQuery } from '@tanstack/react-query'
import { fetchTransaction } from '@/api/transactions'
import { AddressDisplay } from '@/components/wallet/AddressDisplay'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'

export function TransactionDetailDrawer({
  chain,
  txHash,
  onClose,
}: {
  chain: string
  txHash: string | null
  onClose: () => void
}) {
  const query = useQuery({
    queryKey: ['transactions', chain, txHash],
    queryFn: () => fetchTransaction(chain, txHash!),
    enabled: !!txHash,
  })

  if (!txHash) return null

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-border-c bg-surface-0 shadow-2xl overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border-c px-5 py-3">
        <h2 className="text-sm font-semibold text-text-primary">Transaction Details</h2>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary text-lg leading-none">
          ×
        </button>
      </div>
      <div className="p-5 space-y-4">
        {query.isLoading && <LoadingState />}
        {query.isError && <ErrorState message="Could not load transaction." />}
        {query.data && (
          <>
            <Field label="Hash">
              <span className="font-mono text-xs break-all">{query.data.tx_hash}</span>
            </Field>
            <Field label="Timestamp">{new Date(query.data.timestamp).toLocaleString()}</Field>
            <Field label="From">
              <AddressDisplay chain={chain} address={query.data.from} />
            </Field>
            <Field label="To">
              <AddressDisplay chain={chain} address={query.data.to} />
            </Field>
            <Field label="Amount">
              {query.data.amount} {query.data.asset}
            </Field>
            <Field label="Block">{query.data.block_number}</Field>
            <Field label="Status">{query.data.status}</Field>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-tertiary mb-1">{label}</p>
      <div className="text-sm text-text-primary">{children}</div>
    </div>
  )
}
