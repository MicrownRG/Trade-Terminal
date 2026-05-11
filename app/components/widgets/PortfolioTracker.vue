<!-- components/widgets/PortfolioTracker.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Position {
  id: string
  symbol: string
  type: 'Long' | 'Short'
  entry: number
  amount: number
  currentPrice?: number
}

const positions = ref<Position[]>([
  { id: '1', symbol: 'BTCUSDT', type: 'Long', entry: 62000, amount: 0.5, currentPrice: 64500 },
  { id: '2', symbol: 'ETHUSDT', type: 'Short', entry: 3200, amount: 5, currentPrice: 3100 },
  { id: '3', symbol: 'SOLUSDT', type: 'Long', entry: 140, amount: 50, currentPrice: 135 },
])

const isAdding = ref(false)
const newPos = ref<Partial<Position>>({
  symbol: 'BTCUSDT',
  type: 'Long',
  entry: 0,
  amount: 0
})

function calcPnL(pos: Position) {
  if (!pos.currentPrice) return 0
  const diff = pos.type === 'Long' 
    ? pos.currentPrice - pos.entry 
    : pos.entry - pos.currentPrice
  return diff * pos.amount
}

function calcPnLPct(pos: Position) {
  if (!pos.currentPrice) return 0
  const diff = pos.type === 'Long' 
    ? pos.currentPrice - pos.entry 
    : pos.entry - pos.currentPrice
  return (diff / pos.entry) * 100
}

const totalValue = computed(() => {
  return positions.value.reduce((acc, pos) => acc + (pos.entry * pos.amount), 0)
})

const totalPnL = computed(() => {
  return positions.value.reduce((acc, pos) => acc + calcPnL(pos), 0)
})

const totalPnLPct = computed(() => {
  if (totalValue.value === 0) return 0
  return (totalPnL.value / totalValue.value) * 100
})

function addPosition() {
  if (!newPos.value.symbol || !newPos.value.entry || !newPos.value.amount) return
  positions.value.push({
    id: Date.now().toString(),
    symbol: newPos.value.symbol.toUpperCase(),
    type: newPos.value.type as 'Long' | 'Short',
    entry: newPos.value.entry,
    amount: newPos.value.amount,
    currentPrice: newPos.value.entry // Default to entry
  })
  isAdding.value = false
  newPos.value = { symbol: 'BTCUSDT', type: 'Long', entry: 0, amount: 0 }
}

function removePosition(id: string) {
  positions.value = positions.value.filter(p => p.id !== id)
}
</script>

<template>
  <div class="flex flex-col h-full bg-chart-bg overflow-hidden text-[11px] font-mono">
    <div class="flex items-center justify-between px-3 py-2 border-b border-chart-border bg-chart-surface shrink-0">
      <div class="flex items-center gap-2">
        <span class="text-chart-text font-bold">Portfolio Tracker</span>
      </div>
      <button @click="isAdding = !isAdding" class="tt-btn h-6 px-2 py-0 text-[10px]">
        {{ isAdding ? 'Cancel' : '+ Add Position' }}
      </button>
    </div>
    
    <!-- Summary Cards -->
    <div class="grid grid-cols-2 gap-2 p-2 shrink-0 border-b border-chart-border" style="background: var(--bg-tertiary)">
      <div class="p-2 rounded" style="background: var(--chart-surface); border: 1px solid var(--chart-border)">
        <div class="text-[9px] text-chart-muted mb-1">Total Initial Value</div>
        <div class="text-sm font-bold">${{ totalValue.toFixed(2) }}</div>
      </div>
      <div class="p-2 rounded" style="background: var(--chart-surface); border: 1px solid var(--chart-border)">
        <div class="text-[9px] text-chart-muted mb-1">Total Unrealized PnL</div>
        <div class="text-sm font-bold flex items-center gap-2" :class="totalPnL >= 0 ? 'text-bullish' : 'text-bearish'">
          <span>{{ totalPnL >= 0 ? '+' : '' }}${{ totalPnL.toFixed(2) }}</span>
          <span class="text-[10px] px-1 py-0.5 rounded bg-black/20">{{ totalPnL >= 0 ? '+' : '' }}{{ totalPnLPct.toFixed(2) }}%</span>
        </div>
      </div>
    </div>

    <!-- Add Form -->
    <div v-if="isAdding" class="p-2 border-b border-chart-border bg-black/20 flex flex-col gap-2 shrink-0">
      <div class="flex gap-2">
        <input v-model="newPos.symbol" placeholder="Symbol" class="tt-input flex-1 h-7 text-[11px]" />
        <select v-model="newPos.type" class="tt-input flex-1 h-7 text-[11px] bg-transparent">
          <option>Long</option>
          <option>Short</option>
        </select>
      </div>
      <div class="flex gap-2">
        <input v-model.number="newPos.entry" type="number" placeholder="Entry Price" class="tt-input flex-1 h-7 text-[11px]" />
        <input v-model.number="newPos.amount" type="number" placeholder="Amount" class="tt-input flex-1 h-7 text-[11px]" />
        <button @click="addPosition" class="tt-btn-active rounded px-3 font-bold h-7">Add</button>
      </div>
    </div>

    <!-- Positions Table -->
    <div class="flex-1 overflow-y-auto">
      <table class="w-full text-left border-collapse">
        <thead class="sticky top-0 bg-chart-surface z-10 shadow-sm">
          <tr class="text-chart-muted border-b border-chart-border">
            <th class="py-1.5 px-3 font-normal">Symbol</th>
            <th class="py-1.5 px-2 font-normal text-right">Size</th>
            <th class="py-1.5 px-2 font-normal text-right">Entry</th>
            <th class="py-1.5 px-2 font-normal text-right">Current</th>
            <th class="py-1.5 px-3 font-normal text-right">PnL</th>
            <th class="py-1.5 px-2 w-6"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="positions.length === 0">
            <td colspan="6" class="py-4 text-center text-chart-muted">No positions tracked.</td>
          </tr>
          <tr v-for="pos in positions" :key="pos.id" class="border-b border-white/5 hover:bg-white/5 transition-colors group">
            <td class="py-2 px-3 text-chart-text">
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full" :class="pos.type === 'Long' ? 'bg-bullish' : 'bg-bearish'"></span>
                <span class="font-bold">{{ pos.symbol }}</span>
              </div>
            </td>
            <td class="py-2 px-2 text-right text-chart-muted">{{ pos.amount }}</td>
            <td class="py-2 px-2 text-right text-chart-text">${{ pos.entry.toLocaleString() }}</td>
            <td class="py-2 px-2 text-right text-chart-muted">
              <input v-model.number="pos.currentPrice" type="number" class="w-16 bg-transparent border-b border-chart-border text-right outline-none focus:border-blue-500" />
            </td>
            <td class="py-2 px-3 text-right font-bold" :class="calcPnL(pos) >= 0 ? 'text-bullish' : 'text-bearish'">
              <div class="flex flex-col items-end">
                <span>{{ calcPnL(pos) >= 0 ? '+' : '' }}${{ calcPnL(pos).toFixed(2) }}</span>
                <span class="text-[9px]">{{ calcPnL(pos) >= 0 ? '+' : '' }}{{ calcPnLPct(pos).toFixed(2) }}%</span>
              </div>
            </td>
            <td class="py-2 px-2 text-center">
              <button @click="removePosition(pos.id)" class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400">✕</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
