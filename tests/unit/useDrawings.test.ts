// tests/unit/useDrawings.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createDrawingManager,
  TOOL_TYPE,
  REQUIRED_ANCHORS,
  DRAWING_CLASSES,
  drawingFactory,
  type DrawingToolKey,
  type FibOptions,
} from '~/composables/useDrawings'

// ── Mock the heavyweight chart library ───────────────────
vi.mock('lightweight-charts-drawing', () => {
  // Minimal drawing stub: stores anchors, tracks attach/detach
  class StubDrawing {
    id: string
    type: string
    anchors: any[]
    _attached = false
    _fibOptions: any = null
    _text = ''
    textOptions = { text: '' }
    options = { visible: true, locked: false }
    _hitBox: { x: number; y: number; r: number } | null = null

    constructor(id: string, anchors: any[] = []) {
      this.id = id
      this.anchors = [...anchors]
      this.type = 'stub'
    }
    attach(series: any, chart: any, container?: any) { this._attached = true }
    detach() { this._attached = false }
    setFibOptions(opts: any) { this._fibOptions = opts }
    setText(t: string) { this._text = t; this.textOptions.text = t }
    fromJSON(data: any) {
      this.anchors = [...(data.anchors ?? [])]
      this.type = data.type ?? 'stub'
    }
    toJSON() { return { id: this.id, type: this.type, anchors: [...this.anchors], style: {}, options: {} } }
    testHit(pt: any, viewport: any) {
      if (!this._hitBox) return false
      const dx = pt.x - this._hitBox.x
      const dy = pt.y - this._hitBox.y
      return Math.sqrt(dx * dx + dy * dy) <= this._hitBox.r
    }
    hitTestAnchor(pt: any, viewport: any) { return null }
    setState(s: string) {}
    updateAnchor(idx: number, anchor: any) { this.anchors[idx] = anchor }
    requestUpdate() {}
  }

  class TrendLine      extends StubDrawing { constructor(id: string, a?: any[]) { super(id, a); this.type = 'trend-line' } }
  class HorizontalLine extends StubDrawing { constructor(id: string, a?: any[]) { super(id, a); this.type = 'horizontal-line' } }
  class VerticalLine   extends StubDrawing { constructor(id: string, a?: any[]) { super(id, a); this.type = 'vertical-line' } }
  class FibRetracement extends StubDrawing { constructor(id: string, a?: any[]) { super(id, a); this.type = 'fib-retracement' } }
  class Rectangle      extends StubDrawing { constructor(id: string, a?: any[]) { super(id, a); this.type = 'rectangle' } }
  class TextAnnotation extends StubDrawing { constructor(id: string, a?: any[]) { super(id, a); this.type = 'text-annotation' } }

  class DrawingManager {
    _drawings = new Map<string, StubDrawing>()
    _selectedId: string | null = null
    _activeTool: string | null = null
    _isAttached = false
    _chart: any = null
    _series: any = null
    _container: any = null
    _listeners = new Map<string, Function[]>()

    attach(chart: any, series: any, container: any) {
      this._chart = chart
      this._series = series
      this._container = container
      this._isAttached = true
      // register all existing drawings
      for (const d of this._drawings.values()) d.attach(series, chart, container)
    }
    detach() {
      for (const d of this._drawings.values()) d.detach()
      this._isAttached = false
      this._chart = null; this._series = null; this._container = null
    }
    addDrawing(d: StubDrawing) {
      if (this._drawings.has(d.id)) return
      this._drawings.set(d.id, d)
      if (this._isAttached) d.attach(this._series, this._chart, this._container)
      this.emit('drawing:added', { drawingId: d.id, drawing: d })
    }
    removeDrawing(id: string) {
      const d = this._drawings.get(id)
      if (!d) return
      if (this._selectedId === id) { this._selectedId = null }
      d.detach()
      this._drawings.delete(id)
      this.emit('drawing:removed', { drawingId: id })
    }
    getDrawing(id: string) { return this._drawings.get(id) ?? null }
    getAllDrawings() { return Array.from(this._drawings.values()) }
    clearAll() { for (const d of this._drawings.values()) d.detach(); this._drawings.clear(); this._selectedId = null }
    selectDrawing(id: string) { this._selectedId = id }
    deselectAll() { this._selectedId = null }
    getSelectedDrawing() { return (this._selectedId && this._drawings.get(this._selectedId)) || null }
    setActiveTool(tool: string | null) { this._activeTool = tool }
    getActiveTool() { return this._activeTool }
    hitTest(pt: any) {
      for (const d of Array.from(this._drawings.values()).reverse()) {
        if (d.options.visible && d.testHit(pt, {})) return d
      }
      return null
    }
    hitTestAnchor(pt: any) { return null }
    exportDrawings() { return this.getAllDrawings().map(d => d.toJSON()) }
    importDrawings(items: any[], factory: Function) {
      for (const item of items) {
        const d = factory(item.type, item)
        if (d) this.addDrawing(d)
      }
    }
    on(event: string, cb: Function) {
      if (!this._listeners.has(event)) this._listeners.set(event, [])
      this._listeners.get(event)!.push(cb)
    }
    emit(event: string, data: any) {
      for (const cb of (this._listeners.get(event) ?? [])) cb(data)
    }
  }

  return { DrawingManager, TrendLine, HorizontalLine, VerticalLine, FibRetracement, Rectangle, TextAnnotation }
})

