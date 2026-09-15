import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin, useLogout } from '@/hooks/useAuth'
import { useReports } from '@/hooks/useReports'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { ApiRequestError } from '@/api/envelope'
import type { Role } from '@/schemas/auth'

const FEATURES = [
  { 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ), 
    text: 'Trace funds across hops, mixers, and bridges' 
  },
  { 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-3 4h2a1 1 0 011 1v4h-4v-4a1 1 0 011-1z" />
      </svg>
    ), 
    text: 'Attribute wallets to known exchanges, with confidence' 
  },
  { 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ), 
    text: 'Generate evidence-backed reports for the case file' 
  },
]

const ROLE_INFO: Record<Role, { hex: string; icon: string; label: string; tagline: string }> = {
  investigator: { hex: '#102A4C', icon: 'ID', label: 'Investigator', tagline: 'Case work and fund-tracing tools' },
  admin: { hex: '#1F8A4D', icon: 'AD', label: 'Admin', tagline: 'Oversight across cases, users, and system health' },
  devops: { hex: '#F57C00', icon: 'DV', label: 'DevOps', tagline: 'Platform internals — indexers, jobs, and data' },
}

const ROLE_SHORTCUTS: Record<Role, { to: string; icon: React.ReactNode; label: string }[]> = {
  investigator: [{ 
    to: '/cases/new', 
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>, 
    label: 'New Case' 
  }],
  admin: [{ 
    to: '/adminops', 
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, 
    label: 'AdminOps' 
  }],
  devops: [
    { 
      to: '/devops', 
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, 
      label: 'DevOps' 
    },
    { 
      to: '/backend', 
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>, 
      label: 'Backend' 
    },
  ],
}

