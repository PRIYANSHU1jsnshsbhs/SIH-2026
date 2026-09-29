import { apiClient } from './client'
import { parseEnvelope } from './envelope'
import { walletSchema, walletSearchResponseSchema, walletStatisticsSchema, type Wallet } from '@/schemas/wallets'
import { transactionListResponseSchema } from '@/schemas/transactions'

export async function fetchWallet(chain: string, address: string): Promise<Wallet> {
  const response = await apiClient<any>(`/wallets/${chain}/${address}`)
  const data = response?.data || {}
  return parseEnvelope(walletSchema, {
    success: true,
    data: {
      chain: data.chain || chain,
      address: data.address || address,
      first_seen: data.firstTxDate ?? null,
      last_seen: data.lastTxDate ?? null,
      transaction_count: data.transactionCount ?? 0,
      total_received: data.balance != null ? String(data.balance) : '0',
      total_sent: null,
      unique_counterparties: null,
      entity: null,
      risk: {
        score: null,
        level: 'unknown',
      }
    }
  })
}

export async function fetchWalletStatistics(chain: string, address: string) {
  const response = await apiClient<any>(`/wallets/${chain}/${address}/statistics`)
  const data = response?.data || {}
  return parseEnvelope(walletStatisticsSchema, {
    success: true,
    data: {
      transaction_count: data.transactionCount || 0,
      incoming_count: 0,
      outgoing_count: 0,
      total_received: data.balance != null ? String(data.balance) : '0',
      total_sent: '0',
      unique_incoming_addresses: 0,
      unique_outgoing_addresses: 0,
      forwarding_ratio: 0,
      median_holding_time_seconds: 0,
    }
  })
}

export async function fetchWalletTransactions(chain: string, address: string, filters: any = {}) {
  const response = await apiClient<any>(`/wallets/${chain}/${address}/transactions`, { params: filters })
  const data = response?.data || []
  const transactions = (data || []).map((tx: any) => ({
    tx_hash: tx.txHash,
    block_number: tx.block || 0,
    timestamp: tx.timestamp || new Date().toISOString(),
    from: tx.fromAddress,
    to: tx.toAddress,
    asset: tx.asset || 'N/A',
    amount: tx.value != null ? String(tx.value) : '0',
    status: (tx.status || 'confirmed').toLowerCase(),
    direction: tx.toAddress === address ? 'in' : 'out',
    risk_level: 'unknown',
  }))
  return parseEnvelope(transactionListResponseSchema, {
    success: true,
    data: { transactions, total: transactions.length }
  })
}

export async function searchWalletsRequest(_query: string) {
  // If backend has search, we can use it. But for now, we hit /entities/address/{chain}/{address} if query is an address.
  // Actually, we can just return empty or fake for search if not supported.
  return parseEnvelope(walletSearchResponseSchema, {
    success: true,
    data: { wallets: [], total: 0 }
  })
}
