import initSqlJs, { Database } from 'sql.js'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

import type { NodeTelemetryPayload, TelemetryPayload } from '@anthos/shared/nodes/types'

const DB_PATH = path.resolve(process.cwd(), '../db/anthos.db')
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

    this.db.run('PRAGMA foreign_keys = ON')

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

    this.db.run(`
      CREATE TABLE IF NOT EXISTS telemetry_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        payload_json TEXT NOT NULL
      )
    `)

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_telemetry_snapshots_node_time
      ON telemetry_snapshots(node_id, timestamp)
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS hardware_nodes (
        hw_id            TEXT    PRIMARY KEY,
        first_seen       INTEGER NOT NULL,
        last_seen        INTEGER NOT NULL,
        firmware_version TEXT
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS logical_nodes (
        node_id       TEXT    PRIMARY KEY,
        hw_id         TEXT    NOT NULL REFERENCES hardware_nodes(hw_id),
        display_name  TEXT,
        node_order    INTEGER,
        capability    TEXT    NOT NULL DEFAULT 'earth',
        registered_at INTEGER NOT NULL,
        power_profile_id TEXT,
        power_profile_read_interval_ms INTEGER,
        power_profile_telemetry_interval_ms INTEGER,
        power_profile_queue_interval_ms INTEGER,
        power_profile_assigned_at INTEGER,
        power_profile_applied_id TEXT,
        power_profile_applied_read_interval_ms INTEGER,
        power_profile_applied_telemetry_interval_ms INTEGER,
        power_profile_applied_queue_interval_ms INTEGER,
        power_profile_applied_at INTEGER
      )
    `)

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_logical_nodes_hw_id
      ON logical_nodes(hw_id)
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL COLLATE NOCASE UNIQUE,
        display_name TEXT NOT NULL,
        email TEXT NOT NULL COLLATE NOCASE UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
        created_at INTEGER NOT NULL
      )
    `)

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `)

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `)

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
    `)

    const logicalNodeColumns = this.db.exec("PRAGMA table_info(logical_nodes)")
    const hasCapabilityColumn = logicalNodeColumns.length > 0
      && logicalNodeColumns[0].values.some((row: unknown[]) => row[1] === 'capability')
    if (!hasCapabilityColumn) {
      this.db.run("ALTER TABLE logical_nodes ADD COLUMN capability TEXT NOT NULL DEFAULT 'earth'")
    }

    const hasOrderColumn = logicalNodeColumns.length > 0
      && logicalNodeColumns[0].values.some((row: unknown[]) => row[1] === 'node_order')
    if (!hasOrderColumn) {
      this.db.run('ALTER TABLE logical_nodes ADD COLUMN node_order INTEGER')
    }

    const profileColumns = [
      ['power_profile_id', 'TEXT'],
      ['power_profile_read_interval_ms', 'INTEGER'],
      ['power_profile_telemetry_interval_ms', 'INTEGER'],
      ['power_profile_queue_interval_ms', 'INTEGER'],
      ['power_profile_assigned_at', 'INTEGER'],
      ['power_profile_applied_id', 'TEXT'],
      ['power_profile_applied_read_interval_ms', 'INTEGER'],
      ['power_profile_applied_telemetry_interval_ms', 'INTEGER'],
      ['power_profile_applied_queue_interval_ms', 'INTEGER'],
      ['power_profile_applied_at', 'INTEGER'],
    ] as const

    for (const [column, type] of profileColumns) {
      const hasColumn = logicalNodeColumns.length > 0
        && logicalNodeColumns[0].values.some((row: unknown[]) => row[1] === column)
      if (!hasColumn) {
        this.db.run(`ALTER TABLE logical_nodes ADD COLUMN ${column} ${type}`)
      }
    }

    this.db.run(`
      CREATE TABLE IF NOT EXISTS commands (
        command_id TEXT PRIMARY KEY,
        node_id TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        acknowledged_at INTEGER,
        result_message TEXT
      )
    `)

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_commands_node_status_created
      ON commands(node_id, status, created_at)
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS automations (
        automation_id TEXT PRIMARY KEY,
        node_id TEXT NOT NULL REFERENCES logical_nodes(node_id) ON DELETE CASCADE,
        sensor_type TEXT NOT NULL,
        operator TEXT NOT NULL CHECK (operator IN ('<', '>', '==')),
        threshold_value REAL NOT NULL,
        command_type TEXT NOT NULL,
        command_json TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        last_triggered_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_automations_node_sensor_enabled
      ON automations(node_id, sensor_type, enabled, updated_at)
    `)

    console.log('telemetry.db.init', DB_PATH)
  }

  async ingest(payload: NodeTelemetryPayload): Promise<void> {
    const timestamp = Date.now()
    payload.timestampMs = timestamp
    this.latestPayload = payload

    if (this.db) {
      this.db.run(
        'INSERT INTO telemetry_snapshots (node_id, timestamp, payload_json) VALUES (?, ?, ?)',
        [payload.nodeId, timestamp, JSON.stringify(payload)]
      )
    }

    for (const sensor of payload.sensors) {
      this.pendingReadings.push({
        nodeId: payload.nodeId,
        timestamp,
        sensorType: sensor.type,
        value: sensor.value,
        unit: sensor.unit ?? '',
      })
    }

    if (timestamp - this.lastStoredAt >= STORE_INTERVAL_MS) {
      await this.storePendingReadings()
      this.lastStoredAt = timestamp
    }

    console.log('telemetry.ingest', { 
      nodeId: payload.nodeId, 
      sensors: payload.sensors.length,
      readings: payload.sensors.map(s => `${s.type}=${s.value}${s.unit}`).join(', ')
    })
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

  getDb(): Database {
    if (!this.db) throw new Error('DB not initialized')
    return this.db
  }

  async saveDbPublic(): Promise<void> {
    await this.saveDb()
  }

  getLatest(): TelemetryPayload | null {
    return this.latestPayload
  }

  getLatestByNode(): NodeTelemetryPayload[] {
    if (!this.db) return []

    const stmt = this.db.prepare(`
      SELECT snapshot.payload_json AS payload_json
      FROM telemetry_snapshots snapshot
      INNER JOIN (
        SELECT node_id, MAX(id) AS id
        FROM telemetry_snapshots
        GROUP BY node_id
      ) latest
      ON latest.node_id = snapshot.node_id
      AND latest.id = snapshot.id
      ORDER BY snapshot.timestamp DESC
    `)

    const payloads: NodeTelemetryPayload[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, unknown>
      const payloadJson = row['payload_json']
      if (typeof payloadJson === 'string') {
        payloads.push(JSON.parse(payloadJson) as NodeTelemetryPayload)
      }
    }

    stmt.free()
    return payloads
  }

  getAverageHumidity(windowMs = 15 * 60 * 1000): number | null {
    if (!this.db) return null

    const cutoff = Date.now() - windowMs
    const stmt = this.db.prepare(
      "SELECT AVG(value) AS avg_value FROM readings WHERE sensor_type='humidity' AND timestamp >= ?"
    )
    stmt.bind([cutoff])
    stmt.step()
    const row = stmt.getAsObject() as Record<string, unknown>
    stmt.free()

    const value = row['avg_value']
    return value == null ? null : Number(value)
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
