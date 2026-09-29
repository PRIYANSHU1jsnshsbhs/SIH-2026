import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { BrandLogo } from '@/components/common/BrandLogo'
import './HomePage.css'

type IconName = 'route' | 'entity' | 'graph' | 'risk' | 'evidence' | 'report' | 'wallet' | 'search' | 'file'

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    route: <><circle cx="5" cy="6" r="2" /><circle cx="19" cy="18" r="2" /><path d="M7 6h4a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3" /><path d="m9 3 3 3-3 3" /></>,
    entity: <><path d="M3 9h18L12 3 3 9Z" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M2 21h20" /></>,
    graph: <><circle cx="5" cy="12" r="2.5" /><circle cx="18" cy="5" r="2.5" /><circle cx="19" cy="18" r="2.5" /><path d="m7.2 10.8 8.5-4.6M7.4 13l9.2 4" /><path d="m18.4 7.5.4 8" /></>,
    risk: <><path d="M12 3 3.5 7v5.5c0 4.8 3.6 7.7 8.5 9.5 4.9-1.8 8.5-4.7 8.5-9.5V7L12 3Z" /><path d="M12 8v5M12 17h.01" /></>,
    evidence: <><path d="M5 3h10l4 4v14H5V3Z" /><path d="M15 3v5h5M8 12h8M8 16h6" /></>,
    report: <><path d="M4 4h16v16H4z" /><path d="M8 15v2M12 11v6M16 7v10" /></>,
    wallet: <><path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12v3" /><path d="M16 12h5v4h-5a2 2 0 0 1 0-4Z" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
    file: <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v5h5M9 13h7M9 17h5" /></>,
  }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

const capabilities: { icon: IconName; title: string; description: string; tag: string }[] = [
  { icon: 'route', title: 'Deterministic fund tracing', description: 'Trace outbound transaction paths across configurable hops using a reproducible breadth-first investigation engine.', tag: 'TRACE' },
  { icon: 'entity', title: 'Known entity attribution', description: 'Match reached addresses against seeded VASP and entity records, with transparent path evidence.', tag: 'ATTRIBUTE' },
  { icon: 'graph', title: 'Interactive graph exploration', description: 'Move between attribution, one-hop, two-hop, and full graph views without losing the suspect wallet.', tag: 'EXPLORE' },
  { icon: 'risk', title: 'Rule-based risk context', description: 'Review deterministic mock risk classifications and findings without implying AI-generated predictions.', tag: 'ASSESS' },
  { icon: 'evidence', title: 'Evidence-backed findings', description: 'Inspect the addresses, transactions, hop counts, amounts, and confidence available from the investigation.', tag: 'REVIEW' },
  { icon: 'report', title: 'Downloadable PDF reports', description: 'Package case context, attribution, findings, and transaction evidence into a generated PDF report.', tag: 'REPORT' },
]

const workflow = [
  { number: '01', title: 'Create a case', description: 'Open a structured workspace for the reported incident.' },
  { number: '02', title: 'Add the suspect wallet', description: 'Select the chain and validate the starting address.' },
  { number: '03', title: 'Run the investigation', description: 'Trace deterministic fund flows across the selected hop depth.' },
  { number: '04', title: 'Review and report', description: 'Inspect attribution, findings, risk context, and export the PDF.' },
]

function useRevealOnScroll() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12, rootMargin: '0px 0px -48px' },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
}

function SectionBadge({ children }: { children: ReactNode }) {
  return <span className="landing-section-badge"><i />{children}<i /></span>
}

