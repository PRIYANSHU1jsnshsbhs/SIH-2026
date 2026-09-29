import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLogin, useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { LoadingIcon } from '@/components/common/LoadingIcon'
import investigationIllustration from '@/assets/login-investigation-illustration.png'
import './LoginPage.css'

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9 5 9 5a15.6 15.6 0 01-2.1 2.5M6.6 6.6C4.3 8.1 3 10 3 10s3.5 5 9 5c1.2 0 2.3-.2 3.3-.6" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z" /><circle cx="12" cy="12" r="2.4" /></svg>
  )
}

function ThemeIcon({ theme }: { theme: 'light' | 'dark' }) {
  return theme === 'dark' ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.2A8.5 8.5 0 018.8 3.8a8.5 8.5 0 1011.4 11.4z" /></svg>
  )
}

function NetworkOverlay() {
  return (
    <svg className="login-brand__network" viewBox="0 0 520 250" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M28 196L110 136l72 41 82-103 91 55 137-92" />
        <path d="M110 136L74 58m108 119l-4-119m86 16l73 119m18-64l72 78" />
      </g>
      <g fill="currentColor">
        <circle cx="28" cy="196" r="4" /><circle cx="110" cy="136" r="6" /><circle cx="182" cy="177" r="5" />
        <circle cx="264" cy="74" r="7" /><circle cx="355" cy="129" r="5" /><circle cx="492" cy="37" r="4" />
        <circle cx="74" cy="58" r="4" /><circle cx="178" cy="58" r="4" /><circle cx="337" cy="193" r="4" /><circle cx="427" cy="207" r="5" />
      </g>
    </svg>
  )
}

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useLogin()
  const logout = useLogout()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login.mutateAsync({ username: username.trim(), password })
      const requestedPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
      navigate(requestedPath || '/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand" aria-labelledby="login-brand-title">
        <Link to="/" className="login-brand__eyebrow">SIH 2026 · PS 26182</Link>
        <div className="login-brand__copy">
          <h1 id="login-brand-title">Trace Crypto Funds.</h1>
        </div>
        <div className="login-brand__visual" aria-hidden="true">
          <NetworkOverlay />
          <img src={investigationIllustration} alt="" />
        </div>
      </section>

      <section className="login-access" aria-label="Account access">
        <button type="button" onClick={toggleTheme} className="login-theme-toggle" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          <ThemeIcon theme={theme} />
        </button>

        <div className="login-access__inner">
          {token && user ? (
            <div className="login-signed-in">
              <span className="login-signed-in__badge" aria-hidden="true">{user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
              <p className="login-access__kicker">Secure session active</p>
              <h2>Welcome Back</h2>
              <p>You are signed in as <strong>{user.name}</strong>.</p>
              <Link to="/dashboard" className="login-primary-action">Go to Dashboard</Link>
              <button type="button" className="login-secondary-action" onClick={logout}>Log out securely</button>
            </div>
          ) : (
            <div className="login-form-wrap">
              <header className="login-form-header">
                <p className="login-access__kicker">Secure investigator access</p>
                <h2>Welcome Back</h2>
                <p>Sign in to access the investigation platform.</p>
              </header>

              <form onSubmit={handleSubmit} className="login-form" noValidate>
                <div className="login-field">
                  <label htmlFor="login-username">Username</label>
                  <input id="login-username" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} autoFocus required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" />
                </div>

                <div className="login-field">
                  <label htmlFor="login-password">Password</label>
                  <div className="login-password-field">
                    <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                    <button type="button" className="login-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
                      <EyeIcon hidden={showPassword} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="login-error" role="alert">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 4h.01" /></svg>
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="login-submit" disabled={login.isPending}>
                  {login.isPending ? <><LoadingIcon size="button" />Authenticating…</> : 'Login'}
                </button>
              </form>

              <div className="login-demo-note"><span>Demo access</span><code>admin / admin123</code></div>
            </div>
          )}
        </div>

        <footer className="login-access__footer"><span>Secure environment</span><i aria-hidden="true" /><span>Simulated data</span></footer>
      </section>
    </main>
  )
}
