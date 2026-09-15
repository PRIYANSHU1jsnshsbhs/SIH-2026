import { createRng } from './prng'
import type { CaseWallet, CasePriority, CaseStatus } from '@/schemas/cases'
import type { GraphEdge, GraphNode } from '@/schemas/investigations'
import type { RiskLevel } from '@/schemas/wallets'

const SEED = 20260912 // today's date per system context — stable across builds

// ---------------------------------------------------------------------------
// Reference data — fraud typologies straight from PS 26183's own description,
// and clearly fictional VASP/mixer/bridge names (no real companies).
// ---------------------------------------------------------------------------

interface CaseTemplate {
  key: string
  label: string
  title: (seq: number, year: number) => string
  description: string
}

const CASE_TEMPLATES: CaseTemplate[] = [
  {
    key: 'investment',
    label: 'Investment Scam',
    title: (seq, year) => `Investment Scam Case ${year}-${String(seq).padStart(3, '0')}`,
    description: 'Victim was persuaded to deposit funds into a fraudulent investment platform; the receiving wallet began moving funds within hours of the complaint window.',
  },
  {
    key: 'task_based',
    label: 'Task-Based Fraud',
    title: (seq, year) => `Task-Based Fraud Case ${year}-${String(seq).padStart(3, '0')}`,
    description: 'Victim was recruited into a task-completion scheme requiring upfront crypto payments; the reported wallet is one of several collection addresses.',
  },
  {
    key: 'sextortion',
    label: 'Sextortion',
    title: (seq, year) => `Sextortion Case ${year}-${String(seq).padStart(3, '0')}`,
    description: 'Victim paid a sextortion demand in cryptocurrency. The receiving address was reported through the National Cyber Crime Reporting Portal.',
  },
  {
    key: 'ransomware',
    label: 'Ransomware Payment',
    title: (seq, year) => `Ransomware Payment Case ${year}-${String(seq).padStart(3, '0')}`,
    description: 'A ransom payment was made to the reported wallet following a ransomware incident affecting the complainant.',
  },
  {
    key: 'phishing',
    label: 'Phishing Compromise',
    title: (seq, year) => `Phishing Fraud Case ${year}-${String(seq).padStart(3, '0')}`,
    description: "Funds were drained from the victim's wallet after a phishing compromise and forwarded to the reported address shortly after.",
  },
  {
    key: 'darknet',
    label: 'Darknet Transaction',
    title: (seq, year) => `Darknet Transaction Case ${year}-${String(seq).padStart(3, '0')}`,
    description: 'The reported wallet was flagged in connection with a darknet marketplace transaction identified during a separate investigation.',
  },
  {
    key: 'romance',
    label: 'Romance Scam',
    title: (seq, year) => `Romance Scam Case ${year}-${String(seq).padStart(3, '0')}`,
    description: 'Victim was persuaded over several months to send funds as part of a romance scam. The wallet address was provided directly by the scammer.',
  },
]

interface EntityTemplate {
  name: string
  type: 'VASP' | 'Mixer' | 'Bridge'
  jurisdiction: string
}

