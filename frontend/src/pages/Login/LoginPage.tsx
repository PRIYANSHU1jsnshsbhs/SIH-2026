import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin, useLogout } from '@/hooks/useAuth'
import { useReports } from '@/hooks/useReports'
import { useAuthStore } from '@/stores/authStore'
import { ApiRequestError } from '@/api/envelope'
import type { Role } from '@/schemas/auth'

const FEATURES = [
  { icon: '◈', text: 'Trace funds across hops, mixers, and bridges' },
  { icon: '◎', text: 'Attribute wallets to known exchanges, with confidence' },
  { icon: '▥', text: 'Generate evidence-backed reports for the case file' },
]

/** What "the home page feel" means per role: a distinct accent, icon, and
 * tagline for the welcome-back card, plus which extra shortcuts it offers
 * beyond "Go to Dashboard" — this is the whole point of the panel changing
 * per role instead of being one generic "you're logged in" box. */
const ROLE_INFO: Record<Role, { hex: string; icon: string; label: string; tagline: string }> = {
  investigator: { hex: '#2563eb', icon: '◧', label: 'Investigator', tagline: 'Case work and fund-tracing tools' },
  admin: { hex: '#d97706', icon: '◉', label: 'Admin', tagline: 'Oversight across cases, users, and system health' },
  devops: { hex: '#8b5cf6', icon: '◆', label: 'Dev', tagline: 'Platform internals — indexers, jobs, and data' },
}

const ROLE_SHORTCUTS: Record<Role, { to: string; icon: string; label: string }[]> = {
  investigator: [{ to: '/cases/new', icon: '+', label: 'New Case' }],
  admin: [{ to: '/adminops', icon: '◉', label: 'AdminOps' }],
  devops: [
    { to: '/devops', icon: '◆', label: 'DevOps' },
    { to: '/backend', icon: '▧', label: 'Backend' },
  ],
}

/** A quiet network motif — a handful of connected nodes. Mostly still, like
 * before, but two of the edges nearest the accent node carry a slow crawling
 * dash and the accent node itself breathes — a small, on-theme nod to "a
 * trace in progress" rather than a static diagram. */
