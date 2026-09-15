import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

const CATEGORIES = ['Technical support', 'Access request', 'Bug report', 'Feature suggestion', 'Other'] as const

const CHANNELS = [
  { icon: '◧', label: 'Platform team', detail: 'General questions about using the platform or a specific case.' },
  { icon: '◆', label: 'Engineering', detail: 'Bugs, outages, or anything under DevOps/Backend.' },
  { icon: '◉', label: 'Access & accounts', detail: 'New accounts, role changes, or access issues — Admin handles these.' },
]

export function ContactPage() {
  const user = useAuthStore((s) => s.user)
  const pushToast = useUiStore((s) => s.pushToast)

  const [name, setName] = useState(user?.name ?? '')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Technical support')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      pushToast('Message queued — a real backend would route this to the right team.', 'success')
    }, 600)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Contact &amp; Support</h1>
        <p className="text-sm text-text-secondary mt-1">
          Questions about a case, a bug in the platform, or an access request — reach the team below.
        </p>
      </div>

      <div className="space-y-2">
        {CHANNELS.map((c) => (
          <div key={c.label} className="flex items-start gap-3 rounded-lg bg-surface-1 p-4">
            <span className="text-lg text-accent" aria-hidden>
              {c.icon}
            </span>
            <div>
              <p className="text-sm font-medium text-text-primary">{c.label}</p>
              <p className="text-xs text-text-tertiary">{c.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-surface-1 p-6">
        <h2 className="text-sm font-semibold text-text-primary">Send a message</h2>

        {sent ? (
          <div className="rounded-md bg-green-950/40 px-4 py-3 text-sm text-green-300">
            Thanks — your message has been queued.{' '}
            <button type="button" onClick={() => setSent(false)} className="underline underline-offset-2">
              Send another
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
                  className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Message</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
                placeholder="What's going on?"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="rounded-md bg-btn-bg px-4 py-2 text-sm font-medium text-btn-fg hover:bg-accent-strong disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </>
        )}
      </form>

      <p className="text-xs text-text-tertiary">
        This build runs entirely on simulated data — this form doesn't send anywhere real; it just shows what the
        flow would look like against a real backend.
      </p>
    </div>
  )
}
