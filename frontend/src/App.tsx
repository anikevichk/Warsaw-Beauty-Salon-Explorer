import { useEffect, useMemo, useState } from 'react'
import { getSalonById, getSalons, updateSalon } from './api/salons'
import { Filters } from './components/Filters'
import { SalonCard } from './components/SalonCard'
import { SalonDetails } from './components/SalonDetails'
import type { SalonDetails as SalonDetailsType, SalonListItem, SortBy } from './types'
import { emptyForm, toForm, toUpdatePayload } from './utils/form'
import { fuzzyMatch } from './utils/search'
import { getErrorMessage, getMatchingServices, getUniqueDistricts } from './utils/salon'

export default function App() {
  const [salons, setSalons] = useState<SalonListItem[]>([])
  const [selectedSalon, setSelectedSalon] = useState<SalonDetailsType | null>(null)

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
  const [form, setForm] = useState(emptyForm)

  async function loadSalons() {
    try {
      setLoading(true)
      setError(null)

      const data = await getSalons({
        search,
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

      setDistricts(getUniqueDistricts(data))
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

    try {
      setSaving(true)
      setError(null)

      const updated = await updateSalon(selectedSalon.id, toUpdatePayload(form))

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
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadSalons()
    }, 400)

    return () => clearTimeout(timeout)
  }, [search, district])

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

      <Filters
        search={search}
        district={district}
        service={service}
        districts={districts}
        sortBy={sortBy}
        loading={loading}
        onSearchChange={setSearch}
        onDistrictChange={setDistrict}
        onServiceChange={setService}
        onSortChange={setSortBy}
        onApply={loadSalons}
      />

      {error && <div className="error">{error}</div>}

      <section className="layout">
        <div className="salon-list">
          {loading && <p className="muted">Loading salons...</p>}

          {!loading && sortedSalons.length === 0 && (
            <p className="muted">No salons found.</p>
          )}

          {sortedSalons.map((salon) => (
            <SalonCard
              key={salon.id}
              salon={salon}
              selectedSalonId={selectedSalon?.id ?? null}
              service={service}
              onOpen={openSalon}
            />
          ))}
        </div>

        <SalonDetails
          selectedSalon={selectedSalon}
          detailsLoading={detailsLoading}
          isEditing={isEditing}
          saving={saving}
          form={form}
          setForm={setForm}
          onToggleEdit={() => setIsEditing((current) => !current)}
          onSave={saveSalon}
        />
      </section>
    </main>
  )
}