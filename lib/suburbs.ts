export interface Suburb {
  name: string
  state: string
  postcode: string
  lat: number
  lng: number
}

let cached: Suburb[] | null = null

export async function getSuburbs(): Promise<Suburb[]> {
  if (cached) return cached
  const res = await fetch('/suburbs.json')
  cached = await res.json()
  return cached!
}

export function searchSuburbs(suburbs: Suburb[], query: string, limit = 8): Suburb[] {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return suburbs
    .filter(s =>
      s.name.toLowerCase().startsWith(q) ||
      s.postcode.startsWith(q) ||
      `${s.name.toLowerCase()} ${s.state.toLowerCase()}`.includes(q)
    )
    .slice(0, limit)
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatSuburb(s: Suburb): string {
  return `${s.name}, ${s.state} ${s.postcode}`
}
