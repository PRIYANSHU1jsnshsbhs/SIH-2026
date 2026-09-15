import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelJobRequest,
  fetchIndexerStatus,
  fetchJobQueue,
  fetchWorkerLogs,
  reprocessBlocksRequest,
  retryJobRequest,
  startIndexerRequest,
} from '@/api/devops'

export function useIndexerStatus() {
  return useQuery({ queryKey: ['devops', 'indexer-status'], queryFn: fetchIndexerStatus, refetchInterval: 5000 })
}

export function useJobQueue() {
  return useQuery({ queryKey: ['devops', 'job-queue'], queryFn: fetchJobQueue, refetchInterval: 4000 })
}

export function useWorkerLogs() {
  return useQuery({ queryKey: ['devops', 'worker-logs'], queryFn: fetchWorkerLogs, refetchInterval: 4000 })
}

export function useStartIndexer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ chain, fromBlock }: { chain: string; fromBlock: number }) => startIndexerRequest(chain, fromBlock),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devops', 'indexer-status'] }),
  })
}

export function useReprocessBlocks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ chain, fromBlock, toBlock }: { chain: string; fromBlock: number; toBlock: number }) =>
      reprocessBlocksRequest(chain, fromBlock, toBlock),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devops', 'job-queue'] }),
  })
}

export function useCancelJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => cancelJobRequest(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devops', 'job-queue'] }),
  })
}

export function useRetryJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => retryJobRequest(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devops', 'job-queue'] }),
  })
}
