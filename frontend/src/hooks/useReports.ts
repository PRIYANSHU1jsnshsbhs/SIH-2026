import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createReportRequest, fetchReport, fetchReportContent, fetchReports } from '@/api/reports'
import type { CreateReportInput } from '@/schemas/reports'

export function useReports(enabled = true) {
  return useQuery({ queryKey: ['reports'], queryFn: fetchReports, enabled })
}

export function useReport(reportId: string | undefined) {
  return useQuery({
    queryKey: ['reports', reportId],
    queryFn: () => fetchReport(reportId!),
    enabled: !!reportId,
    refetchInterval: (query) => (query.state.data?.status === 'completed' ? false : 700),
  })
}

/** The full assembled content behind a completed report — only fetchable once
 * the report's status has reached "completed" (checked via useReport elsewhere). */
export function useReportContent(reportId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['reports', reportId, 'content'],
    queryFn: () => fetchReportContent(reportId!),
    enabled: !!reportId && enabled,
  })
}

export function useCreateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateReportInput) => createReportRequest(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  })
}
