import { z } from 'zod'
import {
  applyEntityLinkBatch,
  delay,
  getDataCollectionCounts,
  listEntityLinkRows,
  listEntityLinks,
  listImportBatches,
  revertImportBatch,
} from '@/mocks/mockStore'
import { parseEnvelope, ApiRequestError } from './envelope'
import {
  dataCollectionCountSchema,
  entityLinkImportRowSchema,
  entityLinkSchema,
  importBatchSchema,
  type EntityLinkImportRow,
} from '@/schemas/backend'

export async function fetchDataCollectionCounts() {
  await delay(150)
  return parseEnvelope(z.array(dataCollectionCountSchema), { success: true, data: getDataCollectionCounts() })
}

export async function fetchEntityLinks() {
  await delay()
  return parseEnvelope(z.array(entityLinkSchema), { success: true, data: listEntityLinks() })
}

/** Same rows as fetchEntityLinks, but flattened to the exact shape the bulk import expects. */
export async function fetchEntityLinkRows() {
  await delay()
  return parseEnvelope(z.array(entityLinkImportRowSchema), { success: true, data: listEntityLinkRows() })
}

/** The single-address link form applies as a one-row batch, same as import. */
export async function linkEntityRequest(input: {
  chain: string
  address: string
  entity_id?: string
  name: string
  type: string
  jurisdiction?: string
  confidence: number
}) {
  await delay()
  const batch = applyEntityLinkBatch([input], 'manual')
  return parseEnvelope(importBatchSchema, { success: true, data: batch })
}

export async function bulkLinkEntitiesRequest(rows: EntityLinkImportRow[]) {
  await delay(300)
  const batch = applyEntityLinkBatch(rows, 'import')
  return parseEnvelope(importBatchSchema, { success: true, data: batch })
}

export async function fetchImportBatches() {
  await delay(150)
  return parseEnvelope(z.array(importBatchSchema), { success: true, data: listImportBatches() })
}

export async function revertImportBatchRequest(batchId: string) {
  await delay()
  try {
    return parseEnvelope(importBatchSchema, { success: true, data: revertImportBatch(batchId) })
  } catch (err) {
    throw new ApiRequestError('BATCH_NOT_REVERTABLE', err instanceof Error ? err.message : 'Revert failed')
  }
}
