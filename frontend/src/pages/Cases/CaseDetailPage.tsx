import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCase, useAddWallet } from '@/hooks/useCases'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { Modal } from '@/components/common/Modal'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { AddressDisplay } from '@/components/wallet/AddressDisplay'
import { RiskBadge } from '@/components/risk/RiskBadge'
import { useUiStore } from '@/stores/uiStore'
import clsx from 'clsx'

function AddWalletModal({ caseId, open, onClose }: { caseId: string; open: boolean; onClose: () => void }) {
  const [chain, setChain] = useState('ethereum')
  const [address, setAddress] = useState('')
  const [label, setLabel] = useState('')
  const addWallet = useAddWallet(caseId)
  const pushToast = useUiStore((s) => s.pushToast)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await addWallet.mutateAsync({ chain, address, label: label || undefined, source: 'complaint' })
    pushToast('Wallet added to case', 'success')
    setAddress('')
    setLabel('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Suspect Wallet">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Chain</label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
          >
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Address</label>
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm font-mono text-text-primary"
            placeholder="0x…"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Label (optional)</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
            placeholder="Suspect wallet from complaint"
          />
        </div>
        <button
          type="submit"
          disabled={addWallet.isPending}
          className="rounded-md bg-btn-bg px-4 py-2 text-sm font-medium text-btn-fg hover:bg-accent-strong disabled:opacity-50"
        >
          {addWallet.isPending ? 'Adding…' : 'Add Wallet'}
        </button>
      </form>
    </Modal>
  )
}

export function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const query = useCase(caseId)
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()
  const setCurrentContext = useUiStore((s) => s.setCurrentContext)

  useEffect(() => {
    if (caseId) setCurrentContext({ caseId })
    return () => setCurrentContext({ caseId: null })
  }, [caseId, setCurrentContext])

  if (query.isLoading) return <LoadingState />
  if (query.isError || !query.data) return <ErrorState message="Could not load this case." />

  const c = query.data

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: 'Cases', to: '/cases' }, { label: c.case_id }]} />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">{c.title}</h1>
          <p className="text-xs text-text-tertiary font-mono">{c.case_id}</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span
            className={clsx(
              'px-2.5 py-1 rounded-full capitalize',
              c.priority === 'high' && 'bg-red-950/50 text-red-300',
              c.priority === 'medium' && 'bg-amber-950/50 text-amber-300',
              c.priority === 'low' && 'bg-surface-2 text-text-secondary',
            )}
          >
            {c.priority}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-surface-2 text-text-secondary capitalize">
            {c.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {c.description && <p className="text-sm text-text-secondary max-w-2xl">{c.description}</p>}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary">Wallets</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs px-3 py-1.5 rounded-md bg-surface-2 text-text-primary hover:brightness-125"
          >
            + Add Wallet
          </button>
        </div>
        {c.wallets.length === 0 ? (
          <EmptyState title="No wallets yet" description="Add the suspect wallet reported in the complaint to begin." />
        ) : (
          <div className="space-y-2">
            {c.wallets.map((w) => (
              <div key={w.wallet_id} className="flex items-center justify-between rounded-lg bg-surface-1 px-4 py-3">
                <div className="flex items-center gap-3">
                  <AddressDisplay chain={w.chain} address={w.address} />
                  {w.label && <span className="text-xs text-text-tertiary">{w.label}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge level={w.risk_level} />
                  <button
                    onClick={() => navigate(`/investigations/new?case_id=${c.case_id}&chain=${w.chain}&address=${w.address}`)}
                    className="text-xs px-3 py-1.5 rounded-md bg-btn-bg text-btn-fg hover:bg-accent-strong"
                  >
                    Start Investigation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Investigations</h2>
        {c.investigations.length === 0 ? (
          <EmptyState title="No investigations started" />
        ) : (
          <div className="space-y-2">
            {c.investigations.map((inv) => (
              <div key={inv.investigation_id} className="flex items-center justify-between rounded-lg bg-surface-1 px-4 py-3">
                <div>
                  <p className="font-mono text-xs text-text-tertiary">{inv.investigation_id}</p>
                  <AddressDisplay chain={inv.chain} address={inv.start_address} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase text-text-secondary">{inv.status}</span>
                  <Link
                    to={
                      inv.status === 'completed'
                        ? `/investigations/${inv.investigation_id}/graph`
                        : `/investigations/${inv.investigation_id}/progress`
                    }
                    className="text-xs px-3 py-1.5 rounded-md bg-surface-2 text-text-primary hover:brightness-125"
                  >
                    {inv.status === 'completed' ? 'Open graph →' : 'View progress →'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Findings</h2>
        {c.findings.length === 0 ? (
          <EmptyState title="No findings yet" description="Findings appear once an investigation completes." />
        ) : (
          <div className="space-y-2">
            {c.findings.map((f, i) => (
              <div key={i} className="rounded-lg bg-surface-1 px-4 py-3">
                <RiskBadge level={f.severity} />
                <p className="mt-2 text-sm text-text-primary">{f.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Activity</h2>
        <div className="space-y-1.5 text-xs text-text-tertiary">
          {c.activity.map((a, i) => (
            <p key={i}>
              <span className="text-text-tertiary">{new Date(a.timestamp).toLocaleString()}</span>{' '}
              <span className="text-text-secondary">{a.actor}</span> — {a.action}
            </p>
          ))}
        </div>
      </section>

      <AddWalletModal caseId={c.case_id} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
