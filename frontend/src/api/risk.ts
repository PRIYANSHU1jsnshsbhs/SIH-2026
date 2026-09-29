import { apiClient } from './client'
import { parseEnvelope } from './envelope'
import { riskFeaturesSchema, walletRiskResponseSchema, type WalletRiskInput } from '@/schemas/risk'

export async function fetchWalletRisk(input: WalletRiskInput) {
  const response = await apiClient<any>(`/risk/wallet`, {
    method: 'POST',
    body: {
      chain: input.chain,
      address: input.address
    }
  })
  const data = response?.data || {}
  return parseEnvelope(walletRiskResponseSchema, {
    success: true,
    data: {
      wallet: data.address,
      risk_score: data.score,
      risk_level: String(data.category || 'UNKNOWN').toLowerCase(),
      model_version: null,
      reasons: [],
    },
  })
}

export async function fetchWalletRiskFeatures(chain: string, address: string) {
  await apiClient<any>(`/risk/scores/${chain}/${address}`)
  return parseEnvelope(riskFeaturesSchema, {
    success: true,
    data: {
      inflowCount: 0,
      outflowCount: 0,
      avgInflowAmt: 0,
      avgOutflowAmt: 0,
      knownMuleInteractions: 0
    }
  })
}
