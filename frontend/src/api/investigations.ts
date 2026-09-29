import { apiClient } from './client'
import { parseEnvelope } from './envelope'
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
  // Frontend gives start_address and chain, backend needs caseWalletId.
  // We fetch wallets for this case and find the matching one.
  const walletsResponse = await apiClient<any>(`/cases/${input.case_id}/wallets`)
  const wallets = walletsResponse?.data || []
  const matchingWallet = wallets.find((w: any) => w.chain?.toLowerCase() === input.chain.toLowerCase() && w.address === input.start_address)
  
  if (!matchingWallet) {
    throw new Error('Wallet not found in case. Please add it first.')
  }

  const response = await apiClient<any>('/investigations', {
    method: 'POST',
    body: {
      caseId: input.case_id,
      caseWalletId: matchingWallet.id,
      title: `Investigation for ${input.start_address.slice(0, 8)}...`,
      maxHops: input.max_hops,
      minValue: input.min_value,
      fromDate: input.from_date,
      toDate: input.to_date,
    }
  })
  const data = response?.data || {}

  return parseEnvelope(investigationCreatedSchema, {
    success: true,
    data: { investigation_id: data.id, status: data.status },
  })
}

export async function fetchInvestigationStatus(investigationId: string) {
  const response = await apiClient<any>(`/investigations/${investigationId}`)
  const data = response?.data || {}
  return parseEnvelope(investigationStatusResponseSchema, {
    success: true,
    data: {
      investigation_id: data.id,
      chain: data.startChain,
      start_address: data.startAddress,
      status: data.status,
      progress: data.progress ?? 0,
      stage: data.currentStage ?? '',
      nodes_found: data.nodesFound ?? 0,
      edges_found: data.edgesFound ?? 0,
      error: data.error,
    }
  })
}

export async function fetchInvestigationGraph(investigationId: string) {
  const response = await apiClient<any>(`/investigations/${investigationId}/graph`)
  const data = response?.data || {}
  
  const rawNodes = data.nodes || []
  const rawEdges = data.edges || []
  
  const canonicalNodeId = (n: any) => String(n.address || n.id || '').trim()
  const entityType = (node: any) => {
    const raw = String(node.entityType || '').toLowerCase()
    if (raw === 'smart_contract') return 'contract'
    if (['contract', 'vasp', 'exchange', 'bridge', 'mixer'].includes(raw)) return raw
    if (raw) return 'unknown'
    return 'wallet'
  }
  const riskLevel = (score: unknown) => {
    if (typeof score !== 'number') return 'unknown'
    if (score >= 70) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }
  
  const idByBackendId = new Map<string, string>()
  const idByAddress = new Map<string, string>()
  
  for (const node of rawNodes) {
      const canonical = canonicalNodeId(node)
      if (node.id) idByBackendId.set(node.id, canonical)
      if (node.address) idByAddress.set(node.address, canonical)
  }

  const uniqueNodes = new Map<string, any>()
  for (const node of rawNodes) {
    const id = canonicalNodeId(node)
    if (!id) {
      if (import.meta.env.DEV) console.warn('Graph node without a canonical ID was removed:', node)
      continue
    }
    if (uniqueNodes.has(id)) {
      if (import.meta.env.DEV) console.warn('Duplicate graph node ID was removed:', id)
      continue
    }
    uniqueNodes.set(id, node)
  }

  const mappedNodes = Array.from(uniqueNodes.entries()).map(([id, n]) => ({
    id,
    address: n.address || id,
    chain: n.chain || '',
    type: entityType(n),
    label: n.address || id,
    risk_score: typeof n.riskScore === 'number' ? n.riskScore : null,
    risk_level: riskLevel(n.riskScore),
    is_seed: false,
    is_vasp: Boolean(n.vasp ?? n.isVasp) || ['EXCHANGE', 'VASP'].includes(String(n.entityType || '').toUpperCase()),
    entity_name: n.entityName ?? null,
    hop: null,
    confidence: null,
    incoming_count: 0,
    outgoing_count: 0,
    attribution_amount: null,
    attribution_asset: null,
  }))
  
  const seenEdgeIds = new Set<string>()
  const mappedEdges = rawEdges.flatMap((e: any) => {
    const edgeId = String(e.id || '').trim()
    if (!edgeId || seenEdgeIds.has(edgeId)) {
      if (import.meta.env.DEV) console.warn(edgeId ? 'Duplicate graph edge ID was removed:' : 'Graph edge without an ID was removed:', edgeId || e)
      return []
    }
    seenEdgeIds.add(edgeId)
    const mappedSource = idByBackendId.get(e.source) || idByAddress.get(e.source) || e.source
    const mappedTarget = idByBackendId.get(e.target) || idByAddress.get(e.target) || e.target

    return [{
      id: edgeId,
      source: mappedSource,
      target: mappedTarget,
      asset: e.asset ?? null,
      amount: e.value != null ? String(e.value) : null,
      tx_hash: e.txHash || edgeId,
      timestamp: e.timestamp ?? null,
      is_attribution_path: false,
    }]
  })
  
  const validNodeIds = new Set(mappedNodes.map((n: any) => n.id))
  
  const safeEdges = mappedEdges.filter((e: any) => {
    const isValid = validNodeIds.has(e.source) && validNodeIds.has(e.target)
    if (!isValid) {
      if (import.meta.env.DEV) console.warn('Orphan edge detected:', e)
    }
    return isValid
  })
  
  if (import.meta.env.DEV) {
    console.info(`Graph validation: ${mappedNodes.length} nodes, ${safeEdges.length} edges, orphan edge count = ${mappedEdges.length - safeEdges.length}`)
  }

  return parseEnvelope(investigationGraphSchema, {
    success: true,
    data: {
      nodes: mappedNodes,
      edges: safeEdges,
    }
  })
}

