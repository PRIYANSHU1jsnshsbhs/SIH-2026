import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useLogout } from '@/hooks/useAuth'
import { useWalletSearch } from '@/hooks/useWallet'

export function TopBar() {
  const user = useAuthStore((s) => s.user)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const setConsoleOpen = useUiStore((s) => s.setConsoleOpen)
  const logout = useLogout()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const searchResults = useWalletSearch(search)

  function handleSearchSelect(chain: string, address: string) {
    setSearch('')
    navigate(`/wallets/${chain}/${address}`)
  }

  return (
    <header className="relative flex h-14 shrink-0 items-center gap-4 border-b border-border-c bg-surface-1 px-4 shadow-sm z-10">
      {/* Subtle Tricolor Accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-[#FFFFFF]"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      <div className="flex items-center gap-4 pt-1">
        <button onClick={toggleSidebar} className="text-text-secondary hover:text-saffron" aria-label="Toggle sidebar">
          ☰
        </button>
        <div className="flex flex-col">
          <Link
            to="/login"
            title="Back to the main page"
            className="font-bold text-text-primary whitespace-nowrap hover:text-saffron leading-tight"
          >
            LAPSUS
          </Link>
          <span className="text-[9px] uppercase tracking-wider text-text-secondary font-medium">Financial Intelligence</span>
        </div>
      </div>

      <div className="relative flex-1 max-w-md ml-4 pt-1">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search wallet address, case, entity…"
          className="w-full rounded-md bg-bg-app border border-border-c px-3 py-1.5 text-sm text-text-primary focus:border-saffron focus:ring-1 focus:ring-saffron placeholder:text-text-tertiary transition-colors"
        />
        {search.length > 2 && searchResults.data && searchResults.data.wallets.length > 0 && (
          <div className="absolute z-30 mt-1 w-full rounded-md bg-surface-1 shadow-lg border border-border-c overflow-hidden">
            {searchResults.data.wallets.map((w) => (
              <button
                key={w.address}
                onClick={() => handleSearchSelect(w.chain, w.address)}
                className="block w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-app font-mono border-b border-border-c last:border-0"
              >
                {w.address.slice(0, 10)}…{w.address.slice(-6)}
                {w.entity_name && <span className="ml-2 text-xs text-green font-sans font-medium">{w.entity_name}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3 pt-1">
        <div className="hidden md:flex items-center gap-2 mr-2 text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
          Secure <span className="text-border-strong">•</span> Compliant <span className="text-border-strong">•</span> Safer India
        </div>

        {user?.role !== 'investigator' && (
          <button
            onClick={() => setConsoleOpen(true)}
            title="Open API console (Ctrl+`)"
            className="rounded-md border border-border-strong bg-surface-1 px-2.5 py-1.5 text-xs font-mono text-text-secondary hover:bg-bg-app"
          >
            {'>_'} Console
          </button>
        )}

        <button
          onClick={() => useUiStore.getState().toggleTheme()}
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-md border border-border-c bg-surface-2 text-text-secondary hover:text-saffron hover:bg-surface-3 transition-colors"
          title="Toggle Theme"
        >
          {useUiStore((s) => s.theme) === 'dark' ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="relative ml-2">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-text-primary hover:bg-bg-app transition-colors"
          >
            <span className="h-7 w-7 rounded-full bg-navy-100 text-xs flex items-center justify-center text-text-primary border border-border-c font-bold bg-surface-2">
              {user?.name?.[0] ?? '?'}
            </span>
            {user?.name}
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-30 mt-1 w-44 rounded-md bg-surface-1 border border-border-c py-1 shadow-lg">
              <p className="px-3 py-1.5 text-xs text-text-secondary font-medium uppercase tracking-wide border-b border-border-c mb-1">
                Role: {user?.role}
              </p>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  logout()
                  navigate('/login')
                }}
                className="block w-full px-3 py-2 text-left text-sm text-red hover:bg-red-soft font-medium"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
