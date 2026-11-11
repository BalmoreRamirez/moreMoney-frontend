export function encodeUrlSegment(value) {
  return btoa(String(value))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
}

export function decodeUrlSegment(value) {
  try {
    const base64 = String(value).replaceAll('-', '+').replaceAll('_', '/')
    return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  } catch {
    return null
  }
}
