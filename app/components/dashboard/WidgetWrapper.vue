<!-- components/dashboard/WidgetWrapper.vue -->
<script setup lang="ts">
const props = defineProps<{
  title:    string
  widgetId: string
  locked:   boolean
}>()

const emit = defineEmits<{
  (e: 'close', id: string): void
  (e: 'clone', id: string): void
}>()

provide('widgetId', props.widgetId)

const isFullscreen = ref(false)


function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

// Escape to exit fullscreen
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen.value) isFullscreen.value = false
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<template>
  <!-- Fullscreen overlay -->
  <Teleport v-if="isFullscreen" to="body">
    <div class="fixed inset-0 z-[100] flex flex-col"
         style="background:var(--chart-bg)">
      <!-- Fullscreen header — thin bar + exit button -->
      <div class="widget-drag-handle tt-widget-header flex items-center shrink-0" style="height:24px;padding:0 8px">
        <span class="flex-1" />
        <button
          @click="toggleFullscreen"
          class="w-5 h-5 rounded flex items-center justify-center transition-colors"
          style="color:var(--text-muted)"
          title="Exit fullscreen (Esc)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
        </button>
      </div>
      <div class="flex-1 overflow-hidden">
        <slot />
      </div>
    </div>
  </Teleport>

  <!-- Normal widget -->
  <div v-if="!isFullscreen"
       class="flex flex-col h-full w-full overflow-hidden rounded-lg widget-body"
       style="border:1px solid var(--chart-border);background:var(--chart-bg)">

    <!-- Drag Handle — thin grab bar, no duplicate title -->
    <div
      class="widget-drag-handle tt-widget-header group"
      :class="locked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'"
    >
      <!-- Lock indicator only when locked -->
      <span v-if="locked" class="flex items-center" style="color:var(--text-muted)">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </span>
      <span class="flex-1" />

      <!-- Controls (visible on hover) -->
      <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <!-- Fullscreen -->
        <button
          @click.stop="toggleFullscreen"
          class="w-5 h-5 rounded flex items-center justify-center transition-colors hover:bg-[rgba(88,166,255,0.1)]"
          style="color:var(--text-muted)"
          @mouseenter="($event.currentTarget as HTMLElement).style.color='var(--ind-sma)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.color='var(--text-muted)'"
          title="Fullscreen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
        </button>

        <!-- Clone -->
        <button
          v-if="!locked"
          @click.stop="emit('clone', widgetId)"
          class="w-5 h-5 rounded flex items-center justify-center transition-colors hover:bg-[rgba(88,166,255,0.1)]"
          style="color:var(--text-muted)"
          @mouseenter="($event.currentTarget as HTMLElement).style.color='var(--ind-sma)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.color='var(--text-muted)'"
          title="Clone widget"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>

        <!-- Close -->
        <button
          v-if="!locked"
          @click.stop="emit('close', widgetId)"
          class="w-5 h-5 rounded flex items-center justify-center transition-colors"
          style="color:var(--text-muted)"
          @mouseenter="($event.currentTarget as HTMLElement).style.color='var(--bearish)';($event.currentTarget as HTMLElement).style.background='var(--bearish-bg)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.color='var(--text-muted)';($event.currentTarget as HTMLElement).style.background='transparent'"
          title="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <slot />
    </div>

  </div>
</template>
