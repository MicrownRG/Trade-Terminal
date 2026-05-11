<!-- components/widgets/Orderbook.vue -->
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

interface OrderLevel {
  price: number
  size: number
  total: number
  depth: number
}

const asks = ref<OrderLevel[]>([])
const bids = ref<OrderLevel[]>([])
const spread = ref('0.00')
const spreadPct = ref('0.00%')
const chartStore = useChartStore()

function buildBook(levels: [number, number][], side: 'ask' | 'bid'): OrderLevel[] {
  let cumTotal = 0
  const sorted = side === 'ask'
    ? [...levels].sort((a, b) => a[0] - b[0]).slice(0, 14)
    : [...levels].sort((a, b) => b[0] - a[0]).slice(0, 14)

  const maxTotal = sorted.reduce((s, l) => s + l[1], 0)

  return sorted.map(([p, sz]) => {
    cumTotal += sz
    return {
      price: p,
      size: sz,
      total: cumTotal,
      depth: (cumTotal / maxTotal) * 100,
    }
  })
}

function generateMockOrderBook() {
  const mockAsks: [number, number][] = []
  const mockBids: [number, number][] = []

  let askPrice = 41000
  for (let i = 0; i < 14; i++) {
    mockAsks.push([askPrice, Math.random() * 10])
    askPrice += 0.5
  }

  let bidPrice = 40900
  for (let i = 0; i < 14; i++) {
    mockBids.push([bidPrice, Math.random() * 10])
    bidPrice -= 0.5
  }

  asks.value = buildBook(mockAsks, 'ask')
  bids.value = buildBook(mockBids, 'bid')

  if (asks.value.length && bids.value.length) {
    const bestAsk = asks.value[0]!.price
    const bestBid = bids.value[0]!.price
    const sp = (bestAsk - bestBid).toFixed(2)
    const spPct = (((bestAsk - bestBid) / bestBid) * 100).toFixed(3)
    spread.value = sp
    spreadPct.value = spPct + '%'
  }
}

onMounted(() => {
  generateMockOrderBook()
  const timer = setInterval(generateMockOrderBook, 2000)
  onUnmounted(() => clearInterval(timer))
})

watch(() => chartStore.symbol, generateMockOrderBook)

const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2 })
const fmtSize = (n: number) => n.toFixed(4)
</script>

<template>
  <div class="flex flex-col h-full bg-chart-bg font-mono text-xs">

    <!-- Header -->
    <div class="px-3 py-1.5 bg-chart-surface border-b border-chart-border
                text-chart-muted shrink-0 flex items-center justify-between">
      <span class="text-chart-text font-bold">Orderbook</span>
      <span class="text-[10px]">{{ chartStore.symbol }}</span>
    </div>

    <!-- Column labels -->
    <div class="grid grid-cols-3 px-3 py-1 text-[10px] text-chart-muted
                border-b border-chart-border shrink-0">
      <span>Price</span>
      <span class="text-right">Size</span>
      <span class="text-right">Total</span>
    </div>

    <div class="flex-1 overflow-hidden flex flex-col">

      <!-- Asks (sell orders) — reversed so lowest ask at bottom -->
      <div class="flex-1 overflow-y-auto flex flex-col-reverse">
        <div
          v-for="ask in asks"
          :key="ask.price"
          class="relative grid grid-cols-3 px-3 py-0.5 hover:bg-chart-hover"
        >
          <!-- Depth bar -->
          <div
            class="absolute inset-y-0 right-0 bg-bearish/10"
            :style="{ width: ask.depth + '%' }"
          />
          <span class="text-bearish relative z-10">{{ fmt(ask.price) }}</span>
          <span class="text-right text-chart-text relative z-10">{{ fmtSize(ask.size) }}</span>
          <span class="text-right text-chart-muted relative z-10">{{ fmtSize(ask.total) }}</span>
        </div>
      </div>

      <!-- Spread -->
      <div class="px-3 py-1 bg-chart-surface border-y border-chart-border
                  text-[10px] text-chart-muted flex justify-between shrink-0">
        <span>Spread</span>
        <span class="text-chart-text">{{ spread }}</span>
        <span>{{ spreadPct }}</span>
      </div>

      <!-- Bids (buy orders) -->
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="bid in bids"
          :key="bid.price"
          class="relative grid grid-cols-3 px-3 py-0.5 hover:bg-chart-hover"
        >
          <!-- Depth bar -->
          <div
            class="absolute inset-y-0 right-0 bg-bullish/10"
            :style="{ width: bid.depth + '%' }"
          />
          <span class="text-bullish relative z-10">{{ fmt(bid.price) }}</span>
          <span class="text-right text-chart-text relative z-10">{{ fmtSize(bid.size) }}</span>
          <span class="text-right text-chart-muted relative z-10">{{ fmtSize(bid.total) }}</span>
        </div>
      </div>

    </div>
  </div>
</template>