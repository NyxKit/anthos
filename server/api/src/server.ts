import { Bonjour } from 'bonjour-service'

import { createApp } from './app.js'
import { loadApiConfig } from './config.js'
import { LogArchiveService } from './services/LogArchiveService.js'
import { TelemetryService } from './services/TelemetryService.js'

const config = loadApiConfig()
const telemetry = new TelemetryService()
const logArchive = new LogArchiveService()
const mdnsEnabled = process.env.ANTHOS_ENABLE_MDNS?.toLowerCase() !== 'false'
const bonjour = mdnsEnabled ? new Bonjour() : null

await telemetry.init()
await logArchive.init()

const app = createApp(telemetry, logArchive)

app.listen(config.port, config.host, () => {
  console.log(`Anthos API listening on http://${config.host}:${config.port}`)
  if (bonjour) {
    bonjour.publish({ name: 'anthos', type: 'http', port: config.port })
    console.log(`[mDNS] Advertising anthos.local on port ${config.port}`)
  }
})

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down Anthos API`)

  if (bonjour) {
    bonjour.unpublishAll()
    bonjour.destroy()
  }

  await logArchive.close()
  await telemetry.close()
  process.exit(0)
}

process.on('SIGINT', () => { void shutdown('SIGINT') })
process.on('SIGTERM', () => { void shutdown('SIGTERM') })
