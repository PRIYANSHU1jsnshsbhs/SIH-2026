import type { GraphNode } from '@/schemas/investigations'
import { ENTITY_ICON_PATHS, normalizeEntityType } from './entityTypeIcons'

export function EntityTypeIcon({
  type,
  isSeed = false,
  className = 'h-4 w-4',
}: {
  type: GraphNode['type']
  isSeed?: boolean
  className?: string
}) {
  const paths = ENTITY_ICON_PATHS[normalizeEntityType(type, isSeed)]
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  )
}
