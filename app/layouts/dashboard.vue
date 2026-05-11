<!-- layouts/dashboard.vue -->
<script setup lang="ts">
import { GridLayout, GridItem } from 'grid-layout-plus'
import { defineAsyncComponent } from 'vue'

import { scaleLayout, LAYOUT_BASE_COLS } from '~/composables/useBreakpoint'

const layoutStore = useLayoutStore()
const { gridCols, gridMargin, gridMinW, gridMinH, isMobile } = useBreakpoint()

// Activate global keyboard shortcuts for this layout
useKeyboard()

// The store always uses 24 columns as the reference coordinate system.
// On tablet we scale proportionally to keep widgets side-by-side.
const layout = computed(() =>
  scaleLayout(layoutStore.currentLayout, gridCols.value, gridMinW.value),
)

const widgetMap: Record<string, any> = {
  ProChart:       defineAsyncComponent(() => import('~/components/widgets/ProChart.vue')),
  RsiPanel:       defineAsyncComponent(() => import('~/components/widgets/RsiPanel.vue')),
  MacdPanel:      defineAsyncComponent(() => import('~/components/widgets/MacdPanel.vue')),
  Orderbook:      defineAsyncComponent(() => import('~/components/widgets/Orderbook.vue')),
  News:           defineAsyncComponent(() => import('~/components/widgets/News.vue')),
  Sentiment:      defineAsyncComponent(() => import('~/components/widgets/Sentiment.vue')),
  Watchlist:      defineAsyncComponent(() => import('~/components/widgets/Watchlist.vue')),
  OnChainMetrics: defineAsyncComponent(() => import('~/components/widgets/OnChainMetrics.vue')),
  TokenLaunch:    defineAsyncComponent(() => import('~/components/widgets/TokenLaunch.vue')),
  WhaleAlerts:    defineAsyncComponent(() => import('~/components/widgets/WhaleAlerts.vue')),
  MarketStats:    defineAsyncComponent(() => import('~/components/widgets/MarketStats.vue')),
  Heatmap:        defineAsyncComponent(() => import('~/components/widgets/Heatmap.vue')),
  Notes:          defineAsyncComponent(() => import('~/components/widgets/Notes.vue')),
  TradePlan:      defineAsyncComponent(() => import('~/components/widgets/TradePlan.vue')),
  SRLevels:       defineAsyncComponent(() => import('~/components/widgets/SRLevels.vue')),
  SignalDetail:   defineAsyncComponent(() => import('~/components/widgets/SignalDetail.vue')),
  MarketContext:  defineAsyncComponent(() => import('~/components/widgets/MarketContext.vue')),
  LivePrices:     defineAsyncComponent(() => import('~/components/widgets/LivePrices.vue')),
  AnalystSignal:  defineAsyncComponent(() => import('~/components/widgets/AnalystSignal.vue')),
  VolumeProfile:     defineAsyncComponent(() => import('~/components/widgets/VolumeProfile.vue')),
  EconomicCalendar:  defineAsyncComponent(() => import('~/components/widgets/EconomicCalendar.vue')),
  PortfolioTracker:  defineAsyncComponent(() => import('~/components/widgets/PortfolioTracker.vue')),
  StochPanel:        defineAsyncComponent(() => import('~/components/widgets/StochPanel.vue')),
  PriceAlert:        defineAsyncComponent(() => import('~/components/widgets/PriceAlert.vue')),
  FundingRate:       defineAsyncComponent(() => import('~/components/widgets/FundingRate.vue')),
  OpenInterest:      defineAsyncComponent(() => import('~/components/widgets/OpenInterest.vue')),
  TechnicalSummary:  defineAsyncComponent(() => import('~/components/widgets/TechnicalSummary.vue')),
}

// Short display labels for widget types (used in mobile tab bar)
const WIDGET_LABELS: Record<string, string> = {
  ProChart:        'Chart',
  RsiPanel:        'RSI',
  MacdPanel:       'MACD',
  StochPanel:      'Stoch',
  Orderbook:       'Book',
  News:            'News',
  Sentiment:       'Mood',
  Watchlist:       'Watch',
  Notes:           'Notes',
  PriceAlert:      'Alerts',
  Heatmap:         'Heat',
  MarketStats:     'Stats',
  FundingRate:     'Funding',
  OpenInterest:    'OI',
  TechnicalSummary:'Signal',
  VolumeProfile:   'Volume',
  WhaleAlerts:     'Whales',
  LivePrices:      'Prices',
  TradePlan:       'Plan',
  SRLevels:        'SR',
  AnalystSignal:   'Analyst',
  OnChainMetrics:  'OnChain',
  TokenLaunch:     'Launch',
  MarketContext:   'Context',
  EconomicCalendar:'Calendar',
  PortfolioTracker:'Portfolio',
  SignalDetail:    'Signal+',
}

