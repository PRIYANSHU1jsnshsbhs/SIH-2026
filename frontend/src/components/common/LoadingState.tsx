export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-10 justify-center text-text-secondary text-sm">
      <span className="h-4 w-4 rounded-full border-2 border-border-strong border-t-text-secondary animate-spin" />
      {label}
    </div>
  )
}
