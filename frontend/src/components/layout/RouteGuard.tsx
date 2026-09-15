import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { Role } from '@/schemas/auth'
import { LoadingState } from '@/components/common/LoadingState'

/**
 * Gate for authenticated (and optionally role-restricted) routes.
 *
 * SECURITY NOTE: this check runs entirely in the browser. It is enough to
 * keep AdminOps/DevOps out of casual reach (they are also unlisted in the
 * sidebar), but it is NOT a substitute for server-side authorization. Once a
 * real backend exists, every /adminops and /devops API call must also verify
 * the caller's role there — a user can always open devtools and bypass any
 * client-side check.
 */
export function RouteGuard({ children, requireRole }: { children: ReactNode; requireRole?: Role }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isHydrating = useAuthStore((s) => s.isHydrating)
  const location = useLocation()

  if (isHydrating) return <LoadingState label="Checking session…" />

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
