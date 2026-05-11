<!-- components/dashboard/CommandPalette.vue -->
<script setup lang="ts">
const emit = defineEmits<{ (e: 'close'): void }>()

const chartStore = useChartStore()
const query = ref('')
const selectedIdx = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => nextTick(() => inputRef.value?.focus()))

const INDICATORS = ['SMA','EMA','BB','VWAP','RSI','MACD']

const ACTIONS = [
  { label: 'Reset Layout',   icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>', action: () => useLayoutStore().resetLayout() },
  { label: 'Add Page',       icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>', action: () => useLayoutStore().addPage() },
  { label: 'Toggle Lock',    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>', action: () => useLayoutStore().toggleLock() },
  { label: 'Dark Mode',      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>', action: () => useTheme().toggle() },
]

type Result = { type: 'indicator'|'action'; label: string; icon: string; action: () => void }

function scoreMatch(text: string, q: string): number {
  if (text === q) return 3
  if (text.startsWith(q)) return 2
  if (text.includes(q)) return 1
  return 0
}

const results = computed<Result[]>(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return []

  const hits: (Result & { score: number })[] = []

  INDICATORS.forEach(i => {
    const score = scoreMatch(i.toLowerCase(), q)
    if (score > 0) hits.push({
      type: 'indicator', label: `Add ${i}`, score,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
      action: () => { chartStore.toggleIndicator(i as any); emit('close') },
    })
  })

  ACTIONS.forEach(a => {
    const score = scoreMatch(a.label.toLowerCase(), q)
    if (score > 0) hits.push({
      type: 'action', label: a.label, score, icon: a.icon,
      action: () => { a.action(); emit('close') },
    })
  })

  hits.sort((a, b) => b.score - a.score)
  return hits
})

watch(query, () => selectedIdx.value = 0)

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx.value = Math.min(selectedIdx.value + 1, results.value.length - 1) }
  if (e.key === 'ArrowUp')   { e.preventDefault(); selectedIdx.value = Math.max(selectedIdx.value - 1, 0) }
  if (e.key === 'Enter')     { results.value[selectedIdx.value]?.action() }
  if (e.key === 'Escape')    { emit('close') }
}

const GROUP_LABELS: Record<string, string> = {
  indicator: 'Indicators', action: 'Actions',
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[200] flex items-start justify-center pt-16 px-4"
      style="background:rgba(0,0,0,0.6);backdrop-filter:blur(4px)"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-xl rounded-xl overflow-hidden shadow-2xl"
        style="background:var(--bg-secondary);border:1px solid var(--border-color)"
      >
        <!-- Search input -->
        <div class="flex items-center gap-3 px-4 py-3"
             style="border-bottom:1px solid var(--border-color)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            ref="inputRef"
            v-model="query"
            placeholder="Search indicators, actions…"
            class="flex-1 bg-transparent outline-none text-sm font-mono"
            style="color:var(--text-primary)"
            @keydown="onKeyDown"
          />
          <kbd class="text-[10px] px-1.5 py-0.5 rounded font-mono"
               style="background:var(--bg-tertiary);color:var(--text-muted)">Esc</kbd>
        </div>

        <!-- Results -->
        <div class="max-h-80 overflow-y-auto py-1">
          <template v-if="query.trim() && results.length">
            <template v-for="group in (['indicator','action'] as const)" :key="group">
              <template v-if="results.filter(r => r.type === group).length">
                <div class="px-3 py-1 text-[10px] font-bold font-mono uppercase tracking-wide"
                     style="color:var(--text-muted)">
                  {{ GROUP_LABELS[group] }}
                </div>
                <button
                  v-for="item in results.filter(r => r.type === group)"
                  :key="item.label"
                  class="w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors"
                  :style="results.indexOf(item) === selectedIdx
                    ? 'background:rgba(88,166,255,0.15);color:var(--text-primary)'
                    : 'color:var(--text-secondary)'"
                  @click="item.action()"
                  @mouseover="selectedIdx = results.indexOf(item)"
                >
                  <div class="flex items-center justify-center w-5" v-html="item.icon"></div>
                  <span class="font-mono text-xs">{{ item.label }}</span>
                </button>
              </template>
            </template>
          </template>
          <div v-else-if="query.trim()" class="px-4 py-6 text-center text-sm font-mono"
               style="color:var(--text-muted)">
            No results for "{{ query }}"
          </div>
          <div v-else class="px-4 py-6 text-center text-sm font-mono"
               style="color:var(--text-muted)">
            Type to search indicators or actions…
          </div>
        </div>

        <!-- Footer hint -->
        <div class="flex items-center gap-3 px-4 py-2 text-[10px] font-mono"
             style="border-top:1px solid var(--border-color);color:var(--text-muted)">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
