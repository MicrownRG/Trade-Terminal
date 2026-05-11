<!-- components/widgets/PriceAlert.vue -->
<script setup lang="ts">
interface Alert {
  id:        string
  symbol:    string
  price:     number
  condition: 'above' | 'below'
  note:      string
  triggered: boolean
  createdAt: number
}

const chartStore = useChartStore()
const alerts     = ref<Alert[]>([])
const showForm   = ref(false)
const form       = reactive({
  symbol:    computed(() => chartStore.symbol),
  price:     '',
  condition: 'above' as 'above' | 'below',
  note:      '',
})

// ── Load dari localStorage ────────────────────────────────
onMounted(() => {
  const raw = localStorage.getItem('tt-alerts')
  if (raw) alerts.value = JSON.parse(raw)
  startMonitor()
})

function saveAlerts() {
  localStorage.setItem('tt-alerts', JSON.stringify(alerts.value))
}

// ── Tambah alert ──────────────────────────────────────────
function addAlert() {
  if (!form.price) return
  alerts.value.push({
    id:        Date.now().toString(),
    symbol:    chartStore.symbol,
    price:     parseFloat(form.price),
    condition: form.condition,
    note:      form.note,
    triggered: false,
    createdAt: Date.now(),
  })
  saveAlerts()
  form.price = ''
  form.note  = ''
  showForm.value = false
}

function removeAlert(id: string) {
  alerts.value = alerts.value.filter(a => a.id !== id)
  saveAlerts()
}

function clearTriggered() {
  alerts.value = alerts.value.filter(a => !a.triggered)
  saveAlerts()
}

// ── Monitor harga realtime ────────────────────────────────
let monitorTimer: ReturnType<typeof setInterval> | null = null

async function startMonitor() {
  monitorTimer = setInterval(async () => {
    const activeAlerts = alerts.value.filter(a => !a.triggered)
    if (!activeAlerts.length) return

    // Ambil semua symbol unik
    const symbols = [...new Set(activeAlerts.map(a => a.symbol))]

    try {
      const tickers = await $fetch<any[]>('/api/ticker', {
        params: { symbols: JSON.stringify(symbols) },
      })

      for (const ticker of tickers) {
        const price = parseFloat(ticker.lastPrice)
        const sym   = ticker.symbol

        alerts.value.forEach(alert => {
          if (alert.triggered || alert.symbol !== sym) return

          const hit = alert.condition === 'above'
            ? price >= alert.price
            : price <= alert.price

          if (hit) {
            alert.triggered = true
            // Browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`🔔 Price Alert: ${sym}`, {
                body: `${sym} is now ${alert.condition} $${alert.price.toLocaleString()}`,
                icon: '/favicon.ico',
              })
            }
            // Audio beep
            playBeep()
          }
        })
      }
      saveAlerts()
    }
    catch (e) { /* silent fail */ }
  }, 3000)

  onUnmounted(() => {
    if (monitorTimer) clearInterval(monitorTimer)
  })
}

// ── Request notification permission ──────────────────────
function requestNotifPermission() {
  if ('Notification' in window) Notification.requestPermission()
}

// ── Audio alert ───────────────────────────────────────────
function playBeep() {
  if (!import.meta.client) return
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  }
  catch {}
}

const pendingAlerts   = computed(() => alerts.value.filter(a => !a.triggered))
const triggeredAlerts = computed(() => alerts.value.filter(a =>  a.triggered))
</script>

