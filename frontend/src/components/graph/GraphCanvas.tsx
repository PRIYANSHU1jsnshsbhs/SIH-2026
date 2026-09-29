import { useEffect, useRef } from 'react'
import cytoscape, { type Core, type Css } from 'cytoscape'
// @ts-expect-error - no bundled types for this layout extension
import coseBilkent from 'cytoscape-cose-bilkent'
import type { GraphEdge, GraphNode } from '@/schemas/investigations'
import { useUiStore } from '@/stores/uiStore'
import { graphEntityIconDataUri } from './entityTypeIcons'

cytoscape.use(coseBilkent)

const TYPE_SHAPE: Record<string, Css.NodeShape> = {
  wallet: 'ellipse',
  contract: 'round-rectangle',
  vasp: 'round-tag',
  exchange: 'round-tag',
  bridge: 'diamond',
  mixer: 'hexagon',
}

/** Bigger = more investigatively important: the seed and the terminal entity stand out from the layering hops in between. */
function baseSize(el: cytoscape.NodeSingular): number {
  if (el.data('is_seed')) return 44
  if (el.data('is_vasp') || el.data('type') === 'vasp' || el.data('type') === 'exchange') return 40
  if (el.data('type') === 'mixer' || el.data('type') === 'bridge') return 36
  return 30
}

function getGraphStyle(isDark: boolean, isFullGraph: boolean): cytoscape.StylesheetStyle[] {
  const graphBg = isDark ? '#091523' : '#F9FAFB'
  const textColor = isDark ? '#F3F5F7' : '#16233B'
  const unknownColor = isDark ? '#26384D' : '#102A4C'
  const seedBorderColor = isDark ? '#FF8A00' : '#F57C00'
  const normalBorderColor = isDark ? '#33485F' : '#E4E8EF'
  
  // attribution path colors
  const edgeColor = isDark ? '#435165' : '#7B8798'
  const attrEdgeColor = isDark ? '#D89A10' : '#FF8A00'
  
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
        'background-image': (el: cytoscape.NodeSingular) => graphEntityIconDataUri(el.data('type'), el.data('is_seed')),
        'background-fit': 'none',
        'background-width': '58%',
        'background-height': '58%',
        'background-opacity': 1,
        shape: (el: cytoscape.NodeSingular) => TYPE_SHAPE[el.data('type')] ?? 'ellipse',
        label: (el: cytoscape.NodeSingular) => {
          if (isFullGraph) {
            return (el.data('is_seed') || el.data('is_vasp')) ? el.data('label') : ''
          }
          return el.data('label')
        },
        color: textColor,
        'font-size': (el: cytoscape.NodeSingular) => (el.data('is_seed') || el.data('is_vasp')) ? 10 : 8,
        'font-weight': (el: cytoscape.NodeSingular) => (el.data('is_seed') || el.data('is_vasp')) ? 700 : 600,
        'text-valign': 'bottom',
        'text-margin-y': 5,
        'text-max-width': '100px',
        'text-wrap': 'wrap',
        'text-background-color': graphBg,
        'text-background-opacity': 0.85,
        'text-background-shape': 'roundrectangle',
        'text-background-padding': '3px',
        width: baseSize,
        height: baseSize,
        'border-width': (el: cytoscape.NodeSingular) => (el.data('is_seed') ? 4 : el.data('is_vasp') ? 3 : 1),
        'border-color': (el: cytoscape.NodeSingular) => (el.data('is_seed') ? seedBorderColor : el.data('is_vasp') ? attrEdgeColor : normalBorderColor),
        'transition-property': 'border-color, border-width, opacity',
        'transition-duration': 120,
        'transition-timing-function': 'ease-out',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 1,
        'line-color': edgeColor,
        'target-arrow-color': edgeColor,
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.8,
        'curve-style': 'bezier',
        opacity: isFullGraph ? 0.3 : 0.6,
        'transition-property': 'width, line-color, target-arrow-color, opacity',
        'transition-duration': 120,
        'transition-timing-function': 'ease-out',
      },
    },
    {
      selector: 'edge[?is_attribution_path]',
      style: {
        width: 2.5,
        'line-color': attrEdgeColor,
        'target-arrow-color': attrEdgeColor,
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.1,
        opacity: 1,
        'z-index': 10,
      },
    },
    {
      selector: 'node:selected',
      style: { 'border-width': 2, 'border-color': selectedOutline, label: 'data(label)' },
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
        opacity: 1,
      },
    },
    {
      selector: 'node.hovered',
      style: { 'border-width': 2, 'border-color': selectedOutline, label: 'data(label)' },
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
        opacity: 1,
      },
    },
  ]
}

