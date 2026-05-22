import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../../frontend/src/App'
import type { SalonDetails, SalonListItem } from '../../frontend/src/types'
import { getSalonById, getSalons, updateSalon } from '../../frontend/src/api/salons'

vi.mock('../../frontend/src/api/salons', () => ({
  getSalons: vi.fn(),
  getSalonById: vi.fn(),
  updateSalon: vi.fn()
}))

const salons: SalonListItem[] = [
  {
    id: '1',
    name: 'Glow Beauty',
    district: 'Wola',
    rating: 4.8,
    reviews_count: 120,
    price_range: '50-200 PLN',
    price_min: 50,
    price_max: 200,
    average_price: 120,
    currency: 'PLN',
    services: ['Haircut', 'Manicure']
  },
  {
    id: '2',
    name: 'Soft Skin Studio',
    district: 'Mokotów',
    rating: 4.5,
    reviews_count: 80,
    price_range: null,
    price_min: null,
    price_max: null,
    average_price: null,
    currency: 'PLN',
    services: ['Peeling']
  }
]

const salonDetails: SalonDetails = {
  ...salons[0],
  address: 'Prosta 10, Warszawa',
  phone: '123 456 789',
  instagram: 'https://instagram.com/glow',
  facebook: null,
  website: 'https://glow.example.com',
  source_url: 'https://booksy.com/glow'
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(getSalons).mockResolvedValue(salons)
    vi.mocked(getSalonById).mockResolvedValue(salonDetails)
    vi.mocked(updateSalon).mockResolvedValue(salonDetails)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

it('loads and displays salons', async () => {
  render(<App />)

  expect(await screen.findByText('Glow Beauty')).toBeInTheDocument()
  expect(screen.getByText('Soft Skin Studio')).toBeInTheDocument()
  expect(screen.getByText('matching salons')).toBeInTheDocument()

  await waitFor(() => {
    expect(getSalons).toHaveBeenCalled()
  })
})

it('opens salon details after clicking a salon', async () => {
  render(<App />)

  fireEvent.click(await screen.findByText('Glow Beauty'))

  expect(await screen.findByText('Salon details')).toBeInTheDocument()
  expect(getSalonById).toHaveBeenCalledWith('1')
})

it('shows error message when salons cannot be loaded', async () => {
  vi.mocked(getSalons).mockRejectedValueOnce(new Error('API failed'))

  render(<App />)

  expect(await screen.findByText('API failed')).toBeInTheDocument()
})
})