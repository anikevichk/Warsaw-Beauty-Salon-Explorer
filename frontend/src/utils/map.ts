export function cleanAddressForMap(address: string) {
  return address
    .replace(/\/[a-zA-Z0-9]+/g, '')
    .replace(/\blok\.?\s*[a-zA-Z0-9]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getMapUrl(address: string) {
  const cleanAddress = cleanAddressForMap(address)
  return `https://maps.google.com/maps?q=${encodeURIComponent(cleanAddress)}&z=15&output=embed`
}