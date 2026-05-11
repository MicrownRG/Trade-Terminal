<!-- components/widgets/ProChart.vue -->
<script setup lang="ts">
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  BarSeries,
  HistogramSeries,
} from 'lightweight-charts'
import type { Bar, IndicatorId } from '~/types'
import { runIndicator, buildIndicatorScript, getRsiLevels } from '~/composables/useIndicators'
import { fetchOHLCV, useRealtimeTick } from '~/composables/useMarketData'
import { createDrawingManager } from '~/composables/useDrawings'
import { toHeikinAshi, getSeriesData, formatOHLC, calcChangeInfo } from '~/composables/useChartHelpers'

const props = defineProps<{
  symbol?:    string
  timeframe?: string
  group?:     number
}>()

const chartStore   = useChartStore()
const layoutStore  = useLayoutStore()
const groupStore   = useGroupStore()
const widgetId     = inject<string>('widgetId', '')

// ── Per-widget group (0 = no group / follow global, 1-5 = sync group) ──
const localGroup = ref<number>(props.group ?? 0)

// ── Effective symbol ─────────────────────────────────────────────────────
// group 0 → follow global store (or pinned via props.symbol on mount)
// group 1-5 → follow groupStore.symbols[group]
const effectiveSymbol = computed(() => {
  if (localGroup.value >= 1 && localGroup.value <= 5)
    return groupStore.symbols[localGroup.value] ?? chartStore.symbol
  return chartStore.symbol
})
const colorMode   = useColorMode()
const { current: theme, candleColors, indicatorColors } = useChartTheme()

// Per-instance timeframe — independent across multiple ProChart widgets
const localTF = ref(props.timeframe ?? chartStore.timeframe)

watch(() => props.timeframe, (tf) => { if (tf) localTF.value = tf })
watch(() => props.group,     (g)  => { if (g !== undefined) localGroup.value = g })

// ── Symbol / group change handlers (called from ChartTopbar) ────────────
function onSetSymbol(sym: string) {
  const s = sym.toUpperCase().trim()
  if (!s) return
  if (localGroup.value >= 1 && localGroup.value <= 5) {
    groupStore.setGroupSymbol(localGroup.value as any, s)
  } else {
    // group 0: change the global symbol (affects all ungrouped charts)
    chartStore.setSymbol(s)
  }
}

function onSetGroup(g: number) {
  localGroup.value = g
  if (widgetId) layoutStore.updateWidgetProps(widgetId, { group: g })
}

// ─── Refs ──────────────────────────────────────────────────
const container     = ref<HTMLElement | null>(null)
const infoSymbol    = ref('')
const infoPrice     = ref('--')
const infoChange    = ref('+0.00%')
const infoChangePos = ref(true)
const ohlcInfo      = ref({ o: '--', h: '--', l: '--', c: '--', v: '--' })
const isLoading     = ref(true)

// ─── Text annotation inline editor ────────────────────────
const textEdit      = ref<{ id: string; x: number; y: number; text: string } | null>(null)
const textEditInput = ref<HTMLInputElement | null>(null)

// ─── Chart instances ───────────────────────────────────────
const showAlerts    = ref(false)
let chart:        any   = null
let candleSeries: any   = null
let volumeSeries: any   = null
let previewSeries: any  = null
let currentBars:  Bar[] = []

// ─── WebSocket — stored for manual lifecycle control ───────
let wsClose: (() => void) | null = null

function connectRealtime(sym: string, tf: string) {
  wsClose?.()
  wsClose = useRealtimeTick(sym, tf, (bar: Bar) => {
    candleSeries?.update(getSeriesData([bar], chartStore.chartType)[0] ?? bar)
    volumeSeries?.update({
      time:  bar.time,
      value: bar.volume,
      color: bar.close >= bar.open ? indicatorColors.histPos : indicatorColors.histNeg,
    })
    updateOHLC(bar)
  }).close
}

