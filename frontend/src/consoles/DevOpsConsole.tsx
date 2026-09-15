import { useState } from 'react'
import {
  useCancelJob,
  useIndexerStatus,
  useJobQueue,
  useReprocessBlocks,
  useRetryJob,
  useStartIndexer,
  useWorkerLogs,
} from '@/hooks/useDevops'
import { LoadingState } from '@/components/common/LoadingState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useUiStore } from '@/stores/uiStore'
import clsx from 'clsx'

export function DevOpsConsole() {
  const indexers = useIndexerStatus()
  const jobs = useJobQueue()
  const logs = useWorkerLogs()
  const startIndexer = useStartIndexer()
  const reprocess = useReprocessBlocks()
  const cancelJob = useCancelJob()
  const retryJob = useRetryJob()
  const pushToast = useUiStore((s) => s.pushToast)

  const [reprocessTarget, setReprocessTarget] = useState<{ chain: string; from: number; to: number } | null>(null)
  const [restartTarget, setRestartTarget] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">DevOps</h1>
        <p className="text-sm text-text-tertiary">
          Indexer, job queue, and worker operations. Devops role only. These endpoints must never be exposed
          publicly in the real backend.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Blockchain indexers</h2>
        {indexers.isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-2">
            {indexers.data?.map((idx) => (
              <div
                key={idx.chain}
                className="flex items-center justify-between rounded-lg bg-surface-1 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary capitalize">{idx.chain}</p>
                  <p className="text-xs text-text-tertiary">
                    indexed {idx.indexed_block.toLocaleString()} / latest {idx.latest_block.toLocaleString()} · lag{' '}
                    {idx.lag}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={clsx(
                      'text-xs font-semibold uppercase',
                      idx.status === 'running' && 'text-green-400',
                      idx.status === 'paused' && 'text-amber-400',
                      idx.status === 'error' && 'text-red-400',
                    )}
                  >
                    {idx.status}
                  </span>
                  <button
                    onClick={() => setRestartTarget(idx.chain)}
                    className="text-xs px-2.5 py-1 rounded-md bg-surface-2 text-text-primary hover:brightness-125"
                  >
                    Restart from tip
                  </button>
                  <button
                    onClick={() => setReprocessTarget({ chain: idx.chain, from: idx.indexed_block - 100, to: idx.indexed_block })}
                    className="text-xs px-2.5 py-1 rounded-md bg-amber-950/50 text-amber-300 hover:bg-amber-900/60"
                  >
                    Reprocess last 100 blocks
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Job queue</h2>
        {jobs.isLoading ? (
          <LoadingState />
        ) : (
          <div className="overflow-x-auto rounded-lg bg-surface-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-c bg-surface-2 text-xs uppercase text-text-tertiary">
                  <th className="px-3 py-2 font-medium">Job</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Created</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.data?.map((job) => (
                  <tr key={job.job_id} className="border-b border-border-c/70">
                    <td className="px-3 py-2 font-mono text-xs text-text-secondary">{job.job_id}</td>
                    <td className="px-3 py-2 text-text-primary">{job.type}</td>
                    <td
                      className={clsx(
                        'px-3 py-2',
                        job.status === 'failed' && 'text-red-400',
                        job.status === 'cancelled' && 'text-text-tertiary',
                        (job.status === 'queued' || job.status === 'running') && 'text-amber-400',
                        job.status === 'completed' && 'text-green-400',
                      )}
                    >
                      {job.status}
                    </td>
                    <td className="px-3 py-2 text-xs text-text-tertiary">{new Date(job.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      {(job.status === 'queued' || job.status === 'running') && (
                        <button
                          onClick={() => setCancelTarget(job.job_id)}
                          className="text-xs px-2.5 py-1 rounded-md bg-amber-950/50 text-amber-300 hover:bg-amber-900/60"
                        >
                          Cancel
                        </button>
                      )}
                      {(job.status === 'failed' || job.status === 'cancelled') && (
                        <button
                          onClick={() =>
                            retryJob.mutate(job.job_id, {
                              onSuccess: () => pushToast(`${job.job_id} requeued`, 'success'),
                            })
                          }
                          className="text-xs px-2.5 py-1 rounded-md bg-surface-2 text-text-primary hover:brightness-125"
                        >
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Worker logs</h2>
        {logs.isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-1 font-mono text-xs max-h-56 overflow-y-auto rounded-lg bg-surface-1 p-3">
            {logs.data?.map((log, i) => (
              <p
                key={i}
                className={clsx(
                  log.level === 'error' && 'text-red-400',
                  log.level === 'warn' && 'text-amber-400',
                  log.level === 'info' && 'text-text-secondary',
                )}
              >
                <span className="text-text-tertiary">{new Date(log.timestamp).toLocaleTimeString()}</span> [{log.level}]{' '}
                {log.message}
              </p>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!restartTarget}
        title={`Restart ${restartTarget} indexer?`}
        description="This resumes indexing from the current chain tip. In-flight reprocessing jobs for this chain will not be affected."
        confirmLabel="Restart"
        onCancel={() => setRestartTarget(null)}
        onConfirm={() => {
          if (restartTarget) {
            const current = indexers.data?.find((i) => i.chain === restartTarget)
            startIndexer.mutate(
              { chain: restartTarget, fromBlock: current?.latest_block ?? 0 },
              { onSuccess: () => pushToast(`${restartTarget} indexer restarted`, 'success') },
            )
          }
          setRestartTarget(null)
        }}
      />

      <ConfirmDialog
        open={!!reprocessTarget}
        title="Reprocess block range?"
        description={
          reprocessTarget
            ? `This re-parses blocks ${reprocessTarget.from} to ${reprocessTarget.to} on ${reprocessTarget.chain}. Use this after a parser change or a detected chain reorganization.`
            : ''
        }
        confirmLabel="Queue reprocess"
        danger
        onCancel={() => setReprocessTarget(null)}
        onConfirm={() => {
          if (reprocessTarget) {
            reprocess.mutate(
              { chain: reprocessTarget.chain, fromBlock: reprocessTarget.from, toBlock: reprocessTarget.to },
              { onSuccess: () => pushToast('Reprocess job queued', 'success') },
            )
          }
          setReprocessTarget(null)
        }}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        title={`Cancel ${cancelTarget}?`}
        description="The job stops picking up further work. It can be retried afterward from the same point."
        confirmLabel="Cancel job"
        danger
        onCancel={() => setCancelTarget(null)}
        onConfirm={() => {
          if (cancelTarget) {
            cancelJob.mutate(cancelTarget, { onSuccess: () => pushToast(`${cancelTarget} cancelled`, 'success') })
          }
          setCancelTarget(null)
        }}
      />
    </div>
  )
}
