import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const statsByRange = {
  month: {
    balance: '$12,480',
    income: '$8,200',
    expenses: '$2,740',
    growth: '+18.2% from last month',
  },
  quarter: {
    balance: '$36,920',
    income: '$24,500',
    expenses: '$8,410',
    growth: '+12.4% from last quarter',
  },
  year: {
    balance: '$148,920',
    income: '$98,300',
    expenses: '$41,500',
    growth: '+31.7% from last year',
  },
}

export const useDashboardStore = defineStore('dashboard', () => {
  const selectedRange = ref('month')

  const currentStats = computed(() => statsByRange[selectedRange.value])

  function setRange(range) {
    selectedRange.value = range
  }

  return {
    selectedRange,
    currentStats,
    setRange,
  }
})