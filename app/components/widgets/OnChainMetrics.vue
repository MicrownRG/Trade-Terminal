<!-- components/widgets/OnChainMetrics.vue -->
<template>
  <div class="onchain-widget">
    <div class="metrics-header">
      <h3>On-Chain Metrics</h3>
      <select v-model="selectedChain" class="chain-select">
        <option value="BTC">Bitcoin</option>
        <option value="ETH">Ethereum</option>
        <option value="SOL">Solana</option>
      </select>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Active Addresses (24h)</div>
        <div class="metric-value">{{ formatNumber(activeAddresses) }}</div>
        <div class="metric-change positive">+5.2%</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Transaction Count (24h)</div>
        <div class="metric-value">{{ formatNumber(transactionCount) }}</div>
        <div class="metric-change negative">-2.1%</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Avg Gas Price (Gwei)</div>
        <div class="metric-value">{{ avgGasPrice.toFixed(2) }}</div>
        <div class="metric-change positive">+1.8%</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Hash Rate (EH/s)</div>
        <div class="metric-value">{{ hashRate.toFixed(2) }}</div>
        <div class="metric-change negative">-0.3%</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Exchange Inflow</div>
        <div class="metric-value">{{ formatNumber(exchangeInflow) }}</div>
        <div class="metric-change positive">+3.7%</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Exchange Outflow</div>
        <div class="metric-value">{{ formatNumber(exchangeOutflow) }}</div>
        <div class="metric-change negative">-1.2%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedChain = ref('BTC')

const activeAddresses = ref(987654)
const transactionCount = ref(456234)
const avgGasPrice = ref(45.67)
const hashRate = ref(320.5)
const exchangeInflow = ref(15234)
const exchangeOutflow = ref(8765)

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  }
  return num.toString()
}

// Simulate data updates
setInterval(() => {
  activeAddresses.value += Math.floor((Math.random() - 0.5) * 10000)
  transactionCount.value += Math.floor((Math.random() - 0.5) * 5000)
  avgGasPrice.value += (Math.random() - 0.5) * 10
  hashRate.value += (Math.random() - 0.5) * 5
  exchangeInflow.value += Math.floor((Math.random() - 0.5) * 2000)
  exchangeOutflow.value += Math.floor((Math.random() - 0.5) * 1000)
}, 5000)
</script>

<style scoped>
.onchain-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.metrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
}

.metrics-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.chain-select {
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  padding: 16px;
  overflow-y: auto;
}

.metric-card {
  padding: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-label {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: monospace;
}

.metric-change {
  font-size: 12px;
  font-weight: 500;
}

.metric-change.positive {
  color: var(--bullish);
}

.metric-change.negative {
  color: var(--bearish);
}
</style>
