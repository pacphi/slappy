import { MAX_CSV_BYTES } from '../shared/limits'

function exportURL(input: string): URL {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    throw new Error('Invalid Google Sheets URL')
  }
  const match = url.pathname.match(/^\/spreadsheets\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/)
  if (!isPublicHTTPS(url) || url.hostname !== 'docs.google.com' || !match) {
    throw new Error('Invalid Google Sheets URL')
  }
  const hash = new URLSearchParams(url.hash.slice(1))
  const gid = hash.get('gid') ?? url.searchParams.get('gid') ?? '0'
  if (!/^\d+$/.test(gid)) throw new Error('Invalid Google Sheets tab ID')
  return new URL(`https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`)
}

function isPublicHTTPS(url: URL): boolean {
  return url.protocol === 'https:' && !url.username && !url.password && !url.port
}

function allowedRedirect(url: URL): boolean {
  return (
    isPublicHTTPS(url) &&
    (url.hostname === 'docs.google.com' || url.hostname.endsWith('.googleusercontent.com'))
  )
}

async function fetchExport(url: URL, signal: AbortSignal, redirects = 0): Promise<Response> {
  const response = await fetch(url, { redirect: 'manual', signal })
  if (response.status >= 300 && response.status < 400) {
    await response.body?.cancel()
    const location = response.headers.get('location')
    if (!location || redirects >= 3) throw new Error('Google Sheets export redirect failed')
    const next = new URL(location, url)
    if (!allowedRedirect(next))
      throw new Error('Google Sheets export redirected to an unsupported host')
    return fetchExport(next, signal, redirects + 1)
  }
  if (!response.ok) {
    await response.body?.cancel()
    throw new Error(`Failed to fetch Google Sheet: HTTP ${response.status}`)
  }
  return response
}

async function readCSV(response: Response): Promise<string> {
  if (Number(response.headers.get('content-length')) > MAX_CSV_BYTES) {
    await response.body?.cancel()
    throw new RangeError('Google Sheet exceeds maximum CSV size')
  }
  if (!response.body) throw new Error('Google Sheet export was empty')
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_CSV_BYTES) throw new RangeError('Google Sheet exceeds maximum CSV size')
      chunks.push(value)
    }
    return Buffer.concat(chunks).toString('utf8')
  } finally {
    await reader.cancel()
    reader.releaseLock()
  }
}

/** Fetch a public Google Sheet with a fixed export endpoint and bounded resources. */
export async function fetchGoogleSheetAsCSV(sheetsUrl: string): Promise<string> {
  const url = exportURL(sheetsUrl)
  const signal = AbortSignal.timeout(15_000)
  return readCSV(await fetchExport(url, signal))
}
