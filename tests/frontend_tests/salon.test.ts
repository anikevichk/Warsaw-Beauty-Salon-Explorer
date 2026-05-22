import { describe, expect, it } from 'vitest'

import type { SalonListItem } from '../../frontend/src/types'
import {
  formatSalonPrice,
  getErrorMessage,
  getMatchingServices,
  getServicesArray,
  getUniqueDistricts
} from '../../frontend/src/utils/salon'

const baseSalon: SalonListItem = {
  id: '1',
  name: 'Glow Beauty',
  district: 'Wola',
  rating: 4.8,
  reviews_count: 120,
  price_range: null,
  price_min: 50,
  price_max: 200,
  average_price: 120,
  currency: 'PLN',
  services: ['Haircut', 'Koloryzacja włosów', 'Manicure']
}

describe('salon utils', () => {
  it('returns services from array', () => {
    expect(getServicesArray(baseSalon)).toEqual([
      'Haircut',
      'Koloryzacja włosów',
      'Manicure'
    ])
  })

  it('returns services from string', () => {
    expect(
      getServicesArray({
        ...baseSalon,
        services: 'Haircut, Manicure; Pedicure'
      })
    ).toEqual(['Haircut', 'Manicure', 'Pedicure'])
  })

  it('finds matching services', () => {
    expect(getMatchingServices(baseSalon, 'koloryz')).toEqual([
      'Koloryzacja włosów'
    ])
  })

  it('formats average price first', () => {
    expect(formatSalonPrice(baseSalon)).toBe('avg. 120 PLN')
  })

  it('falls back to price range', () => {
    expect(
      formatSalonPrice({
        ...baseSalon,
        average_price: null,
        price_range: '50-200 PLN'
      })
    ).toBe('50-200 PLN')
  })

  it('returns unique sorted districts', () => {
    expect(
      getUniqueDistricts([
        baseSalon,
        { ...baseSalon, id: '2', district: 'Mokotów' },
        { ...baseSalon, id: '3', district: 'Wola' },
        { ...baseSalon, id: '4', district: null }
      ])
    ).toEqual(['Mokotów', 'Wola'])
  })

  it('returns error message or fallback', () => {
    expect(getErrorMessage(new Error('Boom'), 'Fallback')).toBe('Boom')
    expect(getErrorMessage('wrong', 'Fallback')).toBe('Fallback')
  })
})