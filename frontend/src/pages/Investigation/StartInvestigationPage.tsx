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
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col gap-1">
        <BackButton fallback={caseId ? `/cases/${caseId}` : '/cases'} />
        <h1 className="text-2xl font-bold text-text-primary mt-2">Start Investigation</h1>
        <p className="text-sm text-text-secondary">Configure intelligence extraction parameters for the selected target.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg bg-surface-1 p-6 border border-border-c shadow-sm">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Chain</label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            className="w-full rounded-md bg-bg-app border border-border-c px-3 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors"
          >
            <option value="ethereum">Ethereum (ETH)</option>
            <option value="polygon">Polygon (MATIC)</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Suspect wallet address</label>
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-md bg-bg-app border border-border-c px-3 py-2 text-sm font-mono text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors placeholder:text-text-tertiary"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">
            Max hops ({maxHops})
          </label>
          <input
            type="range"
            min={1}
            max={8}
            value={maxHops}
            onChange={(e) => setMaxHops(Number(e.target.value))}
            className="w-full accent-saffron"
          />
          <p className="text-xs text-text-secondary mt-2">
            How many transaction relationships away from the starting wallet the system should analyze.
          </p>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Minimum value (USD-equivalent)</label>
          <input
            type="number"
            min={0}
            value={minValue}
            onChange={(e) => setMinValue(Number(e.target.value))}
            className="w-full rounded-md bg-bg-app border border-border-c px-3 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">From date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-md bg-bg-app border border-border-c px-3 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">To date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-md bg-bg-app border border-border-c px-3 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={startInvestigation.isPending || !caseId}
          className="w-full rounded-md bg-saffron px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong disabled:opacity-50 transition-colors shadow-sm mt-4"
        >
          {startInvestigation.isPending ? 'Initializing trace…' : 'Start Investigation'}
        </button>
        {!caseId && <p className="text-xs text-red font-medium mt-2">Missing case context — start this from a case's wallet list.</p>}
      </form>
    </div>
  )
}
