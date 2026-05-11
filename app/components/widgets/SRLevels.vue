<!-- components/widgets/SRLevels.vue -->
<script setup lang="ts">
interface SRLevel {
  label: string
  price: number
  pct: number
  type: 'resistance' | 'pivot' | 'support'
}

const levels: SRLevel[] = [
  { label: 'Swing High', price: 76089.03, pct: +1.74, type: 'resistance' },
  { label: 'Swing High', price: 75666.84, pct: +1.18, type: 'resistance' },
  { label: 'R1',         price: 75536.52, pct: +1.00, type: 'resistance' },
  { label: '24H High',   price: 75400.00, pct: +0.82, type: 'resistance' },
  { label: 'Swing High', price: 75498.00, pct: +0.95, type: 'resistance' },
  { label: 'Pivot',      price: 74786.86, pct:  0.00, type: 'pivot' },
  { label: '24H Low',    price: 73545.00, pct: -1.66, type: 'support' },
  { label: 'S1',         price: 73351.96, pct: -1.93, type: 'support' },
  { label: 'Swing Low',  price: 70713.49, pct: -5.45, type: 'support' },
  { label: 'Swing Low',  price: 70588.52, pct: -5.61, type: 'support' },
  { label: 'Swing Low',  price: 70581.14, pct: -5.62, type: 'support' },
]

const thresholds = [
  { symbol: 'XAU/USD', value: 65 },
  { symbol: 'NASDAQ',  value: 65 },
  { symbol: 'EUR/USD', value: 65 },
  { symbol: 'USD/JPY', value: 65 },
  { symbol: 'AUD/USD', value: 65 },
  { symbol: 'BTC/USD', value: 65 },
]

function p(v: number) { return v < 1 ? v.toFixed(4) : v.toFixed(2) }
function pctStr(v: number) { return (v > 0 ? '+' : '') + v.toFixed(2) + '%' }

function lvColor(type: string) {
  if (type === 'resistance') return 'color:var(--bearish)'
  if (type === 'support')    return 'color:var(--bullish)'
  return 'color:var(--text-muted)'
}

function pctColor(v: number) {
  if (v > 0) return 'color:var(--bearish)'
  if (v < 0) return 'color:var(--bullish)'
  return 'color:var(--text-muted)'
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden font-mono text-[10px]"
       style="background:var(--chart-bg)">

    <!-- SR Levels -->
    <div class="px-2 py-1 shrink-0 font-bold text-[9px] tracking-wide"
         style="color:var(--text-muted);background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      SR LEVELS
    </div>

    <div class="overflow-y-auto" style="flex:0 1 auto">
      <div
        v-for="(lv, i) in levels" :key="i"
        class="flex items-center gap-1 px-2 py-[3px]"
        style="border-bottom:1px solid var(--chart-border)"
      >
        <!-- label -->
        <span class="w-[68px] shrink-0 text-[9px]" :style="lvColor(lv.type)">
          {{ lv.label }}
        </span>
        <!-- price -->
        <span class="flex-1 text-right font-bold" style="color:var(--text-primary)">
          {{ p(lv.price) }}
        </span>
        <!-- pct -->
        <span class="w-[44px] text-right text-[9px] shrink-0" :style="pctColor(lv.pct)">
          {{ pctStr(lv.pct) }}
        </span>
      </div>
    </div>

    <!-- Thresholds -->
    <div class="px-2 py-1 shrink-0 font-bold text-[9px] tracking-wide"
         style="color:var(--text-muted);background:var(--chart-surface);
                border-top:1px solid var(--chart-border);border-bottom:1px solid var(--chart-border)">
      THRESHOLDS (EVOLVING)
    </div>

    <div class="overflow-y-auto flex-1">
      <div
        v-for="t in thresholds" :key="t.symbol"
        class="flex items-center px-2 py-[3px]"
        style="border-bottom:1px solid var(--chart-border)"
      >
        <span class="flex-1" style="color:var(--text-secondary)">{{ t.symbol }}</span>
        <span class="font-bold" style="color:var(--text-primary)">{{ t.value }}</span>
      </div>
    </div>

  </div>
</template>
