import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { NyxKit } from 'nyx-kit'
import { NyxTheme, NyxSize, NyxVariant } from 'nyx-kit/types'
import 'nyx-kit/style.css'
import './shared/assets'
import router from './shared/router'
import App from './App.vue'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(NyxKit, {
    defaults: {
      all: {
        theme: NyxTheme.Primary,
        size: NyxSize.Medium,
        variant: NyxVariant.Subtle,
      },
    },
  })
  .mount('#app')
