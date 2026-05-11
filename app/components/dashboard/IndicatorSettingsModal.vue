<!-- components/dashboard/IndicatorSettingsModal.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { IndicatorId, IndicatorParams } from '~/types'

const props = defineProps<{
  indicatorId: IndicatorId
}>()

const emit = defineEmits<{ close: [] }>()

const chartStore = useChartStore()

// Local draft state
const draft = ref<IndicatorParams>({})

onMounted(() => {
  draft.value = JSON.parse(JSON.stringify(chartStore.getIndicatorParams(props.indicatorId)))
})

function save() {
  for (const [key, val] of Object.entries(draft.value)) {
    chartStore.setIndicatorParam(props.indicatorId, key, val)
  }
  // Force a reactivity trigger so the chart re-renders the indicator
  chartStore.activeIndicators = [...chartStore.activeIndicators]
  emit('close')
}

function cancel() {
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" @mousedown.self="cancel">
    <div
      class="rounded-lg shadow-2xl font-mono text-[11px] w-[320px] flex flex-col"
      style="background:var(--chart-surface);border:1px solid var(--chart-border);"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b shrink-0"
           style="border-color:var(--chart-border)">
        <span class="font-bold text-sm" style="color:var(--text-primary)">{{ indicatorId }} Settings</span>
        <button class="text-[14px] leading-none hover:text-red-400 transition-colors"
                style="color:var(--text-muted);"
                @click="cancel">✕</button>
      </div>

      <!-- Settings Form -->
      <div class="p-4 space-y-3">
        <!-- SMA / EMA / RSI / BB (Period 1) -->
        <label v-if="['SMA', 'EMA', 'RSI', 'BB'].includes(indicatorId)" class="flex flex-col gap-1">
          <span style="color:var(--text-muted)">Period</span>
          <input
            v-model.number="draft.period1"
            type="number" min="1" max="500"
            class="px-2 py-1 rounded bg-black/20 outline-none border focus:border-blue-500 transition-colors"
            style="color:var(--text-primary);border-color:var(--chart-border)"
          />
        </label>

        <!-- SMA / EMA (Period 2) -->
        <label v-if="['SMA', 'EMA'].includes(indicatorId)" class="flex flex-col gap-1">
          <span style="color:var(--text-muted)">Period 2</span>
          <input
            v-model.number="draft.period2"
            type="number" min="1" max="500"
            class="px-2 py-1 rounded bg-black/20 outline-none border focus:border-blue-500 transition-colors"
            style="color:var(--text-primary);border-color:var(--chart-border)"
          />
        </label>

        <!-- BB (StdDev) -->
        <label v-if="indicatorId === 'BB'" class="flex flex-col gap-1">
          <span style="color:var(--text-muted)">Std Dev</span>
          <input
            v-model.number="draft.stdDev"
            type="number" step="0.1" min="0.1" max="10"
            class="px-2 py-1 rounded bg-black/20 outline-none border focus:border-blue-500 transition-colors"
            style="color:var(--text-primary);border-color:var(--chart-border)"
          />
        </label>

        <!-- RSI (Overbought/Oversold) -->
        <div v-if="indicatorId === 'RSI'" class="flex gap-2">
          <label class="flex flex-col gap-1 flex-1">
            <span style="color:var(--text-muted)">Overbought</span>
            <input
              v-model.number="draft.overbought"
              type="number" min="50" max="100"
              class="px-2 py-1 rounded bg-black/20 outline-none border focus:border-blue-500 transition-colors"
              style="color:var(--text-primary);border-color:var(--chart-border)"
            />
          </label>
          <label class="flex flex-col gap-1 flex-1">
            <span style="color:var(--text-muted)">Oversold</span>
            <input
              v-model.number="draft.oversold"
              type="number" min="0" max="50"
              class="px-2 py-1 rounded bg-black/20 outline-none border focus:border-blue-500 transition-colors"
              style="color:var(--text-primary);border-color:var(--chart-border)"
            />
          </label>
        </div>

        <!-- MACD -->
        <div v-if="indicatorId === 'MACD'" class="flex gap-2">
          <label class="flex flex-col gap-1 flex-1">
            <span style="color:var(--text-muted)">Fast</span>
            <input
              v-model.number="draft.fast"
              type="number" min="1" max="100"
              class="px-2 py-1 rounded bg-black/20 outline-none border focus:border-blue-500 transition-colors"
              style="color:var(--text-primary);border-color:var(--chart-border)"
            />
          </label>
          <label class="flex flex-col gap-1 flex-1">
            <span style="color:var(--text-muted)">Slow</span>
            <input
              v-model.number="draft.slow"
              type="number" min="1" max="200"
              class="px-2 py-1 rounded bg-black/20 outline-none border focus:border-blue-500 transition-colors"
              style="color:var(--text-primary);border-color:var(--chart-border)"
            />
          </label>
          <label class="flex flex-col gap-1 flex-1">
            <span style="color:var(--text-muted)">Signal</span>
            <input
              v-model.number="draft.signal"
              type="number" min="1" max="100"
              class="px-2 py-1 rounded bg-black/20 outline-none border focus:border-blue-500 transition-colors"
              style="color:var(--text-primary);border-color:var(--chart-border)"
            />
          </label>
        </div>
        
        <div v-if="indicatorId === 'VWAP'" class="text-center py-4" style="color:var(--text-muted)">
          No configurable parameters for VWAP.
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-end gap-2 px-3 py-3 border-t bg-black/20" style="border-color:var(--chart-border)">
        <button class="px-4 py-1.5 rounded text-xs font-bold transition-colors"
                style="color:var(--text-muted);background:var(--bg-tertiary)"
                @click="cancel">Cancel</button>
        <button class="px-4 py-1.5 rounded text-xs font-bold transition-colors"
                style="color:#fff;background:var(--accent-blue)"
                @click="save">Save Settings</button>
      </div>
    </div>
  </div>
</template>
