import type { GraphEdge, GraphNode, Finding } from '@/schemas/investigations'
import type { CaseStatus, CasePriority } from '@/schemas/cases'

export interface ReportSection {
  heading: string
  bodyHtml: string
}

export interface ReportContent {
  report_id: string
  format: 'pdf' | 'docx'
  generated_at: string
  case_id: string
  case_title: string
  case_status: CaseStatus
  case_priority: CasePriority
  investigation_id: string
  chain: string
  start_address: string
  sections: ReportSection[]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function shortAddr(addr: string): string {
  return addr.length > 16 ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : addr
}

export function buildTransactionTable(edges: GraphEdge[]): string {
  if (edges.length === 0) return '<p class="muted">No transactions were traced for this investigation.</p>'
  const rows = edges
    .map(
      (e) => `<tr>
        <td class="mono">${shortAddr(e.source)}</td>
        <td class="mono">${shortAddr(e.target)}</td>
        <td>${escapeHtml(e.amount ?? 'Not available')} ${escapeHtml(e.asset ?? '')}</td>
        <td class="mono">${shortAddr(e.tx_hash)}</td>
        <td>${e.timestamp ? new Date(e.timestamp).toLocaleString() : 'Not available'}</td>
      </tr>`,
    )
    .join('')
  return `<table><thead><tr><th>From</th><th>To</th><th>Amount</th><th>Tx Hash</th><th>Timestamp</th></tr></thead><tbody>${rows}</tbody></table>`
}

export function buildGraphSummary(nodes: GraphNode[], edges: GraphEdge[]): string {
  const seed = nodes.find((n) => n.is_seed)
  const terminal = nodes.filter((n) => n.type === 'vasp' || n.type === 'bridge')
  return `<p>The traced network contains <strong>${nodes.length}</strong> address${nodes.length === 1 ? '' : 'es'} connected by
    <strong>${edges.length}</strong> transfer${edges.length === 1 ? '' : 's'}.
    ${seed ? `Tracing started from <span class="mono">${shortAddr(seed.id)}</span>.` : ''}
    ${terminal.length > 0 ? `Funds reached ${terminal.length} exchange/bridge endpoint${terminal.length === 1 ? '' : 's'}: ${terminal.map((t) => escapeHtml(t.entity_name ?? t.label)).join(', ')}.` : ''}
  </p>`
}

export function buildRiskTable(nodes: GraphNode[]): string {
  if (nodes.length === 0) return '<p class="muted">No wallets were scored in this investigation.</p>'
  const sorted = [...nodes].sort((a, b) => (b.risk_score ?? -1) - (a.risk_score ?? -1))
  const rows = sorted
    .map(
      (n) => `<tr>
        <td class="mono">${shortAddr(n.id)}</td>
        <td>${escapeHtml(n.label)}</td>
        <td class="risk-${n.risk_level}">${n.risk_level.toUpperCase()}</td>
        <td>${n.risk_score == null ? 'Not available' : `${n.risk_score}/100`}</td>
      </tr>`,
    )
    .join('')
  return `<table><thead><tr><th>Address</th><th>Label</th><th>Risk</th><th>Score</th></tr></thead><tbody>${rows}</tbody></table>`
}

export function buildEntityTable(nodes: GraphNode[]): string {
  const attributed = nodes.filter((n) => n.entity_name)
  if (attributed.length === 0) return '<p class="muted">No addresses in this trace are attributed to a known entity or VASP.</p>'
  const rows = attributed
    .map(
      (n) => `<tr>
        <td class="mono">${shortAddr(n.id)}</td>
        <td>${escapeHtml(n.entity_name!)}</td>
        <td>${escapeHtml(n.type.toUpperCase())}</td>
      </tr>`,
    )
    .join('')
  return `<table><thead><tr><th>Address</th><th>Entity</th><th>Type</th></tr></thead><tbody>${rows}</tbody></table>`
}

export function buildFindingsList(findings: Finding[]): string {
  if (findings.length === 0) return '<p class="muted">No findings were surfaced for this investigation.</p>'
  return findings
    .map(
      (f) => `<div class="finding">
        <p class="finding-title"><span class="risk-${f.severity}">${f.severity.toUpperCase()}</span> ${escapeHtml(f.description)}</p>
        <p class="muted">Wallet: <span class="mono">${f.wallet ? shortAddr(f.wallet) : 'Not available'}</span> · Confidence: ${f.confidence == null ? 'Not available' : `${Math.round(f.confidence * 100)}%`}</p>
        <p class="muted">Evidence: ${f.evidence ? escapeHtml(f.evidence) : 'Not available'}</p>
      </div>`,
    )
    .join('')
}

/** Renders a self-contained, styled HTML document — the actual downloadable/viewable
 * artifact behind a report. There's no real PDF/DOCX generator in this mock build (that
 * would need a real backend); this is real, complete content a user can read, print, or
 * save as PDF from the browser, rather than a fake "not wired up" button. */
export function renderReportHtml(content: ReportContent): string {
  const sectionsHtml = content.sections
    .map((s) => `<section><h2>${escapeHtml(s.heading)}</h2>${s.bodyHtml}</section>`)
    .join('\n')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(content.case_title)} — ${escapeHtml(content.report_id)}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; max-width: 860px; margin: 40px auto; padding: 0 24px; color: #1a1d24; line-height: 1.5; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .subtitle { color: #6b7280; font-size: 13px; margin-top: 0; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0 28px; padding: 16px; background: #f4f5f7; border-radius: 8px; }
  .meta div p:first-child { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; margin: 0; }
  .meta div p:last-child { margin: 2px 0 0; font-weight: 600; }
  section { margin-bottom: 28px; }
  h2 { font-size: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; color: #6b7280; font-size: 11px; text-transform: uppercase; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
  td { padding: 6px 8px; border-bottom: 1px solid #f0f1f3; }
  .mono { font-family: ui-monospace, monospace; font-size: 12px; }
  .muted { color: #6b7280; font-size: 13px; }
  .finding { padding: 10px 0; border-bottom: 1px solid #f0f1f3; }
  .finding-title { margin: 0; font-weight: 500; }
  .risk-high { color: #b91c1c; font-weight: 700; }
  .risk-medium { color: #b45309; font-weight: 700; }
  .risk-low { color: #15803d; font-weight: 700; }
  .risk-unknown { color: #6b7280; font-weight: 700; }
  footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
  <h1>${escapeHtml(content.case_title)}</h1>
  <p class="subtitle">Evidence report · ${escapeHtml(content.report_id)} · generated ${new Date(content.generated_at).toLocaleString()}</p>

  <div class="meta">
    <div><p>Case</p><p>${escapeHtml(content.case_id)}</p></div>
    <div><p>Status</p><p>${escapeHtml(content.case_status.replace('_', ' '))}</p></div>
    <div><p>Priority</p><p>${escapeHtml(content.case_priority)}</p></div>
    <div><p>Investigation</p><p>${escapeHtml(content.investigation_id)}</p></div>
    <div><p>Chain</p><p>${escapeHtml(content.chain)}</p></div>
    <div><p>Seed address</p><p class="mono">${shortAddr(content.start_address)}</p></div>
  </div>

  ${sectionsHtml}

  <footer>
    Generated by the Crypto Fraud Attribution Platform against simulated data — no real blockchain, case, or
    personal data is connected. Every risk score and attribution above is a lead for an investigator to pursue,
    not a verdict.
  </footer>
</body>
</html>`
}
