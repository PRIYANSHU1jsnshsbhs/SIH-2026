import { useState } from 'react'
import type { RiskLevel } from '@/schemas/wallets'

export interface GraphFilterState {
  riskLevel: RiskLevel | 'all'
  minValue: number
  showCrossChainOverlay: boolean
  showFundFlowOverlay: boolean
}

export function GraphFilters({
  filters,
  onChange,
}: {
  filters: GraphFilterState
  onChange: (next: GraphFilterState) => void
}) {
  // The slider drags smoothly on its own; the (expensive) graph rebuild only
  // fires once the user releases it, not on every intermediate tick.
  const [committedMinValue, setCommittedMinValue] = useState(filters.minValue)
  const [draftMinValue, setDraftMinValue] = useState(filters.minValue)
  if (filters.minValue !== committedMinValue) {
    setCommittedMinValue(filters.minValue)
    setDraftMinValue(filters.minValue)
  }

  function commitMinValue() {
    if (draftMinValue !== filters.minValue) onChange({ ...filters, minValue: draftMinValue })
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">Risk</label>
        <select
          value={filters.riskLevel}
          onChange={(e) => onChange({ ...filters, riskLevel: e.target.value as GraphFilterState['riskLevel'] })}
          className="w-full rounded-md bg-surface-2 px-2 py-1.5 text-sm text-text-primary"
        >
          <option value="all">All levels</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-text-tertiary mb-1.5">
          Min transaction amount ({draftMinValue})
        </label>
        <input
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={draftMinValue}
          onChange={(e) => setDraftMinValue(Number(e.target.value))}
          onMouseUp={commitMinValue}
          onTouchEnd={commitMinValue}
          onKeyUp={commitMinValue}
          className="w-full"
        />
        <p className="text-xs text-text-tertiary mt-1">
          Hides transfers smaller than this, to cut down on clutter from minor transactions.
        </p>
      </div>

      <div className="space-y-2 pt-2 border-t border-border-c">
        <p className="text-xs uppercase tracking-wide text-text-tertiary">Overlays</p>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={filters.showCrossChainOverlay}
            onChange={(e) => onChange({ ...filters, showCrossChainOverlay: e.target.checked })}
          />
          Cross-chain paths
        </label>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={filters.showFundFlowOverlay}
            onChange={(e) => onChange({ ...filters, showFundFlowOverlay: e.target.checked })}
          />
          Fund-flow attribution
        </label>
      </div>
    </div>
  )
}