// ─── Drawing manager ───────────────────────────────────────
const dm = createDrawingManager()

function autoSaveDrawings() {
  const sym = effectiveSymbol.value
  chartStore.saveDrawings(sym, dm.exportDrawings())
}

function attachDrawings(sym: string) {
  if (!chart || !candleSeries || !container.value) return
  const saved = chartStore.drawings[sym]
  dm.attach(chart, candleSeries, container.value, sym, saved ?? [])
  dm.syncActiveTool(chartStore.activeTool)
  dm.drawingManager?.on('drawing:added',   () => autoSaveDrawings())
  dm.drawingManager?.on('drawing:removed', () => autoSaveDrawings())
  dm.drawingManager?.on('drawing:updated', () => autoSaveDrawings())
  dm.drawingManager?.on('drawing:cleared', () => autoSaveDrawings())
}

// ─── Text annotation helpers ───────────────────────────────
function openTextEditor(drawingId: string) {
  const drawing = dm.drawingManager?.getDrawing(drawingId)
  if (!drawing || drawing.type !== 'text-annotation') return
  const anchor = drawing.anchors?.[0]
  if (!anchor) return
  const x = chart?.timeScale()?.timeToCoordinate(anchor.time) ?? 0
  const y = candleSeries?.priceToCoordinate(anchor.price) ?? 0
  textEdit.value = {
    id: drawingId,
    x: Math.max(4, x),
    y: Math.max(4, y),
    text: (drawing as any).textOptions?.text ?? '',
  }
  nextTick(() => textEditInput.value?.select())
}

function commitTextEdit() {
  if (!textEdit.value) return
  const drawing = dm.drawingManager?.getDrawing(textEdit.value.id)
  if (drawing) (drawing as any).setText(textEdit.value.text)
  textEdit.value = null
  autoSaveDrawings()
}

// ─── Chart click → drawing creation ───────────────────────
function onChartClick(param: any) {
  const result = dm.onChartClick(
    param,
    chartStore.activeTool,
    {
      levels:          chartStore.activeFibLevels,
      showPrices:      chartStore.fibShowPrices,
      showPercentages: chartStore.fibShowPercentages,
      extendLines:     chartStore.fibExtendLines,
    },
  )
  if (result.created) {
    if (result.toolType === 'text-annotation') {
      nextTick(() => openTextEditor(result.drawingId!))
    }
    
    // Tools like text-annotation are single click, others are 2 clicks.
    // If it's a select or "one-off" action we might want to clear, but generally TradingView keeps the tool active.
    // However, if the user presses Esc, we will handle that in onKeyDown.
  }
}

// ─── Drawing Toolbar Actions ──────────────────────────────
function onRemoveSelectedDrawing() {
  if (!dm.drawingManager) return
  const selected = dm.drawingManager.getSelectedDrawing()
  if (selected) {
    dm.drawingManager.removeDrawing(selected.id)
    autoSaveDrawings()
  }
}

function onClearAllDrawings() {
  if (!dm.drawingManager) return
  dm.drawingManager.clearAll()
  autoSaveDrawings()
}

// ─── Container event handlers ──────────────────────────────
function handleContainerMouseDown(e: MouseEvent) {
  dm.onContainerMouseDown(e, chartStore.activeTool)
}
function handleDocumentMouseMove(e: MouseEvent) {
  dm.onDocumentMouseMove(e)
}
function handleDocumentMouseUp() {
  if (dm.onDocumentMouseUp()) autoSaveDrawings()
}
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    chartStore.clearActiveTool()
  }
  if (dm.onKeyDown(e)) autoSaveDrawings()
}

// ─── Indicator series map ──────────────────────────────────
// Plain objects — NOT reactive. LWC series/pane objects must never be wrapped
// in a Vue Proxy because chart.removeSeries() uses reference identity.
const indicatorSeries: Record<string, any[]> = {}
const indicatorPanes: Record<string, any> = {}

