<!-- components/dashboard/FibSettingsPanel.vue -->
<!-- Floating panel for customizing Fibonacci levels — teleported to body, fixed-positioned -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{ close: [] }>()

const chartStore = useChartStore()

const newLevel = ref('')

// Local draft state
const draftLevels = ref<{value: number, enabled: boolean}[]>([])
const draftOptions = ref({
  showPrices: true,
  showPercentages: true,
  extendLines: false
})

const DEFAULT_LEVELS = [
  { value: 0, enabled: true },
  { value: 0.236, enabled: true },
  { value: 0.382, enabled: true },
  { value: 0.5, enabled: true },
  { value: 0.618, enabled: true },
  { value: 0.786, enabled: true },
  { value: 1.0, enabled: true },
]

onMounted(() => {
  // Initialize draft from store
  draftLevels.value = JSON.parse(JSON.stringify(chartStore.fibLevels))
  draftOptions.value.showPrices = chartStore.fibShowPrices
  draftOptions.value.showPercentages = chartStore.fibShowPercentages
  draftOptions.value.extendLines = chartStore.fibExtendLines
})

function resetToDefault() {
  draftLevels.value = JSON.parse(JSON.stringify(DEFAULT_LEVELS))
}

function addLevel() {
  const v = parseFloat(newLevel.value)
  if (isNaN(v)) return
  if (draftLevels.value.some(l => l.value === v)) return
  draftLevels.value.push({ value: +v.toFixed(4), enabled: true })
  draftLevels.value.sort((a, b) => a.value - b.value)
  newLevel.value = ''
}

function removeLevel(index: number) {
  draftLevels.value.splice(index, 1)
}

function save() {
  // Apply draft to store
  chartStore.$patch({
    fibLevels: draftLevels.value,
    fibShowPrices: draftOptions.value.showPrices,
    fibShowPercentages: draftOptions.value.showPercentages,
    fibExtendLines: draftOptions.value.extendLines
  })
  chartStore.saveFibSettings()
  emit('close')
}

function cancel() {
  emit('close')
}

function levelColor(v: number): string {
  const presets: Record<number, string> = {
    0: '#ef5350', 0.236: '#ff9800', 0.382: '#2962ff',
    0.5: '#9c27b0', 0.618: '#26a69a', 0.786: '#ff9800', 1: '#ef5350',
  }
  return presets[v] ?? '#8b949e'
}
</script>

<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" @mousedown.self="cancel">
    <div
      class="rounded-lg shadow-2xl font-mono text-[11px] w-[320px] max-h-[80vh] flex flex-col"
      style="background:var(--chart-surface);border:1px solid var(--chart-border);"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b shrink-0"
           style="border-color:var(--chart-border)">
        <span class="font-bold text-sm" style="color:var(--text-primary)">Fibonacci Settings</span>
        <div class="flex items-center gap-2">
          <button class="text-[10px] px-2 py-1 rounded transition-colors"
                  style="color:var(--text-muted);background:var(--bg-tertiary)"
                  @click="resetToDefault">Reset</button>
          <button class="text-[14px] leading-none hover:text-red-400 transition-colors"
                  style="color:var(--text-muted);"
                  @click="cancel">✕</button>
        </div>
      </div>

    <!-- Level list -->
    <div class="overflow-y-auto" style="max-height:200px">
      <div
        v-for="(lv, i) in draftLevels" :key="i"
        class="flex items-center gap-2 px-3 py-1 group"
        style="border-bottom:1px solid var(--chart-border)"
      >
        <!-- Enable/disable checkbox -->
        <input 
          type="checkbox" 
          v-model="lv.enabled" 
          class="w-3 h-3 rounded accent-blue-400 cursor-pointer"
        />

        <!-- Color dot -->
        <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: levelColor(lv.value) }" />

        <!-- Editable ratio -->
        <input
          v-model.number="lv.value"
          type="number"
          step="0.001"
          class="flex-1 bg-transparent outline-none font-bold"
          :style="{ color: lv.enabled ? 'var(--text-primary)' : 'var(--text-muted)' }"
        />

        <!-- Label -->
        <span class="text-[9px]" style="color:var(--text-muted)">{{ (lv.value * 100).toFixed(1) }}%</span>

        <!-- Delete -->
        <button
          class="opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 rounded flex items-center justify-center text-[10px]"
          style="color:var(--bearish)"
          @click="removeLevel(i)"
        >✕</button>
      </div>
    </div>

    <!-- Add level -->
    <div class="flex items-center gap-1.5 px-3 py-2 border-t"
         style="border-color:var(--chart-border)">
      <input
        v-model="newLevel"
        placeholder="e.g. 0.5"
        class="flex-1 bg-transparent outline-none text-[11px]"
        style="color:var(--text-primary);border-bottom:1px solid var(--chart-border)"
        @keyup.enter="addLevel"
      />
      <button class="tt-btn text-[10px] h-6 px-2" @click="addLevel">+ Add</button>
    </div>

    <!-- Options -->
    <div class="px-3 py-2 space-y-1.5 border-t" style="border-color:var(--chart-border)">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="draftOptions.showPrices" class="w-3 h-3 rounded" />
        <span style="color:var(--text-secondary)">Show Prices</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="draftOptions.showPercentages" class="w-3 h-3 rounded" />
        <span style="color:var(--text-secondary)">Show Percentages</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="draftOptions.extendLines" class="w-3 h-3 rounded" />
        <span style="color:var(--text-secondary)">Extend Lines</span>
      </label>
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
