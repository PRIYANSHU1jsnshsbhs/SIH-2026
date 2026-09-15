import { useRef, useState } from 'react'
import { z } from 'zod'
import { useAuditLog } from '@/hooks/useAdmin'
import {
  useBulkLinkEntities,
  useDataCollectionCounts,
  useEntityLinkRows,
  useEntityLinks,
  useImportBatches,
  useLinkEntity,
  useRevertImportBatch,
} from '@/hooks/useBackend'
import { LoadingState } from '@/components/common/LoadingState'
import { useUiStore } from '@/stores/uiStore'
import { entityLinkImportRowSchema } from '@/schemas/backend'
import { API_ENDPOINTS } from './backendEndpoints'
import clsx from 'clsx'

const METHOD_COLOR: Record<string, string> = {
  GET: 'text-sky-400',
  POST: 'text-emerald-400',
  PATCH: 'text-amber-400',
  DELETE: 'text-red-400',
}

function ApiEndpointList() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-1 rounded-lg bg-surface-1 p-4 font-mono text-xs sm:grid-cols-2">
      {API_ENDPOINTS.map((ep, i) => (
        <p key={i} className="truncate">
          <span className={clsx('inline-block w-14 shrink-0', METHOD_COLOR[ep.method] ?? 'text-text-tertiary')}>
            {ep.method}
          </span>
          <span className="text-text-secondary">{ep.path}</span>
        </p>
      ))}
    </div>
  )
}

