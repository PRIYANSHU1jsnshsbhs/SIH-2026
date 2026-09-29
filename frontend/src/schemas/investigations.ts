import { z } from 'zod'
import { riskLevelSchema } from './wallets'
import { isWalletAddressValid, walletAddressError } from './cases'

export const investigationStatusSchema = z
  .string()
  .transform((v) => {
    const normalized = v.toLowerCase()
    return normalized === 'in_progress' ? 'running' : normalized
  })
  .pipe(
    z.enum([
      'queued',
      'pending',
      'initializing',
      'running',
      'completed',
      'failed',
      'cancelled',
    ])
  )
export type InvestigationStatus = z.infer<typeof investigationStatusSchema>

export const startInvestigationInputSchema = z.object({
  case_id: z.string().min(1, 'Case context is required'),
  chain: z.string().min(1, 'Chain is required'),
  start_address: z.string().trim().min(1, 'Wallet address is required'),
  max_hops: z.number().min(1).max(8),
  min_value: z.number().min(0),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!isWalletAddressValid(data.chain, data.start_address)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: walletAddressError(data.chain),
      path: ['start_address'],
    })
  }
})
export type StartInvestigationInput = z.infer<typeof startInvestigationInputSchema>

export const investigationCreatedSchema = z.object({
  investigation_id: z.string(),
  status: investigationStatusSchema,
})

export const investigationStatusResponseSchema = z.object({
  investigation_id: z.string(),
  chain: z.string(),
  start_address: z.string(),
  status: investigationStatusSchema,
  progress: z.number(),
  stage: z.string(),
  nodes_found: z.number(),
  edges_found: z.number(),
  error: z.string().nullable().optional(),
})
export type InvestigationStatusResponse = z.infer<typeof investigationStatusResponseSchema>

export const graphNodeSchema = z.object({
  id: z.string(),
  address: z.string(),
  chain: z.string(),
  type: z.enum(['wallet', 'contract', 'vasp', 'exchange', 'bridge', 'mixer', 'unknown']),
  label: z.string(),
  risk_score: z.number().nullable(),
  risk_level: riskLevelSchema,
  is_seed: z.boolean().optional(),
  is_vasp: z.boolean().optional(),
  is_nearest_vasp: z.boolean().optional(),
  entity_name: z.string().nullable().optional(),
  hop: z.number().nullable().optional(),
  confidence: z.number().nullable().optional(),
  incoming_count: z.number().optional(),
  outgoing_count: z.number().optional(),
  attribution_amount: z.string().nullable().optional(),
  attribution_asset: z.string().nullable().optional(),
})
export type GraphNode = z.infer<typeof graphNodeSchema>

export const graphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  asset: z.string().nullable(),
  amount: z.string().nullable(),
  tx_hash: z.string(),
  timestamp: z.string().nullable().optional(),
  is_attribution_path: z.boolean().optional(),
})
export type GraphEdge = z.infer<typeof graphEdgeSchema>

export const investigationGraphSchema = z.object({
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
})
export type InvestigationGraph = z.infer<typeof investigationGraphSchema>

export const findingSchema = z.object({
  id: z.string(),
  type: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'unknown']),
  title: z.string().nullable().optional(),
  wallet: z.string().nullable().optional(),
  description: z.string(),
  confidence: z.number().nullable().optional(),
  evidence: z.string().nullable().optional(),
})
export type Finding = z.infer<typeof findingSchema>

export const nearestVaspAttributionSchema = z.object({
  vasp_name: z.string().nullable(),
  vasp_type: z.string().nullable(),
  hop_count: z.number(),
  deposit_wallet: z.string(),
  amount: z.string().nullable(),
  asset: z.string().nullable(),
  confidence: z.number().nullable().optional(),
  evidence: z.string().nullable(),
  transaction_path: z.array(z.string()),
})
export type NearestVaspAttribution = z.infer<typeof nearestVaspAttributionSchema>

export const findingsResponseSchema = z.object({
  findings: z.array(findingSchema),
  nearest_vasp: nearestVaspAttributionSchema.optional().nullable(),
})


export const caseFindingSchema = findingSchema.extend({
  investigation_id: z.string(),
  case_id: z.string(),
  case_title: z.string(),
})
export type CaseFinding = z.infer<typeof caseFindingSchema>

export const investigationSummarySchema = z.object({
  investigation_id: z.string(),
  case_id: z.string(),
  case_title: z.string(),
  chain: z.string(),
  start_address: z.string(),
  status: investigationStatusSchema,
  node_count: z.number(),
  edge_count: z.number(),
  started_at: z.string(),
  error: z.string().nullable().optional(),
})
export type InvestigationSummary = z.infer<typeof investigationSummarySchema>
