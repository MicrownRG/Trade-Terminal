<!-- components/widgets/AnalystSignal.vue -->
<script setup lang="ts">
type Tab = 'signal' | 'journal' | 'analytics' | 'lessons'
const activeTab = ref<Tab>('signal')

const tabs: { id: Tab; label: string }[] = [
  { id: 'signal',    label: 'Signal' },
  { id: 'journal',   label: 'Journal' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'lessons',   label: 'Lessons' },
]

const signal = {
  direction:  'BUY' as 'BUY' | 'SELL',
  score:      72,
  maxScore:   100,
  tags:       ['#Structure+100', '#Pattern+81'],
  entry:      74786.86,
  entryType:  'LIMIT',
  sl:         73305.89,
  tp:         76888.32,
  rr:         '1:1.5',
  pips:       1481,
  lot:        0.87,
  analysis:   '**[WAIT]** H1 trend naik, tapi M1 momentum bearish dan harga belum rebound dari pivot support. ATR rendah (0.3%) menunjukkan kurangnya kekuatan untuk break. Tanpa konfirmasi rebound atau pola reversal yang jelas, entry buy terlalu spekulatif. Tunggu konfirmasi di M1 atau H1 dulu.',
}

const journal = [
  { date: '2024-01-15', symbol: 'BTC/USD', dir: 'BUY',  result: 'WIN',  pnl: '+2.4%', note: 'Clean breakout confirmation on H4.' },
  { date: '2024-01-12', symbol: 'ETH/USD', dir: 'SELL', result: 'LOSS', pnl: '-1.1%', note: 'Stopped out on news spike.' },
  { date: '2024-01-10', symbol: 'BTC/USD', dir: 'BUY',  result: 'WIN',  pnl: '+3.7%', note: 'Strong momentum from demand zone.' },
]

const analytics = {
  totalTrades: 47,
  winRate:     68.1,
  avgRR:       1.8,
  profitFactor: 2.3,
  maxDrawdown: 4.2,
  expectancy:  1.24,
  bestTrade:   '+8.3%',
  worstTrade:  '-2.1%',
}

const lessons = [
  { title: 'Wait for M1 confirmation before entry', priority: 'high' },
  { title: 'Avoid entries when ATR < 0.5%', priority: 'high' },
  { title: 'Check session overlap for volume confirmation', priority: 'medium' },
  { title: 'Review SR levels before each trade', priority: 'medium' },
  { title: 'Log reason for every trade taken', priority: 'low' },
]

function dirStyle(d: string) {
  return d === 'BUY'
    ? 'color:var(--bullish);background:var(--bullish-bg)'
    : 'color:var(--bearish);background:var(--bearish-bg)'
}

function resultStyle(r: string) {
  if (r === 'WIN')  return 'color:var(--bullish)'
  if (r === 'LOSS') return 'color:var(--bearish)'
  return 'color:var(--text-muted)'
}

function priorityDot(p: string) {
  if (p === 'high')   return 'background:var(--bearish)'
  if (p === 'medium') return 'background:#f59e0b'
  return 'background:var(--text-muted)'
}

