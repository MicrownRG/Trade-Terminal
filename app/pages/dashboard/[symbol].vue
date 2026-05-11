<!-- pages/dashboard/[symbol].vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const route       = useRoute()
const layoutStore = useLayoutStore()
const chartStore  = useChartStore()

const symbol = computed(() =>
  (route.params.symbol as string).toUpperCase()
)

onMounted(() => {
  // Load layout khusus per symbol/page
  layoutStore.setPage(symbol.value)
  chartStore.setSymbol(symbol.value)
  chartStore.loadDrawings()
})

// Saat symbol di URL berubah, update layout + store
watch(symbol, (sym) => {
  layoutStore.setPage(sym)
  chartStore.setSymbol(sym)
})
</script>

<template>
  <!-- Layout sudah ditangani oleh layouts/dashboard.vue -->

    <div class="sr-only">{{ symbol }}</div>
</template>