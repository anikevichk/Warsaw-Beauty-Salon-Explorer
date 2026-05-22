import type { Dispatch, SetStateAction } from 'react'
import type { SalonDetails as SalonDetailsType } from '../types'
import type { FormState } from '../utils/form'
import { getMapUrl } from '../utils/map'
import { getServicesArray } from '../utils/salon'
import { Field } from './Field'
import { Info } from './Info'
import { SocialLinks } from './SocialLinks'

type Props = {
  selectedSalon: SalonDetailsType | null
  detailsLoading: boolean
  isEditing: boolean
  saving: boolean
  form: FormState
  setForm: Dispatch<SetStateAction<FormState>>
  onToggleEdit: () => void
  onSave: () => void
}

export function SalonDetails({
  selectedSalon,
  detailsLoading,
  isEditing,
  saving,
  form,
  setForm,
  onToggleEdit,
  onSave
}: Props) {
  if (!selectedSalon && !detailsLoading) {
    return (
      <aside className="details">
        <div className="placeholder">
          <h2>Select a salon</h2>
          <p>Click any salon to see full details.</p>
        </div>
      </aside>
    )
  }

  if (detailsLoading) {
    return (
      <aside className="details">
        <p className="muted">Loading details...</p>
      </aside>
    )
  }

  if (!selectedSalon) return null

  const services = getServicesArray(selectedSalon)

  return (
    <aside className="details">
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

          <button className="secondary" onClick={onToggleEdit}>
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {!isEditing ? (
        <div className="info-grid">
          <div className="info-block wide">
            <span>Services</span>
            <div className="chips">
              {services.length ? (
                services.map((item, index) => <b key={`${item}-${index}`}>{item}</b>)
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
              selectedSalon.average_price !== null &&
              selectedSalon.average_price !== undefined
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
            onSave()
          }}
        >
          <Field label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
          <Field label="Address" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} />
          <Field label="District" value={form.district} onChange={(value) => setForm((current) => ({ ...current, district: value }))} />
          <Field label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
          <Field label="Website" value={form.website} onChange={(value) => setForm((current) => ({ ...current, website: value }))} />
          <Field label="Instagram" value={form.instagram} onChange={(value) => setForm((current) => ({ ...current, instagram: value }))} />
          <Field label="Facebook" value={form.facebook} onChange={(value) => setForm((current) => ({ ...current, facebook: value }))} />
          <Field label="Services, comma separated" value={form.services} onChange={(value) => setForm((current) => ({ ...current, services: value }))} wide />
          <Field label="Price range" value={form.price_range} onChange={(value) => setForm((current) => ({ ...current, price_range: value }))} />
          <Field label="Min price" value={form.price_min} onChange={(value) => setForm((current) => ({ ...current, price_min: value }))} />
          <Field label="Max price" value={form.price_max} onChange={(value) => setForm((current) => ({ ...current, price_max: value }))} />
          <Field label="Currency" value={form.currency} onChange={(value) => setForm((current) => ({ ...current, currency: value }))} />
          <Field label="Average price" value={form.average_price} onChange={(value) => setForm((current) => ({ ...current, average_price: value }))} />
          <Field label="Rating" value={form.rating} onChange={(value) => setForm((current) => ({ ...current, rating: value }))} />
          <Field label="Reviews count" value={form.reviews_count} onChange={(value) => setForm((current) => ({ ...current, reviews_count: value }))} />

          <button className="save" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      )}
    </aside>
  )
}