// ── Chart/Series mock helpers ─────────────────────────────
function makeChart(overrides?: Partial<any>) {
  const ts = {
    coordinateToTime: vi.fn((x: number) => x > 0 ? 1700000000 + Math.floor(x) : null),
    timeToCoordinate: vi.fn((t: number) => t - 1700000000),
    width: vi.fn(() => 800),
    logicalToCoordinate: vi.fn((l: number) => l * 10),
  }
  return {
    timeScale: vi.fn(() => ts),
    applyOptions: vi.fn(),
    subscribeClick: vi.fn(),
    unsubscribeClick: vi.fn(),
    _ts: ts,
    ...overrides,
  }
}

function makeSeries(overrides?: Partial<any>) {
  return {
    coordinateToPrice: vi.fn((y: number) => y > 0 ? 50000 - y : null),
    priceToCoordinate: vi.fn((p: number) => 50000 - p),
    attachPrimitive: vi.fn(),
    detachPrimitive: vi.fn(),
    ...overrides,
  }
}

function makeContainer() {
  const el = document.createElement('div')
  Object.defineProperty(el, 'getBoundingClientRect', {
    value: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600 }),
  })
  Object.defineProperty(el, 'clientHeight', { value: 600 })
  return el
}

// Simulate a chart click param
function clickParam(x: number, y: number, time?: number) {
  return { point: { x, y }, time: time ?? null }
}

function mouseEvent(x: number, y: number) {
  return { clientX: x, clientY: y, preventDefault: vi.fn() } as unknown as MouseEvent
}

function keyEvent(key: string) {
  return { key, preventDefault: vi.fn() } as unknown as KeyboardEvent
}

// ─────────────────────────────────────────────────────────
describe('TOOL_TYPE mapping', () => {
  it('maps every DrawingTool key to a kebab-case library type', () => {
    expect(TOOL_TYPE['TrendLine']).toBe('trend-line')
    expect(TOOL_TYPE['HorizontalLine']).toBe('horizontal-line')
    expect(TOOL_TYPE['VerticalLine']).toBe('vertical-line')
    expect(TOOL_TYPE['FibRetracement']).toBe('fib-retracement')
    expect(TOOL_TYPE['Rectangle']).toBe('rectangle')
    expect(TOOL_TYPE['TextAnnotation']).toBe('text-annotation')
  })
})

describe('REQUIRED_ANCHORS', () => {
  it('1-click tools need 1 anchor', () => {
    expect(REQUIRED_ANCHORS['horizontal-line']).toBe(1)
    expect(REQUIRED_ANCHORS['vertical-line']).toBe(1)
    expect(REQUIRED_ANCHORS['text-annotation']).toBe(1)
  })
  it('2-click tools need 2 anchors', () => {
    expect(REQUIRED_ANCHORS['trend-line']).toBe(2)
    expect(REQUIRED_ANCHORS['fib-retracement']).toBe(2)
    expect(REQUIRED_ANCHORS['rectangle']).toBe(2)
  })
})

