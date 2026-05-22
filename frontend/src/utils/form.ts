import type { SalonDetails, SalonUpdatePayload } from '../types'
import { getServicesArray } from './salon'

export type FormState = {
  name: string
  address: string
  district: string
  phone: string
  instagram: string
  facebook: string
  website: string
  services: string
  price_range: string
  price_min: string
  price_max: string
  currency: string
  average_price: string
  rating: string
  reviews_count: string
}

export const emptyForm: FormState = {
  name: '',
  address: '',
  district: '',
  phone: '',
  instagram: '',
  facebook: '',
  website: '',
  services: '',
  price_range: '',
  price_min: '',
  price_max: '',
  currency: '',
  average_price: '',
  rating: '',
  reviews_count: ''
}

export function toForm(salon: SalonDetails): FormState {
  return {
    name: salon.name ?? '',
    address: salon.address ?? '',
    district: salon.district ?? '',
    phone: salon.phone ?? '',
    instagram: salon.instagram ?? '',
    facebook: salon.facebook ?? '',
    website: salon.website ?? '',
    services: getServicesArray(salon).join(', '),
    price_range: salon.price_range ?? '',
    price_min: salon.price_min?.toString() ?? '',
    price_max: salon.price_max?.toString() ?? '',
    currency: salon.currency ?? '',
    average_price: salon.average_price?.toString() ?? '',
    rating: salon.rating?.toString() ?? '',
    reviews_count: salon.reviews_count?.toString() ?? ''
  }
}

function textOrNull(value: string) {
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function numberOrNull(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  const parsed = Number(trimmed)
  return Number.isNaN(parsed) ? null : parsed
}

function integerOrNull(value: string) {
  const parsed = numberOrNull(value)
  return parsed === null ? null : Math.round(parsed)
}

function servicesToArray(value: string) {
  const services = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return services.length ? services : null
}

export function toUpdatePayload(form: FormState): SalonUpdatePayload {
  return {
    name: textOrNull(form.name),
    address: textOrNull(form.address),
    district: textOrNull(form.district),
    phone: textOrNull(form.phone),
    instagram: textOrNull(form.instagram),
    facebook: textOrNull(form.facebook),
    website: textOrNull(form.website),
    services: servicesToArray(form.services),
    price_range: textOrNull(form.price_range),
    price_min: numberOrNull(form.price_min),
    price_max: numberOrNull(form.price_max),
    currency: textOrNull(form.currency),
    average_price: numberOrNull(form.average_price),
    rating: numberOrNull(form.rating),
    reviews_count: integerOrNull(form.reviews_count)
  }
}