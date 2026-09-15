import { useUiStore } from '@/stores/uiStore'
import clsx from 'clsx'
import { useEffect } from 'react'

export function ToastHost() {
  const toasts = useUiStore((s) => s.toasts)
  const dismissToast = useUiStore((s) => s.dismissToast)

  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => dismissToast(t.id), 4000))
    return () => timers.forEach(clearTimeout)
  }, [toasts, dismissToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'rounded-md px-4 py-2 text-sm shadow-lg backdrop-blur',
            t.variant === 'success' && 'bg-green-950/90 text-green-300',
            t.variant === 'error' && 'bg-red-950/90 text-red-300',
            t.variant === 'info' && 'bg-surface-2/90 text-text-primary',
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
