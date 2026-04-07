import { Bonjour } from 'bonjour-service'

import { createApp } from './app.js'
import { loadApiConfig } from './config.js'
import { TelemetryService } from './services/TelemetryService.js'

const config = loadApiConfig()
const telemetry = new TelemetryService()

await telemetry.init()

const app = createApp(telemetry)

const bonjour = new Bonjour()

app.listen(config.port, config.host, () => {
  console.log(`Anthos API listening on http://${config.host}:${config.port}`)
  bonjour.publish({ name: 'anthos', type: 'http', port: config.port })
  console.log(`[mDNS] Advertising anthos.local on port ${config.port}`)
})

process.on('SIGINT', async () => {
  bonjour.unpublishAll()
  bonjour.destroy()
  await telemetry.close()
  process.exit(0)
})
