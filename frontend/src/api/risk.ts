import { computeWalletRisk, delay, getWalletRiskFeatures } from '@/mocks/mockStore'
import { parseEnvelope } from './envelope'
import { riskFeaturesSchema, walletRiskResponseSchema, type WalletRiskInput } from '@/schemas/risk'

export async function fetchWalletRisk(input: WalletRiskInput) {
  await delay()
  const result = computeWalletRisk(input.chain, input.address)
  return parseEnvelope(walletRiskResponseSchema, { success: true, data: result })
}

export async function fetchWalletRiskFeatures(chain: string, address: string) {
  await delay()
  const features = getWalletRiskFeatures(chain, address)
  return parseEnvelope(riskFeaturesSchema, { success: true, data: features })
}
