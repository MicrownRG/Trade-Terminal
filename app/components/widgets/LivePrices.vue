<!-- components/widgets/LivePrices.vue -->
<script setup lang="ts">
interface PriceItem {
  symbol: string
  price: number
  change: number   // % change
  digits: number
}

const active = ref('BTC/USD')

const prices = ref<PriceItem[]>([
  { symbol: 'XAU/USD',  price: 4848.40,   change: +0.32, digits: 2 },
  { symbol: 'NASDAQ',   price: 26198.60,  change: +1.14, digits: 2 },
  { symbol: 'EUR/USD',  price: 1.18161,   change: -0.08, digits: 5 },
  { symbol: 'USD/JPY',  price: 158.666,   change: -0.21, digits: 3 },
  { symbol: 'AUD/USD',  price: 0.71872,   change: +0.05, digits: 5 },
  { symbol: 'BTC/USD',  price: 74919.16,  change: +1.24, digits: 2 },
])

// Simulate live tick
let interval: ReturnType<typeof setInterval>
onMounted(() => {
  interval = setInterval(() => {
    prices.value = prices.value.map(p => ({
      ...p,
      price: p.price * (1 + (Math.random() - 0.5) * 0.0002),
    }))
  }, 2000)
})
onUnmounted(() => clearInterval(interval))

function fmt(item: PriceItem) {
  return item.price.toFixed(item.digits)
}

function pctStr(v: number) {
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
}

function rowBg(sym: string) {
  return sym === active.value
    ? 'background:rgba(88,166,255,0.12);border-left:2px solid var(--ind-sma)'
    : 'border-left:2px solid transparent'
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden font-mono text-[10px]"
       style="background:var(--chart-bg)">

    <!-- Header -->
    <div class="px-2 py-1 shrink-0 font-bold text-[9px] tracking-wide"
         style="color:var(--text-muted);background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      LIVE PRICES
    </div>

    <!-- Prices list -->
    <div class="flex-1 overflow-y-auto">
      <button
        v-for="item in prices" :key="item.symbol"
        class="w-full flex items-center gap-1 px-2 py-[5px] transition-colors"
        :style="rowBg(item.symbol)"
        @click="active = item.symbol"
      >
        <!-- Symbol -->
        <span class="flex-1 text-left text-[10px] font-bold"
              :style="item.symbol === active ? 'color:var(--ind-sma)' : 'color:var(--text-secondary)'">
          {{ item.symbol }}
        </span>

        <!-- Price -->
        <span class="font-bold text-[10px]"
              :style="item.change >= 0 ? 'color:var(--bullish)' : 'color:var(--bearish)'">
          {{ fmt(item) }}
        </span>

        <!-- % change badge -->
        <span class="text-[8px] px-1 py-0.5 rounded shrink-0"
              :style="item.change >= 0
                ? 'color:var(--bullish);background:var(--bullish-bg)'
                : 'color:var(--bearish);background:var(--bearish-bg)'">
          {{ pctStr(item.change) }}
        </span>
      </button>
    </div>

  </div>
</template>
