<!-- pages/article/[id].vue — Full article reading page -->
<script setup lang="ts">
definePageMeta({ layout: false })

const route    = useRoute()
const router   = useRouter()
const { getById } = useNewsData()
const colorMode = useColorMode()

const article = computed(() => getById(route.params.id as string))

const sentimentStyle = (s: string) => ({
  positive: 'color:var(--bullish);background:var(--bullish-bg)',
  negative: 'color:var(--bearish);background:var(--bearish-bg)',
  neutral:  'color:var(--text-muted);background:var(--bg-tertiary)',
}[s] ?? '')

const sentimentLabel = (s: string) => ({
  positive: '▲ BULLISH',
  negative: '▼ BEARISH',
  neutral:  '● NEUTRAL',
}[s] ?? '')

// Allow body to scroll on this page (dashboard layout sets overflow:hidden)
onMounted(() => {
  document.documentElement.style.overflow = 'auto'
  document.body.style.overflow = 'auto'
  const nuxtEl = document.getElementById('__nuxt')
  if (nuxtEl) nuxtEl.style.overflow = 'auto'
})
onUnmounted(() => {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  const nuxtEl = document.getElementById('__nuxt')
  if (nuxtEl) nuxtEl.style.overflow = ''
})

watchEffect(() => {
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', colorMode.value === 'dark')
  }
})
</script>

<template>
  <div class="min-h-screen font-mono overflow-y-auto" style="background:var(--bg-primary);color:var(--text-primary)">

    <!-- Top bar -->
    <div class="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b"
         style="background:var(--bg-primary);border-color:var(--border-color)">
      <button
        @click="router.back()"
        class="tt-btn"
      >← Back</button>
      <span class="text-xs font-bold" style="color:var(--text-muted)">TRADING TERMINAL</span>
      <div class="ml-auto flex items-center gap-2">
        <button
          @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
          class="tt-btn text-[11px]"
        >{{ colorMode.value === 'dark' ? '☀' : '🌙' }}</button>
      </div>
    </div>

    <!-- Not found -->
    <div v-if="!article"
         class="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <span class="text-4xl">🔍</span>
      <p class="text-sm" style="color:var(--text-muted)">Article not found.</p>
      <button class="tt-btn" @click="router.back()">← Go back</button>
    </div>

    <!-- Article content -->
    <article v-else class="mx-auto max-w-2xl px-4 pb-16 pt-6">

      <!-- Hero image -->
      <div class="rounded-xl overflow-hidden mb-6" style="border:1px solid var(--border-color)">
        <img
          :src="article.image"
          :alt="article.title"
          class="w-full object-cover"
          style="max-height:320px"
        />
      </div>

      <!-- Meta row -->
      <div class="flex items-center gap-2 flex-wrap mb-4">
        <span
          class="text-[9px] px-1.5 py-0.5 rounded font-bold font-mono"
          :style="sentimentStyle(article.sentiment)"
        >{{ sentimentLabel(article.sentiment) }}</span>

        <span v-for="tag in article.tags" :key="tag"
              class="text-[9px] px-1.5 py-0.5 rounded font-mono"
              style="color:var(--text-muted);background:var(--bg-tertiary)">
          #{{ tag }}
        </span>

        <span class="ml-auto text-[10px] font-mono" style="color:var(--text-muted)">
          {{ article.source }}
          <span v-if="article.author"> · {{ article.author }}</span>
          · {{ article.time }}
        </span>
      </div>

      <!-- Title -->
      <h1 class="text-xl font-bold leading-snug mb-3"
          style="color:var(--text-primary)">
        {{ article.title }}
      </h1>

      <!-- Summary (lead) -->
      <p class="text-sm leading-relaxed mb-6 font-bold"
         style="color:var(--text-secondary)">
        {{ article.summary }}
      </p>

      <!-- Divider -->
      <div class="mb-6" style="border-top:1px solid var(--border-color)"/>

      <!-- Body paragraphs -->
      <div class="space-y-4">
        <p
          v-for="(para, i) in article.body"
          :key="i"
          class="text-sm leading-relaxed"
          style="color:var(--text-primary)"
        >{{ para }}</p>
      </div>

      <!-- Footer -->
      <div class="mt-10 pt-6 flex items-center gap-3"
           style="border-top:1px solid var(--border-color)">
        <span class="text-[10px] font-mono" style="color:var(--text-muted)">
          Source: {{ article.source }}
        </span>
        <button class="tt-btn ml-auto" @click="router.back()">← Back to dashboard</button>
      </div>

    </article>

  </div>
</template>
