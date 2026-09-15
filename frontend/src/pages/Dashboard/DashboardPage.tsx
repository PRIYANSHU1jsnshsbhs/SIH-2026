import { Link } from 'react-router-dom'
import { useCases } from '@/hooks/useCases'
import { useAllInvestigations, useHighRiskFindings, useHighRiskFindingsCount } from '@/hooks/useInvestigation'
import { useAuthStore } from '@/stores/authStore'
import { LoadingState } from '@/components/common/LoadingState'
import { RiskBadge } from '@/components/risk/RiskBadge'
import clsx from 'clsx'

function StatCard({ label, value, tone }: { label: string; value: number | string; tone?: 'default' | 'risk' }) {
  return (
    <div className="rounded-lg bg-surface-1 px-4 py-4 border border-border-c shadow-sm">
      <p className="text-xs text-text-secondary uppercase tracking-wide font-medium">{label}</p>
      <p className={clsx('mt-2 text-3xl font-bold tabular-nums', tone === 'risk' ? 'text-red' : 'text-text-primary')}>
        {value}
      </p>
    </div>
  )
}

function StatusBreakdown({
  title,
  items,
}: {
  title: string
  items: { label: string; count: number; color: string }[]
}) {
  const total = items.reduce((s, i) => s + i.count, 0)
  return (
    <div className="rounded-lg bg-surface-1 p-5 border border-border-c shadow-sm">
      <p className="text-xs uppercase tracking-wider font-semibold text-text-secondary mb-4">{title}</p>
      {total === 0 ? (
        <p className="text-sm text-text-tertiary">No data yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-text-primary font-medium">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
                  {item.label}
                </span>
                <span className="font-semibold tabular-nums text-text-primary">{item.count}</span>
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
      className="flex items-start gap-4 rounded-lg bg-surface-1 p-5 border border-border-c shadow-sm hover:border-saffron hover:shadow-md transition-all"
    >
      <span className="text-2xl text-text-primary" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary mt-1">{description}</p>
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
  const activeInvestigations = allInvestigations.data?.filter(inv => inv.status === 'queued' || inv.status === 'running').length ?? 0
  const investigationsToday = allInvestigations.data?.filter(inv => new Date(inv.started_at).toDateString() === new Date().toDateString()).length ?? 0
  const recentCases = cases.data?.cases.slice(0, RECENT_CASES_LIMIT) ?? []

  const priorityCounts = { low: 0, medium: 0, high: 0 }
  cases.data?.cases.forEach((c) => priorityCounts[c.priority]++)

  const investigationStatusCounts = { queued: 0, running: 0, completed: 0, cancelled: 0, failed: 0 }
  allInvestigations.data?.forEach((inv) => investigationStatusCounts[inv.status]++)

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between border-b border-border-c pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Financial Intelligence Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Lapsus Blockchain Investigation & Risk Attribution</p>
        </div>
        <div className="flex gap-3">
          <Link to="/reports/new" className="text-sm font-medium px-4 py-2 rounded-md bg-surface-1 text-text-primary border border-border-strong hover:bg-surface-2 transition-colors shadow-sm">
            Generate Report
          </Link>
          <Link to="/cases/new" className="text-sm font-medium px-4 py-2 rounded-md bg-saffron text-white hover:bg-accent-strong transition-colors shadow-sm">
            + New Case
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Open cases" value={openCases} />
        <StatCard label="Active investigations" value={activeInvestigations} />
        <StatCard label="High-risk findings" value={highRiskCount.data ?? 0} tone="risk" />
        <StatCard label="Investigations today" value={investigationsToday} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatusBreakdown
          title="Cases by priority"
          items={[
            { label: 'High Priority', count: priorityCounts.high, color: '#D14343' },
            { label: 'Medium Priority', count: priorityCounts.medium, color: '#D89A10' },
            { label: 'Low Priority', count: priorityCounts.low, color: '#1F8A4D' },
          ]}
        />
        <StatusBreakdown
          title="Investigations by status"
          items={[
            { label: 'Queued', count: investigationStatusCounts.queued, color: '#D89A10' },
            { label: 'Running', count: investigationStatusCounts.running, color: '#102A4C' },
            { label: 'Completed', count: investigationStatusCounts.completed, color: '#1F8A4D' },
            { label: 'Cancelled', count: investigationStatusCounts.cancelled, color: '#7B8798' },
            { label: 'Failed', count: investigationStatusCounts.failed, color: '#D14343' },
          ]}
        />
      </div>

      {(role === 'admin' || role === 'devops') && (
        <section>
          <h2 className="text-base font-bold text-text-primary mb-4">Console Access</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-text-primary">Recent Cases</h2>
          <Link to="/cases" className="text-sm font-medium text-saffron hover:underline underline-offset-2">
            View all {cases.data?.total ?? ''} →
          </Link>
        </div>
        {cases.isLoading ? (
          <LoadingState />
        ) : (
          <div className="overflow-x-auto rounded-lg bg-surface-1 border border-border-c shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-c bg-surface-2 text-xs uppercase text-text-secondary tracking-wide">
                  <th className="px-4 py-3 font-semibold">Case</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Wallets</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c) => (
                  <tr key={c.case_id} className="border-b border-border-c last:border-0 hover:bg-bg-app transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/cases/${c.case_id}`} className="font-semibold text-text-primary hover:text-saffron">
                        {c.title}
                      </Link>
                      <span className="ml-2 text-xs font-mono text-text-tertiary">{c.case_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={c.priority} />
                    </td>
                    <td className="px-4 py-3 capitalize text-text-secondary font-medium">{c.status.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-text-primary font-medium">{c.wallets_count}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{new Date(c.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-bold text-text-primary mb-4">High-Risk Findings</h2>
        {highRiskFindings.isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-3">
            {highRiskFindings.data?.map((f) => (
              <div key={f.id} className="rounded-lg bg-surface-1 px-5 py-4 border border-border-c shadow-sm hover:border-red-soft transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RiskBadge level="high" />
                    <span className="text-sm font-semibold text-text-primary">{f.case_title}</span>
                  </div>
                  <Link
                    to={`/investigations/${f.investigation_id}/findings`}
                    className="text-sm font-medium text-saffron hover:underline underline-offset-2"
                  >
                    Open in findings →
                  </Link>
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
