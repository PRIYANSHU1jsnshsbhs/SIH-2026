import { useEffect, useRef } from 'react'
import cytoscape, { type Core, type Css } from 'cytoscape'
// @ts-expect-error - no bundled types for this layout extension
import coseBilkent from 'cytoscape-cose-bilkent'
import type { GraphEdge, GraphNode } from '@/schemas/investigations'
import { useUiStore } from '@/stores/uiStore'

cytoscape.use(coseBilkent)

const RISK_COLOR: Record<string, string> = {
  high: '#dc2626',
  medium: '#d97706',
  low: '#16a34a',
  unknown: '#6b7280',
}

const TYPE_SHAPE: Record<string, Css.NodeShape> = {
  wallet: 'ellipse',
  contract: 'round-rectangle',
  vasp: 'round-tag',
  bridge: 'diamond',
  mixer: 'hexagon',
}

/** Bigger = more investigatively important: the seed and the terminal entity stand out from the layering hops in between. */
function baseSize(el: cytoscape.NodeSingular): number {
  if (el.data('is_seed')) return 30
  if (el.data('type') === 'vasp') return 27
  if (el.data('type') === 'mixer' || el.data('type') === 'bridge') return 24
  return 20
}

export function GraphCanvas({
  nodes,
  edges,
  onNodeSelect,
  onEdgeSelect,
}: {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onNodeSelect: (node: GraphNode) => void
  onEdgeSelect: (edge: GraphEdge) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const theme = useUiStore((s) => s.theme)

  useEffect(() => {
    if (!containerRef.current) return

    // Read the resolved --graph-bg for the active theme so label backgrounds
    // (set as plain hex on the Cytoscape stylesheet, not CSS) still blend into
    // the canvas instead of going stale if the palette changes.
    const graphBg = getComputedStyle(containerRef.current).getPropertyValue('--graph-bg').trim() || '#0a0b0f'

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...nodes.map((n) => ({
          data: {
            id: n.id,
            label: n.entity_name ?? n.label,
            risk_level: n.risk_level,
            type: n.type,
            is_seed: n.is_seed ?? false,
          },
        })),
        ...edges.map((e) => ({
          data: {
            id: e.id,
            source: e.source,
            target: e.target,
            label: `${e.amount} ${e.asset}`,
          },
        })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (el) => RISK_COLOR[el.data('risk_level')] ?? RISK_COLOR.unknown,
            shape: (el) => TYPE_SHAPE[el.data('type')] ?? 'ellipse',
            label: 'data(label)',
            color: '#e5e7eb',
            'font-size': 8,
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'text-max-width': '70px',
            'text-wrap': 'ellipsis',
            'text-background-color': graphBg,
            'text-background-opacity': 0.85,
            'text-background-shape': 'roundrectangle',
            'text-background-padding': '3px',
            width: baseSize,
            height: baseSize,
            'border-width': (el) => (el.data('is_seed') ? 2 : 0),
            'border-color': '#60a5fa',
            'transition-property': 'border-color, border-width, opacity',
            'transition-duration': 120,
            'transition-timing-function': 'ease-out',
          },
        },
        {
          // No permanent label: several edges converging on one hub node would
          // otherwise stack their amount labels on top of each other. The amount
          // shows on hover/selection instead (see below), and on click in the
          // transaction detail drawer.
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#3f4453',
            'target-arrow-color': '#3f4453',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.9,
            'curve-style': 'bezier',
            'transition-property': 'width, line-color, target-arrow-color, opacity',
            'transition-duration': 120,
            'transition-timing-function': 'ease-out',
          },
        },
        {
          selector: 'node:selected',
          style: { 'border-width': 2, 'border-color': '#f8fafc' },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#f8fafc',
            'target-arrow-color': '#f8fafc',
            width: 2,
            label: 'data(label)',
            'font-size': 9,
            color: '#e8eaee',
            'text-background-color': graphBg,
            'text-background-opacity': 0.85,
            'text-background-shape': 'roundrectangle',
            'text-background-padding': '2px',
          },
        },
        {
          // Hovering a node/edge gives just that element (and its direct
          // connections) a brighter outline — nothing else moves or fades.
          selector: 'node.hovered',
          style: { 'border-width': 2, 'border-color': '#e8eaee' },
        },
        {
          selector: 'edge.hovered',
          style: {
            width: 2,
            'line-color': '#e8eaee',
            'target-arrow-color': '#e8eaee',
            label: 'data(label)',
            'font-size': 9,
            color: '#e8eaee',
            'text-background-color': graphBg,
            'text-background-opacity': 0.85,
            'text-background-shape': 'roundrectangle',
            'text-background-padding': '2px',
          },
        },
      ],
      wheelSensitivity: 0.2,
      minZoom: 0.3,
      maxZoom: 1.6,
    })

    // A force-directed layout only spaces nodes apart via their edges, so any
    // node left with no surviving edges (e.g. filtered out by the min-value
    // slider) has nothing pulling it away from the others and they end up
    // overlapping. Once the layout settles, drop those isolated nodes onto a
    // tidy hex-offset grid beside the connected cluster instead.
    //
    // The listener must be registered before `.run()` is called, not after —
    // with `animate: false` cose-bilkent completes (and fires `layoutstop`)
    // synchronously, so attaching it afterward would always miss the event.
    cy.one('layoutstop', () => {
      const isolated = cy.nodes().filter((n) => n.connectedEdges().length === 0)
      if (isolated.length === 0) return

      const connected = cy.nodes().filter((n) => n.connectedEdges().length > 0)
      // Wider than the 70px label max-width so two neighboring labels can
      // never touch, even when both are truncated to their full length.
      const cellW = 96
      const cellH = 64
      const bb = connected.length > 0 ? connected.boundingBox() : null
      const originX = bb ? bb.x2 + cellW : 0
      const originY = bb ? bb.y1 : 0

      const cols = Math.max(1, Math.ceil(Math.sqrt(isolated.length)))
      isolated.forEach((node, i) => {
        const row = Math.floor(i / cols)
        const col = i % cols
        const hexOffset = row % 2 === 1 ? cellW / 2 : 0
        node.position({ x: originX + col * cellW + hexOffset, y: originY + row * cellH * 0.87 })
      })

      cy.fit(undefined, 50)
    })

    cy.layout({
      name: 'cose-bilkent',
      animate: false,
      nodeRepulsion: 9000,
      idealEdgeLength: 150,
      componentSpacing: 120,
      fit: true,
      padding: 60,
    } as never).run()

    function focusNode(node: cytoscape.NodeSingular) {
      node.addClass('hovered')
      node.connectedEdges().addClass('hovered')
    }
    function focusEdge(edge: cytoscape.EdgeSingular) {
      edge.addClass('hovered')
      edge.connectedNodes().addClass('hovered')
    }
    function clearFocus() {
      cy.elements().removeClass('hovered')
    }

    cy.on('mouseover', 'node', (evt) => {
      containerRef.current!.style.cursor = 'pointer'
      focusNode(evt.target)
    })
    cy.on('mouseout', 'node', () => {
      containerRef.current!.style.cursor = 'default'
      clearFocus()
    })
    cy.on('mouseover', 'edge', (evt) => {
      containerRef.current!.style.cursor = 'pointer'
      focusEdge(evt.target)
    })
    cy.on('mouseout', 'edge', () => {
      containerRef.current!.style.cursor = 'default'
      clearFocus()
    })

    cy.on('tap', 'node', (evt) => {
      const id = evt.target.id()
      const node = nodes.find((n) => n.id === id)
      if (node) onNodeSelect(node)
    })

    cy.on('tap', 'edge', (evt) => {
      const id = evt.target.id()
      const edge = edges.find((e) => e.id === id)
      if (edge) onEdgeSelect(edge)
    })

    cyRef.current = cy
    return () => {
      cy.destroy()
      cyRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, theme])

  // The canvas stays permanently dark regardless of the app theme: node/edge
  // colors are hardcoded hex passed straight to Cytoscape's stylesheet, not
  // CSS variables, so flipping the container to a light background would
  // leave light-gray labels unreadable. Same reasoning for the overlay
  // controls below.
  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full bg-[var(--graph-bg)]" />
      <div className="absolute bottom-3 right-3 flex gap-1">
        <button
          onClick={() => cyRef.current?.fit(undefined, 40)}
          className="rounded-md bg-[#12141b]/90 px-2 py-1 text-xs text-[#e8eaee] hover:bg-[#1c202c]"
        >
          Fit graph
        </button>
        <button
          onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
          className="rounded-md bg-[#12141b]/90 px-2 py-1 text-xs text-[#e8eaee] hover:bg-[#1c202c]"
        >
          +
        </button>
        <button
          onClick={() => cyRef.current?.zoom(cyRef.current.zoom() / 1.2)}
          className="rounded-md bg-[#12141b]/90 px-2 py-1 text-xs text-[#e8eaee] hover:bg-[#1c202c]"
        >
          −
        </button>
      </div>
    </div>
  )
}
