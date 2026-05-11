<!-- components/widgets/OpenInterest.vue -->
<script setup lang="ts">
interface OIEntry {
  symbol: string
  oi: number        // millions USD
  change24h: number // percentage
  longPct: number   // 0-100
}

const data = ref<OIEntry[]>([
  { symbol: 'BTC',  oi: 18420, change24h:  2.4, longPct: 55 },
  { symbol: 'ETH',  oi:  9310, change24h: -1.2, longPct: 48 },
  { symbol: 'SOL',  oi:  3840, change24h:  5.7, longPct: 62 },
  { symbol: 'BNB',  oi:  1920, change24h:  0.9, longPct: 51 },
  { symbol: 'XRP',  oi:  1540, change24h: -3.1, longPct: 43 },
  { symbol: 'DOGE', oi:   870, change24h:  8.2, longPct: 67 },
  { symbol: 'ADA',  oi:   560, change24h: -0.5, longPct: 49 },
  { symbol: 'AVAX', oi:   490, change24h:  3.3, longPct: 58 },
])

function formatOI(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}
function changeColor(v: number) {
  return v >= 0 ? 'var(--bullish)' : 'var(--bearish)'
}
function longColor(pct: number) {
  if (pct >= 55) return 'var(--bullish)'
  if (pct <= 45) return 'var(--bearish)'
  return 'var(--text-muted)'
}
</script>

<template>
  <div class="flex flex-col h-full font-mono text-xs" style="background:var(--chart-bg)">

    <!-- Header -->
    <div class="px-3 py-1.5 shrink-0 flex items-center justify-between"
         style="background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      <span class="font-bold flex items-center gap-1.5" style="color:var(--text-primary)">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="4" height="6" x="2" y="14" rx="1"/><rect width="4" height="12" x="10" y="8" rx="1"/><rect width="4" height="16" x="18" y="4" rx="1"/></svg>
        Open Interest
      </span>
      <span class="text-[10px] animate-pulse" style="color:var(--bullish)">● LIVE</span>
    </div>

    <!-- Column headers -->
    <div class="grid px-3 py-1 text-[10px] shrink-0"
         style="grid-template-columns:3fr 3fr 2fr 4fr;color:var(--text-muted);border-bottom:1px solid var(--chart-border)">
      <span>Symbol</span>
      <span class="text-right">OI</span>
      <span class="text-right">24h</span>
      <span class="text-right">L/S Ratio</span>
    </div>

    <!-- Rows -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="row in data"
        :key="row.symbol"
        class="grid px-3 py-1.5 border-b"
        style="grid-template-columns:3fr 3fr 2fr 4fr;border-color:var(--chart-border)"
      >
        <span style="color:var(--text-primary)">{{ row.symbol }}</span>
        <span class="text-right" style="color:var(--text-primary)">{{ formatOI(row.oi) }}</span>
        <span class="text-right font-bold" :style="{ color: changeColor(row.change24h) }">
          {{ row.change24h >= 0 ? '+' : '' }}{{ row.change24h.toFixed(1) }}%
        </span>
        <!-- Long/Short bar -->
        <div class="flex items-center gap-1 justify-end">
          <span :style="{ color: longColor(row.longPct) }">{{ row.longPct }}%</span>
          <div class="w-12 h-1.5 rounded-full overflow-hidden" style="background:var(--bearish-bg)">
            <div
              class="h-full rounded-full"
              :style="{ width: row.longPct + '%', background: longColor(row.longPct) }"
            />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
