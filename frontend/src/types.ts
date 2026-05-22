export type SortBy =
  | 'rating_desc'
  | 'reviews_desc'
  | 'price_asc'
  | 'price_desc'

export type SalonListItem = {
  id: string
  name: string
  district: string | null
  rating: number | null
  reviews_count: number | null
  price_range: string | null
  price_min: number | null
  price_max: number | null
  average_price: number | null
  currency: string | null
  services?: string[] | string | null
}

export type SalonDetails = SalonListItem & {
  address: string | null
  phone: string | null
  instagram: string | null
  facebook: string | null
  website: string | null
  source_url: string | null
}

export type SalonUpdatePayload = Partial<{
  name: string | null
  address: string | null
  district: string | null
  phone: string | null
  instagram: string | null
  facebook: string | null
  website: string | null
  services: string[] | null
  price_range: string | null
  price_min: number | null
  price_max: number | null
  currency: string | null
  average_price: number | null
  rating: number | null
  reviews_count: number | null
}>