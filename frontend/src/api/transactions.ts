import { delay, getTransaction } from '@/mocks/mockStore'
import { parseEnvelope, ApiRequestError } from './envelope'
import { transactionDetailSchema } from '@/schemas/transactions'

export async function fetchTransaction(_chain: string, txHash: string) {
  await delay()
  const tx = getTransaction(txHash)
  if (!tx) throw new ApiRequestError('TRANSACTION_NOT_FOUND', `Transaction ${txHash} was not found`)
  return parseEnvelope(transactionDetailSchema, { success: true, data: tx })
}
