import { create } from 'zustand'
import type { Role, User } from '@/schemas/auth'
import { AUTH_TOKEN_KEY } from '@/api/client'

const LEGACY_TOKEN_KEY = 'crypto-fraud-platform.token'
localStorage.removeItem(LEGACY_TOKEN_KEY)

interface AuthState {
  token: string | null
  user: User | null
  isHydrating: boolean
  setSession: (token: string, user: User) => void
  clearSession: () => void
  setHydrating: (value: boolean) => void
  hasRole: (role: Role) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(AUTH_TOKEN_KEY),
  user: null,
  isHydrating: true,
  setSession: (token, user) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    set({ token, user })
  },
  clearSession: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    set({ token: null, user: null })
  },
  setHydrating: (value) => set({ isHydrating: value }),
  hasRole: (role) => get().user?.role === role,
}))
