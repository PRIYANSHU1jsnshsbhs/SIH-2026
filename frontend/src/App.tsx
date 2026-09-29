import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { useHydrateSession } from '@/hooks/useAuth'

import { useAuthStore } from '@/stores/authStore'
import { LoadingState } from '@/components/common/LoadingState'

function SessionBoundary() {
  useHydrateSession()
  const isHydrating = useAuthStore((s) => s.isHydrating)

  if (isHydrating) {
    return <LoadingState label="Loading session…" fullscreen />
  }

  return <AppRouter />
}

export default function App() {
  return (
    <AppProviders>
      <SessionBoundary />
    </AppProviders>
  )
}
