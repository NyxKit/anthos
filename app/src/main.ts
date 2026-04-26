import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { NyxKit } from 'nyx-kit'
import { NyxTheme, NyxSize, NyxVariant } from 'nyx-kit/types'
import 'nyx-kit/style.css'
import './shared/assets'
import anthos from '@anthos/shared/anthos'
import router from './shared/router'
import App from './App.vue'
import { resolveApiBaseUrl } from './shared/utils/apiBaseUrl'

anthos.setup({
  apiBaseUrl: resolveApiBaseUrl(),
})

createApp(App)
  .use(createPinia())
  .use(router)
  .use(NyxKit, {
    defaults: {
      all: {
        theme: NyxTheme.Info,
        size: NyxSize.Medium,
        variant: NyxVariant.Soft,
      },
      badge: {
        theme: NyxTheme.Primary,
        size: NyxSize.Small,
        variant: NyxVariant.Soft
      }
    },
  })
  .mount('#app')
