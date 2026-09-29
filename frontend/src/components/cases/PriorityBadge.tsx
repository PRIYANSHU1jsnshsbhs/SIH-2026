import clsx from 'clsx'

const STYLES: Record<string, string> = {
  high: 'bg-red text-white shadow-sm border border-red',
  medium: 'bg-saffron text-white shadow-sm border border-saffron',
  low: 'bg-green text-white shadow-sm border border-green',
  unknown: 'bg-surface-2 text-text-secondary border border-border-c',
}

const LABELS: Record<string, string> = {
  high: 'HIGH PRIORITY',
  medium: 'MEDIUM PRIORITY',
  low: 'LOW PRIORITY',
  unknown: 'UNKNOWN',
}

export function PriorityBadge({ level }: { level: string }) {
  const normLevel = STYLES[level] ? level : 'unknown'
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest',
        STYLES[normLevel],
      )}
    >
      {LABELS[normLevel]}
    </span>
  )
}
