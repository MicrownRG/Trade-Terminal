<!-- components/widgets/MarketContext.vue -->
<script setup lang="ts">
const micro = {
  myTrend:   'DOWN',
  moment:    'BEAR',
  season:    'ASIA',
  season2:   'LONDON',
  spread:    74982.03,
  session:   75003.74,
}

const healer = {
  symbol: 'BTC/USD',
  signal: 'BUY' as 'BUY' | 'SELL',
  entry:  74786.86,
  sl:     73305.89,
  tp:     76808.32,
}

function badgeStyle(v: string) {
  if (v === 'UP' || v === 'BUY' || v === 'BULL')
    return 'color:var(--bullish);background:var(--bullish-bg)'
  if (v === 'DOWN' || v === 'SELL' || v === 'BEAR')
    return 'color:var(--bearish);background:var(--bearish-bg)'
  return 'color:var(--text-muted);background:var(--bg-tertiary)'
}

function sessionStyle() {
  return 'color:var(--text-muted);background:var(--bg-tertiary)'
}
</script>

<template>
  <div class="flex flex-col h-full overflow-y-auto font-mono text-[10px]"
       style="background:var(--chart-bg)">

    <!-- ── My Micro ──────────────────────────────── -->
    <div class="px-2 py-1 shrink-0 font-bold text-[9px] tracking-wide"
         style="color:var(--text-muted);background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      MY MICRO
    </div>

    <!-- My Trend + Moment -->
    <div class="flex items-center gap-2 px-2 py-1.5"
         style="border-bottom:1px solid var(--chart-border)">
      <div class="flex-1">
        <div class="text-[9px]" style="color:var(--text-muted)">MY TREND</div>
        <span class="px-1.5 py-0.5 rounded font-bold text-[9px]" :style="badgeStyle(micro.myTrend)">
          {{ micro.myTrend }}
        </span>
      </div>
      <div class="flex-1">
        <div class="text-[9px]" style="color:var(--text-muted)">MOMENT</div>
        <span class="px-1.5 py-0.5 rounded font-bold text-[9px]" :style="badgeStyle(micro.moment)">
          {{ micro.moment }}
        </span>
      </div>
    </div>

    <!-- Season + Season2 -->
    <div class="flex items-center gap-2 px-2 py-1.5"
         style="border-bottom:1px solid var(--chart-border)">
      <div class="flex-1">
        <div class="text-[9px]" style="color:var(--text-muted)">SEASON</div>
        <span class="px-1.5 py-0.5 rounded text-[9px]" :style="sessionStyle()">
          {{ micro.season }}
        </span>
      </div>
      <div class="flex-1">
        <div class="text-[9px]" style="color:var(--text-muted)">SEASON 2</div>
        <span class="px-1.5 py-0.5 rounded text-[9px]" :style="sessionStyle()">
          {{ micro.season2 }}
        </span>
      </div>
    </div>

    <!-- Spread + Session values -->
    <div class="grid grid-cols-2 gap-px" style="border-bottom:1px solid var(--chart-border);background:var(--chart-border)">
      <div class="px-2 py-1.5 text-center" style="background:var(--chart-bg)">
        <div class="text-[9px]" style="color:var(--text-muted)">SPREAD</div>
        <div class="font-bold" style="color:var(--text-primary)">{{ micro.spread.toFixed(2) }}</div>
      </div>
      <div class="px-2 py-1.5 text-center" style="background:var(--chart-bg)">
        <div class="text-[9px]" style="color:var(--text-muted)">SESSION</div>
        <div class="font-bold" style="color:var(--text-primary)">{{ micro.session.toFixed(2) }}</div>
      </div>
    </div>

    <!-- ── Healer Watch ───────────────────────────── -->
    <div class="px-2 py-1 shrink-0 font-bold text-[9px] tracking-wide"
         style="color:var(--text-muted);background:var(--chart-surface);border-bottom:1px solid var(--chart-border);border-top:1px solid var(--chart-border)">
      HEALER WATCH
    </div>

    <div class="px-2 py-2 space-y-1.5">
      <!-- Symbol + direction -->
      <div class="flex items-center justify-between">
        <span class="font-bold" style="color:var(--text-primary)">{{ healer.symbol }}</span>
        <span class="px-2 py-0.5 rounded font-bold text-[9px]" :style="badgeStyle(healer.signal)">
          {{ healer.signal }}
        </span>
      </div>

      <!-- Entry / SL / TP -->
      <div class="space-y-1">
        <div class="flex justify-between">
          <span style="color:var(--text-muted)">Entry</span>
          <span class="font-bold" style="color:var(--text-primary)">{{ healer.entry.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span style="color:var(--text-muted)">SL</span>
          <span class="font-bold" style="color:var(--bearish)">{{ healer.sl.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span style="color:var(--text-muted)">TP</span>
          <span class="font-bold" style="color:var(--bullish)">{{ healer.tp.toFixed(2) }}</span>
        </div>
      </div>
    </div>

  </div>
</template>
