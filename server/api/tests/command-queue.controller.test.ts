import { describe, expect, it, vi } from 'vitest'

import { CommandController } from '../src/controllers/CommandController.js'

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('CommandController', () => {
  it('validates pump commands before queueing', async () => {
    const commands = {
      enqueuePumpCommand: vi.fn(),
      getPendingCommands: vi.fn(),
      acknowledgeCommand: vi.fn(),
    }
    const registry = {
      getLogicalNode: vi.fn().mockReturnValue({ capability: 'watering' }),
    }
    const logArchive = {
      recordEntry: vi.fn().mockResolvedValue(undefined),
    }
    const auth = {
      requireActionUser: vi.fn().mockResolvedValue({}),
    }
    const controller = new CommandController(commands as never, registry as never, logArchive as never, auth as never, vi.fn().mockResolvedValue(undefined) as never)
    const res = createRes()

    await controller.enqueuePump({ params: { nodeId: 'node-001' }, body: { volumeMl: 0 }, headers: { authorization: 'Bearer token' } } as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(commands.enqueuePumpCommand).not.toHaveBeenCalled()
    expect(logArchive.recordEntry).toHaveBeenCalled()
  })

  it('lists pending commands and acknowledges results', async () => {
    const commands = {
      enqueuePumpCommand: vi.fn(),
      getPendingCommands: vi.fn().mockReturnValue({ nodeId: 'node-001', capability: 'watering', commands: [] }),
      acknowledgeCommand: vi.fn().mockResolvedValue({ status: 'completed' }),
    }
    const registry = {
      getLogicalNode: vi.fn().mockReturnValue({ capability: 'watering' }),
    }
    const logArchive = {
      recordEntry: vi.fn().mockResolvedValue(undefined),
    }
    const auth = {
      requireActionUser: vi.fn().mockResolvedValue({}),
    }
    const controller = new CommandController(commands as never, registry as never, logArchive as never, auth as never, vi.fn().mockResolvedValue(undefined) as never)

    const listRes = createRes()
    await controller.listPending({ params: { nodeId: 'node-001' } } as never, listRes as never)

    expect(listRes.json).toHaveBeenCalledWith({ nodeId: 'node-001', commands: [], capability: 'watering' })

    const ackRes = createRes()
    await controller.acknowledge(
      { params: { nodeId: 'node-001', commandId: 'cmd-123' }, body: { result: 'completed' } } as never,
      ackRes as never
    )

    expect(commands.acknowledgeCommand).toHaveBeenCalledWith('node-001', 'cmd-123', {
      result: 'completed',
      message: undefined,
    })
    expect(ackRes.json).toHaveBeenCalledWith({ nodeId: 'node-001', commandId: 'cmd-123', status: 'completed' })
  })

  it('rejects pump commands for earth-only nodes', async () => {
    const commands = {
      enqueuePumpCommand: vi.fn(),
      getPendingCommands: vi.fn(),
      acknowledgeCommand: vi.fn(),
    }
    const registry = {
      getLogicalNode: vi.fn().mockReturnValue({ capability: 'earth' }),
    }
    const logArchive = {
      recordEntry: vi.fn().mockResolvedValue(undefined),
    }
    const auth = {
      requireActionUser: vi.fn().mockResolvedValue({}),
    }
    const controller = new CommandController(commands as never, registry as never, logArchive as never, auth as never, vi.fn().mockResolvedValue(undefined) as never)
    const res = createRes()

    await controller.enqueuePump({ params: { nodeId: 'node-001' }, body: { volumeMl: 100 }, headers: { authorization: 'Bearer token' } } as never, res as never)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(commands.enqueuePumpCommand).not.toHaveBeenCalled()
    expect(logArchive.recordEntry).toHaveBeenCalled()
  })
})