function CollectionCountsTable() {
  const counts = useDataCollectionCounts()
  if (counts.isLoading) return <LoadingState />
  return (
    <div className="overflow-x-auto rounded-lg bg-surface-1">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border-c bg-surface-2 text-xs uppercase text-text-tertiary">
            <th className="px-3 py-2 font-medium">Collection</th>
            <th className="px-3 py-2 font-medium">Records</th>
          </tr>
        </thead>
        <tbody>
          {counts.data?.map((row) => (
            <tr key={row.collection} className="border-b border-border-c/70">
              <td className="px-3 py-2 font-mono text-text-primary">{row.collection}</td>
              <td className="px-3 py-2 text-text-secondary">{row.count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LinkEntityForm() {
  const linkEntity = useLinkEntity()
  const pushToast = useUiStore((s) => s.pushToast)
  const [chain, setChain] = useState('ethereum')
  const [address, setAddress] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('VASP')
  const [jurisdiction, setJurisdiction] = useState('')
  const [confidence, setConfidence] = useState(0.9)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    linkEntity.mutate(
      { chain, address, name, type, jurisdiction: jurisdiction || undefined, confidence },
      {
        onSuccess: (result) => {
          pushToast(`Linked ${address} → ${name} (batch ${result.batch_id})`, 'success')
          setAddress('')
          setName('')
        },
        onError: () => pushToast('Link failed', 'error'),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 rounded-lg bg-surface-1 p-4 sm:grid-cols-3">
      <div>
        <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1">Chain</label>
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          className="w-full rounded-md bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
        >
          <option value="ethereum">Ethereum</option>
          <option value="polygon">Polygon</option>
        </select>
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1">Address</label>
        <input
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-md bg-surface-2 px-2 py-1.5 text-sm font-mono text-text-primary"
          placeholder="0x…"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1">Entity type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-md bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
        >
          <option value="VASP">VASP</option>
          <option value="Mixer">Mixer</option>
          <option value="Bridge">Bridge</option>
          <option value="Darknet Market">Darknet Market</option>
          <option value="Sanctioned Entity">Sanctioned Entity</option>
        </select>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1">Entity name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
          placeholder="Vertex Exchange"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1">Jurisdiction</label>
        <input
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          className="w-full rounded-md bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
          placeholder="Unknown"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1">
          Confidence ({confidence.toFixed(2)})
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="col-span-2 flex items-end sm:col-span-3">
        <button
          type="submit"
          disabled={linkEntity.isPending || !address || !name}
          className="rounded-md bg-btn-bg px-4 py-2 text-sm font-medium text-btn-fg hover:bg-accent-strong disabled:opacity-50"
        >
          {linkEntity.isPending ? 'Linking…' : 'Link address to entity'}
        </button>
      </div>
    </form>
  )
}

const IMPORT_EXAMPLE = `[
  {
    "chain": "ethereum",
    "address": "0xabc...",
    "name": "Vertex Exchange",
    "type": "VASP",
    "jurisdiction": "Singapore",
    "confidence": 0.9
  }
]`

function EntityLinksTable() {
  const links = useEntityLinks()
  const linkRows = useEntityLinkRows()
  const bulkLink = useBulkLinkEntities()
  const pushToast = useUiStore((s) => s.pushToast)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    if (!linkRows.data) return
    const blob = new Blob([JSON.stringify(linkRows.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `entity-links-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    let rows: unknown
    try {
      rows = JSON.parse(await file.text())
    } catch {
      pushToast('Not valid JSON', 'error')
      return
    }

    const parsed = z.array(entityLinkImportRowSchema).safeParse(rows)
    if (!parsed.success) {
      pushToast('File does not match the expected entity-link shape', 'error')
      return
    }

    bulkLink.mutate(parsed.data, {
      onSuccess: (result) => {
        pushToast(`Imported ${result.rows.length} links as batch ${result.batch_id}`, 'success')
      },
      onError: () => pushToast('Import failed', 'error'),
    })
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-secondary">
        This is the address→entity attribution data — which wallets are known to belong to which VASP, mixer,
        bridge, etc. Link one address at a time with the form above, or move many at once with Export/Import below.
      </p>

      <details className="rounded-lg bg-surface-1 p-3 text-xs">
        <summary className="cursor-pointer text-text-secondary">Expected import file shape</summary>
        <p className="mt-2 text-text-tertiary">
          A JSON array of rows like this. <code className="text-text-secondary">jurisdiction</code> and{' '}
          <code className="text-text-secondary">entity_id</code> are optional — omit{' '}
          <code className="text-text-secondary">entity_id</code> to create a new entity, or set it to an existing
          one's id (visible in the table below) to attach more addresses to it. Export produces a file already in
          this shape, so editing an export and re-importing it works directly.
        </p>
        <pre className="mt-2 overflow-x-auto rounded-md bg-surface-2 p-2 font-mono text-text-secondary">
          {IMPORT_EXAMPLE}
        </pre>
      </details>

      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-text-tertiary">
          {links.data?.length ?? 0} known entities
        </p>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileSelected} className="hidden" />
          <button
            onClick={handleImportClick}
            disabled={bulkLink.isPending}
            className="text-xs px-2.5 py-1.5 rounded-md bg-surface-2 text-text-primary hover:brightness-125 disabled:opacity-50"
          >
            {bulkLink.isPending ? 'Importing…' : 'Import entity links (JSON)'}
          </button>
          <button
            onClick={handleExport}
            disabled={!linkRows.data}
            className="text-xs px-2.5 py-1.5 rounded-md bg-surface-2 text-text-primary hover:brightness-125 disabled:opacity-50"
          >
            Export entity links (JSON)
          </button>
        </div>
      </div>

      {links.isLoading ? (
        <LoadingState />
      ) : (
        <div className="overflow-x-auto rounded-lg bg-surface-1">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-c bg-surface-2 text-xs uppercase text-text-tertiary">
                <th className="px-3 py-2 font-medium">Entity</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Jurisdiction</th>
                <th className="px-3 py-2 font-medium">Confidence</th>
                <th className="px-3 py-2 font-medium">Addresses</th>
                <th className="px-3 py-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {links.data?.map((e) => (
                <tr key={e.entity_id} className="border-b border-border-c/70">
                  <td className="px-3 py-2 text-text-primary">{e.name}</td>
                  <td className="px-3 py-2 text-text-secondary">{e.type}</td>
                  <td className="px-3 py-2 text-text-secondary">{e.jurisdiction}</td>
                  <td className="px-3 py-2 text-text-secondary">{Math.round(e.confidence * 100)}%</td>
                  <td className="px-3 py-2 text-text-secondary">{e.addresses.length}</td>
                  <td className="px-3 py-2 text-xs text-text-tertiary">{e.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ImportBatchesTable() {
  const batches = useImportBatches()
  const revertBatch = useRevertImportBatch()
  const pushToast = useUiStore((s) => s.pushToast)

  function handleRevert(batchId: string) {
    revertBatch.mutate(batchId, {
      onSuccess: () => pushToast(`Reverted batch ${batchId}`, 'success'),
      onError: (err) => pushToast(err instanceof Error ? err.message : 'Revert failed', 'error'),
    })
  }

  if (batches.isLoading) return <LoadingState />
  return (
    <div className="space-y-2">
      <p className="text-sm text-text-secondary">
        Every link — whether from the form above or a bulk import — lands here as one batch. Revert undoes exactly
        that batch: addresses it newly attributed go back to unlinked (or to whatever they pointed at before), and
        any entity it created is removed if nothing's left attached to it.
      </p>
      <div className="overflow-x-auto rounded-lg bg-surface-1">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-c bg-surface-2 text-xs uppercase text-text-tertiary">
              <th className="px-3 py-2 font-medium">Batch</th>
              <th className="px-3 py-2 font-medium">Source</th>
              <th className="px-3 py-2 font-medium">When</th>
              <th className="px-3 py-2 font-medium">Rows</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-text-tertiary">
                  No batches applied yet.
                </td>
              </tr>
            )}
            {batches.data?.map((b) => (
              <tr key={b.batch_id} className="border-b border-border-c/70">
                <td className="px-3 py-2 font-mono text-text-primary">{b.batch_id}</td>
                <td className="px-3 py-2 text-text-secondary capitalize">{b.source}</td>
                <td className="px-3 py-2 text-xs text-text-tertiary">{new Date(b.created_at).toLocaleString()}</td>
                <td className="px-3 py-2 text-text-secondary">{b.rows.length}</td>
                <td className={clsx('px-3 py-2', b.reverted ? 'text-text-tertiary' : 'text-green-400')}>
                  {b.reverted ? 'Reverted' : 'Applied'}
                </td>
                <td className="px-3 py-2">
                  {!b.reverted && (
                    <button
                      onClick={() => handleRevert(b.batch_id)}
                      disabled={revertBatch.isPending}
                      className="text-xs px-2.5 py-1 rounded-md bg-amber-950/50 text-amber-300 hover:bg-amber-900/60 disabled:opacity-50"
                    >
                      Revert
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RecentActivityLog() {
  const audit = useAuditLog()
  if (audit.isLoading) return <LoadingState />
  return (
    <div className="space-y-1.5 font-mono text-xs text-text-secondary max-h-56 overflow-y-auto rounded-lg bg-surface-1 p-3">
      {audit.data?.map((entry) => (
        <p key={entry.id}>
          <span className="text-text-tertiary">{new Date(entry.timestamp).toLocaleString()}</span>{' '}
          <span className="text-text-primary">{entry.actor}</span> {entry.action}
          {entry.target ? ` (${entry.target})` : ''}
        </p>
      ))}
    </div>
  )
}

export function BackendConsole() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Backend</h1>
        <p className="text-sm text-text-tertiary">
          A normal page, not the terminal — everything here is buttons, forms and tables. It's the data layer behind
          the rest of the app: the API surface this frontend talks to, what currently exists in it, and tools to
          link and move that data. Devops role only.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-1">API endpoints</h2>
        <p className="text-xs text-text-tertiary mb-3">
          Reference only — every endpoint this frontend calls (via the mock data layer today, a real backend later).
          Not runnable from here.
        </p>
        <ApiEndpointList />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Data collections</h2>
        <CollectionCountsTable />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Entity links</h2>
        <LinkEntityForm />
        <EntityLinksTable />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary mb-1">Import batches</h2>
        <p className="text-xs text-text-tertiary">
          The <code className="text-text-secondary">mock</code> build starts from a large pre-generated set of these
          same links; <code className="text-text-secondary">proj</code> starts empty. Either way, this is how you'd
          grow it from inside the site — one batch at a time, each one revertible.
        </p>
        <ImportBatchesTable />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Recent activity</h2>
        <RecentActivityLog />
      </section>
    </div>
  )
}
