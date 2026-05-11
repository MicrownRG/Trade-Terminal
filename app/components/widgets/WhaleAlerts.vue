<!-- components/widgets/WhaleAlerts.vue -->
<script setup lang="ts">
interface WhaleAlert {
  id:         string
  symbol:     string
  blockchain: string
  amount:     number
  amountUsd:  number
  from:       string
  to:         string
  direction:  'in' | 'out' | 'internal'
  timestamp:  number
  hash:       string
}

const minAmount       = ref(100000)
const blockchainFilter = ref('')
const newAlerts       = ref(3)

const alerts = ref<WhaleAlert[]>([
  { id: '1', symbol: 'ETH',  blockchain: 'ETH', amount: 5234.5,    amountUsd: 12500000, from: 'Binance',    to: '0x1234…5678', direction: 'out',      timestamp: Date.now() - 5  * 60_000, hash: '0xabc123' },
  { id: '2', symbol: 'BTC',  blockchain: 'BTC', amount: 45.23,     amountUsd: 1823400,  from: '0xdef456…', to: 'Coinbase',     direction: 'in',       timestamp: Date.now() - 12 * 60_000, hash: '0xdef456' },
  { id: '3', symbol: 'USDC', blockchain: 'ETH', amount: 10000000,  amountUsd: 10000000, from: '0x1111…',   to: '0x2222…',     direction: 'internal', timestamp: Date.now() - 18 * 60_000, hash: '0x111222' },
  { id: '4', symbol: 'SOL',  blockchain: 'SOL', amount: 500000,    amountUsd: 25000000, from: 'Kraken',    to: '0x3333…',     direction: 'out',      timestamp: Date.now() - 45 * 60_000, hash: '0x333444' },
])

const filteredAlerts = computed(() =>
  alerts.value.filter(a =>
    a.amountUsd >= minAmount.value &&
    (!blockchainFilter.value || a.blockchain === blockchainFilter.value),
  )
)

function formatAmount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(2) + 'K'
  return n.toFixed(2)
}

function formatUSD(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000)     return '$' + (n / 1_000).toFixed(1) + 'K'
  return '$' + n.toFixed(0)
}

function formatTimeAgo(ts: number) {
  const mins  = Math.floor((Date.now() - ts) / 60_000)
  const hours = Math.floor(mins / 60)
  if (mins  < 60) return mins + 'm ago'
  if (hours < 24) return hours + 'h ago'
  return Math.floor(hours / 24) + 'd ago'
}

function dirIcon(dir: 'in' | 'out' | 'internal') {
  if (dir === 'in')       return '↓'
  if (dir === 'out')      return '↑'
  return '↔'
}
function dirColor(dir: 'in' | 'out' | 'internal') {
  if (dir === 'in')  return 'var(--bullish)'
  if (dir === 'out') return 'var(--bearish)'
  return 'var(--text-muted)'
}
</script>

<template>
  <div class="flex flex-col h-full font-mono text-xs" style="background:var(--chart-bg)">

    <!-- Header -->
    <div class="px-3 py-1.5 shrink-0 flex items-center justify-between flex-wrap gap-2"
         style="background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      <span class="font-bold flex items-center gap-1.5" style="color:var(--text-primary)">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
          <path d="M12 18V6"/>
        </svg>
        Whale Alerts
        <span v-if="newAlerts" class="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
              style="background:rgba(248,81,73,0.2);color:var(--bearish)">
          {{ newAlerts }}
        </span>
      </span>
      <!-- Filters -->
      <div class="flex items-center gap-1.5">
        <input
          v-model.number="minAmount"
          type="number"
          placeholder="Min USD"
          class="tt-input w-20 py-0.5 text-[9px]"
        />
        <select v-model="blockchainFilter" class="tt-input py-0.5 text-[9px]">
          <option value="">All Chains</option>
          <option value="ETH">Ethereum</option>
          <option value="BTC">Bitcoin</option>
          <option value="SOL">Solana</option>
        </select>
      </div>
    </div>

    <!-- Column headers -->
    <div class="px-3 py-1 text-[9px] shrink-0 grid"
         style="grid-template-columns:20px 1fr 90px 70px 52px;color:var(--text-muted);border-bottom:1px solid var(--chart-border)">
      <span/>
      <span>From → To</span>
      <span class="text-right">Amount</span>
      <span class="text-right">USD</span>
      <span class="text-right">When</span>
    </div>

    <!-- Alert rows -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="alert in filteredAlerts"
        :key="alert.id"
        class="grid px-3 py-2 border-b items-center transition-colors"
        style="grid-template-columns:20px 1fr 90px 70px 52px;border-color:var(--chart-border)"
        :style="{ background: 'transparent' }"
        @mouseover="($event.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
      >
        <!-- Direction icon -->
        <span class="font-bold text-sm leading-none" :style="{ color: dirColor(alert.direction) }">
          {{ dirIcon(alert.direction) }}
        </span>

        <!-- From → To -->
        <div class="flex flex-col gap-0.5 overflow-hidden">
          <span class="truncate" style="color:var(--text-primary)">{{ alert.from }} → {{ alert.to }}</span>
          <span class="text-[9px]" style="color:var(--text-muted)">{{ alert.blockchain }} · {{ alert.symbol }}</span>
        </div>

        <!-- Token amount -->
        <span class="text-right font-bold" :style="{ color: dirColor(alert.direction) }">
          {{ formatAmount(alert.amount) }} {{ alert.symbol }}
        </span>

        <!-- USD value -->
        <span class="text-right" style="color:var(--text-primary)">
          {{ formatUSD(alert.amountUsd) }}
        </span>

        <!-- Time -->
        <span class="text-right text-[9px]" style="color:var(--text-muted)">
          {{ formatTimeAgo(alert.timestamp) }}
        </span>
      </div>

      <!-- Empty state -->
      <div v-if="!filteredAlerts.length"
           class="flex flex-col items-center justify-center h-24 gap-1.5"
           style="color:var(--text-muted)">
        <span class="text-lg">🐋</span>
        <span class="text-[10px]">No alerts match current filters</span>
      </div>
    </div>

  </div>
</template>
