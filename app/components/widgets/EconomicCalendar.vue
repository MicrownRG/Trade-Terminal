<!-- components/widgets/EconomicCalendar.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface CalendarEvent {
  id: string
  time: string
  country: string
  event: string
  impact: 'High' | 'Medium' | 'Low'
  actual?: string
  forecast?: string
  previous: string
}

const events = ref<CalendarEvent[]>([])
const isLoading = ref(true)

function generateMockEvents() {
  setTimeout(() => {
    events.value = [
      { id: '1', time: '08:30', country: 'US', event: 'Core CPI (MoM) (Apr)', impact: 'High', actual: '0.3%', forecast: '0.3%', previous: '0.4%' },
      { id: '2', time: '08:30', country: 'US', event: 'CPI (YoY) (Apr)', impact: 'High', actual: '3.4%', forecast: '3.4%', previous: '3.5%' },
      { id: '3', time: '08:30', country: 'US', event: 'Retail Sales (MoM) (Apr)', impact: 'High', actual: '0.0%', forecast: '0.4%', previous: '0.6%' },
      { id: '4', time: '10:00', country: 'US', event: 'Business Inventories (MoM) (Mar)', impact: 'Low', forecast: '0.0%', previous: '0.4%' },
      { id: '5', time: '10:30', country: 'US', event: 'Crude Oil Inventories', impact: 'Medium', forecast: '-1.350M', previous: '-1.362M' },
      { id: '6', time: '13:00', country: 'US', event: '10-Year Note Auction', impact: 'Low', previous: '4.560%' },
      { id: '7', time: '14:00', country: 'US', event: 'Fed Chair Powell Speaks', impact: 'High', previous: '' },
    ]
    isLoading.value = false
  }, 800)
}

function getImpactColor(impact: string) {
  if (impact === 'High') return 'bg-red-500'
  if (impact === 'Medium') return 'bg-orange-500'
  return 'bg-gray-500'
}

onMounted(() => {
  generateMockEvents()
})
</script>

<template>
  <div class="flex flex-col h-full bg-chart-bg overflow-hidden text-[11px] font-mono">
    <div class="flex items-center justify-between px-3 py-2 border-b border-chart-border bg-chart-surface shrink-0">
      <div class="flex items-center gap-2">
        <span class="text-chart-text font-bold">Economic Calendar</span>
      </div>
      <div class="flex gap-2 text-[9px]">
        <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span>High</div>
        <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-orange-500"></span>Med</div>
        <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-gray-500"></span>Low</div>
      </div>
    </div>
    
    <div class="flex-1 overflow-y-auto relative">
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
        <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <table v-else class="w-full text-left border-collapse">
        <thead class="sticky top-0 bg-chart-surface z-10 shadow-sm">
          <tr class="text-chart-muted border-b border-chart-border">
            <th class="py-1.5 px-3 font-normal">Time</th>
            <th class="py-1.5 px-2 font-normal w-6"></th>
            <th class="py-1.5 px-2 font-normal">Event</th>
            <th class="py-1.5 px-2 font-normal text-right">Actual</th>
            <th class="py-1.5 px-2 font-normal text-right">Forecast</th>
            <th class="py-1.5 px-3 font-normal text-right">Prev</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ev in events" :key="ev.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="py-2 px-3 text-chart-muted whitespace-nowrap">{{ ev.time }}</td>
            <td class="py-2 px-2 text-center">
              <span class="inline-block w-2 h-2 rounded-full" :class="getImpactColor(ev.impact)" :title="ev.impact"></span>
            </td>
            <td class="py-2 px-2 text-chart-text">
              <span class="font-bold mr-1">{{ ev.country }}</span> {{ ev.event }}
            </td>
            <td class="py-2 px-2 text-right font-bold" 
                :class="ev.actual && ev.forecast && parseFloat(ev.actual) > parseFloat(ev.forecast) ? 'text-bullish' : (ev.actual && ev.forecast && parseFloat(ev.actual) < parseFloat(ev.forecast) ? 'text-bearish' : 'text-chart-text')">
              {{ ev.actual || '-' }}
            </td>
            <td class="py-2 px-2 text-right text-chart-muted">{{ ev.forecast || '-' }}</td>
            <td class="py-2 px-3 text-right text-chart-muted">{{ ev.previous || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
