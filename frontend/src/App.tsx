import { useEffect, useMemo, useState } from 'react'
import { getSalonById, getSalons, updateSalon } from './api/salons'
import type { SalonDetails, SalonListItem, SalonUpdatePayload } from './types'

type SortBy =
  | 'rating_desc'
  | 'reviews_desc'
  | 'price_asc'
  | 'price_desc'

type FormState = {
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

const emptyForm: FormState = {
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

function normalizeText(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  )

  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }

  return dp[a.length][b.length]
}

function fuzzyMatch(text: string | null | undefined, query: string) {
  const normalizedText = normalizeText(text)
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) return true
  if (normalizedText.includes(normalizedQuery)) return true

  const words = normalizedText.split(/\s+/)

  return words.some((word) => {
    if (word.includes(normalizedQuery)) return true
    if (normalizedQuery.length < 4) return false

    return levenshtein(word, normalizedQuery) <= 2
  })
}

function getMatchingServices(salon: SalonListItem, query: string) {
  if (!query.trim()) return []

  return (salon.services ?? []).filter((serviceName) =>
    fuzzyMatch(serviceName, query)
  )
}

function formatSalonPrice(salon: SalonListItem) {
  if (salon.average_price !== null && salon.average_price !== undefined) {
    return `avg. ${salon.average_price} ${salon.currency ?? 'PLN'}`
  }

  if (salon.price_range) {
    return salon.price_range
  }

  return 'price not provided'
}

