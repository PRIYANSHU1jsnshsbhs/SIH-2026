import {
  countHighRiskFindingsAcrossCases,
  delay,
  getHighRiskFindingsAcrossCases,
  getInvestigationFindings,
  getInvestigationGraph,
  getInvestigationStatus,
  listAllInvestigations,
  startInvestigation,
} from '@/mocks/mockStore'
import { parseEnvelope, ApiRequestError } from './envelope'
import { z } from 'zod'
import {
  caseFindingSchema,
  findingsResponseSchema,
  investigationCreatedSchema,
  investigationGraphSchema,
  investigationStatusResponseSchema,
  investigationSummarySchema,
  type StartInvestigationInput,
} from '@/schemas/investigations'

export async function createInvestigation(input: StartInvestigationInput) {
  await delay()
  const investigation_id = startInvestigation(input)
  return parseEnvelope(investigationCreatedSchema, {
    success: true,
    data: { investigation_id, status: 'queued' },
  })
}

export async function fetchInvestigationStatus(investigationId: string) {
  await delay(150)
  const status = getInvestigationStatus(investigationId)
  if (!status) throw new ApiRequestError('INVESTIGATION_NOT_FOUND', `Investigation ${investigationId} was not found`)
  return parseEnvelope(investigationStatusResponseSchema, { success: true, data: status })
}

export async function fetchInvestigationGraph(investigationId: string) {
  await delay()
  const graph = getInvestigationGraph(investigationId)
  if (!graph) throw new ApiRequestError('INVESTIGATION_NOT_FOUND', `Investigation ${investigationId} was not found`)
  return parseEnvelope(investigationGraphSchema, { success: true, data: graph })
}

export async function fetchInvestigationFindings(investigationId: string) {
  await delay()
  const findings = getInvestigationFindings(investigationId)
  return parseEnvelope(findingsResponseSchema, { success: true, data: { findings } })
}

/** Dashboard-only aggregate: high-severity findings across every completed investigation. */
export async function fetchHighRiskFindings(limit = 5) {
  await delay()
  const findings = getHighRiskFindingsAcrossCases(limit)
  return parseEnvelope(z.array(caseFindingSchema), { success: true, data: findings })
}

export async function fetchHighRiskFindingsCount() {
  await delay(150)
  return parseEnvelope(z.number(), { success: true, data: countHighRiskFindingsAcrossCases() })
}

/** Every investigation across every case — backs the Explorer page and the console's `graphs` command. */
export async function fetchAllInvestigations() {
  await delay()
  return parseEnvelope(z.array(investigationSummarySchema), { success: true, data: listAllInvestigations() })
}
