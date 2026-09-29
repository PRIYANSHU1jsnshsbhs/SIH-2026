import { apiClient } from './client'
import { parseEnvelope } from './envelope'
import { addressEntitySchema, entitySearchResponseSchema } from '@/schemas/entities'
import { ApiRequestError } from './envelope'

export async function fetchAddressEntity(chain: string, address: string) {
  try {
    const response = await apiClient<any>(`/entities/address/${chain}/${address}`)
    const data = response?.data || {}
    return parseEnvelope(addressEntitySchema, {
      success: true,
      data: {
        address: data.address || address,
        entity: data.entity ? { ...data.entity, confidence: data.confidence ?? null } : null,
        evidence: data.evidence || [],
      },
    })
  } catch (error) {
    if (error instanceof ApiRequestError && error.code === 'NOT_FOUND') {
      return parseEnvelope(addressEntitySchema, { success: true, data: { address, entity: null, evidence: [] } })
    }
    throw error
  }
}

export async function searchEntitiesRequest(query: string) {
  const response = await apiClient<any>(`/entities`, { params: { query } })
  return parseEnvelope(entitySearchResponseSchema, response)
}
