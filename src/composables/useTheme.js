import { ref, watch } from 'vue'

const STORAGE_KEY = 'moreMoney-theme'
const isDark = ref(localStorage.getItem(STORAGE_KEY) === 'dark')

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

applyTheme(isDark.value)

watch(isDark, (val) => {
  applyTheme(val)
  localStorage.setItem(STORAGE_KEY, val ? 'dark' : 'light')
})

export function useTheme() {
  function toggle() { isDark.value = !isDark.value }
  return { isDark, toggle }
}
