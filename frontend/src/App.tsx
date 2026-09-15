import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { useHydrateSession } from '@/hooks/useAuth'

function SessionBoundary() {
  useHydrateSession()
  return <AppRouter />
}

export default function App() {
  return (
    <AppProviders>
      <SessionBoundary />
    </AppProviders>
  )
}
