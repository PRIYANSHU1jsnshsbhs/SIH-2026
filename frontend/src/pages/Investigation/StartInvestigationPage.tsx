import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStartInvestigation } from '@/hooks/useInvestigation'
import { BackButton } from '@/components/common/BackButton'
import { LoadingIcon } from '@/components/common/LoadingIcon'
import { isWalletAddressValid, walletAddressError } from '@/schemas/cases'
import { startInvestigationInputSchema } from '@/schemas/investigations'

export function StartInvestigationPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const startInvestigation = useStartInvestigation()

  const [caseId] = useState(params.get('case_id') ?? '')
  const [chain, setChain] = useState(params.get('chain') ?? '')
  const [address, setAddress] = useState(params.get('address') ?? '')
  const [maxHops, setMaxHops] = useState(4)
  const [minValue, setMinValue] = useState(0)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isValid = !chain || !address || isWalletAddressValid(chain, address)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return

    setErrorMsg(null)
    const parsed = startInvestigationInputSchema.safeParse({
      case_id: caseId,
      chain,
      start_address: address,
      max_hops: maxHops,
      min_value: minValue,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    })
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message || 'Invalid investigation parameters')
      return
    }
    setIsSubmitting(true)

    try {
      const result = await startInvestigation.mutateAsync(parsed.data)
      // Only navigate on absolute success
      navigate(`/investigations/${result.investigation_id}/progress`)
    } catch (err: any) {
      // Re-enable on failure
      setIsSubmitting(false)
      if (err.message?.toLowerCase().includes('already exists') || err.message?.includes('duplicate')) {
        setErrorMsg('An investigation for this wallet is already running or completed in this case.')
      } else {
        setErrorMsg(err.message || 'Unable to start investigation. Please try again.')
      }
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col gap-1">
        <BackButton fallback={caseId ? `/cases/${caseId}` : '/cases'} />
        <h1 className="text-2xl font-bold text-text-primary mt-2">Start Investigation</h1>
        <p className="text-sm text-text-secondary">Configure intelligence extraction parameters for the selected target.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg bg-surface-1 p-6 border border-border-c shadow-sm">
        
        {errorMsg && (
          <div className="rounded-md bg-red/10 border border-red/20 p-4">
            <h3 className="text-sm font-bold text-red">Unable to start investigation</h3>
            <p className="mt-1 text-sm text-red/80">{errorMsg}</p>
          </div>
        )}

        {!isValid && address && chain && (
          <div className="rounded-md bg-red/10 border border-red/20 p-4">
            <h3 className="text-sm font-bold text-red">Invalid wallet address</h3>
            <p className="mt-1 text-sm text-red/80">{walletAddressError(chain)}</p>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Chain</label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            disabled={!!params.get('chain')}
            className="w-full rounded-md bg-bg-app border border-border-c px-3 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>Select Chain...</option>
            <option value="ethereum">Ethereum (ETH)</option>
            <option value="polygon">Polygon (MATIC)</option>
            <option value="mock">Mock (Dataset)</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Suspect wallet address</label>
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={!!params.get('address')}
            className="w-full rounded-md bg-bg-app border border-border-c px-3 py-2 text-sm font-mono text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors placeholder:text-text-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">
            Max hops ({maxHops})
          </label>
          <input
            type="range"
            min={1}
            max={5}
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
          disabled={isSubmitting || startInvestigation.isPending || !caseId || !chain || !isValid || !address}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-saffron px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong disabled:opacity-50 transition-colors shadow-sm"
        >
          {isSubmitting || startInvestigation.isPending ? <><LoadingIcon size="button" />Initializing trace…</> : 'Start Investigation'}
        </button>
        {!caseId && <p className="text-xs text-red font-medium mt-2">Missing case context — start this from a case's wallet list.</p>}
      </form>
    </div>
  )
}
