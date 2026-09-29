import { z } from 'zod'

export const reportStatusSchema = z.enum(['generating', 'completed', 'failed'])
export type ReportStatus = z.infer<typeof reportStatusSchema>

export const reportIncludeSchema = z.object({
  transactions: z.boolean(),
  graph: z.boolean(),
  risk_analysis: z.boolean(),
  entity_attribution: z.boolean(),
  cross_chain: z.boolean(),
  fund_flow: z.boolean(),
})
export type ReportInclude = z.infer<typeof reportIncludeSchema>

export const createReportInputSchema = z.object({
  investigation_id: z.string(),
  format: z.enum(['pdf', 'docx']),
  include: reportIncludeSchema,
})
export type CreateReportInput = z.infer<typeof createReportInputSchema>

export const reportSummarySchema = z.object({
  report_id: z.string(),
  investigation_id: z.string(),
  case_id: z.string().nullable(),
  case_title: z.string(),
  format: z.enum(['pdf', 'docx']),
  status: reportStatusSchema,
  created_at: z.string().nullable(),
})
export type ReportSummary = z.infer<typeof reportSummarySchema>

export const reportListResponseSchema = z.object({
  reports: z.array(reportSummarySchema),
})

