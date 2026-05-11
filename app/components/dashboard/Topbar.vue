<!-- components/dashboard/Topbar.vue — REFACTORED -->
<script setup lang="ts">
const layoutStore  = useLayoutStore()
const chartStore   = useChartStore()
const { isDark, toggle } = useTheme()
const { open: openPalette } = useCommandPalette()
const { showButton } = useBreakpoint()
const showAdd       = ref(false)
const showTemplates = ref(false)
</script>

<template>
  <header
    class="flex items-center gap-2 px-4 h-11 shrink-0 z-20"
    style="background-color: var(--chart-surface);
           border-bottom: 1px solid var(--chart-border);"
  >
    <!-- Logo -->
    <div class="flex items-center gap-2 mr-3">
      <span class="font-bold text-sm font-mono" style="color: var(--ind-sma)">
        ⬡ TradingTerminal
      </span>
    </div>

    <!-- Symbol input -->
    <div class="flex items-center gap-1 px-2 h-7 rounded"
         style="background:var(--bg-primary); border:1px solid var(--border-color)">
      <span class="text-xs font-mono" style="color:var(--text-muted)">$</span>
      <input
        :value="chartStore.symbol"
        @keyup.enter="(e) => chartStore.setSymbol(
          (e.target as HTMLInputElement).value.toUpperCase()
        )"
        class="tt-input w-24 border-0 bg-transparent h-full p-0 focus:ring-0"
        placeholder="BTCUSDT"
      />
    </div>

    <div class="tt-sep" />

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Command Palette trigger (hidden on mobile) -->
    <button
      v-if="showButton('search')"
      class="tt-btn font-mono"
      style="color:var(--text-muted);min-width:120px;justify-content:space-between"
      @click="openPalette()"
      title="Command Palette (Ctrl+K)"
    >
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span>Search…</span>
      </div>
      <kbd class="text-[10px]">⌃K</kbd>
    </button>

    <div v-if="showButton('search')" class="tt-sep" />

    <!-- Lock/Unlock -->
    <button
      @click="layoutStore.toggleLock()"
      class="tt-btn flex items-center gap-1.5"
      :class="layoutStore.isLocked ? 'tt-btn-danger' : ''"
    >
      <svg v-if="layoutStore.isLocked" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
      {{ layoutStore.isLocked ? 'Locked' : 'Lock' }}
    </button>

    <!-- Reset (hidden on mobile) -->
    <button
      v-if="showButton('reset')"
      @click="layoutStore.resetLayout()"
      :disabled="layoutStore.isLocked"
      class="tt-btn flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
      Reset
    </button>

    <!-- Templates (hidden on mobile) -->
    <button
      v-if="showButton('templates')"
      @click="showTemplates = true"
      class="tt-btn flex items-center gap-1.5"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      Templates
    </button>

    <!-- Add Widget -->
    <button
      @click="showAdd = true"
      :disabled="layoutStore.isLocked"
      class="tt-btn flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
      style="color: var(--ind-sma);
             border-color: rgba(88,166,255,0.35);
             background-color: rgba(88,166,255,0.08);"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
      Widget
    </button>

    <div class="tt-sep" />

    <!-- Theme Toggle -->
    <button
      @click="toggle()"
      class="tt-btn w-8 justify-center px-0"
      :title="isDark ? 'Switch to Light' : 'Switch to Dark'"
    >
      <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
    </button>

  </header>

  <!-- Modals -->
  <Teleport to="body">
    <DashboardAddWidgetModal v-if="showAdd" @close="showAdd = false" />
    <DashboardTemplateManagerModal v-if="showTemplates" @close="showTemplates = false" />
  </Teleport>
</template>