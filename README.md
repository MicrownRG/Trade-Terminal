# Trading Terminal

A professional-grade, highly customizable trading dashboard built with Nuxt 4, Lightweight Charts, and Pinia.

![Dashboard Preview](public/favicon.ico) <!-- Placeholder -->

## Features

-   **Interactive Charts**: Multiple timeframes, candle types, and professional drawing tools.
-   **Technical Analysis**: RSI, MACD, and custom indicators powered by PineTS.
-   **Draggable Layout**: Fully customizable grid system to arrange your workspace.
-   **Real-time Data**: Live market updates via WebSockets for prices, orderbooks, and news.
-   **20+ Specialized Widgets**:
    -   Price Charts (Candlestick/OHLC)
    -   Orderbook (Binance depth)
    -   News Feed (with sentiment analysis)
    -   Whale Alerts & Token Launches
    -   On-Chain Metrics & Market Stats
    -   Trade Plans & Analyst Signals
-   **Theming**: Seamless Dark/Light mode support.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation
```bash
git clone https://github.com/your-repo/trading-terminal.git
cd trading-terminal
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack
-   **Framework**: [Nuxt 4](https://nuxt.com/)
-   **Charting**: [Lightweight Charts](https://ru.tradingview.com/lightweight-charts/)
-   **State**: [Pinia](https://pinia.vuejs.org/)
-   **Grid**: [grid-layout-plus](https://github.com/m-p-j/grid-layout-plus)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn-vue](https://www.shadcn-vue.com/)

## Project Structure
-   `app/components/widgets`: Implementation of individual dashboard panels.
-   `app/composables`: Shared logic for data fetching, charts, and websockets.
-   `app/stores`: Global state management for layouts, charts, and market data.
-   `server/api`: Server-side proxy for market data and signals.

## License
MIT
