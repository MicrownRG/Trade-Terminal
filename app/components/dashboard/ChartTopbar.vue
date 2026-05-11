<!-- components/dashboard/ChartTopbar.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { IndicatorId } from '~/types'
import type { GroupId } from '~/stores/groups'
import { GROUP_COLORS, GROUP_LABELS } from '~/stores/groups'
import DashboardIndicatorSettingsModal from './IndicatorSettingsModal.vue'

const props = defineProps<{
  currentTf: string
  symbol: string
  group: GroupId
}>()

const emit = defineEmits<{
  'update:tf':     [tf: string]
  'toggle-alerts': []
  'update:symbol': [symbol: string]
  'update:group':  [group: GroupId]
}>()

const chartStore = useChartStore()

const timeframes  = ['1m','5m','15m','30m','1h','4h','1d','1w']
const chartTypes  = [
  { id: 'candlestick', icon: '🕯', title: 'Candlestick' },
  { id: 'heikinashi',  icon: 'HA', title: 'Heikin-Ashi' },
  { id: 'bar',         icon: '𝄗', title: 'Bar' },
  { id: 'line',        icon: '∿', title: 'Line' },
  { id: 'area',        icon: '◿', title: 'Area' },
]

const indicators: { id: IndicatorId; label: string; cssVar: string }[] = [
  { id: 'SMA',  label: 'SMA',  cssVar: '--ind-sma' },
  { id: 'EMA',  label: 'EMA',  cssVar: '--ind-ema' },
  { id: 'BB',   label: 'BB',   cssVar: '--ind-bb' },
  { id: 'VWAP', label: 'VWAP', cssVar: '--ind-vwap' },
  { id: 'RSI',  label: 'RSI',  cssVar: '--ind-rsi' },
  { id: 'MACD', label: 'MACD', cssVar: '--ind-macd' },
]

// ── Symbol editing ─────────────────────────────────────────
const editingSymbol  = ref(false)
const symbolInputVal = ref('')
const symbolInputRef = ref<HTMLInputElement | null>(null)

function startEditSymbol() {
  symbolInputVal.value = props.symbol
  editingSymbol.value  = true
  nextTick(() => symbolInputRef.value?.select())
}

function confirmSymbol() {
  const sym = symbolInputVal.value.toUpperCase().trim()
  if (sym && sym !== props.symbol) emit('update:symbol', sym)
  editingSymbol.value = false
}

function cancelEditSymbol() { editingSymbol.value = false }

// ── Group cycling (0→1→2→3→4→5→0) ────────────────────────
function cycleGroup() {
  const next = ((props.group + 1) % 6) as GroupId
  emit('update:group', next)
}

const groupColor = computed(() => GROUP_COLORS[props.group])
const groupLabel = computed(() => GROUP_LABELS[props.group])

// ── Indicators ─────────────────────────────────────────────
const showIndicators = ref(false)
const indBtnRef = ref<HTMLElement | null>(null)
const activeSettingsInd = ref<IndicatorId | null>(null)

function isIndActive(id: IndicatorId) {
  return chartStore.activeIndicators.includes(id)
}

function getIndStyle(active: boolean, cssVar: string) {
  if (!active) return {}
  return {
    color:           `var(${cssVar})`,
    backgroundColor: `color-mix(in srgb, var(${cssVar}) 15%, transparent)`,
    borderColor:     `color-mix(in srgb, var(${cssVar}) 40%, transparent)`,
  }
}

