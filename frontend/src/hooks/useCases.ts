import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addCaseWallet, createCaseRequest, fetchCase, fetchCases, updateCaseRequest } from '@/api/cases'
import type { AddWalletInput, CreateCaseInput, UpdateCaseInput } from '@/schemas/cases'

export function useCases(filters: { status?: string; priority?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: () => fetchCases(filters),
  })
}

export function useCase(caseId: string | undefined) {
  return useQuery({
    queryKey: ['cases', caseId],
    queryFn: () => fetchCase(caseId!),
    enabled: !!caseId,
  })
}

export function useCreateCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCaseInput) => createCaseRequest(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  })
}

export function useAddWallet(caseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AddWalletInput) => addCaseWallet(caseId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases', caseId] }),
  })
}

export function useUpdateCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ caseId, input }: { caseId: string; input: UpdateCaseInput }) => updateCaseRequest(caseId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['cases', variables.caseId] })
    },
  })
}
