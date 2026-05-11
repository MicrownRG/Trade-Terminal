<!-- components/widgets/Watchlist.vue -->
<script setup lang="ts">
const chartStore = useChartStore()

interface Ticker {
  symbol: string
  price:  string
  change: string
  pos:    boolean
}

const tickers = ref<Ticker[]>([])
const watchlist = ['BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT',
                   'DOGEUSDT','XRPUSDT','ADAUSDT','AVAXUSDT']

async function loadTickers() {
  const data = await $fetch<any[]>('/api/binance/ticker', {
    params: { symbols: JSON.stringify(watchlist) },
  })
  tickers.value = data.map(t => ({
    symbol: t.symbol.replace('USDT',''),
    price:  parseFloat(t.lastPrice).toFixed(2),
    change: parseFloat(t.priceChangePercent).toFixed(2),
    pos:    parseFloat(t.priceChangePercent) >= 0,
  }))
}

onMounted(() => {
  loadTickers()
  const timer = setInterval(loadTickers, 5000)
  onUnmounted(() => clearInterval(timer))
})
</script>

<template>
  <div class="flex flex-col h-full bg-chart-bg font-mono text-xs">

    <!-- Header -->
    <div class="px-3 py-1.5 bg-chart-surface border-b border-chart-border
                text-chart-muted shrink-0 flex items-center justify-between">
      <span class="text-chart-text font-bold flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Watchlist
      </span>
      <span class="text-[10px] text-bullish animate-pulse">● LIVE</span>
    </div>

    <!-- Column labels -->
    <div class="grid grid-cols-3 px-3 py-1 text-[10px] text-chart-muted
                border-b border-chart-border shrink-0">
      <span>Symbol</span>
      <span class="text-right">Price</span>
      <span class="text-right">24h %</span>
    </div>

    <!-- Ticker List -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="t in tickers"
        :key="t.symbol"
        @click="chartStore.setSymbol(t.symbol + 'USDT')"
        :class="chartStore.symbol === t.symbol + 'USDT'
          ? 'bg-chart-hover border-l-2 border-ind-sma'
          : 'hover:bg-chart-hover border-l-2 border-transparent'"
        class="grid grid-cols-3 px-3 py-1.5 cursor-pointer transition-colors"
        style="border-left-color: #58a6ff"
      >
        <span class="text-chart-text font-bold">{{ t.symbol }}</span>
        <span class="text-right text-chart-text">{{ t.price }}</span>
        <span
          :class="t.pos ? 'text-bullish' : 'text-bearish'"
          class="text-right font-bold"
        >{{ t.pos ? '+' : '' }}{{ t.change }}%</span>
      </div>
    </div>

  </div>
</template>