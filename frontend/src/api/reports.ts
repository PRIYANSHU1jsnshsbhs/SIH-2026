import { apiClient } from './client'
import { parseEnvelope } from './envelope'
import { reportListResponseSchema, reportSummarySchema, type CreateReportInput } from '@/schemas/reports'

export async function fetchReports() {
  const response = await apiClient<any>('/reports')
  const reports = response?.data || []
  const mapped = reports.map((r: any) => ({
    report_id: r.id,
    investigation_id: r.investigationId,
    case_id: null,
    case_title: r.title || 'VASP Attribution Report',
    format: 'pdf',
    status: 'completed',
    created_at: r.createdAt ?? null,
  }))
  return parseEnvelope(reportListResponseSchema, { success: true, data: { reports: mapped } })
}

export async function createReportRequest(input: CreateReportInput) {
  const response = await apiClient<any>(`/investigations/${input.investigation_id}/reports`, {
    method: 'POST'
  })
  const data = response?.data || {}
  
  const rep = {
    report_id: data.id,
    investigation_id: input.investigation_id,
    case_id: null,
    case_title: data.title || 'VASP Attribution Report',
    format: 'pdf',
    status: 'completed',
    created_at: data.createdAt ?? null,
  }

  return parseEnvelope(reportSummarySchema, { success: true, data: rep })
}

export async function fetchReport(reportId: string) {
  const response = await apiClient<any>(`/reports/${reportId}`)
  const r = response?.data
  const mapped = {
    report_id: r.id,
    investigation_id: r.investigationId,
    case_id: null,
    case_title: r.title || 'VASP Attribution Report',
    format: 'pdf',
    status: 'completed',
    created_at: r.createdAt ?? null,
  }
  return parseEnvelope(reportSummarySchema, { success: true, data: mapped })
}

export async function downloadReportPdf(reportId: string): Promise<Blob> {
  return apiClient<Blob>(`/reports/${reportId}/download`, { responseType: 'blob' })
}