<template>
  <div class="absolute right-2 top-12 w-64 rounded-lg shadow-2xl z-50 flex flex-col font-mono text-xs overflow-hidden border"
       style="background: var(--chart-surface); border-color: var(--chart-border); max-height: calc(100% - 60px);">

    <!-- Header -->
    <div class="flex items-center justify-between px-3 py-2 bg-black/20 border-b shrink-0" style="border-color: var(--chart-border)">
      <span class="font-bold text-sm" style="color: var(--text-primary)">🔔 Alerts ({{ pendingAlerts.length }})</span>
      <div class="flex gap-1">
        <button
          @click="requestNotifPermission()"
          class="tt-btn text-[10px] px-1.5 h-6"
          title="Enable browser notifications"
        >🔕</button>
        <button
          @click="showForm = !showForm"
          class="tt-btn h-6 px-2"
          :class="showForm ? 'tt-btn-active' : ''"
        >+ Add</button>
      </div>
    </div>

    <!-- Add Form -->
    <div
      v-if="showForm"
      class="p-2 shrink-0"
      style="background: var(--bg-secondary);
             border-bottom: 1px solid var(--border-color)"
    >
      <div class="flex flex-col gap-1.5">
        <!-- Symbol + Condition -->
        <div class="flex gap-1">
          <input
            :value="chartStore.symbol"
            readonly
            class="tt-input flex-1 opacity-60 cursor-default"
          />
          <select
            v-model="form.condition"
            class="tt-input w-20"
            style="cursor:pointer"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </div>
        <!-- Price -->
        <input
          v-model="form.price"
          type="number"
          placeholder="Target price..."
          class="tt-input w-full"
          @keyup.enter="addAlert()"
        />
        <!-- Note -->
        <input
          v-model="form.note"
          placeholder="Note (optional)..."
          class="tt-input w-full"
          @keyup.enter="addAlert()"
        />
        <!-- Submit -->
        <div class="flex gap-1">
          <button @click="addAlert()" class="tt-btn tt-btn-active flex-1 justify-center">
            ✓ Set Alert
          </button>
          <button @click="showForm = false" class="tt-btn w-8 justify-center">✕</button>
        </div>
      </div>
    </div>

    <!-- Alert Lists -->
    <div class="flex-1 overflow-y-auto">

      <!-- Pending alerts -->
      <div v-if="pendingAlerts.length">
        <div class="px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
             style="color: var(--text-muted); background: var(--bg-secondary)">
          Active ({{ pendingAlerts.length }})
        </div>
        <div
          v-for="alert in pendingAlerts"
          :key="alert.id"
          class="flex items-center gap-2 px-2 py-1.5 group"
          style="border-bottom: 1px solid var(--border-subtle)"
        >
          <!-- Condition icon -->
          <span :style="{ color: alert.condition === 'above'
              ? 'var(--bullish)' : 'var(--bearish)' }">
            {{ alert.condition === 'above' ? '▲' : '▼' }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-bold" style="color: var(--text-primary)">
                {{ alert.symbol }}
              </span>
              <span :style="{ color: alert.condition === 'above'
                  ? 'var(--bullish)' : 'var(--bearish)' }">
                {{ alert.condition }}
              </span>
              <span class="font-bold" style="color: var(--text-primary)">
                ${{ alert.price.toLocaleString() }}
              </span>
            </div>
            <div v-if="alert.note" class="text-[10px] truncate"
                 style="color: var(--text-muted)">
              {{ alert.note }}
            </div>
          </div>
          <button
            @click="removeAlert(alert.id)"
            class="opacity-0 group-hover:opacity-100 tt-btn w-6 px-0 justify-center"
            style="color: var(--bearish)"
          >✕</button>
        </div>
      </div>

      <!-- Triggered alerts -->
      <div v-if="triggeredAlerts.length">
        <div class="px-2 py-1 flex items-center justify-between"
             style="background: var(--bg-secondary)">
          <span class="text-[10px] font-bold uppercase tracking-wide"
                style="color: var(--text-muted)">
            Triggered ({{ triggeredAlerts.length }})
          </span>
          <button @click="clearTriggered()" class="tt-btn text-[10px] px-1.5">
            Clear
          </button>
        </div>
        <div
          v-for="alert in triggeredAlerts"
          :key="alert.id"
          class="flex items-center gap-2 px-2 py-1.5 opacity-50"
          style="border-bottom: 1px solid var(--border-subtle)"
        >
          <span style="color: var(--bullish)">✓</span>
          <span style="color: var(--text-muted)">
            {{ alert.symbol }} {{ alert.condition }} ${{ alert.price.toLocaleString() }}
          </span>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!pendingAlerts.length && !triggeredAlerts.length"
        class="flex flex-col items-center justify-center h-full gap-2"
        style="color: var(--text-muted)"
      >
        <span class="text-2xl">🔕</span>
        <span class="text-[11px]">No alerts set</span>
        <button @click="showForm = true" class="tt-btn tt-btn-active text-[11px]">
          + Add Alert
        </button>
      </div>

    </div>
  </div>
</template>