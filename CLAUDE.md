# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Trading Terminal** is an interactive, customizable dashboard for monitoring and analyzing financial markets. It provides real-time market data, technical analysis tools, and a flexible widget-based interface similar to professional trading platforms.

### Key Features
- **Per-symbol dashboards**: Route-based pages for each trading symbol (e.g., `/dashboard/BTCUSDT`)
- **Draggable widget layout**: Grid-based dashboard with resizable, draggable panels via `grid-layout-plus`.
- **Interactive charting**: Professional charts with drawing tools, multiple timeframes, and technical indicators (via `lightweight-charts`).
- **Technical indicators**: RSI, MACD, and PineScript-based custom indicators via `pinets`.
- **Real-time data**: WebSocket integration for live market data, order book, and news.
- **Theme system**: Dark/light mode with comprehensive CSS variable theming.

## Tech Stack

- **Framework**: Nuxt 4 (running in compatibility mode) with TypeScript
- **Styling**: TailwindCSS 3 + shadcn-vue components + CSS variables for theming
- **State Management**: Pinia (auto-imported from `stores/`)
- **Charting**: Lightweight Charts library with drawing tools and indicators
- **Technical Analysis**: PineTS (PineScript interpreter) for custom indicators
- **Grid Layout**: `grid-layout-plus` (Vue 3 port of `vue-grid-layout`)
- **Utilities**: VueUse composables

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000 or 3001 if 3000 is busy)
npm run dev

# Run unit tests
npm run test

# Build for production
npm run build
```

## Architecture & File Structure

```
app/
├── app.vue                          # Root component
├── types/index.ts                   # TypeScript types (Bar, WidgetItem, etc.)
│
├── composables/
│   ├── useMarketData.ts            # Fetch OHLCV data + WebSocket management
│   ├── useDrawings.ts              # Drawing tool state and persistence
│   ├── useIndicators.ts            # Indicator management for charts
│   ├── usePineIndicator.ts         # PineTS runner + preset library
│   ├── useChartTheme.ts            # Chart colors for dark/light theme
│   ├── useTheme.ts                 # Global theme state & CSS variable setup
│   └── useBreakpoint.ts            # Responsive layout utilities
│
├── stores/ (Pinia)
│   ├── chart.ts                    # Symbol, timeframe, drawing tools, indicators
│   ├── layout.ts                   # Grid layout per page + lock state
│   ├── market.ts                   # Market data state (ohlcv, tickers)
│   ├── template.ts                 # Widget templates + save/load layouts
│   └── groups.ts                   # Widget linking/grouping state
│
├── components/
│   ├── dashboard/
│   │   ├── Topbar.vue              # Symbol selector, lock, add widget, theme toggle
│   │   ├── WidgetWrapper.vue       # Drag handle + close button wrapper
│   │   ├── AddWidgetModal.vue      # Modal to add widgets to dashboard
│   │   └── DrawingSidebar.vue      # Chart drawing tools toolbar
│   │
│   └── widgets/
│       ├── ProChart.vue            # Main charting widget
│       ├── Orderbook.vue           # Live bid/ask from Binance
│       ├── News.vue                # Market news feed
│       ├── Sentiment.vue           # Fear & Greed index
│       ├── Watchlist.vue           # Live ticker list
│       ├── TradePlan.vue           # Trade signals and plans
│       ├── AnalystSignal.vue       # Analyst insights and signals
│       └── ... (20+ specialized widgets)
│
└── pages/
    ├── index.vue                   # Redirects to `/dashboard/BTCUSDT`
    └── dashboard/
        └── [symbol].vue            # Per-symbol dashboard page
```

## State Management (Pinia)

### `stores/chart.ts`
- Manages symbol, timeframe, and chart-specific configurations.
- Handles drawing tools and indicator state per widget.

### `stores/layout.ts`
- Manages the grid layout for different symbols/pages.
- Tracks `activeWidgets` and layout `isLocked` state.

### `stores/market.ts`
- Stores shared market data like OHLCV bars and real-time tickers.

## Common Development Tasks

### Add a New Widget
1. Create component in `app/components/widgets/YourWidget.vue`.
2. Add widget type to `WidgetItem` enum in `app/types/index.ts`.
3. Register the widget in `AddWidgetModal.vue`.
4. Implement widget logic using available stores and composables.

### Add a New Indicator
1. Define the indicator logic in `app/composables/useIndicators.ts` or `usePineIndicator.ts`.
2. Update `IndicatorSettingsModal.vue` if parameters are needed.
3. Integrate the rendering logic in `ProChart.vue`.

## Key Implementation Details

**SSR disabled**: The application is configured as an SPA (`ssr: false` in `nuxt.config.ts`) because of heavy reliance on canvas-based libraries.

**WebSocket**: `useWebSocket.ts` handles the connection to Binance and other data providers, broadcasting updates to the relevant stores.

**Persistence**: Layouts and user templates are persisted via `localStorage` through the `template` store.
