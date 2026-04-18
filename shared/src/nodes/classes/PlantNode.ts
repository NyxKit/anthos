import { NyxLoader } from 'nyx-kit/classes'
import { NodeCapability, NodeClaimStatus } from '../types/plantNode.js'
import { POWER_PROFILES } from '../data/powerProfiles.js'
import { PowerProfile } from '../types/powerProfile.js'
import PowerProfilePreset from './PowerProfilePreset.js'
import MoistureCalibration from './MoistureCalibration.js'
import type { LogicalNodeRecord } from '../types/plantNode.js'

export default class PlantNode implements LogicalNodeRecord {
  private _capability: NodeCapability = NodeCapability.Earth
  id: string = ''
  hwId: string = ''
  displayName: string | null = null
  claimStatus: NodeClaimStatus = NodeClaimStatus.Unclaimed
  powerProfile: PowerProfile = PowerProfile.Performance
  order: number | null = null
  registeredAt: number = 0
  calibration = {
    moisture: new MoistureCalibration(this._capability),
  }

  constructor(data?: unknown) {
    if (!data) throw new Error('Node data is required')

    this.id = NyxLoader.loadString(data, ['id', 'nodeId'])
    this.hwId = NyxLoader.loadString(data, 'hwId')
    this.displayName = NyxLoader.loadStringOrNull(data, 'displayName', this.displayName)
    this.claimStatus = NyxLoader.loadEnum<NodeClaimStatus>(data, 'claimStatus', this.claimStatus, Object.values(NodeClaimStatus))
    this.capability = NyxLoader.loadEnum<NodeCapability>(data, 'capability', this._capability, Object.values(NodeCapability))
    this.order = this.loadNullableNumber(data, 'order')
    this.registeredAt = NyxLoader.loadNumber(data, 'registeredAt', this.registeredAt)
    this.powerProfile = NyxLoader.loadEnum<PowerProfile>(data, 'powerProfile', this.powerProfile, Object.values(PowerProfile))
  }

  get nodeId (): string {
    return this.id
  }

  set nodeId (value: string) {
    this.id = value
  }

  get name (): string {
    return this.displayName?.trim() || this.id
  }

  get powerProfilePreset (): PowerProfilePreset {
    const preset = POWER_PROFILES[this.powerProfile]
    if (!preset) throw new Error(`Unknown power profile: ${this.powerProfile}`)
    return preset
  }

  get capability (): NodeCapability {
    return this._capability
  }

  set capability (capability: NodeCapability) {
    this._capability = capability
    this.calibration.moisture = new MoistureCalibration(capability)
  }

  private loadNullableNumber(data: unknown, key: string): number | null {
    if (!data || typeof data !== 'object') return null
    const value = (data as Record<string, unknown>)[key]
    if (value == null || value === '') return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
}
