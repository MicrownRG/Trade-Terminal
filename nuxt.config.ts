// nuxt.config.ts — versi final
export default defineNuxtConfig({
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
    storageKey: 'tt-color-mode',
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  // Chart + grid libs = client-only (canvas, window, document)
  vite: {
    optimizeDeps: {
      include: [
        'lightweight-charts',
        'lightweight-charts-drawing',
        'lightweight-charts-indicators',
        'oakscriptjs',
        'pinets',
        'grid-layout-plus',
      ],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'chart-core': ['lightweight-charts'],
            'chart-drawing': ['lightweight-charts-drawing'],
            'chart-ind': ['lightweight-charts-indicators', 'oakscriptjs'],
            'pinets': ['pinets'],
            'grid': ['grid-layout-plus'],
          },
        },
      },
    },
  },

  routeRules: {
    '/': { redirect: '/dashboard/BTCUSDT' },
    '/dashboard/**': { ssr: false },
  },

  // Auto-import composables & stores
  imports: {
    dirs: ['stores', 'composables'],
  },

  runtimeConfig: {
    binanceApiUrl: process.env.BINANCE_API_URL || 'https://api.binance.com',
    public: {
      binanceWsUrl: process.env.BINANCE_WS_URL || 'wss://stream.binance.com:9443',
    }
  }
})