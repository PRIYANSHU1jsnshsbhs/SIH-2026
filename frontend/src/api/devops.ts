import { z } from 'zod'
import {
  cancelJob,
  delay,
  enqueueReprocessJob,
  listIndexerStatus,
  listJobQueue,
  listWorkerLogs,
  retryJob,
  startIndexer,
} from '@/mocks/mockStore'
import { parseEnvelope, ApiRequestError } from './envelope'
import { indexerStatusSchema, jobQueueEntrySchema, workerLogEntrySchema } from '@/schemas/devops'

export async function fetchIndexerStatus() {
  await delay(150)
  const statuses = listIndexerStatus()
  return parseEnvelope(z.array(indexerStatusSchema), { success: true, data: statuses })
}

export async function startIndexerRequest(chain: string, fromBlock: number) {
  await delay()
  startIndexer(chain, fromBlock)
  const statuses = listIndexerStatus()
  return parseEnvelope(z.array(indexerStatusSchema), { success: true, data: statuses })
}

export async function fetchJobQueue() {
  await delay(150)
  const jobs = listJobQueue()
  return parseEnvelope(z.array(jobQueueEntrySchema), { success: true, data: jobs })
}

export async function reprocessBlocksRequest(chain: string, fromBlock: number, toBlock: number) {
  await delay()
  const job = enqueueReprocessJob(chain, fromBlock, toBlock)
  return parseEnvelope(jobQueueEntrySchema, { success: true, data: job })
}

export async function cancelJobRequest(jobId: string) {
  await delay()
  try {
    return parseEnvelope(jobQueueEntrySchema, { success: true, data: cancelJob(jobId) })
  } catch {
    throw new ApiRequestError('JOB_NOT_CANCELLABLE', `Job ${jobId} cannot be cancelled`)
  }
}

export async function retryJobRequest(jobId: string) {
  await delay()
  try {
    return parseEnvelope(jobQueueEntrySchema, { success: true, data: retryJob(jobId) })
  } catch {
    throw new ApiRequestError('JOB_NOT_RETRYABLE', `Job ${jobId} cannot be retried`)
  }
}

export async function fetchWorkerLogs() {
  await delay(150)
  const logs = listWorkerLogs()
  return parseEnvelope(z.array(workerLogEntrySchema), { success: true, data: logs })
}
