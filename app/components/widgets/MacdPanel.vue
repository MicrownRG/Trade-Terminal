<!-- components/widgets/MacdPanel.vue -->
<script setup lang="ts">
import { createChart, LineSeries, HistogramSeries } from 'lightweight-charts'
import { fetchOHLCV } from '~/composables/useMarketData'
import type { Bar } from '~/types'

const props      = defineProps<{ symbol?: string }>()
const chartStore = useChartStore()
const colorMode  = useColorMode()
const { current: theme } = useChartTheme()
const container  = ref<HTMLElement | null>(null)
const isLoading  = ref(true)
let chart: any        = null
let macdSeries: any   = null
let signalSeries: any = null
let histSeries: any   = null

// Manual MACD calculation so we don't need PineTS / network fetch per reload
function calcMACD(bars: Bar[], fast = 12, slow = 26, signal = 9) {
  function ema(data: number[], period: number) {
    const k = 2 / (period + 1)
    const out: number[] = []
    let prev = data[0]!
    for (const v of data) {
      const e = v * k + prev * (1 - k)
      out.push(e)
      prev = e
    }
    return out
  }

  const closes  = bars.map(b => b.close)
  const fastEMA = ema(closes, fast)
  const slowEMA = ema(closes, slow)
  const macdLine = fastEMA.map((v, i) => v - slowEMA[i]!)

  const signalLine = ema(macdLine.slice(slow - 1), signal)
  const offset     = slow - 1

  const macdPts:   { time: number; value: number }[] = []
  const signalPts: { time: number; value: number }[] = []
  const histPts:   { time: number; value: number; color: string }[] = []

  for (let i = signal - 1; i < signalLine.length; i++) {
    const barIdx = offset + i
    const bar    = bars[barIdx]
    if (!bar) continue
    const m  = macdLine[barIdx] ?? 0
    const s  = signalLine[i] ?? 0
    const h  = m - s
    macdPts.push({ time: bar.time, value: +m.toFixed(6) })
    signalPts.push({ time: bar.time, value: +s.toFixed(6) })
    histPts.push({
      time:  bar.time,
      value: +h.toFixed(6),
      color: h >= 0 ? 'rgba(63,185,80,0.6)' : 'rgba(248,81,73,0.6)',
    })
  }

  return { macdPts, signalPts, histPts }
}

function getMacdParams() {
  const p = chartStore.getIndicatorParams('MACD')
  return {
    fast:   Math.max(1, (p.fast   ?? 12) as number),
    slow:   Math.max(1, (p.slow   ?? 26) as number),
    signal: Math.max(1, (p.signal ?? 9)  as number),
  }
}

async function loadMACD(sym: string) {
  if (!macdSeries || !signalSeries || !histSeries) return
  isLoading.value = true
  try {
    const { fast, slow, signal } = getMacdParams()
    const bars = await fetchOHLCV(sym, chartStore.timeframe, 500)
    const { macdPts, signalPts, histPts } = calcMACD(bars, fast, slow, signal)
    macdSeries.setData(macdPts)
    signalSeries.setData(signalPts)
    histSeries.setData(histPts)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (!container.value) return

  chart = createChart(container.value, {
    width:  container.value.clientWidth,
    height: container.value.clientHeight,
    layout: theme.value.layout,
    grid:   theme.value.grid,
    rightPriceScale: {
      borderColor: theme.value.rightPriceScale.borderColor,
      scaleMargins: { top: 0.1, bottom: 0.1 },
    },
    timeScale: theme.value.timeScale,
  })

  macdSeries = chart.addSeries(LineSeries, {
    color: '#79c0ff', lineWidth: 1,
    priceLineVisible: false, lastValueVisible: true,
  })
  signalSeries = chart.addSeries(LineSeries, {
    color: '#ff7b72', lineWidth: 1,
    priceLineVisible: false, lastValueVisible: true,
  })
  histSeries = chart.addSeries(HistogramSeries, {
    priceLineVisible: false, lastValueVisible: false,
  })

  await loadMACD(props.symbol ?? chartStore.symbol)

  useResizeObserver(container, (entries) => {
    const entry = entries[0]
    if (entry) chart?.applyOptions({ width: entry.contentRect.width, height: entry.contentRect.height })
  })
})

watch(() => [props.symbol ?? chartStore.symbol, chartStore.timeframe] as [string, string], ([sym]) => {
  loadMACD(sym)
})

watch(() => chartStore.indicatorSettings['MACD'], () => {
  loadMACD(props.symbol ?? chartStore.symbol)
}, { deep: true })

watch(() => colorMode.value, (mode) => {
  const { themes } = useChartTheme()
  chart?.applyOptions(themes[mode as 'dark' | 'light'] ?? themes.dark)
})

onUnmounted(() => chart?.remove())
</script>

<template>
  <div class="flex flex-col h-full bg-chart-bg">
    <div class="px-3 py-1 bg-chart-surface border-b border-chart-border
                text-xs font-mono text-chart-muted shrink-0 flex items-center gap-2">
      <span class="font-bold" style="color: #79c0ff">MACD</span>
      <span class="text-[10px]">
        {{ getMacdParams().fast }},{{ getMacdParams().slow }},{{ getMacdParams().signal }}
      </span>
      <span class="text-[10px] ml-1" style="color: #ff7b72">Signal</span>
    </div>
    <div class="relative flex-1">
      <div v-if="isLoading"
           class="absolute inset-0 flex items-center justify-center bg-chart-bg/80">
        <div class="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
             style="border-color:#79c0ff;border-top-color:transparent"/>
      </div>
      <div ref="container" class="w-full h-full" />
    </div>
  </div>
</template>
