import { z } from 'zod'

export const riskLevelSchema = z.enum(['high', 'medium', 'low', 'unknown'])
export type RiskLevel = z.infer<typeof riskLevelSchema>

export const entityRefSchema = z.object({
  name: z.string(),
  type: z.string(),
  confidence: z.number().nullable(),
})
export type EntityRef = z.infer<typeof entityRefSchema>

export const walletSchema = z.object({
  chain: z.string(),
  address: z.string(),
  first_seen: z.string().nullable(),
  last_seen: z.string().nullable(),
  transaction_count: z.number(),
  total_received: z.string(),
  total_sent: z.string().nullable(),
  unique_counterparties: z.number().nullable(),
  entity: entityRefSchema.nullable(),
  risk: z.object({
    score: z.number().nullable(),
    level: riskLevelSchema,
  }),
})
export type Wallet = z.infer<typeof walletSchema>

export const walletStatisticsSchema = z.object({
  transaction_count: z.number(),
  incoming_count: z.number(),
  outgoing_count: z.number(),
  total_received: z.string(),
  total_sent: z.string(),
  unique_incoming_addresses: z.number(),
  unique_outgoing_addresses: z.number(),
  forwarding_ratio: z.number(),
  median_holding_time_seconds: z.number(),
})
export type WalletStatistics = z.infer<typeof walletStatisticsSchema>

export const walletSearchResultSchema = z.object({
  chain: z.string(),
  address: z.string(),
  entity_name: z.string().nullable(),
  risk_level: riskLevelSchema,
})
export type WalletSearchResult = z.infer<typeof walletSearchResultSchema>

export const walletSearchResponseSchema = z.object({
  wallets: z.array(walletSearchResultSchema),
  total: z.number(),
})
