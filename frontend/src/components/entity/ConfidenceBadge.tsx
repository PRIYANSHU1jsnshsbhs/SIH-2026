export function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const label = pct >= 90 ? 'HIGH CONFIDENCE' : pct >= 60 ? 'MODERATE CONFIDENCE' : 'LOW CONFIDENCE'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-text-primary">
      {label} · {pct}%
    </span>
  )
}
