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
      <div className="flex items-center justify-between border-b border-border-c px-6 py-4 bg-bg-app">
        <h2 className="text-lg font-bold text-text-primary">Transaction Profile</h2>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary text-2xl leading-none transition-colors">
          &times;
        </button>
      </div>
      <div className="p-6 space-y-5">
        {query.isLoading && <LoadingState />}
        {query.isError && <ErrorState message="Could not load transaction." />}
        {query.data && (
          <>
            <Field label="Tx Hash">
              <span className="font-mono text-sm font-medium text-text-primary break-all">{query.data.tx_hash}</span>
            </Field>
            <Field label="Timestamp">
              <span className="font-mono text-sm text-text-primary">{new Date(query.data.timestamp).toLocaleString()}</span>
            </Field>
            <Field label="Originating Wallet (From)">
              <div className="bg-surface-1 p-3 rounded-md border border-border-c">
                <AddressDisplay chain={chain} address={query.data.from} />
              </div>
            </Field>
            <Field label="Destination Wallet (To)">
              <div className="bg-surface-1 p-3 rounded-md border border-border-c">
                <AddressDisplay chain={chain} address={query.data.to} />
              </div>
            </Field>
            <Field label="Transferred Amount">
              <span className="text-lg font-bold text-text-primary">{query.data.amount} <span className="text-sm font-medium text-text-secondary">{query.data.asset}</span></span>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Block">
                <span className="font-mono text-sm text-text-primary">{query.data.block_number}</span>
              </Field>
              <Field label="Status">
                <span className="text-sm font-bold uppercase tracking-widest text-green">{query.data.status}</span>
              </Field>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">{label}</p>
      <div>{children}</div>
    </div>
  )
}
