import type { GraphNode } from '@/schemas/investigations'

export type EntityType = GraphNode['type'] | 'start'

export const ENTITY_ICON_PATHS: Record<EntityType, string> = {
  start: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  wallet: '<path d="M4 7.5h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3v-10a3 3 0 0 1 3-3h12v4"/><path d="M16 12h5v4h-5a2 2 0 0 1 0-4Z"/>',
  vasp: '<path d="M3 9h18L12 3 3 9Z"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18M2 18h20"/>',
  exchange: '<path d="M3 9h18L12 3 3 9Z"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18M2 18h20"/>',
  bridge: '<path d="M3 18h18M5 18v-4a7 7 0 0 1 14 0v4M8 18v-4a4 4 0 0 1 8 0v4M3 21h18"/>',
  mixer: '<path d="M4 4h16l-6 7v6l-4 3v-9L4 4Z"/><path d="M8 7h8M9.5 10h5"/>',
  contract: '<path d="M7 3h7l4 4v14H7V3Z"/><path d="M14 3v5h5M10 12l-2 2 2 2M15 12l2 2-2 2M13.5 11l-3 6"/>',
  unknown: '<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.2 1-1.2 1.8M12 17h.01"/>',
}

export function normalizeEntityType(type: GraphNode['type'], isSeed = false): EntityType {
  return isSeed ? 'start' : type
}

export function graphEntityIconDataUri(type: GraphNode['type'], isSeed = false): string {
  const paths = ENTITY_ICON_PATHS[normalizeEntityType(type, isSeed)]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
