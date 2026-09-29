import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { BrandLogo } from '@/components/common/BrandLogo'


export function Footer() {
  const consoleOpen = useUiStore((s) => s.consoleOpen)
  const setConsoleOpen = useUiStore((s) => s.setConsoleOpen)
  const role = useAuthStore((s) => s.user?.role)

  return (
    <footer className="app-footer flex h-9 shrink-0 items-center justify-between bg-surface-1 px-4 text-xs text-text-secondary border-t border-border-c shadow-[0_-1px_2px_rgba(0,0,0,0.02)] z-10">
      <span className="font-mono text-text-tertiary">SIH PS 26182</span>
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-2 md:flex">
          <BrandLogo className="h-7 w-14" />
          <span className="tracking-wide uppercase text-[9px] font-semibold text-text-tertiary">Intelligence MVP</span>
        </span>
        {role !== 'investigator' && (
          <button
            onClick={() => setConsoleOpen(!consoleOpen)}
            title="Toggle console (Ctrl+`)"
            aria-pressed={consoleOpen}
            className="rounded px-2 py-1 font-mono text-text-tertiary hover:text-text-primary aria-pressed:text-saffron hover:bg-surface-2 transition-colors ml-2"
          >
            {'>_'} console
          </button>
        )}
      </div>
    </footer>
  )
}
