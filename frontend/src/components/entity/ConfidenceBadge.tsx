export function ConfidenceBadge({ value }: { value: number | null | undefined }) {
  if (value == null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-1 text-[10px] font-bold tracking-widest text-text-primary border border-border-c shadow-sm uppercase">
        Confidence: Not available
      </span>
    )
  }
  const pct = Math.round(value * 100)
  const label = pct >= 90 ? 'HIGH CONFIDENCE' : pct >= 60 ? 'MODERATE CONFIDENCE' : 'LOW CONFIDENCE'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-1 text-[10px] font-bold tracking-widest text-text-primary border border-border-c shadow-sm uppercase">
      {label} · <span className="font-mono">{pct}%</span>
    </span>
  )
}
