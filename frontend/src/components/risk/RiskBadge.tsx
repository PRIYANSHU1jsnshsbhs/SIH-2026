import clsx from 'clsx'
import type { RiskLevel } from '@/schemas/wallets'

const STYLES: Record<RiskLevel, string> = {
  high: 'bg-red text-white shadow-sm border border-red',
  medium: 'bg-saffron text-white shadow-sm border border-saffron',
  low: 'bg-green text-white shadow-sm border border-green',
  unknown: 'bg-surface-2 text-text-secondary border border-border-c',
}

const LABELS: Record<RiskLevel, string> = {
  high: 'HIGH RISK',
  medium: 'MEDIUM RISK',
  low: 'VERIFIED LOW',
  unknown: 'UNKNOWN',
}

export function RiskBadge({ level, score }: { level: RiskLevel; score?: number | null }) {
  const isRealScore = typeof score === 'number'

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest',
        STYLES[level],
      )}
    >
      {LABELS[level]}
      {isRealScore ? (
        <span className="opacity-80 font-mono ml-0.5">{score}/100</span>
      ) : (
        <span className="opacity-80 font-mono ml-0.5">Not available</span>
      )}
    </span>
  )
}
