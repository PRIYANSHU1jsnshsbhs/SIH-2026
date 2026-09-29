import clsx from 'clsx'
import { LoadingIcon } from './LoadingIcon'

export function LoadingState({ label = 'Loading…', fullscreen = false }: { label?: string; fullscreen?: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'flex items-center justify-center gap-3 border border-border-c/60 bg-surface-1/55 px-5 py-8 text-sm font-medium text-text-secondary backdrop-blur-sm',
        fullscreen ? 'h-screen w-full flex-col rounded-none border-0 bg-bg-app/80' : 'my-2 w-full rounded-xl',
      )}
    >
      <LoadingIcon size={fullscreen ? 'large' : 'medium'} />
      <span>{label}</span>
    </div>
  )
}