export async function fetchInvestigationFindings(investigationId: string) {
  const [findingsResponse, attributionResponse] = await Promise.all([
    apiClient<any>(`/investigations/${investigationId}/findings`),
    apiClient<any>(`/investigations/${investigationId}/attribution`),
  ])
  const rawFindings = findingsResponse?.data || []
  const data = attributionResponse?.data || []
  const nearestAttribution = data[0]

  const mappedFindings = rawFindings.map((finding: any) => {
    const isVaspExposure = String(finding.type).toUpperCase() === 'VASP_EXPOSURE'
    return {
      id: finding.id,
      type: String(finding.type || '').toLowerCase(),
      title: finding.title ?? null,
      severity: String(finding.severity || 'UNKNOWN').toLowerCase(),
      wallet: isVaspExposure ? nearestAttribution?.destinationAddress ?? null : null,
      description: finding.description || finding.title || '',
      confidence: isVaspExposure ? nearestAttribution?.confidence ?? null : null,
      evidence: finding.evidence ?? null,
    }
  })

  // Derive nearest_vasp directly from the structured DTO.
  let nearestVasp = null
  if (data && data.length > 0) {
    const a = data[0]

    nearestVasp = {
      vasp_name: a.entityName ?? null,
      vasp_type: a.entityType ?? null,
      hop_count: a.hopCount,
      deposit_wallet: a.destinationAddress,
      amount: a.amount != null ? String(a.amount) : null,
      asset: a.asset ?? null,
      confidence: a.confidence ?? null,
      evidence: a.evidence ?? null,
      transaction_path: a.path ? a.path.split('->').map((s: string) => s.trim()) : [],
    }
  }

  return parseEnvelope(findingsResponseSchema, {
    success: true,
    data: {
      findings: mappedFindings,
      nearest_vasp: nearestVasp
    }
  })
}

/** Dashboard-only aggregate: high-severity findings across every completed investigation. */
export async function fetchHighRiskFindings(limit = 5) {
    const invsResponse = await fetchAllInvestigations()

    const completedInvs = invsResponse.filter((i: any) => i.status === 'completed')
    const findingsPromises = completedInvs.map(async (inv: any) => {
      const findingsResp = await fetchInvestigationFindings(inv.investigation_id)
      if (!findingsResp) return []
      
      return findingsResp.findings.map((f: any) => ({
        ...f,
        investigation_id: inv.investigation_id,
        case_id: inv.case_id,
        case_title: inv.case_title,
      }))
    })

    const allFindings = (await Promise.all(findingsPromises)).flat()
    const highRisk = allFindings.filter((f: any) => f.severity === 'critical' || f.severity === 'high')
    
    return parseEnvelope(z.array(caseFindingSchema), { success: true, data: highRisk.slice(0, limit) })
}

export async function fetchHighRiskFindingsCount() {
  const findings = await fetchHighRiskFindings(1000)
  return parseEnvelope(z.number(), { success: true, data: findings ? findings.length : 0 })
}

/** Every investigation across every case — backs the Explorer page and the console's `graphs` command. */
export async function fetchAllInvestigations() {
    const cases = await apiClient<any>('/cases', { params: { page: 0, size: 100, sort: 'createdAt,desc' } })
    const caseItems = cases?.data?.content || []
    
    const allInvests = await Promise.all(
      caseItems.map(async (c: any) => {
        const invs = await apiClient<any>(`/cases/${c.id}/investigations`)
        return (invs?.data?.content || []).map((inv: any) => ({
          investigation_id: inv.id,
          case_id: c.id || 'unknown',
          case_title: c.title || 'Unknown Case',
          start_address: inv.startAddress || '',
          chain: inv.startChain || 'mock',
          status: inv.status,
          node_count: inv.nodesFound ?? 0,
          edge_count: inv.edgesFound ?? 0,
          started_at: inv.createdAt || new Date().toISOString(),
          error: inv.error ?? null,
        }))
      })
    )
    
    const flat = allInvests.flat()
    return parseEnvelope(z.array(investigationSummarySchema), { success: true, data: flat })
}
