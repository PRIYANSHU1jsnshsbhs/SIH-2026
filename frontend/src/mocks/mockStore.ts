import {
  SEED_ADDRESSES,
  SEED_CASE,
  SEED_CASE_ID,
  SEED_CHAIN,
  SEED_ENTITY,
  SEED_INVESTIGATION_ID,
  SEED_TRANSACTIONS,
  SEED_USERS,
  SEED_WALLET_LABELS,
} from './fixtures'
import { emptyDataset, generateDataset, type EntityRecord } from './datasetGenerator'
import type { Role } from '@/schemas/auth'
import type { CaseDetail, CasePriority, CaseStatus, CaseWallet } from '@/schemas/cases'
import type { RiskLevel, Wallet } from '@/schemas/wallets'
import type { GraphEdge, GraphNode, InvestigationStatus } from '@/schemas/investigations'
import type { ManagedUser, AuditLogEntry } from '@/schemas/admin'
import type { IndexerStatus, JobQueueEntry, WorkerLogEntry } from '@/schemas/devops'
import type { ReportInclude, ReportStatus } from '@/schemas/reports'
import {
  buildEntityTable,
  buildFindingsList,
  buildGraphSummary,
  buildRiskTable,
  buildTransactionTable,
  type ReportContent,
  type ReportSection,
} from './reportRenderer'