describe('drawingFactory', () => {
  it('reconstructs a drawing from JSON', () => {
    const data = { id: 'abc', type: 'trend-line', anchors: [{ time: 1, price: 100 }, { time: 2, price: 200 }], style: {}, options: {} }
    const d = drawingFactory('trend-line', data)
    expect(d).not.toBeNull()
    expect(d.id).toBe('abc')
    expect(d.anchors).toHaveLength(2)
  })
  it('returns null for unknown type', () => {
    expect(drawingFactory('unknown-tool', {})).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────
describe('createDrawingManager — onChartClick', () => {
  let dm: ReturnType<typeof createDrawingManager>
  let chart: ReturnType<typeof makeChart>
  let series: ReturnType<typeof makeSeries>
  let container: HTMLElement

  beforeEach(() => {
    dm = createDrawingManager()
    chart = makeChart()
    series = makeSeries()
    container = makeContainer()
    dm.attach(chart as any, series as any, container, 'BTCUSDT')
  })

  it('ignores click when no tool is active', () => {
    const r = dm.onChartClick(clickParam(100, 200), null)
    expect(r.created).toBe(false)
    expect(dm.drawingManager?.getAllDrawings()).toHaveLength(0)
  })

  it('ignores click in select mode', () => {
    const r = dm.onChartClick(clickParam(100, 200), 'select')
    expect(r.created).toBe(false)
  })

  it('ignores click with no point data', () => {
    const r = dm.onChartClick({ point: null, time: null }, 'HorizontalLine')
    expect(r.created).toBe(false)
  })

  it('ignores click when coordinateToTime returns null and param.time is null', () => {
    // x=0 → coordinateToTime returns null; time also null
    const r = dm.onChartClick(clickParam(0, 200), 'HorizontalLine')
    expect(r.created).toBe(false)
  })

  it('uses param.time as fallback when coordinateToTime returns null', () => {
    // x=0 makes coordinateToTime return null, but param.time is set
    const r = dm.onChartClick({ point: { x: 0, y: 200 }, time: 1700000000 }, 'HorizontalLine')
    expect(r.created).toBe(true)
    expect(dm.drawingManager?.getAllDrawings()).toHaveLength(1)
  })

  // ── 1-click tools ────────────────────────────────────────
  it('HorizontalLine created on first click', () => {
    const r = dm.onChartClick(clickParam(100, 200), 'HorizontalLine')
    expect(r.created).toBe(true)
    expect(r.toolType).toBe('horizontal-line')
    expect(dm.drawingManager?.getAllDrawings()).toHaveLength(1)
    const d = dm.drawingManager!.getAllDrawings()[0]!
    expect(d.type).toBe('horizontal-line')
    expect(d.anchors).toHaveLength(1)
  })

  it('VerticalLine created on first click', () => {
    const r = dm.onChartClick(clickParam(150, 300), 'VerticalLine')
    expect(r.created).toBe(true)
    expect(dm.drawingManager!.getAllDrawings()[0]!.type).toBe('vertical-line')
  })

  it('TextAnnotation created on first click', () => {
    const r = dm.onChartClick(clickParam(100, 200), 'TextAnnotation')
    expect(r.created).toBe(true)
    expect(dm.drawingManager!.getAllDrawings()[0]!.type).toBe('text-annotation')
  })

  // ── 2-click tools ────────────────────────────────────────
  it('TrendLine requires 2 clicks — not created on first', () => {
    const r1 = dm.onChartClick(clickParam(100, 200), 'TrendLine')
    expect(r1.created).toBe(false)
    expect(dm.pendingAnchors).toHaveLength(1)
    expect(dm.drawingManager?.getAllDrawings()).toHaveLength(0)
  })

  it('TrendLine created on second click', () => {
    dm.onChartClick(clickParam(100, 200), 'TrendLine')
    const r2 = dm.onChartClick(clickParam(300, 400), 'TrendLine')
    expect(r2.created).toBe(true)
    expect(r2.toolType).toBe('trend-line')
    const d = dm.drawingManager!.getAllDrawings()[0]!
    expect(d.type).toBe('trend-line')
    expect(d.anchors).toHaveLength(2)
    expect(dm.pendingAnchors).toHaveLength(0) // cleared after commit
  })

  it('FibRetracement created on second click', () => {
    dm.onChartClick(clickParam(100, 200), 'FibRetracement')
    const r2 = dm.onChartClick(clickParam(300, 400), 'FibRetracement')
    expect(r2.created).toBe(true)
    expect(dm.drawingManager!.getAllDrawings()[0]!.type).toBe('fib-retracement')
  })

  it('FibRetracement applies fibOptions on creation', () => {
    const opts: FibOptions = {
      levels: [0, 0.5, 1],
      showPrices: true,
      showPercentages: false,
      extendLines: true,
    }
    dm.onChartClick(clickParam(100, 200), 'FibRetracement', opts)
    dm.onChartClick(clickParam(300, 400), 'FibRetracement', opts)
    const d = dm.drawingManager!.getAllDrawings()[0]! as any
    expect(d._fibOptions).toEqual(opts)
  })

  it('Rectangle created on second click', () => {
    dm.onChartClick(clickParam(50, 100), 'Rectangle')
    const r2 = dm.onChartClick(clickParam(250, 300), 'Rectangle')
    expect(r2.created).toBe(true)
    const d = dm.drawingManager!.getAllDrawings()[0]!
    expect(d.type).toBe('rectangle')
    expect(d.anchors).toHaveLength(2)
  })

  it('pendingAnchors reset when syncActiveTool called', () => {
    dm.onChartClick(clickParam(100, 200), 'TrendLine')
    expect(dm.pendingAnchors).toHaveLength(1)
    dm.syncActiveTool('TrendLine') // re-selecting a tool resets pending
    expect(dm.pendingAnchors).toHaveLength(0)
  })

  it('multiple drawings can be created independently', () => {
    // Create HLine
    dm.onChartClick(clickParam(100, 200), 'HorizontalLine')
    // Create VLine
    dm.onChartClick(clickParam(200, 300), 'VerticalLine')
    expect(dm.drawingManager!.getAllDrawings()).toHaveLength(2)
  })
})

// ─────────────────────────────────────────────────────────
describe('createDrawingManager — syncActiveTool', () => {
  let dm: ReturnType<typeof createDrawingManager>

  beforeEach(() => {
    dm = createDrawingManager()
    dm.attach(makeChart() as any, makeSeries() as any, makeContainer(), 'BTCUSDT')
  })

  it('sets activeTool on drawingManager', () => {
    dm.syncActiveTool('TrendLine')
    expect(dm.drawingManager?.getActiveTool()).toBe('trend-line')
  })

  it('clears activeTool when null', () => {
    dm.syncActiveTool('TrendLine')
    dm.syncActiveTool(null)
    expect(dm.drawingManager?.getActiveTool()).toBeNull()
  })

  it('clears activeTool for select mode', () => {
    dm.syncActiveTool('TrendLine')
    dm.syncActiveTool('select')
    expect(dm.drawingManager?.getActiveTool()).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────
describe('createDrawingManager — keyboard delete', () => {
  let dm: ReturnType<typeof createDrawingManager>

  beforeEach(() => {
    dm = createDrawingManager()
    dm.attach(makeChart() as any, makeSeries() as any, makeContainer(), 'BTCUSDT')
    // Place a HorizontalLine
    dm.onChartClick(clickParam(100, 200), 'HorizontalLine')
  })

  it('Delete key removes selected drawing', () => {
    const d = dm.drawingManager!.getAllDrawings()[0]!
    dm.drawingManager!.selectDrawing(d.id)
    const consumed = dm.onKeyDown(keyEvent('Delete'))
    expect(consumed).toBe(true)
    expect(dm.drawingManager!.getAllDrawings()).toHaveLength(0)
  })

  it('Backspace key removes selected drawing', () => {
    const d = dm.drawingManager!.getAllDrawings()[0]!
    dm.drawingManager!.selectDrawing(d.id)
    const consumed = dm.onKeyDown(keyEvent('Backspace'))
    expect(consumed).toBe(true)
    expect(dm.drawingManager!.getAllDrawings()).toHaveLength(0)
  })

  it('other keys do nothing', () => {
    const consumed = dm.onKeyDown(keyEvent('Escape'))
    expect(consumed).toBe(false)
    expect(dm.drawingManager!.getAllDrawings()).toHaveLength(1)
  })

  it('Delete with no selection does nothing', () => {
    // No drawing selected
    const consumed = dm.onKeyDown(keyEvent('Delete'))
    expect(consumed).toBe(false)
    expect(dm.drawingManager!.getAllDrawings()).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────────────────
describe('createDrawingManager — whole-drawing drag', () => {
  let dm: ReturnType<typeof createDrawingManager>
  let chart: ReturnType<typeof makeChart>
  let series: ReturnType<typeof makeSeries>

  beforeEach(() => {
    dm = createDrawingManager()
    chart = makeChart()
    series = makeSeries()
    dm.attach(chart as any, series as any, makeContainer(), 'BTCUSDT')
    // Create a HorizontalLine at y=200
    dm.onChartClick(clickParam(100, 200), 'HorizontalLine')
  })

  it('mousedown on drawing starts drag and disables chart pan', () => {
    // Make the drawing respond to hitTest
    const d = dm.drawingManager!.getAllDrawings()[0]! as any
    d._hitBox = { x: 100, y: 200, r: 20 }

    const started = dm.onContainerMouseDown(mouseEvent(100, 200), null)
    expect(started).toBe(true)
    expect(chart.applyOptions).toHaveBeenCalledWith({ handleScroll: { pressedMouseMove: false } })
  })

  it('mousedown with active tool does not start drag', () => {
    const d = dm.drawingManager!.getAllDrawings()[0]! as any
    d._hitBox = { x: 100, y: 200, r: 20 }

    const started = dm.onContainerMouseDown(mouseEvent(100, 200), 'TrendLine')
    expect(started).toBe(false)
    expect(chart.applyOptions).not.toHaveBeenCalled()
  })

  it('mousedown on empty area does not start drag', () => {
    const started = dm.onContainerMouseDown(mouseEvent(500, 500), null)
    expect(started).toBe(false)
  })

  it('mouseup re-enables chart pan', () => {
    const d = dm.drawingManager!.getAllDrawings()[0]! as any
    d._hitBox = { x: 100, y: 200, r: 20 }

    dm.onContainerMouseDown(mouseEvent(100, 200), null)
    chart.applyOptions.mockClear()

    const saved = dm.onDocumentMouseUp()
    expect(saved).toBe(true)
    expect(chart.applyOptions).toHaveBeenCalledWith({ handleScroll: { pressedMouseMove: true } })
  })

  it('mouseup without active drag returns false', () => {
    const saved = dm.onDocumentMouseUp()
    expect(saved).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────
describe('createDrawingManager — detach / re-attach', () => {
  it('clears state on detach', () => {
    const dm = createDrawingManager()
    dm.attach(makeChart() as any, makeSeries() as any, makeContainer(), 'BTCUSDT')
    dm.onChartClick(clickParam(100, 200), 'HorizontalLine')
    expect(dm.drawingManager).not.toBeNull()

    dm.detach()
    expect(dm.drawingManager).toBeNull()
  })

  it('can re-attach after detach', () => {
    const dm = createDrawingManager()
    const chart = makeChart()
    const series = makeSeries()
    dm.attach(chart as any, series as any, makeContainer(), 'BTCUSDT')
    dm.detach()
    dm.attach(chart as any, series as any, makeContainer(), 'BTCUSDT')
    expect(dm.drawingManager).not.toBeNull()
  })

  it('imports saved drawings on attach', () => {
    const dm = createDrawingManager()
    const saved = [
      { id: 's1', type: 'horizontal-line', anchors: [{ time: 1700000000, price: 50000 }], style: {}, options: {} },
    ]
    dm.attach(makeChart() as any, makeSeries() as any, makeContainer(), 'BTCUSDT', saved)
    expect(dm.drawingManager!.getAllDrawings()).toHaveLength(1)
    expect(dm.drawingManager!.getAllDrawings()[0]!.type).toBe('horizontal-line')
  })
})

// ─────────────────────────────────────────────────────────
describe('createDrawingManager — exportDrawings', () => {
  it('exports created drawings', () => {
    const dm = createDrawingManager()
    dm.attach(makeChart() as any, makeSeries() as any, makeContainer(), 'BTCUSDT')
    dm.onChartClick(clickParam(100, 200), 'HorizontalLine')
    dm.onChartClick(clickParam(100, 200), 'VerticalLine')

    const exported = dm.exportDrawings()
    expect(exported).toHaveLength(2)
    expect(exported.map((d: any) => d.type)).toContain('horizontal-line')
    expect(exported.map((d: any) => d.type)).toContain('vertical-line')
  })

  it('returns empty array before attach', () => {
    const dm = createDrawingManager()
    expect(dm.exportDrawings()).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────
describe('createDrawingManager — clearActiveTool', () => {
  let dm: ReturnType<typeof createDrawingManager>

  beforeEach(() => {
    dm = createDrawingManager()
    dm.attach(makeChart() as any, makeSeries() as any, makeContainer(), 'BTCUSDT')
  })

  it('clearActiveTool resets pendingAnchors after partial 2-click drawing', () => {
    // Place first anchor of a 2-click tool
    dm.onChartClick(clickParam(100, 200), 'TrendLine')
    expect(dm.pendingAnchors).toHaveLength(1)

    // Clear the tool
    dm.clearActiveTool()
    expect(dm.pendingAnchors).toHaveLength(0)
  })

  it('clearActiveTool sets drawingManager activeTool to null', () => {
    dm.syncActiveTool('TrendLine')
    dm.clearActiveTool()
    expect(dm.drawingManager?.getActiveTool()).toBeNull()
  })

  it('clearActiveTool does not throw when called before attach', () => {
    const dm2 = createDrawingManager()
    expect(() => dm2.clearActiveTool()).not.toThrow()
  })
})

// ─────────────────────────────────────────────────────────
describe('createDrawingManager — isDrawingInProgress', () => {
  let dm: ReturnType<typeof createDrawingManager>

  beforeEach(() => {
    dm = createDrawingManager()
    dm.attach(makeChart() as any, makeSeries() as any, makeContainer(), 'BTCUSDT')
  })

  it('isDrawingInProgress is false when no pending anchors', () => {
    expect(dm.isDrawingInProgress).toBe(false)
  })

  it('isDrawingInProgress is true after first click of 2-click tool', () => {
    dm.onChartClick(clickParam(100, 200), 'TrendLine')
    expect(dm.isDrawingInProgress).toBe(true)
  })

  it('isDrawingInProgress is false after drawing is completed', () => {
    dm.onChartClick(clickParam(100, 200), 'TrendLine')
    dm.onChartClick(clickParam(300, 400), 'TrendLine')
    expect(dm.isDrawingInProgress).toBe(false)
  })

  it('isDrawingInProgress is false after clearActiveTool', () => {
    dm.onChartClick(clickParam(100, 200), 'TrendLine')
    dm.clearActiveTool()
    expect(dm.isDrawingInProgress).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────
describe('createDrawingManager — tool stays active after 1-click drawing', () => {
  it('after creating HorizontalLine, tool remains active (pendingAnchors cleared)', () => {
    const dm = createDrawingManager()
    dm.attach(makeChart() as any, makeSeries() as any, makeContainer(), 'BTCUSDT')

    dm.syncActiveTool('HorizontalLine')
    dm.onChartClick(clickParam(100, 200), 'HorizontalLine')

    // Drawing was created
    expect(dm.drawingManager!.getAllDrawings()).toHaveLength(1)
    // Tool still set in drawingManager (caller controls clearing)
    expect(dm.pendingAnchors).toHaveLength(0)
  })

  it('after creating TrendLine (2-click), pendingAnchors are cleared', () => {
    const dm = createDrawingManager()
    dm.attach(makeChart() as any, makeSeries() as any, makeContainer(), 'BTCUSDT')

    dm.onChartClick(clickParam(100, 200), 'TrendLine')
    dm.onChartClick(clickParam(300, 400), 'TrendLine')

    expect(dm.pendingAnchors).toHaveLength(0)
    expect(dm.drawingManager!.getAllDrawings()).toHaveLength(1)
  })
})
