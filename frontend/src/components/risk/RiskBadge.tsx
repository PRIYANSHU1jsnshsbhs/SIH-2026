import clsx from 'clsx'
import type { RiskLevel } from '@/schemas/wallets'

const STYLES: Record<RiskLevel, string> = {
  high: 'bg-red-950/60 text-red-300 badge-high',
  medium: 'bg-amber-950/60 text-amber-300 badge-medium',
  low: 'bg-green-950/60 text-green-300 badge-low',
  unknown: 'bg-surface-2 text-text-secondary',
}

const LABELS: Record<RiskLevel, string> = {
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
  unknown: 'UNKNOWN',
}

export function RiskBadge({ level, score }: { level: RiskLevel; score?: number }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        STYLES[level],
      )}
    >
      {LABELS[level]}
      {typeof score === 'number' && <span className="opacity-70 font-normal">{score}/100</span>}
    </span>
  )
}
