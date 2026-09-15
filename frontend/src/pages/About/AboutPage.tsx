export function AboutPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-text-tertiary">SIH 2026 · PS 26183</p>
        <h1 className="mt-1 text-lg font-semibold text-text-primary">About this platform</h1>
      </div>

      <div className="rounded-lg bg-surface-1 p-5 space-y-3">
        <p className="text-sm text-text-secondary">
          This is a <span className="text-text-primary">blockchain fraud investigation platform</span> built for
          law-enforcement investigators. It exists to answer one question quickly:{' '}
          <span className="text-text-primary">given a suspect wallet address, where did the money go, and who
          received it?</span>
        </p>
        <p className="text-sm text-text-secondary">
          Cyber fraud victims often report only a cryptocurrency wallet address. From there, funds are frequently
          moved through burner wallets, mixers, and multiple hops before reaching an exchange. Tracing that by hand,
          transaction by transaction, is slow. This platform automates it.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">The investigator workflow</h2>
        <div className="rounded-lg bg-surface-1 p-5">
          <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
            <li>Open a case and add the suspect wallet reported in a complaint</li>
            <li>Start an investigation — trace funds outward across a configurable number of hops</li>
            <li>Review the traced graph: wallets, transfers, and where the money converges</li>
            <li>See which addresses are attributed to known exchanges or VASPs, and with what confidence</li>
            <li>Review the risk score behind each wallet, with the specific signals that produced it</li>
            <li>Read the findings — the handful of conclusions that matter, not the whole raw graph</li>
            <li>Generate an evidence-backed report for the case file</li>
          </ol>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">What this platform is careful about</h2>
        <div className="rounded-lg bg-surface-1 p-5 space-y-2 text-sm text-text-secondary">
          <p>A blockchain fact (a transaction happened) is not the same as an attribution (this address belongs to
          this exchange), which is not the same as a prediction (this wallet looks suspicious). The interface keeps
          these separate on purpose.</p>
          <p>Every risk score shows its contributing signals. Every entity attribution shows its source and
          confidence. A high risk score is a lead for an investigator to pursue, not a verdict.</p>
        </div>
      </div>

      <div className="rounded-lg bg-surface-2 p-5 text-sm text-text-secondary">
        This build runs entirely against mocked data for demonstration purposes — no real blockchain, case, or
        personal data is connected. The API layer is shaped to match a real backend contract, so a production
        backend can be swapped in without changing how the interface works.
      </div>
    </div>
  )
}