// ─── Series Factory ────────────────────────────────────────
function createMainSeries(type: string) {
  if (candleSeries) {
    try { chart.removeSeries(candleSeries) } catch {}
  }
  const c = candleColors.value
  switch (type) {
    case 'heikinashi':
    case 'candlestick':
    default:
      return chart.addSeries(CandlestickSeries, {
        ...c, priceLineVisible: true, priceLineColor: '#58a6ff', lastValueVisible: true,
      })
    case 'bar':
      return chart.addSeries(BarSeries, {
        upColor: c.upColor, downColor: c.downColor,
        priceLineVisible: true, lastValueVisible: true,
      })
    case 'line':
      return chart.addSeries(LineSeries, {
        color: '#58a6ff', lineWidth: 2,
        priceLineVisible: true, lastValueVisible: true,
      })
    case 'area':
      return chart.addSeries(AreaSeries, {
        topColor:    'rgba(88,166,255,0.4)',
        bottomColor: 'rgba(88,166,255,0.0)',
        lineColor:   '#58a6ff',
        lineWidth:   2,
        priceLineVisible: true,
        lastValueVisible: true,
      })
  }
}

// ─── Init Chart ────────────────────────────────────────────
onMounted(async () => {
  if (!container.value) return

  const sym = effectiveSymbol.value
  infoSymbol.value = sym

  chartStore.loadDrawings()
  chartStore.loadFibSettings()
  chartStore.loadIndicatorSettings()

  chart = createChart(container.value, {
    width:  container.value.clientWidth  || 600,
    height: container.value.clientHeight || 400,
    ...theme.value,
    handleScroll: { mouseWheel: true, pressedMouseMove: true },
    handleScale:  { axisPressedMouseMove: true, mouseWheel: true },
  })

  volumeSeries = chart.addSeries(HistogramSeries, {
    priceFormat:  { type: 'volume' },
    priceScaleId: 'volume',
  })
  chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

  candleSeries = createMainSeries(chartStore.chartType)

  isLoading.value = true
  let bars: Bar[] = []
  try {
    bars = await fetchOHLCV(sym, localTF.value, 500)
    currentBars = bars
    candleSeries.setData(getSeriesData(bars, chartStore.chartType))
    volumeSeries.setData(bars.map(b => ({
      time:  b.time,
      value: b.volume,
      color: b.close >= b.open ? indicatorColors.histPos : indicatorColors.histNeg,
    })))
    updateOHLC(bars[bars.length - 1])
  } finally {
    isLoading.value = false
  }

  attachDrawings(sym)
  applyAllIndicators(bars)

  // Connect WS with lifecycle managed manually
  connectRealtime(sym, localTF.value)

  chart.subscribeClick(onChartClick)

  // Dblclick to re-edit existing text annotation
  container.value.addEventListener('dblclick', (e: MouseEvent) => {
    if (chartStore.activeTool && chartStore.activeTool !== 'select') return
    if (!dm.drawingManager || !container.value) return
    const rect = container.value.getBoundingClientRect()
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const drawing = dm.drawingManager.hitTest(pt)
    if (drawing?.type === 'text-annotation') openTextEditor(drawing.id)
  })

  container.value.addEventListener('mousedown', handleContainerMouseDown, { capture: true })
  document.addEventListener('mousemove', handleDocumentMouseMove)
  document.addEventListener('mouseup',   handleDocumentMouseUp)
  document.addEventListener('keydown',   handleKeyDown)

  chart.subscribeCrosshairMove((param: any) => {
    if (param.seriesData && param.seriesData.size > 0) {
      const data = param.seriesData.get(candleSeries)
      if (data) updateOHLC(data)
    }

    // Drawing preview (rubber-band)
    if (dm.isDrawingInProgress && chartStore.activeTool && dm.pendingAnchors.length > 0 && param.time) {
      if (!previewSeries) {
        previewSeries = chart.addSeries(LineSeries, {
          color: '#58a6ff',
          lineWidth: 1,
          lineStyle: 2, // dashed
          priceLineVisible: false,
          lastValueVisible: false,
        })
      }
      const p0 = dm.pendingAnchors[0]!
      const price = candleSeries?.coordinateToPrice(param.point?.y ?? 0)
      if (price !== null && price !== undefined) {
        // Draw line from p0 to current cursor
        const p1 = { time: param.time, value: price }
        // LineSeries needs data sorted by time
        const data = p0.time < p1.time 
          ? [{ time: p0.time, value: p0.price }, p1] 
          : [p1, { time: p0.time, value: p0.price }]
        previewSeries.setData(data)
      }
    } else if (previewSeries) {
      try { chart.removeSeries(previewSeries) } catch {}
      previewSeries = null
    }
  })

  useResizeObserver(container, (entries) => {
    const entry = entries[0]
    if (!entry) return
    chart?.applyOptions({
      width:  entry.contentRect.width,
      height: entry.contentRect.height,
    })
  })
})

