import type { SalonListItem } from '../types'
import { formatSalonPrice } from '../utils/salon'

type Props = {
  salon: SalonListItem
  selectedSalonId: string | null
  onOpen: (id: string) => void
}

export function SalonCard({
  salon,
  selectedSalonId,
  onOpen
}: Props) {
  return (
    <button
      className={`salon-card ${selectedSalonId === salon.id ? 'active' : ''}`}
      onClick={() => onOpen(salon.id)}
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
    </button>
  )
}