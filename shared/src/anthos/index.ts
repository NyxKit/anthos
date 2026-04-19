import { Anthos } from './classes/Anthos.js'

const anthos = new Anthos()

export default anthos
export { Anthos }
export { AnthosAlerts } from './classes/AnthosAlerts.js'
export { AnthosLogs } from './classes/AnthosLogs.js'
export { AnthosMetrics } from './classes/AnthosMetrics.js'
export { AnthosNodes } from './classes/AnthosNodes.js'
export { AnthosRooms } from './classes/AnthosRooms.js'
export { AnthosUsers } from './classes/AnthosUsers.js'
export * from './types/index.js'
export type { AnthosResolvedSetup, AnthosSetupArgs } from './types.js'
