<!-- components/widgets/VolumeProfile.vue -->
<script setup lang="ts">
import { fetchOHLCV } from '~/composables/useMarketData'
import type { Bar } from '~/types'

const BUCKETS = 40

const chartStore = useChartStore()
const isLoading = ref(true)

interface VPNode {
  price: number   // bucket mid-price
  volume: number
  buyVolume: number
  sellVolume: number
}

const vpData   = ref<VPNode[]>([])
const maxVol   = computed(() => vpData.value.reduce((m, n) => Math.max(m, n.volume), 0))
const poc      = computed(() => vpData.value.reduce<VPNode | null>((best, n) => (!best || n.volume > best.volume) ? n : best, null))

// Value Area: the contiguous set of price levels around POC containing 70% of total volume
const valueArea = computed(() => {
  if (!vpData.value.length || !poc.value) return null
  const total    = vpData.value.reduce((s, n) => s + n.volume, 0)
  const target   = total * 0.7
  const pocIdx   = vpData.value.findIndex(n => n === poc.value)
  let lo = pocIdx, hi = pocIdx, accumulated = poc.value.volume
  while (accumulated < target) {
    const upVol   = hi + 1 < vpData.value.length  ? vpData.value[hi + 1]!.volume : 0
    const downVol = lo - 1 >= 0                   ? vpData.value[lo - 1]!.volume : 0
    if (upVol >= downVol && hi + 1 < vpData.value.length)  { hi++; accumulated += upVol }
    else if (lo - 1 >= 0)                                  { lo--; accumulated += downVol }
    else                                                    break
  }
  return { lo: vpData.value[lo]!.price, hi: vpData.value[hi]!.price }
})

function buildProfile(bars: Bar[]) {
  if (!bars.length) return

  const minP = bars.reduce((m, b) => Math.min(m, b.low),  Infinity)
  const maxP = bars.reduce((m, b) => Math.max(m, b.high), -Infinity)
  const step = (maxP - minP) / BUCKETS || 1

  const buckets = Array.from({ length: BUCKETS }, (_, i) => ({
    price:      minP + (i + 0.5) * step,
    volume:     0,
    buyVolume:  0,
    sellVolume: 0,
  }))

  for (const bar of bars) {
    const range = bar.high - bar.low || step
    const isBull = bar.close >= bar.open
    // Distribute the bar's volume uniformly across buckets it spans
    for (let bi = 0; bi < BUCKETS; bi++) {
      const bLow  = minP + bi * step
      const bHigh = bLow + step
      const overlap = Math.max(0, Math.min(bHigh, bar.high) - Math.max(bLow, bar.low))
      if (!overlap) continue
      const share = (overlap / range) * bar.volume
      buckets[bi]!.volume += share
      if (isBull) buckets[bi]!.buyVolume  += share
      else        buckets[bi]!.sellVolume += share
    }
  }

  // Sort high-to-low for display (top = higher prices)
  vpData.value = buckets.sort((a, b) => b.price - a.price)
}

async function load() {
  isLoading.value = true
  try {
    const bars = await fetchOHLCV(chartStore.symbol, chartStore.timeframe, 200)
    buildProfile(bars)
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
watch(() => [chartStore.symbol, chartStore.timeframe], load)

function fmtPrice(p: number) {
  return p >= 1000 ? p.toFixed(0) : p >= 1 ? p.toFixed(2) : p.toFixed(4)
}
</script>

<template>
  <div class="flex flex-col h-full font-mono text-[10px]" style="background:var(--chart-bg)">

    <!-- Header -->
    <div class="px-3 py-1.5 shrink-0 flex items-center justify-between"
         style="background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      <span class="font-bold flex items-center gap-1.5" style="color:var(--text-primary)">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="4" height="6" x="2" y="14" rx="1"/>
          <rect width="4" height="12" x="10" y="8" rx="1"/>
          <rect width="4" height="16" x="18" y="4" rx="1"/>
        </svg>
        Volume Profile
      </span>
      <div class="flex items-center gap-2 text-[9px]" style="color:var(--text-muted)">
        <span v-if="valueArea">
          VA {{ fmtPrice(valueArea.lo) }}–{{ fmtPrice(valueArea.hi) }}
        </span>
        <span class="px-1 py-0.5 rounded" style="background:var(--bg-tertiary)">{{ chartStore.timeframe }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center" style="color:var(--text-muted)">
      <div class="w-4 h-4 border-2 rounded-full animate-spin"
           style="border-color:var(--ind-sma);border-top-color:transparent"/>
    </div>

    <!-- Profile bars -->
    <div v-else class="flex-1 overflow-y-auto px-1 py-1 flex flex-col gap-[1px]">
      <div
        v-for="node in vpData"
        :key="node.price"
        class="flex items-center gap-1 h-[14px] group relative"
      >
        <!-- Price label -->
        <span class="w-10 text-right shrink-0 text-[8px]"
              :style="{ color: node === poc ? '#f85149' : 'var(--text-muted)', fontWeight: node === poc ? 700 : 400 }">
          {{ fmtPrice(node.price) }}
        </span>

        <!-- Volume bar -->
        <div class="flex-1 h-full relative">
          <div class="absolute inset-y-0 left-0 flex overflow-hidden rounded-[1px]"
               :style="{ width: maxVol ? `${(node.volume / maxVol) * 100}%` : '0%' }">
            <!-- Buy portion -->
            <div class="h-full" :style="{
              width: node.volume ? `${(node.buyVolume / node.volume) * 100}%` : '0%',
              background: node === poc ? 'rgba(248,81,73,0.7)' : 'rgba(63,185,80,0.45)',
            }"/>
            <!-- Sell portion -->
            <div class="h-full" :style="{
              width: node.volume ? `${(node.sellVolume / node.volume) * 100}%` : '0%',
              background: node === poc ? 'rgba(248,81,73,0.4)' : 'rgba(248,81,73,0.3)',
            }"/>
          </div>

          <!-- Value Area highlight overlay -->
          <div v-if="valueArea && node.price >= valueArea.lo && node.price <= valueArea.hi"
               class="absolute inset-y-0 left-0 right-0 pointer-events-none rounded-[1px]"
               style="background:rgba(88,166,255,0.06)"/>
        </div>

        <!-- Hover tooltip -->
        <div class="absolute left-12 z-10 pointer-events-none opacity-0 group-hover:opacity-100
                    px-1.5 py-1 rounded text-[8px] whitespace-nowrap"
             style="background:var(--chart-surface);border:1px solid var(--chart-border);color:var(--text-primary)">
          Buy {{ (node.buyVolume / 1000).toFixed(1) }}K · Sell {{ (node.sellVolume / 1000).toFixed(1) }}K
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="px-3 py-1 shrink-0 flex items-center gap-3 text-[9px]"
         style="border-top:1px solid var(--chart-border);color:var(--text-muted)">
      <span class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-[1px]" style="background:rgba(63,185,80,0.45)"/>
        Buy
      </span>
      <span class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-[1px]" style="background:rgba(248,81,73,0.3)"/>
        Sell
      </span>
      <span class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-[1px]" style="background:rgba(248,81,73,0.7)"/>
        POC
      </span>
      <span class="flex items-center gap-1 ml-auto">
        <span class="w-2 h-2 rounded-[1px]" style="background:rgba(88,166,255,0.15)"/>
        70% VA
      </span>
    </div>

  </div>
</template>
