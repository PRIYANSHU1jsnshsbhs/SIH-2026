import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStartInvestigation } from '@/hooks/useInvestigation'
import { BackButton } from '@/components/common/BackButton'

export function StartInvestigationPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const startInvestigation = useStartInvestigation()

  const [caseId] = useState(params.get('case_id') ?? '')
  const [chain, setChain] = useState(params.get('chain') ?? 'ethereum')
  const [address, setAddress] = useState(params.get('address') ?? '')
  const [maxHops, setMaxHops] = useState(4)
  const [minValue, setMinValue] = useState(0)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = await startInvestigation.mutateAsync({
      case_id: caseId,
      chain,
      start_address: address,
      max_hops: maxHops,
      min_value: minValue,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    })
    navigate(`/investigations/${result.investigation_id}/progress`)
  }

  return (
    <div className="max-w-lg space-y-6">
      <BackButton fallback={caseId ? `/cases/${caseId}` : '/cases'} />
      <h1 className="text-lg font-semibold text-text-primary">Start Investigation</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-surface-1 p-6">
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
          <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Suspect wallet address</label>
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm font-mono text-text-primary"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">
            Max hops ({maxHops})
          </label>
          <input
            type="range"
            min={1}
            max={8}
            value={maxHops}
            onChange={(e) => setMaxHops(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-text-tertiary mt-1">
            How many transaction relationships away from the starting wallet the system should analyze.
          </p>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Minimum value (USD-equivalent)</label>
          <input
            type="number"
            min={0}
            value={minValue}
            onChange={(e) => setMinValue(Number(e.target.value))}
            className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">From date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">To date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={startInvestigation.isPending || !caseId}
          className="rounded-md bg-btn-bg px-4 py-2 text-sm font-medium text-btn-fg hover:bg-accent-strong disabled:opacity-50"
        >
          {startInvestigation.isPending ? 'Starting…' : 'Start Investigation'}
        </button>
        {!caseId && <p className="text-xs text-red-400">Missing case context — start this from a case's wallet list.</p>}
      </form>
    </div>
  )
}
