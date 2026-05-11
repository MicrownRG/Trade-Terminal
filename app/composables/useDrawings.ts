// composables/useDrawings.ts
// Pure drawing state machine — no Vue reactivity, fully injectable & testable.

import {
  DrawingManager,
  TrendLine,
  HorizontalLine,
  VerticalLine,
  FibRetracement,
  Rectangle,
  TextAnnotation,
} from 'lightweight-charts-drawing'

export type DrawingToolKey =
  | null
  | 'TrendLine'
  | 'HorizontalLine'
  | 'VerticalLine'
  | 'FibRetracement'
  | 'Rectangle'
  | 'TextAnnotation'
  | 'select'

export interface Anchor { time: any; price: number }

export interface FibOptions {
  levels: number[]
  showPrices: boolean
  showPercentages: boolean
  extendLines: boolean
}

// PascalCase tool id → library kebab-case type string
export const TOOL_TYPE: Record<string, string> = {
  TrendLine:      'trend-line',
  HorizontalLine: 'horizontal-line',
  VerticalLine:   'vertical-line',
  FibRetracement: 'fib-retracement',
  Rectangle:      'rectangle',
  TextAnnotation: 'text-annotation',
}

// How many clicks each tool needs before a drawing is committed
export const REQUIRED_ANCHORS: Record<string, number> = {
  'trend-line':      2,
  'horizontal-line': 1,
  'vertical-line':   1,
  'fib-retracement': 2,
  'rectangle':       2,
  'text-annotation': 1,
}

export const DRAWING_CLASSES: Record<string, any> = {
  'trend-line':      TrendLine,
  'horizontal-line': HorizontalLine,
  'vertical-line':   VerticalLine,
  'fib-retracement': FibRetracement,
  'rectangle':       Rectangle,
  'text-annotation': TextAnnotation,
}

// ─── Factory for importDrawings ───────────────────────────
export function drawingFactory(type: string, data: any): any | null {
  const cls = DRAWING_CLASSES[type]
  if (!cls) return null
  try {
    const d = new cls(data.id)
    d.fromJSON(data)
    return d
  } catch { return null }
}

// ─── Injected chart/series API surface ───────────────────
export interface ChartApi {
  timeScale: () => {
    coordinateToTime: (x: number) => any
    timeToCoordinate: (t: any) => number | null
  }
  applyOptions: (opts: any) => void
  subscribeClick: (fn: (p: any) => void) => void
  unsubscribeClick: (fn: (p: any) => void) => void
}
export interface SeriesApi {
  coordinateToPrice: (y: number) => number | null
  priceToCoordinate: (p: number) => number | null
}

// Monotonic counter to guarantee unique drawing IDs within the same millisecond
let _drawingSeq = 0

// ─── Core drawing manager ─────────────────────────────────
export interface DrawingManagerApi {
  drawingManager: DrawingManager | null
  pendingAnchors: Anchor[]
  // lifecycle
  attach: (chart: ChartApi, series: SeriesApi, container: HTMLElement, symbol: string, savedDrawings?: any[]) => void
  detach: () => void
  // click creation
  onChartClick: (param: any, activeTool: DrawingToolKey, fibOptions?: FibOptions) => { created: boolean; drawingId?: string; toolType?: string }
  // drag
  onContainerMouseDown: (e: MouseEvent, activeTool: DrawingToolKey) => boolean
  onDocumentMouseMove: (e: MouseEvent) => void
  onDocumentMouseUp: () => boolean
  // keyboard
  onKeyDown: (e: KeyboardEvent) => boolean
  // tool sync
  syncActiveTool: (tool: DrawingToolKey) => void
  // serialisation
  exportDrawings: () => any[]
  resetPendingAnchors: () => void
  clearActiveTool: () => void
  get isDrawingInProgress(): boolean
}