const ENTITY_TEMPLATES: EntityTemplate[] = [
  { name: 'Vertex Exchange', type: 'VASP', jurisdiction: 'Singapore' },
  { name: 'Meridian Digital Assets', type: 'VASP', jurisdiction: 'Malta' },
  { name: 'Solstice Trade', type: 'VASP', jurisdiction: 'Estonia' },
  { name: 'Harborlight Exchange', type: 'VASP', jurisdiction: 'Seychelles' },
  { name: 'Zephyr Markets', type: 'VASP', jurisdiction: 'UAE' },
  { name: 'Obsidian Exchange', type: 'VASP', jurisdiction: 'Hong Kong' },
  { name: 'Trinity Digital', type: 'VASP', jurisdiction: 'Cayman Islands' },
  { name: 'Polestar Exchange', type: 'VASP', jurisdiction: 'Lithuania' },
  { name: 'Cascade Markets', type: 'VASP', jurisdiction: 'Panama' },
  { name: 'Ironclad Exchange', type: 'VASP', jurisdiction: 'Vanuatu' },
  { name: 'Lumen Digital Assets', type: 'VASP', jurisdiction: 'Mauritius' },
  { name: 'Redwood Markets', type: 'VASP', jurisdiction: 'Seychelles' },
  { name: 'Anchor VASP', type: 'VASP', jurisdiction: 'Malta' },
  { name: 'Quantum Swap', type: 'VASP', jurisdiction: 'Singapore' },
  { name: 'Umbra Mixer', type: 'Mixer', jurisdiction: 'Unregulated' },
  { name: 'Veil Protocol', type: 'Mixer', jurisdiction: 'Unregulated' },
  { name: 'Wraith Bridge', type: 'Bridge', jurisdiction: 'Unregulated' },
  { name: 'Nexus Bridge', type: 'Bridge', jurisdiction: 'Unregulated' },
]

const CHAINS = ['ethereum', 'polygon'] as const
const ASSETS = ['ETH', 'USDT', 'USDC', 'MATIC'] as const

// ---------------------------------------------------------------------------
// Output shapes — kept structurally compatible with what mockStore.ts needs.
// ---------------------------------------------------------------------------

export interface TxRecord {
  tx_hash: string
  from: string
  to: string
  amount: string
  asset: string
  timestamp: string
  block_number: number
  chain: string
}

export interface EntityRecord {
  entity_id: string
  name: string
  type: string
  jurisdiction: string
  confidence: number
  source: string
  last_verified: string
  addresses: string[]
}

interface WalletMeta {
  label: string
  riskTier: RiskLevel
}

export interface GeneratedInvestigation {
  investigation_id: string
  case_id: string
  chain: string
  start_address: string
  max_hops: number
  min_value: number
  started_at: number
  duration_ms: number
  full_graph: { nodes: GraphNode[]; edges: GraphEdge[] }
  findings: {
    id: string
    type: string
    severity: 'high' | 'medium' | 'low'
    wallet: string
    description: string
    confidence: number
    evidence: string
  }[]
}

export interface GeneratedCase {
  case_id: string
  title: string
  description: string
  status: CaseStatus
  priority: CasePriority
  created_at: string
  updated_at: string
  wallets: CaseWallet[]
  investigations: GeneratedInvestigation[]
  activity: { timestamp: string; actor: string; action: string }[]
}

export interface GeneratedDataset {
  entities: EntityRecord[]
  addressEntity: Map<string, EntityRecord>
  cases: GeneratedCase[]
  transactionsByAddress: Map<string, TxRecord[]>
  transactionsByHash: Map<string, TxRecord>
  walletMeta: Map<string, WalletMeta>
}

const NOW = new Date('2026-09-12T09:00:00Z').getTime()
const DAY_MS = 24 * 60 * 60 * 1000

function isoDaysAgo(days: number): string {
  return new Date(NOW - days * DAY_MS).toISOString()
}

