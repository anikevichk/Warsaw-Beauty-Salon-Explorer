import { describe, expect, it } from 'vitest'

import { fuzzyMatch, levenshtein, normalizeText } from '../../frontend/src/utils/search'

describe('search utils', () => {
  it('normalizes text by removing accents, punctuation and extra spaces', () => {
    expect(normalizeText(' Śródmieście Beauty!!! ')).toBe('srodmiescie beauty')
  })

  it('calculates levenshtein distance', () => {
    expect(levenshtein('kitten', 'sitten')).toBe(1)
    expect(levenshtein('salon', 'salon')).toBe(0)
  })

  it('matches direct search query', () => {
    expect(fuzzyMatch('Glow Beauty Salon', 'beauty')).toBe(true)
  })

  it('matches small typo in longer words', () => {
    expect(fuzzyMatch('makeup', 'makep')).toBe(true)
  })

  it('returns true for empty query', () => {
    expect(fuzzyMatch('Any salon', '')).toBe(true)
  })
})