export function GraphCanvas({
  nodes,
  edges,
  isFullGraph = false,
  focusNodeId,
  fitRequest = 0,
  onNodeSelect,
  onEdgeSelect,
}: {
  nodes: GraphNode[]
  edges: GraphEdge[]
  isFullGraph?: boolean
  focusNodeId?: string | null
  fitRequest?: number
  onNodeSelect: (node: GraphNode) => void
  onEdgeSelect: (edge: GraphEdge) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const theme = useUiStore((s) => s.theme)

  useEffect(() => {
    if (!cyRef.current) return
    cyRef.current.style(getGraphStyle(theme === 'dark', isFullGraph))
  }, [theme, isFullGraph])

  useEffect(() => {
    if (!cyRef.current || !focusNodeId) return
    const cy = cyRef.current
    const el = cy.getElementById(focusNodeId)
    if (el && el.length > 0) {
      cy.animate({
        fit: {
          eles: el,
          padding: 100
        },
        duration: 300
      })
      el.select()
    }
  }, [focusNodeId])

  useEffect(() => {
    if (!cyRef.current || fitRequest === 0) return
    cyRef.current.animate({ fit: { eles: cyRef.current.elements(), padding: 50 }, duration: 300 })
  }, [fitRequest])

  useEffect(() => {
    if (!containerRef.current) return

    const nodeIds = new Set<string>()
    const validNodes = nodes.filter((node) => {
      const id = node.id.trim()
      if (!id || nodeIds.has(id)) {
        if (import.meta.env.DEV) console.warn('Cytoscape node validation removed invalid/duplicate node:', node)
        return false
      }
      nodeIds.add(id)
      return true
    })
    const edgeIds = new Set<string>()
    let orphanEdgeCount = 0
    const validEdges = edges.filter((edge) => {
      if (!edge.id.trim() || edgeIds.has(edge.id)) {
        if (import.meta.env.DEV) console.warn('Cytoscape edge validation removed invalid/duplicate edge:', edge)
        return false
      }
      edgeIds.add(edge.id)
      const connected = nodeIds.has(edge.source) && nodeIds.has(edge.target)
      if (!connected) {
        orphanEdgeCount += 1
        if (import.meta.env.DEV) console.warn('Cytoscape orphan edge removed:', edge)
      }
      return connected
    })
    if (import.meta.env.DEV) console.info(`Cytoscape validation: orphan edge count = ${orphanEdgeCount}`)

    const nodeLabel = (node: GraphNode) => {
      if (node.is_seed) return `START\n${node.address}`
      if (node.is_nearest_vasp) {
        const parts = [node.entity_name, node.type.toUpperCase(), node.address]
        if (node.hop != null) parts.push(`Hop ${node.hop}`)
        if (node.attribution_amount != null) {
          parts.push(`${node.attribution_amount}${node.attribution_asset ? ` ${node.attribution_asset}` : ''}`)
        }
        return parts.filter(Boolean).join('\n')
      }
      return node.entity_name ? `${node.entity_name}\n${node.address}` : node.address
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...validNodes.map((n) => ({
          data: {
            id: n.id,
            label: nodeLabel(n),
            risk_level: n.risk_level,
            type: n.type,
            is_seed: n.is_seed ?? false,
            is_vasp: n.is_vasp ?? false,
          },
        })),
        ...validEdges.map((e) => ({
          data: {
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.amount != null ? `${e.amount}${e.asset ? ` ${e.asset}` : ''}` : 'Amount not available',
            is_attribution_path: e.is_attribution_path ?? false,
          },
        })),
      ],
      style: getGraphStyle(theme === 'dark', isFullGraph),

      minZoom: 0.1,
      maxZoom: 2.0,
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

      const seed = cy.nodes().filter((n) => n.data('is_seed'))
      if (seed.length > 0) {
        const neighborhood = seed.neighborhood().add(seed)
        cy.fit(neighborhood, 50)
      } else {
        cy.fit(undefined, 50)
      }
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
      const node = validNodes.find((n) => n.id === id)
      if (node) onNodeSelect(node)
    })

    cy.on('tap', 'edge', (evt) => {
      const id = evt.target.id()
      const edge = validEdges.find((e) => e.id === id)
      if (edge) onEdgeSelect(edge)
    })

    cyRef.current = cy
    return () => {
      cy.destroy()
    }
  }, [nodes, edges, theme, isFullGraph, onNodeSelect, onEdgeSelect])

  return <div ref={containerRef} className="h-full w-full" />
}
