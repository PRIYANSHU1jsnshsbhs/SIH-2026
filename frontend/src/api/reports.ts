import { createReport, delay, getReport, getReportContent, listReports } from '@/mocks/mockStore'
import { renderReportHtml } from '@/mocks/reportRenderer'
import { parseEnvelope, ApiRequestError } from './envelope'
import { reportContentSchema, reportListResponseSchema, reportSummarySchema, type CreateReportInput } from '@/schemas/reports'

export async function fetchReports() {
  await delay()
  const reports = listReports()
  return parseEnvelope(reportListResponseSchema, { success: true, data: { reports } })
}

export async function createReportRequest(input: CreateReportInput) {
  await delay()
  const report_id = createReport({ investigation_id: input.investigation_id, format: input.format, include: input.include })
  const report = getReport(report_id)!
  return parseEnvelope(reportSummarySchema, { success: true, data: report })
}

export async function fetchReport(reportId: string) {
  await delay(150)
  const report = getReport(reportId)
  if (!report) throw new ApiRequestError('REPORT_NOT_FOUND', `Report ${reportId} was not found`)
  return parseEnvelope(reportSummarySchema, { success: true, data: report })
}

/** The assembled content behind a completed report — real case/investigation/findings
 * data, not a stub. Used for both "View" (rendered inline) and "Download" (as HTML). */
export async function fetchReportContent(reportId: string) {
  await delay(200)
  const content = getReportContent(reportId)
  if (!content) throw new ApiRequestError('REPORT_NOT_READY', `Report ${reportId} isn't completed yet, or doesn't exist`)
  return parseEnvelope(reportContentSchema, { success: true, data: content })
}

export async function fetchReportHtml(reportId: string): Promise<string> {
  const content = await fetchReportContent(reportId)
  return renderReportHtml(content)
}
