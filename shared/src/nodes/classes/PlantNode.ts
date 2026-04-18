import { NyxLoader } from 'nyx-kit/classes'
import { NodeCapability, NodeClaimStatus, type LogicalNodeRecord } from '../types/index.js'

export default class PlantNode implements LogicalNodeRecord {
  nodeId: string
  hwId: string
  displayName: string | null = null
  claimStatus: NodeClaimStatus = NodeClaimStatus.Unclaimed
  capability: NodeCapability = NodeCapability.Earth
  registeredAt: number = 0

  constructor(data?: unknown) {
    if (!data) throw new Error('Node data is required')

    this.nodeId = NyxLoader.loadString(data, 'nodeId')
    this.hwId = NyxLoader.loadString(data, 'hwId')
    this.displayName = NyxLoader.loadStringOrNull(data, 'displayName', this.displayName)
    this.claimStatus = NyxLoader.loadEnum<NodeClaimStatus>(data, 'claimStatus', this.claimStatus, Object.values(NodeClaimStatus))
    this.capability = NyxLoader.loadEnum<NodeCapability>(data, 'capability', this.capability, Object.values(NodeCapability))
    this.registeredAt = NyxLoader.loadNumber(data, 'registeredAt', this.registeredAt)
  }
}
