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
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border-c bg-surface-0 px-4">
      <button onClick={toggleSidebar} className="text-text-tertiary hover:text-text-primary" aria-label="Toggle sidebar">
        ☰
      </button>
      <Link
        to="/login"
        title="Back to the main page"
        className="font-semibold text-text-primary whitespace-nowrap hover:text-accent"
      >
        Crypto Fraud Attribution
      </Link>

      <div className="relative flex-1 max-w-md">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search wallet address, case, entity…"
          className="w-full rounded-md bg-surface-2 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary"
        />
        {search.length > 2 && searchResults.data && searchResults.data.wallets.length > 0 && (
          <div className="absolute z-30 mt-1 w-full rounded-md bg-surface-2 shadow-xl">
            {searchResults.data.wallets.map((w) => (
              <button
                key={w.address}
                onClick={() => handleSearchSelect(w.chain, w.address)}
                className="block w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-3 font-mono"
              >
                {w.address.slice(0, 10)}…{w.address.slice(-6)}
                {w.entity_name && <span className="ml-2 text-xs text-emerald-400">{w.entity_name}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {user?.role !== 'investigator' && (
        <button
          onClick={() => setConsoleOpen(true)}
          title="Open API console (Ctrl+`)"
          className="rounded-md bg-surface-2 px-2.5 py-1.5 text-xs font-mono text-text-primary hover:bg-surface-3"
        >
          {'>_'} Console
        </button>
      )}

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-primary hover:bg-surface-1"
        >
          <span className="h-6 w-6 rounded-full bg-accent/15 text-xs flex items-center justify-center text-accent">
            {user?.name?.[0] ?? '?'}
          </span>
          {user?.name}
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-30 mt-1 w-44 rounded-md bg-surface-2 py-1 shadow-xl">
            <p className="px-3 py-1.5 text-xs text-text-tertiary">Role: {user?.role}</p>
            <button
              onClick={() => {
                setMenuOpen(false)
                logout()
                navigate('/login')
              }}
              className="block w-full px-3 py-1.5 text-left text-sm text-text-primary hover:bg-surface-3"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