/** A quiet network motif — a handful of connected nodes. Make it subtle and institutional. */
function NetworkMotif() {
  return (
    <svg
      viewBox="0 0 320 220"
      className="absolute right-0 top-1/2 hidden h-[500px] w-[500px] -translate-y-1/2 translate-x-1/4 text-text-primary opacity-[0.03] lg:block"
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="1.5" fill="none">
        <line x1="40" y1="60" x2="140" y2="40" />
        <line x1="230" y1="70" x2="290" y2="140" />
        <line x1="120" y1="130" x2="60" y2="180" />
        <line x1="120" y1="130" x2="200" y2="190" />
      </g>
      <g stroke="currentColor" strokeWidth="1.5" fill="none">
        <line x1="140" y1="40" x2="230" y2="70" />
        <line x1="140" y1="40" x2="120" y2="130" />
        <line x1="120" y1="130" x2="230" y2="70" />
      </g>
      <g fill="currentColor">
        <circle cx="40" cy="60" r="4" />
        <circle cx="140" cy="40" r="5" />
        <circle cx="230" cy="70" r="4" />
        <circle cx="290" cy="140" r="4" />
        <circle cx="60" cy="180" r="4" />
        <circle cx="200" cy="190" r="4" />
        <circle cx="120" cy="130" r="7" />
      </g>
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
      await login.mutateAsync({ username, password })
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Login failed')
    }
  }

  const roleInfo = user ? ROLE_INFO[user.role] : null

  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-bg-app px-4 py-10">
      {/* Theme Toggle (Top Right) */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-border-c bg-surface-1 text-text-secondary hover:text-saffron shadow-sm transition-colors z-20"
        title="Toggle Theme"
      >
        {theme === 'dark' ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      {/* Subtle radial gradient for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/5 via-bg-app to-bg-app" />
      
      <NetworkMotif />

      <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 mt-10 lg:mt-0">
        <div className="relative">
          <div className="relative max-w-2xl">
            {/* Top Left Identifier */}
            <div className="mb-8 inline-flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">SIH 2026 · PS 26183</span>
              <div className="mt-2 flex h-[2px] w-12 bg-saffron" />
            </div>

            {/* Main Heading */}
            <h1 className="mt-2 text-4xl font-bold leading-[1.15] text-text-primary md:text-5xl lg:text-6xl">
              Crypto Fraud <br className="hidden sm:block" />
              <span className="text-saffron">Attribution</span> Platform
            </h1>
            
            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg">
              Given a suspect wallet reported by a victim, trace where the funds went and who received them — across hops, mixers, and exchanges — in minutes instead of days.
            </p>

            {/* Capability List */}
            <ul className="mt-10 space-y-5">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-medium text-text-primary">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-1 shadow-sm text-saffron border border-border-c">
                    {f.icon}
                  </span>
                  <span className="leading-tight">{f.text}</span>
                </li>
              ))}
            </ul>

            {/* Simulation Disclaimer */}
            <div className="mt-12 flex max-w-lg items-start gap-3 rounded-md bg-surface-2/50 px-4 py-3 border border-border-c/50">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs leading-relaxed text-text-secondary">
                Built for law-enforcement investigators. This build runs entirely on simulated data — no real blockchain, case, or personal data is connected.
              </p>
            </div>
          </div>
        </div>

        {token && user && roleInfo ? (
          <div className="w-full max-w-md rounded-xl bg-surface-1 p-8 shadow-sm border border-border-c border-t-[4px] lg:justify-self-end" style={{ borderTopColor: 'var(--navy-900)' }}>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-2 border border-border-c text-sm font-bold text-text-primary">
                {roleInfo.icon}
              </span>
              <div>
                <h2 className="text-lg font-bold text-text-primary">Welcome back, {user.name}</h2>
                <p className="text-xs font-medium text-text-secondary mt-0.5">
                  {roleInfo.label} · {roleInfo.tagline}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                to="/dashboard"
                className="block w-full rounded-md bg-saffron py-3 text-center text-sm font-bold text-white transition-all hover:bg-saffron/90 focus:outline-none focus:ring-2 focus:ring-saffron focus:ring-offset-2 active:scale-[0.98] shadow-sm"
              >
                Go to Dashboard →
              </Link>
              
              <div className="pt-2 space-y-2">
                {ROLE_SHORTCUTS[user.role].map((s) => (
                  <Link
                    key={s.to}
                    to={s.to}
                    className="group flex items-center justify-between rounded-md bg-surface-1 px-4 py-3 text-sm font-medium text-text-primary border border-border-c transition-colors hover:bg-surface-2"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-text-tertiary group-hover:text-text-primary transition-colors">{s.icon}</span>
                      {s.label}
                    </span>
                    <span className="text-text-tertiary transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                ))}
                <Link
                  to="/reports"
                  className="group flex items-center justify-between rounded-md bg-surface-1 px-4 py-3 text-sm font-medium text-text-primary border border-border-c transition-colors hover:bg-surface-2"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-text-tertiary group-hover:text-text-primary transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </span>
                    My Reports
                  </span>
                  <span className="text-xs font-mono text-text-secondary">
                    {reports.data ? `${reports.data.reports.length} generated` : '…'}
                  </span>
                </Link>
                <Link
                  to="/contact"
                  className="group flex items-center justify-between rounded-md bg-surface-1 px-4 py-3 text-sm font-medium text-text-primary border border-border-c transition-colors hover:bg-surface-2"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-text-tertiary group-hover:text-text-primary transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </span>
                    Contact Us
                  </span>
                  <span className="text-text-tertiary transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-6 w-full text-center text-xs font-medium text-text-tertiary hover:text-red transition-colors"
            >
              Log out securely
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-xl bg-surface-1 p-8 shadow-sm border border-border-c border-t-[4px] border-t-navy-900 lg:justify-self-end"
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold text-text-primary">Secure Access</h2>
              <p className="text-xs text-text-secondary mt-1">Use one of the demo accounts below to explore the platform.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Username</label>
                <input
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md bg-bg-app border border-border-c px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors"
                  placeholder="demo"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md bg-bg-app border border-border-c px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-saffron focus:border-saffron transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="mt-4 text-xs font-bold text-red">{error}</p>}

            <button
              type="submit"
              disabled={login.isPending}
              className="mt-6 w-full rounded-md bg-saffron py-3 text-sm font-bold text-white transition-all hover:bg-saffron/90 focus:outline-none focus:ring-2 focus:ring-saffron focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 shadow-sm"
            >
              {login.isPending ? 'Authenticating…' : 'Sign in'}
            </button>

            <div className="mt-6 pt-4 border-t border-border-c text-center">
              <p className="text-[11px] font-mono text-text-tertiary">
                DEMO: demo · admin · dev · mock (pw: "thisisit")
              </p>
            </div>
          </form>
        )}
      </div>

      <div className="mt-16 w-full max-w-6xl mx-auto flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-tertiary">
        <span>Secure Environment</span>
        <span className="text-border-strong">•</span>
        <span>Simulated Data</span>
        <span className="text-border-strong">•</span>
        <span>SIH 2026</span>
      </div>
    </div>
  )
}
