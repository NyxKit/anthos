export function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim()
  if (configured) return configured

  if (typeof window !== 'undefined') {
    const { protocol, origin } = window.location
    if (protocol === 'http:' || protocol === 'https:') {
      return origin
    }
  }

  return 'http://localhost:8088'
}
