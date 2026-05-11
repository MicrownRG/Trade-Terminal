<!-- pages/index.vue -->
<script setup lang="ts">
// Redirect langsung ke dashboard
navigateTo('/dashboard/BTCUSDT')
</script>

<template>
  <div class="flex items-center justify-center h-screen bg-chart-bg">
    <div class="flex flex-col items-center gap-3">
      <div class="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
           style="border-color:#58a6ff;border-top-color:transparent"/>
      <span class="text-chart-muted font-mono text-sm">Redirecting...</span>
    </div>
  </div>
</template>