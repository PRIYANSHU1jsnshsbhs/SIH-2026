import { delay, addWalletToCase, createCase, getCase, getCaseInvestigations, listCases, updateCase } from '@/mocks/mockStore'
import { getInvestigationFindings } from '@/mocks/mockStore'
import { parseEnvelope, ApiRequestError } from './envelope'
import {
  caseDetailSchema,
  caseListResponseSchema,
  caseSummarySchema,
  caseWalletSchema,
  type AddWalletInput,
  type CaseDetail,
  type CaseListResponse,
  type CaseSummary,
  type CaseWallet,
  type CreateCaseInput,
  type UpdateCaseInput,
} from '@/schemas/cases'

export async function fetchCases(filters: {
  status?: string
  priority?: string
  search?: string
  page?: number
  limit?: number
} = {}): Promise<CaseListResponse> {
  await delay()
  const items = listCases(filters)
  return parseEnvelope(caseListResponseSchema, {
    success: true,
    data: { cases: items, total: items.length },
  })
}

export async function fetchCase(caseId: string): Promise<CaseDetail> {
  await delay()
  const record = getCase(caseId)
  if (!record) {
    throw new ApiRequestError('CASE_NOT_FOUND', `Case ${caseId} was not found`)
  }
  const investigations = getCaseInvestigations(caseId)
  const findings = investigations
    .filter((inv) => inv.status === 'completed')
    .flatMap((inv) =>
      getInvestigationFindings(inv.investigation_id).map((f) => ({
        investigation_id: inv.investigation_id,
        type: f.type,
        severity: f.severity,
        description: f.description,
      })),
    )
  return parseEnvelope(caseDetailSchema, {
    success: true,
    data: { ...record, investigations, findings },
  })
}

export async function createCaseRequest(input: CreateCaseInput): Promise<CaseSummary> {
  await delay()
  const record = createCase(input)
  return parseEnvelope(caseSummarySchema, { success: true, data: record })
}

export async function addCaseWallet(caseId: string, input: AddWalletInput): Promise<CaseWallet> {
  await delay()
  const entry = addWalletToCase(caseId, input)
  return parseEnvelope(caseWalletSchema, { success: true, data: entry })
}

export async function updateCaseRequest(caseId: string, input: UpdateCaseInput): Promise<CaseSummary> {
  await delay()
  try {
    const record = updateCase(caseId, input)
    return parseEnvelope(caseSummarySchema, { success: true, data: record })
  } catch {
    throw new ApiRequestError('CASE_NOT_FOUND', `Case ${caseId} was not found`)
  }
}
