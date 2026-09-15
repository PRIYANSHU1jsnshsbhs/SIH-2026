import { z } from 'zod'
import { riskLevelSchema } from './wallets'

export const investigationStatusSchema = z.enum([
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
])
export type InvestigationStatus = z.infer<typeof investigationStatusSchema>

export const startInvestigationInputSchema = z.object({
  case_id: z.string(),
  chain: z.string(),
  start_address: z.string().min(1),
  max_hops: z.number().min(1).max(8),
  min_value: z.number().min(0),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
})
export type StartInvestigationInput = z.infer<typeof startInvestigationInputSchema>

export const investigationCreatedSchema = z.object({
  investigation_id: z.string(),
  status: investigationStatusSchema,
})

export const investigationStatusResponseSchema = z.object({
  investigation_id: z.string(),
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
  type: z.enum(['wallet', 'contract', 'vasp', 'bridge', 'mixer']),
  label: z.string(),
  risk_score: z.number(),
  risk_level: riskLevelSchema,
  is_seed: z.boolean().optional(),
  entity_name: z.string().nullable().optional(),
})
export type GraphNode = z.infer<typeof graphNodeSchema>

export const graphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  asset: z.string(),
  amount: z.string(),
  tx_hash: z.string(),
  timestamp: z.string(),
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
  severity: z.enum(['high', 'medium', 'low']),
  wallet: z.string(),
  description: z.string(),
  confidence: z.number(),
  evidence: z.string(),
})
export type Finding = z.infer<typeof findingSchema>

export const findingsResponseSchema = z.object({
  findings: z.array(findingSchema),
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
})
export type InvestigationSummary = z.infer<typeof investigationSummarySchema>
