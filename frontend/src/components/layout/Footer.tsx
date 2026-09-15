import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

const THEME_LABEL: Record<string, string> = {
  dark: '☾ dark',
  light: '☼ light',
  blue: '◆ blue',
}

export function Footer() {
  const theme = useUiStore((s) => s.theme)
  const cycleTheme = useUiStore((s) => s.cycleTheme)
  const consoleOpen = useUiStore((s) => s.consoleOpen)
  const setConsoleOpen = useUiStore((s) => s.setConsoleOpen)
  const role = useAuthStore((s) => s.user?.role)

  return (
    <footer className="flex h-9 shrink-0 items-center justify-between bg-surface-0 px-4 text-xs text-text-tertiary">
      <span className="font-mono">PS 26183 · mock data</span>
      <div className="flex items-center gap-1">
        <button
          onClick={cycleTheme}
          title="Cycle theme (dark / light / blue)"
          className="rounded px-2 py-1 font-mono text-text-secondary hover:text-text-primary"
        >
          {THEME_LABEL[theme]}
        </button>
        {role !== 'investigator' && (
          <button
            onClick={() => setConsoleOpen(!consoleOpen)}
            title="Toggle console (Ctrl+`)"
            aria-pressed={consoleOpen}
            className="rounded px-2 py-1 font-mono text-text-secondary hover:text-text-primary aria-pressed:text-accent"
          >
            {'>_'} console
          </button>
        )}
      </div>
    </footer>
  )
}
