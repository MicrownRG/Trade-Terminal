# Trading Terminal Planning

This document outlines the roadmap and development plan for the Trading Terminal project.

## Current Phase: Beta / Refinement
The core infrastructure is stable, and 20+ widgets have been implemented. Focus is now on performance, edge cases, and user experience.

### ✅ Completed
- **Infrastructure**: Nuxt 4 (SPA), Pinia stores, WebSocket integration.
- **Charting**: Lightweight Charts with Drawing Tools & Indicators.
- **Layout**: Flexible grid layout with persistence.
- **Core Widgets**: ProChart, Orderbook, News, Sentiment, Watchlist.
- **Advanced Widgets**: TradePlan, AnalystSignal, Heatmap, MarketStats, etc.
- **Theming**: Full Dark/Light mode support with CSS variables.

### 🔄 In Progress
- **Unit Testing**: Increasing coverage for composables and stores.
- **Performance**: Optimizing chart re-renders and WebSocket data processing.
- **UI/UX**: Polishing the "Add Widget" modal and sidebar interactions.

### 🚀 Upcoming
- **Multi-Source Data**: Integrating CoinGecko, CoinMarketCap, and Whale Alert APIs.
- **Advanced Indicators**: Implementing more PineScript-based indicators.
- **User Authentication**: Persisting layouts and settings to a backend.
- **Mobile Optimization**: Responsive views for tablets and mobile devices.

## Technical Goals
1.  **High Performance**: Maintain 60fps even with multiple charts and live orderbooks.
2.  **Extensibility**: Make it easy to add new widgets and indicators with minimal boilerplate.
3.  **Reliability**: Robust error handling for WebSocket disconnects and API failures.
4.  **Customizability**: Allow users to save complex templates and share them.

## Implementation Details
- **Grid System**: Using `grid-layout-plus` for a robust drag-and-drop experience.
- **Chart Core**: Wrapped `lightweight-charts` with a custom adapter for indicators and drawings.
- **Data Flow**: Unidirectional data flow from WebSockets/APIs → Pinia Stores → Components.
