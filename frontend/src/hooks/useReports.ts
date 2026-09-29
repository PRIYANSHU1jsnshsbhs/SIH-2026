import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createReportRequest, fetchReport, fetchReports } from '@/api/reports'
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

export function useCreateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateReportInput) => createReportRequest(input),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  })
}
