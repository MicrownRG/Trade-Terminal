<!-- components/widgets/MarketStats.vue -->
<script setup lang="ts">
const chartStore = useChartStore()

interface Stat {
  label: string
  value: string
  sub?:  string
  color?: string
}

const stats    = ref<Stat[]>([])
const isLoading = ref(true)

async function loadStats() {
  try {
    const sym  = chartStore.symbol
    const data = await $fetch<any>('/api/ticker', {
      params: { symbols: JSON.stringify([sym]) },
    })
    const t = Array.isArray(data) ? data[0] : data

    if (!t) return

    const price    = parseFloat(t.lastPrice)
    const chgPct   = parseFloat(t.priceChangePercent)
    const high24   = parseFloat(t.highPrice)
    const low24    = parseFloat(t.lowPrice)
    const vol24    = parseFloat(t.volume)
    const volQuote = parseFloat(t.quoteVolume)
    const trades   = parseInt(t.count)

    // ATH position
    const range = high24 - low24
    const pos   = range > 0 ? ((price - low24) / range) * 100 : 50

    stats.value = [
      {
        label: 'Last Price',
        value: price.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        sub:   `${chgPct >= 0 ? '+' : ''}${chgPct.toFixed(2)}%`,
        color: chgPct >= 0 ? 'var(--bullish)' : 'var(--bearish)',
      },
      {
        label: '24h High',
        value: high24.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        color: 'var(--bullish)',
      },
      {
        label: '24h Low',
        value: low24.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        color: 'var(--bearish)',
      },
      {
        label: '24h Volume',
        value: vol24 > 1_000_000
          ? (vol24 / 1_000_000).toFixed(2) + 'M'
          : vol24 > 1_000
            ? (vol24 / 1_000).toFixed(2) + 'K'
            : vol24.toFixed(2),
        sub: sym.replace('USDT', ''),
      },
      {
        label: 'Quote Volume',
        value: volQuote > 1_000_000_000
          ? '$' + (volQuote / 1_000_000_000).toFixed(2) + 'B'
          : '$' + (volQuote / 1_000_000).toFixed(2) + 'M',
      },
      {
        label: '# Trades',
        value: trades.toLocaleString(),
        sub: '24h',
      },
      {
        label: '24h Range',
        value: pos.toFixed(0) + '%',
        sub: 'position in range',
        color: pos > 60
          ? 'var(--bullish)'
          : pos < 40
            ? 'var(--bearish)'
            : 'var(--text-muted)',
      },
    ]

    isLoading.value = false
  }
  catch (e) {
    console.error('[MarketStats]', e)
    isLoading.value = false
  }
}

// Range bar position
const rangePos = computed(() => {
  const s = stats.value.find(s => s.label === '24h Range')
  return s ? parseFloat(s.value) : 50
})

onMounted(() => {
  loadStats()
  const timer = setInterval(loadStats, 10_000)
  onUnmounted(() => clearInterval(timer))
})

watch(() => chartStore.symbol, loadStats)
</script>

<template>
  <div class="flex flex-col h-full font-mono text-xs overflow-hidden"
       style="background: var(--chart-bg)">

    <!-- Header -->
    <div class="px-3 py-1.5 bg-chart-surface border-b border-chart-border text-chart-muted shrink-0 flex items-center justify-between">
      <span class="text-chart-text font-bold flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Market Stats
      </span>
      <span class="text-[10px] font-mono text-chart-muted">{{ chartStore.symbol }}</span>
    </div>

    <!-- Loading -->
    <div v-if="isLoading"
         class="flex-1 flex items-center justify-center">
      <div class="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
           style="border-color: var(--ind-sma); border-top-color: transparent" />
    </div>

    <!-- Stats Grid -->
    <div v-else class="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-1.5 content-start">
      <div
        v-for="s in stats"
        :key="s.label"
        class="rounded p-2"
        style="background: var(--bg-secondary); border: 1px solid var(--border-subtle)"
      >
        <div class="text-[10px] mb-1" style="color: var(--text-muted)">
          {{ s.label }}
        </div>
        <div class="font-bold text-sm leading-tight"
             :style="{ color: s.color ?? 'var(--text-primary)' }">
          {{ s.value }}
        </div>
        <div v-if="s.sub" class="text-[10px] mt-0.5"
             :style="{ color: s.color ?? 'var(--text-muted)' }">
          {{ s.sub }}
        </div>
      </div>

      <!-- Range Visualizer -->
      <div class="col-span-2 rounded p-2"
           style="background: var(--bg-secondary); border: 1px solid var(--border-subtle)">
        <div class="flex justify-between text-[10px] mb-1.5"
             style="color: var(--text-muted)">
          <span style="color: var(--bearish)">Low</span>
          <span>24h Price Range</span>
          <span style="color: var(--bullish)">High</span>
        </div>
        <div class="relative h-2 rounded-full overflow-visible"
             style="background: var(--bg-tertiary)">
          <!-- Gradient bar -->
          <div class="absolute inset-0 rounded-full opacity-40"
               style="background: linear-gradient(to right, var(--bearish), var(--bullish))" />
          <!-- Current position marker -->
          <div
            class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full
                   border-2 transition-all duration-500 shadow-lg"
            style="border-color: var(--chart-bg); background: var(--text-primary)"
            :style="{ left: `calc(${rangePos}% - 6px)` }"
          />
        </div>
        <div class="flex justify-between text-[10px] mt-1"
             style="color: var(--text-muted)">
          <span>{{ stats.find(s => s.label === '24h Low')?.value }}</span>
          <span :style="{ color: rangePos > 60 ? 'var(--bullish)'
                          : rangePos < 40 ? 'var(--bearish)' : 'var(--text-muted)' }">
            {{ rangePos.toFixed(0) }}%
          </span>
          <span>{{ stats.find(s => s.label === '24h High')?.value }}</span>
        </div>
      </div>
    </div>

  </div>
</template>