function MiniGraph() {
  return (
    <div className="landing-graph-stage" aria-label="Illustration of a suspect wallet transaction graph">
      <div className="landing-grid" />
      <svg viewBox="0 0 700 430" role="img" aria-label="Transaction paths from a suspect wallet to a VASP">
        <defs>
          <marker id="landing-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="#9aa7b9" /></marker>
          <marker id="landing-arrow-accent" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill="#f57c00" /></marker>
        </defs>
        <g className="landing-graph-lines" markerEnd="url(#landing-arrow)">
          <path d="M350 215 220 110" /><path d="M350 215 205 270" /><path d="M350 215 365 85" /><path d="M350 215 485 120" /><path d="M350 215 485 295" /><path d="M220 110 110 145" /><path d="M205 270 120 330" /><path d="M485 120 590 82" /><path d="M485 295 590 342" />
        </g>
        <path className="landing-attribution-line" d="M350 215 535 215" markerEnd="url(#landing-arrow-accent)" />
        <g className="landing-node landing-node-normal"><circle cx="220" cy="110" r="20" /><text x="220" y="115">W</text></g>
        <g className="landing-node landing-node-normal"><circle cx="205" cy="270" r="20" /><text x="205" y="275">W</text></g>
        <g className="landing-node landing-node-normal"><circle cx="365" cy="85" r="20" /><text x="365" y="90">W</text></g>
        <g className="landing-node landing-node-normal"><circle cx="485" cy="120" r="20" /><text x="485" y="125">W</text></g>
        <g className="landing-node landing-node-normal"><circle cx="485" cy="295" r="20" /><text x="485" y="300">W</text></g>
        <g className="landing-node landing-node-muted"><circle cx="110" cy="145" r="14" /><circle cx="120" cy="330" r="14" /><circle cx="590" cy="82" r="14" /><circle cx="590" cy="342" r="14" /></g>
        <g className="landing-node landing-node-start"><circle cx="350" cy="215" r="30" /><circle cx="350" cy="215" r="38" /><text x="350" y="221">S</text></g>
        <g className="landing-node landing-node-vasp"><rect x="535" y="183" width="100" height="64" rx="18" /><text x="585" y="211">VASP</text><text className="landing-node-sub" x="585" y="230">EXCHANGE</text></g>
      </svg>
      <div className="landing-graph-caption"><span className="landing-live-dot" /> Attribution path highlighted</div>
    </div>
  )
}