/** Simulated network latency so loading states are actually exercised. */
export function delay(ms = 350 + Math.random() * 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let idCounter = 100

function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${String(idCounter).padStart(3, '0')}`
}

// ---------------------------------------------------------------------------
// The generated dataset — see mocks/datasetGenerator.ts. Generated once at
// module load (deterministic/seeded, so it's identical across reloads), then
// folded together with the one hand-authored demo case (CASE-001 / INV-001)
// below so existing behavior for that case is unaffected.
//
// Build/dev mode controls whether it's generated at all:
//   npm run mock -> big generated dataset (also the default for `npm run dev`)
//   npm run proj -> just the one hand-authored case, for a fast plumbing check
// ---------------------------------------------------------------------------

const dataset = import.meta.env.MODE === 'proj' ? emptyDataset() : generateDataset()

// Fold the hand-authored "Exchange X" entity into the same lookup used for
// every generated entity, so entity search/attribution has one source of truth.
// `addresses` must be lowercased like every generated entity's are — callers
// (e.g. linkWalletToEntity's dedup check) compare against a lowercased key.
const exchangeXEntity: EntityRecord = { ...SEED_ENTITY, addresses: [SEED_ADDRESSES.exchange.toLowerCase()] }
dataset.entities.unshift(exchangeXEntity)
dataset.addressEntity.set(SEED_ADDRESSES.exchange.toLowerCase(), exchangeXEntity)

function riskScoreForTier(tier: RiskLevel): number {
  if (tier === 'high') return 82
  if (tier === 'medium') return 55
  if (tier === 'low') return 15
  return 40
}

function resolveChainForAddress(address: string): string {
  const key = address.toLowerCase()
  const txs = dataset.transactionsByAddress.get(key)
  return txs?.[0]?.chain ?? SEED_CHAIN
}

// ---------------------------------------------------------------------------
// Users / auth
// ---------------------------------------------------------------------------

interface StoredUser {
  id: string
  username: string
  password: string
  name: string
  role: Role
  active: boolean
  last_login: string | null
}

const users: StoredUser[] = SEED_USERS.map((u) => ({ ...u, active: true, last_login: '2026-09-06T08:00:00Z' }))

export function findUserByCredentials(username: string, password: string) {
  return users.find((u) => u.username === username && u.password === password && u.active)
}

export function findUserById(id: string) {
  return users.find((u) => u.id === id)
}

export function listManagedUsers(): ManagedUser[] {
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
    active: u.active,
    last_login: u.last_login,
  }))
}

export function setUserActive(userId: string, active: boolean): ManagedUser {
  const user = users.find((u) => u.id === userId)
  if (!user) throw new Error('USER_NOT_FOUND')
  user.active = active
  appendAuditLog({ actor: 'admin', action: `${active ? 'Activated' : 'Deactivated'} user ${user.username}` })
  return { id: user.id, name: user.name, username: user.username, role: user.role, active: user.active, last_login: user.last_login }
}

export function updateUserRole(userId: string, role: Role): ManagedUser {
  const user = users.find((u) => u.id === userId)
  if (!user) throw new Error('USER_NOT_FOUND')
  const previous = user.role
  user.role = role
  appendAuditLog({ actor: 'admin', action: `Changed role of ${user.username} from ${previous} to ${role}` })
  return { id: user.id, name: user.name, username: user.username, role: user.role, active: user.active, last_login: user.last_login }
}

// ---------------------------------------------------------------------------
// Wallets
// ---------------------------------------------------------------------------

interface StoredWallet extends Wallet {
  transactions: {
    tx_hash: string
    from: string
    to: string
    amount: string
    asset: string
    timestamp: string
    block_number: number
  }[]
}

const walletsDb = new Map<string, StoredWallet>()

function walletKey(chain: string, address: string) {
  return `${chain}:${address.toLowerCase()}`
}

function buildWallet(chain: string, address: string): StoredWallet {
  const key = address.toLowerCase()
  const legacyTxs = SEED_TRANSACTIONS.filter((t) => t.from === address || t.to === address)
  const generatedTxs = dataset.transactionsByAddress.get(key) ?? []
  const txs = legacyTxs.length > 0 ? legacyTxs : generatedTxs
  const sorted = [...txs].sort((a, b) => a.timestamp.localeCompare(b.timestamp))

  const received = txs.filter((t) => t.to.toLowerCase() === key).reduce((s, t) => s + Number(t.amount), 0)
  const sent = txs.filter((t) => t.from.toLowerCase() === key).reduce((s, t) => s + Number(t.amount), 0)

  const legacyMeta = SEED_WALLET_LABELS[address]
  const meta = dataset.walletMeta.get(key)
  const entityRecord = dataset.addressEntity.get(key)
  const tier: RiskLevel = legacyMeta?.risk ?? meta?.riskTier ?? (entityRecord ? 'low' : 'unknown')

  return {
    chain,
    address,
    first_seen: sorted[0]?.timestamp ?? '2026-01-01T00:00:00Z',
    last_seen: sorted[sorted.length - 1]?.timestamp ?? '2026-01-01T00:00:00Z',
    transaction_count: txs.length,
    total_received: received.toFixed(2),
    total_sent: sent.toFixed(2),
    unique_counterparties: new Set(txs.map((t) => (t.from.toLowerCase() === key ? t.to.toLowerCase() : t.from.toLowerCase())))
      .size,
    entity: entityRecord
      ? { name: entityRecord.name, type: entityRecord.type, confidence: entityRecord.confidence }
      : null,
    risk: {
      score: riskScoreForTier(tier),
      level: tier,
    },
    transactions: txs.map((t) => ({
      tx_hash: t.tx_hash,
      from: t.from,
      to: t.to,
      amount: t.amount,
      asset: t.asset,
      timestamp: t.timestamp,
      block_number: t.block_number,
    })),
  }
}

for (const address of Object.values(SEED_ADDRESSES)) {
  walletsDb.set(walletKey(SEED_CHAIN, address), buildWallet(SEED_CHAIN, address))
}

export function getWallet(chain: string, address: string): StoredWallet {
  const key = walletKey(chain, address)
  if (!walletsDb.has(key)) {
    walletsDb.set(key, buildWallet(chain, address))
  }
  return walletsDb.get(key)!
}

const legacyAddressSet = new Set(Object.values(SEED_ADDRESSES).map((a) => a.toLowerCase()))

export function searchWallets(query: string) {
  const q = query.toLowerCase()
  const seen = new Set<string>()
  const matches: string[] = []

  for (const address of Object.values(SEED_ADDRESSES)) {
    if (address.toLowerCase().includes(q) && !seen.has(address.toLowerCase())) {
      seen.add(address.toLowerCase())
      matches.push(address)
    }
  }
  for (const address of dataset.transactionsByAddress.keys()) {
    if (matches.length >= 50) break
    if (address.includes(q) && !seen.has(address)) {
      seen.add(address)
      matches.push(address)
    }
  }

  return matches.slice(0, 50).map((address) => {
    const chain = legacyAddressSet.has(address.toLowerCase()) ? SEED_CHAIN : resolveChainForAddress(address)
    const wallet = getWallet(chain, address)
    return {
      chain: wallet.chain,
      address: wallet.address,
      entity_name: wallet.entity?.name ?? null,
      risk_level: wallet.risk.level,
    }
  })
}

export function getWalletTransactions(chain: string, address: string) {
  const wallet = getWallet(chain, address)
  return wallet.transactions.map((t) => ({
    tx_hash: t.tx_hash,
    block_number: t.block_number,
    timestamp: t.timestamp,
    from: t.from,
    to: t.to,
    asset: t.asset,
    amount: t.amount,
    status: 'confirmed' as const,
    direction: (t.to.toLowerCase() === address.toLowerCase() ? 'in' : 'out') as 'in' | 'out',
  }))
}

export function getTransaction(txHash: string) {
  const legacy = SEED_TRANSACTIONS.find((t) => t.tx_hash === txHash)
  if (legacy) {
    return {
      tx_hash: legacy.tx_hash,
      chain: SEED_CHAIN,
      block_number: legacy.block_number,
      timestamp: legacy.timestamp,
      from: legacy.from,
      to: legacy.to,
      asset: legacy.asset,
      amount: legacy.amount,
      status: 'confirmed' as const,
      native_value: legacy.amount,
      gas_used: 21000,
      token_transfers: [],
    }
  }
  const tx = dataset.transactionsByHash.get(txHash)
  if (!tx) return null
  return {
    tx_hash: tx.tx_hash,
    chain: tx.chain,
    block_number: tx.block_number,
    timestamp: tx.timestamp,
    from: tx.from,
    to: tx.to,
    asset: tx.asset,
    amount: tx.amount,
    status: 'confirmed' as const,
    native_value: tx.amount,
    gas_used: 21000,
    token_transfers: [],
  }
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

interface StoredCase extends Omit<CaseDetail, 'wallets' | 'investigations' | 'findings' | 'activity'> {
  wallets: CaseWallet[]
  investigation_ids: string[]
  activity: { timestamp: string; actor: string; action: string }[]
}

const casesDb = new Map<string, StoredCase>()

casesDb.set(SEED_CASE_ID, {
  ...SEED_CASE,
  wallets_count: 1,
  investigations_count: 1,
  wallets: [
    {
      wallet_id: 'WALLET-001',
      chain: SEED_CHAIN,
      address: SEED_ADDRESSES.seed,
      label: 'Suspect Wallet (from complaint)',
      source: 'complaint',
      risk_level: 'high',
    },
  ],
  investigation_ids: [SEED_INVESTIGATION_ID],
  activity: [
    { timestamp: '2026-08-28T09:12:00Z', actor: 'investigator', action: 'Case created' },
    { timestamp: '2026-08-28T09:14:00Z', actor: 'investigator', action: 'Added suspect wallet to case' },
    { timestamp: '2026-09-03T10:01:00Z', actor: 'investigator', action: 'Started investigation INV-001' },
  ],
})

for (const generatedCase of dataset.cases) {
  casesDb.set(generatedCase.case_id, {
    case_id: generatedCase.case_id,
    title: generatedCase.title,
    description: generatedCase.description,
    status: generatedCase.status,
    priority: generatedCase.priority,
    wallets_count: generatedCase.wallets.length,
    investigations_count: generatedCase.investigations.length,
    created_at: generatedCase.created_at,
    updated_at: generatedCase.updated_at,
    wallets: generatedCase.wallets,
    investigation_ids: generatedCase.investigations.map((i) => i.investigation_id),
    activity: generatedCase.activity,
  })
}

export function listCases(filters: { status?: string; priority?: string; search?: string }) {
  let items = Array.from(casesDb.values())
  if (filters.status) items = items.filter((c) => c.status === filters.status)
  if (filters.priority) items = items.filter((c) => c.priority === filters.priority)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    items = items.filter((c) => c.title.toLowerCase().includes(q) || c.case_id.toLowerCase().includes(q))
  }
  return items.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
}

export function getCase(caseId: string): StoredCase | undefined {
  return casesDb.get(caseId)
}

export function updateCase(caseId: string, updates: { status?: CaseStatus; priority?: CasePriority }) {
  const record = casesDb.get(caseId)
  if (!record) throw new Error('CASE_NOT_FOUND')
  const changes: string[] = []
  if (updates.status && updates.status !== record.status) {
    changes.push(`status → ${updates.status}`)
    record.status = updates.status
  }
  if (updates.priority && updates.priority !== record.priority) {
    changes.push(`priority → ${updates.priority}`)
    record.priority = updates.priority
  }
  record.updated_at = new Date().toISOString()
  if (changes.length > 0) {
    record.activity.push({ timestamp: record.updated_at, actor: 'admin', action: `Updated case (${changes.join(', ')})` })
    appendAuditLog({ actor: 'admin', action: `Updated case ${caseId} (${changes.join(', ')})`, target: caseId })
  }
  return record
}

export function createCase(input: { title: string; description?: string; priority: CasePriority }) {
  const case_id = nextId('CASE')
  const now = new Date().toISOString()
  const record: StoredCase = {
    case_id,
    title: input.title,
    description: input.description,
    status: 'open',
    priority: input.priority,
    wallets_count: 0,
    investigations_count: 0,
    created_at: now,
    updated_at: now,
    wallets: [],
    investigation_ids: [],
    activity: [{ timestamp: now, actor: 'investigator', action: 'Case created' }],
  }
  casesDb.set(case_id, record)
  return record
}

export function addWalletToCase(
  caseId: string,
  input: { chain: string; address: string; label?: string; source?: string },
) {
  const record = casesDb.get(caseId)
  if (!record) throw new Error('CASE_NOT_FOUND')
  const wallet = getWallet(input.chain, input.address)
  const entry: CaseWallet = {
    wallet_id: nextId('WALLET'),
    chain: input.chain,
    address: input.address,
    label: input.label,
    source: input.source,
    risk_level: wallet.risk.level,
  }
  record.wallets.push(entry)
  record.wallets_count = record.wallets.length
  record.updated_at = new Date().toISOString()
  record.activity.push({
    timestamp: record.updated_at,
    actor: 'investigator',
    action: `Added wallet ${input.address.slice(0, 10)}… to case`,
  })
  return entry
}

export function recordCaseInvestigation(caseId: string, investigationId: string) {
  const record = casesDb.get(caseId)
  if (!record) return
  record.investigation_ids.push(investigationId)
  record.investigations_count = record.investigation_ids.length
  record.updated_at = new Date().toISOString()
  record.activity.push({
    timestamp: record.updated_at,
    actor: 'investigator',
    action: `Started investigation ${investigationId}`,
  })
}

// ---------------------------------------------------------------------------
// Investigations — a real time-based state machine, not an instant flip.
// ---------------------------------------------------------------------------

interface StoredFinding {
  id: string
  type: string
  severity: 'high' | 'medium' | 'low'
  wallet: string
  description: string
  confidence: number
  evidence: string
}

interface StoredInvestigation {
  investigation_id: string
  case_id: string
  chain: string
  start_address: string
  max_hops: number
  min_value: number
  started_at: number
  duration_ms: number
  full_graph: { nodes: GraphNode[]; edges: GraphEdge[] }
  findings: StoredFinding[]
}

const investigationsDb = new Map<string, StoredInvestigation>()

function buildLegacyGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    { id: SEED_ADDRESSES.seed, type: 'wallet', label: 'Suspect Wallet', risk_score: 82, risk_level: 'high', is_seed: true },
    { id: SEED_ADDRESSES.mule, type: 'wallet', label: 'Layering Mule', risk_score: 88, risk_level: 'high' },
    { id: SEED_ADDRESSES.burnerA, type: 'wallet', label: 'Burner A', risk_score: 61, risk_level: 'medium' },
    { id: SEED_ADDRESSES.burnerB, type: 'wallet', label: 'Burner B', risk_score: 58, risk_level: 'medium' },
    { id: SEED_ADDRESSES.mixer, type: 'mixer', label: 'Mixer Service', risk_score: 90, risk_level: 'high' },
    {
      id: SEED_ADDRESSES.exchange,
      type: 'vasp',
      label: 'Exchange X Deposit',
      risk_score: 12,
      risk_level: 'low',
      entity_name: SEED_ENTITY.name,
    },
  ]
  const edges: GraphEdge[] = SEED_TRANSACTIONS.filter((t) => t.from !== '0xVictimWallet00000000000000000000000001').map(
    (t, i) => ({
      id: `EDGE-${String(i + 1).padStart(3, '0')}`,
      source: t.from,
      target: t.to,
      asset: t.asset,
      amount: t.amount,
      tx_hash: t.tx_hash,
      timestamp: t.timestamp,
    }),
  )
  return { nodes, edges }
}

investigationsDb.set(SEED_INVESTIGATION_ID, {
  investigation_id: SEED_INVESTIGATION_ID,
  case_id: SEED_CASE_ID,
  chain: SEED_CHAIN,
  start_address: SEED_ADDRESSES.seed,
  max_hops: 4,
  min_value: 0,
  started_at: Date.now() - 999_000, // already long completed for the seeded demo case
  duration_ms: 9_000,
  full_graph: buildLegacyGraph(),
  findings: [
    {
      id: 'FIND-001',
      type: 'vasp_exposure',
      severity: 'high',
      wallet: SEED_ADDRESSES.exchange,
      description: `Funds reached a wallet associated with ${SEED_ENTITY.name} after passing through two burner wallets.`,
      confidence: 0.94,
      evidence: 'Verified entity dataset · transactions 0x6666…ffff and 0x7777…0001',
    },
    {
      id: 'FIND-002',
      type: 'rapid_forwarding',
      severity: 'medium',
      wallet: SEED_ADDRESSES.mule,
      description: 'Received funds were forwarded to two separate wallets within 25 seconds of receipt.',
      confidence: 0.88,
      evidence: 'Transaction timing analysis · 0x2222…bbbb → 0x3333…cccc / 0x4444…dddd',
    },
    {
      id: 'FIND-003',
      type: 'mixer_interaction',
      severity: 'medium',
      wallet: SEED_ADDRESSES.mixer,
      description: 'One layering path was routed through a known mixing service before reaching the exchange.',
      confidence: 0.81,
      evidence: 'Known mixer address list · transaction 0x5555…eeee',
    },
  ],
})

for (const generatedCase of dataset.cases) {
  for (const inv of generatedCase.investigations) {
    investigationsDb.set(inv.investigation_id, {
      investigation_id: inv.investigation_id,
      case_id: inv.case_id,
      chain: inv.chain,
      start_address: inv.start_address,
      max_hops: inv.max_hops,
      min_value: inv.min_value,
      started_at: inv.started_at,
      duration_ms: inv.duration_ms,
      full_graph: inv.full_graph,
      findings: inv.findings,
    })
  }
}

export function startInvestigation(input: {
  case_id: string
  chain: string
  start_address: string
  max_hops: number
  min_value: number
}) {
  const investigation_id = nextId('INV')
  investigationsDb.set(investigation_id, {
    investigation_id,
    case_id: input.case_id,
    chain: input.chain,
    start_address: input.start_address,
    max_hops: input.max_hops,
    min_value: input.min_value,
    started_at: Date.now(),
    duration_ms: 8_000,
    full_graph: buildLegacyGraph(),
    findings: investigationsDb.get(SEED_INVESTIGATION_ID)!.findings,
  })
  recordCaseInvestigation(input.case_id, investigation_id)
  return investigation_id
}

const STAGES = [
  'Fetching indexed transactions',
  'Building transaction graph',
  'Running multi-hop traversal',
  'Scoring wallets and paths',
  'Finalizing findings',
]

export function getInvestigationStatus(investigationId: string) {
  const record = investigationsDb.get(investigationId)
  if (!record) return null

  const elapsed = Date.now() - record.started_at
  const rawProgress = Math.min(100, Math.round((elapsed / record.duration_ms) * 100))
  let status: InvestigationStatus = 'queued'
  if (rawProgress > 0 && rawProgress < 100) status = 'running'
  if (rawProgress >= 100) status = 'completed'
  if (elapsed < 400) status = 'queued'

  const stageIndex = Math.min(STAGES.length - 1, Math.floor((rawProgress / 100) * STAGES.length))
  const totalNodes = record.full_graph.nodes.length
  const totalEdges = record.full_graph.edges.length

  return {
    investigation_id: investigationId,
    status,
    progress: status === 'queued' ? 0 : rawProgress,
    stage: status === 'completed' ? 'Completed' : status === 'queued' ? 'Queued' : STAGES[stageIndex],
    nodes_found: status === 'queued' ? 0 : Math.round((rawProgress / 100) * totalNodes),
    edges_found: status === 'queued' ? 0 : Math.round((rawProgress / 100) * totalEdges),
    error: null,
  }
}

export function getInvestigationGraph(investigationId: string) {
  const record = investigationsDb.get(investigationId)
  if (!record) return null
  const status = getInvestigationStatus(investigationId)
  if (status?.status !== 'completed') return { nodes: [], edges: [] }
  return record.full_graph
}

export function getInvestigationFindings(investigationId: string) {
  const record = investigationsDb.get(investigationId)
  if (!record) return []
  const status = getInvestigationStatus(investigationId)
  if (status?.status !== 'completed') return []
  return record.findings
}

export function getCaseInvestigations(caseId: string) {
  return Array.from(investigationsDb.values())
    .filter((inv) => inv.case_id === caseId)
    .map((inv) => ({
      investigation_id: inv.investigation_id,
      start_address: inv.start_address,
      chain: inv.chain,
      status: getInvestigationStatus(inv.investigation_id)!.status,
      created_at: new Date(inv.started_at).toISOString(),
    }))
}

/** Aggregates high-severity findings across every completed investigation, for the dashboard. */
export function getHighRiskFindingsAcrossCases(limit = 5) {
  const results: (StoredFinding & { investigation_id: string; case_id: string; case_title: string })[] = []
  for (const inv of investigationsDb.values()) {
    const status = getInvestigationStatus(inv.investigation_id)
    if (status?.status !== 'completed') continue
    const caseRecord = casesDb.get(inv.case_id)
    if (!caseRecord) continue
    for (const finding of inv.findings) {
      if (finding.severity !== 'high') continue
      results.push({ ...finding, investigation_id: inv.investigation_id, case_id: inv.case_id, case_title: caseRecord.title })
    }
  }
  results.sort((a, b) => {
    const invA = investigationsDb.get(a.investigation_id)!
    const invB = investigationsDb.get(b.investigation_id)!
    return invB.started_at - invA.started_at
  })
  return results.slice(0, limit)
}

export function countHighRiskFindingsAcrossCases(): number {
  let count = 0
  for (const inv of investigationsDb.values()) {
    const status = getInvestigationStatus(inv.investigation_id)
    if (status?.status !== 'completed') continue
    count += inv.findings.filter((f) => f.severity === 'high').length
  }
  return count
}

/** Every investigation across every case, for the Explorer page and the console's `graphs` command. */
export function listAllInvestigations() {
  return Array.from(investigationsDb.values())
    .map((inv) => {
      const caseRecord = casesDb.get(inv.case_id)
      const status = getInvestigationStatus(inv.investigation_id)!
      return {
        investigation_id: inv.investigation_id,
        case_id: inv.case_id,
        case_title: caseRecord?.title ?? inv.case_id,
        chain: inv.chain,
        start_address: inv.start_address,
        status: status.status,
        node_count: inv.full_graph.nodes.length,
        edge_count: inv.full_graph.edges.length,
        started_at: new Date(inv.started_at).toISOString(),
      }
    })
    .sort((a, b) => (a.started_at < b.started_at ? 1 : -1))
}

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export function getAddressEntity(address: string) {
  const entity = dataset.addressEntity.get(address.toLowerCase())
  if (!entity) return { address, entity: null, evidence: [] }
  return {
    address,
    entity: {
      entity_id: entity.entity_id,
      name: entity.name,
      type: entity.type,
      jurisdiction: entity.jurisdiction,
      confidence: entity.confidence,
    },
    evidence: [{ source: entity.source, last_verified: entity.last_verified }],
  }
}

export function searchEntities(query: string) {
  const all = dataset.entities.map((e) => ({
    entity_id: e.entity_id,
    name: e.name,
    type: e.type,
    jurisdiction: e.jurisdiction,
    risk_level: (e.type === 'VASP' ? 'low' : 'high') as RiskLevel,
    known_addresses: e.addresses.length,
    last_verified: e.last_verified,
  }))
  if (!query) return all
  const q = query.toLowerCase()
  return all.filter((e) => e.name.toLowerCase().includes(q))
}

export function listEntityLinks() {
  return dataset.entities.map((e) => ({
    entity_id: e.entity_id,
    name: e.name,
    type: e.type,
    jurisdiction: e.jurisdiction,
    confidence: e.confidence,
    source: e.source,
    last_verified: e.last_verified,
    addresses: e.addresses,
  }))
}

/**
 * Manually attribute a wallet address to an entity/VASP — either an existing
 * one (by entity_id) or a brand new one, created on the spot. This is the
 * "form connections" primitive behind the Backend console's entity linker
 * and its bulk JSON import. Never called directly by API code — always
 * through applyEntityLinkBatch below, so every link is batch-tracked and
 * revertible.
 */
function linkWalletToEntity(
  chain: string,
  address: string,
  input: { entity_id?: string; name: string; type: string; jurisdiction?: string; confidence: number },
): { record: EntityRecord; entityCreated: boolean; addressAdded: boolean; previousEntityId: string | null } {
  const key = address.toLowerCase()
  const previous = dataset.addressEntity.get(key)
  const previousEntityId = previous?.entity_id ?? null

  let record = input.entity_id ? dataset.entities.find((e) => e.entity_id === input.entity_id) : undefined
  let entityCreated = false

  if (!record) {
    record = {
      entity_id: input.entity_id ?? nextId('ENT'),
      name: input.name,
      type: input.type,
      jurisdiction: input.jurisdiction ?? 'Unknown',
      confidence: input.confidence,
      source: 'manual_link',
      last_verified: new Date().toISOString(),
      addresses: [],
    }
    dataset.entities.push(record)
    entityCreated = true
  }

  // An address can only belong to one entity at a time — detach it from
  // whatever it was previously attributed to before attaching it here.
  if (previous && previous.entity_id !== record.entity_id) {
    previous.addresses = previous.addresses.filter((a) => a !== key)
  }

  const addressAdded = !record.addresses.includes(key)
  if (addressAdded) record.addresses.push(key)
  dataset.addressEntity.set(key, record)
  // The wallet may already be cached (built lazily by getWallet) with a stale
  // `.entity` field — drop it so the next read reflects this link.
  walletsDb.delete(walletKey(chain, address))

  return { record, entityCreated, addressAdded, previousEntityId }
}

export interface ImportBatchRow {
  chain: string
  address: string
  entity_id: string
  entity_name: string
  entity_created: boolean
  address_added: boolean
  previous_entity_id: string | null
}

export interface ImportBatch {
  batch_id: string
  created_at: string
  actor: string
  source: 'manual' | 'import'
  rows: ImportBatchRow[]
  reverted: boolean
  reverted_at: string | null
}

const importBatches: ImportBatch[] = []

/**
 * Apply one or many wallet→entity links as a single named batch — the unit
 * both the manual link form and the bulk JSON import produce. Every batch
 * gets an id and can be reverted as a whole via revertImportBatch, which is
 * what makes "direct control over linking" actually safe to use.
 */
export function applyEntityLinkBatch(
  rows: { chain: string; address: string; entity_id?: string; name: string; type: string; jurisdiction?: string; confidence: number }[],
  source: 'manual' | 'import',
): ImportBatch {
  const batchRows: ImportBatchRow[] = rows.map((row) => {
    const { record, entityCreated, addressAdded, previousEntityId } = linkWalletToEntity(row.chain, row.address, row)
    return {
      chain: row.chain,
      address: row.address.toLowerCase(),
      entity_id: record.entity_id,
      entity_name: record.name,
      entity_created: entityCreated,
      address_added: addressAdded,
      previous_entity_id: previousEntityId,
    }
  })

  const batch: ImportBatch = {
    batch_id: nextId('BATCH'),
    created_at: new Date().toISOString(),
    actor: 'devops',
    source,
    rows: batchRows,
    reverted: false,
    reverted_at: null,
  }
  importBatches.unshift(batch)
  appendAuditLog({
    actor: 'devops',
    action: source === 'import' ? 'import_batch' : 'link_batch',
    target: `${batch.batch_id} (${rows.length} row${rows.length === 1 ? '' : 's'})`,
  })
  return batch
}

export function listImportBatches() {
  return importBatches
}

/**
 * Undo everything a batch did: detach addresses it newly attributed (restoring
 * whatever they were attributed to before, if anything), and remove any
 * entity the batch created that's left with zero addresses afterward. Rows
 * that were no-ops when applied (address already pointed at the same entity)
 * are left untouched, since the batch never actually changed them.
 */
export function revertImportBatch(batchId: string): ImportBatch {
  const batch = importBatches.find((b) => b.batch_id === batchId)
  if (!batch) throw new Error(`Batch ${batchId} not found`)
  if (batch.reverted) throw new Error(`Batch ${batchId} was already reverted`)

  for (const row of batch.rows) {
    if (!row.address_added && !row.entity_created) continue

    const entity = dataset.entities.find((e) => e.entity_id === row.entity_id)
    if (entity) entity.addresses = entity.addresses.filter((a) => a !== row.address)
    dataset.addressEntity.delete(row.address)

    if (row.previous_entity_id && row.previous_entity_id !== row.entity_id) {
      const prevEntity = dataset.entities.find((e) => e.entity_id === row.previous_entity_id)
      if (prevEntity) {
        if (!prevEntity.addresses.includes(row.address)) prevEntity.addresses.push(row.address)
        dataset.addressEntity.set(row.address, prevEntity)
      }
    }

    walletsDb.delete(walletKey(row.chain, row.address))
  }

  for (const row of batch.rows) {
    if (!row.entity_created) continue
    const entity = dataset.entities.find((e) => e.entity_id === row.entity_id)
    if (entity && entity.addresses.length === 0) {
      dataset.entities = dataset.entities.filter((e) => e.entity_id !== row.entity_id)
    }
  }

  batch.reverted = true
  batch.reverted_at = new Date().toISOString()
  appendAuditLog({ actor: 'devops', action: 'revert_batch', target: batch.batch_id })
  return batch
}

/**
 * One row per address→entity attribution, in exactly the shape the bulk
 * import expects — so exporting, editing the file, and re-importing it is a
 * genuine round trip instead of two incompatible formats.
 */
export function listEntityLinkRows() {
  const rows: {
    chain: string
    address: string
    entity_id: string
    name: string
    type: string
    jurisdiction: string
    confidence: number
  }[] = []

  for (const entity of dataset.entities) {
    for (const address of entity.addresses) {
      const chain = legacyAddressSet.has(address) ? SEED_CHAIN : resolveChainForAddress(address)
      rows.push({
        chain,
        address,
        entity_id: entity.entity_id,
        name: entity.name,
        type: entity.type,
        jurisdiction: entity.jurisdiction,
        confidence: entity.confidence,
      })
    }
  }
  return rows
}

export function getDataCollectionCounts() {
  return [
    { collection: 'cases', count: casesDb.size },
    { collection: 'investigations', count: investigationsDb.size },
    { collection: 'wallets_indexed', count: walletsDb.size },
    { collection: 'entities', count: dataset.entities.length },
    { collection: 'reports', count: reportsDb.size },
    { collection: 'users', count: users.length },
  ]
}

// ---------------------------------------------------------------------------
// Risk
// ---------------------------------------------------------------------------

export function computeWalletRisk(chain: string, address: string) {
  const wallet = getWallet(chain, address)
  const reasonsByLevel: Record<string, { signal: string; weight: number }[]> = {
    high: [
      { signal: 'rapid_forwarding', weight: 0.23 },
      { signal: 'high_risk_counterparty', weight: 0.31 },
      { signal: 'cross_chain_activity', weight: 0.18 },
    ],
    medium: [
      { signal: 'new_counterparty_volume', weight: 0.2 },
      { signal: 'short_holding_time', weight: 0.15 },
    ],
    low: [{ signal: 'verified_entity_exposure', weight: 0.05 }],
    unknown: [],
  }
  return {
    wallet: address,
    risk_score: wallet.risk.score,
    risk_level: wallet.risk.level,
    model_version: 'risk-model-v1',
    reasons: reasonsByLevel[wallet.risk.level] ?? [],
  }
}

export function getWalletRiskFeatures(chain: string, address: string) {
  const wallet = getWallet(chain, address)
  return {
    transaction_count: wallet.transaction_count,
    unique_counterparties: wallet.unique_counterparties,
    forwarding_ratio: wallet.transaction_count > 0 ? 0.87 : 0,
    median_holding_time: 720,
    cross_chain_count: 0,
    risky_counterparty_ratio: wallet.risk.level === 'high' ? 0.42 : 0.05,
  }
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

const DEFAULT_REPORT_INCLUDE: ReportInclude = {
  transactions: true,
  graph: true,
  risk_analysis: true,
  entity_attribution: true,
  cross_chain: false,
  fund_flow: true,
}

interface StoredReport {
  report_id: string
  investigation_id: string
  case_id: string
  format: 'pdf' | 'docx'
  include: ReportInclude
  status: ReportStatus
  created_at: number
}

const reportsDb = new Map<string, StoredReport>()

export function createReport(input: { investigation_id: string; format: 'pdf' | 'docx'; include?: ReportInclude }) {
  const report_id = nextId('REPORT')
  const investigation = investigationsDb.get(input.investigation_id)
  reportsDb.set(report_id, {
    report_id,
    investigation_id: input.investigation_id,
    case_id: investigation?.case_id ?? '',
    format: input.format,
    include: input.include ?? DEFAULT_REPORT_INCLUDE,
    status: 'generating',
    created_at: Date.now(),
  })
  return report_id
}

export function getReport(reportId: string) {
  const record = reportsDb.get(reportId)
  if (!record) return null
  const elapsed = Date.now() - record.created_at
  const status: ReportStatus = elapsed > 2500 ? 'completed' : 'generating'
  const caseRecord = getCase(record.case_id)
  return {
    report_id: record.report_id,
    investigation_id: record.investigation_id,
    case_id: record.case_id,
    case_title: caseRecord?.title ?? record.case_id,
    format: record.format,
    status,
    created_at: new Date(record.created_at).toISOString(),
  }
}

export function listReports() {
  return Array.from(reportsDb.keys())
    .map((id) => getReport(id)!)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

/**
 * Assembles the actual content behind a completed report from the real case,
 * investigation, graph, and findings data — this is what makes "Generate
 * Report" produce a genuine artifact instead of a status flag with nothing
 * behind it. Returns null for a report that isn't completed yet or doesn't
 * exist.
 */
export function getReportContent(reportId: string): ReportContent | null {
  const record = reportsDb.get(reportId)
  if (!record) return null
  const summary = getReport(reportId)
  if (!summary || summary.status !== 'completed') return null

  const caseRecord = getCase(record.case_id)
  const investigation = investigationsDb.get(record.investigation_id)
  const graph = getInvestigationGraph(record.investigation_id) ?? { nodes: [], edges: [] }
  const findings = getInvestigationFindings(record.investigation_id)

  const sections: ReportSection[] = [
    {
      heading: 'Seed Wallet',
      bodyHtml: `<p>Investigation started from <span class="mono">${investigation?.start_address ?? 'unknown'}</span> on ${investigation?.chain ?? 'unknown'}.</p>`,
    },
  ]

  if (record.include.transactions) {
    sections.push({ heading: 'Transaction Timeline', bodyHtml: buildTransactionTable(graph.edges) })
  }
  if (record.include.graph) {
    sections.push({ heading: 'Investigation Graph', bodyHtml: buildGraphSummary(graph.nodes, graph.edges) })
  }
  if (record.include.risk_analysis) {
    sections.push({ heading: 'Risk Analysis', bodyHtml: buildRiskTable(graph.nodes) })
  }
  if (record.include.entity_attribution) {
    sections.push({ heading: 'Entity / VASP Attribution', bodyHtml: buildEntityTable(graph.nodes) })
  }
  if (record.include.cross_chain) {
    sections.push({
      heading: 'Cross-chain Analysis',
      bodyHtml: `<p class="muted">No cross-chain bridge activity observed — all traced transfers stayed on ${investigation?.chain ?? 'the same chain'}.</p>`,
    })
  }
  if (record.include.fund_flow) {
    sections.push({ heading: 'Findings', bodyHtml: buildFindingsList(findings) })
  }
  sections.push({
    heading: 'Evidence & Confidence',
    bodyHtml:
      findings.length > 0
        ? `<p class="muted">Every finding above cites its evidence source and a confidence value — a lead for further investigation, not a verdict.</p>`
        : '<p class="muted">No findings to attach evidence to.</p>',
  })

  return {
    report_id: record.report_id,
    format: record.format,
    generated_at: new Date().toISOString(),
    case_id: record.case_id,
    case_title: caseRecord?.title ?? record.case_id,
    case_status: caseRecord?.status ?? 'open',
    case_priority: caseRecord?.priority ?? 'medium',
    investigation_id: record.investigation_id,
    chain: investigation?.chain ?? 'unknown',
    start_address: investigation?.start_address ?? 'unknown',
    sections,
  }
}

// Pre-existing reports so the Reports page isn't empty on first load.
const completedInvestigationIds = Array.from(investigationsDb.values())
  .filter((inv) => Date.now() - inv.started_at > inv.duration_ms)
  .slice(0, 6)
for (const inv of completedInvestigationIds) {
  const report_id = createReport({ investigation_id: inv.investigation_id, format: 'pdf' })
  const record = reportsDb.get(report_id)!
  record.created_at = Date.now() - 3600 * 1000 * (1 + Math.random() * 200)
}

// ---------------------------------------------------------------------------
// Admin / DevOps
// ---------------------------------------------------------------------------

export function getSystemStatus() {
  return {
    database: 'healthy' as const,
    blockchain_indexer: 'healthy' as const,
    queue: 'healthy' as const,
    ml_service: 'healthy' as const,
  }
}

const auditLog: AuditLogEntry[] = [
  { id: 'AUD-001', timestamp: '2026-09-06T08:00:00Z', actor: 'investigator', action: 'login' },
  { id: 'AUD-002', timestamp: '2026-09-03T10:01:00Z', actor: 'investigator', action: 'start_investigation', target: SEED_INVESTIGATION_ID },
]

export function appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  const record: AuditLogEntry = {
    id: nextId('AUD'),
    timestamp: new Date().toISOString(),
    ...entry,
  }
  auditLog.unshift(record)
  return record
}

export function listAuditLog(): AuditLogEntry[] {
  return auditLog
}

const indexerStatuses = new Map<string, IndexerStatus>([
  ['ethereum', { chain: 'ethereum', latest_block: 23450821, indexed_block: 23450815, lag: 6, status: 'running' }],
  ['polygon', { chain: 'polygon', latest_block: 68120044, indexed_block: 68119990, lag: 54, status: 'running' }],
])

export function listIndexerStatus() {
  return Array.from(indexerStatuses.values())
}

export function startIndexer(chain: string, fromBlock: number) {
  const existing = indexerStatuses.get(chain)
  indexerStatuses.set(chain, {
    chain,
    latest_block: existing?.latest_block ?? fromBlock,
    indexed_block: fromBlock,
    lag: 0,
    status: 'running',
  })
  appendAuditLog({ actor: 'devops', action: `Started indexer for ${chain} from block ${fromBlock}` })
}

const jobQueue: JobQueueEntry[] = [
  { job_id: 'JOB-001', type: 'reprocess_blocks', status: 'completed', created_at: '2026-09-05T12:00:00Z' },
  { job_id: 'JOB-002', type: 'reprocess_polygon_68119000-68119500', status: 'failed', created_at: '2026-09-06T03:00:00Z' },
]

export function listJobQueue() {
  return jobQueue
}

export function enqueueReprocessJob(chain: string, fromBlock: number, toBlock: number) {
  const job: JobQueueEntry = {
    job_id: nextId('JOB'),
    type: `reprocess_${chain}_${fromBlock}-${toBlock}`,
    status: 'queued',
    created_at: new Date().toISOString(),
  }
  jobQueue.unshift(job)
  appendAuditLog({ actor: 'devops', action: `Queued reprocess for ${chain} blocks ${fromBlock}-${toBlock}` })
  return job
}

export function cancelJob(jobId: string) {
  const job = jobQueue.find((j) => j.job_id === jobId)
  if (!job) throw new Error('JOB_NOT_FOUND')
  if (job.status !== 'queued' && job.status !== 'running') throw new Error('JOB_NOT_CANCELLABLE')
  job.status = 'cancelled'
  appendAuditLog({ actor: 'devops', action: `Cancelled job ${jobId} (${job.type})`, target: jobId })
  return job
}

export function retryJob(jobId: string) {
  const job = jobQueue.find((j) => j.job_id === jobId)
  if (!job) throw new Error('JOB_NOT_FOUND')
  if (job.status !== 'failed' && job.status !== 'cancelled') throw new Error('JOB_NOT_RETRYABLE')
  job.status = 'queued'
  appendAuditLog({ actor: 'devops', action: `Retried job ${jobId} (${job.type})`, target: jobId })
  return job
}

const workerLogs: WorkerLogEntry[] = [
  { timestamp: '2026-09-06T08:00:01Z', level: 'info', message: 'ethereum indexer: checkpoint saved at block 23450815' },
  { timestamp: '2026-09-06T08:00:04Z', level: 'info', message: 'investigation worker: INV-001 completed' },
  { timestamp: '2026-09-06T08:01:12Z', level: 'warn', message: 'polygon indexer: lag increasing (54 blocks)' },
]

export function listWorkerLogs() {
  return workerLogs
}
