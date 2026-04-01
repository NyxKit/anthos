import initSqlJs, { Database } from 'sql.js'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

import type { TelemetryPayload } from '../../../shared/src/telemetry.js'

const DB_PATH = path.resolve(process.cwd(), 'logs/anthos.db')
const STORE_INTERVAL_MS = 60000

interface Reading {
  nodeId: string
  timestamp: number
  sensorType: string
  value: number
  unit: string
}

export class TelemetryService {
  private db: Database | null = null
  private latestPayload: TelemetryPayload | null = null
  private lastStoredAt = 0
  private pendingReadings: Reading[] = []

  async init(): Promise<void> {
    const SQL = await initSqlJs()

    try {
      const data = await readFile(DB_PATH)
      this.db = new SQL.Database(data)
    } catch {
      this.db = new SQL.Database()
    }

    this.db.run(`
      CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        sensor_type TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT NOT NULL
      )
    `)

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_readings_node_time
      ON readings(node_id, timestamp)
    `)

    console.log('telemetry.db.init', DB_PATH)
  }

  async ingest(payload: TelemetryPayload): Promise<void> {
    this.latestPayload = payload

    const timestamp = Date.now()
    for (const sensor of payload.sensors) {
      this.pendingReadings.push({
        nodeId: payload.nodeId,
        timestamp,
        sensorType: sensor.type,
        value: sensor.value,
        unit: sensor.unit,
      })
    }

    if (timestamp - this.lastStoredAt >= STORE_INTERVAL_MS) {
      await this.storePendingReadings()
      this.lastStoredAt = timestamp
    }

    console.log('telemetry.ingest', { nodeId: payload.nodeId, sensors: payload.sensors.length })
  }

  private async storePendingReadings(): Promise<void> {
    if (!this.db || this.pendingReadings.length === 0) return

    const stmt = this.db.prepare(
      'INSERT INTO readings (node_id, timestamp, sensor_type, value, unit) VALUES (?, ?, ?, ?, ?)'
    )

    for (const reading of this.pendingReadings) {
      stmt.run([reading.nodeId, reading.timestamp, reading.sensorType, reading.value, reading.unit])
    }

    stmt.free()
    await this.saveDb()

    console.log('telemetry.store', { count: this.pendingReadings.length })
    this.pendingReadings = []
  }

  private async saveDb(): Promise<void> {
    if (!this.db) return

    const data = this.db.export()
    const buffer = Buffer.from(data)

    const logsDir = path.dirname(DB_PATH)
    await mkdir(logsDir, { recursive: true })
    await writeFile(DB_PATH, buffer)
  }

  getLatest(): TelemetryPayload | null {
    return this.latestPayload
  }

  async close(): Promise<void> {
    if (this.pendingReadings.length > 0) {
      await this.storePendingReadings()
    }
    if (this.db) {
      await this.saveDb()
      this.db.close()
    }
  }
}