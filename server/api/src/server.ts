import { createApp } from './app.js'
import { loadApiConfig } from './config.js'

const config = loadApiConfig()
const app = createApp()

app.listen(config.port, config.host, () => {
  console.log(`Anthos API listening on http://${config.host}:${config.port}`)
})
