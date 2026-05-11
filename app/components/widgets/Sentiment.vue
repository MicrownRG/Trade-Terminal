<!-- components/widgets/Sentiment.vue (lanjutan) -->
<script setup lang="ts">
const fearGreed = ref(72)
const bullPct   = ref(64)
const bearPct   = computed(() => 100 - bullPct.value)

const fgLabel = computed(() => {
  const v = fearGreed.value
  if (v >= 80) return { text: 'Extreme Greed', color: '#3fb950' }
  if (v >= 60) return { text: 'Greed',         color: '#56d364' }
  if (v >= 40) return { text: 'Neutral',        color: '#8b949e' }
  if (v >= 20) return { text: 'Fear',           color: '#f0883e' }
  return              { text: 'Extreme Fear',   color: '#f85149' }
})

const fgDashOffset = computed(() => {
  // SVG arc: circumference = 2π × r, half circle = π × r
  // r = 54, circumference half = ~170
  return 170 - (fearGreed.value / 100) * 170
})

// Sentiment data per coin
const sentiments = ref([
  { symbol: 'BTC',  bull: 68, bear: 32 },
  { symbol: 'ETH',  bull: 55, bear: 45 },
  { symbol: 'BNB',  bull: 71, bear: 29 },
  { symbol: 'SOL',  bull: 80, bear: 20 },
  { symbol: 'DOGE', bull: 45, bear: 55 },
])
</script>

<template>
  <div class="flex flex-col h-full bg-chart-bg overflow-hidden">

    <!-- Header -->
    <div class="px-3 py-1.5 bg-chart-surface border-b border-chart-border
                text-xs font-mono text-chart-muted shrink-0">
      <span class="text-chart-text font-bold flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
        Sentiment
      </span>
    </div>

    <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-3">

      <!-- Fear & Greed Gauge -->
      <div class="flex flex-col items-center">
        <span class="text-[10px] text-chart-muted mb-1 font-mono">Fear & Greed Index</span>
        <div class="relative w-32 h-16">
          <svg viewBox="0 0 120 60" class="w-full h-full">
            <!-- Background arc -->
            <path
              d="M 10 55 A 50 50 0 0 1 110 55"
              fill="none" stroke="#21262d" stroke-width="10"
              stroke-linecap="round"
            />
            <!-- Value arc -->
            <path
              d="M 10 55 A 50 50 0 0 1 110 55"
              fill="none"
              :stroke="fgLabel.color"
              stroke-width="10"
              stroke-linecap="round"
              stroke-dasharray="170"
              :stroke-dashoffset="fgDashOffset"
              style="transition: stroke-dashoffset 0.8s ease"
            />
            <!-- Value text -->
            <text x="60" y="52" text-anchor="middle"
                  class="font-mono" font-size="18" font-weight="bold"
                  :fill="fgLabel.color">
              {{ fearGreed }}
            </text>
          </svg>
        </div>
        <span class="text-xs font-bold font-mono mt-1"
              :style="{ color: fgLabel.color }">
          {{ fgLabel.text }}
        </span>
      </div>

      <!-- Bull vs Bear Bar -->
      <div>
        <div class="flex justify-between text-[10px] font-mono mb-1">
          <span class="text-bullish font-bold">▲ Bull {{ bullPct }}%</span>
          <span class="text-bearish font-bold">▼ Bear {{ bearPct }}%</span>
        </div>
        <div class="h-2 rounded-full overflow-hidden bg-bearish/30">
          <div
            class="h-full bg-bullish rounded-full transition-all duration-700"
            :style="{ width: bullPct + '%' }"
          />
        </div>
      </div>

      <!-- Per-coin sentiment bars -->
      <div class="flex flex-col gap-1.5">
        <div
          v-for="s in sentiments"
          :key="s.symbol"
          class="flex items-center gap-2"
        >
          <span class="text-[10px] font-mono text-chart-muted w-8 shrink-0">
            {{ s.symbol }}
          </span>
          <div class="flex-1 h-1.5 rounded-full overflow-hidden bg-chart-border">
            <div
              class="h-full rounded-full transition-all duration-700"
              :class="s.bull >= 50 ? 'bg-bullish' : 'bg-bearish'"
              :style="{ width: s.bull + '%' }"
            />
          </div>
          <span class="text-[10px] font-mono w-8 text-right"
                :class="s.bull >= 50 ? 'text-bullish' : 'text-bearish'">
            {{ s.bull >= 50 ? '+' : '-' }}{{ Math.abs(s.bull - 50) * 2 }}%
          </span>
        </div>
      </div>

    </div>
  </div>
</template>