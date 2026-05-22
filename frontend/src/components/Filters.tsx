import type { SortBy } from '../types'

type Props = {
  search: string
  district: string
  service: string
  districts: string[]
  sortBy: SortBy
  loading: boolean
  onSearchChange: (value: string) => void
  onDistrictChange: (value: string) => void
  onServiceChange: (value: string) => void
  onSortChange: (value: SortBy) => void
  onApply: () => void
}

export function Filters({
  search,
  district,
  service,
  districts,
  sortBy,
  loading,
  onSearchChange,
  onDistrictChange,
  onServiceChange,
  onSortChange,
  onApply
}: Props) {
  return (
    <section className="filters">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by salon name"
      />

      <select value={district} onChange={(event) => onDistrictChange(event.target.value)}>
        <option value="">All districts</option>
        {districts.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <input
        value={service}
        onChange={(event) => onServiceChange(event.target.value)}
        placeholder="Filter by service, e.g. peeling"
      />

      <select value={sortBy} onChange={(event) => onSortChange(event.target.value as SortBy)}>
        <option value="rating_desc">Highest rating</option>
        <option value="reviews_desc">Most reviews</option>
        <option value="price_asc">Lowest average price</option>
        <option value="price_desc">Highest average price</option>
      </select>

      <button onClick={onApply} disabled={loading}>
        {loading ? 'Loading...' : 'Apply'}
      </button>
    </section>
  )
}