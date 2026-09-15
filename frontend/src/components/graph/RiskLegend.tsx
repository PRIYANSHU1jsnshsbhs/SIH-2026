const ITEMS: { label: string; color: string }[] = [
  { label: 'Suspect / seed target', color: '#F57C00' },
  { label: 'High risk', color: '#D14343' },
  { label: 'Medium risk', color: '#D89A10' },
  { label: 'Low risk / verified', color: '#1F8A4D' },
  { label: 'Unknown', color: '#102A4C' },
]

export function RiskLegend() {
  return (
    <div className="space-y-2 text-xs font-medium text-text-primary">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  )
}
