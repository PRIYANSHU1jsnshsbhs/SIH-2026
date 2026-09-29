import { z } from 'zod'

export const casePrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])
export type CasePriority = z.infer<typeof casePrioritySchema>

export const caseStatusSchema = z.enum(['open', 'in_progress', 'closed'])
export type CaseStatus = z.infer<typeof caseStatusSchema>

export const caseSummarySchema = z.object({
  case_id: z.string(),
  case_number: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  status: caseStatusSchema,
  priority: casePrioritySchema,
  wallets_count: z.number(),
  investigations_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type CaseSummary = z.infer<typeof caseSummarySchema>

export const caseListResponseSchema = z.object({
  cases: z.array(caseSummarySchema),
  total: z.number(),
})
export type CaseListResponse = z.infer<typeof caseListResponseSchema>

export const createCaseInputSchema = z.object({
  caseNumber: z.string().trim().min(1, 'Case number is required'),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: casePrioritySchema,
})
export type CreateCaseInput = z.infer<typeof createCaseInputSchema>

export const updateCaseInputSchema = z.object({
  status: caseStatusSchema.optional(),
  priority: casePrioritySchema.optional(),
})
export type UpdateCaseInput = z.infer<typeof updateCaseInputSchema>

export const caseWalletSchema = z.object({
  wallet_id: z.string(),
  chain: z.string(),
  address: z.string(),
  label: z.string().optional(),
  source: z.string().optional(),
  risk_level: z.enum(['high', 'medium', 'low', 'unknown']),
})
export type CaseWallet = z.infer<typeof caseWalletSchema>

export const EVM_CHAINS = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism'] as const

export function isWalletAddressValid(chain: string, address: string): boolean {
  const normalizedChain = chain.toLowerCase()
  const normalizedAddress = address.trim()
  if (normalizedChain === 'mock') return /^node-\d+$/.test(normalizedAddress)
  if ((EVM_CHAINS as readonly string[]).includes(normalizedChain)) {
    return /^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)
  }
  return false
}

export function walletAddressError(chain: string): string {
  return chain.toLowerCase() === 'mock'
    ? 'Mock addresses must use node-<number> format.'
    : 'EVM addresses must be 0x followed by 40 hexadecimal characters.'
}

export const addWalletInputSchema = z.object({
  chain: z.string().min(1, 'Chain is required'),
  address: z.string().trim().min(1, 'Address is required'),
  label: z.string().optional(),
  source: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!isWalletAddressValid(data.chain, data.address)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: walletAddressError(data.chain),
      path: ['address'],
    })
  }
})
export type AddWalletInput = z.infer<typeof addWalletInputSchema>

export const caseInvestigationSchema = z.object({
  investigation_id: z.string(),
  start_address: z.string(),
  chain: z.string(),
  status: z.enum(['queued', 'pending', 'initializing', 'running', 'completed', 'failed', 'cancelled']),
  created_at: z.string(),
})
export type CaseInvestigation = z.infer<typeof caseInvestigationSchema>

export const caseFindingSummarySchema = z.object({
  investigation_id: z.string(),
  type: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  description: z.string(),
})
export type CaseFindingSummary = z.infer<typeof caseFindingSummarySchema>

export const caseDetailSchema = caseSummarySchema.extend({
  wallets: z.array(caseWalletSchema),
  investigations: z.array(caseInvestigationSchema),
  findings: z.array(caseFindingSummarySchema),
  activity: z.array(
    z.object({
      timestamp: z.string(),
      actor: z.string(),
      action: z.string(),
    }),
  ),
})
export type CaseDetail = z.infer<typeof caseDetailSchema>
