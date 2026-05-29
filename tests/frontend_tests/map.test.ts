import { describe, expect, it } from 'vitest'

import { cleanAddressForMap, getMapUrl } from '../../frontend/src/utils/map'

describe('map utils', () => {
  it('removes slash parts from address', () => {
    expect(cleanAddressForMap('Marszałkowska 10/A, Warszawa')).toBe(
      'Marszałkowska 10, Warszawa'
    )
  })

  it('removes lok number from address', () => {
    expect(cleanAddressForMap('Prosta 10 lok. 5 Warszawa')).toBe(
      'Prosta 10 Warszawa'
    )
  })

  it('normalizes extra spaces', () => {
    expect(cleanAddressForMap('  Prosta   10    Warszawa  ')).toBe(
      'Prosta 10 Warszawa'
    )
  })

  it('cleans complex address', () => {
    expect(cleanAddressForMap('  Prosta 10 lok. 5 /A   Warszawa  ')).toBe(
      'Prosta 10 Warszawa'
    )
  })

  it('cleans address with access instructions', () => {
    expect(
      cleanAddressForMap(
        'Flory 7, 1 klucz 6569 i pierwsze drzwi na prawo, 00-586, Warszawa, Śródmieście'
      )
    ).toBe('Flory 7, 00-586 Warszawa')
  })

  it('returns encoded Google Maps embed url', () => {
    expect(getMapUrl('Prosta 10 lok. 5 Warszawa')).toBe(
      'https://maps.google.com/maps?q=Prosta%2010%20Warszawa&z=15&output=embed'
    )
  })
})