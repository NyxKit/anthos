import type { Anthos } from './Anthos.js'
import { NyxResult } from 'nyx-kit/classes'

import type {
  AutomationListResponse,
  AutomationRecord,
  AutomationUpsertInput,
} from '../../automations.js'

type AnthosAutomationsError = string

export class AnthosAutomations {
  constructor(protected readonly anthos: Anthos) {
    void this.anthos
  }

  async list(): Promise<NyxResult<AutomationRecord[], AnthosAutomationsError>> {
    return this.request<AutomationListResponse>('/api/automations')
      .then(response => response.isFailure ? response.convert<AutomationRecord[]>() : NyxResult.success(response.value.automations))
  }

  async create(input: AutomationUpsertInput): Promise<NyxResult<AutomationRecord, AnthosAutomationsError>> {
    const response = await this.request<{ automation: AutomationRecord }>('/api/automations', {
      method: 'POST',
      body: input,
    })

    if (response.isFailure) return response.convert<AutomationRecord>()
    return NyxResult.success(response.value.automation)
  }

  async update(automationId: string, input: AutomationUpsertInput): Promise<NyxResult<AutomationRecord, AnthosAutomationsError>> {
    const response = await this.request<{ automation: AutomationRecord }>(`/api/automations/${automationId}`, {
      method: 'PATCH',
      body: input,
    })

    if (response.isFailure) return response.convert<AutomationRecord>()
    return NyxResult.success(response.value.automation)
  }

  async delete(automationId: string): Promise<NyxResult<void, AnthosAutomationsError>> {
    return this.request<void>(`/api/automations/${automationId}`, { method: 'DELETE' })
  }

  private async request<T>(path: string, options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown } = {}): Promise<NyxResult<T, AnthosAutomationsError>> {
    try {
      const response = await this.anthos.request<T>(path, options)
      return NyxResult.success<T, AnthosAutomationsError>(response)
    } catch (error) {
      return NyxResult.fail<T, AnthosAutomationsError>('request_failed', error instanceof Error ? error.message : 'Anthos request failed')
    }
  }
}