// ── Mobile tab state ──────────────────────────────────────
// Deduplicate widget types preserving layout order
const mobileTabs = computed(() => {
  const seen = new Set<string>()
  return layoutStore.currentLayout
    .filter(item => { if (seen.has(item.type)) return false; seen.add(item.type); return true })
    .map(item => ({ type: item.type, id: item.i, label: WIDGET_LABELS[item.type] ?? item.type }))
})

const mobileActiveType = ref(layoutStore.currentLayout[0]?.type ?? 'ProChart')

// Keep mobileActiveType valid when layout changes
watch(mobileTabs, (tabs) => {
  if (!tabs.find(t => t.type === mobileActiveType.value))
    mobileActiveType.value = tabs[0]?.type ?? 'ProChart'
})

const mobileActiveItem = computed(() =>
  layoutStore.currentLayout.find(item => item.type === mobileActiveType.value) ??
  layoutStore.currentLayout[0],
)

// ── Grid functions (desktop/tablet) ───────────────────────

// When gridCols or isMobile changes, grid-layout-plus fires layout-updated
// with the scaled positions (often async — after nextTick). We must NOT save those
// or they corrupt the 24-col store. Hold the skip flag for 300 ms to cover
// any async re-emission from GridLayout after a prop change or remount.
const skipSave = ref(false)
let skipTimer: ReturnType<typeof setTimeout> | null = null

function beginSkip() {
  if (skipTimer) { clearTimeout(skipTimer); skipTimer = null }
  skipSave.value = true
  skipTimer = setTimeout(() => { skipSave.value = false; skipTimer = null }, 300)
}

watch(gridCols, beginSkip)
watch(isMobile, beginSkip)   // GridLayout remounts on every mobile↔desktop flip

onUnmounted(() => { if (skipTimer) clearTimeout(skipTimer) })

function onLayoutUpdated(newLayout: any[]) {
  if (skipSave.value) return   // breakpoint-triggered update — ignore
  const cols = gridCols.value
  if (cols === LAYOUT_BASE_COLS) {
    layoutStore.updateLayout(newLayout)
    return
  }
  // Unscale back to 24-column reference so the store stays in canonical coordinates
  const factor = LAYOUT_BASE_COLS / cols
  const rescaled = newLayout.map((item: any) => ({
    ...item,
    x: Math.round(item.x * factor),
    w: Math.max(1, Math.round(item.w * factor)),
  }))
  layoutStore.updateLayout(rescaled)
}

// ── Page tab rename ────────────────────────────────────────
const renamingId  = ref<string | null>(null)
const renameValue = ref('')

function startRename(page: { id: string; name: string }) {
  renamingId.value  = page.id
  renameValue.value = page.name
  nextTick(() => {
    const el = document.querySelector<HTMLInputElement>('.tab-rename-input')
    el?.focus()
    el?.select()
  })
}

function commitRename() {
  if (renamingId.value && renameValue.value.trim())
    layoutStore.renamePage(renamingId.value, renameValue.value.trim())
  renamingId.value = null
}
</script>

