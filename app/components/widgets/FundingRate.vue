<!-- components/widgets/FundingRate.vue -->
<script setup lang="ts">
interface FundingEntry {
  symbol: string
  rate: number      // percentage, e.g. 0.01 = 0.01%
  nextFunding: string
}

const data = ref<FundingEntry[]>([
  { symbol: 'BTC',  rate:  0.0100, nextFunding: '02:14:33' },
  { symbol: 'ETH',  rate:  0.0082, nextFunding: '02:14:33' },
  { symbol: 'SOL',  rate:  0.0145, nextFunding: '02:14:33' },
  { symbol: 'BNB',  rate: -0.0031, nextFunding: '02:14:33' },
  { symbol: 'XRP',  rate:  0.0055, nextFunding: '02:14:33' },
  { symbol: 'DOGE', rate: -0.0012, nextFunding: '02:14:33' },
  { symbol: 'ADA',  rate:  0.0023, nextFunding: '02:14:33' },
  { symbol: 'AVAX', rate:  0.0198, nextFunding: '02:14:33' },
  { symbol: 'LINK', rate: -0.0087, nextFunding: '02:14:33' },
  { symbol: 'DOT',  rate:  0.0041, nextFunding: '02:14:33' },
])

// Countdown timer
const countdown = ref('02:14:33')
onMounted(() => {
  const timer = setInterval(() => {
    const [h, m, s] = countdown.value.split(':').map(Number)
    let total = (h! * 3600) + (m! * 60) + s! - 1
    if (total < 0) total = 8 * 3600
    const hh = String(Math.floor(total / 3600)).padStart(2, '0')
    const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
    const ss = String(total % 60).padStart(2, '0')
    countdown.value = `${hh}:${mm}:${ss}`
    data.value = data.value.map(e => ({ ...e, nextFunding: countdown.value }))
  }, 1000)
  onUnmounted(() => clearInterval(timer))
})

function rateColor(rate: number) {
  if (rate > 0.005)  return 'var(--bearish)'
  if (rate < -0.005) return 'var(--bullish)'
  return 'var(--text-muted)'
}
function rateLabel(rate: number) {
  return (rate >= 0 ? '+' : '') + rate.toFixed(4) + '%'
}
</script>

<template>
  <div class="flex flex-col h-full font-mono text-xs" style="background:var(--chart-bg)">

    <!-- Header -->
    <div class="px-3 py-1.5 shrink-0 flex items-center justify-between"
         style="background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      <span class="font-bold flex items-center gap-1.5" style="color:var(--text-primary)">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Funding Rate
      </span>
      <span class="text-[10px]" style="color:var(--text-muted)">Next {{ countdown }}</span>
    </div>

    <!-- Column headers -->
    <div class="grid grid-cols-3 px-3 py-1 text-[10px] shrink-0"
         style="color:var(--text-muted);border-bottom:1px solid var(--chart-border)">
      <span>Symbol</span>
      <span class="text-right">Rate</span>
      <span class="text-right">Countdown</span>
    </div>

    <!-- Rows -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="row in data"
        :key="row.symbol"
        class="grid grid-cols-3 px-3 py-1.5 border-b"
        style="border-color:var(--chart-border)"
      >
        <span style="color:var(--text-primary)">{{ row.symbol }}</span>
        <span class="text-right font-bold" :style="{ color: rateColor(row.rate) }">
          {{ rateLabel(row.rate) }}
        </span>
        <span class="text-right" style="color:var(--text-muted)">{{ row.nextFunding }}</span>
      </div>
    </div>

    <!-- Legend -->
    <div class="px-3 py-1.5 flex items-center gap-3 text-[10px] shrink-0"
         style="border-top:1px solid var(--chart-border);color:var(--text-muted)">
      <span style="color:var(--bearish)">▲ Positive: longs pay</span>
      <span style="color:var(--bullish)">▼ Negative: shorts pay</span>
    </div>

  </div>
</template>
