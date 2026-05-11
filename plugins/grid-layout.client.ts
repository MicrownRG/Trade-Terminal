// plugins/grid-layout.client.ts
import GridLayout from 'grid-layout-plus'
import 'grid-layout-plus/dist/style.css'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(GridLayout)
})