function isoBefore(iso: string, maxDays: number, rng: ReturnType<typeof createRng>): string {
  const base = new Date(iso).getTime()
  return new Date(base - rng.int(0, maxDays) * DAY_MS - rng.int(0, 86_400_000)).toISOString()
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-4)}`
}

/**
 * The "proj" build mode's dataset: no generated bulk data at all, just
 * whatever mockStore.ts hand-authors itself (CASE-001 / INV-001). Use this to
 * sanity-check the app's plumbing without the big dataset in the way.
 */
export function emptyDataset(): GeneratedDataset {
  return {
    entities: [],
    addressEntity: new Map(),
    cases: [],
    transactionsByAddress: new Map(),
    transactionsByHash: new Map(),
    walletMeta: new Map(),
  }
}

/**
 * Generates the full mock dataset once, deterministically. mockStore.ts
 * indexes this into its Maps at module load; nothing downstream (api/*,
 * hooks, pages) needs to know this exists — it consumes the exact same
 * mockStore function signatures as the single hand-authored case did before.
 */
export function generateDataset(): GeneratedDataset {
  const rng = createRng(SEED)

  // --- Entities --------------------------------------------------------
  const entities: EntityRecord[] = ENTITY_TEMPLATES.map((tpl, i) => {
    const addressCount = tpl.type === 'VASP' ? rng.int(2, 4) : rng.int(1, 2)
    const addresses = Array.from({ length: addressCount }, () => rng.address())
    return {
      entity_id: `ENT-${String(i + 1).padStart(3, '0')}`,
      name: tpl.name,
      type: tpl.type,
      jurisdiction: tpl.jurisdiction,
      confidence: tpl.type === 'VASP' ? rng.float(0.85, 0.98, 2) : rng.float(0.6, 0.82, 2),
      source: tpl.type === 'VASP' ? 'Verified Dataset' : 'Heuristic Cluster Analysis',
      last_verified: isoDaysAgo(rng.int(5, 220)),
      addresses,
    }
  })

  const addressEntity = new Map<string, EntityRecord>()
  for (const entity of entities) {
    for (const addr of entity.addresses) addressEntity.set(addr.toLowerCase(), entity)
  }
  const vaspEntities = entities.filter((e) => e.type === 'VASP')
  const mixerEntities = entities.filter((e) => e.type === 'Mixer')
  const bridgeEntities = entities.filter((e) => e.type === 'Bridge')

  const transactionsByAddress = new Map<string, TxRecord[]>()
  const transactionsByHash = new Map<string, TxRecord>()
  const walletMeta = new Map<string, WalletMeta>()
  let blockCounter = 23_400_000

  function indexTx(tx: TxRecord) {
    transactionsByHash.set(tx.tx_hash, tx)
    for (const addr of [tx.from, tx.to]) {
      const key = addr.toLowerCase()
      const list = transactionsByAddress.get(key)
      if (list) list.push(tx)
      else transactionsByAddress.set(key, [tx])
    }
  }

  function makeTx(from: string, to: string, amount: number, asset: string, chain: string, timestamp: string): TxRecord {
    blockCounter += rng.int(1, 40)
    const tx: TxRecord = {
      tx_hash: rng.txHash(),
      from,
      to,
      amount: amount.toFixed(4),
      asset,
      timestamp,
      block_number: blockCounter,
      chain,
    }
    indexTx(tx)
    return tx
  }

  /** Background "noise" activity so a wallet's transaction history looks like a real, busy address. */
  function addNoiseTransactions(address: string, chain: string, around: string, count: number) {
    for (let i = 0; i < count; i++) {
      const counterparty = rng.address()
      const asset = rng.pick(ASSETS)
      const amount = rng.float(0.001, 3.5, 4)
      const ts = isoBefore(around, 180, rng)
      if (rng.bool(0.5)) makeTx(counterparty, address, amount, asset, chain, ts)
      else makeTx(address, counterparty, amount, asset, chain, ts)
    }
  }

  function riskScoreFor(tier: RiskLevel, rng2: ReturnType<typeof createRng>): number {
    if (tier === 'high') return rng2.int(74, 97)
    if (tier === 'medium') return rng2.int(42, 68)
    if (tier === 'low') return rng2.int(4, 22)
    return rng2.int(28, 45)
  }

  /**
   * Builds one investigation's traced graph: seed wallet -> mule -> N burners
   * -> (optional mixer) / (optional cross-chain bridge) -> a terminal VASP
   * deposit address. Mirrors the "scatter-gather" layering pattern.
   */
  function buildInvestigationGraph(caseId: string, startedAt: string) {
    const chain = rng.pick(CHAINS)
    const seedAddr = rng.address()
    const muleAddr = rng.address()
    const burnerCount = rng.int(1, 3)
    const burners = Array.from({ length: burnerCount }, () => rng.address())
    const useMixer = rng.bool(0.35)
    const useBridge = rng.bool(0.22)
    const mixer = useMixer ? rng.pick(mixerEntities) : null
    const mixerAddr = mixer ? rng.pick(mixer.addresses) : null
    const bridge = useBridge ? rng.pick(bridgeEntities) : null
    const bridgeAddr = bridge ? rng.pick(bridge.addresses) : null
    const terminalEntity = rng.pick(vaspEntities)
    const terminalAddr = rng.pick(terminalEntity.addresses)

    walletMeta.set(seedAddr.toLowerCase(), { label: 'Suspect Wallet', riskTier: 'high' })
    walletMeta.set(muleAddr.toLowerCase(), { label: 'Layering Mule', riskTier: 'high' })
    burners.forEach((b, i) => walletMeta.set(b.toLowerCase(), { label: `Burner ${String.fromCharCode(65 + i)}`, riskTier: 'medium' }))
    if (mixerAddr) walletMeta.set(mixerAddr.toLowerCase(), { label: mixer!.name, riskTier: 'high' })
    if (bridgeAddr) walletMeta.set(bridgeAddr.toLowerCase(), { label: bridge!.name, riskTier: 'medium' })
    walletMeta.set(terminalAddr.toLowerCase(), { label: `${terminalEntity.name} Deposit`, riskTier: 'low' })

    const nodes: GraphNode[] = []
    const edges: GraphEdge[] = []
    let edgeSeq = 0
    const nextEdgeId = () => `EDGE-${caseId}-${String(++edgeSeq).padStart(3, '0')}`

    nodes.push({ id: seedAddr, type: 'wallet', label: 'Suspect Wallet', risk_score: riskScoreFor('high', rng), risk_level: 'high', is_seed: true })
    nodes.push({ id: muleAddr, type: 'wallet', label: 'Layering Mule', risk_score: riskScoreFor('high', rng), risk_level: 'high' })

    let t = startedAt
    const initialAmount = rng.float(0.8, 12, 4)
    t = new Date(new Date(t).getTime() + rng.int(5, 40) * 1000).toISOString()
    edges.push({
      id: nextEdgeId(),
      source: seedAddr,
      target: muleAddr,
      asset: rng.pick(ASSETS),
      amount: initialAmount.toFixed(4),
      tx_hash: makeTx(seedAddr, muleAddr, initialAmount, 'ETH', chain, t).tx_hash,
      timestamp: t,
    })

    const perBurner = initialAmount / burners.length
    const burnerOutputs: { addr: string; amount: number }[] = []
    for (const burner of burners) {
      nodes.push({ id: burner, type: 'wallet', label: walletMeta.get(burner.toLowerCase())!.label, risk_score: riskScoreFor('medium', rng), risk_level: 'medium' })
      t = new Date(new Date(t).getTime() + rng.int(3, 30) * 1000).toISOString()
      const amount = perBurner * rng.float(0.9, 0.99, 4)
      edges.push({
        id: nextEdgeId(),
        source: muleAddr,
        target: burner,
        asset: rng.pick(ASSETS),
        amount: amount.toFixed(4),
        tx_hash: makeTx(muleAddr, burner, amount, 'ETH', chain, t).tx_hash,
        timestamp: t,
      })
      burnerOutputs.push({ addr: burner, amount })
    }

    if (mixerAddr && mixer) {
      nodes.push({ id: mixerAddr, type: 'mixer', label: mixer.name, risk_score: riskScoreFor('high', rng), risk_level: 'high' })
    }
    if (bridgeAddr && bridge) {
      nodes.push({ id: bridgeAddr, type: 'bridge', label: bridge.name, risk_score: riskScoreFor('medium', rng), risk_level: 'medium' })
    }
    nodes.push({
      id: terminalAddr,
      type: 'vasp',
      label: `${terminalEntity.name} Deposit`,
      risk_score: riskScoreFor('low', rng),
      risk_level: 'low',
      entity_name: terminalEntity.name,
    })

    burnerOutputs.forEach((output, i) => {
      let hop = output.addr
      let amount = output.amount
      // roughly half the paths route through the mixer/bridge if present
      if (mixerAddr && (i % 2 === 0 || burnerOutputs.length === 1)) {
        t = new Date(new Date(t).getTime() + rng.int(60, 900) * 1000).toISOString()
        const forwarded = amount * rng.float(0.95, 0.99, 4)
        edges.push({
          id: nextEdgeId(),
          source: hop,
          target: mixerAddr,
          asset: rng.pick(ASSETS),
          amount: forwarded.toFixed(4),
          tx_hash: makeTx(hop, mixerAddr, forwarded, 'ETH', chain, t).tx_hash,
          timestamp: t,
        })
        hop = mixerAddr
        amount = forwarded
      } else if (bridgeAddr) {
        t = new Date(new Date(t).getTime() + rng.int(60, 900) * 1000).toISOString()
        const forwarded = amount * rng.float(0.95, 0.99, 4)
        edges.push({
          id: nextEdgeId(),
          source: hop,
          target: bridgeAddr,
          asset: rng.pick(ASSETS),
          amount: forwarded.toFixed(4),
          tx_hash: makeTx(hop, bridgeAddr, forwarded, 'MATIC', chain, t).tx_hash,
          timestamp: t,
        })
        hop = bridgeAddr
        amount = forwarded
      }

      t = new Date(new Date(t).getTime() + rng.int(30, 600) * 1000).toISOString()
      const finalAmount = amount * rng.float(0.96, 0.995, 4)
      edges.push({
        id: nextEdgeId(),
        source: hop,
        target: terminalAddr,
        asset: rng.pick(ASSETS),
        amount: finalAmount.toFixed(4),
        tx_hash: makeTx(hop, terminalAddr, finalAmount, 'USDT', chain, t).tx_hash,
        timestamp: t,
      })
    })

    // Background noise so every node in the graph looks like a real, busy wallet.
    addNoiseTransactions(seedAddr, chain, startedAt, rng.int(8, 40))
    addNoiseTransactions(muleAddr, chain, startedAt, rng.int(15, 60))
    for (const burner of burners) addNoiseTransactions(burner, chain, startedAt, rng.int(5, 30))

    const findings: GeneratedInvestigation['findings'] = []
    findings.push({
      id: `FIND-${caseId}-001`,
      type: 'vasp_exposure',
      severity: 'high',
      wallet: terminalAddr,
      description: `Funds reached a wallet associated with ${terminalEntity.name} (${terminalEntity.jurisdiction}) after passing through ${burners.length} intermediary wallet${burners.length > 1 ? 's' : ''}.`,
      confidence: terminalEntity.confidence,
      evidence: `Verified entity dataset · terminal transaction ${shortAddr(terminalAddr)}`,
    })
    findings.push({
      id: `FIND-${caseId}-002`,
      type: 'rapid_forwarding',
      severity: 'medium',
      wallet: muleAddr,
      description: `Received funds were forwarded to ${burners.length} separate wallet${burners.length > 1 ? 's' : ''} within minutes of receipt.`,
      confidence: rng.float(0.8, 0.93, 2),
      evidence: 'Transaction timing analysis · multi-hop layering pattern',
    })
    if (mixerAddr && mixer) {
      findings.push({
        id: `FIND-${caseId}-003`,
        type: 'mixer_interaction',
        severity: 'medium',
        wallet: mixerAddr,
        description: `One or more layering paths were routed through ${mixer.name}, a known mixing service, before reaching the exchange.`,
        confidence: rng.float(0.75, 0.9, 2),
        evidence: 'Known mixer address list',
      })
    }
    if (bridgeAddr && bridge) {
      findings.push({
        id: `FIND-${caseId}-004`,
        type: 'cross_chain_movement',
        severity: 'medium',
        wallet: bridgeAddr,
        description: `Funds crossed chains via ${bridge.name} before reaching the terminal deposit address.`,
        confidence: rng.float(0.7, 0.88, 2),
        evidence: 'Bridge event correlation · source/destination chain match',
      })
    }

    return { chain, seedAddr, nodes, edges, findings }
  }

  // --- Cases -------------------------------------------------------------

  const cases: GeneratedCase[] = []
  const CASE_COUNT = 39 // + the one hand-authored case added by mockStore = 40 total

  for (let i = 0; i < CASE_COUNT; i++) {
    const template = rng.pick(CASE_TEMPLATES)
    const seq = i + 2 // CASE-001 is reserved for the hand-authored demo case
    const case_id = `CASE-${String(seq).padStart(3, '0')}`
    const year = rng.bool(0.8) ? 2026 : 2025
    const createdDaysAgo = rng.int(3, 240)
    const created_at = isoDaysAgo(createdDaysAgo)
    const status = rng.weightedPick<CaseStatus>([
      ['open', 0.35],
      ['in_progress', 0.4],
      ['closed', 0.25],
    ])
    const priority = rng.weightedPick<CasePriority>([
      ['high', 0.3],
      ['medium', 0.45],
      ['low', 0.25],
    ])

    const investigationCount = rng.bool(0.15) ? 2 : 1
    const investigations: GeneratedInvestigation[] = []
    const wallets: CaseWallet[] = []
    const activity: GeneratedCase['activity'] = [
      { timestamp: created_at, actor: 'investigator', action: 'Case created' },
    ]

    // A handful of cases get a live-feeling investigation (still running/queued
    // when the app loads) so the progress UI has real variety to show.
    const isLiveDemo = i < 3
    const isFailedDemo = i === 3

    for (let invIdx = 0; invIdx < investigationCount; invIdx++) {
      const investigation_id = `INV-${String(idForInv()).padStart(3, '0')}`
      const walletAddedAt = new Date(new Date(created_at).getTime() + rng.int(60_000, 7200_000)).toISOString()
      const graph = buildInvestigationGraph(case_id, created_at)

      wallets.push({
        wallet_id: `WALLET-${case_id}-${invIdx + 1}`,
        chain: graph.chain,
        address: graph.seedAddr,
        label: invIdx === 0 ? 'Suspect Wallet (from complaint)' : 'Additional suspect wallet',
        source: 'complaint',
        risk_level: 'high',
      })
      activity.push({ timestamp: walletAddedAt, actor: 'investigator', action: `Added wallet ${shortAddr(graph.seedAddr)} to case` })

      let startedAtMs: number
      let durationMs = 8_000
      if (isLiveDemo && invIdx === 0) {
        startedAtMs = NOW - rng.int(1_000, 6_500)
        durationMs = 8_000
      } else if (isFailedDemo && invIdx === 0) {
        startedAtMs = NOW - 999_000
        durationMs = 8_000
      } else {
        startedAtMs = new Date(walletAddedAt).getTime() + rng.int(60_000, 600_000)
        durationMs = 8_000
      }

      activity.push({
        timestamp: new Date(startedAtMs).toISOString(),
        actor: 'investigator',
        action: `Started investigation ${investigation_id}`,
      })

      investigations.push({
        investigation_id,
        case_id,
        chain: graph.chain,
        start_address: graph.seedAddr,
        max_hops: rng.int(3, 6),
        min_value: rng.pick([0, 100, 1000, 10000]),
        started_at: startedAtMs,
        duration_ms: durationMs,
        full_graph: { nodes: graph.nodes, edges: graph.edges },
        findings: isFailedDemo && invIdx === 0 ? [] : graph.findings,
      })
    }

    const updated_at = activity[activity.length - 1].timestamp

    cases.push({
      case_id,
      title: template.title(seq, year),
      description: template.description,
      status,
      priority,
      created_at,
      updated_at,
      wallets,
      investigations,
      activity,
    })
  }

  return { entities, addressEntity, cases, transactionsByAddress, transactionsByHash, walletMeta }
}

let invCounter = 1
function idForInv() {
  invCounter += 1
  return invCounter
}
