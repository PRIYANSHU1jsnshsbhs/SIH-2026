import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  variant: 'success' | 'error' | 'info'
}

const THEME_STORAGE_KEY = 'crypto-fraud-platform.theme'
type Theme = 'dark' | 'light' | 'blue'
const THEME_ORDER: Theme[] = ['dark', 'light', 'blue']

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' || stored === 'blue' ? stored : 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('light', theme === 'light')
  document.documentElement.classList.toggle('blue', theme === 'blue')
}

interface UiState {
  theme: Theme
  cycleTheme: () => void
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
  cycleTheme: () => {
    const currentIndex = THEME_ORDER.indexOf(get().theme)
    const next = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length]
    localStorage.setItem(THEME_STORAGE_KEY, next)
    applyTheme(next)
    set({ theme: next })
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
