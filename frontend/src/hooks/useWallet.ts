import { useQuery } from '@tanstack/react-query'
import { fetchWallet, fetchWalletStatistics, fetchWalletTransactions, searchWalletsRequest } from '@/api/wallets'
import { fetchAddressEntity } from '@/api/entities'
import { fetchWalletRisk, fetchWalletRiskFeatures } from '@/api/risk'

export function useWallet(chain: string | undefined, address: string | undefined) {
  return useQuery({
    queryKey: ['wallets', chain, address],
    queryFn: () => fetchWallet(chain!, address!),
    enabled: !!chain && !!address,
  })
}

export function useWalletStatistics(chain: string | undefined, address: string | undefined) {
  return useQuery({
    queryKey: ['wallets', chain, address, 'statistics'],
    queryFn: () => fetchWalletStatistics(chain!, address!),
    enabled: !!chain && !!address,
  })
}

export function useWalletTransactions(chain: string | undefined, address: string | undefined) {
  return useQuery({
    queryKey: ['wallets', chain, address, 'transactions'],
    queryFn: () => fetchWalletTransactions(chain!, address!),
    enabled: !!chain && !!address,
  })
}

export function useWalletEntity(chain: string | undefined, address: string | undefined) {
  return useQuery({
    queryKey: ['entities', 'address', chain, address],
    queryFn: () => fetchAddressEntity(chain!, address!),
    enabled: !!chain && !!address,
  })
}

export function useWalletRisk(chain: string | undefined, address: string | undefined) {
  return useQuery({
    queryKey: ['risk', 'wallet', chain, address],
    queryFn: () => fetchWalletRisk({ chain: chain!, address: address! }),
    enabled: !!chain && !!address,
  })
}

export function useWalletRiskFeatures(chain: string | undefined, address: string | undefined) {
  return useQuery({
    queryKey: ['risk', 'wallet', chain, address, 'features'],
    queryFn: () => fetchWalletRiskFeatures(chain!, address!),
    enabled: !!chain && !!address,
  })
}

export function useWalletSearch(query: string) {
  return useQuery({
    queryKey: ['wallets', 'search', query],
    queryFn: () => searchWalletsRequest(query),
    enabled: query.length > 2,
  })
}
