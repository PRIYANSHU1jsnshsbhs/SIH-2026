import { Link } from 'react-router-dom'
import { useCases } from '@/hooks/useCases'
import { useAllInvestigations, useHighRiskFindings, useHighRiskFindingsCount } from '@/hooks/useInvestigation'
import { useAuthStore } from '@/stores/authStore'
import { LoadingState } from '@/components/common/LoadingState'
import { RiskBadge } from '@/components/risk/RiskBadge'
import clsx from 'clsx'

function StatCard({ label, value, tone }: { label: string; value: number | string; tone?: 'default' | 'risk' }) {
  return (
    <div className="rounded-lg bg-surface-1 px-4 py-3">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className={clsx('mt-1 text-2xl font-semibold tabular-nums', tone === 'risk' ? 'text-red-400' : 'text-text-primary')}>
        {value}
      </p>
    </div>
  )
}

/**
 * A compact, label-first breakdown — never color alone: every row pairs its
 * colored bar with a text status name, so it still reads correctly for a
 * color-blind viewer or in grayscale print.
 */
function StatusBreakdown({
  title,
  items,
}: {
  title: string
  items: { label: string; count: number; color: string }[]
}) {
  const total = items.reduce((s, i) => s + i.count, 0)
  return (
    <div className="rounded-lg bg-surface-1 p-4">
      <p className="text-xs uppercase tracking-wide text-text-tertiary mb-3">{title}</p>
      {total === 0 ? (
        <p className="text-sm text-text-tertiary">No data yet.</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
                  {item.label}
                </span>
                <span className="font-medium tabular-nums text-text-primary">{item.count}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(item.count / total) * 100}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const RECENT_CASES_LIMIT = 8

function ConsoleShortcut({ to, icon, title, description }: { to: string; icon: string; title: string; description: string }) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-lg bg-surface-1 p-4 hover:bg-surface-2"
    >
      <span className="text-lg text-accent" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-tertiary">{description}</p>
      </div>
    </Link>
  )
}

export function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role)
  const cases = useCases()
  const highRiskFindings = useHighRiskFindings(5)
  const highRiskCount = useHighRiskFindingsCount()
  const allInvestigations = useAllInvestigations()

  const openCases = cases.data?.cases.filter((c) => c.status !== 'closed').length ?? 0
  const activeInvestigations = cases.data?.cases.reduce((s, c) => s + c.investigations_count, 0) ?? 0
  const recentCases = cases.data?.cases.slice(0, RECENT_CASES_LIMIT) ?? []

  const priorityCounts = { low: 0, medium: 0, high: 0 }
  cases.data?.cases.forEach((c) => priorityCounts[c.priority]++)

  const investigationStatusCounts = { queued: 0, running: 0, completed: 0, cancelled: 0, failed: 0 }
  allInvestigations.data?.forEach((inv) => investigationStatusCounts[inv.status]++)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text-primary">Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/cases/new" className="text-xs px-3 py-1.5 rounded-md bg-btn-bg text-btn-fg hover:bg-accent-strong">
            + New Case
          </Link>
          <Link to="/reports/new" className="text-xs px-3 py-1.5 rounded-md bg-surface-2 text-text-primary hover:bg-surface-3">
            Generate Report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Open cases" value={openCases} />
        <StatCard label="Active investigations" value={activeInvestigations} />
        <StatCard label="High-risk findings" value={highRiskCount.data ?? 0} tone="risk" />
        <StatCard label="Investigations today" value={0} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <StatusBreakdown
          title="Cases by priority"
          items={[
            { label: 'High', count: priorityCounts.high, color: '#dc2626' },
            { label: 'Medium', count: priorityCounts.medium, color: '#d97706' },
            { label: 'Low', count: priorityCounts.low, color: '#16a34a' },
          ]}
        />
        <StatusBreakdown
          title="Investigations by status"
          items={[
            { label: 'Queued', count: investigationStatusCounts.queued, color: '#d97706' },
            { label: 'Running', count: investigationStatusCounts.running, color: '#2563eb' },
            { label: 'Completed', count: investigationStatusCounts.completed, color: '#16a34a' },
            { label: 'Cancelled', count: investigationStatusCounts.cancelled, color: '#6b7280' },
            { label: 'Failed', count: investigationStatusCounts.failed, color: '#dc2626' },
          ]}
        />
      </div>

      {(role === 'admin' || role === 'devops') && (
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-3">Console access</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {role === 'admin' && (
              <ConsoleShortcut
                to="/adminops"
                icon="◉"
                title="AdminOps"
                description="Case oversight, user management, system health"
              />
            )}
            {role === 'devops' && (
              <>
                <ConsoleShortcut
                  to="/devops"
                  icon="◆"
                  title="DevOps"
                  description="Indexers, job queue, worker logs"
                />
                <ConsoleShortcut
                  to="/backend"
                  icon="▧"
                  title="Backend"
                  description="API reference, data collections, entity links"
                />
              </>
            )}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary">Recent cases</h2>
          <Link to="/cases" className="text-xs text-accent hover:underline underline-offset-2">
            View all {cases.data?.total ?? ''} →
          </Link>
        </div>
        {cases.isLoading ? (
          <LoadingState />
        ) : (
          <div className="overflow-x-auto rounded-lg bg-surface-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-strong bg-surface-3 text-xs uppercase text-text-tertiary">
                  <th className="px-3 py-2 font-medium">Case</th>
                  <th className="px-3 py-2 font-medium">Priority</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Wallets</th>
                  <th className="px-3 py-2 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c) => (
                  <tr key={c.case_id} className="border-b border-border-strong/15 hover:bg-surface-3/60">
                    <td className="px-3 py-2">
                      <Link to={`/cases/${c.case_id}`} className="text-accent hover:underline underline-offset-2">
                        {c.title}
                      </Link>
                      <span className="ml-2 text-xs text-text-tertiary">{c.case_id}</span>
                    </td>
                    <td className="px-3 py-2">
                      <RiskBadge level={c.priority} />
                    </td>
                    <td className="px-3 py-2 capitalize text-text-secondary">{c.status.replace('_', ' ')}</td>
                    <td className="px-3 py-2 text-text-primary">{c.wallets_count}</td>
                    <td className="px-3 py-2 text-xs text-text-tertiary">{new Date(c.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">High-risk findings</h2>
        {highRiskFindings.isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-2">
            {highRiskFindings.data?.map((f) => (
              <div key={f.id} className="rounded-lg bg-surface-2 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RiskBadge level="high" />
                    <span className="text-xs text-text-tertiary">{f.case_title}</span>
                  </div>
                  <Link
                    to={`/investigations/${f.investigation_id}/findings`}
                    className="text-xs text-accent hover:underline underline-offset-2"
                  >
                    Open in findings →
                  </Link>
                </div>
                <p className="mt-2 text-sm text-text-primary">{f.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
