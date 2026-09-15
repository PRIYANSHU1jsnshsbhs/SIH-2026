import { create } from 'zustand'
import type { Role, User } from '@/schemas/auth'

const TOKEN_STORAGE_KEY = 'crypto-fraud-platform.token'

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
  token: localStorage.getItem(TOKEN_STORAGE_KEY),
  user: null,
  isHydrating: true,
  setSession: (token, user) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    set({ token, user })
  },
  clearSession: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    set({ token: null, user: null })
  },
  setHydrating: (value) => set({ isHydrating: value }),
  hasRole: (role) => get().user?.role === role,
}))
