import { z } from 'zod'
import { riskLevelSchema } from './wallets'

export const riskReasonSchema = z.object({
  signal: z.string(),
  weight: z.number(),
})

export const walletRiskInputSchema = z.object({
  chain: z.string(),
  address: z.string(),
  investigation_id: z.string().optional(),
})
export type WalletRiskInput = z.infer<typeof walletRiskInputSchema>

export const walletRiskResponseSchema = z.object({
  wallet: z.string(),
  risk_score: z.number(),
  risk_level: riskLevelSchema,
  model_version: z.string(),
  reasons: z.array(riskReasonSchema),
})
export type WalletRiskResponse = z.infer<typeof walletRiskResponseSchema>

export const riskFeaturesSchema = z.object({
  transaction_count: z.number(),
  unique_counterparties: z.number(),
  forwarding_ratio: z.number(),
  median_holding_time: z.number(),
  cross_chain_count: z.number(),
  risky_counterparty_ratio: z.number(),
})
export type RiskFeatures = z.infer<typeof riskFeaturesSchema>