export function HomePage() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const isSignedIn = Boolean(token && user)
  const startPath = isSignedIn ? '/investigations/new' : '/login'

  useRevealOnScroll()

  return (
    <div className="landing-page">
      <header className="landing-nav-wrap">
        <nav className="landing-nav" aria-label="Public navigation">
          <Link to="/" className="landing-brand" aria-label="LAPUS home">
            <BrandLogo className="landing-brand-logo" />
          </Link>
          <div className="landing-nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#workflow">Workflow</a>
            <a href="#reports">Reports</a>
          </div>
          <div className="landing-nav-actions">
            {!isSignedIn && <Link to="/login" className="landing-nav-signin">Sign In</Link>}
            <Link to={isSignedIn ? '/dashboard' : startPath} className="landing-button landing-button-small">
              {isSignedIn ? 'Dashboard' : 'Get Started'} <span>↗</span>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-orbit landing-orbit-one" /><div className="landing-orbit landing-orbit-two" />
          <div className="landing-hero-grid" aria-hidden="true" />
          <div className="landing-hero-content">
            <span className="landing-kicker"><span /> SIH 2026 · PS 26182 <span /></span>
            <h1>Trace Crypto Funds.<br /><em>Identify Where They End Up.</em></h1>
            <p>An investigation platform for tracing suspicious cryptocurrency fund flows, identifying linked entities and VASPs, visualizing transaction paths, and generating evidence-backed reports.</p>
            <div className="landing-proof-strip" aria-label="Platform highlights">
              <div className="landing-proof-track">
                <span><b>✓</b> Deterministic tracing</span>
                <span><b>✓</b> VASP attribution</span>
                <span><b>✓</b> PDF evidence reports</span>
                <span aria-hidden="true"><b>✓</b> Deterministic tracing</span>
                <span aria-hidden="true"><b>✓</b> VASP attribution</span>
                <span aria-hidden="true"><b>✓</b> PDF evidence reports</span>
              </div>
            </div>
            <div className="landing-hero-actions">
              <Link to={startPath} className="landing-button landing-button-primary">Start Investigation <span>→</span></Link>
              <Link to="/login" className="landing-button landing-button-secondary">Sign In</Link>
              {isSignedIn && <Link to="/dashboard" className="landing-text-link">Go to Dashboard →</Link>}
            </div>
            <p className="landing-demo-note"><span /> Built for investigators · Simulated-data MVP</p>
          </div>
        </section>

        <section id="how-it-works" className="landing-section landing-intro-section">
          <div className="landing-container">
            <div className="landing-statement" data-reveal>
              Turn a reported wallet into a clear, reviewable <em>investigation trail</em>—from first transfer to known destination.
            </div>
            <div className="landing-metrics" data-reveal>
              <article><strong>01</strong><span>Suspect wallet starts the trace</span></article>
              <article><strong>04</strong><span>Focused graph viewing modes</span></article>
              <article><strong>PDF</strong><span>Downloadable case evidence</span></article>
            </div>
            <div className="landing-how-grid">
              <div className="landing-section-heading" data-reveal>
                <SectionBadge>How it works</SectionBadge>
                <h2>From address to attribution, without a black box.</h2>
                <p>Each investigation follows a transparent path: validate the input, trace the graph, identify known entities, then preserve the evidence.</p>
              </div>
              <div className="landing-how-steps" data-reveal>
                <div><span><Icon name="wallet" /></span><strong>Add a wallet</strong><p>Start with a chain-aware, validated suspect address.</p></div>
                <div><span><Icon name="search" /></span><strong>Trace transactions</strong><p>Traverse the mock dataset with deterministic graph logic.</p></div>
                <div><span><Icon name="file" /></span><strong>Preserve findings</strong><p>Review attribution and generate the investigation report.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section id="capabilities" className="landing-section landing-capabilities-section">
          <div className="landing-container">
            <div className="landing-centered-heading" data-reveal>
              <SectionBadge>Core capabilities</SectionBadge>
              <h2>Purpose-built for crypto investigation workflows.</h2>
              <p>Practical tools for tracing, attribution, review, and reporting—grounded in the evidence available in this demo.</p>
            </div>
            <div className="landing-capability-frame">
              <div className="landing-grid" />
              <div className="landing-capability-grid">
                {capabilities.map((item, index) => (
                  <article key={item.title} className="landing-capability-card" data-reveal style={{ '--reveal-delay': `${index * 70}ms` } as React.CSSProperties}>
                    <div className="landing-card-top"><span className="landing-icon-tile"><Icon name={item.icon} /></span><small>{item.tag}</small></div>
                    <h3>{item.title}</h3><p>{item.description}</p><span className="landing-card-arrow">↗</span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="landing-section landing-workflow-section">
          <div className="landing-container">
            <div className="landing-split-heading" data-reveal>
              <div><SectionBadge>Investigation workflow</SectionBadge><h2>A disciplined path from report to result.</h2></div>
              <p>Case context stays connected to the suspect wallet, graph, findings, attribution, and generated report throughout the workflow.</p>
            </div>
            <div className="landing-workflow-grid">
              {workflow.map((step, index) => <article key={step.number} data-reveal style={{ '--reveal-delay': `${index * 90}ms` } as React.CSSProperties}><span>{step.number}</span><div className="landing-workflow-line" /><h3>{step.title}</h3><p>{step.description}</p></article>)}
            </div>
          </div>
        </section>

        <section className="landing-section landing-graph-section">
          <div className="landing-container landing-feature-split">
            <div className="landing-feature-copy" data-reveal>
              <SectionBadge>Transaction graph visualization</SectionBadge>
              <h2>See the path, not just the transactions.</h2>
              <p>Start from the suspect wallet, inspect nearby hops, and expand to the complete investigation graph when deeper context is needed.</p>
              <ul><li>START wallet remains visually distinct</li><li>Attribution path edges are emphasized</li><li>Entity type and risk remain separate dimensions</li><li>Node details expose only available evidence</li></ul>
            </div>
            <div data-reveal><MiniGraph /></div>
          </div>
        </section>

        <section className="landing-section landing-attribution-section">
          <div className="landing-container landing-feature-split landing-feature-reverse">
            <div className="landing-attribution-card" data-reveal>
              <div className="landing-attribution-header"><span className="landing-icon-tile"><Icon name="entity" /></span><span>NEAREST IDENTIFIED VASP</span><b>HIGH CONFIDENCE</b></div>
              <div className="landing-attribution-body"><div><small>ENTITY</small><strong>Mock Dataset VASP</strong><span>Exchange · Mockland</span></div><div className="landing-hop-badge">1 HOP</div></div>
              <div className="landing-path-row"><span>START<br /><b>node-114</b></span><i /><span>88.12 USDT</span><i /><span>EXCHANGE<br /><b>node-10</b></span></div>
              <div className="landing-evidence-row"><span>Transaction evidence</span><code>mocktx-19388</code></div>
            </div>
            <div className="landing-feature-copy" data-reveal>
              <SectionBadge>Nearest VASP attribution</SectionBadge>
              <h2>Identify the nearest known destination.</h2>
              <p>When a traced path reaches a seeded entity, investigators can review the entity name, address, hop count, amount, confidence, and supporting transaction path.</p>
              <div className="landing-callout"><span>01</span><p><strong>Explainable ordering</strong>Attribution candidates remain ranked by hop count, evidence quality, confidence, then received amount.</p></div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-findings-section">
          <div className="landing-container">
            <div className="landing-centered-heading" data-reveal><SectionBadge>Findings & risk</SectionBadge><h2>Context investigators can inspect.</h2><p>Risk remains deterministic and evidence-led in this MVP—never presented as an AI or GNN prediction.</p></div>
            <div className="landing-findings-grid">
              <article data-reveal><div className="landing-finding-icon high"><Icon name="risk" /></div><small>RULE-BASED CLASSIFICATION</small><h3>Risk signals with reasons</h3><p>Review the available score, level, and supporting reasons. Unknown risk is clearly shown as unavailable rather than a fabricated zero.</p><div className="landing-risk-scale"><span /><span /><span /></div></article>
              <article data-reveal style={{ '--reveal-delay': '90ms' } as React.CSSProperties}><div className="landing-finding-icon evidence"><Icon name="evidence" /></div><small>EVIDENCE REVIEW</small><h3>Findings tied to the trace</h3><p>Inspect VASP exposure and other rule-based findings alongside the addresses and transactions that support them.</p><div className="landing-evidence-tags"><span>VASP_EXPOSURE</span><span>PATH EVIDENCE</span></div></article>
            </div>
          </div>
        </section>

        <section id="reports" className="landing-section landing-report-section">
          <div className="landing-container landing-feature-split">
            <div className="landing-feature-copy" data-reveal><SectionBadge>Evidence-backed reports</SectionBadge><h2>Move from investigation to case file.</h2><p>Generate a real downloadable PDF for a completed investigation, combining the case context with graph and attribution evidence.</p><div className="landing-report-points"><span>✓ Completed investigation selector</span><span>✓ Findings and attribution summary</span><span>✓ Transaction evidence table</span><span>✓ Real backend PDF download</span></div></div>
            <div className="landing-report-preview" data-reveal><div className="landing-report-paper"><header><span className="landing-brand-mark"><Icon name="graph" size={16} /></span><div><b>INVESTIGATION REPORT</b><small>SIH 2026 · PS 26182</small></div></header><div className="landing-report-rule" /><h4>Executive Summary</h4><div className="landing-copy-lines"><i /><i /><i /></div><div className="landing-report-stats"><span><small>START</small><b>node-114</b></span><span><small>NEAREST VASP</small><b>node-10</b></span></div><h4>Transaction Evidence</h4><div className="landing-table-lines"><i /><i /><i /><i /></div><footer>Generated from simulated investigation data</footer></div><span className="landing-pdf-badge">PDF</span></div>
          </div>
        </section>

        <section className="landing-section landing-disclaimer-section">
          <div className="landing-container"><div className="landing-disclaimer" data-reveal><div className="landing-disclaimer-mark">i</div><div><SectionBadge>Current MVP scope</SectionBadge><h2>Transparent about what this demo is—and is not.</h2></div><ul><li><b>Simulated blockchain data</b><span>No live chain connectivity is enabled.</span></li><li><b>Deterministic logic</b><span>No active GNN or AI prediction is claimed.</span></li><li><b>Investigator demonstration</b><span>Built to demonstrate the complete evidence workflow.</span></li></ul></div></div>
        </section>

        <section className="landing-final-cta">
          <div className="landing-grid" /><div className="landing-container" data-reveal><span className="landing-kicker landing-kicker-light"><span /> READY TO TRACE <span /></span><h2>Follow the funds.<br /><em>Preserve the evidence.</em></h2><p>Start a simulated investigation or sign in to continue working with your existing cases.</p><div className="landing-hero-actions"><Link to={startPath} className="landing-button landing-button-primary">Start Investigation <span>→</span></Link><Link to={isSignedIn ? '/dashboard' : '/login'} className="landing-button landing-button-dark-outline">{isSignedIn ? 'Go to Dashboard' : 'Sign In'}</Link></div></div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-main"><div className="landing-footer-brand"><Link to="/" className="landing-brand" aria-label="LAPUS home"><BrandLogo className="landing-footer-logo" /></Link><p>Blockchain intelligence for clear, evidence-backed crypto fraud investigations.</p></div><div><strong>Platform</strong><a href="#how-it-works">How it works</a><a href="#capabilities">Capabilities</a><a href="#workflow">Workflow</a></div><div><strong>Access</strong><Link to="/login">Sign in</Link>{isSignedIn && <Link to="/dashboard">Dashboard</Link>}<Link to={startPath}>Start investigation</Link></div><div><strong>Demo scope</strong><span>Simulated data</span><span>Rule-based risk</span><span>Generated PDF reports</span></div></div>
        <div className="landing-container landing-footer-bottom"><span>Built for law-enforcement investigators. This demo currently runs on simulated data.</span><span>PS 26182 · Safer digital finance</span></div>
      </footer>
    </div>
  )
}
