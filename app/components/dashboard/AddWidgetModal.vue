<!-- components/dashboard/AddWidgetModal.vue -->
<script setup lang="ts">
import type { WidgetType } from '~/types'
import { widgetDefaultProps } from '~/composables/useWidgetProps'

const emit        = defineEmits<{ (e: 'close'): void }>()
const layoutStore = useLayoutStore()

const ic = (p: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`

const widgets: { type: WidgetType; icon: string; label: string; desc: string }[] = [
  { type: 'ProChart',        icon: ic('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>'), label: 'Price Chart',      desc: 'Candlestick/OHLC chart with drawing tools & indicators' },
  { type: 'RsiPanel',        icon: ic('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'), label: 'RSI Panel',         desc: 'Relative Strength Index — powered by PineTS' },
  { type: 'MacdPanel',       icon: ic('<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>'), label: 'MACD Panel',        desc: 'MACD + Signal + Histogram — powered by PineTS' },
  { type: 'Orderbook',       icon: ic('<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>'), label: 'Orderbook',         desc: 'Live bid/ask depth from Binance' },
  { type: 'News',            icon: ic('<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/>'), label: 'News Feed',         desc: 'Latest market news with sentiment labels' },
  { type: 'Sentiment',       icon: ic('<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>'), label: 'Sentiment',         desc: 'Fear & Greed index + Bull/Bear ratio' },
  { type: 'Watchlist',       icon: ic('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'), label: 'Watchlist',         desc: 'Live price ticker list — click to switch symbol' },
  { type: 'OnChainMetrics',  icon: ic('<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>'), label: 'On-Chain Metrics', desc: 'Active addresses, transactions, gas price analytics' },
  { type: 'TokenLaunch',     icon: ic('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'), label: 'Token Launches',    desc: 'New token listings and initial offerings tracker' },
  { type: 'WhaleAlerts',     icon: ic('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'), label: 'Whale Alerts',      desc: 'Large transaction alerts and whale activity tracking' },
  { type: 'MarketStats',     icon: ic('<rect width="4" height="6" x="2" y="14" rx="1"/><rect width="4" height="12" x="10" y="8" rx="1"/><rect width="4" height="16" x="18" y="4" rx="1"/>'), label: 'Market Stats',      desc: 'Key market metrics: dominance, volume, fear & greed' },
  { type: 'Heatmap',         icon: ic('<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>'), label: 'Heatmap',           desc: 'Visual market heatmap by sector and performance' },
  { type: 'Notes',           icon: ic('<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>'), label: 'Notes',             desc: 'Personal trading notes and scratch pad' },
  { type: 'TradePlan',       icon: ic('<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>'), label: 'Trade Plans',       desc: 'Auto-fetched trade signals with entry, SL, TP1/2/3, R:R and chart upload' },
  { type: 'SRLevels',        icon: ic('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'), label: 'SR Levels',         desc: 'Support & resistance levels with pivot, swing highs/lows and thresholds' },
  { type: 'SignalDetail',    icon: ic('<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>'), label: 'Signal Detail',     desc: 'Active signal: direction, entry, SL, TP, R:R, lot size and market context' },
  { type: 'MarketContext',   icon: ic('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'), label: 'Market Context',    desc: 'My micro trend, session, spread, season and healer watch panel' },
  { type: 'LivePrices',      icon: ic('<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'), label: 'Live Prices',       desc: 'Multi-asset live price ticker with % change and active symbol highlight' },
  { type: 'AnalystSignal',   icon: ic('<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>'), label: 'Analyst Signal',    desc: 'Signal / Journal / Analytics / Lessons tabbed trading analysis panel' },
  { type: 'VolumeProfile',   icon: ic('<line x1="18" x2="3" y1="6" y2="6"/><line x1="13" x2="3" y1="12" y2="12"/><line x1="16" x2="3" y1="18" y2="18"/>'), label: 'Volume Profile',    desc: 'Horizontal volume profile for the visible price range' },
  { type: 'EconomicCalendar',icon: ic('<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>'), label: 'Eco Calendar',      desc: 'Upcoming high impact economic events and data releases' },
  { type: 'PortfolioTracker',icon: ic('<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'), label: 'Portfolio Tracker',  desc: 'Track your manual spot and futures positions PnL' },
  { type: 'StochPanel',      icon: ic('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'), label: 'Stochastic',        desc: 'Stochastic %K/%D oscillator — overbought/oversold levels' },
  { type: 'PriceAlert',      icon: ic('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'), label: 'Price Alerts',      desc: 'Set price alerts for any symbol with above/below conditions' },
  { type: 'FundingRate',     icon: ic('<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'), label: 'Funding Rate',      desc: 'Perpetual futures funding rates — positive/negative signal' },
  { type: 'OpenInterest',    icon: ic('<rect width="4" height="6" x="2" y="14" rx="1"/><rect width="4" height="12" x="10" y="8" rx="1"/><rect width="4" height="16" x="18" y="4" rx="1"/>'), label: 'Open Interest',     desc: 'Open interest + long/short ratio for top perpetual contracts' },
  { type: 'TechnicalSummary',icon: ic('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'), label: 'Tech Summary',      desc: 'Multi-timeframe buy/sell signal summary across all indicators' },
]

function addWidget(type: WidgetType) {
  layoutStore.addWidget(type, widgetDefaultProps(type))
  emit('close')
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm
           flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div class="bg-chart-surface border border-chart-border rounded-xl
                w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">

      <!-- Modal Header -->
      <div class="flex items-center justify-between px-5 py-4
                  border-b border-chart-border">
        <span class="text-chart-text font-bold text-sm font-mono">
          + Add Widget
        </span>
        <button
          @click="emit('close')"
          class="text-chart-muted hover:text-chart-text transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <!-- Widget Grid -->
      <div class="grid grid-cols-2 gap-2 p-4 overflow-y-auto flex-1">
        <button
          v-for="w in widgets"
          :key="w.type"
          @click="addWidget(w.type)"
          class="flex items-start gap-3 p-3 rounded-lg border border-chart-border
                 hover:border-ind-sma/50 hover:bg-chart-hover
                 transition-all text-left group"
        >
          <div class="shrink-0 mt-0.5" style="color:var(--ind-sma)" v-html="w.icon"></div>
          <div>
            <p class="text-chart-text text-xs font-bold font-mono
                      group-hover:text-ind-sma transition-colors">
              {{ w.label }}
            </p>
            <p class="text-chart-muted text-[10px] mt-0.5 leading-snug">
              {{ w.desc }}
            </p>
          </div>
        </button>
      </div>

    </div>
  </div>
</template>