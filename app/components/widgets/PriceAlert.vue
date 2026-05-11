<!-- components/widgets/PriceAlert.vue -->
<script setup lang="ts">
const chartStore = useChartStore()

interface Alert {
  id: string
  symbol: string
  condition: 'above' | 'below'
  price: number
  triggered: boolean
  createdAt: number
}

const alerts = ref<Alert[]>([
  { id: '1', symbol: 'BTCUSDT', condition: 'above', price: 85000, triggered: false, createdAt: Date.now() - 3600000 },
  { id: '2', symbol: 'BTCUSDT', condition: 'below', price: 79000, triggered: false, createdAt: Date.now() - 7200000 },
  { id: '3', symbol: 'ETHUSDT', condition: 'above', price: 3200,  triggered: true,  createdAt: Date.now() - 86400000 },
])

const showForm = ref(false)
const form = reactive({ symbol: '', condition: 'above' as 'above' | 'below', price: '' })

function addAlert() {
  const price = parseFloat(form.price)
  if (!form.symbol || isNaN(price)) return
  alerts.value.push({
    id: Date.now().toString(),
    symbol: form.symbol.toUpperCase(),
    condition: form.condition,
    price,
    triggered: false,
    createdAt: Date.now(),
  })
  form.symbol = ''
  form.price = ''
  showForm.value = false
}

function removeAlert(id: string) {
  alerts.value = alerts.value.filter(a => a.id !== id)
}

function formatTime(ts: number) {
  const diff = Date.now() - ts
  if (diff < 3600000)  return Math.floor(diff / 60000) + 'm ago'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago'
  return Math.floor(diff / 86400000) + 'd ago'
}
</script>

<template>
  <div class="flex flex-col h-full font-mono text-xs" style="background:var(--chart-bg)">

    <!-- Header -->
    <div class="px-3 py-1.5 bg-chart-surface border-b border-chart-border text-chart-muted shrink-0 flex items-center justify-between">
      <span class="text-chart-text font-bold flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        Price Alerts
      </span>
      <button
        @click="showForm = !showForm"
        class="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors"
        style="color:var(--ind-sma);border:1px solid rgba(88,166,255,0.3);background:rgba(88,166,255,0.07)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        Add
      </button>
    </div>

    <!-- Add form -->
    <div v-if="showForm" class="px-3 py-2 flex flex-col gap-2 shrink-0"
         style="background:var(--bg-secondary);border-bottom:1px solid var(--chart-border)">
      <div class="flex gap-2">
        <input
          v-model="form.symbol"
          placeholder="BTCUSDT"
          class="flex-1 bg-transparent border rounded px-2 py-1 outline-none"
          style="border-color:var(--border-color);color:var(--text-primary)"
        />
        <select
          v-model="form.condition"
          class="bg-transparent border rounded px-2 py-1 outline-none"
          style="border-color:var(--border-color);color:var(--text-primary);background:var(--bg-secondary)"
        >
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
      </div>
      <div class="flex gap-2">
        <input
          v-model="form.price"
          type="number"
          placeholder="Target price"
          class="flex-1 bg-transparent border rounded px-2 py-1 outline-none"
          style="border-color:var(--border-color);color:var(--text-primary)"
          @keyup.enter="addAlert"
        />
        <button
          @click="addAlert"
          class="px-3 py-1 rounded text-[10px] font-bold"
          style="background:rgba(88,166,255,0.15);color:var(--ind-sma);border:1px solid rgba(88,166,255,0.3)"
        >Set</button>
      </div>
    </div>

    <!-- Alert list -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="!alerts.length" class="flex items-center justify-center h-full"
           style="color:var(--text-muted)">No alerts set</div>

      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="flex items-center gap-2 px-3 py-2 border-b"
        style="border-color:var(--chart-border)"
        :style="alert.triggered ? 'opacity:0.5' : ''"
      >
        <!-- Condition icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             :style="{ color: alert.condition === 'above' ? 'var(--bullish)' : 'var(--bearish)' }">
          <polyline v-if="alert.condition === 'above'" points="18 15 12 9 6 15"/>
          <polyline v-else points="6 9 12 15 18 9"/>
        </svg>

        <div class="flex-1 min-w-0">
          <div style="color:var(--text-primary)">
            {{ alert.symbol }}
            <span style="color:var(--text-muted)">{{ alert.condition }}</span>
            <span class="font-bold" :style="{ color: alert.condition === 'above' ? 'var(--bullish)' : 'var(--bearish)' }">
              ${{ alert.price.toLocaleString() }}
            </span>
          </div>
          <div class="text-[10px]" style="color:var(--text-muted)">
            {{ alert.triggered ? '✓ Triggered' : 'Active' }} · {{ formatTime(alert.createdAt) }}
          </div>
        </div>

        <button
          @click="removeAlert(alert.id)"
          class="w-5 h-5 rounded flex items-center justify-center transition-colors"
          style="color:var(--text-muted)"
          @mouseenter="($event.currentTarget as HTMLElement).style.color='var(--bearish)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.color='var(--text-muted)'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>

  </div>
</template>
