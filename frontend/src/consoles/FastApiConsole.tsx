import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { fetchCase, fetchCases } from '@/api/cases'
import { fetchWallet, searchWalletsRequest } from '@/api/wallets'
import {
  fetchAllInvestigations,
  fetchInvestigationStatus,
  fetchInvestigationGraph,
  fetchInvestigationFindings,
} from '@/api/investigations'
import { fetchAddressEntity } from '@/api/entities'
import { fetchWalletRisk } from '@/api/risk'
import { ApiRequestError } from '@/api/envelope'
import { COMMAND_DEFINITIONS } from './commandDefinitions'

interface Line {
  kind: 'input' | 'output' | 'error' | 'system'
  text: string
}

const HELP_TEXT = ['commands:', ...COMMAND_DEFINITIONS.map((c) => `  ${c.syntax}`), '', 'see "Terminal Commands" in the sidebar for full descriptions'].join(
  '\n',
)

/** Return value `null` means "no text output, but the command already did its thing" (e.g. navigation). */
async function runCommand(raw: string, navigate: (path: string) => void, closeConsole: () => void): Promise<string> {
  const [cmd, ...args] = raw.trim().split(/\s+/)
  switch (cmd) {
    case 'help':
      return HELP_TEXT
    case 'cases':
      return JSON.stringify(await fetchCases(), null, 2)
    case 'case':
      if (!args[0]) return 'usage: case <case_id>'
      return JSON.stringify(await fetchCase(args[0]), null, 2)
    case 'wallet':
      if (args.length < 2) return 'usage: wallet <chain> <address>'
      return JSON.stringify(await fetchWallet(args[0], args[1]), null, 2)
    case 'search':
      if (!args[0]) return 'usage: search <query>'
      return JSON.stringify(await searchWalletsRequest(args.join(' ')), null, 2)
    case 'entity':
      if (args.length < 2) return 'usage: entity <chain> <address>'
      return JSON.stringify(await fetchAddressEntity(args[0], args[1]), null, 2)
    case 'risk':
      if (args.length < 2) return 'usage: risk <chain> <address>'
      return JSON.stringify(await fetchWalletRisk({ chain: args[0], address: args[1] }), null, 2)
    case 'investigation': {
      if (args.length < 2) return 'usage: investigation <id> status|graph|findings|open'
      const [id, sub] = args
      if (sub === 'status') return JSON.stringify(await fetchInvestigationStatus(id), null, 2)
      if (sub === 'graph') return JSON.stringify(await fetchInvestigationGraph(id), null, 2)
      if (sub === 'findings') return JSON.stringify(await fetchInvestigationFindings(id), null, 2)
      if (sub === 'open') {
        navigate(`/investigations/${id}/graph`)
        closeConsole()
        return `opening ${id} in graph mode…`
      }
      return 'unknown subcommand — use status | graph | findings | open'
    }
    case 'graphs': {
      const all = await fetchAllInvestigations()
      return all
        .map((inv) => `${inv.investigation_id.padEnd(9)} ${inv.status.padEnd(10)} ${inv.case_title} (${inv.node_count}n/${inv.edge_count}e)`)
        .join('\n')
    }
    case 'explorer':
      navigate('/explorer')
      closeConsole()
      return 'opening Investigation Explorer…'
    case '':
      return ''
    default:
      return `command not found: ${cmd} (type "help")`
  }
}

export function FastApiConsole({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [lines, setLines] = useState<Line[]>([
    { kind: 'system', text: 'read-only queries against /api/v1 — type "help" to start' },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const command = input
    setInput('')
    if (command === 'clear') {
      setLines([])
      return
    }
    setLines((l) => [...l, { kind: 'input', text: command }])
    setBusy(true)
    try {
      const output = await runCommand(command, navigate, onClose)
      if (output) setLines((l) => [...l, { kind: 'output', text: output }])
    } catch (err) {
      const message = err instanceof ApiRequestError ? `${err.code}: ${err.message}` : 'unexpected error'
      setLines((l) => [...l, { kind: 'error', text: message }])
    } finally {
      setBusy(false)
      requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight))
    }
  }

  return (
    <div
      className={clsx(
        'fixed right-0 top-14 bottom-9 z-40 flex w-full max-w-md flex-col border-l border-[#1a1a1a] bg-black transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : 'translate-x-full',
      )}
      style={{ fontFamily: 'var(--font-mono)' }}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-3 py-1.5">
        <span className="text-[11px] text-[#5f5f5f]">/api/v1</span>
        <button onClick={onClose} className="text-[#5f5f5f] hover:text-[#d4d4d4] text-sm leading-none px-1">
          ×
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 text-[13px] leading-relaxed space-y-1">
        {lines.map((line, i) => (
          <pre
            key={i}
            className={clsx(
              'whitespace-pre-wrap',
              line.kind === 'input' && 'text-[#d4d4d4]',
              line.kind === 'output' && 'text-[#9fa6b2]',
              line.kind === 'error' && 'text-[#e5636b]',
              line.kind === 'system' && 'text-[#5f5f5f]',
            )}
          >
            {line.kind === 'input' ? `> ${line.text}` : line.text}
          </pre>
        ))}
        {busy && <p className="text-[#5f5f5f]">…</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[#1a1a1a] px-3 py-2">
        <span className="text-[#4ade80]">{'>'}</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="help"
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent text-[13px] text-[#d4d4d4] outline-none placeholder:text-[#3d3d3d] caret-[#4ade80]"
        />
      </form>
    </div>
  )
}
