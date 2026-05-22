import type { SalonListItem } from '../types'
import { formatSalonPrice, getMatchingServices } from '../utils/salon'

type Props = {
  salon: SalonListItem
  selectedSalonId: string | null
  service: string
  onOpen: (id: string) => void
}

export function SalonCard({
  salon,
  selectedSalonId,
  service,
  onOpen
}: Props) {
  const matchingServices = getMatchingServices(salon, service)

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

      {service.trim() && matchingServices.length > 0 && (
        <div className="matched-services">
          <p>Matching services</p>

          {matchingServices.slice(0, 4).map((item, index) => (
            <div className="matched-service" key={`${item}-${index}`}>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  )
}