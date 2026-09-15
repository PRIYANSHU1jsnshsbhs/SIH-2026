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
    <div className="max-w-5xl space-y-8 pb-10">
      <Breadcrumbs items={[{ label: 'Cases', to: '/cases' }, { label: c.case_id }]} />

      <div className="flex items-start justify-between border-b border-border-c pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{c.title}</h1>
          <p className="text-sm font-mono text-text-secondary mt-1 tracking-wide">{c.case_id}</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
          <span
            className={clsx(
              'px-3 py-1.5 rounded-full border shadow-sm',
              c.priority === 'high' && 'bg-red-soft text-red border-red-soft',
              c.priority === 'medium' && 'bg-saffron/10 text-saffron border-saffron/20',
              c.priority === 'low' && 'bg-surface-2 text-text-secondary border-border-c',
            )}
          >
            {c.priority} PRIORITY
          </span>
          <span className="px-3 py-1.5 rounded-full bg-surface-2 text-text-secondary border border-border-c shadow-sm">
            {c.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {c.description && <p className="text-base text-text-primary leading-relaxed max-w-3xl">{c.description}</p>}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">Target Wallets</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="text-sm font-medium px-4 py-2 rounded-md bg-surface-1 text-text-primary border border-border-strong hover:bg-surface-2 transition-colors shadow-sm"
          >
            + Add Wallet
          </button>
        </div>
        {c.wallets.length === 0 ? (
          <EmptyState title="No wallets yet" description="Add the suspect wallet reported in the complaint to begin." />
        ) : (
          <div className="space-y-3">
            {c.wallets.map((w) => (
              <div key={w.wallet_id} className="flex items-center justify-between rounded-lg bg-surface-1 px-5 py-4 border border-border-c shadow-sm transition-colors hover:border-saffron">
                <div className="flex items-center gap-4">
                  <AddressDisplay chain={w.chain} address={w.address} />
                  {w.label && <span className="text-xs font-semibold text-text-secondary bg-surface-2 px-2 py-1 rounded">{w.label}</span>}
                </div>
                <div className="flex items-center gap-4">
                  <RiskBadge level={w.risk_level} />
                  <button
                    onClick={() => navigate(`/investigations/new?case_id=${c.case_id}&chain=${w.chain}&address=${w.address}`)}
                    className="text-sm font-medium px-4 py-2 rounded-md bg-saffron text-white hover:bg-accent-strong transition-colors shadow-sm"
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
        <h2 className="text-lg font-bold text-text-primary mb-4">Investigations</h2>
        {c.investigations.length === 0 ? (
          <EmptyState title="No investigations started" />
        ) : (
          <div className="space-y-3">
            {c.investigations.map((inv) => (
              <div key={inv.investigation_id} className="flex items-center justify-between rounded-lg bg-surface-1 px-5 py-4 border border-border-c shadow-sm">
                <div>
                  <p className="font-mono text-xs text-text-secondary mb-1">{inv.investigation_id}</p>
                  <AddressDisplay chain={inv.chain} address={inv.start_address} />
                </div>
                <div className="flex items-center gap-4">
                  <span className={clsx('text-[10px] font-bold tracking-widest uppercase', inv.status === 'completed' ? 'text-green' : 'text-saffron')}>{inv.status}</span>
                  <Link
                    to={
                      inv.status === 'completed'
                        ? `/investigations/${inv.investigation_id}/graph`
                        : `/investigations/${inv.investigation_id}/progress`
                    }
                    className="text-sm font-medium px-4 py-2 rounded-md bg-surface-1 text-text-primary border border-border-c hover:bg-surface-2 transition-colors shadow-sm"
                  >
                    {inv.status === 'completed' ? 'Open Graph →' : 'View Progress →'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-text-primary mb-4">Intelligence Findings</h2>
        {c.findings.length === 0 ? (
          <EmptyState title="No findings yet" description="Findings appear once an investigation completes." />
        ) : (
          <div className="space-y-3">
            {c.findings.map((f, i) => (
              <div key={i} className="rounded-lg bg-surface-1 px-5 py-4 border border-border-c shadow-sm hover:border-red-soft transition-colors">
                <RiskBadge level={f.severity} />
                <p className="mt-3 text-sm font-medium text-text-primary leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border-c pt-6">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-4">Audit Log</h2>
        <div className="space-y-3 text-xs text-text-secondary">
          {c.activity.map((a, i) => (
            <p key={i} className="flex gap-4">
              <span className="text-text-tertiary font-mono w-36 shrink-0">{new Date(a.timestamp).toLocaleString()}</span>
              <span className="text-text-primary font-semibold">{a.actor}</span>
              <span className="text-text-secondary">{a.action}</span>
            </p>
          ))}
        </div>
      </section>

      <AddWalletModal caseId={c.case_id} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
