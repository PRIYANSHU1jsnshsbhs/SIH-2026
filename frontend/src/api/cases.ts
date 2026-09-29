import { apiClient } from './client'
import { parseEnvelope } from './envelope'
import {
  caseDetailSchema,
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

// Temporary mapper until we define full Zod backend schemas or if we just want to cast
function mapCaseDtoToSummary(dto: any): CaseSummary {
  return parseEnvelope(caseSummarySchema, {
    success: true,
    data: {
      case_id: dto.id,
      case_number: dto.caseNumber || undefined,
      title: dto.title || 'Unknown Case',
      description: dto.description || undefined,
      status: dto.status?.toLowerCase() || 'open',
      priority: dto.priority?.toLowerCase() || 'medium',
      wallets_count: 0, // Backend does not return these counts in list
      investigations_count: 0,
      created_at: dto.createdAt || new Date().toISOString(),
      updated_at: dto.updatedAt || new Date().toISOString(),
    }
  })
}

export async function fetchCases(filters: {
  status?: string
  priority?: string
  search?: string
  page?: number
  limit?: number
} = {}): Promise<CaseListResponse> {
  // Map page to 0-indexed for Spring
  const page = filters.page ? filters.page - 1 : 0
  const size = filters.limit || 20

  const response = await apiClient<any>('/cases', {
    params: { page, size, sort: 'createdAt,desc' }
  })
  const data = response?.data || {}
  
  // Spring Page<T> format is { content: T[], totalElements: number, ... }
  const rawItems = data?.content || []
  
  const items = await Promise.all(
    rawItems.map(async (dto: any) => {
      const summary = mapCaseDtoToSummary(dto)
      const [walletsResp, invsResp] = await Promise.all([
        apiClient<any>(`/cases/${dto.id}/wallets`),
        apiClient<any>(`/cases/${dto.id}/investigations`),
      ])
      summary.wallets_count = (walletsResp?.data || []).length
      summary.investigations_count = (invsResp?.data?.content || []).length
      return summary
    })
  )

  const search = filters.search?.trim().toLowerCase()
  const filteredItems = items.filter((item) => {
    const matchesSearch = !search
      || item.title.toLowerCase().includes(search)
      || item.case_id.toLowerCase().includes(search)
      || item.case_number?.toLowerCase().includes(search)
    const matchesStatus = !filters.status || item.status === filters.status
    const matchesPriority = !filters.priority || item.priority === filters.priority
    return matchesSearch && matchesStatus && matchesPriority
  })

  return { cases: filteredItems, total: filters.search || filters.status || filters.priority ? filteredItems.length : (data?.totalElements ?? 0) }
}

export async function fetchCase(caseId: string): Promise<CaseDetail> {
  const caseResponse = await apiClient<any>(`/cases/${caseId}`)
  
  // Fetch wallets and investigations in parallel
  const [walletsResponse, investigationsResponse] = await Promise.all([
    apiClient<any>(`/cases/${caseId}/wallets`),
    apiClient<any>(`/cases/${caseId}/investigations`)
  ])
  
  const caseData = caseResponse?.data
  const walletsData = walletsResponse?.data || []
  const investigationsData = investigationsResponse?.data?.content || []

  const mappedWallets = (walletsData || []).map((w: any) => ({
    wallet_id: w.id,
    chain: w.chain,
    address: w.address,
    label: w.label || undefined,
    source: w.source || undefined,
    risk_level: 'unknown'
  }))

  const mappedInvestigations = (investigationsData || []).map((inv: any) => ({
    investigation_id: inv.id,
    start_address: inv.startAddress || '',
    chain: inv.startChain || '',
    status: (inv.status || 'queued').toLowerCase(),
    created_at: inv.createdAt || new Date().toISOString()
  }))

  const summary = mapCaseDtoToSummary(caseData)

  return parseEnvelope(caseDetailSchema, {
    success: true,
    data: {
      ...summary,
      wallets_count: mappedWallets.length,
      investigations_count: mappedInvestigations.length,
      wallets: mappedWallets,
      investigations: mappedInvestigations,
      findings: [], // Can be populated if backend supports querying case findings
      activity: [], 
    }
  })
}

export async function createCaseRequest(input: CreateCaseInput): Promise<CaseSummary> {
  const response = await apiClient<any>('/cases', {
    method: 'POST',
    body: input,
  })
  return mapCaseDtoToSummary(response?.data)
}

export async function addCaseWallet(caseId: string, input: AddWalletInput): Promise<CaseWallet> {
  const response = await apiClient<any>(`/cases/${caseId}/wallets`, {
    method: 'POST',
    body: input,
  })
  const data = response?.data || {}
  return parseEnvelope(caseWalletSchema, {
    success: true,
    data: {
      wallet_id: data.id,
      chain: data.chain,
      address: data.address,
      label: data.label,
      source: data.source,
      risk_level: 'unknown',
    }
  })
}

export async function updateCaseRequest(caseId: string, input: UpdateCaseInput): Promise<CaseSummary> {
  const response = await apiClient<any>(`/cases/${caseId}`, {
    method: 'PATCH',
    body: input,
  })
  return mapCaseDtoToSummary(response?.data)
}

export async function createVaspRequest(caseId: string, investigationId: string, chain: string, address: string) {
  // First, resolve the entity ID
  const entityResponse = await apiClient<any>(`/entities/address/${chain}/${address}`)
  const entityData = entityResponse?.data
  const entityId = entityData?.entity?.entity_id
  if (!entityId) {
    throw new Error('Could not resolve entity ID for the given address.')
  }

  // Create the request
  const requestResponse = await apiClient<any>(`/cases/${caseId}/vasp-requests`, {
    method: 'POST',
    body: {
      entityId,
      investigationId,
      requestType: 'LEGAL',
      notes: 'Drafted from Investigation Findings'
    }
  })

  return requestResponse?.data
}
