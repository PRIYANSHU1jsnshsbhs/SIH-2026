import { z } from 'zod'

export const entitySchema = z.object({
  entity_id: z.string(),
  name: z.string(),
  type: z.string(),
  jurisdiction: z.string().optional(),
  risk_level: z.enum(['high', 'medium', 'low', 'unknown']).optional(),
  known_addresses: z.number().optional(),
  last_verified: z.string().optional(),
})
export type Entity = z.infer<typeof entitySchema>

export const addressEntitySchema = z.object({
  address: z.string(),
  entity: z
    .object({
      entity_id: z.string(),
      name: z.string(),
      type: z.string(),
      jurisdiction: z.string().optional(),
      confidence: z.number().nullable(),
    })
    .nullable(),
  evidence: z.array(
    z.object({
      source: z.string().nullable().optional(),
      last_verified: z.string().nullable().optional(),
    }),
  ),
})
export type AddressEntity = z.infer<typeof addressEntitySchema>

export const entitySearchResponseSchema = z.object({
  entities: z.array(entitySchema),
  total: z.number(),
})

export const entityDetailSchema = z.object({
  entity_id: z.string(),
  name: z.string(),
  type: z.string(),
  addresses: z.array(
    z.object({
      chain: z.string(),
      address: z.string(),
      confidence: z.number(),
    }),
  ),
})
export type EntityDetail = z.infer<typeof entityDetailSchema>