function scoreColor(s: number) {
  if (s >= 75) return 'var(--bullish)'
  if (s >= 50) return '#f59e0b'
  return 'var(--bearish)'
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden font-mono"
       style="background:var(--chart-bg)">

    <!-- Tabs -->
    <div class="shrink-0 flex border-b" style="border-color:var(--chart-border);background:var(--chart-surface)">
      <button
        v-for="t in tabs" :key="t.id"
        class="px-3 py-1.5 text-[11px] font-bold transition-colors"
        :style="activeTab === t.id
          ? 'color:var(--ind-sma);border-bottom:2px solid var(--ind-sma);margin-bottom:-1px'
          : 'color:var(--text-muted);border-bottom:2px solid transparent;margin-bottom:-1px'"
        @click="activeTab = t.id"
      >{{ t.label }}</button>
    </div>

    <!-- ── SIGNAL TAB ─────────────────────────────────── -->
    <div v-if="activeTab === 'signal'" class="flex-1 overflow-y-auto p-2 space-y-2">

      <!-- Signal card -->
      <div class="rounded-lg p-3 space-y-2"
           style="border:1px solid var(--chart-border);background:var(--chart-surface)">

        <!-- Top row: direction + score + tags -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-[10px] px-2 py-0.5 rounded font-bold" :style="dirStyle(signal.direction)">
            {{ signal.direction }}
          </span>
          <span class="text-[10px] font-bold" style="color:var(--text-muted)">
            Score
            <span :style="{ color: scoreColor(signal.score) }">{{ signal.score }}</span>
            /{{ signal.maxScore }}
          </span>
          <span v-for="tag in signal.tags" :key="tag"
                class="text-[8px] px-1 py-0.5 rounded"
                style="color:var(--text-muted);background:var(--bg-tertiary)">
            {{ tag }}
          </span>
        </div>

        <!-- Entry / SL / TP row -->
        <div class="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
          <span style="color:var(--text-muted)">
            Entry
            <span class="font-bold" style="color:var(--text-primary)">{{ signal.entry.toFixed(2) }}</span>
            <span class="text-[8px] ml-0.5 px-1 rounded"
                  style="color:var(--ind-sma);background:rgba(88,166,255,0.1)">{{ signal.entryType }}</span>
          </span>
          <span style="color:var(--text-muted)">
            SL <span class="font-bold" style="color:var(--bearish)">{{ signal.sl.toFixed(2) }}</span>
          </span>
          <span style="color:var(--text-muted)">
            TP <span class="font-bold" style="color:var(--bullish)">{{ signal.tp.toFixed(2) }}</span>
          </span>
          <span style="color:var(--text-muted)">
            rr <span class="font-bold" style="color:var(--text-primary)">{{ signal.rr }}</span>
          </span>
          <span style="color:var(--text-muted)">
            Pips <span class="font-bold" style="color:var(--text-primary)">{{ signal.pips }}</span>
          </span>
          <span style="color:var(--text-muted)">
            Lot <span class="font-bold" style="color:var(--text-primary)">{{ signal.lot }}</span>
          </span>
        </div>

        <!-- Analysis text -->
        <p class="text-[10px] leading-relaxed" style="color:var(--text-secondary)">
          {{ signal.analysis }}
        </p>
      </div>
    </div>

    <!-- ── JOURNAL TAB ────────────────────────────────── -->
    <div v-else-if="activeTab === 'journal'" class="flex-1 overflow-y-auto">
      <div
        v-for="(entry, i) in journal" :key="i"
        class="px-3 py-2 text-[10px]"
        style="border-bottom:1px solid var(--chart-border)"
      >
        <div class="flex items-center gap-2 mb-0.5">
          <span class="font-bold" style="color:var(--text-primary)">{{ entry.symbol }}</span>
          <span class="px-1 rounded text-[8px] font-bold" :style="dirStyle(entry.dir)">{{ entry.dir }}</span>
          <span class="font-bold" :style="resultStyle(entry.result)">{{ entry.result }}</span>
          <span class="ml-auto font-bold"
                :style="entry.pnl.startsWith('+') ? 'color:var(--bullish)' : 'color:var(--bearish)'">
            {{ entry.pnl }}
          </span>
        </div>
        <div class="flex justify-between">
          <span style="color:var(--text-muted)">{{ entry.note }}</span>
          <span style="color:var(--text-muted)">{{ entry.date }}</span>
        </div>
      </div>
    </div>

    <!-- ── ANALYTICS TAB ──────────────────────────────── -->
    <div v-else-if="activeTab === 'analytics'" class="flex-1 overflow-y-auto p-2">
      <div class="grid grid-cols-2 gap-1.5">
        <div v-for="(val, key) in {
          'Total Trades':   analytics.totalTrades,
          'Win Rate':       analytics.winRate + '%',
          'Avg R:R':        analytics.avgRR,
          'Profit Factor':  analytics.profitFactor,
          'Max Drawdown':   analytics.maxDrawdown + '%',
          'Expectancy':     analytics.expectancy,
          'Best Trade':     analytics.bestTrade,
          'Worst Trade':    analytics.worstTrade,
        }" :key="key"
          class="rounded p-2 text-center"
          style="background:var(--chart-surface);border:1px solid var(--chart-border)"
        >
          <div class="text-[8px] mb-0.5" style="color:var(--text-muted)">{{ key }}</div>
          <div class="text-[11px] font-bold"
               :style="String(val).startsWith('+') ? 'color:var(--bullish)' :
                       String(val).startsWith('-') ? 'color:var(--bearish)' :
                       'color:var(--text-primary)'">
            {{ val }}
          </div>
        </div>
      </div>
    </div>

    <!-- ── LESSONS TAB ────────────────────────────────── -->
    <div v-else-if="activeTab === 'lessons'" class="flex-1 overflow-y-auto">
      <div
        v-for="(l, i) in lessons" :key="i"
        class="flex items-start gap-2 px-3 py-2 text-[10px]"
        style="border-bottom:1px solid var(--chart-border)"
      >
        <span class="w-1.5 h-1.5 rounded-full shrink-0 mt-1" :style="priorityDot(l.priority)" />
        <span style="color:var(--text-secondary)">{{ l.title }}</span>
      </div>
    </div>

  </div>
</template>
