<!-- app.vue -->
<script setup lang="ts">
const colorMode = useColorMode()
const { isOpen: showPalette, toggle: togglePalette, close: closePalette } = useCommandPalette()

// Global Ctrl+K for command palette
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      togglePalette()
    }
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})

// Sync dark class ke <html> setiap kali mode berubah
// @nuxtjs/color-mode seharusnya sudah handle ini,
// tapi kita pastikan manual untuk keandalan penuh
watchEffect(() => {
  if (import.meta.client) {
    const html = document.documentElement
    if (colorMode.value === 'dark') {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }
  }
})
// Pastikan dark class teraplikasi sejak awal
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#0d1117' },
  ],
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <DashboardCommandPalette v-if="showPalette" @close="closePalette" />
</template>