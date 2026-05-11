<!-- components/widgets/News.vue -->
<script setup lang="ts">
const { getAll, getCategories } = useNewsData()
const news = getAll()
const categories = getCategories()

const activeCategory = ref<string | null>(null)
const showCategoryDropdown = ref(false)

const filteredNews = computed(() => {
  if (!activeCategory.value) return news
  return news.filter(n => n.tags.includes(activeCategory.value!))
})

const selected = ref<ReturnType<typeof getAll>[0] | null>(null)

function open(item: typeof news[0]) { selected.value = item }
function close()                    { selected.value = null }

onMounted(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})

const sentimentStyle = (s: string) => ({
  positive: 'color:var(--bullish);background:var(--bullish-bg)',
  negative: 'color:var(--bearish);background:var(--bearish-bg)',
  neutral:  'color:var(--text-muted);background:var(--bg-tertiary)',
}[s] ?? '')

const sentimentLabel = (s: string) => ({
  positive: '▲ BULL',
  negative: '▼ BEAR',
  neutral:  '● NEUT',
}[s] ?? '')
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden" style="background:var(--chart-bg)">

    <!-- Header -->
    <div class="px-3 py-1.5 shrink-0 flex items-center justify-between text-xs font-mono relative"
         style="background:var(--chart-surface);border-bottom:1px solid var(--chart-border)">
      <span class="font-bold flex items-center gap-1.5" style="color:var(--text-primary)">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>
        News
      </span>
      
      <div class="relative">
        <button 
          @click="showCategoryDropdown = !showCategoryDropdown" 
          class="text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
          style="color:var(--text-muted)"
          @mouseenter="($event.currentTarget as HTMLElement).style.color='var(--text-primary)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.color='var(--text-muted)'"
        >
          {{ activeCategory || 'All Categories' }}
          <span class="text-[8px] opacity-70">▼</span>
        </button>

        <!-- Invisible backdrop for closing dropdown -->
        <div v-if="showCategoryDropdown" class="fixed inset-0 z-[90]" @click="showCategoryDropdown = false"></div>

        <!-- Dropdown Menu -->
        <div 
          v-if="showCategoryDropdown" 
          class="absolute right-0 top-full mt-2 z-[100] rounded-md shadow-2xl py-1 w-32 border max-h-48 overflow-y-auto scrollbar-none"
          style="background:var(--chart-bg);border-color:var(--chart-border)"
        >
          <button 
            class="w-full text-left px-3 py-1.5 text-[10px] transition-colors"
            :style="activeCategory === null ? 'color:var(--text-primary);background:var(--bg-tertiary)' : 'color:var(--text-muted)'"
            @mouseenter="($event.currentTarget as HTMLElement).style.background='var(--chart-hover)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background=activeCategory === null ? 'var(--bg-tertiary)' : 'transparent'"
            @click="activeCategory = null; showCategoryDropdown = false"
          >All Categories</button>
          
          <button 
            v-for="cat in categories" :key="cat"
            class="w-full text-left px-3 py-1.5 text-[10px] transition-colors"
            :style="activeCategory === cat ? 'color:var(--text-primary);background:var(--bg-tertiary)' : 'color:var(--text-muted)'"
            @mouseenter="($event.currentTarget as HTMLElement).style.background='var(--chart-hover)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background=activeCategory === cat ? 'var(--bg-tertiary)' : 'transparent'"
            @click="activeCategory = cat; showCategoryDropdown = false"
          >{{ cat }}</button>
        </div>
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto">
      <button
        v-for="item in filteredNews"
        :key="item.id"
        class="w-full text-left px-3 py-2 transition-colors"
        style="border-bottom:1px solid var(--chart-border)"
        @mouseenter="($event.currentTarget as HTMLElement).style.background='var(--chart-hover)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.background='transparent'"
        @click="open(item)"
      >
        <div class="flex gap-2 items-start">
          <!-- Sentiment -->
          <span
            class="shrink-0 text-[9px] px-1 py-0.5 rounded font-bold font-mono mt-0.5"
            :style="sentimentStyle(item.sentiment)"
          >{{ sentimentLabel(item.sentiment) }}</span>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-[11px] leading-snug line-clamp-2" style="color:var(--text-primary)">
              {{ item.title }}
            </p>
            <p class="text-[10px] mt-0.5 font-mono" style="color:var(--text-muted)">
              {{ item.source }} · {{ item.time }}
            </p>
          </div>
        </div>
      </button>
    </div>

  </div>

  <!-- ── Popup modal ── -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="selected"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.8);backdrop-filter:blur(4px)"
        @click.self="close"
      >
        <!-- Card — scrollable -->
        <div
          class="relative w-full max-w-lg rounded-xl overflow-hidden flex flex-col shadow-2xl"
          style="background:var(--chart-surface);border:1px solid var(--chart-border);max-height:88vh"
        >
          <!-- Close btn (fixed top-right inside card) -->
          <button
            class="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
            style="background:var(--bg-tertiary);color:var(--text-muted)"
            @mouseenter="($event.currentTarget as HTMLElement).style.color='var(--text-primary)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.color='var(--text-muted)'"
            @click="close"
          >✕</button>

          <!-- Hero image (sticky top) -->
          <div class="shrink-0">
            <img
              :src="selected.image"
              :alt="selected.title"
              class="w-full object-cover"
              style="max-height:200px;background:var(--chart-border)"
            />
          </div>

          <!-- Scrollable body -->
          <div class="overflow-y-auto overscroll-contain flex-1 min-h-0 p-5 space-y-3">

            <!-- Meta row -->
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="text-[9px] px-1.5 py-0.5 rounded font-bold font-mono"
                :style="sentimentStyle(selected.sentiment)"
              >{{ sentimentLabel(selected.sentiment) }}</span>

              <span v-for="tag in selected.tags?.slice(0,3)" :key="tag"
                    class="text-[8px] px-1 py-0.5 rounded font-mono"
                    style="color:var(--text-muted);background:var(--bg-tertiary)">
                #{{ tag }}
              </span>

              <span class="ml-auto text-[10px] font-mono" style="color:var(--text-muted)">
                {{ selected.source }} · {{ selected.time }}
              </span>
            </div>

            <!-- Title -->
            <p class="text-sm font-bold leading-snug" style="color:var(--text-primary)">
              {{ selected.title }}
            </p>

            <!-- Summary -->
            <p class="text-xs leading-relaxed" style="color:var(--text-secondary)">
              {{ selected.summary }}
            </p>

            <!-- First body paragraph preview -->
            <p class="text-xs leading-relaxed" style="color:var(--text-muted)">
              {{ selected.body[0] }}
            </p>

            <!-- Fade hint -->
            <p class="text-[10px] font-mono text-center" style="color:var(--text-muted)">
              — Read full article for more —
            </p>

            <!-- Footer actions -->
            <div class="flex gap-2 pt-2">
              <NuxtLink
                :to="`/article/${selected.id}`"
                class="tt-btn flex-1 justify-center text-xs"
                style="color:var(--ind-sma);border-color:rgba(88,166,255,0.4);background:rgba(88,166,255,0.08)"
                @click="close"
              >Read full article →</NuxtLink>
              <button class="tt-btn text-xs" @click="close">✕ Close</button>
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