const activeIndCount = computed(() => chartStore.activeIndicators.length)

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (showIndicators.value && indBtnRef.value && !indBtnRef.value.contains(target)) {
    showIndicators.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div
    class="flex items-center gap-1 px-2 py-1 shrink-0 scrollbar-none flex-wrap w-full"
    style="background: var(--chart-surface); border-bottom: 1px solid var(--chart-border);"
  >
    <!-- Group indicator — click to cycle 0→1→2→3→4→5→0 -->
    <button
      @click="cycleGroup"
      class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-all"
      :style="{
        background: props.group === 0 ? 'var(--bg-tertiary)' : groupColor + '33',
        border:     '1.5px solid ' + groupColor,
        color:      props.group === 0 ? 'var(--text-muted)' : groupColor,
      }"
      :title="props.group === 0 ? 'No group — click to assign sync group' : `Sync group ${groupLabel} — click to change`"
    >{{ groupLabel }}</button>

    <!-- Symbol display / editor -->
    <div class="flex items-center shrink-0" style="border-right:1px solid var(--border-color); padding-right:6px; margin-right:2px">
      <input
        v-if="editingSymbol"
        ref="symbolInputRef"
        v-model="symbolInputVal"
        class="w-24 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded outline-none"
        style="background:var(--bg-tertiary);color:var(--text-primary);border:1px solid var(--ind-sma)"
        @keyup.enter="confirmSymbol"
        @keyup.escape="cancelEditSymbol"
        @blur="confirmSymbol"
        placeholder="e.g. ETHUSDT"
      />
      <button
        v-else
        @click="startEditSymbol"
        class="tt-btn px-2 font-mono font-bold text-[11px]"
        title="Click to change symbol for this chart"
      >{{ props.symbol }}</button>
    </div>

    <!-- Chart Type -->
    <div class="flex gap-0.5" style="border-right:1px solid var(--border-color); padding-right:6px; margin-right:2px">
      <button
        v-for="ct in chartTypes" :key="ct.id"
        @click="chartStore.setChartType(ct.id)"
        class="tt-btn px-1.5 justify-center font-mono"
        :class="[chartStore.chartType === ct.id ? 'tt-btn-active' : '', ct.id === 'heikinashi' ? 'text-[9px] font-bold' : 'text-sm']"
        :title="ct.title"
      >{{ ct.icon }}</button>
    </div>

    <!-- Timeframe -->
    <div class="flex gap-0.5" style="border-right:1px solid var(--border-color); padding-right:6px; margin-right:2px">
      <button
        v-for="tf in timeframes" :key="tf"
        @click="emit('update:tf', tf)"
        class="tt-btn px-1.5 font-bold"
        :class="props.currentTf === tf ? 'tt-btn-active' : ''"
      >{{ tf }}</button>
    </div>

    <!-- Indicators dropdown -->
    <div class="relative" ref="indBtnRef">
      <button
        @click.stop="showIndicators = !showIndicators"
        class="tt-btn px-2 gap-1"
        :class="showIndicators ? 'tt-btn-active' : ''"
        title="Indicators"
      >
        <span>Ind</span>
        <span v-if="activeIndCount" class="text-[9px] px-1 py-0 rounded-full"
              style="background:var(--ind-sma);color:#000">{{ activeIndCount }}</span>
        <span class="text-[9px] opacity-50">▾</span>
      </button>

      <div
        v-if="showIndicators"
        class="absolute top-full left-0 mt-1 z-50 rounded-lg shadow-2xl py-1"
        style="background:var(--chart-surface);border:1px solid var(--chart-border);min-width:180px"
      >
        <div
          v-for="ind in indicators" :key="ind.id"
          class="flex items-center justify-between px-3 py-1.5 hover:bg-black/10 group"
          :style="isIndActive(ind.id) ? getIndStyle(true, ind.cssVar) : {}"
        >
          <label class="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="checkbox"
              :checked="isIndActive(ind.id)"
              @change="chartStore.toggleIndicator(ind.id)"
              class="w-3 h-3 rounded accent-blue-400"
            />
            <span class="text-[11px] font-mono">{{ ind.label }}</span>
          </label>
          <button 
            v-if="isIndActive(ind.id)"
            @click.stop="activeSettingsInd = ind.id; showIndicators = false"
            class="opacity-0 group-hover:opacity-100 px-2 py-0.5 text-[10px] rounded hover:bg-white/20 transition-colors"
            title="Settings"
          >⚙</button>
        </div>
      </div>
    </div>

    <!-- Indicator Settings Modal -->
    <Teleport to="body">
      <DashboardIndicatorSettingsModal
        v-if="activeSettingsInd"
        :indicator-id="activeSettingsInd"
        @close="activeSettingsInd = null"
      />
    </Teleport>

    <!-- Alerts toggle -->
    <button
      @click="emit('toggle-alerts')"
      class="tt-btn px-2 ml-1 flex items-center gap-1.5"
      title="Price Alerts"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
      Alerts
    </button>

    <!-- Candle Color Mode toggle -->
    <div class="ml-auto flex-shrink-0">
      <button
        @click="chartStore.toggleCandleColorMode()"
        class="tt-btn gap-1.5"
        :title="chartStore.candleColorMode === 'color' ? 'Switch to Monochrome' : 'Switch to Color'"
        :style="chartStore.candleColorMode === 'mono'
          ? 'background:rgba(180,200,220,0.12);border-color:rgba(180,200,220,0.35);color:#c8d8e8'
          : ''"
      >
        <span class="flex gap-0.5 items-center">
          <span
            class="inline-block w-2.5 h-3.5 rounded-sm"
            :style="chartStore.candleColorMode === 'mono'
              ? 'background:#c8d8e8'
              : 'background:#26a69a'"
          />
          <span
            class="inline-block w-2.5 h-3.5 rounded-sm"
            :style="chartStore.candleColorMode === 'mono'
              ? 'background:#2e3f50'
              : 'background:#ef5350'"
          />
        </span>
        <span class="text-[10px]">{{ chartStore.candleColorMode === 'mono' ? 'B/W' : 'Color' }}</span>
      </button>
    </div>
  </div>
</template>
