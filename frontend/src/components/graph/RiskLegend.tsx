const ITEMS: { label: string; color: string }[] = [
  { label: 'Suspect / seed wallet (bordered)', color: '#60a5fa' },
  { label: 'High risk', color: '#dc2626' },
  { label: 'Medium risk', color: '#d97706' },
  { label: 'Low risk / verified', color: '#16a34a' },
  { label: 'Unknown', color: '#6b7280' },
]

export function RiskLegend() {
  return (
    <div className="space-y-1.5 text-xs text-text-secondary">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  )
}
