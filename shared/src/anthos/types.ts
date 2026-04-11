export interface AnthosSetupArgs {
  apiBaseUrl?: string
  headers?: Record<string, string>
  token?: string
}

export interface AnthosResolvedSetup {
  apiBaseUrl: string
  headers: Record<string, string>
}
