import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { COMMAND_DEFINITIONS } from '@/consoles/commandDefinitions'

export function TerminalCommandsPage() {
  const setConsoleOpen = useUiStore((s) => s.setConsoleOpen)
  const canUseConsole = useAuthStore((s) => s.user?.role !== 'investigator')

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Terminal Commands</h1>
          <p className="text-sm text-text-secondary mt-1">
            {canUseConsole
              ? "Every command the FastAPI console (bottom-right, or Ctrl+`) understands. It talks to the same typed API client the rest of the app uses — read-only, no raw fetch path."
              : 'Every command the FastAPI console understands. The console itself is only available to Admin and Dev roles — this is a reference, not a way to open it.'}
          </p>
        </div>
        {canUseConsole && (
          <button
            onClick={() => setConsoleOpen(true)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-md bg-btn-bg text-btn-fg hover:bg-accent-strong"
          >
            {'>_'} Open console
          </button>
        )}
      </div>

      <div className="space-y-2">
        {COMMAND_DEFINITIONS.map((cmd) => (
          <div key={cmd.syntax} className="rounded-lg bg-surface-1 p-4">
            <p className="font-mono text-sm text-accent">{cmd.syntax}</p>
            <p className="mt-1.5 text-sm text-text-secondary">{cmd.description}</p>
            <p className="mt-2 font-mono text-xs text-text-tertiary">
              <span className="text-text-tertiary/70">$</span> {cmd.example}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
