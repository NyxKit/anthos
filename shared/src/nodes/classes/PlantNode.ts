import { NyxLoader } from 'nyx-kit/classes'
import { NodeCapability, NodeClaimStatus } from '../types/plantNode.js'
import { POWER_PROFILES } from '../data/powerProfiles.js'
import { PowerPreset } from '../types/powerProfile.js'
import PowerProfile from './PowerProfile.js'
import MoistureCalibration from './MoistureCalibration.js'

export default class PlantNode {
  private _capability: NodeCapability = NodeCapability.Earth
  nodeId: string = ''
  hwId: string = ''
  displayName: string | null = null
  claimStatus: NodeClaimStatus = NodeClaimStatus.Unclaimed
  powerPreset: PowerPreset = PowerPreset.Performance
  registeredAt: number = 0
  calibration = {
    moisture: new MoistureCalibration(this._capability),
  }

  constructor(data?: unknown) {
    if (!data) throw new Error('Node data is required')

    this.nodeId = NyxLoader.loadString(data, 'nodeId')
    this.hwId = NyxLoader.loadString(data, 'hwId')
    this.displayName = NyxLoader.loadStringOrNull(data, 'displayName', this.displayName)
    this.claimStatus = NyxLoader.loadEnum<NodeClaimStatus>(data, 'claimStatus', this.claimStatus, Object.values(NodeClaimStatus))
    this.capability = NyxLoader.loadEnum<NodeCapability>(data, 'capability', this._capability, Object.values(NodeCapability))
    this.registeredAt = NyxLoader.loadNumber(data, 'registeredAt', this.registeredAt)
    this.powerPreset = NyxLoader.loadEnum<PowerPreset>(data, 'powerPreset', this.powerPreset, Object.values(PowerPreset))
  }

  get powerProfile (): PowerProfile {
    const profile = POWER_PROFILES[this.powerPreset]
    if (!profile) throw new Error(`Unknown power profile: ${this.powerPreset}`)
    return profile
  }

  get capability (): NodeCapability {
    return this._capability
  }

  set capability (capability: NodeCapability) {
    this._capability = capability
    this.calibration.moisture = new MoistureCalibration(capability)
  }
}
