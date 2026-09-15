import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RouteGuard } from '@/components/layout/RouteGuard'
import { LoginPage } from '@/pages/Login/LoginPage'
import { DashboardPage } from '@/pages/Dashboard/DashboardPage'
import { CasesPage } from '@/pages/Cases/CasesPage'
import { CreateCasePage } from '@/pages/Cases/CreateCasePage'
import { CaseDetailPage } from '@/pages/Cases/CaseDetailPage'
import { WalletPage } from '@/pages/Wallet/WalletPage'
import { StartInvestigationPage } from '@/pages/Investigation/StartInvestigationPage'
import { InvestigationProgressPage } from '@/pages/Investigation/InvestigationProgressPage'
import { InvestigationGraphPage } from '@/pages/Investigation/InvestigationGraphPage'
import { InvestigationFindingsPage } from '@/pages/Investigation/InvestigationFindingsPage'
import { ReportsPage } from '@/pages/Reports/ReportsPage'
import { GenerateReportPage } from '@/pages/Reports/GenerateReportPage'
import { ReportViewPage } from '@/pages/Reports/ReportViewPage'
import { AdminOpsConsole } from '@/consoles/AdminOpsConsole'
import { DevOpsConsole } from '@/consoles/DevOpsConsole'
import { BackendConsole } from '@/consoles/BackendConsole'
import { TerminalCommandsPage } from '@/pages/TerminalCommands/TerminalCommandsPage'
import { AboutPage } from '@/pages/About/AboutPage'
import { ContactPage } from '@/pages/Contact/ContactPage'
import { InvestigationExplorerPage } from '@/pages/Explorer/InvestigationExplorerPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RouteGuard>
            <AppShell />
          </RouteGuard>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/new" element={<CreateCasePage />} />
        <Route path="/cases/:caseId" element={<CaseDetailPage />} />

        <Route path="/wallets/:chain/:address" element={<WalletPage />} />

        <Route path="/explorer" element={<InvestigationExplorerPage />} />

        <Route path="/investigations/new" element={<StartInvestigationPage />} />
        <Route path="/investigations/:investigationId/progress" element={<InvestigationProgressPage />} />
        <Route path="/investigations/:investigationId/graph" element={<InvestigationGraphPage />} />
        <Route path="/investigations/:investigationId/findings" element={<InvestigationFindingsPage />} />

        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/new" element={<GenerateReportPage />} />
        <Route path="/reports/:reportId" element={<ReportViewPage />} />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terminal-commands" element={<TerminalCommandsPage />} />

        <Route
          path="/adminops"
          element={
            <RouteGuard requireRole="admin">
              <AdminOpsConsole />
            </RouteGuard>
          }
        />
        <Route
          path="/devops"
          element={
            <RouteGuard requireRole="devops">
              <DevOpsConsole />
            </RouteGuard>
          }
        />
        <Route
          path="/backend"
          element={
            <RouteGuard requireRole="devops">
              <BackendConsole />
            </RouteGuard>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
