const LIGHT = Object.freeze({
  brand: '#03246B',
  success: '#059669',
  alert: '#D97706',
  danger: '#DC2626',
  purple: '#6366F1',
  teal: '#0891B2',
  axis: '#64748B',
  axisMuted: '#64748B',
  grid: '#E2E8F0',
  series: ['#03246B', '#059669', '#D97706', '#7C3AED', '#DC2626', '#0891B2'],
  calendarRanges: ['#DCE7F6', '#D7F2E3', '#FDECC8', '#E8DDF9', '#F9DEDE', '#F7DCEB', '#D8F0ED', '#FBE4D2'],
  calendarText: '#26364D',
})

const DARK = Object.freeze({
  brand: '#79A2FF',
  success: '#34D399',
  alert: '#FBBF24',
  danger: '#F87171',
  purple: '#A5B4FC',
  teal: '#67E8F9',
  axis: '#A1AAB5',
  axisMuted: '#7D8590',
  grid: '#30363D',
  series: ['#79A2FF', '#34D399', '#FBBF24', '#C4B5FD', '#F87171', '#67E8F9'],
  calendarRanges: ['#244A83', '#14532D', '#713F12', '#4C1D95', '#7F1D1D', '#831843', '#134E4A', '#7C2D12'],
  calendarText: '#F1F5F9',
})

export function getChartPalette(isDark) {
  return isDark ? DARK : LIGHT
}
