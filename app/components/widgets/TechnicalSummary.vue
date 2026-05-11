<!-- components/widgets/TechnicalSummary.vue -->
<script setup lang="ts">
const chartStore = useChartStore()

type Signal = 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL'

interface TFRow {
  tf: string
  buy: number
  neutral: number
  sell: number
  signal: Signal
}

function toSignal(buy: number, sell: number): Signal {
  const diff = buy - sell
  if (diff >= 8)  return 'STRONG BUY'
  if (diff >= 3)  return 'BUY'
  if (diff <= -8) return 'STRONG SELL'
  if (diff <= -3) return 'SELL'
  return 'NEUTRAL'
}

// Pseudo-realistic mock data seeded from current symbol
const rows = computed<TFRow[]>(() => {
  const seed = chartStore.symbol.charCodeAt(0) % 5
  const base = [
    { tf: '1m',  buy: 8,  neutral: 4, sell: 4  },
    { tf: '5m',  buy: 10, neutral: 3, sell: 3  },
    { tf: '15m', buy: 7,  neutral: 5, sell: 4  },
    { tf: '1h',  buy: 12, neutral: 4, sell: 0  },
    { tf: '4h',  buy: 9,  neutral: 2, sell: 5  },
    { tf: '1d',  buy: 6,  neutral: 3, sell: 7  },
  ]
  return base.map(r => ({
    ...r,
    buy:  Math.max(0, r.buy  + seed - 2),
    sell: Math.max(0, r.sell + (2 - seed)),
    signal: toSignal(r.buy + seed - 2, r.sell + (2 - seed)),
  }))
})

const overallSignal = computed<Signal>(() => {
  const totalBuy  = rows.value.reduce((a, r) => a + r.buy,  0)
  const totalSell = rows.value.reduce((a, r) => a + r.sell, 0)
  return toSignal(totalBuy / rows.value.length, totalSell / rows.value.length)
})

function signalColor(s: Signal) {
  if (s === 'STRONG BUY')  return 'var(--bullish)'
  if (s === 'BUY')         return '#56d364'
  if (s === 'STRONG SELL') return 'var(--bearish)'
  if (s === 'SELL')        return '#f0883e'
  return 'var(--text-muted)'
}
</script>

<template>
  <div class="flex flex-col h-full font-mono text-xs" style="background:var(--chart-bg)">

    <!-- Header -->
    <div class="px-3 py-1.5 shrink-0 flex items-center justify-between"
         style="background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      <span class="font-bold flex items-center gap-1.5" style="color:var(--text-primary)">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
        Technical Summary
      </span>
      <span class="text-[10px]" style="color:var(--text-muted)">{{ chartStore.symbol }}</span>
    </div>

    <!-- Overall signal -->
    <div class="flex items-center justify-between px-3 py-2 shrink-0"
         style="border-bottom:1px solid var(--chart-border)">
      <span style="color:var(--text-muted)">Overall</span>
      <span class="font-bold text-sm" :style="{ color: signalColor(overallSignal) }">
        {{ overallSignal }}
      </span>
    </div>

    <!-- Column headers -->
    <div class="grid grid-cols-5 px-3 py-1 text-[10px] shrink-0"
         style="color:var(--text-muted);border-bottom:1px solid var(--chart-border)">
      <span>TF</span>
      <span class="text-center" style="color:var(--bullish)">Buy</span>
      <span class="text-center">Neutral</span>
      <span class="text-center" style="color:var(--bearish)">Sell</span>
      <span class="text-right">Signal</span>
    </div>

    <!-- Timeframe rows -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="row in rows"
        :key="row.tf"
        class="grid grid-cols-5 px-3 py-1.5 border-b"
        style="border-color:var(--chart-border)"
      >
        <span style="color:var(--text-primary)">{{ row.tf }}</span>
        <span class="text-center" style="color:var(--bullish)">{{ row.buy }}</span>
        <span class="text-center" style="color:var(--text-muted)">{{ row.neutral }}</span>
        <span class="text-center" style="color:var(--bearish)">{{ row.sell }}</span>
        <span class="text-right text-[10px] font-bold" :style="{ color: signalColor(row.signal) }">
          {{ row.signal }}
        </span>
      </div>
    </div>

  </div>
</template>
