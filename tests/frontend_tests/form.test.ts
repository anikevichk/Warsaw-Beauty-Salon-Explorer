import { describe, expect, it } from 'vitest'

import type { SalonDetails } from '../../frontend/src/types'
import { emptyForm, toForm, toUpdatePayload } from '../../frontend/src/utils/form'

const salon: SalonDetails = {
  id: '1',
  name: 'Glow Beauty',
  district: 'Wola',
  address: 'Prosta 10, Warszawa',
  phone: '123 456 789',
  instagram: 'https://instagram.com/glow',
  facebook: null,
  website: 'https://glow.example.com',
  source_url: 'https://booksy.com/glow',
  rating: 4.8,
  reviews_count: 120,
  price_range: '50-200 PLN',
  price_min: 50,
  price_max: 200,
  average_price: 120,
  currency: 'PLN',
  services: ['Haircut', 'Manicure']
}

describe('form utils', () => {
  it('converts salon details to form state', () => {
    expect(toForm(salon)).toEqual({
      name: 'Glow Beauty',
      address: 'Prosta 10, Warszawa',
      district: 'Wola',
      phone: '123 456 789',
      instagram: 'https://instagram.com/glow',
      facebook: '',
      website: 'https://glow.example.com',
      services: 'Haircut, Manicure',
      price_range: '50-200 PLN',
      price_min: '50',
      price_max: '200',
      currency: 'PLN',
      average_price: '120',
      rating: '4.8',
      reviews_count: '120'
    })
  })

  it('converts form state to update payload', () => {
    const payload = toUpdatePayload({
      ...emptyForm,
      name: ' Glow Beauty ',
      district: ' Wola ',
      services: 'Haircut, Manicure, ',
      price_min: '50',
      price_max: '200',
      average_price: '120.5',
      rating: 'bad',
      reviews_count: '120.6'
    })

    expect(payload).toMatchObject({
      name: 'Glow Beauty',
      district: 'Wola',
      services: ['Haircut', 'Manicure'],
      price_min: 50,
      price_max: 200,
      average_price: 120.5,
      rating: null,
      reviews_count: 121
    })
  })
})