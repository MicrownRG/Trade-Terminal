<!-- components/widgets/TradePlan.vue -->
<script setup lang="ts">
import type { TradePlan } from '~/types'

const plans     = ref<TradePlan[]>([])
const isLoading = ref(false)
const selected  = ref<TradePlan | null>(null)

const entryImgRef  = ref<HTMLInputElement | null>(null)
const resultImgRef = ref<HTMLInputElement | null>(null)

// Per-plan overrides for user-uploaded images/notes
const overrides = ref<Record<string, Partial<TradePlan>>>({})

function loadOverrides() {
  if (!import.meta.client) return
  try { overrides.value = JSON.parse(localStorage.getItem('tt-plan-overrides') ?? '{}') } catch {}
}

function saveOverrides() {
  if (import.meta.client)
    localStorage.setItem('tt-plan-overrides', JSON.stringify(overrides.value))
}

function applyOverride(id: string, patch: Partial<TradePlan>) {
  overrides.value[id] = { ...(overrides.value[id] ?? {}), ...patch }
  saveOverrides()
  if (selected.value?.id === id) selected.value = { ...selected.value, ...patch }
}

function merged(plan: TradePlan): TradePlan {
  return { ...plan, ...(overrides.value[plan.id] ?? {}) }
}

// Fetch
async function load() {
  isLoading.value = true
  try { plans.value = await $fetch<TradePlan[]>('/api/tradeplans') }
  catch { plans.value = [] }
  finally { isLoading.value = false }
}

onMounted(() => { loadOverrides(); load() })

// Close popup on Escape
onMounted(() => {
  const h = (e: KeyboardEvent) => { if (e.key === 'Escape') selected.value = null }
  window.addEventListener('keydown', h)
  onUnmounted(() => window.removeEventListener('keydown', h))
})

// Helpers
function p(v: number | undefined) {
  if (!v || v === 0) return '—'
  return v < 1 ? v.toFixed(4) : v.toFixed(2)
}

function pct(v: number | undefined) {
  if (v === undefined) return null
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
}

function rr(plan: TradePlan) {
  const risk = Math.abs(plan.entry - plan.sl)
  if (!risk) return null
  const reward = plan.direction === 'long' ? plan.tp1 - plan.entry : plan.entry - plan.tp1
  return (reward / risk).toFixed(1)
}

function ago(ts: number) {
  const d = Date.now() - ts
  if (d < 3_600_000) return Math.floor(d / 60_000) + 'm ago'
  if (d < 86_400_000) return Math.floor(d / 3_600_000) + 'h ago'
  return new Date(ts).toLocaleDateString()
}

const STATUS: Record<string, string> = { planning: 'PLAN', active: 'LIVE', win: 'WIN', loss: 'LOSS', breakeven: 'B/E' }

function sStyle(s: string) {
  if (s === 'active')    return 'color:#58a6ff;background:rgba(88,166,255,0.15)'
  if (s === 'win')       return 'color:var(--bullish);background:var(--bullish-bg)'
  if (s === 'loss')      return 'color:var(--bearish);background:var(--bearish-bg)'
  return 'color:var(--text-muted);background:var(--bg-tertiary)'
}

function dirStyle(d: string) {
  return d === 'long'
    ? 'color:var(--bullish);background:var(--bullish-bg)'
    : 'color:var(--bearish);background:var(--bearish-bg)'
}

function confDot(c: string) {
  return c === 'high' ? 'background:var(--bullish)' : c === 'medium' ? 'background:#f59e0b' : 'background:var(--text-muted)'
}

// Image upload
function toBase64(file: File): Promise<string> {
  return new Promise(res => {
    const r = new FileReader()
    r.onload = e => res(e.target?.result as string ?? '')
    r.readAsDataURL(file)
  })
}

