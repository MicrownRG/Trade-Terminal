<!-- components/widgets/StochPanel.vue -->
<script setup lang="ts">
import { createChart, LineSeries } from 'lightweight-charts'
import { fetchOHLCV } from '~/composables/useMarketData'
import type { Bar } from '~/types'

const props = defineProps<{ symbol?: string }>()
const chartStore = useChartStore()
const colorMode  = useColorMode()
const { current: theme } = useChartTheme()
const container  = ref<HTMLElement | null>(null)
const isLoading  = ref(true)
const kValue     = ref<number | null>(null)
const dValue     = ref<number | null>(null)
let chart: any   = null
let kSeries: any = null
let dSeries: any = null

function calcStoch(bars: Bar[], kPeriod = 14, dPeriod = 3): { k: {time:number;value:number}[]; d: {time:number;value:number}[] } {
  const k: {time:number;value:number}[] = []
  for (let i = kPeriod - 1; i < bars.length; i++) {
    const slice = bars.slice(i - kPeriod + 1, i + 1)
    const high  = Math.max(...slice.map(b => b.high))
    const low   = Math.min(...slice.map(b => b.low))
    const close = bars[i]!.close
    const kVal  = low === high ? 50 : +((close - low) / (high - low) * 100).toFixed(2)
    k.push({ time: bars[i]!.time, value: kVal })
  }
  const d: {time:number;value:number}[] = []
  for (let i = dPeriod - 1; i < k.length; i++) {
    const avg = k.slice(i - dPeriod + 1, i + 1).reduce((s, v) => s + v.value, 0) / dPeriod
    d.push({ time: k[i]!.time, value: +avg.toFixed(2) })
  }
  return { k, d }
}

async function loadStoch(sym: string) {
  isLoading.value = true
  const bars = await fetchOHLCV(sym, chartStore.timeframe, 300)
  const { k, d } = calcStoch(bars)
  if (kSeries && k.length) {
    kSeries.setData(k)
    dSeries.setData(d)
    kValue.value = k[k.length - 1]?.value ?? null
    dValue.value = d[d.length - 1]?.value ?? null
  }
  isLoading.value = false
}

function buildChart() {
  if (!container.value || chart) return
  chart = createChart(container.value, {
    layout: { background: { color: 'transparent' }, textColor: theme.value.layout.textColor },
    grid: { vertLines: { color: theme.value.grid.vertLines.color }, horzLines: { color: theme.value.grid.horzLines.color } },
    timeScale: { visible: false },
    rightPriceScale: { borderColor: theme.value.rightPriceScale.borderColor },
    crosshair: { mode: 1 },
  })
  kSeries = chart.addSeries(LineSeries, { color: '#58a6ff', lineWidth: 1, priceLineVisible: false })
  dSeries = chart.addSeries(LineSeries, { color: '#f0883e', lineWidth: 1, priceLineVisible: false })
  chart.priceScale('right').applyOptions({ autoScale: false, minimum: 0, maximum: 100 })
  kSeries.createPriceLine({ price: 80, color: '#f85149', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'OB' })
  kSeries.createPriceLine({ price: 20, color: '#3fb950', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'OS' })
}

onMounted(async () => {
  buildChart()
  await loadStoch(props.symbol ?? chartStore.symbol)
  new ResizeObserver(() => chart?.applyOptions({ width: container.value?.clientWidth }))
    .observe(container.value!)
})

watch(() => props.symbol ?? chartStore.symbol, (sym) => loadStoch(sym))
watch(() => chartStore.timeframe,              ()    => loadStoch(props.symbol ?? chartStore.symbol))
watch(colorMode, () => {
  chart?.applyOptions({ layout: { textColor: theme.value.layout.textColor }, grid: { vertLines: { color: theme.value.grid.vertLines.color }, horzLines: { color: theme.value.grid.horzLines.color } } })
})

onUnmounted(() => { chart?.remove(); chart = null })
</script>

<template>
  <div class="flex flex-col h-full" style="background:var(--chart-bg)">
    <!-- Header -->
    <div class="px-3 py-1 shrink-0 flex items-center justify-between text-[10px] font-mono"
         style="background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      <span class="font-bold flex items-center gap-1.5" style="color:var(--text-primary)">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Stochastic
      </span>
      <div class="flex items-center gap-3">
        <span style="color:#58a6ff">%K {{ kValue?.toFixed(1) ?? '—' }}</span>
        <span style="color:#f0883e">%D {{ dValue?.toFixed(1) ?? '—' }}</span>
        <span v-if="isLoading" style="color:var(--text-muted)">Loading…</span>
      </div>
    </div>
    <!-- Chart -->
    <div ref="container" class="flex-1" />
  </div>
</template>
