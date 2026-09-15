import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  variant: 'success' | 'error' | 'info'
}

const THEME_STORAGE_KEY = 'crypto-fraud-platform.theme'
type Theme = 'dark' | 'light'

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'dark') return 'dark'
  if (stored === 'light') return 'light'
  
  // Default to system preference if no stored value
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

function applyTheme(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
    // Optional: Keep classes if required elsewhere, but data-theme is primary
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }
}

interface UiState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  currentCaseId: string | null
  currentInvestigationId: string | null
  setCurrentContext: (ctx: { caseId?: string | null; investigationId?: string | null }) => void
  consoleOpen: boolean
  setConsoleOpen: (open: boolean) => void
  toasts: Toast[]
  pushToast: (message: string, variant?: Toast['variant']) => void
  dismissToast: (id: string) => void
}

const initialTheme = readStoredTheme()
applyTheme(initialTheme)

export const useUiStore = create<UiState>((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    localStorage.setItem(THEME_STORAGE_KEY, next)
    applyTheme(next)
    set({ theme: next })
  },
  setTheme: (theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  currentCaseId: null,
  currentInvestigationId: null,
  setCurrentContext: (ctx) =>
    set((s) => ({
      currentCaseId: ctx.caseId !== undefined ? ctx.caseId : s.currentCaseId,
      currentInvestigationId: ctx.investigationId !== undefined ? ctx.investigationId : s.currentInvestigationId,
    })),
  consoleOpen: false,
  setConsoleOpen: (open) => set({ consoleOpen: open }),
  toasts: [],
  pushToast: (message, variant = 'info') =>
    set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), message, variant }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
