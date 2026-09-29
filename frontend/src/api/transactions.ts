import { apiClient } from './client'
import { parseEnvelope } from './envelope'
import { transactionDetailSchema } from '@/schemas/transactions'

export async function fetchTransaction(chain: string, txHash: string) {
  const response = await apiClient<any>(`/transactions/${chain}/${txHash}`)
  const data = response?.data || {}
  return parseEnvelope(transactionDetailSchema, {
    success: true,
    data: {
      tx_hash: data.txHash,
      block_number: data.block || 0,
      timestamp: data.timestamp || new Date().toISOString(),
      from: data.fromAddress,
      to: data.toAddress,
      asset: data.asset || 'N/A',
      amount: data.value != null ? String(data.value) : '0',
      status: (data.status || 'confirmed').toLowerCase(),
      chain: data.chain || chain,
      native_value: data.value != null ? String(data.value) : '0',
      gas_used: 0,
      token_transfers: data.tokenTransfers || [],
    }
  })
}