// ─── Update OHLC Info Bar — uses formatOHLC/calcChangeInfo ─
function updateOHLC(bar: any) {
  ohlcInfo.value   = formatOHLC(bar)
  infoPrice.value  = ohlcInfo.value.c
  const ci = calcChangeInfo(bar)
  infoChange.value    = ci.text
  infoChangePos.value = ci.positive
}

function formatIndicatorLabel(id: string) {
  const p = chartStore.getIndicatorParams(id as IndicatorId)
  if (!p) return id
  switch (id) {
    case 'SMA': return `SMA (${p.period1 ?? 20}, ${p.period2 ?? 50})`
    case 'EMA': return `EMA (${p.period1 ?? 9}, ${p.period2 ?? 21})`
    case 'BB': return `BB (${p.period1 ?? 20}, ${p.stdDev ?? 2})`
    case 'RSI': return `RSI (${p.period1 ?? 14})`
    case 'MACD': return `MACD (${p.fast ?? 12}, ${p.slow ?? 26}, ${p.signal ?? 9})`
    default: return id
  }
}

// ─── Indicators ───────────────────────────────────────────
function clearIndicatorSeries(id: string) {
  for (const s of (indicatorSeries[id] ?? [])) {
    try { chart.removeSeries(s) } catch (e) {
      console.warn('[indicator] removeSeries failed for', id, e)
    }
  }
  delete indicatorSeries[id]
  delete indicatorPanes[id]
  // Reset dedicated price scales when indicator removed
  if (id === 'RSI') {
    try { chart.priceScale('rsi').applyOptions({ scaleMargins: { top: 1, bottom: 0 } }) } catch {}
  }
  if (id === 'MACD') {
    try { chart.priceScale('macd').applyOptions({ scaleMargins: { top: 1, bottom: 0 } }) } catch {}
  }
}

async function applyAllIndicators(bars: Bar[]) {
  for (const id of chartStore.activeIndicators) await applyIndicator(id, bars)
}

