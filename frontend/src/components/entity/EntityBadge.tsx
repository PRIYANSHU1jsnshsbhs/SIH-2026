export function EntityBadge({ name, type }: { name: string; type: string }) {
  return (
    <span className="badge-entity inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
      {name}
      <span className="opacity-60">· {type}</span>
    </span>
  )
}
