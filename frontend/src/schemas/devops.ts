import { z } from 'zod'

export const indexerStatusSchema = z.object({
  chain: z.string(),
  latest_block: z.number(),
  indexed_block: z.number(),
  lag: z.number(),
  status: z.enum(['running', 'paused', 'error']),
})
export type IndexerStatus = z.infer<typeof indexerStatusSchema>

export const startIndexerInputSchema = z.object({
  chain: z.string(),
  from_block: z.number(),
})

export const reprocessInputSchema = z.object({
  chain: z.string(),
  from_block: z.number(),
  to_block: z.number(),
})

export const jobQueueEntrySchema = z.object({
  job_id: z.string(),
  type: z.string(),
  status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled']),
  created_at: z.string(),
})
export type JobQueueEntry = z.infer<typeof jobQueueEntrySchema>

export const workerLogEntrySchema = z.object({
  timestamp: z.string(),
  level: z.enum(['info', 'warn', 'error']),
  message: z.string(),
})
export type WorkerLogEntry = z.infer<typeof workerLogEntrySchema>