async function applyIndicator(id: IndicatorId, bars?: Bar[]) {
  if (!chart || !candleSeries) return
  const data = bars ?? (await fetchOHLCV(effectiveSymbol.value, localTF.value, 500))
  clearIndicatorSeries(id)
  const c = indicatorColors
  const params = chartStore.getIndicatorParams(id)
  const script = buildIndicatorScript(id, params)
  if (!script) return

  let plots: Record<string, any[]> = {}
  try {
    plots = await runIndicator(script, data)
  } catch (err) {
    console.error(`[indicator] ${id} run failed:`, err)
    return
  }

  try {
    switch (id) {
      case 'SMA': {
        const k1 = `SMA${params.period1 ?? 20}`
        const k2 = `SMA${params.period2 ?? 50}`
        const s20 = chart.addSeries(LineSeries, { color: c.sma20, lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
        const s50 = chart.addSeries(LineSeries, { color: c.sma50, lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
        s20.setData(plots[k1] ?? [])
        s50.setData(plots[k2] ?? [])
        indicatorSeries[id] = [s20, s50]
        break
      }
      case 'EMA': {
        const k1 = `EMA${params.period1 ?? 9}`
        const k2 = `EMA${params.period2 ?? 21}`
        const e9  = chart.addSeries(LineSeries, { color: c.ema9,  lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
        const e21 = chart.addSeries(LineSeries, { color: c.sma50, lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
        e9.setData(plots[k1]  ?? [])
        e21.setData(plots[k2] ?? [])
        indicatorSeries[id] = [e9, e21]
        break
      }
      case 'BB': {
        const upper = chart.addSeries(LineSeries, { color: c.bbUpper, lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false })
        const mid   = chart.addSeries(LineSeries, { color: c.bbMid,   lineWidth: 1,               priceLineVisible: false, lastValueVisible: false })
        const lower = chart.addSeries(LineSeries, { color: c.bbLower, lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false })
        upper.setData(plots['BBUpper'] ?? [])
        mid.setData(plots['BBMid']     ?? [])
        lower.setData(plots['BBLower'] ?? [])
        indicatorSeries[id] = [upper, mid, lower]
        break
      }
      case 'VWAP': {
        const vs = chart.addSeries(LineSeries, { color: c.vwap, lineWidth: 2, priceLineVisible: false, lastValueVisible: true })
        vs.setData(plots['VWAP'] ?? [])
        indicatorSeries[id] = [vs]
        break
      }
      case 'RSI': {
        const scaleId = 'rsi'
        const rsiData = plots['RSI'] ?? []
        const { overbought, oversold } = getRsiLevels(params)
        const line = chart.addSeries(LineSeries, { color: c.rsi, lineWidth: 1, priceLineVisible: false, lastValueVisible: true, priceScaleId: scaleId })
        const ob   = chart.addSeries(LineSeries, { color: 'rgba(239,83,80,0.4)',  lineWidth: 1, lineStyle: 1, priceLineVisible: false, lastValueVisible: false, priceScaleId: scaleId })
        const os   = chart.addSeries(LineSeries, { color: 'rgba(38,166,154,0.4)', lineWidth: 1, lineStyle: 1, priceLineVisible: false, lastValueVisible: false, priceScaleId: scaleId })
        chart.priceScale(scaleId).applyOptions({ scaleMargins: { top: 0.8, bottom: 0 }, borderVisible: true })
        ob.setData(rsiData.map((p: any) => ({ time: p.time, value: overbought })))
        os.setData(rsiData.map((p: any) => ({ time: p.time, value: oversold })))
        line.setData(rsiData)
        indicatorSeries[id] = [line, ob, os]
        break
      }
      case 'MACD': {
        const scaleId = 'macd'
        const histData = (plots['Hist'] ?? []).map((p: any) => ({
          time:  p.time,
          value: p.value,
          color: p.value >= 0 ? c.histPos : c.histNeg,
        }))
        const hist    = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false, priceScaleId: scaleId })
        const macdL   = chart.addSeries(LineSeries, { color: c.macd,   lineWidth: 1, priceLineVisible: false, lastValueVisible: false, priceScaleId: scaleId })
        const signalL = chart.addSeries(LineSeries, { color: c.signal, lineWidth: 1, priceLineVisible: false, lastValueVisible: false, priceScaleId: scaleId })
        chart.priceScale(scaleId).applyOptions({ scaleMargins: { top: 0.8, bottom: 0 }, borderVisible: true })
        hist.setData(histData)
        macdL.setData(plots['MACD']   ?? [])
        signalL.setData(plots['Signal'] ?? [])
        indicatorSeries[id] = [hist, macdL, signalL]
        break
      }
    }
  } catch (err) {
    console.error(`[indicator] ${id} series render failed:`, err)
  }
}

// ─── Watchers ─────────────────────────────────────────────
function applySeriesColors() {
  if (!candleSeries) return
  const c = candleColors.value
  if (chartStore.chartType === 'bar')
    candleSeries.applyOptions({ upColor: c.upColor, downColor: c.downColor })
  else if (['candlestick', 'heikinashi'].includes(chartStore.chartType))
    candleSeries.applyOptions({ ...c })
}

watch(() => colorMode.value, () => {
  if (!chart) return
  chart.applyOptions(theme.value)
  applySeriesColors()
  if (currentBars.length)
    volumeSeries?.setData(currentBars.map(b => ({
      time:  b.time, value: b.volume,
      color: b.close >= b.open ? indicatorColors.histPos : indicatorColors.histNeg,
    })))
})

watch(() => chartStore.candleColorMode, () => { applySeriesColors() })

watch(() => chartStore.activeTool, (tool) => {
  dm.syncActiveTool(tool)
})

watch(() => dm.isDrawingInProgress, (v) => {
  chartStore.setDrawingInProgress(v)
})

watch(
  () => [...chartStore.activeIndicators],
  async (newInds, oldInds) => {
    for (const ind of newInds) { if (!oldInds.includes(ind)) await applyIndicator(ind as IndicatorId) }
    for (const ind of oldInds) { if (!newInds.includes(ind)) clearIndicatorSeries(ind) }
    // Same set but new array reference → settings refresh (triggered by IndicatorSettingsModal)
    if (newInds.length === oldInds.length && newInds.every(i => oldInds.includes(i)) && newInds.length > 0) {
      for (const id of newInds) {
        clearIndicatorSeries(id)
        await applyIndicator(id as IndicatorId, currentBars.length ? currentBars : undefined)
      }
    }
  },
)

watch(
  () => [effectiveSymbol.value, localTF.value] as [string, string],
  async ([sym, tf]) => {
    if (!chart) return
    autoSaveDrawings()
    infoSymbol.value = sym
    isLoading.value = true
    try {
      const bars = await fetchOHLCV(sym, tf, 500)
      currentBars = bars
      candleSeries.setData(getSeriesData(bars, chartStore.chartType))
      volumeSeries.setData(bars.map((b: Bar) => ({
        time: b.time, value: b.volume,
        color: b.close >= b.open ? indicatorColors.histPos : indicatorColors.histNeg,
      })))
      for (const id of Object.keys(indicatorSeries)) clearIndicatorSeries(id)
      await applyAllIndicators(bars)
      dm.detach()
      attachDrawings(sym)
      // Reconnect WS to correct symbol + timeframe
      connectRealtime(sym, tf)
    } finally {
      isLoading.value = false
    }
  },
)

watch(() => chartStore.chartType, async (type) => {
  if (!chart || !currentBars.length) return
  const sym = effectiveSymbol.value
  autoSaveDrawings()
  candleSeries = createMainSeries(type)
  candleSeries.setData(getSeriesData(currentBars, type))
  dm.detach()
  attachDrawings(sym)
})

watch(
  () => [
    chartStore.fibLevels,
    chartStore.fibShowPrices,
    chartStore.fibShowPercentages,
    chartStore.fibExtendLines,
  ],
  () => {
    if (!dm.drawingManager) return
    const selected = dm.drawingManager.getSelectedDrawing()
    if (selected && selected.type === 'fib-retracement') {
      ;(selected as any).setFibOptions({
        levels: chartStore.activeFibLevels,
        showPrices: chartStore.fibShowPrices,
        showPercentages: chartStore.fibShowPercentages,
        extendLines: chartStore.fibExtendLines,
      })
      autoSaveDrawings()
    }
  },
  { deep: true }
)

function onSetTF(tf: string) { localTF.value = tf }

// ─── Cleanup ──────────────────────────────────────────────
onUnmounted(() => {
  autoSaveDrawings()
  dm.detach()
  wsClose?.()
  chart?.remove()
  container.value?.removeEventListener('mousedown', handleContainerMouseDown, { capture: true })
  document.removeEventListener('mousemove', handleDocumentMouseMove)
  document.removeEventListener('mouseup',   handleDocumentMouseUp)
  document.removeEventListener('keydown',   handleKeyDown)
})
</script>

<template>
  <div class="flex flex-col h-full bg-chart-bg overflow-hidden">

    <!-- ── Info Bar ── -->
    <div class="flex items-center gap-3 px-3 py-1.5 bg-chart-surface
                border-b border-chart-border text-xs font-mono shrink-0">
      <span class="font-bold text-white text-sm">{{ infoSymbol }}</span>
      <span :class="infoChangePos ? 'text-bullish' : 'text-bearish'" class="font-bold">
        {{ infoPrice }}
      </span>
      <span :class="infoChangePos ? 'text-bullish' : 'text-bearish'">{{ infoChange }}</span>
      <span class="text-chart-muted">O <span class="text-chart-text">{{ ohlcInfo.o }}</span></span>
      <span class="text-chart-muted">H <span class="text-bullish">{{ ohlcInfo.h }}</span></span>
      <span class="text-chart-muted">L <span class="text-bearish">{{ ohlcInfo.l }}</span></span>
      <span class="text-chart-muted">C <span class="text-chart-text">{{ ohlcInfo.c }}</span></span>
      <span class="text-chart-muted">V <span class="text-chart-text">{{ ohlcInfo.v }}</span></span>
      <div class="flex gap-1 ml-auto">
        <span
          v-for="ind in chartStore.activeIndicators"
          :key="ind"
          class="px-1.5 py-0.5 rounded text-[10px] bg-chart-border text-chart-text"
        >{{ formatIndicatorLabel(ind) }}</span>
      </div>
    </div>

    <!-- ── Chart Topbar ── -->
    <DashboardChartTopbar
      :current-tf="localTF"
      :symbol="effectiveSymbol"
      :group="localGroup as any"
      @update:tf="onSetTF"
      @toggle-alerts="showAlerts = !showAlerts"
      @update:symbol="onSetSymbol"
      @update:group="onSetGroup"
    />

    <div class="flex flex-1 w-full min-h-0 relative">
      <!-- ── Drawing Sidebar ── -->
      <DashboardDrawingSidebar
        @remove-selected="onRemoveSelectedDrawing"
        @clear-all="onClearAllDrawings"
      />

      <!-- ── Chart Canvas ── -->
      <div class="relative flex-1 h-full min-w-0">
      <DashboardChartAlertsPanel v-show="showAlerts" />
      
      <!-- Loading overlay -->
      <div v-if="isLoading"
           class="absolute inset-0 z-10 flex items-center justify-center
                  bg-chart-bg/80 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-2">
          <div class="w-8 h-8 border-2 border-ind-sma border-t-transparent
                      rounded-full animate-spin"/>
          <span class="text-chart-muted text-xs font-mono">Loading...</span>
        </div>
      </div>

      <div ref="container" class="w-full h-full" />

      <!-- Text annotation inline editor -->
      <div
        v-if="textEdit"
        class="absolute z-50 pointer-events-auto"
        :style="{ left: textEdit.x + 'px', top: textEdit.y + 'px' }"
      >
        <input
          ref="textEditInput"
          v-model="textEdit.text"
          class="text-sm px-2 py-1 rounded shadow-lg outline-none min-w-[120px]"
          style="background:#1e2a38;color:#e6edf3;border:1px solid #58a6ff"
          placeholder="Enter label..."
          @keyup.enter="commitTextEdit"
          @keyup.escape="textEdit = null"
          @blur="commitTextEdit"
        />
      </div>
      </div>
    </div>
  </div>
</template>
