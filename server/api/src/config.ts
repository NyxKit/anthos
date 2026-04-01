export interface ApiConfig {
  host: string
  port: number
}

export function loadApiConfig(): ApiConfig {
  return {
    host: process.env.HOST ?? '0.0.0.0',
    port: Number(process.env.ANTHOS_API_PORT ?? process.env.PORT ?? 8088),
  }
}
