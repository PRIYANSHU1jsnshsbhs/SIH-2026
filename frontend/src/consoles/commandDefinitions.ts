export interface CommandDefinition {
  syntax: string
  description: string
  example: string
}

/**
 * Single source of truth for every command the FastAPI console recognizes.
 * FastApiConsole's `help` output and the Terminal Commands reference page
 * both render from this list, so the two can never drift apart.
 */
export const COMMAND_DEFINITIONS: CommandDefinition[] = [
  {
    syntax: 'help',
    description: 'List every available command.',
    example: 'help',
  },
  {
    syntax: 'cases',
    description: 'List all cases visible to the current investigator.',
    example: 'cases',
  },
  {
    syntax: 'case <case_id>',
    description: 'Fetch full details for one case: wallets, investigations, findings, activity.',
    example: 'case CASE-001',
  },
  {
    syntax: 'wallet <chain> <address>',
    description: 'Fetch the indexed overview of a wallet address on a given chain.',
    example: 'wallet ethereum 0x7A31d9a3F4B2c8e1119aD8e0F0aC3b91FdE7A91F',
  },
  {
    syntax: 'search <query>',
    description: 'Search indexed wallets by address substring.',
    example: 'search 0x7A31',
  },
  {
    syntax: 'entity <chain> <address>',
    description: 'Check whether an address is attributed to a known entity/VASP.',
    example: 'entity ethereum 0xExchangeXDepositWallet0000000000000000A',
  },
  {
    syntax: 'risk <chain> <address>',
    description: 'Compute the risk score and contributing signals for a wallet.',
    example: 'risk ethereum 0x7A31d9a3F4B2c8e1119aD8e0F0aC3b91FdE7A91F',
  },
  {
    syntax: 'investigation <id> status',
    description: 'Poll an investigation’s progress (queued / running / completed).',
    example: 'investigation INV-001 status',
  },
  {
    syntax: 'investigation <id> graph',
    description: 'Fetch the traced node/edge graph for a completed investigation, as raw JSON.',
    example: 'investigation INV-001 graph',
  },
  {
    syntax: 'investigation <id> findings',
    description: 'Fetch the ranked findings produced by a completed investigation.',
    example: 'investigation INV-001 findings',
  },
  {
    syntax: 'investigation <id> open',
    description: 'Navigate straight into that investigation’s interactive graph view.',
    example: 'investigation INV-001 open',
  },
  {
    syntax: 'graphs',
    description: 'List every traced investigation across every case — case, status, node/edge counts — to find an ID to open.',
    example: 'graphs',
  },
  {
    syntax: 'explorer',
    description: 'Navigate to the Investigation Explorer (searchable list + live graph preview).',
    example: 'explorer',
  },
  {
    syntax: 'clear',
    description: 'Clear the console output.',
    example: 'clear',
  },
]
