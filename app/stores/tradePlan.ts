import { defineStore } from 'pinia'
import type { TradePlan } from '~/types'

export const useTradePlanStore = defineStore('tradePlan', {
  state: () => ({
    plans: [] as TradePlan[],
  }),
  getters: {
    sorted: (state) => [...state.plans].sort((a, b) => b.createdAt - a.createdAt),
  },
  actions: {
    addPlan(plan: Omit<TradePlan, 'id' | 'createdAt'>) {
      this.plans.push({ ...plan, id: Date.now().toString(), createdAt: Date.now() })
      this.save()
    },
    updatePlan(id: string, patch: Partial<TradePlan>) {
      const idx = this.plans.findIndex(p => p.id === id)
      if (idx >= 0) { this.plans[idx] = { ...this.plans[idx]!, ...patch }; this.save() }
    },
    deletePlan(id: string) {
      this.plans = this.plans.filter(p => p.id !== id)
      this.save()
    },
    save() {
      if (import.meta.client)
        localStorage.setItem('tt-tradeplans', JSON.stringify(this.plans))
    },
    load() {
      if (!import.meta.client) return
      const raw = localStorage.getItem('tt-tradeplans')
      if (raw) { try { this.plans = JSON.parse(raw) } catch {} }
    },
  },
})
