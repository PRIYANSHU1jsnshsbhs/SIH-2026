import { EntityTypeIcon } from './EntityTypeIcon'

function LegendIcon({ type, isSeed = false }: { type: 'wallet' | 'exchange' | 'bridge' | 'mixer' | 'contract'; isSeed?: boolean }) {
  return (
    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white ${isSeed ? 'bg-[#102A4C] ring-2 ring-[#F57C00]' : 'bg-[#64748B]'}`}>
      <EntityTypeIcon type={type} isSeed={isSeed} className="h-4 w-4" />
    </span>
  )
}

export function RiskLegend() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold text-text-primary mb-2">Entity Types</p>
        <div className="space-y-2 text-xs font-medium text-text-secondary">
          <div className="flex items-center gap-2.5">
            <LegendIcon type="wallet" isSeed />
            <span className="text-text-primary">START / Suspect Wallet</span>
          </div>
          <div className="flex items-center gap-2.5">
            <LegendIcon type="wallet" />
            <span>Normal Wallet</span>
          </div>
          <div className="flex items-center gap-2.5">
            <LegendIcon type="exchange" />
            <span>VASP / Exchange</span>
          </div>
          <div className="flex items-center gap-2.5">
            <LegendIcon type="bridge" />
            <span>Bridge</span>
          </div>
          <div className="flex items-center gap-2.5">
            <LegendIcon type="mixer" />
            <span>Mixer</span>
          </div>
          <div className="flex items-center gap-2.5">
            <LegendIcon type="contract" />
            <span>Smart Contract</span>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-text-primary mb-2">Risk Level (Fill Color)</p>
        <div className="space-y-2 text-xs font-medium text-text-secondary">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full shrink-0 shadow-sm bg-[#D14343]" />
            High Risk
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full shrink-0 shadow-sm bg-[#D89A10]" />
            Medium Risk
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full shrink-0 shadow-sm bg-[#1F8A4D]" />
            Low Risk
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full shrink-0 shadow-sm bg-[#102A4C]" />
            Unknown
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-text-primary mb-2">Transactions</p>
        <div className="space-y-2 text-xs font-medium text-text-secondary">
          <div className="flex items-center gap-2.5">
            <span className="h-0.5 w-4 bg-[#FF8A00] block" />
            <span className="text-[#FF8A00] font-bold">Attribution Path</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-px w-4 bg-[#7B8798] block" />
            Background Edge
          </div>
        </div>
      </div>
    </div>
  )
}
