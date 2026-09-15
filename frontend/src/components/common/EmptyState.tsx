import type { ReactNode } from 'react'

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center border border-dashed border-border-c rounded-lg">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description && <p className="text-xs text-text-tertiary max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
