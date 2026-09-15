import { delay, getWallet, getWalletTransactions, searchWallets } from '@/mocks/mockStore'
import { parseEnvelope } from './envelope'
import { walletSchema, walletSearchResponseSchema, walletStatisticsSchema, type Wallet } from '@/schemas/wallets'
import { transactionListResponseSchema } from '@/schemas/transactions'

export async function fetchWallet(chain: string, address: string): Promise<Wallet> {
  await delay()
  const wallet = getWallet(chain, address)
  const { transactions: _transactions, ...rest } = wallet
  return parseEnvelope(walletSchema, { success: true, data: rest })
}

export async function fetchWalletStatistics(chain: string, address: string) {
  await delay()
  const wallet = getWallet(chain, address)
  return parseEnvelope(walletStatisticsSchema, {
    success: true,
    data: {
      transaction_count: wallet.transaction_count,
      incoming_count: wallet.transactions.filter((t) => t.to === address).length,
      outgoing_count: wallet.transactions.filter((t) => t.from === address).length,
      total_received: wallet.total_received,
      total_sent: wallet.total_sent,
      unique_incoming_addresses: wallet.unique_counterparties,
      unique_outgoing_addresses: wallet.unique_counterparties,
      forwarding_ratio: 0.87,
      median_holding_time_seconds: 720,
    },
  })
}

export async function fetchWalletTransactions(chain: string, address: string) {
  await delay()
  const transactions = getWalletTransactions(chain, address)
  return parseEnvelope(transactionListResponseSchema, {
    success: true,
    data: { transactions, total: transactions.length },
  })
}

export async function searchWalletsRequest(query: string) {
  await delay()
  const wallets = searchWallets(query)
  return parseEnvelope(walletSearchResponseSchema, {
    success: true,
    data: { wallets, total: wallets.length },
  })
}
