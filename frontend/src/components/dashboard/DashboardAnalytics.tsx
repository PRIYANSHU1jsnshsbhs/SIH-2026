import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import type { CaseSummary } from '@/schemas/cases'
import type { InvestigationSummary } from '@/schemas/investigations'
import { useUiStore } from '@/stores/uiStore'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
)

interface DashboardAnalyticsProps {
  cases: CaseSummary[]
  investigations: InvestigationSummary[]
}

interface ChartCardProps {
  title: string
  description: string
  children: React.ReactNode
  className?: string
  empty?: boolean
}

const PRIORITY_COLORS = ['#8A93A3', '#D89A10', '#E56B26', '#D14343']
const STATUS_COLORS = ['#D89A10', '#102A4C', '#1F8A4D', '#7B8798', '#D14343']

function ChartCard({ title, description, children, className = '', empty = false }: ChartCardProps) {
  return (
    <article className={`rounded-xl border border-border-c bg-surface-1 p-5 shadow-sm ${className}`}>
      <div className="mb-5">
        <h3 className="text-sm font-bold text-text-primary">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{description}</p>
      </div>
      {empty ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border-c bg-surface-2/40 px-6 text-center text-sm text-text-tertiary">
          No data available for this analysis yet.
        </div>
      ) : (
        children
      )}
    </article>
  )
}

function AnalysisMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border-c bg-surface-1 p-4 shadow-sm">
      <span className="absolute inset-y-0 left-0 w-1 bg-saffron" aria-hidden />
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-tertiary">{detail}</p>
    </div>
  )
}

function shortCaseLabel(item: CaseSummary) {
  const label = item.case_number || item.title
  return label.length > 18 ? `${label.slice(0, 17)}…` : label
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(date)
}

