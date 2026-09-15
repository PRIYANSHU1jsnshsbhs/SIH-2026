import { z } from 'zod'
import { riskLevelSchema } from './wallets'

export const transactionSchema = z.object({
  tx_hash: z.string(),
  block_number: z.number(),
  timestamp: z.string(),
  from: z.string(),
  to: z.string(),
  asset: z.string(),
  amount: z.string(),
  status: z.enum(['confirmed', 'pending', 'failed']),
  direction: z.enum(['in', 'out']).optional(),
  risk_level: riskLevelSchema.optional(),
})
export type Transaction = z.infer<typeof transactionSchema>

export const transactionListResponseSchema = z.object({
  transactions: z.array(transactionSchema),
  total: z.number(),
})

export const transactionDetailSchema = transactionSchema.extend({
  chain: z.string(),
  native_value: z.string(),
  gas_used: z.number(),
  token_transfers: z.array(z.unknown()),
})
export type TransactionDetail = z.infer<typeof transactionDetailSchema>
