import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import PrimeVue from 'primevue/config'
import Aura    from '@primeuix/themes/aura'
import Column  from 'primevue/column'
import Tag     from 'primevue/tag'
import FloatLabel from 'primevue/floatlabel'
import App from './App.vue'
import router from './router'
import 'material-symbols/outlined.css'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(VueApexCharts)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: { darkModeSelector: '[data-theme="dark"]' },
  },
})
app.component('Column', Column)
app.component('Tag', Tag)
app.component('FloatLabel', FloatLabel)
app.mount('#app')
