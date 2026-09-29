import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateCase } from '@/hooks/useCases'
import type { CasePriority } from '@/schemas/cases'
import { BackButton } from '@/components/common/BackButton'
import { LoadingIcon } from '@/components/common/LoadingIcon'

export function CreateCasePage() {
  const [caseNumber, setCaseNumber] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<CasePriority>('medium')
  const createCase = useCreateCase()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const result = await createCase.mutateAsync({ caseNumber, title, description: description || undefined, priority })
      navigate(`/cases/${result.case_id}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create case')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col gap-1">
        <BackButton fallback="/cases" />
        <h1 className="text-2xl font-bold text-text-primary mt-2">New Case Initialization</h1>
        <p className="text-sm text-text-secondary">Open a new file to group related targets and investigations.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg bg-surface-1 p-6 border border-border-c shadow-sm">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Case Number</label>
          <input
            required
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            className="w-full rounded-md bg-bg-app border border-border-c px-4 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors placeholder:text-text-tertiary"
            placeholder="SIH-2026-001"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Case Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md bg-bg-app border border-border-c px-4 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors placeholder:text-text-tertiary"
            placeholder="Crypto Fraud Case 2026-0xx"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md bg-bg-app border border-border-c px-4 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors placeholder:text-text-tertiary resize-none"
            placeholder="Brief context from the complaint — details can be added later."
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as CasePriority)}
            className="w-full rounded-md bg-bg-app border border-border-c px-4 py-2 text-sm text-text-primary focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors"
          >
            <option value="high">High - Urgent Action Required</option>
            <option value="medium">Medium - Standard Review</option>
            <option value="low">Low - Informational Only</option>
          </select>
        </div>
        <div className="pt-2">
          {error && (
            <div role="alert" className="mb-4 rounded-md border border-red/20 bg-red/10 p-3 text-sm font-medium text-red">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={createCase.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-saffron px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong disabled:opacity-50 transition-colors shadow-sm"
          >
            {createCase.isPending ? <><LoadingIcon size="button" />Initializing…</> : 'Create Case'}
          </button>
        </div>
      </form>
    </div>
  )
}