function NetworkMotif() {
  return (
    <svg
      viewBox="0 0 320 220"
      className="absolute right-0 top-1/2 hidden h-56 w-80 -translate-y-1/2 text-border-strong opacity-60 lg:block"
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="40" y1="60" x2="140" y2="40" />
        <line x1="230" y1="70" x2="290" y2="140" />
        <line x1="120" y1="130" x2="60" y2="180" />
        <line x1="120" y1="130" x2="200" y2="190" />
      </g>
      <g stroke="currentColor" strokeWidth="1" fill="none" className="text-accent/70">
        <line
          x1="140"
          y1="40"
          x2="230"
          y2="70"
          strokeDasharray="4 4"
          className="animate-trace-dash"
        />
        <line
          x1="140"
          y1="40"
          x2="120"
          y2="130"
          strokeDasharray="4 4"
          className="animate-trace-dash"
        />
        <line
          x1="120"
          y1="130"
          x2="230"
          y2="70"
          strokeDasharray="4 4"
          className="animate-trace-dash"
        />
      </g>
      <g fill="currentColor">
        <circle cx="40" cy="60" r="4" />
        <circle cx="140" cy="40" r="5" />
        <circle cx="230" cy="70" r="4" />
        <circle cx="290" cy="140" r="4" />
        <circle cx="60" cy="180" r="4" />
        <circle cx="200" cy="190" r="4" />
      </g>
      <circle cx="120" cy="130" r="12" className="animate-glow-breathe text-accent" fill="currentColor" opacity={0.25} />
      <circle cx="120" cy="130" r="7" className="text-accent" fill="currentColor" />
    </svg>
  )
}

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const login = useLogin()
  const logout = useLogout()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const reports = useReports(!!token)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      // No navigate() here on purpose: this page IS the main page, the sign-in
      // form is just one thing on it. A successful login swaps that form for
      // the "Welcome back" panel below, in place — the user chooses whether
      // to go on to the dashboard.
      await login.mutateAsync({ username, password })
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Login failed')
    }
  }

  const roleInfo = user ? ROLE_INFO[user.role] : null

  return (
    <div className="relative flex min-h-screen items-center overflow-hidden bg-surface-0 px-4 py-10">
      <div
        className="animate-glow-breathe pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-[background-color,width,height] duration-700 ease-out"
        style={{
          backgroundColor: `${roleInfo?.hex ?? '#2563eb'}1a`,
          width: roleInfo ? '48rem' : '36rem',
          height: roleInfo ? '48rem' : '36rem',
        }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div className="relative">
          <NetworkMotif />
          <div className="relative max-w-md">
            <p className="animate-fade-up text-xs uppercase tracking-widest text-text-tertiary">SIH 2026 · PS 26183</p>
            <h1 className="animate-fade-up mt-2 text-3xl font-semibold leading-tight [animation-delay:80ms]">
              <span className="bg-gradient-to-r from-text-primary to-accent bg-clip-text text-transparent">
                Crypto Fraud Attribution Platform
              </span>
            </h1>
            <p className="animate-fade-up mt-4 text-sm leading-relaxed text-text-secondary [animation-delay:160ms]">
              Given a suspect wallet reported by a victim, trace where the funds went and who received them —
              across hops, mixers, and exchanges — in minutes instead of days.
            </p>

            <ul className="animate-fade-up mt-8 space-y-3 [animation-delay:240ms]">
              {FEATURES.map((f) => (
                <li key={f.text} className="group flex items-start gap-3 text-sm text-text-secondary">
                  <span className="mt-0.5 text-accent transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
                    {f.icon}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            <p className="animate-fade-up mt-8 text-xs text-text-tertiary [animation-delay:320ms]">
              Built for law-enforcement investigators. This build runs entirely on simulated data — no real
              blockchain, case, or personal data is connected.
            </p>
          </div>
        </div>

        {token && user && roleInfo ? (
          <div
            className="animate-fade-up w-full max-w-sm space-y-5 rounded-lg bg-surface-1 p-6 shadow-xl shadow-black/20 [animation-delay:120ms] lg:justify-self-end"
            style={{ borderTop: `3px solid ${roleInfo.hex}` }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
                style={{ backgroundColor: `${roleInfo.hex}22`, color: roleInfo.hex }}
                aria-hidden
              >
                {roleInfo.icon}
              </span>
              <div>
                <h2 className="text-base font-semibold text-text-primary">Welcome back, {user.name}</h2>
                <p className="text-xs text-text-tertiary">
                  {roleInfo.label} · {roleInfo.tagline}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                to="/dashboard"
                className="block w-full rounded-md bg-btn-bg py-2 text-center text-sm font-medium text-btn-fg transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-lg hover:shadow-accent/30"
              >
                Go to Dashboard →
              </Link>
              {ROLE_SHORTCUTS[user.role].map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="flex items-center gap-2 rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-3"
                >
                  <span aria-hidden>{s.icon}</span>
                  {s.label}
                </Link>
              ))}
              <Link
                to="/reports"
                className="flex items-center justify-between rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-3"
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden>▥</span>
                  My Reports
                </span>
                <span className="text-xs text-text-tertiary">
                  {reports.data ? `${reports.data.reports.length} generated` : '…'}
                </span>
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-2 rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-3"
              >
                <span aria-hidden>✉</span>
                Contact Us
              </Link>
            </div>

            <button
              onClick={logout}
              className="w-full text-center text-xs text-text-tertiary hover:text-text-secondary"
            >
              Log out
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="animate-fade-up w-full max-w-sm space-y-4 rounded-lg bg-surface-1 p-6 shadow-xl shadow-black/20 [animation-delay:120ms] lg:justify-self-end"
          >
            <div>
              <h2 className="text-base font-semibold text-text-primary">Sign in</h2>
              <p className="text-xs text-text-tertiary">Use one of the demo accounts below to explore the platform.</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Username</label>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
                placeholder="demo"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-surface-2 px-3 py-2 text-sm text-text-primary"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full rounded-md bg-btn-bg py-2 text-sm font-medium text-btn-fg transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-lg hover:shadow-accent/30 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="text-xs text-text-tertiary pt-2 border-t border-border-c">
              Demo accounts (password: "thisisit"): demo · admin · dev · mock
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
