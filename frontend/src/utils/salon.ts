import type { SalonListItem } from '../types'
import { fuzzyMatch } from './search'

export function getServicesArray(salon: SalonListItem): string[] {
  const services = salon.services

  if (!services) return []

  if (Array.isArray(services)) {
    return services.map((item) => String(item))
  }

  return String(services)
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function getMatchingServices(salon: SalonListItem, query: string) {
  if (!query.trim()) return []

  return getServicesArray(salon).filter((serviceName) =>
    fuzzyMatch(serviceName, query)
  )
}

export function formatSalonPrice(salon: SalonListItem) {
  if (salon.average_price !== null && salon.average_price !== undefined) {
    return `avg. ${salon.average_price} ${salon.currency ?? 'PLN'}`
  }

  if (salon.price_range) {
    return salon.price_range
  }

  return 'price not provided'
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  return fallback
}

export function getUniqueDistricts(salons: SalonListItem[]) {
  return Array.from(
    new Set(salons.map((salon) => salon.district).filter(Boolean))
  ).sort() as string[]
}