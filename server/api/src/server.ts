import { createApp } from './app.js'
import { loadApiConfig } from './config.js'
import { TelemetryService } from './services/TelemetryService.js'

const config = loadApiConfig()
const telemetry = new TelemetryService()

await telemetry.init()

const app = createApp(telemetry)

app.listen(config.port, config.host, () => {
  console.log(`Anthos API listening on http://${config.host}:${config.port}`)
})

process.on('SIGINT', async () => {
  await telemetry.close()
  process.exit(0)
})