<template>
  <div class="flex flex-col h-screen w-screen overflow-hidden">

    <!-- Top Navigation Bar -->
    <DashboardTopbar />

    <!-- Page Tabs (hidden on mobile — bottom tabs replace them) -->
    <div
      v-if="!isMobile"
      class="flex items-center gap-0 px-2 shrink-0 overflow-x-auto scrollbar-none"
      style="background:var(--chart-surface);border-bottom:1px solid var(--chart-border);min-height:32px"
    >
      <button
        v-for="page in layoutStore.pages"
        :key="page.id"
        class="flex items-center gap-1 px-3 h-8 text-xs font-mono shrink-0
               border-r transition-colors relative group"
        :style="layoutStore.activePageId === page.id
          ? 'background:var(--chart-bg);color:var(--text-primary);border-bottom:2px solid var(--ind-sma);border-right-color:var(--chart-border)'
          : 'background:transparent;color:var(--text-muted);border-right-color:var(--chart-border)'"
        @click="layoutStore.setActivePage(page.id)"
        @dblclick="startRename(page)"
      >
        <template v-if="renamingId === page.id">
          <input
            v-model="renameValue"
            class="tab-rename-input w-20 bg-transparent outline-none text-xs font-mono"
            style="color:var(--text-primary)"
            @blur="commitRename"
            @keyup.enter="commitRename"
            @keyup.escape="renamingId = null"
            @click.stop
          />
        </template>
        <template v-else>
          {{ page.name }}
          <span
            v-if="layoutStore.pages.length > 1"
            class="opacity-0 group-hover:opacity-100 ml-1 text-[10px] hover:text-red-400 transition-opacity"
            @click.stop="layoutStore.removePage(page.id)"
          >✕</span>
        </template>
      </button>

      <!-- Add page -->
      <button
        class="px-2 h-8 text-xs font-mono transition-colors shrink-0"
        style="color:var(--text-muted)"
        title="Add page"
        @click="layoutStore.addPage()"
      >+</button>
    </div>

    <!-- ── MOBILE VIEW: single widget + bottom tab bar ── -->
    <template v-if="isMobile">
      <!-- Full-screen widget area -->
      <div class="flex-1 overflow-hidden">
        <ClientOnly>
          <component
            v-if="mobileActiveItem && widgetMap[mobileActiveItem.type]"
            :is="widgetMap[mobileActiveItem.type]"
            v-bind="mobileActiveItem.props"
            class="w-full h-full"
          />
        </ClientOnly>
      </div>

      <!-- Bottom tab bar -->
      <div class="shrink-0 flex overflow-x-auto scrollbar-none"
           style="background:var(--chart-surface);border-top:1px solid var(--chart-border);min-height:48px">
        <button
          v-for="tab in mobileTabs"
          :key="tab.type"
          class="flex flex-col items-center justify-center gap-0.5 px-3 shrink-0 min-w-[52px]
                 text-[9px] font-mono font-bold transition-colors"
          :style="mobileActiveType === tab.type
            ? 'color:var(--ind-sma);border-top:2px solid var(--ind-sma)'
            : 'color:var(--text-muted);border-top:2px solid transparent'"
          @click="mobileActiveType = tab.type"
        >
          <span class="text-[11px] leading-none">{{ tab.label }}</span>
        </button>
      </div>
    </template>

    <!-- ── DESKTOP/TABLET VIEW: drag-and-drop grid ── -->
    <template v-else>
      <div class="flex-1 overflow-auto dot-grid-bg">
        <ClientOnly>
          <GridLayout
            :layout="layout"
            :col-num="gridCols"
            :row-height="30"
            :is-draggable="!layoutStore.isLocked"
            :is-resizable="!layoutStore.isLocked"
            :margin="gridMargin"
            :use-css-transforms="true"
            :compact-type="null"
            drag-allow-from=".widget-drag-handle"
            @layout-updated="onLayoutUpdated"
            class="min-h-full"
            style="--vgl-placeholder-bg: transparent; --vgl-placeholder-opacity: 1;"
          >
            <GridItem
              v-for="item in layout"
              :key="item.i"
              :x="item.x"
              :y="item.y"
              :w="item.w"
              :h="item.h"
              :i="item.i"
              :min-w="gridMinW"
              :min-h="gridMinH"
              :resize-option="{ edges: { top: true, left: true, bottom: true, right: true } }"
              class="!overflow-hidden"
            >
              <DashboardWidgetWrapper
                :title="item.type"
                :widget-id="item.i"
                :locked="layoutStore.isLocked"
                @close="layoutStore.removeWidget($event)"
                @clone="layoutStore.cloneWidget($event)"
              >
                <component
                  v-if="widgetMap[item.type]"
                  :is="widgetMap[item.type]"
                  v-bind="item.props"
                  class="w-full h-full"
                />
                <div v-else class="flex items-center justify-center h-full text-chart-muted text-xs font-mono">
                  {{ item.type }} (not available)
                </div>
              </DashboardWidgetWrapper>
            </GridItem>
          </GridLayout>

          <template #fallback>
            <div class="flex items-center justify-center h-full">
              <div class="flex flex-col items-center gap-3">
                <div class="w-10 h-10 border-2 rounded-full animate-spin"
                     style="border-color:#58a6ff;border-top-color:transparent"/>
                <span class="text-chart-muted text-sm font-mono">Loading dashboard…</span>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </template>

  </div>
</template>
