# Project Structure

## Root
- `.nuxt/`: Nuxt auto-generated files.
- `app/`: Main application source code.
- `assets/`: Global assets like CSS and fonts.
- `components/`: Vue components.
- `composables/`: Reusable Vue composition logic.
- `layouts/`: Page layouts (e.g., dashboard).
- `pages/`: Route-based views.
- `plugins/`: Nuxt plugins (e.g., grid-layout-plus).
- `public/`: Static assets.
- `server/`: Server-side logic and API routes.
- `stores/`: Pinia state management.
- `tests/`: Unit and integration tests.
- `types/`: TypeScript type definitions.

## Key Directories

### `app/components/widgets/`
Contains 20+ specialized trading widgets:
- `ProChart.vue`: Main charting component.
- `Orderbook.vue`: Binance live depth.
- `News.vue`: Sentiment-aware news feed.
- `TradePlan.vue`: Signal display.
- `AnalystSignal.vue`: Insights panel.
- `VolumeProfile.vue`: Horizontal volume bars.
- `SRLevels.vue`: Support and Resistance.
- `OnChainMetrics.vue`: Blockchain data.
- ...and more.

### `app/composables/`
- `useMarketData.ts`: Centralizes OHLCV fetching and WS streams.
- `useDrawings.ts`: Manages chart drawing tool interactions.
- `useIndicators.ts`: Logic for adding/removing indicators.
- `usePineIndicator.ts`: PineScript execution engine.
- `useWebSocket.ts`: Base WebSocket client with auto-reconnect.
- `useTheme.ts`: Handles dark/light theme switching.

### `app/stores/`
- `chart.ts`: Per-widget chart configuration and tool state.
- `layout.ts`: Grid layout configuration and widget management.
- `market.ts`: Shared market data cache.
- `template.ts`: LocalStorage persistence for user layouts.
- `groups.ts`: Linking widgets together for synchronized updates.

### `server/api/`
- `binance/`: Proxy for Binance API (depth, exchangeInfo, klines, ticker).
- `market/`: General market data routes.
- `tradeplans.get.ts`: Fetches trade signals from external sources.
