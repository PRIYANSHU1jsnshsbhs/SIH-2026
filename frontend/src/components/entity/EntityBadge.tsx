export function EntityBadge({ name, type }: { name: string; type: string }) {
  return (
    <span className="badge-entity inline-flex items-center gap-1.5 rounded-md bg-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-green border border-green/20 shadow-sm">
      {name}
      <span className="opacity-70">· {type}</span>
    </span>
  )
}
