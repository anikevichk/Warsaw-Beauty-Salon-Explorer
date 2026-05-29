import type { SalonDetails, SalonListItem, SalonUpdatePayload } from '../types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function buildUrl(path: string, params?: Record<string, string | number | null | undefined>) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  return url.toString()
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Request failed: ${response.status} ${text}`)
  }

  return response.json()
}

export function getSalons(params: {
  search?: string
  district?: string
  service?: string
  limit?: number
  offset?: number
}) {
  return request<SalonListItem[]>(
    buildUrl('/api/salons', {
      search: params.search,
      district: params.district,
      service: params.service,
      limit: params.limit ?? 300,
      offset: params.offset ?? 0
    })
  )
}

export function getSalonById(id: string) {
  return request<SalonDetails>(buildUrl(`/api/salons/${id}`))
}

export function updateSalon(id: string, payload: SalonUpdatePayload) {
  return request<SalonDetails>(buildUrl(`/api/salons/${id}`), {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}