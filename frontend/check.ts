import { z } from 'zod';

export const casePrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])
export const caseStatusSchema = z.enum(['open', 'in_progress', 'closed'])

export const caseSummarySchema = z.object({
  case_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: caseStatusSchema,
  priority: casePrioritySchema,
  wallets_count: z.number(),
  investigations_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})

const testPayload = {
    case_id: 'e2d5d1d4-86de-4423-8b28-900b3e772c40',
    title: 'Test Case',
    description: 'Test Case',
    status: 'open',
    priority: 'high',
    wallets_count: 0,
    investigations_count: 0,
    created_at: '2026-09-29T01:29:24.677643+05:30',
    updated_at: '2026-09-29T01:29:24.677643+05:30'
}

console.log('Validating case...', caseSummarySchema.safeParse(testPayload).success);

export const investigationStatusSchema = z.enum([
  'queued',
  'pending',
  'initializing',
  'running',
  'completed',
  'failed',
  'cancelled',
])

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

const invPayload = {
  investigation_id: '18f95c51-5b92-4919-867c-9ab3014a60db',
  case_id: 'e2d5d1d4',
  case_title: 'Test',
  chain: 'mock',
  start_address: 'node-110',
  status: 'completed',
  node_count: 21,
  edge_count: 33,
  started_at: '2026-09-29T01:51:19.497523+05:30'
}

console.log('Validating inv...', investigationSummarySchema.safeParse(invPayload).success);

export const reportSummarySchema = z.object({
  report_id: z.string(),
  investigation_id: z.string(),
  case_id: z.string(),
  case_title: z.string(),
  format: z.string(),
  status: z.enum(['generating', 'completed', 'failed']),
  created_at: z.string(),
})

const reportPayload = {
  report_id: '97e68270',
  investigation_id: 'd0e19a4e',
  case_id: 'unknown-case-id',
  case_title: 'Test',
  format: 'pdf',
  status: 'completed',
  created_at: '2026-09-29'
}
console.log('Validating report...', reportSummarySchema.safeParse(reportPayload).success);

