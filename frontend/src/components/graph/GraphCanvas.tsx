import { useEffect, useRef } from 'react'
import cytoscape, { type Core, type Css } from 'cytoscape'
// @ts-expect-error - no bundled types for this layout extension
import coseBilkent from 'cytoscape-cose-bilkent'
import type { GraphEdge, GraphNode } from '@/schemas/investigations'
import { useUiStore } from '@/stores/uiStore'

cytoscape.use(coseBilkent)

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

function getGraphStyle(isDark: boolean): cytoscape.Stylesheet[] {
  const graphBg = isDark ? '#091523' : '#F9FAFB'
  const textColor = isDark ? '#F3F5F7' : '#16233B'
  const unknownColor = isDark ? '#26384D' : '#102A4C'
  const seedBorderColor = isDark ? '#FF8A00' : '#F57C00'
  const normalBorderColor = isDark ? '#33485F' : '#E4E8EF'
  const edgeColor = isDark ? '#7F8C9F' : '#7B8798'
  const selectedOutline = isDark ? '#F3F5F7' : '#102A4C'
  
  const RISK_COLOR_DYNAMIC: Record<string, string> = {
    high: isDark ? '#F05B5B' : '#D14343',
    medium: isDark ? '#E3A72F' : '#D89A10',
    low: isDark ? '#3BA76D' : '#1F8A4D',
    unknown: unknownColor,
  }

  return [
    {
      selector: 'node',
      style: {
        'background-color': (el: cytoscape.NodeSingular) => RISK_COLOR_DYNAMIC[el.data('risk_level')] ?? unknownColor,
        shape: (el: cytoscape.NodeSingular) => TYPE_SHAPE[el.data('type')] ?? 'ellipse',
        label: 'data(label)',
        color: textColor,
        'font-size': 8,
        'font-weight': 600,
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
        'border-width': (el: cytoscape.NodeSingular) => (el.data('is_seed') ? 3 : 1),
        'border-color': (el: cytoscape.NodeSingular) => (el.data('is_seed') ? seedBorderColor : normalBorderColor),
        'transition-property': 'border-color, border-width, opacity',
        'transition-duration': 120,
        'transition-timing-function': 'ease-out',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 1.5,
        'line-color': edgeColor,
        'target-arrow-color': edgeColor,
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
      style: { 'border-width': 2, 'border-color': selectedOutline },
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': selectedOutline,
        'target-arrow-color': selectedOutline,
        width: 2.5,
        label: 'data(label)',
        'font-size': 9,
        color: textColor,
        'font-weight': 'bold',
        'text-background-color': graphBg,
        'text-background-opacity': 0.85,
        'text-background-shape': 'roundrectangle',
        'text-background-padding': '2px',
      },
    },
    {
      selector: 'node.hovered',
      style: { 'border-width': 2, 'border-color': selectedOutline },
    },
    {
      selector: 'edge.hovered',
      style: {
        width: 2.5,
        'line-color': selectedOutline,
        'target-arrow-color': selectedOutline,
        label: 'data(label)',
        'font-size': 9,
        color: textColor,
        'font-weight': 'bold',
        'text-background-color': graphBg,
        'text-background-opacity': 0.85,
        'text-background-shape': 'roundrectangle',
        'text-background-padding': '2px',
      },
    },
  ]
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
    if (!cyRef.current) return
    cyRef.current.style(getGraphStyle(theme === 'dark'))
  }, [theme])

  useEffect(() => {
    if (!containerRef.current) return

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
      style: getGraphStyle(theme === 'dark'),
      wheelSensitivity: 0.2,
      minZoom: 0.3,
      maxZoom: 1.6,
    })

    cy.one('layoutstop', () => {
      const isolated = cy.nodes().filter((n) => n.connectedEdges().length === 0)
      if (isolated.length === 0) return

      const connected = cy.nodes().filter((n) => n.connectedEdges().length > 0)
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

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full bg-graph-bg" />
      <div className="absolute bottom-3 right-3 flex gap-1">
        <button
          onClick={() => cyRef.current?.fit(undefined, 40)}
          className="rounded-md bg-surface-1 border border-border-c shadow-sm px-2.5 py-1.5 text-xs text-text-primary font-medium hover:bg-surface-2 transition-colors"
        >
          Fit graph
        </button>
        <button
          onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
          className="rounded-md bg-surface-1 border border-border-c shadow-sm px-2.5 py-1.5 text-xs text-text-primary font-medium hover:bg-surface-2 transition-colors"
        >
          +
        </button>
        <button
          onClick={() => cyRef.current?.zoom(cyRef.current.zoom() / 1.2)}
          className="rounded-md bg-surface-1 border border-border-c shadow-sm px-2.5 py-1.5 text-xs text-text-primary font-medium hover:bg-surface-2 transition-colors"
        >
          −
        </button>
      </div>
    </div>
  )
}
