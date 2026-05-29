export function cleanAddressForMap(address: string) {
  const normalizedAddress = address.replace(/\s+/g, ' ').trim()

  if (!normalizedAddress) return ''

  const parts = normalizedAddress
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  const rawStreet = parts[0] ?? ''

  const street = rawStreet
    .replace(/\/[^\s,]+/g, '')
    .replace(/\blok\.?\s*[^\s,]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const postalCode = normalizedAddress.match(/\b\d{2}-\d{3}\b/)?.[0]
  const hasWarszawa = /\bWarszawa\b/i.test(normalizedAddress)

  if (postalCode && hasWarszawa) {
    return `${street}, ${postalCode} Warszawa`
  }

  if (hasWarszawa && !/\bWarszawa\b/i.test(street)) {
    return `${street}, Warszawa`
  }

  return street
}

export function getMapUrl(address: string) {
  const cleanAddress = cleanAddressForMap(address)
  return `https://maps.google.com/maps?q=${encodeURIComponent(cleanAddress)}&z=15&output=embed`
}