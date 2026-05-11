<!-- components/dashboard/DrawingSidebar.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import type { DrawingToolDef } from '~/types'
import DashboardFibSettingsPanel from './FibSettingsPanel.vue'

const chartStore = useChartStore()

const tools: DrawingToolDef[] = [
  { id: 'select', label: 'Select (Esc)', group: 'cursor', svgPath: 'M7 2l12 11.2-5.8.5 3.3 7.3-2.25.9-3.2-7.4-4.4 5V2z' },
  { id: 'TrendLine', label: 'Trend Line', group: 'lines', svgPath: 'M4 20L20 4' },
  { id: 'HorizontalLine', label: 'Horizontal Line', group: 'lines', svgPath: 'M2 12h20' },
  { id: 'VerticalLine', label: 'Vertical Line', group: 'lines', svgPath: 'M12 2v20' },
  { id: 'FibRetracement', label: 'Fibonacci', group: 'fibonacci', svgPath: 'M3 6h18M3 12h18M3 18h18' },
  { id: 'Rectangle', label: 'Rectangle', group: 'shapes', svgPath: 'M4 6h16v12H4z' },
  { id: 'TextAnnotation', label: 'Text', group: 'annotations', svgPath: 'M6 5v2h5v12h2V7h5V5H6z' },
]

const showFibSettings = ref(false)

const emit = defineEmits<{
  'remove-selected': []
  'clear-all': []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-2 py-2 shrink-0 border-r"
       style="background: var(--chart-surface); border-color: var(--chart-border); width: 36px;">
    
    <div v-for="group in ['cursor', 'lines', 'fibonacci', 'shapes', 'annotations']" :key="group" 
         class="flex flex-col gap-1 w-full px-1 items-center border-b pb-2" 
         style="border-color: var(--border-color)">
      <template v-for="tool in tools.filter(t => t.group === group)" :key="String(tool.id)">
        <div v-if="tool.id === 'FibRetracement'" class="relative flex flex-col items-center w-full">
           <button
            @click="chartStore.setActiveTool(tool.id)"
            class="w-7 h-7 rounded flex justify-center items-center hover:bg-white/10 transition-colors relative group"
            :class="chartStore.activeTool === tool.id ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400'"
            :title="tool.label"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="tool.svgPath" />
            </svg>
            <span v-if="chartStore.isDrawingInProgress && chartStore.activeTool === tool.id" 
                  class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 rounded-full border border-[#1a1f26]"></span>
          </button>
           <button
            @click.stop="showFibSettings = !showFibSettings"
            class="w-4 h-4 mt-0.5 text-[8px] flex items-center justify-center rounded hover:bg-white/10"
            :class="showFibSettings ? 'text-blue-400' : 'text-gray-500'"
            title="Fibonacci Settings"
          >⚙</button>
          
          <Teleport to="body">
            <DashboardFibSettingsPanel
              v-if="showFibSettings"
              @close="showFibSettings = false"
            />
          </Teleport>
        </div>

        <button
          v-else
          @click="tool.id === 'select' ? chartStore.clearActiveTool() : chartStore.setActiveTool(tool.id)"
          class="w-7 h-7 rounded flex justify-center items-center hover:bg-white/10 transition-colors relative group"
          :class="chartStore.activeTool === tool.id || (tool.id === 'select' && chartStore.activeTool === null) ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400'"
          :title="tool.label"
        >
          <svg viewBox="0 0 24 24" class="w-4 h-4 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="tool.id === 'select' ? 'fill-current' : ''">
            <path :d="tool.svgPath" />
          </svg>
          <span v-if="chartStore.isDrawingInProgress && chartStore.activeTool === tool.id" 
                class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 rounded-full border border-[#1a1f26]"></span>
        </button>
      </template>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-1 w-full px-1 items-center mt-auto pt-2">
      <button
        @click="emit('remove-selected')"
        class="w-7 h-7 rounded flex justify-center items-center hover:bg-white/10 text-red-400/80 hover:text-red-400 transition-colors"
        title="Remove Selected Drawing (Del)"
      >
        <svg viewBox="0 0 24 24" class="w-4 h-4 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
        </svg>
      </button>
      <button
        @click="emit('clear-all')"
        class="w-7 h-7 rounded flex justify-center items-center hover:bg-white/10 text-red-500/80 hover:text-red-500 transition-colors"
        title="Clear All Drawings"
      >
        <svg viewBox="0 0 24 24" class="w-4 h-4 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l-6 6M12 9l6 6" />
        </svg>
      </button>
    </div>
  </div>
</template>
