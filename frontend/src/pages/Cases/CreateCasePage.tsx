import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateCase } from '@/hooks/useCases'
import type { CasePriority } from '@/schemas/cases'
import { BackButton } from '@/components/common/BackButton'

export function CreateCasePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<CasePriority>('medium')
  const createCase = useCreateCase()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = await createCase.mutateAsync({ title, description: description || undefined, priority })
    navigate(`/cases/${result.case_id}`)
  }

  return (
    <div className="max-w-lg space-y-6">
      <BackButton fallback="/cases" />
      <h1 className="text-lg font-semibold text-text-primary">New Case</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-surface-1 p-6">
        <div>
          <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
            placeholder="Crypto Fraud Case 2026-0xx"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
            placeholder="Brief context from the complaint — details can be added later."
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as CasePriority)}
            className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={createCase.isPending}
          className="rounded-md bg-btn-bg px-4 py-2 text-sm font-medium text-btn-fg hover:bg-accent-strong disabled:opacity-50"
        >
          {createCase.isPending ? 'Creating…' : 'Create Case'}
        </button>
      </form>
    </div>
  )
}