export function DashboardAnalytics({ cases, investigations }: DashboardAnalyticsProps) {
  const theme = useUiStore((state) => state.theme)
  const dark = theme === 'dark'
  const textColor = dark ? '#DDE5F0' : '#5B667A'
  const gridColor = dark ? 'rgba(221, 229, 240, 0.10)' : 'rgba(22, 35, 59, 0.08)'
  const tooltipBackground = dark ? '#152B48' : '#0B1F3A'

  const completed = investigations.filter((item) => item.status === 'completed')
  const failed = investigations.filter((item) => item.status === 'failed')
  const totalNodes = investigations.reduce((sum, item) => sum + item.node_count, 0)
  const totalEdges = investigations.reduce((sum, item) => sum + item.edge_count, 0)
  const completionRate = investigations.length > 0
    ? `${Math.round((completed.length / investigations.length) * 100)}%`
    : 'Not available'
  const averageNodes = investigations.length > 0
    ? (totalNodes / investigations.length).toFixed(1)
    : 'Not available'
  const averageEdges = investigations.length > 0
    ? (totalEdges / investigations.length).toFixed(1)
    : 'Not available'
  const failureRate = investigations.length > 0
    ? `${Math.round((failed.length / investigations.length) * 100)}%`
    : 'Not available'

  const priorityValues = ['low', 'medium', 'high', 'critical'].map(
    (priority) => cases.filter((item) => item.priority === priority).length,
  )
  const statusValues = ['queued', 'running', 'completed', 'cancelled', 'failed'].map((status) => {
    if (status === 'queued') {
      return investigations.filter((item) => ['queued', 'pending', 'initializing'].includes(item.status)).length
    }
    return investigations.filter((item) => item.status === status).length
  })

  const activityDays = Array.from({ length: 14 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (13 - index))
    return date
  })
  const activityValues = activityDays.map((day) => {
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)
    return investigations.filter((item) => {
      const started = new Date(item.started_at)
      return started >= day && started < nextDay
    }).length
  })

  const busiestCases = [...cases]
    .sort((a, b) => b.investigations_count - a.investigations_count || b.wallets_count - a.wallets_count)
    .slice(0, 7)

  const commonLegend = {
    position: 'bottom' as const,
    labels: {
      color: textColor,
      usePointStyle: true,
      pointStyle: 'circle' as const,
      padding: 16,
      boxWidth: 8,
      font: { size: 11, weight: 600 as const },
    },
  }
  const commonTooltip = {
    backgroundColor: tooltipBackground,
    titleColor: '#FFFFFF',
    bodyColor: '#FFFFFF',
    padding: 12,
    cornerRadius: 8,
    displayColors: true,
  }

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    animation: { duration: 750 },
    plugins: {
      legend: commonLegend,
      tooltip: commonTooltip,
    },
  }

  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    animation: { duration: 750 },
    plugins: {
      legend: { display: false },
      tooltip: commonTooltip,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: textColor, precision: 0 },
        grid: { color: gridColor },
        border: { display: false },
      },
    },
  }

  const workloadOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 750 },
    plugins: {
      legend: commonLegend,
      tooltip: {
        ...commonTooltip,
        callbacks: {
          label: (context: TooltipItem<'bar'>) => ` ${context.dataset.label}: ${context.parsed.x}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: textColor, precision: 0 },
        grid: { color: gridColor },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 11, weight: 600 } },
        border: { display: false },
      },
    },
  }

  return (
    <section aria-labelledby="operational-analytics-title">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-saffron">Live case intelligence</p>
          <h2 id="operational-analytics-title" className="mt-1 text-lg font-bold text-text-primary">
            Operational Analytics
          </h2>
        </div>
        <p className="text-xs text-text-tertiary">Calculated from the cases and investigations currently loaded</p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalysisMetric label="Completion rate" value={completionRate} detail={`${completed.length} of ${investigations.length} traces completed`} />
        <AnalysisMetric label="Average trace size" value={averageNodes} detail="nodes discovered per investigation" />
        <AnalysisMetric label="Average connections" value={averageEdges} detail="edges discovered per investigation" />
        <AnalysisMetric label="Failure rate" value={failureRate} detail={`${failed.length} failed investigation${failed.length === 1 ? '' : 's'}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Investigation activity"
          description="New investigations started during the last 14 days"
          className="xl:col-span-2"
          empty={investigations.length === 0}
        >
          <div className="h-64">
            <Line
              data={{
                labels: activityDays.map(formatDay),
                datasets: [{
                  label: 'Investigations started',
                  data: activityValues,
                  borderColor: '#F57C00',
                  backgroundColor: dark ? 'rgba(245, 124, 0, 0.18)' : 'rgba(245, 124, 0, 0.12)',
                  pointBackgroundColor: '#F57C00',
                  pointBorderColor: dark ? '#152B48' : '#FFFFFF',
                  pointBorderWidth: 2,
                  pointRadius: 3,
                  pointHoverRadius: 5,
                  borderWidth: 2.5,
                  fill: true,
                  tension: 0.35,
                }],
              }}
              options={lineOptions}
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Investigation outcomes"
          description="Current status distribution across all traces"
          empty={investigations.length === 0}
        >
          <div className="relative h-64">
            <Doughnut
              data={{
                labels: ['Queued', 'Running', 'Completed', 'Cancelled', 'Failed'],
                datasets: [{
                  data: statusValues,
                  backgroundColor: STATUS_COLORS,
                  borderColor: dark ? '#101F34' : '#FFFFFF',
                  borderWidth: 3,
                  hoverOffset: 7,
                }],
              }}
              options={doughnutOptions}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8" aria-hidden>
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums text-text-primary">{investigations.length}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">traces</p>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Case priority mix"
          description="Investigative workload grouped by assigned priority"
          empty={cases.length === 0}
        >
          <div className="relative h-64">
            <Doughnut
              data={{
                labels: ['Low', 'Medium', 'High', 'Critical'],
                datasets: [{
                  data: priorityValues,
                  backgroundColor: PRIORITY_COLORS,
                  borderColor: dark ? '#101F34' : '#FFFFFF',
                  borderWidth: 3,
                  hoverOffset: 7,
                }],
              }}
              options={doughnutOptions}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8" aria-hidden>
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums text-text-primary">{cases.length}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">cases</p>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Case workload"
          description="Wallet and investigation volume for the seven busiest cases"
          className="xl:col-span-2"
          empty={busiestCases.length === 0}
        >
          <div className="h-64">
            <Bar
              data={{
                labels: busiestCases.map(shortCaseLabel),
                datasets: [
                  {
                    label: 'Wallets',
                    data: busiestCases.map((item) => item.wallets_count),
                    backgroundColor: dark ? 'rgba(82, 139, 203, 0.72)' : 'rgba(16, 42, 76, 0.82)',
                    borderRadius: 5,
                    borderSkipped: false,
                  },
                  {
                    label: 'Investigations',
                    data: busiestCases.map((item) => item.investigations_count),
                    backgroundColor: '#F57C00',
                    borderRadius: 5,
                    borderSkipped: false,
                  },
                ],
              }}
              options={workloadOptions}
            />
          </div>
        </ChartCard>
      </div>
    </section>
  )
}
