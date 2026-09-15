import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Footer } from './Footer'
import { ToastHost } from '@/components/common/ToastHost'
import { FastApiConsole } from '@/consoles/FastApiConsole'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

export function AppShell() {
  const consoleOpen = useUiStore((s) => s.consoleOpen)
  const setConsoleOpen = useUiStore((s) => s.setConsoleOpen)
  const canUseConsole = useAuthStore((s) => s.user?.role !== 'investigator')

  useEffect(() => {
    if (!canUseConsole) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        setConsoleOpen(!consoleOpen)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [canUseConsole, consoleOpen, setConsoleOpen])

  return (
    <div className="flex h-screen flex-col bg-surface-0 text-text-primary">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-surface-0">
          <div className="mx-auto max-w-7xl p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
      <ToastHost />
      {canUseConsole && <FastApiConsole open={consoleOpen} onClose={() => setConsoleOpen(false)} />}
    </div>
  )
}
