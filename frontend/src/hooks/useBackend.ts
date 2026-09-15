import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  bulkLinkEntitiesRequest,
  fetchDataCollectionCounts,
  fetchEntityLinkRows,
  fetchEntityLinks,
  fetchImportBatches,
  linkEntityRequest,
  revertImportBatchRequest,
} from '@/api/backend'
import type { EntityLinkImportRow } from '@/schemas/backend'

export function useDataCollectionCounts() {
  return useQuery({ queryKey: ['backend', 'collection-counts'], queryFn: fetchDataCollectionCounts, refetchInterval: 8000 })
}

export function useEntityLinks() {
  return useQuery({ queryKey: ['backend', 'entity-links'], queryFn: fetchEntityLinks })
}

export function useEntityLinkRows() {
  return useQuery({ queryKey: ['backend', 'entity-link-rows'], queryFn: fetchEntityLinkRows })
}

export function useImportBatches() {
  return useQuery({ queryKey: ['backend', 'import-batches'], queryFn: fetchImportBatches })
}

function invalidateLinkingQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['backend', 'entity-links'] })
  queryClient.invalidateQueries({ queryKey: ['backend', 'entity-link-rows'] })
  queryClient.invalidateQueries({ queryKey: ['backend', 'collection-counts'] })
  queryClient.invalidateQueries({ queryKey: ['backend', 'import-batches'] })
  queryClient.invalidateQueries({ queryKey: ['admin', 'audit-log'] })
}

export function useLinkEntity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      chain: string
      address: string
      entity_id?: string
      name: string
      type: string
      jurisdiction?: string
      confidence: number
    }) => linkEntityRequest(input),
    onSuccess: () => invalidateLinkingQueries(queryClient),
  })
}

export function useBulkLinkEntities() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rows: EntityLinkImportRow[]) => bulkLinkEntitiesRequest(rows),
    onSuccess: () => invalidateLinkingQueries(queryClient),
  })
}

export function useRevertImportBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (batchId: string) => revertImportBatchRequest(batchId),
    onSuccess: () => invalidateLinkingQueries(queryClient),
  })
}