function cleanAddressForMap(address: string) {
  return address
    .replace(/\/[a-zA-Z0-9]+/g, '')
    .replace(/\blok\.?\s*[a-zA-Z0-9]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getMapUrl(address: string) {
  const cleanAddress = cleanAddressForMap(address)
  return `https://maps.google.com/maps?q=${encodeURIComponent(cleanAddress)}&z=15&output=embed`
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  return fallback
}

function toForm(salon: SalonDetails): FormState {
  return {
    name: salon.name ?? '',
    address: salon.address ?? '',
    district: salon.district ?? '',
    phone: salon.phone ?? '',
    instagram: salon.instagram ?? '',
    facebook: salon.facebook ?? '',
    website: salon.website ?? '',
    services: salon.services?.join(', ') ?? '',
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

export default function App() {
  const [salons, setSalons] = useState<SalonListItem[]>([])
  const [selectedSalon, setSelectedSalon] = useState<SalonDetails | null>(null)

  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('')
  const [service, setService] = useState('')
  const [districts, setDistricts] = useState<string[]>([])

  const [sortBy, setSortBy] = useState<SortBy>('rating_desc')

  const [loading, setLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  async function loadSalons() {
    try {
      setLoading(true)
      setError(null)

      const data = await getSalons({
        district,
        limit: 100,
        offset: 0
      })

      setSalons(data)
      setSelectedSalon(null)
      setIsEditing(false)
    } catch (error) {
      console.error(error)
      setError(getErrorMessage(error, 'Could not load salons.'))
    } finally {
      setLoading(false)
    }
  }

  async function loadDistricts() {
    try {
      const data = await getSalons({
        limit: 100,
        offset: 0
      })

      const uniqueDistricts = Array.from(
        new Set(data.map((salon) => salon.district).filter(Boolean))
      ).sort() as string[]

      setDistricts(uniqueDistricts)
    } catch (error) {
      console.error(error)
      setError(getErrorMessage(error, 'Could not load districts.'))
    }
  }

  async function openSalon(id: string) {
    try {
      setDetailsLoading(true)
      setError(null)
      setIsEditing(false)

      const data = await getSalonById(id)
      setSelectedSalon(data)
      setForm(toForm(data))
    } catch (error) {
      console.error(error)
      setError(getErrorMessage(error, 'Could not load salon details.'))
    } finally {
      setDetailsLoading(false)
    }
  }

  async function saveSalon() {
    if (!selectedSalon) return

    const payload: SalonUpdatePayload = {
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

    try {
      setSaving(true)
      setError(null)

      const updated = await updateSalon(selectedSalon.id, payload)

      setSelectedSalon(updated)
      setForm(toForm(updated))
      setIsEditing(false)

      setSalons((current) =>
        current.map((item) =>
          item.id === updated.id
            ? {
                ...item,
                name: updated.name,
                district: updated.district,
                rating: updated.rating,
                reviews_count: updated.reviews_count,
                price_range: updated.price_range,
                price_min: updated.price_min,
                price_max: updated.price_max,
                average_price: updated.average_price,
                currency: updated.currency,
                services: updated.services
              }
            : item
        )
      )

      loadDistricts()
    } catch (error) {
      console.error(error)
      setError(getErrorMessage(error, 'Could not save changes.'))
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadDistricts()
    loadSalons()
  }, [])

  const filteredSalons = useMemo(() => {
    return salons.filter((salon) => {
      const matchesName = fuzzyMatch(salon.name, search)
      const matchesService = service.trim()
        ? getMatchingServices(salon, service).length > 0
        : true

      return matchesName && matchesService
    })
  }, [salons, search, service])

  const sortedSalons = useMemo(() => {
    const copy = [...filteredSalons]

    if (sortBy === 'rating_desc') {
      return copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
    }

    if (sortBy === 'reviews_desc') {
      return copy.sort((a, b) => (b.reviews_count ?? -1) - (a.reviews_count ?? -1))
    }

    if (sortBy === 'price_asc') {
      return copy.sort((a, b) => {
        if (a.average_price === null) return 1
        if (b.average_price === null) return -1

        return a.average_price - b.average_price
      })
    }

    if (sortBy === 'price_desc') {
      return copy.sort((a, b) => {
        if (a.average_price === null) return 1
        if (b.average_price === null) return -1

        return b.average_price - a.average_price
      })
    }

    return copy
  }, [filteredSalons, sortBy])

  return (
    <main className="app">
      <section className="hero">
        <div>
          <h1>Beauty Salon Explorer</h1>
        </div>

        <div className="hero-card">
          <span className="hero-number">{sortedSalons.length}</span>
          <span className="hero-label">matching salons</span>
        </div>
      </section>

      <section className="filters">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by salon name"
        />

        <select value={district} onChange={(event) => setDistrict(event.target.value)}>
          <option value="">All districts</option>
          {districts.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          value={service}
          onChange={(event) => setService(event.target.value)}
          placeholder="Filter by service, e.g. peeling"
        />

        <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)}>
          <option value="rating_desc">Highest rating</option>
          <option value="reviews_desc">Most reviews</option>
          <option value="price_asc">Lowest average price</option>
          <option value="price_desc">Highest average price</option>
        </select>

        <button onClick={loadSalons} disabled={loading}>
          {loading ? 'Loading...' : 'Apply'}
        </button>
      </section>

      {error && <div className="error">{error}</div>}

      <section className="layout">
        <div className="salon-list">
          {loading && <p className="muted">Loading salons...</p>}

          {!loading && sortedSalons.length === 0 && (
            <p className="muted">No salons found.</p>
          )}

          {sortedSalons.map((salon) => {
            const matchingServices = getMatchingServices(salon, service)

            return (
              <button
                key={salon.id}
                className={`salon-card ${selectedSalon?.id === salon.id ? 'active' : ''}`}
                onClick={() => openSalon(salon.id)}
              >
                <div className="card-top">
                  <h2>{salon.name}</h2>
                  <span>{salon.rating ? `★ ${salon.rating}` : 'No rating'}</span>
                </div>

                <p>{salon.district || 'Unknown district'}</p>

                <div className="card-meta">
                  <span>{formatSalonPrice(salon)}</span>
                  <span>{salon.reviews_count ?? 0} reviews</span>
                </div>

                {service.trim() && matchingServices.length > 0 && (
                  <div className="matched-services">
                    <p>Matching services</p>

                    {matchingServices.slice(0, 4).map((item) => (
                      <div className="matched-service" key={item}>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <aside className="details">
          {!selectedSalon && !detailsLoading && (
            <div className="placeholder">
              <h2>Select a salon</h2>
              <p>Click any salon to see full details.</p>
            </div>
          )}

          {detailsLoading && <p className="muted">Loading details...</p>}

          {selectedSalon && !detailsLoading && (
            <>
              <div className="details-header">
                <div className="details-title">
                  <p className="eyebrow">Salon details</p>
                  <h2>{selectedSalon.name}</h2>
                </div>

                <div className="details-side">
                  <div className="details-stats">
                    <div className="stat-card">
                      <span>Rating</span>
                      <b>{selectedSalon.rating ? `★ ${selectedSalon.rating}` : 'No rating'}</b>
                    </div>

                    <div className="stat-card">
                      <span>Reviews</span>
                      <b>{selectedSalon.reviews_count ?? 0}</b>
                    </div>
                  </div>

                  <button className="secondary" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </div>

              {!isEditing ? (
                <div className="info-grid">
                  <div className="info-block wide">
                    <span>Services</span>
                    <div className="chips">
                      {selectedSalon.services?.length ? (
                        selectedSalon.services.map((item) => <b key={item}>{item}</b>)
                      ) : (
                        <p>No services listed</p>
                      )}
                    </div>
                  </div>

                  {selectedSalon.address && (
                    <div className="map-block wide">
                      <span>Map</span>
                      <iframe
                        title={`Map for ${selectedSalon.name}`}
                        src={getMapUrl(selectedSalon.address)}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}

                  <Info label="Address" value={selectedSalon.address} wide />

                  {selectedSalon.phone?.trim() ? (
                    <>
                      <Info label="Phone" value={selectedSalon.phone} />
                      <SocialLinks salon={selectedSalon} />
                    </>
                  ) : (
                    <SocialLinks salon={selectedSalon} wide />
                  )}

                  <Info label="Price range" value={selectedSalon.price_range} />
                  <Info
                    label="Average price"
                    value={
                      selectedSalon.average_price
                        ? `${selectedSalon.average_price} ${selectedSalon.currency ?? ''}`
                        : null
                    }
                  />

                
                </div>
              ) : (
                <form
                  className="edit-form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    saveSalon()
                  }}
                >
                  <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
                  <Field label="Address" value={form.address} onChange={(value) => setForm({ ...form, address: value })} />
                  <Field label="District" value={form.district} onChange={(value) => setForm({ ...form, district: value })} />
                  <Field label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
                  <Field label="Website" value={form.website} onChange={(value) => setForm({ ...form, website: value })} />
                  <Field label="Instagram" value={form.instagram} onChange={(value) => setForm({ ...form, instagram: value })} />
                  <Field label="Facebook" value={form.facebook} onChange={(value) => setForm({ ...form, facebook: value })} />
                  <Field label="Services, comma separated" value={form.services} onChange={(value) => setForm({ ...form, services: value })} wide />
                  <Field label="Price range" value={form.price_range} onChange={(value) => setForm({ ...form, price_range: value })} />
                  <Field label="Min price" value={form.price_min} onChange={(value) => setForm({ ...form, price_min: value })} />
                  <Field label="Max price" value={form.price_max} onChange={(value) => setForm({ ...form, price_max: value })} />
                  <Field label="Currency" value={form.currency} onChange={(value) => setForm({ ...form, currency: value })} />
                  <Field label="Average price" value={form.average_price} onChange={(value) => setForm({ ...form, average_price: value })} />
                  <Field label="Rating" value={form.rating} onChange={(value) => setForm({ ...form, rating: value })} />
                  <Field label="Reviews count" value={form.reviews_count} onChange={(value) => setForm({ ...form, reviews_count: value })} />

                  <button className="save" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </form>
              )}
            </>
          )}
        </aside>
      </section>
    </main>
  )
}

function Info({
  label,
  value,
  isLink = false,
  wide = false
}: {
  label: string
  value: string | null | undefined
  isLink?: boolean
  wide?: boolean
}) {
  return (
    <div className={`info-block ${wide ? 'wide' : ''}`}>
      <span>{label}</span>
      {value ? (
        isLink ? (
          <a href={value} target="_blank" rel="noreferrer">
            {value}
          </a>
        ) : (
          <p>{value}</p>
        )
      ) : (
        <p className="muted">Not provided</p>
      )}
    </div>
  )
}

function SocialLinks({
  salon,
  wide = false
}: {
  salon: SalonDetails
  wide?: boolean
}) {
  const links = [
  {
    label: 'Booksy',
    url: salon.source_url,
    icon: '/icons/booksy.png'
  },
  {
    label: 'Instagram',
    url: salon.instagram,
    icon: '/icons/instagram.png'
  },
  {
    label: 'Facebook',
    url: salon.facebook,
    icon: '/icons/facebook.png'
  },
  {
    label: 'Website',
    url: salon.website,
    icon: '/icons/website.png'
  }
].filter((item) => item.url)

  if (links.length === 0) {
    return (
      <div className={`social-links ${wide ? 'wide' : ''}`}>
        <span>Social links</span>
        <p className="muted">No links provided</p>
      </div>
    )
  }

  return (
    <div className={`social-links ${wide ? 'wide' : ''}`}>
      <span>Social links</span>

      <div className="social-icons">
        {links.map((item) => (
            <a
                key={item.label}
                href={item.url ?? '#'}
                target="_blank"
                rel="noreferrer"
                title={item.label}
                aria-label={item.label}
            >
                <img src={item.icon} alt={item.label} />
            </a>
        ))}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  wide = false
}: {
  label: string
  value: string
  onChange: (value: string) => void
  wide?: boolean
}) {
  return (
    <label className={wide ? 'wide' : ''}>
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}