export function createDrawingManager(): DrawingManagerApi {
  let drawingManager: DrawingManager | null = null
  let chart: ChartApi | null = null
  let series: SeriesApi | null = null
  let container: HTMLElement | null = null

  let pendingAnchors: Anchor[] = []
  let isAnchorDrag = false
  let currentTool: DrawingToolKey = 'select'

  let wholeDrawingDrag: {
    id: string
    startAnchors: Anchor[]
    startPoint: { x: number; y: number }
  } | null = null

  // ── lifecycle ──────────────────────────────────────────
  function attach(
    _chart: ChartApi,
    _series: SeriesApi,
    _container: HTMLElement,
    _symbol: string,
    savedDrawings?: any[],
  ) {
    chart = _chart
    series = _series
    container = _container
    drawingManager = new DrawingManager()
    // DrawingManager.attach(chart, series, container)
    drawingManager.attach(_chart as any, _series as any, _container)
    if (savedDrawings?.length) {
      drawingManager.importDrawings(savedDrawings, drawingFactory)
    }
  }

  function detach() {
    if (drawingManager) {
      try { drawingManager.detach() } catch {}
      drawingManager = null
    }
    chart = null
    series = null
    container = null
    pendingAnchors = []
    wholeDrawingDrag = null
  }

  // ── click → create drawing ─────────────────────────────
  function onChartClick(
    param: any,
    activeTool: DrawingToolKey,
    fibOptions?: FibOptions,
  ): { created: boolean; drawingId?: string; toolType?: string } {
    if (!param.point) return { created: false }
    if (!activeTool || activeTool === 'select') return { created: false }

    const toolType = TOOL_TYPE[activeTool]
    if (!toolType) return { created: false }

    // coordinateToTime works for all x positions; fall back to param.time
    const ts = (chart as any)?.timeScale?.()
    const time = ts?.coordinateToTime(param.point.x) ?? param.time
    if (!time) return { created: false }

    const price = (series as any)?.coordinateToPrice(param.point.y)
    if (price === null || price === undefined) return { created: false }

    pendingAnchors.push({ time, price })

    const needed = REQUIRED_ANCHORS[toolType] ?? 2
    if (pendingAnchors.length < needed) return { created: false }

    // Enough anchors — create drawing
    const cls = DRAWING_CLASSES[toolType]
    if (!cls || !drawingManager) {
      pendingAnchors = []
      return { created: false }
    }

    const id = `d-${Date.now()}-${++_drawingSeq}`
    try {
      const styleOpts: any = {}
      if (toolType === 'horizontal-line') {
        styleOpts.textColor = 'rgba(255, 255, 255, 0.6)'
        styleOpts.fontSize = 10
      }
      const drawing = new cls(id, [...pendingAnchors], styleOpts)
      if (toolType === 'fib-retracement' && fibOptions) {
        drawing.setFibOptions(fibOptions)
      }
      drawingManager.addDrawing(drawing)
      pendingAnchors = []
      return { created: true, drawingId: id, toolType }
    } catch (e) {
      console.error('[drawing create]', e)
      pendingAnchors = []
      return { created: false }
    }
  }

  // ── drag — whole drawing ───────────────────────────────
  function onContainerMouseDown(e: MouseEvent, activeTool: DrawingToolKey): boolean {
    // Only when in select mode (no active drawing tool)
    if (activeTool && activeTool !== 'select') return false
    if (!drawingManager || !container) return false

    const rect = container.getBoundingClientRect()
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    const drawing = drawingManager.hitTest(pt)
    if (!drawing) return false

    drawingManager.selectDrawing(drawing.id)

    // If on an anchor, let DrawingManager handle anchor drag but WE disable chart pan
    if (drawingManager.hitTestAnchor(pt) !== null) {
      isAnchorDrag = true
      return false
    }

    // Whole-drawing drag
    wholeDrawingDrag = {
      id: drawing.id,
      startAnchors: (drawing.anchors as Anchor[]).map(a => ({ ...a })),
      startPoint: pt,
    }
      // Disable chart pan while dragging whole drawing
      try { (chart as any)?.applyOptions?.({ handleScroll: { pressedMouseMove: false } }) } catch {}
    return true
  }

  function onDocumentMouseMove(e: MouseEvent) {
    if (!container || !chart || !series) return

    const rect = container.getBoundingClientRect()
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    // Hover state - proactively disable scroll if over drawing or using tool
    if (!wholeDrawingDrag && !isAnchorDrag) {
      if (drawingManager && (drawingManager.hitTest(pt) || currentTool !== 'select')) {
        chart.applyOptions({ handleScroll: { pressedMouseMove: false } })
      } else {
        chart.applyOptions({ handleScroll: { pressedMouseMove: true } })
      }
      return
    }

    // Anchor drag handled by library
    if (isAnchorDrag) return

    // Whole drawing drag
    if (!wholeDrawingDrag) return
    
    const dx = pt.x - wholeDrawingDrag.startPoint.x
    const dy = pt.y - wholeDrawingDrag.startPoint.y

    const drawing = drawingManager?.getDrawing(wholeDrawingDrag.id)
    if (!drawing) return

    const ts = (chart as any).timeScale()
    const newAnchors = wholeDrawingDrag.startAnchors.map((a: Anchor) => {
      const origX = ts.timeToCoordinate(a.time)
      const origY = (series as any).priceToCoordinate(a.price)
      if (origX == null || origY == null) return a
      const newTime = ts.coordinateToTime(origX + dx)
      const newPrice = (series as any).coordinateToPrice(origY + dy)
      if (newTime == null || newPrice == null) return a
      return { time: newTime, price: newPrice }
    })

    drawing.anchors = newAnchors
  }

  function onDocumentMouseUp(): boolean {
    let handled = false
    if (isAnchorDrag) {
      isAnchorDrag = false
      handled = true
    }
    if (wholeDrawingDrag) {
      // Restore pan when whole-drawing drag ends
      try { (chart as any)?.applyOptions?.({ handleScroll: { pressedMouseMove: true } }) } catch {}
      wholeDrawingDrag = null
      handled = true
    }
    // Restore pan if we are in select mode and not hovering a drawing (handled via mousemove)
    return handled // caller should save drawings
  }

  // ── keyboard — delete selected ─────────────────────────
  function onKeyDown(e: KeyboardEvent): boolean {
    if (e.key !== 'Delete' && e.key !== 'Backspace') return false
    const selected = drawingManager?.getSelectedDrawing()
    if (!selected) return false
    e.preventDefault()
    drawingManager!.removeDrawing(selected.id)
    return true // caller should save drawings
  }

  // ── sync tool state with DrawingManager ───────────────
  function syncActiveTool(tool: DrawingToolKey) {
    pendingAnchors = []
    currentTool = tool ?? 'select'
    if (!drawingManager) return
    if (!tool || tool === 'select') {
      drawingManager.setActiveTool(null)
    } else {
      drawingManager.setActiveTool(TOOL_TYPE[tool] ?? null)
    }
  }

  // ── serialisation ──────────────────────────────────────
  function exportDrawings(): any[] {
    return drawingManager?.exportDrawings() ?? []
  }

  function resetPendingAnchors() {
    pendingAnchors = []
  }

  function clearActiveTool() {
    pendingAnchors = []
    currentTool = 'select'
    if (drawingManager) drawingManager.setActiveTool(null)
  }

  return {
    get drawingManager() { return drawingManager },
    get pendingAnchors() { return pendingAnchors },
    get isDrawingInProgress() { return pendingAnchors.length > 0 },
    attach,
    detach,
    onChartClick,
    onContainerMouseDown,
    onDocumentMouseMove,
    onDocumentMouseUp,
    onKeyDown,
    syncActiveTool,
    exportDrawings,
    resetPendingAnchors,
    clearActiveTool,
  }
}
