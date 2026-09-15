import { delay, getAddressEntity, searchEntities } from '@/mocks/mockStore'
import { parseEnvelope } from './envelope'
import { addressEntitySchema, entitySearchResponseSchema } from '@/schemas/entities'

export async function fetchAddressEntity(_chain: string, address: string) {
  await delay()
  const result = getAddressEntity(address)
  return parseEnvelope(addressEntitySchema, { success: true, data: result })
}

export async function searchEntitiesRequest(query: string) {
  await delay()
  const entities = searchEntities(query)
  return parseEnvelope(entitySearchResponseSchema, {
    success: true,
    data: { entities, total: entities.length },
  })
}
