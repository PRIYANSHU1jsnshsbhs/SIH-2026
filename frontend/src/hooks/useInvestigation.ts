import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createInvestigation,
  fetchAllInvestigations,
  fetchHighRiskFindings,
  fetchHighRiskFindingsCount,
  fetchInvestigationFindings,
  fetchInvestigationGraph,
  fetchInvestigationStatus,
} from '@/api/investigations'
import type { StartInvestigationInput } from '@/schemas/investigations'

export function useStartInvestigation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: StartInvestigationInput) => createInvestigation(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases', variables.case_id] })
    },
  })
}

export function useInvestigationStatus(investigationId: string | undefined) {
  return useQuery({
    queryKey: ['investigations', investigationId, 'status'],
    queryFn: () => fetchInvestigationStatus(investigationId!),
    enabled: !!investigationId,
    refetchInterval: (query) => (query.state.data?.status === 'completed' ? false : 800),
  })
}

export function useInvestigationGraph(investigationId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['investigations', investigationId, 'graph'],
    queryFn: () => fetchInvestigationGraph(investigationId!),
    enabled: !!investigationId && enabled,
  })
}

export function useInvestigationFindings(investigationId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['investigations', investigationId, 'findings'],
    queryFn: () => fetchInvestigationFindings(investigationId!),
    enabled: !!investigationId && enabled,
  })
}

export function useHighRiskFindings(limit = 5) {
  return useQuery({
    queryKey: ['investigations', 'high-risk-findings', limit],
    queryFn: () => fetchHighRiskFindings(limit),
  })
}

export function useHighRiskFindingsCount() {
  return useQuery({
    queryKey: ['investigations', 'high-risk-findings-count'],
    queryFn: fetchHighRiskFindingsCount,
  })
}

export function useAllInvestigations() {
  return useQuery({
    queryKey: ['investigations', 'all'],
    queryFn: fetchAllInvestigations,
  })
}
