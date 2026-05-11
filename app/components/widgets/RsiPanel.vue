<!-- components/widgets/RsiPanel.vue -->
<script setup lang="ts">
import { createChart, LineSeries } from 'lightweight-charts'
import { fetchOHLCV } from '~/composables/useMarketData'
import { getRsiLevels } from '~/composables/useIndicators'
import type { Bar } from '~/types'

const props = defineProps<{ symbol?: string }>()
const chartStore = useChartStore()
const colorMode  = useColorMode()
const { current: theme } = useChartTheme()
const container  = ref<HTMLElement | null>(null)
const isLoading  = ref(true)
const rsiValue   = ref<number | null>(null)
let chart: any   = null
let rsiSeries: any = null
let obLine: any  = null
let osLine: any  = null

// ── Manual RSI-14 calculation ─────────────────────────────
function calcRSI(bars: Bar[], period = 14) {
  const closes = bars.map(b => b.close)
  const result: { time: number; value: number }[] = []
  if (closes.length < period + 1) return result

  let avgGain = 0, avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const diff = closes[i]! - closes[i - 1]!
    if (diff > 0) avgGain += diff
    else avgLoss += Math.abs(diff)
  }
  avgGain /= period
  avgLoss /= period

  for (let i = period; i < closes.length; i++) {
    if (i > period) {
      const diff = closes[i]! - closes[i - 1]!
      avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period
      avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    result.push({ time: bars[i]!.time, value: +(100 - 100 / (1 + rs)).toFixed(2) })
  }
  return result
}

async function loadRSI(sym: string) {
  isLoading.value = true
  const params = chartStore.getIndicatorParams('RSI')
  const period = Math.max(1, (params.period1 ?? 14) as number)
  const bars = await fetchOHLCV(sym, chartStore.timeframe, 500)
  const data = calcRSI(bars, period)
  if (rsiSeries && data.length) {
    rsiSeries.setData(data)
    rsiValue.value = data[data.length - 1]?.value ?? null
  }
  isLoading.value = false
}

onMounted(async () => {
  if (!container.value) return

  chart = createChart(container.value, {
    width:  container.value.clientWidth,
    height: container.value.clientHeight,
    layout: theme.value.layout,
    grid:   theme.value.grid,
    rightPriceScale: {
      borderColor: '#21262d',
      scaleMargins: { top: 0.05, bottom: 0.05 },
    },
    timeScale: theme.value.timeScale,
  })

  rsiSeries = chart.addSeries(LineSeries, {
    color: '#d2a8ff',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: true,
  })

  const { overbought, oversold } = getRsiLevels(chartStore.getIndicatorParams('RSI'))
  obLine = rsiSeries.createPriceLine({ price: overbought, color: '#f85149', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'OB' })
  rsiSeries.createPriceLine({ price: 50, color: '#8b949e', lineWidth: 1, lineStyle: 3, axisLabelVisible: false, title: '' })
  osLine = rsiSeries.createPriceLine({ price: oversold, color: '#3fb950', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'OS' })

  await loadRSI(props.symbol ?? chartStore.symbol)

  useResizeObserver(container, (entries) => {
    const entry = entries[0]
    if (entry) chart?.applyOptions({ width: entry.contentRect.width, height: entry.contentRect.height })
  })
})

watch(() => [chartStore.symbol, chartStore.timeframe], () => {
  loadRSI(props.symbol ?? chartStore.symbol)
})

watch(() => chartStore.indicatorSettings['RSI'], () => {
  if (!obLine || !osLine) return
  const { overbought, oversold } = getRsiLevels(chartStore.getIndicatorParams('RSI'))
  obLine.applyOptions({ price: overbought })
  osLine.applyOptions({ price: oversold })
  loadRSI(props.symbol ?? chartStore.symbol)
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
      <span class="font-bold" style="color:#d2a8ff">RSI</span>
      <span>{{ chartStore.getIndicatorParams('RSI').period1 ?? 14 }}</span>
      <span v-if="rsiValue !== null"
            :style="rsiValue >= getRsiLevels(chartStore.getIndicatorParams('RSI')).overbought ? 'color:#f85149'
                  : rsiValue <= getRsiLevels(chartStore.getIndicatorParams('RSI')).oversold   ? 'color:#3fb950'
                  : 'color:#8b949e'"
            class="font-bold">
        {{ rsiValue.toFixed(1) }}
      </span>
      <span class="ml-auto text-[10px]">
        OB:{{ getRsiLevels(chartStore.getIndicatorParams('RSI')).overbought }}
        OS:{{ getRsiLevels(chartStore.getIndicatorParams('RSI')).oversold }}
      </span>
    </div>
    <div class="relative flex-1">
      <div v-if="isLoading"
           class="absolute inset-0 flex items-center justify-center bg-chart-bg/80">
        <div class="w-5 h-5 border-2 rounded-full animate-spin"
             style="border-color:#d2a8ff;border-top-color:transparent"/>
      </div>
      <div ref="container" class="w-full h-full" />
    </div>
  </div>
</template>
