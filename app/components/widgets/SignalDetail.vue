<!-- components/widgets/SignalDetail.vue -->
<script setup lang="ts">
const signal = {
  symbol:    'BTC/USD',
  direction: 'BUY' as 'BUY' | 'SELL',
  entry:     74786.86,
  sl:        73305.89,
  tp:        76808.32,
  rr:        '1:1.5',
  slPips:    1481,
  lotSize:   0.87,
  threshold: 65,
  m1Momen:   'BEAR',
}

const market = {
  m1Trend:   'UP',
  session:   'ASIA',
  val1:      74843.45,
  val2:      74779.71,
  spread:    '0.308%',
  threshold: 65,
  signals:   101,
}

function dirStyle(d: string) {
  return d === 'BUY'
    ? 'color:var(--bullish);background:var(--bullish-bg)'
    : 'color:var(--bearish);background:var(--bearish-bg)'
}

function trendStyle(v: string) {
  if (v === 'UP')   return 'color:var(--bullish);background:var(--bullish-bg)'
  if (v === 'DOWN') return 'color:var(--bearish);background:var(--bearish-bg)'
  return 'color:var(--text-muted);background:var(--bg-tertiary)'
}

function bearBullStyle(v: string) {
  if (v === 'BULL') return 'color:var(--bullish)'
  if (v === 'BEAR') return 'color:var(--bearish)'
  return 'color:var(--text-muted)'
}
</script>

<template>
  <div class="flex flex-col h-full overflow-y-auto font-mono text-[10px]"
       style="background:var(--chart-bg)">

    <!-- ── Signal Detail ────────────────────────── -->
    <div class="px-2 py-1 shrink-0 flex items-center justify-between font-bold text-[9px] tracking-wide"
         style="color:var(--text-muted);background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      <span>SIGNAL DETAIL</span>
      <span style="color:var(--text-primary)">{{ signal.symbol }}</span>
    </div>

    <!-- Direction -->
    <div class="flex items-center justify-between px-2 py-1.5"
         style="border-bottom:1px solid var(--chart-border)">
      <span style="color:var(--text-muted)">Direction</span>
      <span class="px-2 py-0.5 rounded font-bold text-[9px]" :style="dirStyle(signal.direction)">
        {{ signal.direction }}
      </span>
    </div>

    <!-- Fields grid -->
    <div class="grid grid-cols-1 divide-y" style="border-bottom:1px solid var(--chart-border);divide-color:var(--chart-border)">
      <div v-for="row in [
        { label: 'Entry',     val: signal.entry.toFixed(2),  color: 'var(--text-primary)' },
        { label: 'Stop Loss', val: signal.sl.toFixed(2),     color: 'var(--bearish)' },
        { label: 'Take Profit',val: signal.tp.toFixed(2),    color: 'var(--bullish)' },
        { label: 'R:R',       val: signal.rr,                color: 'var(--text-primary)' },
        { label: 'SL Pips',   val: signal.slPips.toString(), color: 'var(--text-secondary)' },
        { label: 'Lot Size',  val: signal.lotSize.toString(), color: 'var(--text-primary)' },
        { label: 'Threshold', val: signal.threshold.toString(), color: 'var(--text-primary)' },
        { label: 'M1 Momen', val: signal.m1Momen,            color: signal.m1Momen === 'BEAR' ? 'var(--bearish)' : 'var(--bullish)' },
      ]" :key="row.label"
        class="flex items-center justify-between px-2 py-[4px]"
        style="border-color:var(--chart-border)"
      >
        <span style="color:var(--text-muted)">{{ row.label }}</span>
        <span class="font-bold" :style="{ color: row.color }">{{ row.val }}</span>
      </div>
    </div>

    <!-- ── Market Context ───────────────────────── -->
    <div class="px-2 py-1 shrink-0 font-bold text-[9px] tracking-wide"
         style="color:var(--text-muted);background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      MARKET CONTEXT
    </div>

    <!-- Trend + Session badges -->
    <div class="flex items-center gap-2 px-2 py-1.5"
         style="border-bottom:1px solid var(--chart-border)">
      <div class="flex-1">
        <div class="text-[9px]" style="color:var(--text-muted)">M1 TREND</div>
        <span class="px-1.5 py-0.5 rounded font-bold text-[9px]" :style="trendStyle(market.m1Trend)">
          {{ market.m1Trend }}
        </span>
      </div>
      <div class="flex-1">
        <div class="text-[9px]" style="color:var(--text-muted)">SESSION</div>
        <span class="px-1.5 py-0.5 rounded font-bold text-[9px]"
              style="color:var(--text-muted);background:var(--bg-tertiary)">
          {{ market.session }}
        </span>
      </div>
    </div>

    <!-- Values row -->
    <div class="grid grid-cols-2 gap-px" style="border-bottom:1px solid var(--chart-border);background:var(--chart-border)">
      <div class="px-2 py-1.5 text-center" style="background:var(--chart-bg)">
        <div class="text-[9px]" style="color:var(--text-muted)">—</div>
        <div class="font-bold" style="color:var(--text-primary)">{{ market.val1.toFixed(2) }}</div>
      </div>
      <div class="px-2 py-1.5 text-center" style="background:var(--chart-bg)">
        <div class="text-[9px]" style="color:var(--text-muted)">—</div>
        <div class="font-bold" style="color:var(--text-primary)">{{ market.val2.toFixed(2) }}</div>
      </div>
    </div>

    <!-- Spread + threshold -->
    <div class="grid grid-cols-2 gap-px" style="border-bottom:1px solid var(--chart-border);background:var(--chart-border)">
      <div class="px-2 py-1.5 text-center" style="background:var(--chart-bg)">
        <div class="text-[9px]" style="color:var(--text-muted)">SPREAD</div>
        <div class="font-bold" style="color:var(--bullish)">{{ market.spread }}</div>
      </div>
      <div class="px-2 py-1.5 text-center" style="background:var(--chart-bg)">
        <div class="text-[9px]" style="color:var(--text-muted)">THRESHOLD</div>
        <div class="font-bold" style="color:var(--text-primary)">{{ market.threshold }}</div>
      </div>
    </div>

    <!-- Signals count -->
    <div class="flex items-center justify-between px-2 py-1.5"
         style="border-bottom:1px solid var(--chart-border)">
      <span style="color:var(--text-muted)">Signals</span>
      <span class="px-2 py-0.5 rounded font-bold text-[9px]"
            style="color:var(--bullish);background:var(--bullish-bg)">
        {{ market.signals }}
      </span>
    </div>

  </div>
</template>
