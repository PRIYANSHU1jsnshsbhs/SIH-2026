import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMe, login } from '@/api/auth'
import type { LoginInput } from '@/schemas/auth'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

/** Rehydrates the session from a stored token on app start. */
export function useHydrateSession() {
  const token = useAuthStore((s) => s.token)
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.clearSession)
  const setHydrating = useAuthStore((s) => s.setHydrating)

  useEffect(() => {
    let cancelled = false
    if (!token) {
      setHydrating(false)
      return
    }
    getMe()
      .then((user) => {
        if (!cancelled) setSession(token, user)
      })
      .catch(() => {
        if (!cancelled) clearSession()
      })
      .finally(() => {
        if (!cancelled) setHydrating(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  const setConsoleOpen = useUiStore((s) => s.setConsoleOpen)
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    // consoleOpen lives in a module-level store that survives a plain
    // client-side navigation, so without this a console left open in one
    // session (or one role) would render already-open for whoever logs in
    // next in the same tab, regardless of their role.
    onSuccess: (data) => {
      setSession(data.accessToken, data.user)
      setConsoleOpen(false)
    },
  })
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const setConsoleOpen = useUiStore((s) => s.setConsoleOpen)
  const queryClient = useQueryClient()
  return () => {
    clearSession()
    setConsoleOpen(false)
    queryClient.clear()
  }
}

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => getMe(),
    enabled: !!token && !user,
    retry: false,
  })
  return user ?? query.data ?? null
}
