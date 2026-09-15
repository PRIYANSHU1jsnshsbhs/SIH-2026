// Seed data for the mock backend. Models one coherent demo case: a suspect
// wallet scatters funds across two burner wallets, one of which routes
// through a mixer, before both paths converge on the same exchange deposit
// address — the "scatter-gather" layering pattern described in
// TGN_Architecture.md Case 2.

const DEMO_PASSWORD = 'thisisit'

export const SEED_USERS = [
  { id: 'USR-001', username: 'demo', password: DEMO_PASSWORD, name: 'A. Investigator', role: 'investigator' as const },
  { id: 'USR-002', username: 'admin', password: DEMO_PASSWORD, name: 'S. Supervisor', role: 'admin' as const },
  { id: 'USR-003', username: 'dev', password: DEMO_PASSWORD, name: 'R. Platform Engineer', role: 'devops' as const },
  { id: 'USR-004', username: 'mock', password: DEMO_PASSWORD, name: 'M. Investigator', role: 'investigator' as const },
]

export const SEED_CHAIN = 'ethereum'

export const SEED_ADDRESSES = {
  seed: '0x7A31d9a3F4B2c8e1119aD8e0F0aC3b91FdE7A91F',
  mule: '0x4B2c11A9e0aC3bF0D8e1a9F4B2c8e11197aD8e11',
  burnerA: '0x9De077C4B2c8e1119aD8e0F0aC3b91FdE7A977C',
  burnerB: '0x1Fa802D4B2c8e1119aD8e0F0aC3b91FdE7A902D',
  mixer: '0xM1x3rC0ntract00000000000000000000000001',
  exchange: '0xExchangeXDepositWallet0000000000000000A',
}

export const SEED_CASE_ID = 'CASE-001'
export const SEED_INVESTIGATION_ID = 'INV-001'

export const SEED_CASE = {
  case_id: SEED_CASE_ID,
  title: 'Crypto Fraud Case 2026-014',
  description:
    'Victim reported an investment-scam wallet via NCRP. Suspect wallet received funds and began layering within minutes.',
  status: 'in_progress' as const,
  priority: 'high' as const,
  created_at: '2026-08-28T09:12:00Z',
  updated_at: '2026-09-06T14:40:00Z',
}

export const SEED_ENTITY = {
  // Namespaced distinctly from the generated dataset's `ENT-{NNN}` ids
  // (datasetGenerator.ts) so the two id spaces can never collide.
  entity_id: 'ENT-SEED-001',
  name: 'Exchange X',
  type: 'VASP',
  jurisdiction: 'Example Jurisdiction',
  confidence: 0.94,
  source: 'Verified Dataset',
  last_verified: '2026-08-20',
}

interface SeedTx {
  tx_hash: string
  from: string
  to: string
  amount: string
  asset: string
  timestamp: string
  block_number: number
}

export const SEED_TRANSACTIONS: SeedTx[] = [
  {
    tx_hash: '0x1111111111111111111111111111111111111111111111111111111111aaaa',
    from: '0xVictimWallet00000000000000000000000001',
    to: SEED_ADDRESSES.seed,
    amount: '5.0',
    asset: 'ETH',
    timestamp: '2026-09-03T10:00:00Z',
    block_number: 23450800,
  },
  {
    tx_hash: '0x2222222222222222222222222222222222222222222222222222222222bbbb',
    from: SEED_ADDRESSES.seed,
    to: SEED_ADDRESSES.mule,
    amount: '4.9',
    asset: 'ETH',
    timestamp: '2026-09-03T10:00:22Z',
    block_number: 23450802,
  },
  {
    tx_hash: '0x3333333333333333333333333333333333333333333333333333333333cccc',
    from: SEED_ADDRESSES.mule,
    to: SEED_ADDRESSES.burnerA,
    amount: '2.5',
    asset: 'ETH',
    timestamp: '2026-09-03T10:00:45Z',
    block_number: 23450803,
  },
  {
    tx_hash: '0x4444444444444444444444444444444444444444444444444444444444dddd',
    from: SEED_ADDRESSES.mule,
    to: SEED_ADDRESSES.burnerB,
    amount: '2.4',
    asset: 'ETH',
    timestamp: '2026-09-03T10:00:47Z',
    block_number: 23450803,
  },
  {
    tx_hash: '0x5555555555555555555555555555555555555555555555555555555555eeee',
    from: SEED_ADDRESSES.burnerA,
    to: SEED_ADDRESSES.mixer,
    amount: '2.45',
    asset: 'ETH',
    timestamp: '2026-09-03T10:05:10Z',
    block_number: 23450811,
  },
  {
    tx_hash: '0x6666666666666666666666666666666666666666666666666666666666ffff',
    from: SEED_ADDRESSES.burnerB,
    to: SEED_ADDRESSES.exchange,
    amount: '2.38',
    asset: 'ETH',
    timestamp: '2026-09-03T10:06:02Z',
    block_number: 23450812,
  },
  {
    tx_hash: '0x77777777777777777777777777777777777777777777777777777777770001',
    from: SEED_ADDRESSES.mixer,
    to: SEED_ADDRESSES.exchange,
    amount: '2.39',
    asset: 'ETH',
    timestamp: '2026-09-03T10:15:30Z',
    block_number: 23450840,
  },
]

export const SEED_WALLET_LABELS: Record<string, { label: string; risk: 'high' | 'medium' | 'low' | 'unknown' }> = {
  [SEED_ADDRESSES.seed]: { label: 'Suspect Wallet', risk: 'high' },
  [SEED_ADDRESSES.mule]: { label: 'Layering Mule', risk: 'high' },
  [SEED_ADDRESSES.burnerA]: { label: 'Burner A', risk: 'medium' },
  [SEED_ADDRESSES.burnerB]: { label: 'Burner B', risk: 'medium' },
  [SEED_ADDRESSES.mixer]: { label: 'Mixer Service', risk: 'high' },
  [SEED_ADDRESSES.exchange]: { label: 'Exchange X Deposit', risk: 'low' },
}