async function onEntryImg(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f && selected.value) applyOverride(selected.value.id, { entryImage: await toBase64(f) })
}
async function onResultImg(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f && selected.value) applyOverride(selected.value.id, { resultImage: await toBase64(f) })
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden font-mono" style="background:var(--chart-bg)">

    <!-- Header -->
    <div class="px-3 py-1.5 shrink-0 flex items-center gap-2 text-xs"
         style="background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      <span class="font-bold" style="color:var(--text-primary)">📋 Trade Plans</span>
      <span class="text-[10px]" style="color:var(--text-muted)">· signals</span>
      <button class="tt-btn ml-auto" :disabled="isLoading" @click="load">
        <span :class="isLoading ? 'animate-spin inline-block' : ''">↻</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="w-6 h-6 rounded-full border-2 animate-spin"
           style="border-color:var(--ind-sma);border-top-color:transparent"/>
    </div>

    <!-- List -->
    <div v-else class="flex-1 overflow-y-auto">
      <div v-if="!plans.length"
           class="flex items-center justify-center h-full text-xs"
           style="color:var(--text-muted)">No signals.</div>

      <div
        v-for="plan in plans"
        :key="plan.id"
        class="mx-2 my-1.5 p-3 rounded-lg cursor-pointer transition-colors"
        style="border:1px solid var(--chart-border);background:var(--chart-surface)"
        @mouseenter="($el as HTMLElement).style.background='var(--chart-hover)'"
        @mouseleave="($el as HTMLElement).style.background='var(--chart-surface)'"
        @click="selected = merged(plan)"
      >
        <!-- Row 1 -->
        <div class="flex items-center gap-1.5">
          <span class="text-[9px] px-1.5 py-0.5 rounded font-bold" :style="dirStyle(plan.direction)">
            {{ plan.direction === 'long' ? 'LONG ▲' : 'SHORT ▼' }}
          </span>
          <span class="text-xs font-bold" style="color:var(--text-primary)">{{ plan.symbol }}</span>
          <span class="text-[9px] px-1 rounded"
                style="color:var(--text-muted);background:var(--bg-tertiary)">
            {{ (plan as any).timeframe ?? '—' }}
          </span>
          <span class="w-1.5 h-1.5 rounded-full inline-block"
                :style="confDot((plan as any).confidence ?? 'low')" />
          <span class="ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold"
                :style="sStyle(plan.status)">{{ STATUS[plan.status] }}</span>
        </div>

        <!-- Row 2: prices -->
        <div class="flex gap-3 mt-1.5 text-[10px] flex-wrap" style="color:var(--text-muted)">
          <span>E: <span style="color:var(--text-primary)">{{ p(plan.entry) }}</span></span>
          <span>SL: <span style="color:var(--bearish)">{{ p(plan.sl) }}</span></span>
          <span>TP1: <span style="color:var(--bullish)">{{ p(plan.tp1) }}</span></span>
        </div>

        <!-- Row 3: R:R + P&L + time -->
        <div class="flex items-center mt-1 gap-2 text-[9px]" style="color:var(--text-muted)">
          <span v-if="rr(plan)">R:R 1:{{ rr(plan) }}</span>
          <span v-if="plan.pnlPct !== undefined" class="font-bold"
                :style="plan.pnlPct >= 0 ? 'color:var(--bullish)' : 'color:var(--bearish)'">
            {{ pct(plan.pnlPct) }}
          </span>
          <span class="ml-auto">{{ ago(plan.createdAt) }}</span>
        </div>

        <!-- Tags -->
        <div v-if="(plan as any).tags?.length" class="flex gap-1 mt-1.5 flex-wrap">
          <span v-for="tag in (plan as any).tags" :key="tag"
                class="text-[8px] px-1 py-0.5 rounded"
                style="color:var(--text-muted);background:var(--bg-tertiary)">{{ tag }}</span>
        </div>
      </div>
    </div>

  </div>

  <!-- ── Detail popup ── -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="selected"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.8);backdrop-filter:blur(4px)"
        @click.self="selected = null"
      >
        <div
          class="relative w-full max-w-lg rounded-xl flex flex-col shadow-2xl"
          style="background:var(--chart-surface);border:1px solid var(--chart-border);max-height:90vh"
        >
          <!-- Close btn -->
          <button
            class="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm"
            style="background:var(--bg-tertiary);color:var(--text-muted)"
            @click="selected = null"
          >✕</button>

          <!-- Popup header -->
          <div class="px-5 pt-5 pb-3 shrink-0"
               style="border-bottom:1px solid var(--chart-border)">
            <div class="flex items-center gap-2 flex-wrap pr-8">
              <span class="text-[9px] px-1.5 py-0.5 rounded font-bold font-mono"
                    :style="dirStyle(selected.direction)">
                {{ selected.direction === 'long' ? 'LONG ▲' : 'SHORT ▼' }}
              </span>
              <span class="text-base font-bold font-mono" style="color:var(--text-primary)">
                {{ selected.symbol }}
              </span>
              <span class="text-[9px] px-1 rounded font-mono"
                    style="color:var(--text-muted);background:var(--bg-tertiary)">
                {{ (selected as any).timeframe ?? '—' }}
              </span>
              <span class="text-[9px] px-1.5 py-0.5 rounded font-bold font-mono"
                    :style="sStyle(selected.status)">{{ STATUS[selected.status] }}</span>
              <span class="ml-auto text-[10px] font-mono" style="color:var(--text-muted)">
                {{ ago(selected.createdAt) }}
              </span>
            </div>
          </div>

          <!-- Scrollable body -->
          <div class="overflow-y-auto flex-1 px-5 py-4 space-y-4 font-mono">

            <!-- Price grid -->
            <div class="grid grid-cols-3 gap-2">
              <div v-for="cell in [
                { label: 'Entry',  val: p(selected.entry), color: 'var(--text-primary)' },
                { label: 'SL',     val: p(selected.sl),    color: 'var(--bearish)' },
                { label: 'TP1',    val: p(selected.tp1),   color: 'var(--bullish)' },
                ...(selected.tp2 > 0 ? [{ label: 'TP2', val: p(selected.tp2), color: 'var(--bullish)' }] : []),
                ...(selected.tp3 > 0 ? [{ label: 'TP3', val: p(selected.tp3), color: 'var(--bullish)' }] : []),
                ...(selected.pnlPct !== undefined ? [{ label: 'P&L', val: pct(selected.pnlPct) ?? '—', color: selected.pnlPct >= 0 ? 'var(--bullish)' : 'var(--bearish)' }] : []),
              ]" :key="cell.label"
                class="p-2 rounded text-center"
                style="background:var(--bg-secondary);border:1px solid var(--border-color)">
                <div class="text-[9px]" style="color:var(--text-muted)">{{ cell.label }}</div>
                <div class="text-xs font-bold" :style="{ color: cell.color }">{{ cell.val }}</div>
              </div>
            </div>

            <!-- R:R + confidence -->
            <div class="flex items-center gap-3 text-[11px]" style="color:var(--text-muted)">
              <span v-if="rr(selected)">R : R &nbsp;=&nbsp; 1 : {{ rr(selected) }}</span>
              <span class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full inline-block"
                      :style="confDot((selected as any).confidence ?? 'low')" />
                {{ (selected as any).confidence ?? '' }} confidence
              </span>
            </div>

            <!-- Tags -->
            <div v-if="(selected as any).tags?.length" class="flex gap-1.5 flex-wrap">
              <span v-for="tag in (selected as any).tags" :key="tag"
                    class="text-[9px] px-1.5 py-0.5 rounded"
                    style="color:var(--text-muted);background:var(--bg-tertiary)">#{{ tag }}</span>
            </div>

            <!-- Entry Reason -->
            <div class="space-y-1.5">
              <div class="text-[10px] font-bold uppercase tracking-wide" style="color:var(--text-muted)">
                Entry Reason
              </div>
              <div class="text-xs leading-relaxed p-3 rounded"
                   style="color:var(--text-primary);background:var(--bg-secondary);border:1px solid var(--border-color)">
                {{ selected.reason || 'No reason provided.' }}
              </div>
            </div>

            <!-- Entry Chart -->
            <div class="space-y-1.5">
              <div class="text-[10px] font-bold uppercase tracking-wide" style="color:var(--text-muted)">
                Entry Chart
              </div>
              <img v-if="selected.entryImage" :src="selected.entryImage"
                   class="w-full rounded object-contain"
                   style="max-height:200px;border:1px solid var(--border-color)" />
              <div v-else class="h-20 rounded flex items-center justify-center text-xs"
                   style="background:var(--bg-secondary);border:1px dashed var(--border-color);color:var(--text-muted)">
                No chart uploaded
              </div>
              <button class="tt-btn text-[10px]" @click="entryImgRef?.click()">📎 Upload entry chart</button>
              <input ref="entryImgRef" type="file" accept="image/*" class="hidden" @change="onEntryImg" />
            </div>

            <!-- Result Chart -->
            <div class="space-y-1.5">
              <div class="text-[10px] font-bold uppercase tracking-wide" style="color:var(--text-muted)">
                Result Chart
              </div>
              <img v-if="selected.resultImage" :src="selected.resultImage"
                   class="w-full rounded object-contain"
                   style="max-height:200px;border:1px solid var(--border-color)" />
              <div v-else class="h-20 rounded flex items-center justify-center text-xs"
                   style="background:var(--bg-secondary);border:1px dashed var(--border-color);color:var(--text-muted)">
                No result chart
              </div>
              <button class="tt-btn text-[10px]" @click="resultImgRef?.click()">📎 Upload result chart</button>
              <input ref="resultImgRef" type="file" accept="image/*" class="hidden" @change="onResultImg" />
            </div>

            <!-- Note -->
            <div v-if="selected.note" class="space-y-1.5">
              <div class="text-[10px] font-bold uppercase tracking-wide" style="color:var(--text-muted)">Note</div>
              <div class="text-xs leading-relaxed p-3 rounded italic"
                   style="color:var(--text-secondary);background:var(--bg-secondary);border:1px solid var(--border-color)">
                {{ selected.note }}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
