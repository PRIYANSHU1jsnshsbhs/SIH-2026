import { z } from 'zod'

export const dataCollectionCountSchema = z.object({
  collection: z.string(),
  count: z.number(),
})
export type DataCollectionCount = z.infer<typeof dataCollectionCountSchema>

export const entityLinkSchema = z.object({
  entity_id: z.string(),
  name: z.string(),
  type: z.string(),
  jurisdiction: z.string(),
  confidence: z.number(),
  source: z.string(),
  last_verified: z.string(),
  addresses: z.array(z.string()),
})
export type EntityLink = z.infer<typeof entityLinkSchema>

/** One row of a bulk entity-link import file. */
export const entityLinkImportRowSchema = z.object({
  chain: z.string(),
  address: z.string(),
  entity_id: z.string().optional(),
  name: z.string(),
  type: z.string(),
  jurisdiction: z.string().optional(),
  confidence: z.number().min(0).max(1),
})
export type EntityLinkImportRow = z.infer<typeof entityLinkImportRowSchema>

export const importBatchRowSchema = z.object({
  chain: z.string(),
  address: z.string(),
  entity_id: z.string(),
  entity_name: z.string(),
  entity_created: z.boolean(),
  address_added: z.boolean(),
  previous_entity_id: z.string().nullable(),
})
export type ImportBatchRow = z.infer<typeof importBatchRowSchema>

/**
 * One applied link action — the single-address form and the bulk JSON import
 * both produce one of these (of 1 row, or many). Reverting a batch undoes
 * every row in it.
 */
export const importBatchSchema = z.object({
  batch_id: z.string(),
  created_at: z.string(),
  actor: z.string(),
  source: z.enum(['manual', 'import']),
  rows: z.array(importBatchRowSchema),
  reverted: z.boolean(),
  reverted_at: z.string().nullable(),
})
export type ImportBatch = z.infer<typeof importBatchSchema>
