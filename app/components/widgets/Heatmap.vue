<!-- components/widgets/HeatMap.vue -->
<script setup lang="ts">
interface CoinHeat {
  symbol: string
  name:   string
  pct:    number
  vol:    number
  size:   number  // relative market cap weight
}

const coins = ref<CoinHeat[]>([])

const SYMBOLS = [
  { s: 'BTCUSDT',  n: 'BTC',  w: 10 },
  { s: 'ETHUSDT',  n: 'ETH',  w: 6 },
  { s: 'BNBUSDT',  n: 'BNB',  w: 3 },
  { s: 'SOLUSDT',  n: 'SOL',  w: 3 },
  { s: 'XRPUSDT',  n: 'XRP',  w: 2 },
  { s: 'ADAUSDT',  n: 'ADA',  w: 2 },
  { s: 'DOGEUSDT', n: 'DOGE', w: 2 },
  { s: 'AVAXUSDT', n: 'AVAX', w: 2 },
  { s: 'DOTUSDT',  n: 'DOT',  w: 1 },
  { s: 'LINKUSDT', n: 'LINK', w: 1 },
  { s: 'MATICUSDT',n: 'MATIC',w: 1 },
  { s: 'UNIUSDT',  n: 'UNI',  w: 1 },
]

async function loadHeatMap() {
  try {
    const syms = SYMBOLS.map(c => c.s)
    const data = await $fetch<any[]>('/api/ticker', {
      params: { symbols: JSON.stringify(syms) },
    })
    coins.value = data.map(t => {
      const meta = SYMBOLS.find(c => c.s === t.symbol)
      return {
        symbol: meta?.n ?? t.symbol,
        name:   meta?.n ?? t.symbol,
        pct:    parseFloat(t.priceChangePercent),
        vol:    parseFloat(t.quoteVolume),
        size:   meta?.w ?? 1,
      }
    }).sort((a, b) => b.size - a.size)
  }
  catch (e) { console.error('[HeatMap]', e) }
}

function getHeatColor(pct: number): string {
  if (pct >  5) return 'rgba(63,185,80,0.90)'
  if (pct >  3) return 'rgba(63,185,80,0.70)'
  if (pct >  1) return 'rgba(63,185,80,0.45)'
  if (pct >  0) return 'rgba(63,185,80,0.20)'
  if (pct > -1) return 'rgba(248,81,73,0.20)'
  if (pct > -3) return 'rgba(248,81,73,0.45)'
  if (pct > -5) return 'rgba(248,81,73,0.70)'
  return                'rgba(248,81,73,0.90)'
}

function getTextColor(pct: number): string {
  return pct >= 0 ? 'var(--bullish)' : 'var(--bearish)'
}

const chartStore = useChartStore()

onMounted(() => {
  loadHeatMap()
  const timer = setInterval(loadHeatMap, 15_000)
  onUnmounted(() => clearInterval(timer))
})
</script>

<template>
  <div class="flex flex-col h-full font-mono text-xs overflow-hidden"
       style="background: var(--chart-bg)">

    <!-- Header -->
    <div class="tt-widget-header">
      <span class="font-bold" style="color: var(--text-primary)">🗺 Heat Map</span>
      <span class="ml-auto text-[10px]" style="color: var(--text-muted)">15s refresh</span>
    </div>

    <!-- Grid -->
    <div class="flex-1 p-1.5 grid gap-1 overflow-hidden"
         style="grid-template-columns: repeat(4, 1fr);
                grid-template-rows: auto">
      <div
        v-for="coin in coins"
        :key="coin.symbol"
        @click="chartStore.setSymbol(coin.symbol + 'USDT')"
        class="flex flex-col items-center justify-center rounded cursor-pointer
               transition-all duration-300 hover:opacity-90 select-none"
        :style="{
          background:  getHeatColor(coin.pct),
          border:      `1px solid ${getHeatColor(coin.pct)}`,
          gridColumn:  coin.size >= 6 ? 'span 2' : 'span 1',
          gridRow:     coin.size >= 6 ? 'span 2' : 'span 1',
          minHeight:   coin.size >= 6 ? '80px' : '40px',
          padding:     '4px',
        }"
      >
        <span class="font-bold" :style="{ color: getTextColor(coin.pct),
               fontSize: coin.size >= 6 ? '14px' : '10px' }">
          {{ coin.name }}
        </span>
        <span :style="{ color: getTextColor(coin.pct),
               fontSize: coin.size >= 6 ? '12px' : '9px' }">
          {{ coin.pct >= 0 ? '+' : '' }}{{ coin.pct.toFixed(2) }}%
        </span>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex justify-center gap-3 px-2 pb-1.5 shrink-0">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-sm" style="background:rgba(248,81,73,0.8)" />
        <span class="text-[9px]" style="color:var(--text-muted)">-5%+</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-sm" style="background:rgba(248,81,73,0.3)" />
        <span class="text-[9px]" style="color:var(--text-muted)">-1%</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-sm" style="background:rgba(63,185,80,0.3)" />
        <span class="text-[9px]" style="color:var(--text-muted)">+1%</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-sm" style="background:rgba(63,185,80,0.8)" />
        <span class="text-[9px]" style="color:var(--text-muted)">+5%+</span>
      </div>
    </div>
  </div>
</template>